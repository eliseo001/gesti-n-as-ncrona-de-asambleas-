'use client';
import { useState } from 'react';

export default function TabValidacionKyc() {
    // Padrón mockeado con estado de notificación legal y validación KYC
    const [vecinos, setVecinos] = useState([
        {
            id: 1,
            unidad: '1A',
            propietario: 'Juan Pérez (juan@margaritas.com)',
            coeficiente: '5.00%',
            estadoNotificacion: 'LEIDA',
            fechaLectura: '01/11/2026 10:14 hs',
            documentoAdjunto: 'DNI_Frente_JuanPerez.pdf',
            estadoKyc: 'APROBADO',
        },
        {
            id: 2,
            unidad: '2B',
            propietario: 'María Gómez (maria@margaritas.com)',
            coeficiente: '6.25%',
            estadoNotificacion: 'LEIDA',
            fechaLectura: '01/11/2026 14:32 hs',
            documentoAdjunto: 'Escritura_UF2B.pdf',
            estadoKyc: 'PENDIENTE',
        },
        {
            id: 3,
            unidad: '3C',
            propietario: 'Carlos López (carlos@margaritas.com)',
            coeficiente: '4.80%',
            estadoNotificacion: 'NO_LEIDA',
            fechaLectura: '-',
            documentoAdjunto: 'DNI_CarlosLopez.jpg',
            estadoKyc: 'PENDIENTE',
        },
        {
            id: 4,
            unidad: '4B',
            propietario: 'Ana Martínez (ana@margaritas.com)',
            coeficiente: '4.15%',
            estadoNotificacion: 'LEIDA',
            fechaLectura: '01/11/2026 18:05 hs',
            documentoAdjunto: 'DNI_Frente_AnaM.png',
            estadoKyc: 'APROBADO',
        },
    ]);

    // Aprobación de identidad por parte del Administrador del Consorcio
    const aprobarIdentidadVecino = (idVecino) => {
        setVecinos((listaActual) =>
            listaActual.map((vecino) =>
                vecino.id === idVecino ? { ...vecino, estadoKyc: 'APROBADO' } : vecino
            )
        );
        // INTEGRACIÓN BACKEND (Spring Boot):
        // PATCH /api/admin/kyc/{idUsuario}/aprobar
        // Al aprobar, habilita el rol de sufragio activo en el motor criptográfico (VotoService).
        // También puede disparar un evento WebSocket a /topic/kyc/{idUsuario} para habilitar la UI en tiempo real.
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        Auditoría de Notificaciones y Validación de Identidad (KYC)
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Verificación del acuse de recibo de la convocatoria (Art. 2059 CCyCN) y habilitación en el padrón electoral.
                    </p>
                </div>
                <div className="flex gap-3 text-xs font-bold">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg">
                        Habilitados: {vecinos.filter((v) => v.estadoKyc === 'APROBADO').length} / {vecinos.length}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-800 text-slate-100 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-3.5 font-semibold">Unidad</th>
                            <th className="p-3.5 font-semibold">Propietario</th>
                            <th className="p-3.5 font-semibold">Estado de Notificación</th>
                            <th className="p-3.5 font-semibold">Respaldo Documental</th>
                            <th className="p-3.5 font-semibold">Estado KYC</th>
                            <th className="p-3.5 font-semibold text-right">Acción Administrativa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {vecinos.map((vecino) => (
                            <tr key={vecino.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3.5 font-bold text-slate-900">
                                    UF {vecino.unidad}
                                    <span className="block text-xs font-normal text-slate-500">Coef: {vecino.coeficiente}</span>
                                </td>
                                <td className="p-3.5 text-slate-700 font-medium">{vecino.propietario}</td>
                                <td className="p-3.5">
                                    {vecino.estadoNotificacion === 'LEIDA' ? (
                                        <div>
                                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                                📬 Leída (Acuse Firmado)
                                            </span>
                                            <span className="block text-[11px] text-slate-400 mt-1">{vecino.fechaLectura}</span>
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                            ⏳ No Leída
                                        </span>
                                    )}
                                </td>
                                <td className="p-3.5 text-xs font-mono text-blue-700 underline cursor-pointer">
                                    📄 {vecino.documentoAdjunto}
                                </td>
                                <td className="p-3.5">
                                    {vecino.estadoKyc === 'APROBADO' ? (
                                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-md text-xs font-bold">
                                            ✓ Aprobado
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-md text-xs font-bold">
                                            ⚠️ Pendiente de Aprobación
                                        </span>
                                    )}
                                </td>
                                <td className="p-3.5 text-right">
                                    {vecino.estadoKyc === 'PENDIENTE' ? (
                                        <button
                                            onClick={() => aprobarIdentidadVecino(vecino.id)}
                                            className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
                                        >
                                            Aprobar Identidad
                                        </button>
                                    ) : (
                                        <span className="text-xs text-slate-400 font-semibold italic">
                                            Verificado en Padrón
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

