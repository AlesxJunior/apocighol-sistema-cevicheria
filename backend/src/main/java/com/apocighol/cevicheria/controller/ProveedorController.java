package com.apocighol.cevicheria.controller;

import com.apocighol.cevicheria.model.Proveedor;
import com.apocighol.cevicheria.service.ProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión de Proveedores
 * Base URL: /api/proveedores
 */
@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "*")
public class ProveedorController {
    
    @Autowired
    private ProveedorService proveedorService;
    
    // ==========================================
    // CRUD BÁSICO
    // ==========================================
    
    /**
     * GET /api/proveedores
     * Lista todos los proveedores activos
     */
    @GetMapping
    public ResponseEntity<List<Proveedor>> listarActivos() {
        return ResponseEntity.ok(proveedorService.listarActivos());
    }
    
    /**
     * GET /api/proveedores/todos
     * Lista todos los proveedores (activos e inactivos)
     */
    @GetMapping("/todos")
    public ResponseEntity<List<Proveedor>> listarTodos() {
        return ResponseEntity.ok(proveedorService.listarTodos());
    }
    
    /**
     * GET /api/proveedores/{id}
     * Obtiene un proveedor por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return proveedorService.buscarPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * POST /api/proveedores
     * Crea un nuevo proveedor
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Proveedor proveedor) {
        try {
            Proveedor nuevo = proveedorService.crear(proveedor);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * PUT /api/proveedores/{id}
     * Actualiza un proveedor existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Proveedor proveedor) {
        try {
            Proveedor actualizado = proveedorService.actualizar(id, proveedor);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * DELETE /api/proveedores/{id}
     * Desactiva un proveedor (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> desactivar(@PathVariable Long id) {
        try {
            proveedorService.desactivar(id);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Proveedor desactivado correctamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * DELETE /api/proveedores/{id}/permanente
     * Elimina un proveedor permanentemente
     */
    @DeleteMapping("/{id}/permanente")
    public ResponseEntity<?> eliminarPermanente(@PathVariable Long id) {
        try {
            proveedorService.eliminar(id);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Proveedor eliminado permanentemente");
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
     * GET /api/proveedores/buscar?q=mercado
     * Busca proveedores por nombre
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<Proveedor>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(proveedorService.buscar(q));
    }
    
    /**
     * GET /api/proveedores/ruc/{ruc}
     * Busca proveedor por RUC/DNI
     */
    @GetMapping("/ruc/{ruc}")
    public ResponseEntity<?> buscarPorRuc(@PathVariable String ruc) {
        return proveedorService.buscarPorRuc(ruc)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    // ==========================================
    // ESTADÍSTICAS
    // ==========================================
    
    /**
     * GET /api/proveedores/estadisticas
     * Obtiene estadísticas de proveedores
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalActivos", proveedorService.contarActivos());
        stats.put("total", proveedorService.listarTodos().size());
        return ResponseEntity.ok(stats);
    }
}