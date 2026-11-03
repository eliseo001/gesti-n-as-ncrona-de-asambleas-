'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PropuestasPropietario() {
    const router = useRouter();

    // Estado simulado de propuestas vecinales
    const [propuestas, setPropuestas] = useState([
        { id: 1, autor: 'Juan (UF 1A)', titulo: 'Regulación de ruidos molestos post 22hs', apoyo: 45.5, estado: 'EN_RECOLECCION' },
        { id: 2, autor: 'María (UF 2B)', titulo: 'Cambio de empresa de limpieza', apoyo: 68.0, estado: 'QUORUM_ALCANZADO' }
    ]);
    const [nuevaPropuesta, setNuevaPropuesta] = useState('');

    const manejarEnvio = (e) => {
        e.preventDefault();
        if (!nuevaPropuesta) return;
        setPropuestas([...propuestas, { id: Date.now(), autor: 'Tú (UF 4B)', titulo: nuevaPropuesta, apoyo: 4.15, estado: 'EN_RECOLECCION' }]);
        setNuevaPropuesta('');
        alert('Propuesta enviada. Los demás vecinos podrán adherir para alcanzar los 2/3 requeridos.');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">

                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <button onClick={() => router.push('/asamblea')} className="text-blue-700 font-bold hover:underline text-sm">
                        ← Volver al Lobby
                    </button>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Art. 2059 CCyCN • Autoconvocatoria</span>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md">
                    <h1 className="text-2xl font-bold">Iniciativas Vecinales y Autoconvocatoria</h1>
                    <p className="text-slate-300 text-sm mt-1">Proponga temas. Al alcanzar el 66.6% (Dos tercios) de apoyo, la administración está obligada a convocar asamblea.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="font-bold text-slate-800 mb-4">Elevar Nueva Propuesta</h2>
                    <form onSubmit={manejarEnvio} className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Ej: Reparación urgente de filtraciones en cochera..."
                            value={nuevaPropuesta}
                            onChange={(e) => setNuevaPropuesta(e.target.value)}
                            className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                        />
                        <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-lg shadow text-sm">
                            Publicar Iniciativa
                        </button>
                    </form>
                </div>

                <div className="space-y-4">
                    <h2 className="font-bold text-slate-800 text-lg">Iniciativas Activas en el Consorcio</h2>
                    {propuestas.map(p => (
                        <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-slate-900">{p.titulo}</h3>
                                    <p className="text-xs text-slate-500">Propuesto por: {p.autor}</p>
                                </div>
                                {p.estado === 'QUORUM_ALCANZADO' ? (
                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">✓ 2/3 Alcanzado (Obliga Asamblea)</span>
                                ) : (
                                    <button className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg">👍 Adherir (+4.15%)</button>
                                )}
                            </div>
                            <div className="mt-3">
                                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                    <span>Apoyo Acumulado</span>
                                    <span className={p.apoyo >= 66.6 ? 'text-emerald-700' : 'text-blue-700'}>{p.apoyo.toFixed(1)}% / 66.6%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div className={`${p.apoyo >= 66.6 ? 'bg-emerald-500' : 'bg-blue-600'} h-2 rounded-full`} style={{ width: `${Math.min(p.apoyo, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}