package com.consorcio.controllers;

import com.consorcio.dtos.VotoRequest;
import com.consorcio.dtos.VotoResponse;
import com.consorcio.models.Usuario;
import com.consorcio.models.Voto;
import com.consorcio.repositories.UsuarioRepository;
import com.consorcio.services.VotoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controlador REST para la gestión de votaciones en asambleas consorciales.
 * Expone endpoints seguros bajo la ruta /api/votos.
 */
@RestController
@RequestMapping("/api/votos")
public class VotoController {

    private final VotoService votoService;
    private final UsuarioRepository usuarioRepository;

    public VotoController(VotoService votoService, UsuarioRepository usuarioRepository) {
        this.votoService = votoService;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Endpoint protegido para registrar la emisión de un voto.
     * Identifica al usuario de forma segura a partir del token JWT contenido en el SecurityContext.
     *
     * @param request Datos de la votación (idTema y valorVoto).
     * @return 201 Created con el detalle del voto y sus sellos criptográficos.
     */
    @PostMapping
    public ResponseEntity<VotoResponse> registrarVoto(@Valid @RequestBody VotoRequest request) {
        // Extraemos el identificador (email) del usuario actualmente autenticado desde el contexto de Spring Security
        String emailUsuarioAutenticado = SecurityContextHolder.getContext().getAuthentication().getName();

        Usuario usuarioAutenticado = usuarioRepository.findByEmail(emailUsuarioAutenticado)
                .orElseThrow(() -> new IllegalStateException("Usuario autenticado no encontrado en el sistema: " + emailUsuarioAutenticado));

        Voto votoRegistrado = votoService.registrarVoto(
                usuarioAutenticado.getIdUsuario(),
                request.idTema(),
                request.valorVoto()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(VotoResponse.fromEntity(votoRegistrado));
    }

    // =========================================================================
    // Manejo de excepciones específico para respuestas HTTP semánticas
    // =========================================================================

    /** Errores de reglas de negocio (ej: asamblea cerrada, voto duplicado, falta de unidad funcional). */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> manejarEstadoIlegal(IllegalStateException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    /** Parámetros o entidades no encontradas (ej: idTema inexistente). */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> manejarArgumentoIlegal(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    /** Errores de validación en el cuerpo de la petición (@Valid en VotoRequest). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> manejarValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        fe -> fe.getField(),
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Valor inválido",
                        (primerError, segundoError) -> primerError));
        return ResponseEntity.badRequest().body(errores);
    }
}

