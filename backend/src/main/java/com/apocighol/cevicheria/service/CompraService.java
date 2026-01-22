package com.apocighol.cevicheria.service;

import com.apocighol.cevicheria.model.Compra;
import com.apocighol.cevicheria.model.CompraDetalle;
import com.apocighol.cevicheria.repository.CompraRepository;
import com.apocighol.cevicheria.repository.CompraDetalleRepository;
import com.apocighol.cevicheria.repository.ProveedorRepository;
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
 * COMPRA SERVICE
 * 
 * 🔥 AL REGISTRAR COMPRA → AUMENTA STOCK AUTOMÁTICAMENTE
 * 🔥 CORREGIDO: Guarda correctamente los detalles
 * ==========================================
 */
@Service
@Transactional
public class CompraService {

    @Autowired
    private CompraRepository compraRepository;

    @Autowired
    private CompraDetalleRepository compraDetalleRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    @Autowired
    private InsumoService insumoService;

    // ==========================================
    // 🔥 REGISTRAR COMPRA (AUMENTA STOCK)
    // ==========================================

    /**
     * Registra una compra y aumenta el stock de insumos automáticamente
     * 
     * @param idProveedor ID del proveedor
     * @param detalles Lista de detalles [{idInsumo, cantidad, precioUnitario}]
     * @param observaciones Notas opcionales
     * @return La compra registrada
     */
    public Compra registrarCompra(Long idProveedor, List<Map<String, Object>> detalles, String observaciones) {
        
        // Validar proveedor
        if (!proveedorRepository.existsById(idProveedor)) {
            throw new RuntimeException("Proveedor no encontrado: " + idProveedor);
        }

        // Crear la compra
        Compra compra = new Compra();
        compra.setCodigoCompra("COMP-" + System.currentTimeMillis());
        compra.setIdProveedor(idProveedor);
        compra.setFechaCompra(LocalDate.now());
        compra.setHoraCompra(LocalTime.now());
        compra.setObservaciones(observaciones);
        compra.setTotalCompra(BigDecimal.ZERO);

        // 🔥 GUARDAR COMPRA PRIMERO para obtener el ID
        Compra compraGuardada = compraRepository.save(compra);
        System.out.println("✅ Compra creada: " + compraGuardada.getCodigoCompra());

        BigDecimal totalCompra = BigDecimal.ZERO;

        // Procesar cada detalle
        for (Map<String, Object> item : detalles) {
            Long idInsumo = Long.valueOf(item.get("idInsumo").toString());
            BigDecimal cantidad = new BigDecimal(item.get("cantidad").toString());
            BigDecimal precioUnitario = new BigDecimal(item.get("precioUnitario").toString());
            BigDecimal subtotal = cantidad.multiply(precioUnitario);

            // Crear detalle
            CompraDetalle detalle = new CompraDetalle();
            detalle.setIdCompra(compraGuardada.getIdCompra());
            detalle.setIdInsumo(idInsumo);
            detalle.setCantidad(cantidad);
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setSubtotal(subtotal);

            // 🔥 GUARDAR DETALLE
            compraDetalleRepository.save(detalle);
            System.out.println("   📦 Detalle guardado: Insumo " + idInsumo + " x " + cantidad);

            totalCompra = totalCompra.add(subtotal);

            // 🔥 AUMENTAR STOCK DEL INSUMO
            try {
                insumoService.aumentarStock(idInsumo, cantidad);
                System.out.println("   📈 Stock aumentado: Insumo " + idInsumo + " + " + cantidad);
            } catch (Exception e) {
                System.err.println("   ⚠️ Error aumentando stock: " + e.getMessage());
            }
        }

        // Actualizar total de la compra
        compraGuardada.setTotalCompra(totalCompra);
        compraRepository.save(compraGuardada);

        System.out.println("✅ Compra registrada: " + compraGuardada.getCodigoCompra() + 
                          " | Total: S/. " + totalCompra);

        return compraGuardada;
    }

    // ==========================================
    // CONSULTAS
    // ==========================================

    /**
     * Lista todas las compras (más recientes primero)
     */
    public List<Compra> listarTodas() {
        return compraRepository.findAllByOrderByFechaCompraDescHoraCompraDesc();
    }

    /**
     * Buscar compra por ID
     */
    public Optional<Compra> buscarPorId(Long id) {
        return compraRepository.findById(id);
    }

    /**
     * 🔥 Buscar compra por ID con detalles cargados
     */
    public Optional<Compra> buscarPorIdConDetalles(Long id) {
        Optional<Compra> compraOpt = compraRepository.findById(id);
        if (compraOpt.isPresent()) {
            Compra compra = compraOpt.get();
            // Forzar carga de detalles
            compra.getDetalles().size();
            return Optional.of(compra);
        }
        return Optional.empty();
    }

    /**
     * Buscar por código
     */
    public Optional<Compra> buscarPorCodigo(String codigo) {
        return compraRepository.findByCodigoCompra(codigo);
    }

    /**
     * Compras del día
     */
    public List<Compra> comprasDelDia() {
        return compraRepository.findByFechaCompra(LocalDate.now());
    }

    /**
     * Compras entre fechas
     */
    public List<Compra> comprasEntreFechas(LocalDate inicio, LocalDate fin) {
        return compraRepository.findByFechaCompraBetweenOrderByFechaCompraDesc(inicio, fin);
    }

    /**
     * Compras de un proveedor
     */
    public List<Compra> comprasDeProveedor(Long idProveedor) {
        return compraRepository.findByIdProveedorOrderByFechaCompraDesc(idProveedor);
    }

    // ==========================================
    // TOTALES
    // ==========================================

    /**
     * Total de compras del día
     */
    public BigDecimal totalComprasHoy() {
        BigDecimal total = compraRepository.sumTotalByFecha(LocalDate.now());
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Total de compras entre fechas
     */
    public BigDecimal totalComprasEntreFechas(LocalDate inicio, LocalDate fin) {
        BigDecimal total = compraRepository.sumTotalEntreFechas(inicio, fin);
        return total != null ? total : BigDecimal.ZERO;
    }

    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    /**
     * Obtener estadísticas de compras
     */
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        
        LocalDate hoy = LocalDate.now();
        LocalDate inicioMes = hoy.withDayOfMonth(1);
        
        stats.put("totalCompras", compraRepository.count());
        stats.put("comprasHoy", compraRepository.countByFechaCompra(hoy));
        stats.put("totalGastadoHoy", totalComprasHoy());
        stats.put("totalGastadoMes", totalComprasEntreFechas(inicioMes, hoy));
        
        return stats;
    }
}