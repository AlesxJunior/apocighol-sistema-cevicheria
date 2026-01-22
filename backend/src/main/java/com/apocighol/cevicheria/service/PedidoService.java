package com.apocighol.cevicheria.service;

import com.apocighol.cevicheria.model.Pedido;
import com.apocighol.cevicheria.model.DetallePedido;
import com.apocighol.cevicheria.repository.PedidoRepository;
import com.apocighol.cevicheria.repository.DetallePedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * ==========================================
 * PEDIDO SERVICE
 * 
 * 🔥 Incluye métodos por ROL:
 * - pedidosDelDia(): Para ADMIN
 * - pedidosActivosDelDia(): Para COCINA
 * - pedidosPorMeseroDelDia(): Para MESERO
 * ==========================================
 */
@Service
@Transactional
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    // Opcional: si tienes RecetaService para descontar insumos
    // @Autowired
    // private RecetaService recetaService;

    // ==========================================
    // CREAR PEDIDO
    // ==========================================

    public Pedido crearPedido(Integer numeroMesa, String mesero, String nota, List<Map<String, Object>> productos) {
        
        // Generar código único
        String codigoPedido = "PED-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
        
        Pedido pedido = new Pedido();
        pedido.setCodigoPedido(codigoPedido);
        pedido.setNumeroMesa(numeroMesa);
        pedido.setMesero(mesero);
        pedido.setFechaPedido(LocalDate.now());
        pedido.setHoraPedido(LocalTime.now());
        pedido.setEstadoPedido("PENDIENTE");
        pedido.setObservaciones(nota);
        
        BigDecimal totalPedido = BigDecimal.ZERO;
        List<DetallePedido> detalles = new ArrayList<>();
        
        for (Map<String, Object> item : productos) {
            String nombreProducto = (String) item.get("nombre");
            String categoria = item.get("categoria") != null ? (String) item.get("categoria") : "Sin categoría";
            Integer cantidad = Integer.valueOf(item.get("cantidad").toString());
            BigDecimal precioUnitario = new BigDecimal(item.get("precioUnitario").toString());
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
            
            DetallePedido detalle = new DetallePedido();
            detalle.setNombreProducto(nombreProducto);
            detalle.setCantidad(cantidad);
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setSubtotal(subtotal);
            detalle.setPedido(pedido);
            
            detalles.add(detalle);
            totalPedido = totalPedido.add(subtotal);
        }
        
        pedido.setTotalPedido(totalPedido);
        pedido.setDetalles(detalles);
        
        // Guardar
        Pedido pedidoGuardado = pedidoRepository.save(pedido);
        
        // Guardar detalles
        for (DetallePedido detalle : detalles) {
            detalle.setPedido(pedidoGuardado);
            detallePedidoRepository.save(detalle);
        }
        
        System.out.println("✅ Pedido creado: " + codigoPedido + " | Mesa: " + numeroMesa + " | Total: S/. " + totalPedido);
        
        return pedidoGuardado;
    }

    // ==========================================
    // 🔥 CONSULTAS POR ROL
    // ==========================================

    /**
     * Para ADMIN: Todos los pedidos del día (incluye cobrados)
     */
    public List<Pedido> pedidosDelDia() {
        return pedidoRepository.findByFechaPedido(LocalDate.now());
    }

    /**
     * Para COCINA: Solo pedidos activos del día
     * Estados: PENDIENTE, PREPARANDO, LISTO, SERVIDO
     */
    public List<Pedido> pedidosActivosDelDia() {
        List<String> estadosActivos = Arrays.asList("PENDIENTE", "PREPARANDO", "LISTO", "SERVIDO");
        
        return pedidoRepository.findByFechaPedido(LocalDate.now())
            .stream()
            .filter(p -> estadosActivos.contains(p.getEstadoPedido().toUpperCase()))
            .collect(Collectors.toList());
    }

    /**
     * Para MESERO: Solo sus pedidos activos del día
     */
    public List<Pedido> pedidosPorMeseroDelDia(String nombreMesero) {
        List<String> estadosActivos = Arrays.asList("PENDIENTE", "PREPARANDO", "LISTO", "SERVIDO");
        
        return pedidoRepository.findByFechaPedido(LocalDate.now())
            .stream()
            .filter(p -> nombreMesero.equalsIgnoreCase(p.getMesero()))
            .filter(p -> estadosActivos.contains(p.getEstadoPedido().toUpperCase()))
            .collect(Collectors.toList());
    }

    // ==========================================
    // CONSULTAS GENERALES
    // ==========================================

    public List<Pedido> listarTodos() {
        return pedidoRepository.findAllByOrderByFechaPedidoDescHoraPedidoDesc();
    }

    public Optional<Pedido> buscarPorId(Long id) {
        return pedidoRepository.findById(id);
    }

    public Optional<Pedido> buscarPorCodigo(String codigo) {
        return pedidoRepository.findByCodigoPedido(codigo);
    }

    public List<Pedido> pedidosPorMesa(Integer numeroMesa) {
        return pedidoRepository.findByNumeroMesaOrderByHoraPedidoDesc(numeroMesa);
    }

    public List<Pedido> pedidosPendientesMesa(Integer numeroMesa) {
        List<String> estadosPendientes = Arrays.asList("PENDIENTE", "PREPARANDO", "LISTO", "SERVIDO");
        
        return pedidoRepository.findByNumeroMesa(numeroMesa)
            .stream()
            .filter(p -> estadosPendientes.contains(p.getEstadoPedido().toUpperCase()))
            .collect(Collectors.toList());
    }

    public List<Pedido> pedidosPorEstado(String estado) {
        return pedidoRepository.findByEstadoPedido(estado);
    }

    // ==========================================
    // CAMBIAR ESTADO
    // ==========================================

    public Pedido cambiarEstado(Long id, String nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado: " + id));
        
        pedido.setEstadoPedido(nuevoEstado);
        System.out.println("📋 Pedido " + pedido.getCodigoPedido() + " → " + nuevoEstado);
        
        return pedidoRepository.save(pedido);
    }

    public Pedido marcarEntregado(Long id) {
        return cambiarEstado(id, "ENTREGADO");
    }

    public Pedido marcarPagado(Long id) {
        return cambiarEstado(id, "PAGADO");
    }

    public Pedido cancelarPedido(Long id) {
        return cambiarEstado(id, "CANCELADO");
    }

    // ==========================================
    // 🔥 ANULAR PEDIDO CON MOTIVO
    // ==========================================

    public Pedido anularPedido(Long id, String motivo, String usuario) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado: " + id));
        
        // Guardar observaciones con motivo de anulación
        String observacionesActuales = pedido.getObservaciones() != null ? pedido.getObservaciones() : "";
        String nuevaObservacion = observacionesActuales + 
            "\n[ANULADO] Motivo: " + motivo + " | Por: " + usuario + " | " + LocalDate.now() + " " + LocalTime.now();
        
        pedido.setObservaciones(nuevaObservacion.trim());
        pedido.setEstadoPedido("ANULADO");
        
        System.out.println("🗑️ Pedido " + pedido.getCodigoPedido() + " ANULADO por " + usuario + ". Motivo: " + motivo);
        
        return pedidoRepository.save(pedido);
    }

    // ==========================================
    // ELIMINAR
    // ==========================================

    public void eliminar(Long id) {
        if (!pedidoRepository.existsById(id)) {
            throw new RuntimeException("Pedido no encontrado: " + id);
        }
        pedidoRepository.deleteById(id);
        System.out.println("🗑️ Pedido eliminado: " + id);
    }

    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        
        LocalDate hoy = LocalDate.now();
        
        stats.put("totalPedidosHoy", pedidoRepository.countByFechaPedido(hoy));
        stats.put("pedidosPendientes", pedidoRepository.countByEstadoPedido("PENDIENTE"));
        stats.put("pedidosPreparando", pedidoRepository.countByEstadoPedido("PREPARANDO"));
        stats.put("pedidosListos", pedidoRepository.countByEstadoPedido("LISTO"));
        stats.put("pedidosServidos", pedidoRepository.countByEstadoPedido("SERVIDO"));
        stats.put("pedidosPagados", pedidoRepository.countByEstadoPedido("PAGADO"));
        
        BigDecimal totalDia = pedidoRepository.sumTotalByFechaPedido(hoy);
        stats.put("totalVentasHoy", totalDia != null ? totalDia : BigDecimal.ZERO);
        
        return stats;
    }
}