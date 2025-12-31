package com.apocighol.cevicheria.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;
    
    @Column(name = "username_usuario", unique = true, nullable = false, length = 50)
    private String usernameUsuario;
    
    @Column(name = "password_usuario", nullable = false, length = 100)
    private String passwordUsuario;
    
    @Column(name = "nombre_usuario", nullable = false, length = 100)
    private String nombreUsuario;
    
    @Column(name = "rol_usuario", nullable = false, length = 20)
    private String rolUsuario;
    
    @Column(name = "activo_usuario")
    private Boolean activoUsuario = true;
    
    @Column(name = "created_at_usuario")
    private LocalDateTime createdAtUsuario;
    
    @PrePersist
    protected void onCreate() {
        createdAtUsuario = LocalDateTime.now();
    }
}