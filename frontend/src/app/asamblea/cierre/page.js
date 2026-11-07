'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import ResumenAsamblea from '../../../components/ResumenAsamblea';
import { Card, Button, Badge } from '../../../components/ui';

export default function PaginaCierreAsamblea() {
    const router = useRouter();
    const { usuario, faseAsamblea, actualizarFaseAsamblea } = useAuth();
    const esAdministrador = usuario?.rol === 'ADMINISTRADOR';

    const [votosPorTema] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const guardados = localStorage.getItem('consorciosync_votos_por_tema');
                if (guardados) return JSON.parse(guardados);
            } catch {
                // Fallback por defecto
            }
        }
        return { 1: null, 2: null, 3: null };
    });

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-6 font-sans">
            <div className="max-w-6xl mx-auto space-y-5">
                {/* Barra de Navegación Contextual */}
                <Card className="p-4 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => router.push(esAdministrador ? '/admin' : '/asamblea')}
                        >
                            {esAdministrador
                                ? '← Volver al Panel de Control'
                                : '← Volver al Lobby del Consorcio'}
                        </Button>
                        <span className="text-slate-300 hidden sm:inline">|</span>
                        <span className="text-xs font-semibold text-slate-600">
                            Escrutinio Final Ponderado y Auditoría Criptográfica SHA-256
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant={faseAsamblea === 'CERRADA' ? 'success' : 'warning'}
                            size="sm"
                            shape="rounded"
                        >
                            Estado Global: {faseAsamblea}
                        </Badge>
                        {faseAsamblea !== 'CERRADA' ? (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => actualizarFaseAsamblea('CERRADA')}
                            >
                                🔒 Fijar Estado Global como CERRADA
                            </Button>
                        ) : (
                            <Button
                                variant="light"
                                size="sm"
                                onClick={() => actualizarFaseAsamblea('ABIERTA')}
                            >
                                🔓 Volver a Estado ABIERTA (Demo)
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Componente Maestro de Resultados y Cierre */}
                <ResumenAsamblea votosPropietario={votosPorTema} />
            </div>
        </div>
    );
}
