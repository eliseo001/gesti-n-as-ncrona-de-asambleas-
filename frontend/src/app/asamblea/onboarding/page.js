'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPropietario() {
    const router = useRouter();

    // Estados para el cumplimiento legal (Art. 2059 CCyCN - Convocatoria y Quórum)
    const [acuseFirmado, setAcuseFirmado] = useState(false);
    const [fechaFirmaAcuse, setFechaFirmaAcuse] = useState(null);
    const [archivoKyc, setArchivoKyc] = useState(null);
    const [tipoDocumento, setTipoDocumento] = useState('DNI_FRENTE');
    const [enviando, setEnviando] = useState(false);

    // Manejador para la firma del acuse de recibo legal
    const manejarFirmaAcuse = () => {
        const timestampActual = new Date().toLocaleString('es-AR');
        setAcuseFirmado(true);
        setFechaFirmaAcuse(timestampActual);
        // INTEGRACIÓN BACKEND (Spring Boot):
        // POST /api/notificaciones/acuse-recibo
        // Body: { idAsamblea: 1, idUsuario: usuarioActual.id, timestamp: ISOString }
        // Propósito: Registrar fehacientemente que el propietario tomó conocimiento del Orden del Día.
    };

    // Manejador para la carga simulada de documentación respaldatoria (KYC)
    const manejarSubidaArchivo = (evento) => {
        const archivoSeleccionado = evento.target.files[0];
        if (archivoSeleccionado) {
            setArchivoKyc(archivoSeleccionado);
        }
    };

    // Confirmación final de Onboarding para ingresar al recinto virtual
    const completarOnboarding = (evento) => {
        evento.preventDefault();
        if (!acuseFirmado || !archivoKyc) return;

        setEnviando(true);

        // INTEGRACIÓN BACKEND (Spring Boot):
        // POST /api/kyc/upload (MultipartFormData con el archivo y tipoDocumento)
        // Una vez almacenado el hash del documento, redirige al Lobby de Asamblea.
        setTimeout(() => {
            setEnviando(false);
            router.push('/asamblea');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans flex items-center justify-center">
            <div className="max-w-3xl w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">

                {/* Cabecera Institucional */}
                <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider bg-blue-800 text-blue-100 px-2.5 py-1 rounded">
                                Paso Previo Obligatorio - Ley N° 26.994
                            </span>
                            <h1 className="text-2xl font-bold mt-2">Acreditación de Identidad y Acuse Legal</h1>
                            <p className="text-slate-400 text-sm mt-1">
                                Consorcio Edificio Las Margaritas • Unidad Funcional 4B
                            </p>
                        </div>
                        <div className="text-4xl">🏛️</div>
                    </div>
                </div>

                <form onSubmit={completarOnboarding} className="p-6 md:p-8 space-y-8">

                    {/* PASO 1: Cédula de Citación y Acuse de Recibo */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                            <h2 className="text-lg font-bold text-slate-800">
                                Notificación Fehaciente de Convocatoria (Art. 2059 CCyCN)
                            </h2>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-lg border border-slate-300 text-sm text-slate-700 space-y-2 leading-relaxed">
                            <p className="font-bold text-slate-900 uppercase">
                                Cédula de Citación a Asamblea Extraordinaria - Noviembre 2026
                            </p>
                            <p>
                                Por medio de la presente se cita a los Sres. Copropietarios a la Asamblea Extraordinaria bajo modalidad asíncrona a celebrarse en la plataforma <strong>ConsorcioSync</strong>, con apertura el 01/11/2026 a las 09:00 hs y cierre definitivo el 05/11/2026 a las 23:59 hs.
                            </p>
                            <div className="pt-2">
                                <p className="font-semibold text-slate-800">Orden del Día:</p>
                                <ol className="list-decimal list-inside space-y-1 mt-1 text-slate-600">
                                    <li>Designación de un (1) Presidente de Asamblea y dos (2) Propietarios para firmar el Acta.</li>
                                    <li>Aprobación de presupuesto para pintura e impermeabilización de fachada.</li>
                                    <li>Evaluación de continuidad o remoción de la administración actual.</li>
                                </ol>
                            </div>
                        </div>

                        {!acuseFirmado ? (
                            <button
                                type="button"
                                onClick={manejarFirmaAcuse}
                                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                            >
                                <span>✍️</span> Aceptar y firmar acuse de recibo legal
                            </button>
                        ) : (
                            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-lg flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">✅</span>
                                    <div>
                                        <p className="font-bold">Acuse de Recibo Firmado Digitalmente</p>
                                        <p className="text-xs text-emerald-700">
                                            Registrado el {fechaFirmaAcuse} • Vínculo criptográfico activo
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-mono bg-emerald-100 px-2 py-1 rounded border border-emerald-300">
                                    NOTIFICADO
                                </span>
                            </div>
                        )}
                    </section>

                    {/* PASO 2: Validación de Identidad (KYC Básico) */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                            <h2 className="text-lg font-bold text-slate-800">
                                Validación de Identidad y Titularidad (KYC Básico)
                            </h2>
                        </div>

                        <p className="text-sm text-slate-600">
                            Para garantizar la legitimidad del padrón electoral del consorcio, adjunte una imagen legible de su documento o título de propiedad.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                    Tipo de Documento Respaldatorio
                                </label>
                                <select
                                    value={tipoDocumento}
                                    onChange={(e) => setTipoDocumento(e.target.value)}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                >
                                    <option value="DNI_FRENTE">Frente del DNI del Titular</option>
                                    <option value="ESCRITURA">Copia de Escritura Traslativa de Dominio</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                    Archivo Digital (JPG, PNG o PDF)
                                </label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={manejarSubidaArchivo}
                                    className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer border border-slate-300 rounded-lg p-1"
                                />
                            </div>
                        </div>

                        {archivoKyc && (
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between text-xs text-blue-900">
                                <span>📎 Documento pre-cargado: <strong>{archivoKyc.name}</strong> ({(archivoKyc.size / 1024).toFixed(1)} KB)</span>
                                <span className="font-semibold text-blue-700">Listo para verificación</span>
                            </div>
                        )}
                    </section>

                    {/* Botón de Finalización */}
                    <div className="pt-4 border-t border-slate-200 flex justify-end gap-4">
                        <button
                            type="submit"
                            disabled={!acuseFirmado || !archivoKyc || enviando}
                            className={`px-6 py-3 rounded-lg font-bold text-sm shadow transition-all ${
                                acuseFirmado && archivoKyc && !enviando
                                    ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            {enviando ? 'Verificando credenciales...' : 'Finalizar Acreditación e Ingresar al Recinto →'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

