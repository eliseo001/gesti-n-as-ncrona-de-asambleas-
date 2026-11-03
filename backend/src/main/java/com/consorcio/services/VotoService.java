package com.consorcio.services;

import com.consorcio.dtos.VotoEmitidoEvent;
import com.consorcio.exceptions.AsambleaNoAbiertaException;
import com.consorcio.exceptions.SinUnidadesFuncionalesException;
import com.consorcio.exceptions.VotoYaEmitidoException;
import com.consorcio.models.Asamblea;
import com.consorcio.models.Consorcio;
import com.consorcio.models.Tema;
import com.consorcio.models.UnidadFuncional;
import com.consorcio.models.Usuario;
import com.consorcio.models.Voto;
import com.consorcio.repositories.TemaRepository;
import com.consorcio.repositories.UnidadFuncionalRepository;
import com.consorcio.repositories.UsuarioRepository;
import com.consorcio.repositories.VotoRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

/**
 * Servicio Core del Motor de Sufragio Criptográfico (Hash Chaining).
 *
 * <p>Orquesta la validación legal (Ley N° 26.994 - CCyCN), la consolidación financiera
 * Multi-Unidad mediante {@link BigDecimal}, el control de concurrencia pesimista en PostgreSQL
 * para evitar bifurcaciones de la cadena SHA-256 y la difusión en tiempo real vía WebSockets (STOMP).</p>
 */
@Service
public class VotoService {

    private final TemaRepository temaRepository;
    private final UsuarioRepository usuarioRepository;
    private final UnidadFuncionalRepository unidadFuncionalRepository;
    private final VotoRepository votoRepository;
    private final HashService hashService;
    private final SimpMessagingTemplate messagingTemplate;

