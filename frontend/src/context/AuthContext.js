'use client';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

// Padrón Maestro Catastral Físico (DDD - Art. 2056 CCyCN)
// Almacena ÚNICAMENTE la Superficie física (superficieM2). El coeficiente porcentual se calcula al vuelo.
const PADRON_MAESTRO_INICIAL = [
    {
        id: 1,
        depto: '1A',
        tipo: 'Departamento',
        ubicacion: '1° Piso Frente',
        superficieM2: 120,
        estado: 'VINCULADA',
        estadoContable: 'AL_DIA',
        titularEmail: 'juan@unidad1a.com',
        titularNombre: 'Juan Pérez',
    },
    {
        id: 2,
        depto: 'C01',
        tipo: 'Cochera',
        ubicacion: 'Subsuelo 1 - Cochera 01',
        superficieM2: 15,
        estado: 'VINCULADA',
        estadoContable: 'AL_DIA',
        titularEmail: 'juan@unidad1a.com',
        titularNombre: 'Juan Pérez',
    },
    {
        id: 3,
        depto: '2B',
        tipo: 'Departamento',
        ubicacion: '2° Piso Contrafrente',
        superficieM2: 145,
        estado: 'VINCULADA',
        estadoContable: 'AL_DIA',
        titularEmail: 'maria@margaritas.com',
        titularNombre: 'María Gómez',
    },
    {
        id: 4,
        depto: '3C',
        tipo: 'Departamento',
        ubicacion: '3° Piso Lateral',
        superficieM2: 110,
        estado: 'VINCULADA',
        estadoContable: 'MOROSO',
        titularEmail: 'carlos@margaritas.com',
        titularNombre: 'Carlos López',
    },
    {
        id: 5,
        depto: '4B',
        tipo: 'Departamento',
        ubicacion: '4° Piso Frente',
        superficieM2: 120,
        estado: 'VACANTE',
        estadoContable: 'AL_DIA',
        titularEmail: null,
        titularNombre: null,
    },
    {
        id: 6,
        depto: 'C12',
        tipo: 'Cochera',
        ubicacion: 'Subsuelo 1 - Cochera 12',
        superficieM2: 15,
        estado: 'VACANTE',
        estadoContable: 'AL_DIA',
        titularEmail: null,
        titularNombre: null,
    },
    {
        id: 7,
        depto: 'B08',
        tipo: 'Baulera',
        ubicacion: 'Subsuelo 2 - Baulera 08',
        superficieM2: 8,
        estado: 'VACANTE',
        estadoContable: 'AL_DIA',
        titularEmail: null,
        titularNombre: null,
    },
    {
        id: 8,
        depto: '5A',
        tipo: 'Departamento',
        ubicacion: '5° Piso Semipiso',
        superficieM2: 130,
        estado: 'VINCULADA',
        estadoContable: 'AL_DIA',
        titularEmail: 'propietario4b@consorcio.com',
        titularNombre: 'Ana Martínez',
    },
    {
        id: 9,
        depto: 'C04',
        tipo: 'Cochera',
        ubicacion: 'Subsuelo 1 - Cochera 04',
        superficieM2: 15,
        estado: 'VINCULADA',
        estadoContable: 'AL_DIA',
        titularEmail: 'propietario4b@consorcio.com',
        titularNombre: 'Ana Martínez',
    },
];

const normalizarCodigoDepto = (valor = '') =>
    String(valor)
        .replace(/^(UF|Depto|Cochera|Baulera)\s*/i, '')
        .trim()
        .toUpperCase();

/**
 * MOTOR DE PONDERACIÓN AUTOMÁTICA (DDD):
 * a) Suma la superficieM2 de TODAS las unidades registradas con .reduce() para obtener superficieTotalDelEdificio.
 * b) Mapea el padrón e inyecta al vuelo coeficientePorcentual = (unidad.superficieM2 / superficieTotalDelEdificio) * 100
 *    conservando la máxima precisión decimal en coma flotante para evitar pérdida de votos por redondeo.
 */
