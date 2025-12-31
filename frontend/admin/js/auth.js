/* ==========================================
   AUTH.JS - Middleware de Protección
   Verifica que el usuario tenga sesión activa
   ========================================== */

(function() {
    console.log('🛡️ Verificando sesión...');
    
    // Obtener sesión del localStorage
    const sesionGuardada = localStorage.getItem('sesionApocighol');
    
    // Si NO hay sesión → redirigir a login
    if (!sesionGuardada) {
        console.log('❌ No hay sesión activa');
        console.log('🔄 Redirigiendo a login...');
        window.location.href = '../login.html';
        return;
    }
    
    // Parsear sesión
    let sesion;
    try {
        sesion = JSON.parse(sesionGuardada);
    } catch (error) {
        console.error('❌ Error al parsear sesión:', error);
        localStorage.removeItem('sesionApocighol');
        window.location.href = '../login.html';
        return;
    }
    
    // Verificar que la sesión tenga los datos necesarios
    if (!sesion.usuario || !sesion.rol) {
        console.log('❌ Sesión inválida');
        localStorage.removeItem('sesionApocighol');
        window.location.href = '../login.html';
        return;
    }
    
    // ✅ Sesión válida
    console.log('✅ Sesión válida');
    console.log('👤 Usuario:', sesion.usuario);
    console.log('📝 Nombre:', sesion.nombre);
    console.log('🎭 Rol:', sesion.rol);
    
    // Guardar sesión globalmente para usar en otros módulos
    window.sesionActual = sesion;

    // 🔥 Agregar clase del rol al body (para mostrar/ocultar elementos según rol)
    document.body.classList.add('rol-' + sesion.rol);
    
    // 🔥 Configurar vista según el rol
    configurarVistaPorRol(sesion.rol);
    
    // 🔥 Abrir módulo inicial según rol
    abrirModuloInicial(sesion.rol);
    
})();

// ==========================================
// 🔥 CONFIGURAR VISTA SEGÚN ROL
// ==========================================
function configurarVistaPorRol(rol) {
    console.log('🎭 Configurando vista para rol:', rol);
    
    // ADMIN ve todo (no ocultar nada)
    if (rol === 'ADMIN') {
        console.log('✅ ADMIN: Acceso completo');
        return;
    }
    
    // MESERO: Solo Mesas y Pedidos
    if (rol === 'MESERO') {
        console.log('👨‍🍳 MESERO: Solo Mesas y Pedidos');
        ocultarEnlace('dashboard');
        ocultarEnlace('productos');
        ocultarEnlace('caja');
        ocultarEnlace('ventas');
        ocultarEnlace('inventario');
        ocultarEnlace('compras');
    }
    
    // CAJERO: Dashboard, Caja, Mesas y Ventas
    if (rol === 'CAJERO') {
        console.log('💰 CAJERO: Dashboard, Caja, Mesas y Ventas');
        ocultarEnlace('pedidos');
        ocultarEnlace('productos');
        ocultarEnlace('inventario');
        ocultarEnlace('compras');
    }
    
    // COCINA: Solo Pedidos
    if (rol === 'COCINA') {
        console.log('👨‍🍳 COCINA: Solo Pedidos');
        ocultarEnlace('dashboard');
        ocultarEnlace('mesas');
        ocultarEnlace('productos');
        ocultarEnlace('caja');
        ocultarEnlace('ventas');
        ocultarEnlace('inventario');
        ocultarEnlace('compras');
    }
}

// ==========================================
// 🔥 ABRIR MÓDULO INICIAL SEGÚN ROL
// ==========================================
function abrirModuloInicial(rol) {
    // Determinar módulo inicial según rol
    let moduloInicial = 'dashboard'; // Por defecto para ADMIN y CAJERO
    
    if (rol === 'MESERO') {
        moduloInicial = 'mesas';
    } else if (rol === 'COCINA') {
        moduloInicial = 'pedidos';
    }
    
    // Guardar el módulo inicial para que navigation lo use
    window.moduloInicialPorRol = moduloInicial;
    
    // Esperar a que navigation termine de cargar y luego navegar
    setTimeout(() => {
        // Usar el sistema de navegación si está disponible
        if (window.Navegacion && typeof window.Navegacion.irA === 'function') {
            window.Navegacion.irA(moduloInicial);
            console.log(`✅ Módulo inicial abierto: ${moduloInicial}`);
        } else {
            // Fallback: click directo en el enlace
            const enlace = document.querySelector(`.enlace-nav[data-seccion="${moduloInicial}"]`);
            if (enlace) {
                enlace.click();
                console.log(`✅ Módulo inicial abierto (fallback): ${moduloInicial}`);
            }
        }
    }, 100); // Aumentamos el tiempo para asegurar que navigation esté listo
}
// ==========================================
// FUNCIÓN PARA OCULTAR ENLACES DEL MENÚ
// ==========================================
function ocultarEnlace(seccion) {
    const enlace = document.querySelector(`.enlace-nav[data-seccion="${seccion}"]`);
    if (enlace) {
        enlace.style.display = 'none';
        console.log(`   ❌ Módulo "${seccion}" oculto`);
    }
}


// ==========================================
// FUNCIÓN PARA CERRAR SESIÓN
// ==========================================
function cerrarSesionUsuario() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        console.log('👋 Cerrando sesión...');
        
        // Eliminar sesión del localStorage
        localStorage.removeItem('sesionApocighol');
        
        // Redirigir a login
        window.location.href = '../login.html';
    }
}

// ==========================================
// MOSTRAR NOMBRE DEL USUARIO EN EL PANEL
// ==========================================
function mostrarNombreUsuario() {
    if (window.sesionActual) {
        // Buscar elemento del logo-subtexto
        const subtexto = document.querySelector('.logo-subtexto');
        if (subtexto) {
            subtexto.textContent = `👤 ${window.sesionActual.nombre}`;
            subtexto.style.fontSize = '13px';
            subtexto.style.marginTop = '5px';
        }
    }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mostrarNombreUsuario);
} else {
    mostrarNombreUsuario();
}

// Hacer funciones globales
window.cerrarSesionUsuario = cerrarSesionUsuario;

console.log('✅ auth.js cargado completamente');