'use client';
import { useState } from 'react';

export default function TabCartasPoder() {
    // Lista inicial de poderes de representación activos (Art. 2059 / Reglamento de Copropiedad)
    const [poderesActivos, setPoderesActivos] = useState([
        {
            id: 101,
            unidadDelegante: '5A (Coef. 5.20%)',
            titularOriginal: 'Roberto Sánchez',
            emailApoderado: 'juan@margaritas.com',
            documentoPdf: 'CartaPoder_UF5A_Firmada.pdf',
            fechaRegistro: '31/10/2026',
            estado: 'VIGENTE',
        },
    ]);

    const [nuevoPoder, setNuevoPoder] = useState({
        unidadDelegante: '3C (Coef. 4.80%)',
        titularOriginal: 'Carlos López',
        emailApoderado: '',
        archivoPdf: null,
    });

    const manejarRegistroPoder = (evento) => {
        evento.preventDefault();
        if (!nuevoPoder.emailApoderado || !nuevoPoder.archivoPdf) return;

        const registroCreado = {
            id: Date.now(),
            unidadDelegante: nuevoPoder.unidadDelegante,
            titularOriginal: nuevoPoder.titularOriginal,
            emailApoderado: nuevoPoder.emailApoderado,
            documentoPdf: nuevoPoder.archivoPdf.name,
            fechaRegistro: new Date().toLocaleDateString('es-AR'),
            estado: 'VIGENTE',
        };

        setPoderesActivos([...poderesActivos, registroCreado]);
        setNuevoPoder({ ...nuevoPoder, emailApoderado: '', archivoPdf: null });

        // INTEGRACIÓN BACKEND (Spring Boot):
        // POST /api/admin/poderes (MultipartFormData)
        // En el backend, VotoService verificará si el usuario autenticado posee Cartas Poder vigentes
        // para sumar el coeficiente de la unidad representada al momento de emitir el sufragio.
    };

    const revocarPoder = (idPoder) => {
        setPoderesActivos(poderesActivos.filter((p) => p.id !== idPoder));
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-800">
                    Gestión de Representantes Legales (Cartas Poder)
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                    Delegación formal del derecho a voto mediante instrumento suscripto por el titular registral.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario de Alta de Carta Poder */}
                <div className="lg:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                        <span>📜</span> Asignar Nuevo Poder
                    </h3>

                    <form onSubmit={manejarRegistroPoder} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                Unidad Funcional que Delega el Voto
                            </label>
                            <select
                                value={nuevoPoder.unidadDelegante}
                                onChange={(e) => setNuevoPoder({ ...nuevoPoder, unidadDelegante: e.target.value })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800"
                            >
                                <option value="3C (Coef. 4.80%)">UF 3C - Carlos López (4.80%)</option>
                                <option value="6A (Coef. 7.10%)">UF 6A - Laura Fernández (7.10%)</option>
                                <option value="7B (Coef. 3.90%)">UF 7B - Martín Díaz (3.90%)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                Email del Apoderado (Quien Votará)
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="apoderado@margaritas.com"
                                value={nuevoPoder.emailApoderado}
                                onChange={(e) => setNuevoPoder({ ...nuevoPoder, emailApoderado: e.target.value })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                Instrumento Firmado (PDF)
                            </label>
                            <input
                                type="file"
                                accept=".pdf"
                                required
                                onChange={(e) => setNuevoPoder({ ...nuevoPoder, archivoPdf: e.target.files[0] })}
                                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 border border-slate-300 rounded-lg p-1 bg-white"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow transition-colors"
                        >
                            Registrar y Vincular Poder
                        </button>
                    </form>
                </div>

                {/* Tabla de Poderes Activos */}
                <div className="lg:col-span-2">
                    <h3 className="font-bold text-slate-800 text-base mb-4">
                        Poderes de Representación Vigentes en esta Asamblea
                    </h3>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-800 text-slate-100 uppercase text-xs">
                                <tr>
                                    <th className="p-3.5 font-semibold">UF Delegante</th>
                                    <th className="p-3.5 font-semibold">Apoderado Habilitado</th>
                                    <th className="p-3.5 font-semibold">Documento PDF</th>
                                    <th className="p-3.5 font-semibold">Estado</th>
                                    <th className="p-3.5 font-semibold text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {poderesActivos.map((poder) => (
                                    <tr key={poder.id} className="hover:bg-slate-50">
                                        <td className="p-3.5 font-bold text-slate-900">
                                            {poder.unidadDelegante}
                                            <span className="block text-xs font-normal text-slate-500">
                                                Fecha: {poder.fechaRegistro}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-blue-800 font-semibold">
                                            {poder.emailApoderado}
                                        </td>
                                        <td className="p-3.5 text-xs font-mono text-slate-700">
                                            📎 {poder.documentoPdf}
                                        </td>
                                        <td className="p-3.5">
                                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                                {poder.estado}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-right">
                                            <button
                                                onClick={() => revocarPoder(poder.id)}
                                                className="text-red-600 hover:text-red-800 text-xs font-bold underline"
                                            >
                                                Revocar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

