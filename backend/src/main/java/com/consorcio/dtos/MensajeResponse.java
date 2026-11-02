package com.consorcio.dtos;

import com.consorcio.models.Mensaje;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para la API REST del foro de debate.
 * Entrega la información formateada del mensaje publicado sin exponer las entidades JPA.
 */
public record MensajeResponse(
        Integer idMensaje,
        String contenido,
        LocalDateTime fechaPublicacion,
        String emailUsuario,
        String rolUsuario
) {
    public static MensajeResponse fromEntity(Mensaje mensaje) {
        return new MensajeResponse(
                mensaje.getIdMensaje(),
                mensaje.getContenido(),
                mensaje.getFechaPublicacion(),
                mensaje.getUsuario().getEmail(),
                mensaje.getUsuario().getRol()
        );
    }
}

