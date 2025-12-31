package com.apocighol.cevicheria.service;

import com.apocighol.cevicheria.model.Usuario;
import com.apocighol.cevicheria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    // Obtener todos los usuarios
    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }
    
    // Buscar por ID
    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }
    
    // Login - buscar por username y password
    public Usuario login(String username, String password) {
        Optional<Usuario> usuario = usuarioRepository.findByUsernameUsuario(username);
        if (usuario.isPresent() && usuario.get().getPasswordUsuario().equals(password)) {
            return usuario.get();
        }
        return null;
    }
    
    // Crear usuario
    public Usuario crear(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    
    // Actualizar usuario
    public Usuario actualizar(Long id, Usuario usuarioActualizado) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setUsernameUsuario(usuarioActualizado.getUsernameUsuario());
            usuario.setPasswordUsuario(usuarioActualizado.getPasswordUsuario());
            usuario.setNombreUsuario(usuarioActualizado.getNombreUsuario());
            usuario.setRolUsuario(usuarioActualizado.getRolUsuario());
            usuario.setActivoUsuario(usuarioActualizado.getActivoUsuario());
            return usuarioRepository.save(usuario);
        }).orElse(null);
    }
    
    // Eliminar usuario
    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }
}