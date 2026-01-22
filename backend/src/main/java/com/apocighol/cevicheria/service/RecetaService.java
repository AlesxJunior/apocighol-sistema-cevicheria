package com.apocighol.cevicheria.service;

import com.apocighol.cevicheria.model.Insumo;
import com.apocighol.cevicheria.model.Receta;
import com.apocighol.cevicheria.repository.InsumoRepository;
import com.apocighol.cevicheria.repository.RecetaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio para gestión de Recetas
 * Maneja la relación producto-insumo y el descuento automático
 */
@Service
@Transactional
public class RecetaService {
    
    @Autowired
    private RecetaRepository recetaRepository;
    
    @Autowired
    private InsumoRepository insumoRepository;
    
    @Autowired
    private InsumoService insumoService;
    
    // ==========================================
    // CRUD DE RECETAS
    // ==========================================
    
    /**
     * Obtiene la receta completa de un producto
     */
    public List<Receta> obtenerRecetaDeProducto(Long idProducto) {
        return recetaRepository.findByIdProductoConInsumo(idProducto);
    }
    
    /**
     * Verifica si un producto tiene receta
     */
    public boolean tieneReceta(Long idProducto) {
        return recetaRepository.existsByIdProducto(idProducto);
    }
    
    /**
     * Asigna o actualiza la receta completa de un producto
     * Elimina la receta anterior y crea la nueva
     */
    public List<Receta> asignarReceta(Long idProducto, List<Map<String, Object>> insumos) {
        // Eliminar receta anterior
        recetaRepository.deleteByIdProducto(idProducto);
        
        List<Receta> nuevaReceta = new ArrayList<>();
        
        for (Map<String, Object> insumoData : insumos) {
            Long idInsumo = Long.valueOf(insumoData.get("idInsumo").toString());
            BigDecimal cantidad = new BigDecimal(insumoData.get("cantidad").toString());
            
            // Validar que el insumo existe
            if (!insumoRepository.existsById(idInsumo)) {
                throw new RuntimeException("Insumo no encontrado: " + idInsumo);
            }
            
            Receta receta = new Receta(idProducto, idInsumo, cantidad);
            nuevaReceta.add(recetaRepository.save(receta));
        }
        
        System.out.println("📋 Receta asignada al producto " + idProducto + " con " + nuevaReceta.size() + " insumos");
        
        return nuevaReceta;
    }
    
    /**
     * Agrega un insumo a la receta de un producto
     */
    public Receta agregarInsumoAReceta(Long idProducto, Long idInsumo, BigDecimal cantidad) {
        // Verificar si ya existe
        Receta existente = recetaRepository.findByProductoAndInsumo(idProducto, idInsumo);
        
        if (existente != null) {
            // Actualizar cantidad
            existente.setCantidadNecesaria(cantidad);
            return recetaRepository.save(existente);
        }
        
        // Crear nuevo
        Receta nueva = new Receta(idProducto, idInsumo, cantidad);
        return recetaRepository.save(nueva);
    }
    
    /**
     * Elimina un insumo de la receta
     */
    public void eliminarInsumoDeReceta(Long idProducto, Long idInsumo) {
        recetaRepository.deleteByProductoAndInsumo(idProducto, idInsumo);
    }
    
    /**
     * Elimina toda la receta de un producto
     */
    public void eliminarReceta(Long idProducto) {
        recetaRepository.deleteByIdProducto(idProducto);
        System.out.println("🗑️ Receta eliminada del producto " + idProducto);
    }
    
    // ==========================================
    // 🔥 DESCUENTO AUTOMÁTICO DE INSUMOS
    // ==========================================
    
    /**
     * Descuenta los insumos al crear un pedido
     * Se llama cuando se crea un pedido con productos
     * 
     * @param idProducto ID del producto vendido
     * @param cantidadVendida Cantidad de ese producto vendido
     * @return Lista de insumos descontados con sus cantidades
     */
    public List<Map<String, Object>> descontarInsumosPorProducto(Long idProducto, int cantidadVendida) {
        List<Receta> receta = recetaRepository.findByIdProducto(idProducto);
        List<Map<String, Object>> resultado = new ArrayList<>();
        
        if (receta.isEmpty()) {
            System.out.println("⚠️ Producto " + idProducto + " no tiene receta asignada");
            return resultado;
        }
        
        System.out.println("📦 Descontando insumos para " + cantidadVendida + " unidad(es) del producto " + idProducto);
        
        for (Receta item : receta) {
            // Calcular cantidad total a descontar
            BigDecimal cantidadTotal = item.getCantidadNecesaria()
                    .multiply(BigDecimal.valueOf(cantidadVendida));
            
            // Descontar del stock
            boolean descontado = insumoService.disminuirStock(item.getIdInsumo(), cantidadTotal);
            
            // Obtener info del insumo para el resultado
            Insumo insumo = insumoRepository.findById(item.getIdInsumo()).orElse(null);
            
            Map<String, Object> info = new HashMap<>();
            info.put("idInsumo", item.getIdInsumo());
            info.put("nombreInsumo", insumo != null ? insumo.getNombreInsumo() : "Desconocido");
            info.put("cantidadDescontada", cantidadTotal);
            info.put("stockRestante", insumo != null ? insumo.getStockActual() : BigDecimal.ZERO);
            info.put("descontadoCompletamente", descontado);
            
            resultado.add(info);
        }
        
        return resultado;
    }
    
