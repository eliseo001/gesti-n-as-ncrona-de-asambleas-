'use client';
import { useState } from 'react';

// Recibe por props si el usuario actual fue electo en el "Tema 0" como Propietario Designado para firmar
export default function ActaDigital({ esPropietarioDesignado = true }) {
    const [firmado, setFirmado] = useState(false);

    // Estado para la Impugnación Legal de Resoluciones (Art. 2060 in fine CCyCN - Plazo de caducidad de 30 días)
    const [impugnacionRegistrada, setImpugnacionRegistrada] = useState(false);
    const [motivoImpugnacion, setMotivoImpugnacion] = useState('');
    const [mostrarFormularioImpugnacion, setMostrarFormularioImpugnacion] = useState(false);

    const confirmarImpugnacionLegal = (evento) => {
        evento.preventDefault();
        if (!motivoImpugnacion.trim()) return;

        setImpugnacionRegistrada(true);
        setMostrarFormularioImpugnacion(false);

        // INTEGRACIÓN BACKEND (Spring Boot):
        // POST /api/actas/14/impugnaciones
        // Body: { idUsuario, idTema, fundamentoLegal: motivoImpugnacion, timestamp }
        // Verifica en base de datos que el usuario haya estado AUSENTE o haya votado EN_CONTRA
        // y que no hayan transcurrido más de 30 días corridos desde el cierre del acta (Art. 2060 CCyCN).
    };

    return (
        <div className="bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden w-full max-w-4xl mx-auto my-8 font-serif">

            {/* Encabezado Formal del Acta */}
            <div className="bg-slate-900 text-white border-b border-slate-800 p-8 text-center">
                <span className="text-xs font-sans font-bold uppercase tracking-widest text-blue-300 bg-slate-800 px-3 py-1 rounded">
                    Código Civil y Comercial de la Nación • Art. 2060 y Art. 2062
                </span>
                <h1 className="text-2xl font-bold uppercase tracking-wider mt-3 mb-1">
                    Libro de Actas Digital - ConsorcioSync
                </h1>
                <h2 className="text-base font-semibold text-slate-300">
                    Acta de Asamblea Extraordinaria N° 014/2026 - Consorcio Edificio Las Margaritas
                </h2>
                <p className="text-xs text-slate-400 mt-2 font-sans">
                    Documento inmutable sellado criptográficamente mediante encadenamiento SHA-256
                </p>
            </div>

            {/* INSERTA ESTO JUSTO DEBAJO DEL HEADER OSCURO DEL ACTA */}

            {/* Simulador de Brecha 6: Resolución Condicionada (Silencio de Ausentes) */}
            <div className="mx-8 mt-6 bg-amber-50 border border-amber-300 p-4 rounded-lg flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                    <h4 className="font-bold text-amber-900 text-sm">Resolución condicionada al vencimiento del plazo de oposición (Art. 2060 CCyCN)</h4>
                    <p className="text-xs text-amber-800 mt-1">Al no haberse alcanzado la mayoría absoluta en el recinto, las decisiones revisten carácter de propuesta y quedarán firmes en 15 días si no existe oposición legal de los ausentes.</p>
                </div>
            </div>

            {/* Simulador de Brecha 9: Bloqueo Cruzado / Empate de Propiedad Horizontal */}
            <div className="mx-8 mt-4 bg-red-50 border border-red-300 p-4 rounded-lg flex items-start gap-3">
                <span className="text-xl">🛑</span>
                <div>
                    <h4 className="font-bold text-red-900 text-sm">RECHAZADO POR BLOQUEO CRUZADO</h4>
                    <p className="text-xs text-red-800 mt-1">El Tema 2 cuenta con mayoría de unidades funcionales a favor, pero mayoría de coeficiente en contra. Al no configurarse la doble mayoría absoluta (Art. 2060), la moción se considera rechazada.</p>
                </div>
            </div>

            <div className="p-8 space-y-8 text-slate-800">

                {/* Datos de Apertura y Quórum con Doble Cómputo */}
                <section className="space-y-3">
                    <p className="leading-relaxed text-justify text-sm">
                        En la plataforma de gobernanza digital <strong>ConsorcioSync</strong>, a los 05 días del mes de Noviembre de 2026, habiendo expirado la ventana temporal de votación asíncrona a las 23:59 hs, se procede al cierre definitivo de la Asamblea Extraordinaria. Se deja constancia fehaciente de que se ha alcanzado un <strong>Quórum Legal del 68.5% del coeficiente de copropiedad total, representando a 14 de las 20 unidades funcionales</strong> que integran el edificio, cumpliendo los extremos de los artículos 2059 y 2060 del Código Civil y Comercial de la Nación (Ley N° 26.994).
                    </p>
                </section>

                {/* Desarrollo y Resoluciones por Tema (Doble Exigencia de Mayoría) */}
                <section>
                    <h3 className="font-bold text-base border-b-2 border-slate-300 pb-2 mb-4 uppercase tracking-wide">
                        Resoluciones del Orden del Día (Cómputo de Doble Mayoría)
                    </h3>

                    <div className="space-y-6 font-sans">

                        {/* Tema 0: Autoridades */}
                        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-900">
                                    Tema 0: Designación de Presidente de Asamblea y Firmantes del Acta
                                </h4>
                                <span className="text-xs font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                                    Art. 2062 CCyCN
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 mb-3">
                                Autoridades electas por los copropietarios acreditados: <strong>Presidente:</strong> Juan Pérez (UF 1A). <strong>Propietarios Designados para suscribir el Acta:</strong> María Gómez (UF 2B) y Ana Martínez (UF 4B).
                            </p>
                            <p className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded border border-emerald-200">
                                ✔ Resolución: APROBADO por 68.5% del coeficiente, representando a 14 de 20 unidades funcionales.
                            </p>
                        </div>

                        {/* Tema 1 */}
                        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-900">
                                    Tema 1: Aprobación de presupuesto para pintura e impermeabilización de fachada
                                </h4>
                                <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                                    Art. 2060 CCyCN
                                </span>
                            </div>
                            <p className="text-xs mb-3 italic text-slate-600">
                                Resumen del debate: Los propietarios acordaron avanzar con el contratista B tras verificar la extensión de la póliza de caución (Ref: Foro Asíncrono Hilo #1).
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-xs">
                                <div className="bg-emerald-100 text-emerald-950 p-2.5 rounded border border-emerald-200 text-center">
                                    <span className="block font-bold">A FAVOR: 68.5% Coef.</span>
                                    <span className="text-[11px]">(14 de 20 Unidades)</span>
                                </div>
                                <div className="bg-red-100 text-red-950 p-2.5 rounded border border-red-200 text-center">
                                    <span className="block font-bold">EN CONTRA: 21.5% Coef.</span>
                                    <span className="text-[11px]">(4 de 20 Unidades)</span>
                                </div>
                                <div className="bg-slate-200 text-slate-800 p-2.5 rounded border border-slate-300 text-center">
                                    <span className="block font-bold">ABSTENCIÓN / AUSENTES: 10.0%</span>
                                    <span className="text-[11px]">(2 de 20 Unidades)</span>
                                </div>
                            </div>

                            <p className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded border border-emerald-200">
                                ✔ Resolución: APROBADO por doble mayoría legal (68.5% del coeficiente, representando a 14 de 20 unidades).
                            </p>
                        </div>

                        {/* Tema 2 */}
                        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-900">
                                    Tema 2: Evaluación de continuidad o remoción de la administración actual
                                </h4>
                                <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                                    Art. 2060 CCyCN
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-xs mt-2">
                                <div className="bg-emerald-100 text-emerald-950 p-2.5 rounded border border-emerald-200 text-center">
                                    <span className="block font-bold">A FAVOR: 22.0% Coef.</span>
                                    <span className="text-[11px]">(4 de 20 Unidades)</span>
                                </div>
                                <div className="bg-red-100 text-red-950 p-2.5 rounded border border-red-200 text-center">
                                    <span className="block font-bold">EN CONTRA: 68.0% Coef.</span>
                                    <span className="text-[11px]">(14 de 20 Unidades)</span>
                                </div>
                                <div className="bg-slate-200 text-slate-800 p-2.5 rounded border border-slate-300 text-center">
                                    <span className="block font-bold">ABSTENCIÓN / AUSENTES: 10.0%</span>
                                    <span className="text-[11px]">(2 de 20 Unidades)</span>
                                </div>
                            </div>

                            <p className="text-xs font-bold text-red-800 bg-red-50 p-2.5 rounded border border-red-200">
                                ✖ Resolución: RECHAZADO por mayoría absoluta (68.0% del coeficiente en contra, representando a 14 de 20 unidades).
                            </p>
                        </div>
                    </div>

                    {/* SECCIÓN DE IMPUGNACIÓN LEGAL (Art. 2060 CCyCN - Propietarios Ausentes o Disidentes) */}
                    <div className="mt-6 bg-red-50/70 border border-red-200 rounded-xl p-5 font-sans">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                                    Garantía de Minorías • Art. 2060 CCyCN
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm mt-1">
                                    Derecho de Oposición e Impugnación de Resoluciones
                                </h4>
                                <p className="text-xs text-slate-600">
                                    Habilitado exclusivamente para propietarios que votaron en contra o estuvieron ausentes. El derecho caduca a los 30 días de cerrada el acta.
                                </p>
                            </div>

                            {!impugnacionRegistrada && (
                                <button
                                    type="button"
                                    onClick={() => setMostrarFormularioImpugnacion(!mostrarFormularioImpugnacion)}
                                    className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-3 rounded-lg shadow transition-colors whitespace-nowrap cursor-pointer"
                                >
                                    ⚖️ Impugnar Resolución (Art. 2060 CCyCN) - Plazo legal restante: 12 días
                                </button>
                            )}
                        </div>

                        {mostrarFormularioImpugnacion && !impugnacionRegistrada && (
                            <form onSubmit={confirmarImpugnacionLegal} className="mt-4 pt-4 border-t border-red-200 space-y-3">
                                <label className="block text-xs font-bold text-slate-800">
                                    Fundamento de la Nulidad / Oposición Reglamentaria:
                                </label>
                                <textarea
                                    required
                                    value={motivoImpugnacion}
                                    onChange={(e) => setMotivoImpugnacion(e.target.value)}
                                    placeholder="Describa el vicio formal o violación al Reglamento de Propiedad Horizontal..."
                                    className="w-full p-3 border border-slate-300 rounded-lg text-xs bg-white h-20"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setMostrarFormularioImpugnacion(false)}
                                        className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg"
                                    >
                                        Dejar Constancia Fehaciente de Impugnación
                                    </button>
                                </div>
                            </form>
                        )}

                        {impugnacionRegistrada && (
                            <div className="mt-4 bg-white border border-red-300 p-3.5 rounded-lg text-xs text-red-900 space-y-1">
                                <p className="font-bold">
                                    📌 Reserva de Impugnación Asentada en el Libro de Actas (Art. 2060 CCyCN)
                                </p>
                                <p className="text-slate-700 italic">"{motivoImpugnacion}"</p>
                                <p className="text-[11px] font-mono text-slate-500">
                                    Sello de tiempo: {new Date().toLocaleString('es-AR')} • Notificado a la Administración.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Auditoría de Transparencia (Hash Chaining) */}
                <section className="font-sans">
                    <h3 className="font-bold text-base border-b-2 border-slate-300 pb-2 mb-3 uppercase font-serif">
                        Auditoría Criptográfica de Sufragios (Hash Chaining)
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                        El siguiente registro verifica la inmutabilidad de los votos computados en esta acta, encadenados desde el Bloque Génesis (GENESIS_HASH).
                    </p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-slate-300 text-xs">
                            <thead className="bg-slate-100 text-slate-700">
                                <tr>
                                    <th className="py-2 px-3 border-b text-left font-bold">Registro Voto</th>
                                    <th className="py-2 px-3 border-b text-left font-bold">Hash Anterior</th>
                                    <th className="py-2 px-3 border-b text-left font-bold">Hash Actual (SHA-256)</th>
                                    <th className="py-2 px-3 border-b text-center font-bold">Integridad</th>
                                </tr>
                            </thead>
                            <tbody className="font-mono">
                                <tr>
                                    <td className="py-2 px-3 border-b">Voto_001_UF4B+C12 (5.20%)</td>
                                    <td className="py-2 px-3 border-b text-slate-400">GENESIS_HASH</td>
                                    <td className="py-2 px-3 border-b font-bold text-slate-800">a377b9c21e4d8f6a...</td>
                                    <td className="py-2 px-3 border-b text-center text-emerald-700 font-bold">✓ Íntegro</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 border-b">Voto_002_UF1A (5.00%)</td>
                                    <td className="py-2 px-3 border-b text-slate-400">a377b9c21e4d8f6a...</td>
                                    <td className="py-2 px-3 border-b font-bold text-slate-800">8c4e2b1a9f07c73c...</td>
                                    <td className="py-2 px-3 border-b text-center text-emerald-700 font-bold">✓ Íntegro</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Firma Electrónica de Autoridades Electas en el Tema 0 */}
                <section className="mt-8 font-sans border-t-2 border-slate-800 pt-6">
                    <h3 className="font-bold text-base text-slate-800 mb-3 uppercase">
                        Suscripción de Propietarios Designados (Art. 2062 CCyCN)
                    </h3>

                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50 p-6 rounded-xl border border-slate-300">
                        <div className="space-y-1">
                            <p className="text-sm text-slate-900 font-bold">
                                Firma de Conformidad de Autoridades Electas en el Tema 0
                            </p>
                            <p className="text-xs text-slate-600">
                                Firmantes habilitados: <strong>María Gómez (UF 2B - Firmado ✓)</strong> y <strong>Ana Martínez (UF 4B - Sesión Actual)</strong>.
                            </p>
                        </div>

                        {esPropietarioDesignado ? (
                            <button
                                onClick={() => setFirmado(true)}
                                disabled={firmado}
                                className={`px-6 py-3 rounded-lg font-bold transition-all shadow text-xs whitespace-nowrap ${firmado
                                    ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed border border-emerald-300'
                                    : 'bg-blue-700 text-white hover:bg-blue-800 cursor-pointer'
                                    }`}
                            >
                                {firmado ? '✓ Acta Rubricada Digitalmente (2/2 Firmas)' : '✍️ Firmar Acta como Propietario Designado'}
                            </button>
                        ) : (
                            <span className="text-xs font-bold text-slate-500 bg-slate-200 px-4 py-2 rounded">
                                Modo Lectura (No designado en Tema 0)
                            </span>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}