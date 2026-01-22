/* ==========================================
   COMPRAS.JS - CONECTADO CON BACKEND
   🔥 CRUD CON API REST - SPRING BOOT
   ========================================== */

(function() {
    // ==========================================
    // VARIABLES PRIVADAS DEL MÓDULO
    // ==========================================
    
    const API_URL = 'http://localhost:8085/api';
    let proveedoresData = [];
    let comprasData = [];
    let insumosData = [];
    let tabActualCompras = 'proveedores';
    
    // ==========================================
    // FUNCIÓN DE INICIALIZACIÓN PÚBLICA
    // ==========================================
    
    async function inicializar() {
        console.log('🛒 Inicializando módulo Compras...');
        console.log('🌐 Backend:', API_URL);
        
        await cargarProveedores();
        await cargarCompras();
        await cargarInsumos();
        
        renderizarProveedores();
        renderizarHistorialCompras();
        
        console.log('✅ Módulo Compras inicializado');
    }
    
    // ==========================================
    // 🔥 CARGAR DATOS DESDE API
    // ==========================================
    
    async function cargarProveedores() {
        try {
            const response = await fetch(`${API_URL}/proveedores`);
            
            if (response.ok) {
                proveedoresData = await response.json();
                console.log(`📊 ${proveedoresData.length} proveedores cargados desde BD`);
            } else {
                console.error('❌ Error al cargar proveedores');
                proveedoresData = [];
            }
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            proveedoresData = [];
        }
    }
    
    async function cargarCompras() {
        try {
            const response = await fetch(`${API_URL}/compras`);
            
            if (response.ok) {
                comprasData = await response.json();
                console.log(`📊 ${comprasData.length} compras cargadas desde BD`);
            } else {
                console.error('❌ Error al cargar compras');
                comprasData = [];
            }
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            comprasData = [];
        }
    }
    
    async function cargarInsumos() {
        try {
            const response = await fetch(`${API_URL}/insumos`);
            
            if (response.ok) {
                insumosData = await response.json();
                console.log(`📊 ${insumosData.length} insumos disponibles`);
            }
        } catch (error) {
            console.error('❌ Error al cargar insumos:', error);
            insumosData = [];
        }
    }
    
    // ==========================================
    // GESTIÓN DE TABS
    // ==========================================
    
    function cambiarTabCompras(tab) {
        tabActualCompras = tab;
        
        document.querySelectorAll('#seccion-compras .tab-btn').forEach(btn => {
            btn.classList.remove('activo');
        });
        document.querySelectorAll('#seccion-compras .tab-content').forEach(content => {
            content.classList.remove('activo');
        });
        
        if (tab === 'proveedores') {
            document.querySelector('#seccion-compras .tab-btn:nth-child(1)').classList.add('activo');
            document.getElementById('tab-proveedores').classList.add('activo');
            renderizarProveedores();
        } else if (tab === 'historial') {
            document.querySelector('#seccion-compras .tab-btn:nth-child(2)').classList.add('activo');
            document.getElementById('tab-historial-compras').classList.add('activo');
            renderizarHistorialCompras();
        }
    }
    
    // ==========================================
    // RENDERIZADO DE PROVEEDORES
    // ==========================================
    
    function renderizarProveedores() {
        const contenedor = document.getElementById('lista-proveedores');
        if (!contenedor) return;
        
        if (proveedoresData.length === 0) {
            contenedor.innerHTML = `
                <div class="mensaje-vacio">
                    <p>No hay proveedores registrados</p>
                    <button class="btn btn-primario" onclick="nuevoProveedor()">
                        <i class="fas fa-plus"></i> Agregar Primer Proveedor
                    </button>
                </div>
            `;
            return;
        }
        
        contenedor.innerHTML = `
            <div class="grid-proveedores">
                ${proveedoresData.map(proveedor => crearTarjetaProveedor(proveedor)).join('')}
            </div>
        `;
    }
    
    function crearTarjetaProveedor(proveedor) {
        const tipoDoc = proveedor.rucProveedor ? 
            (proveedor.rucProveedor.length === 11 ? 'RUC' : 'DNI') : 'Sin Doc.';
        
        return `
            <div class="tarjeta-proveedor">
                <div class="proveedor-header">
                    <h4>${proveedor.nombreProveedor}</h4>
                    <span class="badge badge-info">${tipoDoc}: ${proveedor.rucProveedor || 'N/A'}</span>
                </div>
                
                <div class="proveedor-info">
                    <p><i class="fas fa-phone"></i> ${proveedor.telefonoProveedor || 'Sin teléfono'}</p>
                    <p><i class="fas fa-envelope"></i> ${proveedor.emailProveedor || 'Sin email'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${proveedor.direccionProveedor || 'Sin dirección'}</p>
                </div>
                
                <div class="proveedor-acciones">
                    <button class="btn btn-pequeño btn-secundario" onclick="editarProveedor(${proveedor.idProveedor})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-pequeño btn-peligro" onclick="eliminarProveedor(${proveedor.idProveedor})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    // ==========================================
    // 🔥 CRUD PROVEEDORES CON API
    // ==========================================
    
    function nuevoProveedor() {
        let contenido = `
            <div class="formulario-proveedor">
                <div class="campo-form">
                    <label>Nombre del Proveedor: *</label>
                    <input type="text" id="nombre-proveedor" placeholder="Ej: Mercado Central">
                </div>
                
                <div class="campo-form">
                    <label>RUC / DNI:</label>
                    <input type="text" id="ruc-proveedor" placeholder="DNI: 12345678 o RUC: 20123456789" maxlength="11">
                    <small style="color: #7f8c8d;">DNI: 8 dígitos | RUC: 11 dígitos</small>
                </div>
                
                <div class="campo-form">
                    <label>Teléfono:</label>
                    <input type="text" id="telefono-proveedor" placeholder="987654321">
                </div>
                
                <div class="campo-form">
                    <label>Email:</label>
                    <input type="email" id="email-proveedor" placeholder="proveedor@ejemplo.com">
                </div>
                
                <div class="campo-form">
                    <label>Dirección:</label>
                    <input type="text" id="direccion-proveedor" placeholder="Av. Principal 123">
                </div>
            </div>
        `;
        
        abrirModal('Nuevo Proveedor', contenido, confirmarNuevoProveedor);
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Guardar';
        }
    }
    
    async function confirmarNuevoProveedor() {
        const nombre = document.getElementById('nombre-proveedor').value.trim();
        const ruc = document.getElementById('ruc-proveedor').value.trim();
        const telefono = document.getElementById('telefono-proveedor').value.trim();
        const email = document.getElementById('email-proveedor').value.trim();
        const direccion = document.getElementById('direccion-proveedor').value.trim();
        
        if (!nombre) {
            mostrarNotificacion('Ingresa el nombre del proveedor', 'error');
            return;
        }
        
        // Validación RUC/DNI en frontend
        if (ruc) {
            if (!/^\d+$/.test(ruc)) {
                mostrarNotificacion('RUC/DNI debe contener solo números', 'error');
                return;
            }
            if (ruc.length !== 8 && ruc.length !== 11) {
                mostrarNotificacion('Ingresa DNI (8 dígitos) o RUC (11 dígitos)', 'error');
                return;
            }
        }
        
        try {
            const response = await fetch(`${API_URL}/proveedores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombreProveedor: nombre,
                    rucProveedor: ruc || null,
                    telefonoProveedor: telefono || null,
                    emailProveedor: email || null,
                    direccionProveedor: direccion || null
                })
            });
            
            if (response.ok) {
                cerrarModal();
                await cargarProveedores();
                renderizarProveedores();
                mostrarNotificacion(`Proveedor "${nombre}" registrado`, 'exito');
                console.log('✅ Proveedor creado en BD');
            } else {
                const error = await response.json();
                mostrarNotificacion(error.error || 'Error al crear proveedor', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    function editarProveedor(idProveedor) {
        const proveedor = proveedoresData.find(p => p.idProveedor === idProveedor);
        if (!proveedor) {
            mostrarNotificacion('Proveedor no encontrado', 'error');
            return;
        }
        
        let contenido = `
            <div class="formulario-proveedor">
                <div class="campo-form">
                    <label>Nombre del Proveedor: *</label>
                    <input type="text" id="nombre-proveedor-edit" value="${proveedor.nombreProveedor}">
                </div>
                
                <div class="campo-form">
                    <label>RUC / DNI:</label>
                    <input type="text" id="ruc-proveedor-edit" value="${proveedor.rucProveedor || ''}" maxlength="11">
                    <small style="color: #7f8c8d;">DNI: 8 dígitos | RUC: 11 dígitos</small>
                </div>
                
                <div class="campo-form">
                    <label>Teléfono:</label>
                    <input type="text" id="telefono-proveedor-edit" value="${proveedor.telefonoProveedor || ''}">
                </div>
                
                <div class="campo-form">
                    <label>Email:</label>
                    <input type="email" id="email-proveedor-edit" value="${proveedor.emailProveedor || ''}">
                </div>
                
                <div class="campo-form">
                    <label>Dirección:</label>
                    <input type="text" id="direccion-proveedor-edit" value="${proveedor.direccionProveedor || ''}">
                </div>
            </div>
        `;
        
        abrirModal('Editar Proveedor', contenido, async function() {
            const nombre = document.getElementById('nombre-proveedor-edit').value.trim();
            const ruc = document.getElementById('ruc-proveedor-edit').value.trim();
            
            if (!nombre) {
                mostrarNotificacion('Ingresa el nombre del proveedor', 'error');
                return;
            }
            
            if (ruc) {
                if (!/^\d+$/.test(ruc)) {
                    mostrarNotificacion('RUC/DNI debe contener solo números', 'error');
                    return;
                }
                if (ruc.length !== 8 && ruc.length !== 11) {
                    mostrarNotificacion('Ingresa DNI (8 dígitos) o RUC (11 dígitos)', 'error');
                    return;
                }
            }
            
            try {
                const response = await fetch(`${API_URL}/proveedores/${idProveedor}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombreProveedor: nombre,
                        rucProveedor: ruc || null,
                        telefonoProveedor: document.getElementById('telefono-proveedor-edit').value.trim() || null,
                        emailProveedor: document.getElementById('email-proveedor-edit').value.trim() || null,
                        direccionProveedor: document.getElementById('direccion-proveedor-edit').value.trim() || null
                    })
                });
                
                if (response.ok) {
                    cerrarModal();
                    await cargarProveedores();
                    renderizarProveedores();
                    mostrarNotificacion('Proveedor actualizado', 'exito');
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
    
    async function eliminarProveedor(idProveedor) {
        const proveedor = proveedoresData.find(p => p.idProveedor === idProveedor);
        if (!proveedor) return;
        
        if (!confirmar(`¿Eliminar el proveedor "${proveedor.nombreProveedor}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/proveedores/${idProveedor}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await cargarProveedores();
                renderizarProveedores();
                mostrarNotificacion('Proveedor eliminado', 'exito');
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
    // 🔥 NUEVA COMPRA CON API (AUMENTA STOCK)
    // ==========================================
    
    async function nuevaCompra() {
        if (proveedoresData.length === 0) {
            mostrarNotificacion('Registra un proveedor primero', 'error');
            return;
        }
        
        await cargarInsumos();
        
        if (insumosData.length === 0) {
            mostrarNotificacion('Registra insumos primero en Inventario', 'error');
            return;
        }
        
        let contenido = `
            <div class="formulario-compra">
                <div class="campo-form">
                    <label>Proveedor: *</label>
                    <select id="proveedor-compra">
                        <option value="">-- Selecciona proveedor --</option>
                        ${proveedoresData.map(p => `
                            <option value="${p.idProveedor}">${p.nombreProveedor}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="campo-form">
                    <label>Observaciones:</label>
                    <input type="text" id="observaciones-compra" placeholder="Ej: Compra semanal">
                </div>
                
                <hr>
                
                <h4>Insumos a Comprar:</h4>
                <div id="insumos-compra-container">
                    ${crearFilaInsumoCompra(0)}
                </div>
                
                <button class="btn btn-secundario" onclick="agregarFilaInsumoCompra()" style="margin-top: 10px;">
                    <i class="fas fa-plus"></i> Agregar Insumo
                </button>
                
                <hr>
                
                <div style="text-align: right; margin-top: 20px;">
                    <h3>TOTAL: S/. <span id="total-compra">0.00</span></h3>
                </div>
            </div>
        `;
        
        abrirModal('Nueva Compra', contenido, confirmarNuevaCompra);
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Registrar Compra';
        }
    }
    
    function crearFilaInsumoCompra(index) {
        return `
            <div class="fila-insumo-compra" data-index="${index}">
                <select class="insumo-select-compra" onchange="calcularTotalCompra()">
                    <option value="">-- Selecciona insumo --</option>
                    ${insumosData.map(i => `
                        <option value="${i.idInsumo}">${i.nombreInsumo} (${i.unidadMedida})</option>
                    `).join('')}
                </select>
                
                <input type="number" class="cantidad-input-compra" placeholder="Cantidad" 
                       min="0" step="0.01" onkeyup="calcularTotalCompra()">
                
                <input type="number" class="precio-input-compra" placeholder="Precio Unit." 
                       min="0" step="0.01" onkeyup="calcularTotalCompra()">
                
                <span class="subtotal-compra">S/. 0.00</span>
                
                <button class="btn btn-peligro btn-pequeño" onclick="eliminarFilaInsumoCompra(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }
    
    function agregarFilaInsumoCompra() {
        const container = document.getElementById('insumos-compra-container');
        const index = container.children.length;
        container.insertAdjacentHTML('beforeend', crearFilaInsumoCompra(index));
    }
    
    function eliminarFilaInsumoCompra(index) {
        const fila = document.querySelector(`.fila-insumo-compra[data-index="${index}"]`);
        if (fila) {
            fila.remove();
            calcularTotalCompra();
        }
    }
    
    function calcularTotalCompra() {
        const filas = document.querySelectorAll('.fila-insumo-compra');
        let total = 0;
        
        filas.forEach(fila => {
            const cantidad = parseFloat(fila.querySelector('.cantidad-input-compra').value) || 0;
            const precio = parseFloat(fila.querySelector('.precio-input-compra').value) || 0;
            const subtotal = cantidad * precio;
            
            fila.querySelector('.subtotal-compra').textContent = formatearMoneda(subtotal);
            total += subtotal;
        });
        
        document.getElementById('total-compra').textContent = total.toFixed(2);
    }
    
    async function confirmarNuevaCompra() {
        const idProveedor = document.getElementById('proveedor-compra').value;
        const observaciones = document.getElementById('observaciones-compra').value.trim();
        
        if (!idProveedor) {
            mostrarNotificacion('Selecciona un proveedor', 'error');
            return;
        }
        
        const filas = document.querySelectorAll('.fila-insumo-compra');
        const detalles = [];
        
        filas.forEach(fila => {
            const idInsumo = fila.querySelector('.insumo-select-compra').value;
            const cantidad = parseFloat(fila.querySelector('.cantidad-input-compra').value);
            const precioUnitario = parseFloat(fila.querySelector('.precio-input-compra').value);
            
            if (idInsumo && cantidad > 0 && precioUnitario >= 0) {
                detalles.push({
                    idInsumo: parseInt(idInsumo),
                    cantidad: cantidad,
                    precioUnitario: precioUnitario
                });
            }
        });
        
        if (detalles.length === 0) {
            mostrarNotificacion('Agrega al menos un insumo', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/compras`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idProveedor: parseInt(idProveedor),
                    observaciones: observaciones || null,
                    detalles: detalles
                })
            });
            
            if (response.ok) {
                const resultado = await response.json();
                cerrarModal();
                await cargarCompras();
                renderizarHistorialCompras();
                
                mostrarNotificacion(`Compra registrada: ${formatearMoneda(resultado.total)}`, 'exito');
                console.log('✅ Compra registrada - Stock actualizado automáticamente');
                
                // Cambiar a pestaña historial
                cambiarTabCompras('historial');
            } else {
                const error = await response.json();
                mostrarNotificacion(error.error || 'Error al registrar compra', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    // ==========================================
    // RENDERIZADO HISTORIAL DE COMPRAS
    // ==========================================
    
    function renderizarHistorialCompras() {
        const contenedor = document.getElementById('lista-compras-historial');
        if (!contenedor) return;
        
        if (comprasData.length === 0) {
            contenedor.innerHTML = `
                <div class="mensaje-vacio">
                    <p>No hay compras registradas</p>
                </div>
            `;
            return;
        }
        
        // Filtrar por fechas si existen los inputs
        let comprasFiltradas = [...comprasData];
        
        const inputDesde = document.getElementById('fecha-desde-compras');
        const inputHasta = document.getElementById('fecha-hasta-compras');
        
        if (inputDesde && inputDesde.value && inputHasta && inputHasta.value) {
            const fechaDesde = new Date(inputDesde.value + 'T00:00:00');
            const fechaHasta = new Date(inputHasta.value + 'T23:59:59');
            
            comprasFiltradas = comprasFiltradas.filter(compra => {
                const fechaCompra = new Date(compra.fechaCompra + 'T00:00:00');
                return fechaCompra >= fechaDesde && fechaCompra <= fechaHasta;
            });
        }
        
        if (comprasFiltradas.length === 0) {
            contenedor.innerHTML = `
                <div class="mensaje-vacio">
                    <p>No hay compras en el período seleccionado</p>
                </div>
            `;
            return;
        }
        
        contenedor.innerHTML = `
            <div class="lista-compras">
                ${comprasFiltradas.map(compra => crearTarjetaCompra(compra)).join('')}
            </div>
        `;
    }
    
    function crearTarjetaCompra(compra) {
        const proveedor = proveedoresData.find(p => p.idProveedor === compra.idProveedor);
        const nombreProveedor = proveedor ? proveedor.nombreProveedor : 'Proveedor no encontrado';
        
        return `
            <div class="tarjeta-compra">
                <div class="compra-header">
                    <div>
                        <strong>${compra.codigoCompra}</strong>
                        <span class="badge badge-info">${nombreProveedor}</span>
                    </div>
                    <div class="compra-fecha">
                        ${compra.fechaCompra} - ${compra.horaCompra || ''}
                    </div>
                </div>
                
                <div class="compra-detalles">
                    <strong>Insumos comprados:</strong>
                    ${compra.observaciones ? `<p style="color: #666; font-style: italic;">${compra.observaciones}</p>` : ''}
                </div>
                
                <div class="compra-total">
                    <strong>TOTAL:</strong> ${formatearMoneda(compra.totalCompra)}
                </div>
                
                <button class="btn btn-pequeño btn-primario" onclick="verDetalleCompra(${compra.idCompra})">
                    <i class="fas fa-eye"></i> Ver Detalle
                </button>
            </div>
        `;
    }
    
    async function verDetalleCompra(idCompra) {
        try {
            const response = await fetch(`${API_URL}/compras/${idCompra}`);
            
            if (!response.ok) {
                mostrarNotificacion('Compra no encontrada', 'error');
                return;
            }
            
            const compra = await response.json();
            const proveedor = proveedoresData.find(p => p.idProveedor === compra.idProveedor);
            
            let contenido = `
                <div class="detalle-compra">
                    <div style="margin-bottom: 15px;">
                        <strong>Código:</strong> ${compra.codigoCompra}<br>
                        <strong>Proveedor:</strong> ${proveedor ? proveedor.nombreProveedor : 'N/A'}<br>
                        <strong>Fecha:</strong> ${compra.fechaCompra} ${compra.horaCompra || ''}
                        ${compra.observaciones ? `<br><strong>Observaciones:</strong> ${compra.observaciones}` : ''}
                    </div>
                    
                    <hr>
                    
                    <h4>Insumos Comprados:</h4>
                    <table class="tabla-datos">
                        <thead>
                            <tr>
                                <th>Insumo</th>
                                <th>Cantidad</th>
                                <th>Precio Unit.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${compra.detalles && compra.detalles.map(det => {
                                const insumo = insumosData.find(i => i.idInsumo === det.idInsumo);
                                return `
                                    <tr>
                                        <td>${insumo ? insumo.nombreInsumo : 'Insumo no encontrado'}</td>
                                        <td>${det.cantidad}</td>
                                        <td>${formatearMoneda(det.precioUnitario)}</td>
                                        <td><strong>${formatearMoneda(det.subtotal)}</strong></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                    
                    <div style="text-align: right; margin-top: 20px;">
                        <h3>TOTAL: ${formatearMoneda(compra.totalCompra)}</h3>
                    </div>
                </div>
            `;
            
            abrirModal(`Detalle de Compra - ${compra.codigoCompra}`, contenido, null);
            document.getElementById('modal-btn-confirmar').style.display = 'none';
            
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error al cargar detalle', 'error');
        }
    }
    
    function filtrarCompras() {
        renderizarHistorialCompras();
        mostrarNotificacion('Filtro aplicado', 'exito');
    }
    
    // ==========================================
    // EXPORTAR FUNCIONES GLOBALES
    // ==========================================
    
    window.cambiarTabCompras = cambiarTabCompras;
    window.nuevoProveedor = nuevoProveedor;
    window.editarProveedor = editarProveedor;
    window.eliminarProveedor = eliminarProveedor;
    window.nuevaCompra = nuevaCompra;
    window.agregarFilaInsumoCompra = agregarFilaInsumoCompra;
    window.eliminarFilaInsumoCompra = eliminarFilaInsumoCompra;
    window.calcularTotalCompra = calcularTotalCompra;
    window.verDetalleCompra = verDetalleCompra;
    window.filtrarCompras = filtrarCompras;
    
    // ==========================================
    // EXPORTAR API PÚBLICA DEL MÓDULO
    // ==========================================
    
    window.Compras = {
        inicializar: inicializar,
        cargarProveedores: cargarProveedores,
        cargarCompras: cargarCompras
    };
    
    console.log('✅ Módulo Compras cargado - Modo API REST');
})();

// ==========================================
// ESTILOS
// ==========================================
const estilosCompras = document.createElement('style');
estilosCompras.textContent = `
    .grid-proveedores{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;margin-top:20px}.tarjeta-proveedor{background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1);transition:all .3s}.tarjeta-proveedor:hover{box-shadow:0 4px 12px rgba(0,0,0,.15);transform:translateY(-3px)}.proveedor-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;flex-wrap:wrap;gap:10px}.proveedor-header h4{margin:0;color:var(--color-texto)}.proveedor-info{margin:15px 0}.proveedor-info p{margin:8px 0;font-size:14px;color:#7f8c8d;display:flex;align-items:center;gap:10px}.proveedor-info i{width:20px;color:var(--color-primario)}.proveedor-acciones{display:flex;gap:10px;margin-top:15px}.fila-insumo-compra{display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:10px;margin:10px 0;align-items:center}.fila-insumo-compra select,.fila-insumo-compra input{padding:8px;border:1px solid #ddd;border-radius:5px}.subtotal-compra{font-weight:bold;color:var(--color-exito);min-width:80px;text-align:right}.lista-compras{display:flex;flex-direction:column;gap:15px}.tarjeta-compra{background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1)}.compra-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;flex-wrap:wrap;gap:10px}.compra-header strong{color:var(--color-primario)}.compra-fecha{color:#7f8c8d;font-size:13px}.compra-detalles{background:#f8f9fa;padding:15px;border-radius:8px;margin:15px 0}.compra-total{text-align:right;font-size:18px;margin:15px 0;color:var(--color-exito)}.mensaje-vacio{text-align:center;padding:40px;color:#7f8c8d}.tabla-datos{width:100%;border-collapse:collapse;margin-top:10px}.tabla-datos th,.tabla-datos td{padding:10px;text-align:left;border-bottom:1px solid #eee}.tabla-datos th{background:#f8f9fa;font-weight:600}@media (max-width:768px){.fila-insumo-compra{grid-template-columns:1fr}.grid-proveedores{grid-template-columns:1fr}}
`;
document.head.appendChild(estilosCompras);