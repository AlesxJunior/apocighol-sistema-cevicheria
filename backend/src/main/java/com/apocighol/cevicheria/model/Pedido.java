package com.apocighol.cevicheria.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad Pedido - Registro de pedidos
 * Tabla: pedidos
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pedidos")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Pedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long idPedido;
    
    @Column(name = "codigo_pedido", unique = true, length = 50)
    private String codigoPedido;
    
    @Column(name = "numero_mesa")
    private Integer numeroMesa;
    
    @Column(name = "mesero", length = 100)
    private String mesero;
    
    @Column(name = "fecha_pedido")
    private LocalDate fechaPedido;
    
    @Column(name = "hora_pedido")
    private LocalTime horaPedido;
    
    @Column(name = "estado_pedido", length = 20)
    private String estadoPedido = "PENDIENTE";
    
    @Column(name = "total_pedido", precision = 10, scale = 2)
    private BigDecimal totalPedido = BigDecimal.ZERO;
    
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
    
    // ==========================================
    // RELACIONES
    // ==========================================
    
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<DetallePedido> detalles = new ArrayList<>();
    
    // ==========================================
    // MÉTODOS
    // ==========================================
    
    public void agregarDetalle(DetallePedido detalle) {
        detalle.setPedido(this);
        this.detalles.add(detalle);
        recalcularTotal();
    }
    
    public void recalcularTotal() {
        this.totalPedido = detalles.stream()
            .map(DetallePedido::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    @PrePersist
    protected void onCreate() {
        if (fechaPedido == null) {
            fechaPedido = LocalDate.now();
        }
        if (horaPedido == null) {
            horaPedido = LocalTime.now();
        }
        if (estadoPedido == null) {
            estadoPedido = "PENDIENTE";
        }
    }
}