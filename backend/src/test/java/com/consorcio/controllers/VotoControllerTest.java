package com.consorcio.controllers;

import com.consorcio.dtos.VotoRequest;
import com.consorcio.models.Tema;
import com.consorcio.models.Usuario;
import com.consorcio.models.Voto;
import com.consorcio.repositories.UsuarioRepository;
import com.consorcio.services.VotoService;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias del Controlador REST (VotoController)")
class VotoControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private VotoService votoService;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private VotoController votoController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(votoController).build();
        objectMapper = new ObjectMapper();

        UsernamePasswordAuthenticationToken autenticacion =
                new UsernamePasswordAuthenticationToken("vecino@consorcio.com", null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(autenticacion);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Debe registrar voto exitosamente para un usuario autenticado retornando 201 Created")
    void debeRegistrarVotoExitosamente() throws Exception {
        Usuario usuarioMock = Usuario.builder()
                .idUsuario(3)
                .email("vecino@consorcio.com")
                .rol("PROPIETARIO")
                .build();

        Tema temaMock = Tema.builder()
                .idTema(15)
                .titulo("Pintura de fachada")
                .build();

        Voto votoMock = Voto.builder()
                .idVoto(1)
                .tema(temaMock)
                .usuario(usuarioMock)
                .valor("A_FAVOR")
                .pesoCoeficiente(new BigDecimal("0.050000"))
                .timestampEmision(LocalDateTime.now())
                .hashAnterior("GENESIS_HASH")
                .hashActual("hash64caractereshexadecimalesdepruebaconinmutabilidadcriptografica1")
                .build();

        when(usuarioRepository.findByEmail("vecino@consorcio.com")).thenReturn(Optional.of(usuarioMock));
        when(votoService.registrarVoto(3, 15, "A_FAVOR")).thenReturn(votoMock);

        VotoRequest request = new VotoRequest(15, "A_FAVOR");

        mockMvc.perform(post("/api/votos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idVoto").value(1))
                .andExpect(jsonPath("$.idTema").value(15))
                .andExpect(jsonPath("$.idUsuario").value(3))
                .andExpect(jsonPath("$.valor").value("A_FAVOR"))
                .andExpect(jsonPath("$.hashAnterior").value("GENESIS_HASH"))
                .andExpect(jsonPath("$.hashActual").value("hash64caractereshexadecimalesdepruebaconinmutabilidadcriptografica1"));

        verify(votoService).registrarVoto(3, 15, "A_FAVOR");
    }

    @Test
    @DisplayName("Debe retornar 400 Bad Request ante solicitud con datos inválidos")
    void debeRetornar400AnteDatosInvalidos() throws Exception {
        VotoRequest requestInvalido = new VotoRequest(null, "");

        mockMvc.perform(post("/api/votos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestInvalido)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(votoService);
    }
}
