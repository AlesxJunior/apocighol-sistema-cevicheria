package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * ==========================================
 * PEDIDO REPOSITORY
 * 🔥 ACTUALIZADO: Filtros por rol, mesero y día
 * ==========================================
 */
@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Buscar por código único
    Optional<Pedido> findByCodigoPedido(String codigoPedido);

    // Buscar pedidos de una mesa
    List<Pedido> findByNumeroMesa(Integer numeroMesa);

    // Buscar por mesa y estado
    List<Pedido> findByNumeroMesaAndEstadoPedido(Integer numeroMesa, String estado);

    // Buscar por estado
    List<Pedido> findByEstadoPedido(String estadoPedido);

    // Buscar por fecha
    List<Pedido> findByFechaPedido(LocalDate fecha);

    // Buscar por mesero
    List<Pedido> findByNombreMesero(String nombreMesero);

    // ==========================================
    // 🔥 CONSULTAS PARA COCINA
    // Solo activos del día (pendiente, preparando, listo, servido)
    // ==========================================

    @Query("SELECT p FROM Pedido p WHERE p.fechaPedido = CURRENT_DATE " +
           "AND p.estadoPedido IN ('pendiente', 'preparando', 'listo', 'servido') " +
           "ORDER BY p.horaPedido DESC")
    List<Pedido> findPedidosActivosHoyParaCocina();

    // ==========================================
    // 🔥 CONSULTAS PARA MESERO
    // Solo sus pedidos activos del día
    // ==========================================

    @Query("SELECT p FROM Pedido p WHERE p.fechaPedido = CURRENT_DATE " +
           "AND p.nombreMesero = :nombreMesero " +
           "AND p.estadoPedido IN ('pendiente', 'preparando', 'listo', 'servido') " +
           "ORDER BY p.horaPedido DESC")
    List<Pedido> findPedidosActivosHoyPorMesero(@Param("nombreMesero") String nombreMesero);

    // ==========================================
    // 🔥 CONSULTAS PARA ADMIN
    // Todos los pedidos del día (incluye cobrados)
    // ==========================================

    @Query("SELECT p FROM Pedido p WHERE p.fechaPedido = CURRENT_DATE " +
           "AND p.estadoPedido <> 'anulado' " +
           "ORDER BY p.horaPedido DESC")
    List<Pedido> findPedidosHoyParaAdmin();

    // Pedidos del día por estado específico (para filtros de ADMIN)
    @Query("SELECT p FROM Pedido p WHERE p.fechaPedido = CURRENT_DATE " +
           "AND p.estadoPedido = :estado " +
           "ORDER BY p.horaPedido DESC")
    List<Pedido> findPedidosHoyPorEstado(@Param("estado") String estado);

    // ==========================================
    // CONSULTAS EXISTENTES (mantenidas)
    // ==========================================

    // Pedidos activos de una mesa (no servidos, no cobrados, no anulados)
    @Query("SELECT p FROM Pedido p WHERE p.numeroMesa = :mesa " +
           "AND p.estadoPedido NOT IN ('servido', 'cobrado', 'anulado') " +
           "ORDER BY p.fechaPedido DESC, p.horaPedido DESC")
    List<Pedido> findPedidosActivosPorMesa(@Param("mesa") Integer numeroMesa);

    // Pedidos del día (excluyendo anulados) - genérico
    @Query("SELECT p FROM Pedido p WHERE p.fechaPedido = CURRENT_DATE " +
           "AND p.estadoPedido <> 'anulado' " +
           "ORDER BY p.horaPedido DESC")
    List<Pedido> findPedidosDeHoy();

    // Todos los pedidos activos (excluyendo anulados y cobrados)
    @Query("SELECT p FROM Pedido p WHERE p.estadoPedido NOT IN ('anulado', 'cobrado') " +
           "ORDER BY p.fechaPedido DESC, p.horaPedido DESC")
    List<Pedido> findAllActivos();

    // Todos para ADMIN (incluye cobrados, excluye anulados)
    @Query("SELECT p FROM Pedido p WHERE p.estadoPedido <> 'anulado' " +
           "ORDER BY p.fechaPedido DESC, p.horaPedido DESC")
    List<Pedido> findAllParaAdmin();

    // ==========================================
    // 🔥 CONSULTAS DE PEDIDOS ANULADOS
    // ==========================================

    @Query("SELECT p FROM Pedido p WHERE p.estadoPedido = 'anulado' " +
           "ORDER BY p.fechaAnulacion DESC")
    List<Pedido> findPedidosAnulados();

    @Query("SELECT p FROM Pedido p WHERE p.estadoPedido = 'anulado' " +
           "AND DATE(p.fechaAnulacion) = :fecha " +
           "ORDER BY p.fechaAnulacion DESC")
    List<Pedido> findPedidosAnuladosPorFecha(@Param("fecha") LocalDate fecha);

    @Query("SELECT p FROM Pedido p WHERE p.estadoPedido = 'anulado' " +
           "AND DATE(p.fechaAnulacion) BETWEEN :fechaInicio AND :fechaFin " +
           "ORDER BY p.fechaAnulacion DESC")
    List<Pedido> findPedidosAnuladosEntreFechas(
        @Param("fechaInicio") LocalDate fechaInicio, 
        @Param("fechaFin") LocalDate fechaFin
    );

    @Query("SELECT p FROM Pedido p WHERE p.estadoPedido = 'anulado' " +
           "AND p.anuladoPor = :usuario " +
           "ORDER BY p.fechaAnulacion DESC")
    List<Pedido> findPedidosAnuladosPorUsuario(@Param("usuario") String usuario);

    // ==========================================
    // 🔥 CONSULTAS DE PEDIDOS COBRADOS
    // ==========================================

    @Query("SELECT p FROM Pedido p WHERE p.estadoPedido = 'cobrado' " +
           "AND p.fechaPedido = CURRENT_DATE " +
           "ORDER BY p.horaPedido DESC")
    List<Pedido> findPedidosCobradosHoy();

    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    Long countByEstadoPedido(String estadoPedido);

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.fechaPedido = CURRENT_DATE " +
           "AND p.estadoPedido <> 'anulado'")
    Long countPedidosDeHoy();

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.estadoPedido = 'anulado' " +
           "AND DATE(p.fechaAnulacion) = CURRENT_DATE")
    Long countPedidosAnuladosHoy();

    @Query("SELECT p.codigoPedido FROM Pedido p ORDER BY p.idPedido DESC LIMIT 1")
    Optional<String> findUltimoCodigoPedido();
}