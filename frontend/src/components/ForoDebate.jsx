'use client';
import { useState } from 'react';

export default function ForoDebate({ temaTitulo }) {
    // Estado simulado de mensajes (Mock Data)
    const [mensajes, setMensajes] = useState([
        { id: 1, autor: 'Juan Perez (Unidad 2A)', fecha: '02/11 - 10:30 hs', texto: 'Me parece bien el presupuesto, pero deberíamos exigir garantía.' },
        { id: 2, autor: 'María Gómez (Unidad 1B)', fecha: '02/11 - 11:15 hs', texto: 'De acuerdo con Juan.' },
    ]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');

    const manejarEnvio = (e) => {
        e.preventDefault();
        if (!nuevoMensaje.trim()) return;

        // Simula agregar el mensaje a la interfaz inmediatamente
        setMensajes([...mensajes, {
            id: Date.now(),
            autor: 'Tú (Propietario Actual)',
            fecha: 'Ahora mismo',
            texto: nuevoMensaje
        }]);
        setNuevoMensaje('');
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="bg-blue-50 border-b border-gray-200 px-4 py-3">
                <h3 className="font-semibold text-blue-900">Historial de Debate: {temaTitulo}</h3>
            </div>

            {/* Lista de mensajes */}
            <div className="p-4 flex-grow overflow-y-auto space-y-4 max-h-96 bg-gray-50">
                {mensajes.map((msg) => (
                    <div key={msg.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm text-gray-800">{msg.autor}</span>
                            <span className="text-xs text-gray-500">{msg.fecha}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{msg.texto}</p>
                    </div>
                ))}
            </div>

            {/* Input para nuevo mensaje */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={manejarEnvio} className="flex gap-2">
                    <input
                        type="text"
                        className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Escribe un comentario..."
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                    >
                        Enviar
                    </button>
                </form>
            </div>
        </div>
    );
}