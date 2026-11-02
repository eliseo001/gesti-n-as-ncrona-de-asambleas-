package com.consorcio.repositories;

import com.consorcio.models.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Integer> {

    /**
     * Recupera el hilo de debate ordenado cronológicamente para un tema de asamblea.
     */
    List<Mensaje> findByTema_IdTemaOrderByFechaPublicacionAsc(Integer idTema);
}
