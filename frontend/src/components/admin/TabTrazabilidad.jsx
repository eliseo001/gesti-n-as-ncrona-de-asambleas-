'use client';
import { useState } from 'react';

export default function TabTrazabilidad() {
    const [logs] = useState([
        { id: 1, destinatario: 'juan@unidad1a.com', tipo: 'Convocatoria', estado: 'LEIDO', fecha: '2026-10-25 10:15:33', ip: '190.231.x.x' },
        { id: 2, destinatario: 'maria@margaritas.com', tipo: 'Convocatoria', estado: 'ENTREGADO', fecha: '2026-10-25 10:15:34', ip: '-' },
        { id: 3, destinatario: 'roberto@viejo.com', tipo: 'Convocatoria', estado: 'REBOTADO', fecha: '2026-10-25 10:15:35', ip: '-' },
        { id: 4, destinatario: 'propietario4b@consorcio.com', tipo: 'Invitación KYC', estado: 'LEIDO', fecha: '2026-10-20 09:00:11', ip: '201.21.x.x' },
    ]);

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-800">Trazabilidad de Notificaciones (Logs SMTP)</h2>
                <p className="text-sm text-slate-600 mt-1">Auditoría de envíos, aperturas y rebotes para garantizar la notificación fehaciente.</p>
            </div>

            {logs.some(log => log.estado === 'REBOTADO') && (
                <div className="bg-red-50 border border-red-300 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <h3 className="font-bold text-red-900 text-sm">Alerta: Correos Rebotados Detectados</h3>
                            <p className="text-xs text-red-800 mt-0.5">La notificación no pudo ser entregada a 1 propietario(s). Requiere despacho por Carta Documento.</p>
                        </div>
                    </div>
                    <button className="bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-800">
                        Generar PDF Carta Documento
                    </button>
                </div>
            )}

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-800 text-slate-100 uppercase text-xs">
                        <tr>
                            <th className="p-3.5 font-semibold">Fecha y Hora (UTC-3)</th>
                            <th className="p-3.5 font-semibold">Destinatario</th>
                            <th className="p-3.5 font-semibold">Tipo de Aviso</th>
                            <th className="p-3.5 font-semibold">Estado SMTP</th>
                            <th className="p-3.5 font-semibold">IP Lectura</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white font-mono text-[11px]">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50">
                                <td className="p-3.5 text-slate-600">{log.fecha}</td>
                                <td className="p-3.5 font-bold text-slate-800">{log.destinatario}</td>
                                <td className="p-3.5 text-blue-700">{log.tipo}</td>
                                <td className="p-3.5">
                                    <span className={`px-2 py-1 rounded font-bold ${log.estado === 'LEIDO' ? 'bg-emerald-100 text-emerald-800' :
                                            log.estado === 'ENTREGADO' ? 'bg-blue-100 text-blue-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {log.estado}
                                    </span>
                                </td>
                                <td className="p-3.5 text-slate-500">{log.ip}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}