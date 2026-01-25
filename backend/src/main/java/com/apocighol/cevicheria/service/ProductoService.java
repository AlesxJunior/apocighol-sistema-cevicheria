package com.apocighol.cevicheria.service;

import com.apocighol.cevicheria.model.Producto;
import com.apocighol.cevicheria.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * ==========================================
 * PRODUCTO SERVICE - CORREGIDO
 * 🔥 Generación automática de código PROD-XXX
 * 🔥 Compatible con el Repository corregido
 * ==========================================
 */
@Service
@Transactional
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    // ==========================================
    // 🔥 GENERAR CÓDIGO SECUENCIAL AUTOMÁTICO
    // ==========================================

    /**
     * Genera el siguiente código de producto automáticamente
     * Formato: PROD-001, PROD-002, PROD-003...
     */
    public String generarSiguienteCodigo() {
        try {
            // 🔥 CORREGIDO: Usar el método JPQL en lugar del nativo
            Integer maxNumero = productoRepository.obtenerMaximoNumeroCodigo();
            
            if (maxNumero == null) {
                maxNumero = 0;
            }
            
            int siguienteNumero = maxNumero + 1;
            String codigo = String.format("PROD-%03d", siguienteNumero);
            
            // Verificar que no exista (por si acaso)
            while (productoRepository.existsByCodigoProducto(codigo)) {
                siguienteNumero++;
                codigo = String.format("PROD-%03d", siguienteNumero);
            }
            
            System.out.println("✅ Código generado: " + codigo);
            return codigo;
            
        } catch (Exception e) {
            System.out.println("⚠️ Error en generación de código, usando fallback: " + e.getMessage());
            
            // Fallback: contar productos y agregar 1
            long count = productoRepository.contarProductos();
            String codigo = String.format("PROD-%03d", count + 1);
            
            // Verificar que no exista
            int intentos = 0;
            while (productoRepository.existsByCodigoProducto(codigo) && intentos < 100) {
                count++;
                codigo = String.format("PROD-%03d", count + 1);
                intentos++;
            }
            
            System.out.println("✅ Código generado (fallback): " + codigo);
            return codigo;
        }
    }

    // ==========================================
    // CRUD
    // ==========================================

    /**
     * Lista todos los productos
     */
    public List<Producto> listarTodos() {
        return productoRepository.findAllByOrderByNombreProductoAsc();
    }

    /**
     * Lista productos disponibles
     */
    public List<Producto> listarDisponibles() {
        return productoRepository.findByDisponibleProductoTrue();
    }

    /**
     * Buscar por ID
     */
    public Optional<Producto> buscarPorId(Long id) {
        return productoRepository.findById(id);
    }

    /**
     * Buscar por código
     */
    public Optional<Producto> buscarPorCodigo(String codigo) {
        return productoRepository.findByCodigoProducto(codigo);
    }

    /**
     * 🔥 Crear producto con código automático
     */
    public Producto crear(Producto producto) {
        // Generar código automático si no tiene o está vacío
        if (producto.getCodigoProducto() == null || 
            producto.getCodigoProducto().trim().isEmpty() ||
            producto.getCodigoProducto().equals("AUTO")) {
            
            producto.setCodigoProducto(generarSiguienteCodigo());
        } else {
            // Validar que el código no exista
            if (productoRepository.existsByCodigoProducto(producto.getCodigoProducto())) {
                throw new RuntimeException("Ya existe un producto con el código: " + producto.getCodigoProducto());
            }
        }

        // Validar nombre
        if (producto.getNombreProducto() == null || producto.getNombreProducto().trim().isEmpty()) {
            throw new RuntimeException("El nombre del producto es obligatorio");
        }

        // Validar precio
        if (producto.getPrecioProducto() == null || producto.getPrecioProducto().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("El precio debe ser mayor o igual a 0");
        }

        // Valores por defecto
        if (producto.getDisponibleProducto() == null) {
            producto.setDisponibleProducto(true);
        }

        Producto guardado = productoRepository.save(producto);
        System.out.println("✅ Producto creado: " + guardado.getCodigoProducto() + " - " + guardado.getNombreProducto());
        
        return guardado;
    }

    /**
     * Actualizar producto
     */
    public Producto actualizar(Long id, Producto datosActualizados) {
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + id));

        // Actualizar campos
        if (datosActualizados.getNombreProducto() != null && !datosActualizados.getNombreProducto().trim().isEmpty()) {
            producto.setNombreProducto(datosActualizados.getNombreProducto().trim());
        }

        if (datosActualizados.getDescripcionProducto() != null) {
            producto.setDescripcionProducto(datosActualizados.getDescripcionProducto());
        }

        if (datosActualizados.getPrecioProducto() != null) {
            producto.setPrecioProducto(datosActualizados.getPrecioProducto());
        }

        if (datosActualizados.getCategoriaProducto() != null) {
            producto.setCategoriaProducto(datosActualizados.getCategoriaProducto());
        }

        if (datosActualizados.getDisponibleProducto() != null) {
            producto.setDisponibleProducto(datosActualizados.getDisponibleProducto());
        }

        return productoRepository.save(producto);
    }

    /**
     * Cambiar disponibilidad
     */
    public Producto cambiarDisponibilidad(Long id, boolean disponible) {
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + id));
        
        producto.setDisponibleProducto(disponible);
        return productoRepository.save(producto);
    }

    /**
     * Eliminar producto
     */
    public void eliminar(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado: " + id);
        }
        productoRepository.deleteById(id);
        System.out.println("🗑️ Producto eliminado: " + id);
    }

    // ==========================================
    // BÚSQUEDAS
    // ==========================================

    /**
     * Buscar por nombre
     */
    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreProductoContainingIgnoreCase(nombre);
    }

    /**
     * Filtrar por categoría
     */
    public List<Producto> filtrarPorCategoria(String categoria) {
        return productoRepository.findByCategoriaProducto(categoria);
    }

    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    /**
     * Obtener estadísticas de productos
     */
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalProductos", productoRepository.count());
        stats.put("disponibles", productoRepository.findByDisponibleProductoTrue().size());
        stats.put("noDisponibles", productoRepository.findByDisponibleProductoFalse().size());
        stats.put("siguienteCodigo", generarSiguienteCodigo());
        
        return stats;
    }

    /**
     * Endpoint para obtener el siguiente código (para el frontend)
     */
    public Map<String, String> obtenerSiguienteCodigo() {
        Map<String, String> response = new HashMap<>();
        response.put("codigo", generarSiguienteCodigo());
        return response;
    }
}