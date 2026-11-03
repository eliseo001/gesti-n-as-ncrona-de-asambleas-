'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MENSAJES_INICIALES = [
    {
        id: 1,
        autor: 'Juan Pérez (UF 1A)',
        rol: 'PROPIETARIO',
        texto: 'Me parece elevado el presupuesto inicial de $500.000, deberíamos revisar las garantías.',
        tiempo: '10:05',
    },
    {
        id: 2,
        autor: 'María Gómez (UF 2B)',
        rol: 'PROPIETARIO',
        texto: 'Incluye impermeabilización integral con membrana geotextil; a largo plazo evita filtraciones.',
        tiempo: '10:08',
    },
    {
        id: 3,
        autor: 'Administración Central',
        rol: 'ADMINISTRADOR',
        texto: 'Estimados copropietarios, el contratista matriculado confirmó una bonificación cerrando el monto final en $450.000.',
        tiempo: '10:15',
    },
];

export default function ForoDebate({ faseActual = 'ABIERTA' }) {
    const { usuario } = useAuth();
    const esAdministrador = usuario?.rol === 'ADMINISTRADOR';

    const [mensajes, setMensajes] = useState(MENSAJES_INICIALES);
    const [nuevoMensaje, setNuevoMensaje] = useState('');

    useEffect(() => {
        try {
            const guardados = localStorage.getItem('consorciosync_foro_mensajes');
            if (guardados) {
                setMensajes(JSON.parse(guardados));
            }
        } catch {
            // Fallback a mensajes iniciales
        }
    }, []);

    const actualizarMensajes = (nuevaLista) => {
        setMensajes(nuevaLista);
        localStorage.setItem('consorciosync_foro_mensajes', JSON.stringify(nuevaLista));
    };

    const enviarMensaje = (e) => {
        e.preventDefault();
        if (!nuevoMensaje.trim() || !usuario || faseActual !== 'ABIERTA') return;

        const etiquetaAutor = esAdministrador
            ? 'Administración Central'
            : `${usuario.nombre} (${usuario.unidad})`;

        const nuevoItem = {
            id: Date.now(),
            autor: etiquetaAutor,
            rol: usuario.rol,
            texto: nuevoMensaje.trim(),
            tiempo: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        actualizarMensajes([...mensajes, nuevoItem]);
        setNuevoMensaje('');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[580px]">
            {/* Cabecera del Foro */}
            <div className="bg-slate-900 text-white p-4 rounded-t-xl flex justify-between items-center border-b border-slate-800">
                <div>
                    <h2 className="font-bold text-base flex items-center gap-2">
                        <span>💬</span> Foro Asíncrono de Deliberación
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                        {faseActual === 'ABIERTA'
                            ? '🟢 Debate y sufragio habilitados en simultáneo'
                            : faseActual === 'CUARTO_INTERMEDIO'
                            ? '⏸️ Pausado por Cuarto Intermedio'
                            : '🔒 Asamblea Cerrada (Modo Lectura)'}
                    </p>
                </div>

                <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded border ${
                        esAdministrador
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}
                >
                    {esAdministrador ? 'Moderador (Admin)' : 'Derecho a Voz Activo'}
                </span>
            </div>

            {/* Lista de Mensajes */}
            <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4">
                {mensajes.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${
                            msg.rol === 'ADMINISTRADOR'
                                ? 'items-start'
                                : msg.rol === 'SISTEMA'
                                ? 'items-center'
                                : 'items-end'
                        }`}
                    >
                        {msg.rol === 'SISTEMA' ? (
                            <div className="bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold px-4 py-2 rounded-lg my-2 text-center shadow-sm">
                                {msg.texto}
                            </div>
                        ) : (
                            <div
                                className={`max-w-[82%] rounded-xl p-3 ${
                                    msg.rol === 'ADMINISTRADOR'
                                        ? 'bg-white border border-slate-300 shadow-sm'
                                        : 'bg-blue-100 border border-blue-200'
                                }`}
                            >
                                <div className="flex justify-between items-center gap-4 mb-1">
                                    <span
                                        className={`text-xs font-bold ${
                                            msg.rol === 'ADMINISTRADOR' ? 'text-emerald-700' : 'text-blue-900'
                                        }`}
                                    >
                                        {msg.autor}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{msg.tiempo}</span>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">{msg.texto}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Input del Foro según el estado de la Asamblea (ABIERTA / CUARTO_INTERMEDIO / CERRADA) */}
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
                {faseActual === 'ABIERTA' ? (
                    <form onSubmit={enviarMensaje} className="flex gap-2">
                        <input
                            type="text"
                            value={nuevoMensaje}
                            onChange={(e) => setNuevoMensaje(e.target.value)}
                            placeholder={
                                esAdministrador
                                    ? 'Responder consulta oficial como Administración...'
                                    : 'Escriba su argumento (puede debatir antes o después de votar)...'
                            }
                            className="flex-grow p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        />
                        <button
                            type="submit"
                            className="bg-blue-700 hover:bg-blue-800 text-white px-5 rounded-lg font-bold text-sm cursor-pointer transition-colors"
                        >
                            Enviar
                        </button>
                    </form>
                ) : faseActual === 'CUARTO_INTERMEDIO' ? (
                    <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-300">
                        <p className="text-xs text-amber-900 font-bold">
                            ⏸️ Asamblea en Cuarto Intermedio. El envío de mensajes se encuentra temporalmente pausado.
                        </p>
                    </div>
                ) : (
                    <div className="text-center p-3 bg-slate-100 rounded-lg border border-slate-300">
                        <p className="text-xs text-slate-600 font-bold">
                            🔒 Asamblea Cerrada. El hilo deliberativo ha quedado archivado en modo de solo lectura.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
