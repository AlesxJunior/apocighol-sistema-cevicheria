package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * ==========================================
 * COMPRA REPOSITORY
 * ==========================================
 */
@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {
    
    // ==========================================
    // BÚSQUEDAS
    // ==========================================
    
    Optional<Compra> findByCodigoCompra(String codigoCompra);
    
    List<Compra> findByFechaCompra(LocalDate fechaCompra);
    
    List<Compra> findByIdProveedor(Long idProveedor);
    
    List<Compra> findByIdProveedorOrderByFechaCompraDesc(Long idProveedor);
    
    // ==========================================
    // ORDENADOS
    // ==========================================
    
    List<Compra> findAllByOrderByFechaCompraDescHoraCompraDesc();
    
    List<Compra> findByFechaCompraBetweenOrderByFechaCompraDesc(LocalDate inicio, LocalDate fin);
    
    // ==========================================
    // CONTEOS
    // ==========================================
    
    long countByFechaCompra(LocalDate fechaCompra);
    
    long countByIdProveedor(Long idProveedor);
    
    // ==========================================
    // SUMAS
    // ==========================================
    
    @Query("SELECT COALESCE(SUM(c.totalCompra), 0) FROM Compra c WHERE c.fechaCompra = :fecha")
    BigDecimal sumTotalByFecha(@Param("fecha") LocalDate fecha);
    
    @Query("SELECT COALESCE(SUM(c.totalCompra), 0) FROM Compra c WHERE c.fechaCompra BETWEEN :inicio AND :fin")
    BigDecimal sumTotalEntreFechas(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);
    
    @Query("SELECT COALESCE(SUM(c.totalCompra), 0) FROM Compra c WHERE c.idProveedor = :idProveedor")
    BigDecimal sumTotalByProveedor(@Param("idProveedor") Long idProveedor);
}