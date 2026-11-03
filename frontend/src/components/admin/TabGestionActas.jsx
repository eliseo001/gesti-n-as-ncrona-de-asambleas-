'use client';
import { useState } from 'react';

export default function TabGestionActas() {
    const [firmas, setFirmas] = useState({ juan: true, maria: false });
    const [actaCerrada, setActaCerrada] = useState(false);
    const [datosRubrica, setDatosRubrica] = useState({ tomo: '', folio: '' });

    const declararRebeldia = () => {
        if (confirm('¿Declarar rebeldía de María (UF 2B)? Esto cerrará el acta de forma excepcional.')) {
            setActaCerrada(true);
            alert('Acta cerrada con constancia de rebeldía criptográfica.');
        }
    };

    const registrarRubrica = (e) => {
        e.preventDefault();
        alert(`Acta N°14 asentada exitosamente en el Libro de Actas Físico (Tomo ${datosRubrica.tomo}, Folio ${datosRubrica.folio}).`);
        setDatosRubrica({ tomo: '', folio: '' });
    };

    return (
        <div className="space-y-8">
            <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-800">Gestión de Actas y Protocolización</h2>
                <p className="text-sm text-slate-600 mt-1">Monitoreo de firmas, rebeldías (Tema 0) y transcripción al libro rubricado físico.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Panel de Firmas y Rebeldía (Brecha 7) */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Estado de Firmas: Acta N° 14</h3>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <span className="text-sm font-semibold text-emerald-900">Juan (UF 1A) - Presidente</span>
                            <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-1 rounded font-bold">✓ Firmado</span>
                        </div>

                        {!actaCerrada ? (
                            <div className="flex flex-col p-3 bg-red-50 border border-red-200 rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-red-900">María (UF 2B) - Designada</span>
                                    <span className="text-xs bg-red-200 text-red-900 px-2 py-1 rounded font-bold">⚠️ Vencida (48hs)</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 rounded">Notificar Suplente</button>
                                    <button onClick={declararRebeldia} className="flex-1 bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2 rounded">Declarar Rebeldía</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center p-3 bg-slate-100 border border-slate-300 rounded-lg">
                                <span className="text-sm font-semibold text-slate-700">María (UF 2B) - Designada</span>
                                <span className="text-xs bg-slate-300 text-slate-700 px-2 py-1 rounded font-bold">Rebeldía Registrada</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel de Integración Mundo Real / Libro Físico (Brecha 8) */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 mb-2">Asiento en Libro Rubricado (RPA)</h3>
                        <p className="text-xs text-slate-500 mb-4">Vincule el documento digital con el tomo y folio del libro de actas físico para validez ante escribanos y bancos.</p>

                        <form onSubmit={registrarRubrica} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">N° de Tomo</label>
                                    <input type="text" required value={datosRubrica.tomo} onChange={e => setDatosRubrica({ ...datosRubrica, tomo: e.target.value })} className="w-full p-2 border border-slate-300 rounded text-sm" placeholder="Ej: IV" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">N° de Folio</label>
                                    <input type="text" required value={datosRubrica.folio} onChange={e => setDatosRubrica({ ...datosRubrica, folio: e.target.value })} className="w-full p-2 border border-slate-300 rounded text-sm" placeholder="Ej: 142" />
                                </div>
                            </div>
                            <button type="submit" disabled={!actaCerrada && !firmas.maria} className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
                                Registrar Protocolización Física
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}