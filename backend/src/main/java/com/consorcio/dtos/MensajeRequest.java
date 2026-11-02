package com.consorcio.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para la petición de publicación de un mensaje en el foro de debate.
 */
public record MensajeRequest(
        @NotNull(message = "El identificador del tema es obligatorio")
        Integer idTema,

        @NotBlank(message = "El contenido del mensaje no puede estar vacío ni contener solo espacios")
        String contenido
) {
}

