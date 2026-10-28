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

import java.time.LocalDateTime;

@Entity
@Table(name = "asambleas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asamblea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asamblea")
    private Integer idAsamblea;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_consorcio", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Consorcio consorcio;

    @Column(name = "ventana_inicio", nullable = false)
    private LocalDateTime ventanaInicio;

    @Column(name = "ventana_fin", nullable = false)
    private LocalDateTime ventanaFin;

    @Column(name = "estado", nullable = false)
    private String estado;
}
