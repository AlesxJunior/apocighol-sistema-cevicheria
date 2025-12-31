package com.apocighol.cevicheria.controller;

import com.apocighol.cevicheria.model.Mesa;
import com.apocighol.cevicheria.service.MesaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * ==========================================
 * MESA CONTROLLER - API REST
 * VERSIÓN DEFINITIVA
 * Base URL: /api/mesas
 * ==========================================
 */
@RestController
@RequestMapping("/api/mesas")
public class MesaController {

    @Autowired
    private MesaService mesaService;

    // ==========================================
    // CRUD BÁSICO
    // ==========================================

    // GET /api/mesas - Obtener todas
    @GetMapping
    public List<Mesa> obtenerTodas() {
        return mesaService.obtenerTodas();
    }

    // GET /api/mesas/{id} - Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<Mesa> obtenerPorId(@PathVariable Long id) {
        return mesaService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/mesas/numero/{numero} - Obtener por número
    @GetMapping("/numero/{numero}")
    public ResponseEntity<Mesa> obtenerPorNumero(@PathVariable Integer numero) {
        return mesaService.obtenerPorNumero(numero)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/mesas - Crear mesa
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Mesa mesa) {
        try {
            Mesa nuevaMesa = mesaService.crear(mesa);
            return ResponseEntity.ok(nuevaMesa);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/mesas/{id} - Actualizar mesa
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Mesa mesa) {
        try {
            Mesa actualizada = mesaService.actualizar(id, mesa);
            if (actualizada != null) {
                return ResponseEntity.ok(actualizada);
            }
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/mesas/{id} - Eliminar mesa
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        mesaService.eliminar(id);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // OPERACIONES DE ESTADO
    // ==========================================

    // PUT /api/mesas/{id}/ocupar - Ocupar mesa
    // Body: { "personas": 4, "mesero": "Juan" }
    @PutMapping("/{id}/ocupar")
    public ResponseEntity<?> ocuparMesa(@PathVariable Long id, @RequestBody Map<String, Object> datos) {
        try {
            Integer personas = 1;
            Object personasObj = datos.get("personas");
            if (personasObj instanceof Integer) {
                personas = (Integer) personasObj;
            } else if (personasObj instanceof String) {
                personas = Integer.parseInt((String) personasObj);
            } else if (personasObj instanceof Double) {
                personas = ((Double) personasObj).intValue();
            }
            
            String mesero = (String) datos.get("mesero");
            
            if (mesero == null || mesero.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Debe especificar el mesero"));
            }
            if (personas < 1) {
                return ResponseEntity.badRequest().body(Map.of("error", "Mínimo 1 persona"));
            }
            
            Mesa mesa = mesaService.ocuparMesa(id, personas, mesero);
            return ResponseEntity.ok(mesa);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/mesas/{id}/liberar - Liberar mesa
    @PutMapping("/{id}/liberar")
    public ResponseEntity<?> liberarMesa(@PathVariable Long id) {
        try {
            Mesa mesa = mesaService.liberarMesa(id);
            return ResponseEntity.ok(mesa);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/mesas/{id}/reservar - Reservar mesa
    @PutMapping("/{id}/reservar")
    public ResponseEntity<?> reservarMesa(@PathVariable Long id) {
        try {
            Mesa mesa = mesaService.reservarMesa(id);
            return ResponseEntity.ok(mesa);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/mesas/{id}/total - Actualizar total
    // Body: { "total": 150.50 }
    @PutMapping("/{id}/total")
    public ResponseEntity<?> actualizarTotal(@PathVariable Long id, @RequestBody Map<String, Object> datos) {
        try {
            Object totalObj = datos.get("total");
            BigDecimal total;
            
            if (totalObj instanceof Integer) {
                total = BigDecimal.valueOf((Integer) totalObj);
            } else if (totalObj instanceof Double) {
                total = BigDecimal.valueOf((Double) totalObj);
            } else if (totalObj instanceof String) {
                total = new BigDecimal((String) totalObj);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Total inválido"));
            }
            
            Mesa mesa = mesaService.actualizarTotal(id, total);
            return ResponseEntity.ok(mesa);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================================
    // CONSULTAS FILTRADAS
    // ==========================================

    // GET /api/mesas/disponibles
    @GetMapping("/disponibles")
    public List<Mesa> obtenerDisponibles() {
        return mesaService.obtenerDisponibles();
    }

    // GET /api/mesas/ocupadas
    @GetMapping("/ocupadas")
    public List<Mesa> obtenerOcupadas() {
        return mesaService.obtenerOcupadas();
    }

    // GET /api/mesas/estado/{estado}
    @GetMapping("/estado/{estado}")
    public List<Mesa> obtenerPorEstado(@PathVariable String estado) {
        return mesaService.obtenerPorEstado(estado);
    }

    // GET /api/mesas/mesero/{mesero}
    @GetMapping("/mesero/{mesero}")
    public List<Mesa> obtenerPorMesero(@PathVariable String mesero) {
        return mesaService.obtenerPorMesero(mesero);
    }

    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    // GET /api/mesas/resumen
    @GetMapping("/resumen")
    public Map<String, Object> obtenerResumen() {
        long[] resumen = mesaService.obtenerResumen();
        
        Map<String, Object> response = new HashMap<>();
        response.put("disponibles", resumen[0]);
        response.put("ocupadas", resumen[1]);
        response.put("reservadas", resumen[2]);
        response.put("total", resumen[3]);
        
        return response;
    }

    // GET /api/mesas/contar/{estado}
    @GetMapping("/contar/{estado}")
    public Map<String, Long> contarPorEstado(@PathVariable String estado) {
        return Map.of("cantidad", mesaService.contarPorEstado(estado));
    }
}