export const ejecutarMotorPonderacion = (padron = PADRON_MAESTRO_INICIAL) => {
    const superficieTotalDelEdificio = padron.reduce(
        (acumulador, unidad) => acumulador + Number(unidad.superficieM2 || 0),
        0
    );

    const unidadesPonderadas = padron.map((unidad) => {
        const m2 = Number(unidad.superficieM2 || 0);
        const coeficientePorcentual =
            superficieTotalDelEdificio > 0
                ? (m2 / superficieTotalDelEdificio) * 100
                : 0;

        return {
            ...unidad,
            superficieM2: m2,
            coeficientePorcentual,
            // Alias de compatibilidad hacia atrás manteniendo máxima precisión decimal
            coeficiente: coeficientePorcentual,
        };
    });

    return {
        superficieTotalDelEdificio,
        unidadesPonderadas,
    };
};

/**
 * Calcula la sumatoria exacta (sin redondeo prematuro) de los coeficientes dinámicos
 * de un conjunto de unidades sobre el total de m2 del edificio.
 */
export const calcularCoeficienteConsolidado = (
    codigosUnidades = [],
    padron = PADRON_MAESTRO_INICIAL
) => {
    const { unidadesPonderadas } = ejecutarMotorPonderacion(padron);
    const normalizados = codigosUnidades.map(normalizarCodigoDepto);

    return unidadesPonderadas
        .filter((u) => normalizados.includes(normalizarCodigoDepto(u.depto)))
        .reduce((acumulador, unidad) => acumulador + unidad.coeficientePorcentual, 0);
};

export const calcularSuperficieConsolidada = (
    codigosUnidades = [],
    padron = PADRON_MAESTRO_INICIAL
) => {
    const normalizados = codigosUnidades.map(normalizarCodigoDepto);
    return padron
        .filter((u) => normalizados.includes(normalizarCodigoDepto(u.depto)))
        .reduce((acumulador, unidad) => acumulador + Number(unidad.superficieM2 || 0), 0);
};

export const formatearEtiquetaUnidades = (unidades = []) => {
    if (!Array.isArray(unidades) || unidades.length === 0) return 'Sin Unidades';
    return unidades
        .map((u) => `UF ${normalizarCodigoDepto(u)}`)
        .join(', ');
};

const SOLICITUDES_KYC_INICIALES = [
    {
        id: 101,
        nombre: 'Martín Echeverría',
        email: 'martin@unidad4b.com',
        unidadesReclamadas: ['4B', 'C12'],
        fechaEnvio: '04/11/2026 09:42 hs',
        archivoDni: 'DNI_FrenteDorso_Echeverria.pdf',
        archivoEscritura: 'Escritura_UF4B_y_CocheraC12.pdf',
        matriculaCatastral: 'FR-01-4829-B / C12',
        estadoKyc: 'PENDIENTE_AUDITORIA',
    },
    {
        id: 102,
        nombre: 'Lucía Fernández',
        email: 'lucia@margaritas.com',
        unidadesReclamadas: ['B08'],
        fechaEnvio: '04/11/2026 11:15 hs',
        archivoDni: 'DNI_Digital_LuciaFernandez.png',
        archivoEscritura: 'Título_Baulera08.pdf',
        matriculaCatastral: 'FR-01-3104-B08',
        estadoKyc: 'PENDIENTE_AUDITORIA',
    },
    {
        id: 104,
        nombre: 'Juan Pérez',
        email: 'juan@unidad1a.com',
        unidadesReclamadas: ['1A', 'C01'],
        fechaEnvio: '01/11/2026 10:14 hs',
        archivoDni: 'DNI_FrenteDorso_JuanPerez.pdf',
        archivoEscritura: 'Escritura_UF1A_Cochera01.pdf',
        matriculaCatastral: 'FR-01-1002-A / C01',
        estadoKyc: 'APROBADO',
    },
];

// Estado Inicial de Cartas Poder (Mandatos de Representación - Art. 2060 / 2062 CCyCN)
const CARTAS_PODER_INICIALES = [
    {
        id: 201,
        poderdante: {
            id: 3,
            nombre: 'María Gómez',
            email: 'maria@margaritas.com',
            unidades: ['2B'],
            unidad: 'UF 2B',
        },
        emailApoderado: 'propietario4b@consorcio.com',
        nombreApoderado: 'Ana Martínez',
        vigencia: 'Para la Asamblea actual',
        documentoAdjunto: 'CartaPoder_MariaGomez_UF2B_Firmada.pdf',
        fechaEmision: '04/11/2026 10:30 hs',
        estado: 'PENDIENTE',
    },
];

