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

@RestController
@RequestMapping("/api/caja")
@CrossOrigin(origins = "*")
public class CajaController {

    @Autowired
    private CajaService cajaService;

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
            response.put("totalYape", cajaAbierta.getTotalYape());
            response.put("totalPlin", cajaAbierta.getTotalPlin());
            response.put("totalTarjeta", cajaAbierta.getTotalTarjeta());
            response.put("totalGastos", cajaAbierta.getTotalEgresos());
            response.put("responsable", cajaAbierta.getResponsable());
        } else {
            response.put("cajaAbierta", false);
            response.put("mensaje", "No hay caja abierta");
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/abrir")
    public ResponseEntity<?> abrirCaja(@RequestBody Map<String, Object> datos) {
        try {
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

    @PostMapping("/gasto")
    public ResponseEntity<?> registrarGasto(@RequestBody Map<String, Object> datos) {
        try {
            String concepto = (String) datos.get("concepto");
            BigDecimal monto = new BigDecimal(datos.get("monto").toString());
            String registradoPor = (String) datos.get("registradoPor");

            if (concepto == null || concepto.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El concepto es obligatorio");
                return ResponseEntity.badRequest().body(error);
            }

            if (monto.compareTo(BigDecimal.ZERO) <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El monto debe ser mayor a 0");
                return ResponseEntity.badRequest().body(error);
            }

            MovimientoCaja movimiento = cajaService.registrarGasto(concepto, monto, registradoPor);

            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Gasto registrado correctamente");
            response.put("movimiento", movimiento);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/venta")
    public ResponseEntity<?> registrarVenta(@RequestBody Map<String, Object> datos) {
        try {
            Integer numeroMesa = null;
            if (datos.containsKey("numeroMesa")) {
                numeroMesa = Integer.parseInt(datos.get("numeroMesa").toString());
            }
            
            BigDecimal monto = new BigDecimal(datos.get("monto").toString());
            String metodoPago = (String) datos.get("metodoPago");
            
            BigDecimal montoRecibido = null;
            if (datos.containsKey("montoRecibido")) {
                montoRecibido = new BigDecimal(datos.get("montoRecibido").toString());
            }
            
            BigDecimal vuelto = null;
            if (datos.containsKey("vuelto")) {
                vuelto = new BigDecimal(datos.get("vuelto").toString());
            }
            
            String registradoPor = (String) datos.get("registradoPor");
            
            MovimientoCaja movimiento = cajaService.registrarVenta(
                numeroMesa, monto, metodoPago, montoRecibido, vuelto, registradoPor
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Venta registrada en caja");
            response.put("movimiento", movimiento);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/cerrar")
    public ResponseEntity<?> cerrarCaja(@RequestBody Map<String, Object> datos) {
        try {
            BigDecimal montoFinal = new BigDecimal(datos.get("montoFinal").toString());
            String responsable = (String) datos.get("responsable");
            
            Caja caja = cajaService.cerrarCaja(montoFinal, responsable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Caja cerrada correctamente");
            response.put("caja", caja);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/actual")
    public ResponseEntity<?> obtenerCajaActual() {
        Caja caja = cajaService.obtenerCajaAbierta();
        if (caja != null) {
            return ResponseEntity.ok(caja);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "No hay caja abierta");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/movimientos")
    public ResponseEntity<List<MovimientoCaja>> obtenerMovimientos() {
        List<MovimientoCaja> movimientos = cajaService.obtenerMovimientosCajaActual();
        return ResponseEntity.ok(movimientos);
    }

    @GetMapping("/historial")
    public ResponseEntity<List<Caja>> obtenerHistorial() {
        List<Caja> cajas = cajaService.listarCajasCerradas();
        return ResponseEntity.ok(cajas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerCajaPorId(@PathVariable Long id) {
        try {
            Caja caja = cajaService.obtenerCajaPorId(id);
            return ResponseEntity.ok(caja);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        Map<String, Object> estadisticas = cajaService.obtenerEstadisticas();
        return ResponseEntity.ok(estadisticas);
    }
}