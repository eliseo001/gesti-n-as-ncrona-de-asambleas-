package com.consorcio.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "votos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_voto")
    private Integer idVoto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tema", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Tema tema;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuario;

    @Column(name = "valor", nullable = false)
    private String valor;

    @Column(name = "peso_coeficiente", nullable = false, precision = 10, scale = 6)
    private BigDecimal pesoCoeficiente;

    @Column(name = "timestamp_emision", nullable = false)
    private LocalDateTime timestampEmision;

    /** Hash del voto previo en la cadena (null/génesis para el primer voto). */
    @Column(name = "hash_anterior", length = 64)
    private String hashAnterior;

    /** Hash de este voto (p. ej. SHA-256 en hex = 64 caracteres). */
    @Column(name = "hash_actual", nullable = false, length = 64, unique = true)
    private String hashActual;
}
