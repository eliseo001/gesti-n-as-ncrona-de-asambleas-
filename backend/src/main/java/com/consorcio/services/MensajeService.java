package com.consorcio.services;

import com.consorcio.dtos.MensajeRecibidoEvent;
import com.consorcio.models.Asamblea;
import com.consorcio.models.Mensaje;
import com.consorcio.models.Tema;
import com.consorcio.models.Usuario;
import com.consorcio.repositories.MensajeRepository;
import com.consorcio.repositories.TemaRepository;
import com.consorcio.repositories.UsuarioRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Servicio encargado de la orquestación y publicación de mensajes en el foro de debate de la asamblea.
 * Gestiona la persistencia transaccional y la emisión reactiva de eventos vía WebSocket (STOMP).
 */
@Service
public class MensajeService {

    private final MensajeRepository mensajeRepository;
    private final TemaRepository temaRepository;
    private final UsuarioRepository usuarioRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MensajeService(MensajeRepository mensajeRepository,
                          TemaRepository temaRepository,
                          UsuarioRepository usuarioRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.mensajeRepository = mensajeRepository;
        this.temaRepository = temaRepository;
        this.usuarioRepository = usuarioRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Registra un nuevo mensaje en el debate de un tema y notifica inmediatamente a todos los participantes conectados.
     *
     * @param idUsuario Identificador del usuario que envía el mensaje.
     * @param idTema    Identificador del tema sobre el que se debate.
     * @param contenido Texto del mensaje.
     * @return Entidad Mensaje persistida.
     */
    @Transactional
    public Mensaje publicarMensaje(Integer idUsuario, Integer idTema, String contenido) {
        // 1. Buscar el Tema en debate
        Tema temaConsultado = temaRepository.findById(idTema)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el tema con ID: " + idTema));

        // 2. Validar que la Asamblea asociada esté en estado "ABIERTA"
        validarAsambleaAbierta(temaConsultado.getAsamblea());

        // 3. Buscar el Usuario emisor
        Usuario usuarioEmisor = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el usuario con ID: " + idUsuario));

        // 4. Crear la entidad Mensaje con la fecha actual y guardarla en la base de datos
        LocalDateTime momentoPublicacion = LocalDateTime.now();

        Mensaje nuevoMensaje = Mensaje.builder()
                .tema(temaConsultado)
                .usuario(usuarioEmisor)
                .contenido(contenido.trim())
                .fechaPublicacion(momentoPublicacion)
                .build();

        Mensaje mensajeGuardado = mensajeRepository.save(nuevoMensaje);

        // 5. Mapear el mensaje persistido a MensajeRecibidoEvent (DTO de mensajería desacoplado)
        MensajeRecibidoEvent eventoMensajeRecibido = MensajeRecibidoEvent.fromEntity(mensajeGuardado);

        // 6. Realizar el broadcast del evento vía WebSockets STOMP al canal del tema específico
        messagingTemplate.convertAndSend("/topic/chat/" + idTema, eventoMensajeRecibido);

        return mensajeGuardado;
    }

    // =========================================================================
    // Métodos privados de validación (Clean Code / Single Responsibility)
    // =========================================================================

    /**
     * Valida que la asamblea asociada exista y se encuentre formalmente en estado "ABIERTA" para permitir el debate.
     */
    private void validarAsambleaAbierta(Asamblea asamblea) {
        if (asamblea == null) {
            throw new IllegalStateException("El tema consultado no posee una asamblea vinculada");
        }

        if (!"ABIERTA".equalsIgnoreCase(asamblea.getEstado())) {
            throw new IllegalStateException("El debate está inactivo: La asamblea no se encuentra en estado ABIERTA (estado actual: " + asamblea.getEstado() + ")");
        }
    }
}

