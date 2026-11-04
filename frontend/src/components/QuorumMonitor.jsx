'use client';
import { Card, Badge, ProgressBar } from './ui';

export default function QuorumMonitor({
    porcentajeQuorum = 68.5,
    unidadesPresentes = 14,
    unidadesTotales = 20,
    minimoRequerido = 50,
}) {
    const tieneValidezLegal = porcentajeQuorum > minimoRequerido;

    return (
        <Card className="p-4 md:p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
                            🏛️ Quórum Legal Acumulado de la Asamblea (HU-006)
                        </h2>
                        <Badge
                            variant={tieneValidezLegal ? 'success' : 'warning'}
                            size="sm"
                        >
                            {tieneValidezLegal
                                ? '✓ Validez Legal Alcanzada (Art. 2060 CCyCN)'
                                : '⚠️ Quórum Insuficiente'}
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Mínimo requerido para aprobar: <strong>&gt;{minimoRequerido}%</strong> del coeficiente total y mayoría de unidades funcionales.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm" shape="rounded">
                        {unidadesPresentes} / {unidadesTotales} Unidades Acreditadas
                    </Badge>
                    <Badge variant="live" size="sm">
                        🟢 {porcentajeQuorum.toFixed(1)}% Presente
                    </Badge>
                </div>
            </div>

            <ProgressBar
                porcentaje={porcentajeQuorum}
                color={tieneValidezLegal ? 'emerald' : 'amber'}
                size="lg"
                umbral={minimoRequerido}
                label="Asistencia Ponderada General del Consorcio"
                detalleDerecha={`${porcentajeQuorum.toFixed(1)}% presente (Mínimo legal: >${minimoRequerido}%)`}
            />
        </Card>
    );
}

