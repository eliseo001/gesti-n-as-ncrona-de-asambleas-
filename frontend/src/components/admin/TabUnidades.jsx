'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Badge } from '../ui';

export default function TabUnidades() {
    const router = useRouter();
    const {
        obtenerPadronConPonderacion,
        superficieTotalDelEdificio,
        desvincularUnidadPadron,
        alternarEstadoContableUnidad,
        setTabAdminActiva,
    } = useAuth();

    // Consumimos el Motor de Ponderación Automática (m2 -> %)
    const padronPonderado = obtenerPadronConPonderacion();

    const totalUnidadesFisicas = padronPonderado.length;
    const unidadesVinculadasCount = padronPonderado.filter((u) => u.estado === 'VINCULADA').length;
    const unidadesVacantesCount = padronPonderado.filter((u) => u.estado === 'VACANTE').length;
    const unidadesMorosasCount = padronPonderado.filter((u) => u.estadoContable === 'MOROSO').length;

    // Cálculos internos con .reduce() manteniendo precisión decimal completa
    const coeficienteVinculadoTotal = padronPonderado
        .filter((u) => u.estado === 'VINCULADA')
        .reduce((acc, curr) => acc + Number(curr.coeficientePorcentual || 0), 0);

    const coeficienteHabilitadoVoto = padronPonderado
        .filter((u) => u.estado === 'VINCULADA' && u.estadoContable !== 'MOROSO')
        .reduce((acc, curr) => acc + Number(curr.coeficientePorcentual || 0), 0);

    const formatearEtiquetaCompleta = (u) => {
        const prefijo =
            u.tipo === 'Departamento'
                ? 'Depto'
                : u.tipo === 'Cochera'
                ? 'Cochera'
                : u.tipo === 'Baulera'
                ? 'Baulera'
                : 'UF';
        return `${prefijo} ${u.depto} (${u.superficieM2} m2 - ${Number(u.coeficientePorcentual).toFixed(2)}%)`;
    };

    return (
        <div className="space-y-6">
            {/* Encabezado de la Pestaña */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-4 gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-800">
                            Padrón Maestro de Unidades Funcionales (DDD)
                        </h2>
                        <Badge variant="info" size="sm" shape="rounded">
                            ⚙️ Motor de Ponderación Automática • {Number(superficieTotalDelEdificio).toFixed(2)} m² (100.00%)
                        </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                        Cada unidad almacena únicamente su <strong>Superficie (m²)</strong>. El coeficiente porcentual se calcula dinámicamente sobre la superficie total del edificio.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="light"
                        size="sm"
                        onClick={() => setTabAdminActiva('avanzada')}
                    >
                        ➕ Agregar Unidad (m²)
                    </Button>
                    <Button
                        variant="light"
                        size="sm"
                        onClick={() => setTabAdminActiva('kyc')}
                    >
                        🛡️ Auditar Reclamos KYC
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push('/onboarding')}
                    >
                        ✉️ Simular Reclamo de Unidad Vacante →
                    </Button>
                </div>
            </div>

            {/* KPIs del Padrón Maestro y Superficie Total */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="subtle" className="p-4">
                    <span className="text-xs font-bold uppercase text-slate-500 block">
                        Superficie Total del Consorcio
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                        {Number(superficieTotalDelEdificio).toFixed(2)} m²
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                        {totalUnidadesFisicas} unidades registradas (Base 100.00%)
                    </span>
                </Card>

                <Card variant="subtle" className="p-4">
                    <span className="text-xs font-bold uppercase text-slate-500 block">
                        Unidades Vinculadas (Con KYC)
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
                        {unidadesVinculadasCount} ({Number(coeficienteVinculadoTotal).toFixed(2)}%)
                    </span>
                    <span className="text-xs text-emerald-800 font-semibold mt-0.5 block">
                        ✓ Poder votante activo: {Number(coeficienteHabilitadoVoto).toFixed(2)}%
                    </span>
                </Card>

                <Card variant="subtle" className="p-4">
                    <span className="text-xs font-bold uppercase text-slate-500 block">
                        Unidades Vacantes (Onboarding)
                    </span>
                    <span className="text-2xl font-extrabold text-slate-700 mt-1 block">
                        {unidadesVacantesCount} Vacantes
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                        A la espera de acreditación dominial
                    </span>
                </Card>

                <Card
                    variant={unidadesMorosasCount > 0 ? 'danger' : 'subtle'}
                    className="p-4"
                >
                    <span className="text-xs font-bold uppercase block opacity-80">
                        Unidades en Mora Contable
                    </span>
                    <span className="text-2xl font-extrabold mt-1 block">
                        {unidadesMorosasCount} {unidadesMorosasCount === 1 ? 'Unidad' : 'Unidades'}
                    </span>
                    <span className="text-xs font-semibold mt-0.5 block">
                        {unidadesMorosasCount > 0
                            ? '⚠️ Derecho a voto suspendido (conservan voz)'
                            : '✓ Todas las unidades al día'}
                    </span>
                </Card>
            </div>

            {/* Tabla del Padrón Maestro consumiendo obtenerPadronConPonderacion() */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4 font-semibold">Unidad Fáctica</th>
                                <th className="p-4 font-semibold">Superficie y Ponderación Dinámica</th>
                                <th className="p-4 font-semibold">Estado Registral</th>
                                <th className="p-4 font-semibold">Estado Contable</th>
                                <th className="p-4 font-semibold text-right">Gestión Dominial</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {padronPonderado.map((u) => {
                                const estaVinculada = u.estado === 'VINCULADA';
                                const esMoroso = u.estadoContable === 'MOROSO';

                                return (
                                    <tr
                                        key={u.id}
                                        className={`transition-colors ${
                                            esMoroso
                                                ? 'bg-red-50/40 hover:bg-red-50/70'
                                                : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        {/* Columna 1: Unidad Fáctica */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-slate-900 text-base">
                                                    UF {u.depto}
                                                </span>
                                                {u.tipo && (
                                                    <Badge
                                                        variant={
                                                            u.tipo === 'Departamento'
                                                                ? 'primary'
                                                                : 'secondary'
                                                        }
                                                        size="sm"
                                                        shape="rounded"
                                                    >
                                                        {u.tipo}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-500 block mt-0.5">
                                                {u.ubicacion || 'Unidad Funcional'}
                                            </span>
                                        </td>

                                        {/* Columna 2: Superficie (m2) y Coeficiente Porcentual Dinámico */}
                                        <td className="p-4">
                                            <span
                                                className={`font-mono font-extrabold text-sm block ${
                                                    esMoroso
                                                        ? 'text-red-700 line-through'
                                                        : 'text-blue-700'
                                                }`}
                                            >
                                                {formatearEtiquetaCompleta(u)}
                                            </span>
                                            <span className="block text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                                                Fórmula: ({u.superficieM2} m² / {superficieTotalDelEdificio} m²) × 100
                                            </span>
                                        </td>

                                        {/* Columna 3: Estado Registral */}
                                        <td className="p-4">
                                            {estaVinculada ? (
                                                <div className="space-y-1">
                                                    <Badge variant="success">
                                                        🟢 Vinculada a {u.titularEmail}
                                                    </Badge>
                                                    {u.titularNombre && (
                                                        <span className="block text-xs text-slate-600 font-medium pl-1">
                                                            Titular: {u.titularNombre}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <Badge variant="neutral">
                                                    ⚪ Vacante / Sin KYC
                                                </Badge>
                                            )}
                                        </td>

                                        {/* Columna 4: Estado Contable (Switch de Morosos con Tooltip Explicativo) */}
                                        <td className="p-4">
                                            <div className="relative group inline-flex flex-col items-start gap-1">
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={!esMoroso}
                                                    onClick={() => alternarEstadoContableUnidad(u.id)}
                                                    title={
                                                        esMoroso
                                                            ? 'UNIDAD EN MORA: Se suspende preventivamente el derecho a voto (bloqueo del Panel de Sufragio), conservando el derecho a voz en el Foro de Debate.'
                                                            : 'UNIDAD AL DÍA: Plenitud de derechos políticos (Voz y Voto ponderado habilitados).'
                                                    }
                                                    className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer border shadow-xs ${
                                                        esMoroso
                                                            ? 'bg-red-600 hover:bg-red-700 text-white border-red-700'
                                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${
                                                            esMoroso ? 'translate-x-0' : 'translate-x-0.5'
                                                        }`}
                                                    />
                                                    <span>
                                                        {esMoroso ? '🔴 MOROSO' : '🟢 AL DÍA'}
                                                    </span>
                                                </button>

                                                {esMoroso ? (
                                                    <div className="relative">
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded cursor-help">
                                                            🔒 Voto Suspendido (Ver motivo)
                                                        </span>
                                                        <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-72 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl border border-slate-700 z-30 leading-relaxed pointer-events-none">
                                                            <p className="font-bold text-amber-300 mb-1">
                                                                ⚖️ Suspensión de Sufragio por Mora
                                                            </p>
                                                            <p className="text-slate-200">
                                                                Al marcar la unidad como <strong>MOROSO</strong>, el sistema bloquea la emisión del voto en la Urna Criptográfica, pero mantiene habilitado su derecho a voz en el Foro de Debate.
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-emerald-700 font-semibold pl-1">
                                                        ✓ Voz y Voto habilitados
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Columna 5: Gestión Dominial */}
                                        <td className="p-4 text-right">
                                            {estaVinculada ? (
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    onClick={() => desvincularUnidadPadron(u.id)}
                                                >
                                                    🔓 Desvincular por Venta
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setTabAdminActiva('kyc')}
                                                >
                                                    Ver Reclamos KYC →
                                                </Button>
                                            )}
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
