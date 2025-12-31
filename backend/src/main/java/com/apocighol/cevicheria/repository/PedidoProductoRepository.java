package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.PedidoProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * ==========================================
 * PEDIDO_PRODUCTO REPOSITORY
 * ==========================================
 */
@Repository
public interface PedidoProductoRepository extends JpaRepository<PedidoProducto, Long> {

    // Productos de un pedido
    @Query("SELECT pp FROM PedidoProducto pp WHERE pp.pedido.idPedido = ?1")
    List<PedidoProducto> findByPedidoId(Long idPedido);

    // Eliminar productos de un pedido
    void deleteByPedidoIdPedido(Long idPedido);
}