package com.consorcio.dtos;

import com.consorcio.models.Voto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para la respuesta segura de un voto registrado.
 * Evita la exposición de entidades JPA y previene fugas de datos sensibles (como el passwordHash del usuario).
 */
public record VotoResponse(
        Integer idVoto,
        Integer idTema,
        Integer idUsuario,
        String valor,
        BigDecimal pesoCoeficiente,
        LocalDateTime timestampEmision,
        String hashAnterior,
        String hashActual
) {
    public static VotoResponse fromEntity(Voto voto) {
        return new VotoResponse(
                voto.getIdVoto(),
                voto.getTema().getIdTema(),
                voto.getUsuario().getIdUsuario(),
                voto.getValor(),
                voto.getPesoCoeficiente(),
                voto.getTimestampEmision(),
                voto.getHashAnterior(),
                voto.getHashActual()
        );
    }
}

