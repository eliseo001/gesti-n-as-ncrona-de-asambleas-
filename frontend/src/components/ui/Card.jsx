'use client';

const VARIANTES_CARD = {
    default: 'bg-white border border-slate-200 shadow-sm',
    subtle: 'bg-slate-50 border border-slate-200',
    dark: 'bg-slate-900 text-white border border-slate-800 shadow-md',
    info: 'bg-blue-50 border border-blue-200 text-blue-900',
    success: 'bg-emerald-50 border border-emerald-300 text-emerald-900',
    warning: 'bg-amber-50 border border-amber-300 text-amber-950',
    danger: 'bg-red-50 border border-red-200 text-red-900',
};

export function Card({
    children,
    variant = 'default',
    as: Component = 'div',
    className = '',
    ...props
}) {
    const clasesBase = 'rounded-xl';
    const clasesVariante = VARIANTES_CARD[variant] || VARIANTES_CARD.default;
    const clasesFinales = [clasesBase, clasesVariante, className].filter(Boolean).join(' ');

    return (
        <Component className={clasesFinales} {...props}>
            {children}
        </Component>
    );
}

export default Card;

