package com.consorcio.dtos;

import com.consorcio.models.Voto;

import java.math.BigDecimal;

/**
 * Evento inmutable de dominio que representa la emisión confirmada de un voto.
 * Se utiliza como DTO de mensajería para notificar a los clientes en tiempo real
 * a través del broker de WebSockets, preservando el desacoplamiento con el modelo persistente.
 */
public record VotoEmitidoEvent(
        Integer idTema,
        String valorVoto,
        BigDecimal pesoCoeficiente,
        String hashActual
) {
    /**
     * Factoría de conversión limpia desde la entidad JPA.
     */
    public static VotoEmitidoEvent fromEntity(Voto voto) {
        return new VotoEmitidoEvent(
                voto.getTema().getIdTema(),
                voto.getValor(),
                voto.getPesoCoeficiente(),
                voto.getHashActual()
        );
    }
}

