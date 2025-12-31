/* ==========================================
   LOGIN.JS - Validación y Sesión
   🔥 CONECTADO CON BACKEND SPRING BOOT
   ========================================== */

// URL del Backend
const API_URL = 'http://localhost:8085/api';

// Elementos del DOM
const formularioLogin = document.getElementById('formulario-login');
const inputUsuario = document.getElementById('input-usuario');
const inputPassword = document.getElementById('input-password');
const mensajeError = document.getElementById('mensaje-error');
const textoError = document.getElementById('texto-error');

// ==========================================
// VERIFICAR SI YA HAY SESIÓN ACTIVA
// ==========================================
window.addEventListener('DOMContentLoaded', function() {
    const sesion = localStorage.getItem('sesionApocighol');
    
    if (sesion) {
        window.location.href = './admin/index.html';
    }
    
    console.log('🔐 Página de login cargada');
    console.log('🌐 Backend:', API_URL);
});

// ==========================================
// MANEJAR ENVÍO DEL FORMULARIO
// ==========================================
formularioLogin.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const usuario = inputUsuario.value.trim();
    const password = inputPassword.value.trim();
    
    // Validar campos vacíos
    if (!usuario || !password) {
        mostrarError('Por favor, completa todos los campos');
        return;
    }
    
    // 🔥 CONECTAR CON BACKEND
    try {
        const response = await fetch(`${API_URL}/usuarios/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usuario,
                password: password
            })
        });
        
        if (response.ok) {
            const usuarioData = await response.json();
            loginExitoso(usuarioData);
        } else {
            mostrarError('Usuario o contraseña incorrectos');
            limpiarCampos();
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        mostrarError('Error de conexión con el servidor');
    }
});

// ==========================================
// LOGIN EXITOSO
// ==========================================
function loginExitoso(usuarioData) {
    console.log('✅ Login exitoso desde BD');
    console.log('👤 Usuario:', usuarioData.nombreUsuario);
    console.log('🎭 Rol:', usuarioData.rolUsuario);
    
    // Guardar sesión en localStorage
    const sesion = {
        id: usuarioData.idUsuario,
        usuario: usuarioData.usernameUsuario,
        nombre: usuarioData.nombreUsuario,
        rol: usuarioData.rolUsuario,
        fechaLogin: new Date().toISOString()
    };
    
    localStorage.setItem('sesionApocighol', JSON.stringify(sesion));
    
    ocultarError();
    window.location.href = './admin/index.html';
}

// ==========================================
// MOSTRAR ERROR
// ==========================================
function mostrarError(mensaje) {
    textoError.textContent = mensaje;
    mensajeError.style.display = 'flex';
    
    mensajeError.classList.remove('sacudir');
    void mensajeError.offsetWidth;
    mensajeError.classList.add('sacudir');
    
    console.log('❌ Error:', mensaje);
}

// ==========================================
// OCULTAR ERROR
// ==========================================
function ocultarError() {
    mensajeError.style.display = 'none';
}

// ==========================================
// LIMPIAR CAMPOS
// ==========================================
function limpiarCampos() {
    inputPassword.value = '';
    inputPassword.focus();
}

// ==========================================
// OCULTAR ERROR AL ESCRIBIR
// ==========================================
inputUsuario.addEventListener('input', ocultarError);
inputPassword.addEventListener('input', ocultarError);

console.log('✅ login.js cargado - Modo API REST');
console.log('🌐 Conectando a:', API_URL);