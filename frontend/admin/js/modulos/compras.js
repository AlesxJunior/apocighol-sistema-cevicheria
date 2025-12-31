/* ==========================================
   COMPRAS.JS - CON BUG 6 CORREGIDO
   Módulo de gestión de compras
   🔥 BUG 6 CORREGIDO: Validación RUC (11 dígitos) y DNI (8 dígitos)
   ========================================== */

(function() {
    let proveedoresData = [];
    let comprasData = [];
    let tabActualCompras = 'proveedores';
    
    function inicializar() {
        console.log('🛒 Inicializando módulo Compras...');
        
        cargarProveedores();
        cargarCompras();
        renderizarProveedores();
        renderizarHistorialCompras();
        
        console.log('✅ Módulo Compras inicializado');
    }
    
    function cargarProveedores() {
        proveedoresData = obtenerDatos('proveedores') || [];
        console.log(`📊 ${proveedoresData.length} proveedores cargados`);
    }
    
    function cargarCompras() {
        comprasData = obtenerDatos('compras') || [];
        console.log(`📊 ${comprasData.length} compras cargadas`);
    }
    
    function guardarProveedores() {
        guardarDatos('proveedores', proveedoresData);
    }
    
    function guardarCompras() {
        guardarDatos('compras', comprasData);
    }
    
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
    
    function renderizarProveedores() {
        const contenedor = document.getElementById('lista-proveedores');
        if (!contenedor) return;
        
        if (proveedoresData.length === 0) {
            contenedor.innerHTML = `
                <div class="mensaje-vacio">
                    <p>No hay proveedores registrados</p>
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
        return `
            <div class="tarjeta-proveedor">
                <div class="proveedor-header">
                    <h4>${proveedor.nombre}</h4>
                    <span class="badge badge-info">${proveedor.ruc || 'Sin RUC'}</span>
                </div>
                
                <div class="proveedor-info">
                    <p><i class="fas fa-phone"></i> ${proveedor.telefono || 'Sin teléfono'}</p>
                    <p><i class="fas fa-envelope"></i> ${proveedor.email || 'Sin email'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${proveedor.direccion || 'Sin dirección'}</p>
                </div>
                
                <div class="proveedor-acciones">
                    <button class="btn btn-pequeño btn-secundario" onclick="editarProveedor('${proveedor.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-pequeño btn-peligro" onclick="eliminarProveedor('${proveedor.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
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
    
    // ==========================================
    // 🔥🔥🔥 BUG 6 CORREGIDO 🔥🔥🔥
    // Validación RUC (11 dígitos) y DNI (8 dígitos)
    // ==========================================
    function confirmarNuevoProveedor() {
        const nombre = document.getElementById('nombre-proveedor').value.trim();
        const ruc = document.getElementById('ruc-proveedor').value.trim();
        const telefono = document.getElementById('telefono-proveedor').value.trim();
        const email = document.getElementById('email-proveedor').value.trim();
        const direccion = document.getElementById('direccion-proveedor').value.trim();
        
        if (!nombre) {
            mostrarNotificacion('Ingresa el nombre del proveedor', 'error');
            return;
        }
        
        // 🔥 Validación RUC/DNI
        if (ruc) {
            // Validar solo números
            if (!/^\d+$/.test(ruc)) {
                mostrarNotificacion('RUC/DNI debe contener solo números', 'error');
                return;
            }
            
            // Validar longitud: 8 (DNI) o 11 (RUC)
            if (ruc.length !== 8 && ruc.length !== 11) {
                mostrarNotificacion('Ingresa DNI (8 dígitos) o RUC (11 dígitos)', 'error');
                return;
            }
        }
        
        const nuevoProveedor = {
            id: generarId('PROV'),
            nombre: nombre,
            ruc: ruc,
            telefono: telefono,
            email: email,
            direccion: direccion,
            fechaRegistro: obtenerFechaActual()
        };
        
        proveedoresData.push(nuevoProveedor);
        guardarProveedores();
        
        cerrarModal();
        renderizarProveedores();
        
        mostrarNotificacion(`Proveedor "${nombre}" registrado`, 'exito');
    }
    
    function editarProveedor(idProveedor) {
        const proveedor = proveedoresData.find(p => p.id === idProveedor);
        if (!proveedor) {
            mostrarNotificacion('Proveedor no encontrado', 'error');
            return;
        }
        
        let contenido = `
            <div class="formulario-proveedor">
                <div class="campo-form">
                    <label>Nombre del Proveedor: *</label>
                    <input type="text" id="nombre-proveedor-edit" value="${proveedor.nombre}">
                </div>
                
                <div class="campo-form">
                    <label>RUC / DNI:</label>
                    <input type="text" id="ruc-proveedor-edit" value="${proveedor.ruc || ''}" maxlength="11">
                    <small style="color: #7f8c8d;">DNI: 8 dígitos | RUC: 11 dígitos</small>
                </div>
                
                <div class="campo-form">
                    <label>Teléfono:</label>
                    <input type="text" id="telefono-proveedor-edit" value="${proveedor.telefono || ''}">
                </div>
                
                <div class="campo-form">
                    <label>Email:</label>
                    <input type="email" id="email-proveedor-edit" value="${proveedor.email || ''}">
                </div>
                
                <div class="campo-form">
                    <label>Dirección:</label>
                    <input type="text" id="direccion-proveedor-edit" value="${proveedor.direccion || ''}">
                </div>
            </div>
        `;
        
        abrirModal('Editar Proveedor', contenido, function() {
            const nombre = document.getElementById('nombre-proveedor-edit').value.trim();
            const ruc = document.getElementById('ruc-proveedor-edit').value.trim();
            
            if (!nombre) {
                mostrarNotificacion('Ingresa el nombre del proveedor', 'error');
                return;
            }
            
            // 🔥 Validación RUC/DNI al editar
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
            
            proveedor.nombre = nombre;
            proveedor.ruc = ruc;
            proveedor.telefono = document.getElementById('telefono-proveedor-edit').value.trim();
            proveedor.email = document.getElementById('email-proveedor-edit').value.trim();
            proveedor.direccion = document.getElementById('direccion-proveedor-edit').value.trim();
            
            guardarProveedores();
            cerrarModal();
            renderizarProveedores();
            
            mostrarNotificacion('Proveedor actualizado', 'exito');
        });
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Actualizar';
        }
    }
    
    function eliminarProveedor(idProveedor) {
        const proveedor = proveedoresData.find(p => p.id === idProveedor);
        if (!proveedor) return;
        
        if (!confirmar(`¿Eliminar el proveedor "${proveedor.nombre}"?`)) {
            return;
        }
        
        const index = proveedoresData.findIndex(p => p.id === idProveedor);
        if (index !== -1) {
            proveedoresData.splice(index, 1);
            guardarProveedores();
            renderizarProveedores();
            mostrarNotificacion('Proveedor eliminado', 'exito');
        }
    }
    
    function nuevaCompra() {
        if (proveedoresData.length === 0) {
            mostrarNotificacion('Registra un proveedor primero', 'error');
            return;
        }
        
        const insumos = obtenerDatos('insumos') || [];
        if (insumos.length === 0) {
            mostrarNotificacion('Registra insumos primero', 'error');
            return;
        }
        
        let contenido = `
            <div class="formulario-compra">
                <div class="campo-form">
                    <label>Proveedor: *</label>
                    <select id="proveedor-compra">
                        <option value="">-- Selecciona proveedor --</option>
                        ${proveedoresData.map(p => `
                            <option value="${p.id}">${p.nombre}</option>
                        `).join('')}
                    </select>
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
        const insumos = obtenerDatos('insumos') || [];
        
        return `
            <div class="fila-insumo-compra" data-index="${index}">
                <select class="insumo-select-compra" onchange="calcularTotalCompra()">
                    <option value="">-- Selecciona insumo --</option>
                    ${insumos.map(i => `
                        <option value="${i.id}">${i.nombre} (${i.unidadMedida})</option>
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
    
    function confirmarNuevaCompra() {
        const idProveedor = document.getElementById('proveedor-compra').value;
        
        if (!idProveedor) {
            mostrarNotificacion('Selecciona un proveedor', 'error');
            return;
        }
        
        const filas = document.querySelectorAll('.fila-insumo-compra');
        const detalles = [];
        let total = 0;
        
        filas.forEach(fila => {
            const idInsumo = fila.querySelector('.insumo-select-compra').value;
            const cantidad = parseFloat(fila.querySelector('.cantidad-input-compra').value);
            const precio = parseFloat(fila.querySelector('.precio-input-compra').value);
            
            if (idInsumo && cantidad > 0 && precio >= 0) {
                const subtotal = cantidad * precio;
                
                detalles.push({
                    idInsumo: idInsumo,
                    cantidad: cantidad,
                    precioUnitario: precio,
                    subtotal: subtotal
                });
                
                total += subtotal;
            }
        });
        
        if (detalles.length === 0) {
            mostrarNotificacion('Agrega al menos un insumo', 'error');
            return;
        }
        
        const proveedor = proveedoresData.find(p => p.id === idProveedor);
        
        const compra = {
            id: generarId('COMP'),
            idProveedor: idProveedor,
            nombreProveedor: proveedor.nombre,
            fecha: obtenerFechaActual(),
            hora: obtenerHoraActual(),
            detalles: detalles,
            total: total
        };
        
        comprasData.push(compra);
        guardarCompras();
        
        actualizarStockPorCompra(detalles);
        
        cerrarModal();
        renderizarHistorialCompras();
        
        mostrarNotificacion(`Compra registrada: ${formatearMoneda(total)}`, 'exito');
        console.log(`✅ Compra ${compra.id} registrada`);
    }
    
    function actualizarStockPorCompra(detalles) {
        const insumos = obtenerDatos('insumos') || [];
        
        detalles.forEach(detalle => {
            const insumo = insumos.find(i => i.id === detalle.idInsumo);
            if (insumo) {
                insumo.stockActual += detalle.cantidad;
                console.log(`   📦 ${insumo.nombre}: +${detalle.cantidad} (ahora: ${insumo.stockActual})`);
            }
        });
        
        guardarDatos('insumos', insumos);
        console.log('✅ Stock actualizado por compra');
    }
    
    // ==========================================
    // 🔥 FILTRADO DE COMPRAS POR FECHA
    // ==========================================
    function renderizarHistorialCompras() {
        const contenedor = document.getElementById('lista-compras-historial');
        if (!contenedor) return;
        
        // 🔥 Establecer fechas por defecto (últimos 30 días) si están vacías
        const inputDesde = document.getElementById('fecha-desde-compras');
        const inputHasta = document.getElementById('fecha-hasta-compras');
        
        if (inputDesde && !inputDesde.value) {
            const hace30Dias = new Date();
            hace30Dias.setDate(hace30Dias.getDate() - 30);
            inputDesde.value = hace30Dias.toISOString().split('T')[0];
        }
        if (inputHasta && !inputHasta.value) {
            inputHasta.value = obtenerFechaActual();
        }
        
        if (comprasData.length === 0) {
            contenedor.innerHTML = `
                <div class="mensaje-vacio">
                    <p>No hay compras registradas</p>
                </div>
            `;
            return;
        }
        
        // Aplicar filtro de fechas
        let comprasFiltradas = [...comprasData];
        
        if (inputDesde && inputDesde.value && inputHasta && inputHasta.value) {
            const fechaDesde = new Date(inputDesde.value + 'T00:00:00');
            const fechaHasta = new Date(inputHasta.value + 'T23:59:59');
            
            comprasFiltradas = comprasFiltradas.filter(compra => {
                const fechaCompra = new Date(compra.fecha + 'T00:00:00');
                return fechaCompra >= fechaDesde && fechaCompra <= fechaHasta;
            });
        }
        
        // Ordenar por más recientes primero
        const comprasOrdenadas = comprasFiltradas.reverse();
        
        if (comprasOrdenadas.length === 0) {
            contenedor.innerHTML = `
                <div class="mensaje-vacio">
                    <p>No hay compras en el período seleccionado</p>
                </div>
            `;
            return;
        }
        
        contenedor.innerHTML = `
            <div class="lista-compras">
                ${comprasOrdenadas.map(compra => crearTarjetaCompra(compra)).join('')}
            </div>
        `;
    }
    
    function crearTarjetaCompra(compra) {
        return `
            <div class="tarjeta-compra">
                <div class="compra-header">
                    <div>
                        <strong>${compra.id}</strong>
                        <span class="badge badge-info">${compra.nombreProveedor}</span>
                    </div>
                    <div class="compra-fecha">
                        ${compra.fecha} - ${compra.hora}
                    </div>
                </div>
                
                <div class="compra-detalles">
                    <strong>Insumos comprados:</strong>
                    <ul>
                        ${compra.detalles.slice(0, 3).map(det => {
                            const insumo = obtenerDatos('insumos').find(i => i.id === det.idInsumo);
                            return `<li>${det.cantidad} x ${insumo ? insumo.nombre : 'Insumo'} - ${formatearMoneda(det.subtotal)}</li>`;
                        }).join('')}
                        ${compra.detalles.length > 3 ? `<li>... y ${compra.detalles.length - 3} más</li>` : ''}
                    </ul>
                </div>
                
                <div class="compra-total">
                    <strong>TOTAL:</strong> ${formatearMoneda(compra.total)}
                </div>
                
                <button class="btn btn-pequeño btn-primario" onclick="verDetalleCompra('${compra.id}')">
                    <i class="fas fa-eye"></i> Ver Detalle
                </button>
            </div>
        `;
    }
    
    function verDetalleCompra(idCompra) {
        const compra = comprasData.find(c => c.id === idCompra);
        if (!compra) {
            mostrarNotificacion('Compra no encontrada', 'error');
            return;
        }
        
        const insumos = obtenerDatos('insumos') || [];
        
        let contenido = `
            <div class="detalle-compra">
                <div style="margin-bottom: 15px;">
                    <strong>ID:</strong> ${compra.id}<br>
                    <strong>Proveedor:</strong> ${compra.nombreProveedor}<br>
                    <strong>Fecha:</strong> ${compra.fecha} ${compra.hora}
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
                        ${compra.detalles.map(det => {
                            const insumo = insumos.find(i => i.id === det.idInsumo);
                            return `
                                <tr>
                                    <td>${insumo ? insumo.nombre : 'Insumo no encontrado'}</td>
                                    <td>${det.cantidad}</td>
                                    <td>${formatearMoneda(det.precioUnitario)}</td>
                                    <td><strong>${formatearMoneda(det.subtotal)}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                
                <div style="text-align: right; margin-top: 20px;">
                    <h3>TOTAL: ${formatearMoneda(compra.total)}</h3>
                </div>
            </div>
        `;
        
        abrirModal(`Detalle de Compra - ${compra.id}`, contenido, null);
        document.getElementById('modal-btn-confirmar').style.display = 'none';
    }
    
    function filtrarCompras() {
        // Simplemente re-renderizar con las fechas actuales
        renderizarHistorialCompras();
        mostrarNotificacion('Filtro aplicado', 'exito');
    }
    
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
    
    window.Compras = {
        inicializar: inicializar
    };
    
    console.log('✅ Módulo Compras cargado (BUG 6 CORREGIDO)');
})();

const estilosCompras = document.createElement('style');
estilosCompras.textContent = `
    .grid-proveedores{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;margin-top:20px}.tarjeta-proveedor{background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1);transition:all .3s}.tarjeta-proveedor:hover{box-shadow:0 4px 12px rgba(0,0,0,.15);transform:translateY(-3px)}.proveedor-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}.proveedor-header h4{margin:0;color:var(--color-texto)}.proveedor-info{margin:15px 0}.proveedor-info p{margin:8px 0;font-size:14px;color:#7f8c8d;display:flex;align-items:center;gap:10px}.proveedor-info i{width:20px;color:var(--color-primario)}.proveedor-acciones{display:flex;gap:10px;margin-top:15px}.fila-insumo-compra{display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:10px;margin:10px 0;align-items:center}.fila-insumo-compra select,.fila-insumo-compra input{padding:8px;border:1px solid #ddd;border-radius:5px}.subtotal-compra{font-weight:bold;color:var(--color-exito)}.lista-compras{display:flex;flex-direction:column;gap:15px}.tarjeta-compra{background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1)}.compra-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}.compra-header strong{color:var(--color-primario)}.compra-fecha{color:#7f8c8d;font-size:13px}.compra-detalles{background:#f8f9fa;padding:15px;border-radius:8px;margin:15px 0}.compra-detalles ul{margin:10px 0 0 20px}.compra-detalles li{margin:5px 0}.compra-total{text-align:right;font-size:18px;margin:15px 0;color:var(--color-exito)}@media (max-width:768px){.fila-insumo-compra{grid-template-columns:1fr}.grid-proveedores{grid-template-columns:1fr}}
`;
document.head.appendChild(estilosCompras);