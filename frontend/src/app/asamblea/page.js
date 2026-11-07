'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ResumenAsamblea from '../../components/ResumenAsamblea';

export default function LobbyAsamblea() {
    const router = useRouter();
    const { usuario, faseAsamblea } = useAuth();

    const asambleaCerrada = faseAsamblea === 'CERRADA';

    const [votosPorTema] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const guardados = localStorage.getItem('consorciosync_votos_por_tema');
                if (guardados) return JSON.parse(guardados);
            } catch {
                // Fallback por defecto
            }
        }
        return { 1: null, 2: null, 3: null };
    });

    // Datos de la Doble Mayoría (Art. 2060 CCyCN: Mayoría de Unidades + Mayoría de Coeficiente)
    const [metricasQuorum] = useState({
        coeficienteAlcanzado: 68.5,
        unidadesPresentes: 14,
        unidadesTotales: 20,
    });

    const [temasOrdenDelDia] = useState([
        {
            id: 0,
            codigo: 'Tema 0 (Preliminar)',
            titulo: 'Designación de 1 Presidente de Asamblea y 2 Propietarios para firmar el Acta',
            normativa: 'Art. 2062 CCyCN',
            resumenEstado: 'Postulación activa (Presidente: UF 1A | Firmantes: UF 2B y UF 4B)',
            esVotable: false,
        },
        {
            id: 1,
            codigo: 'Tema 1',
            titulo: 'Aprobación de presupuesto para pintura e impermeabilización de fachada',
            normativa: 'Mayoría Absoluta (>50% - Art. 2060 CCyCN)',
            resumenEstado: 'En tratamiento (68.5% del coeficiente • 14 de 20 unidades)',
            esVotable: true,
        },
        {
            id: 2,
            codigo: 'Tema 2',
            titulo: 'Remoción anticipada de la administración actual y auditoría contable',
            normativa: 'Mayoría Absoluta (>50% - Art. 2060 CCyCN)',
            resumenEstado: 'En tratamiento (72.0% del coeficiente • 15 de 20 unidades)',
            esVotable: true,
        },
        {
            id: 3,
            codigo: 'Tema 3',
            titulo: 'Reforma del Reglamento de Copropiedad (Horarios de SUM y Terrazas)',
            normativa: 'Mayoría Agravada Dos Tercios (66.6% - Art. 2057 CCyCN)',
            resumenEstado: 'En tratamiento (61.5% del coeficiente • 12 de 20 unidades)',
            esVotable: true,
        },
    ]);

    const temasVotablesCompletados = [1, 2, 3].filter((id) => Boolean(votosPorTema[id])).length;

    return (
        <div className="min-h-screen bg-slate-100 p-6 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Cabecera Institucional del Propietario */}
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                            Gobernanza Consorcial Asíncrona • Ley N° 26.994
                        </span>
                        <h1 className="text-2xl font-bold mt-1">Asamblea Extraordinaria - Noviembre 2026</h1>
                        <p className="text-slate-300 text-sm mt-0.5">
                            Consorcio Edificio Las Margaritas • Titular:{' '}
                            <strong>{usuario?.nombre || 'Propietario'}</strong> ({usuario?.unidad || 'UF 4B'} — Coef.{' '}
                            {Number(usuario?.coeficienteTotal ?? usuario?.coeficiente ?? 5.2).toFixed(2)}%)
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => router.push('/asamblea/cierre')}
                            className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 px-3.5 rounded-lg text-xs border border-emerald-500 transition-colors cursor-pointer shadow-sm"
                        >
                            🏁 Resultados y Cierre (Acta N° 014)
                        </button>
                        <button
                            onClick={() => router.push('/asamblea/delegar')}
                            className="bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-3.5 rounded-lg text-xs border border-blue-500 transition-colors cursor-pointer shadow-sm"
                        >
                            📜 Delegar Voto (Carta Poder)
                        </button>
                        <button
                            onClick={() => router.push('/asamblea/propuestas')}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-2 px-3.5 rounded-lg text-xs border border-slate-700 transition-colors cursor-pointer"
                        >
                            💡 Iniciativas Vecinales
                        </button>
                        <button
                            onClick={() => router.push('/onboarding')}
                            className="bg-slate-800 hover:bg-slate-700 text-blue-300 font-semibold py-2 px-3.5 rounded-lg text-xs border border-slate-700 transition-colors cursor-pointer"
                        >
                            ➕ Reclamar nueva unidad
                        </button>
                        <button
                            onClick={() => router.push('/asamblea/historial')}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-2 px-3.5 rounded-lg text-xs border border-slate-700 transition-colors cursor-pointer"
                        >
                            📚 Historial de Actas
                        </button>
                    </div>
                </div>

                {/* Si la Asamblea está CERRADA, mostramos el Dashboard Consolidado ResumenAsamblea */}
                {asambleaCerrada ? (
                    <ResumenAsamblea votosPropietario={votosPorTema} />
                ) : (
                    <>
                        {/* Panel de Quórum y Doble Exigencia de Mayoría (Art. 2060 CCyCN) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                                <div>
                                    <h2 className="font-bold text-slate-800 text-base uppercase tracking-wide">
                                        Estado de Quórum y Doble Cómputo Legal (Art. 2060 CCyCN)
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Las decisiones requieren mayoría absoluta tanto en proporción de valor (coeficiente) como en número de unidades funcionales.
                                    </p>
                                </div>
                                <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-bold">
                                    ● QUÓRUM LEGAL ALCANZADO
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                                        <span>1. Mayoría por Coeficiente Fiscal</span>
                                        <span className="text-blue-700 text-sm">{metricasQuorum.coeficienteAlcanzado}% / 100%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-700 h-2.5 rounded-full"
                                            style={{ width: `${metricasQuorum.coeficienteAlcanzado}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1.5">
                                        Supera el 50.01% requerido sobre el valor total del edificio.
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                                        <span>2. Mayoría por Unidades Funcionales (Nominal)</span>
                                        <span className="text-emerald-700 text-sm">
                                            {metricasQuorum.unidadesPresentes} de {metricasQuorum.unidadesTotales} Unidades
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                        <div
                                            className="bg-emerald-600 h-2.5 rounded-full"
                                            style={{
                                                width: `${(metricasQuorum.unidadesPresentes / metricasQuorum.unidadesTotales) * 100}%`,
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1.5">
                                        Equivalente al {(metricasQuorum.unidadesPresentes / metricasQuorum.unidadesTotales) * 100}% de los departamentos del consorcio.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Lista de Puntos del Orden del Día con Progreso Global */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex flex-wrap justify-between items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                                <div>
                                    <h2 className="font-bold text-slate-800 text-lg">Puntos del Orden del Día</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Has completado <strong>{temasVotablesCompletados} de 3</strong> temas sujetos a votación.
                                    </p>
                                </div>
                                <span
                                    className={`font-bold px-3 py-1 rounded-full text-xs border ${
                                        faseAsamblea === 'CUARTO_INTERMEDIO'
                                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    }`}
                                >
                                    {faseAsamblea === 'CUARTO_INTERMEDIO'
                                        ? '⏸️ En Cuarto Intermedio'
                                        : '🟢 Asamblea Abierta (Debate y Voto Simultáneos)'}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {temasOrdenDelDia.map((tema) => {
                                    const yaVotado = Boolean(votosPorTema[tema.id]);

                                    return (
                                        <div
                                            key={tema.id}
                                            className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors gap-4"
                                        >
                                            <div className="space-y-1.5">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-xs font-bold bg-slate-800 text-white px-2.5 py-0.5 rounded">
                                                        {tema.codigo}
                                                    </span>
                                                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                                        {tema.normativa}
                                                    </span>
                                                    {tema.esVotable && (
                                                        <span
                                                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                                                                yaVotado
                                                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                                            }`}
                                                        >
                                                            {yaVotado ? '🟢 Votado' : '🟡 Pendiente de Voto'}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-slate-900 text-base">{tema.titulo}</h3>
                                                <p className="text-xs font-semibold text-slate-600">
                                                    📊 {tema.resumenEstado}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => router.push(`/asamblea/tema/${tema.id}`)}
                                                className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold text-xs shadow transition-colors whitespace-nowrap cursor-pointer"
                                            >
                                                {tema.id === 0 ? 'Elegir Autoridades →' : 'Ingresar a Sala Unificada →'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
