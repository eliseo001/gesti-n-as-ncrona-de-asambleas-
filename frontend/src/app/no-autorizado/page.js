'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function NoAutorizadoPage() {
    const router = useRouter();
    const { usuario, cerrarSesion } = useAuth();

    const volverAMiPanel = () => {
        if (!usuario) {
            router.push('/');
        } else if (usuario.rol === 'ADMINISTRADOR') {
            router.push('/admin');
        } else {
            router.push('/asamblea');
        }
    };

    return (
        <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl border-2 border-red-200 overflow-hidden text-center">
                <div className="bg-red-800 text-white p-6">
                    <div className="text-4xl mb-2">🛡️</div>
                    <span className="text-[11px] font-bold uppercase tracking-widest bg-red-950 text-red-200 px-2.5 py-1 rounded">
                        Control de Acceso Basado en Roles (RBAC)
                    </span>
                    <h1 className="text-xl font-bold mt-2">Acceso Restringido (HTTP 403)</h1>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Su perfil actual (<strong>{usuario?.rol || 'SIN SESIÓN'}</strong>) no posee los privilegios requeridos para acceder a esta ruta del sistema.
                    </p>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs text-slate-500">
                        Este evento ha sido registrado por el módulo de seguridad de <strong>ConsorcioSync</strong> conforme a la separación de funciones entre Administración y Copropietarios.
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <button
                            onClick={volverAMiPanel}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer"
                        >
                            ← Ir a mi Panel Autorizado
                        </button>
                        <button
                            onClick={cerrarSesion}
                            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 rounded-lg text-xs cursor-pointer"
                        >
                            Cambiar de Cuenta (Cerrar Sesión)
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

