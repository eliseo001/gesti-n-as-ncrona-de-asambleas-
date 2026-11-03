'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificacionAusentesPage() {
    const router = useRouter();
    const [estado, setEstado] = useState('PENDIENTE'); // PENDIENTE, CONOCIMIENTO, OPOSICION
    const [motivoOposicion, setMotivoOposicion] = useState('');

    const registrarOposicion = (e) => {
        e.preventDefault();
        if (!motivoOposicion) return;
        setEstado('OPOSICION');
        alert('Oposición legal registrada y sellada en la cadena. Se sumará al cómputo final en 12 días.');
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6 font-sans">
            <div className="max-w-3xl mx-auto space-y-6">

                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md border border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/20 border border-amber-400/40 px-2 py-1 rounded">
                        Art. 2060 CCyCN • Notificación Fehaciente
                    </span>
                    <h1 className="text-2xl font-bold mt-3">Propuesta de Decisiones a Propietarios Ausentes</h1>
                    <p className="text-slate-300 text-sm mt-1">
                        La asamblea no alcanzó la mayoría absoluta del consorcio. La mayoría de los presentes ha elevado la siguiente propuesta.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="font-bold text-slate-800 text-lg mb-4 border-b border-slate-200 pb-2">Resolución Propuesta: Tema 1</h2>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 mb-6">
                        <p><strong>Aprobación de presupuesto para pintura e impermeabilización por $450.000.</strong></p>
                        <p className="mt-2 text-xs text-slate-500">Votación de presentes: 42% A Favor (No alcanzó el 51% requerido).</p>
                    </div>

                    {estado === 'PENDIENTE' ? (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                <p className="text-xs font-bold text-amber-900">⚠️ Plazo Legal de Oposición: 12 Días Restantes</p>
                                <p className="text-xs text-amber-800 mt-1">Su silencio al vencimiento del plazo implicará la aprobación tácita de la propuesta (Art. 2060).</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setEstado('CONOCIMIENTO')}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg shadow-sm text-sm"
                                >
                                    ✅ Tomar Conocimiento (Aprobación Tácita)
                                </button>

                                <form onSubmit={registrarOposicion} className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                                    <label className="block text-xs font-bold text-red-700">Fundamento de Oposición Legal (Rechazo):</label>
                                    <textarea
                                        required
                                        value={motivoOposicion}
                                        onChange={(e) => setMotivoOposicion(e.target.value)}
                                        placeholder="Escriba aquí los motivos legales o técnicos de su rechazo a la propuesta..."
                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:border-red-500"
                                        rows="3"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-lg shadow-sm text-sm"
                                    >
                                        ⚖️ Oponerse Legalmente a la Decisión
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : estado === 'OPOSICION' ? (
                        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center">
                            <span className="text-4xl">🛑</span>
                            <h3 className="font-bold text-red-900 text-lg mt-2">Oposición Registrada</h3>
                            <p className="text-sm text-red-800 mt-1">Su rechazo ha sido incorporado al cómputo oficial de ausentes.</p>
                            <button onClick={() => router.push('/asamblea')} className="mt-4 text-blue-700 font-bold text-sm hover:underline">← Volver al Lobby</button>
                        </div>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center">
                            <span className="text-4xl">✅</span>
                            <h3 className="font-bold text-emerald-900 text-lg mt-2">Conformidad Registrada</h3>
                            <p className="text-sm text-emerald-800 mt-1">Se ha tomado conocimiento de la propuesta sin presentar oposición.</p>
                            <button onClick={() => router.push('/asamblea')} className="mt-4 text-blue-700 font-bold text-sm hover:underline">← Volver al Lobby</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}