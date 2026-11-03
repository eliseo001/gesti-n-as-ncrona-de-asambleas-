package com.consorcio.services;

import com.consorcio.dtos.VotoEmitidoEvent;
import com.consorcio.exceptions.AsambleaNoAbiertaException;
import com.consorcio.exceptions.SinUnidadesFuncionalesException;
import com.consorcio.exceptions.VotoYaEmitidoException;
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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - Motor Criptográfico de Sufragio (VotoService)")
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
    private UnidadFuncional depto4B;
    private UnidadFuncional cochera12;

    @BeforeEach
    void setUp() {
        consorcio = Consorcio.builder()
                .idConsorcio(1)
                .nombreConsorcio("Edificio Las Margaritas")
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

        depto4B = UnidadFuncional.builder()
                .idUnidadFuncional(50)
                .consorcio(consorcio)
                .usuario(usuario)
                .numeroDepto("4B")
                .coeficienteCopropiedad(new BigDecimal("0.041500"))
                .build();

        cochera12 = UnidadFuncional.builder()
                .idUnidadFuncional(51)
                .consorcio(consorcio)
                .usuario(usuario)
                .numeroDepto("Cochera 12")
                .coeficienteCopropiedad(new BigDecimal("0.010500"))
                .build();
    }

    @Test
    @DisplayName("Debe registrar el primer voto con Hash Génesis Dinámico y sumar coeficientes Multi-Unidad")
    void debeRegistrarPrimerVotoConHashGenesisDinamicoYMultiUnidad() {
        when(temaRepository.findById(100)).thenReturn(Optional.of(tema));
        when(votoRepository.existsByTema_IdTemaAndUsuario_IdUsuario(100, 5)).thenReturn(false);
        when(usuarioRepository.findById(5)).thenReturn(Optional.of(usuario));
        when(unidadFuncionalRepository.findAllByConsorcio_IdConsorcioAndUsuario_IdUsuario(1, 5))
                .thenReturn(List.of(depto4B, cochera12));
        when(votoRepository.findTopByTemaIdOrderByFechaEmisionDesc(100)).thenReturn(Optional.empty());

        when(hashService.generarHashSha256("GENESIS_BLOCK|ASAMBLEA:10|TEMA:100"))
                .thenReturn("hash_genesis_dinamico_tema_100");
        when(hashService.generarHashSha256(argThat(s -> s != null && s.startsWith("hash_genesis_dinamico_tema_100|"))))
                .thenReturn("hash_generado_voto_1");
        when(votoRepository.save(any(Voto.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Voto votoResultado = votoService.registrarVoto(5L, 100L, "A_FAVOR");

        assertNotNull(votoResultado);
        assertEquals("hash_genesis_dinamico_tema_100", votoResultado.getHashAnterior());
        assertEquals("hash_generado_voto_1", votoResultado.getHashActual());
        assertEquals("A_FAVOR", votoResultado.getValor());
        // 0.041500 + 0.010500 = 0.052000
        assertEquals(new BigDecimal("0.052000"), votoResultado.getPesoCoeficiente());

        verify(messagingTemplate).convertAndSend(eq("/topic/asamblea/10"), any(VotoEmitidoEvent.class));
    }

    @Test
    @DisplayName("Debe encadenar un segundo voto al hash del voto anterior bajo bloqueo pesimista")
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
        when(unidadFuncionalRepository.findAllByConsorcio_IdConsorcioAndUsuario_IdUsuario(1, 5))
                .thenReturn(List.of(depto4B));
        when(votoRepository.findTopByTemaIdOrderByFechaEmisionDesc(100)).thenReturn(Optional.of(votoPrevio));
        when(hashService.generarHashSha256(anyString())).thenReturn("hash_generado_voto_2");
        when(votoRepository.save(any(Voto.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Voto votoResultado = votoService.registrarVoto(5, 100, "A_FAVOR");

        assertEquals("hash_del_primer_voto_64_chars", votoResultado.getHashAnterior());
        assertEquals("hash_generado_voto_2", votoResultado.getHashActual());
        assertEquals(new BigDecimal("0.041500"), votoResultado.getPesoCoeficiente());
    }

    @Test
    @DisplayName("Debe lanzar AsambleaNoAbiertaException si la asamblea no está ABIERTA")
    void debeRechazarVotoSiAsambleaNoEstaAbierta() {
        asamblea.setEstado("CERRADA");
        when(temaRepository.findById(100)).thenReturn(Optional.of(tema));

        AsambleaNoAbiertaException excepcion = assertThrows(AsambleaNoAbiertaException.class, () ->
                votoService.registrarVoto(5, 100, "A_FAVOR")
        );

        assertTrue(excepcion.getMessage().contains("no se encuentra abierta"));
        verify(votoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar AsambleaNoAbiertaException si está fuera del horario de la asamblea")
    void debeRechazarVotoFueraDeHorario() {
        asamblea.setVentanaFin(LocalDateTime.now().minusMinutes(5));
        when(temaRepository.findById(100)).thenReturn(Optional.of(tema));

        AsambleaNoAbiertaException excepcion = assertThrows(AsambleaNoAbiertaException.class, () ->
                votoService.registrarVoto(5, 100, "A_FAVOR")
        );

        assertTrue(excepcion.getMessage().contains("fuera de la ventana horaria"));
        verify(votoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar VotoYaEmitidoException cuando un usuario intenta votar dos veces")
    void debeImpedirVotoDuplicado() {
        when(temaRepository.findById(100)).thenReturn(Optional.of(tema));
        when(votoRepository.existsByTema_IdTemaAndUsuario_IdUsuario(100, 5)).thenReturn(true);

        VotoYaEmitidoException excepcion = assertThrows(VotoYaEmitidoException.class, () ->
                votoService.registrarVoto(5, 100, "A_FAVOR")
        );

        assertTrue(excepcion.getMessage().contains("ya ha emitido su voto"));
        verify(votoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar SinUnidadesFuncionalesException si el usuario no posee unidades en el consorcio")
    void debeRechazarSiUsuarioNoTieneUnidadFuncional() {
        when(temaRepository.findById(100)).thenReturn(Optional.of(tema));
        when(votoRepository.existsByTema_IdTemaAndUsuario_IdUsuario(100, 5)).thenReturn(false);
        when(usuarioRepository.findById(5)).thenReturn(Optional.of(usuario));
        when(unidadFuncionalRepository.findAllByConsorcio_IdConsorcioAndUsuario_IdUsuario(1, 5))
                .thenReturn(Collections.emptyList());

        SinUnidadesFuncionalesException excepcion = assertThrows(SinUnidadesFuncionalesException.class, () ->
                votoService.registrarVoto(5, 100, "A_FAVOR")
        );

        assertTrue(excepcion.getMessage().contains("no posee una unidad funcional"));
        verify(votoRepository, never()).save(any());
    }
}
