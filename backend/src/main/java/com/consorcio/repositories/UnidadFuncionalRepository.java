package com.consorcio.repositories;

import com.consorcio.models.UnidadFuncional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UnidadFuncionalRepository extends JpaRepository<UnidadFuncional, Integer> {
}
