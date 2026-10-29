package com.consorcio.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para la solicitud de emisión de un voto.
 */
public record VotoRequest(
        @NotNull(message = "El identificador del tema es obligatorio")
        Integer idTema,

        @NotBlank(message = "El valor del voto no puede estar vacío")
        String valorVoto
) {
}

