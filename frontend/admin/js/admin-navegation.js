/**
 * ═══════════════════════════════════════════════════════════
 * ADMIN-NAVIGATION.JS
 * Sistema centralizado de navegación del panel administrativo
 * ═══════════════════════════════════════════════════════════
 * 
 * Descripción: Maneja toda la navegación entre secciones del panel,
 * eliminando código duplicado de los módulos individuales.
 * 
 * Responsabilidades:
 * - Detectar clics en enlaces del sidebar
 * - Cambiar entre secciones (ocultar/mostrar)
 * - Actualizar estado visual del sidebar
 * - Notificar a cada módulo cuando se activa
 * - Mantener historial de navegación
 * 
 * Autor: Grupo nº7 - LP2
 * Proyecto: APOCIGHOL - Sistema de Gestión para Cevichería
 * ═══════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════
// VARIABLES GLOBALES DEL SISTEMA DE NAVEGACIÓN
// ═══════════════════════════════════════════════════════════

let seccionActual = 'dashboard'; // Sección que se está mostrando actualmente
let historialNavegacion = []; // Array para guardar el historial de navegación

// ═══════════════════════════════════════════════════════════
// INICIALIZACIÓN DEL SISTEMA
// ═══════════════════════════════════════════════════════════

/**
 * Inicializa el sistema completo de navegación
 * Se ejecuta automáticamente cuando carga el DOM
 */
function inicializarSistemaNavegacion() {
    console.log('🧭 Inicializando sistema de navegación centralizado...');
    
    // Paso 1: Configurar eventos de clic en enlaces del sidebar
    configurarEnlacesSidebar();
    
    // Paso 2: Mostrar la sección inicial (dashboard por defecto)
    mostrarSeccionInicial();
    
    console.log('✅ Sistema de navegación listo y funcionando');
}

// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN DE EVENTOS EN SIDEBAR
// ═══════════════════════════════════════════════════════════

/**
 * Configura los event listeners en todos los enlaces del sidebar
 * Detecta cuándo el usuario hace clic en un enlace de navegación
 */
function configurarEnlacesSidebar() {
    // Seleccionar todos los enlaces con la clase 'enlace-nav'
    const enlacesNavegacion = document.querySelectorAll('.enlace-nav');
    
    // Agregar evento 'click' a cada enlace
    enlacesNavegacion.forEach(enlace => {
        enlace.addEventListener('click', function(evento) {
            // Prevenir comportamiento por defecto del enlace
            evento.preventDefault();
            
            // Obtener el nombre de la sección desde el atributo data-seccion
            const nombreSeccion = this.dataset.seccion;
            
            // Navegar a esa sección
            navegarASeccion(nombreSeccion);
        });
    });
    
    console.log(`📍 ${enlacesNavegacion.length} enlaces de navegación configurados`);
}

// ═══════════════════════════════════════════════════════════
// FUNCIONES PRINCIPALES DE NAVEGACIÓN
// ═══════════════════════════════════════════════════════════

/**
 * Navega a una sección específica del panel
 * @param {string} nombreSeccion - Nombre de la sección destino ('dashboard', 'mesas', etc.)
 */
function navegarASeccion(nombreSeccion) {
    console.log(`🧭 Navegando de "${seccionActual}" hacia "${nombreSeccion}"`);
    
    // Solo guardar en historial si es una sección diferente
    if (seccionActual !== nombreSeccion) {
        historialNavegacion.push(seccionActual);
        console.log(`📚 Historial actualizado: ${historialNavegacion.length} páginas`);
    }
    
    // Paso 1: Ocultar todas las secciones
    ocultarTodasLasSecciones();
    
    // Paso 2: Mostrar la nueva sección
    mostrarSeccion(nombreSeccion);
    
    // Paso 3: Actualizar el estado visual del sidebar
    actualizarEstadoSidebar(nombreSeccion);
    
    // Paso 4: 🔥 IMPORTANTE - Notificar al módulo que se activó
    notificarModuloActivo(nombreSeccion);
    
    // Paso 5: Actualizar variable global
    seccionActual = nombreSeccion;
}


/**
 * Muestra la sección inicial cuando se carga el panel
 * Respeta el módulo inicial según el rol del usuario
 */
