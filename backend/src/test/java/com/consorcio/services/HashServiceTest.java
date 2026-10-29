package com.consorcio.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias - Motor Criptográfico (HashService)")
class HashServiceTest {

    private HashService hashService;

    @BeforeEach
    void setUp() {
        hashService = new HashService();
    }

    @Test
    @DisplayName("Debe generar un hash SHA-256 de exactamente 64 caracteres en hexadecimal")
    void debeGenerarHashDe64CaracteresHexadecimales() {
        String datos = "GENESIS_HASH11A_FAVOR2026-10-29T10:00:00";
        String hashResultante = hashService.generarHashSha256(datos);

        assertNotNull(hashResultante);
        assertEquals(64, hashResultante.length(), "El hash SHA-256 en formato hex debe tener longitud fija de 64 caracteres");
        assertTrue(hashResultante.matches("^[a-f0-9]{64}$"), "El hash debe contener solo caracteres hexadecimales en minúsculas");
    }

    @Test
    @DisplayName("Debe ser determinista: mismos datos de entrada producen idéntico hash")
    void debeSerDeterminista() {
        String datos = "voto_de_prueba_determinismo";
        String primerHash = hashService.generarHashSha256(datos);
        String segundoHash = hashService.generarHashSha256(datos);

        assertEquals(primerHash, segundoHash, "Una función de resumen determinista debe generar siempre el mismo digest");
    }

    @Test
    @DisplayName("Debe exhibir efecto avalancha: un cambio de un solo carácter altera drásticamente el hash")
    void debeCumplirEfectoAvalancha() {
        String entradaOriginal = "GENESIS_HASH11A_FAVOR2026-10-29T10:00:00";
        String entradaAlterada = "GENESIS_HASH11A_FAVOR2026-10-29T10:00:01"; // 1 segundo de diferencia

        String hashOriginal = hashService.generarHashSha256(entradaOriginal);
        String hashAlterado = hashService.generarHashSha256(entradaAlterada);

        assertNotEquals(hashOriginal, hashAlterado);
    }

    @Test
    @DisplayName("Debe lanzar IllegalArgumentException ante entrada nula")
    void debeLanzarExcepcionSiDatosSonNulos() {
        assertThrows(IllegalArgumentException.class, () -> hashService.generarHashSha256(null));
    }
}

