package com.consorcio.services;

import com.consorcio.dtos.VotoEmitidoEvent;
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
import java.time.LocalDateTime;

/**
 * Servicio encargado de la orquestación y registro seguro del voto.
 * Implementa una cadena de bloques criptográfica liviana (blockchain ledger) a nivel de cada tema
 * y publica actualizaciones en tiempo real a través de WebSockets (STOMP).
 */
@Service
public class VotoService {

    private static final String HASH_GENESIS_INICIAL = "GENESIS_HASH";

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
     * Registra un nuevo voto de forma transaccional, enlazándolo criptográficamente con el historial
     * y emitiendo un evento en tiempo real para la actualización dinámica del quórum.
     *
     * @param idUsuario Identificador del copropietario que emite el voto.
     * @param idTema    Identificador de la moción o punto del orden del día a votar.
     * @param valorVoto Sentido de la votación (ej: "A_FAVOR", "EN_CONTRA", "ABSTENCION").
     * @return Entidad Voto persistida con su sello criptográfico asignado.
     */
    @Transactional
    public Voto registrarVoto(Integer idUsuario, Integer idTema, String valorVoto) {
        // 1. Buscar el Tema en debate
        Tema temaConsultado = temaRepository.findById(idTema)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el tema con ID: " + idTema));

        // 2. Validar que la Asamblea asociada esté abierta y vigente temporalmente
        validarQueAsambleaEsteAbierta(temaConsultado.getAsamblea());

        // 3. Validar que el Usuario no haya votado previamente en este Tema
        validarQueUsuarioNoHayaVotado(idUsuario, idTema);

        // Buscar la entidad del Usuario votante
        Usuario usuarioVotante = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el usuario con ID: " + idUsuario));

        // 4. Obtener el coeficiente de copropiedad legal de la Unidad Funcional del usuario en este consorcio
        Consorcio consorcioDeLaAsamblea = temaConsultado.getAsamblea().getConsorcio();
        BigDecimal coeficienteDeCopropiedad = obtenerCoeficienteDeCopropiedad(consorcioDeLaAsamblea, idUsuario);

        // 5. Buscar el último voto del Tema para obtener el hash anterior (o GENESIS_HASH)
        // Justificación: Cada nuevo voto depende del hash previo. Modificar un voto antiguo rompe la cadena.
        String hashDelVotoAnterior = votoRepository
                .findTopByTema_IdTemaOrderByIdVotoDesc(idTema)
                .map(Voto::getHashActual)
                .orElse(HASH_GENESIS_INICIAL);

        // 6. Generar el hash criptográfico del voto actual
        LocalDateTime momentoDeEmision = LocalDateTime.now();

        // Justificación: Se sella la identidad del votante, la moción votada, el sentido del voto,
        // el orden temporal estricto y la continuidad de la cadena.
        String datosParaElHash = hashDelVotoAnterior + idUsuario + idTema + valorVoto + momentoDeEmision;
        String hashDelVotoActual = hashService.generarHashSha256(datosParaElHash);

        // 7. Construir y guardar el nuevo Voto sellado
        Voto nuevoVoto = Voto.builder()
                .tema(temaConsultado)
                .usuario(usuarioVotante)
                .valor(valorVoto)
                .pesoCoeficiente(coeficienteDeCopropiedad)
                .timestampEmision(momentoDeEmision)
                .hashAnterior(hashDelVotoAnterior)
                .hashActual(hashDelVotoActual)
                .build();

        Voto votoGuardado = votoRepository.save(nuevoVoto);

        // 8. Publicación en tiempo real (Broadcast) mediante WebSockets / STOMP
        // Desacopla la vista: Notifica a todos los clientes suscritos al quórum de la asamblea
        // sin exponer entidades internas ni bloquear el hilo de ejecución principal.
        Integer idAsamblea = temaConsultado.getAsamblea().getIdAsamblea();
        VotoEmitidoEvent eventoVotoEmitido = VotoEmitidoEvent.fromEntity(votoGuardado);
        messagingTemplate.convertAndSend("/topic/asamblea/" + idAsamblea, eventoVotoEmitido);

        return votoGuardado;
    }

    // =========================================================================
    // Métodos privados de validación y soporte (Clean Code / Single Responsibility)
    // =========================================================================

    /**
     * Valida que la asamblea exista, se encuentre formalmente en estado "ABIERTA" y dentro de la ventana horaria.
     */
    private void validarQueAsambleaEsteAbierta(Asamblea asamblea) {
        if (asamblea == null) {
            throw new IllegalStateException("El tema consultado no posee una asamblea asociada");
        }

        if (!"ABIERTA".equalsIgnoreCase(asamblea.getEstado())) {
            throw new IllegalStateException("La asamblea no se encuentra abierta para votación (estado actual: " + asamblea.getEstado() + ")");
        }

        LocalDateTime momentoActual = LocalDateTime.now();
        boolean votoEmitidoAntesDelInicio = momentoActual.isBefore(asamblea.getVentanaInicio());
        boolean votoEmitidoDespuesDelCierre = momentoActual.isAfter(asamblea.getVentanaFin());

        if (votoEmitidoAntesDelInicio || votoEmitidoDespuesDelCierre) {
            throw new IllegalStateException("La votación no está permitida fuera de la ventana horaria habilitada para la asamblea");
        }
    }

    /**
     * Valida que el copropietario no posea un voto previo emitido para el tema consultado.
     */
    private void validarQueUsuarioNoHayaVotado(Integer idUsuario, Integer idTema) {
        boolean elUsuarioYaEmitioVoto = votoRepository.existsByTema_IdTemaAndUsuario_IdUsuario(idTema, idUsuario);
        if (elUsuarioYaEmitioVoto) {
            throw new IllegalStateException("El usuario ya ha emitido su voto para este tema en la asamblea");
        }
    }

    /**
     * Busca la unidad funcional del usuario dentro del consorcio para obtener su coeficiente legal de copropiedad.
     */
    private BigDecimal obtenerCoeficienteDeCopropiedad(Consorcio consorcio, Integer idUsuario) {
        if (consorcio == null || consorcio.getIdConsorcio() == null) {
            throw new IllegalStateException("La asamblea no tiene un consorcio válido asociado");
        }

        UnidadFuncional unidadFuncionalDelUsuario = unidadFuncionalRepository
                .findByConsorcio_IdConsorcioAndUsuario_IdUsuario(consorcio.getIdConsorcio(), idUsuario)
                .orElseThrow(() -> new IllegalStateException(
                        "El usuario no posee una unidad funcional registrada en el consorcio correspondiente a esta asamblea"));

        return unidadFuncionalDelUsuario.getCoeficienteCopropiedad();
    }
}
