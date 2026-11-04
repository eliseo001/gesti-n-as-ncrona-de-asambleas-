'use client';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { Card, CardHeader, Button, Badge } from '../../../../components/ui';
import QuorumMonitor from '../../../../components/QuorumMonitor';
import ForoDebate from '../../../../components/ForoDebate';
import PanelSufragio from '../../../../components/PanelSufragio';
import DesignacionAutoridades from '../../../../components/DesignacionAutoridades';
import ResumenAsamblea from '../../../../components/ResumenAsamblea';

const TEMAS_ORDEN_DEL_DIA_INICIALES = [
    {
        id: 1,
        numero: 'Tema 1',
        tituloCorto: 'Presupuesto e Impermeabilización',
        titulo: 'Aprobación de presupuesto para pintura e impermeabilización de fachada',
        normativa: 'Mayoría Absoluta (>50% - Art. 2060 CCyCN)',
        umbralRequerido: 50.01,
        mensajesDebate: 18,
        participacionUnidades: '17 de 20 UF',
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
        escrutinio: {
            aFavor: 68.5,
            unidadesAFavor: 14,
            enContra: 21.5,
            unidadesEnContra: 2,
            abstencion: 10.0,
            unidadesAbstencion: 1,
        },
        veredicto: 'APROBADO',
        detalleVeredicto: 'Alcanzó doble mayoría legal (68.5% coeficiente y 14/20 unidades).',
    },
    {
        id: 2,
        numero: 'Tema 2',
        tituloCorto: 'Remoción de Administración',
        titulo: 'Remoción anticipada de la administración actual y auditoría contable',
        normativa: 'Mayoría Absoluta (>50% - Art. 2060 CCyCN)',
        umbralRequerido: 50.01,
        mensajesDebate: 29,
        participacionUnidades: '18 de 20 UF',
        tendencia: {
            coeficienteParticipacion: 72.0,
            unidadesSufragaron: 15,
            unidadesTotales: 20,
            aFavor: 22.0,
            unidadesAFavor: 4,
            enContra: 68.0,
            unidadesEnContra: 10,
            abstencion: 10.0,
            unidadesAbstencion: 1,
        },
        escrutinio: {
            aFavor: 22.0,
            unidadesAFavor: 4,
            enContra: 68.0,
            unidadesEnContra: 13,
            abstencion: 10.0,
            unidadesAbstencion: 1,
        },
        veredicto: 'RECHAZADO',
        detalleVeredicto: 'Rechazado por mayoría absoluta en contra (68.0% coeficiente y 13/20 unidades).',
    },
    {
        id: 3,
        numero: 'Tema 3',
        tituloCorto: 'Reforma del Reglamento',
        titulo: 'Reforma del Reglamento de Copropiedad (Horarios de SUM y Terrazas)',
        normativa: 'Mayoría de Dos Tercios (66.6% - Art. 2057 CCyCN)',
        umbralRequerido: 66.6,
        mensajesDebate: 14,
        participacionUnidades: '15 de 20 UF',
        tendencia: {
            coeficienteParticipacion: 61.5,
            unidadesSufragaron: 12,
            unidadesTotales: 20,
            aFavor: 54.0,
            unidadesAFavor: 8,
            enContra: 36.0,
            unidadesEnContra: 3,
            abstencion: 10.0,
            unidadesAbstencion: 1,
        },
        escrutinio: {
            aFavor: 54.0,
            unidadesAFavor: 11,
            enContra: 36.0,
            unidadesEnContra: 3,
            abstencion: 10.0,
            unidadesAbstencion: 1,
        },
        veredicto: 'CONDICIONADO',
        detalleVeredicto: 'Mayoría de presentes a favor (54.0%), sujeto a notificación por 15 días a ausentes para alcanzar 2/3 (66.6%).',
    },
];

