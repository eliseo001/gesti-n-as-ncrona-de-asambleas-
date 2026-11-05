'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge, Input, ProgressBar, Modal } from './ui';

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
    const {
        usuario,
        obtenerPadronConPonderacion,
        superficieTotalDelEdificio,
        obtenerResumenRepresentacion,
    } = useAuth();
    const esAdministrador = usuario?.rol === 'ADMINISTRADOR';

    // Consultamos las utilidades centralizadas de Cartas Poder en AuthContext
    const resumenRepresentacion = obtenerResumenRepresentacion(usuario?.email);
    const {
        tieneVotoDelegado,
        poderCedidoAprobado,
        esApoderado,
        nombresPoderdantes,
        coeficienteDelegadoTotalExacto,
        superficieDelegadaTotalM2,
    } = resumenRepresentacion;

    // 1. Ejecutamos el Motor de Ponderación Automática (m2 -> %)
    const padronPonderado = useMemo(
        () => obtenerPadronConPonderacion(),
        [obtenerPadronConPonderacion]
    );

    const [votoLocal, setVotoLocal] = useState(null);
    const [intentosLocal, setIntentosLocal] = useState(2);

    // Modal de Seguridad para Rectificar Voto
    const [mostrarModal, setMostrarModal] = useState(false);
    const [passwordTemp, setPasswordTemp] = useState('');

    // Modal del Comprobante de Sufragio (Recibo Criptográfico PDF Simulado)
    const [mostrarModalRecibo, setMostrarModalRecibo] = useState(false);
    const [timestampVotoUtc, setTimestampVotoUtc] = useState(
        () => new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
    );

    const votoEmitido = onEmitirVoto ? votoTemaActual : votoLocal;
    const intentosRestantes = onRectificarVoto ? intentosTemaActual : intentosLocal;

    const listaUnidades =
        Array.isArray(usuario?.unidades) && usuario.unidades.length > 0
            ? usuario.unidades.map((u) => String(u).replace(/^UF\s*/i, '').trim().toUpperCase())
            : ['5A', 'C04'];

    // Filtramos las unidades del propietario desde el Motor de Ponderación
    const unidadesPonderadasTitular = useMemo(
        () =>
            padronPonderado.filter((u) =>
                listaUnidades.includes(String(u.depto).toUpperCase())
            ),
        [padronPonderado, listaUnidades]
    );

    // Cálculos internos con .reduce() manteniendo MÁXIMA PRECISIÓN DECIMAL (sin redondeo prematuro)
    const superficieTitularM2 = useMemo(
        () =>
            unidadesPonderadasTitular.reduce(
                (acc, u) => acc + Number(u.superficieM2 || 0),
                0
            ),
        [unidadesPonderadasTitular]
    );

    const pesoElectoralPropioExacto = useMemo(
        () =>
            unidadesPonderadasTitular.reduce(
                (acc, u) => acc + Number(u.coeficientePorcentual || 0),
                0
            ),
        [unidadesPonderadasTitular]
    );

    // Si es Apoderado de un poder APROBADO, sumamos dinámicamente el coeficiente del poderdante
    const pesoElectoralExacto =
        pesoElectoralPropioExacto + Number(coeficienteDelegadoTotalExacto || 0);
    const superficieTotalVotanteM2 =
        superficieTitularM2 + Number(superficieDelegadaTotalM2 || 0);

    // Solo usamos Number(...).toFixed(2) al momento de renderizar en la UI
    const coeficienteUsuarioUI = Number(pesoElectoralExacto).toFixed(2);
    const coeficientePropioUI = Number(pesoElectoralPropioExacto).toFixed(2);
    const coeficienteDelegadoUI = Number(coeficienteDelegadoTotalExacto || 0).toFixed(2);
    const unidadUsuario = listaUnidades.map((u) => `UF ${u}`).join(', ');

    const desgloseUnidadesUI =
        unidadesPonderadasTitular.length > 0
            ? unidadesPonderadasTitular
                  .map(
                      (u) =>
                          `${u.tipo === 'Departamento' ? 'Depto' : u.tipo} ${u.depto} (${u.superficieM2} m2 - ${Number(u.coeficientePorcentual).toFixed(2)}%)`
                  )
                  .join(' + ')
            : `${unidadUsuario} (${coeficienteUsuarioUI}%)`;

    // Verificar si alguna de las unidades del titular está marcada como MOROSO en el Padrón Maestro
    const tieneUnidadMorosa = unidadesPonderadasTitular.some(
        (u) => u.estadoContable === 'MOROSO'
    );

    const hashReciboSha256 =
        '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';

    const tendenciaBase = temaActual?.tendencia || TEMA_POR_DEFECTO.tendencia;

    // =========================================================================
    // HU-010: ESTADO REACTIVO DE ESCRUTINIO EN VIVO SOBRE BASE EXACTA DEL 100%
    // =========================================================================
    const [escrutinioVivo, setEscrutinioVivo] = useState({
        aFavor: Number(tendenciaBase.aFavor),
        enContra: Number(tendenciaBase.enContra),
        abstencion: 100 - Number(tendenciaBase.aFavor) - Number(tendenciaBase.enContra),
        coeficienteParticipacion: Number(tendenciaBase.coeficienteParticipacion),
        unidadesSufragaron: tendenciaBase.unidadesSufragaron,
        unidadesTotales: padronPonderado.length || tendenciaBase.unidadesTotales,
        ultimoPulso: 'Sincronizado',
    });

    useEffect(() => {
        const base = temaActual?.tendencia || TEMA_POR_DEFECTO.tendencia;
        const aFavorBase = Number(base.aFavor);
        const enContraBase = Number(base.enContra);
        setEscrutinioVivo({
            aFavor: aFavorBase,
            enContra: enContraBase,
            abstencion: Math.max(0, 100 - aFavorBase - enContraBase),
            coeficienteParticipacion: Number(base.coeficienteParticipacion),
            unidadesSufragaron: base.unidadesSufragaron,
            unidadesTotales: padronPonderado.length || base.unidadesTotales,
            ultimoPulso: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
        });
    }, [temaActual?.id, padronPonderado.length]);

    useEffect(() => {
        if (faseActual !== 'ABIERTA') return;

        const intervalo = setInterval(() => {
            setEscrutinioVivo((prev) => {
                // Cálculos en precisión decimal completa garantizando que aFavor + enContra + abstencion === 100
                const delta = (Math.random() - 0.48) * 1.8;
                const nuevoAFavor = Math.min(85, Math.max(12, prev.aFavor + delta));
                const restoDisponible = 100 - nuevoAFavor;
                const nuevaAbstencion = Math.min(
                    20,
                    Math.max(5, prev.abstencion + (Math.random() - 0.5) * 0.8)
                );
                const nuevoEnContra = Math.max(5, restoDisponible - nuevaAbstencion);
                const abstencionAjustada = 100 - nuevoAFavor - nuevoEnContra;

                return {
                    ...prev,
                    aFavor: nuevoAFavor,
                    enContra: nuevoEnContra,
                    abstencion: abstencionAjustada,
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
        if (
            esAdministrador ||
            faseActual !== 'ABIERTA' ||
            tieneUnidadMorosa ||
            tieneVotoDelegado
        )
            return;
        const nuevoTimestampUtc =
            new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        setTimestampVotoUtc(nuevoTimestampUtc);

        if (onEmitirVoto) {
            onEmitirVoto(temaActual.id, valorVoto);
        } else {
            setVotoLocal(valorVoto);
        }

        // Extraemos el peso electoral directamente del cálculo dinámico en coma flotante sin redondear
        const pesoExacto = pesoElectoralExacto;

        setEscrutinioVivo((prev) => {
            let { aFavor, enContra, abstencion } = prev;
            if (valorVoto === 'A_FAVOR') {
                aFavor = Math.min(90, aFavor + pesoExacto);
                enContra = Math.max(5, 100 - aFavor - abstencion);
            } else if (valorVoto === 'EN_CONTRA') {
                enContra = Math.min(90, enContra + pesoExacto);
                aFavor = Math.max(5, 100 - enContra - abstencion);
            } else {
                abstencion = Math.min(40, abstencion + pesoExacto);
                aFavor = Math.max(5, 100 - enContra - abstencion);
            }
            return {
                ...prev,
                aFavor,
                enContra,
                // Garantiza un total matemático exacto del 100%
                abstencion: 100 - aFavor - enContra,
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
    // VISTA 1: ROL ADMINISTRADOR -> MONITOR DE URNA CON MOTOR DE PONDERACIÓN
    // =========================================================================
    if (esAdministrador) {
        const primerosBloques = padronPonderado.slice(0, 2);

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
                                Base Catastral: <strong>{Number(superficieTotalDelEdificio).toFixed(2)} m² (100.00%)</strong> • {temaActual?.normativa}
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
                                {Number(escrutinioVivo.coeficienteParticipacion).toFixed(2)}%
                            </span>
                            <ProgressBar
                                porcentaje={Number(escrutinioVivo.coeficienteParticipacion).toFixed(2)}
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
                                Unidades Registradas en Padrón
                            </span>
                            <span className="text-xl font-extrabold text-emerald-700">
                                {padronPonderado.length} UF ({Number(superficieTotalDelEdificio).toFixed(0)} m²)
                            </span>
                            <ProgressBar
                                porcentaje={100}
                                color="emerald"
                                size="sm"
                                className="mt-1.5"
                            />
                            <span className="text-[10px] text-slate-500 mt-1 block">
                                Total matemático ponderado: 100.00%
                            </span>
                        </Card>
                    </div>

                    <Card variant="subtle" className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold uppercase text-slate-700">
                                📊 Escrutinio en Tiempo Real (Base Exacta 100.00%)
                            </h3>
                            <span className="text-[10px] font-mono text-slate-500">
                                Pulso WS: {escrutinioVivo.ultimoPulso}
                            </span>
                        </div>

                        <ProgressBar
                            label="👍 A Favor"
                            porcentaje={Number(escrutinioVivo.aFavor).toFixed(2)}
                            color="emerald"
                            detalleDerecha={`${Number(escrutinioVivo.aFavor).toFixed(2)}%`}
                        />
                        <ProgressBar
                            label="👎 En Contra"
                            porcentaje={Number(escrutinioVivo.enContra).toFixed(2)}
                            color="red"
                            detalleDerecha={`${Number(escrutinioVivo.enContra).toFixed(2)}%`}
                        />
                        <ProgressBar
                            label="✋ Abstención"
                            porcentaje={Number(escrutinioVivo.abstencion).toFixed(2)}
                            color="slate"
                            detalleDerecha={`${Number(escrutinioVivo.abstencion).toFixed(2)}%`}
                        />
                    </Card>

                    <div className="space-y-1.5">
                        <h3 className="text-[11px] font-bold uppercase text-slate-700">
                            Últimos Bloques Ponderados Sellados en Urna (SHA-256)
                        </h3>
                        <Card variant="dark" className="p-3 font-mono text-[11px] space-y-1.5">
                            {primerosBloques.map((u, idx) => (
                                <div
                                    key={u.id}
                                    className={`flex justify-between items-center ${
                                        idx === 0 ? 'border-b border-slate-800 pb-1' : ''
                                    }`}
                                >
                                    <span className="text-blue-400 font-bold">
                                        UF {u.depto} ({u.superficieM2} m2)
                                    </span>
                                    <span className="text-slate-300">
                                        Coef: {Number(u.coeficientePorcentual).toFixed(2)}%
                                    </span>
                                    <span className="text-emerald-400">
                                        {idx === 0 ? '9f86d081884c...' : '8c4e2b1a9f07...'}
                                    </span>
                                </div>
                            ))}
                        </Card>
                    </div>
                </div>

                <Card variant="subtle" className="p-3.5 flex items-center justify-between mt-4">
                    <div className="text-xs text-slate-600">
                        <span className="font-bold text-slate-800 block">Control de Sesión</span>
                        Gestione el Padrón de m² o cierre el escrutinio desde el Panel Admin.
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => router.push('/admin')}>
                        ⚙️ Panel Admin
                    </Button>
                </Card>
            </Card>
        );
    }

    // =========================================================================
    // VISTA 2: ROL PROPIETARIO -> URNA CRIPTOGRÁFICA + RECIBO DE VOTO DINÁMICO
    // =========================================================================
    return (
        <Card className="p-6 flex flex-col justify-between min-h-[620px] relative">

            {/* MODAL 1: COMPROBANTE DE SUFRAGIO (RECIBO CRIPTOGRÁFICO PDF SIMULADO) */}
            <Modal
                isOpen={mostrarModalRecibo}
                onClose={() => setMostrarModalRecibo(false)}
                badge={
                    <Badge variant="darkSuccess" size="sm" shape="rounded">
                        📄 Recibo Criptográfico Oficial • SHA-256
                    </Badge>
                }
                title="Comprobante de Sufragio Electrónico"
                subtitle="Consorcio Edificio Las Margaritas • Ley N° 26.994 (Art. 2060 CCyCN)"
                maxWidth="max-w-lg"
            >
                <div className="space-y-4">
                    <Card variant="subtle" className="p-5 border-2 border-slate-300 space-y-3 text-xs">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                            <div>
                                <span className="font-extrabold text-slate-900 text-sm block">
                                    CONSORCIOSYNC • ACTA DE URNA
                                </span>
                                <span className="text-[11px] text-slate-500">
                                    Punto tratado: {temaActual?.numero} — {temaActual?.titulo}
                                </span>
                            </div>
                            <Badge variant="success" size="sm" shape="rounded">
                                SELLADO
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                    Nombre del Titular
                                </span>
                                <span className="font-bold text-slate-900 text-sm">
                                    {usuario?.nombre || 'Propietario'}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                    Unidad(es) y Superficie
                                </span>
                                <span className="font-bold text-blue-800 text-xs">
                                    {desgloseUnidadesUI}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                    Coeficiente Ponderado
                                </span>
                                <span className="font-mono font-extrabold text-slate-900 text-sm">
                                    {coeficienteUsuarioUI}% ({superficieTitularM2} m² / {superficieTotalDelEdificio} m²)
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                    Sentido del Voto Emitido
                                </span>
                                <Badge
                                    variant={
                                        votoEmitido === 'A_FAVOR'
                                            ? 'success'
                                            : votoEmitido === 'EN_CONTRA'
                                            ? 'danger'
                                            : 'secondary'
                                    }
                                    size="sm"
                                    shape="rounded"
                                >
                                    {votoEmitido ? votoEmitido.replace('_', ' ') : 'REGISTRADO'}
                                </Badge>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase text-slate-400">
                                    Fecha y Hora Exacta (UTC):
                                </span>
                                <span className="font-mono font-bold text-slate-700">
                                    {timestampVotoUtc}
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                                    Hash Criptográfico SHA-256 Generado:
                                </span>
                                <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-[11px] break-all">
                                    {hashReciboSha256}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Leyenda Legal Obligatoria */}
                    <Card variant="info" className="p-3.5 text-xs text-center font-semibold">
                        ⚖️ &ldquo;Este comprobante garantiza la inmutabilidad de su decisión en la base de datos.&rdquo;
                    </Card>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="light"
                            size="sm"
                            onClick={() => setMostrarModalRecibo(false)}
                        >
                            Cerrar Vista Previa
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => window.print()}
                        >
                            🖨️ Imprimir / Guardar PDF
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* MODAL 2: SEGURIDAD PARA RECTIFICACIÓN DE VOTO */}
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

            {/* Cabecera de Urna con Desglose Dinámico de Superficie, Coeficiente y Cartas Poder */}
            <div className="border-b border-slate-200 pb-3 mb-3 flex flex-wrap justify-between items-start gap-2">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="primary" size="sm" shape="rounded">
                            {temaActual?.numero || 'Tema 1'}
                        </Badge>
                        <h2 className="text-base md:text-lg font-bold text-slate-800">
                            Urna Criptográfica SHA-256
                        </h2>
                        {esApoderado && (
                            <Badge variant="info" size="sm" shape="rounded">
                                👤 Votando en representación propia y de {nombresPoderdantes}
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-slate-600">
                        Titular: <strong>{usuario?.nombre}</strong> •{' '}
                        <span className="font-semibold text-slate-800">{desgloseUnidadesUI}</span>
                    </p>
                    <p className="text-[11px] text-blue-700 font-bold">
                        ⚙️ Peso Electoral Total en Urna: {coeficienteUsuarioUI}% (
                        {esApoderado
                            ? `Propio: ${coeficientePropioUI}% + Delegado: ${coeficienteDelegadoUI}% • ${superficieTotalVotanteM2} m²`
                            : `${superficieTitularM2} m² sobre ${superficieTotalDelEdificio} m² totales = 100.00%`}
                        )
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
                    {usuario?.kycVerificado === false ? (
                        <Card variant="warning" className="p-4 border-2 border-dashed space-y-2.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-xl">🔒</span>
                                <h3 className="font-bold text-amber-950 text-sm">
                                    Poder de Voto Restringido ({usuario?.estadoKyc || 'PENDIENTE_AUDITORIA'})
                                </h3>
                            </div>
                            <p className="text-xs text-amber-900 leading-relaxed">
                                Su cuenta se encuentra registrada pero aún no ha sido verificada por la Administración. Una vez aprobado su legajo KYC en el Panel de Control, se habilitará el sufragio.
                            </p>
                            <div className="flex justify-center gap-2 pt-1">
                                <Button
                                    variant="warning"
                                    size="sm"
                                    onClick={() => router.push('/onboarding')}
                                >
                                    🛡️ Ver Estado de mi Onboarding KYC
                                </Button>
                            </div>
                        </Card>
                    ) : tieneVotoDelegado ? (
                        <Card
                            variant="warning"
                            className="p-5 border-2 border-amber-400 space-y-2 text-center"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-xl">🔒</span>
                                <h3 className="font-extrabold text-amber-950 text-sm">
                                    🔒 Voto bloqueado. Usted ha delegado su representación para esta asamblea.
                                </h3>
                            </div>
                            <p className="text-xs text-amber-900 leading-relaxed">
                                Su Carta Poder a favor de{' '}
                                <strong>{poderCedidoAprobado?.emailApoderado}</strong> se encuentra{' '}
                                <strong>APROBADA</strong>. Para evitar la duplicidad de sufragios, su coeficiente ({coeficientePropioUI}%) está siendo ejercido por su representante designado.
                            </p>
                        </Card>
                    ) : tieneUnidadMorosa ? (
                        <Card variant="danger" className="p-4 border-2 border-dashed space-y-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-xl">⚠️</span>
                                <h3 className="font-bold text-red-900 text-sm">
                                    Derecho a Voto Suspendido por Morosidad
                                </h3>
                            </div>
                            <p className="text-xs text-red-800 leading-relaxed">
                                Según el Reglamento de Copropiedad, su unidad registra mora contable. Usted conserva pleno <strong>derecho a voz en el Foro de Deliberación</strong>, pero no puede emitir sufragio hasta regularizar su situación.
                            </p>
                        </Card>
                    ) : !votoEmitido ? (
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-center text-slate-600 uppercase tracking-wider">
                                Emitir Sufragio Ponderado ({superficieTitularM2} m² = {coeficienteUsuarioUI}%)
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <Button
                                    variant="success"
                                    size="md"
                                    fullWidth
                                    onClick={() => emitirSufragio('A_FAVOR')}
                                >
                                    👍 A Favor ({coeficienteUsuarioUI}%)
                                </Button>
                                <Button
                                    variant="danger"
                                    size="md"
                                    fullWidth
                                    onClick={() => emitirSufragio('EN_CONTRA')}
                                >
                                    👎 En Contra ({coeficienteUsuarioUI}%)
                                </Button>
                                <Button
                                    variant="neutral"
                                    size="md"
                                    fullWidth
                                    onClick={() => emitirSufragio('ABSTENCION')}
                                >
                                    ✋ Abstención ({coeficienteUsuarioUI}%)
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Card variant="success" className="p-3 text-center border-2">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-lg">✅</span>
                                    <h3 className="font-bold text-emerald-900 text-sm">
                                        Voto Sellado en {temaActual?.numero}: {votoEmitido.replace('_', ' ')} ({superficieTitularM2} m² — {coeficienteUsuarioUI}%)
                                    </h3>
                                </div>
                                <p className="text-[10px] text-emerald-700 mt-0.5 font-mono">
                                    Hash SHA-256: 9f86d081884c7d659a2feaa0c55ad015...
                                </p>
                            </Card>

                            {/* Botones de Acción Post-Voto: Descargar Comprobante + Rectificar + Siguiente */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Button
                                    variant="light"
                                    size="sm"
                                    fullWidth
                                    onClick={() => setMostrarModalRecibo(true)}
                                >
                                    📄 Descargar Comprobante de Voto
                                </Button>

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    fullWidth
                                    disabled={intentosRestantes === 0}
                                    onClick={solicitarRectificacion}
                                >
                                    🔄 Rectificar Voto ({intentosRestantes} intentos)
                                </Button>
                            </div>

                            {temasCompletados < totalTemas && onIrSiguientePendiente && (
                                <Button
                                    variant="warning"
                                    size="sm"
                                    fullWidth
                                    onClick={onIrSiguientePendiente}
                                >
                                    Ir al Siguiente Tema Pendiente →
                                </Button>
                            )}
                        </div>
                    )}

                    {/* HU-010: RESULTADOS PARCIALES EN TIEMPO REAL SOBRE EL 100% */}
                    <Card variant="subtle" className="p-3.5 space-y-2.5 mt-auto">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                            <span className="text-[11px] font-extrabold uppercase text-slate-700">
                                📡 Escrutinio Parcial en Tiempo Real (Base 100.00%)
                            </span>
                            <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                                ● Sync: {escrutinioVivo.ultimoPulso}
                            </span>
                        </div>

                        <ProgressBar
                            label="👍 A Favor"
                            porcentaje={Number(escrutinioVivo.aFavor).toFixed(2)}
                            color="emerald"
                            detalleDerecha={`${Number(escrutinioVivo.aFavor).toFixed(2)}%`}
                        />
                        <ProgressBar
                            label="👎 En Contra"
                            porcentaje={Number(escrutinioVivo.enContra).toFixed(2)}
                            color="red"
                            detalleDerecha={`${Number(escrutinioVivo.enContra).toFixed(2)}%`}
                        />
                        <ProgressBar
                            label="✋ Abstención"
                            porcentaje={Number(escrutinioVivo.abstencion).toFixed(2)}
                            color="slate"
                            detalleDerecha={`${Number(escrutinioVivo.abstencion).toFixed(2)}%`}
                        />
                    </Card>
                </div>
            )}
        </Card>
    );
}
