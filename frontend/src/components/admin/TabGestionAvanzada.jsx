'use client';
import { useState } from 'react';

export default function TabGestionAvanzada() {
    // Padrón inicial demostrando el caso de Multi-Unidad (Depto + Cochera/Baulera) y estado de Morosidad
    const [propietarios, setPropietarios] = useState([
        {
            id: 1,
            nombre: 'Juan Pérez',
            email: 'juan@margaritas.com',
            esMoroso: false,
            unidades: [
                { codigo: 'Depto 4B', tipo: 'Vivienda', coeficiente: 4.15 },
                { codigo: 'Cochera 12', tipo: 'Unidad Complementaria', coeficiente: 1.05 },
            ],
        },
        {
            id: 2,
            nombre: 'María Gómez',
            email: 'maria@margaritas.com',
            esMoroso: false,
            unidades: [
                { codigo: 'Depto 2B', tipo: 'Vivienda', coeficiente: 6.25 },
            ],
        },
        {
            id: 3,
            nombre: 'Carlos López',
            email: 'carlos@margaritas.com',
            esMoroso: true,
            unidades: [
                { codigo: 'Depto 3C', tipo: 'Vivienda', coeficiente: 4.80 },
            ],
        },
    ]);

    // Estado para el formulario de asociación de nueva unidad a un correo existente
    const [formAsociacion, setFormAsociacion] = useState({
        emailDestino: 'juan@margaritas.com',
        codigoUnidad: '',
        tipoUnidad: 'Cochera / Baulera',
        coeficiente: '',
    });

    // Toggle para activar/desactivar la suspensión del derecho a voto por deuda de expensas
    const alternarEstadoMorosidad = (idPropietario) => {
        setPropietarios((listaActual) =>
            listaActual.map((prop) =>
                prop.id === idPropietario ? { ...prop, esMoroso: !prop.esMoroso } : prop
            )
        );
        // INTEGRACIÓN BACKEND (Spring Boot):
        // PATCH /api/admin/propietarios/{idUsuario}/morosidad
        // Body: { esMoroso: boolean }
        // En VotoService, el método privado validarQuePropietarioNoSeaMoroso(idUsuario)
        // bloqueará la emisión de sufragios pero MensajeService seguirá permitiendo publicar en el foro (derecho a voz).
    };

    // Asociar una nueva unidad funcional o complementaria a un propietario existente
    const asociarUnidadAPropietario = (evento) => {
        evento.preventDefault();
        if (!formAsociacion.codigoUnidad || !formAsociacion.coeficiente) return;

        setPropietarios((listaActual) =>
            listaActual.map((prop) => {
                if (prop.email === formAsociacion.emailDestino) {
                    return {
                        ...prop,
                        unidades: [
                            ...prop.unidades,
                            {
                                codigo: formAsociacion.codigoUnidad,
                                tipo: formAsociacion.tipoUnidad,
                                coeficiente: parseFloat(formAsociacion.coeficiente),
                            },
                        ],
                    };
                }
                return prop;
            })
        );

        setFormAsociacion({ ...formAsociacion, codigoUnidad: '', coeficiente: '' });

        // INTEGRACIÓN BACKEND (Spring Boot):
        // POST /api/admin/unidades/vincular
        // Body: { emailPropietario, numeroDepto, coeficienteCopropiedad }
        // En el backend, UnidadFuncionalRepository hará un SUM(coeficiente_copropiedad) agrupado por id_usuario.
    };

    return (
        <div className="space-y-8">
            <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-800">
                    Gestión de Morosidad y Consolidación Multi-Unidad
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                    Unificación de coeficientes por titular (departamentos, cocheras y bauleras) y control de habilitación de sufragio según estado de expensas.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Formulario para asociar múltiples unidades a un mismo correo */}
                <div className="lg:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-200 h-fit">
                    <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
                        <span>🔗</span> Vincular Unidad Adicional
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                        Asocie cocheras, bauleras o segundos departamentos a un mismo titular para consolidar su peso electoral.
                    </p>

                    <form onSubmit={asociarUnidadAPropietario} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                Titular (Correo Electrónico)
                            </label>
                            <select
                                value={formAsociacion.emailDestino}
                                onChange={(e) => setFormAsociacion({ ...formAsociacion, emailDestino: e.target.value })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800"
                            >
                                {propietarios.map((p) => (
                                    <option key={p.id} value={p.email}>
                                        {p.nombre} ({p.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                Identificador de Unidad
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Baulera 04 o Cochera 15"
                                value={formAsociacion.codigoUnidad}
                                onChange={(e) => setFormAsociacion({ ...formAsociacion, codigoUnidad: e.target.value })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                Tipo de Unidad
                            </label>
                            <select
                                value={formAsociacion.tipoUnidad}
                                onChange={(e) => setFormAsociacion({ ...formAsociacion, tipoUnidad: e.target.value })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800"
                            >
                                <option value="Cochera / Baulera">Unidad Complementaria (Cochera/Baulera)</option>
                                <option value="Vivienda Funcional">Unidad Funcional (Departamento)</option>
                                <option value="Local Comercial">Local Comercial</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                Coeficiente Individual (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                placeholder="Ej: 1.05"
                                value={formAsociacion.coeficiente}
                                onChange={(e) => setFormAsociacion({ ...formAsociacion, coeficiente: e.target.value })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow transition-colors"
                        >
                            + Sumar Unidad al Titular
                        </button>
                    </form>
                </div>

                {/* Columna Derecha: Tabla de Consolidación y Toggle de Morosidad */}
                <div className="lg:col-span-2">
                    <h3 className="font-bold text-slate-800 text-base mb-4">
                        Padrón Consolidado por Propietario y Estado de Deuda
                    </h3>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-800 text-slate-100 uppercase text-xs">
                                <tr>
                                    <th className="p-3.5 font-semibold">Titular / Correo</th>
                                    <th className="p-3.5 font-semibold">Unidades Asociadas</th>
                                    <th className="p-3.5 font-semibold text-center">Coef. Agregado</th>
                                    <th className="p-3.5 font-semibold text-center">Estado Expensas</th>
                                    <th className="p-3.5 font-semibold text-right">Morosidad (Toggle)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {propietarios.map((prop) => {
                                    // Suma dinámica de los coeficientes de todas las unidades del propietario
                                    const coeficienteTotal = prop.unidades
                                        .reduce((acc, u) => acc + u.coeficiente, 0)
                                        .toFixed(2);

                                    return (
                                        <tr
                                            key={prop.id}
                                            className={`transition-colors ${
                                                prop.esMoroso ? 'bg-red-50/40' : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <td className="p-3.5">
                                                <span className="font-bold text-slate-900 block">{prop.nombre}</span>
                                                <span className="text-xs text-slate-500">{prop.email}</span>
                                            </td>

                                            <td className="p-3.5">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {prop.unidades.map((u, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded text-xs font-medium"
                                                        >
                                                            🏢 <strong>{u.codigo}</strong> ({u.coeficiente.toFixed(2)}%)
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="p-3.5 text-center">
                                                <span className="text-sm font-extrabold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                                                    {coeficienteTotal}%
                                                </span>
                                            </td>

                                            <td className="p-3.5 text-center">
                                                {prop.esMoroso ? (
                                                    <div>
                                                        <span className="bg-red-100 text-red-800 border border-red-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                                            🚫 Deudor / Moroso
                                                        </span>
                                                        <span className="block text-[10px] text-red-600 mt-1 font-semibold">
                                                            Solo Voz (Sin Voto)
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                                            ✓ Al Día
                                                        </span>
                                                        <span className="block text-[10px] text-emerald-700 mt-1 font-semibold">
                                                            Voz y Voto Activos
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="p-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => alternarEstadoMorosidad(prop.id)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                                                        prop.esMoroso ? 'bg-red-600' : 'bg-slate-300'
                                                    }`}
                                                    title="Alternar estado de morosidad"
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                            prop.esMoroso ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

