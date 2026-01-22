package com.apocighol.cevicheria.controller;

import com.apocighol.cevicheria.model.Pedido;
import com.apocighol.cevicheria.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ==========================================
 * PEDIDO CONTROLLER
 * API REST: /api/pedidos
 * 
 * 🔥 Incluye endpoints por ROL:
 * - /admin: Todos los pedidos del día
 * - /cocina: Solo activos (pendiente→servido)
 * - /mesero/{nombre}: Pedidos de un mesero
 * ==========================================
 */
@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    // ==========================================
    // CREAR PEDIDO
    // ==========================================

    @PostMapping
    public ResponseEntity<?> crearPedido(@RequestBody Map<String, Object> datos) {
        try {
            if (!datos.containsKey("mesa")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Debe especificar el número de mesa");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (!datos.containsKey("productos")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Debe incluir al menos un producto");
                return ResponseEntity.badRequest().body(error);
            }
            
            Integer numeroMesa = Integer.valueOf(datos.get("mesa").toString());
            String mesero = (String) datos.get("mesero");
            String nota = (String) datos.get("nota");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> productos = (List<Map<String, Object>>) datos.get("productos");
            
            if (productos.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Debe incluir al menos un producto");
                return ResponseEntity.badRequest().body(error);
            }
            
            Pedido pedido = pedidoService.crearPedido(numeroMesa, mesero, nota, productos);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Pedido creado exitosamente");
            response.put("codigoPedido", pedido.getCodigoPedido());
            response.put("idPedido", pedido.getIdPedido());
            response.put("total", pedido.getTotalPedido());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // 🔥 ENDPOINTS POR ROL
    // ==========================================

    /**
     * GET /api/pedidos/admin
     * Para ADMIN: Todos los pedidos del día (incluye cobrados)
     */
    @GetMapping("/admin")
    public ResponseEntity<List<Pedido>> pedidosParaAdmin() {
        List<Pedido> pedidos = pedidoService.pedidosDelDia();
        return ResponseEntity.ok(pedidos);
    }

    /**
     * GET /api/pedidos/cocina
     * Para COCINA: Solo pedidos activos (pendiente, preparando, listo, servido)
     */
    @GetMapping("/cocina")
    public ResponseEntity<List<Pedido>> pedidosParaCocina() {
        List<Pedido> pedidos = pedidoService.pedidosActivosDelDia();
        return ResponseEntity.ok(pedidos);
    }

    /**
     * GET /api/pedidos/mesero/{nombre}
     * Para MESERO: Solo sus pedidos activos del día
     */
    @GetMapping("/mesero/{nombre}")
    public ResponseEntity<List<Pedido>> pedidosParaMesero(@PathVariable String nombre) {
        List<Pedido> pedidos = pedidoService.pedidosPorMeseroDelDia(nombre);
        return ResponseEntity.ok(pedidos);
    }

    // ==========================================
    // CONSULTAS GENERALES
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Pedido>> listarTodos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return pedidoService.buscarPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<?> obtenerPorCodigo(@PathVariable String codigo) {
        return pedidoService.buscarPorCodigo(codigo)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/mesa/{numeroMesa}")
    public ResponseEntity<List<Pedido>> pedidosPorMesa(@PathVariable Integer numeroMesa) {
        return ResponseEntity.ok(pedidoService.pedidosPorMesa(numeroMesa));
    }

    @GetMapping("/mesa/{numeroMesa}/pendientes")
    public ResponseEntity<List<Pedido>> pedidosPendientesMesa(@PathVariable Integer numeroMesa) {
        return ResponseEntity.ok(pedidoService.pedidosPendientesMesa(numeroMesa));
    }

    @GetMapping("/hoy")
    public ResponseEntity<List<Pedido>> pedidosDelDia() {
        return ResponseEntity.ok(pedidoService.pedidosDelDia());
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Pedido>> pedidosPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(pedidoService.pedidosPorEstado(estado.toUpperCase()));
    }

    // ==========================================
    // CAMBIAR ESTADO
    // ==========================================

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> datos) {
        try {
            String nuevoEstado = datos.get("estado");
            if (nuevoEstado == null || nuevoEstado.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Debe especificar el nuevo estado");
                return ResponseEntity.badRequest().body(error);
            }
            
            Pedido pedido = pedidoService.cambiarEstado(id, nuevoEstado.toUpperCase());
            return ResponseEntity.ok(pedido);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/entregar")
    public ResponseEntity<?> marcarEntregado(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(pedidoService.marcarEntregado(id));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/pagar")
    public ResponseEntity<?> marcarPagado(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(pedidoService.marcarPagado(id));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarPedido(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(pedidoService.cancelarPedido(id));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // 🔥 ANULAR PEDIDO CON MOTIVO
    // ==========================================

    @PutMapping("/{id}/anular")
    public ResponseEntity<?> anularPedido(@PathVariable Long id, @RequestBody Map<String, String> datos) {
        try {
            String motivo = datos.get("motivo");
            String usuario = datos.get("usuario");
            
            if (motivo == null || motivo.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Debe especificar el motivo de anulación");
                return ResponseEntity.badRequest().body(error);
            }
            
            Pedido pedido = pedidoService.anularPedido(id, motivo, usuario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Pedido anulado correctamente");
            response.put("pedido", pedido);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // ELIMINAR
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            pedidoService.eliminar(id);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Pedido eliminado");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        return ResponseEntity.ok(pedidoService.obtenerEstadisticas());
    }
}