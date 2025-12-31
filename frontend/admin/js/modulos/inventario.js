/* ==========================================
   INVENTARIO.JS - REFACTORIZADO
   Módulo de gestión de inventario
   ========================================== */

(function() {
    // ==========================================
    // VARIABLES PRIVADAS DEL MÓDULO
    // ==========================================
    
    let insumosData = [];
    let recetasData = [];
    let tabActualInventario = 'insumos';
    let filtroActualInsumos = 'todos';
    
    // ==========================================
    // FUNCIÓN DE INICIALIZACIÓN PÚBLICA
    // ==========================================
    
    function inicializar() {
        console.log('📦 Inicializando módulo Inventario...');
        
        cargarInsumos();
        cargarRecetas();
        renderizarInsumos();
        renderizarRecetas();
        
        console.log('✅ Módulo Inventario inicializado');
    }
    function inicializar() {
    console.log('📦 Inicializando módulo Inventario...');
    
    cargarInsumos();
    
    // 🔥 NUEVO: Si no hay insumos, crear ejemplos
    if (insumosData.length === 0) {
        crearInsumosDeEjemplo();
    }
    
    cargarRecetas();
    renderizarInsumos();
    renderizarRecetas();
    
    console.log('✅ Módulo Inventario inicializado');
}

// 🔥 NUEVA FUNCIÓN
function crearInsumosDeEjemplo() {
    console.log('📦 Creando insumos de ejemplo...');
    
    const insumosEjemplo = [
        {
            id: 'INS-001',
            nombre: 'Limón',
            unidadMedida: 'unidad',
            stockActual: 65,
            stockMinimo: 20,
            fechaCreacion: obtenerFechaActual()
        },
        {
            id: 'INS-002',
            nombre: 'Pescado',
            unidadMedida: 'gramos',
            stockActual: 500,
            stockMinimo: 200,
            fechaCreacion: obtenerFechaActual()
        },
        {
            id: 'INS-003',
            nombre: 'Cebolla',
            unidadMedida: 'unidad',
            stockActual: 89,
            stockMinimo: 50,
            fechaCreacion: obtenerFechaActual()
        }
    ];
    
    insumosData = insumosEjemplo;
    guardarDatos('insumos', insumosData);
    
    console.log('✅ 3 insumos de ejemplo creados');
}
    // ==========================================
    // FUNCIONES DE CARGA
    // ==========================================
    
    function cargarInsumos() {
        insumosData = obtenerDatos('insumos') || [];
        console.log(`📊 ${insumosData.length} insumos cargados`);
    }
    
    function cargarRecetas() {
        recetasData = obtenerDatos('recetas') || [];
        console.log(`📊 ${recetasData.length} recetas cargadas`);
    }
    
    function guardarInsumos() {
        guardarDatos('insumos', insumosData);
    }
    
    function guardarRecetas() {
        guardarDatos('recetas', recetasData);
    }
    
    // ==========================================
    // GESTIÓN DE TABS
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
            document.querySelector('#seccion-inventario .tab-btn:nth-child(1)').classList.add('activo');
            document.getElementById('tab-insumos').classList.add('activo');
            renderizarInsumos();
        } else if (tab === 'recetas') {
            document.querySelector('#seccion-inventario .tab-btn:nth-child(2)').classList.add('activo');
            document.getElementById('tab-recetas').classList.add('activo');
            renderizarRecetas();
        }
    }
    
    // ==========================================
    // RENDERIZADO DE INSUMOS
    // ==========================================
    
    function renderizarInsumos() {
        const contenedor = document.getElementById('lista-insumos');
        if (!contenedor) return;
        
        let insumosFiltrados = insumosData;
        
        if (filtroActualInsumos === 'stock-bajo') {
            insumosFiltrados = insumosData.filter(i => i.stockActual <= i.stockMinimo);
        }
        
        if (insumosFiltrados.length === 0) { 
            contenedor.innerHTML = `
                <div class="mensaje-vacio">
                    <p>No hay insumos registrados</p>
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
        const stockBajo = insumo.stockActual <= insumo.stockMinimo;
        const claseBajo = stockBajo ? 'stock-bajo' : '';
        const porcentaje = (insumo.stockActual / insumo.stockMinimo) * 100;
        
        return `
            <div class="tarjeta-insumo ${claseBajo}">
                ${stockBajo ? '<div class="alerta-stock"><i class="fas fa-exclamation-triangle"></i> Stock Bajo</div>' : ''}
                
                <div class="insumo-header">
                    <h4>${insumo.nombre}</h4>
                    <span class="badge badge-secondary">${insumo.unidadMedida}</span>
                </div>
                
                <div class="insumo-stock">
                    <div class="stock-numeros">
                        <div class="stock-actual">
                            <span class="label">Stock Actual:</span>
                            <span class="valor ${stockBajo ? 'texto-peligro' : 'texto-exito'}">${insumo.stockActual}</span>
                        </div>
                        <div class="stock-minimo">
                            <span class="label">Stock Mínimo:</span>
                            <span class="valor">${insumo.stockMinimo}</span>
                        </div>
                    </div>
                    
                    <div class="barra-stock">
                        <div class="barra-progreso" style="width: ${Math.min(porcentaje, 100)}%; background: ${stockBajo ? 'var(--color-peligro)' : 'var(--color-exito)'};"></div>
                    </div>
                </div>
                
                <div class="insumo-acciones">
                    <button class="btn btn-pequeño btn-primario" onclick="ajustarStockModal('${insumo.id}')" title="Ajustar stock">
                        <i class="fas fa-plus-minus"></i>
                    </button>
                    <button class="btn btn-pequeño btn-secundario" onclick="editarInsumo('${insumo.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-pequeño btn-peligro" onclick="eliminarInsumo('${insumo.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    // ==========================================
    // CRUD DE INSUMOS
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
                        <option value="unidad">Unidad</option>
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
    
    function confirmarNuevoInsumo() {
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
        
        const nuevoInsumo = {
            id: generarId('INS'),
            nombre: nombre,
            unidadMedida: unidad,
            stockActual: stockInicial,
            stockMinimo: stockMinimo,
            fechaCreacion: obtenerFechaActual()
        };
        
        insumosData.push(nuevoInsumo);
        guardarInsumos();
        
        cerrarModal();
        renderizarInsumos();
        
        mostrarNotificacion(`Insumo "${nombre}" creado`, 'exito');
    }
    
    function editarInsumo(idInsumo) {
        const insumo = insumosData.find(i => i.id === idInsumo);
        if (!insumo) {
            mostrarNotificacion('Insumo no encontrado', 'error');
            return;
        }
        
        let contenido = `
            <div class="formulario-insumo">
                <div class="campo-form">
                    <label>Nombre del Insumo: *</label>
                    <input type="text" id="nombre-insumo-edit" value="${insumo.nombre}">
                </div>
                
                <div class="campo-form">
                    <label>Unidad de Medida: *</label>
                    <select id="unidad-insumo-edit">
                        <option value="unidad" ${insumo.unidadMedida === 'unidad' ? 'selected' : ''}>Unidad</option>
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
        
        abrirModal('Editar Insumo', contenido, function() {
            const nombre = document.getElementById('nombre-insumo-edit').value.trim();
            const unidad = document.getElementById('unidad-insumo-edit').value;
            const stockMinimo = parseFloat(document.getElementById('stock-minimo-insumo-edit').value);
            
            if (!nombre || !stockMinimo || stockMinimo < 0) {
                mostrarNotificacion('Completa los campos correctamente', 'error');
                return;
            }
            
            insumo.nombre = nombre;
            insumo.unidadMedida = unidad;
            insumo.stockMinimo = stockMinimo;
            
            guardarInsumos();
            cerrarModal();
            renderizarInsumos();
            
            mostrarNotificacion('Insumo actualizado', 'exito');
        });
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Actualizar';
        }
    }
    
    function eliminarInsumo(idInsumo) {
        const insumo = insumosData.find(i => i.id === idInsumo);
        if (!insumo) return;
        
        if (!confirmar(`¿Eliminar el insumo "${insumo.nombre}"?`)) {
            return;
        }
        
        const index = insumosData.findIndex(i => i.id === idInsumo);
        if (index !== -1) {
            insumosData.splice(index, 1);
            guardarInsumos();
            renderizarInsumos();
            mostrarNotificacion('Insumo eliminado', 'exito');
        }
    }
    
    function ajustarStockModal(idInsumo) {
        const insumo = insumosData.find(i => i.id === idInsumo);
        if (!insumo) return;
        
        let contenido = `
            <div class="formulario-insumo">
                <p style="text-align: center; margin-bottom: 20px;">
                    <strong>${insumo.nombre}</strong><br>
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
                
                <div class="campo-form">
                    <label>Motivo (opcional):</label>
                    <input type="text" id="motivo-ajuste" placeholder="Ej: Compra, Merma, Corrección">
                </div>
            </div>
        `;
        
        abrirModal('Ajustar Stock', contenido, function() {
            const tipo = document.getElementById('tipo-ajuste').value;
            const cantidad = parseFloat(document.getElementById('cantidad-ajuste').value);
            
            if (!cantidad || cantidad < 0) {
                mostrarNotificacion('Ingresa una cantidad válida', 'error');
                return;
            }
            
            let nuevoStock = insumo.stockActual;
            
            if (tipo === 'sumar') {
                nuevoStock += cantidad;
            } else if (tipo === 'restar') {
                nuevoStock -= cantidad;
                if (nuevoStock < 0) nuevoStock = 0;
            } else if (tipo === 'establecer') {
                nuevoStock = cantidad;
            }
            
            insumo.stockActual = nuevoStock;
            guardarInsumos();
            
            cerrarModal();
            renderizarInsumos();
            
            mostrarNotificacion(`Stock ajustado: ${insumo.nombre}`, 'exito');
        });
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Ajustar';
        }
    }
    
    // ==========================================
    // FILTROS Y BÚSQUEDA
    // ==========================================
    
    function filtrarInsumos(filtro) {
        filtroActualInsumos = filtro;
        
        document.querySelectorAll('#seccion-inventario .filtro-btn').forEach(btn => {
            btn.classList.remove('activo');
        });
        
        if (filtro === 'todos') {
            document.querySelector('#seccion-inventario .filtro-btn:nth-child(1)').classList.add('activo');
        } else {
            document.querySelector('#seccion-inventario .filtro-btn:nth-child(2)').classList.add('activo');
        }
        
        renderizarInsumos();
    }
    
    function buscarInsumo(termino) {
        if (!termino || termino.trim() === '') {
            renderizarInsumos();
            return;
        }
        
        const contenedor = document.getElementById('lista-insumos');
        const insumosFiltrados = insumosData.filter(i => 
            i.nombre.toLowerCase().includes(termino.toLowerCase())
        );
        
        if (insumosFiltrados.length === 0) {
            contenedor.innerHTML = '<div class="mensaje-vacio"><p>No se encontraron insumos</p></div>';
            return;
        }
        
        contenedor.innerHTML = `
            <div class="grid-insumos">
                ${insumosFiltrados.map(insumo => crearTarjetaInsumo(insumo)).join('')}
            </div>
        `;
    }
    
    // ==========================================
    // GESTIÓN DE RECETAS
    // ==========================================
    
    function renderizarRecetas() {
        const contenedor = document.getElementById('lista-recetas');
        if (!contenedor) return;
        
        const productos = obtenerDatos('productos') || [];
        
        if (productos.length === 0) {
            contenedor.innerHTML = '<div class="mensaje-vacio"><p>No hay productos en el menú</p></div>';
            return;
        }
        
        contenedor.innerHTML = `
            <div class="lista-recetas">
                ${productos.map(producto => crearTarjetaReceta(producto)).join('')}
            </div>
        `;
    }
    
    function crearTarjetaReceta(producto) {
        const receta = recetasData.find(r => r.idProducto === producto.id);
        const tieneReceta = receta && receta.insumos.length > 0;
        
        return `
            <div class="tarjeta-receta">
                <div class="receta-header">
                    <div>
                        <h4>${producto.nombre}</h4>
                        <span class="badge badge-secondary">${producto.categoria}</span>
                    </div>
                    <button class="btn btn-pequeño btn-primario" onclick="editarReceta('${producto.id}')">
                        <i class="fas ${tieneReceta ? 'fa-edit' : 'fa-plus'}"></i>
                        ${tieneReceta ? 'Editar' : 'Asignar'}
                    </button>
                </div>
                
                ${tieneReceta ? `
                    <div class="receta-insumos">
                        <strong>Insumos:</strong>
                        <ul>
                            ${receta.insumos.map(ins => {
                                const insumo = insumosData.find(i => i.id === ins.idInsumo);
                                return `<li>${ins.cantidad} ${ins.unidad} - ${insumo ? insumo.nombre : 'Insumo no encontrado'}</li>`;
                            }).join('')}
                        </ul>
                    </div>
                ` : `
                    <p style="color: #999; font-style: italic;">Sin receta asignada</p>
                `}
            </div>
        `;
    }
    
    function editarReceta(idProducto) {
        const productos = obtenerDatos('productos') || [];
        
        if (productos.length === 0) {
            mostrarNotificacion('No hay productos en el menú', 'error');
            return;
        }
        
        let productoSeleccionado = null;
        let recetaExistente = null;
        
        if (idProducto) {
            productoSeleccionado = productos.find(p => p.id === idProducto);
            recetaExistente = recetasData.find(r => r.idProducto === idProducto);
        }
        
        let contenido = `
            <div class="formulario-receta">
                <div class="campo-form">
                    <label>Producto: *</label>
                    <select id="producto-receta" ${idProducto ? 'disabled' : ''}>
                        <option value="">-- Selecciona un producto --</option>
                        ${productos.map(p => `
                            <option value="${p.id}" ${p.id === idProducto ? 'selected' : ''}>
                                ${p.nombre}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <hr>
                
                <h4>Insumos de la Receta:</h4>
                <div id="insumos-receta-container">
                    ${recetaExistente && recetaExistente.insumos.length > 0 ? 
                        recetaExistente.insumos.map((ins, index) => crearFilaInsumoReceta(ins, index)).join('') 
                        : crearFilaInsumoReceta(null, 0)
                    }
                </div>
                
                <button class="btn btn-secundario" onclick="agregarFilaInsumoReceta()" style="margin-top: 10px;">
                    <i class="fas fa-plus"></i> Agregar Insumo
                </button>
            </div>
        `;
        
        abrirModal('Asignar Receta', contenido, function() {
            confirmarReceta(idProducto);
        });
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Guardar';
        }
    }
    
    function crearFilaInsumoReceta(insumo, index) {
        return `
            <div class="fila-insumo-receta" data-index="${index}">
                <select class="insumo-select">
                    <option value="">-- Selecciona insumo --</option>
                    ${insumosData.map(i => `
                        <option value="${i.id}" ${insumo && insumo.idInsumo === i.id ? 'selected' : ''}>
                            ${i.nombre} (${i.unidadMedida})
                        </option>
                    `).join('')}
                </select>
                
                <input type="number" class="cantidad-input" placeholder="Cantidad" 
                       min="0" step="0.01" value="${insumo ? insumo.cantidad : ''}">
                
                <button class="btn btn-peligro btn-pequeño" onclick="eliminarFilaInsumoReceta(${index})">
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
    
    function confirmarReceta(idProductoExistente) {
        const idProducto = idProductoExistente || document.getElementById('producto-receta').value;
        
        if (!idProducto) {
            mostrarNotificacion('Selecciona un producto', 'error');
            return;
        }
        
        const filas = document.querySelectorAll('.fila-insumo-receta');
        const insumosReceta = [];
        
        filas.forEach(fila => {
            const select = fila.querySelector('.insumo-select');
            const cantidadInput = fila.querySelector('.cantidad-input');
            
            const idInsumo = select.value;
            const cantidad = parseFloat(cantidadInput.value);
            
            if (idInsumo && cantidad > 0) {
                const insumo = insumosData.find(i => i.id === idInsumo);
                insumosReceta.push({
                    idInsumo: idInsumo,
                    cantidad: cantidad,
                    unidad: insumo.unidadMedida
                });
            }
        });
        
        if (insumosReceta.length === 0) {
            mostrarNotificacion('Agrega al menos un insumo', 'error');
            return;
        }
        
        const indexReceta = recetasData.findIndex(r => r.idProducto === idProducto);
        const producto = obtenerDatos('productos').find(p => p.id === idProducto);
        
        const receta = {
            idProducto: idProducto,
            nombreProducto: producto.nombre,
            insumos: insumosReceta
        };
        
        if (indexReceta !== -1) {
            recetasData[indexReceta] = receta;
        } else {
            recetasData.push(receta);
        }
        
        guardarRecetas();
        cerrarModal();
        renderizarRecetas();
        
        mostrarNotificacion('Receta guardada', 'exito');
    }
    
    // ==========================================
    // FUNCIÓN PÚBLICA: DESCONTAR INSUMOS
    // ==========================================
    
    window.descontarInsumosDeVenta = function(productos) {
        console.log('📦 Descontando insumos de la venta...');
        
        productos.forEach(prod => {
            const receta = recetasData.find(r => r.idProducto === prod.id);
            
            if (receta && receta.insumos) {
                receta.insumos.forEach(insReceta => {
                    const insumo = insumosData.find(i => i.id === insReceta.idInsumo);
                    
                    if (insumo) {
                        const cantidadTotal = insReceta.cantidad * prod.cantidad;
                        insumo.stockActual -= cantidadTotal;
                        
                        if (insumo.stockActual < 0) insumo.stockActual = 0;
                        
                        console.log(`   - ${insumo.nombre}: -${cantidadTotal} ${insumo.unidadMedida} (quedan ${insumo.stockActual})`);
                    }
                });
            }
        });
        
        guardarInsumos();
        console.log('✅ Insumos descontados correctamente');
    };
    
    // ==========================================
    // EXPORTAR FUNCIONES GLOBALES
    // ==========================================
    
    window.cambiarTabInventario = cambiarTabInventario;
    window.nuevoInsumo = nuevoInsumo;
    window.editarInsumo = editarInsumo;
    window.eliminarInsumo = eliminarInsumo;
    window.ajustarStockModal = ajustarStockModal;
    window.filtrarInsumos = filtrarInsumos;
    window.buscarInsumo = buscarInsumo;
    window.editarReceta = editarReceta;
    window.agregarFilaInsumoReceta = agregarFilaInsumoReceta;
    window.eliminarFilaInsumoReceta = eliminarFilaInsumoReceta;
    
    // ==========================================
    // EXPORTAR API PÚBLICA DEL MÓDULO
    // ==========================================
    
    window.Inventario = {
        inicializar: inicializar
    };
    
    console.log('✅ Módulo Inventario cargado');
})();

// ESTILOS (compactados)
const estilosInventario = document.createElement('style');
estilosInventario.textContent = `
    .tabs-inventario{display:flex;gap:10px;margin:20px 0;border-bottom:2px solid #ecf0f1}.tab-btn{background:none;border:none;padding:12px 20px;cursor:pointer;color:#7f8c8d;font-weight:500;transition:all .3s;border-bottom:3px solid transparent}.tab-btn.activo{color:var(--color-primario);border-bottom-color:var(--color-primario)}.tab-btn:hover{color:var(--color-primario)}.tab-content{display:none}.tab-content.activo{display:block}.grid-insumos{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin-top:20px}.tarjeta-insumo{background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1);position:relative;transition:all .3s}.tarjeta-insumo:hover{box-shadow:0 4px 12px rgba(0,0,0,.15);transform:translateY(-3px)}.tarjeta-insumo.stock-bajo{border-left:4px solid var(--color-peligro)}.alerta-stock{background:var(--color-peligro);color:white;padding:5px 10px;border-radius:5px;font-size:12px;margin-bottom:10px;display:inline-block}.insumo-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}.insumo-header h4{margin:0;color:var(--color-texto)}.insumo-stock{margin:15px 0}.stock-numeros{display:flex;justify-content:space-between;margin-bottom:10px}.stock-actual,.stock-minimo{display:flex;flex-direction:column;gap:5px}.stock-actual .label,.stock-minimo .label{font-size:12px;color:#7f8c8d}.stock-actual .valor,.stock-minimo .valor{font-size:20px;font-weight:bold}.barra-stock{background:#ecf0f1;height:8px;border-radius:10px;overflow:hidden}.barra-progreso{height:100%;transition:width .3s}.insumo-acciones{display:flex;gap:5px;justify-content:flex-end;margin-top:15px}.lista-recetas{display:flex;flex-direction:column;gap:15px}.tarjeta-receta{background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1)}.receta-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}.receta-header h4{margin:0 0 5px 0}.receta-insumos{background:#f8f9fa;padding:15px;border-radius:8px;margin-top:15px}.receta-insumos ul{margin:10px 0 0 20px}.receta-insumos li{margin:5px 0}.fila-insumo-receta{display:flex;gap:10px;margin:10px 0;align-items:center}.fila-insumo-receta .insumo-select{flex:2;padding:8px;border:1px solid #ddd;border-radius:5px}.fila-insumo-receta .cantidad-input{flex:1;padding:8px;border:1px solid #ddd;border-radius:5px}.btn-pequeño{padding:8px 12px;font-size:13px}
`;
document.head.appendChild(estilosInventario);