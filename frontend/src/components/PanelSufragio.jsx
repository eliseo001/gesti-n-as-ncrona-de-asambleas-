'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PanelSufragio({ idTema = 1 }) {
    const router = useRouter();

    // Simulador interactivo para la defensa de tesis: permite alternar entre vecino Al Día y Moroso
    const [esMoroso, setEsMoroso] = useState(true);
    const [votoEmitido, setVotoEmitido] = useState(null);

    // Unidades consolidadas del propietario actual (Depto 4B + Cochera 12 = 5.20%)
    const unidadesPropietario = [
        { codigo: 'Depto 4B', coeficiente: 4.15 },
        { codigo: 'Cochera 12', coeficiente: 1.05 },
    ];
    const coeficienteTotal = unidadesPropietario.reduce((acc, u) => acc + u.coeficiente, 0).toFixed(2);

    const emitirSufragio = (valorVoto) => {
        if (esMoroso) return;

        setVotoEmitido(valorVoto);

        // INTEGRACIÓN BACKEND (Spring Boot):
        // POST /api/votos
        // Body: { idTema: Number(idTema), valorVoto: valorVoto }
        // VotoService valida en base de datos que el usuario no registre morosidad,
        // suma el coeficiente de todas sus unidades asociadas (5.20%), genera el hash SHA-256
        // encadenado al voto anterior y publica el evento en /topic/asamblea/1.
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col justify-between h-full">
            <div>
                {/* Cabecera del Panel con Toggle Demostrativo para el Tribunal */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Panel de Sufragio Criptográfico</h2>
                        <p className="text-xs text-slate-500">Sellado inmutable SHA-256 • Art. 2060 CCyCN</p>
                    </div>

                    {/* Botón simulador para alternar el Caso Borde en vivo durante la defensa */}
                    <button
                        type="button"
                        onClick={() => {
                            setEsMoroso(!esMoroso);
                            setVotoEmitido(null);
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                            esMoroso
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
                        }`}
                    >
                        {esMoroso ? '🔄 Simular: Poner Expensas al Día' : '🔄 Simular: Marcar como Moroso'}
                    </button>
                </div>

                {/* Desglose de Ponderación Multi-Unidad */}
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg mb-4 text-xs text-slate-700 space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                        <span>⚖️ Poder de Voto Consolidado (Multi-Unidad):</span>
                        <span className="text-blue-700">{coeficienteTotal}% Total</span>
                    </div>
                    <p className="text-slate-500">
                        Unidades representadas: Depto 4B (4.15%) + Cochera 12 (1.05%) • Computa como 1 Titular en Doble Mayoría.
                    </p>
                </div>

                {/* Alerta Roja de Restricción por Morosidad (Caso Borde Reglamentario) */}
                {esMoroso ? (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 space-y-2 mb-4">
                        <div className="flex items-start gap-2.5">
                            <span className="text-xl">🚫</span>
                            <div>
                                <h3 className="text-sm font-bold text-red-900">
                                    Su derecho a voto se encuentra suspendido por registrar deuda de expensas (Reglamento de Copropiedad)
                                </h3>
                                <p className="text-xs text-red-800 mt-1 leading-relaxed">
                                    Conforme al Reglamento de Propiedad Horizontal vigente, la mora en el pago de expensas comunes inhabilita temporalmente el ejercicio del sufragio.
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/80 border border-red-200 rounded-lg p-2.5 text-xs text-slate-700 flex items-center gap-2">
                            <span>🗣️</span>
                            <span>
                                <strong>Derecho a Voz Garantizado:</strong> Usted conserva plena facultad para participar, opinar y dejar constancia de su postura en el <strong>Foro de Debate</strong> contiguo.
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                        <p className="text-xs text-blue-900 font-semibold">
                            ✓ Estado Administrativo: <strong>Expensas al Día</strong>. Su voto será encriptado y encadenado al libro mayor de la asamblea.
                        </p>
                    </div>
                )}
            </div>

            {/* Botonera de Votación (Deshabilitada si esMoroso === true) */}
            {!votoEmitido ? (
                <div className="flex flex-col gap-3 mt-auto">
                    <button
                        type="button"
                        disabled={esMoroso}
                        onClick={() => emitirSufragio('A_FAVOR')}
                        className={`font-bold py-3.5 rounded-lg shadow-sm transition-all text-sm ${
                            esMoroso
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                                : 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                        }`}
                    >
                        👍 Votar a Favor ({coeficienteTotal}%)
                    </button>

                    <button
                        type="button"
                        disabled={esMoroso}
                        onClick={() => emitirSufragio('EN_CONTRA')}
                        className={`font-bold py-3.5 rounded-lg shadow-sm transition-all text-sm ${
                            esMoroso
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                                : 'bg-red-700 hover:bg-red-800 text-white cursor-pointer'
                        }`}
                    >
                        👎 Votar en Contra ({coeficienteTotal}%)
                    </button>

                    <button
                        type="button"
                        disabled={esMoroso}
                        onClick={() => emitirSufragio('ABSTENCION')}
                        className={`font-bold py-3.5 rounded-lg shadow-sm transition-all text-sm ${
                            esMoroso
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                                : 'bg-slate-600 hover:bg-slate-700 text-white cursor-pointer'
                        }`}
                    >
                        ✋ Abstención ({coeficienteTotal}%)
                    </button>
                </div>
            ) : (
                <div className="space-y-3 mt-auto">
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs space-y-1">
                        <p className="font-bold text-sm">✓ Voto Registrado ({votoEmitido})</p>
                        <p>Ponderación aplicada: {coeficienteTotal}% (Depto 4B + Cochera 12).</p>
                        <p className="font-mono text-[11px] text-emerald-700 pt-1">
                            Hash SHA-256: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b...
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.push('/asamblea')}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs"
                    >
                        ← Volver al Lobby de la Asamblea
                    </button>
                </div>
            )}
        </div>
    );
}

