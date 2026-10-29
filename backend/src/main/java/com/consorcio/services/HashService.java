package com.consorcio.services;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Servicio criptográfico responsable del cálculo determinista de funciones hash resumen.
 * Actúa como pilar de inmutabilidad para el sistema de votación electrónica distribuida.
 */
@Service
public class HashService {

    private static final String ALGORITMO_HASH = "SHA-256";

    /**
     * Genera una huella criptográfica SHA-256 en formato hexadecimal para los datos provistos.
     *
     * Justificación teórica para el tribunal:
     * - Resistencia a la preimagen y segunda preimagen: Es computacionalmente imposible deducir
     *   los datos de origen a partir del hash resultante, o encontrar otra entrada con el mismo hash.
     * - Efecto avalancha: Cualquier modificación mínima en el voto o en la marca temporal alterará
     *   drásticamente la salida (64 caracteres hexadecimales uniformemente distribuidos).
     * - Salida determinista: Mismos datos de entrada siempre producen exactamente el mismo hash,
     *   permitiendo una verificación y auditoría forense posterior sin fisuras.
     *
     * @param datos Cadena de texto a procesar.
     * @return Cadena de 64 caracteres en hexadecimal en minúsculas representando el digest SHA-256.
     */
    public String generarHashSha256(String datos) {
        if (datos == null) {
            throw new IllegalArgumentException("Los datos a procesar criptográficamente no pueden ser nulos");
        }

        try {
            MessageDigest digestorMensaje = MessageDigest.getInstance(ALGORITMO_HASH);
            byte[] datosEnBytes = datos.getBytes(StandardCharsets.UTF_8);
            byte[] bytesDelHash = digestorMensaje.digest(datosEnBytes);

            // HexFormat convierte el arreglo de bytes en una cadena hexadecimal limpia y uniforme
            return HexFormat.of().formatHex(bytesDelHash);

        } catch (NoSuchAlgorithmException excepcionAlgoritmoNoEncontrado) {
            // Manejamos internamente la excepción comprobada (checked exception) envolviéndola en una no comprobada.
            // SHA-256 es un estándar obligatorio en cualquier implementación compatible de la JVM de Java.
            throw new IllegalStateException("Error crítico: El algoritmo criptográfico SHA-256 no está disponible en la JVM", excepcionAlgoritmoNoEncontrado);
        }
    }
}

