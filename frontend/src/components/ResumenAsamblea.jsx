'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function ResumenAsamblea({ temas = [], votosPropietario = {}, mensajesPorTema = {} }) {
    const router = useRouter();
    const { usuario, actualizarFaseAsamblea } = useAuth();
    const esAdministrador = usuario?.rol === 'ADMINISTRADOR';

    // Datos consolidados de cierre si no se pasan por props
    const temasConsolidados = temas.length > 0 ? temas : [
        {
            id: 1,
            numero: 'Tema 1',
            titulo: 'Aprobación de presupuesto para pintura e impermeabilización',
            normativa: 'Mayoría Absoluta (>50% - Art. 2060 CCyCN)',
            umbralRequerido: 50.01,
            mensajesDebate: 18,
            participacionUnidades: '17 de 20 UF',
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
            titulo: 'Remoción anticipada de la administración actual',
            normativa: 'Mayoría Absoluta (>50% - Art. 2060 CCyCN)',
            umbralRequerido: 50.01,
            mensajesDebate: 29,
            participacionUnidades: '18 de 20 UF',
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
            titulo: 'Reforma del Reglamento de Copropiedad (Uso de SUM y Terrazas)',
            normativa: 'Mayoría Agravada de Dos Tercios (66.6% - Art. 2057 CCyCN)',
            umbralRequerido: 66.6,
            mensajesDebate: 14,
            participacionUnidades: '15 de 20 UF',
            escrutinio: {
                aFavor: 54.0,
                unidadesAFavor: 11,
                enContra: 36.0,
                unidadesEnContra: 3,
                abstencion: 10.0,
                unidadesAbstencion: 1,
            },
            veredicto: 'CONDICIONADO',
            detalleVeredicto: 'Mayoría de presentes a favor (54.0%), pero requiere notificación por 15 días a ausentes para alcanzar los 2/3 (66.6%).',
        },
    ];

    const obtenerEstiloVeredicto = (veredicto) => {
        if (veredicto === 'APROBADO') {
            return 'bg-emerald-100 text-emerald-900 border-emerald-300';
        }
        if (veredicto === 'RECHAZADO') {
            return 'bg-red-100 text-red-900 border-red-300';
        }
        return 'bg-amber-100 text-amber-900 border-amber-300';
    };

    const obtenerIconoVeredicto = (veredicto) => {
        if (veredicto === 'APROBADO') return '✅ APROBADO';
        if (veredicto === 'RECHAZADO') return '❌ RECHAZADO';
        return '⏳ CONDICIONADO (AUSENTES 15 DÍAS)';
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Encabezado del Dashboard de Cierre de Sesión */}
            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded">
                            🔒 Sesión Concluida • Escrutinio Consolidado
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                            SHA-256 Root: 8c4e2b1a9f07...
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold mt-2">
                        Resumen Ejecutivo de Cierre de Asamblea
                    </h1>
                    <p className="text-slate-300 text-sm mt-1">
                        Balance integral de deliberación, escrutinio ponderado y veredictos legales previos al Libro de Actas.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {esAdministrador && (
                        <button
                            onClick={() => actualizarFaseAsamblea('ABIERTA')}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-4 rounded-lg border border-slate-600 text-xs cursor-pointer transition-colors"
                        >
                            🔓 Reabrir Asamblea
                        </button>
                    )}
                    <button
                        onClick={() => router.push('/asamblea/acta')}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg text-xs cursor-pointer transition-all"
                    >
                        📄 Abrir Acta Legal Oficial →
                    </button>
                </div>
            </div>

            {/* KPIs Globales de la Sesión */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold uppercase text-slate-500 block">
                        Quórum Final Consolidado
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                        68.50% Coeficiente
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold mt-1 block">
                        ✓ 17 de 20 Unidades Funcionales participaron
                    </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold uppercase text-slate-500 block">
                        Participación en el Debate
                    </span>
                    <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
                        61 Intervenciones
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                        Registradas en 3 hilos del Orden del Día
                    </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold uppercase text-slate-500 block">
                        Balance de Resoluciones
                    </span>
                    <div className="flex items-center gap-2 mt-2 text-xs font-bold">
                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded border border-emerald-300">
                            1 Aprobado
                        </span>
                        <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded border border-red-300">
                            1 Rechazado
                        </span>
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded border border-amber-300">
                            1 Condicionado
                        </span>
                    </div>
                </div>
            </div>

            {/* Desglose Detallado por cada Tema del Orden del Día */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800">
                    Desglose de Escrutinio y Veredicto por Punto del Orden del Día
                </h2>

                {temasConsolidados.map((tema) => {
                    const cantidadMensajes = mensajesPorTema[tema.id]
                        ? mensajesPorTema[tema.id].length + tema.mensajesDebate
                        : tema.mensajesDebate;
                    const miVoto = votosPropietario[tema.id];

                    return (
                        <div
                            key={tema.id}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4"
                        >
                            {/* Cabecera del Tema y Veredicto */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-0.5 rounded">
                                            {tema.numero}
                                        </span>
                                        <span className="text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                                            {tema.normativa}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                                            💬 {cantidadMensajes} mensajes en debate
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900">{tema.titulo}</h3>
                                </div>

                                <span
                                    className={`text-xs font-extrabold px-3.5 py-1.5 rounded-lg border whitespace-nowrap ${obtenerEstiloVeredicto(
                                        tema.veredicto
                                    )}`}
                                >
                                    {obtenerIconoVeredicto(tema.veredicto)}
                                </span>
                            </div>

                            {/* Barras de Resultado del Escrutinio */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                {/* A Favor */}
                                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                                    <div className="flex justify-between font-bold text-emerald-950 mb-1">
                                        <span>👍 A FAVOR</span>
                                        <span>{tema.escrutinio.aFavor.toFixed(1)}% Coef.</span>
                                    </div>
                                    <div className="w-full bg-emerald-200/60 h-2 rounded-full">
                                        <div
                                            className="bg-emerald-600 h-2 rounded-full"
                                            style={{ width: `${tema.escrutinio.aFavor}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[11px] text-emerald-800 mt-1 block font-medium">
                                        Representa {tema.escrutinio.unidadesAFavor} de 20 Unidades Funcionales
                                    </span>
                                </div>

                                {/* En Contra */}
                                <div className="bg-red-50/70 p-3.5 rounded-xl border border-red-200">
                                    <div className="flex justify-between font-bold text-red-950 mb-1">
                                        <span>👎 EN CONTRA</span>
                                        <span>{tema.escrutinio.enContra.toFixed(1)}% Coef.</span>
                                    </div>
                                    <div className="w-full bg-red-200/60 h-2 rounded-full">
                                        <div
                                            className="bg-red-600 h-2 rounded-full"
                                            style={{ width: `${tema.escrutinio.enContra}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[11px] text-red-800 mt-1 block font-medium">
                                        Representa {tema.escrutinio.unidadesEnContra} de 20 Unidades Funcionales
                                    </span>
                                </div>

                                {/* Abstenciones */}
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                                        <span>✋ ABSTENCIÓN</span>
                                        <span>{tema.escrutinio.abstencion.toFixed(1)}% Coef.</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-2 rounded-full">
                                        <div
                                            className="bg-slate-500 h-2 rounded-full"
                                            style={{ width: `${tema.escrutinio.abstencion}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                                        Representa {tema.escrutinio.unidadesAbstencion} de 20 Unidades Funcionales
                                    </span>
                                </div>
                            </div>

                            {/* Pie con Fundamento del Veredicto y Mi Voto */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 text-xs text-slate-600">
                                <p>
                                    <strong className="text-slate-800">Dictamen del Sistema:</strong>{' '}
                                    {tema.detalleVeredicto}
                                </p>
                                {!esAdministrador && (
                                    <span className="font-mono text-[11px] bg-slate-100 border border-slate-300 px-2.5 py-1 rounded text-slate-800 font-semibold whitespace-nowrap">
                                        Tu voto: {miVoto ? miVoto.replace('_', ' ') : 'REGISTRADO EN CADENA'}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