    /**
     * Descuenta insumos para múltiples productos de un pedido
     * 
     * @param productosDelPedido Lista de mapas con {idProducto, cantidad}
     * @return Resumen del descuento
     */
    public Map<String, Object> descontarInsumosDePedido(List<Map<String, Object>> productosDelPedido) {
        Map<String, Object> resumen = new HashMap<>();
        List<Map<String, Object>> detalles = new ArrayList<>();
        int totalInsumosDescontados = 0;
        List<String> alertasStockBajo = new ArrayList<>();
        
        for (Map<String, Object> producto : productosDelPedido) {
            Long idProducto = Long.valueOf(producto.get("idProducto").toString());
            int cantidad = Integer.parseInt(producto.get("cantidad").toString());
            
            List<Map<String, Object>> descuentos = descontarInsumosPorProducto(idProducto, cantidad);
            
            for (Map<String, Object> descuento : descuentos) {
                detalles.add(descuento);
                totalInsumosDescontados++;
                
                // Verificar si quedó con stock bajo
                BigDecimal stockRestante = (BigDecimal) descuento.get("stockRestante");
                if (stockRestante.compareTo(BigDecimal.ZERO) <= 0) {
                    alertasStockBajo.add(descuento.get("nombreInsumo") + " (AGOTADO)");
                }
            }
        }
        
        resumen.put("totalInsumosDescontados", totalInsumosDescontados);
        resumen.put("detalles", detalles);
        resumen.put("alertasStockBajo", alertasStockBajo);
        
        System.out.println("✅ Descuento completado: " + totalInsumosDescontados + " insumos procesados");
        
        if (!alertasStockBajo.isEmpty()) {
            System.out.println("⚠️ ALERTAS DE STOCK: " + alertasStockBajo);
        }
        
        return resumen;
    }
    
    // ==========================================
    // VERIFICACIÓN DE DISPONIBILIDAD
    // ==========================================
    
    /**
     * Verifica si hay suficientes insumos para preparar un producto
     */
    public Map<String, Object> verificarDisponibilidad(Long idProducto, int cantidad) {
        Map<String, Object> resultado = new HashMap<>();
        List<Receta> receta = recetaRepository.findByIdProducto(idProducto);
        
        if (receta.isEmpty()) {
            resultado.put("disponible", true);
            resultado.put("mensaje", "Producto sin receta asignada");
            return resultado;
        }
        
        boolean disponible = true;
        List<Map<String, Object>> insuficientes = new ArrayList<>();
        
        for (Receta item : receta) {
            BigDecimal cantidadNecesaria = item.getCantidadNecesaria()
                    .multiply(BigDecimal.valueOf(cantidad));
            
            Insumo insumo = insumoRepository.findById(item.getIdInsumo()).orElse(null);
            
            if (insumo == null || insumo.getStockActual().compareTo(cantidadNecesaria) < 0) {
                disponible = false;
                
                Map<String, Object> info = new HashMap<>();
                info.put("insumo", insumo != null ? insumo.getNombreInsumo() : "Desconocido");
                info.put("necesario", cantidadNecesaria);
                info.put("disponible", insumo != null ? insumo.getStockActual() : BigDecimal.ZERO);
                insuficientes.add(info);
            }
        }
        
        resultado.put("disponible", disponible);
        resultado.put("insuficientes", insuficientes);
        
        return resultado;
    }
    
    // ==========================================
    // CONSULTAS
    // ==========================================
    
    /**
     * Lista productos que usan un insumo específico
     */
    public List<Long> productosQueUsanInsumo(Long idInsumo) {
        List<Receta> recetas = recetaRepository.findByIdInsumo(idInsumo);
        return recetas.stream().map(Receta::getIdProducto).distinct().toList();
    }
    
    /**
     * Lista IDs de productos sin receta
     */
    public List<Long> productosSinReceta() {
        return recetaRepository.findProductosSinReceta();
    }
}