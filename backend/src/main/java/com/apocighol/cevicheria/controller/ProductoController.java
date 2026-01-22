package com.apocighol.cevicheria.controller;

import com.apocighol.cevicheria.model.Producto;
import com.apocighol.cevicheria.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ==========================================
 * PRODUCTO CONTROLLER
 * API REST: /api/productos
 * 
 * 🔥 Incluye endpoint para obtener siguiente código
 * ==========================================
 */
@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    // ==========================================
    // 🔥 OBTENER SIGUIENTE CÓDIGO (PARA FRONTEND)
    // ==========================================

    /**
     * GET /api/productos/siguiente-codigo
     * Retorna el siguiente código disponible: PROD-007
     */
    @GetMapping("/siguiente-codigo")
    public ResponseEntity<Map<String, String>> obtenerSiguienteCodigo() {
        return ResponseEntity.ok(productoService.obtenerSiguienteCodigo());
    }

    // ==========================================
    // CRUD BÁSICO
    // ==========================================

    /**
     * GET /api/productos
     * Lista todos los productos
     */
    @GetMapping
    public ResponseEntity<List<Producto>> listarTodos() {
        return ResponseEntity.ok(productoService.listarTodos());
    }

    /**
     * GET /api/productos/disponibles
     * Lista solo productos disponibles
     */
    @GetMapping("/disponibles")
    public ResponseEntity<List<Producto>> listarDisponibles() {
        return ResponseEntity.ok(productoService.listarDisponibles());
    }

    /**
     * GET /api/productos/{id}
     * Obtiene un producto por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return productoService.buscarPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/productos/codigo/{codigo}
     * Obtiene un producto por código
     */
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<?> obtenerPorCodigo(@PathVariable String codigo) {
        return productoService.buscarPorCodigo(codigo)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/productos
     * 🔥 Crea un producto con código automático
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> datos) {
        try {
            Producto producto = new Producto();
            
            // El código se genera automáticamente en el service
            producto.setCodigoProducto("AUTO");
            
            // Nombre (obligatorio)
            String nombre = (String) datos.get("nombreProducto");
            if (nombre == null || nombre.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El nombre del producto es obligatorio");
                return ResponseEntity.badRequest().body(error);
            }
            producto.setNombreProducto(nombre.trim());
            
            // Descripción
            producto.setDescripcionProducto((String) datos.get("descripcionProducto"));
            
            // Precio
            BigDecimal precio = BigDecimal.ZERO;
            Object precioObj = datos.get("precioProducto");
            if (precioObj instanceof Number) {
                precio = BigDecimal.valueOf(((Number) precioObj).doubleValue());
            }
            producto.setPrecioProducto(precio);
            
            // Categoría
            producto.setCategoriaProducto((String) datos.get("categoriaProducto"));
            
            // Disponibilidad (por defecto true)
            Boolean disponible = (Boolean) datos.get("disponibleProducto");
            producto.setDisponibleProducto(disponible != null ? disponible : true);
            
            // Crear producto (el código se genera en el service)
            Producto creado = productoService.crear(producto);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * PUT /api/productos/{id}
     * Actualiza un producto
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Map<String, Object> datos) {
        try {
            Producto datosActualizados = new Producto();
            
            // Nombre
            if (datos.containsKey("nombreProducto")) {
                datosActualizados.setNombreProducto((String) datos.get("nombreProducto"));
            }
            
            // Descripción
            if (datos.containsKey("descripcionProducto")) {
                datosActualizados.setDescripcionProducto((String) datos.get("descripcionProducto"));
            }
            
            // Precio
            if (datos.containsKey("precioProducto")) {
                Object precioObj = datos.get("precioProducto");
                if (precioObj instanceof Number) {
                    datosActualizados.setPrecioProducto(BigDecimal.valueOf(((Number) precioObj).doubleValue()));
                }
            }
            
            // Categoría
            if (datos.containsKey("categoriaProducto")) {
                datosActualizados.setCategoriaProducto((String) datos.get("categoriaProducto"));
            }
            
            // Disponibilidad
            if (datos.containsKey("disponibleProducto")) {
                datosActualizados.setDisponibleProducto((Boolean) datos.get("disponibleProducto"));
            }
            
            Producto actualizado = productoService.actualizar(id, datosActualizados);
            return ResponseEntity.ok(actualizado);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * PUT /api/productos/{id}/disponibilidad
     * Cambia la disponibilidad de un producto
     */
    @PutMapping("/{id}/disponibilidad")
    public ResponseEntity<?> cambiarDisponibilidad(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> datos) {
        try {
            Boolean disponible = datos.get("disponible");
            if (disponible == null) {
                disponible = true;
            }
            
            Producto actualizado = productoService.cambiarDisponibilidad(id, disponible);
            return ResponseEntity.ok(actualizado);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * DELETE /api/productos/{id}
     * Elimina un producto
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            productoService.eliminar(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Producto eliminado correctamente");
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // BÚSQUEDAS
    // ==========================================

    /**
     * GET /api/productos/buscar?q=ceviche
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<Producto>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(productoService.buscarPorNombre(q));
    }

    /**
     * GET /api/productos/categoria/{categoria}
     */
    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<Producto>> filtrarPorCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(productoService.filtrarPorCategoria(categoria));
    }

    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    /**
     * GET /api/productos/estadisticas
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        return ResponseEntity.ok(productoService.obtenerEstadisticas());
    }
}