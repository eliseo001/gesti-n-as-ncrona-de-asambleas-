package com.consorcio.repositories;

import com.consorcio.models.UnidadFuncional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UnidadFuncionalRepository extends JpaRepository<UnidadFuncional, Integer> {

    /**
     * Busca la unidad funcional asociada a un usuario en un consorcio específico.
     * Permite determinar el coeficiente de copropiedad legal que pondera el voto del copropietario.
     */
    Optional<UnidadFuncional> findByConsorcio_IdConsorcioAndUsuario_IdUsuario(Integer idConsorcio, Integer idUsuario);
}
