package com.consorcio.repositories;

import com.consorcio.models.Consorcio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsorcioRepository extends JpaRepository<Consorcio, Integer> {
}
