package com.apocighol.cevicheria.service;

import com.apocighol.cevicheria.model.Proveedor;
import com.apocighol.cevicheria.repository.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Servicio para gestión de Proveedores
 */
@Service
@Transactional
public class ProveedorService {
    
    @Autowired
    private ProveedorRepository proveedorRepository;
    
    // ==========================================
    // CRUD BÁSICO
    // ==========================================
    
    /**
     * Lista todos los proveedores activos
     */
    public List<Proveedor> listarActivos() {
        return proveedorRepository.findByActivoProveedorTrueOrderByNombreProveedorAsc();
    }
    
    /**
     * Lista todos los proveedores
     */
    public List<Proveedor> listarTodos() {
        return proveedorRepository.findAllByOrderByNombreProveedorAsc();
    }
    
    /**
     * Busca proveedor por ID
     */
    public Optional<Proveedor> buscarPorId(Long id) {
        return proveedorRepository.findById(id);
    }
    
    /**
     * Busca proveedor por RUC/DNI
     */
    public Optional<Proveedor> buscarPorRuc(String ruc) {
        return proveedorRepository.findByRucProveedor(ruc);
    }
    
    /**
     * Crea un nuevo proveedor
     */
    public Proveedor crear(Proveedor proveedor) {
        // Validar documento si existe
        if (proveedor.getRucProveedor() != null && !proveedor.getRucProveedor().isEmpty()) {
            if (!proveedor.tieneDocumentoValido()) {
                throw new RuntimeException("RUC/DNI inválido. Debe ser 8 dígitos (DNI) o 11 dígitos (RUC)");
            }
            
            // Verificar duplicado
            if (proveedorRepository.existsByRucProveedor(proveedor.getRucProveedor())) {
                throw new RuntimeException("Ya existe un proveedor con ese RUC/DNI");
            }
        }
        
        proveedor.setFechaCreacion(LocalDateTime.now());
        proveedor.setActivoProveedor(true);
        
        System.out.println("✅ Proveedor creado: " + proveedor.getNombreProveedor());
        
        return proveedorRepository.save(proveedor);
    }
    
    /**
     * Actualiza un proveedor existente
     */
    public Proveedor actualizar(Long id, Proveedor datosActualizados) {
        Proveedor proveedor = proveedorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        
        // Validar documento si cambió
        if (datosActualizados.getRucProveedor() != null && 
            !datosActualizados.getRucProveedor().equals(proveedor.getRucProveedor())) {
            
            if (!datosActualizados.tieneDocumentoValido()) {
                throw new RuntimeException("RUC/DNI inválido");
            }
            
            // Verificar duplicado
            Optional<Proveedor> existente = proveedorRepository.findByRucProveedor(datosActualizados.getRucProveedor());
            if (existente.isPresent() && !existente.get().getIdProveedor().equals(id)) {
                throw new RuntimeException("Ya existe otro proveedor con ese RUC/DNI");
            }
        }
        
        proveedor.setNombreProveedor(datosActualizados.getNombreProveedor());
        proveedor.setRucProveedor(datosActualizados.getRucProveedor());
        proveedor.setTelefonoProveedor(datosActualizados.getTelefonoProveedor());
        proveedor.setEmailProveedor(datosActualizados.getEmailProveedor());
        proveedor.setDireccionProveedor(datosActualizados.getDireccionProveedor());
        
        return proveedorRepository.save(proveedor);
    }
    
    /**
     * Elimina un proveedor (soft delete - lo desactiva)
     */
    public void desactivar(Long id) {
        Proveedor proveedor = proveedorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        
        proveedor.setActivoProveedor(false);
        proveedorRepository.save(proveedor);
        
        System.out.println("🗑️ Proveedor desactivado: " + proveedor.getNombreProveedor());
    }
    
    /**
     * Elimina un proveedor permanentemente
     */
    public void eliminar(Long id) {
        if (!proveedorRepository.existsById(id)) {
            throw new RuntimeException("Proveedor no encontrado");
        }
        proveedorRepository.deleteById(id);
        System.out.println("🗑️ Proveedor eliminado permanentemente: " + id);
    }
    
    // ==========================================
    // BÚSQUEDAS
    // ==========================================
    
    /**
     * Busca proveedores por texto
     */
    public List<Proveedor> buscar(String termino) {
        return proveedorRepository.findByNombreProveedorContainingIgnoreCase(termino);
    }
    
    // ==========================================
    // ESTADÍSTICAS
    // ==========================================
    
    /**
     * Cuenta proveedores activos
     */
    public long contarActivos() {
        return proveedorRepository.countProveedoresActivos();
    }
}