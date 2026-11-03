'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const RUTAS_SIN_NAVBAR = ['/', '/recuperar', '/no-autorizado', '/verificar'];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const {
        usuario,
        cerrarSesion,
        tabAdminActiva,
        setTabAdminActiva,
    } = useAuth();

    // No renderizar el Navbar en rutas públicas o cuando no hay sesión activa
    if (!usuario || RUTAS_SIN_NAVBAR.includes(pathname)) {
        return null;
    }

    const esAdmin = usuario.rol === 'ADMINISTRADOR';

    const navegarTabAdmin = (tabId) => {
        setTabAdminActiva(tabId);
        if (pathname !== '/admin') {
            router.push('/admin');
        }
    };

    return (
        <nav className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between min-h-[64px] py-2 gap-4">

                    {/* Marca y Enlaces de Navegación por Rol */}
                    <div className="flex flex-wrap items-center gap-6">
                        <button
                            onClick={() => router.push(esAdmin ? '/admin' : '/asamblea')}
                            className="flex items-center gap-2.5 text-left cursor-pointer group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-extrabold text-sm shadow">
                                CS
                            </div>
                            <div>
                                <span className="font-bold text-base tracking-tight text-white group-hover:text-blue-300 transition-colors block leading-none">
                                    ConsorcioSync
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                                    Ley N° 26.994
                                </span>
                            </div>
                        </button>

                        {/* Menú Dinámico según Rol del Contexto */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            {esAdmin ? (
                                <>
                                    <button
                                        onClick={() => navegarTabAdmin('kyc')}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                            pathname === '/admin' &&
                                            tabAdminActiva !== 'configuracion' &&
                                            tabAdminActiva !== 'trazabilidad'
                                                ? 'bg-blue-700 text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        📊 Panel de Control
                                    </button>
                                    <button
                                        onClick={() => navegarTabAdmin('configuracion')}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                            pathname === '/admin' && tabAdminActiva === 'configuracion'
                                                ? 'bg-blue-700 text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        ⚙️ Configuración de Consorcio
                                    </button>
                                    <button
                                        onClick={() => navegarTabAdmin('trazabilidad')}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                            pathname === '/admin' && tabAdminActiva === 'trazabilidad'
                                                ? 'bg-blue-700 text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        📡 Trazabilidad
                                    </button>
                                    <button
                                        onClick={() => router.push('/asamblea/tema/1')}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                            pathname.startsWith('/asamblea/tema')
                                                ? 'bg-blue-700 text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        🔍 Monitor de Urna
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => router.push('/asamblea')}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                            pathname === '/asamblea' || pathname.startsWith('/asamblea/tema')
                                                ? 'bg-blue-700 text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        🏛️ Lobby / Orden del Día
                                    </button>
                                    <button
                                        onClick={() => router.push('/asamblea/propuestas')}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                            pathname.startsWith('/asamblea/propuestas')
                                                ? 'bg-blue-700 text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        💡 Mis Propuestas
                                    </button>
                                    <button
                                        onClick={() => router.push('/asamblea/notificacion-ausentes')}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                            pathname.startsWith('/asamblea/notificacion-ausentes')
                                                ? 'bg-blue-700 text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        📬 Resoluciones (Ausentes)
                                    </button>
                                    <button
                                        onClick={() => router.push('/asamblea/historial')}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                            pathname.startsWith('/asamblea/historial') ||
                                            pathname.startsWith('/asamblea/acta')
                                                ? 'bg-blue-700 text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        📚 Actas e Historial
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Rincón de Perfil Logueado y Cierre de Sesión */}
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2.5">
                            <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                    esAdmin
                                        ? 'bg-amber-500 text-slate-950'
                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                }`}
                            >
                                {usuario.rol}
                            </span>
                            <div className="text-right leading-tight">
                                <span className="text-xs font-bold text-white block">
                                    {usuario.nombre}
                                </span>
                                <span className="text-[11px] text-slate-400 block">
                                    {usuario.unidad}
                                    {!esAdmin && ` • Coef. ${Number(usuario.coeficiente).toFixed(2)}%`}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={cerrarSesion}
                            className="bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Cerrar Sesión ↪
                        </button>
                    </div>

                </div>
            </div>
        </nav>
    );
}

