package com.apocighol.cevicheria.service;

import com.apocighol.cevicheria.model.Insumo;
import com.apocighol.cevicheria.repository.InsumoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Servicio para gestión de Insumos
 * Contiene la lógica de negocio para el inventario
 */
@Service
@Transactional
public class InsumoService {
    
    @Autowired
    private InsumoRepository insumoRepository;
    
    // ==========================================
    // CRUD BÁSICO
    // ==========================================
    
    /**
     * Lista todos los insumos ordenados por nombre
     */
    public List<Insumo> listarTodos() {
        return insumoRepository.findAllByOrderByNombreInsumoAsc();
    }
    
    /**
     * Busca insumo por ID
     */
    public Optional<Insumo> buscarPorId(Long id) {
        return insumoRepository.findById(id);
    }
    
    /**
     * Busca insumo por nombre
     */
    public Optional<Insumo> buscarPorNombre(String nombre) {
        return insumoRepository.findByNombreInsumo(nombre);
    }
    
    /**
     * Crea un nuevo insumo
     */
    public Insumo crear(Insumo insumo) {
        // Validar que no exista con el mismo nombre
        if (insumoRepository.findByNombreInsumo(insumo.getNombreInsumo()).isPresent()) {
            throw new RuntimeException("Ya existe un insumo con ese nombre");
        }
        
        // Valores por defecto
        if (insumo.getStockActual() == null) {
            insumo.setStockActual(BigDecimal.ZERO);
        }
        if (insumo.getStockMinimo() == null) {
            insumo.setStockMinimo(BigDecimal.ZERO);
        }
        if (insumo.getUnidadMedida() == null || insumo.getUnidadMedida().isEmpty()) {
            insumo.setUnidadMedida("unidades");
        }
        
        insumo.setFechaCreacion(LocalDateTime.now());
        insumo.setFechaActualizacion(LocalDateTime.now());
        
        return insumoRepository.save(insumo);
    }
    
    /**
     * Actualiza un insumo existente
     */
    public Insumo actualizar(Long id, Insumo datosActualizados) {
        Insumo insumo = insumoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));
        
        insumo.setNombreInsumo(datosActualizados.getNombreInsumo());
        insumo.setUnidadMedida(datosActualizados.getUnidadMedida());
        insumo.setStockMinimo(datosActualizados.getStockMinimo());
        insumo.setCategoriaInsumo(datosActualizados.getCategoriaInsumo());
        insumo.setFechaActualizacion(LocalDateTime.now());
        
        return insumoRepository.save(insumo);
    }
    
    /**
     * Elimina un insumo
     */
    public void eliminar(Long id) {
        if (!insumoRepository.existsById(id)) {
            throw new RuntimeException("Insumo no encontrado");
        }
        insumoRepository.deleteById(id);
    }
    
    // ==========================================
    // GESTIÓN DE STOCK
    // ==========================================
    
    /**
     * Aumenta el stock de un insumo (usado en COMPRAS)
     */
    public Insumo aumentarStock(Long idInsumo, BigDecimal cantidad) {
        Insumo insumo = insumoRepository.findById(idInsumo)
            .orElseThrow(() -> new RuntimeException("Insumo no encontrado: " + idInsumo));
        
        insumo.aumentarStock(cantidad);
        
        System.out.println("📦 Stock aumentado: " + insumo.getNombreInsumo() + 
                          " +" + cantidad + " = " + insumo.getStockActual());
        
        return insumoRepository.save(insumo);
    }
    
    /**
     * Disminuye el stock de un insumo (usado en PEDIDOS/VENTAS)
     * @return true si se pudo descontar completamente
     */
    public boolean disminuirStock(Long idInsumo, BigDecimal cantidad) {
        Insumo insumo = insumoRepository.findById(idInsumo)
            .orElseThrow(() -> new RuntimeException("Insumo no encontrado: " + idInsumo));
        
        boolean resultado = insumo.disminuirStock(cantidad);
        insumoRepository.save(insumo);
        
        System.out.println("📦 Stock disminuido: " + insumo.getNombreInsumo() + 
                          " -" + cantidad + " = " + insumo.getStockActual() +
                          (resultado ? " ✅" : " ⚠️ Stock insuficiente"));
        
        return resultado;
    }
    
    /**
     * Establece el stock exacto (ajuste manual)
     */
    public Insumo establecerStock(Long idInsumo, BigDecimal nuevoStock, String motivo) {
        Insumo insumo = insumoRepository.findById(idInsumo)
            .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));
        
        BigDecimal stockAnterior = insumo.getStockActual();
        insumo.setStockActual(nuevoStock);
        insumo.setFechaActualizacion(LocalDateTime.now());
        
        System.out.println("📦 Ajuste de stock: " + insumo.getNombreInsumo() + 
                          " [" + stockAnterior + " → " + nuevoStock + "] Motivo: " + motivo);
        
        return insumoRepository.save(insumo);
    }
    
    // ==========================================
    // CONSULTAS DE STOCK
    // ==========================================
    
    /**
     * Lista insumos con stock bajo
     */
    public List<Insumo> listarInsumosConStockBajo() {
        return insumoRepository.findInsumosConStockBajo();
    }
    
    /**
     * Lista insumos agotados
     */
    public List<Insumo> listarInsumosAgotados() {
        return insumoRepository.findInsumosAgotados();
    }
    
    /**
     * Cuenta insumos con stock bajo
     */
    public long contarInsumosConStockBajo() {
        return insumoRepository.countInsumosConStockBajo();
    }
    
    /**
     * Verifica si hay suficiente stock de un insumo
     */
    public boolean hayStockSuficiente(Long idInsumo, BigDecimal cantidadRequerida) {
        Optional<Insumo> insumoOpt = insumoRepository.findById(idInsumo);
        
        if (insumoOpt.isEmpty()) {
            return false;
        }
        
        return insumoOpt.get().getStockActual().compareTo(cantidadRequerida) >= 0;
    }
    
    // ==========================================
    // BÚSQUEDAS
    // ==========================================
    
    /**
     * Busca insumos por texto
     */
    public List<Insumo> buscar(String termino) {
        return insumoRepository.findByNombreInsumoContainingIgnoreCase(termino);
    }
    
    /**
     * Lista insumos por categoría
     */
    public List<Insumo> listarPorCategoria(String categoria) {
        return insumoRepository.findByCategoriaInsumo(categoria);
    }
    
    // ==========================================
    // ESTADÍSTICAS
    // ==========================================
    
    /**
     * Obtiene estadísticas generales del inventario
     */
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Insumo> todos = insumoRepository.findAll();
        
        stats.put("totalInsumos", todos.size());
        stats.put("insumosStockBajo", insumoRepository.countInsumosConStockBajo());
        stats.put("categorias", insumoRepository.findCategoriasUnicas());
        
        return stats;
    }
}