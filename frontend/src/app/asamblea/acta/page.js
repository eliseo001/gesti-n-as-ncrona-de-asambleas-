'use client';
import { useRouter } from 'next/navigation';
import ActaDigital from '../../../components/ActaDigital'; // Ajusta la ruta a tu carpeta components

export default function VisualizadorActa() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-200 p-6 flex flex-col items-center">

            {/* Barra de herramientas superior */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-300">
                <button
                    onClick={() => router.push('/asamblea')}
                    className="text-blue-700 font-bold hover:underline flex items-center gap-2"
                >
                    ← Volver al Lobby del Consorcio
                </button>

                <button
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded shadow font-semibold flex items-center gap-2 text-sm"
                    onClick={() => window.print()}
                >
                    🖨️ Descargar como PDF
                </button>
            </div>

            {/* Renderizamos el componente del Acta que creamos en el paso anterior */}
            {/* Pasamos true simulando que este usuario debe firmar (HU-013) */}
            <ActaDigital esPropietarioDesignado={true} />

        </div>
    );
}