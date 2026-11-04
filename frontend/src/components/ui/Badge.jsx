'use client';

const VARIANTES_BADGE = {
    success: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
    warning: 'bg-amber-100 text-amber-900 border border-amber-300',
    danger: 'bg-red-100 text-red-900 border border-red-300',
    live: 'bg-emerald-50 text-emerald-800 border border-emerald-400 animate-pulse shadow-sm',
    primary: 'bg-blue-100 text-blue-900 border border-blue-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
    secondary: 'bg-slate-100 text-slate-800 border border-slate-300',
    neutral: 'bg-slate-200 text-slate-700 border border-slate-300',
    dark: 'bg-slate-800 text-white border border-slate-700',
    darkInfo: 'bg-slate-800 text-blue-400 border border-slate-700 uppercase tracking-widest',
    darkSuccess: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    darkWarning: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
};

const TAMANOS_BADGE = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-3 py-1',
};

const FORMAS_BADGE = {
    pill: 'rounded-full',
    rounded: 'rounded',
};

export function Badge({
    children,
    variant = 'secondary',
    size = 'md',
    shape = 'pill',
    className = '',
    ...props
}) {
    const clasesBase = 'inline-flex items-center gap-1.5 font-bold whitespace-nowrap';
    const clasesVariante = VARIANTES_BADGE[variant] || VARIANTES_BADGE.secondary;
    const clasesTamano = TAMANOS_BADGE[size] || TAMANOS_BADGE.md;
    const clasesForma = FORMAS_BADGE[shape] || FORMAS_BADGE.pill;

    const clasesFinales = [clasesBase, clasesVariante, clasesTamano, clasesForma, className]
        .filter(Boolean)
        .join(' ');

    return (
        <span className={clasesFinales} {...props}>
            {children}
        </span>
    );
}

export default Badge;
