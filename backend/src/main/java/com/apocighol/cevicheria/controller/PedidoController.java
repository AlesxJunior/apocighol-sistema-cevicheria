package com.apocighol.cevicheria.controller;

import com.apocighol.cevicheria.model.Pedido;
import com.apocighol.cevicheria.model.PedidoProducto;
import com.apocighol.cevicheria.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ==========================================
 * PEDIDO CONTROLLER
 * API REST: /api/pedidos
 * 🔥 ACTUALIZADO: Endpoints por rol (COCINA, MESERO, ADMIN)
 * ==========================================
 */
@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    // ==========================================
    // 🔥 ENDPOINTS POR ROL
    // ==========================================

    /**
     * GET /api/pedidos/cocina
     * COCINA: Solo pedidos activos del día (pendiente, preparando, listo, servido)
     */
    @GetMapping("/cocina")
    public ResponseEntity<List<Pedido>> listarParaCocina() {
        return ResponseEntity.ok(pedidoService.obtenerParaCocina());
    }

    /**
     * GET /api/pedidos/mesero/{nombreMesero}
     * MESERO: Solo sus pedidos activos del día
     */
    @GetMapping("/mesero/{nombreMesero}")
    public ResponseEntity<List<Pedido>> listarParaMesero(@PathVariable String nombreMesero) {
        return ResponseEntity.ok(pedidoService.obtenerParaMesero(nombreMesero));
    }

    /**
     * GET /api/pedidos/admin
     * ADMIN: Todos los pedidos del día (incluye cobrados)
     */
    @GetMapping("/admin")
    public ResponseEntity<List<Pedido>> listarParaAdmin() {
        return ResponseEntity.ok(pedidoService.obtenerParaAdmin());
    }

    /**
     * GET /api/pedidos/admin/estado/{estado}
     * ADMIN: Pedidos del día filtrados por estado
     */
    @GetMapping("/admin/estado/{estado}")
    public ResponseEntity<List<Pedido>> listarParaAdminPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(pedidoService.obtenerParaAdminPorEstado(estado));
    }

    // ==========================================
    // ENDPOINTS CRUD GENERALES
    // ==========================================

    // GET /api/pedidos - Listar todos (activos)
    @GetMapping
    public ResponseEntity<List<Pedido>> listarTodos() {
        return ResponseEntity.ok(pedidoService.obtenerTodos());
    }

    // GET /api/pedidos/{id} - Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return pedidoService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/pedidos/codigo/{codigo} - Obtener por código
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<?> obtenerPorCodigo(@PathVariable String codigo) {
        return pedidoService.obtenerPorCodigo(codigo)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/pedidos - Crear nuevo pedido
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> datos) {
        try {
            Pedido pedido = new Pedido();
            
            pedido.setNumeroMesa((Integer) datos.get("mesa"));
            pedido.setNombreMesero((String) datos.get("mesero"));
            pedido.setNotaPedido((String) datos.get("nota"));
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> productosData = (List<Map<String, Object>>) datos.get("productos");
            
            if (productosData != null) {
                for (Map<String, Object> prodData : productosData) {
                    PedidoProducto producto = new PedidoProducto();
                    producto.setNombreProducto((String) prodData.get("nombre"));
                    producto.setCantidad((Integer) prodData.get("cantidad"));
                    
                    Object precioObj = prodData.get("precioUnitario");
                    if (precioObj instanceof Number) {
                        producto.setPrecioUnitario(BigDecimal.valueOf(((Number) precioObj).doubleValue()));
                    }
                    
                    Object subtotalObj = prodData.get("subtotal");
                    if (subtotalObj instanceof Number) {
                        producto.setSubtotal(BigDecimal.valueOf(((Number) subtotalObj).doubleValue()));
                    }
                    
                    producto.setNotaProducto((String) prodData.get("nota"));
                    pedido.agregarProducto(producto);
                }
            }
            
            Pedido nuevoPedido = pedidoService.crear(pedido);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPedido);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // PUT /api/pedidos/{id} - Actualizar pedido
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Pedido pedido) {
        try {
            Pedido actualizado = pedidoService.actualizar(id, pedido);
            return ResponseEntity.ok(actualizado);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // DELETE /api/pedidos/{id} - Eliminar pedido
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            pedidoService.eliminar(id);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Pedido eliminado correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // ENDPOINTS DE CAMBIO DE ESTADO
    // ==========================================

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> datos) {
        try {
            String nuevoEstado = datos.get("estado");
            Pedido pedido = pedidoService.cambiarEstado(id, nuevoEstado);
            return ResponseEntity.ok(pedido);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/preparando")
    public ResponseEntity<?> marcarPreparando(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(pedidoService.marcarPreparando(id));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/listo")
    public ResponseEntity<?> marcarListo(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(pedidoService.marcarListo(id));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/servido")
    public ResponseEntity<?> marcarServido(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(pedidoService.marcarServido(id));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // 🔥 ENDPOINT DE ANULACIÓN
    // ==========================================

    @PutMapping("/{id}/anular")
    public ResponseEntity<?> anularPedido(@PathVariable Long id, @RequestBody Map<String, String> datos) {
        try {
            String motivo = datos.get("motivo");
            String usuario = datos.get("usuario");
            
            if (motivo == null || motivo.trim().isEmpty()) {
                throw new RuntimeException("Debe especificar un motivo de anulación");
            }
            if (usuario == null || usuario.trim().isEmpty()) {
                throw new RuntimeException("Debe especificar quién anula el pedido");
            }
            
            Pedido pedido = pedidoService.anularPedido(id, motivo, usuario);
            return ResponseEntity.ok(pedido);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // 🔥 ENDPOINT PARA COBRAR MESA
    // ==========================================

    @PutMapping("/mesa/{numeroMesa}/cobrar")
    public ResponseEntity<?> cobrarMesa(@PathVariable Integer numeroMesa) {
        try {
            pedidoService.cobrarPedidosDeMesa(numeroMesa);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Pedidos de mesa " + numeroMesa + " marcados como cobrados");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // ENDPOINTS DE CONSULTA POR FILTROS
    // ==========================================

    @GetMapping("/mesa/{numeroMesa}")
    public ResponseEntity<List<Pedido>> obtenerPorMesa(@PathVariable Integer numeroMesa) {
        return ResponseEntity.ok(pedidoService.obtenerPorMesa(numeroMesa));
    }

    @GetMapping("/mesa/{numeroMesa}/activos")
    public ResponseEntity<List<Pedido>> obtenerActivosPorMesa(@PathVariable Integer numeroMesa) {
        return ResponseEntity.ok(pedidoService.obtenerActivosPorMesa(numeroMesa));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Pedido>> obtenerPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(pedidoService.obtenerPorEstado(estado));
    }

    @GetMapping("/hoy")
    public ResponseEntity<List<Pedido>> obtenerDeHoy() {
        return ResponseEntity.ok(pedidoService.obtenerDeHoy());
    }

    // ==========================================
    // 🔥 ENDPOINTS DE REPORTES - ANULADOS
    // ==========================================

    @GetMapping("/anulados")
    public ResponseEntity<List<Pedido>> obtenerAnulados() {
        return ResponseEntity.ok(pedidoService.obtenerAnulados());
    }

    @GetMapping("/anulados/fecha/{fecha}")
    public ResponseEntity<List<Pedido>> obtenerAnuladosPorFecha(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(pedidoService.obtenerAnuladosPorFecha(fecha));
    }

    @GetMapping("/anulados/rango")
    public ResponseEntity<List<Pedido>> obtenerAnuladosEntreFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(pedidoService.obtenerAnuladosEntreFechas(inicio, fin));
    }

    @GetMapping("/anulados/usuario/{usuario}")
    public ResponseEntity<List<Pedido>> obtenerAnuladosPorUsuario(@PathVariable String usuario) {
        return ResponseEntity.ok(pedidoService.obtenerAnuladosPorUsuario(usuario));
    }

    // ==========================================
    // 🔥 ENDPOINTS DE COBRADOS
    // ==========================================

    @GetMapping("/cobrados/hoy")
    public ResponseEntity<List<Pedido>> obtenerCobradosHoy() {
        return ResponseEntity.ok(pedidoService.obtenerCobradosHoy());
    }

    // ==========================================
    // ESTADÍSTICAS / RESUMEN
    // ==========================================

    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumen() {
        Map<String, Object> resumen = new HashMap<>();
        resumen.put("pendientes", pedidoService.contarPorEstado("pendiente"));
        resumen.put("preparando", pedidoService.contarPorEstado("preparando"));
        resumen.put("listos", pedidoService.contarPorEstado("listo"));
        resumen.put("servidos", pedidoService.contarPorEstado("servido"));
        resumen.put("cobrados", pedidoService.contarPorEstado("cobrado"));
        resumen.put("anulados", pedidoService.contarPorEstado("anulado"));
        resumen.put("totalHoy", pedidoService.contarDeHoy());
        resumen.put("anuladosHoy", pedidoService.contarAnuladosHoy());
        return ResponseEntity.ok(resumen);
    }
}