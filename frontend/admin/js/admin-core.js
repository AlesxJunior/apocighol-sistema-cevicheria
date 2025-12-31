/* ==========================================
   ADMIN-CORE.JS - BUG 4 CORREGIDO
   Funciones base compartidas por todos los módulos
   🔥 Agregada función obtenerFechaActualDDMMYYYY para ventas
   ========================================== */

// ==========================================
// 1. INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Panel Administrativo - Apocighol iniciado');
    console.log('📅 Fecha:', new Date().toLocaleDateString('es-PE'));
    
    // Inicializar navegación
    inicializarNavegacion();
    
    // Mostrar fecha actual
    mostrarFechaActual();
    
    // Inicializar datos si es primera vez
    inicializarDatosPorDefecto();
    
    console.log('✅ Sistema listo');
});

// ==========================================
// 2. NAVEGACIÓN
// ==========================================

function inicializarNavegacion() {
    const enlaces = document.querySelectorAll('.enlace-nav');
    
    enlaces.forEach(enlace => {
        enlace.addEventListener('click', function(e) {
            e.preventDefault();
            
            const seccion = this.dataset.seccion;
            mostrarSeccion(seccion);
            
            // Marcar enlace activo
            enlaces.forEach(e => e.classList.remove('activo'));
            this.classList.add('activo');
            
            console.log(`📍 Navegando a: ${seccion}`);
        });
    });
}

function mostrarSeccion(nombreSeccion) {
    // Ocultar todas las secciones
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(seccion => {
        seccion.classList.remove('activa');
    });
    
    // Mostrar la sección seleccionada
    const seccionActiva = document.getElementById(`seccion-${nombreSeccion}`);
    if (seccionActiva) {
        seccionActiva.classList.add('activa');
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres salir?')) {
        console.log('👋 Cerrando sesión...');
        window.location.href = '../index.html';
    }
}

// ==========================================
// 3. FORMATO
// ==========================================

function formatearMoneda(numero) {
    const num = parseFloat(numero) || 0;
    return 'S/. ' + num.toFixed(2);
}

