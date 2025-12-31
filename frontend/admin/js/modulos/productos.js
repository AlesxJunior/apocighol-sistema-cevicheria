/* ==========================================
   PRODUCTOS.JS - CONECTADO CON BACKEND
   🔥 CRUD CON API REST - SPRING BOOT
   ========================================== */

(function() {
    // ==========================================
    // VARIABLES PRIVADAS DEL MÓDULO
    // ==========================================
    
    const API_URL = 'http://localhost:8085/api';
    let productosData = [];
    let categoriaFiltroActual = 'todos';
    let terminoBusqueda = '';
    
    // Categorías de cevichería real
    const categorias = [
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
    
    // ==========================================
    // FUNCIÓN DE INICIALIZACIÓN PÚBLICA
    // ==========================================
    
    async function inicializar() {
        console.log('🍽️ Inicializando módulo Productos...');
        console.log('🌐 Backend:', API_URL);
        
        // Cargar productos desde API
        await cargarProductos();
        
        // RESETEAR FILTRO A "TODOS"
        categoriaFiltroActual = 'todos';
        
        // Marcar botón "Todos" como activo
        const botonesFiltro = document.querySelectorAll('.filtro-btn');
        botonesFiltro.forEach(b => b.classList.remove('activo'));
        const btnTodos = document.querySelector('.filtro-btn[data-categoria="todos"]');
        if (btnTodos) {
            btnTodos.classList.add('activo');
        }
        
        // Inicializar filtros
        inicializarFiltros();
        
        // Inicializar búsqueda
        inicializarBusqueda();
        
        // Renderizar inicial
        renderizarProductos();
        
        console.log('✅ Módulo Productos inicializado');
    }
    
    // ==========================================
    // 🔥 CARGAR PRODUCTOS DESDE API (READ)
    // ==========================================
    
    async function cargarProductos() {
        try {
            const response = await fetch(`${API_URL}/productos`);
            
            if (response.ok) {
                const datos = await response.json();
                
                // Mapear campos del backend al frontend
                productosData = datos.map(p => ({
                    id: p.codigoProducto || `PROD-${p.idProducto}`,
                    idBackend: p.idProducto,
                    nombre: p.nombreProducto,
                    descripcion: p.descripcionProducto,
                    precio: p.precioProducto,
                    categoria: p.categoriaProducto,
                    disponible: p.disponibleProducto
                }));
                
                console.log(`📊 ${productosData.length} productos cargados desde BD`);
            } else {
                console.error('❌ Error al cargar productos');
                productosData = [];
            }
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            mostrarNotificacion('Error al conectar con el servidor', 'error');
            productosData = [];
        }
    }
    
    // ==========================================
    // RENDERIZADO
    // ==========================================
    
    function renderizarProductos() {
        const contenedor = document.getElementById('productos-contenido');
        if (!contenedor) return;
        
        // Filtrar productos
        let productosFiltrados = productosData;
        
        // Filtrar por categoría
        if (categoriaFiltroActual !== 'todos') {
            productosFiltrados = productosFiltrados.filter(p => {
                return p.categoria === categoriaFiltroActual;
            });
        }
        
        // Filtrar por búsqueda
        if (terminoBusqueda && terminoBusqueda.trim() !== '') {
            productosFiltrados = productosFiltrados.filter(p => {
                const termino = terminoBusqueda.toLowerCase();
                return p.nombre.toLowerCase().includes(termino) ||
                       (p.descripcion && p.descripcion.toLowerCase().includes(termino)) ||
                       p.id.toLowerCase().includes(termino);
            });
        }
        
        // Si no hay productos
        if (productosFiltrados.length === 0) {
            let mensaje = 'No hay productos';
            if (categoriaFiltroActual !== 'todos') {
                mensaje += ` en la categoría: ${categoriaFiltroActual}`;
            }
            if (terminoBusqueda) {
                mensaje += `<br>Búsqueda: "${terminoBusqueda}"`;
            }
            
            contenedor.innerHTML = `
                <div class="tarjeta texto-centro">
                    <p>${mensaje}</p>
                </div>
            `;
            return;
        }
        
        // Renderizar productos
        contenedor.innerHTML = productosFiltrados.map(producto => crearTarjetaProducto(producto)).join('');
        
        console.log(`✅ ${productosFiltrados.length} productos renderizados`);
    }
    
    function crearTarjetaProducto(producto) {
        return `
            <div class="tarjeta-producto">
                <div class="producto-codigo">
                    <span class="codigo-badge">${producto.id}</span>
                    <span class="categoria-badge">${producto.categoria}</span>
                </div>
                
                <div class="producto-info-principal">
                    <h3 class="producto-nombre">${producto.nombre}</h3>
                    <p class="producto-descripcion">${producto.descripcion || 'Sin descripción'}</p>
                </div>
                
                <div class="producto-precio-estado">
                    <div class="producto-precio">${formatearMoneda(producto.precio)}</div>
                    
                    <label class="switch-disponibilidad">
                        <input type="checkbox" 
                               ${producto.disponible ? 'checked' : ''} 
                               onchange="cambiarDisponibilidad(${producto.idBackend})">
                        <span class="slider"></span>
                        <span class="texto-disponibilidad">
                            ${producto.disponible ? 'Disponible' : 'Agotado'}
                        </span>
                    </label>
                </div>
                
                <div class="producto-acciones">
                    <button class="btn btn-secundario" onclick="abrirEditarProducto(${producto.idBackend})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-peligro" onclick="confirmarEliminarProducto(${producto.idBackend})">
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
        const botonesFiltro = document.querySelectorAll('.filtro-btn');
        
        botonesFiltro.forEach(boton => {
            boton.addEventListener('click', function() {
                const categoria = this.dataset.categoria;
                categoriaFiltroActual = categoria;
                
                botonesFiltro.forEach(b => b.classList.remove('activo'));
                this.classList.add('activo');
                
                renderizarProductos();
                console.log(`🔍 Filtrando por categoría: ${categoria}`);
            });
        });
    }
    
    // ==========================================
    // BÚSQUEDA
    // ==========================================
    
    function inicializarBusqueda() {
        const inputBusqueda = document.getElementById('buscar-producto');
        
        if (inputBusqueda) {
            inputBusqueda.addEventListener('keyup', function() {
                terminoBusqueda = this.value;
                renderizarProductos();
            });
        }
    }
    
    // ==========================================
    // 🔥 CAMBIAR DISPONIBILIDAD (UPDATE)
    // ==========================================
    
    async function cambiarDisponibilidad(idProducto) {
        const producto = productosData.find(p => p.idBackend === idProducto);
        
        if (!producto) {
            mostrarNotificacion('Producto no encontrado', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/productos/${idProducto}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codigoProducto: producto.id,
                    nombreProducto: producto.nombre,
                    descripcionProducto: producto.descripcion,
                    precioProducto: producto.precio,
                    categoriaProducto: producto.categoria,
                    disponibleProducto: !producto.disponible
                })
            });
            
            if (response.ok) {
                await cargarProductos();
                renderizarProductos();
                const estado = !producto.disponible ? 'Disponible' : 'Agotado';
                mostrarNotificacion(`${producto.nombre} marcado como ${estado}`, 'exito');
            } else {
                mostrarNotificacion('Error al actualizar', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    // ==========================================
    // 🔥 AGREGAR PRODUCTO (CREATE)
    // ==========================================
    
    function nuevoProducto() {
        console.log('➕ Abriendo formulario nuevo producto...');
        
        let contenido = `
            <div class="formulario-producto">
                <div class="campo-formulario">
                    <label>Código del Producto:</label>
                    <input type="text" 
                           id="codigo-producto" 
                           placeholder="Ej: PROD-006"
                           maxlength="20">
                </div>
                
                <div class="campo-formulario">
                    <label>Nombre del Producto: *</label>
                    <input type="text" 
                           id="nombre-producto" 
                           placeholder="Ej: Ceviche Mixto"
                           maxlength="100">
                </div>
                
                <div class="campo-formulario">
                    <label>Descripción:</label>
                    <textarea id="descripcion-producto" 
                              rows="3" 
                              placeholder="Ej: Ceviche con pescado, calamares y camarones"
                              maxlength="200"></textarea>
                </div>
                
                <div class="campo-formulario">
                    <label>Precio (S/.): *</label>
                    <input type="number" 
                           id="precio-producto" 
                           placeholder="0.00"
                           min="0"
                           step="0.50">
                </div>
                
                <div class="campo-formulario">
                    <label>Categoría: *</label>
                    <select id="categoria-producto">
                        <option value="">-- Seleccione una categoría --</option>
                        ${categorias.map(cat => `
                            <option value="${cat}">${cat}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="campo-formulario">
                    <label class="checkbox-contenedor">
                        <input type="checkbox" id="disponible-producto" checked>
                        <span>Producto disponible</span>
                    </label>
                </div>
            </div>
        `;
        
        abrirModal('Nuevo Producto', contenido, guardarNuevoProducto);
    }
    
    async function guardarNuevoProducto() {
        const codigo = document.getElementById('codigo-producto').value.trim();
        const nombre = document.getElementById('nombre-producto').value.trim();
        const descripcion = document.getElementById('descripcion-producto').value.trim();
        const precio = parseFloat(document.getElementById('precio-producto').value);
        const categoria = document.getElementById('categoria-producto').value;
        const disponible = document.getElementById('disponible-producto').checked;
        
        // Validaciones
        if (!nombre) {
            mostrarNotificacion('Ingresa el nombre del producto', 'error');
            return;
        }
        
        if (!precio || precio <= 0) {
            mostrarNotificacion('Ingresa un precio válido', 'error');
            return;
        }
        
        if (!categoria) {
            mostrarNotificacion('Selecciona una categoría', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codigoProducto: codigo || `PROD-${Date.now()}`,
                    nombreProducto: nombre,
                    descripcionProducto: descripcion,
                    precioProducto: precio,
                    categoriaProducto: categoria,
                    disponibleProducto: disponible
                })
            });
            
            if (response.ok) {
                cerrarModal();
                await cargarProductos();
                renderizarProductos();
                mostrarNotificacion(`${nombre} agregado exitosamente`, 'exito');
                console.log('✅ Producto creado en BD');
            } else {
                mostrarNotificacion('Error al crear producto', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    // ==========================================
    // 🔥 EDITAR PRODUCTO (UPDATE)
    // ==========================================
    
    function abrirEditarProducto(idProducto) {
        const producto = productosData.find(p => p.idBackend === idProducto);
        
        if (!producto) {
            mostrarNotificacion('Producto no encontrado', 'error');
            return;
        }
        
        console.log(`✏️ Editando producto: ${producto.nombre}`);
        
        let contenido = `
            <div class="formulario-producto">
                <div class="campo-formulario">
                    <label>Código:</label>
                    <input type="text" 
                           id="codigo-producto-editar"
                           value="${producto.id}"
                           maxlength="20">
                </div>
                
                <div class="campo-formulario">
                    <label>Nombre del Producto: *</label>
                    <input type="text" 
                           id="nombre-producto-editar" 
                           value="${producto.nombre}"
                           maxlength="100">
                </div>
                
                <div class="campo-formulario">
                    <label>Descripción:</label>
                    <textarea id="descripcion-producto-editar" 
                              rows="3" 
                              maxlength="200">${producto.descripcion || ''}</textarea>
                </div>
                
                <div class="campo-formulario">
                    <label>Precio (S/.): *</label>
                    <input type="number" 
                           id="precio-producto-editar" 
                           value="${producto.precio}"
                           min="0"
                           step="0.50">
                </div>
                
                <div class="campo-formulario">
                    <label>Categoría: *</label>
                    <select id="categoria-producto-editar">
                        ${categorias.map(cat => `
                            <option value="${cat}" ${producto.categoria === cat ? 'selected' : ''}>
                                ${cat}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="campo-formulario">
                    <label class="checkbox-contenedor">
                        <input type="checkbox" 
                               id="disponible-producto-editar" 
                               ${producto.disponible ? 'checked' : ''}>
                        <span>Producto disponible</span>
                    </label>
                </div>
            </div>
        `;
        
        abrirModal('Editar Producto', contenido, function() {
            guardarEdicionProducto(idProducto);
        });
    }
    
    async function guardarEdicionProducto(idProducto) {
        const codigo = document.getElementById('codigo-producto-editar').value.trim();
        const nombre = document.getElementById('nombre-producto-editar').value.trim();
        const descripcion = document.getElementById('descripcion-producto-editar').value.trim();
        const precio = parseFloat(document.getElementById('precio-producto-editar').value);
        const categoria = document.getElementById('categoria-producto-editar').value;
        const disponible = document.getElementById('disponible-producto-editar').checked;
        
        // Validaciones
        if (!nombre) {
            mostrarNotificacion('Ingresa el nombre del producto', 'error');
            return;
        }
        
        if (!precio || precio <= 0) {
            mostrarNotificacion('Ingresa un precio válido', 'error');
            return;
        }
        
        if (!categoria) {
            mostrarNotificacion('Selecciona una categoría', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/productos/${idProducto}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codigoProducto: codigo,
                    nombreProducto: nombre,
                    descripcionProducto: descripcion,
                    precioProducto: precio,
                    categoriaProducto: categoria,
                    disponibleProducto: disponible
                })
            });
            
            if (response.ok) {
                cerrarModal();
                await cargarProductos();
                renderizarProductos();
                mostrarNotificacion(`${nombre} actualizado exitosamente`, 'exito');
                console.log('✅ Producto actualizado en BD');
            } else {
                mostrarNotificacion('Error al actualizar producto', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    // ==========================================
    // 🔥 ELIMINAR PRODUCTO (DELETE)
    // ==========================================
    
    function confirmarEliminarProducto(idProducto) {
        const producto = productosData.find(p => p.idBackend === idProducto);
        
        if (!producto) {
            mostrarNotificacion('Producto no encontrado', 'error');
            return;
        }
        
        if (!confirmar(`¿Eliminar el producto "${producto.nombre}"?\n\nCódigo: ${producto.id}\nPrecio: ${formatearMoneda(producto.precio)}\nCategoría: ${producto.categoria}\n\nEsta acción no se puede deshacer.`)) {
            return;
        }
        
        eliminarProducto(idProducto);
    }
    
    async function eliminarProducto(idProducto) {
        const producto = productosData.find(p => p.idBackend === idProducto);
        
        if (!producto) {
            mostrarNotificacion('Producto no encontrado', 'error');
            return;
        }
        
        const nombreProducto = producto.nombre;
        
        try {
            const response = await fetch(`${API_URL}/productos/${idProducto}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await cargarProductos();
                renderizarProductos();
                mostrarNotificacion(`${nombreProducto} eliminado`, 'exito');
                console.log('🗑️ Producto eliminado de BD');
            } else {
                mostrarNotificacion('Error al eliminar producto', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    // ==========================================
    // EXPORTAR FUNCIONES GLOBALES
    // ==========================================
    
    window.cambiarDisponibilidad = cambiarDisponibilidad;
    window.nuevoProducto = nuevoProducto;
    window.abrirEditarProducto = abrirEditarProducto;
    window.confirmarEliminarProducto = confirmarEliminarProducto;
    
    // ==========================================
    // EXPORTAR API PÚBLICA DEL MÓDULO
    // ==========================================
    
    window.Productos = {
        inicializar: inicializar,
        renderizar: renderizarProductos,
        cargar: cargarProductos
    };
    
    console.log('✅ Módulo Productos cargado - Modo API REST');
})();

// ==========================================
// ESTILOS
// ==========================================
const estilosProductos = document.createElement('style');
estilosProductos.textContent = `
    .barra-busqueda-productos { margin-bottom: 20px; }
    .campo-busqueda { position: relative; max-width: 600px; }
    .campo-busqueda i { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #7f8c8d; font-size: 16px; }
    .input-busqueda-grande { width: 100%; padding: 12px 15px 12px 45px; border: 2px solid #ddd; border-radius: 8px; font-size: 15px; transition: all 0.3s; }
    .input-busqueda-grande:focus { outline: none; border-color: var(--color-secundario); box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1); }
    .filtros-productos { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 25px; }
    .filtro-btn { padding: 10px 20px; border: 2px solid #ecf0f1; background: white; border-radius: 8px; cursor: pointer; transition: all 0.3s; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 8px; }
    .filtro-btn:hover { border-color: var(--color-secundario); color: var(--color-secundario); transform: translateY(-2px); }
    .filtro-btn.activo { background: var(--color-secundario); color: white; border-color: var(--color-secundario); }
    .contenedor-productos { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .tarjeta-producto { background: var(--fondo-tarjeta); border-radius: var(--radio-borde); padding: 20px; box-shadow: var(--sombra-tarjeta); transition: transform 0.2s; display: flex; flex-direction: column; gap: 15px; }
    .tarjeta-producto:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
    .producto-codigo { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
    .codigo-badge { background: rgba(52, 152, 219, 0.1); color: var(--color-secundario); padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; font-family: 'Courier New', monospace; }
    .categoria-badge { background: rgba(243, 156, 18, 0.1); color: #f39c12; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .producto-info-principal { flex: 1; }
    .producto-nombre { margin: 0 0 8px 0; color: var(--color-primario); font-size: 18px; font-weight: 600; }
    .producto-descripcion { margin: 0; color: #7f8c8d; font-size: 14px; line-height: 1.4; }
    .producto-precio-estado { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-top: 1px solid #ecf0f1; border-bottom: 1px solid #ecf0f1; }
    .producto-precio { font-size: 24px; font-weight: bold; color: var(--color-exito); }
    .switch-disponibilidad { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .switch-disponibilidad input { display: none; }
    .slider { position: relative; width: 50px; height: 26px; background: #ccc; border-radius: 26px; transition: 0.3s; }
    .slider::before { content: ''; position: absolute; width: 20px; height: 20px; left: 3px; top: 3px; background: white; border-radius: 50%; transition: 0.3s; }
    .switch-disponibilidad input:checked + .slider { background: var(--color-exito); }
    .switch-disponibilidad input:checked + .slider::before { transform: translateX(24px); }
    .texto-disponibilidad { font-size: 14px; font-weight: 500; min-width: 80px; }
    .producto-acciones { display: flex; gap: 10px; }
    .producto-acciones .btn { flex: 1; }
    .formulario-producto { padding: 10px 0; }
    .campo-formulario { margin-bottom: 20px; }
    .campo-formulario label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--texto-secundario); }
    .campo-formulario input[type="text"], .campo-formulario input[type="number"], .campo-formulario textarea, .campo-formulario select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; transition: border-color 0.3s; }
    .campo-formulario input:focus, .campo-formulario textarea:focus, .campo-formulario select:focus { outline: none; border-color: var(--color-secundario); }
    .checkbox-contenedor { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .checkbox-contenedor input[type="checkbox"] { width: 20px; height: 20px; cursor: pointer; }
    @media (max-width: 768px) {
        .contenedor-productos { grid-template-columns: 1fr; }
        .filtros-productos { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 10px; }
        .filtro-btn { white-space: nowrap; }
    }
`;
document.head.appendChild(estilosProductos);