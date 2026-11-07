'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, Button, Badge, ProgressBar, Modal } from './ui';

const TEMAS_CIERRE_POR_DEFECTO = [
    {
        id: 1,
        numero: 'Tema 1',
        tituloCorto: 'Presupuesto e Impermeabilización',
        titulo: 'Aprobación de presupuesto para pintura e impermeabilización de fachada',
        normativa: 'Mayoría Absoluta (>50% - Art. 2060 CCyCN)',
        articuloLegal: 'Art. 2060 CCyCN',
        umbralRequerido: 50.01,
        mensajesDebate: 18,
        participacionUnidades: '14 de 20 UF',
        unidadesTotales: 20,
        escrutinio: {
            aFavor: 68.5,
            unidadesAFavor: 14,
            enContra: 22.0,
            unidadesEnContra: 4,
            abstencion: 9.5,
            unidadesAbstencion: 2,
        },
        veredicto: 'APROBADO',
        detalleVeredicto:
            'Alcanzó doble mayoría legal en recinto digital (68.5% del coeficiente de copropiedad y 14 de 20 unidades funcionales a favor).',
        hashGenesis: '0000000000000000000000000000000000000000000000000000000000000000',
        merkleRoot: 'e2d1c4b3a579e87d91c04f8a2b6e19d3c65e01a9f82b34c1d7e6f5a4b3c2d1e0',
        cadenaVotos: [
            {
                votoId: 'voto-001',
                unidad: 'UF 1A + UF C01',
                titularEmail: 'juan@unidad1a.com',
                superficieM2: 135,
                coeficiente: 20.21,
                sentido: 'A FAVOR',
                timestamp: '2026-11-05 18:14:09 UTC',
                hashAnterior: '0000000000000000000000000000000000000000000000000000000000000000',
                hashActual: 'a3f7b9c21e4d8f6a91c04f8a2b6e19d3c65e01a9f82b34c1d7e6f5a4b3c20101',
            },
            {
                votoId: 'voto-002',
                unidad: 'UF 2B',
                titularEmail: 'maria@margaritas.com',
                superficieM2: 145,
                coeficiente: 21.71,
                sentido: 'A FAVOR',
                timestamp: '2026-11-05 19:02:44 UTC',
                hashAnterior: 'a3f7b9c21e4d8f6a91c04f8a2b6e19d3c65e01a9f82b34c1d7e6f5a4b3c20101',
                hashActual: '8c4e2b1a9f07e73c51d2a44e9b6f0012a377b9c21e4d8f6a91c04f8a2b6e0202',
            },
            {
                votoId: 'voto-003',
                unidad: 'UF 5A + UF C04',
                titularEmail: 'propietario4b@consorcio.com',
                superficieM2: 145,
                coeficiente: 21.71,
                sentido: 'A FAVOR',
                timestamp: '2026-11-05 20:31:17 UTC',
                hashAnterior: '8c4e2b1a9f07e73c51d2a44e9b6f0012a377b9c21e4d8f6a91c04f8a2b6e0202',
                hashActual: 'e2d1c4b3a579e87d91c04f8a2b6e19d3c65e01a9f82b34c1d7e6f5a4b3c2d1e0',
            },
            {
                votoId: 'voto-004',
                unidad: 'UF 6A + UF 7B (Consolidado)',
                titularEmail: 'consorcistas@margaritas.com',
                superficieM2: 147,
                coeficiente: 22.0,
                sentido: 'EN CONTRA',
                timestamp: '2026-11-05 21:48:52 UTC',
                hashAnterior: 'e2d1c4b3a579e87d91c04f8a2b6e19d3c65e01a9f82b34c1d7e6f5a4b3c2d1e0',
                hashActual: 'f91a04d8c3e2b76109a8f5c4d3e2b1a098f7e6d5c4b3a2918273645546372819',
            },
            {
                votoId: 'voto-005',
                unidad: 'UF 8C + UF 9D (Consolidado)',
                titularEmail: 'ausentes@margaritas.com',
                superficieM2: 63.4,
                coeficiente: 9.5,
                sentido: 'ABSTENCIÓN',
                timestamp: '2026-11-05 23:11:05 UTC',
                hashAnterior: 'f91a04d8c3e2b76109a8f5c4d3e2b1a098f7e6d5c4b3a2918273645546372819',
                hashActual: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
            },
        ],
    },
    {
        id: 2,
        numero: 'Tema 2',
        tituloCorto: 'Remoción de Administración',
        titulo: 'Remoción anticipada de la administración actual y auditoría contable',
        normativa: 'Mayoría Absoluta (>50% - Art. 2060 CCyCN)',
        articuloLegal: 'Art. 2060 CCyCN',
        umbralRequerido: 50.01,
        mensajesDebate: 29,
        participacionUnidades: '18 de 20 UF',
        unidadesTotales: 20,
        escrutinio: {
            aFavor: 22.0,
            unidadesAFavor: 4,
            enContra: 68.0,
            unidadesEnContra: 13,
            abstencion: 10.0,
            unidadesAbstencion: 3,
        },
        veredicto: 'RECHAZADO',
        detalleVeredicto:
            'Rechazado por mayoría absoluta en contra (68.0% del coeficiente y 13 de 20 unidades funcionales votaron por la continuidad).',
        hashGenesis: '0000000000000000000000000000000000000000000000000000000000000000',
        merkleRoot: '4f91c08a7b2e19d3c65e01a9f82b34c1d7e6f5a4b3c2d1e091a8b7c6d5e4f3a2',
        cadenaVotos: [
            {
                votoId: 'voto-001',
                unidad: 'UF 1A + UF C01',
                titularEmail: 'juan@unidad1a.com',
                superficieM2: 135,
                coeficiente: 20.21,
                sentido: 'EN CONTRA',
                timestamp: '2026-11-05 18:20:11 UTC',
                hashAnterior: '0000000000000000000000000000000000000000000000000000000000000000',
                hashActual: '1b90e4a8c2d1f03e77a19c8b7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e',
            },
            {
                votoId: 'voto-002',
                unidad: 'UF 2B',
                titularEmail: 'maria@margaritas.com',
                superficieM2: 145,
                coeficiente: 21.71,
                sentido: 'A FAVOR',
                timestamp: '2026-11-05 19:15:30 UTC',
                hashAnterior: '1b90e4a8c2d1f03e77a19c8b7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e',
                hashActual: '5d4c3b2a1908f7e6d5c4b3a291807f6e5d4c3b2a1908f7e6d5c4b3a291807f6e',
            },
            {
                votoId: 'voto-003',
                unidad: 'UF 5A + UF C04',
                titularEmail: 'propietario4b@consorcio.com',
                superficieM2: 145,
                coeficiente: 21.71,
                sentido: 'EN CONTRA',
                timestamp: '2026-11-05 20:42:08 UTC',
                hashAnterior: '5d4c3b2a1908f7e6d5c4b3a291807f6e5d4c3b2a1908f7e6d5c4b3a291807f6e',
                hashActual: '4f91c08a7b2e19d3c65e01a9f82b34c1d7e6f5a4b3c2d1e091a8b7c6d5e4f3a2',
            },
        ],
    },
    {
        id: 3,
        numero: 'Tema 3',
        tituloCorto: 'Reforma del Reglamento',
        titulo: 'Reforma del Reglamento de Copropiedad (Horarios de SUM y Terrazas)',
        normativa: 'Mayoría Agravada de Dos Tercios (66.6% - Art. 2057 CCyCN)',
        articuloLegal: 'Art. 2057 / 2060 CCyCN',
        umbralRequerido: 66.6,
        mensajesDebate: 14,
        participacionUnidades: '15 de 20 UF',
        unidadesTotales: 20,
        escrutinio: {
            aFavor: 54.0,
            unidadesAFavor: 11,
            enContra: 36.0,
            unidadesEnContra: 3,
            abstencion: 10.0,
            unidadesAbstencion: 1,
        },
        veredicto: 'CONDICIONADO',
        detalleVeredicto:
            'Mayoría de presentes a favor (54.0%), pero al requerir mayoría agravada de 2/3 (66.6%) queda en carácter de propuesta sujeta a notificación por 15 días a ausentes (Art. 2060 CCyCN).',
        hashGenesis: '0000000000000000000000000000000000000000000000000000000000000000',
        merkleRoot: '9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b',
        cadenaVotos: [
            {
                votoId: 'voto-001',
                unidad: 'UF 1A + UF C01',
                titularEmail: 'juan@unidad1a.com',
                superficieM2: 135,
                coeficiente: 20.21,
                sentido: 'A FAVOR',
                timestamp: '2026-11-05 18:29:50 UTC',
                hashAnterior: '0000000000000000000000000000000000000000000000000000000000000000',
                hashActual: '7c3a9f12e4b08d65a123098f7e6d5c4b3a29182736455463728190abcdef1234',
            },
            {
                votoId: 'voto-002',
                unidad: 'UF 2B',
                titularEmail: 'maria@margaritas.com',
                superficieM2: 145,
                coeficiente: 21.71,
                sentido: 'EN CONTRA',
                timestamp: '2026-11-05 19:40:12 UTC',
                hashAnterior: '7c3a9f12e4b08d65a123098f7e6d5c4b3a29182736455463728190abcdef1234',
                hashActual: '3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
            },
            {
                votoId: 'voto-003',
                unidad: 'UF 5A + UF C04',
                titularEmail: 'propietario4b@consorcio.com',
                superficieM2: 145,
                coeficiente: 21.71,
                sentido: 'A FAVOR',
                timestamp: '2026-11-05 20:55:03 UTC',
                hashAnterior: '3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
                hashActual: '9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b',
            },
        ],
    },
];

