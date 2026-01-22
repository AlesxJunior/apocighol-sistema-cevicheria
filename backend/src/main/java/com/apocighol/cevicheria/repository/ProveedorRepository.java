package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Proveedor
 */
@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    
    // ==========================================
    // BÚSQUEDAS BÁSICAS
    // ==========================================
    
    /**
     * Busca proveedor por nombre exacto
     */
    Optional<Proveedor> findByNombreProveedor(String nombreProveedor);
    
    /**
     * Busca proveedores que contengan texto en el nombre
     */
    List<Proveedor> findByNombreProveedorContainingIgnoreCase(String nombre);
    
    /**
     * Busca proveedor por RUC/DNI
     */
    Optional<Proveedor> findByRucProveedor(String ruc);
    
    /**
     * Lista proveedores activos
     */
    List<Proveedor> findByActivoProveedorTrue();
    
    /**
     * Lista proveedores activos ordenados por nombre
     */
    List<Proveedor> findByActivoProveedorTrueOrderByNombreProveedorAsc();
    
    /**
     * Lista todos ordenados por nombre
     */
    List<Proveedor> findAllByOrderByNombreProveedorAsc();
    
    // ==========================================
    // CONSULTAS PARA VALIDACIÓN
    // ==========================================
    
    /**
     * Verifica si existe proveedor con ese RUC
     */
    boolean existsByRucProveedor(String ruc);
    
    /**
     * Cuenta proveedores activos
     */
    @Query("SELECT COUNT(p) FROM Proveedor p WHERE p.activoProveedor = true")
    long countProveedoresActivos();
}