package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.MovimientoCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * ==========================================
 * MOVIMIENTO CAJA REPOSITORY
 * ==========================================
 */
@Repository
public interface MovimientoCajaRepository extends JpaRepository<MovimientoCaja, Long> {
    
    // Movimientos por caja
    List<MovimientoCaja> findByIdCaja(Long idCaja);
    
    List<MovimientoCaja> findByIdCajaOrderByHoraMovimientoDesc(Long idCaja);
    
    // Por tipo
    List<MovimientoCaja> findByIdCajaAndTipoMovimiento(Long idCaja, String tipoMovimiento);
    
    // Por fecha
    List<MovimientoCaja> findByFechaMovimiento(LocalDate fecha);
    
    // Contar por caja
    long countByIdCaja(Long idCaja);
    
    // Suma de ventas por caja
    @Query("SELECT COALESCE(SUM(m.monto), 0) FROM MovimientoCaja m WHERE m.idCaja = :idCaja AND m.tipoMovimiento = 'VENTA'")
    BigDecimal sumVentasByCaja(@Param("idCaja") Long idCaja);
}