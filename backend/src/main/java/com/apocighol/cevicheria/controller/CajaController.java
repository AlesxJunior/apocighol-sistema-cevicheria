package com.apocighol.cevicheria.controller;

import com.apocighol.cevicheria.model.Caja;
import com.apocighol.cevicheria.model.MovimientoCaja;
import com.apocighol.cevicheria.service.CajaService;
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
 * CAJA CONTROLLER
 * API REST: /api/caja
 * 
 * 🔥 Endpoints para estado de caja y registro de ventas
 * ==========================================
 */
@RestController
@RequestMapping("/api/caja")
@CrossOrigin(origins = "*")
public class CajaController {

    @Autowired
    private CajaService cajaService;

    // ==========================================
    // 🔥 VERIFICAR ESTADO DE CAJA
    // ==========================================

    /**
     * GET /api/caja/estado
     * Verifica si hay una caja abierta
     */
    @GetMapping("/estado")
    public ResponseEntity<Map<String, Object>> verificarEstado() {
        Map<String, Object> response = new HashMap<>();
        
        Caja cajaAbierta = cajaService.obtenerCajaAbierta();
        
        if (cajaAbierta != null) {
            response.put("cajaAbierta", true);
            response.put("idCaja", cajaAbierta.getIdCaja());
            response.put("codigoCaja", cajaAbierta.getCodigoCaja());
            response.put("montoInicial", cajaAbierta.getMontoInicial());
            response.put("totalVentas", cajaAbierta.getTotalVentas());
            response.put("totalEfectivo", cajaAbierta.getTotalEfectivo());
            response.put("fechaApertura", cajaAbierta.getFechaApertura());
            response.put("horaApertura", cajaAbierta.getHoraApertura());
        } else {
            response.put("cajaAbierta", false);
            response.put("mensaje", "No hay caja abierta");
        }
        
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // ABRIR CAJA
    // ==========================================

    /**
     * POST /api/caja/abrir
     * Abre una nueva caja
     */
    @PostMapping("/abrir")
    public ResponseEntity<?> abrirCaja(@RequestBody Map<String, Object> datos) {
        try {
            // Verificar si ya hay caja abierta
            if (cajaService.hayCajaAbierta()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Ya existe una caja abierta");
                return ResponseEntity.badRequest().body(error);
            }
            
            BigDecimal montoInicial = BigDecimal.ZERO;
            if (datos.containsKey("montoInicial")) {
                montoInicial = new BigDecimal(datos.get("montoInicial").toString());
            }
            
            String responsable = (String) datos.get("responsable");
            if (responsable == null || responsable.trim().isEmpty()) {
                responsable = "Sistema";
            }
            
            Caja caja = cajaService.abrirCaja(montoInicial, responsable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Caja abierta correctamente");
            response.put("caja", caja);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // 🔥 REGISTRAR VENTA EN CAJA
    // ==========================================

    /**
     * POST /api/caja/venta
     * Registra una venta en la caja abierta
     */
    @PostMapping("/venta")
    public ResponseEntity<?> registrarVenta(@RequestBody Map<String, Object> datos) {
        try {
            // Verificar caja abierta
            if (!cajaService.hayCajaAbierta()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "No hay caja abierta. Debe abrir la caja primero.");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Obtener datos
            Integer numeroMesa = null;
            if (datos.containsKey("numeroMesa")) {
                numeroMesa = Integer.valueOf(datos.get("numeroMesa").toString());
            }
            
            BigDecimal monto = BigDecimal.ZERO;
            if (datos.containsKey("monto")) {
                monto = new BigDecimal(datos.get("monto").toString());
            }
            
            String metodoPago = (String) datos.get("metodoPago");
            if (metodoPago == null) metodoPago = "Efectivo";
            
            String registradoPor = (String) datos.get("registradoPor");
            if (registradoPor == null) registradoPor = "Sistema";
            
            BigDecimal montoRecibido = monto;
            if (datos.containsKey("montoRecibido")) {
                montoRecibido = new BigDecimal(datos.get("montoRecibido").toString());
            }
            
            BigDecimal vuelto = BigDecimal.ZERO;
            if (datos.containsKey("vuelto")) {
                vuelto = new BigDecimal(datos.get("vuelto").toString());
            }
            
            // Registrar venta
            MovimientoCaja movimiento = cajaService.registrarVenta(
                numeroMesa, monto, metodoPago, montoRecibido, vuelto, registradoPor
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Venta registrada correctamente");
            response.put("movimiento", movimiento);
            response.put("totalCaja", cajaService.obtenerCajaAbierta().getTotalVentas());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // CERRAR CAJA
    // ==========================================

    /**
     * POST /api/caja/cerrar
     * Cierra la caja actual
     */
    @PostMapping("/cerrar")
    public ResponseEntity<?> cerrarCaja(@RequestBody Map<String, Object> datos) {
        try {
            if (!cajaService.hayCajaAbierta()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "No hay caja abierta para cerrar");
                return ResponseEntity.badRequest().body(error);
            }
            
            BigDecimal montoFinal = BigDecimal.ZERO;
            if (datos.containsKey("montoFinal")) {
                montoFinal = new BigDecimal(datos.get("montoFinal").toString());
            }
            
            String responsable = (String) datos.get("responsable");
            
            Caja cajaCerrada = cajaService.cerrarCaja(montoFinal, responsable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Caja cerrada correctamente");
            response.put("caja", cajaCerrada);
            response.put("totalVentas", cajaCerrada.getTotalVentas());
            response.put("diferencia", cajaCerrada.getDiferencia());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // OBTENER CAJA ACTUAL
    // ==========================================

    /**
     * GET /api/caja/actual
     * Obtiene la caja abierta actual con sus movimientos
     */
    @GetMapping("/actual")
    public ResponseEntity<?> obtenerCajaActual() {
        Caja caja = cajaService.obtenerCajaAbierta();
        
        if (caja == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("cajaAbierta", false);
            response.put("mensaje", "No hay caja abierta");
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.ok(caja);
    }

    // ==========================================
    // MOVIMIENTOS DEL DÍA
    // ==========================================

    /**
     * GET /api/caja/movimientos
     * Lista movimientos de la caja actual
     */
    @GetMapping("/movimientos")
    public ResponseEntity<?> listarMovimientos() {
        if (!cajaService.hayCajaAbierta()) {
            return ResponseEntity.ok(List.of());
        }
        
        List<MovimientoCaja> movimientos = cajaService.obtenerMovimientosCajaActual();
        return ResponseEntity.ok(movimientos);
    }

    // ==========================================
    // HISTORIAL DE CAJAS
    // ==========================================

    /**
     * GET /api/caja/historial
     * Lista todas las cajas (abiertas y cerradas)
     */
    @GetMapping("/historial")
    public ResponseEntity<List<Caja>> listarHistorial() {
        return ResponseEntity.ok(cajaService.listarTodas());
    }

    /**
     * GET /api/caja/{id}
     * Obtiene una caja por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return cajaService.buscarPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    /**
     * GET /api/caja/estadisticas
     * Obtiene estadísticas de caja
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        return ResponseEntity.ok(cajaService.obtenerEstadisticas());
    }
}