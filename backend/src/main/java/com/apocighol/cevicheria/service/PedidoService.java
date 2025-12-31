package com.apocighol.cevicheria.service;

import com.apocighol.cevicheria.model.Pedido;
import com.apocighol.cevicheria.model.PedidoProducto;
import com.apocighol.cevicheria.model.Mesa;
import com.apocighol.cevicheria.repository.PedidoRepository;
import com.apocighol.cevicheria.repository.MesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * ==========================================
 * PEDIDO SERVICE
 * 🔥 ACTUALIZADO: Métodos por rol (COCINA, MESERO, ADMIN)
 * ==========================================
 */
@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private MesaRepository mesaRepository;

    // ==========================================
    // 🔥 CONSULTAS POR ROL
    // ==========================================

    /**
     * COCINA: Solo pedidos activos del día
     * Estados: pendiente, preparando, listo, servido
     */
    public List<Pedido> obtenerParaCocina() {
        return pedidoRepository.findPedidosActivosHoyParaCocina();
    }

    /**
     * MESERO: Solo sus pedidos activos del día
     */
    public List<Pedido> obtenerParaMesero(String nombreMesero) {
        return pedidoRepository.findPedidosActivosHoyPorMesero(nombreMesero);
    }

    /**
     * ADMIN: Todos los pedidos del día (incluye cobrados, excluye anulados)
     */
    public List<Pedido> obtenerParaAdmin() {
        return pedidoRepository.findPedidosHoyParaAdmin();
    }

    /**
     * ADMIN: Pedidos del día filtrados por estado
     */
    public List<Pedido> obtenerParaAdminPorEstado(String estado) {
        return pedidoRepository.findPedidosHoyPorEstado(estado);
    }

    // ==========================================
    // CRUD BÁSICO
    // ==========================================

    public List<Pedido> obtenerTodos() {
        return pedidoRepository.findAllActivos();
    }

    public List<Pedido> obtenerTodosParaAdmin() {
        return pedidoRepository.findAllParaAdmin();
    }

    public Optional<Pedido> obtenerPorId(Long id) {
        return pedidoRepository.findById(id);
    }

    public Optional<Pedido> obtenerPorCodigo(String codigo) {
        return pedidoRepository.findByCodigoPedido(codigo);
    }

    @Transactional
    public Pedido crear(Pedido pedido) {
        // Validar que la mesa exista y esté ocupada
        Mesa mesa = mesaRepository.findByNumeroMesa(pedido.getNumeroMesa())
            .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));

        if (!"ocupada".equalsIgnoreCase(mesa.getEstadoMesa())) {
            throw new RuntimeException("La mesa debe estar ocupada para crear un pedido");
        }

        // Generar código único
        pedido.setCodigoPedido(generarCodigoPedido());

        // Establecer fecha y hora
        pedido.setFechaPedido(LocalDate.now());
        pedido.setHoraPedido(LocalTime.now());
        pedido.setEstadoPedido("pendiente");

        // Calcular totales
        BigDecimal total = BigDecimal.ZERO;
        if (pedido.getProductos() != null) {
            for (PedidoProducto producto : pedido.getProductos()) {
                producto.setPedido(pedido);
                if (producto.getSubtotal() != null) {
                    total = total.add(producto.getSubtotal());
                }
            }
        }
        pedido.setSubtotalPedido(total);
        pedido.setTotalPedido(total);

        Pedido savedPedido = pedidoRepository.save(pedido);

        // Actualizar total de la mesa
        BigDecimal nuevoTotal = mesa.getTotalConsumoMesa().add(total);
        mesa.setTotalConsumoMesa(nuevoTotal);
        mesaRepository.save(mesa);

        return savedPedido;
    }

    @Transactional
    public Pedido actualizar(Long id, Pedido pedidoActualizado) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (pedidoActualizado.getEstadoPedido() != null) {
            pedido.setEstadoPedido(pedidoActualizado.getEstadoPedido());
        }
        if (pedidoActualizado.getNotaPedido() != null) {
            pedido.setNotaPedido(pedidoActualizado.getNotaPedido());
        }
        if (pedidoActualizado.getDescuentoPedido() != null) {
            pedido.setDescuentoPedido(pedidoActualizado.getDescuentoPedido());
            pedido.recalcularTotal();
        }

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public void eliminar(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // Restar del total de la mesa
        Mesa mesa = mesaRepository.findByNumeroMesa(pedido.getNumeroMesa()).orElse(null);
        if (mesa != null && mesa.getTotalConsumoMesa() != null) {
            BigDecimal nuevoTotal = mesa.getTotalConsumoMesa().subtract(pedido.getTotalPedido());
            if (nuevoTotal.compareTo(BigDecimal.ZERO) < 0) {
                nuevoTotal = BigDecimal.ZERO;
            }
            mesa.setTotalConsumoMesa(nuevoTotal);
            mesaRepository.save(mesa);
        }

        pedidoRepository.delete(pedido);
    }

    // ==========================================
    // CAMBIO DE ESTADOS
    // ==========================================

    @Transactional
    public Pedido cambiarEstado(Long id, String nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        pedido.setEstadoPedido(nuevoEstado);
        return pedidoRepository.save(pedido);
    }

    public Pedido marcarPreparando(Long id) {
        return cambiarEstado(id, "preparando");
    }

    public Pedido marcarListo(Long id) {
        return cambiarEstado(id, "listo");
    }

    public Pedido marcarServido(Long id) {
        return cambiarEstado(id, "servido");
    }

    // ==========================================
    // 🔥 ANULAR PEDIDO
    // ==========================================

    @Transactional
    public Pedido anularPedido(Long id, String motivo, String usuario) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (pedido.estaAnulado()) {
            throw new RuntimeException("El pedido ya está anulado");
        }
        if (pedido.estaCobrado()) {
            throw new RuntimeException("No se puede anular un pedido cobrado");
        }

        // Restar del total de la mesa
        Mesa mesa = mesaRepository.findByNumeroMesa(pedido.getNumeroMesa()).orElse(null);
        if (mesa != null && mesa.getTotalConsumoMesa() != null) {
            BigDecimal nuevoTotal = mesa.getTotalConsumoMesa().subtract(pedido.getTotalPedido());
            if (nuevoTotal.compareTo(BigDecimal.ZERO) < 0) {
                nuevoTotal = BigDecimal.ZERO;
            }
            mesa.setTotalConsumoMesa(nuevoTotal);
            mesaRepository.save(mesa);
        }

        pedido.anular(motivo, usuario);
        return pedidoRepository.save(pedido);
    }

    // ==========================================
    // 🔥 COBRAR PEDIDOS DE UNA MESA
    // ==========================================

    @Transactional
    public void cobrarPedidosDeMesa(Integer numeroMesa) {
        List<Pedido> pedidos = pedidoRepository.findByNumeroMesa(numeroMesa);
        
        for (Pedido pedido : pedidos) {
            if (!pedido.estaAnulado() && !pedido.estaCobrado()) {
                pedido.cobrar();
                pedidoRepository.save(pedido);
            }
        }
    }

    // ==========================================
    // CONSULTAS GENERALES
    // ==========================================

    public List<Pedido> obtenerPorMesa(Integer numeroMesa) {
        return pedidoRepository.findByNumeroMesa(numeroMesa);
    }

    public List<Pedido> obtenerActivosPorMesa(Integer numeroMesa) {
        return pedidoRepository.findPedidosActivosPorMesa(numeroMesa);
    }

    public List<Pedido> obtenerPorEstado(String estado) {
        return pedidoRepository.findByEstadoPedido(estado);
    }

    public List<Pedido> obtenerDeHoy() {
        return pedidoRepository.findPedidosDeHoy();
    }

    public List<Pedido> obtenerPorMesero(String nombreMesero) {
        return pedidoRepository.findByNombreMesero(nombreMesero);
    }

    // ==========================================
    // CONSULTAS DE ANULADOS
    // ==========================================

    public List<Pedido> obtenerAnulados() {
        return pedidoRepository.findPedidosAnulados();
    }

    public List<Pedido> obtenerAnuladosPorFecha(LocalDate fecha) {
        return pedidoRepository.findPedidosAnuladosPorFecha(fecha);
    }

    public List<Pedido> obtenerAnuladosEntreFechas(LocalDate fechaInicio, LocalDate fechaFin) {
        return pedidoRepository.findPedidosAnuladosEntreFechas(fechaInicio, fechaFin);
    }

    public List<Pedido> obtenerAnuladosPorUsuario(String usuario) {
        return pedidoRepository.findPedidosAnuladosPorUsuario(usuario);
    }

    // ==========================================
    // CONSULTAS DE COBRADOS
    // ==========================================

    public List<Pedido> obtenerCobradosHoy() {
        return pedidoRepository.findPedidosCobradosHoy();
    }

    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    public Long contarPorEstado(String estado) {
        return pedidoRepository.countByEstadoPedido(estado);
    }

    public Long contarDeHoy() {
        return pedidoRepository.countPedidosDeHoy();
    }

    public Long contarAnuladosHoy() {
        return pedidoRepository.countPedidosAnuladosHoy();
    }

    // ==========================================
    // UTILIDADES
    // ==========================================

    private String generarCodigoPedido() {
        long timestamp = System.currentTimeMillis();
        int random = (int) (Math.random() * 1000);
        return String.format("PED-%d-%03d", timestamp, random);
    }
}