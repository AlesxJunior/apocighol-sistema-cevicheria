package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ==========================================
 * DETALLE PEDIDO REPOSITORY
 * ==========================================
 */
@Repository
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {
    
    List<DetallePedido> findByPedidoIdPedido(Long idPedido);
    
    List<DetallePedido> findByIdProducto(Long idProducto);
}