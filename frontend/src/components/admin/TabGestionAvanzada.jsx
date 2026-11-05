'use client';
import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Badge, Input } from '../ui';

export default function TabGestionAvanzada() {
    const {
        obtenerPadronConPonderacion,
        superficieTotalDelEdificio,
        agregarUnidadAlPadron,
        alternarMorosidadPorTitular,
    } = useAuth();

    // Consumimos el Motor de Ponderación Automática en tiempo real
    const padronPonderado = obtenerPadronConPonderacion();

    // Agrupamos las unidades vinculadas por Propietario (Titular) usando .reduce()
    const propietariosConsolidados = useMemo(() => {
        const mapaTitulares = padronPonderado
            .filter((u) => u.estado === 'VINCULADA' && u.titularEmail)
            .reduce((acc, unidad) => {
                const clave = unidad.titularEmail.toLowerCase();
                if (!acc[clave]) {
                    acc[clave] = {
                        email: unidad.titularEmail,
                        nombre: unidad.titularNombre || 'Propietario Titular',
                        unidades: [],
                    };
                }
                acc[clave].unidades.push(unidad);
                return acc;
            }, {});

        return Object.values(mapaTitulares).map((prop, index) => {
            // Cálculos internos con máxima precisión decimal usando .reduce()
            const superficieAgregadaM2 = prop.unidades.reduce(
                (acc, u) => acc + Number(u.superficieM2 || 0),
                0
            );
            const coeficienteAgregado = prop.unidades.reduce(
                (acc, u) => acc + Number(u.coeficientePorcentual || 0),
                0
            );
            const esMoroso = prop.unidades.some((u) => u.estadoContable === 'MOROSO');

            return {
                id: index + 1,
                ...prop,
                superficieAgregadaM2,
                coeficienteAgregado,
                esMoroso,
            };
        });
    }, [padronPonderado]);

    // Estado para el formulario de carga de unidad por Superficie (m2)
    const [formAsociacion, setFormAsociacion] = useState({
        emailDestino: 'juan@unidad1a.com',
        codigoUnidad: '',
        tipoUnidad: 'Cochera',
        superficieM2: '',
    });

    const asociarUnidadAPropietario = (evento) => {
        evento.preventDefault();
        const m2 = parseFloat(formAsociacion.superficieM2);
        if (!formAsociacion.codigoUnidad.trim() || Number.isNaN(m2) || m2 <= 0) return;

        const titularSeleccionado = propietariosConsolidados.find(
            (p) => p.email.toLowerCase() === formAsociacion.emailDestino.toLowerCase()
        );

        // Solo guardamos la superficieM2. El Motor de Ponderación recalcula todo el edificio automáticamente.
        agregarUnidadAlPadron({
            depto: formAsociacion.codigoUnidad,
            tipo: formAsociacion.tipoUnidad,
            ubicacion:
                formAsociacion.tipoUnidad === 'Departamento'
                    ? 'Unidad Funcional Incorporada'
                    : `Unidad Complementaria (${formAsociacion.tipoUnidad})`,
            superficieM2: m2,
            titularEmail: formAsociacion.emailDestino,
            titularNombre: titularSeleccionado?.nombre || 'Propietario Vinculado',
            estado: 'VINCULADA',
        });

        setFormAsociacion((prev) => ({
            ...prev,
            codigoUnidad: '',
            superficieM2: '',
        }));
    };

    const formatearEtiquetaTipo = (unidad) => {
        const prefijo =
            unidad.tipo === 'Departamento'
                ? 'Depto'
                : unidad.tipo === 'Cochera'
                ? 'Cochera'
                : unidad.tipo === 'Baulera'
                ? 'Baulera'
                : 'UF';
        return `${prefijo} ${unidad.depto}`;
    };

    // Suma de verificación matemática (100% del edificio)
    const sumaPorcentualEdificio = padronPonderado.reduce(
        (acc, u) => acc + u.coeficientePorcentual,
        0
    );

    return (
        <div className="space-y-8 font-sans">
            {/* Cabecera con indicador del Motor de Ponderación Automática */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-4 gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-800">
                            Gestión de Morosidad y Consolidación Multi-Unidad
                        </h2>
                        <Badge variant="info" size="sm" shape="rounded">
                            ⚙️ Motor de Ponderación Automática (m² → %)
                        </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                        Las unidades almacenan únicamente su <strong>Superficie (m²)</strong>. Al agregar una nueva unidad, el motor recalcula automáticamente los porcentajes de todo el consorcio sobre el 100%.
                    </p>
                </div>

                <Card variant="subtle" className="px-4 py-2.5 flex items-center gap-4 shrink-0">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Superficie Total Edificio
                        </span>
                        <span className="text-base font-mono font-extrabold text-slate-900">
                            {Number(superficieTotalDelEdificio).toFixed(2)} m²
                        </span>
                    </div>
                    <div className="border-l border-slate-300 pl-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Base Ponderada
                        </span>
                        <span className="text-base font-mono font-extrabold text-emerald-700">
                            {Number(sumaPorcentualEdificio).toFixed(2)}%
                        </span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Formulario de Carga por SUPERFICIE (m2) */}
                <Card variant="subtle" className="lg:col-span-1 p-5 h-fit">
                    <h3 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-2">
                        <span>🔗</span> Vincular Unidad Adicional
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                        Ingrese únicamente los <strong>metros cuadrados (m²)</strong>. El Motor de Ponderación recalculará el coeficiente porcentual de todas las unidades del edificio.
                    </p>

                    <form onSubmit={asociarUnidadAPropietario} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                Titular (Correo Electrónico)
                            </label>
                            <select
                                value={formAsociacion.emailDestino}
                                onChange={(e) =>
                                    setFormAsociacion({
                                        ...formAsociacion,
                                        emailDestino: e.target.value,
                                    })
                                }
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800"
                            >
                                {propietariosConsolidados.map((p) => (
                                    <option key={p.email} value={p.email}>
                                        {p.nombre} ({p.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Identificador de Unidad"
                            type="text"
                            required
                            placeholder="Ej: B04 o C15"
                            value={formAsociacion.codigoUnidad}
                            onChange={(e) =>
                                setFormAsociacion({
                                    ...formAsociacion,
                                    codigoUnidad: e.target.value,
                                })
                            }
                        />

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                Tipo de Unidad
                            </label>
                            <select
                                value={formAsociacion.tipoUnidad}
                                onChange={(e) =>
                                    setFormAsociacion({
                                        ...formAsociacion,
                                        tipoUnidad: e.target.value,
                                    })
                                }
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800"
                            >
                                <option value="Cochera">Unidad Complementaria (Cochera)</option>
                                <option value="Baulera">Unidad Complementaria (Baulera)</option>
                                <option value="Departamento">Unidad Funcional (Departamento)</option>
                            </select>
                        </div>

                        <Input
                            label="SUPERFICIE (m2)"
                            type="number"
                            step="0.01"
                            min="1"
                            required
                            placeholder="Ej: 15"
                            value={formAsociacion.superficieM2}
                            onChange={(e) =>
                                setFormAsociacion({
                                    ...formAsociacion,
                                    superficieM2: e.target.value,
                                })
                            }
                            helperText="El porcentaje se deriva automáticamente: (m² unidad / m² totales) × 100."
                        />

                        <Button type="submit" variant="dark" className="w-full">
                            + Guardar m² y Recalcular Padrón
                        </Button>
                    </form>
                </Card>

                {/* Columna Derecha: Tabla de Padrón Consolidado por Propietario */}
                <div className="lg:col-span-2">
                    <h3 className="font-bold text-slate-800 text-base mb-4">
                        Padrón Consolidado por Propietario y Estado de Deuda
                    </h3>

                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-slate-800 text-slate-100 uppercase text-xs">
                                    <tr>
                                        <th className="p-3.5 font-semibold">Titular / Correo</th>
                                        <th className="p-3.5 font-semibold">
                                            Unidades Asociadas (m² y % Ponderado)
                                        </th>
                                        <th className="p-3.5 font-semibold text-center">
                                            Coef. Agregado
                                        </th>
                                        <th className="p-3.5 font-semibold text-center">
                                            Estado Expensas
                                        </th>
                                        <th className="p-3.5 font-semibold text-right">
                                            Morosidad (Toggle)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {propietariosConsolidados.map((prop) => (
                                        <tr
                                            key={prop.email}
                                            className={`transition-colors ${
                                                prop.esMoroso
                                                    ? 'bg-red-50/40'
                                                    : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <td className="p-3.5">
                                                <span className="font-bold text-slate-900 block">
                                                    {prop.nombre}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {prop.email}
                                                </span>
                                            </td>

                                            <td className="p-3.5">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {prop.unidades.map((u) => (
                                                        <span
                                                            key={u.id}
                                                            className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded-md text-xs font-medium"
                                                        >
                                                            🏢{' '}
                                                            <strong>
                                                                {formatearEtiquetaTipo(u)}
                                                            </strong>{' '}
                                                            ({u.superficieM2} m2 -{' '}
                                                            {Number(u.coeficientePorcentual).toFixed(2)}
                                                            %)
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="p-3.5 text-center">
                                                <span className="text-sm font-mono font-extrabold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md block">
                                                    {Number(prop.coeficienteAgregado).toFixed(2)}%
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
                                                    Total: {prop.superficieAgregadaM2} m2
                                                </span>
                                            </td>

                                            <td className="p-3.5 text-center">
                                                {prop.esMoroso ? (
                                                    <div>
                                                        <Badge variant="danger" size="sm">
                                                            🚫 Deudor / Moroso
                                                        </Badge>
                                                        <span className="block text-[10px] text-red-600 mt-1 font-semibold">
                                                            Solo Voz (Sin Voto)
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <Badge variant="success" size="sm">
                                                            ✓ Al Día
                                                        </Badge>
                                                        <span className="block text-[10px] text-emerald-700 mt-1 font-semibold">
                                                            Voz y Voto Activos
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="p-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        alternarMorosidadPorTitular(prop.email)
                                                    }
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                                                        prop.esMoroso
                                                            ? 'bg-red-600'
                                                            : 'bg-emerald-600'
                                                    }`}
                                                    title="Alternar estado de morosidad del titular"
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                            prop.esMoroso
                                                                ? 'translate-x-6'
                                                                : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
