package com.apocighol.cevicheria.controller;

import com.apocighol.cevicheria.model.Mesa;
import com.apocighol.cevicheria.repository.PedidoRepository;
import com.apocighol.cevicheria.service.MesaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ==========================================
 * MESA CONTROLLER - API REST
 * VERSIÓN SIN VALIDACIÓN DE CAPACIDAD
 * ==========================================
 */
@RestController
@RequestMapping("/api/mesas")
@CrossOrigin(origins = "*")
public class MesaController {

    @Autowired
    private MesaService mesaService;

    @Autowired
    private PedidoRepository pedidoRepository;

    // ==========================================
    // LISTAR TODAS LAS MESAS
    // ==========================================
    @GetMapping
    public ResponseEntity<List<Mesa>> listarMesas() {
        List<Mesa> mesas = mesaService.listarMesas();
        return ResponseEntity.ok(mesas);
    }

    // ==========================================
    // BUSCAR MESA POR NÚMERO
    // ==========================================
    @GetMapping("/{numero}")
    public ResponseEntity<?> buscarMesa(@PathVariable Integer numero) {
        return mesaService.buscarPorNumero(numero)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // CREAR NUEVA MESA
    // ==========================================
    @PostMapping
    public ResponseEntity<?> crearMesa(@RequestBody Mesa mesa) {
        try {
            Mesa nuevaMesa = mesaService.crearMesa(mesa);
            return ResponseEntity.ok(nuevaMesa);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // OCUPAR MESA - SIN VALIDACIÓN DE CAPACIDAD
    // ==========================================
    @PutMapping("/{numero}/ocupar")
    public ResponseEntity<?> ocuparMesa(
            @PathVariable Integer numero,
            @RequestBody Map<String, Object> datos) {
        try {
            Integer personas = (Integer) datos.get("personas");
            String mesero = (String) datos.get("mesero");

            if (personas == null || personas < 1) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Debe especificar la cantidad de personas");
                return ResponseEntity.badRequest().body(error);
            }

            if (mesero == null || mesero.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Debe especificar el mesero");
                return ResponseEntity.badRequest().body(error);
            }

            // 🔥 SIN VALIDACIÓN DE CAPACIDAD
            // Permitir cualquier cantidad de personas
            Mesa mesa = mesaService.ocuparMesa(numero, personas, mesero);
            return ResponseEntity.ok(mesa);

        } catch (IllegalArgumentException | IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // LIBERAR MESA
    // ==========================================
    @PutMapping("/{numero}/liberar")
    public ResponseEntity<?> liberarMesa(
            @PathVariable Integer numero,
            @RequestBody(required = false) Map<String, String> datos) {
        try {
            Mesa mesa = mesaService.buscarPorNumero(numero)
                    .orElseThrow(() -> new IllegalArgumentException("Mesa no encontrada"));

            String motivo = datos != null ? datos.get("motivo") : null;
            Mesa mesaLiberada = mesaService.liberarMesa(mesa.getIdMesa(), motivo);
            
            return ResponseEntity.ok(mesaLiberada);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // VALIDAR SI PUEDE COBRAR (TODOS LOS PEDIDOS SERVIDOS)
    // ==========================================
    @GetMapping("/{numero}/puede-cobrar")
    public ResponseEntity<?> puedeCobrar(@PathVariable Integer numero) {
        // Contar pedidos que NO estén SERVIDOS ni COBRADOS
        long pedidosNoServidos = pedidoRepository.countPedidosNoServidos(numero);
        
        boolean puedeCobrar = (pedidosNoServidos == 0);
        
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("puedeCobrar", puedeCobrar);
        respuesta.put("pedidosNoServidos", pedidosNoServidos);
        
        if (puedeCobrar) {
            respuesta.put("mensaje", "Puede cobrar la mesa");
        } else {
            respuesta.put("mensaje", "Hay " + pedidosNoServidos + " pedido(s) sin servir");
        }
        
        return ResponseEntity.ok(respuesta);
    }

    // ==========================================
    // ACTUALIZAR TOTAL CONSUMO
    // ==========================================
    @PutMapping("/{numero}/actualizar-total")
    public ResponseEntity<?> actualizarTotal(
            @PathVariable Integer numero,
            @RequestBody Map<String, Object> datos) {
        try {
            Double totalDouble = ((Number) datos.get("total")).doubleValue();
            BigDecimal nuevoTotal = BigDecimal.valueOf(totalDouble);

            Mesa mesa = mesaService.actualizarTotal(numero, nuevoTotal);
            return ResponseEntity.ok(mesa);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // ELIMINAR MESA
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMesa(@PathVariable Long id) {
        try {
            mesaService.eliminarMesa(id);
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Mesa eliminada correctamente");
            return ResponseEntity.ok(respuesta);
        } catch (IllegalArgumentException | IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // LISTAR MESAS DISPONIBLES
    // ==========================================
    @GetMapping("/disponibles")
    public ResponseEntity<List<Mesa>> listarMesasDisponibles() {
        List<Mesa> mesas = mesaService.listarMesasDisponibles();
        return ResponseEntity.ok(mesas);
    }

    // ==========================================
    // LISTAR MESAS OCUPADAS
    // ==========================================
    @GetMapping("/ocupadas")
    public ResponseEntity<List<Mesa>> listarMesasOcupadas() {
        List<Mesa> mesas = mesaService.listarMesasOcupadas();
        return ResponseEntity.ok(mesas);
    }

    // ==========================================
    // ESTADÍSTICAS DE MESAS
    // ==========================================
    @GetMapping("/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", mesaService.listarMesas().size());
        stats.put("disponibles", mesaService.contarPorEstado("disponible"));
        stats.put("ocupadas", mesaService.contarPorEstado("ocupada"));
        stats.put("reservadas", mesaService.contarPorEstado("reservada"));
        return ResponseEntity.ok(stats);
    }
}