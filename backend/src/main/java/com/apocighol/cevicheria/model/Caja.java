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
 * Entidad Caja - Gestión de caja registradora
 * Tabla: cajas
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cajas")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Caja {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_caja")
    private Long idCaja;
    
    @Column(name = "codigo_caja", unique = true, length = 50)
    private String codigoCaja;
    
    @Column(name = "fecha_apertura")
    private LocalDate fechaApertura;
    
    @Column(name = "hora_apertura")
    private LocalTime horaApertura;
    
    @Column(name = "fecha_cierre")
    private LocalDate fechaCierre;
    
    @Column(name = "hora_cierre")
    private LocalTime horaCierre;
    
    @Column(name = "monto_inicial", precision = 10, scale = 2)
    private BigDecimal montoInicial = BigDecimal.ZERO;
    
    @Column(name = "monto_final", precision = 10, scale = 2)
    private BigDecimal montoFinal = BigDecimal.ZERO;
    
    @Column(name = "total_ventas", precision = 10, scale = 2)
    private BigDecimal totalVentas = BigDecimal.ZERO;
    
    @Column(name = "total_efectivo", precision = 10, scale = 2)
    private BigDecimal totalEfectivo = BigDecimal.ZERO;
    
    @Column(name = "total_yape", precision = 10, scale = 2)
    private BigDecimal totalYape = BigDecimal.ZERO;
    
    @Column(name = "total_plin", precision = 10, scale = 2)
    private BigDecimal totalPlin = BigDecimal.ZERO;
    
    @Column(name = "total_tarjeta", precision = 10, scale = 2)
    private BigDecimal totalTarjeta = BigDecimal.ZERO;
    
    @Column(name = "total_gastos", precision = 10, scale = 2)
    private BigDecimal totalEgresos = BigDecimal.ZERO;
    
    @Column(name = "diferencia", precision = 10, scale = 2)
    private BigDecimal diferencia = BigDecimal.ZERO;
    
    @Column(name = "estado_caja", length = 20)
    private String estadoCaja = "ABIERTA"; // ABIERTA, CERRADA
    
    @Column(name = "responsable_caja", length = 100)
    private String responsable;
    
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
    
    // ==========================================
    // MÉTODOS
    // ==========================================
    
    @PrePersist
    protected void onCreate() {
        if (fechaApertura == null) {
            fechaApertura = LocalDate.now();
        }
        if (horaApertura == null) {
            horaApertura = LocalTime.now();
        }
        if (codigoCaja == null || codigoCaja.isEmpty()) {
            codigoCaja = "CAJA-" + System.currentTimeMillis();
        }
    }
}