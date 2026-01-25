/* ==========================================
   PRODUCTOS.JS - CONECTADO CON BACKEND
   🔥 CÓDIGO AUTOMÁTICO DESDE API - CORREGIDO
   ========================================== */

(function() {
    // ==========================================
    // VARIABLES PRIVADAS
    // ==========================================
    
    const API_URL = 'http://localhost:8085/api';
    let productosData = [];
    let categoriaActual = 'Todos';
    
    // Categorías del menú
    const CATEGORIAS = [
        'Todos',
        'Ceviches',
        'Promociones',
        'Tríos',
        'Bebidas',
        'Chicharrones',
        'Sopas',
        'Adicionales',
        'Dúos'
    ];
    
    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    
    async function inicializar() {
        console.log('🍽️ Inicializando módulo Productos...');
        
        await cargarProductos();
        renderizarCategorias();
        renderizarProductos();
        
        console.log('✅ Módulo Productos inicializado');
    }
    
    // ==========================================
    // 🔥 CARGAR DATOS DESDE API
    // ==========================================
    
    async function cargarProductos() {
        try {
            const response = await fetch(`${API_URL}/productos`);
            
            if (response.ok) {
                productosData = await response.json();
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
    // 🔥 OBTENER SIGUIENTE CÓDIGO (AUTOMÁTICO)
    // ==========================================
    
    async function obtenerSiguienteCodigo() {
        try {
            const response = await fetch(`${API_URL}/productos/siguiente-codigo`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('🔢 Siguiente código:', data.codigo);
                return data.codigo;
            }
        } catch (error) {
            console.error('❌ Error obteniendo código:', error);
        }
        
        // Fallback si falla la API
        return 'PROD-' + String(productosData.length + 1).padStart(3, '0');
    }
    
    // ==========================================
    // RENDERIZADO
    // ==========================================
    
    function renderizarCategorias() {
        const contenedor = document.getElementById('filtros-categorias');
        if (!contenedor) return;
        
        contenedor.innerHTML = CATEGORIAS.map(cat => `
            <button class="filtro-categoria ${cat === categoriaActual ? 'activo' : ''}" 
                    onclick="filtrarCategoria('${cat}')">
                ${cat === 'Todos' ? '<i class="fas fa-list"></i>' : ''}
                ${cat}
            </button>
        `).join('');
    }
    
    function renderizarProductos() {
        const contenedor = document.getElementById('grid-productos');
        if (!contenedor) return;
        
        let productosFiltrados = productosData;
        
        if (categoriaActual !== 'Todos') {
            productosFiltrados = productosData.filter(p => 
                p.categoriaProducto === categoriaActual
            );
        }
        
        if (productosFiltrados.length === 0) {
            contenedor.innerHTML = `
                <div class="mensaje-vacio">
                    <p>No hay productos en esta categoría</p>
                    <button class="btn btn-primario" onclick="nuevoProducto()">
                        <i class="fas fa-plus"></i> Agregar Producto
                    </button>
                </div>
            `;
            return;
        }
        
        contenedor.innerHTML = productosFiltrados.map(producto => crearTarjetaProducto(producto)).join('');
    }
    
    function crearTarjetaProducto(producto) {
        const disponible = producto.disponibleProducto !== false;
        
        return `
            <div class="tarjeta-producto ${!disponible ? 'no-disponible' : ''}">
                <div class="producto-badge">${producto.codigoProducto}</div>
                <span class="badge-categoria">${producto.categoriaProducto || 'Sin categoría'}</span>
                
                <h3>${producto.nombreProducto}</h3>
                <p class="descripcion">${producto.descripcionProducto || ''}</p>
                
                <div class="producto-precio">S/. ${parseFloat(producto.precioProducto).toFixed(2)}</div>
                
                <div class="producto-disponibilidad">
                    <label class="switch">
                        <input type="checkbox" ${disponible ? 'checked' : ''} 
                               onchange="toggleDisponibilidad(${producto.idProducto}, this.checked)">
                        <span class="slider"></span>
                    </label>
                    <span>${disponible ? 'Disponible' : 'No disponible'}</span>
                </div>
                
                <div class="producto-acciones">
                    <button class="btn btn-secundario" onclick="editarProducto(${producto.idProducto})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-peligro" onclick="eliminarProducto(${producto.idProducto})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    }
    
    // ==========================================
    // FILTROS
    // ==========================================
    
    function filtrarCategoria(categoria) {
        categoriaActual = categoria;
        renderizarCategorias();
        renderizarProductos();
    }
    
    async function buscarProducto(termino) {
        if (!termino || termino.trim() === '') {
            await cargarProductos();
            renderizarProductos();
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/productos/buscar?q=${encodeURIComponent(termino)}`);
            
            if (response.ok) {
                productosData = await response.json();
                renderizarProductos();
            }
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
    
    // ==========================================
    // 🔥 NUEVO PRODUCTO - CON CÓDIGO AUTOMÁTICO
    // ==========================================
    
    async function nuevoProducto() {
        // 🔥 OBTENER CÓDIGO AUTOMÁTICO
        const siguienteCodigo = await obtenerSiguienteCodigo();
        
        let contenido = `
            <div class="formulario-producto">
                <!-- 🔥 CÓDIGO AUTOMÁTICO - READONLY -->
                <div class="campo-form">
                    <label>Código del Producto:</label>
                    <input type="text" id="codigo-producto" 
                           value="${siguienteCodigo}" 
                           readonly 
                           style="background: #f0f0f0; cursor: not-allowed; color: #555;">
                    <small style="color: #7f8c8d; display: block; margin-top: 5px;">
                        <i class="fas fa-info-circle"></i> 
                        Se genera automáticamente de forma secuencial
                    </small>
                </div>
                
                <div class="campo-form">
                    <label>Nombre del Producto: *</label>
                    <input type="text" id="nombre-producto" 
                           placeholder="Ej: Ceviche Mixto" 
                           autofocus>
                </div>
                
                <div class="campo-form">
                    <label>Descripción:</label>
                    <textarea id="descripcion-producto" 
                              placeholder="Ej: Ceviche con pescado, calamares y camarones"></textarea>
                </div>
                
                <div class="campo-form">
                    <label>Precio (S/.): *</label>
                    <input type="number" id="precio-producto" 
                           min="0" step="0.01" 
                           placeholder="0.00">
                </div>
                
                <div class="campo-form">
                    <label>Categoría: *</label>
                    <select id="categoria-producto">
                        <option value="">-- Selecciona una categoría --</option>
                        ${CATEGORIAS.filter(c => c !== 'Todos').map(cat => 
                            `<option value="${cat}">${cat}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        `;
        
        abrirModal('Nuevo Producto', contenido, confirmarNuevoProducto);
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Crear Producto';
        }
    }
    
    async function confirmarNuevoProducto() {
        const nombre = document.getElementById('nombre-producto').value.trim();
        const descripcion = document.getElementById('descripcion-producto').value.trim();
        const precio = parseFloat(document.getElementById('precio-producto').value);
        const categoria = document.getElementById('categoria-producto').value;
        
        // Validaciones
        if (!nombre) {
            mostrarNotificacion('El nombre del producto es obligatorio', 'error');
            return;
        }
        
        if (!precio || precio < 0) {
            mostrarNotificacion('El precio debe ser mayor o igual a 0', 'error');
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
                    // 🔥 NO ENVIAR CÓDIGO - El backend lo genera automáticamente
                    nombreProducto: nombre,
                    descripcionProducto: descripcion,
                    precioProducto: precio,
                    categoriaProducto: categoria,
                    disponibleProducto: true
                })
            });
            
            if (response.ok) {
                const productoCreado = await response.json();
                cerrarModal();
                await cargarProductos();
                renderizarProductos();
                mostrarNotificacion(
                    `Producto "${productoCreado.codigoProducto}" creado exitosamente`, 
                    'exito'
                );
                console.log('✅ Producto creado:', productoCreado.codigoProducto);
            } else {
                const error = await response.json();
                mostrarNotificacion(error.error || 'Error al crear producto', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión con el servidor', 'error');
        }
    }
    
    function editarProducto(idProducto) {
        const producto = productosData.find(p => p.idProducto === idProducto);
        if (!producto) {
            mostrarNotificacion('Producto no encontrado', 'error');
            return;
        }
        
        let contenido = `
            <div class="formulario-producto">
                <div class="campo-form">
                    <label>Código del Producto:</label>
                    <input type="text" value="${producto.codigoProducto}" readonly 
                           style="background: #f0f0f0; cursor: not-allowed;">
                </div>
                
                <div class="campo-form">
                    <label>Nombre del Producto: *</label>
                    <input type="text" id="nombre-producto-edit" value="${producto.nombreProducto}">
                </div>
                
                <div class="campo-form">
                    <label>Descripción:</label>
                    <textarea id="descripcion-producto-edit">${producto.descripcionProducto || ''}</textarea>
                </div>
                
                <div class="campo-form">
                    <label>Precio (S/.): *</label>
                    <input type="number" id="precio-producto-edit" min="0" step="0.01" 
                           value="${producto.precioProducto}">
                </div>
                
                <div class="campo-form">
                    <label>Categoría: *</label>
                    <select id="categoria-producto-edit">
                        ${CATEGORIAS.filter(c => c !== 'Todos').map(cat => 
                            `<option value="${cat}" ${producto.categoriaProducto === cat ? 'selected' : ''}>${cat}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        `;
        
        abrirModal('Editar Producto', contenido, async function() {
            const nombre = document.getElementById('nombre-producto-edit').value.trim();
            const descripcion = document.getElementById('descripcion-producto-edit').value.trim();
            const precio = parseFloat(document.getElementById('precio-producto-edit').value);
            const categoria = document.getElementById('categoria-producto-edit').value;
            
            if (!nombre || !precio || precio < 0 || !categoria) {
                mostrarNotificacion('Completa los campos correctamente', 'error');
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/productos/${idProducto}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombreProducto: nombre,
                        descripcionProducto: descripcion,
                        precioProducto: precio,
                        categoriaProducto: categoria
                    })
                });
                
                if (response.ok) {
                    cerrarModal();
                    await cargarProductos();
                    renderizarProductos();
                    mostrarNotificacion('Producto actualizado', 'exito');
                } else {
                    const error = await response.json();
                    mostrarNotificacion(error.error || 'Error al actualizar', 'error');
                }
            } catch (error) {
                console.error('❌ Error:', error);
                mostrarNotificacion('Error de conexión', 'error');
            }
        });
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Actualizar';
        }
    }
    
    async function toggleDisponibilidad(idProducto, disponible) {
        try {
            const response = await fetch(`${API_URL}/productos/${idProducto}/disponibilidad`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disponible: disponible })
            });
            
            if (response.ok) {
                await cargarProductos();
                renderizarProductos();
                mostrarNotificacion(disponible ? 'Producto disponible' : 'Producto no disponible', 'exito');
            }
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
    
    async function eliminarProducto(idProducto) {
        const producto = productosData.find(p => p.idProducto === idProducto);
        if (!producto) return;
        
        if (!confirmar(`¿Eliminar el producto "${producto.nombreProducto}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/productos/${idProducto}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await cargarProductos();
                renderizarProductos();
                mostrarNotificacion('Producto eliminado', 'exito');
            } else {
                const error = await response.json();
                mostrarNotificacion(error.error || 'Error al eliminar', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    // ==========================================
    // EXPORTAR FUNCIONES GLOBALES
    // ==========================================
    
    window.nuevoProducto = nuevoProducto;
    window.editarProducto = editarProducto;
    window.eliminarProducto = eliminarProducto;
    window.toggleDisponibilidad = toggleDisponibilidad;
    window.filtrarCategoria = filtrarCategoria;
    window.buscarProducto = buscarProducto;
    
    // ==========================================
    // EXPORTAR API PÚBLICA
    // ==========================================
    
    window.Productos = {
        inicializar: inicializar,
        cargarProductos: cargarProductos,
        renderizarProductos: renderizarProductos
    };
    
    console.log('✅ Módulo Productos cargado - Modo API REST con código automático');
})();

// ==========================================
// ESTILOS
// ==========================================
const estilosProductos = document.createElement('style');
estilosProductos.textContent = `
    .filtro-categoria{background:white;border:1px solid #ddd;padding:10px 20px;border-radius:20px;cursor:pointer;transition:all .3s;font-size:14px}.filtro-categoria.activo,.filtro-categoria:hover{background:var(--color-primario);color:white;border-color:var(--color-primario)}.grid-productos{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin-top:20px}.tarjeta-producto{background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1);position:relative;transition:all .3s}.tarjeta-producto:hover{box-shadow:0 4px 12px rgba(0,0,0,.15);transform:translateY(-3px)}.tarjeta-producto.no-disponible{opacity:.6}.producto-badge{position:absolute;top:10px;left:10px;background:var(--color-primario);color:white;padding:5px 10px;border-radius:5px;font-size:12px;font-weight:bold}.badge-categoria{position:absolute;top:10px;right:10px;background:#ecf0f1;color:#7f8c8d;padding:5px 10px;border-radius:5px;font-size:11px}.tarjeta-producto h3{margin:30px 0 10px 0;color:var(--color-texto)}.tarjeta-producto .descripcion{color:#7f8c8d;font-size:14px;margin-bottom:15px;min-height:40px}.producto-precio{font-size:24px;font-weight:bold;color:var(--color-exito);margin-bottom:15px}.producto-disponibilidad{display:flex;align-items:center;gap:10px;margin-bottom:15px}.switch{position:relative;width:50px;height:26px}.switch input{opacity:0;width:0;height:0}.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#ccc;transition:.3s;border-radius:26px}.slider:before{position:absolute;content:"";height:20px;width:20px;left:3px;bottom:3px;background:white;transition:.3s;border-radius:50%}input:checked+.slider{background:var(--color-exito)}input:checked+.slider:before{transform:translateX(24px)}.producto-acciones{display:flex;gap:10px}.producto-acciones .btn{flex:1}.mensaje-vacio{text-align:center;padding:40px;color:#7f8c8d;grid-column:1/-1}
`;
document.head.appendChild(estilosProductos);