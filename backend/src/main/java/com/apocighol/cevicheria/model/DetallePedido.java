package com.apocighol.cevicheria.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

/**
 * Entidad DetallePedido - Detalle de cada pedido
 * Tabla: detalle_pedidos
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "detalle_pedidos")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DetallePedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long idDetalle;
    
    @Column(name = "id_producto")
    private Long idProducto;
    
    @Column(name = "nombre_producto", length = 100)
    private String nombreProducto;
    
    @Column(name = "cantidad")
    private Integer cantidad;
    
    @Column(name = "precio_unitario", precision = 10, scale = 2)
    private BigDecimal precioUnitario;
    
    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
    
    // ==========================================
    // RELACIONES
    // ==========================================
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido")
    @JsonBackReference
    private Pedido pedido;
    
    // ==========================================
    // MÉTODOS
    // ==========================================
    
    public void calcularSubtotal() {
        if (this.cantidad != null && this.precioUnitario != null) {
            this.subtotal = this.precioUnitario.multiply(BigDecimal.valueOf(this.cantidad));
        }
    }
    
    @PrePersist
    @PreUpdate
    protected void onSave() {
        calcularSubtotal();
    }
}