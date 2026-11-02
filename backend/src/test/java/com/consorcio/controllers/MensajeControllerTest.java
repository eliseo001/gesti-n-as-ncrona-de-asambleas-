package com.consorcio.controllers;

import com.consorcio.dtos.MensajeRequest;
import com.consorcio.models.Tema;
import com.consorcio.models.Usuario;
import com.consorcio.models.Mensaje;
import com.consorcio.repositories.UsuarioRepository;
import com.consorcio.services.MensajeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias del Controlador REST (MensajeController)")
class MensajeControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private MensajeService mensajeService;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private MensajeController mensajeController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(mensajeController).build();
        objectMapper = new ObjectMapper();

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken("juan@margaritas.com", null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Debe publicar mensaje exitosamente y retornar 201 Created con el MensajeResponse")
    void debePublicarMensajeExitosamente() throws Exception {
        Usuario usuarioMock = Usuario.builder()
                .idUsuario(2)
                .email("juan@margaritas.com")
                .rol("PROPIETARIO")
                .build();

        Tema temaMock = Tema.builder()
                .idTema(10)
                .titulo("Presupuesto")
                .build();

        Mensaje mensajeMock = Mensaje.builder()
                .idMensaje(50)
                .tema(temaMock)
                .usuario(usuarioMock)
                .contenido("Pregunta sobre los gastos comunes")
                .fechaPublicacion(LocalDateTime.now())
                .build();

        when(usuarioRepository.findByEmail("juan@margaritas.com")).thenReturn(Optional.of(usuarioMock));
        when(mensajeService.publicarMensaje(2, 10, "Pregunta sobre los gastos comunes")).thenReturn(mensajeMock);

        MensajeRequest request = new MensajeRequest(10, "Pregunta sobre los gastos comunes");

        mockMvc.perform(post("/api/mensajes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idMensaje").value(50))
                .andExpect(jsonPath("$.contenido").value("Pregunta sobre los gastos comunes"))
                .andExpect(jsonPath("$.emailUsuario").value("juan@margaritas.com"))
                .andExpect(jsonPath("$.rolUsuario").value("PROPIETARIO"));

        verify(mensajeService).publicarMensaje(2, 10, "Pregunta sobre los gastos comunes");
    }

    @Test
    @DisplayName("Debe retornar 400 Bad Request si el contenido está en blanco")
    void debeRetornar400SiContenidoEstaEnBlanco() throws Exception {
        MensajeRequest requestInvalido = new MensajeRequest(10, "   ");

        mockMvc.perform(post("/api/mensajes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestInvalido)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(mensajeService);
    }
}

