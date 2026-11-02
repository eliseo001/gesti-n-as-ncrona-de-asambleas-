package com.consorcio.dtos;

import com.consorcio.models.Mensaje;

import java.time.LocalDateTime;

/**
 * Evento de dominio de mensajería utilizado exclusivamente como payload para WebSockets (STOMP).
 *
 * Justificación de Clean Code / Separación de Responsabilidades:
 * A pesar de compartir estructura con MensajeResponse, separar el contrato REST (HTTP síncrono)
 * del contrato de mensajería asíncrono (WebSockets Pub/Sub) garantiza que futuras evoluciones
 * en la API web (ej. hipermedios, enlaces HATEOAS, paginación) no impacten ni degraden el rendimiento
 * del canal de tiempo real.
 */
public record MensajeRecibidoEvent(
        Integer idMensaje,
        String contenido,
        LocalDateTime fechaPublicacion,
        String emailUsuario,
        String rolUsuario
) {
    public static MensajeRecibidoEvent fromEntity(Mensaje mensaje) {
        return new MensajeRecibidoEvent(
                mensaje.getIdMensaje(),
                mensaje.getContenido(),
                mensaje.getFechaPublicacion(),
                mensaje.getUsuario().getEmail(),
                mensaje.getUsuario().getRol()
        );
    }
}

