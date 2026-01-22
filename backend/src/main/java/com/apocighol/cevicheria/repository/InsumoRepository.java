package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Insumo
 * Proporciona métodos CRUD y consultas personalizadas
 */
@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Long> {
    
    // ==========================================
    // BÚSQUEDAS BÁSICAS
    // ==========================================
    
    /**
     * Busca insumo por nombre exacto
     */
    Optional<Insumo> findByNombreInsumo(String nombreInsumo);
    
    /**
     * Busca insumos que contengan el texto en el nombre
     */
    List<Insumo> findByNombreInsumoContainingIgnoreCase(String nombre);
    
    /**
     * Busca insumos por categoría
     */
    List<Insumo> findByCategoriaInsumo(String categoria);
    
    /**
     * Lista todos los insumos ordenados por nombre
     */
    List<Insumo> findAllByOrderByNombreInsumoAsc();
    
    // ==========================================
    // CONSULTAS DE STOCK
    // ==========================================
    
    /**
     * Insumos con stock bajo (stock actual <= stock mínimo)
     */
    @Query("SELECT i FROM Insumo i WHERE i.stockActual <= i.stockMinimo ORDER BY i.stockActual ASC")
    List<Insumo> findInsumosConStockBajo();
    
    /**
     * Insumos con stock en cero
     */
    @Query("SELECT i FROM Insumo i WHERE i.stockActual = 0 OR i.stockActual IS NULL")
    List<Insumo> findInsumosAgotados();
    
    /**
     * Cuenta insumos con stock bajo
     */
    @Query("SELECT COUNT(i) FROM Insumo i WHERE i.stockActual <= i.stockMinimo")
    long countInsumosConStockBajo();
    
    /**
     * Busca insumos con stock mayor a cierta cantidad
     */
    @Query("SELECT i FROM Insumo i WHERE i.stockActual >= :cantidad")
    List<Insumo> findInsumosConStockMayorA(@Param("cantidad") java.math.BigDecimal cantidad);
    
    // ==========================================
    // CONSULTAS PARA REPORTES
    // ==========================================
    
    /**
     * Lista categorías únicas de insumos
     */
    @Query("SELECT DISTINCT i.categoriaInsumo FROM Insumo i WHERE i.categoriaInsumo IS NOT NULL ORDER BY i.categoriaInsumo")
    List<String> findCategoriasUnicas();
    
    /**
     * Cuenta insumos por categoría
     */
    @Query("SELECT i.categoriaInsumo, COUNT(i) FROM Insumo i GROUP BY i.categoriaInsumo")
    List<Object[]> countInsumosPorCategoria();
    
    /**
     * Lista unidades de medida únicas
     */
    @Query("SELECT DISTINCT i.unidadMedida FROM Insumo i WHERE i.unidadMedida IS NOT NULL")
    List<String> findUnidadesMedidaUnicas();
}