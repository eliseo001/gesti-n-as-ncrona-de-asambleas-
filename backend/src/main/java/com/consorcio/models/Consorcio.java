package com.consorcio.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "consorcios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consorcio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consorcio")
    private Integer idConsorcio;

    @Column(name = "nombre_consorcio", nullable = false)
    private String nombreConsorcio;
}
