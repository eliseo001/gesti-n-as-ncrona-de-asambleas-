package com.consorcio.services;

import com.consorcio.dtos.VotoEmitidoEvent;
import com.consorcio.models.Asamblea;
import com.consorcio.models.Consorcio;
import com.consorcio.models.Tema;
import com.consorcio.models.UnidadFuncional;
import com.consorcio.models.Usuario;
import com.consorcio.models.Voto;
import com.consorcio.repositories.TemaRepository;
import com.consorcio.repositories.UnidadFuncionalRepository;
import com.consorcio.repositories.UsuarioRepository;
import com.consorcio.repositories.VotoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - Servicio de Votación y Encadenamiento (VotoService)")
class VotoServiceTest {

    @Mock
    private TemaRepository temaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UnidadFuncionalRepository unidadFuncionalRepository;

    @Mock
    private VotoRepository votoRepository;

    @Mock
    private HashService hashService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private VotoService votoService;

    private Consorcio consorcio;
    private Asamblea asamblea;
    private Tema tema;
    private Usuario usuario;
    private UnidadFuncional unidadFuncional;

    @BeforeEach
    void setUp() {
        consorcio = Consorcio.builder()
                .idConsorcio(1)
                .nombreConsorcio("Edificio Libertador")
                .build();

        asamblea = Asamblea.builder()
                .idAsamblea(10)
                .consorcio(consorcio)
                .estado("ABIERTA")
                .ventanaInicio(LocalDateTime.now().minusHours(1))
                .ventanaFin(LocalDateTime.now().plusHours(2))
                .build();

        tema = Tema.builder()
                .idTema(100)
                .asamblea(asamblea)
                .titulo("Aprobación de presupuesto anual")
                .descripcion("Votación del presupuesto de mantenimiento")
                .build();

        usuario = Usuario.builder()
                .idUsuario(5)
                .email("propietario@consorcio.com")
                .passwordHash("hash_pass")
                .rol("PROPIETARIO")
                .build();

        unidadFuncional = UnidadFuncional.builder()
                .idUnidadFuncional(50)
                .consorcio(consorcio)
                .usuario(usuario)
                .numeroDepto("4B")
                .coeficienteCopropiedad(new BigDecimal("0.045000"))
                .build();
    }

