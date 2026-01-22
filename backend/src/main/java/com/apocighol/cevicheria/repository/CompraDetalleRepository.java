package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.CompraDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repositorio para la entidad CompraDetalle
 */
@Repository
public interface CompraDetalleRepository extends JpaRepository<CompraDetalle, Long> {
    
    /**
     * Lista detalles de una compra
     */
    List<CompraDetalle> findByIdCompra(Long idCompra);
    
    /**
     * Lista todas las compras de un insumo específico
     */
    List<CompraDetalle> findByIdInsumo(Long idInsumo);
    
    /**
     * Total comprado de un insumo
     */
    @Query("SELECT COALESCE(SUM(d.cantidad), 0) FROM CompraDetalle d WHERE d.idInsumo = :idInsumo")
    BigDecimal sumCantidadPorInsumo(@Param("idInsumo") Long idInsumo);
    
    /**
     * Total gastado en un insumo
     */
    @Query("SELECT COALESCE(SUM(d.subtotal), 0) FROM CompraDetalle d WHERE d.idInsumo = :idInsumo")
    BigDecimal sumGastadoPorInsumo(@Param("idInsumo") Long idInsumo);
}