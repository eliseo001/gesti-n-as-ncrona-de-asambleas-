'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Navbar from './layout/Navbar';

const RUTAS_PUBLICAS = ['/', '/recuperar', '/no-autorizado', '/verificar', '/onboarding'];

export default function RouteGuard({ children }) {
    const { usuario, cargandoSesion } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (cargandoSesion) return;

        const esRutaPublica = RUTAS_PUBLICAS.includes(pathname);

        // 1. Si no hay sesión activa y la ruta no es pública -> redirigir al Login
        if (!usuario && !esRutaPublica) {
            router.replace('/');
            return;
        }

        if (usuario) {
            // 2. Protección de rutas exclusivas de ADMINISTRADOR (/admin y subrutas)
            if (pathname.startsWith('/admin') && usuario.rol !== 'ADMINISTRADOR') {
                router.replace('/no-autorizado');
                return;
            }

            // 3. Protección de rutas exclusivas de PROPIETARIO
            const esRutaExclusivaPropietario =
                pathname === '/asamblea' ||
                pathname.startsWith('/asamblea/onboarding') ||
                pathname.startsWith('/asamblea/propuestas') ||
                pathname.startsWith('/asamblea/delegar') ||
                pathname.startsWith('/asamblea/notificacion-ausentes');

            if (esRutaExclusivaPropietario && usuario.rol !== 'PROPIETARIO') {
                router.replace('/no-autorizado');
                return;
            }
        }
    }, [usuario, cargandoSesion, pathname, router]);

    if (cargandoSesion) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-200 font-sans text-sm">
                Verificando credenciales y permisos de rol (RBAC)...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-100">
            <Navbar />
            <div className="flex-grow">{children}</div>
        </div>
    );
}
