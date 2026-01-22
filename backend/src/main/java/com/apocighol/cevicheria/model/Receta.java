package com.apocighol.cevicheria.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

/**
 * Entidad Receta - Relaciona productos con sus insumos
 * Tabla: recetas
 * 
 * Ejemplo: Ceviche Mixto necesita:
 *   - 10 limones
 *   - 50g pescado
 *   - 9 cebollas
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "recetas")
public class Receta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_receta")
    private Long idReceta;
    
    @Column(name = "id_producto", nullable = false)
    private Long idProducto;
    
    @Column(name = "id_insumo", nullable = false)
    private Long idInsumo;
    
    @Column(name = "cantidad_necesaria", nullable = false, precision = 10, scale = 3)
    private BigDecimal cantidadNecesaria;
    
    // ==========================================
    // RELACIONES (opcionales para consultas)
    // ==========================================
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", insertable = false, updatable = false)
    private Producto producto;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_insumo", insertable = false, updatable = false)
    private Insumo insumo;
    
    // ==========================================
    // CONSTRUCTOR ÚTIL
    // ==========================================
    
    public Receta(Long idProducto, Long idInsumo, BigDecimal cantidadNecesaria) {
        this.idProducto = idProducto;
        this.idInsumo = idInsumo;
        this.cantidadNecesaria = cantidadNecesaria;
    }
    
    /**
     * Calcula la cantidad total necesaria según cantidad de productos vendidos
     */
    public BigDecimal calcularCantidadTotal(int cantidadProductos) {
        return this.cantidadNecesaria.multiply(BigDecimal.valueOf(cantidadProductos));
    }
}