// Perfiles preconfigurados que simulan el payload decodificado de un JWT con soporte Multi-Unidad
const PERFILES_SIMULADOS = {
    ADMINISTRADOR: {
        id: 1,
        nombre: 'Adm. ConsorcioSync (Mat. RPA #8492)',
        email: 'admin@consorcio.com',
        rol: 'ADMINISTRADOR',
        unidades: [],
        unidad: 'Administración Central',
        estadoKyc: 'APROBADO',
        kycVerificado: true,
    },
    PROPIETARIO_MULTIUNIDAD: {
        id: 4,
        nombre: 'Ana Martínez',
        email: 'propietario4b@consorcio.com',
        rol: 'PROPIETARIO',
        unidades: ['5A', 'C04'],
        unidad: 'UF 5A, UF C04',
        estadoKyc: 'APROBADO',
        kycVerificado: true,
    },
    PROPIETARIO_1A: {
        id: 2,
        nombre: 'Juan Pérez',
        email: 'juan@unidad1a.com',
        rol: 'PROPIETARIO',
        unidades: ['1A', 'C01'],
        unidad: 'UF 1A, UF C01',
        estadoKyc: 'APROBADO',
        kycVerificado: true,
    },
    PROPIETARIO_PENDIENTE_KYC: {
        id: 101,
        nombre: 'Martín Echeverría',
        email: 'martin@unidad4b.com',
        rol: 'PROPIETARIO',
        unidades: ['4B', 'C12'],
        unidad: 'UF 4B, UF C12',
        estadoKyc: 'PENDIENTE_AUDITORIA',
        kycVerificado: false,
    },
};

const FASES_VALIDAS = ['ABIERTA', 'CUARTO_INTERMEDIO', 'CERRADA'];

