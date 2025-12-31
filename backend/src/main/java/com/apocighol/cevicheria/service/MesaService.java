package com.apocighol.cevicheria.service;

import com.apocighol.cevicheria.model.Mesa;
import com.apocighol.cevicheria.repository.MesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * ==========================================
 * MESA SERVICE - LÓGICA DE NEGOCIO
 * VERSIÓN DEFINITIVA
 * ==========================================
 */
@Service
@Transactional
public class MesaService {

    @Autowired
    private MesaRepository mesaRepository;

    // ==========================================
    // CRUD BÁSICO
    // ==========================================

    public List<Mesa> obtenerTodas() {
        return mesaRepository.findAllActivasOrdenadas();
    }

    public Optional<Mesa> obtenerPorId(Long id) {
        return mesaRepository.findById(id);
    }

    public Optional<Mesa> obtenerPorNumero(Integer numero) {
        return mesaRepository.findByNumeroMesa(numero);
    }

    public Mesa crear(Mesa mesa) {
        if (mesaRepository.existsByNumeroMesa(mesa.getNumeroMesa())) {
            throw new RuntimeException("Ya existe una mesa con el número " + mesa.getNumeroMesa());
        }
        if (mesa.getEstadoMesa() == null) mesa.setEstadoMesa("disponible");
        if (mesa.getActivaMesa() == null) mesa.setActivaMesa(true);
        if (mesa.getTotalConsumoMesa() == null) mesa.setTotalConsumoMesa(BigDecimal.ZERO);
        if (mesa.getCapacidadMesa() == null) mesa.setCapacidadMesa(4);
        if (mesa.getPersonasActuales() == null) mesa.setPersonasActuales(0);
        
        return mesaRepository.save(mesa);
    }

    public Mesa actualizar(Long id, Mesa mesaActualizada) {
        return mesaRepository.findById(id)
            .map(mesa -> {
                if (mesaActualizada.getNumeroMesa() != null) {
                    if (!mesa.getNumeroMesa().equals(mesaActualizada.getNumeroMesa()) 
                        && mesaRepository.existsByNumeroMesa(mesaActualizada.getNumeroMesa())) {
                        throw new RuntimeException("Ya existe una mesa con el número " + mesaActualizada.getNumeroMesa());
                    }
                    mesa.setNumeroMesa(mesaActualizada.getNumeroMesa());
                }
                if (mesaActualizada.getCapacidadMesa() != null) {
                    mesa.setCapacidadMesa(mesaActualizada.getCapacidadMesa());
                }
                if (mesaActualizada.getEstadoMesa() != null) {
                    mesa.setEstadoMesa(mesaActualizada.getEstadoMesa());
                }
                if (mesaActualizada.getMeseroAsignado() != null) {
                    mesa.setMeseroAsignado(mesaActualizada.getMeseroAsignado());
                }
                if (mesaActualizada.getPersonasActuales() != null) {
                    mesa.setPersonasActuales(mesaActualizada.getPersonasActuales());
                }
                if (mesaActualizada.getTotalConsumoMesa() != null) {
                    mesa.setTotalConsumoMesa(mesaActualizada.getTotalConsumoMesa());
                }
                return mesaRepository.save(mesa);
            })
            .orElse(null);
    }

    public void eliminar(Long id) {
        mesaRepository.findById(id).ifPresent(mesa -> {
            mesa.setActivaMesa(false);
            mesaRepository.save(mesa);
        });
    }

    // ==========================================
    // OPERACIONES DE ESTADO
    // ==========================================

    public Mesa ocuparMesa(Long id, Integer personas, String mesero) {
        return mesaRepository.findById(id)
            .map(mesa -> {
                if (!mesa.estaDisponible()) {
                    throw new RuntimeException("La mesa " + mesa.getNumeroMesa() + " no está disponible");
                }
                if (personas > mesa.getCapacidadMesa()) {
                    throw new RuntimeException("La mesa " + mesa.getNumeroMesa() + " tiene capacidad para " + mesa.getCapacidadMesa() + " personas");
                }
                mesa.ocupar(personas, mesero);
                return mesaRepository.save(mesa);
            })
            .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));
    }

    public Mesa liberarMesa(Long id) {
        return mesaRepository.findById(id)
            .map(mesa -> {
                mesa.liberar();
                return mesaRepository.save(mesa);
            })
            .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));
    }

    public Mesa reservarMesa(Long id) {
        return mesaRepository.findById(id)
            .map(mesa -> {
                if (!mesa.estaDisponible()) {
                    throw new RuntimeException("La mesa " + mesa.getNumeroMesa() + " no está disponible para reservar");
                }
                mesa.setEstadoMesa("reservada");
                return mesaRepository.save(mesa);
            })
            .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));
    }

    public Mesa actualizarTotal(Long id, BigDecimal total) {
        return mesaRepository.findById(id)
            .map(mesa -> {
                mesa.setTotalConsumoMesa(total);
                return mesaRepository.save(mesa);
            })
            .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));
    }

    // ==========================================
    // CONSULTAS
    // ==========================================

    public List<Mesa> obtenerDisponibles() {
        return mesaRepository.findMesasDisponibles();
    }

    public List<Mesa> obtenerOcupadas() {
        return mesaRepository.findMesasOcupadas();
    }

    public List<Mesa> obtenerPorEstado(String estado) {
        return mesaRepository.findByEstadoMesaAndActivaMesaTrue(estado);
    }

    public List<Mesa> obtenerPorMesero(String mesero) {
        return mesaRepository.findByMeseroAsignado(mesero);
    }

    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    public long contarPorEstado(String estado) {
        return mesaRepository.countByEstadoMesa(estado);
    }

    public long contarTotal() {
        return mesaRepository.countActivas();
    }

    public long[] obtenerResumen() {
        return new long[] {
            contarPorEstado("disponible"),
            contarPorEstado("ocupada"),
            contarPorEstado("reservada"),
            contarTotal()
        };
    }
}