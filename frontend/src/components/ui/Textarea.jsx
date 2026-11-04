'use client';

export function Textarea({
    label,
    error,
    rows = 3,
    className = '',
    containerClassName = '',
    ...props
}) {
    const clasesBase =
        'w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-shadow focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed';

    const clasesError = error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : '';
    const clasesFinales = [clasesBase, clasesError, className].filter(Boolean).join(' ');

    if (!label && !error) {
        return <textarea rows={rows} className={clasesFinales} {...props} />;
    }

    return (
        <div className={['w-full space-y-1', containerClassName].filter(Boolean).join(' ')}>
            {label && (
                <label className="block text-xs font-bold uppercase text-slate-600">
                    {label}
                </label>
            )}
            <textarea rows={rows} className={clasesFinales} {...props} />
            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        </div>
    );
}

export default Textarea;

