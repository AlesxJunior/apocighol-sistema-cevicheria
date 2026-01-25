package com.apocighol.cevicheria.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "mesas")
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mesa")
    private Long idMesa;

    @Column(name = "numero_mesa", unique = true, nullable = false)
    private Integer numeroMesa;

    @Column(name = "capacidad_mesa", nullable = false)
    private Integer capacidadMesa = 4;

    @Column(name = "estado_mesa", length = 20, nullable = false)
    private String estadoMesa = "disponible";

    @Column(name = "mesero_asignado", length = 100)
    private String meseroAsignado;

    @Column(name = "hora_ocupacion_mesa")
    private LocalTime horaOcupacionMesa;

    @Column(name = "total_consumo_mesa", precision = 10, scale = 2)
    private BigDecimal totalConsumoMesa = BigDecimal.ZERO;

    @Column(name = "fecha_creacion_mesa")
    private LocalDateTime fechaCreacionMesa;

    @Column(name = "fecha_actualizacion_mesa")
    private LocalDateTime fechaActualizacionMesa;

    @Column(name = "activa_mesa")
    private Boolean activaMesa = true;

    @Column(name = "personas_actuales")
    private Integer personasActuales = 0;

    @Column(name = "motivo_liberacion", length = 200)
    private String motivoLiberacion;

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

    public void ocupar(Integer personas, String mesero) {
        this.estadoMesa = "ocupada";
        this.personasActuales = personas;
        this.meseroAsignado = mesero;
        this.horaOcupacionMesa = LocalTime.now();
    }

    public void liberar() {
        this.estadoMesa = "disponible";
        this.personasActuales = 0;
        this.meseroAsignado = null;
        this.horaOcupacionMesa = null;
        this.totalConsumoMesa = BigDecimal.ZERO;
        this.motivoLiberacion = null;
    }

    public void reservar() {
        this.estadoMesa = "reservada";
    }

    public boolean estaDisponible() {
        return "disponible".equals(this.estadoMesa);
    }

    public boolean estaOcupada() {
        return "ocupada".equals(this.estadoMesa);
    }

    public boolean estaReservada() {
        return "reservada".equals(this.estadoMesa);
    }
}