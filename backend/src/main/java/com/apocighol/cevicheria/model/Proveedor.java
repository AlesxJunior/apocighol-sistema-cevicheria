package com.apocighol.cevicheria.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entidad Proveedor - Proveedores de insumos
 * Tabla: proveedores
 * 
 * Puede ser: Mercado, Bodega, Empresa con RUC, Persona con DNI
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "proveedores")
public class Proveedor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proveedor")
    private Long idProveedor;
    
    @Column(name = "nombre_proveedor", nullable = false, length = 200)
    private String nombreProveedor;
    
    @Column(name = "ruc_proveedor", length = 11)
    private String rucProveedor;
    
    @Column(name = "telefono_proveedor", length = 20)
    private String telefonoProveedor;
    
    @Column(name = "email_proveedor", length = 100)
    private String emailProveedor;
    
    @Column(name = "direccion_proveedor", length = 300)
    private String direccionProveedor;
    
    @Column(name = "activo_proveedor")
    private Boolean activoProveedor = true;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    // ==========================================
    // MÉTODOS DE NEGOCIO
    // ==========================================
    
    /**
     * Verifica si el documento es RUC (11 dígitos) o DNI (8 dígitos)
     */
    public String getTipoDocumento() {
        if (rucProveedor == null || rucProveedor.isEmpty()) {
            return "SIN DOCUMENTO";
        }
        return rucProveedor.length() == 11 ? "RUC" : "DNI";
    }
    
    /**
     * Valida el documento (solo números, 8 o 11 dígitos)
     */
    public boolean tieneDocumentoValido() {
        if (rucProveedor == null || rucProveedor.isEmpty()) {
            return true; // Sin documento es válido (opcional)
        }
        
        // Solo números
        if (!rucProveedor.matches("\\d+")) {
            return false;
        }
        
        // 8 (DNI) o 11 (RUC) dígitos
        return rucProveedor.length() == 8 || rucProveedor.length() == 11;
    }
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (activoProveedor == null) {
            activoProveedor = true;
        }
    }
}