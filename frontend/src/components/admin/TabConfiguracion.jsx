'use client';
import { useState } from 'react';

export default function TabConfiguracion() {
    const [config, setConfig] = useState({
        diasAntelacion: 8,
        limitePoderes: 2,
        suspenderMorosos: true,
        desempatePresidente: false,
    });

    const guardarConfiguracion = (e) => {
        e.preventDefault();
        alert('⚙️ Reglas de Negocio actualizadas según el Reglamento de Copropiedad del consorcio.');
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-800">Reglas de Negocio del Consorcio</h2>
                <p className="text-sm text-slate-600 mt-1">Parametrización dinámica basada en el Reglamento de Propiedad Horizontal específico de este edificio.</p>
            </div>

            <form onSubmit={guardarConfiguracion} className="bg-slate-50 border border-slate-200 p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Parámetros Numéricos */}
                <div className="space-y-5">
                    <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Parámetros Temporales y Límites</h3>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Días Mínimos de Antelación (Convocatoria)</label>
                        <input
                            type="number"
                            min="1"
                            value={config.diasAntelacion}
                            onChange={(e) => setConfig({ ...config, diasAntelacion: e.target.value })}
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Bloqueará la creación de asambleas si la fecha de inicio es menor a este plazo.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Límite Máximo de Cartas Poder por Persona</label>
                        <input
                            type="number"
                            min="0"
                            value={config.limitePoderes}
                            onChange={(e) => setConfig({ ...config, limitePoderes: e.target.value })}
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Evita la concentración excesiva de votos en un solo apoderado.</p>
                    </div>
                </div>

                {/* Parámetros Lógicos (Toggles) */}
                <div className="space-y-5">
                    <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Reglas de Sufragio y Empates</h3>

                    <label className="flex items-start gap-3 cursor-pointer p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={config.suspenderMorosos}
                            onChange={(e) => setConfig({ ...config, suspenderMorosos: e.target.checked })}
                            className="mt-1 w-4 h-4 text-blue-600 rounded"
                        />
                        <div>
                            <span className="block text-sm font-bold text-slate-800">Suspender Voto a Deudores (Mora)</span>
                            <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">Si se desmarca, los morosos tendrán voz y voto. Requiere aval del reglamento.</span>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={config.desempatePresidente}
                            onChange={(e) => setConfig({ ...config, desempatePresidente: e.target.checked })}
                            className="mt-1 w-4 h-4 text-emerald-600 rounded"
                        />
                        <div>
                            <span className="block text-sm font-bold text-slate-800">Voto Doble para Desempate (Presidente)</span>
                            <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">En caso de empate exacto, el voto del Presidente de la Asamblea (Tema 0) valdrá doble.</span>
                        </div>
                    </label>
                </div>

                <div className="md:col-span-2 flex justify-end mt-4 pt-4 border-t border-slate-200">
                    <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-lg shadow text-sm">
                        💾 Guardar Configuración del Consorcio
                    </button>
                </div>
            </form>
        </div>
    );
}