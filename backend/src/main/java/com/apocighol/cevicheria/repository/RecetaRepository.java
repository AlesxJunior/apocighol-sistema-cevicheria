package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.Receta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para la entidad Receta
 * Gestiona la relación entre productos e insumos
 */
@Repository
public interface RecetaRepository extends JpaRepository<Receta, Long> {
    
    // ==========================================
    // BÚSQUEDAS POR PRODUCTO
    // ==========================================
    
    /**
     * Lista todos los insumos de un producto (su receta)
     */
    List<Receta> findByIdProducto(Long idProducto);
    
    /**
     * Cuenta cuántos insumos tiene un producto
     */
    long countByIdProducto(Long idProducto);
    
    /**
     * Verifica si un producto tiene receta asignada
     */
    boolean existsByIdProducto(Long idProducto);
    
    // ==========================================
    // BÚSQUEDAS POR INSUMO
    // ==========================================
    
    /**
     * Lista productos que usan un insumo específico
     */
    List<Receta> findByIdInsumo(Long idInsumo);
    
    /**
     * Cuenta cuántos productos usan un insumo
     */
    long countByIdInsumo(Long idInsumo);
    
    // ==========================================
    // BÚSQUEDAS COMBINADAS
    // ==========================================
    
    /**
     * Busca receta específica (producto + insumo)
     */
    @Query("SELECT r FROM Receta r WHERE r.idProducto = :idProducto AND r.idInsumo = :idInsumo")
    Receta findByProductoAndInsumo(@Param("idProducto") Long idProducto, @Param("idInsumo") Long idInsumo);
    
    /**
     * Lista recetas con información del insumo
     */
    @Query("SELECT r FROM Receta r JOIN FETCH r.insumo WHERE r.idProducto = :idProducto")
    List<Receta> findByIdProductoConInsumo(@Param("idProducto") Long idProducto);
    
    // ==========================================
    // OPERACIONES DE ELIMINACIÓN
    // ==========================================
    
    /**
     * Elimina todas las recetas de un producto
     */
    @Modifying
    @Query("DELETE FROM Receta r WHERE r.idProducto = :idProducto")
    void deleteByIdProducto(@Param("idProducto") Long idProducto);
    
    /**
     * Elimina receta específica (producto + insumo)
     */
    @Modifying
    @Query("DELETE FROM Receta r WHERE r.idProducto = :idProducto AND r.idInsumo = :idInsumo")
    void deleteByProductoAndInsumo(@Param("idProducto") Long idProducto, @Param("idInsumo") Long idInsumo);
    
    // ==========================================
    // CONSULTAS PARA REPORTES
    // ==========================================
    
    /**
     * Productos sin receta asignada
     */
    @Query("SELECT DISTINCT p.idProducto FROM Producto p WHERE p.idProducto NOT IN (SELECT DISTINCT r.idProducto FROM Receta r)")
    List<Long> findProductosSinReceta();
    
    /**
     * Lista todos los IDs de productos que tienen receta
     */
    @Query("SELECT DISTINCT r.idProducto FROM Receta r")
    List<Long> findProductosConReceta();
}