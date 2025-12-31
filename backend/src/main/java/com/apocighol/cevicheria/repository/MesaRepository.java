package com.apocighol.cevicheria.repository;

import com.apocighol.cevicheria.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * ==========================================
 * MESA REPOSITORY - REPOSITORIO JPA
 * VERSIÓN DEFINITIVA
 * ==========================================
 */
@Repository
public interface MesaRepository extends JpaRepository<Mesa, Long> {

    // Buscar mesa por número
    Optional<Mesa> findByNumeroMesa(Integer numeroMesa);

    // Verificar si existe mesa con ese número
    boolean existsByNumeroMesa(Integer numeroMesa);

    // Mesas activas
    List<Mesa> findByActivaMesaTrue();

    // Mesas por estado
    List<Mesa> findByEstadoMesa(String estado);

    // Mesas activas por estado
    List<Mesa> findByEstadoMesaAndActivaMesaTrue(String estado);

    // Mesas disponibles
    @Query("SELECT m FROM Mesa m WHERE m.estadoMesa = 'disponible' AND (m.activaMesa = true OR m.activaMesa IS NULL) ORDER BY m.numeroMesa")
    List<Mesa> findMesasDisponibles();

    // Mesas ocupadas
    @Query("SELECT m FROM Mesa m WHERE m.estadoMesa = 'ocupada' AND (m.activaMesa = true OR m.activaMesa IS NULL) ORDER BY m.numeroMesa")
    List<Mesa> findMesasOcupadas();

    // Mesas por mesero
    @Query("SELECT m FROM Mesa m WHERE m.meseroAsignado = ?1 AND (m.activaMesa = true OR m.activaMesa IS NULL)")
    List<Mesa> findByMeseroAsignado(String mesero);

    // Contar por estado
    @Query("SELECT COUNT(m) FROM Mesa m WHERE m.estadoMesa = ?1 AND (m.activaMesa = true OR m.activaMesa IS NULL)")
    long countByEstadoMesa(String estado);

    // Contar activas
    @Query("SELECT COUNT(m) FROM Mesa m WHERE m.activaMesa = true OR m.activaMesa IS NULL")
    long countActivas();

    // Todas las mesas activas ordenadas
    @Query("SELECT m FROM Mesa m WHERE m.activaMesa = true OR m.activaMesa IS NULL ORDER BY m.numeroMesa ASC")
    List<Mesa> findAllActivasOrdenadas();
}