package com.consorcio.repositories;

import com.consorcio.models.Voto;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
     * Obtiene el último eslabón registrado cronológicamente para un tema específico aplicando un
     * BLOQUEO PESIMISTA DE ESCRITURA ({@link LockModeType#PESSIMISTIC_WRITE}).
     *
     * <p><b>Fundamento de Ingeniería de Software (Defensa de Tesis):</b>
     * En PostgreSQL, esta anotación traduce la consulta a {@code SELECT ... FOR UPDATE}.
     * Si dos copropietarios emiten su voto en el mismo milisegundo sobre el mismo Tema,
     * la segunda transacción queda en espera en el motor de base de datos hasta que la primera
     * confirme su {@code COMMIT} con el nuevo {@code hash_actual}. Esto serializa el acceso al
     * último eslabón y evita matemáticamente la bifurcación (Fork) de la cadena SHA-256.</p>
     *
     * @param idTema Identificador del punto del Orden del Día.
     * @return El último voto emitido en la cadena del tema, o vacío si es el primer sufragio.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM Voto v WHERE v.tema.idTema = :idTema ORDER BY v.timestampEmision DESC, v.idVoto DESC LIMIT 1")
    Optional<Voto> findTopByTemaIdOrderByFechaEmisionDesc(@Param("idTema") Integer idTema);

    /**
     * Alias compatible con consultas derivadas por ID descendente bajo bloqueo pesimista.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Voto> findTopByTema_IdTemaOrderByIdVotoDesc(Integer idTema);
}
