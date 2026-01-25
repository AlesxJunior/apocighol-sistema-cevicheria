package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    Optional<Pedido> findByCodigoPedido(String codigoPedido);
    
    List<Pedido> findByNumeroMesa(Integer numeroMesa);
    
    List<Pedido> findByNumeroMesaOrderByHoraPedidoDesc(Integer numeroMesa);
    
    List<Pedido> findByNumeroMesaAndEstadoPedido(Integer numeroMesa, String estadoPedido);
    
    List<Pedido> findByEstadoPedido(String estadoPedido);
    
    List<Pedido> findByFechaPedido(LocalDate fechaPedido);
    
    List<Pedido> findAllByOrderByFechaPedidoDescHoraPedidoDesc();
    
    long countByFechaPedido(LocalDate fechaPedido);
    
    long countByEstadoPedido(String estadoPedido);
    
    @Query("SELECT COALESCE(SUM(p.totalPedido), 0) FROM Pedido p WHERE p.fechaPedido = :fecha")
    BigDecimal sumTotalByFechaPedido(@Param("fecha") LocalDate fecha);
    
    // Contar pedidos NO servidos de una mesa
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.numeroMesa = :numeroMesa AND p.estadoPedido != 'SERVIDO' AND p.estadoPedido != 'COBRADO'")
    long countPedidosNoServidos(@Param("numeroMesa") Integer numeroMesa);
}