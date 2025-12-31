package com.apocighol.cevicheria.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.math.BigDecimal;

/**
 * ==========================================
 * MESA.JAVA - ENTIDAD JPA
 * VERSIÓN DEFINITIVA - Coincide exactamente con la BD
 * Tabla: mesas
 * ==========================================
 */
@Data
@Entity
@Table(name = "mesas")
public class Mesa {

    // === id_mesa (bigint, PK, auto_increment) ===
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mesa")
    private Long idMesa;

    // === numero_mesa (int, UNIQUE) ===
    @Column(name = "numero_mesa", unique = true, nullable = false)
    private Integer numeroMesa;

    // === capacidad_mesa (int, default 4) ===
    @Column(name = "capacidad_mesa", nullable = false)
    private Integer capacidadMesa = 4;

    // === estado_mesa (varchar 20) ===
    @Column(name = "estado_mesa", length = 20, nullable = false)
    private String estadoMesa = "disponible";

    // === mesero_asignado (varchar 100, NULL) ===
    @Column(name = "mesero_asignado", length = 100)
    private String meseroAsignado;

    // === hora_ocupacion_mesa (time, NULL) ===
    @Column(name = "hora_ocupacion_mesa")
    private LocalTime horaOcupacionMesa;

    // === total_consumo_mesa (decimal 10,2, default 0.00) ===
    @Column(name = "total_consumo_mesa", precision = 10, scale = 2)
    private BigDecimal totalConsumoMesa = BigDecimal.ZERO;

    // === fecha_creacion_mesa (timestamp) ===
    @Column(name = "fecha_creacion_mesa")
    private LocalDateTime fechaCreacionMesa;

    // === fecha_actualizacion_mesa (timestamp) ===
    @Column(name = "fecha_actualizacion_mesa")
    private LocalDateTime fechaActualizacionMesa;

    // === activa_mesa (bit 1, NULL) ===
    @Column(name = "activa_mesa")
    private Boolean activaMesa = true;

    // === personas_actuales (int, NULL) ===
    @Column(name = "personas_actuales")
    private Integer personasActuales = 0;

    // ==========================================
    // MÉTODOS DE CICLO DE VIDA JPA
    // ==========================================
    
    @PrePersist
    protected void onCreate() {
        fechaCreacionMesa = LocalDateTime.now();
        fechaActualizacionMesa = LocalDateTime.now();
        if (activaMesa == null) activaMesa = true;
        if (personasActuales == null) personasActuales = 0;
        if (totalConsumoMesa == null) totalConsumoMesa = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacionMesa = LocalDateTime.now();
    }

    // ==========================================
    // MÉTODOS DE UTILIDAD
    // ==========================================

    public boolean estaDisponible() {
        return "disponible".equalsIgnoreCase(this.estadoMesa);
    }

    public boolean estaOcupada() {
        return "ocupada".equalsIgnoreCase(this.estadoMesa);
    }

    public void ocupar(Integer personas, String mesero) {
        this.estadoMesa = "ocupada";
        this.personasActuales = personas;
        this.meseroAsignado = mesero;
        this.horaOcupacionMesa = LocalTime.now();
        this.totalConsumoMesa = BigDecimal.ZERO;
    }

    public void liberar() {
        this.estadoMesa = "disponible";
        this.personasActuales = 0;
        this.meseroAsignado = null;
        this.horaOcupacionMesa = null;
        this.totalConsumoMesa = BigDecimal.ZERO;
    }

    public void actualizarTotal(BigDecimal nuevoTotal) {
        this.totalConsumoMesa = nuevoTotal;
    }
}