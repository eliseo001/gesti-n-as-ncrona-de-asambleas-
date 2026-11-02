'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RecuperarCredencialesPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [enviado, setEnviado] = useState(false);
    const [cargando, setCargando] = useState(false);

    const manejarEnvioRecuperacion = (evento) => {
        evento.preventDefault();
        if (!email) return;

        setCargando(true);

        // INTEGRACIÓN BACKEND (Spring Boot):
        // POST /api/auth/recuperar-password
        // Body: { email }
        // Genera un token criptográfico de un solo uso con expiración de 15 minutos
        // para garantizar que ningún copropietario pierda su derecho a voto antes del cierre de la asamblea.
        setTimeout(() => {
            setCargando(false);
            setEnviado(true);
        }, 700);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">

                {/* Cabecera de Seguridad Operativa */}
                <div className="bg-slate-900 text-white p-6 text-center border-b border-slate-800">
                    <div className="text-3xl mb-2">🔐</div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
                        Seguridad Operativa • ConsorcioSync
                    </span>
                    <h1 className="text-xl font-bold mt-1">Recuperación de Acceso Electoral</h1>
                    <p className="text-slate-400 text-xs mt-1">
                        Restablecimiento inmediato para garantizar su participación en asambleas activas
                    </p>
                </div>

                <div className="p-6 md:p-8">
                    {!enviado ? (
                        <form onSubmit={manejarEnvioRecuperacion} className="space-y-5">
                            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-lg text-xs text-blue-900 leading-relaxed">
                                Ingrese el correo electrónico registrado en el Padrón del Consorcio. Recibirá un enlace temporal firmado (válido por 15 minutos) para restablecer su clave.
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                                    Correo Electrónico del Propietario / Apoderado
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="juan@margaritas.com"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow transition-colors text-sm cursor-pointer disabled:bg-slate-400"
                            >
                                {cargando ? 'Generando token de seguridad...' : 'Enviar Enlace Temporal de Recuperación'}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-5 text-center">
                            <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-5 rounded-xl space-y-2">
                                <div className="text-3xl">📨</div>
                                <h2 className="font-bold text-base">Enlace de Recuperación Enviado</h2>
                                <p className="text-xs text-emerald-800 leading-relaxed">
                                    Hemos enviado un enlace de acceso único a <strong>{email}</strong>. Por razones de auditoría electoral, el enlace expirará en <strong>15 minutos</strong>.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setEnviado(false);
                                    setEmail('');
                                }}
                                className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold"
                            >
                                ¿No recibió el correo? Reintentar envío
                            </button>
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-slate-200 text-center">
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="text-xs font-bold text-blue-700 hover:underline"
                        >
                            ← Volver al Inicio de Sesión
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

