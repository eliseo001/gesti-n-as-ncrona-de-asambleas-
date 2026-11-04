'use client';

const VARIANTES_BUTTON = {
    primary: 'bg-blue-700 hover:bg-blue-800 text-white shadow-sm',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white shadow-sm',
    danger: 'bg-red-700 hover:bg-red-800 text-white shadow-sm',
    success: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm',
    neutral: 'bg-slate-600 hover:bg-slate-700 text-white shadow-sm',
    light: 'bg-slate-200 hover:bg-slate-300 text-slate-800',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm',
    ghost: 'bg-transparent text-blue-700 hover:underline px-0 py-0',
};

const TAMANOS_BUTTON = {
    sm: 'py-2 px-3.5 text-xs',
    md: 'py-2.5 px-4 text-xs',
    lg: 'py-3.5 px-5 text-sm',
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    fullWidth = false,
    className = '',
    onClick,
    ...props
}) {
    const clasesBase = 'font-bold rounded-lg transition-all inline-flex items-center justify-center gap-1.5';
    const clasesTamano = variant === 'ghost' ? 'text-sm' : TAMANOS_BUTTON[size] || TAMANOS_BUTTON.md;
    const clasesAncho = fullWidth ? 'w-full' : '';

    const clasesEstado = disabled
        ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
        : `${VARIANTES_BUTTON[variant] || VARIANTES_BUTTON.primary} cursor-pointer`;

    const clasesFinales = [clasesBase, clasesTamano, clasesAncho, clasesEstado, className]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={clasesFinales}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;

