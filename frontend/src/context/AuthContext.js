'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

// Perfiles preconfigurados que simulan el payload decodificado de un JWT
const PERFILES_SIMULADOS = {
    ADMINISTRADOR: {
        id: 1,
        nombre: 'Adm. ConsorcioSync (Mat. RPA #8492)',
        email: 'admin@consorcio.com',
        rol: 'ADMINISTRADOR',
        unidad: 'Administración Central',
        coeficiente: 0.0,
    },
    PROPIETARIO_4B: {
        id: 4,
        nombre: 'Ana Martínez',
        email: 'propietario4b@consorcio.com',
        rol: 'PROPIETARIO',
        unidad: 'UF 4B + Cochera 12',
        coeficiente: 5.20,
    },
    PROPIETARIO_1A: {
        id: 2,
        nombre: 'Juan Pérez',
        email: 'juan@unidad1a.com',
        rol: 'PROPIETARIO',
        unidad: 'UF 1A',
        coeficiente: 4.15,
    },
};

const FASES_VALIDAS = ['ABIERTA', 'CUARTO_INTERMEDIO', 'CERRADA'];

export function AuthProvider({ children }) {
    const router = useRouter();
    const [usuario, setUsuario] = useState(null);
    const [cargandoSesion, setCargandoSesion] = useState(true);

    // Estado global de la Asamblea: ABIERTA (debate y voto simultáneos) | CUARTO_INTERMEDIO | CERRADA
    const [faseAsamblea, setFaseAsambleaState] = useState('ABIERTA');

    // Pestaña activa del panel de administración para navegación directa desde el Navbar global
    const [tabAdminActiva, setTabAdminActiva] = useState('kyc');

    useEffect(() => {
        try {
            const sesionGuardada = localStorage.getItem('consorciosync_auth_user');
            if (sesionGuardada) {
                setUsuario(JSON.parse(sesionGuardada));
            }
            const faseGuardada = localStorage.getItem('consorciosync_fase_asamblea');
            if (faseGuardada && FASES_VALIDAS.includes(faseGuardada)) {
                setFaseAsambleaState(faseGuardada);
            } else {
                // Normaliza cualquier valor heredado (DELIBERACION / SUFRAGIO) a ABIERTA
                setFaseAsambleaState('ABIERTA');
                localStorage.setItem('consorciosync_fase_asamblea', 'ABIERTA');
            }
        } catch (error) {
            console.error('Error al hidratar la sesión:', error);
        } finally {
            setCargandoSesion(false);
        }
    }, []);

    const actualizarFaseAsamblea = (nuevaFase) => {
        const faseNormalizada = FASES_VALIDAS.includes(nuevaFase) ? nuevaFase : 'ABIERTA';
        setFaseAsambleaState(faseNormalizada);
        localStorage.setItem('consorciosync_fase_asamblea', faseNormalizada);
    };

    const iniciarSesion = (emailIngresado) => {
        const emailNormalizado = emailIngresado.trim().toLowerCase();
        let payloadUsuario;

        if (emailNormalizado.includes('admin')) {
            payloadUsuario = {
                ...PERFILES_SIMULADOS.ADMINISTRADOR,
                email: emailNormalizado,
            };
        } else if (emailNormalizado.includes('1a') || emailNormalizado.includes('juan')) {
            payloadUsuario = {
                ...PERFILES_SIMULADOS.PROPIETARIO_1A,
                email: emailNormalizado,
            };
        } else {
            payloadUsuario = {
                ...PERFILES_SIMULADOS.PROPIETARIO_4B,
                email: emailNormalizado,
            };
        }

        setUsuario(payloadUsuario);
        localStorage.setItem('consorciosync_auth_user', JSON.stringify(payloadUsuario));

        if (payloadUsuario.rol === 'ADMINISTRADOR') {
            setTabAdminActiva('kyc');
            router.push('/admin');
        } else {
            router.push('/asamblea');
        }

        return payloadUsuario;
    };

    const cerrarSesion = () => {
        setUsuario(null);
        localStorage.removeItem('consorciosync_auth_user');
        localStorage.removeItem('token');
        router.push('/');
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                cargandoSesion,
                iniciarSesion,
                cerrarSesion,
                faseAsamblea,
                actualizarFaseAsamblea,
                tabAdminActiva,
                setTabAdminActiva,
                esAdmin: usuario?.rol === 'ADMINISTRADOR',
                esPropietario: usuario?.rol === 'PROPIETARIO',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const contexto = useContext(AuthContext);
    if (!contexto) {
        throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
    }
    return contexto;
}
