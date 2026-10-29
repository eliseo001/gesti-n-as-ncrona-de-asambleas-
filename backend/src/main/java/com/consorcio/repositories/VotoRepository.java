package com.consorcio.repositories;

import com.consorcio.models.Voto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VotoRepository extends JpaRepository<Voto, Integer> {

    /**
     * Verifica si un usuario ya ha emitido un voto para un tema específico.
     * Garantiza el principio democrático fundamental: un voto por propietario por tema.
     */
    boolean existsByTema_IdTemaAndUsuario_IdUsuario(Integer idTema, Integer idUsuario);

    /**
     * Obtiene el último voto registrado cronológicamente para un tema específico.
     * En el esquema de encadenamiento criptográfico, este registro provee el 'hashAnterior'
     * necesario para sellar el siguiente eslabón de la cadena de bloques del tema.
     */
    Optional<Voto> findTopByTema_IdTemaOrderByIdVotoDesc(Integer idTema);
}
