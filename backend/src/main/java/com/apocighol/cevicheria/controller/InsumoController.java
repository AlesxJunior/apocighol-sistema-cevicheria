package com.apocighol.cevicheria.controller;

import com.apocighol.cevicheria.model.Insumo;
import com.apocighol.cevicheria.service.InsumoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión de Insumos
 * Base URL: /api/insumos
 */
@RestController
@RequestMapping("/api/insumos")
@CrossOrigin(origins = "*")
public class InsumoController {
    
    @Autowired
    private InsumoService insumoService;
    
    // ==========================================
    // CRUD BÁSICO
    // ==========================================
    
    /**
     * GET /api/insumos
     * Lista todos los insumos
     */
    @GetMapping
    public ResponseEntity<List<Insumo>> listarTodos() {
        return ResponseEntity.ok(insumoService.listarTodos());
    }
    
    /**
     * GET /api/insumos/{id}
     * Obtiene un insumo por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return insumoService.buscarPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * POST /api/insumos
     * Crea un nuevo insumo
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Insumo insumo) {
        try {
            Insumo nuevo = insumoService.crear(insumo);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * PUT /api/insumos/{id}
     * Actualiza un insumo existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Insumo insumo) {
        try {
            Insumo actualizado = insumoService.actualizar(id, insumo);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * DELETE /api/insumos/{id}
     * Elimina un insumo
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            insumoService.eliminar(id);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Insumo eliminado correctamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // ==========================================
    // GESTIÓN DE STOCK
    // ==========================================
    
    /**
     * PUT /api/insumos/{id}/aumentar-stock
     * Aumenta el stock de un insumo
     * Body: { "cantidad": 10.5 }
     */
    @PutMapping("/{id}/aumentar-stock")
    public ResponseEntity<?> aumentarStock(@PathVariable Long id, @RequestBody Map<String, Object> datos) {
        try {
            BigDecimal cantidad = new BigDecimal(datos.get("cantidad").toString());
            Insumo insumo = insumoService.aumentarStock(id, cantidad);
            return ResponseEntity.ok(insumo);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * PUT /api/insumos/{id}/disminuir-stock
     * Disminuye el stock de un insumo
     * Body: { "cantidad": 5.0 }
     */
    @PutMapping("/{id}/disminuir-stock")
    public ResponseEntity<?> disminuirStock(@PathVariable Long id, @RequestBody Map<String, Object> datos) {
        try {
            BigDecimal cantidad = new BigDecimal(datos.get("cantidad").toString());
            boolean exito = insumoService.disminuirStock(id, cantidad);
            
            Insumo insumo = insumoService.buscarPorId(id).orElse(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("exito", exito);
            response.put("insumo", insumo);
            response.put("mensaje", exito ? "Stock descontado correctamente" : "Stock insuficiente, se dejó en 0");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * PUT /api/insumos/{id}/ajustar-stock
     * Establece el stock exacto (ajuste manual)
     * Body: { "nuevoStock": 100, "motivo": "Inventario físico" }
     */
    @PutMapping("/{id}/ajustar-stock")
    public ResponseEntity<?> ajustarStock(@PathVariable Long id, @RequestBody Map<String, Object> datos) {
        try {
            BigDecimal nuevoStock = new BigDecimal(datos.get("nuevoStock").toString());
            String motivo = datos.get("motivo") != null ? datos.get("motivo").toString() : "Ajuste manual";
            
            Insumo insumo = insumoService.establecerStock(id, nuevoStock, motivo);
            return ResponseEntity.ok(insumo);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // ==========================================
    // CONSULTAS DE STOCK
    // ==========================================
    
    /**
     * GET /api/insumos/stock-bajo
     * Lista insumos con stock bajo
     */
    @GetMapping("/stock-bajo")
    public ResponseEntity<List<Insumo>> listarStockBajo() {
        return ResponseEntity.ok(insumoService.listarInsumosConStockBajo());
    }
    
    /**
     * GET /api/insumos/agotados
     * Lista insumos agotados
     */
    @GetMapping("/agotados")
    public ResponseEntity<List<Insumo>> listarAgotados() {
        return ResponseEntity.ok(insumoService.listarInsumosAgotados());
    }
    
    /**
     * GET /api/insumos/{id}/verificar-stock?cantidad=10
     * Verifica si hay suficiente stock
     */
    @GetMapping("/{id}/verificar-stock")
    public ResponseEntity<?> verificarStock(@PathVariable Long id, @RequestParam BigDecimal cantidad) {
        boolean suficiente = insumoService.hayStockSuficiente(id, cantidad);
        
        Map<String, Object> response = new HashMap<>();
        response.put("suficiente", suficiente);
        response.put("cantidadRequerida", cantidad);
        
        insumoService.buscarPorId(id).ifPresent(insumo -> {
            response.put("stockActual", insumo.getStockActual());
            response.put("nombreInsumo", insumo.getNombreInsumo());
        });
        
        return ResponseEntity.ok(response);
    }
    
    // ==========================================
    // BÚSQUEDAS
    // ==========================================
    
    /**
     * GET /api/insumos/buscar?q=limon
     * Busca insumos por nombre
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<Insumo>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(insumoService.buscar(q));
    }
    
    /**
     * GET /api/insumos/categoria/{categoria}
     * Lista insumos por categoría
     */
    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<Insumo>> listarPorCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(insumoService.listarPorCategoria(categoria));
    }
    
    // ==========================================
    // ESTADÍSTICAS
    // ==========================================
    
    /**
     * GET /api/insumos/estadisticas
     * Obtiene estadísticas del inventario
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        return ResponseEntity.ok(insumoService.obtenerEstadisticas());
    }
    
    /**
     * GET /api/insumos/alertas
     * Obtiene cantidad de alertas de stock
     */
    @GetMapping("/alertas")
    public ResponseEntity<?> obtenerAlertas() {
        Map<String, Object> alertas = new HashMap<>();
        alertas.put("stockBajo", insumoService.contarInsumosConStockBajo());
        alertas.put("agotados", insumoService.listarInsumosAgotados().size());
        return ResponseEntity.ok(alertas);
    }
}