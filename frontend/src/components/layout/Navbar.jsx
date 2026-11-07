'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button } from '../ui';

const RUTAS_SIN_NAVBAR = ['/', '/recuperar', '/no-autorizado', '/verificar'];

const NOTIFICACIONES_INICIALES = [
    {
        id: 1,
        titulo: 'Nueva asamblea convocada',
        detalle: 'Se publicó el Orden del Día para la Asamblea Extraordinaria (3 puntos a tratar).',
        tiempo: 'Hace 5 min',
        tipo: 'info',
        leida: false,
        ruta: '/asamblea/tema/1',
    },
    {
        id: 2,
        titulo: 'Fe de erratas emitida',
        detalle: 'Administración adjuntó la bonificación del presupuesto de fachada ($450.000 final).',
        tiempo: 'Hace 18 min',
        tipo: 'warning',
        leida: false,
        ruta: '/asamblea/tema/1',
    },
    {
        id: 3,
        titulo: 'Quórum legal alcanzado (68.5%)',
        detalle: 'Se superó el mínimo legal (>50% Art. 2060 CCyCN) con 14 de 20 Unidades Funcionales.',
        tiempo: 'Hace 40 min',
        tipo: 'success',
        leida: false,
        ruta: '/asamblea/tema/1',
    },
    {
        id: 4,
        titulo: 'Plazo de impugnación de ausentes',
        detalle: 'Recordatorio: 15 días corridos para notificar oposiciones al Tema #3 (Art. 2060).',
        tiempo: 'Hace 2 hs',
        tipo: 'neutral',
        leida: true,
        ruta: '/asamblea/notificacion-ausentes',
    },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const {
        usuario,
        cerrarSesion,
        tabAdminActiva,
        setTabAdminActiva,
    } = useAuth();

    // Estados de la Central de Notificaciones Push (HU-005)
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [notificaciones, setNotificaciones] = useState(NOTIFICACIONES_INICIALES);

    if (!usuario || RUTAS_SIN_NAVBAR.includes(pathname)) {
        return null;
    }

    const esAdmin = usuario.rol === 'ADMINISTRADOR';
    const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

    const navegarTabAdmin = (tabId) => {
        setTabAdminActiva(tabId);
        if (pathname !== '/admin') {
            router.push('/admin');
        }
    };

    const marcarTodasComoLeidas = () => {
        setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    };

    const seleccionarNotificacion = (notif) => {
        setNotificaciones((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, leida: true } : n))
        );
        setMenuAbierto(false);
        if (notif.ruta) {
            router.push(notif.ruta);
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
                                    <button
                                        onClick={() => router.push('/asamblea/cierre')}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                                            pathname.startsWith('/asamblea/cierre')
                                                ? 'bg-emerald-700 text-white border-emerald-500 shadow-sm'
                                                : 'bg-slate-800 text-emerald-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                                        }`}
                                    >
                                        🏁 Resultados y Cierre
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
                                        onClick={() => router.push('/asamblea/cierre')}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                                            pathname.startsWith('/asamblea/cierre')
                                                ? 'bg-emerald-700 text-white border-emerald-500 shadow-sm'
                                                : 'bg-slate-800 text-emerald-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                                        }`}
                                    >
                                        🏁 Resultados y Cierre
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
                                        onClick={() => router.push('/asamblea/delegar')}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                            pathname.startsWith('/asamblea/delegar')
                                                ? 'bg-blue-700 text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        📜 Delegar Voto (Poder)
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
                                    <button
                                        onClick={() => router.push('/onboarding')}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                                            pathname === '/onboarding'
                                                ? 'bg-blue-700 text-white border-blue-500'
                                                : 'bg-slate-800 text-blue-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                                        }`}
                                    >
                                        ➕ Reclamar nueva unidad
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Rincón Derecho: Campana de Notificaciones (HU-005), Perfil y Cierre de Sesión */}
                    <div className="flex items-center gap-3">

                        {/* HU-005: Central de Notificaciones Push */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuAbierto((prev) => !prev)}
                                aria-label="Abrir central de notificaciones"
                                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
                            >
                                <span className="text-base leading-none">🔔</span>
                                {noLeidasCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                                        {noLeidasCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown de Notificaciones */}
                            {menuAbierto && (
                                <Card className="absolute right-0 mt-2 w-80 sm:w-96 shadow-2xl border-slate-300 text-slate-800 z-50 overflow-hidden">
                                    <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center border-b border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs uppercase tracking-wider">
                                                🔔 Central de Notificaciones
                                            </span>
                                            {noLeidasCount > 0 && (
                                                <Badge variant="danger" size="sm">
                                                    {noLeidasCount} nuevas
                                                </Badge>
                                            )}
                                        </div>
                                        {noLeidasCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={marcarTodasComoLeidas}
                                                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                                            >
                                                Marcar leídas
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-200 bg-white">
                                        {notificaciones.map((notif) => (
                                            <button
                                                key={notif.id}
                                                type="button"
                                                onClick={() => seleccionarNotificacion(notif)}
                                                className={`w-full text-left p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                                                    notif.leida
                                                        ? 'bg-white hover:bg-slate-50'
                                                        : 'bg-blue-50/60 hover:bg-blue-50'
                                                }`}
                                            >
                                                <span
                                                    className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                                                        notif.leida ? 'bg-slate-300' : 'bg-blue-600'
                                                    }`}
                                                />
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex justify-between items-center gap-2">
                                                        <p className="text-xs font-bold text-slate-900 truncate">
                                                            {notif.titulo}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                            {notif.tiempo}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                                                        {notif.detalle}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
                                        <span>Domicilio Electrónico Activo (Art. 2046)</span>
                                        <button
                                            type="button"
                                            onClick={() => setMenuAbierto(false)}
                                            className="font-bold text-slate-700 hover:underline cursor-pointer"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Tarjeta de Usuario Logueado */}
                        <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2.5">
                            <Badge
                                variant={
                                    esAdmin
                                        ? 'warning'
                                        : usuario.kycVerificado === false
                                        ? 'darkWarning'
                                        : 'darkSuccess'
                                }
                                size="sm"
                                shape="rounded"
                            >
                                {esAdmin
                                    ? 'ADMINISTRADOR'
                                    : usuario.kycVerificado === false
                                    ? '⏳ KYC PENDIENTE'
                                    : '✓ VERIFICADO'}
                            </Badge>
                            <div className="text-right leading-tight">
                                <span className="text-xs font-bold text-white block">
                                    {usuario.nombre}
                                </span>
                                <span className="text-[11px] text-slate-300 block">
                                    {esAdmin
                                        ? 'Administración Central'
                                        : `Titular: ${
                                              Array.isArray(usuario.unidades) && usuario.unidades.length > 0
                                                  ? usuario.unidades.map((u) => `UF ${u}`).join(', ')
                                                  : usuario.unidad
                                          } • Peso Electoral: ${Number(
                                              usuario.coeficienteTotal ?? usuario.coeficiente ?? 0
                                          ).toFixed(2)}%`}
                                </span>
                            </div>
                        </div>

                        <Button variant="danger" size="sm" onClick={cerrarSesion}>
                            Cerrar Sesión ↪
                        </Button>
                    </div>

                </div>
            </div>
        </nav>
    );
}
