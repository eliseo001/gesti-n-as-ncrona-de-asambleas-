'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function PanelSufragio({ faseActual = 'ABIERTA' }) {
    const router = useRouter();
    const { usuario } = useAuth();
    const esAdministrador = usuario?.rol === 'ADMINISTRADOR';

    // Estados del sufragio (solo aplican para el perfil PROPIETARIO)
    const [votoEmitido, setVotoEmitido] = useState(null); // null | 'A_FAVOR' | 'EN_CONTRA' | 'ABSTENCION'
    const [intentosRestantes, setIntentosRestantes] = useState(2);

    // Estados del Modal de Seguridad para Rectificar Voto
    const [mostrarModal, setMostrarModal] = useState(false);
    const [passwordTemp, setPasswordTemp] = useState('');

    const coeficienteUsuario = usuario?.coeficiente ? Number(usuario.coeficiente).toFixed(2) : '5.20';
    const unidadUsuario = usuario?.unidad || 'UF 4B + Cochera 12';

    const emitirSufragio = (valorVoto) => {
        if (esAdministrador || faseActual !== 'ABIERTA') return;
        setVotoEmitido(valorVoto);
        setMostrarModal(false);
        setPasswordTemp('');
    };

    const solicitarRectificacion = () => {
        if (faseActual !== 'ABIERTA') return;
        if (intentosRestantes <= 0) {
            alert('Ha agotado el límite reglamentario de rectificaciones para este punto del Orden del Día.');
            return;
        }
        setMostrarModal(true);
    };

    const confirmarPasswordParaRectificar = (e) => {
        e.preventDefault();
        if (passwordTemp === 'tesis2026' || passwordTemp === 'password123') {
            setVotoEmitido(null);
            setIntentosRestantes(intentosRestantes - 1);
            setMostrarModal(false);
            setPasswordTemp('');
        } else {
            alert('Contraseña incorrecta. Ingrese "password123" o "tesis2026" para confirmar su identidad.');
        }
    };

    // =========================================================================
    // VISTA 1: ROL ADMINISTRADOR -> MONITOR DE URNA EN TIEMPO REAL (NO VOTA)
    // =========================================================================
    if (esAdministrador) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-[580px]">
                <div className="space-y-5">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                                Fiscalización Sin Derecho a Voto • Art. 2060 CCyCN
                            </span>
                            <h2 className="text-xl font-bold text-slate-800 mt-1.5">
                                Monitor de Urna en Tiempo Real
                            </h2>
                            <p className="text-xs text-slate-500">
                                El Administrador gestiona y audita la sesión, pero no emite sufragios por el consorcio.
                            </p>
                        </div>
                        <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                faseActual === 'ABIERTA'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : faseActual === 'CUARTO_INTERMEDIO'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-slate-200 text-slate-700 border-slate-300'
                            }`}
                        >
                            {faseActual === 'ABIERTA'
                                ? '🟢 Urna Abierta'
                                : faseActual === 'CUARTO_INTERMEDIO'
                                ? '⏸️ Urna en Pausa'
                                : '🔒 Urna Cerrada'}
                        </span>
                    </div>

                    {/* Métricas de Doble Mayoría en Vivo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                            <span className="text-[11px] font-bold uppercase text-slate-500 block">
                                Participación por Coeficiente
                            </span>
                            <span className="text-2xl font-extrabold text-blue-700">68.50%</span>
                            <div className="w-full bg-slate-200 h-2 rounded-full mt-2">
                                <div className="bg-blue-700 h-2 rounded-full" style={{ width: '68.5%' }}></div>
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                                Mínimo mayoría absoluta: &gt; 50.00%
                            </span>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                            <span className="text-[11px] font-bold uppercase text-slate-500 block">
                                Unidades que Sufragaron
                            </span>
                            <span className="text-2xl font-extrabold text-emerald-700">14 / 20 UF</span>
                            <div className="w-full bg-slate-200 h-2 rounded-full mt-2">
                                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                                Pendientes / Ausentes: 6 Unidades
                            </span>
                        </div>
                    </div>

                    {/* Desglose de Cadena de Bloques */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-slate-700">
                            Últimos Bloques Sellados en la Cadena (SHA-256)
                        </h3>
                        <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] space-y-2">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                                <span className="text-blue-400 font-bold">Bloque #14 (UF 4B + C12)</span>
                                <span className="text-slate-400">Coef: 5.20%</span>
                                <span className="text-emerald-400">9f86d081884c...</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                                <span className="text-blue-400 font-bold">Bloque #13 (UF 2B)</span>
                                <span className="text-slate-400">Coef: 6.25%</span>
                                <span className="text-emerald-400">8c4e2b1a9f07...</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-blue-400 font-bold">Bloque #12 (UF 1A)</span>
                                <span className="text-slate-400">Coef: 4.15%</span>
                                <span className="text-emerald-400">a377b9c21e4d...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between mt-auto">
                    <div className="text-xs text-slate-600">
                        <span className="font-bold text-slate-800 block">Control de Contingencias</span>
                        Gestione el Cuarto Intermedio o el cierre desde el Panel de Control.
                    </div>
                    <button
                        type="button"
                        onClick={() => router.push('/admin')}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow cursor-pointer whitespace-nowrap"
                    >
                        ⚙️ Ir al Panel Admin
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================================
    // VISTA 2: ROL PROPIETARIO -> URNA CRIPTOGRÁFICA CONCURRENTE CON EL FORO
    // =========================================================================
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[580px] relative">

            {/* Modal de Seguridad para Rectificación de Voto */}
            {mostrarModal && (
                <div className="absolute inset-0 z-10 bg-slate-900/60 rounded-xl flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full border border-slate-300">
                        <h3 className="font-bold text-lg text-slate-800 mb-2">Rectificación de Voto</h3>
                        <p className="text-xs text-slate-600 mb-4">
                            Para emitir un bloque rectificativo en la cadena SHA-256, confirme su contraseña de propietario (use <strong>password123</strong> o <strong>tesis2026</strong>).
                        </p>
                        <form onSubmit={confirmarPasswordParaRectificar}>
                            <input
                                type="password"
                                required
                                value={passwordTemp}
                                onChange={(e) => setPasswordTemp(e.target.value)}
                                placeholder="••••••••"
                                className="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModal(false)}
                                    className="w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 rounded-lg text-xs cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="w-1/2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-lg text-xs shadow cursor-pointer"
                                >
                                    Verificar y Habilitar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cabecera de Urna del Propietario */}
            <div className="border-b border-slate-200 pb-3 mb-4 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Urna Criptográfica SHA-256</h2>
                    <p className="text-xs text-slate-500">
                        Titular: <strong>{usuario?.nombre}</strong> • Peso Electoral: <strong>{coeficienteUsuario}%</strong> ({unidadUsuario})
                    </p>
                </div>
                <span
                    className={`text-xs font-mono px-2.5 py-1 rounded font-bold border ${
                        faseActual === 'ABIERTA'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : faseActual === 'CUARTO_INTERMEDIO'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                >
                    {faseActual === 'ABIERTA' ? '🟢 Abierta' : faseActual === 'CUARTO_INTERMEDIO' ? '⏸️ Pausa' : '🔒 Cerrada'}
                </span>
            </div>

            {/* Renderizado según Fase: ABIERTA | CUARTO_INTERMEDIO | CERRADA */}
            {faseActual === 'CUARTO_INTERMEDIO' ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-amber-50/50 border-2 border-dashed border-amber-300 rounded-xl">
                    <div className="text-5xl mb-4">⏸️</div>
                    <h3 className="font-bold text-amber-950 text-lg">Asamblea en Cuarto Intermedio</h3>
                    <p className="text-xs text-amber-800 mt-2 max-w-sm leading-relaxed">
                        Tanto el debate como la recepción de votos han sido pausados temporalmente por la Administración. Se reanudarán al levantarse el cuarto intermedio.
                    </p>
                </div>
            ) : faseActual === 'CERRADA' ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-4">
                    <div className="text-5xl">🔒</div>
                    <h3 className="font-bold text-slate-800 text-lg">Urna Cerrada Definitivamente</h3>
                    <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                        La ventana temporal de sufragio ha concluido y la cadena de bloques SHA-256 ha sido sellada en el Acta Digital.
                    </p>
                    {votoEmitido && (
                        <div className="bg-emerald-50 border border-emerald-300 px-4 py-2 rounded-lg text-xs text-emerald-900 font-bold">
                            Su último voto computado: {votoEmitido.replace('_', ' ')} ({coeficienteUsuario}%)
                        </div>
                    )}
                    <button
                        onClick={() => router.push('/asamblea/acta')}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow cursor-pointer"
                    >
                        📄 Ver Acta Digital Consolidada
                    </button>
                </div>
            ) : !votoEmitido ? (
                /* FASE ABIERTA - AÚN NO VOTÓ: Puede debatir en el foro y votar en cualquier momento */
                <div className="flex-grow flex flex-col justify-between">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 space-y-1">
                        <p className="font-bold">⚖️ Deliberación y Voto Simultáneos (Art. 2060 CCyCN):</p>
                        <p>
                            Puede emitir su sufragio en cualquier momento de la ventana activa. Su voto computa <strong>{unidadUsuario}</strong> y pondera <strong>{coeficienteUsuario}%</strong> sobre el total del consorcio.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 mt-auto">
                        <p className="text-xs font-bold text-center text-slate-700 uppercase tracking-wider mb-1">
                            Emitir Sufragio Criptográfico
                        </p>
                        <button
                            onClick={() => emitirSufragio('A_FAVOR')}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-lg shadow-sm transition-all text-sm cursor-pointer"
                        >
                            👍 Votar a Favor ({coeficienteUsuario}%)
                        </button>
                        <button
                            onClick={() => emitirSufragio('EN_CONTRA')}
                            className="bg-red-700 hover:bg-red-800 text-white font-bold py-4 rounded-lg shadow-sm transition-all text-sm cursor-pointer"
                        >
                            👎 Votar en Contra ({coeficienteUsuario}%)
                        </button>
                        <button
                            onClick={() => emitirSufragio('ABSTENCION')}
                            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-4 rounded-lg shadow-sm transition-all text-sm cursor-pointer"
                        >
                            ✋ Abstención ({coeficienteUsuario}%)
                        </button>
                    </div>
                </div>
            ) : (
                /* FASE ABIERTA - YA VOTÓ: Puede seguir debatiendo en el foro o rectificar su voto */
                <div className="flex-grow flex flex-col space-y-4 justify-between">
                    <div className="bg-emerald-50 border-2 border-emerald-400 p-5 rounded-xl text-center">
                        <span className="text-3xl block mb-1">✅</span>
                        <h3 className="font-bold text-emerald-900 text-base">
                            Voto Registrado: {votoEmitido.replace('_', ' ')}
                        </h3>
                        <p className="text-xs text-emerald-800 mt-1">
                            Ponderación aplicada: {coeficienteUsuario}% ({unidadUsuario})
                        </p>
                        <p className="text-[11px] text-emerald-700 mt-1.5 font-mono">
                            Hash SHA-256: 9f86d081884c7d659a2feaa0c55ad015...
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-900 flex items-center gap-2.5">
                        <span className="text-lg">💬</span>
                        <span>
                            <strong>El Foro sigue habilitado:</strong> Puede continuar participando en el debate mientras la ventana de la asamblea permanezca abierta.
                        </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center mt-auto">
                        <p className="text-xs text-slate-600 mb-2.5 font-semibold">
                            ¿Un argumento del debate cambió su postura?
                        </p>
                        <button
                            onClick={solicitarRectificacion}
                            disabled={intentosRestantes === 0}
                            className={`w-full py-3 rounded-lg font-bold text-xs transition-colors ${
                                intentosRestantes > 0
                                    ? 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
                                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            🔄 Rectificar Voto (Le quedan {intentosRestantes} intentos)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
