package com.apocighol.cevicheria.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Entidad MovimientoCaja - Movimientos de caja (ventas, egresos)
 * Tabla: movimientos_caja
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "movimientos_caja")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MovimientoCaja {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Long idMovimiento;
    
    @Column(name = "id_caja", nullable = false)
    private Long idCaja;
    
    @Column(name = "tipo_movimiento", length = 20)
    private String tipoMovimiento; // VENTA, EGRESO, INGRESO
    
    @Column(name = "descripcion", length = 200)
    private String descripcion;
    
    @Column(name = "monto", precision = 10, scale = 2)
    private BigDecimal monto = BigDecimal.ZERO;
    
    @Column(name = "metodo_pago", length = 30)
    private String metodoPago; // Efectivo, Yape, Plin, Tarjeta
    
    @Column(name = "monto_recibido", precision = 10, scale = 2)
    private BigDecimal montoRecibido = BigDecimal.ZERO;
    
    @Column(name = "vuelto", precision = 10, scale = 2)
    private BigDecimal vuelto = BigDecimal.ZERO;
    
    @Column(name = "fecha_movimiento")
    private LocalDate fechaMovimiento;
    
    @Column(name = "hora_movimiento")
    private LocalTime horaMovimiento;
    
    @Column(name = "registrado_por", length = 100)
    private String registradoPor;
    
    // ==========================================
    // MÉTODOS
    // ==========================================
    
    @PrePersist
    protected void onCreate() {
        if (fechaMovimiento == null) {
            fechaMovimiento = LocalDate.now();
        }
        if (horaMovimiento == null) {
            horaMovimiento = LocalTime.now();
        }
    }
}