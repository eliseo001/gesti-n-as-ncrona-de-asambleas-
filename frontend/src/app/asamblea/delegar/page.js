'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Card, CardHeader, Button, Badge, Input } from '../../../components/ui';

export default function DelegarVotoPage() {
    const router = useRouter();
    const {
        usuario,
        emitirCartaPoder,
        obtenerResumenRepresentacion,
    } = useAuth();

    // Verificación preventiva de acreditación KYC
    const kycNoVerificado =
        usuario?.kycVerificado === false ||
        usuario?.estadoKyc === 'PENDIENTE_AUDITORIA';

    // Consultamos el estado de representación centralizado en AuthContext
    const resumenRepresentacion = obtenerResumenRepresentacion(usuario?.email);

    // Unidades y coeficiente dinámico del poderdante (titular logueado)
    const unidadesEtiqueta =
        Array.isArray(usuario?.unidades) && usuario.unidades.length > 0
            ? usuario.unidades.map((u) => `UF ${u}`).join(', ')
            : usuario?.unidad || 'UF 5A, UF C04';
    const coeficienteTotal = Number(
        usuario?.coeficienteTotal ?? usuario?.coeficiente ?? 0
    ).toFixed(2);

    // Estado del formulario de Carta Poder Digital
    const [emailApoderado, setEmailApoderado] = useState('');
    const [nombreApoderado, setNombreApoderado] = useState('');
    const [vigencia, setVigencia] = useState('Para la Asamblea actual');
    const [archivoPoder, setArchivoPoder] = useState(null);
    const [errorValidacion, setErrorValidacion] = useState('');
    const [poderEnviado, setPoderEnviado] = useState(false);
    const [datosPoderEmitido, setDatosPoderEmitido] = useState(null);

    const manejarEnvioPoder = (e) => {
        e.preventDefault();
        setErrorValidacion('');

        if (kycNoVerificado) return;

        if (!emailApoderado.trim() || !emailApoderado.includes('@')) {
            setErrorValidacion(
                '⚠️ Ingrese un Correo Electrónico válido correspondiente al vecino o apoderado designado.'
            );
            return;
        }

        if (
            usuario?.email &&
            emailApoderado.trim().toLowerCase() === usuario.email.toLowerCase()
        ) {
            setErrorValidacion(
                '⚠️ No puede delegar la representación a su propio correo electrónico.'
            );
            return;
        }

        // Guardamos el mandato en el estado global de AuthContext
        const nuevoMandato = emitirCartaPoder({
            emailApoderado: emailApoderado.trim(),
            nombreApoderado: nombreApoderado.trim() || 'Representante Designado',
            vigencia,
            documentoAdjunto: archivoPoder?.name || 'Carta_Poder_Digital_Firmada.pdf',
        });

        setDatosPoderEmitido(nuevoMandato);
        setPoderEnviado(true);
    };

    const cargarOtroPoder = () => {
        setPoderEnviado(false);
        setDatosPoderEmitido(null);
        setEmailApoderado('');
        setNombreApoderado('');
        setArchivoPoder(null);
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6 font-sans">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Navegación superior */}
                <div className="flex flex-wrap justify-between items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/asamblea')}
                    >
                        ← Volver al Lobby de Asamblea
                    </Button>
                    <Badge variant="info" size="sm" shape="rounded">
                        Art. 2060 / 2062 CCyCN • Representación por Mandato
                    </Badge>
                </div>

                <Card className="overflow-hidden shadow-md">
                    <CardHeader
                        eyebrow="Mandato y Unificación de Personería • ConsorcioSync"
                        title="Gestión de Representación (Cartas Poder)"
                        subtitle="Delegue su derecho a voto y coeficiente fiscal en otro vecino o apoderado para la toma de decisiones."
                        badge={
                            <Badge variant="darkInfo" size="md" shape="rounded">
                                📜 Carta Poder Digital
                            </Badge>
                        }
                    />

                    <div className="p-6 md:p-8 space-y-6">

                        {/* Resumen del Poderdante (Titular que delega) */}
                        <Card
                            variant="subtle"
                            className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        >
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Poderdante (Titular Cedente)
                                </span>
                                <p className="text-sm font-bold text-slate-900 mt-0.5">
                                    {usuario?.nombre || 'Propietario'} (
                                    {usuario?.email || 'propietario@consorcio.com'})
                                </p>
                                <span className="text-xs text-slate-600 block mt-0.5">
                                    Unidades comprendidas en el mandato:{' '}
                                    <strong>{unidadesEtiqueta}</strong>
                                </span>
                            </div>
                            <div className="bg-white border border-blue-200 rounded-lg px-4 py-2 text-right">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Peso Electoral a Delegar
                                </span>
                                <span className="text-lg font-mono font-extrabold text-blue-700">
                                    {coeficienteTotal}%
                                </span>
                            </div>
                        </Card>

                        {/* 1. BLOQUEO PREVENTIVO SI EL USUARIO TIENE KYC PENDIENTE */}
                        {kycNoVerificado ? (
                            <Card
                                variant="warning"
                                className="p-6 border-2 border-amber-400 space-y-4 text-center"
                            >
                                <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center text-2xl mx-auto shadow">
                                    ⚠️
                                </div>
                                <div className="space-y-1.5 max-w-xl mx-auto">
                                    <Badge variant="warning" size="sm">
                                        ⏳ ESTADO KYC: {usuario?.estadoKyc || 'PENDIENTE_AUDITORIA'}
                                    </Badge>
                                    <h3 className="text-base font-extrabold text-amber-950">
                                        ⚠️ No puede delegar su voto. Su identidad y titularidad dominial aún están en proceso de auditoría (KYC).
                                    </h3>
                                    <p className="text-xs text-amber-900 leading-relaxed">
                                        Por seguridad jurídica (Art. 2060 CCyCN), únicamente los propietarios con legajo dominial aprobado pueden otorgar Cartas Poder a terceros.
                                    </p>
                                </div>
                                <div className="pt-2 flex justify-center gap-3">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => router.push('/asamblea')}
                                    >
                                        ← Volver al Lobby de Asamblea
                                    </Button>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        onClick={() => router.push('/onboarding')}
                                    >
                                        🛡️ Ver Estado de mi Acreditación KYC
                                    </Button>
                                </div>
                            </Card>
                        ) : !poderEnviado ? (
                            <form onSubmit={manejarEnvioPoder} className="space-y-5">

                                {resumenRepresentacion.tieneVotoDelegado && (
                                    <Card variant="info" className="p-4 text-xs">
                                        <strong>🔒 Mandato Vigente Activo:</strong> Usted ya posee una Carta Poder aprobada a favor de{' '}
                                        <strong>
                                            {resumenRepresentacion.poderCedidoAprobado?.emailApoderado}
                                        </strong>
                                        . Si emite una nueva solicitud, quedará sujeta a visado administrativo.
                                    </Card>
                                )}

                                {errorValidacion && (
                                    <Card variant="danger" className="p-3.5 text-xs font-bold">
                                        {errorValidacion}
                                    </Card>
                                )}

                                {/* Campo requerido: Correo Electrónico del Apoderado */}
                                <Input
                                    label="1. Correo Electrónico del Apoderado (A quién cede el voto)"
                                    type="email"
                                    required
                                    placeholder="Ej: propietario4b@consorcio.com o juan@unidad1a.com"
                                    value={emailApoderado}
                                    onChange={(e) => setEmailApoderado(e.target.value)}
                                    helperText="Una vez aprobado el mandato por el Administrador, el apoderado sumará automáticamente su coeficiente en la urna."
                                />

                                {/* Campo informativo: Nombre del Apoderado */}
                                <Input
                                    label="2. Nombre y Apellido del Apoderado (Opcional)"
                                    type="text"
                                    placeholder="Ej: Ana Martínez (UF 5A)"
                                    value={nombreApoderado}
                                    onChange={(e) => setNombreApoderado(e.target.value)}
                                />

                                {/* Selector de Vigencia */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        3. Selector de Vigencia del Mandato
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            {
                                                valor: 'Para la Asamblea actual',
                                                titulo: 'Para la Asamblea actual',
                                                detalle:
                                                    'Válido únicamente para la Asamblea Extraordinaria en curso. Caduca automáticamente al cierre del acta.',
                                                badge: 'Especial',
                                            },
                                            {
                                                valor: 'Poder Amplio (1 año)',
                                                titulo: 'Poder Amplio (1 año)',
                                                detalle:
                                                    'Habilita al apoderado a sufragar en asambleas ordinarias y extraordinarias durante 12 meses corridos.',
                                                badge: 'Anual',
                                            },
                                        ].map((opcion) => {
                                            const activo = vigencia === opcion.valor;
                                            return (
                                                <button
                                                    key={opcion.valor}
                                                    type="button"
                                                    onClick={() => setVigencia(opcion.valor)}
                                                    className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                                        activo
                                                            ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center gap-2 mb-1">
                                                        <span className="font-bold text-sm text-slate-900">
                                                            {activo ? '🔘' : '⚪'} {opcion.titulo}
                                                        </span>
                                                        <Badge
                                                            variant={activo ? 'primary' : 'neutral'}
                                                            size="sm"
                                                            shape="rounded"
                                                        >
                                                            {opcion.badge}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-600 leading-relaxed">
                                                        {opcion.detalle}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Adjunto de Carta Poder Firmada */}
                                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        4. Documento Adjunto (Instrumento Firmado PDF)
                                    </label>
                                    <p className="text-xs text-slate-500 mb-3">
                                        Adjunte la Carta Poder suscripta con firma electrónica o certificación para el visado de la Administración.
                                    </p>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) =>
                                            setArchivoPoder(e.target.files?.[0] || null)
                                        }
                                        className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                                    />
                                </div>

                                <Card variant="warning" className="p-3.5 text-xs">
                                    <strong>⚖️ Efecto Electoral:</strong> Al ser aprobado este mandato, su voto directo quedará bloqueado en la urna y su coeficiente del <strong>{coeficienteTotal}%</strong> se transferirá temporalmente al apoderado designado.
                                </Card>

                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => router.push('/asamblea')}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" variant="primary">
                                        📜 Emitir y Enviar Carta Poder →
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            /* Estado de Confirmación tras guardar en AuthContext */
                            <div className="space-y-5">
                                <Card
                                    variant="success"
                                    className="p-6 border-2 border-emerald-400"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl shrink-0 shadow">
                                            ✓
                                        </div>
                                        <div className="space-y-1.5">
                                            <Badge variant="warning" size="sm">
                                                ⏳ ESTADO: PENDIENTE DE VISADO
                                            </Badge>
                                            <h3 className="text-lg font-extrabold text-emerald-950">
                                                Poder enviado a Administración para su visado
                                            </h3>
                                            <p className="text-xs text-emerald-900 leading-relaxed">
                                                El mandato ha sido almacenado en el registro de <strong>Cartas Poder</strong> con estado <strong>PENDIENTE</strong>. Una vez que el Administrador audite y apruebe el instrumento, el apoderado (<strong>{datosPoderEmitido?.emailApoderado}</strong>) sumará automáticamente su coeficiente del <strong>{coeficienteTotal}%</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                {datosPoderEmitido && (
                                    <Card variant="subtle" className="p-5 space-y-3 text-xs">
                                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                            <span className="font-bold uppercase tracking-wider text-slate-500">
                                                Resumen del Mandato Registrado
                                            </span>
                                            <Badge variant="warning" size="sm">
                                                {datosPoderEmitido.estado}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-slate-400 font-bold uppercase block text-[10px]">
                                                    Poderdante (Cedente)
                                                </span>
                                                <span className="font-bold text-slate-900 text-sm">
                                                    {datosPoderEmitido.poderdante?.nombre} (
                                                    {datosPoderEmitido.poderdante?.unidad})
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 font-bold uppercase block text-[10px]">
                                                    Correo del Apoderado
                                                </span>
                                                <span className="font-bold text-blue-800 text-sm">
                                                    {datosPoderEmitido.emailApoderado}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 font-bold uppercase block text-[10px]">
                                                    Documento Adjunto
                                                </span>
                                                <span className="font-mono text-slate-800">
                                                    📎 {datosPoderEmitido.documentoAdjunto}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 font-bold uppercase block text-[10px]">
                                                    Vigencia Seleccionada
                                                </span>
                                                <Badge variant="info" size="sm">
                                                    {datosPoderEmitido.vigencia}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
                                    <Button
                                        variant="light"
                                        size="sm"
                                        onClick={cargarOtroPoder}
                                    >
                                        + Emitir otro Mandato
                                    </Button>
                                    <Button
                                        variant="dark"
                                        size="sm"
                                        onClick={() => router.push('/asamblea')}
                                    >
                                        Volver al Orden del Día →
                                    </Button>
                                </div>
                            </div>
                        )}

                    </div>
                </Card>

            </div>
        </div>
    );
}
