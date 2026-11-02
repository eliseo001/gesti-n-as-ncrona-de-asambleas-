'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LobbyAsamblea() {
    const router = useRouter();

    // Simulador de estado de la asamblea (Abierta / Cerrada) para defensa de tesis
    const [asambleaCerrada, setAsambleaCerrada] = useState(false);

    // Datos mockeados de la Doble Mayoría (Art. 2060 CCyCN: Mayoría de Unidades + Mayoría de Coeficiente)
    // En producción se actualiza vía WebSocket STOMP suscripto a /topic/asamblea/1
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
            coeficienteAFavor: 68.5,
            unidadesAFavor: 14,
            unidadesTotales: 20,
            resumenEstado: 'Postulación activa (Presidente: UF 1A | Firmantes: UF 2B y UF 4B)',
        },
        {
            id: 1,
            codigo: 'Tema 1',
            titulo: 'Aprobación de presupuesto para pintura e impermeabilización de fachada',
            normativa: 'Art. 2060 CCyCN (Doble Mayoría)',
            coeficienteAFavor: 68.5,
            unidadesAFavor: 14,
            unidadesTotales: 20,
            resumenEstado: 'Aprobado provisoriamente por 68.5% del coeficiente, representando a 14 de 20 unidades',
        },
    ]);

    return (
        <div className="min-h-screen bg-slate-100 p-6 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Cabecera Institucional con Controles de Demostración */}
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                            Gobernanza Consorcial Asíncrona • Ley N° 26.994
                        </span>
                        <h1 className="text-2xl font-bold mt-1">Asamblea Extraordinaria - Noviembre 2026</h1>
                        <p className="text-slate-300 text-sm mt-0.5">
                            Consorcio Edificio Las Margaritas • Propietario Acreditado (UF 4B - Coef. 4.15%)
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => router.push('/asamblea/onboarding')}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-2 px-3.5 rounded-lg text-xs border border-slate-600 transition-colors cursor-pointer"
                        >
                            🛡️ Ver Onboarding / KYC
                        </button>
                        <button
                            onClick={() => router.push('/asamblea/historial')}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-2 px-3.5 rounded-lg text-xs border border-slate-600 transition-colors cursor-pointer"
                        >
                            📚 Historial de Actas
                        </button>
                        <button
                            onClick={() => setAsambleaCerrada(!asambleaCerrada)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-4 rounded-lg shadow text-xs transition-colors cursor-pointer"
                        >
                            {asambleaCerrada ? '🔓 Reabrir Asamblea' : '⏱️ Simular Cierre por Tiempo'}
                        </button>
                    </div>
                </div>

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
                        {/* Métrica 1: Coeficiente de Copropiedad */}
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

                        {/* Métrica 2: Cantidad de Unidades Funcionales */}
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

                {/* Renderizado Condicional según estado de la Asamblea */}
                {!asambleaCerrada ? (
                    /* --- VISTA 1: ASAMBLEA ABIERTA (Orden del Día y Cómputo Parcial) --- */
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                            <h2 className="font-bold text-slate-800 text-lg">Puntos del Orden del Día</h2>
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs border border-emerald-300">
                                🟢 Ventana de Sufragio Abierta
                            </span>
                        </div>

                        <div className="space-y-4">
                            {temasOrdenDelDia.map((tema) => (
                                <div
                                    key={tema.id}
                                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors gap-4"
                                >
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold bg-slate-800 text-white px-2.5 py-0.5 rounded">
                                                {tema.codigo}
                                            </span>
                                            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                                {tema.normativa}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-base">{tema.titulo}</h3>
                                        <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md inline-block">
                                            📊 Cómputo actual: {tema.resumenEstado}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => router.push(`/asamblea/tema/${tema.id}`)}
                                        className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold text-xs shadow transition-colors whitespace-nowrap"
                                    >
                                        {tema.id === 0 ? 'Elegir Autoridades →' : 'Ingresar a Debatir y Votar →'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* --- VISTA 2: ASAMBLEA CERRADA (Consolidación y Acceso al Acta) --- */
                    <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-slate-300 text-center space-y-6">
                        <div className="text-5xl">⚖️</div>
                        <h2 className="text-2xl font-bold text-slate-800">Ventana de Votación Concluida</h2>
                        <p className="text-slate-600 max-w-xl mx-auto text-sm leading-relaxed">
                            El plazo legal de la asamblea asíncrona ha finalizado. Los sufragios han sido verificados bajo el principio de <strong>Doble Mayoría (Art. 2060 CCyCN)</strong> y el libro de actas digital se encuentra sellado criptográficamente (SHA-256).
                        </p>

                        <div className="bg-slate-50 max-w-lg mx-auto p-4 rounded-lg border border-slate-200 text-xs text-slate-700 font-semibold">
                            Resultado consolidado: Aprobado por <strong>68.5% del coeficiente</strong>, representando a <strong>14 de 20 unidades funcionales</strong>.
                        </div>

                        <button
                            onClick={() => router.push('/asamblea/acta')}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-3.5 px-8 rounded-xl shadow-md transition-all"
                        >
                            📄 Visualizar y Firmar Acta Digital Oficial
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
