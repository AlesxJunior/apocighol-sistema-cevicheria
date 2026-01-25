package com.apocighol.cevicheria.service;

import com.apocighol.cevicheria.model.Mesa;
import com.apocighol.cevicheria.repository.MesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * ==========================================
 * MESA SERVICE - LÓGICA DE NEGOCIO
 * VERSIÓN SIN VALIDACIÓN DE CAPACIDAD
 * ==========================================
 */
@Service
public class MesaService {

    @Autowired
    private MesaRepository mesaRepository;

    // ==========================================
    // LISTAR TODAS LAS MESAS
    // ==========================================
    public List<Mesa> listarMesas() {
        return mesaRepository.findAll();
    }

    // ==========================================
    // BUSCAR MESA POR ID
    // ==========================================
    public Optional<Mesa> buscarPorId(Long id) {
        return mesaRepository.findById(id);
    }

    // ==========================================
    // BUSCAR MESA POR NÚMERO
    // ==========================================
    public Optional<Mesa> buscarPorNumero(Integer numeroMesa) {
        return mesaRepository.findByNumeroMesa(numeroMesa);
    }

    // ==========================================
    // CREAR NUEVA MESA
    // ==========================================
    public Mesa crearMesa(Mesa mesa) {
        // Validar que no exista el número de mesa
        Optional<Mesa> mesaExistente = mesaRepository.findByNumeroMesa(mesa.getNumeroMesa());
        if (mesaExistente.isPresent()) {
            throw new IllegalArgumentException("Ya existe una mesa con el número " + mesa.getNumeroMesa());
        }
        
        // Valores por defecto
        if (mesa.getEstadoMesa() == null) {
            mesa.setEstadoMesa("disponible");
        }
        if (mesa.getCapacidadMesa() == null) {
            mesa.setCapacidadMesa(4);
        }
        
        return mesaRepository.save(mesa);
    }

    // ==========================================
    // OCUPAR MESA - SIN VALIDACIÓN DE CAPACIDAD
    // ==========================================
    public Mesa ocuparMesa(Integer numeroMesa, Integer personas, String mesero) {
        Mesa mesa = mesaRepository.findByNumeroMesa(numeroMesa)
                .orElseThrow(() -> new IllegalArgumentException("Mesa no encontrada"));

        if (!"disponible".equalsIgnoreCase(mesa.getEstadoMesa())) {
            throw new IllegalStateException("La mesa no está disponible");
        }

        // 🔥 SIN VALIDACIÓN DE CAPACIDAD
        // El negocio puede juntar mesas si necesitan más espacio
        
        // Ocupar la mesa
        mesa.ocupar(personas, mesero);
        return mesaRepository.save(mesa);
    }

    // ==========================================
    // LIBERAR MESA
    // ==========================================
    public Mesa liberarMesa(Long id, String motivo) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mesa no encontrada"));

        mesa.liberar();
        if (motivo != null && !motivo.trim().isEmpty()) {
            mesa.setMotivoLiberacion(motivo);
        }
        
        return mesaRepository.save(mesa);
    }

    // ==========================================
    // ACTUALIZAR TOTAL CONSUMO
    // ==========================================
    public Mesa actualizarTotal(Integer numeroMesa, BigDecimal nuevoTotal) {
        Mesa mesa = mesaRepository.findByNumeroMesa(numeroMesa)
                .orElseThrow(() -> new IllegalArgumentException("Mesa no encontrada"));

        mesa.setTotalConsumoMesa(nuevoTotal);
        return mesaRepository.save(mesa);
    }

    // ==========================================
    // ELIMINAR MESA
    // ==========================================
    public void eliminarMesa(Long id) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mesa no encontrada"));

        if ("ocupada".equalsIgnoreCase(mesa.getEstadoMesa())) {
            throw new IllegalStateException("No se puede eliminar una mesa ocupada");
        }

        mesaRepository.delete(mesa);
    }

    // ==========================================
    // LISTAR MESAS DISPONIBLES
    // ==========================================
    public List<Mesa> listarMesasDisponibles() {
        return mesaRepository.findMesasDisponibles();
    }

    // ==========================================
    // LISTAR MESAS OCUPADAS
    // ==========================================
    public List<Mesa> listarMesasOcupadas() {
        return mesaRepository.findMesasOcupadas();
    }

    // ==========================================
    // CONTAR MESAS POR ESTADO
    // ==========================================
    public long contarPorEstado(String estado) {
        return mesaRepository.countByEstadoMesa(estado);
    }
}