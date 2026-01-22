package com.apocighol.cevicheria.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

/**
 * Entidad CompraDetalle - Detalle de cada compra
 * Tabla: compra_detalles
 * 
 * 🔥 CORREGIDO: JsonBackReference para evitar ciclos
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "compra_detalles")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CompraDetalle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long idDetalle;
    
    @Column(name = "id_compra", nullable = false)
    private Long idCompra;
    
    @Column(name = "id_insumo", nullable = false)
    private Long idInsumo;
    
    @Column(name = "cantidad", nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidad;
    
    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;
    
    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    // ==========================================
    // RELACIONES - 🔥 CORREGIDAS
    // ==========================================
    
    /**
     * Relación con Compra
     * 🔥 JsonBackReference evita ciclo infinito con @JsonManagedReference de Compra
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_compra", insertable = false, updatable = false)
    @JsonBackReference
    private Compra compra;
    
    /**
     * Relación con Insumo
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_insumo", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Insumo insumo;
    
    // ==========================================
    // MÉTODOS
    // ==========================================
    
    /**
     * Calcula el subtotal automáticamente
     */
    public void calcularSubtotal() {
        if (this.cantidad != null && this.precioUnitario != null) {
            this.subtotal = this.cantidad.multiply(this.precioUnitario);
        }
    }
    
    @PrePersist
    @PreUpdate
    protected void onSave() {
        calcularSubtotal();
    }
}