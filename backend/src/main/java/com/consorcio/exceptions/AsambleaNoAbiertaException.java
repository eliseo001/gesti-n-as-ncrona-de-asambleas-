package com.consorcio.exceptions;

/**
 * Excepción de dominio lanzada cuando se intenta emitir un sufragio en una asamblea
 * que no se encuentra en estado ABIERTA o cuya ventana temporal ha expirado.
 */
public class AsambleaNoAbiertaException extends IllegalStateException {

    public AsambleaNoAbiertaException(String mensaje) {
        super(mensaje);
    }
}

