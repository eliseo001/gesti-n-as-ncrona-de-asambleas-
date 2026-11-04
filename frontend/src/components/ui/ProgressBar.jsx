'use client';

const COLORES_BARRA = {
    emerald: {
        barra: 'bg-emerald-600',
        fondo: 'bg-emerald-100/80',
        texto: 'text-emerald-900',
    },
    red: {
        barra: 'bg-red-600',
        fondo: 'bg-red-100/80',
        texto: 'text-red-900',
    },
    blue: {
        barra: 'bg-blue-600',
        fondo: 'bg-slate-200',
        texto: 'text-slate-800',
    },
    slate: {
        barra: 'bg-slate-500',
        fondo: 'bg-slate-200',
        texto: 'text-slate-700',
    },
    amber: {
        barra: 'bg-amber-500',
        fondo: 'bg-amber-100/80',
        texto: 'text-amber-900',
    },
};

const ALTURAS_BARRA = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
};

export function ProgressBar({
    porcentaje = 0,
    color = 'blue',
    label,
    detalleDerecha,
    size = 'md',
    umbral,
    className = '',
}) {
    const valorSeguro = Math.min(100, Math.max(0, Number(porcentaje) || 0));
    const paleta = COLORES_BARRA[color] || COLORES_BARRA.blue;
    const altura = ALTURAS_BARRA[size] || ALTURAS_BARRA.md;

    return (
        <div className={['w-full space-y-1.5', className].filter(Boolean).join(' ')}>
            {(label || detalleDerecha !== undefined) && (
                <div className={`flex justify-between items-center text-xs font-bold ${paleta.texto}`}>
                    <span>{label}</span>
                    <span className="font-mono">
                        {detalleDerecha !== undefined ? detalleDerecha : `${valorSeguro.toFixed(1)}%`}
                    </span>
                </div>
            )}

            <div className={`relative w-full ${paleta.fondo} ${altura} rounded-full overflow-hidden`}>
                <div
                    className={`${paleta.barra} ${altura} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${valorSeguro}%` }}
                />

                {typeof umbral === 'number' && (
                    <div
                        title={`Umbral mínimo legal: ${umbral}%`}
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-900/70 z-10"
                        style={{ left: `${umbral}%` }}
                    />
                )}
            </div>
        </div>
    );
}

export default ProgressBar;

