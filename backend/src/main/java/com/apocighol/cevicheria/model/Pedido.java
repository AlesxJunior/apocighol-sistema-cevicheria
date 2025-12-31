package com.apocighol.cevicheria.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * ==========================================
 * PEDIDO.JAVA - ENTIDAD JPA
 * Tabla: pedidos
 * 🔥 ACTUALIZADO: Campos de anulación
 * ==========================================
 */
@Data
@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long idPedido;

    @Column(name = "codigo_pedido", unique = true, nullable = false, length = 50)
    private String codigoPedido;

    @Column(name = "numero_mesa", nullable = false)
    private Integer numeroMesa;

    @Column(name = "estado_pedido", length = 20)
    private String estadoPedido = "pendiente";

    @Column(name = "fecha_pedido", nullable = false)
    private LocalDate fechaPedido;

    @Column(name = "hora_pedido", nullable = false)
    private LocalTime horaPedido;

    @Column(name = "nombre_mesero", length = 100)
    private String nombreMesero;

    @Column(name = "subtotal_pedido", precision = 10, scale = 2, nullable = false)
    private BigDecimal subtotalPedido = BigDecimal.ZERO;

    @Column(name = "descuento_pedido", precision = 10, scale = 2)
    private BigDecimal descuentoPedido = BigDecimal.ZERO;

    @Column(name = "total_pedido", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalPedido = BigDecimal.ZERO;

    @Column(name = "nota_pedido", columnDefinition = "TEXT")
    private String notaPedido;

    @Column(name = "fecha_creacion_pedido")
    private LocalDateTime fechaCreacionPedido;

    // ==========================================
    // 🔥 CAMPOS DE ANULACIÓN (NUEVOS)
    // ==========================================
    
    @Column(name = "motivo_anulacion", length = 300)
    private String motivoAnulacion;
    
    @Column(name = "fecha_anulacion")
    private LocalDateTime fechaAnulacion;
    
    @Column(name = "anulado_por", length = 100)
    private String anuladoPor;

    // Relación con los productos del pedido
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<PedidoProducto> productos = new ArrayList<>();

    // ==========================================
    // MÉTODOS DE CICLO DE VIDA
    // ==========================================

    @PrePersist
    protected void onCreate() {
        fechaCreacionPedido = LocalDateTime.now();
        if (fechaPedido == null) fechaPedido = LocalDate.now();
        if (horaPedido == null) horaPedido = LocalTime.now();
        if (estadoPedido == null) estadoPedido = "pendiente";
        if (subtotalPedido == null) subtotalPedido = BigDecimal.ZERO;
        if (descuentoPedido == null) descuentoPedido = BigDecimal.ZERO;
        if (totalPedido == null) totalPedido = BigDecimal.ZERO;
    }

    // ==========================================
    // MÉTODOS DE UTILIDAD
    // ==========================================

    public void agregarProducto(PedidoProducto producto) {
        productos.add(producto);
        producto.setPedido(this);
        recalcularTotal();
    }

    public void removerProducto(PedidoProducto producto) {
        productos.remove(producto);
        producto.setPedido(null);
        recalcularTotal();
    }

    public void recalcularTotal() {
        this.subtotalPedido = productos.stream()
            .map(PedidoProducto::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        this.totalPedido = this.subtotalPedido.subtract(
            this.descuentoPedido != null ? this.descuentoPedido : BigDecimal.ZERO
        );
    }

    // ==========================================
    // MÉTODOS DE ESTADO
    // ==========================================

    public boolean estaPendiente() {
        return "pendiente".equalsIgnoreCase(this.estadoPedido);
    }

    public boolean estaPreparando() {
        return "preparando".equalsIgnoreCase(this.estadoPedido);
    }

    public boolean estaListo() {
        return "listo".equalsIgnoreCase(this.estadoPedido);
    }

    public boolean estaServido() {
        return "servido".equalsIgnoreCase(this.estadoPedido);
    }

    public boolean estaCobrado() {
        return "cobrado".equalsIgnoreCase(this.estadoPedido);
    }

    public boolean estaAnulado() {
        return "anulado".equalsIgnoreCase(this.estadoPedido);
    }

    public void cambiarEstado(String nuevoEstado) {
        this.estadoPedido = nuevoEstado;
    }

    // ==========================================
    // 🔥 MÉTODO PARA ANULAR PEDIDO
    // ==========================================

    public void anular(String motivo, String usuario) {
        this.estadoPedido = "anulado";
        this.motivoAnulacion = motivo;
        this.fechaAnulacion = LocalDateTime.now();
        this.anuladoPor = usuario;
    }

    // ==========================================
    // 🔥 MÉTODO PARA COBRAR PEDIDO
    // ==========================================

    public void cobrar() {
        this.estadoPedido = "cobrado";
    }
}