export function AuthProvider({ children }) {
    const router = useRouter();
    const [usuarioBase, setUsuarioBase] = useState(null);
    const [cargandoSesion, setCargandoSesion] = useState(true);
    const [faseAsamblea, setFaseAsambleaState] = useState('ABIERTA');
    const [tabAdminActiva, setTabAdminActiva] = useState('kyc');

    const [padronMaestro, setPadronMaestro] = useState(PADRON_MAESTRO_INICIAL);
    const [solicitudesKyc, setSolicitudesKyc] = useState(SOLICITUDES_KYC_INICIALES);
    const [cartasPoder, setCartasPoder] = useState(CARTAS_PODER_INICIALES);

    // Función/Hook interno requerido: obtenerPadronConPonderacion()
    const obtenerPadronConPonderacion = () => {
        const superficieTotalDelEdificio = padronMaestro.reduce(
            (acumulador, unidad) => acumulador + Number(unidad.superficieM2 || 0),
            0
        );

        return padronMaestro.map((unidad) => {
            const m2 = Number(unidad.superficieM2 || 0);
            const coeficientePorcentual =
                superficieTotalDelEdificio > 0
                    ? (m2 / superficieTotalDelEdificio) * 100
                    : 0;

            return {
                ...unidad,
                superficieM2: m2,
                coeficientePorcentual,
                coeficiente: coeficientePorcentual,
            };
        });
    };

    const superficieTotalDelEdificio = useMemo(
        () =>
            padronMaestro.reduce(
                (acumulador, unidad) => acumulador + Number(unidad.superficieM2 || 0),
                0
            ),
        [padronMaestro]
    );

    const padronPonderado = useMemo(
        () => obtenerPadronConPonderacion(),
        [padronMaestro]
    );

    // Derivar el usuario activo inyectándole en vivo su coeficienteTotal recalculado por el Motor de Ponderación
    const usuario = useMemo(() => {
        if (!usuarioBase) return null;
        if (usuarioBase.rol === 'ADMINISTRADOR') {
            return {
                ...usuarioBase,
                coeficienteTotal: 0,
                coeficiente: 0,
                superficieTotalM2: 0,
            };
        }

        const unidadesUsuario = Array.isArray(usuarioBase.unidades)
            ? usuarioBase.unidades
            : ['5A', 'C04'];

        const coefDinamico = calcularCoeficienteConsolidado(unidadesUsuario, padronMaestro);
        const m2Dinamicos = calcularSuperficieConsolidada(unidadesUsuario, padronMaestro);

        return {
            ...usuarioBase,
            unidades: unidadesUsuario,
            unidad: formatearEtiquetaUnidades(unidadesUsuario),
            superficieTotalM2: m2Dinamicos,
            coeficienteTotal: coefDinamico,
            coeficiente: coefDinamico,
        };
    }, [usuarioBase, padronMaestro]);

    useEffect(() => {
        try {
            const padronGuardado = localStorage.getItem('consorciosync_padron_maestro_v3');
            const padronActual = padronGuardado
                ? JSON.parse(padronGuardado)
                : PADRON_MAESTRO_INICIAL;

            if (padronGuardado) {
                setPadronMaestro(padronActual);
            }

            const kycGuardadas = localStorage.getItem('consorciosync_solicitudes_kyc_v3');
            const listaKycActual = kycGuardadas
                ? JSON.parse(kycGuardadas)
                : SOLICITUDES_KYC_INICIALES;

            if (kycGuardadas) {
                setSolicitudesKyc(listaKycActual);
            }

            const poderesGuardados = localStorage.getItem('consorciosync_cartas_poder_v1');
            if (poderesGuardados) {
                setCartasPoder(JSON.parse(poderesGuardados));
            }

            const sesionGuardada = localStorage.getItem('consorciosync_auth_user');
            if (sesionGuardada) {
                const userParsed = JSON.parse(sesionGuardada);

                if (userParsed.rol === 'PROPIETARIO') {
                    const unidadesNormalizadas = Array.isArray(userParsed.unidades)
                        ? userParsed.unidades
                        : ['5A', 'C04'];

                    userParsed.unidades = unidadesNormalizadas;
                    userParsed.unidad = formatearEtiquetaUnidades(unidadesNormalizadas);

                    const coincidencia = listaKycActual.find(
                        (s) => s.email.toLowerCase() === userParsed.email?.toLowerCase()
                    );
                    if (coincidencia) {
                        const unidadesKyc = coincidencia.unidadesReclamadas || unidadesNormalizadas;
                        userParsed.unidades = unidadesKyc;
                        userParsed.unidad = formatearEtiquetaUnidades(unidadesKyc);
                        userParsed.estadoKyc = coincidencia.estadoKyc;
                        userParsed.kycVerificado = coincidencia.estadoKyc === 'APROBADO';
                    }
                }

                setUsuarioBase(userParsed);
            }

            const faseGuardada = localStorage.getItem('consorciosync_fase_asamblea');
            if (faseGuardada && FASES_VALIDAS.includes(faseGuardada)) {
                setFaseAsambleaState(faseGuardada);
            } else {
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

        const unidadesVinculadasPadron = padronMaestro
            .filter(
                (u) =>
                    u.estado === 'VINCULADA' &&
                    u.titularEmail?.toLowerCase() === emailNormalizado
            )
            .map((u) => u.depto);

        const solicitudExistente = solicitudesKyc.find(
            (s) => s.email.toLowerCase() === emailNormalizado
        );

        if (emailNormalizado.includes('admin')) {
            payloadUsuario = {
                ...PERFILES_SIMULADOS.ADMINISTRADOR,
                email: emailNormalizado,
            };
        } else if (solicitudExistente) {
            const estaVerificado = solicitudExistente.estadoKyc === 'APROBADO';
            const listaUnidades =
                unidadesVinculadasPadron.length > 0
                    ? unidadesVinculadasPadron
                    : solicitudExistente.unidadesReclamadas || ['4B', 'C12'];

            payloadUsuario = {
                id: solicitudExistente.id,
                nombre: solicitudExistente.nombre,
                email: solicitudExistente.email,
                rol: 'PROPIETARIO',
                unidades: listaUnidades,
                unidad: formatearEtiquetaUnidades(listaUnidades),
                estadoKyc: solicitudExistente.estadoKyc,
                kycVerificado: estaVerificado,
            };
        } else if (unidadesVinculadasPadron.length > 0) {
            const titularPadron = padronMaestro.find(
                (u) => u.titularEmail?.toLowerCase() === emailNormalizado
            );
            payloadUsuario = {
                id: Date.now(),
                nombre: titularPadron?.titularNombre || 'Propietario Verificado',
                email: emailNormalizado,
                rol: 'PROPIETARIO',
                unidades: unidadesVinculadasPadron,
                unidad: formatearEtiquetaUnidades(unidadesVinculadasPadron),
                estadoKyc: 'APROBADO',
                kycVerificado: true,
            };
        } else if (emailNormalizado.includes('1a') || emailNormalizado.includes('juan')) {
            payloadUsuario = {
                ...PERFILES_SIMULADOS.PROPIETARIO_1A,
                email: emailNormalizado,
            };
        } else {
            payloadUsuario = {
                ...PERFILES_SIMULADOS.PROPIETARIO_MULTIUNIDAD,
                email: emailNormalizado,
            };
        }

        setUsuarioBase(payloadUsuario);
        localStorage.setItem('consorciosync_auth_user', JSON.stringify(payloadUsuario));

        if (payloadUsuario.rol === 'ADMINISTRADOR') {
            setTabAdminActiva('kyc');
            router.push('/admin');
        } else {
            router.push('/asamblea');
        }

        return payloadUsuario;
    };

    const registrarOnboardingKyc = ({
        nombre,
        email,
        password = null,
        unidadesReclamadas = [],
        archivoDni,
        archivoEscritura,
    }) => {
        const esUsuarioActivo = Boolean(usuarioBase);
        const emailAsociado = (esUsuarioActivo ? usuarioBase.email : email || '')
            .trim()
            .toLowerCase();
        const nombreAsociado = (esUsuarioActivo ? usuarioBase.nombre : nombre || '').trim();

        const codigosLimpios = unidadesReclamadas.map(normalizarCodigoDepto);
        const coeficienteConsolidado = calcularCoeficienteConsolidado(
            codigosLimpios,
            padronMaestro
        );

        const nuevaSolicitud = {
            id: Date.now(),
            nombre: nombreAsociado,
            email: emailAsociado,
            tipoTramite: esUsuarioActivo ? 'AMPLIACION_CARTERA' : 'ALTA_INICIAL',
            passwordCreada: esUsuarioActivo ? undefined : Boolean(password),
            unidadesReclamadas: codigosLimpios,
            coeficienteTotal: coeficienteConsolidado,
            fechaEnvio:
                new Date().toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }) + ' hs',
            archivoDni:
                archivoDni ||
                (esUsuarioActivo
                    ? 'DNI_Validado_En_Legajo_Existente.pdf'
                    : 'DNI_FrenteDorso_Titular.pdf'),
            archivoEscritura: archivoEscritura || 'Escritura_NuevaUnidad.pdf',
            matriculaCatastral: `FR-01-${Math.floor(1000 + Math.random() * 9000)} (${codigosLimpios.join(' + ')})`,
            estadoKyc: 'PENDIENTE_AUDITORIA',
        };

        const listaActualizada = [nuevaSolicitud, ...solicitudesKyc];

        setSolicitudesKyc(listaActualizada);
        localStorage.setItem('consorciosync_solicitudes_kyc_v3', JSON.stringify(listaActualizada));

        // Si NO había sesión iniciada (Flujo Onboarding Nuevo), creamos la sesión inicial pendiente de auditoría.
        // Si YA estaba logueado y verificado (ej. Ana Martínez reclamando una nueva unidad), preservamos su sesión activa.
        if (!esUsuarioActivo) {
            const nuevoUsuario = {
                id: nuevaSolicitud.id,
                nombre: nuevaSolicitud.nombre,
                email: nuevaSolicitud.email,
                rol: 'PROPIETARIO',
                unidades: codigosLimpios,
                unidad: formatearEtiquetaUnidades(codigosLimpios),
                estadoKyc: 'PENDIENTE_AUDITORIA',
                kycVerificado: false,
            };

            setUsuarioBase(nuevoUsuario);
            localStorage.setItem('consorciosync_auth_user', JSON.stringify(nuevoUsuario));
        }

        return nuevaSolicitud;
    };

    const resolverAuditoriaKyc = (idSolicitud, decision) => {
        const estadoFinal = decision === 'APROBADO' ? 'APROBADO' : 'RECHAZADO';
        const solicitudObjetivo = solicitudesKyc.find((item) => item.id === idSolicitud);
        if (!solicitudObjetivo) return;

        const listaKycActualizada = solicitudesKyc.map((item) =>
            item.id === idSolicitud ? { ...item, estadoKyc: estadoFinal } : item
        );

        setSolicitudesKyc(listaKycActualizada);
        localStorage.setItem('consorciosync_solicitudes_kyc_v3', JSON.stringify(listaKycActualizada));

        const codigosReclamados = (solicitudObjetivo.unidadesReclamadas || []).map(
            normalizarCodigoDepto
        );

        let padronActualizado = padronMaestro;

        if (estadoFinal === 'APROBADO') {
            padronActualizado = padronMaestro.map((unidad) =>
                codigosReclamados.includes(normalizarCodigoDepto(unidad.depto))
                    ? {
                          ...unidad,
                          estado: 'VINCULADA',
                          titularEmail: solicitudObjetivo.email,
                          titularNombre: solicitudObjetivo.nombre,
                      }
                    : unidad
            );
            setPadronMaestro(padronActualizado);
            localStorage.setItem('consorciosync_padron_maestro_v3', JSON.stringify(padronActualizado));
        }

        if (
            usuarioBase &&
            usuarioBase.email?.toLowerCase() === solicitudObjetivo.email.toLowerCase()
        ) {
            // Consolidar todas las unidades vinculadas en el padrón para este titular (anteriores + nuevas aprobadas)
            const todasLasUnidadesTitular = padronActualizado
                .filter(
                    (u) =>
                        u.estado === 'VINCULADA' &&
                        u.titularEmail?.toLowerCase() === solicitudObjetivo.email.toLowerCase()
                )
                .map((u) => normalizarCodigoDepto(u.depto));

            const carteraFinal =
                todasLasUnidadesTitular.length > 0
                    ? todasLasUnidadesTitular
                    : codigosReclamados;

            const usuarioActualizado = {
                ...usuarioBase,
                unidades: carteraFinal,
                unidad: formatearEtiquetaUnidades(carteraFinal),
                estadoKyc:
                    estadoFinal === 'APROBADO' || usuarioBase.kycVerificado
                        ? 'APROBADO'
                        : estadoFinal,
                kycVerificado:
                    estadoFinal === 'APROBADO' || Boolean(usuarioBase.kycVerificado),
            };
            setUsuarioBase(usuarioActualizado);
            localStorage.setItem('consorciosync_auth_user', JSON.stringify(usuarioActualizado));
        }
    };

    // Guarda únicamente la superficieM2 de la nueva unidad en el Padrón Maestro.
    // El Motor de Ponderación recalcula automáticamente los porcentajes de todo el edificio (100%).
    const agregarUnidadAlPadron = ({
        depto,
        tipo = 'Cochera',
        ubicacion = 'Unidad Complementaria',
        superficieM2,
        titularEmail = null,
        titularNombre = null,
        estado = 'VINCULADA',
    }) => {
        const m2Numerico = Number(superficieM2);
        if (!depto || Number.isNaN(m2Numerico) || m2Numerico <= 0) return null;

        const codigoNormalizado = normalizarCodigoDepto(depto);
        const nuevaUnidadFisica = {
            id: Date.now(),
            depto: codigoNormalizado,
            tipo,
            ubicacion,
            superficieM2: m2Numerico,
            estado: titularEmail ? 'VINCULADA' : estado,
            estadoContable: 'AL_DIA',
            titularEmail: titularEmail ? titularEmail.trim().toLowerCase() : null,
            titularNombre: titularNombre ? titularNombre.trim() : null,
        };

        const padronActualizado = [...padronMaestro, nuevaUnidadFisica];
        setPadronMaestro(padronActualizado);
        localStorage.setItem('consorciosync_padron_maestro_v3', JSON.stringify(padronActualizado));

        // Si el titular al que se le vinculó la unidad está logueado, sumar la unidad a su sesión
        if (
            usuarioBase &&
            titularEmail &&
            usuarioBase.email?.toLowerCase() === titularEmail.trim().toLowerCase()
        ) {
            const nuevasUnidades = Array.from(
                new Set([...(usuarioBase.unidades || []), codigoNormalizado])
            );
            const actualizado = {
                ...usuarioBase,
                unidades: nuevasUnidades,
                unidad: formatearEtiquetaUnidades(nuevasUnidades),
            };
            setUsuarioBase(actualizado);
            localStorage.setItem('consorciosync_auth_user', JSON.stringify(actualizado));
        }

        return nuevaUnidadFisica;
    };

    const desvincularUnidadPadron = (idUnidad) => {
        const padronActualizado = padronMaestro.map((u) =>
            u.id === idUnidad
                ? { ...u, estado: 'VACANTE', titularEmail: null, titularNombre: null }
                : u
        );
        setPadronMaestro(padronActualizado);
        localStorage.setItem('consorciosync_padron_maestro_v3', JSON.stringify(padronActualizado));
    };

    const alternarEstadoContableUnidad = (idUnidad) => {
        const padronActualizado = padronMaestro.map((u) =>
            u.id === idUnidad
                ? {
                      ...u,
                      estadoContable: u.estadoContable === 'MOROSO' ? 'AL_DIA' : 'MOROSO',
                  }
                : u
        );
        setPadronMaestro(padronActualizado);
        localStorage.setItem('consorciosync_padron_maestro_v3', JSON.stringify(padronActualizado));
    };

    const alternarMorosidadPorTitular = (emailTitular) => {
        if (!emailTitular) return;
        const emailNorm = emailTitular.trim().toLowerCase();
        const unidadesTitular = padronMaestro.filter(
            (u) => u.titularEmail?.toLowerCase() === emailNorm
        );
        const algunMoroso = unidadesTitular.some((u) => u.estadoContable === 'MOROSO');
        const nuevoEstado = algunMoroso ? 'AL_DIA' : 'MOROSO';

        const padronActualizado = padronMaestro.map((u) =>
            u.titularEmail?.toLowerCase() === emailNorm
                ? { ...u, estadoContable: nuevoEstado }
                : u
        );
        setPadronMaestro(padronActualizado);
        localStorage.setItem('consorciosync_padron_maestro_v3', JSON.stringify(padronActualizado));
    };

    // =========================================================================
    // GESTIÓN GLOBAL DE CARTAS PODER (EMISIÓN, VISADO Y CÁLCULO DE MANDATOS)
    // =========================================================================
    const emitirCartaPoder = ({
        emailApoderado,
        nombreApoderado = '',
        vigencia = 'Para la Asamblea actual',
        documentoAdjunto = 'Carta_Poder_Digital_Firmada.pdf',
    }) => {
        if (!usuario) return null;

        const nuevoMandato = {
            id: Date.now(),
            poderdante: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                unidades: Array.isArray(usuario.unidades) ? usuario.unidades : ['5A', 'C04'],
                unidad: usuario.unidad || formatearEtiquetaUnidades(usuario.unidades),
            },
            emailApoderado: emailApoderado.trim().toLowerCase(),
            nombreApoderado: nombreApoderado.trim() || 'Representante Designado',
            vigencia,
            documentoAdjunto: documentoAdjunto || 'Carta_Poder_Digital_Firmada.pdf',
            fechaEmision:
                new Date().toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }) + ' hs',
            estado: 'PENDIENTE',
        };

        // Reemplazar solicitudes pendientes anteriores del mismo poderdante para evitar duplicados
        const actualizadas = [
            nuevoMandato,
            ...cartasPoder.filter(
                (p) =>
                    p.poderdante?.email?.toLowerCase() !==
                        usuario.email?.toLowerCase() || p.estado !== 'PENDIENTE'
            ),
        ];

        setCartasPoder(actualizadas);
        localStorage.setItem('consorciosync_cartas_poder_v1', JSON.stringify(actualizadas));
        return nuevoMandato;
    };

    const resolverCartaPoder = (idPoder, decision) => {
        const estadoFinal = decision === 'APROBADO' ? 'APROBADO' : 'RECHAZADO';
        const actualizadas = cartasPoder.map((p) =>
            p.id === idPoder ? { ...p, estado: estadoFinal } : p
        );
        setCartasPoder(actualizadas);
        localStorage.setItem('consorciosync_cartas_poder_v1', JSON.stringify(actualizadas));
    };

    // Función de utilidad Clean Code: Saber si un usuario tiene su voto delegado (Poder APROBADO como Poderdante)
    const verificarSiVotoDelegado = (emailUsuario = usuario?.email) => {
        if (!emailUsuario) return null;
        const emailNorm = emailUsuario.trim().toLowerCase();
        return (
            cartasPoder.find(
                (p) =>
                    p.estado === 'APROBADO' &&
                    p.poderdante?.email?.toLowerCase() === emailNorm
            ) || null
        );
    };

    // Función de utilidad Clean Code: Obtener todos los poderes APROBADOS donde el usuario es Apoderado,
    // calculando dinámicamente el coeficiente y superficie de cada poderdante con el Motor de Ponderación.
    const obtenerPoderesComoApoderado = (emailUsuario = usuario?.email) => {
        if (!emailUsuario) return [];
        const emailNorm = emailUsuario.trim().toLowerCase();

        return cartasPoder
            .filter(
                (p) =>
                    p.estado === 'APROBADO' &&
                    p.emailApoderado?.toLowerCase() === emailNorm
            )
            .map((p) => {
                const codigosPoderdante = Array.isArray(p.poderdante?.unidades)
                    ? p.poderdante.unidades
                    : [];
                const coefDelegadoExacto = calcularCoeficienteConsolidado(
                    codigosPoderdante,
                    padronMaestro
                );
                const superficieDelegadaM2 = calcularSuperficieConsolidada(
                    codigosPoderdante,
                    padronMaestro
                );
                return {
                    ...p,
                    coeficienteDelegadoExacto: coefDelegadoExacto,
                    superficieDelegadaM2,
                };
            });
    };

    // Resumen centralizado para que los componentes de Urna consuman sin lógica repetida
    const obtenerResumenRepresentacion = (emailUsuario = usuario?.email) => {
        const poderCedidoAprobado = verificarSiVotoDelegado(emailUsuario);
        const poderesRecibidosAprobados = obtenerPoderesComoApoderado(emailUsuario);

        const coeficienteDelegadoTotalExacto = poderesRecibidosAprobados.reduce(
            (acc, p) => acc + Number(p.coeficienteDelegadoExacto || 0),
            0
        );
        const superficieDelegadaTotalM2 = poderesRecibidosAprobados.reduce(
            (acc, p) => acc + Number(p.superficieDelegadaM2 || 0),
            0
        );
        const nombresPoderdantes = poderesRecibidosAprobados
            .map((p) => p.poderdante?.nombre || p.poderdante?.email)
            .join(', ');

        return {
            tieneVotoDelegado: Boolean(poderCedidoAprobado),
            poderCedidoAprobado,
            esApoderado: poderesRecibidosAprobados.length > 0,
            poderesRecibidosAprobados,
            nombresPoderdantes,
            coeficienteDelegadoTotalExacto,
            superficieDelegadaTotalM2,
        };
    };

    const cerrarSesion = () => {
        setUsuarioBase(null);
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
                // Padrones y Motor de Ponderación Automática (m2 -> %)
                padronMaestro: padronPonderado,
                padronFisicoCrudo: padronMaestro,
                superficieTotalDelEdificio,
                obtenerPadronConPonderacion,
                agregarUnidadAlPadron,
                desvincularUnidadPadron,
                alternarEstadoContableUnidad,
                alternarMorosidadPorTitular,
                solicitudesKyc,
                registrarOnboardingKyc,
                resolverAuditoriaKyc,
                // Cartas Poder y Utilidades de Representación (Mandatos)
                cartasPoder,
                emitirCartaPoder,
                resolverCartaPoder,
                verificarSiVotoDelegado,
                obtenerPoderesComoApoderado,
                obtenerResumenRepresentacion,
                esAdmin: usuario?.rol === 'ADMINISTRADOR',
                esPropietario: usuario?.rol === 'PROPIETARIO',
                kycVerificado: Boolean(usuario?.kycVerificado),
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
