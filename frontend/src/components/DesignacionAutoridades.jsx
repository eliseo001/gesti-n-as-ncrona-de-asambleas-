'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DesignacionAutoridades() {
    const router = useRouter();

    // Lista mockeada de copropietarios presentes/acreditados en la asamblea
    const vecinosPresentes = [
        { id: 'UF_1A', nombre: 'Juan Pérez', unidad: '1A', coeficiente: 5.0 },
        { id: 'UF_2B', nombre: 'María Gómez', unidad: '2B', coeficiente: 6.25 },
        { id: 'UF_4B', nombre: 'Ana Martínez', unidad: '4B', coeficiente: 4.15 },
        { id: 'UF_5A', nombre: 'Roberto Sánchez (Rep. por Poder)', unidad: '5A', coeficiente: 5.2 },
        { id: 'UF_8C', nombre: 'Lucía Quiroga', unidad: '8C', coeficiente: 4.9 },
    ];

    // Estado para 1 Presidente de Asamblea (Radio) y 2 Firmantes del Acta (Checkbox)
    const [presidenteId, setPresidenteId] = useState('');
    const [firmantesIds, setFirmantesIds] = useState([]);
    const [votoRegistrado, setVotoRegistrado] = useState(false);

    // Manejo de selección de firmantes con tope estricto de 2 propietarios
    const alternarFirmante = (idVecino) => {
        if (firmantesIds.includes(idVecino)) {
            setFirmantesIds(firmantesIds.filter((id) => id !== idVecino));
        } else {
            if (firmantesIds.length >= 2) {
                alert('Por normativa (Art. 2062 CCyCN), debe seleccionar exactamente 2 propietarios para rubricar el acta.');
                return;
            }
            setFirmantesIds([...firmantesIds, idVecino]);
        }
    };

    const confirmarDesignacion = (evento) => {
        evento.preventDefault();
        if (!presidenteId || firmantesIds.length !== 2) return;

        setVotoRegistrado(true);

        // INTEGRACIÓN BACKEND (Spring Boot):
        // POST /api/votos
        // Body: {
        //   idTema: 0,
        //   valorVoto: JSON.stringify({ presidente: presidenteId, firmantes: firmantesIds })
        // }
        // El backend sella este voto con SHA-256 (HashService) y difunde la actualización
        // por WebSocket STOMP a /topic/asamblea/1.
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col justify-between h-full">
            <div>
                <div className="border-b border-slate-200 pb-3 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-2.5 py-0.5 rounded">
                        Art. 2062 CCyCN • Requisito de Validez
                    </span>
                    <h2 className="text-xl font-bold text-slate-800 mt-2">
                        Elección de Autoridades y Firmantes del Acta
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                        Seleccione <strong>un (1) Presidente de Asamblea</strong> y <strong>dos (2) Propietarios Designados</strong> para suscribir el Acta Digital al cierre de la sesión.
                    </p>
                </div>

                <form onSubmit={confirmarDesignacion} className="space-y-5">
                    {/* Tabla de Selección de Candidatos Presentes */}
                    <div className="overflow-hidden border border-slate-200 rounded-lg">
                        <table className="min-w-full text-left text-xs">
                            <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
                                <tr>
                                    <th className="p-3">Vecino Presente (Quórum)</th>
                                    <th className="p-3 text-center">Presidente (1)</th>
                                    <th className="p-3 text-center">Firmante Acta ({firmantesIds.length}/2)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {vecinosPresentes.map((vecino) => {
                                    const esPresidente = presidenteId === vecino.id;
                                    const esFirmante = firmantesIds.includes(vecino.id);

                                    return (
                                        <tr
                                            key={vecino.id}
                                            className={`transition-colors ${
                                                esPresidente || esFirmante ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <td className="p-3">
                                                <span className="font-bold text-slate-900">UF {vecino.unidad}</span> -{' '}
                                                <span className="text-slate-700 font-medium">{vecino.nombre}</span>
                                                <span className="block text-[11px] text-slate-500">
                                                    Coeficiente: {vecino.coeficiente}%
                                                </span>
                                            </td>

                                            {/* Radio Button: Presidente de Asamblea */}
                                            <td className="p-3 text-center">
                                                <input
                                                    type="radio"
                                                    name="presidenteAsamblea"
                                                    disabled={votoRegistrado}
                                                    checked={esPresidente}
                                                    onChange={() => setPresidenteId(vecino.id)}
                                                    className="w-4 h-4 text-blue-700 focus:ring-blue-600 cursor-pointer"
                                                />
                                            </td>

                                            {/* Checkbox: 2 Propietarios Designados para Firmar */}
                                            <td className="p-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    disabled={votoRegistrado}
                                                    checked={esFirmante}
                                                    onChange={() => alternarFirmante(vecino.id)}
                                                    className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-600 cursor-pointer"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Resumen de Postulación antes de firmar */}
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-700">
                        <div>
                            <span className="font-bold text-slate-900">Presidente seleccionado: </span>
                            {presidenteId ? (
                                <span className="text-blue-800 font-semibold">
                                    {vecinosPresentes.find((v) => v.id === presidenteId)?.nombre} ({presidenteId})
                                </span>
                            ) : (
                                <span className="italic text-slate-400">Sin seleccionar</span>
                            )}
                        </div>
                        <div>
                            <span className="font-bold text-slate-900">Firmantes del Acta (2 requeridos): </span>
                            {firmantesIds.length > 0 ? (
                                <span className="text-emerald-800 font-semibold">
                                    {firmantesIds
                                        .map((id) => vecinosPresentes.find((v) => v.id === id)?.nombre)
                                        .join(' y ')}
                                </span>
                            ) : (
                                <span className="italic text-slate-400">Sin seleccionar</span>
                            )}
                        </div>
                    </div>

                    {!votoRegistrado ? (
                        <button
                            type="submit"
                            disabled={!presidenteId || firmantesIds.length !== 2}
                            className={`w-full py-3 rounded-lg font-bold text-sm shadow transition-all ${
                                presidenteId && firmantesIds.length === 2
                                    ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            🗳️ Emitir Voto de Designación de Autoridades
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-xs text-center font-bold">
                                ✓ Sufragio de autoridades sellado en la cadena de hashes (SHA-256).
                            </div>
                            <button
                                type="button"
                                onClick={() => router.push('/asamblea')}
                                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg font-bold text-xs"
                            >
                                ← Volver al Orden del Día
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

