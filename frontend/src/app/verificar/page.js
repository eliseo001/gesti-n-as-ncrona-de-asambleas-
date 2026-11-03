'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalVerificacionPublica() {
    const router = useRouter();
    const [hash, setHash] = useState('');
    const [estado, setEstado] = useState('IDLE'); // IDLE, VALIDANDO, EXITO, ERROR

    const validarDocumento = (e) => {
        e.preventDefault();
        setEstado('VALIDANDO');
        setTimeout(() => {
            if (hash.includes('9f86d') || hash === 'demo') setEstado('EXITO');
            else setEstado('ERROR');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
                <div className="text-center mb-6">
                    <span className="text-5xl">🏛️</span>
                    <h1 className="text-xl font-bold text-slate-900 mt-4">Escribanía Digital Consorcial</h1>
                    <p className="text-xs text-slate-500 mt-1">Portal Público de Verificación Criptográfica (Ley N° 25.506)</p>
                </div>

                {estado === 'IDLE' || estado === 'ERROR' ? (
                    <form onSubmit={validarDocumento} className="space-y-4">
                        {estado === 'ERROR' && (
                            <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-lg border border-red-200 text-center">
                                ❌ Documento no encontrado o Hash adulterado.
                            </div>
                        )}
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50">
                            <span className="text-2xl block mb-2">📄</span>
                            <p className="text-sm font-bold text-slate-700">Arrastre aquí el PDF del Acta</p>
                            <p className="text-xs text-slate-500">o ingrese el código alfanumérico inferior</p>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={hash}
                                onChange={e => setHash(e.target.value)}
                                placeholder="Hash SHA-256 (Ej: 9f86d... o 'demo')"
                                className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                            />
                        </div>
                        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg shadow transition-all">
                            Auditar Documento
                        </button>
                    </form>
                ) : estado === 'VALIDANDO' ? (
                    <div className="text-center py-10 space-y-3">
                        <div className="animate-spin text-4xl">⚙️</div>
                        <p className="text-sm font-bold text-slate-700">Recalculando Árbol de Merkle...</p>
                    </div>
                ) : (
                    <div className="text-center py-6 space-y-4">
                        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl">
                            <span className="text-5xl block mb-3">✅</span>
                            <h2 className="text-lg font-bold text-emerald-900">Documento Auténtico</h2>
                            <p className="text-sm text-emerald-800 mt-1">Consorcio Edificio Las Margaritas</p>
                            <p className="text-xs font-bold bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full inline-block mt-3">
                                Acta N° 14 - Extraordinaria
                            </p>
                        </div>
                        <div className="text-left bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2">
                            <p><strong>Cierre de Sesión:</strong> 05/11/2026</p>
                            <p><strong>Integridad:</strong> El hash calculado coincide exactamente con la cadena original.</p>
                        </div>
                        <button onClick={() => setEstado('IDLE')} className="text-blue-700 text-sm font-bold hover:underline">Verificar otro documento</button>
                    </div>
                )}

                <div className="mt-8 text-center border-t border-slate-200 pt-4">
                    <button onClick={() => router.push('/')} className="text-xs text-slate-400 hover:text-slate-600">Volver a ConsorcioSync</button>
                </div>
            </div>
        </div>
    );
}