'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, Button, Badge, Input, ProgressBar } from '../../components/ui';

export default function OnboardingCorporativoPage() {
    const router = useRouter();
    const {
        usuario,
        padronMaestro,
        registrarOnboardingKyc,
    } = useAuth();

    // Detección de Flujo Condicional:
    // - false: Flujo Nuevo (Onboarding Corporativo desde invitación)
    // - true: Flujo Existente (Vincular Nueva Unidad a su Cartera para usuario ya logueado)
    const usuarioLogueado = Boolean(usuario);

    // Filtramos del Padrón Maestro únicamente las Unidades Físicas en estado VACANTE
    const unidadesVacantes = padronMaestro.filter((u) => u.estado === 'VACANTE');

    // Control de pasos del Wizard: 1 (Selección de Unidades y Credenciales) | 2 (Respaldo KYC) | 3 (En Auditoría)
    const [pasoActual, setPasoActual] = useState(1);

    // Estado Paso 1: Datos del Titular + Arreglo de Unidades Reclamadas (Checkboxes)
    const [datosCuenta, setDatosCuenta] = useState({
        nombre: 'Martín Echeverría',
        email: 'martin@unidad4b.com',
        password: '',
        confirmarPassword: '',
    });
    const [unidadesSeleccionadas, setUnidadesSeleccionadas] = useState(['4B', 'C12']);
    const [errorPaso1, setErrorPaso1] = useState('');

    // Pre-completar automáticamente Nombre y Correo Electrónico si hay un usuario logueado
    useEffect(() => {
        if (usuarioLogueado && usuario) {
            setDatosCuenta((prev) => ({
                ...prev,
                nombre: usuario.nombre || '',
                email: usuario.email || '',
            }));
        }
    }, [usuarioLogueado, usuario]);

    // Sincronizar selección inicial con las unidades vacantes reales del Padrón Maestro
    useEffect(() => {
        const codigosVacantes = unidadesVacantes.map((u) => u.depto);
        setUnidadesSeleccionadas((prev) => {
            const filtradas = prev.filter((codigo) => codigosVacantes.includes(codigo));
            if (filtradas.length > 0) return filtradas;
            return codigosVacantes.slice(0, 1);
        });
    }, [padronMaestro]);

    // Función para tildar o destildar una unidad vacante en la lista de Checkboxes
    const alternarSeleccionUnidad = (codigoDepto) => {
        setUnidadesSeleccionadas((prev) =>
            prev.includes(codigoDepto)
                ? prev.filter((item) => item !== codigoDepto)
                : [...prev, codigoDepto]
        );
    };

    // Cálculo dinámico en tiempo real con .reduce() manteniendo precisión decimal completa
    const coeficienteTotalAcumulado = unidadesVacantes
        .filter((u) => unidadesSeleccionadas.includes(u.depto))
        .reduce(
            (acumulador, unidad) =>
                acumulador + Number(unidad.coeficientePorcentual ?? unidad.coeficiente ?? 0),
            0
        );

    const superficieTotalAcumuladaM2 = unidadesVacantes
        .filter((u) => unidadesSeleccionadas.includes(u.depto))
        .reduce((acumulador, unidad) => acumulador + Number(unidad.superficieM2 || 0), 0);

    const coeficienteTotalFormateado = Number(coeficienteTotalAcumulado).toFixed(2);
    const etiquetaUnidadesSeleccionadas =
        unidadesSeleccionadas.length > 0
            ? unidadesSeleccionadas.map((u) => `UF ${u}`).join(', ')
            : 'Ninguna seleccionada';

    // Estado Paso 2: Archivos KYC (DNI Frente/Dorso + Escritura/Boleto)
    const [archivoDni, setArchivoDni] = useState(null);
    const [archivoEscritura, setArchivoEscritura] = useState(null);
    const [aceptaTerminosPrivacidad, setAceptaTerminosPrivacidad] = useState(false);
    const [errorPaso2, setErrorPaso2] = useState('');
    const [enviandoKyc, setEnviandoKyc] = useState(false);

    const calcularFortalezaPassword = (pwd) => {
        if (!pwd) return { nivel: 0, texto: 'Sin ingresar', color: 'slate' };
        let puntos = 0;
        if (pwd.length >= 8) puntos += 40;
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) puntos += 30;
        if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) puntos += 30;

        if (puntos < 50) return { nivel: 35, texto: 'Débil (mínimo 8 caracteres)', color: 'red' };
        if (puntos < 90)
            return {
                nivel: 70,
                texto: 'Media (recomendado incluir números)',
                color: 'amber',
            };
        return { nivel: 100, texto: 'Segura (Cumple estándar criptográfico)', color: 'emerald' };
    };

    const fortaleza = calcularFortalezaPassword(datosCuenta.password);

    // Validación dinámica del Paso 1:
    // - Si el usuario está logueado, el Paso 1 se aprueba solo con seleccionar la unidad.
    // - Si NO está logueado, exige además Nombre, Email y Contraseña segura.
    const avanzarAlPaso2 = (e) => {
        e.preventDefault();
        setErrorPaso1('');

        if (unidadesSeleccionadas.length === 0) {
            setErrorPaso1(
                'Debe seleccionar al menos una (1) unidad vacante del Padrón Maestro.'
            );
            return;
        }

        if (!usuarioLogueado) {
            if (!datosCuenta.nombre.trim() || !datosCuenta.email.trim()) {
                setErrorPaso1('Por favor complete su nombre y correo electrónico.');
                return;
            }
            if (datosCuenta.password.length < 8) {
                setErrorPaso1(
                    'La contraseña debe contener al menos 8 caracteres por razones de seguridad electoral.'
                );
                return;
            }
            if (datosCuenta.password !== datosCuenta.confirmarPassword) {
                setErrorPaso1('Las contraseñas ingresadas no coinciden.');
                return;
            }
        }

        setPasoActual(2);
    };

    const enviarDocumentacionKyc = (e) => {
        e.preventDefault();
        setErrorPaso2('');

        if (!archivoEscritura || (!usuarioLogueado && !archivoDni)) {
            setErrorPaso2(
                usuarioLogueado
                    ? 'Debe adjuntar la Escritura o Boleto de Compraventa de la nueva unidad.'
                    : 'Debe adjuntar tanto el DNI (Frente/Dorso) como la Escritura o Boleto de Compraventa.'
            );
            return;
        }
        if (!aceptaTerminosPrivacidad) {
            setErrorPaso2(
                'Debe prestar conformidad con el protocolo de resguardo y purga de datos sensibles.'
            );
            return;
        }

        setEnviandoKyc(true);

        setTimeout(() => {
            registrarOnboardingKyc({
                nombre: usuarioLogueado ? usuario.nombre : datosCuenta.nombre,
                email: usuarioLogueado ? usuario.email : datosCuenta.email,
                password: usuarioLogueado ? null : datosCuenta.password,
                unidadesReclamadas: unidadesSeleccionadas,
                archivoDni:
                    archivoDni?.name ||
                    (usuarioLogueado ? 'DNI_En_Legajo_Verificado.pdf' : undefined),
                archivoEscritura: archivoEscritura.name,
            });
            setEnviandoKyc(false);
            setPasoActual(3);
        }, 500);
    };

    const simularArchivosDemo = () => {
        const sufijo = unidadesSeleccionadas.join('_');
        setArchivoDni({ name: `DNI_FrenteDorso_${sufijo}.pdf`, size: 428000 });
        setArchivoEscritura({
            name: `Escritura_NuevaUnidad_${sufijo}_Folio291.pdf`,
            size: 1492000,
        });
        setAceptaTerminosPrivacidad(true);
        setErrorPaso2('');
    };

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl space-y-4">

                {/* Barra Superior de Confianza y Encriptación */}
                <div className="flex flex-wrap justify-between items-center text-xs text-slate-600 px-1 gap-2">
                    <div className="flex items-center gap-2 font-semibold">
                        <span>🔒</span>
                        <span>Canal de Acreditación Cifrado (TLS 1.3 • SHA-256)</span>
                    </div>
                    <Badge variant="info" size="sm" shape="rounded">
                        {usuarioLogueado
                            ? `Sesión Activa: ${usuario.nombre} (${usuario.unidad})`
                            : 'Padrón Catastral Multi-Unidad • Consorcio Las Margaritas'}
                    </Badge>
                </div>

                <Card className="overflow-hidden shadow-xl">
                    <CardHeader className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <Badge variant="darkInfo" size="sm" shape="rounded">
                                    {usuarioLogueado
                                        ? 'Ampliación de Cartera Dominial • Propietario Registrado'
                                        : 'Onboarding Corporativo & KYC • Art. 2056 y 2059 CCyCN'}
                                </Badge>
                                <h1 className="text-2xl font-bold mt-2">
                                    {usuarioLogueado
                                        ? 'Vincular Nueva Unidad a su Cartera'
                                        : 'Onboarding Corporativo'}
                                </h1>
                                <p className="text-slate-400 text-xs mt-1">
                                    {usuarioLogueado
                                        ? 'Seleccione la nueva unidad funcional o complementaria adquirida para anexarla a su cuenta actual.'
                                        : 'Seleccione todas las unidades funcionales y complementarias (Depto, Cochera, Baulera) bajo su titularidad.'}
                                </p>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl text-right whitespace-nowrap">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                                    {usuarioLogueado
                                        ? 'Peso Adicional Reclamado'
                                        : 'Poder de Voto Acumulado'}
                                </span>
                                <span className="text-base font-extrabold text-blue-400 font-mono">
                                    {unidadesSeleccionadas.length} UF • {coeficienteTotalFormateado}%
                                </span>
                            </div>
                        </div>

                        {/* Indicador de Progreso del Wizard */}
                        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-slate-800 text-xs">
                            <div
                                className={`flex items-center gap-2 ${
                                    pasoActual >= 1 ? 'text-white font-bold' : 'text-slate-500'
                                }`}
                            >
                                <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                                        pasoActual >= 1
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-800 text-slate-400'
                                    }`}
                                >
                                    1
                                </span>
                                <span>
                                    {usuarioLogueado ? 'Seleccionar Unidad' : 'Unidades y Clave'}
                                </span>
                            </div>
                            <div
                                className={`flex items-center gap-2 ${
                                    pasoActual >= 2 ? 'text-white font-bold' : 'text-slate-500'
                                }`}
                            >
                                <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                                        pasoActual >= 2
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-800 text-slate-400'
                                    }`}
                                >
                                    2
                                </span>
                                <span>Respaldo Dominial</span>
                            </div>
                            <div
                                className={`flex items-center gap-2 ${
                                    pasoActual === 3
                                        ? 'text-emerald-400 font-bold'
                                        : 'text-slate-500'
                                }`}
                            >
                                <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                                        pasoActual === 3
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-800 text-slate-400'
                                    }`}
                                >
                                    3
                                </span>
                                <span>Auditoría</span>
                            </div>
                        </div>
                    </CardHeader>

                    {/* =========================================================
                        PASO 1: FLUJO CONDICIONAL (NUEVO ONBOARDING vs RECLAMO DE UNIDAD)
                       ========================================================= */}
                    {pasoActual === 1 && (
                        <form onSubmit={avanzarAlPaso2} className="p-6 md:p-8 space-y-5">
                            {errorPaso1 && (
                                <Card
                                    variant="danger"
                                    className="p-3 text-xs font-bold text-center"
                                >
                                    ⚠️ {errorPaso1}
                                </Card>
                            )}

                            {usuarioLogueado && (
                                <Card
                                    variant="subtle"
                                    className="p-3.5 text-xs flex items-center justify-between gap-3 border-blue-200 bg-blue-50/50"
                                >
                                    <div>
                                        <span className="font-bold text-blue-950 block">
                                            ✓ Identidad acreditada en sesión activa
                                        </span>
                                        <span className="text-slate-600">
                                            Cartera actual vinculada: <strong>{usuario.unidad}</strong> (
                                            {Number(usuario.coeficienteTotal || 0).toFixed(2)}%). Los datos del titular se asocian automáticamente a su cuenta.
                                        </span>
                                    </div>
                                    <Badge variant="success" size="sm">
                                        Sesión Verificada
                                    </Badge>
                                </Card>
                            )}

                            {/* Nombre del Titular y Correo Electrónico (Pre-completados y disabled si usuarioLogueado === true) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Nombre del Titular"
                                    value={
                                        usuarioLogueado
                                            ? usuario?.nombre || ''
                                            : datosCuenta.nombre
                                    }
                                    disabled={usuarioLogueado}
                                    readOnly={usuarioLogueado}
                                    onChange={(e) =>
                                        setDatosCuenta({ ...datosCuenta, nombre: e.target.value })
                                    }
                                    required
                                />
                                <Input
                                    type="email"
                                    label="Correo Electrónico"
                                    value={
                                        usuarioLogueado
                                            ? usuario?.email || ''
                                            : datosCuenta.email
                                    }
                                    disabled={usuarioLogueado}
                                    readOnly={usuarioLogueado}
                                    onChange={(e) =>
                                        setDatosCuenta({ ...datosCuenta, email: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            {/* Lista de Checkboxes (Selección de Unidades Vacantes) */}
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center">
                                    <label className="block text-xs font-bold uppercase text-slate-700">
                                        Seleccione las Unidades Vacantes a Reclamar en el Padrón Maestro
                                    </label>
                                    <span className="text-[11px] text-slate-500">
                                        Unidades físicas disponibles ({unidadesVacantes.length})
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
                                    {unidadesVacantes.map((unidad) => {
                                        const estaSeleccionada = unidadesSeleccionadas.includes(
                                            unidad.depto
                                        );

                                        return (
                                            <label
                                                key={unidad.id}
                                                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                                                    estaSeleccionada
                                                        ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-600/20 shadow-sm'
                                                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={estaSeleccionada}
                                                        onChange={() =>
                                                            alternarSeleccionUnidad(unidad.depto)
                                                        }
                                                        className="w-4 h-4 accent-blue-700 rounded cursor-pointer"
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-extrabold text-slate-900 text-sm">
                                                                UF {unidad.depto}
                                                            </span>
                                                            <Badge
                                                                variant={
                                                                    unidad.tipo === 'Departamento'
                                                                        ? 'primary'
                                                                        : 'secondary'
                                                                }
                                                                size="sm"
                                                                shape="rounded"
                                                            >
                                                                {unidad.tipo}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-[11px] text-slate-500 block mt-0.5">
                                                            {unidad.ubicacion}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span className="font-mono font-extrabold text-blue-700 text-xs">
                                                    {unidad.superficieM2} m2 -{' '}
                                                    {Number(
                                                        unidad.coeficientePorcentual ??
                                                            unidad.coeficiente
                                                    ).toFixed(2)}
                                                    %
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tarjeta Resumen Dinámica Multi-Unidad */}
                            <Card
                                variant="info"
                                className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                            >
                                <div>
                                    <span className="text-xs font-extrabold uppercase text-blue-950 block">
                                        📊 Unidades Seleccionadas: {unidadesSeleccionadas.length} (
                                        {etiquetaUnidadesSeleccionadas} • {superficieTotalAcumuladaM2}{' '}
                                        m2)
                                    </span>
                                    <span className="text-xs text-blue-800">
                                        Ponderación dinámica sobre el 100% de la superficie total del consorcio.
                                    </span>
                                </div>
                                <Badge
                                    variant="primary"
                                    size="md"
                                    shape="rounded"
                                    className="font-mono text-sm px-3.5 py-1.5"
                                >
                                    Coeficiente Reclamado: {coeficienteTotalFormateado}%
                                </Badge>
                            </Card>

                            {/* Renderizado Condicional Limpio: Solo mostramos los campos de contraseña y medidor si NO está logueado */}
                            {!usuarioLogueado && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                        <Input
                                            type="password"
                                            label="Crear Contraseña Segura"
                                            placeholder="Mínimo 8 caracteres..."
                                            value={datosCuenta.password}
                                            onChange={(e) =>
                                                setDatosCuenta({
                                                    ...datosCuenta,
                                                    password: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                        <Input
                                            type="password"
                                            label="Confirmar Contraseña"
                                            placeholder="Repita su contraseña..."
                                            value={datosCuenta.confirmarPassword}
                                            onChange={(e) =>
                                                setDatosCuenta({
                                                    ...datosCuenta,
                                                    confirmarPassword: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <Card variant="subtle" className="p-3.5">
                                        <ProgressBar
                                            label="Nivel de Seguridad de la Credencial"
                                            detalleDerecha={fortaleza.texto}
                                            porcentaje={fortaleza.nivel}
                                            color={fortaleza.color}
                                            size="sm"
                                        />
                                    </Card>
                                </>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        router.push(usuarioLogueado ? '/asamblea' : '/')
                                    }
                                >
                                    {usuarioLogueado
                                        ? '← Volver al Lobby de Asamblea'
                                        : '← Volver al Login'}
                                </Button>
                                <Button type="submit" variant="primary" size="lg">
                                    {usuarioLogueado
                                        ? 'Continuar al Paso 2 (Subir Escritura) →'
                                        : 'Continuar al Paso 2 (Documentación KYC) →'}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* =========================================================
                        PASO 2: FORMULARIO KYC (CARGA DE ESCRITURA / DNI)
                       ========================================================= */}
                    {pasoActual === 2 && (
                        <form onSubmit={enviarDocumentacionKyc} className="p-6 md:p-8 space-y-6">
                            <div className="flex flex-wrap justify-between items-center gap-2">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {usuarioLogueado
                                            ? 'Acreditación Dominial de la Nueva Unidad'
                                            : 'Respaldo Documental de Titularidad (KYC)'}
                                    </h2>
                                    <p className="text-xs text-slate-600">
                                        Acredite su vínculo dominial sobre{' '}
                                        <strong>{etiquetaUnidadesSeleccionadas}</strong> (Coeficiente
                                        Ponderado: <strong>{coeficienteTotalFormateado}%</strong>).
                                    </p>
                                </div>
                                <Button variant="light" size="sm" onClick={simularArchivosDemo}>
                                    ⚡ Autocompletar Documentos (Demo)
                                </Button>
                            </div>

                            {errorPaso2 && (
                                <Card
                                    variant="danger"
                                    className="p-3 text-xs font-bold text-center"
                                >
                                    ⚠️ {errorPaso2}
                                </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card variant="subtle" className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold uppercase text-slate-700 block">
                                                1. Cargar DNI (Frente / Dorso){' '}
                                                {usuarioLogueado && '(Opcional - Ya acreditado)'}
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                                {usuarioLogueado
                                                    ? 'Su DNI ya consta en su legajo activo; puede adjuntarlo nuevamente si lo desea.'
                                                    : 'Documento Nacional de Identidad vigente (PDF, JPG, PNG)'}
                                            </span>
                                        </div>
                                        <span className="text-xl">🪪</span>
                                    </div>

                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) setArchivoDni(e.target.files[0]);
                                        }}
                                        className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer border border-slate-300 rounded-lg p-1.5 bg-white"
                                    />

                                    {archivoDni && (
                                        <Badge
                                            variant="success"
                                            size="sm"
                                            shape="rounded"
                                            className="w-full justify-between"
                                        >
                                            <span className="truncate">✓ {archivoDni.name}</span>
                                            <span>{(archivoDni.size / 1024).toFixed(0)} KB</span>
                                        </Badge>
                                    )}
                                </Card>

                                <Card variant="subtle" className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold uppercase text-slate-700 block">
                                                2. Cargar Escritura / Boleto de Compraventa
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                                Instrumento público que respalde la adquisición de{' '}
                                                {etiquetaUnidadesSeleccionadas}
                                            </span>
                                        </div>
                                        <span className="text-xl">📜</span>
                                    </div>

                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            if (e.target.files?.[0])
                                                setArchivoEscritura(e.target.files[0]);
                                        }}
                                        className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer border border-slate-300 rounded-lg p-1.5 bg-white"
                                    />

                                    {archivoEscritura && (
                                        <Badge
                                            variant="success"
                                            size="sm"
                                            shape="rounded"
                                            className="w-full justify-between"
                                        >
                                            <span className="truncate">
                                                ✓ {archivoEscritura.name}
                                            </span>
                                            <span>
                                                {(archivoEscritura.size / 1024).toFixed(0)} KB
                                            </span>
                                        </Badge>
                                    )}
                                </Card>
                            </div>

                            <Card variant="info" className="p-4 space-y-2 text-xs">
                                <div className="flex items-center gap-2 font-bold text-blue-950">
                                    <span>🛡️</span>
                                    <span>
                                        Protocolo de Privacidad y Purga Automática (Ley N° 25.326)
                                    </span>
                                </div>
                                <p className="text-blue-900 leading-relaxed">
                                    Los archivos adjuntos se almacenan de forma cifrada temporalmente con el único fin de que la Administración audite su titularidad. Una vez aprobada la solicitud, las imágenes se purgan del servidor conservando únicamente su huella criptográfica SHA-256.
                                </p>
                                <label className="flex items-center gap-2.5 pt-2 font-bold text-slate-900 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={aceptaTerminosPrivacidad}
                                        onChange={(e) =>
                                            setAceptaTerminosPrivacidad(e.target.checked)
                                        }
                                        className="w-4 h-4 accent-blue-700 rounded cursor-pointer"
                                    />
                                    <span>
                                        Declaro bajo juramento que la documentación adjunta es auténtica y solicito la vinculación de las unidades seleccionadas a mi cuenta.
                                    </span>
                                </label>
                            </Card>

                            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                <Button variant="light" onClick={() => setPasoActual(1)}>
                                    ← Volver al Paso 1
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={enviandoKyc}
                                >
                                    {enviandoKyc
                                        ? 'Cifrando y enviando legajo...'
                                        : '🔒 Enviar Escritura para Auditoría'}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* =========================================================
                        PASO 3: ESTADO DE ÉXITO (PENDIENTE DE AUDITORÍA POR ADMIN)
                       ========================================================= */}
                    {pasoActual === 3 && (
                        <div className="p-8 text-center space-y-6">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-800 flex items-center justify-center text-3xl mx-auto shadow-sm">
                                🛡️
                            </div>

                            <div className="space-y-2 max-w-lg mx-auto">
                                <Badge variant="warning" size="md">
                                    ⏳ ESTADO: PENDIENTE_AUDITORIA
                                </Badge>
                                <h2 className="text-2xl font-bold text-slate-900 pt-1">
                                    Documentación enviada. Su solicitud está en proceso de auditoría por la administración.
                                </h2>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Hemos asociado el reclamo de{' '}
                                    <strong>{etiquetaUnidadesSeleccionadas}</strong> (Coeficiente
                                    Ponderado: <strong>{coeficienteTotalFormateado}%</strong>) a la
                                    cuenta de{' '}
                                    <strong>
                                        {usuarioLogueado ? usuario.nombre : datosCuenta.nombre}
                                    </strong>{' '}
                                    ({usuarioLogueado ? usuario.email : datosCuenta.email}). Una vez
                                    aprobado por la Administración, se sumará automáticamente a su poder de voto.
                                </p>
                            </div>

                            <Card
                                variant="subtle"
                                className="p-4 max-w-md mx-auto text-left text-xs space-y-1.5 font-mono"
                            >
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Titular Asociado:</span>
                                    <span className="font-bold text-slate-800">
                                        {usuarioLogueado ? usuario.nombre : datosCuenta.nombre}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Correo de Cuenta:</span>
                                    <span className="font-bold text-slate-800">
                                        {usuarioLogueado ? usuario.email : datosCuenta.email}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Unidades Reclamadas:</span>
                                    <span className="font-bold text-blue-700">
                                        {etiquetaUnidadesSeleccionadas} ({superficieTotalAcumuladaM2} m2)
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Coeficiente Reclamado:</span>
                                    <span className="font-bold text-emerald-700">
                                        +{coeficienteTotalFormateado}%
                                    </span>
                                </div>
                            </Card>

                            <div className="pt-4 border-t border-slate-200 flex justify-center">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={() => router.push('/asamblea')}
                                >
                                    🏛️ Volver al Lobby de Asamblea
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

            </div>
        </div>
    );
}
