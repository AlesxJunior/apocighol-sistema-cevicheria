package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Buscar usuario por username (para login)
    Optional<Usuario> findByUsernameUsuario(String usernameUsuario);
    
    // Verificar si existe username
    Boolean existsByUsernameUsuario(String usernameUsuario);
}