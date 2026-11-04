'use client';

const VARIANTES_HEADER = {
    dark: 'bg-slate-900 text-white border-b border-slate-800',
    light: 'bg-white text-slate-800 border-b border-slate-200',
};

const REDONDEADO_HEADER = {
    top: 'rounded-t-xl',
    all: 'rounded-xl shadow-md border border-slate-800',
    none: 'rounded-none',
};

export function CardHeader({
    children,
    variant = 'dark',
    rounded = 'top',
    className = '',
    ...props
}) {
    const clasesBase = 'p-6';
    const clasesVariante = VARIANTES_HEADER[variant] || VARIANTES_HEADER.dark;
    const clasesRedondeado = REDONDEADO_HEADER[rounded] || REDONDEADO_HEADER.top;
    const clasesFinales = [clasesBase, clasesVariante, clasesRedondeado, className]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={clasesFinales} {...props}>
            {children}
        </div>
    );
}

export default CardHeader;

