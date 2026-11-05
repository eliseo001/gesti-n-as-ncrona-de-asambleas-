'use client';
import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { Button } from './Button';

export function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    badge,
    maxWidth = 'max-w-2xl',
    children,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
            <Card className={`w-full ${maxWidth} shadow-2xl overflow-hidden border-slate-300`}>
                <CardHeader className="p-5 flex justify-between items-start gap-4">
                    <div>
                        {badge && <div className="mb-1.5">{badge}</div>}
                        {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
                        {subtitle && <p className="text-xs text-slate-300 mt-0.5">{subtitle}</p>}
                    </div>
                    {onClose && (
                        <Button variant="secondary" size="sm" onClick={onClose}>
                            ✕ Cerrar
                        </Button>
                    )}
                </CardHeader>

                <div className="p-6 bg-white max-h-[82vh] overflow-y-auto">
                    {children}
                </div>
            </Card>
        </div>
    );
}

export default Modal;

