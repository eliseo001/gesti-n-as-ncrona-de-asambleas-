package com.consorcio.services;

import com.consorcio.dtos.MensajeRecibidoEvent;
import com.consorcio.models.Asamblea;
import com.consorcio.models.Consorcio;
import com.consorcio.models.Mensaje;
import com.consorcio.models.Tema;
import com.consorcio.models.Usuario;
import com.consorcio.repositories.MensajeRepository;
import com.consorcio.repositories.TemaRepository;
import com.consorcio.repositories.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - Servicio del Foro de Debate (MensajeService)")
class MensajeServiceTest {

    @Mock
    private MensajeRepository mensajeRepository;

    @Mock
    private TemaRepository temaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private MensajeService mensajeService;

    private Asamblea asamblea;
    private Tema tema;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        Consorcio consorcio = Consorcio.builder()
                .idConsorcio(1)
                .nombreConsorcio("Edificio Las Margaritas")
                .build();

        asamblea = Asamblea.builder()
                .idAsamblea(1)
                .consorcio(consorcio)
                .estado("ABIERTA")
                .ventanaInicio(LocalDateTime.now().minusHours(1))
                .ventanaFin(LocalDateTime.now().plusHours(2))
                .build();

        tema = Tema.builder()
                .idTema(10)
                .asamblea(asamblea)
                .titulo("Aprobación Presupuesto 2027")
                .build();

        usuario = Usuario.builder()
                .idUsuario(2)
                .email("juan@margaritas.com")
                .rol("PROPIETARIO")
                .build();
    }

    @Test
    @DisplayName("Debe publicar un mensaje exitosamente y emitir broadcast vía WebSocket al canal /topic/chat/{idTema}")
    void debePublicarMensajeYEmitirBroadcast() {
        when(temaRepository.findById(10)).thenReturn(Optional.of(tema));
        when(usuarioRepository.findById(2)).thenReturn(Optional.of(usuario));
        when(mensajeRepository.save(any(Mensaje.class))).thenAnswer(inv -> {
            Mensaje m = inv.getArgument(0);
            m.setIdMensaje(100);
            return m;
        });

        Mensaje mensajeGuardado = mensajeService.publicarMensaje(2, 10, "Estoy de acuerdo con el presupuesto propuesto");

        assertNotNull(mensajeGuardado);
        assertEquals(100, mensajeGuardado.getIdMensaje());
        assertEquals("Estoy de acuerdo con el presupuesto propuesto", mensajeGuardado.getContenido());
        assertEquals("juan@margaritas.com", mensajeGuardado.getUsuario().getEmail());
        assertNotNull(mensajeGuardado.getFechaPublicacion());

        ArgumentCaptor<Mensaje> captorMensaje = ArgumentCaptor.forClass(Mensaje.class);
        verify(mensajeRepository).save(captorMensaje.capture());
        assertEquals("Estoy de acuerdo con el presupuesto propuesto", captorMensaje.getValue().getContenido());

        // Verificamos que se haya enviado el evento desacoplado al canal STOMP del tema
        ArgumentCaptor<MensajeRecibidoEvent> captorEvento = ArgumentCaptor.forClass(MensajeRecibidoEvent.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/chat/10"), captorEvento.capture());
        assertEquals(100, captorEvento.getValue().idMensaje());
        assertEquals("juan@margaritas.com", captorEvento.getValue().emailUsuario());
        assertEquals("PROPIETARIO", captorEvento.getValue().rolUsuario());
    }

    @Test
    @DisplayName("Debe rechazar la publicación si el tema no existe")
    void debeRechazarPublicacionSiTemaNoExiste() {
        when(temaRepository.findById(999)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                mensajeService.publicarMensaje(2, 999, "Hola")
        );

        assertTrue(ex.getMessage().contains("No se encontró el tema con ID: 999"));
        verifyNoInteractions(mensajeRepository, messagingTemplate);
    }

    @Test
    @DisplayName("Debe rechazar la publicación si la asamblea no está ABIERTA")
    void debeRechazarPublicacionSiAsambleaNoEstaAbierta() {
        asamblea.setEstado("CERRADA");
        when(temaRepository.findById(10)).thenReturn(Optional.of(tema));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                mensajeService.publicarMensaje(2, 10, "Mensaje tardío")
        );

        assertTrue(ex.getMessage().contains("no se encuentra en estado ABIERTA"));
        verifyNoInteractions(mensajeRepository, messagingTemplate);
    }

    @Test
    @DisplayName("Debe rechazar la publicación si el usuario emisor no existe")
    void debeRechazarPublicacionSiUsuarioNoExiste() {
        when(temaRepository.findById(10)).thenReturn(Optional.of(tema));
        when(usuarioRepository.findById(999)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                mensajeService.publicarMensaje(999, 10, "Mensaje fantasma")
        );

        assertTrue(ex.getMessage().contains("No se encontró el usuario con ID: 999"));
        verifyNoInteractions(mensajeRepository, messagingTemplate);
    }
}

