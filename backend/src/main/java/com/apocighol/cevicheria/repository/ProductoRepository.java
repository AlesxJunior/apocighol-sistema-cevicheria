package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    // Buscar por código
    Optional<Producto> findByCodigoProducto(String codigoProducto);
    
    // Buscar por categoría
    List<Producto> findByCategoriaProducto(String categoriaProducto);
    
    // Buscar solo disponibles
    List<Producto> findByDisponibleProductoTrue();
}