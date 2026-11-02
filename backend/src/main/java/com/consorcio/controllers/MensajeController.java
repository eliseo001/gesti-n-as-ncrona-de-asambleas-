package com.consorcio.controllers;

import com.consorcio.dtos.MensajeRequest;
import com.consorcio.dtos.MensajeResponse;
import com.consorcio.models.Mensaje;
import com.consorcio.models.Usuario;
import com.consorcio.repositories.UsuarioRepository;
import com.consorcio.services.MensajeService;
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
 * Controlador REST para el Foro de Debate en vivo de las asambleas.
 * Expone endpoints bajo la ruta /api/mensajes.
 */
@RestController
@RequestMapping("/api/mensajes")
public class MensajeController {

    private final MensajeService mensajeService;
    private final UsuarioRepository usuarioRepository;

    public MensajeController(MensajeService mensajeService, UsuarioRepository usuarioRepository) {
        this.mensajeService = mensajeService;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Publica un nuevo mensaje en el debate de un tema.
     * Identifica al usuario de forma segura a partir del token JWT contenido en el SecurityContext.
     *
     * @param request Datos del mensaje (idTema y contenido).
     * @return 201 Created con el MensajeResponse formateado.
     */
    @PostMapping
    public ResponseEntity<MensajeResponse> publicarMensaje(@Valid @RequestBody MensajeRequest request) {
        // 1. Extraer el email del usuario autenticado desde el contexto de Spring Security
        String emailUsuarioAutenticado = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Buscar al usuario en la base de datos para obtener su identificador interno
        Usuario usuarioAutenticado = usuarioRepository.findByEmail(emailUsuarioAutenticado)
                .orElseThrow(() -> new IllegalStateException("Usuario autenticado no encontrado en el sistema: " + emailUsuarioAutenticado));

        // 3. Ejecutar la lógica de negocio en el servicio
        Mensaje mensajePublicado = mensajeService.publicarMensaje(
                usuarioAutenticado.getIdUsuario(),
                request.idTema(),
                request.contenido()
        );

        // 4. Devolver respuesta semántica 201 Created con el DTO MensajeResponse
        return ResponseEntity.status(HttpStatus.CREATED).body(MensajeResponse.fromEntity(mensajePublicado));
    }

    // =========================================================================
    // Manejadores de excepciones semánticos (@ExceptionHandler)
    // =========================================================================

    /** Errores de reglas de negocio (ej: asamblea no se encuentra ABIERTA). */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> manejarEstadoIlegal(IllegalStateException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    /** Parámetros inválidos o entidades no encontradas (ej: idTema inexistente). */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> manejarArgumentoIlegal(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    /** Errores de validación de campos del DTO (@Valid en MensajeRequest). */
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