export default function SalaTema({ params }) {
    const router = useRouter();
    const { usuario, faseAsamblea } = useAuth();

    const resolvedParams = typeof params?.then === 'function' ? use(params) : params;
    const idInicial = Number(resolvedParams?.id ?? 1);

    const [temaActivoId, setTemaActivoId] = useState(
        [0, 1, 2, 3].includes(idInicial) ? idInicial : 1
    );

    const [votosPorTema, setVotosPorTema] = useState({ 1: null, 2: null, 3: null });
    const [intentosPorTema, setIntentosPorTema] = useState({ 1: 2, 2: 2, 3: 2 });

    useEffect(() => {
        try {
            const votosGuardados = localStorage.getItem('consorciosync_votos_por_tema');
            if (votosGuardados) setVotosPorTema(JSON.parse(votosGuardados));
            const intentosGuardados = localStorage.getItem('consorciosync_intentos_por_tema');
            if (intentosGuardados) setIntentosPorTema(JSON.parse(intentosGuardados));
        } catch {
            // Fallback por defecto
        }
    }, []);

    const esAdministrador = usuario?.rol === 'ADMINISTRADOR';
    const esTemaAutoridades = temaActivoId === 0;

    const temaActual =
        TEMAS_ORDEN_DEL_DIA_INICIALES.find((t) => t.id === temaActivoId) ||
        TEMAS_ORDEN_DEL_DIA_INICIALES[0];

    const totalTemasVotables = TEMAS_ORDEN_DEL_DIA_INICIALES.length;
    const temasCompletados = TEMAS_ORDEN_DEL_DIA_INICIALES.filter(
        (t) => Boolean(votosPorTema[t.id])
    ).length;

    const handleEmitirVoto = (temaId, valorVoto) => {
        const actualizados = { ...votosPorTema, [temaId]: valorVoto };
        setVotosPorTema(actualizados);
        localStorage.setItem('consorciosync_votos_por_tema', JSON.stringify(actualizados));
    };

    const handleRectificarVoto = (temaId) => {
        const nuevosVotos = { ...votosPorTema, [temaId]: null };
        const nuevosIntentos = {
            ...intentosPorTema,
            [temaId]: Math.max(0, (intentosPorTema[temaId] ?? 2) - 1),
        };
        setVotosPorTema(nuevosVotos);
        setIntentosPorTema(nuevosIntentos);
        localStorage.setItem('consorciosync_votos_por_tema', JSON.stringify(nuevosVotos));
        localStorage.setItem('consorciosync_intentos_por_tema', JSON.stringify(nuevosIntentos));
    };

    const irAlSiguienteTemaPendiente = () => {
        const siguiente = TEMAS_ORDEN_DEL_DIA_INICIALES.find((t) => !votosPorTema[t.id]);
        if (siguiente) setTemaActivoId(siguiente.id);
    };

    // =========================================================================
    // SI LA ASAMBLEA ESTÁ CERRADA -> MOSTRAR DASHBOARD DE RESUMEN DE CIERRE
    // =========================================================================
    if (faseAsamblea === 'CERRADA') {
        return (
            <div className="min-h-screen bg-slate-100 p-6 font-sans">
                <div className="max-w-6xl mx-auto space-y-4">
                    <Card className="flex justify-between items-center p-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.push(esAdministrador ? '/admin' : '/asamblea')}
                        >
                            {esAdministrador
                                ? '← Volver al Panel de Control'
                                : '← Volver al Lobby de Asamblea'}
                        </Button>
                        <Badge variant="neutral">🔒 Estado de Asamblea: CERRADA</Badge>
                    </Card>

                    <ResumenAsamblea
                        temas={TEMAS_ORDEN_DEL_DIA_INICIALES}
                        votosPropietario={votosPorTema}
                    />
                </div>
            </div>
        );
    }

    // =========================================================================
    // VISTA ASAMBLEA ACTIVA: SIDEBAR DE TEMAS + QUORUM MONITOR + FORO Y SUFRAGIO
    // =========================================================================
    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-4">

                {/* Cabecera Superior de Navegación Contextual */}
                <Card className="flex flex-wrap justify-between items-center gap-3 p-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => router.push(esAdministrador ? '/admin' : '/asamblea')}
                        >
                            {esAdministrador
                                ? '← Volver al Panel de Control'
                                : '← Volver al Lobby General'}
                        </Button>
                        <span className="text-slate-300">|</span>
                        <span className="text-xs font-semibold text-slate-600">
                            Asamblea Extraordinaria • Orden del Día Unificado
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {!esAdministrador && (
                            <Badge variant="secondary">
                                Progreso: {temasCompletados}/{totalTemasVotables} temas votados
                            </Badge>
                        )}
                        <Badge variant={faseAsamblea === 'ABIERTA' ? 'live' : 'warning'}>
                            {faseAsamblea === 'ABIERTA'
                                ? '🟢 EN VIVO (WebSockets)'
                                : '⏸️ CUARTO INTERMEDIO'}
                        </Badge>
                    </div>
                </Card>

                {/* HU-006: Monitor de Quórum Legal Acumulado de la Asamblea */}
                <QuorumMonitor
                    porcentajeQuorum={68.5}
                    unidadesPresentes={14}
                    unidadesTotales={20}
                    minimoRequerido={50}
                />

                {/* Layout Maestro: Sidebar de Orden del Día (Izquierda) + Sala del Tema Activo (Derecha) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                    {/* SIDEBAR DE NAVEGACIÓN DE TEMAS */}
                    <Card as="aside" className="lg:col-span-3 overflow-hidden">
                        <CardHeader className="p-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 block">
                                Navegación Continua
                            </span>
                            <h2 className="font-bold text-base mt-0.5">📋 Orden del Día</h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Seleccione un punto para alternar debate y urna sin salir de la sala.
                            </p>
                        </CardHeader>

                        <div className="p-3 space-y-2.5">
                            {TEMAS_ORDEN_DEL_DIA_INICIALES.map((tema) => {
                                const estaActivo = !esTemaAutoridades && tema.id === temaActivoId;
                                const yaVotado = Boolean(votosPorTema[tema.id]);

                                return (
                                    <button
                                        key={tema.id}
                                        type="button"
                                        onClick={() => setTemaActivoId(tema.id)}
                                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                                            estaActivo
                                                ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-600/20 shadow-sm'
                                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center gap-2 mb-1.5">
                                            <Badge
                                                variant={estaActivo ? 'primary' : 'dark'}
                                                size="sm"
                                                shape="rounded"
                                            >
                                                {tema.numero}
                                            </Badge>

                                            {!esAdministrador ? (
                                                <Badge
                                                    variant={yaVotado ? 'success' : 'warning'}
                                                    size="sm"
                                                >
                                                    {yaVotado ? '🟢 Votado' : '🟡 Pendiente de Voto'}
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="neutral"
                                                    size="sm"
                                                    shape="rounded"
                                                    className="font-mono"
                                                >
                                                    {tema.tendencia.coeficienteParticipacion}% Part.
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="font-bold text-slate-900 text-xs leading-snug">
                                            {tema.tituloCorto}
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-1 truncate">
                                            {tema.normativa}
                                        </p>
                                    </button>
                                );
                            })}

                            {/* Separador para el Tema 0 Preliminar */}
                            <div className="pt-2 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setTemaActivoId(0)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                                        esTemaAutoridades
                                            ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-600/20'
                                            : 'bg-white hover:bg-slate-50 border-slate-200'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <Badge variant="dark" size="sm" shape="rounded">
                                            Tema 0 (Preliminar)
                                        </Badge>
                                        <span className="text-[10px] font-semibold text-blue-700">
                                            Art. 2062
                                        </span>
                                    </div>
                                    <p className="font-bold text-slate-800 text-xs">
                                        Designación de Autoridades
                                    </p>
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* ÁREA CENTRAL Y DERECHA: CONTEXTO DEL TEMA SELECCIONADO */}
                    <section className="lg:col-span-9 space-y-4">

                        {/* Banner Contextual del Tema Seleccionado usando CardHeader */}
                        <CardHeader
                            rounded="all"
                            className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        >
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="darkInfo" size="sm" shape="rounded">
                                        {esTemaAutoridades
                                            ? 'Tema #0 • Punto Preliminar (Art. 2062 CCyCN)'
                                            : `${temaActual.numero} • ${temaActual.normativa}`}
                                    </Badge>
                                    {!esAdministrador && !esTemaAutoridades && (
                                        <Badge
                                            variant={
                                                votosPorTema[temaActual.id] ? 'darkSuccess' : 'darkWarning'
                                            }
                                            size="sm"
                                            shape="rounded"
                                        >
                                            {votosPorTema[temaActual.id]
                                                ? `🟢 Tu voto: ${votosPorTema[temaActual.id].replace('_', ' ')}`
                                                : '🟡 Pendiente de tu sufragio'}
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="text-xl md:text-2xl font-bold mt-2">
                                    {esTemaAutoridades
                                        ? 'Designación de Presidente de Asamblea y Firmantes del Acta'
                                        : temaActual.titulo}
                                </h1>
                            </div>
                        </CardHeader>

                        {/* Grilla Concurrente: Foro de Debate + Panel de Sufragio */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                            <ForoDebate
                                faseActual={faseAsamblea}
                                temaActual={
                                    esTemaAutoridades
                                        ? {
                                              id: 0,
                                              numero: 'Tema 0',
                                              titulo: 'Designación de Autoridades de Asamblea',
                                          }
                                        : temaActual
                                }
                            />

                            {esTemaAutoridades && !esAdministrador ? (
                                <DesignacionAutoridades />
                            ) : (
                                <PanelSufragio
                                    faseActual={faseAsamblea}
                                    temaActual={temaActual}
                                    votoTemaActual={votosPorTema[temaActual.id]}
                                    intentosTemaActual={intentosPorTema[temaActual.id] ?? 2}
                                    temasCompletados={temasCompletados}
                                    totalTemas={totalTemasVotables}
                                    onEmitirVoto={handleEmitirVoto}
                                    onRectificarVoto={handleRectificarVoto}
                                    onIrSiguientePendiente={irAlSiguienteTemaPendiente}
                                />
                            )}
                        </div>
                    </section>

                </div>

            </div>
        </div>
    );
}
