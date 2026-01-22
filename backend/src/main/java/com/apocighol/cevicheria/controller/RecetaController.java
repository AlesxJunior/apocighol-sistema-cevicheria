package com.apocighol.cevicheria.controller;

import com.apocighol.cevicheria.model.Receta;
import com.apocighol.cevicheria.service.RecetaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión de Recetas
 * Base URL: /api/recetas
 * 
 * Las recetas relacionan productos con sus insumos necesarios
 */
@RestController
@RequestMapping("/api/recetas")
@CrossOrigin(origins = "*")
public class RecetaController {
    
    @Autowired
    private RecetaService recetaService;
    
    // ==========================================
    // CONSULTAS DE RECETAS
    // ==========================================
    
    /**
     * GET /api/recetas/producto/{idProducto}
     * Obtiene la receta completa de un producto
     */
    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<List<Receta>> obtenerRecetaDeProducto(@PathVariable Long idProducto) {
        return ResponseEntity.ok(recetaService.obtenerRecetaDeProducto(idProducto));
    }
    
    /**
     * GET /api/recetas/producto/{idProducto}/existe
     * Verifica si un producto tiene receta asignada
     */
    @GetMapping("/producto/{idProducto}/existe")
    public ResponseEntity<?> verificarReceta(@PathVariable Long idProducto) {
        Map<String, Object> response = new HashMap<>();
        response.put("tieneReceta", recetaService.tieneReceta(idProducto));
        return ResponseEntity.ok(response);
    }
    
    // ==========================================
    // ASIGNACIÓN DE RECETAS
    // ==========================================
    
    /**
     * POST /api/recetas/producto/{idProducto}
     * Asigna o actualiza la receta completa de un producto
     * 
     * Body:
     * {
     *   "insumos": [
     *     { "idInsumo": 1, "cantidad": 10 },
     *     { "idInsumo": 2, "cantidad": 50 }
     *   ]
     * }
     */
    @PostMapping("/producto/{idProducto}")
    public ResponseEntity<?> asignarReceta(
            @PathVariable Long idProducto, 
            @RequestBody Map<String, Object> datos) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> insumos = (List<Map<String, Object>>) datos.get("insumos");
            
            if (insumos == null || insumos.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Debe incluir al menos un insumo");
                return ResponseEntity.badRequest().body(error);
            }
            
            List<Receta> receta = recetaService.asignarReceta(idProducto, insumos);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Receta asignada correctamente");
            response.put("cantidadInsumos", receta.size());
            response.put("receta", receta);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * PUT /api/recetas/producto/{idProducto}/insumo/{idInsumo}
     * Agrega o actualiza un insumo específico en la receta
     * 
     * Body: { "cantidad": 15 }
     */
    @PutMapping("/producto/{idProducto}/insumo/{idInsumo}")
    public ResponseEntity<?> agregarInsumoAReceta(
            @PathVariable Long idProducto,
            @PathVariable Long idInsumo,
            @RequestBody Map<String, Object> datos) {
        try {
            BigDecimal cantidad = new BigDecimal(datos.get("cantidad").toString());
            Receta receta = recetaService.agregarInsumoAReceta(idProducto, idInsumo, cantidad);
            return ResponseEntity.ok(receta);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * DELETE /api/recetas/producto/{idProducto}/insumo/{idInsumo}
     * Elimina un insumo específico de la receta
     */
    @DeleteMapping("/producto/{idProducto}/insumo/{idInsumo}")
    public ResponseEntity<?> eliminarInsumoDeReceta(
            @PathVariable Long idProducto,
            @PathVariable Long idInsumo) {
        try {
            recetaService.eliminarInsumoDeReceta(idProducto, idInsumo);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Insumo eliminado de la receta");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * DELETE /api/recetas/producto/{idProducto}
     * Elimina toda la receta de un producto
     */
    @DeleteMapping("/producto/{idProducto}")
    public ResponseEntity<?> eliminarReceta(@PathVariable Long idProducto) {
        recetaService.eliminarReceta(idProducto);
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Receta eliminada correctamente");
        return ResponseEntity.ok(response);
    }
    
    // ==========================================
    // 🔥 DESCUENTO AUTOMÁTICO DE INSUMOS
    // ==========================================
    
    /**
     * POST /api/recetas/descontar
     * Descuenta insumos al crear un pedido
     * 
     * Body:
     * {
     *   "productos": [
     *     { "idProducto": 1, "cantidad": 2 },
     *     { "idProducto": 5, "cantidad": 1 }
     *   ]
     * }
     */
    @PostMapping("/descontar")
    public ResponseEntity<?> descontarInsumos(@RequestBody Map<String, Object> datos) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> productos = (List<Map<String, Object>>) datos.get("productos");
            
            if (productos == null || productos.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Debe incluir al menos un producto");
                return ResponseEntity.badRequest().body(error);
            }
            
            Map<String, Object> resultado = recetaService.descontarInsumosDePedido(productos);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * POST /api/recetas/verificar-disponibilidad
     * Verifica si hay insumos suficientes para preparar productos
     * 
     * Body: { "idProducto": 1, "cantidad": 5 }
     */
    @PostMapping("/verificar-disponibilidad")
    public ResponseEntity<?> verificarDisponibilidad(@RequestBody Map<String, Object> datos) {
        try {
            Long idProducto = Long.valueOf(datos.get("idProducto").toString());
            int cantidad = Integer.parseInt(datos.get("cantidad").toString());
            
            Map<String, Object> resultado = recetaService.verificarDisponibilidad(idProducto, cantidad);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // ==========================================
    // CONSULTAS AUXILIARES
    // ==========================================
    
    /**
     * GET /api/recetas/productos-sin-receta
     * Lista IDs de productos que no tienen receta asignada
     */
    @GetMapping("/productos-sin-receta")
    public ResponseEntity<List<Long>> productosSinReceta() {
        return ResponseEntity.ok(recetaService.productosSinReceta());
    }
    
    /**
     * GET /api/recetas/insumo/{idInsumo}/productos
     * Lista productos que usan un insumo específico
     */
    @GetMapping("/insumo/{idInsumo}/productos")
    public ResponseEntity<List<Long>> productosQueUsanInsumo(@PathVariable Long idInsumo) {
        return ResponseEntity.ok(recetaService.productosQueUsanInsumo(idInsumo));
    }
}