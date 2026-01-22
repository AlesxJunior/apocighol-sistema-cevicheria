package com.apocighol.cevicheria.controller;

import com.apocighol.cevicheria.model.Compra;
import com.apocighol.cevicheria.service.CompraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión de Compras
 * Base URL: /api/compras
 * 
 * Al registrar una compra, automáticamente aumenta el stock de insumos
 */
@RestController
@RequestMapping("/api/compras")
@CrossOrigin(origins = "*")
public class CompraController {
    
    @Autowired
    private CompraService compraService;
    
    // ==========================================
    // CRUD BÁSICO
    // ==========================================
    
    /**
     * GET /api/compras
     * Lista todas las compras (más recientes primero)
     */
    @GetMapping
    public ResponseEntity<List<Compra>> listarTodas() {
        return ResponseEntity.ok(compraService.listarTodas());
    }
    
    /**
     * GET /api/compras/{id}
     * Obtiene una compra por ID con sus detalles
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return compraService.buscarPorIdConDetalles(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * GET /api/compras/codigo/{codigo}
     * Busca compra por código
     */
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<?> buscarPorCodigo(@PathVariable String codigo) {
        return compraService.buscarPorCodigo(codigo)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    // ==========================================
    // 🔥 REGISTRAR COMPRA (AUMENTA STOCK)
    // ==========================================
    
    /**
     * POST /api/compras
     * Registra una nueva compra y aumenta el stock de insumos
     * 
     * Body:
     * {
     *   "idProveedor": 1,
     *   "observaciones": "Compra semanal",
     *   "detalles": [
     *     { "idInsumo": 1, "cantidad": 50, "precioUnitario": 0.50 },
     *     { "idInsumo": 2, "cantidad": 10, "precioUnitario": 15.00 }
     *   ]
     * }
     */
    @PostMapping
    public ResponseEntity<?> registrarCompra(@RequestBody Map<String, Object> datos) {
        try {
            // Validar datos requeridos
            if (!datos.containsKey("idProveedor")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Debe seleccionar un proveedor");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (!datos.containsKey("detalles")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Debe incluir al menos un insumo");
                return ResponseEntity.badRequest().body(error);
            }
            
            Long idProveedor = Long.valueOf(datos.get("idProveedor").toString());
            String observaciones = datos.get("observaciones") != null ? 
                datos.get("observaciones").toString() : null;
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> detalles = (List<Map<String, Object>>) datos.get("detalles");
            
            if (detalles.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Debe incluir al menos un insumo");
                return ResponseEntity.badRequest().body(error);
            }
            
            Compra compra = compraService.registrarCompra(idProveedor, detalles, observaciones);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Compra registrada correctamente");
            response.put("compra", compra);
            response.put("codigoCompra", compra.getCodigoCompra());
            response.put("total", compra.getTotalCompra());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // ==========================================
    // CONSULTAS POR FECHA
    // ==========================================
    
    /**
     * GET /api/compras/hoy
     * Lista compras del día
     */
    @GetMapping("/hoy")
    public ResponseEntity<List<Compra>> comprasDelDia() {
        return ResponseEntity.ok(compraService.comprasDelDia());
    }
    
    /**
     * GET /api/compras/fecha?inicio=2024-01-01&fin=2024-01-31
     * Lista compras entre fechas
     */
    @GetMapping("/fecha")
    public ResponseEntity<List<Compra>> comprasEntreFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(compraService.comprasEntreFechas(inicio, fin));
    }
    
    /**
     * GET /api/compras/proveedor/{idProveedor}
     * Lista compras de un proveedor
     */
    @GetMapping("/proveedor/{idProveedor}")
    public ResponseEntity<List<Compra>> comprasDeProveedor(@PathVariable Long idProveedor) {
        return ResponseEntity.ok(compraService.comprasDeProveedor(idProveedor));
    }
    
    // ==========================================
    // ESTADÍSTICAS
    // ==========================================
    
    /**
     * GET /api/compras/estadisticas
     * Obtiene estadísticas de compras
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        return ResponseEntity.ok(compraService.obtenerEstadisticas());
    }
    
    /**
     * GET /api/compras/total-hoy
     * Total gastado en compras hoy
     */
    @GetMapping("/total-hoy")
    public ResponseEntity<?> totalComprasHoy() {
        Map<String, Object> response = new HashMap<>();
        response.put("fecha", LocalDate.now());
        response.put("total", compraService.totalComprasHoy());
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/compras/total?inicio=2024-01-01&fin=2024-01-31
     * Total gastado entre fechas
     */
    @GetMapping("/total")
    public ResponseEntity<?> totalComprasEntreFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        Map<String, Object> response = new HashMap<>();
        response.put("fechaInicio", inicio);
        response.put("fechaFin", fin);
        response.put("total", compraService.totalComprasEntreFechas(inicio, fin));
        return ResponseEntity.ok(response);
    }
}