function formatearFecha(fecha) {
    const f = fecha instanceof Date ? fecha : new Date(fecha);
    const dia = String(f.getDate()).padStart(2, '0');
    const mes = String(f.getMonth() + 1).padStart(2, '0');
    const anio = f.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

function formatearHora(fecha) {
    const f = fecha instanceof Date ? fecha : new Date(fecha);
    const hora = String(f.getHours()).padStart(2, '0');
    const min = String(f.getMinutes()).padStart(2, '0');
    return `${hora}:${min}`;
}

function formatearFechaHora(fecha) {
    return `${formatearFecha(fecha)} ${formatearHora(fecha)}`;
}

function mostrarFechaActual() {
    const elemento = document.getElementById('fecha-actual');
    if (elemento) {
        const hoy = new Date();
        const opciones = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        elemento.textContent = hoy.toLocaleDateString('es-PE', opciones);
    }
}

// ==========================================
// 4. VALIDACIONES
// ==========================================

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarTelefono(telefono) {
    const limpio = telefono.replace(/\D/g, '');
    return limpio.length >= 9;
}

function validarDNI(dni) {
    const limpio = dni.replace(/\D/g, '');
    return limpio.length === 8;
}

function validarRUC(ruc) {
    const limpio = ruc.replace(/\D/g, '');
    return limpio.length === 11;
}

function validarRequerido(valor) {
    return valor !== null && valor !== undefined && valor.trim() !== '';
}

// ==========================================
// 5. LOCALSTORAGE
// ==========================================

function obtenerDatos(clave) {
    try {
        const datos = localStorage.getItem(clave);
        return datos ? JSON.parse(datos) : null;
    } catch (error) {
        console.error(`Error al leer localStorage [${clave}]:`, error);
        return null;
    }
}

function guardarDatos(clave, datos) {
    try {
        localStorage.setItem(clave, JSON.stringify(datos));
        console.log(`💾 Datos guardados en [${clave}]`);
        return true;
    } catch (error) {
        console.error(`Error al guardar en localStorage [${clave}]:`, error);
        return false;
    }
}

function eliminarDatos(clave) {
    localStorage.removeItem(clave);
    console.log(`🗑️ Datos eliminados de [${clave}]`);
}

function limpiarTodosDatos() {
    if (confirm('⚠️ ¿Estás seguro? Se borrarán TODOS los datos')) {
        localStorage.clear();
        console.log('🗑️ LocalStorage limpiado completamente');
        location.reload();
    }
}

// ==========================================
// 6. CÁLCULOS
// ==========================================

function calcularSubtotal(productos) {
    return productos.reduce((total, producto) => {
        const cantidad = parseFloat(producto.cantidad) || 0;
        const precio = parseFloat(producto.precio) || parseFloat(producto.precioUnitario) || 0;
        return total + (cantidad * precio);
    }, 0);
}

function aplicarDescuento(subtotal, descuento, tipo = 'porcentaje') {
    const sub = parseFloat(subtotal) || 0;
    const desc = parseFloat(descuento) || 0;
    
    if (tipo === 'porcentaje') {
        return sub * (desc / 100);
    } else {
        return desc;
    }
}

function calcularTotal(subtotal, descuento = 0) {
    const sub = parseFloat(subtotal) || 0;
    const desc = parseFloat(descuento) || 0;
    return Math.max(0, sub - desc);
}

function calcularVuelto(total, recibido) {
    const tot = parseFloat(total) || 0;
    const rec = parseFloat(recibido) || 0;
    return Math.max(0, rec - tot);
}

// ==========================================
// 7. UTILIDADES
// ==========================================

function generarId(prefijo) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefijo}-${timestamp}-${random}`;
}

// ==========================================
// GESTIÓN DE CORRELATIVOS DE COMPROBANTES
// ==========================================

/**
 * Genera el siguiente número correlativo de comprobante
 * @param {string} tipo - 'boleta' o 'factura'
 * @returns {object} { serie, numero }
 */
function generarCorrelativoComprobante(tipo) {
    const key = tipo === 'boleta' ? 'correlativo_boleta' : 'correlativo_factura';
    const serie = tipo === 'boleta' ? 'B001' : 'F001';
    
    // Obtener último correlativo
    let ultimoNumero = parseInt(localStorage.getItem(key) || '0');
    
    // Incrementar
    ultimoNumero++;
    
    // Guardar
    localStorage.setItem(key, ultimoNumero.toString());
    
    // Formatear número con ceros a la izquierda (8 dígitos)
    const numeroFormateado = ultimoNumero.toString().padStart(8, '0');
    
    return {
        serie: serie,
        numero: numeroFormateado,
        completo: `${serie}-${numeroFormateado}`
    };
}

/**
 * Resetea los correlativos (usar con cuidado)
 */
function resetearCorrelativos() {
    if (confirmar('¿Estás seguro de resetear los correlativos de comprobantes?')) {
        localStorage.removeItem('correlativo_boleta');
        localStorage.removeItem('correlativo_factura');
        mostrarNotificacion('Correlativos reseteados', 'exito');
    }
}

function generarNumeroCorrelativo(clave) {
    const datos = obtenerDatos(clave) || [];
    const ultimo = datos.length > 0 ? datos.length : 0;
    const siguiente = ultimo + 1;
    return String(siguiente).padStart(8, '0');
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notif = document.createElement('div');
    notif.className = `notificacion notificacion-${tipo}`;
    notif.textContent = mensaje;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
    
    console.log(`📢 ${tipo.toUpperCase()}: ${mensaje}`);
}

function confirmar(mensaje) {
    return confirm(mensaje);
}

function abrirModal(titulo, contenido, callback) {
    const modal = document.getElementById('modal-general');
    const tituloEl = document.getElementById('modal-titulo');
    const cuerpoEl = document.getElementById('modal-cuerpo');
    const btnConfirmar = document.getElementById('modal-btn-confirmar');
    
    tituloEl.textContent = titulo;
    cuerpoEl.innerHTML = contenido;
    modal.classList.add('activo');
    
    // Remover listeners anteriores
    const nuevoBtn = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(nuevoBtn, btnConfirmar);
    
    // Agregar nuevo listener
    document.getElementById('modal-btn-confirmar').addEventListener('click', function() {
        if (callback && typeof callback === 'function') {
            callback();
        }
        cerrarModal();
    });
}

function cerrarModal() {
    const modal = document.getElementById('modal-general');
    modal.classList.remove('activo');
}

function formatearTelefono(telefono) {
    const limpio = telefono.replace(/\D/g, '');
    if (limpio.length === 9) {
        return `${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6)}`;
    }
    return telefono;
}

// ==========================================
// 🔥🔥🔥 BUG 4 CORREGIDO 🔥🔥🔥
// Dos funciones de fecha para diferentes usos
// ==========================================

// 🔥 Para inputs HTML (formato ISO: YYYY-MM-DD)
function obtenerFechaActual() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

// 🔥 Para guardar ventas/pedidos/mesas (formato DD/MM/YYYY)
function obtenerFechaActualDDMMYYYY() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

function obtenerHoraActual() {
    const ahora = new Date();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const min = String(ahora.getMinutes()).padStart(2, '0');
    return `${hora}:${min}`;
}

// ==========================================
// 8. INICIALIZACIÓN DE DATOS POR DEFECTO
// ==========================================

function inicializarDatosPorDefecto() {
    const mesas = obtenerDatos('mesas');
    const productos = obtenerDatos('productos');
    
    // Inicializar mesas si no existen
    if (!mesas || mesas.length === 0) {
        const mesasPorDefecto = [];
        for (let i = 1; i <= 10; i++) {
            mesasPorDefecto.push({
                numero: i,
                estado: 'disponible',
                cantidadPersonas: 0,
                horaInicio: null,
                mesero: null,
                pedidos: [],
                totalGastado: 0
            });
        }
        guardarDatos('mesas', mesasPorDefecto);
        console.log('✅ 10 mesas inicializadas');
    }
    
    // Inicializar productos si no existen
    if (!productos || productos.length === 0) {
        const productosPorDefecto = [
            {
                id: 'PROD-001',
                nombre: 'Ceviche Mixto',
                descripcion: 'Ceviche con pescado, calamares y pulpo',
                categoria: 'Ceviches',
                precio: 28.00,
                disponible: true
            },
            {
                id: 'PROD-002',
                nombre: 'Arroz con Mariscos',
                descripcion: 'Arroz con mariscos frescos',
                categoria: 'Arroces',
                precio: 30.00,
                disponible: true
            },
            {
                id: 'PROD-003',
                nombre: 'Chicharrón de Pescado',
                descripcion: 'Chicharrón de pescado crocante',
                categoria: 'Chicharrones',
                precio: 22.00,
                disponible: true
            },
            {
                id: 'PROD-004',
                nombre: 'Inca Kola 1.5L',
                descripcion: 'Gaseosa Inca Kola',
                categoria: 'Bebidas',
                precio: 8.00,
                disponible: true
            },
            {
                id: 'PROD-005',
                nombre: 'Causa Rellena',
                descripcion: 'Causa limeña con pollo',
                categoria: 'Causas',
                precio: 15.00,
                disponible: true
            }
        ];
        guardarDatos('productos', productosPorDefecto);
        console.log('✅ 5 productos demo inicializados');
    }
    
    // Inicializar arrays vacíos
    if (!obtenerDatos('pedidos')) {
        guardarDatos('pedidos', []);
    }
    
    if (!obtenerDatos('ventas')) {
        guardarDatos('ventas', []);
    }
}

// ==========================================
// 9. CONSTANTES
// ==========================================

const ESTADO_MESA = {
    DISPONIBLE: 'disponible',
    OCUPADA: 'ocupada',
    RESERVADA: 'reservada'
};

const ESTADO_PEDIDO = {
    PENDIENTE: 'pendiente',
    PREPARANDO: 'preparando',
    LISTO: 'listo',
    SERVIDO: 'servido'
};

const METODO_PAGO = {
    EFECTIVO: 'Efectivo',
    YAPE: 'Yape',
    PLIN: 'Plin'
};

const TIPO_COMPROBANTE = {
    BOLETA: 'Boleta',
    FACTURA: 'Factura'
};

const CATEGORIAS = [
    'Promociones',
    'Ceviches',
    'Leches de Tigre',
    'Causas',
    'Arroces',
    'Chicharrones',
    'Sopas',
    'Adicionales',
    'Dúos',
    'Tríos',
    'Bebidas'
];

console.log('✅ admin-core.js cargado completamente (BUG 4 CORREGIDO)');

/* ==========================================
   MENÚ MÓVIL - HAMBURGUESA
   ========================================== */

function toggleMenuMovil() {
    const sidebar = document.querySelector('.barra-lateral');
    const btnHamburguesa = document.getElementById('btn-menu-movil');
    const overlay = document.getElementById('overlay-menu');
    
    sidebar.classList.toggle('activo');
    btnHamburguesa.classList.toggle('activo');
    overlay.classList.toggle('activo');
    
    // Bloquear scroll del body cuando menú está abierto
    document.body.style.overflow = sidebar.classList.contains('activo') ? 'hidden' : '';
}

function cerrarMenuMovil() {
    const sidebar = document.querySelector('.barra-lateral');
    const btnHamburguesa = document.getElementById('btn-menu-movil');
    const overlay = document.getElementById('overlay-menu');
    
    sidebar.classList.remove('activo');
    btnHamburguesa.classList.remove('activo');
    overlay.classList.remove('activo');
    document.body.style.overflow = '';
}

// Cerrar menú al hacer clic en un enlace (móvil)
document.addEventListener('DOMContentLoaded', function() {
    const enlaces = document.querySelectorAll('.enlace-nav');
    
    enlaces.forEach(enlace => {
        enlace.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                cerrarMenuMovil();
            }
        });
    });
});

// Hacer funciones globales
window.toggleMenuMovil = toggleMenuMovil;
window.cerrarMenuMovil = cerrarMenuMovil;