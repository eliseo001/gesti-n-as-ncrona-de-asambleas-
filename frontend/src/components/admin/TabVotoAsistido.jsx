'use client';
import { useState } from 'react';

export default function TabVotoAsistido() {
    const [votoPapel, setVotoPapel] = useState({ unidad: '1A', valor: 'A_FAVOR', archivo: null });

    const registrarVotoHibrido = (e) => {
        e.preventDefault();
        if (!votoPapel.archivo) {
            alert("Es obligatorio subir la FOTO del voto firmado en papel para auditar este bloque.");
            return;
        }
        alert(`✅ Voto presencial de la UF ${votoPapel.unidad} cargado con éxito en la cadena criptográfica (Evidencia adjunta).`);
        setVotoPapel({ ...votoPapel, archivo: null }); // Reset
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-800">Inclusión Digital: Voto Asistido (Híbrido)</h2>
                <p className="text-sm text-slate-600 mt-1">Digitalización de votos emitidos en papel por copropietarios con brecha digital o sin acceso a la plataforma.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
                <form onSubmit={registrarVotoHibrido} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Unidad Funcional (Propietario Físico)</label>
                            <select
                                value={votoPapel.unidad}
                                onChange={e => setVotoPapel({ ...votoPapel, unidad: e.target.value })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                            >
                                <option value="1A">UF 1A - Don Roberto (Sin conectividad)</option>
                                <option value="8C">UF 8C - Sra. Marta</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Sentido del Voto Expresado</label>
                            <select
                                value={votoPapel.valor}
                                onChange={e => setVotoPapel({ ...votoPapel, valor: e.target.value })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                            >
                                <option value="A_FAVOR">👍 A FAVOR</option>
                                <option value="EN_CONTRA">👎 EN CONTRA</option>
                                <option value="ABSTENCION">✋ ABSTENCIÓN</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 flex flex-col">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                Evidencia Documental (Obligatorio)
                            </label>
                            <p className="text-[11px] text-slate-500 mb-2">Adjunte foto clara del formulario en papel firmado de puño y letra por el vecino.</p>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={e => setVotoPapel({ ...votoPapel, archivo: e.target.files[0] })}
                                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-800 file:text-white"
                                required
                            />
                        </div>

                        <button type="submit" className="mt-auto w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg shadow">
                            Sellar Voto Asistido en la Cadena SHA-256
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}