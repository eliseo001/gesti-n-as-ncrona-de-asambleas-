'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge, Input, ProgressBar } from './ui';

const TEMA_POR_DEFECTO = {
    id: 1,
    numero: 'Tema 1',
    titulo: 'Aprobación de presupuesto para pintura e impermeabilización',
    normativa: 'Mayoría Absoluta (>50% - Art. 2060 CCyCN)',
    umbralRequerido: 50.01,
    tendencia: {
        coeficienteParticipacion: 68.5,
        unidadesSufragaron: 14,
        unidadesTotales: 20,
        aFavor: 68.5,
        unidadesAFavor: 14,
        enContra: 21.5,
        unidadesEnContra: 2,
        abstencion: 10.0,
        unidadesAbstencion: 1,
    },
};

export default function PanelSufragio({
    faseActual = 'ABIERTA',
    temaActual = TEMA_POR_DEFECTO,
    votoTemaActual = null,
    intentosTemaActual = 2,
    temasCompletados = 0,
    totalTemas = 3,
    onEmitirVoto,
    onRectificarVoto,
    onIrSiguientePendiente,
}) {
    const router = useRouter();
    const { usuario } = useAuth();
    const esAdministrador = usuario?.rol === 'ADMINISTRADOR';

    const [votoLocal, setVotoLocal] = useState(null);
    const [intentosLocal, setIntentosLocal] = useState(2);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [passwordTemp, setPasswordTemp] = useState('');

    const votoEmitido = onEmitirVoto ? votoTemaActual : votoLocal;
    const intentosRestantes = onRectificarVoto ? intentosTemaActual : intentosLocal;

    const coeficienteUsuario = usuario?.coeficiente ? Number(usuario.coeficiente).toFixed(2) : '5.20';
    const unidadUsuario = usuario?.unidad || 'UF 4B + Cochera 12';
    const tendenciaBase = temaActual?.tendencia || TEMA_POR_DEFECTO.tendencia;

    // =========================================================================
    // HU-010: ESTADO REACTIVO DE ESCRUTINIO EN VIVO (SIMULACIÓN WEBSOCKETS)
    // =========================================================================
    const [escrutinioVivo, setEscrutinioVivo] = useState({
        aFavor: tendenciaBase.aFavor,
        enContra: tendenciaBase.enContra,
        abstencion: tendenciaBase.abstencion,
        coeficienteParticipacion: tendenciaBase.coeficienteParticipacion,
        unidadesSufragaron: tendenciaBase.unidadesSufragaron,
        unidadesTotales: tendenciaBase.unidadesTotales,
        ultimoPulso: 'Sincronizado',
    });

    // Sincronizar con el tema seleccionado en el Sidebar
    useEffect(() => {
        const base = temaActual?.tendencia || TEMA_POR_DEFECTO.tendencia;
        setEscrutinioVivo({
            aFavor: base.aFavor,
            enContra: base.enContra,
            abstencion: base.abstencion,
            coeficienteParticipacion: base.coeficienteParticipacion,
            unidadesSufragaron: base.unidadesSufragaron,
            unidadesTotales: base.unidadesTotales,
            ultimoPulso: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
        });
    }, [temaActual?.id]);

    // Simulación para defensa de tesis: Actualización en vivo cada 3 segundos (HU-010)
    useEffect(() => {
        if (faseActual !== 'ABIERTA') return;

        const intervalo = setInterval(() => {
            setEscrutinioVivo((prev) => {
                // Variación aleatoria suave entre -2.1% y +2.1% para demostrar reactividad en vivo
                const delta = Number(((Math.random() - 0.48) * 3.6).toFixed(1));
                const nuevoAFavor = Math.min(85, Math.max(12, Number((prev.aFavor + delta).toFixed(1))));
                const restoDisponible = Number((100 - nuevoAFavor).toFixed(1));
                const nuevaAbstencion = Math.min(
                    20,
                    Math.max(5, Number((prev.abstencion + (Math.random() - 0.5) * 1.2).toFixed(1)))
                );
                const nuevoEnContra = Math.max(
                    5,
                    Number((restoDisponible - nuevaAbstencion).toFixed(1))
                );

                return {
                    ...prev,
                    aFavor: nuevoAFavor,
                    enContra: nuevoEnContra,
                    abstencion: Number((100 - nuevoAFavor - nuevoEnContra).toFixed(1)),
                    ultimoPulso: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }),
                };
            });
        }, 3000);

        return () => clearInterval(intervalo);
    }, [faseActual, temaActual?.id]);

    const porcentajeProgresoGlobal =
        totalTemas > 0 ? Math.round((temasCompletados / totalTemas) * 100) : 0;

    const emitirSufragio = (valorVoto) => {
        if (esAdministrador || faseActual !== 'ABIERTA') return;
        if (onEmitirVoto) {
            onEmitirVoto(temaActual.id, valorVoto);
        } else {
            setVotoLocal(valorVoto);
        }

        // Impacto inmediato del voto propio sobre la barra en tiempo real
        const peso = Number(coeficienteUsuario) || 5.2;
        setEscrutinioVivo((prev) => {
            let { aFavor, enContra, abstencion } = prev;
            if (valorVoto === 'A_FAVOR') {
                aFavor = Math.min(90, Number((aFavor + peso).toFixed(1)));
                enContra = Math.max(5, Number((100 - aFavor - abstencion).toFixed(1)));
            } else if (valorVoto === 'EN_CONTRA') {
                enContra = Math.min(90, Number((enContra + peso).toFixed(1)));
                aFavor = Math.max(5, Number((100 - enContra - abstencion).toFixed(1)));
            } else {
                abstencion = Math.min(40, Number((abstencion + peso).toFixed(1)));
                aFavor = Math.max(5, Number((100 - enContra - abstencion).toFixed(1)));
            }
            return {
                ...prev,
                aFavor,
                enContra,
                abstencion: Number((100 - aFavor - enContra).toFixed(1)),
            };
        });

        setMostrarModal(false);
        setPasswordTemp('');
    };

    const solicitarRectificacion = () => {
        if (faseActual !== 'ABIERTA') return;
        if (intentosRestantes <= 0) {
            alert('Ha agotado el límite reglamentario de rectificaciones para este punto del Orden del Día.');
            return;
        }
        setMostrarModal(true);
    };

    const confirmarPasswordParaRectificar = (e) => {
        e.preventDefault();
        if (passwordTemp === 'tesis2026' || passwordTemp === 'password123') {
            if (onRectificarVoto) {
                onRectificarVoto(temaActual.id);
            } else {
                setVotoLocal(null);
                setIntentosLocal((prev) => prev - 1);
            }
            setMostrarModal(false);
            setPasswordTemp('');
        } else {
            alert('Contraseña incorrecta. Ingrese "password123" o "tesis2026" para confirmar su identidad.');
        }
    };

    // =========================================================================
    // VISTA 1: ROL ADMINISTRADOR -> MONITOR DE URNA CON TENDENCIAS EN VIVO
    // =========================================================================
    if (esAdministrador) {
        return (
            <Card className="p-6 flex flex-col justify-between min-h-[620px]">
                <div className="space-y-4">
                    <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-200 pb-3">
                        <div>
                            <Badge variant="warning" size="sm" shape="rounded">
                                Fiscalización Sin Derecho a Voto • {temaActual?.numero || 'Tema 1'}
                            </Badge>
                            <h2 className="text-lg font-bold text-slate-800 mt-1.5">
                                Monitor de Urna y Tendencias en Vivo
                            </h2>
                            <p className="text-xs text-slate-500">
                                Exigencia legal del punto: <strong>{temaActual?.normativa}</strong>
                            </p>
                        </div>

                        <Badge variant={faseActual === 'ABIERTA' ? 'live' : 'neutral'}>
                            {faseActual === 'ABIERTA'
                                ? '🟢 EN VIVO (WebSockets)'
                                : faseActual === 'CUARTO_INTERMEDIO'
                                ? '⏸️ Urna en Pausa'
                                : '🔒 Urna Cerrada'}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Card variant="subtle" className="p-3">
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">
                                Participación Coeficiente
                            </span>
                            <span className="text-xl font-extrabold text-blue-700">
                                {escrutinioVivo.coeficienteParticipacion.toFixed(2)}%
                            </span>
                            <ProgressBar
                                porcentaje={escrutinioVivo.coeficienteParticipacion}
                                color="blue"
                                size="sm"
                                className="mt-1.5"
                            />
                            <span className="text-[10px] text-slate-500 mt-1 block">
                                Umbral requerido: &gt; {temaActual?.umbralRequerido || 50.01}%
                            </span>
                        </Card>

                        <Card variant="subtle" className="p-3">
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">
                                Unidades que Sufragaron
                            </span>
                            <span className="text-xl font-extrabold text-emerald-700">
                                {escrutinioVivo.unidadesSufragaron} / {escrutinioVivo.unidadesTotales} UF
                            </span>
                            <ProgressBar
                                porcentaje={
                                    (escrutinioVivo.unidadesSufragaron / escrutinioVivo.unidadesTotales) * 100
                                }
                                color="emerald"
                                size="sm"
                                className="mt-1.5"
                            />
                            <span className="text-[10px] text-slate-500 mt-1 block">
                                Pendientes / Ausentes: {escrutinioVivo.unidadesTotales - escrutinioVivo.unidadesSufragaron} UF
                            </span>
                        </Card>
                    </div>

                    {/* HU-010: Barras de Resultado Parcial en Tiempo Real */}
                    <Card variant="subtle" className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold uppercase text-slate-700">
                                📊 Escrutinio en Tiempo Real ({temaActual?.numero})
                            </h3>
                            <span className="text-[10px] font-mono text-slate-500">
                                Pulso WS: {escrutinioVivo.ultimoPulso}
                            </span>
                        </div>

                        <ProgressBar
                            label="👍 A Favor"
                            porcentaje={escrutinioVivo.aFavor}
                            color="emerald"
                        />
                        <ProgressBar
                            label="👎 En Contra"
                            porcentaje={escrutinioVivo.enContra}
                            color="red"
                        />
                        <ProgressBar
                            label="✋ Abstención"
                            porcentaje={escrutinioVivo.abstencion}
                            color="slate"
                        />
                    </Card>

                    <div className="space-y-1.5">
                        <h3 className="text-[11px] font-bold uppercase text-slate-700">
                            Últimos Bloques Sellados en Urna (SHA-256)
                        </h3>
                        <Card variant="dark" className="p-3 font-mono text-[11px] space-y-1.5">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                                <span className="text-blue-400 font-bold">
                                    Bloque #{escrutinioVivo.unidadesSufragaron} (UF 4B + C12)
                                </span>
                                <span className="text-slate-400">Coef: 5.20%</span>
                                <span className="text-emerald-400">9f86d081884c...</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-blue-400 font-bold">
                                    Bloque #{escrutinioVivo.unidadesSufragaron - 1} (UF 2B)
                                </span>
                                <span className="text-slate-400">Coef: 6.25%</span>
                                <span className="text-emerald-400">8c4e2b1a9f07...</span>
                            </div>
                        </Card>
                    </div>
                </div>

                <Card variant="subtle" className="p-3.5 flex items-center justify-between mt-4">
                    <div className="text-xs text-slate-600">
                        <span className="font-bold text-slate-800 block">Control de Sesión</span>
                        Gestione el Cuarto Intermedio o cierre el escrutinio desde el Panel Admin.
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => router.push('/admin')}>
                        ⚙️ Panel Admin
                    </Button>
                </Card>
            </Card>
        );
    }

    // =========================================================================
    // VISTA 2: ROL PROPIETARIO -> URNA CRIPTOGRÁFICA + ESCRUTINIO LIVE (HU-010)
    // =========================================================================
    return (
        <Card className="p-6 flex flex-col justify-between min-h-[620px] relative">
            {/* Modal de Seguridad para Rectificación de Voto */}
            {mostrarModal && (
                <div className="absolute inset-0 z-10 bg-slate-900/60 rounded-xl flex items-center justify-center p-6 backdrop-blur-sm">
                    <Card className="p-6 shadow-2xl w-full">
                        <h3 className="font-bold text-lg text-slate-800 mb-2">
                            Rectificación de Voto ({temaActual?.numero})
                        </h3>
                        <p className="text-xs text-slate-600 mb-4">
                            Para emitir un bloque rectificativo en la cadena SHA-256 de este punto, confirme su contraseña de propietario (use <strong>password123</strong> o <strong>tesis2026</strong>).
                        </p>
                        <form onSubmit={confirmarPasswordParaRectificar}>
                            <Input
                                type="password"
                                required
                                value={passwordTemp}
                                onChange={(e) => setPasswordTemp(e.target.value)}
                                placeholder="••••••••"
                                className="mb-4"
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="light"
                                    onClick={() => setMostrarModal(false)}
                                    className="w-1/2"
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="primary" className="w-1/2">
                                    Verificar y Habilitar
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Indicador de Progreso Global del Orden del Día */}
            <Card variant="dark" className="p-3 mb-3">
                <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-bold text-slate-100">
                        📋 Has completado {temasCompletados} de {totalTemas} temas del Orden del Día
                    </span>
                    <Badge
                        variant={temasCompletados === totalTemas ? 'darkSuccess' : 'darkWarning'}
                        size="sm"
                        shape="rounded"
                    >
                        {porcentajeProgresoGlobal}% Completado
                    </Badge>
                </div>
                <ProgressBar
                    porcentaje={porcentajeProgresoGlobal}
                    color={temasCompletados === totalTemas ? 'emerald' : 'blue'}
                    size="sm"
                />
            </Card>

            {/* Cabecera de Urna con Badge HU-010: 🟢 EN VIVO (WebSockets) */}
            <div className="border-b border-slate-200 pb-3 mb-3 flex flex-wrap justify-between items-start gap-2">
                <div>
                    <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm" shape="rounded">
                            {temaActual?.numero || 'Tema 1'}
                        </Badge>
                        <h2 className="text-base md:text-lg font-bold text-slate-800">
                            Urna Criptográfica SHA-256
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Titular: <strong>{usuario?.nombre}</strong> • Peso: <strong>{coeficienteUsuario}%</strong> ({unidadUsuario})
                    </p>
                </div>

                <Badge variant={faseActual === 'ABIERTA' ? 'live' : 'neutral'} size="sm">
                    {faseActual === 'ABIERTA'
                        ? '🟢 EN VIVO (WebSockets)'
                        : faseActual === 'CUARTO_INTERMEDIO'
                        ? '⏸️ Urna en Pausa'
                        : '🔒 Urna Cerrada'}
                </Badge>
            </div>

            {/* Cuerpo de Votación según Fase */}
            {faseActual === 'CUARTO_INTERMEDIO' ? (
                <Card
                    variant="warning"
                    className="flex-grow flex flex-col items-center justify-center text-center p-6 border-2 border-dashed"
                >
                    <div className="text-5xl mb-4">⏸️</div>
                    <h3 className="font-bold text-amber-950 text-lg">Asamblea en Cuarto Intermedio</h3>
                    <p className="text-xs text-amber-800 mt-2 max-w-sm leading-relaxed">
                        Tanto el debate como la recepción de votos han sido pausados temporalmente por la Administración.
                    </p>
                </Card>
            ) : faseActual === 'CERRADA' ? (
                <Card
                    variant="subtle"
                    className="flex-grow flex flex-col items-center justify-center text-center p-6 border-2 space-y-4"
                >
                    <div className="text-5xl">🔒</div>
                    <h3 className="font-bold text-slate-800 text-lg">Urna Cerrada Definitivamente</h3>
                    <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                        La ventana temporal de sufragio ha concluido y la cadena de bloques SHA-256 ha sido sellada en el Acta Digital.
                    </p>
                    <Button variant="secondary" onClick={() => router.push('/asamblea/acta')}>
                        📄 Ver Acta Digital Consolidada
                    </Button>
                </Card>
            ) : (
                <div className="flex-grow flex flex-col justify-between space-y-3">
                    {!votoEmitido ? (
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-center text-slate-600 uppercase tracking-wider">
                                Emitir Sufragio para {temaActual?.numero} ({temaActual?.normativa})
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <Button
                                    variant="success"
                                    size="md"
                                    fullWidth
                                    onClick={() => emitirSufragio('A_FAVOR')}
                                >
                                    👍 A Favor ({coeficienteUsuario}%)
                                </Button>
                                <Button
                                    variant="danger"
                                    size="md"
                                    fullWidth
                                    onClick={() => emitirSufragio('EN_CONTRA')}
                                >
                                    👎 En Contra ({coeficienteUsuario}%)
                                </Button>
                                <Button
                                    variant="neutral"
                                    size="md"
                                    fullWidth
                                    onClick={() => emitirSufragio('ABSTENCION')}
                                >
                                    ✋ Abstención ({coeficienteUsuario}%)
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Card variant="success" className="p-3 text-center border-2">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-lg">✅</span>
                                    <h3 className="font-bold text-emerald-900 text-sm">
                                        Voto Sellado en {temaActual?.numero}: {votoEmitido.replace('_', ' ')} ({coeficienteUsuario}%)
                                    </h3>
                                </div>
                                <p className="text-[10px] text-emerald-700 mt-0.5 font-mono">
                                    Hash SHA-256: 9f86d081884c7d659a2feaa0c55ad015...
                                </p>
                            </Card>

                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    fullWidth
                                    disabled={intentosRestantes === 0}
                                    onClick={solicitarRectificacion}
                                >
                                    🔄 Rectificar Voto ({intentosRestantes} intentos)
                                </Button>

                                {temasCompletados < totalTemas && onIrSiguientePendiente && (
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        onClick={onIrSiguientePendiente}
                                        className="whitespace-nowrap"
                                    >
                                        Siguiente Tema →
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* HU-010: RESULTADOS PARCIALES EN TIEMPO REAL DEBAJO DE LOS BOTONES DE VOTACIÓN */}
                    <Card variant="subtle" className="p-3.5 space-y-2.5 mt-auto">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                            <span className="text-[11px] font-extrabold uppercase text-slate-700">
                                📡 Escrutinio Parcial en Tiempo Real (HU-010)
                            </span>
                            <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                                ● Sync: {escrutinioVivo.ultimoPulso}
                            </span>
                        </div>

                        <ProgressBar
                            label="👍 A Favor"
                            porcentaje={escrutinioVivo.aFavor}
                            color="emerald"
                        />
                        <ProgressBar
                            label="👎 En Contra"
                            porcentaje={escrutinioVivo.enContra}
                            color="red"
                        />
                        <ProgressBar
                            label="✋ Abstención"
                            porcentaje={escrutinioVivo.abstencion}
                            color="slate"
                        />
                    </Card>
                </div>
            )}
        </Card>
    );
}
