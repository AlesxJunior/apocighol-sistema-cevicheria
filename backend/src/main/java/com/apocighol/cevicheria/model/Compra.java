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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad Compra - Registro de compras de insumos
 * Tabla: compras
 * 
 * 🔥 CORREGIDO: Anotaciones JSON para serialización correcta
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "compras")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Compra {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_compra")
    private Long idCompra;
    
    @Column(name = "codigo_compra", unique = true, length = 30)
    private String codigoCompra;
    
    @Column(name = "id_proveedor", nullable = false)
    private Long idProveedor;
    
    @Column(name = "fecha_compra")
    private LocalDate fechaCompra;
    
    @Column(name = "hora_compra")
    private LocalTime horaCompra;
    
    @Column(name = "total_compra", precision = 10, scale = 2)
    private BigDecimal totalCompra = BigDecimal.ZERO;
    
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    // ==========================================
    // RELACIONES - 🔥 CORREGIDAS
    // ==========================================
    
    /**
     * Relación con Proveedor
     * JsonIgnoreProperties evita ciclos infinitos
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_proveedor", insertable = false, updatable = false)
    @JsonIgnoreProperties({"compras", "hibernateLazyInitializer", "handler"})
    private Proveedor proveedor;
    
    /**
     * Relación con Detalles de Compra
     * 🔥 FetchType.EAGER para cargar siempre los detalles
     * JsonManagedReference evita ciclos infinitos
     */
    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<CompraDetalle> detalles = new ArrayList<>();
    
    // ==========================================
    // MÉTODOS DE NEGOCIO
    // ==========================================
    
    /**
     * Genera código único para la compra
     */
    public void generarCodigo() {
        this.codigoCompra = "COMP-" + System.currentTimeMillis();
    }
    
    /**
     * Agrega un detalle a la compra
     */
    public void agregarDetalle(CompraDetalle detalle) {
        detalle.setCompra(this);
        detalle.setIdCompra(this.idCompra);
        this.detalles.add(detalle);
        recalcularTotal();
    }
    
    /**
     * Recalcula el total de la compra sumando todos los detalles
     */
    public void recalcularTotal() {
        this.totalCompra = detalles.stream()
            .map(CompraDetalle::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Obtiene cantidad total de items
     */
    public int getCantidadItems() {
        return detalles.size();
    }
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (fechaCompra == null) {
            fechaCompra = LocalDate.now();
        }
        if (horaCompra == null) {
            horaCompra = LocalTime.now();
        }
        if (codigoCompra == null || codigoCompra.isEmpty()) {
            generarCodigo();
        }
    }
}