package com.apocighol.cevicheria.service;

import com.apocighol.cevicheria.model.Producto;
import com.apocighol.cevicheria.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {
    
    @Autowired
    private ProductoRepository productoRepository;
    
    // Obtener todos los productos
    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }
    
    // Buscar por ID
    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }
    
    // Buscar por categoría
    public List<Producto> obtenerPorCategoria(String categoria) {
        return productoRepository.findByCategoriaProducto(categoria);
    }
    
    // Obtener solo disponibles
    public List<Producto> obtenerDisponibles() {
        return productoRepository.findByDisponibleProductoTrue();
    }
    
    // Crear producto
    public Producto crear(Producto producto) {
        return productoRepository.save(producto);
    }
    
    // Actualizar producto
    public Producto actualizar(Long id, Producto productoActualizado) {
        return productoRepository.findById(id).map(producto -> {
            producto.setCodigoProducto(productoActualizado.getCodigoProducto());
            producto.setNombreProducto(productoActualizado.getNombreProducto());
            producto.setDescripcionProducto(productoActualizado.getDescripcionProducto());
            producto.setPrecioProducto(productoActualizado.getPrecioProducto());
            producto.setCategoriaProducto(productoActualizado.getCategoriaProducto());
            producto.setDisponibleProducto(productoActualizado.getDisponibleProducto());
            return productoRepository.save(producto);
        }).orElse(null);
    }
    
    // Eliminar producto
    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }
}