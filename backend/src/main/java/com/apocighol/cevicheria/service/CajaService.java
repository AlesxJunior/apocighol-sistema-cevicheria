package com.apocighol.cevicheria.service;

import com.apocighol.cevicheria.model.Caja;
import com.apocighol.cevicheria.model.MovimientoCaja;
import com.apocighol.cevicheria.repository.CajaRepository;
import com.apocighol.cevicheria.repository.MovimientoCajaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * ==========================================
 * CAJA SERVICE
 * 
 * 🔥 Gestión completa de caja registradora
 * ==========================================
 */
@Service
@Transactional
public class CajaService {

    @Autowired
    private CajaRepository cajaRepository;

    @Autowired
    private MovimientoCajaRepository movimientoCajaRepository;

    // ==========================================
    // VERIFICAR ESTADO
    // ==========================================

    /**
     * Verifica si hay una caja abierta
     */
    public boolean hayCajaAbierta() {
        return cajaRepository.findByEstadoCaja("ABIERTA").isPresent();
    }

    /**
     * Obtiene la caja abierta actual
     */
    public Caja obtenerCajaAbierta() {
        return cajaRepository.findByEstadoCaja("ABIERTA").orElse(null);
    }

    // ==========================================
    // ABRIR CAJA
    // ==========================================

    /**
     * Abre una nueva caja
     */
    public Caja abrirCaja(BigDecimal montoInicial, String responsable) {
        // Verificar que no haya caja abierta
        if (hayCajaAbierta()) {
            throw new RuntimeException("Ya existe una caja abierta. Ciérrela antes de abrir otra.");
        }

        Caja caja = new Caja();
        caja.setCodigoCaja("CAJA-" + System.currentTimeMillis());
        caja.setFechaApertura(LocalDate.now());
        caja.setHoraApertura(LocalTime.now());
        caja.setMontoInicial(montoInicial != null ? montoInicial : BigDecimal.ZERO);
        caja.setTotalVentas(BigDecimal.ZERO);
        caja.setTotalEfectivo(BigDecimal.ZERO);
        caja.setTotalYape(BigDecimal.ZERO);
        caja.setTotalPlin(BigDecimal.ZERO);
        caja.setTotalTarjeta(BigDecimal.ZERO);
        caja.setTotalEgresos(BigDecimal.ZERO);
        caja.setEstadoCaja("ABIERTA");
        caja.setResponsable(responsable);

        Caja cajaGuardada = cajaRepository.save(caja);
        System.out.println("✅ Caja abierta: " + cajaGuardada.getCodigoCaja() + 
                          " | Monto inicial: S/. " + montoInicial);
        
        return cajaGuardada;
    }

    // ==========================================
    // 🔥 REGISTRAR VENTA
    // ==========================================

    /**
     * Registra una venta en la caja abierta
     */
    public MovimientoCaja registrarVenta(Integer numeroMesa, BigDecimal monto, 
                                         String metodoPago, BigDecimal montoRecibido,
                                         BigDecimal vuelto, String registradoPor) {
        
        Caja caja = obtenerCajaAbierta();
        if (caja == null) {
            throw new RuntimeException("No hay caja abierta para registrar la venta");
        }

        // Crear movimiento
        MovimientoCaja movimiento = new MovimientoCaja();
        movimiento.setIdCaja(caja.getIdCaja());
        movimiento.setTipoMovimiento("VENTA");
        movimiento.setDescripcion("Venta Mesa " + (numeroMesa != null ? numeroMesa : "N/A"));
        movimiento.setMonto(monto);
        movimiento.setMetodoPago(metodoPago);
        movimiento.setMontoRecibido(montoRecibido);
        movimiento.setVuelto(vuelto);
        movimiento.setFechaMovimiento(LocalDate.now());
        movimiento.setHoraMovimiento(LocalTime.now());
        movimiento.setRegistradoPor(registradoPor);

        MovimientoCaja movimientoGuardado = movimientoCajaRepository.save(movimiento);

        // Actualizar totales de caja
        caja.setTotalVentas(caja.getTotalVentas().add(monto));
        
        switch (metodoPago.toLowerCase()) {
            case "efectivo":
                caja.setTotalEfectivo(caja.getTotalEfectivo().add(monto));
                break;
            case "yape":
                caja.setTotalYape(caja.getTotalYape().add(monto));
                break;
            case "plin":
                caja.setTotalPlin(caja.getTotalPlin().add(monto));
                break;
            case "tarjeta":
                caja.setTotalTarjeta(caja.getTotalTarjeta().add(monto));
                break;
        }

        cajaRepository.save(caja);

        System.out.println("💵 Venta registrada: Mesa " + numeroMesa + 
                          " | S/. " + monto + " (" + metodoPago + ")");
        
        return movimientoGuardado;
    }

    /**
     * Registra un egreso/gasto
     */
    public MovimientoCaja registrarEgreso(String descripcion, BigDecimal monto, String registradoPor) {
        Caja caja = obtenerCajaAbierta();
        if (caja == null) {
            throw new RuntimeException("No hay caja abierta para registrar el egreso");
        }

        MovimientoCaja movimiento = new MovimientoCaja();
        movimiento.setIdCaja(caja.getIdCaja());
        movimiento.setTipoMovimiento("EGRESO");
        movimiento.setDescripcion(descripcion);
        movimiento.setMonto(monto.negate()); // Negativo para egresos
        movimiento.setMetodoPago("Efectivo");
        movimiento.setFechaMovimiento(LocalDate.now());
        movimiento.setHoraMovimiento(LocalTime.now());
        movimiento.setRegistradoPor(registradoPor);

        MovimientoCaja movimientoGuardado = movimientoCajaRepository.save(movimiento);

        // Actualizar totales
        caja.setTotalEgresos(caja.getTotalEgresos().add(monto));
        cajaRepository.save(caja);

        System.out.println("📤 Egreso registrado: " + descripcion + " | S/. " + monto);
        
        return movimientoGuardado;
    }

