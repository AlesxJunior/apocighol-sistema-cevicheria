package com.apocighol.cevicheria.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "productos")
public class Producto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long idProducto;
    
    @Column(name = "codigo_producto", unique = true, length = 20)
    private String codigoProducto;
    
    @Column(name = "nombre_producto", nullable = false, length = 100)
    private String nombreProducto;
    
    @Column(name = "descripcion_producto", columnDefinition = "TEXT")
    private String descripcionProducto;
    
    @Column(name = "precio_producto", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioProducto;
    
    @Column(name = "categoria_producto", length = 50)
    private String categoriaProducto;
    
    @Column(name = "disponible_producto")
    private Boolean disponibleProducto = true;
    
    @Column(name = "created_at_producto")
    private LocalDateTime createdAtProducto;
    
    @PrePersist
    protected void onCreate() {
        createdAtProducto = LocalDateTime.now();
    }
}