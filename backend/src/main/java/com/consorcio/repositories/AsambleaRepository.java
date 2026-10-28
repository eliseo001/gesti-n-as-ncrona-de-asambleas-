package com.consorcio.repositories;

import com.consorcio.models.Asamblea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AsambleaRepository extends JpaRepository<Asamblea, Integer> {
}
