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

@Entity
@Table(name = "unidades_funcionales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnidadFuncional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_unidad_funcional")
    private Integer idUnidadFuncional;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_consorcio", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Consorcio consorcio;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuario;

    @Column(name = "numero_depto", nullable = false)
    private String numeroDepto;

    @Column(name = "coeficiente_copropiedad", nullable = false, precision = 10, scale = 6)
    private BigDecimal coeficienteCopropiedad;
}
