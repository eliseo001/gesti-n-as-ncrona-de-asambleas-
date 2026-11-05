'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, formatearEtiquetaUnidades } from '../../context/AuthContext';
import { Card, CardHeader, Button, Badge } from '../ui';

export default function TabValidacionKyc() {
    const router = useRouter();
    const {
        solicitudesKyc,
        resolverAuditoriaKyc,
        obtenerPadronConPonderacion,
    } = useAuth();

    const padronPonderado = obtenerPadronConPonderacion();

    const [solicitudActiva, setSolicitudActiva] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('TODOS');

    const pendientesCount = solicitudesKyc.filter(
        (s) => s.estadoKyc === 'PENDIENTE_AUDITORIA'
    ).length;
    const aprobadosCount = solicitudesKyc.filter(
        (s) => s.estadoKyc === 'APROBADO'
    ).length;

    const listaFiltrada =
        filtroEstado === 'PENDIENTE_AUDITORIA'
            ? solicitudesKyc.filter((s) => s.estadoKyc === 'PENDIENTE_AUDITORIA')
            : solicitudesKyc;

    const confirmarDecisionModal = (decision) => {
        if (!solicitudActiva) return;
        resolverAuditoriaKyc(solicitudActiva.id, decision);
        setSolicitudActiva(null);
    };

    const obtenerBadgeEstado = (estado) => {
        if (estado === 'APROBADO') {
            return <Badge variant="success">🟢 APROBADO (Voto Activo)</Badge>;
        }
        if (estado === 'RECHAZADO') {
            return <Badge variant="danger">🔴 RECHAZADO (Sin Vínculo)</Badge>;
        }
        return <Badge variant="warning">🟡 PENDIENTE_AUDITORIA</Badge>;
    };

    const obtenerListaUnidades = (solicitud) => {
        if (Array.isArray(solicitud.unidadesReclamadas) && solicitud.unidadesReclamadas.length > 0) {
            return solicitud.unidadesReclamadas;
        }
        if (solicitud.deptoReclamado) return [solicitud.deptoReclamado];
        return ['4B', 'C12'];
    };

    const calcularPonderacionSolicitud = (solicitud) => {
        const codigos = obtenerListaUnidades(solicitud).map((c) =>
            String(c).replace(/^UF\s*/i, '').trim().toUpperCase()
        );
        const unidadesObj = padronPonderado.filter((u) =>
            codigos.includes(String(u.depto).toUpperCase())
        );
        const m2Total = unidadesObj.reduce((acc, u) => acc + Number(u.superficieM2 || 0), 0);
        const coefTotal = unidadesObj.reduce(
            (acc, u) => acc + Number(u.coeficientePorcentual || 0),
            0
        );
        return { m2Total, coefTotal };
    };

    return (
        <div className="space-y-6 relative font-sans">

            {/* =================================================================
                MODAL DE REVISIÓN DOCUMENTAL MULTI-UNIDAD (DNI + ESCRITURA)
               ================================================================= */}
            {solicitudActiva && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <Card className="w-full max-w-3xl shadow-2xl overflow-hidden border-slate-300">
                        <CardHeader className="p-5 flex justify-between items-start">
                            <div>
                                <Badge variant="darkInfo" size="sm" shape="rounded">
                                    Expediente KYC #{solicitudActiva.id} • Auditoría Dominial Multi-Unidad
                                </Badge>
                                <h3 className="text-lg font-bold mt-1.5">
                                    Revisión de Documentación: {solicitudActiva.nombre}
                                </h3>
                                <p className="text-xs text-slate-300 mt-0.5">
                                    Correo: <strong>{solicitudActiva.email}</strong> • Reclama:{' '}
                                    <strong className="text-blue-400">
                                        {formatearEtiquetaUnidades(obtenerListaUnidades(solicitudActiva))}
                                    </strong>{' '}
                                    | Coeficiente Total:{' '}
                                    <strong className="text-emerald-400">
                                        {Number(solicitudActiva.coeficienteTotal ?? solicitudActiva.coeficiente ?? 5.2).toFixed(2)}%
                                    </strong>
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSolicitudActiva(null)}
                            >
                                ✕ Cerrar
                            </Button>
                        </CardHeader>

                        <div className="p-6 space-y-5 bg-white max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Placeholder Visual 1: DNI (Frente / Dorso) */}
                                <Card variant="subtle" className="p-4 space-y-3 border-2 border-slate-300">
                                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                        <span className="text-xs font-extrabold uppercase text-slate-800">
                                            🪪 1. Documento Nacional de Identidad
                                        </span>
                                        <Badge variant="primary" size="sm" shape="rounded">
                                            Frente y Dorso
                                        </Badge>
                                    </div>

                                    <div className="bg-gradient-to-br from-slate-100 to-blue-50 border border-slate-300 rounded-xl p-4 space-y-2.5 shadow-inner">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-blue-900 border-b border-blue-200 pb-1">
                                            <span>República Argentina • RENAPER</span>
                                            <span>Ejemplar A</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-16 rounded-lg bg-slate-300 border border-slate-400 flex items-center justify-center text-2xl">
                                                👤
                                            </div>
                                            <div className="text-xs space-y-0.5">
                                                <p className="font-bold text-slate-900">{solicitudActiva.nombre}</p>
                                                <p className="text-slate-600 font-mono text-[11px]">
                                                    Archivo: {solicitudActiva.archivoDni}
                                                </p>
                                                <p className="text-emerald-700 font-bold text-[10px]">
                                                    ✓ Biometría y firma coincidentes
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Placeholder Visual 2: Escritura / Boleto Multi-Unidad */}
                                <Card variant="subtle" className="p-4 space-y-3 border-2 border-slate-300">
                                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                        <span className="text-xs font-extrabold uppercase text-slate-800">
                                            📜 2. Escritura / Boleto Compraventa
                                        </span>
                                        <Badge variant="info" size="sm" shape="rounded">
                                            Título Dominial
                                        </Badge>
                                    </div>

                                    <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-2 font-mono text-[11px] text-slate-700 shadow-inner">
                                        <div className="flex justify-between items-center font-bold text-amber-950 border-b border-amber-200 pb-1">
                                            <span>REGISTRO PROPIEDAD INMUEBLE</span>
                                            <span>{solicitudActiva.matriculaCatastral}</span>
                                        </div>
                                        <p>
                                            <strong>Unidades Reclamadas:</strong>{' '}
                                            {formatearEtiquetaUnidades(obtenerListaUnidades(solicitudActiva))}
                                        </p>
                                        <p>
                                            <strong>Coeficiente Total Acumulado:</strong>{' '}
                                            {Number(solicitudActiva.coeficienteTotal ?? solicitudActiva.coeficiente ?? 5.2).toFixed(2)}%
                                        </p>
                                        <p className="truncate text-slate-500">
                                            <strong>Instrumento:</strong> {solicitudActiva.archivoEscritura}
                                        </p>
                                    </div>
                                </Card>
                            </div>

                            <Card variant="info" className="p-3.5 text-xs flex items-start gap-2.5">
                                <span className="text-base">🔒</span>
                                <div>
                                    <p className="font-bold text-blue-950">
                                        Vinculación Multi-Unidad en el Padrón Maestro (Art. 2060 CCyCN):
                                    </p>
                                    <p className="text-blue-900 mt-0.5">
                                        Al aprobar, el sistema vinculará simultáneamente{' '}
                                        <strong>
                                            {formatearEtiquetaUnidades(obtenerListaUnidades(solicitudActiva))}
                                        </strong>{' '}
                                        al correo <strong>{solicitudActiva.email}</strong> y activará su poder de voto consolidado del{' '}
                                        <strong>
                                            {Number(solicitudActiva.coeficienteTotal ?? solicitudActiva.coeficiente ?? 5.2).toFixed(2)}%
                                        </strong>.
                                    </p>
                                </div>
                            </Card>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-slate-200">
                                <Button
                                    variant="danger"
                                    size="lg"
                                    onClick={() => confirmarDecisionModal('RECHAZADO')}
                                >
                                    ❌ Rechazar (Documentación Inválida)
                                </Button>
                                <Button
                                    variant="success"
                                    size="lg"
                                    onClick={() => confirmarDecisionModal('APROBADO')}
                                >
                                    ✅ Aprobar (Vincular Unidades y Activar Voto)
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* CABECERA Y FILTROS DEL PANEL DE AUDITORÍA KYC */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        Auditoría de Identidad y Vinculación Multi-Unidad (KYC)
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Revise la documentación respaldatoria (DNI y Escritura) de los propietarios en estado <strong>PENDIENTE_AUDITORIA</strong> para vincular sus unidades y activar su poder de voto consolidado.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant={filtroEstado === 'PENDIENTE_AUDITORIA' ? 'primary' : 'light'}
                        size="sm"
                        onClick={() =>
                            setFiltroEstado(
                                filtroEstado === 'PENDIENTE_AUDITORIA' ? 'TODOS' : 'PENDIENTE_AUDITORIA'
                            )
                        }
                    >
                        🟡 Pendientes ({pendientesCount})
                    </Button>
                    <Badge variant="success" size="md" shape="rounded">
                        ✓ Verificados: {aprobadosCount} / {solicitudesKyc.length}
                    </Badge>
                    <Button variant="secondary" size="sm" onClick={() => router.push('/onboarding')}>
                        + Simular Nuevo Onboarding
                    </Button>
                </div>
            </div>

            {/* Tabla de Solicitudes KYC Multi-Unidad */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-900 text-slate-100 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-3.5 font-semibold">Propietario Solicitante</th>
                                <th className="p-3.5 font-semibold">Email Invitado</th>
                                <th className="p-3.5 font-semibold">Unidades Reclamadas y Coeficiente</th>
                                <th className="p-3.5 font-semibold">Legajo Adjunto</th>
                                <th className="p-3.5 font-semibold">Estado KYC</th>
                                <th className="p-3.5 font-semibold text-right">Acción de Auditoría</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {listaFiltrada.map((solicitud) => {
                                const unidades = obtenerListaUnidades(solicitud);
                                const { m2Total, coefTotal } = calcularPonderacionSolicitud(solicitud);
                                const coefFormateado = Number(coefTotal).toFixed(2);

                                return (
                                    <tr
                                        key={solicitud.id}
                                        className={`transition-colors ${
                                            solicitud.estadoKyc === 'PENDIENTE_AUDITORIA'
                                                ? 'bg-amber-50/40 hover:bg-amber-50/80'
                                                : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <td className="p-3.5">
                                            <span className="font-bold text-slate-900 block">
                                                {solicitud.nombre}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                Enviado: {solicitud.fechaEnvio}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-slate-700 font-mono text-xs">
                                            {solicitud.email}
                                        </td>
                                        <td className="p-3.5">
                                            <div className="flex flex-wrap gap-1 mb-1">
                                                {unidades.map((cod) => (
                                                    <Badge
                                                        key={cod}
                                                        variant="primary"
                                                        size="sm"
                                                        shape="rounded"
                                                    >
                                                        UF {cod}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <span className="block text-xs text-slate-700 font-bold">
                                                Reclama: {formatearEtiquetaUnidades(unidades)} ({m2Total} m2) | Coeficiente Total: {coefFormateado}%
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-xs text-slate-600 space-y-0.5">
                                            <span className="block truncate max-w-[180px]">
                                                🪪 {solicitud.archivoDni}
                                            </span>
                                            <span className="block truncate max-w-[180px]">
                                                📜 {solicitud.archivoEscritura}
                                            </span>
                                        </td>
                                        <td className="p-3.5">
                                            {obtenerBadgeEstado(solicitud.estadoKyc)}
                                        </td>
                                        <td className="p-3.5 text-right">
                                            <Button
                                                variant={
                                                    solicitud.estadoKyc === 'PENDIENTE_AUDITORIA'
                                                        ? 'primary'
                                                        : 'light'
                                                }
                                                size="sm"
                                                onClick={() => setSolicitudActiva(solicitud)}
                                            >
                                                🔍 Revisar Documentación
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
