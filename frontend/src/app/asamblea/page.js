'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Client } from '@stomp/stompjs';

export default function AsambleaPage() {
    const router = useRouter();
    const [token, setToken] = useState(null);

    // Estados para manejar el tiempo real
    const [votos, setVotos] = useState([]);
    const [conectado, setConectado] = useState(false);

    // Estados para la acción de votar
    const [enviandoVoto, setEnviandoVoto] = useState(false);
    const [mensajeVoto, setMensajeVoto] = useState(null);
    const [haVotado, setHaVotado] = useState(false);

    useEffect(() => {
        const tokenGuardado = localStorage.getItem('token');

        if (!tokenGuardado) {
            router.push('/');
            return;
        }

        setToken(tokenGuardado);

        // 1. Configurar la conexión al WebSocket de Spring Boot
        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws-consorcio',
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('¡Conectado al servidor STOMP!');
                setConectado(true);

                // 2. Suscribirnos al canal de la asamblea
                client.subscribe('/topic/asamblea/1', (message) => {
                    // 3. Cuando llega un voto nuevo, lo convertimos de JSON y lo guardamos en el estado
                    const nuevoVoto = JSON.parse(message.body);
                    setVotos((prevVotos) => [nuevoVoto, ...prevVotos]);
                });
            },
            onDisconnect: () => {
                console.log('Desconectado del servidor STOMP');
                setConectado(false);
            }
        });

        // Iniciar conexión
        client.activate();

        // Limpiar la conexión cuando el usuario cierre la página
        return () => {
            client.deactivate();
        };
    }, [router]);

    const emitirVoto = async (valorVoto) => {
        if (!token || enviandoVoto) return;

        setEnviandoVoto(true);
        setMensajeVoto(null);

        try {
            const res = await fetch('http://localhost:8080/api/votos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    idTema: 1,
                    valorVoto: valorVoto
                })
            });

            const data = await res.json();

            if (!res.ok) {
                const errorTexto = data.error || (typeof data === 'object' ? Object.values(data).join(', ') : 'Error al registrar el voto');
                throw new Error(errorTexto);
            }

            setMensajeVoto({
                tipo: 'exito',
                texto: `¡Voto registrado con éxito! Sello: ${data.hashActual.substring(0, 16)}...`
            });
            setHaVotado(true);

        } catch (err) {
            setMensajeVoto({
                tipo: 'error',
                texto: err.message
            });
        } finally {
            setEnviandoVoto(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    if (!token) return <div className="p-8 text-center text-gray-500">Cargando sesión...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <header className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Panel de Asamblea Virtual</h1>
                    <p className={`text-sm font-semibold flex items-center gap-2 mt-1 ${conectado ? 'text-emerald-600' : 'text-amber-500'}`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${conectado ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
                        {conectado ? 'Canal en tiempo real activo' : 'Conectando con el servidor STOMP...'}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                >
                    Cerrar Sesión
                </button>
            </header>

            {/* Tarjeta de Votación Interactiva */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                    <div>
                        <span className="text-xs font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            Orden del Día · Tema #1
                        </span>
                        <h2 className="text-xl font-bold text-gray-800 mt-2">Aprobación Presupuesto 2027</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Discusión y votación del presupuesto general para el ejercicio 2027.
                        </p>
                    </div>

                    {/* Botones de Voto */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => emitirVoto('A_FAVOR')}
                            disabled={enviandoVoto || haVotado}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                            👍 A Favor
                        </button>
                        <button
                            onClick={() => emitirVoto('EN_CONTRA')}
                            disabled={enviandoVoto || haVotado}
                            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                            👎 En Contra
                        </button>
                        <button
                            onClick={() => emitirVoto('ABSTENCION')}
                            disabled={enviandoVoto || haVotado}
                            className="px-4 py-2.5 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                            ✋ Abstención
                        </button>
                    </div>
                </div>

                {/* Notificación de estado de la emisión */}
                {mensajeVoto && (
                    <div className={`p-3.5 rounded-xl text-sm font-medium border ${
                        mensajeVoto.tipo === 'exito'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                        {mensajeVoto.tipo === 'exito' ? '✅' : '❌'} {mensajeVoto.texto}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna Izquierda: Quórum y Votos en Vivo */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Quórum en Vivo</h3>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {votos.length} voto{votos.length === 1 ? '' : 's'}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {votos.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-6">
                                <span className="text-4xl mb-2">🗳️</span>
                                <p className="italic text-sm">Esperando que los propietarios emitan su voto...</p>
                                <p className="text-xs text-gray-400 mt-1">Usa los botones superiores para registrar tu voto.</p>
                            </div>
                        ) : (
                            votos.map((voto, index) => (
                                <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-xs transition-all hover:border-blue-200">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                                            voto.valorVoto === 'A_FAVOR'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : voto.valorVoto === 'EN_CONTRA'
                                                    ? 'bg-rose-100 text-rose-800'
                                                    : 'bg-gray-200 text-gray-700'
                                        }`}>
                                            {voto.valorVoto === 'A_FAVOR' && '👍 A FAVOR'}
                                            {voto.valorVoto === 'EN_CONTRA' && '👎 EN CONTRA'}
                                            {voto.valorVoto === 'ABSTENCION' && '✋ ABSTENCIÓN'}
                                            {!['A_FAVOR', 'EN_CONTRA', 'ABSTENCION'].includes(voto.valorVoto) && voto.valorVoto}
                                        </span>
                                        <span className="text-xs text-gray-500 font-medium">
                                            Coeficiente: <strong className="text-gray-700 font-mono">{voto.pesoCoeficiente}</strong>
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-gray-500 font-mono bg-white p-2 rounded-lg border border-gray-200 break-all mt-2">
                                        <span className="text-gray-400 block text-[10px] uppercase tracking-wide">Hash Criptográfico SHA-256</span>
                                        <span className="text-blue-700 font-semibold">{voto.hashActual}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Columna Derecha: Información del Ledger y Auditoría */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
                    <div className="border-b border-gray-100 pb-3 mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Auditoría Criptográfica</h3>
                        <p className="text-xs text-gray-500">Mecanismo de inmutabilidad del sistema de votación</p>
                    </div>

                    <div className="space-y-4 text-sm text-gray-600 flex-1 overflow-y-auto">
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <h4 className="font-bold text-blue-900 text-sm mb-1">🔗 Encadenamiento Criptográfico (Hash Chain)</h4>
                            <p className="text-xs text-blue-800 leading-relaxed">
                                Cada voto incorpora el hash del voto inmediatamente anterior. El primer voto se ancla al <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">GENESIS_HASH</code>.
                            </p>
                        </div>

                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <h4 className="font-bold text-emerald-900 text-sm mb-1">⚖️ Ponderación Legal</h4>
                            <p className="text-xs text-emerald-800 leading-relaxed">
                                El voto se computa ponderado por el <strong className="font-semibold">coeficiente de copropiedad</strong> de la unidad funcional registrada en el consorcio.
                            </p>
                        </div>

                        <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                            <h4 className="font-bold text-purple-900 text-sm mb-1">⚡ Difusión Reactiva (STOMP / WebSockets)</h4>
                            <p className="text-xs text-purple-800 leading-relaxed">
                                Tras la persistencia atómica en PostgreSQL, el backend emite un evento al canal <code className="bg-purple-100 px-1 py-0.5 rounded font-mono font-bold">/topic/asamblea/1</code> para actualizar el quórum en pantalla sin refrescar la página.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
