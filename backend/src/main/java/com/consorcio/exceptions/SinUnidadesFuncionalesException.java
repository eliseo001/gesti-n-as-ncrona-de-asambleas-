package com.consorcio.exceptions;

/**
 * Excepción de dominio lanzada cuando un usuario autenticado intenta votar en un consorcio
 * donde no registra ninguna Unidad Funcional ni Unidad Complementaria asociada.
 */
public class SinUnidadesFuncionalesException extends IllegalStateException {

    public SinUnidadesFuncionalesException(String mensaje) {
        super(mensaje);
    }
}

