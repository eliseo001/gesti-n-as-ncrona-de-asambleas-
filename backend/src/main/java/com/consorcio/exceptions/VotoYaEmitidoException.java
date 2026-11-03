package com.consorcio.exceptions;

/**
 * Excepción de dominio lanzada cuando un copropietario intenta emitir un segundo voto
 * sobre un mismo punto del Orden del Día (violación del principio de unicidad de sufragio).
 */
public class VotoYaEmitidoException extends IllegalStateException {

    public VotoYaEmitidoException(String mensaje) {
        super(mensaje);
    }
}

