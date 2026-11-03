package com.consorcio.repositories;

import com.consorcio.models.UnidadFuncional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnidadFuncionalRepository extends JpaRepository<UnidadFuncional, Integer> {

    /**
     * Recupera todas las Unidades Funcionales y Complementarias (ej. Departamento 4B + Cochera 12 + Baulera)
     * que pertenecen a un mismo titular dentro de un consorcio específico.
     *
     * <p><b>Fundamento Legal (Art. 2060 CCyCN - Consolidación Multi-Unidad):</b>
     * Un mismo copropietario puede ser titular registral de múltiples unidades dentro del edificio.
     * Al emitir su sufragio, su peso porcentual debe calcularse como la sumatoria exacta ({@code BigDecimal})
     * de los coeficientes de todas sus unidades asociadas en ese consorcio.</p>
     *
     * @param idConsorcio Identificador del consorcio donde sesiona la asamblea.
     * @param idUsuario   Identificador del propietario votante.
     * @return Lista de todas las unidades asociadas al titular en dicho consorcio.
     */
    List<UnidadFuncional> findAllByConsorcio_IdConsorcioAndUsuario_IdUsuario(Integer idConsorcio, Integer idUsuario);

    /**
     * Método de consulta individual preservado por compatibilidad retroactiva.
     */
    Optional<UnidadFuncional> findByConsorcio_IdConsorcioAndUsuario_IdUsuario(Integer idConsorcio, Integer idUsuario);
}
