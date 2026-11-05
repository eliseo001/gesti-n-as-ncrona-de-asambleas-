'use client';
import { useState } from 'react';
import { useAuth, formatearEtiquetaUnidades } from '../../context/AuthContext';
import { Card, Button, Badge, Modal } from '../ui';

export default function TabCartasPoder() {
    const {
        cartasPoder,
        resolverCartaPoder,
        obtenerPadronConPonderacion,
    } = useAuth();

    const padronPonderado = obtenerPadronConPonderacion();

    const [mandatoActivo, setMandatoActivo] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('TODOS');

    const pendientesCount = cartasPoder.filter((p) => p.estado === 'PENDIENTE').length;
    const aprobadosCount = cartasPoder.filter((p) => p.estado === 'APROBADO').length;

    const listaFiltrada =
        filtroEstado === 'PENDIENTE'
            ? cartasPoder.filter((p) => p.estado === 'PENDIENTE')
            : cartasPoder;

    // Calcula dinámicamente los m2 y el % del poderdante usando el Motor de Ponderación
    const calcularPesoPoderdante = (mandato) => {
        const codigos = Array.isArray(mandato?.poderdante?.unidades)
            ? mandato.poderdante.unidades.map((c) =>
                  String(c).replace(/^UF\s*/i, '').trim().toUpperCase()
              )
            : [];
        const unidadesObj = padronPonderado.filter((u) =>
            codigos.includes(String(u.depto).toUpperCase())
        );
        const m2Total = unidadesObj.reduce(
            (acc, u) => acc + Number(u.superficieM2 || 0),
            0
        );
        const coefTotal = unidadesObj.reduce(
            (acc, u) => acc + Number(u.coeficientePorcentual || 0),
            0
        );
        return { m2Total, coefTotal };
    };

    const confirmarDecisionMandato = (decision) => {
        if (!mandatoActivo) return;
        resolverCartaPoder(mandatoActivo.id, decision);
        setMandatoActivo(null);
    };

    const obtenerBadgeEstado = (estado) => {
        if (estado === 'APROBADO') {
            return <Badge variant="success">🟢 APROBADO (Mandato Activo)</Badge>;
        }
        if (estado === 'RECHAZADO') {
            return <Badge variant="danger">🔴 RECHAZADO</Badge>;
        }
        return <Badge variant="warning">🟡 PENDIENTE</Badge>;
    };

    return (
        <div className="space-y-6 font-sans">

            {/* =================================================================
                MODAL DE VISADO DE CARTA PODER (AUDITORÍA DEL ADMINISTRADOR)
               ================================================================= */}
            {mandatoActivo && (
                <Modal
                    isOpen={Boolean(mandatoActivo)}
                    onClose={() => setMandatoActivo(null)}
                    title={`Visado de Carta Poder #${mandatoActivo.id}`}
                    subtitle="Auditoría de Mandato y Unificación de Personería (Art. 2060 / 2062 CCyCN)"
                    badge={
                        <Badge variant="darkInfo" size="sm" shape="rounded">
                            📜 Instrumento de Representación
                        </Badge>
                    }
                    maxWidth="max-w-2xl"
                >
                    {(() => {
                        const { m2Total, coefTotal } = calcularPesoPoderdante(mandatoActivo);
                        const unidadesTexto = formatearEtiquetaUnidades(
                            mandatoActivo.poderdante?.unidades || []
                        );

                        return (
                            <div className="space-y-5">
                                {/* Detalle de Sujetos del Mandato: Poderdante -> Apoderado */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card
                                        variant="subtle"
                                        className="p-4 border-2 border-slate-200 space-y-2"
                                    >
                                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                            <span className="text-xs font-extrabold uppercase text-slate-700">
                                                👤 1. Quien Cede el Voto (Poderdante)
                                            </span>
                                            <Badge variant="primary" size="sm">
                                                Titular
                                            </Badge>
                                        </div>
                                        <p className="font-bold text-slate-900 text-sm">
                                            {mandatoActivo.poderdante?.nombre}
                                        </p>
                                        <p className="text-xs font-mono text-slate-600">
                                            {mandatoActivo.poderdante?.email}
                                        </p>
                                        <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                                            <span className="font-semibold text-slate-700">
                                                Unidades: <strong>{unidadesTexto}</strong> ({m2Total} m²)
                                            </span>
                                            <Badge variant="info" size="sm" className="font-mono">
                                                Coef: {Number(coefTotal).toFixed(2)}%
                                            </Badge>
                                        </div>
                                    </Card>

                                    <Card
                                        variant="subtle"
                                        className="p-4 border-2 border-blue-200 bg-blue-50/40 space-y-2"
                                    >
                                        <div className="flex justify-between items-center border-b border-blue-200 pb-2">
                                            <span className="text-xs font-extrabold uppercase text-blue-950">
                                                🤝 2. A Quién Cede el Voto (Apoderado)
                                            </span>
                                            <Badge variant="info" size="sm">
                                                Representante
                                            </Badge>
                                        </div>
                                        <p className="font-bold text-slate-900 text-sm">
                                            {mandatoActivo.nombreApoderado || 'Representante Designado'}
                                        </p>
                                        <p className="text-xs font-mono font-bold text-blue-800">
                                            {mandatoActivo.emailApoderado}
                                        </p>
                                        <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                                            <span className="text-slate-600">
                                                Vigencia: <strong>{mandatoActivo.vigencia || 'Para la Asamblea actual'}</strong>
                                            </span>
                                        </div>
                                    </Card>
                                </div>

                                {/* Vista Previa del Documento Adjunto */}
                                <Card
                                    variant="subtle"
                                    className="p-4 border-2 border-slate-300 space-y-3"
                                >
                                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                        <span className="text-xs font-extrabold uppercase text-slate-800">
                                            📎 3. Documento Adjunto (Instrumento Suscripto)
                                        </span>
                                        <Badge variant="neutral" size="sm">
                                            PDF Firmado
                                        </Badge>
                                    </div>

                                    <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 font-mono text-xs text-slate-700 space-y-1.5">
                                        <div className="flex justify-between items-center font-bold text-amber-950 border-b border-amber-200 pb-1">
                                            <span>ARCHIVO: {mandatoActivo.documentoAdjunto}</span>
                                            <span>{mandatoActivo.fechaEmision}</span>
                                        </div>
                                        <p>
                                            &ldquo;Por la presente otorgo Carta Poder suficiente a favor de{' '}
                                            <strong>{mandatoActivo.emailApoderado}</strong> para que en mi nombre y representación ejerza el derecho a voto correspondiente a{' '}
                                            <strong>{unidadesTexto}</strong> ({Number(coefTotal).toFixed(2)}%)...&rdquo;
                                        </p>
                                        <p className="text-emerald-700 font-bold text-[11px] pt-1">
                                            ✓ Firma digital del titular verificada contra padrón KYC
                                        </p>
                                    </div>
                                </Card>

                                {/* Nota de impacto en la Urna Criptográfica */}
                                <Card variant="info" className="p-3.5 text-xs">
                                    <strong>⚖️ Impacto en la Urna Criptográfica:</strong> Al aprobar este mandato, se bloqueará el voto directo de <strong>{mandatoActivo.poderdante?.nombre}</strong> y su coeficiente del <strong>{Number(coefTotal).toFixed(2)}%</strong> se sumará dinámicamente a la cuenta del apoderado (<strong>{mandatoActivo.emailApoderado}</strong>).
                                </Card>

                                {/* Botones de Acción: Aprobar Mandato y Rechazar */}
                                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-slate-200">
                                    <Button
                                        variant="danger"
                                        size="md"
                                        onClick={() => confirmarDecisionMandato('RECHAZADO')}
                                    >
                                        ❌ Rechazar
                                    </Button>
                                    <Button
                                        variant="success"
                                        size="md"
                                        onClick={() => confirmarDecisionMandato('APROBADO')}
                                    >
                                        ✅ Aprobar Mandato
                                    </Button>
                                </div>
                            </div>
                        );
                    })()}
                </Modal>
            )}

            {/* CABECERA Y FILTROS DEL PANEL DE VISADO DE CARTAS PODER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        Panel de Visado de Cartas Poder (Representación Legal)
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Audite los mandatos emitidos por los propietarios. Al aprobar una Carta Poder, el coeficiente del poderdante se transfiere al apoderado en la Urna Criptográfica.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant={filtroEstado === 'PENDIENTE' ? 'primary' : 'light'}
                        size="sm"
                        onClick={() =>
                            setFiltroEstado(
                                filtroEstado === 'PENDIENTE' ? 'TODOS' : 'PENDIENTE'
                            )
                        }
                    >
                        🟡 Pendientes ({pendientesCount})
                    </Button>
                    <Badge variant="success" size="md" shape="rounded">
                        ✓ Mandatos Aprobados: {aprobadosCount}
                    </Badge>
                </div>
            </div>

            {/* Tabla de Cartas Poder */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-900 text-slate-100 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-3.5 font-semibold">Poderdante (Quien Cede)</th>
                                <th className="p-3.5 font-semibold">Unidades y Peso Cedido</th>
                                <th className="p-3.5 font-semibold">Apoderado (Representante)</th>
                                <th className="p-3.5 font-semibold">Documento Adjunto</th>
                                <th className="p-3.5 font-semibold">Estado</th>
                                <th className="p-3.5 font-semibold text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {listaFiltrada.map((mandato) => {
                                const { m2Total, coefTotal } = calcularPesoPoderdante(mandato);
                                const unidadesEtiqueta = formatearEtiquetaUnidades(
                                    mandato.poderdante?.unidades || []
                                );

                                return (
                                    <tr
                                        key={mandato.id}
                                        className={`transition-colors ${
                                            mandato.estado === 'PENDIENTE'
                                                ? 'bg-amber-50/40 hover:bg-amber-50/80'
                                                : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <td className="p-3.5">
                                            <span className="font-bold text-slate-900 block">
                                                {mandato.poderdante?.nombre}
                                            </span>
                                            <span className="text-xs font-mono text-slate-500 block">
                                                {mandato.poderdante?.email}
                                            </span>
                                        </td>

                                        <td className="p-3.5">
                                            <span className="font-bold text-slate-800 text-xs block">
                                                {unidadesEtiqueta} ({m2Total} m²)
                                            </span>
                                            <span className="font-mono font-extrabold text-blue-700 text-xs">
                                                Coef. Delegado: {Number(coefTotal).toFixed(2)}%
                                            </span>
                                        </td>

                                        <td className="p-3.5">
                                            <span className="font-bold text-blue-800 font-mono text-xs block">
                                                {mandato.emailApoderado}
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                                {mandato.vigencia || 'Para la Asamblea actual'}
                                            </span>
                                        </td>

                                        <td className="p-3.5 text-xs font-mono text-slate-700">
                                            📎 {mandato.documentoAdjunto}
                                        </td>

                                        <td className="p-3.5">
                                            {obtenerBadgeEstado(mandato.estado)}
                                        </td>

                                        <td className="p-3.5 text-right">
                                            <Button
                                                variant={
                                                    mandato.estado === 'PENDIENTE'
                                                        ? 'primary'
                                                        : 'light'
                                                }
                                                size="sm"
                                                onClick={() => setMandatoActivo(mandato)}
                                            >
                                                Auditar Mandato
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
