package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.Caja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CajaRepository extends JpaRepository<Caja, Long> {
    
    // Buscar caja abierta (una sola)
    Optional<Caja> findByEstadoCaja(String estadoCaja);
    
    // Buscar TODAS las cajas por estado (lista)
    List<Caja> findAllByEstadoCajaOrderByFechaAperturaDesc(String estadoCaja);
    
    // Buscar por código
    Optional<Caja> findByCodigoCaja(String codigoCaja);
    
    // Cajas por fecha
    List<Caja> findByFechaApertura(LocalDate fechaApertura);
    
    // Ordenadas
    List<Caja> findAllByOrderByFechaAperturaDescHoraAperturaDesc();
    
    // Suma de ventas por fecha
    @Query("SELECT COALESCE(SUM(c.totalVentas), 0) FROM Caja c WHERE c.fechaApertura = :fecha")
    BigDecimal sumVentasByFecha(@Param("fecha") LocalDate fecha);
    
    // Contar cajas abiertas
    long countByEstadoCaja(String estadoCaja);
}