'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, Button, Badge, Input } from './ui';

const MENSAJES_POR_TEMA_INICIALES = {
    0: [
        {
            id: 10,
            autor: 'Administración Central',
            rol: 'ADMINISTRADOR',
            texto: 'Se abre el registro de postulaciones para Presidente de Asamblea y 2 propietarios firmantes del Acta (Art. 2062 CCyCN).',
            tiempo: '09:50',
        },
        {
            id: 11,
            autor: 'Juan Pérez (UF 1A)',
            rol: 'PROPIETARIO',
            texto: 'Me postulo como Presidente de Asamblea para dar fe del escrutinio digital.',
            tiempo: '09:55',
        },
    ],
    1: [
        {
            id: 101,
            autor: 'Juan Pérez (UF 1A)',
            rol: 'PROPIETARIO',
            texto: 'Me parece elevado el presupuesto inicial de $500.000 para pintura e impermeabilización, deberíamos revisar las garantías.',
            tiempo: '10:05',
        },
        {
            id: 102,
            autor: 'María Gómez (UF 2B)',
            rol: 'PROPIETARIO',
            texto: 'Incluye impermeabilización integral con membrana geotextil de 10 años de garantía; a largo plazo evita filtraciones estructurales.',
            tiempo: '10:08',
        },
        {
            id: 103,
            autor: 'Administración Central',
            rol: 'ADMINISTRADOR',
            texto: 'Estimados copropietarios, el contratista matriculado confirmó una bonificación cerrando el monto final en $450.000 en 3 cuotas sin interés.',
            tiempo: '10:15',
        },
    ],
    2: [
        {
            id: 201,
            autor: 'Carlos Ruiz (UF 5C)',
            rol: 'PROPIETARIO',
            texto: 'Solicito evaluar la continuidad de la administración por demoras en las rendiciones trimestrales.',
            tiempo: '10:22',
        },
        {
            id: 202,
            autor: 'Administración Central',
            rol: 'ADMINISTRADOR',
            texto: 'Los comprobantes auditados ya fueron subidos al repositorio documental con firma contable certificada.',
            tiempo: '10:27',
        },
        {
            id: 203,
            autor: 'María Gómez (UF 2B)',
            rol: 'PROPIETARIO',
            texto: 'Habiendo verificado los balances, considero inconveniente cambiar de administración en plena obra de fachada.',
            tiempo: '10:34',
        },
    ],
    3: [
        {
            id: 301,
            autor: 'Lucía Fernández (UF 3A)',
            rol: 'PROPIETARIO',
            texto: 'Propongo extender el horario de reserva del SUM los viernes y sábados hasta las 02:00 hs con depósito de garantía.',
            tiempo: '11:02',
        },
        {
            id: 302,
            autor: 'Juan Pérez (UF 1A)',
            rol: 'PROPIETARIO',
            texto: 'Recuerden que por Art. 2057 del CCyCN toda modificación reglamentaria exige mayoría de dos tercios (66.6%).',
            tiempo: '11:10',
        },
    ],
};

export default function ForoDebate({
    faseActual = 'ABIERTA',
    temaActual = { id: 1, numero: 'Tema 1', titulo: 'Aprobación de presupuesto para pintura e impermeabilización' },
}) {
    const { usuario } = useAuth();
    const esAdministrador = usuario?.rol === 'ADMINISTRADOR';
    const idTemaActivo = temaActual?.id ?? 1;

    const [mensajesPorTema, setMensajesPorTema] = useState(MENSAJES_POR_TEMA_INICIALES);
    const [nuevoMensaje, setNuevoMensaje] = useState('');

    useEffect(() => {
        try {
            const guardados = localStorage.getItem('consorciosync_foro_mensajes_v2');
            if (guardados) {
                setMensajesPorTema({
                    ...MENSAJES_POR_TEMA_INICIALES,
                    ...JSON.parse(guardados),
                });
            }
        } catch {
            // Fallback a mensajes iniciales por tema
        }
    }, []);

    const listaMensajesTema = mensajesPorTema[idTemaActivo] || MENSAJES_POR_TEMA_INICIALES[1];

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

        const actualizados = {
            ...mensajesPorTema,
            [idTemaActivo]: [...listaMensajesTema, nuevoItem],
        };

        setMensajesPorTema(actualizados);
        localStorage.setItem('consorciosync_foro_mensajes_v2', JSON.stringify(actualizados));
        setNuevoMensaje('');
    };

    return (
        <Card className="flex flex-col h-[620px]">
            {/* Cabecera del Foro mediante CardHeader */}
            <CardHeader className="p-4 flex justify-between items-center">
                <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="darkInfo" size="sm" shape="rounded">
                            {temaActual?.numero || `Tema ${idTemaActivo}`}
                        </Badge>
                        <h2 className="font-bold text-sm md:text-base truncate">
                            💬 Foro Asíncrono de Deliberación
                        </h2>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 truncate">
                        {faseActual === 'ABIERTA'
                            ? `🟢 Debate concurrente activo (${listaMensajesTema.length} intervenciones)`
                            : faseActual === 'CUARTO_INTERMEDIO'
                            ? '⏸️ Pausado por Cuarto Intermedio'
                            : '🔒 Asamblea Cerrada (Modo Lectura)'}
                    </p>
                </div>

                <Badge
                    variant={esAdministrador ? 'darkWarning' : 'darkInfo'}
                    size="sm"
                    shape="rounded"
                >
                    {esAdministrador ? 'Moderador (Admin)' : 'Derecho a Voz Activo'}
                </Badge>
            </CardHeader>

            {/* Lista de Mensajes del Tema Activo */}
            <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4">
                {listaMensajesTema.map((msg) => (
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
                            <Card variant="warning" className="text-xs font-bold px-4 py-2 my-2 text-center">
                                {msg.texto}
                            </Card>
                        ) : (
                            <Card
                                variant={msg.rol === 'ADMINISTRADOR' ? 'default' : 'info'}
                                className="max-w-[85%] p-3"
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
                            </Card>
                        )}
                    </div>
                ))}
            </div>

            {/* Input del Foro según el estado de la Asamblea */}
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
                {faseActual === 'ABIERTA' ? (
                    <form onSubmit={enviarMensaje} className="flex gap-2">
                        <Input
                            type="text"
                            value={nuevoMensaje}
                            onChange={(e) => setNuevoMensaje(e.target.value)}
                            placeholder={
                                esAdministrador
                                    ? `Responder en ${temaActual?.numero || 'este tema'} como Administración...`
                                    : `Debatir en ${temaActual?.numero || 'este tema'} (puede opinar antes o después de votar)...`
                            }
                            className="flex-grow"
                        />
                        <Button type="submit" variant="primary">
                            Enviar
                        </Button>
                    </form>
                ) : faseActual === 'CUARTO_INTERMEDIO' ? (
                    <Card variant="warning" className="text-center p-3">
                        <p className="text-xs font-bold">
                            ⏸️ Asamblea en Cuarto Intermedio. El envío de mensajes se encuentra temporalmente pausado.
                        </p>
                    </Card>
                ) : (
                    <Card variant="subtle" className="text-center p-3">
                        <p className="text-xs text-slate-600 font-bold">
                            🔒 Asamblea Cerrada. El hilo deliberativo ha quedado archivado en modo de solo lectura.
                        </p>
                    </Card>
                )}
            </div>
        </Card>
    );
}
