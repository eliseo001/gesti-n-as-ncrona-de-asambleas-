'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import ForoDebate from '../../../../components/ForoDebate';
import PanelSufragio from '../../../../components/PanelSufragio';
import DesignacionAutoridades from '../../../../components/DesignacionAutoridades';

export default function SalaTema({ params }) {
    const router = useRouter();
    const { usuario, faseAsamblea } = useAuth();

    const resolvedParams = typeof params?.then === 'function' ? use(params) : params;
    const idTema = resolvedParams?.id || '1';
    const esTemaAutoridades = String(idTema) === '0';
    const esAdministrador = usuario?.rol === 'ADMINISTRADOR';

    return (
        <div className="min-h-screen bg-slate-100 p-6 font-sans">
            <div className="max-w-6xl mx-auto space-y-4">

                {/* Cabecera de Navegación Contextual */}
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <button
                        onClick={() => router.push(esAdministrador ? '/admin' : '/asamblea')}
                        className="text-blue-700 font-bold hover:underline text-sm cursor-pointer"
                    >
                        {esAdministrador
                            ? '← Volver al Panel de Control'
                            : '← Volver al Orden del Día'}
                    </button>

                    <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            faseAsamblea === 'ABIERTA'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : faseAsamblea === 'CUARTO_INTERMEDIO'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                    >
                        Estado de Asamblea: {faseAsamblea}
                    </span>
                </div>

                {/* Encabezado del Punto del Orden del Día */}
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md border border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-slate-800 px-2.5 py-1 rounded">
                        {esTemaAutoridades
                            ? 'Tema #0 • Punto Preliminar (Art. 2062 CCyCN)'
                            : `Tema #${idTema} • Orden del Día (Art. 2060 CCyCN)`}
                    </span>
                    <h1 className="text-2xl font-bold mt-2">
                        {esTemaAutoridades
                            ? 'Designación de Presidente de Asamblea y Firmantes del Acta'
                            : 'Aprobación de presupuesto para pintura e impermeabilización'}
                    </h1>
                    <p className="text-slate-300 text-sm mt-1">
                        {esAdministrador
                            ? 'Modo Supervisión Administrativa: Participe en el foro oficial y audite el Monitor de Urna en vivo.'
                            : 'Asamblea Asíncrona Concurrente: Debata en el foro y emita o rectifique su voto durante toda la ventana activa.'}
                    </p>
                </div>

                {/* Grilla Principal: Foro y Urna operan en simultáneo mientras faseAsamblea === 'ABIERTA' */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ForoDebate faseActual={faseAsamblea} />

                    {esTemaAutoridades && !esAdministrador ? (
                        <DesignacionAutoridades />
                    ) : (
                        <PanelSufragio faseActual={faseAsamblea} />
                    )}
                </div>

            </div>
        </div>
    );
}
