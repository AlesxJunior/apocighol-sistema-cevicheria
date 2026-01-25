package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ==========================================
 * PRODUCTO REPOSITORY - CORREGIDO
 * 🔥 Sin query nativa problemática
 * ==========================================
 */
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    // ==========================================
    // 🔥 GENERACIÓN DE CÓDIGO SECUENCIAL
    // ==========================================
    
    /**
     * Obtiene todos los códigos ordenados descendente
     * Usamos JPQL en lugar de query nativa para evitar problemas
     */
    @Query("SELECT p.codigoProducto FROM Producto p WHERE p.codigoProducto LIKE 'PROD-%' ORDER BY p.codigoProducto DESC")
    List<String> findAllCodigosOrdenados();
    
    /**
     * Cuenta productos para generar código
     */
    @Query("SELECT COUNT(p) FROM Producto p")
    long contarProductos();
    
    /**
     * 🔥 CORREGIDO: Obtener el número máximo usando JPQL
     * Evita problemas con nombres de columnas en query nativa
     */
    @Query("SELECT MAX(CAST(SUBSTRING(p.codigoProducto, 6, 10) AS int)) FROM Producto p WHERE p.codigoProducto LIKE 'PROD-%'")
    Integer obtenerMaximoNumeroCodigo();
    
    // ==========================================
    // BÚSQUEDAS
    // ==========================================
    
    Optional<Producto> findByCodigoProducto(String codigoProducto);
    
    List<Producto> findByNombreProductoContainingIgnoreCase(String nombre);
    
    List<Producto> findByCategoriaProducto(String categoria);
    
    List<Producto> findByDisponibleProductoTrue();
    
    List<Producto> findByDisponibleProductoFalse();
    
    // ==========================================
    // QUERIES ORDENADOS
    // ==========================================
    
    List<Producto> findAllByOrderByNombreProductoAsc();
    
    List<Producto> findAllByOrderByPrecioProductoAsc();
    
    List<Producto> findAllByOrderByPrecioProductoDesc();
    
    // ==========================================
    // VALIDACIONES
    // ==========================================
    
    boolean existsByCodigoProducto(String codigoProducto);
    
    boolean existsByNombreProductoIgnoreCase(String nombreProducto);
}