    public VotoService(TemaRepository temaRepository,
                       UsuarioRepository usuarioRepository,
                       UnidadFuncionalRepository unidadFuncionalRepository,
                       VotoRepository votoRepository,
                       HashService hashService,
                       SimpMessagingTemplate messagingTemplate) {
        this.temaRepository = temaRepository;
        this.usuarioRepository = usuarioRepository;
        this.unidadFuncionalRepository = unidadFuncionalRepository;
        this.votoRepository = votoRepository;
        this.hashService = hashService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Sobrecarga con identificadores {@link Long} para cumplir con el contrato del dominio.
     *
     * @param idUsuario Identificador del copropietario votante.
     * @param idTema    Identificador del punto del Orden del Día.
     * @param valorVoto Postura adoptada ("A_FAVOR", "EN_CONTRA", "ABSTENCION").
     * @return Entidad {@link Voto} persistida y sellada criptográficamente.
     */
    @Transactional
    public Voto registrarVoto(Long idUsuario, Long idTema, String valorVoto) {
        if (idUsuario == null || idTema == null) {
            throw new IllegalArgumentException("Los identificadores de usuario y tema son obligatorios");
        }
        return registrarVoto(idUsuario.intValue(), idTema.intValue(), valorVoto);
    }

    /**
     * Registra un sufragio de forma atómica, serializando el encadenamiento criptográfico SHA-256
     * mediante bloqueo pesimista ({@code PESSIMISTIC_WRITE}) y consolidando los coeficientes de todas
     * las unidades funcionales del propietario.
     *
     * <p><b>Explicación para Defensa de Tesis (Prevención de Condición de Carrera / Fork):</b>
     * En una arquitectura concurrente, si dos vecinos votan en el mismo milisegundo sobre el mismo tema
     * bajo el aislamiento estándar {@code READ COMMITTED}, ambos hilos podrían leer el mismo {@code hashAnterior}
     * antes de que el otro confirme su transacción, generando una bifurcación (dos bloques hijos apuntando
     * al mismo bloque padre). Al invocar {@link VotoRepository#findTopByTemaIdOrderByFechaEmisionDesc(Integer)}
     * anotado con {@code @Lock(LockModeType.PESSIMISTIC_WRITE)}, PostgreSQL ejecuta un {@code SELECT ... FOR UPDATE}
     * sobre la cabeza de la cadena, obligando al segundo hilo a esperar el {@code COMMIT} del primero y
     * garantizando una topología estrictamente lineal e inmutable.</p>
     *
     * @param idUsuario Identificador del copropietario que emite el voto.
     * @param idTema    Identificador del tema o moción en tratamiento.
     * @param valorVoto Sentido del sufragio ("A_FAVOR", "EN_CONTRA", "ABSTENCION").
     * @return Entidad {@link Voto} persistida con su sello criptográfico SHA-256.
     */
    @Transactional
    public Voto registrarVoto(Integer idUsuario, Integer idTema, String valorVoto) {
        // a. Buscar el Tema y validar que la Asamblea asociada esté en estado ABIERTA y en horario
        Tema temaEnDebate = temaRepository.findById(idTema)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el tema con ID: " + idTema));

        validarQueAsambleaEsteAbierta(temaEnDebate.getAsamblea());

        // b. Validar que el propietario no haya emitido un voto previo en este Tema
        validarQueUsuarioNoHayaVotado(idUsuario, idTema);

        Usuario usuarioVotante = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el usuario con ID: " + idUsuario));

        // c. Obtener todas las unidades del propietario (Multi-Unidad) y sumar sus coeficientes con BigDecimal
        Consorcio consorcioDeLaAsamblea = temaEnDebate.getAsamblea().getConsorcio();
        BigDecimal coeficienteTotalConsolidado = calcularCoeficienteTotalMultiUnidad(consorcioDeLaAsamblea, idUsuario);

        // d. Leer el último hash de la cadena del tema aplicando BLOQUEO PESIMISTA (SELECT ... FOR UPDATE).
        // Si no existen votos previos para este tema, se calcula un Hash Génesis Dinámico único para el tema.
        String hashDelVotoAnterior = votoRepository
                .findTopByTemaIdOrderByFechaEmisionDesc(idTema)
                .map(Voto::getHashActual)
                .orElseGet(() -> generarHashGenesisDinamico(temaEnDebate));

        // e. Generar el nuevo hash SHA-256 sellando todos los atributos críticos en UTC
        Instant instanteUtcActual = Instant.now();
        LocalDateTime fechaEmisionUtc = LocalDateTime.ofInstant(instanteUtcActual, ZoneOffset.UTC);

        String cadenaCanonicaParaHash = construirCadenaCanonicaDelBloque(
                hashDelVotoAnterior,
                idUsuario,
                coeficienteTotalConsolidado,
                valorVoto,
                instanteUtcActual
        );
        String hashDelVotoActual = hashService.generarHashSha256(cadenaCanonicaParaHash);

        // f. Construir y persistir el nuevo eslabón criptográfico
        Voto nuevoVoto = Voto.builder()
                .tema(temaEnDebate)
                .usuario(usuarioVotante)
                .valor(valorVoto)
                .pesoCoeficiente(coeficienteTotalConsolidado)
                .timestampEmision(fechaEmisionUtc)
                .hashAnterior(hashDelVotoAnterior)
                .hashActual(hashDelVotoActual)
                .build();

        Voto votoPersistido = votoRepository.save(nuevoVoto);

        // Difusión en tiempo real del nuevo estado de la urna vía WebSocket STOMP
        Integer idAsamblea = temaEnDebate.getAsamblea().getIdAsamblea();
        VotoEmitidoEvent eventoVotoEmitido = VotoEmitidoEvent.fromEntity(votoPersistido);
        messagingTemplate.convertAndSend("/topic/asamblea/" + idAsamblea, eventoVotoEmitido);

        return votoPersistido;
    }

    // =========================================================================
    // Métodos privados de validación de dominio y criptografía (Clean Code)
    // =========================================================================

    /**
     * Valida que la asamblea exista, se encuentre formalmente en estado "ABIERTA" y dentro de la ventana horaria.
     *
     * @throws AsambleaNoAbiertaException Si la asamblea está cerrada, suspendida o fuera de término.
     */
    private void validarQueAsambleaEsteAbierta(Asamblea asamblea) {
        if (asamblea == null) {
            throw new AsambleaNoAbiertaException("El tema consultado no posee una asamblea asociada");
        }

        if (!"ABIERTA".equalsIgnoreCase(asamblea.getEstado())) {
            throw new AsambleaNoAbiertaException(
                    "La asamblea no se encuentra abierta para votación (estado actual: " + asamblea.getEstado() + ")");
        }

        LocalDateTime momentoActual = LocalDateTime.now();
        boolean antesDeApertura = asamblea.getVentanaInicio() != null && momentoActual.isBefore(asamblea.getVentanaInicio());
        boolean despuesDeCierre = asamblea.getVentanaFin() != null && momentoActual.isAfter(asamblea.getVentanaFin());

        if (antesDeApertura || despuesDeCierre) {
            throw new AsambleaNoAbiertaException(
                    "La votación no está permitida fuera de la ventana horaria habilitada para la asamblea");
        }
    }

    /**
     * Verifica que el copropietario no registre un sufragio previo en el mismo punto del Orden del Día.
     *
     * @throws VotoYaEmitidoException Si el usuario ya votó en este tema.
     */
    private void validarQueUsuarioNoHayaVotado(Integer idUsuario, Integer idTema) {
        boolean yaEmitioVoto = votoRepository.existsByTema_IdTemaAndUsuario_IdUsuario(idTema, idUsuario);
        if (yaEmitioVoto) {
            throw new VotoYaEmitidoException("El usuario ya ha emitido su voto para este tema en la asamblea");
        }
    }

    /**
     * Recupera todas las unidades asociadas al propietario en el consorcio (ej. Depto 4B + Cochera 12)
     * y suma sus coeficientes utilizando aritmética exacta de punto fijo ({@link BigDecimal}).
     *
     * <p><b>Justificación de Clean Code:</b> Se prohíbe el uso de {@code double} o {@code float}
     * conforme al estándar IEEE 754 para evitar errores de redondeo binario en el cómputo legal
     * del Art. 2060 del Código Civil y Comercial de la Nación.</p>
     *
     * @throws SinUnidadesFuncionalesException Si el usuario no posee ninguna unidad en el consorcio.
     */
    private BigDecimal calcularCoeficienteTotalMultiUnidad(Consorcio consorcio, Integer idUsuario) {
        if (consorcio == null || consorcio.getIdConsorcio() == null) {
            throw new SinUnidadesFuncionalesException("La asamblea no tiene un consorcio válido asociado");
        }

        List<UnidadFuncional> unidadesDelPropietario = unidadFuncionalRepository
                .findAllByConsorcio_IdConsorcioAndUsuario_IdUsuario(consorcio.getIdConsorcio(), idUsuario);

        if (unidadesDelPropietario == null || unidadesDelPropietario.isEmpty()) {
            throw new SinUnidadesFuncionalesException(
                    "El usuario no posee una unidad funcional registrada en el consorcio correspondiente a esta asamblea");
        }

        return unidadesDelPropietario.stream()
                .map(UnidadFuncional::getCoeficienteCopropiedad)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Genera un Hash Génesis Dinámico determinista y único para cada Tema de Asamblea.
     *
     * <p><b>Fundamento Criptográfico (Defensa de Tesis):</b> Reemplazar una constante estática
     * por una semilla derivada del ID del Tema y de su Asamblea impide ataques de repetición
     * (Replay Attack), donde un administrador de base de datos malicioso intente trasplantar
     * cadenas de bloques válidas de un tema antiguo hacia un tema nuevo.</p>
     */
    private String generarHashGenesisDinamico(Tema tema) {
        Integer idAsamblea = tema.getAsamblea() != null ? tema.getAsamblea().getIdAsamblea() : 0;
        String semillaGenesis = "GENESIS_BLOCK|ASAMBLEA:" + idAsamblea + "|TEMA:" + tema.getIdTema();
        return hashService.generarHashSha256(semillaGenesis);
    }

    /**
     * Construye la representación canónica con delimitadores explícitos ("|") para alimentar
     * el algoritmo SHA-256, incluyendo el coeficiente consolidado para impedir adulteraciones
     * del peso electoral en la base de datos.
     */
    private String construirCadenaCanonicaDelBloque(
            String hashAnterior,
            Integer idUsuario,
            BigDecimal coeficienteTotal,
            String valorVoto,
            Instant timestampUtc) {
        return hashAnterior
                + "|" + idUsuario
                + "|" + coeficienteTotal.toPlainString()
                + "|" + valorVoto
                + "|" + timestampUtc.toString();
    }
}