    @Test
    @DisplayName("Debe registrar exitosamente el primer voto de un tema utilizando GENESIS_HASH")
    void debeRegistrarPrimerVotoConGenesisHash() {
        when(temaRepository.findById(100)).thenReturn(Optional.of(tema));
        when(votoRepository.existsByTema_IdTemaAndUsuario_IdUsuario(100, 5)).thenReturn(false);
        when(usuarioRepository.findById(5)).thenReturn(Optional.of(usuario));
        when(unidadFuncionalRepository.findByConsorcio_IdConsorcioAndUsuario_IdUsuario(1, 5))
                .thenReturn(Optional.of(unidadFuncional));
        when(votoRepository.findTopByTema_IdTemaOrderByIdVotoDesc(100)).thenReturn(Optional.empty());
        when(hashService.generarHashSha256(anyString())).thenReturn("hash_generado_voto_1");
        when(votoRepository.save(any(Voto.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Voto votoResultado = votoService.registrarVoto(5, 100, "A_FAVOR");

        assertNotNull(votoResultado);
        assertEquals("GENESIS_HASH", votoResultado.getHashAnterior(), "El primer voto de un tema debe anclarse al GENESIS_HASH");
        assertEquals("hash_generado_voto_1", votoResultado.getHashActual());
        assertEquals("A_FAVOR", votoResultado.getValor());
        assertEquals(new BigDecimal("0.045000"), votoResultado.getPesoCoeficiente());

        ArgumentCaptor<Voto> captor = ArgumentCaptor.forClass(Voto.class);
        verify(votoRepository).save(captor.capture());
        assertEquals("GENESIS_HASH", captor.getValue().getHashAnterior());

        // Verificamos que se haya notificado el evento a través del canal WebSocket STOMP correspondiente
        verify(messagingTemplate).convertAndSend(eq("/topic/asamblea/10"), any(VotoEmitidoEvent.class));
    }

    @Test
    @DisplayName("Debe encadenar un segundo voto al hash del voto anterior del tema")
    void debeEncadenarSegundoVotoConHashAnterior() {
        Voto votoPrevio = Voto.builder()
                .idVoto(1)
                .tema(tema)
                .usuario(usuario)
                .valor("EN_CONTRA")
                .hashActual("hash_del_primer_voto_64_chars")
                .build();

        when(temaRepository.findById(100)).thenReturn(Optional.of(tema));
        when(votoRepository.existsByTema_IdTemaAndUsuario_IdUsuario(100, 5)).thenReturn(false);
        when(usuarioRepository.findById(5)).thenReturn(Optional.of(usuario));
        when(unidadFuncionalRepository.findByConsorcio_IdConsorcioAndUsuario_IdUsuario(1, 5))
                .thenReturn(Optional.of(unidadFuncional));
        when(votoRepository.findTopByTema_IdTemaOrderByIdVotoDesc(100)).thenReturn(Optional.of(votoPrevio));
        when(hashService.generarHashSha256(anyString())).thenReturn("hash_generado_voto_2");
        when(votoRepository.save(any(Voto.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Voto votoResultado = votoService.registrarVoto(5, 100, "A_FAVOR");

        assertEquals("hash_del_primer_voto_64_chars", votoResultado.getHashAnterior(),
                "El segundo voto debe enlazar criptográficamente con el hashActual del voto previo");
        assertEquals("hash_generado_voto_2", votoResultado.getHashActual());
    }

    @Test
    @DisplayName("Debe rechazar el voto si la asamblea no está ABIERTA")
    void debeRechazarVotoSiAsambleaNoEstaAbierta() {
        asamblea.setEstado("CERRADA");
        when(temaRepository.findById(100)).thenReturn(Optional.of(tema));

        IllegalStateException excepcion = assertThrows(IllegalStateException.class, () ->
                votoService.registrarVoto(5, 100, "A_FAVOR")
        );

        assertTrue(excepcion.getMessage().contains("no se encuentra abierta"));
        verify(votoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe rechazar el voto si está fuera del horario de la asamblea")
    void debeRechazarVotoFueraDeHorario() {
        // Asamblea cerrada por tiempo finalizado
        asamblea.setVentanaFin(LocalDateTime.now().minusMinutes(5));
        when(temaRepository.findById(100)).thenReturn(Optional.of(tema));

        IllegalStateException excepcion = assertThrows(IllegalStateException.class, () ->
                votoService.registrarVoto(5, 100, "A_FAVOR")
        );

        assertTrue(excepcion.getMessage().contains("fuera de la ventana horaria"));
        verify(votoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe impedir que un usuario vote dos veces en el mismo tema")
    void debeImpedirVotoDuplicado() {
        when(temaRepository.findById(100)).thenReturn(Optional.of(tema));
        when(votoRepository.existsByTema_IdTemaAndUsuario_IdUsuario(100, 5)).thenReturn(true);

        IllegalStateException excepcion = assertThrows(IllegalStateException.class, () ->
                votoService.registrarVoto(5, 100, "A_FAVOR")
        );

        assertTrue(excepcion.getMessage().contains("ya ha emitido su voto"));
        verify(votoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe rechazar el voto si el usuario no tiene unidad funcional en el consorcio")
    void debeRechazarSiUsuarioNoTieneUnidadFuncional() {
        when(temaRepository.findById(100)).thenReturn(Optional.of(tema));
        when(votoRepository.existsByTema_IdTemaAndUsuario_IdUsuario(100, 5)).thenReturn(false);
        when(usuarioRepository.findById(5)).thenReturn(Optional.of(usuario));
        when(unidadFuncionalRepository.findByConsorcio_IdConsorcioAndUsuario_IdUsuario(1, 5))
                .thenReturn(Optional.empty());

        IllegalStateException excepcion = assertThrows(IllegalStateException.class, () ->
                votoService.registrarVoto(5, 100, "A_FAVOR")
        );

        assertTrue(excepcion.getMessage().contains("no posee una unidad funcional"));
        verify(votoRepository, never()).save(any());
    }
}

