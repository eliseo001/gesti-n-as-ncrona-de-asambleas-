package com.consorcio.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Manejador global de excepciones (@RestControllerAdvice) para estandarizar las respuestas
 * de error del motor criptográfico de votación bajo principios de Clean Architecture.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AsambleaNoAbiertaException.class)
    public ResponseEntity<Map<String, Object>> manejarAsambleaNoAbierta(AsambleaNoAbiertaException ex) {
        return construirRespuestaError(HttpStatus.CONFLICT, "ASAMBLEA_NO_ABIERTA", ex.getMessage());
    }

    @ExceptionHandler(VotoYaEmitidoException.class)
    public ResponseEntity<Map<String, Object>> manejarVotoYaEmitido(VotoYaEmitidoException ex) {
        return construirRespuestaError(HttpStatus.CONFLICT, "VOTO_YA_EMITIDO", ex.getMessage());
    }

    @ExceptionHandler(SinUnidadesFuncionalesException.class)
    public ResponseEntity<Map<String, Object>> manejarSinUnidades(SinUnidadesFuncionalesException ex) {
        return construirRespuestaError(HttpStatus.FORBIDDEN, "SIN_UNIDADES_EN_CONSORCIO", ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> manejarArgumentoInvalido(IllegalArgumentException ex) {
        return construirRespuestaError(HttpStatus.BAD_REQUEST, "PARAMETRO_INVALIDO", ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> manejarEstadoIlegalGenerico(IllegalStateException ex) {
        return construirRespuestaError(HttpStatus.BAD_REQUEST, "REGLA_NEGOCIO_VIOLADA", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> manejarErroresDeValidacionDto(MethodArgumentNotValidException ex) {
        Map<String, String> errores = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        error -> error.getField(),
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Valor inválido",
                        (primero, segundo) -> primero));
        return ResponseEntity.badRequest().body(errores);
    }

    private ResponseEntity<Map<String, Object>> construirRespuestaError(
            HttpStatus estadoHttp, String codigoError, String detalle) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("timestampUtc", Instant.now().toString());
        cuerpo.put("codigo", codigoError);
        cuerpo.put("error", detalle);
        return ResponseEntity.status(estadoHttp).body(cuerpo);
    }
}