function mostrarSeccionInicial() {
    // 🔥 Verificar si auth.js definió un módulo inicial por rol
    let seccionInicial = 'dashboard'; // Por defecto
    
    if (window.moduloInicialPorRol) {
        seccionInicial = window.moduloInicialPorRol;
        console.log(`🎭 Módulo inicial por rol: ${seccionInicial}`);
    }
    
    console.log(`🏠 Mostrando sección inicial: ${seccionInicial}`);
    
    // Mostrar la sección correspondiente
    mostrarSeccion(seccionInicial);
    
    // Marcar enlace como activo en sidebar
    actualizarEstadoSidebar(seccionInicial);
    
    // Inicializar el módulo
    notificarModuloActivo(seccionInicial);
    
    // Actualizar variable global
    seccionActual = seccionInicial;
}

// ═══════════════════════════════════════════════════════════
// GESTIÓN DE VISIBILIDAD DE SECCIONES
// ═══════════════════════════════════════════════════════════

/**
 * Oculta todas las secciones del panel
 * Quita la clase 'activa' de cada sección
 */
function ocultarTodasLasSecciones() {
    // Seleccionar todas las secciones con la clase 'seccion'
    const todasLasSecciones = document.querySelectorAll('.seccion');
    
    // Quitar clase 'activa' de cada una
    todasLasSecciones.forEach(seccion => {
        seccion.classList.remove('activa');
    });
}

/**
 * Muestra una sección específica agregándole la clase 'activa'
 * @param {string} nombreSeccion - Nombre de la sección a mostrar
 */
function mostrarSeccion(nombreSeccion) {
    // Construir el ID de la sección (ej: 'seccion-dashboard')
    const idSeccion = `seccion-${nombreSeccion}`;
    
    // Buscar el elemento en el DOM
    const elementoSeccion = document.getElementById(idSeccion);
    
    if (elementoSeccion) {
        // Agregar clase 'activa' para mostrar la sección
        elementoSeccion.classList.add('activa');
        
        console.log(`✅ Sección "${nombreSeccion}" mostrada correctamente`);
    } else {
        // Si no se encuentra, mostrar error
        console.error(`❌ ERROR: No se encontró la sección con ID "${idSeccion}"`);
        console.error(`   Verifica que exista en el HTML: <section id="${idSeccion}" class="seccion">`);
    }
}

// ═══════════════════════════════════════════════════════════
// ACTUALIZACIÓN VISUAL DEL SIDEBAR
// ═══════════════════════════════════════════════════════════

/**
 * Actualiza el estado visual del sidebar
 * Marca el enlace activo y desmarca los demás
 * @param {string} nombreSeccion - Nombre de la sección activa
 */
function actualizarEstadoSidebar(nombreSeccion) {
    // Paso 1: Quitar clase 'activo' de TODOS los enlaces
    const todosLosEnlaces = document.querySelectorAll('.enlace-nav');
    todosLosEnlaces.forEach(enlace => {
        enlace.classList.remove('activo');
    });
    
    // Paso 2: Buscar el enlace correspondiente a la sección activa
    const enlaceActivo = document.querySelector(`.enlace-nav[data-seccion="${nombreSeccion}"]`);
    
    if (enlaceActivo) {
        // Agregar clase 'activo' solo al enlace correspondiente
        enlaceActivo.classList.add('activo');
        console.log(`🎨 Enlace "${nombreSeccion}" marcado como activo en sidebar`);
    } else {
        console.warn(`⚠️ No se encontró el enlace para la sección "${nombreSeccion}"`);
    }
}

// ═══════════════════════════════════════════════════════════
// 🔥 SISTEMA DE NOTIFICACIÓN A MÓDULOS
// ═══════════════════════════════════════════════════════════

/**
 * Notifica al módulo correspondiente que su sección fue activada
 * Llama a la función inicializar() de cada módulo
 * @param {string} nombreSeccion - Nombre de la sección activa
 */
