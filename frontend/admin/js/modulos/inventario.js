/* ==========================================
   INVENTARIO.JS - CONECTADO CON BACKEND
   🔥 BOTÓN ASIGNAR RECETA FUNCIONANDO
   ========================================== */

(function() {
    // ==========================================
    // VARIABLES PRIVADAS
    // ==========================================
    
    const API_URL = 'http://localhost:8085/api';
    let insumosData = [];
    let productosData = [];
    let tabActualInventario = 'insumos';
    let filtroActualInsumos = 'todos';
    
    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    
    async function inicializar() {
        console.log('📦 Inicializando módulo Inventario...');
        
        await cargarInsumos();
        await cargarProductos();
        
        renderizarInsumos();
        renderizarRecetas();
        
        console.log('✅ Módulo Inventario inicializado');
    }
    
    // ==========================================
    // CARGAR DATOS
    // ==========================================
    
    async function cargarInsumos() {
        try {
            const response = await fetch(`${API_URL}/insumos`);
            if (response.ok) {
                insumosData = await response.json();
                console.log(`📊 ${insumosData.length} insumos cargados`);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            insumosData = [];
        }
    }
    
    async function cargarProductos() {
        try {
            const response = await fetch(`${API_URL}/productos`);
            if (response.ok) {
                const datos = await response.json();
                productosData = datos.map(p => ({
                    id: p.idProducto,
                    codigo: p.codigoProducto,
                    nombre: p.nombreProducto,
                    categoria: p.categoriaProducto,
                    precio: p.precioProducto
                }));
                console.log(`📊 ${productosData.length} productos cargados`);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            productosData = [];
        }
    }
    
    // ==========================================
    // TABS
    // ==========================================
    
    function cambiarTabInventario(tab) {
        tabActualInventario = tab;
        
        document.querySelectorAll('#seccion-inventario .tab-btn').forEach(btn => {
            btn.classList.remove('activo');
        });
        document.querySelectorAll('#seccion-inventario .tab-content').forEach(content => {
            content.classList.remove('activo');
        });
        
        if (tab === 'insumos') {
            document.querySelector('#seccion-inventario .tab-btn:nth-child(1)')?.classList.add('activo');
            document.getElementById('tab-insumos')?.classList.add('activo');
            renderizarInsumos();
        } else if (tab === 'recetas') {
            document.querySelector('#seccion-inventario .tab-btn:nth-child(2)')?.classList.add('activo');
            document.getElementById('tab-recetas')?.classList.add('activo');
            renderizarRecetas();
        }
    }
    
    // ==========================================
    // RENDERIZADO INSUMOS
    // ==========================================
    
    function renderizarInsumos() {
        const contenedor = document.getElementById('lista-insumos');
        if (!contenedor) return;
        
        let insumosFiltrados = insumosData;
        
        if (filtroActualInsumos === 'stock-bajo') {
            insumosFiltrados = insumosData.filter(i => 
                parseFloat(i.stockActual) <= parseFloat(i.stockMinimo)
            );
        }
        
        if (insumosFiltrados.length === 0) { 
            contenedor.innerHTML = `
                <div class="mensaje-vacio">
                    <p>No hay insumos registrados</p>
                    <button class="btn btn-primario" onclick="nuevoInsumo()">
                        <i class="fas fa-plus"></i> Agregar Primer Insumo
                    </button>
                </div>
            `;
            return;
        }
        
        contenedor.innerHTML = `
            <div class="grid-insumos">
                ${insumosFiltrados.map(insumo => crearTarjetaInsumo(insumo)).join('')}
            </div>
        `;
    }
    
    function crearTarjetaInsumo(insumo) {
        const stockActual = parseFloat(insumo.stockActual) || 0;
        const stockMinimo = parseFloat(insumo.stockMinimo) || 1;
        const stockBajo = stockActual <= stockMinimo;
        const porcentaje = Math.min((stockActual / stockMinimo) * 100, 100);
        
        return `
            <div class="tarjeta-insumo ${stockBajo ? 'stock-bajo' : ''}">
                ${stockBajo ? '<div class="alerta-stock"><i class="fas fa-exclamation-triangle"></i> Stock Bajo</div>' : ''}
                
                <div class="insumo-header">
                    <h4>${insumo.nombreInsumo}</h4>
                    <span class="badge badge-secondary">${insumo.unidadMedida || 'unidades'}</span>
                </div>
                
                <div class="insumo-stock">
                    <div class="stock-numeros">
                        <div class="stock-actual">
                            <span class="label">Stock Actual:</span>
                            <span class="valor ${stockBajo ? 'texto-peligro' : 'texto-exito'}">${stockActual}</span>
                        </div>
                        <div class="stock-minimo">
                            <span class="label">Stock Mínimo:</span>
                            <span class="valor">${stockMinimo}</span>
                        </div>
                    </div>
                    
                    <div class="barra-stock">
                        <div class="barra-progreso" style="width: ${porcentaje}%; background: ${stockBajo ? 'var(--color-peligro)' : 'var(--color-exito)'};"></div>
                    </div>
                </div>
                
                <div class="insumo-acciones">
                    <button class="btn btn-pequeño btn-primario" onclick="ajustarStockModal(${insumo.idInsumo})" title="Ajustar stock">
                        <i class="fas fa-plus-minus"></i>
                    </button>
                    <button class="btn btn-pequeño btn-secundario" onclick="editarInsumo(${insumo.idInsumo})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-pequeño btn-peligro" onclick="eliminarInsumo(${insumo.idInsumo})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    // ==========================================
    // CRUD INSUMOS
    // ==========================================
    
    function nuevoInsumo() {
        let contenido = `
            <div class="formulario-insumo">
                <div class="campo-form">
                    <label>Nombre del Insumo: *</label>
                    <input type="text" id="nombre-insumo" placeholder="Ej: Limón">
                </div>
                
                <div class="campo-form">
                    <label>Unidad de Medida: *</label>
                    <select id="unidad-insumo">
                        <option value="unidades">Unidades</option>
                        <option value="kilogramos">Kilogramos (kg)</option>
                        <option value="gramos">Gramos (g)</option>
                        <option value="litros">Litros (L)</option>
                        <option value="mililitros">Mililitros (ml)</option>
                    </select>
                </div>
                
                <div class="campo-form">
                    <label>Stock Inicial:</label>
                    <input type="number" id="stock-inicial-insumo" min="0" step="0.01" value="0">
                </div>
                
                <div class="campo-form">
                    <label>Stock Mínimo: *</label>
                    <input type="number" id="stock-minimo-insumo" min="0" step="0.01" placeholder="Ej: 20">
                </div>
            </div>
        `;
        
        abrirModal('Nuevo Insumo', contenido, confirmarNuevoInsumo);
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Guardar';
        }
    }
    
    async function confirmarNuevoInsumo() {
        const nombre = document.getElementById('nombre-insumo').value.trim();
        const unidad = document.getElementById('unidad-insumo').value;
        const stockInicial = parseFloat(document.getElementById('stock-inicial-insumo').value) || 0;
        const stockMinimo = parseFloat(document.getElementById('stock-minimo-insumo').value);
        
        if (!nombre) {
            mostrarNotificacion('Ingresa el nombre del insumo', 'error');
            return;
        }
        
        if (!stockMinimo || stockMinimo < 0) {
            mostrarNotificacion('Ingresa un stock mínimo válido', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/insumos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombreInsumo: nombre,
                    unidadMedida: unidad,
                    stockActual: stockInicial,
                    stockMinimo: stockMinimo
                })
            });
            
            if (response.ok) {
                cerrarModal();
                await cargarInsumos();
                renderizarInsumos();
                mostrarNotificacion(`Insumo "${nombre}" creado`, 'exito');
            } else {
                const error = await response.json();
                mostrarNotificacion(error.error || 'Error al crear insumo', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    function editarInsumo(idInsumo) {
        const insumo = insumosData.find(i => i.idInsumo === idInsumo);
        if (!insumo) return;
        
        let contenido = `
            <div class="formulario-insumo">
                <div class="campo-form">
                    <label>Nombre del Insumo: *</label>
                    <input type="text" id="nombre-insumo-edit" value="${insumo.nombreInsumo}">
                </div>
                
                <div class="campo-form">
                    <label>Unidad de Medida: *</label>
                    <select id="unidad-insumo-edit">
                        <option value="unidades" ${insumo.unidadMedida === 'unidades' ? 'selected' : ''}>Unidades</option>
                        <option value="kilogramos" ${insumo.unidadMedida === 'kilogramos' ? 'selected' : ''}>Kilogramos (kg)</option>
                        <option value="gramos" ${insumo.unidadMedida === 'gramos' ? 'selected' : ''}>Gramos (g)</option>
                        <option value="litros" ${insumo.unidadMedida === 'litros' ? 'selected' : ''}>Litros (L)</option>
                        <option value="mililitros" ${insumo.unidadMedida === 'mililitros' ? 'selected' : ''}>Mililitros (ml)</option>
                    </select>
                </div>
                
                <div class="campo-form">
                    <label>Stock Mínimo: *</label>
                    <input type="number" id="stock-minimo-insumo-edit" min="0" step="0.01" value="${insumo.stockMinimo}">
                </div>
            </div>
        `;
        
        abrirModal('Editar Insumo', contenido, async function() {
            const nombre = document.getElementById('nombre-insumo-edit').value.trim();
            const unidad = document.getElementById('unidad-insumo-edit').value;
            const stockMinimo = parseFloat(document.getElementById('stock-minimo-insumo-edit').value);
            
            try {
                const response = await fetch(`${API_URL}/insumos/${idInsumo}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombreInsumo: nombre,
                        unidadMedida: unidad,
                        stockMinimo: stockMinimo
                    })
                });
                
                if (response.ok) {
                    cerrarModal();
                    await cargarInsumos();
                    renderizarInsumos();
                    mostrarNotificacion('Insumo actualizado', 'exito');
                }
            } catch (error) {
                mostrarNotificacion('Error de conexión', 'error');
            }
        });
        
        document.getElementById('modal-btn-confirmar').style.display = 'inline-flex';
    }
    
    async function eliminarInsumo(idInsumo) {
        const insumo = insumosData.find(i => i.idInsumo === idInsumo);
        if (!insumo) return;
        
        if (!confirmar(`¿Eliminar el insumo "${insumo.nombreInsumo}"?`)) return;
        
        try {
            const response = await fetch(`${API_URL}/insumos/${idInsumo}`, { method: 'DELETE' });
            
            if (response.ok) {
                await cargarInsumos();
                renderizarInsumos();
                mostrarNotificacion('Insumo eliminado', 'exito');
            }
        } catch (error) {
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    // ==========================================
    // AJUSTAR STOCK
    // ==========================================
    
    function ajustarStockModal(idInsumo) {
        const insumo = insumosData.find(i => i.idInsumo === idInsumo);
        if (!insumo) return;
        
        let contenido = `
            <div class="formulario-insumo">
                <p style="text-align: center; margin-bottom: 20px;">
                    <strong>${insumo.nombreInsumo}</strong><br>
                    Stock Actual: <span style="color: var(--color-primario); font-size: 20px;">${insumo.stockActual} ${insumo.unidadMedida}</span>
                </p>
                
                <div class="campo-form">
                    <label>Tipo de Ajuste:</label>
                    <select id="tipo-ajuste">
                        <option value="sumar">➕ Sumar (entrada)</option>
                        <option value="restar">➖ Restar (salida)</option>
                        <option value="establecer">📝 Establecer cantidad exacta</option>
                    </select>
                </div>
                
                <div class="campo-form">
                    <label>Cantidad:</label>
                    <input type="number" id="cantidad-ajuste" min="0" step="0.01" placeholder="0">
                </div>
            </div>
        `;
        
        abrirModal('Ajustar Stock', contenido, async function() {
            const tipo = document.getElementById('tipo-ajuste').value;
            const cantidad = parseFloat(document.getElementById('cantidad-ajuste').value);
            
            if (!cantidad || cantidad < 0) {
                mostrarNotificacion('Ingresa una cantidad válida', 'error');
                return;
            }
            
            try {
                let endpoint = '';
                let body = {};
                
                if (tipo === 'sumar') {
                    endpoint = `${API_URL}/insumos/${idInsumo}/aumentar-stock`;
                    body = { cantidad: cantidad };
                } else if (tipo === 'restar') {
                    endpoint = `${API_URL}/insumos/${idInsumo}/disminuir-stock`;
                    body = { cantidad: cantidad };
                } else {
                    endpoint = `${API_URL}/insumos/${idInsumo}/ajustar-stock`;
                    body = { nuevoStock: cantidad };
                }
                
                const response = await fetch(endpoint, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                
                if (response.ok) {
                    cerrarModal();
                    await cargarInsumos();
                    renderizarInsumos();
                    mostrarNotificacion('Stock ajustado', 'exito');
                }
            } catch (error) {
                mostrarNotificacion('Error de conexión', 'error');
            }
        });
        
        document.getElementById('modal-btn-confirmar').style.display = 'inline-flex';
    }
    
    function filtrarInsumos(filtro) {
        filtroActualInsumos = filtro;
        renderizarInsumos();
    }
    
    // ==========================================
    // 🔥 RECETAS - RENDERIZADO
    // ==========================================
    
    async function renderizarRecetas() {
        const contenedor = document.getElementById('lista-recetas');
        if (!contenedor) return;
        
        await cargarProductos();
        
        if (productosData.length === 0) {
            contenedor.innerHTML = '<div class="mensaje-vacio"><p>No hay productos en el menú</p></div>';
            return;
        }
        
        let html = '<div class="lista-recetas">';
        
        for (const producto of productosData) {
            html += await crearTarjetaReceta(producto);
        }
        
        html += '</div>';
        contenedor.innerHTML = html;
    }
    
    async function crearTarjetaReceta(producto) {
        let recetaHtml = '<p style="color: #999; font-style: italic;">Sin receta asignada</p>';
        let tieneReceta = false;
        
        try {
            const response = await fetch(`${API_URL}/recetas/producto/${producto.id}`);
            if (response.ok) {
                const receta = await response.json();
                if (receta && receta.length > 0) {
                    tieneReceta = true;
                    recetaHtml = `
                        <div class="receta-insumos">
                            <strong>Insumos:</strong>
                            <ul>
                                ${receta.map(r => {
                                    const insumo = insumosData.find(i => i.idInsumo === r.idInsumo);
                                    return `<li>${r.cantidadNecesaria} ${insumo?.unidadMedida || ''} - ${insumo?.nombreInsumo || 'Insumo'}</li>`;
                                }).join('')}
                            </ul>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Error cargando receta:', error);
        }
        
        return `
            <div class="tarjeta-receta">
                <div class="receta-header">
                    <div>
                        <h4>${producto.nombre}</h4>
                        <span class="badge badge-secondary">${producto.categoria}</span>
                    </div>
                    <button class="btn btn-pequeño btn-primario" onclick="editarReceta(${producto.id})">
                        <i class="fas ${tieneReceta ? 'fa-edit' : 'fa-plus'}"></i>
                        ${tieneReceta ? 'Editar' : 'Asignar'}
                    </button>
                </div>
                ${recetaHtml}
            </div>
        `;
    }
    
    // ==========================================
    // 🔥 ASIGNAR RECETA - FUNCIONAL
    // ==========================================
    
    async function asignarReceta() {
        // Abrir modal para seleccionar producto y asignar receta
        await cargarProductos();
        
        if (productosData.length === 0) {
            mostrarNotificacion('No hay productos disponibles', 'error');
            return;
        }
        
        let contenido = `
            <div class="formulario-receta">
                <div class="campo-form">
                    <label>Seleccionar Producto: *</label>
                    <select id="producto-receta-select">
                        <option value="">-- Selecciona un producto --</option>
                        ${productosData.map(p => `
                            <option value="${p.id}">${p.codigo} - ${p.nombre}</option>
                        `).join('')}
                    </select>
                </div>
                
                <hr>
                
                <h4>Insumos de la Receta:</h4>
                <div id="insumos-receta-container">
                    ${crearFilaInsumoReceta(null, 0)}
                </div>
                
                <button type="button" class="btn btn-secundario" onclick="agregarFilaInsumoReceta()" style="margin-top: 10px;">
                    <i class="fas fa-plus"></i> Agregar Insumo
                </button>
            </div>
        `;
        
        abrirModal('Asignar Receta a Producto', contenido, async function() {
            const idProducto = document.getElementById('producto-receta-select').value;
            if (!idProducto) {
                mostrarNotificacion('Selecciona un producto', 'error');
                return;
            }
            await confirmarReceta(parseInt(idProducto));
        });
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Guardar Receta';
        }
    }
    
    async function editarReceta(idProducto) {
        const producto = productosData.find(p => p.id === idProducto);
        if (!producto) {
            mostrarNotificacion('Producto no encontrado', 'error');
            return;
        }
        
        // Cargar receta existente
        let recetaExistente = [];
        try {
            const response = await fetch(`${API_URL}/recetas/producto/${idProducto}`);
            if (response.ok) {
                recetaExistente = await response.json();
            }
        } catch (error) {
            console.error('Error cargando receta:', error);
        }
        
        let contenido = `
            <div class="formulario-receta">
                <div class="campo-form">
                    <label>Producto:</label>
                    <input type="text" value="${producto.codigo} - ${producto.nombre}" disabled style="background: #f5f5f5;">
                </div>
                
                <hr>
                
                <h4>Insumos de la Receta:</h4>
                <div id="insumos-receta-container">
                    ${recetaExistente.length > 0 ? 
                        recetaExistente.map((r, index) => crearFilaInsumoReceta(r, index)).join('') 
                        : crearFilaInsumoReceta(null, 0)
                    }
                </div>
                
                <button type="button" class="btn btn-secundario" onclick="agregarFilaInsumoReceta()" style="margin-top: 10px;">
                    <i class="fas fa-plus"></i> Agregar Insumo
                </button>
            </div>
        `;
        
        abrirModal(`Receta: ${producto.nombre}`, contenido, async function() {
            await confirmarReceta(idProducto);
        });
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Guardar Receta';
        }
    }
    
    function crearFilaInsumoReceta(recetaItem, index) {
        return `
            <div class="fila-insumo-receta" data-index="${index}">
                <select class="insumo-select">
                    <option value="">-- Selecciona insumo --</option>
                    ${insumosData.map(i => `
                        <option value="${i.idInsumo}" ${recetaItem && recetaItem.idInsumo === i.idInsumo ? 'selected' : ''}>
                            ${i.nombreInsumo} (${i.unidadMedida})
                        </option>
                    `).join('')}
                </select>
                
                <input type="number" class="cantidad-input" placeholder="Cantidad" 
                       min="0" step="0.01" value="${recetaItem ? recetaItem.cantidadNecesaria : ''}">
                
                <button type="button" class="btn btn-peligro btn-pequeño" onclick="eliminarFilaInsumoReceta(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }
    
    function agregarFilaInsumoReceta() {
        const container = document.getElementById('insumos-receta-container');
        const index = container.children.length;
        container.insertAdjacentHTML('beforeend', crearFilaInsumoReceta(null, index));
    }
    
    function eliminarFilaInsumoReceta(index) {
        const fila = document.querySelector(`.fila-insumo-receta[data-index="${index}"]`);
        if (fila) {
            fila.remove();
        }
    }
    
    async function confirmarReceta(idProducto) {
        const filas = document.querySelectorAll('.fila-insumo-receta');
        const insumos = [];
        
        filas.forEach(fila => {
            const select = fila.querySelector('.insumo-select');
            const cantidadInput = fila.querySelector('.cantidad-input');
            
            const idInsumo = select.value;
            const cantidad = parseFloat(cantidadInput.value);
            
            if (idInsumo && cantidad > 0) {
                insumos.push({
                    idInsumo: parseInt(idInsumo),
                    cantidad: cantidad
                });
            }
        });
        
        if (insumos.length === 0) {
            mostrarNotificacion('Agrega al menos un insumo', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/recetas/producto/${idProducto}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ insumos: insumos })
            });
            
            if (response.ok) {
                cerrarModal();
                renderizarRecetas();
                mostrarNotificacion('Receta guardada correctamente', 'exito');
                console.log('✅ Receta asignada en BD');
            } else {
                const error = await response.json();
                mostrarNotificacion(error.error || 'Error al guardar receta', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    // ==========================================
    // EXPORTAR FUNCIONES GLOBALES
    // ==========================================
    
    window.cambiarTabInventario = cambiarTabInventario;
    window.nuevoInsumo = nuevoInsumo;
    window.editarInsumo = editarInsumo;
    window.eliminarInsumo = eliminarInsumo;
    window.ajustarStockModal = ajustarStockModal;
    window.filtrarInsumos = filtrarInsumos;
    window.asignarReceta = asignarReceta;  // 🔥 NUEVA FUNCIÓN
    window.editarReceta = editarReceta;
    window.agregarFilaInsumoReceta = agregarFilaInsumoReceta;
    window.eliminarFilaInsumoReceta = eliminarFilaInsumoReceta;
    
    window.Inventario = {
        inicializar: inicializar,
        cargarInsumos: cargarInsumos,
        renderizarInsumos: renderizarInsumos,
        renderizarRecetas: renderizarRecetas
    };
    
    console.log('✅ Módulo Inventario cargado - Modo API REST');
})();

// ==========================================
// ESTILOS
// ==========================================
const estilosInventario = document.createElement('style');
estilosInventario.textContent = `
    .tabs-inventario{display:flex;gap:10px;margin:20px 0;border-bottom:2px solid #ecf0f1}.tab-btn{background:none;border:none;padding:12px 20px;cursor:pointer;color:#7f8c8d;font-weight:500;transition:all .3s;border-bottom:3px solid transparent}.tab-btn.activo{color:var(--color-primario);border-bottom-color:var(--color-primario)}.tab-btn:hover{color:var(--color-primario)}.tab-content{display:none}.tab-content.activo{display:block}.grid-insumos{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin-top:20px}.tarjeta-insumo{background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1);position:relative;transition:all .3s}.tarjeta-insumo:hover{box-shadow:0 4px 12px rgba(0,0,0,.15);transform:translateY(-3px)}.tarjeta-insumo.stock-bajo{border-left:4px solid var(--color-peligro)}.alerta-stock{background:var(--color-peligro);color:white;padding:5px 10px;border-radius:5px;font-size:12px;margin-bottom:10px;display:inline-block}.insumo-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}.insumo-header h4{margin:0;color:var(--color-texto)}.insumo-stock{margin:15px 0}.stock-numeros{display:flex;justify-content:space-between;margin-bottom:10px}.stock-actual,.stock-minimo{display:flex;flex-direction:column;gap:5px}.stock-actual .label,.stock-minimo .label{font-size:12px;color:#7f8c8d}.stock-actual .valor,.stock-minimo .valor{font-size:20px;font-weight:bold}.barra-stock{background:#ecf0f1;height:8px;border-radius:10px;overflow:hidden}.barra-progreso{height:100%;transition:width .3s}.insumo-acciones{display:flex;gap:5px;justify-content:flex-end;margin-top:15px}.lista-recetas{display:flex;flex-direction:column;gap:15px}.tarjeta-receta{background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1)}.receta-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}.receta-header h4{margin:0 0 5px 0}.receta-insumos{background:#f8f9fa;padding:15px;border-radius:8px;margin-top:15px}.receta-insumos ul{margin:10px 0 0 20px}.receta-insumos li{margin:5px 0}.fila-insumo-receta{display:flex;gap:10px;margin:10px 0;align-items:center}.fila-insumo-receta .insumo-select{flex:2;padding:8px;border:1px solid #ddd;border-radius:5px}.fila-insumo-receta .cantidad-input{flex:1;padding:8px;border:1px solid #ddd;border-radius:5px}.btn-pequeño{padding:8px 12px;font-size:13px}.mensaje-vacio{text-align:center;padding:40px;color:#7f8c8d}
`;
document.head.appendChild(estilosInventario);