    /**
     * Registra un gasto en la caja actual
     */
    public MovimientoCaja registrarGasto(String concepto, BigDecimal monto, String registradoPor) {
        Caja caja = obtenerCajaAbierta();
        if (caja == null) {
            throw new RuntimeException("No hay caja abierta para registrar el gasto");
        }

        MovimientoCaja movimiento = new MovimientoCaja();
        movimiento.setIdCaja(caja.getIdCaja());
        movimiento.setTipoMovimiento("GASTO");
        movimiento.setDescripcion(concepto);
        movimiento.setMonto(monto);
        movimiento.setMetodoPago("Efectivo");
        movimiento.setFechaMovimiento(LocalDate.now());
        movimiento.setHoraMovimiento(LocalTime.now());
        movimiento.setRegistradoPor(registradoPor);

        MovimientoCaja movimientoGuardado = movimientoCajaRepository.save(movimiento);

        // Actualizar total de gastos
        caja.setTotalEgresos(caja.getTotalEgresos().add(monto));
        cajaRepository.save(caja);

        System.out.println("💸 Gasto registrado: " + concepto + " | S/. " + monto);
        
        return movimientoGuardado;
    }

    // ==========================================
    // CERRAR CAJA
    // ==========================================

    /**
     * Cierra la caja actual
     */
    public Caja cerrarCaja(BigDecimal montoFinal, String responsable) {
        Caja caja = obtenerCajaAbierta();
        if (caja == null) {
            throw new RuntimeException("No hay caja abierta para cerrar");
        }

        caja.setFechaCierre(LocalDate.now());
        caja.setHoraCierre(LocalTime.now());
        caja.setMontoFinal(montoFinal);
        caja.setEstadoCaja("CERRADA");
        
        if (responsable != null && !responsable.trim().isEmpty()) {
            caja.setResponsable(responsable);
        }

        // Calcular diferencia
        BigDecimal montoEsperado = caja.getMontoInicial()
            .add(caja.getTotalEfectivo())
            .subtract(caja.getTotalEgresos());
        
        caja.setDiferencia(montoFinal.subtract(montoEsperado));

        Caja cajaCerrada = cajaRepository.save(caja);

        System.out.println("🔒 Caja cerrada: " + cajaCerrada.getCodigoCaja() + 
                          " | Total ventas: S/. " + cajaCerrada.getTotalVentas() +
                          " | Diferencia: S/. " + cajaCerrada.getDiferencia());
        
        return cajaCerrada;
    }

    // ==========================================
    // CONSULTAS
    // ==========================================

    /**
     * Lista todas las cajas
     */
    public List<Caja> listarTodas() {
        return cajaRepository.findAllByOrderByFechaAperturaDescHoraAperturaDesc();
    }

    /**
     * Buscar por ID
     */
    public Optional<Caja> buscarPorId(Long id) {
        return cajaRepository.findById(id);
    }

    /**
     * Obtener movimientos de la caja actual
     */
    public List<MovimientoCaja> obtenerMovimientosCajaActual() {
        Caja caja = obtenerCajaAbierta();
        if (caja == null) {
            return List.of();
        }
        return movimientoCajaRepository.findByIdCajaOrderByHoraMovimientoDesc(caja.getIdCaja());
    }

    /**
     * Cajas del día
     */
    public List<Caja> cajasDelDia() {
        return cajaRepository.findByFechaApertura(LocalDate.now());
    }

    /**
     * Lista todas las cajas cerradas
     */
    public List<Caja> listarCajasCerradas() {
        return cajaRepository.findAllByEstadoCajaOrderByFechaAperturaDesc("CERRADA");
    }

    /**
     * Obtiene una caja por su ID
     */
    public Caja obtenerCajaPorId(Long id) {
        return cajaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Caja no encontrada con ID: " + id));
    }

    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    /**
     * Obtiene estadísticas de caja
     */
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        
        Caja cajaActual = obtenerCajaAbierta();
        
        if (cajaActual != null) {
            stats.put("cajaAbierta", true);
            stats.put("totalVentas", cajaActual.getTotalVentas());
            stats.put("totalEfectivo", cajaActual.getTotalEfectivo());
            stats.put("totalYape", cajaActual.getTotalYape());
            stats.put("totalPlin", cajaActual.getTotalPlin());
            stats.put("totalTarjeta", cajaActual.getTotalTarjeta());
            stats.put("totalEgresos", cajaActual.getTotalEgresos());
            stats.put("cantidadMovimientos", movimientoCajaRepository.countByIdCaja(cajaActual.getIdCaja()));
        } else {
            stats.put("cajaAbierta", false);
            stats.put("totalVentas", BigDecimal.ZERO);
        }
        
        // Ventas del día (todas las cajas)
        BigDecimal ventasHoy = cajaRepository.sumVentasByFecha(LocalDate.now());
        stats.put("ventasHoy", ventasHoy != null ? ventasHoy : BigDecimal.ZERO);
        
        return stats;
    }
}