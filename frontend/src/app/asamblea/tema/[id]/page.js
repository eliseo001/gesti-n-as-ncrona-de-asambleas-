'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import ForoDebate from '../../../../components/ForoDebate';
import DesignacionAutoridades from '../../../../components/DesignacionAutoridades';
import PanelSufragio from '../../../../components/PanelSufragio';

export default function SalaTema({ params }) {
    const router = useRouter();
    const resolvedParams = typeof params?.then === 'function' ? use(params) : params;
    const idTema = resolvedParams?.id || '1';
    const esTemaAutoridades = String(idTema) === '0';

    return (
        <div className="min-h-screen bg-slate-100 p-6 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Navegación para volver al Lobby */}
                <button
                    onClick={() => router.push('/asamblea')}
                    className="mb-4 text-blue-700 font-bold hover:underline flex items-center gap-1 text-sm"
                >
                    ← Volver al Orden del Día
                </button>

                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md mb-6 border border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                        {esTemaAutoridades ? 'Punto Preliminar Obligatorio (Art. 2062 CCyCN)' : 'Tratamiento Ordinario (Art. 2060 CCyCN)'}
                    </span>
                    <h1 className="text-2xl font-bold mt-1">
                        {esTemaAutoridades
                            ? 'Tema #0: Designación de Autoridades y Firmantes del Acta'
                            : `Tema #${idTema}: Aprobación de presupuesto para pintura de fachada`}
                    </h1>
                    <p className="text-slate-300 text-sm mt-1">
                        Debata en el foro asíncrono (derecho a voz garantizado) y emita su voto ponderado multi-unidad.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna Izquierda: Componente de Foro en Tiempo Real (Derecho a Voz siempre activo) */}
                    <div className="h-[560px]">
                        <ForoDebate
                            temaTitulo={
                                esTemaAutoridades
                                    ? 'Postulación de Presidente y Firmantes'
                                    : 'Presupuesto Pintura de Fachada'
                            }
                        />
                    </div>

                    {/* Columna Derecha: Renderizado condicional según sea Tema 0 (Autoridades) o PanelSufragio */}
                    <div className="h-[560px]">
                        {esTemaAutoridades ? (
                            <DesignacionAutoridades />
                        ) : (
                            <PanelSufragio idTema={idTema} />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