function notificarModuloActivo(nombreSeccion) {
    console.log(`📢 Notificando al módulo de "${nombreSeccion}"...`);
    
    // Mapeo de nombres de secciones a nombres de módulos globales
    const mapaSeccionModulo = {
        'dashboard': 'Dashboard',
        'mesas': 'Mesas',
        'pedidos': 'Pedidos',
        'productos': 'Productos',
        'caja': 'Caja',
        'ventas': 'Ventas',
        'inventario': 'Inventario',
        'compras': 'Compras',
        'usuarios': 'Usuarios'  // 🔥 AGREGAR ESTA LÍNEA
    };
    
    // Obtener el nombre del módulo global
    const nombreModuloGlobal = mapaSeccionModulo[nombreSeccion];
    
    // Verificar que existe el módulo y tiene función inicializar()
    if (nombreModuloGlobal && 
        window[nombreModuloGlobal] && 
        typeof window[nombreModuloGlobal].inicializar === 'function') {
        
        // Llamar a la función inicializar() del módulo
        window[nombreModuloGlobal].inicializar();
        
        console.log(`✅ Módulo "${nombreModuloGlobal}" inicializado correctamente`);
    } else {
        // Advertencia si el módulo no está disponible
        console.warn(`⚠️ El módulo "${nombreModuloGlobal}" no está disponible o no tiene método inicializar()`);
        console.warn(`   Asegúrate de que el archivo del módulo esté cargado y exporte: window.${nombreModuloGlobal} = { inicializar }`);
    }
}

// ═══════════════════════════════════════════════════════════
// FUNCIONES DE NAVEGACIÓN PROGRAMÁTICA
// (Para que otros módulos puedan navegar desde código)
// ═══════════════════════════════════════════════════════════

/**
 * Permite navegar a una sección desde código JavaScript
 * Uso: Navegacion.irA('caja')
 * @param {string} nombreSeccion - Nombre de la sección destino
 */
function irASeccionProgramaticamente(nombreSeccion) {
    console.log(`🔗 Navegación programática solicitada hacia: ${nombreSeccion}`);
    navegarASeccion(nombreSeccion);
}

/**
 * Regresa a la sección anterior en el historial
 * Uso: Navegacion.atras()
 */
function volverAtras() {
    if (historialNavegacion.length > 0) {
        // Sacar la última sección del historial
        const seccionAnterior = historialNavegacion.pop();
        
        console.log(`⬅️ Regresando a la sección anterior: ${seccionAnterior}`);
        
        // Navegar a esa sección (sin agregar al historial otra vez)
        ocultarTodasLasSecciones();
        mostrarSeccion(seccionAnterior);
        actualizarEstadoSidebar(seccionAnterior);
        notificarModuloActivo(seccionAnterior);
        seccionActual = seccionAnterior;
    } else {
        console.log('📍 No hay historial de navegación para regresar');
    }
}

/**
 * Obtiene el nombre de la sección actual
 * Uso: const actual = Navegacion.obtenerActual()
 * @returns {string} Nombre de la sección actual
 */
function obtenerSeccionActual() {
    return seccionActual;
}

/**
 * Obtiene el historial completo de navegación
 * @returns {Array} Array con el historial de secciones visitadas
 */
function obtenerHistorialCompleto() {
    return [...historialNavegacion]; // Retornar copia del array
}

/**
 * Limpia el historial de navegación
 */
function limpiarHistorial() {
    historialNavegacion = [];
    console.log('🗑️ Historial de navegación limpiado');
}

// ═══════════════════════════════════════════════════════════
// 🔥 API PÚBLICA DEL MÓDULO
// Funciones disponibles para otros módulos
// ═══════════════════════════════════════════════════════════

window.Navegacion = {
    // Navegar a una sección
    irA: irASeccionProgramaticamente,
    
    // Regresar a la sección anterior
    atras: volverAtras,
    
    // Obtener sección actual
    obtenerActual: obtenerSeccionActual,
    
    // Obtener historial completo
    obtenerHistorial: obtenerHistorialCompleto,
    
    // Limpiar historial
    limpiarHistorial: limpiarHistorial
};

// ═══════════════════════════════════════════════════════════
// AUTO-INICIALIZACIÓN
// Se ejecuta automáticamente cuando el DOM está listo
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 admin-navigation.js cargado');
    inicializarSistemaNavegacion();
});

console.log('✅ Módulo de navegación registrado correctamente');