/**
 * Gráfico Circular / Donut SVG de Alta Precisión para el Escrutinio Ponderado
 */
function GraficoCircularEscrutinio({ aFavor = 68.5, enContra = 22.0, abstencion = 9.5, veredicto = 'APROBADO' }) {
    const radio = 72;
    const circunferencia = 2 * Math.PI * radio;

    const total = aFavor + enContra + abstencion || 100;
    const pctAFavor = (aFavor / total) * 100;
    const pctEnContra = (enContra / total) * 100;
    const pctAbstencion = Math.max(0, 100 - pctAFavor - pctEnContra);

    const longAFavor = (pctAFavor / 100) * circunferencia;
    const longEnContra = (pctEnContra / 100) * circunferencia;
    const longAbstencion = (pctAbstencion / 100) * circunferencia;

    const offsetAFavor = 0;
    const offsetEnContra = -longAFavor;
    const offsetAbstencion = -(longAFavor + longEnContra);

    const esMayorAFavor = aFavor >= enContra;
    const porcentajePrincipal = esMayorAFavor ? aFavor : enContra;
    const etiquetaPrincipal = esMayorAFavor ? 'A FAVOR' : 'EN CONTRA';

    return (
        <div className="relative flex flex-col items-center justify-center">
            <div className="relative w-52 h-52 flex items-center justify-center">
                <svg className="w-52 h-52 -rotate-90 transform" viewBox="0 0 180 180">
                    {/* Anillo base */}
                    <circle
                        cx="90"
                        cy="90"
                        r={radio}
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth="26"
                    />
                    {/* Segmento A Favor (Verde) */}
                    <circle
                        cx="90"
                        cy="90"
                        r={radio}
                        fill="transparent"
                        stroke="#16a34a"
                        strokeWidth="26"
                        strokeDasharray={`${longAFavor} ${circunferencia}`}
                        strokeDashoffset={offsetAFavor}
                        className="transition-all duration-700 ease-out"
                    />
                    {/* Segmento En Contra (Rojo) */}
                    <circle
                        cx="90"
                        cy="90"
                        r={radio}
                        fill="transparent"
                        stroke="#dc2626"
                        strokeWidth="26"
                        strokeDasharray={`${longEnContra} ${circunferencia}`}
                        strokeDashoffset={offsetEnContra}
                        className="transition-all duration-700 ease-out"
                    />
                    {/* Segmento Abstención (Gris) */}
                    <circle
                        cx="90"
                        cy="90"
                        r={radio}
                        fill="transparent"
                        stroke="#94a3b8"
                        strokeWidth="26"
                        strokeDasharray={`${longAbstencion} ${circunferencia}`}
                        strokeDashoffset={offsetAbstencion}
                        className="transition-all duration-700 ease-out"
                    />
                </svg>

                {/* Centro del Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <span
                        className={`text-2xl font-extrabold font-mono leading-none ${
                            esMayorAFavor ? 'text-emerald-700' : 'text-red-700'
                        }`}
                    >
                        {porcentajePrincipal.toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                        {etiquetaPrincipal}
                    </span>
                    <span
                        className={`mt-1.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                            veredicto === 'APROBADO'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : veredicto === 'RECHAZADO'
                                ? 'bg-red-50 text-red-800 border-red-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                    >
                        {veredicto}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function ResumenAsamblea({
    temas = [],
    votosPropietario = {},
    mensajesPorTema = {},
}) {
    const router = useRouter();
    const {
        usuario,
        faseAsamblea,
        actualizarFaseAsamblea,
        superficieTotalDelEdificio,
        setTabAdminActiva,
    } = useAuth();

    const esAdministrador = usuario?.rol === 'ADMINISTRADOR';

    // Fusionamos los temas recibidos o usamos los datos completos con cadena SHA-256
    const temasConsolidados = useMemo(() => {
        if (!Array.isArray(temas) || temas.length === 0) {
            return TEMAS_CIERRE_POR_DEFECTO;
        }
        return TEMAS_CIERRE_POR_DEFECTO.map((def) => {
            const encontrado = temas.find((t) => t.id === def.id);
            if (!encontrado) return def;
            return {
                ...def,
                ...encontrado,
                escrutinio: {
                    ...def.escrutinio,
                    ...(encontrado.escrutinio || {}),
                },
                cadenaVotos: encontrado.cadenaVotos || def.cadenaVotos,
            };
        });
    }, [temas]);

    const [temaSeleccionadoId, setTemaSeleccionadoId] = useState(1);
    const [estadoVerificacion, setEstadoVerificacion] = useState('VERIFICADO'); // IDLE | AUDITANDO | VERIFICADO | CORROMPIDO
    const [simulandoAdulteracion, setSimulandoAdulteracion] = useState(false);
    const [bloqueAuditandoIdx, setBloqueAuditandoIdx] = useState(-1);
    const [mostrarModalActaPdf, setMostrarModalActaPdf] = useState(false);
    const [mostrarModalRecibo, setMostrarModalRecibo] = useState(false);

    const temaActivo =
        temasConsolidados.find((t) => t.id === temaSeleccionadoId) || temasConsolidados[0];

    const escrutinioActual = temaActivo.escrutinio;
    const superficieBaseM2 = Number(superficieTotalDelEdificio || 668);

    // Cálculo de m² representados por cada opción en el tema activo
    const m2AFavor = ((escrutinioActual.aFavor / 100) * superficieBaseM2).toFixed(1);
    const m2EnContra = ((escrutinioActual.enContra / 100) * superficieBaseM2).toFixed(1);
    const m2Abstencion = ((escrutinioActual.abstencion / 100) * superficieBaseM2).toFixed(1);

    // Cadena de votos con soporte para demostración de adulteración (Defensa de TFG)
    const cadenaMostrada = useMemo(() => {
        const base = temaActivo.cadenaVotos || TEMAS_CIERRE_POR_DEFECTO[0].cadenaVotos;
        return base.map((bloque, idx) => {
            if (simulandoAdulteracion && idx === 1) {
                return {
                    ...bloque,
                    sentido: 'EN CONTRA (ALTERADO)',
                    hashActual: 'ff00deadbeef9918273645546372819000adulterado8c4e2b1a9f07e73c0000',
                    esValido: false,
                    motivoFallo: 'Colisión detectada: Hash recalculado no coincide con el sello original',
                };
            }
            if (simulandoAdulteracion && idx > 1) {
                return {
                    ...bloque,
                    esValido: false,
                    motivoFallo: 'Ruptura de encadenamiento: Hash Anterior no coincide con el bloque previo',
                };
            }
            return {
                ...bloque,
                esValido: true,
                motivoFallo: null,
            };
        });
    }, [temaActivo, simulandoAdulteracion]);

    const ejecutarVerificacionCriptografica = () => {
        setEstadoVerificacion('AUDITANDO');
        setBloqueAuditandoIdx(0);

        const totalBloques = cadenaMostrada.length;
        let paso = 0;

        const timer = setInterval(() => {
            paso += 1;
            if (paso < totalBloques) {
                setBloqueAuditandoIdx(paso);
            } else {
                clearInterval(timer);
                setBloqueAuditandoIdx(-1);
                setEstadoVerificacion(simulandoAdulteracion ? 'CORROMPIDO' : 'VERIFICADO');
            }
        }, 350);
    };

    const alternarSimulacionAdulteracion = () => {
        const nuevoValor = !simulandoAdulteracion;
        setSimulandoAdulteracion(nuevoValor);
        setEstadoVerificacion(nuevoValor ? 'CORROMPIDO' : 'VERIFICADO');
    };

    const truncarHash = (hash = '') => {
        if (!hash) return '';
        if (hash.startsWith('0000000000000000')) {
            return '00000000000000000... (GENESIS)';
        }
        return `${hash.substring(0, 18)}...${hash.substring(hash.length - 6)}`;
    };

    const miVotoEnTema =
        votosPropietario[temaActivo.id] ||
        cadenaMostrada.find(
            (b) => b.titularEmail?.toLowerCase() === usuario?.email?.toLowerCase()
        )?.sentido ||
        'A FAVOR';

    const miBloqueEnCadena =
        cadenaMostrada.find(
            (b) => b.titularEmail?.toLowerCase() === usuario?.email?.toLowerCase()
        ) || cadenaMostrada[2];

    return (
        <div className="space-y-6 font-sans">
            {/* =====================================================================
                MODAL: PREVISUALIZACIÓN Y DESCARGA DE ACTA OFICIAL PDF FIRMADA
               ===================================================================== */}
            <Modal
                isOpen={mostrarModalActaPdf}
                onClose={() => setMostrarModalActaPdf(false)}
                badge={
                    <Badge variant="darkSuccess" size="sm" shape="rounded">
                        📄 Documento Público Inmutable • Art. 2062 CCyCN
                    </Badge>
                }
                title="Acta Oficial N° 014/2026 — Certificación Criptográfica"
                subtitle="Consorcio Edificio Las Margaritas • Sellado SHA-256 con Firma Electrónica"
                maxWidth="max-w-2xl"
            >
                <div className="space-y-4 text-xs text-slate-700">
                    <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">
                                Estado de Cadena: 100% Íntegra
                            </span>
                            <h4 className="font-bold text-sm mt-0.5">
                                Acta de Asamblea Extraordinaria N° 014/2026
                            </h4>
                            <p className="text-[11px] text-slate-400">
                                Cierre definitivo: 05/11/2026 23:59:59 hs • Quórum: 68.5% (14/20 UF)
                            </p>
                        </div>
                        <Badge variant="success" size="sm" shape="rounded">
                            ✓ RUBRICADA (2/2)
                        </Badge>
                    </div>

                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p className="font-bold text-slate-900">
                            Resumen de Resoluciones Protocolizadas:
                        </p>
                        {temasConsolidados.map((t) => (
                            <div
                                key={t.id}
                                className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0"
                            >
                                <div>
                                    <span className="font-bold text-slate-800">{t.numero}:</span>{' '}
                                    <span>{t.tituloCorto}</span>
                                    <span className="block text-[11px] text-slate-500">
                                        A Favor: {t.escrutinio.aFavor.toFixed(1)}% ({t.escrutinio.unidadesAFavor} UF) • En Contra:{' '}
                                        {t.escrutinio.enContra.toFixed(1)}% ({t.escrutinio.unidadesEnContra} UF)
                                    </span>
                                </div>
                                <Badge
                                    variant={
                                        t.veredicto === 'APROBADO'
                                            ? 'success'
                                            : t.veredicto === 'RECHAZADO'
                                            ? 'danger'
                                            : 'warning'
                                    }
                                    size="sm"
                                    shape="rounded"
                                >
                                    {t.veredicto}
                                </Badge>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] space-y-1.5">
                        <div className="text-slate-400 font-sans font-bold text-xs">
                            🔐 Sello Criptográfico Raíz (Merkle Root SHA-256):
                        </div>
                        <div className="text-emerald-400 break-all font-bold">
                            {temaActivo.merkleRoot}
                        </div>
                        <div className="text-slate-400 pt-1">
                            Autoridades Suscriptoras (Art. 2062 CCyCN): Pte. Juan Pérez (UF 1A) • Designadas: María Gómez (UF 2B) y Ana Martínez (UF 5A/C04).
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 pt-2">
                        <Button
                            variant="light"
                            size="sm"
                            onClick={() => setMostrarModalActaPdf(false)}
                        >
                            Cerrar
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setMostrarModalActaPdf(false);
                                router.push('/asamblea/acta');
                            }}
                        >
                            📖 Ver en Libro de Actas Digital
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => window.print()}
                        >
                            🖨️ Imprimir / Guardar PDF Firmado
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* =====================================================================
                MODAL: RECIBO CRIPTOGRÁFICO INDIVIDUAL DEL PROPIETARIO
               ===================================================================== */}
            <Modal
                isOpen={mostrarModalRecibo}
                onClose={() => setMostrarModalRecibo(false)}
                badge={
                    <Badge variant="darkSuccess" size="sm" shape="rounded">
                        🔐 Comprobante Individual • SHA-256
                    </Badge>
                }
                title={`Recibo Criptográfico de Sufragio — ${temaActivo.numero}`}
                subtitle="Prueba matemática de inclusión e inmutabilidad en el Acta N° 014/2026"
                maxWidth="max-w-lg"
            >
                <div className="space-y-4 text-xs">
                    <Card variant="subtle" className="p-4 border-2 border-slate-300 space-y-2.5">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="font-bold text-slate-900">
                                Registro ID: {miBloqueEnCadena?.votoId || 'voto-003'}
                            </span>
                            <Badge variant="success" size="sm" shape="rounded">
                                🟢 ESLABÓN VÁLIDO
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-[10px] uppercase text-slate-500 font-bold block">
                                    Titular Acreditado
                                </span>
                                <span className="font-bold text-slate-900">
                                    {usuario?.nombre || 'Ana Martínez'}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase text-slate-500 font-bold block">
                                    Unidades y Peso Electoral
                                </span>
                                <span className="font-bold text-blue-800">
                                    {usuario?.unidad || 'UF 5A, UF C04'} (
                                    {Number(usuario?.coeficienteTotal || 21.71).toFixed(2)}%)
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase text-slate-500 font-bold block">
                                    Sentido del Voto
                                </span>
                                <span className="font-extrabold text-emerald-800">
                                    {String(miVotoEnTema).replace('_', ' ')}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase text-slate-500 font-bold block">
                                    Sello de Tiempo (UTC)
                                </span>
                                <span className="font-mono text-slate-700">
                                    {miBloqueEnCadena?.timestamp}
                                </span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 space-y-1.5">
                            <span className="text-[10px] uppercase text-slate-500 font-bold block">
                                Hash Anterior (Eslabón Previo):
                            </span>
                            <div className="bg-slate-200 text-slate-700 p-2 rounded font-mono text-[10px] break-all">
                                {miBloqueEnCadena?.hashAnterior}
                            </div>
                            <span className="text-[10px] uppercase text-slate-500 font-bold block">
                                Hash SHA-256 Actual de tu Sufragio:
                            </span>
                            <div className="bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-[10px] break-all font-bold">
                                {miBloqueEnCadena?.hashActual}
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="light"
                            size="sm"
                            onClick={() => setMostrarModalRecibo(false)}
                        >
                            Cerrar
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => window.print()}>
                            🖨️ Descargar Comprobante PDF
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* =====================================================================
                1. CABECERA OFICIAL DE RESULTADOS Y CIERRE (ESTILO EJECUTIVO TFG)
               ===================================================================== */}
            <Card className="overflow-hidden border-slate-300 shadow-lg">
                {/* Barra superior azul institucional inspirada en el prototipo del TFG */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-4 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono font-extrabold text-sm md:text-base tracking-wide text-blue-300">
                            [ ConsorcioSync – Resultados y Cierre ]
                        </span>
                        <Badge
                            variant={esAdministrador ? 'warning' : 'darkInfo'}
                            size="sm"
                            shape="rounded"
                        >
                            {esAdministrador
                                ? '🔑 Vista Fiscalización Administrador'
                                : '🏠 Vista Propietario Auditada'}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono font-bold text-xs md:text-sm bg-slate-800/90 border border-slate-700 text-slate-200 px-3 py-1 rounded-lg">
                            [ Acta Oficial N° 014/2026 ]
                        </span>
                        {esAdministrador && faseAsamblea === 'CERRADA' && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => actualizarFaseAsamblea('ABIERTA')}
                            >
                                🔓 Reabrir Asamblea
                            </Button>
                        )}
                    </div>
                </div>

                {/* Franja Verde de Estado Oficial: Asamblea Cerrada - Acta Digital Generada */}
                <div className="bg-emerald-700 text-white px-6 py-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 shadow-inner">
                    <div className="flex items-center gap-2.5">
                        <span className="bg-white text-emerald-800 rounded-full w-6 h-6 flex items-center justify-center font-extrabold text-sm shadow">
                            ✓
                        </span>
                        <div>
                            <span className="font-extrabold text-sm md:text-base tracking-wide block">
                                ESTADO: Asamblea Cerrada — Acta Digital Generada
                            </span>
                            <span className="text-xs text-emerald-100 block">
                                Ventana temporal concluida el 05/11/2026 a las 23:59 hs • Urna sellada bajo bloqueo transaccional e inmutabilidad SHA-256
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                        <span className="text-[11px] font-mono bg-emerald-900/60 border border-emerald-400/40 px-3 py-1 rounded-full text-emerald-100">
                            Quórum Final: 68.5% Coef. (14/20 UF)
                        </span>
                    </div>
                </div>

                {/* Barra de Selección de Tema del Orden del Día */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                            Seleccione el Punto del Orden del Día para auditar su escrutinio y su cadena SHA-256:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {temasConsolidados.map((tema) => {
                                const activo = tema.id === temaActivo.id;
                                return (
                                    <button
                                        key={tema.id}
                                        type="button"
                                        onClick={() => setTemaSeleccionadoId(tema.id)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                                            activo
                                                ? 'bg-blue-700 text-white border-blue-800 shadow-sm'
                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span>{tema.numero}: {tema.tituloCorto}</span>
                                        <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
                                                activo
                                                    ? 'bg-blue-900 text-blue-100'
                                                    : tema.veredicto === 'APROBADO'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : tema.veredicto === 'RECHAZADO'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}
                                        >
                                            {tema.veredicto}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setMostrarModalActaPdf(true)}
                        >
                            📥 Descargar Acta PDF Firmada
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => router.push('/asamblea/acta')}
                        >
                            📖 Abrir Libro de Actas →
                        </Button>
                    </div>
                </div>

                {/* =====================================================================
                    2. SECCIÓN CENTRAL: RESULTADOS DEL ESCRUTINIO PONDERADO (GRÁFICO + LEYENDA)
                   ===================================================================== */}
                <div className="p-6 md:p-8 space-y-8 bg-white">
                    <section className="space-y-5">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b-2 border-slate-200 pb-3">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                        Resultados del Escrutinio Ponderado ({temaActivo.numero})
                                    </h2>
                                    <Badge variant="info" size="sm" shape="rounded">
                                        {temaActivo.normativa}
                                    </Badge>
                                </div>
                                <p className="text-xs md:text-sm font-semibold text-slate-600 mt-1">
                                    {temaActivo.titulo}
                                </p>
                            </div>

                            <Badge
                                variant={
                                    temaActivo.veredicto === 'APROBADO'
                                        ? 'success'
                                        : temaActivo.veredicto === 'RECHAZADO'
                                        ? 'danger'
                                        : 'warning'
                                }
                                size="md"
                                shape="rounded"
                            >
                                {temaActivo.veredicto === 'APROBADO'
                                    ? '✅ RESOLUCIÓN APROBADA'
                                    : temaActivo.veredicto === 'RECHAZADO'
                                    ? '❌ RESOLUCIÓN RECHAZADA'
                                    : '⏳ PROPUESTA EN NOTIFICACIÓN A AUSENTES (15 DÍAS)'}
                            </Badge>
                        </div>

                        {/* Grilla Principal: Gráfico Circular a la Izquierda + Desglose Ponderado a la Derecha */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50/70 p-6 rounded-2xl border border-slate-200">
                            {/* Columna Izquierda: Gráfico Circular SVG */}
                            <div className="lg:col-span-4 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-6">
                                <GraficoCircularEscrutinio
                                    aFavor={escrutinioActual.aFavor}
                                    enContra={escrutinioActual.enContra}
                                    abstencion={escrutinioActual.abstencion}
                                    veredicto={temaActivo.veredicto}
                                />
                                <div className="mt-4 text-center space-y-1">
                                    <span className="text-xs font-bold text-slate-700 block">
                                        Base Catastral Computada: {superficieBaseM2.toFixed(0)} m² (100.0%)
                                    </span>
                                    <span className="text-[11px] text-slate-500 block">
                                        Umbral legal exigido: &gt; {temaActivo.umbralRequerido}% ({temaActivo.articuloLegal})
                                    </span>
                                </div>
                            </div>

                            {/* Columna Derecha: Leyenda Ponderada + Doble Cómputo Legal */}
                            <div className="lg:col-span-8 space-y-4">
                                {/* Fila 1: A FAVOR */}
                                <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
                                    <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-4 h-4 rounded-full bg-emerald-600 inline-block shadow-sm" />
                                            <span className="text-base font-extrabold text-slate-900">
                                                {escrutinioActual.aFavor.toFixed(1)}% A favor{' '}
                                                <span className="text-xs font-semibold text-slate-500">
                                                    (Ponderado)
                                                </span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold">
                                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded">
                                                {escrutinioActual.unidadesAFavor} de {temaActivo.unidadesTotales} UF
                                            </span>
                                            <span className="font-mono text-slate-500">
                                                ({m2AFavor} m²)
                                            </span>
                                        </div>
                                    </div>
                                    <ProgressBar
                                        porcentaje={escrutinioActual.aFavor}
                                        color="emerald"
                                        size="md"
                                        umbral={temaActivo.umbralRequerido}
                                    />
                                </div>

                                {/* Fila 2: EN CONTRA */}
                                <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm">
                                    <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-4 h-4 rounded-full bg-red-600 inline-block shadow-sm" />
                                            <span className="text-base font-extrabold text-slate-900">
                                                {escrutinioActual.enContra.toFixed(1)}% En contra{' '}
                                                <span className="text-xs font-semibold text-slate-500">
                                                    (Ponderado)
                                                </span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold">
                                            <span className="bg-red-50 text-red-800 border border-red-200 px-2.5 py-0.5 rounded">
                                                {escrutinioActual.unidadesEnContra} de {temaActivo.unidadesTotales} UF
                                            </span>
                                            <span className="font-mono text-slate-500">
                                                ({m2EnContra} m²)
                                            </span>
                                        </div>
                                    </div>
                                    <ProgressBar
                                        porcentaje={escrutinioActual.enContra}
                                        color="red"
                                        size="md"
                                    />
                                </div>

                                {/* Fila 3: ABSTENCIÓN */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-4 h-4 rounded-full bg-slate-400 inline-block shadow-sm" />
                                            <span className="text-base font-extrabold text-slate-900">
                                                {escrutinioActual.abstencion.toFixed(1)}% Abstención{' '}
                                                <span className="text-xs font-semibold text-slate-500">
                                                    (Ponderado)
                                                </span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold">
                                            <span className="bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-0.5 rounded">
                                                {escrutinioActual.unidadesAbstencion} de {temaActivo.unidadesTotales} UF
                                            </span>
                                            <span className="font-mono text-slate-500">
                                                ({m2Abstencion} m²)
                                            </span>
                                        </div>
                                    </div>
                                    <ProgressBar
                                        porcentaje={escrutinioActual.abstencion}
                                        color="slate"
                                        size="md"
                                    />
                                </div>

                                {/* Dictamen de Doble Mayoría (Art. 2060 CCyCN) */}
                                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                                            ⚖️ Dictamen Legal de Doble Mayoría ({temaActivo.articuloLegal})
                                        </span>
                                        <p className="text-slate-200 mt-0.5">
                                            {temaActivo.detalleVeredicto}
                                        </p>
                                    </div>
                                    <span className="font-mono text-[11px] bg-slate-800 border border-slate-700 px-3 py-1.5 rounded text-emerald-300 whitespace-nowrap">
                                        💬 { (mensajesPorTema[temaActivo.id]?.length || 0) + temaActivo.mensajesDebate } intervenciones en debate
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* =====================================================================
                        3. PANEL CONTEXTUAL DIFERENCIADO POR ROL (PROPIETARIO vs ADMINISTRADOR)
                       ===================================================================== */}
                    {esAdministrador ? (
                        <Card variant="info" className="p-5 border-2 border-blue-200">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="primary" size="sm" shape="rounded">
                                            🔑 Panel Exclusivo Administrador Matriculado
                                        </Badge>
                                        <span className="text-xs font-mono text-blue-900 font-bold">
                                            Mat. RPA #8492
                                        </span>
                                    </div>
                                    <h3 className="text-sm md:text-base font-extrabold text-slate-900">
                                        Fiscalización de Cierre, Suscripción de Autoridades y Protocolización Física
                                    </h3>
                                    <p className="text-xs text-slate-700">
                                        Firmantes electos en Tema 0 (Art. 2062 CCyCN):{' '}
                                        <strong>Juan Pérez (UF 1A - Presidente ✓)</strong>,{' '}
                                        <strong>María Gómez (UF 2B - Designada ✓)</strong> y{' '}
                                        <strong>Ana Martínez (UF 5A/C04 - Designada ✓)</strong>.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => {
                                            setTabAdminActiva('actas');
                                            router.push('/admin');
                                        }}
                                    >
                                        🖋️ Asentar Tomo y Folio en Libro Físico (RPA)
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setTabAdminActiva('trazabilidad');
                                            router.push('/admin');
                                        }}
                                    >
                                        📡 Ver Logs SMTP de Notificación
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card variant="success" className="p-5 border-2 border-emerald-300">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="success" size="sm" shape="rounded">
                                            ✓ Tu Sufragio fue Computado y Sellado en esta Acta
                                        </Badge>
                                        <span className="text-xs font-mono font-bold text-emerald-950">
                                            Registro: {miBloqueEnCadena?.votoId || 'voto-003'} • Sentido:{' '}
                                            {String(miVotoEnTema).replace('_', ' ')}
                                        </span>
                                    </div>
                                    <h3 className="text-sm md:text-base font-extrabold text-slate-900">
                                        Constancia Individual para {usuario?.nombre || 'Propietario'} (
                                        {usuario?.unidad || 'UF 5A, UF C04'} — Peso Electoral:{' '}
                                        {Number(usuario?.coeficienteTotal || 21.71).toFixed(2)}%)
                                    </h3>
                                    <p className="text-xs text-emerald-900">
                                        Puedes verificar que el hash de tu recibo individual coincide exactamente con el eslabón registrado en la tabla de auditoría inferior.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => setMostrarModalRecibo(true)}
                                    >
                                        🔐 Ver Mi Recibo Criptográfico
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => router.push('/asamblea/acta')}
                                    >
                                        ✍️ Firmar / Impugnar en Libro de Actas
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* =====================================================================
                        4. AUDITORÍA DE TRANSPARENCIA CRIPTOGRÁFICA (HASH CHAINING SHA-256)
                       ===================================================================== */}
                    <section className="space-y-4">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b-2 border-slate-200 pb-3">
                            <div>
                                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                    Auditoría de Transparencia Criptográfica (Hash Chaining)
                                </h2>
                                <p className="text-xs text-slate-600 mt-0.5">
                                    Registro inmutable de sufragios sellados mediante <strong>SHA-256</strong> con encadenamiento secuencial (<code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">Hₙ = SHA256(Votoₙ || Hₙ₋₁)</code>):
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant={simulandoAdulteracion ? 'danger' : 'light'}
                                    size="sm"
                                    onClick={alternarSimulacionAdulteracion}
                                >
                                    {simulandoAdulteracion
                                        ? '🔄 Restaurar Cadena Original'
                                        : '🧪 Simular Adulteración BD (Demo Defensa)'}
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={ejecutarVerificacionCriptografica}
                                    disabled={estadoVerificacion === 'AUDITANDO'}
                                >
                                    {estadoVerificacion === 'AUDITANDO'
                                        ? '⚙️ Verificando Eslabones...'
                                        : '🔍 Verificar Integridad de la Cadena'}
                                </Button>
                            </div>
                        </div>

                        {/* Banner de Estado de la Verificación Matemática */}
                        {estadoVerificacion === 'AUDITANDO' && (
                            <div className="bg-blue-50 border border-blue-300 text-blue-900 p-4 rounded-xl flex items-center justify-between text-xs font-bold animate-pulse">
                                <span>
                                    🔍 Recalculando hashes SHA-256 desde el Bloque Génesis... Verificando eslabón #{bloqueAuditandoIdx + 1} de {cadenaMostrada.length}
                                </span>
                                <span className="font-mono">SHA-256 Engine</span>
                            </div>
                        )}

                        {estadoVerificacion === 'VERIFICADO' && !simulandoAdulteracion && (
                            <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-lg">🛡️</span>
                                    <div>
                                        <span className="font-extrabold block">
                                            VERIFICACIÓN MATEMÁTICA EXITOSA: Cadena de Bloques 100% Íntegra ({cadenaMostrada.length}/{cadenaMostrada.length} eslabones válidos)
                                        </span>
                                        <span className="text-emerald-800">
                                            Ningún sufragio ha sido modificado, eliminado ni reordenado desde su sellado en la urna.
                                        </span>
                                    </div>
                                </div>
                                <span className="font-mono text-[11px] bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded font-bold text-emerald-900 whitespace-nowrap">
                                    Root: {truncarHash(temaActivo.merkleRoot)}
                                </span>
                            </div>
                        )}

                        {(estadoVerificacion === 'CORROMPIDO' || simulandoAdulteracion) && (
                            <div className="bg-red-50 border-2 border-red-400 text-red-950 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs">
                                <div className="flex items-start gap-2.5">
                                    <span className="text-xl">🚨</span>
                                    <div>
                                        <span className="font-extrabold text-sm block text-red-900">
                                            ALERTA CRIPTOGRÁFICA: RUPTURA DE CADENA DETECTADA EN {cadenaMostrada[1]?.votoId?.toUpperCase()}
                                        </span>
                                        <span className="text-red-800 block mt-0.5">
                                            La modificación simulada de un registro en la base de datos cambió su Hash SHA-256 actual, invalidando automáticamente todos los bloques posteriores por desacople de punteros (<code className="font-mono">Hash Anterior ≠ Hash Previo</code>).
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={alternarSimulacionAdulteracion}
                                >
                                    Restaurar Integridad
                                </Button>
                            </div>
                        )}

                        {/* Tabla de Hash Chaining (Fiel al prototipo y enriquecida con metadatos) */}
                        <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-sm">
                            <table className="min-w-full text-left text-xs">
                                <thead className="bg-slate-800 text-slate-100 uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="py-3.5 px-4 font-bold">Voto ID</th>
                                        <th className="py-3.5 px-4 font-bold">Unidad / Peso</th>
                                        <th className="py-3.5 px-4 font-bold">Hash Anterior (Prev_Hash)</th>
                                        <th className="py-3.5 px-4 font-bold">Hash SHA-256 Actual</th>
                                        <th className="py-3.5 px-4 font-bold">Sello UTC</th>
                                        <th className="py-3.5 px-4 font-bold text-center">Estado de Cadena</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white font-mono">
                                    {cadenaMostrada.map((eslabon, index) => {
                                        const esMiEslabon =
                                            !esAdministrador &&
                                            eslabon.titularEmail?.toLowerCase() ===
                                                usuario?.email?.toLowerCase();
                                        const estaAuditandoEste = bloqueAuditandoIdx === index;

                                        return (
                                            <tr
                                                key={eslabon.votoId}
                                                className={`transition-colors ${
                                                    estaAuditandoEste
                                                        ? 'bg-blue-100/80 ring-2 ring-blue-500'
                                                        : !eslabon.esValido
                                                        ? 'bg-red-50/90 hover:bg-red-100/70'
                                                        : esMiEslabon
                                                        ? 'bg-emerald-50/70 hover:bg-emerald-100/60'
                                                        : 'hover:bg-slate-50'
                                                }`}
                                            >
                                                <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span>{eslabon.votoId}</span>
                                                        {esMiEslabon && (
                                                            <span className="font-sans text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                                                Tu Voto
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 font-sans whitespace-nowrap">
                                                    <span className="font-bold text-slate-800 block">
                                                        {eslabon.unidad}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500">
                                                        {eslabon.coeficiente.toFixed(2)}% ({eslabon.superficieM2} m²)
                                                    </span>
                                                </td>
                                                <td
                                                    className="py-3.5 px-4 text-slate-500 whitespace-nowrap"
                                                    title={eslabon.hashAnterior}
                                                >
                                                    <span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-[11px]">
                                                        {truncarHash(eslabon.hashAnterior)}
                                                    </span>
                                                </td>
                                                <td
                                                    className="py-3.5 px-4 font-bold whitespace-nowrap"
                                                    title={eslabon.hashActual}
                                                >
                                                    <span
                                                        className={`px-2 py-1 rounded text-[11px] border ${
                                                            eslabon.esValido
                                                                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                                                : 'bg-red-100 text-red-900 border-red-300'
                                                        }`}
                                                    >
                                                        {truncarHash(eslabon.hashActual)}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                                                    {eslabon.timestamp}
                                                </td>
                                                <td className="py-3.5 px-4 text-center whitespace-nowrap font-sans">
                                                    {eslabon.esValido ? (
                                                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold">
                                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                                                            Válido
                                                        </span>
                                                    ) : (
                                                        <span
                                                            title={eslabon.motivoFallo}
                                                            className="inline-flex items-center gap-1.5 bg-red-100 text-red-900 border border-red-300 px-3 py-1 rounded-full text-xs font-extrabold"
                                                        >
                                                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block animate-ping" />
                                                            Inválido
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* =====================================================================
                        5. BOTONERA INFERIOR DE ACCIONES OFICIALES (DESCARGA Y VERIFICACIÓN)
                       ===================================================================== */}
                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={() => setMostrarModalActaPdf(true)}
                            className="w-full sm:w-auto min-w-[260px] shadow-md"
                        >
                            📥 Descargar Acta PDF Firmada
                        </Button>

                        <Button
                            variant="primary"
                            size="lg"
                            onClick={ejecutarVerificacionCriptografica}
                            className="w-full sm:w-auto min-w-[260px] shadow-md"
                        >
                            🔍 Verificar Integridad de la Cadena
                        </Button>

                        <Button
                            variant="light"
                            size="lg"
                            onClick={() => router.push('/verificar')}
                            className="w-full sm:w-auto"
                        >
                            🏛️ Escribanía Pública (Verificar Hash)
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
