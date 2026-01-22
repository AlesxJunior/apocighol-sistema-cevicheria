package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ========================================== * PRODUCTO REPOSITORY
 * 🔥 Incluye query para generar código secuencial
 * ==========================================
 */
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    // ==========================================
    // 🔥 GENERACIÓN DE CÓDIGO SECUENCIAL 11 de enero del 2026
    // ==========================================
    
    /**
     * Obtiene el código más alto para generar el siguiente
     * Busca el máximo número en códigos tipo PROD-XXX
     */
    @Query("SELECT p.codigoProducto FROM Producto p WHERE p.codigoProducto LIKE 'PROD-%' ORDER BY p.codigoProducto DESC")
    List<String> findAllCodigosOrdenados();
    
    /**
     * Cuenta productos para generar código
     */
    @Query("SELECT COUNT(p) FROM Producto p")
    long contarProductos();
    
    /**
     * Obtener el número máximo de código existente
     */
    @Query(value = "SELECT MAX(CAST(SUBSTRING(codigo_producto, 6) AS UNSIGNED)) FROM productos WHERE codigo_producto LIKE 'PROD-%'", nativeQuery = true)
    Integer obtenerMaximoNumeroCodigoNativo();
    
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