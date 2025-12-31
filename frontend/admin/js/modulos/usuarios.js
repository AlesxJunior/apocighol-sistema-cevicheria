/* ==========================================
   USUARIOS.JS - GESTIÓN DE USUARIOS
   🔥 CRUD CON API REST - SPRING BOOT
   Solo visible para rol ADMIN
   ========================================== */

(function() {
    // ==========================================
    // VARIABLES PRIVADAS DEL MÓDULO
    // ==========================================
    
    const API_URL = 'http://localhost:8085/api';
    let usuariosData = [];
    let rolFiltroActual = 'todos';
    
    // Roles disponibles
    const roles = ['ADMIN', 'CAJERO', 'MESERO', 'COCINA'];
    
    // ==========================================
    // FUNCIÓN DE INICIALIZACIÓN
    // ==========================================
    
    async function inicializar() {
        console.log('👥 Inicializando módulo Gestión de Usuarios...');
        
        // Verificar que sea ADMIN
        const sesion = JSON.parse(localStorage.getItem('sesionApocighol'));
        if (!sesion || sesion.rol !== 'ADMIN') {
            console.warn('⚠️ Acceso denegado: Solo ADMIN puede ver usuarios');
            return;
        }
        
        // Cargar usuarios desde API
        await cargarUsuarios();
        
        // Resetear filtro
        rolFiltroActual = 'todos';
        
        // Inicializar filtros
        inicializarFiltros();
        
        // Renderizar
        renderizarUsuarios();
        actualizarEstadisticas();
        
        console.log('✅ Módulo Usuarios inicializado');
    }
    
    // ==========================================
    // 🔥 CARGAR USUARIOS DESDE API (READ)
    // ==========================================
    
    async function cargarUsuarios() {
        try {
            const response = await fetch(`${API_URL}/usuarios`);
            
            if (response.ok) {
                const datos = await response.json();
                
                usuariosData = datos.map(u => ({
                    id: u.idUsuario,
                    username: u.usernameUsuario,
                    password: u.passwordUsuario,
                    nombre: u.nombreUsuario,
                    rol: u.rolUsuario,
                    activo: u.activoUsuario
                }));
                
                console.log(`📊 ${usuariosData.length} usuarios cargados desde BD`);
            } else {
                console.error('❌ Error al cargar usuarios');
                usuariosData = [];
            }
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            mostrarNotificacion('Error al conectar con el servidor', 'error');
            usuariosData = [];
        }
    }
    
    // ==========================================
    // ESTADÍSTICAS
    // ==========================================
    
    function actualizarEstadisticas() {
        const total = usuariosData.length;
        const activos = usuariosData.filter(u => u.activo).length;
        const inactivos = total - activos;
        
        document.getElementById('total-usuarios').textContent = total;
        document.getElementById('usuarios-activos').textContent = activos;
        document.getElementById('usuarios-inactivos').textContent = inactivos;
    }
    
    // ==========================================
    // RENDERIZADO
    // ==========================================
    
    function renderizarUsuarios() {
        const contenedor = document.getElementById('usuarios-contenido');
        if (!contenedor) return;
        
        // Filtrar por rol
        let usuariosFiltrados = usuariosData;
        
        if (rolFiltroActual !== 'todos') {
            usuariosFiltrados = usuariosFiltrados.filter(u => u.rol === rolFiltroActual);
        }
        
        // Si no hay usuarios
        if (usuariosFiltrados.length === 0) {
            contenedor.innerHTML = `
                <div class="mensaje-vacio">
                    <i class="fas fa-users"></i>
                    <p>No hay usuarios ${rolFiltroActual !== 'todos' ? 'con rol ' + rolFiltroActual : ''}</p>
                </div>
            `;
            return;
        }
        
        // Renderizar tarjetas
        contenedor.innerHTML = usuariosFiltrados.map(usuario => crearTarjetaUsuario(usuario)).join('');
        
        console.log(`✅ ${usuariosFiltrados.length} usuarios renderizados`);
    }
    
    function crearTarjetaUsuario(usuario) {
        const iconoRol = {
            'ADMIN': 'fa-user-shield',
            'CAJERO': 'fa-cash-register',
            'MESERO': 'fa-concierge-bell',
            'COCINA': 'fa-utensils'
        };
        
        const colorRol = {
            'ADMIN': '#e74c3c',
            'CAJERO': '#3498db',
            'MESERO': '#27ae60',
            'COCINA': '#f39c12'
        };
        
        return `
            <div class="tarjeta-usuario ${!usuario.activo ? 'usuario-inactivo' : ''}">
                <div class="usuario-header">
                    <div class="usuario-avatar" style="background: ${colorRol[usuario.rol]}">
                        <i class="fas ${iconoRol[usuario.rol]}"></i>
                    </div>
                    <div class="usuario-info">
                        <h3 class="usuario-nombre">${usuario.nombre}</h3>
                        <span class="usuario-username">@${usuario.username}</span>
                    </div>
                    <span class="badge-rol" style="background: ${colorRol[usuario.rol]}">${usuario.rol}</span>
                </div>
                
                <div class="usuario-detalles">
                    <div class="detalle-item">
                        <i class="fas fa-user"></i>
                        <span>Usuario: ${usuario.username}</span>
                    </div>
                    <div class="detalle-item">
                        <i class="fas fa-key"></i>
                        <span>Contraseña: ${'•'.repeat(usuario.password.length)}</span>
                    </div>
                </div>
                
                <div class="usuario-estado">
                    <label class="switch-estado">
                        <input type="checkbox" 
                               ${usuario.activo ? 'checked' : ''} 
                               onchange="toggleUsuarioActivo(${usuario.id})">
                        <span class="slider-estado"></span>
                    </label>
                    <span class="texto-estado ${usuario.activo ? 'activo' : 'inactivo'}">
                        ${usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
                
                <div class="usuario-acciones">
                    <button class="btn btn-secundario btn-sm" onclick="editarUsuario(${usuario.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-peligro btn-sm" onclick="confirmarEliminarUsuario(${usuario.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    }
    
    // ==========================================
    // FILTROS
    // ==========================================
    
    function inicializarFiltros() {
        const botonesFiltro = document.querySelectorAll('.filtros-usuarios .filtro-btn');
        
        botonesFiltro.forEach(boton => {
            boton.addEventListener('click', function() {
                const rol = this.dataset.rol;
                rolFiltroActual = rol;
                
                botonesFiltro.forEach(b => b.classList.remove('activo'));
                this.classList.add('activo');
                
                renderizarUsuarios();
            });
        });
    }
    
    // ==========================================
    // 🔥 CREAR USUARIO (CREATE)
    // ==========================================
    
    function nuevoUsuario() {
        console.log('➕ Abriendo formulario nuevo usuario...');
        
        let contenido = `
            <div class="formulario-usuario">
                <div class="campo-formulario">
                    <label><i class="fas fa-user"></i> Nombre Completo: *</label>
                    <input type="text" id="nombre-usuario" placeholder="Ej: Juan Pérez" maxlength="100">
                </div>
                
                <div class="campo-formulario">
                    <label><i class="fas fa-at"></i> Usuario (login): *</label>
                    <input type="text" id="username-usuario" placeholder="Ej: juan123" maxlength="50">
                </div>
                
                <div class="campo-formulario">
                    <label><i class="fas fa-lock"></i> Contraseña: *</label>
                    <input type="text" id="password-usuario" placeholder="Mínimo 6 caracteres" maxlength="100">
                </div>
                
                <div class="campo-formulario">
                    <label><i class="fas fa-user-tag"></i> Rol: *</label>
                    <select id="rol-usuario">
                        <option value="">-- Seleccione un rol --</option>
                        ${roles.map(rol => `<option value="${rol}">${rol}</option>`).join('')}
                    </select>
                </div>
                
                <div class="campo-formulario">
                    <label class="checkbox-contenedor">
                        <input type="checkbox" id="activo-usuario" checked>
                        <span>Usuario activo</span>
                    </label>
                </div>
            </div>
        `;
        
        abrirModal('Nuevo Usuario', contenido, guardarNuevoUsuario);
    }
    
    async function guardarNuevoUsuario() {
        const nombre = document.getElementById('nombre-usuario').value.trim();
        const username = document.getElementById('username-usuario').value.trim();
        const password = document.getElementById('password-usuario').value.trim();
        const rol = document.getElementById('rol-usuario').value;
        const activo = document.getElementById('activo-usuario').checked;
        
        // Validaciones
        if (!nombre) {
            mostrarNotificacion('Ingresa el nombre completo', 'error');
            return;
        }
        if (!username) {
            mostrarNotificacion('Ingresa el usuario de login', 'error');
            return;
        }
        if (!password || password.length < 6) {
            mostrarNotificacion('La contraseña debe tener mínimo 6 caracteres', 'error');
            return;
        }
        if (!rol) {
            mostrarNotificacion('Selecciona un rol', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombreUsuario: nombre,
                    usernameUsuario: username,
                    passwordUsuario: password,
                    rolUsuario: rol,
                    activoUsuario: activo
                })
            });
            
            if (response.ok) {
                cerrarModal();
                await cargarUsuarios();
                renderizarUsuarios();
                actualizarEstadisticas();
                mostrarNotificacion(`Usuario ${nombre} creado exitosamente`, 'exito');
            } else {
                mostrarNotificacion('Error al crear usuario', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    // ==========================================
    // 🔥 EDITAR USUARIO (UPDATE)
    // ==========================================
    
    function editarUsuario(idUsuario) {
        const usuario = usuariosData.find(u => u.id === idUsuario);
        
        if (!usuario) {
            mostrarNotificacion('Usuario no encontrado', 'error');
            return;
        }
        
        let contenido = `
            <div class="formulario-usuario">
                <div class="campo-formulario">
                    <label><i class="fas fa-user"></i> Nombre Completo: *</label>
                    <input type="text" id="nombre-usuario-editar" value="${usuario.nombre}" maxlength="100">
                </div>
                
                <div class="campo-formulario">
                    <label><i class="fas fa-at"></i> Usuario (login): *</label>
                    <input type="text" id="username-usuario-editar" value="${usuario.username}" maxlength="50">
                </div>
                
                <div class="campo-formulario">
                    <label><i class="fas fa-lock"></i> Contraseña: *</label>
                    <input type="text" id="password-usuario-editar" value="${usuario.password}" maxlength="100">
                </div>
                
                <div class="campo-formulario">
                    <label><i class="fas fa-user-tag"></i> Rol: *</label>
                    <select id="rol-usuario-editar">
                        ${roles.map(rol => `
                            <option value="${rol}" ${usuario.rol === rol ? 'selected' : ''}>${rol}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="campo-formulario">
                    <label class="checkbox-contenedor">
                        <input type="checkbox" id="activo-usuario-editar" ${usuario.activo ? 'checked' : ''}>
                        <span>Usuario activo</span>
                    </label>
                </div>
            </div>
        `;
        
        abrirModal('Editar Usuario', contenido, function() {
            guardarEdicionUsuario(idUsuario);
        });
    }
    
    async function guardarEdicionUsuario(idUsuario) {
        const nombre = document.getElementById('nombre-usuario-editar').value.trim();
        const username = document.getElementById('username-usuario-editar').value.trim();
        const password = document.getElementById('password-usuario-editar').value.trim();
        const rol = document.getElementById('rol-usuario-editar').value;
        const activo = document.getElementById('activo-usuario-editar').checked;
        
        // Validaciones
        if (!nombre || !username || !password || !rol) {
            mostrarNotificacion('Completa todos los campos obligatorios', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/usuarios/${idUsuario}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombreUsuario: nombre,
                    usernameUsuario: username,
                    passwordUsuario: password,
                    rolUsuario: rol,
                    activoUsuario: activo
                })
            });
            
            if (response.ok) {
                cerrarModal();
                await cargarUsuarios();
                renderizarUsuarios();
                actualizarEstadisticas();
                mostrarNotificacion(`Usuario ${nombre} actualizado`, 'exito');
            } else {
                mostrarNotificacion('Error al actualizar usuario', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    // ==========================================
    // 🔥 TOGGLE ACTIVO/INACTIVO (UPDATE)
    // ==========================================
    
    async function toggleUsuarioActivo(idUsuario) {
        const usuario = usuariosData.find(u => u.id === idUsuario);
        
        if (!usuario) return;
        
        try {
            const response = await fetch(`${API_URL}/usuarios/${idUsuario}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombreUsuario: usuario.nombre,
                    usernameUsuario: usuario.username,
                    passwordUsuario: usuario.password,
                    rolUsuario: usuario.rol,
                    activoUsuario: !usuario.activo
                })
            });
            
            if (response.ok) {
                await cargarUsuarios();
                renderizarUsuarios();
                actualizarEstadisticas();
                const estado = !usuario.activo ? 'activado' : 'desactivado';
                mostrarNotificacion(`Usuario ${estado}`, 'exito');
            }
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
    
    // ==========================================
    // 🔥 ELIMINAR USUARIO (DELETE)
    // ==========================================
    
    function confirmarEliminarUsuario(idUsuario) {
        const usuario = usuariosData.find(u => u.id === idUsuario);
        
        if (!usuario) return;
        
        if (!confirmar(`¿Eliminar al usuario "${usuario.nombre}"?\n\nUsuario: @${usuario.username}\nRol: ${usuario.rol}\n\nEsta acción no se puede deshacer.`)) {
            return;
        }
        
        eliminarUsuario(idUsuario);
    }
    
    async function eliminarUsuario(idUsuario) {
        const usuario = usuariosData.find(u => u.id === idUsuario);
        
        try {
            const response = await fetch(`${API_URL}/usuarios/${idUsuario}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await cargarUsuarios();
                renderizarUsuarios();
                actualizarEstadisticas();
                mostrarNotificacion(`Usuario ${usuario.nombre} eliminado`, 'exito');
            } else {
                mostrarNotificacion('Error al eliminar usuario', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    // ==========================================
    // EXPORTAR FUNCIONES GLOBALES
    // ==========================================
    
    window.nuevoUsuario = nuevoUsuario;
    window.editarUsuario = editarUsuario;
    window.confirmarEliminarUsuario = confirmarEliminarUsuario;
    window.toggleUsuarioActivo = toggleUsuarioActivo;
    
    // ==========================================
    // EXPORTAR API PÚBLICA DEL MÓDULO
    // ==========================================
    
    window.Usuarios = {
        inicializar: inicializar,
        renderizar: renderizarUsuarios,
        cargar: cargarUsuarios
    };
    
    console.log('✅ Módulo Usuarios cargado - Modo API REST');
})();

// ==========================================
// ESTILOS RESPONSIVOS
// ==========================================
const estilosUsuarios = document.createElement('style');
estilosUsuarios.textContent = `
    /* Ocultar enlace para no-admin */
    .solo-admin { display: none; }
    body.rol-ADMIN .solo-admin { display: flex; }
    
    /* Resumen de usuarios */
    .resumen-usuarios {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 25px;
    }
    
    /* Filtros */
    .filtros-usuarios {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 25px;
    }
    
    /* Contenedor de usuarios */
    .contenedor-usuarios {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px;
    }
    
    /* Tarjeta de usuario */
    .tarjeta-usuario {
        background: var(--fondo-tarjeta, #fff);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: transform 0.2s, box-shadow 0.2s;
    }
    .tarjeta-usuario:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }
    .tarjeta-usuario.usuario-inactivo {
        opacity: 0.6;
        background: #f8f9fa;
    }
    
    /* Header de usuario */
    .usuario-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
        flex-wrap: wrap;
    }
    .usuario-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        flex-shrink: 0;
    }
    .usuario-info {
        flex: 1;
        min-width: 120px;
    }
    .usuario-nombre {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
    }
    .usuario-username {
        color: #7f8c8d;
        font-size: 14px;
    }
    .badge-rol {
        padding: 5px 12px;
        border-radius: 20px;
        color: white;
        font-size: 12px;
        font-weight: 600;
    }
    
    /* Detalles */
    .usuario-detalles {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 15px;
    }
    .detalle-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 5px 0;
        font-size: 14px;
        color: #555;
    }
    .detalle-item i {
        width: 20px;
        color: #7f8c8d;
    }
    
    /* Estado activo/inactivo */
    .usuario-estado {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
        padding: 10px 0;
        border-top: 1px solid #eee;
        border-bottom: 1px solid #eee;
    }
    .switch-estado {
        position: relative;
        width: 50px;
        height: 26px;
    }
    .switch-estado input { display: none; }
    .slider-estado {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background: #ccc;
        border-radius: 26px;
        transition: 0.3s;
    }
    .slider-estado::before {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        left: 3px;
        top: 3px;
        background: white;
        border-radius: 50%;
        transition: 0.3s;
    }
    .switch-estado input:checked + .slider-estado {
        background: #27ae60;
    }
    .switch-estado input:checked + .slider-estado::before {
        transform: translateX(24px);
    }
    .texto-estado {
        font-weight: 500;
        font-size: 14px;
    }
    .texto-estado.activo { color: #27ae60; }
    .texto-estado.inactivo { color: #e74c3c; }
    
    /* Acciones */
    .usuario-acciones {
        display: flex;
        gap: 10px;
    }
    .usuario-acciones .btn {
        flex: 1;
        padding: 8px 12px;
        font-size: 13px;
    }
    
    /* Mensaje vacío */
    .mensaje-vacio {
        text-align: center;
        padding: 60px 20px;
        color: #7f8c8d;
    }
    .mensaje-vacio i {
        font-size: 60px;
        margin-bottom: 20px;
        opacity: 0.3;
    }
    
    /* Formulario */
    .formulario-usuario {
        padding: 10px 0;
    }
    .formulario-usuario .campo-formulario {
        margin-bottom: 20px;
    }
    .formulario-usuario label {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-weight: 500;
        color: #555;
    }
    .formulario-usuario input,
    .formulario-usuario select {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
    }
    .formulario-usuario input:focus,
    .formulario-usuario select:focus {
        outline: none;
        border-color: #3498db;
    }
    
    /* RESPONSIVO */
    @media (max-width: 768px) {
        .contenedor-usuarios {
            grid-template-columns: 1fr;
        }
        .filtros-usuarios {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 10px;
        }
        .filtros-usuarios .filtro-btn {
            white-space: nowrap;
            flex-shrink: 0;
        }
        .usuario-header {
            flex-direction: column;
            text-align: center;
        }
        .usuario-acciones {
            flex-direction: column;
        }
        .resumen-usuarios {
            grid-template-columns: 1fr;
        }
    }
    
    @media (max-width: 480px) {
        .tarjeta-usuario {
            padding: 15px;
        }
        .usuario-avatar {
            width: 40px;
            height: 40px;
            font-size: 16px;
        }
    }
`;
document.head.appendChild(estilosUsuarios);