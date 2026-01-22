package com.apocighol.cevicheria.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad Insumo - Representa los ingredientes del inventario
 * Tabla: insumos
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "insumos")
public class Insumo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_insumo")
    private Long idInsumo;
    
    @Column(name = "nombre_insumo", nullable = false, length = 100)
    private String nombreInsumo;
    
    @Column(name = "stock_actual", precision = 10, scale = 3)
    private BigDecimal stockActual = BigDecimal.ZERO;
    
    @Column(name = "stock_minimo", precision = 10, scale = 3)
    private BigDecimal stockMinimo = BigDecimal.ZERO;
    
    @Column(name = "unidad_medida", length = 20)
    private String unidadMedida = "unidades";
    
    @Column(name = "categoria_insumo", length = 50)
    private String categoriaInsumo;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    // ==========================================
    // MÉTODOS DE NEGOCIO
    // ==========================================
    
    /**
     * Verifica si el stock está bajo el mínimo
     */
    public boolean tieneStockBajo() {
        if (stockActual == null || stockMinimo == null) return false;
        return stockActual.compareTo(stockMinimo) <= 0;
    }
    
    /**
     * Aumenta el stock (usado en COMPRAS)
     */
    public void aumentarStock(BigDecimal cantidad) {
        if (cantidad != null && cantidad.compareTo(BigDecimal.ZERO) > 0) {
            this.stockActual = this.stockActual.add(cantidad);
            this.fechaActualizacion = LocalDateTime.now();
        }
    }
    
    /**
     * Disminuye el stock (usado en PEDIDOS/VENTAS)
     * @return true si se pudo descontar, false si no hay suficiente
     */
    public boolean disminuirStock(BigDecimal cantidad) {
        if (cantidad == null || cantidad.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        
        if (this.stockActual.compareTo(cantidad) >= 0) {
            this.stockActual = this.stockActual.subtract(cantidad);
            this.fechaActualizacion = LocalDateTime.now();
            return true;
        }
        
        // Si no hay suficiente, dejar en 0 y retornar false
        this.stockActual = BigDecimal.ZERO;
        this.fechaActualizacion = LocalDateTime.now();
        return false;
    }
    
    /**
     * Calcula el porcentaje de stock actual vs mínimo
     */
    public int getPorcentajeStock() {
        if (stockMinimo == null || stockMinimo.compareTo(BigDecimal.ZERO) == 0) {
            return 100;
        }
        return stockActual.multiply(BigDecimal.valueOf(100))
                .divide(stockMinimo, 0, java.math.RoundingMode.HALF_UP)
                .intValue();
    }
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}