'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function TabContingencias() {
    const router = useRouter();
    const { faseAsamblea, actualizarFaseAsamblea } = useAuth();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-4 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        Control de Estado de Asamblea y Contingencias
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Gestión exclusiva del Administrador: Apertura Concurrente (Debate + Sufragio), Cuarto Intermedio y Cierre.
                    </p>
                </div>

                <button
                    onClick={() => router.push('/asamblea/tema/1')}
                    className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow cursor-pointer whitespace-nowrap"
                >
                    🔍 Ir a Sala del Tema 1 (Monitor de Urna) →
                </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-amber-900 text-sm">
                        Asamblea Extraordinaria - Noviembre 2026
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5">
                        Estado global sincronizado:{' '}
                        <strong className="uppercase bg-amber-200/70 px-2 py-0.5 rounded">
                            {faseAsamblea}
                        </strong>
                    </p>
                </div>
                <span className="text-2xl">⚙️</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Estado 1: ABIERTA */}
                <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm flex flex-col h-full">
                    <h4 className="font-bold text-emerald-900 mb-2 text-sm">🟢 1. Asamblea ABIERTA</h4>
                    <p className="text-xs text-slate-500 mb-4 flex-grow">
                        Habilita simultáneamente el Foro de Debate y la Urna Criptográfica durante toda la ventana temporal.
                    </p>
                    <button
                        onClick={() => {
                            actualizarFaseAsamblea('ABIERTA');
                            alert('Estado actualizado a ABIERTA (Debate y Sufragio simultáneos habilitados).');
                        }}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer"
                    >
                        Activar Estado ABIERTA
                    </button>
                </div>

                {/* Estado 2: CUARTO_INTERMEDIO */}
                <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex flex-col h-full">
                    <h4 className="font-bold text-amber-900 mb-2 text-sm">⏸️ 2. Cuarto Intermedio</h4>
                    <p className="text-xs text-slate-500 mb-4 flex-grow">
                        Pausa temporalmente tanto el foro como la recepción de votos hasta la fecha de reanudación pactada.
                    </p>
                    <button
                        onClick={() => {
                            const nuevaFase =
                                faseAsamblea === 'CUARTO_INTERMEDIO' ? 'ABIERTA' : 'CUARTO_INTERMEDIO';
                            actualizarFaseAsamblea(nuevaFase);
                            alert(
                                nuevaFase === 'CUARTO_INTERMEDIO'
                                    ? 'Asamblea en Cuarto Intermedio. Foro y Urna pausados.'
                                    : 'Asamblea reanudada en estado ABIERTA.'
                            );
                        }}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer"
                    >
                        {faseAsamblea === 'CUARTO_INTERMEDIO' ? '▶️ Reanudar Asamblea' : '⏸️ Declarar Cuarto Intermedio'}
                    </button>
                </div>

                {/* Estado 3: CERRADA */}
                <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex flex-col h-full">
                    <h4 className="font-bold text-red-900 mb-2 text-sm">🔒 3. Asamblea CERRADA</h4>
                    <p className="text-xs text-slate-500 mb-4 flex-grow">
                        Concluye la ventana temporal, pasa el foro y la urna a modo de solo lectura y consolida el Acta Digital.
                    </p>
                    <button
                        onClick={() => {
                            actualizarFaseAsamblea('CERRADA');
                            alert('Asamblea CERRADA oficialmente. Modo solo lectura activado y Acta Digital disponible.');
                        }}
                        className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer"
                    >
                        Cerrar Asamblea y Emitir Acta
                    </button>
                </div>
            </div>
        </div>
    );
}
