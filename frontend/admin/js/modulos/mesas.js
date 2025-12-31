/* ==========================================
   MESAS.JS - CONECTADO A API REST MYSQL
   🔥 VERSIÓN CON SELECTOR DE MESEROS DESDE API
   🔥 CORREGIDO: Usa endpoint /cobrar en lugar de DELETE
   ========================================== */

(function() {
    // URLs de API
    const API_URL = 'http://localhost:8085/api/mesas';
    const API_USUARIOS = 'http://localhost:8085/api/usuarios';
    const API_PEDIDOS = 'http://localhost:8085/api/pedidos';
    
    let mesasData = [];
    let meserosData = [];
    let totalACobrar = 0;
    
    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    
    async function inicializar() {
        console.log('🪑 Inicializando módulo Mesas (API)...');
        await cargarMesas();
        await cargarMeseros();
        renderizarMesas();

        if (window.sesionActual && window.sesionActual.rol === 'CAJERO') {
            setTimeout(() => {
                const btnNuevaMesa = document.querySelector('.encabezado-seccion button[onclick="agregarMesa()"]');
                if (btnNuevaMesa) {
                    btnNuevaMesa.style.display = 'none';
                    console.log('❌ Botón "Nueva Mesa" oculto para CAJERO');
                }
            }, 100);
        }
        console.log('✅ Módulo Mesas inicializado (API)');
    }
    
    // ==========================================
    // 🔥 CARGAR MESAS DESDE API
    // ==========================================
    
    async function cargarMesas() {
        try {
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const mesasAPI = await response.json();
            
            mesasData = mesasAPI.map(mesa => ({
                id: mesa.idMesa,
                numero: mesa.numeroMesa,
                capacidad: mesa.capacidadMesa,
                estado: mesa.estadoMesa || 'disponible',
                cantidadPersonas: mesa.personasActuales || 0,
                mesero: mesa.meseroAsignado || null,
                horaInicio: mesa.horaOcupacionMesa || null,
                totalGastado: parseFloat(mesa.totalConsumoMesa) || 0,
                pedidos: []
            }));
            
            console.log(`📊 ${mesasData.length} mesas cargadas desde API`);
            
        } catch (error) {
            console.error('❌ Error al cargar mesas:', error);
            mostrarNotificacion('Error al cargar mesas del servidor', 'error');
            mesasData = [];
        }
    }
    
    // ==========================================
    // 🔥 CARGAR MESEROS DESDE API USUARIOS
    // ==========================================
    
    async function cargarMeseros() {
        try {
            const response = await fetch(API_USUARIOS);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const usuarios = await response.json();
            
            meserosData = usuarios
                .filter(u => u.rolUsuario === 'MESERO' || u.rolUsuario === 'ADMIN')
                .map(u => ({
                    id: u.idUsuario,
                    nombre: u.nombreUsuario,
                    rol: u.rolUsuario
                }));
            
            console.log(`👥 ${meserosData.length} meseros cargados desde API`);
            
        } catch (error) {
            console.error('❌ Error al cargar meseros:', error);
            meserosData = [];
        }
    }
    
    // ==========================================
    // RENDERIZAR MESAS
    // ==========================================
    
    function renderizarMesas() {
        const contenedor = document.getElementById('mesas-contenido');
        if (!contenedor) return;
        
        if (mesasData.length === 0) {
            contenedor.innerHTML = `
                <div class="tarjeta texto-centro">
                    <p>No hay mesas registradas</p>
                    <button class="btn btn-primario" onclick="agregarMesa()">
                        <i class="fas fa-plus"></i> Crear Nueva Mesa
                    </button>
                </div>
            `;
            return;
        }
        
        contenedor.innerHTML = mesasData.map(mesa => crearTarjetaMesa(mesa)).join('');
    }
    
    function crearTarjetaMesa(mesa) {
        const estadoClass = mesa.estado;
        const badgeClass = `badge-${mesa.estado}`;
        
        return `
            <div class="tarjeta-mesa ${estadoClass}" onclick="abrirDetallesMesa(${mesa.numero})">
                <div class="mesa-numero">
                    <i class="fas fa-table"></i>
                    Mesa ${mesa.numero}
                </div>
                
                <div class="badge ${badgeClass}">
                    ${mesa.estado.toUpperCase()}
                </div>
                
                ${mesa.estado === 'ocupada' ? `
                    <div class="mesa-info">
                        <i class="fas fa-users"></i> ${mesa.cantidadPersonas} personas
                    </div>
                    <div class="mesa-info">
                        <i class="fas fa-clock"></i> ${mesa.horaInicio || '--:--'}
                    </div>
                    <div class="mesa-info">
                        <i class="fas fa-dollar-sign"></i> ${formatearMoneda(mesa.totalGastado)}
                    </div>
                ` : ''}
                
                ${mesa.estado === 'disponible' ? `
                    <div class="mesa-info" style="color: var(--color-exito);">
                        <i class="fas fa-check-circle"></i> Disponible
                    </div>
                ` : ''}
                
                ${mesa.estado === 'reservada' ? `
                    <div class="mesa-info">
                        <i class="fas fa-calendar"></i> Reservada
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // ==========================================
    // ABRIR DETALLES DE MESA
    // ==========================================
    
    function abrirDetallesMesa(numeroMesa) {
        const mesa = mesasData.find(m => m.numero === numeroMesa);
        if (!mesa) {
            mostrarNotificacion('Mesa no encontrada', 'error');
            return;
        }
        
        let contenido = `
            <div class="detalle-mesa">
                <p style="margin-bottom: 15px;"><strong>Estado actual:</strong> 
                    <span class="badge badge-${mesa.estado}">${mesa.estado.toUpperCase()}</span>
                </p>
        `;
        
        if (mesa.estado === 'ocupada') {
            contenido += `
                <div class="info-mesa-ocupada">
                    <p><strong>Personas:</strong> ${mesa.cantidadPersonas}</p>
                    <p><strong>Hora inicio:</strong> ${mesa.horaInicio || '--:--'}</p>
                    <p><strong>Mesero:</strong> ${mesa.mesero || 'No asignado'}</p>
                    <p><strong>Total gastado:</strong> ${formatearMoneda(mesa.totalGastado)}</p>
                </div>
                <hr style="margin: 15px 0; border: none; border-top: 1px solid #ecf0f1;">
                <div style="text-align: center;">
                    <button class="btn btn-exito btn-cobrar-mesa" onclick="cobrarMesaModal(${mesa.numero})" style="margin-right: 10px;">
                        <i class="fas fa-dollar-sign"></i> Cobrar Mesa
                    </button>
                    <button class="btn btn-peligro" onclick="liberarMesa(${mesa.numero})">
                        <i class="fas fa-door-open"></i> Liberar Mesa
                    </button>
                </div>
            `;
        }

        else if (mesa.estado === 'disponible') {
            if (window.sesionActual && window.sesionActual.rol === 'CAJERO') {
                contenido += `
                    <div class="info-mesa-ocupada">
                        <p style="text-align: center; color: #e67e22;">
                            <i class="fas fa-info-circle"></i><br><br>
                            Solo el mesero puede ocupar mesas
                        </p>
                    </div>
                `;
            } else if (window.sesionActual && window.sesionActual.rol === 'MESERO') {
                const nombreMeseroActual = window.sesionActual.nombre || window.sesionActual.usuario || 'Mesero';
                contenido += `
                    <div class="formulario-ocupar">
                        <div class="campo-form">
                            <label>Cantidad de personas:</label>
                            <input type="number" id="cantidad-personas" min="1" max="${mesa.capacidad || 10}" value="2">
                        </div>
                        <div class="campo-form">
                            <label>Mesero asignado:</label>
                            <div class="mesero-autoasignado">
                                <i class="fas fa-user-check"></i>
                                <span><strong>${nombreMeseroActual}</strong></span>
                                <small>(Tú)</small>
                            </div>
                            <input type="hidden" id="nombre-mesero" value="${nombreMeseroActual}">
                        </div>
                    </div>
                    <hr style="margin: 15px 0; border: none; border-top: 1px solid #ecf0f1;">
                    <div style="text-align: center;">
                        <button class="btn btn-exito" onclick="ocuparMesaModal(${mesa.numero})">
                            <i class="fas fa-users"></i> Ocupar Mesa
                        </button>
                    </div>
                `;
            } else {
                contenido += `
                    <div class="formulario-ocupar">
                        <div class="campo-form">
                            <label>Cantidad de personas:</label>
                            <input type="number" id="cantidad-personas" min="1" max="${mesa.capacidad || 10}" value="2">
                        </div>
                        <div class="campo-form">
                            <label>Asignar a Mesero: *</label>
                            <select id="nombre-mesero" class="select-grande">
                                <option value="">-- Seleccione un mesero --</option>
                                ${meserosData.map(m => `
                                    <option value="${m.nombre}">${m.nombre} (${m.rol})</option>
                                `).join('')}
                            </select>
                            ${meserosData.length === 0 ? `
                                <small style="color: #e74c3c; display: block; margin-top: 5px;">
                                    <i class="fas fa-exclamation-triangle"></i> No hay meseros registrados
                                </small>
                            ` : ''}
                        </div>
                    </div>
                    <hr style="margin: 15px 0; border: none; border-top: 1px solid #ecf0f1;">
                    <div style="text-align: center;">
                        <button class="btn btn-exito" onclick="ocuparMesaModal(${mesa.numero})">
                            <i class="fas fa-users"></i> Ocupar Mesa
                        </button>
                    </div>
                `;
            }
        }

        else if (mesa.estado === 'reservada') {
            contenido += `
                <div class="info-mesa-ocupada">
                    <p>Esta mesa está reservada</p>
                </div>
                <hr style="margin: 15px 0; border: none; border-top: 1px solid #ecf0f1;">
                <div style="text-align: center;">
                    <button class="btn btn-secundario" onclick="liberarMesa(${mesa.numero})">
                        <i class="fas fa-times"></i> Cancelar Reserva
                    </button>
                </div>
            `;
        }
        
        contenido += `</div>`;
        abrirModal(`Mesa ${mesa.numero}`, contenido, null);
        document.getElementById('modal-btn-confirmar').style.display = 'none';

        setTimeout(() => {
            if (window.sesionActual && window.sesionActual.rol === 'MESERO') {
                const btnCobrar = document.querySelector('.btn-cobrar-mesa');
                if (btnCobrar) {
                    btnCobrar.style.display = 'none';
                    console.log('❌ Botón "Cobrar" oculto para MESERO');
                }
            }
        }, 100);
    }
    
    // ==========================================
    // 🔥 OCUPAR MESA - API
    // ==========================================
    
    async function ocuparMesaModal(numeroMesa) {
        const cantidadPersonas = document.getElementById('cantidad-personas').value;
        const nombreMesero = document.getElementById('nombre-mesero').value;
        
        if (!cantidadPersonas || cantidadPersonas < 1) {
            mostrarNotificacion('Ingresa la cantidad de personas', 'error');
            return;
        }
        
        if (!nombreMesero || nombreMesero.trim() === '') {
            mostrarNotificacion('Selecciona un mesero', 'error');
            return;
        }
        
        await ocuparMesa(numeroMesa, parseInt(cantidadPersonas), nombreMesero);
        cerrarModal();
    }
    
    async function ocuparMesa(numeroMesa, personas, mesero = '') {
        const cajaActual = obtenerDatos('cajaActual');
        if (!cajaActual) {
            mostrarNotificacion('⚠️ Debes abrir la caja primero para atender mesas', 'error');
            return;
        }
        
        const mesa = mesasData.find(m => m.numero === numeroMesa);
        
        if (!mesa) {
            mostrarNotificacion('Mesa no encontrada', 'error');
            return;
        }
        
        if (mesa.estado !== 'disponible') {
            mostrarNotificacion('La mesa no está disponible', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/${mesa.id}/ocupar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    personas: personas,
                    mesero: mesero || 'Sin asignar'
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al ocupar mesa');
            }
            
            await cargarMesas();
            renderizarMesas();
            
            mostrarNotificacion(`Mesa ${numeroMesa} ocupada con ${personas} personas`, 'exito');
            console.log(`✅ Mesa ${numeroMesa} ocupada (API)`);
            
        } catch (error) {
            console.error('❌ Error al ocupar mesa:', error);
            mostrarNotificacion(`Error: ${error.message}`, 'error');
        }
    }
    
    // ==========================================
    // 🔥 LIBERAR MESA - API
    // ==========================================
    
    async function liberarMesa(numeroMesa) {
        const mesa = mesasData.find(m => m.numero === numeroMesa);
        
        if (!mesa) {
            mostrarNotificacion('Mesa no encontrada', 'error');
            return;
        }
        
        if (mesa.totalGastado > 0) {
            mostrarNotificacion(
                `⚠️ NO se puede liberar esta mesa.\n\nTiene un consumo de ${formatearMoneda(mesa.totalGastado)} sin cobrar.\n\nDebe cobrarla primero.`,
                'error'
            );
            return;
        }
        
        if (!confirmar(`¿Liberar la mesa ${numeroMesa}?`)) {
            return;
        }
        
        try {
            // 🔥 Anular pedidos pendientes (sin cobrar) de la mesa
            const pedidosResponse = await fetch(`${API_PEDIDOS}/mesa/${numeroMesa}/activos`);
            
            if (pedidosResponse.ok) {
                const pedidosMesa = await pedidosResponse.json();
                
                for (const pedido of pedidosMesa) {
                    // Anular pedidos al liberar mesa sin cobrar
                    await fetch(`${API_PEDIDOS}/${pedido.idPedido}/anular`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            motivo: 'Mesa liberada sin cobrar',
                            usuario: window.sesionActual ? window.sesionActual.nombre : 'Sistema'
                        })
                    });
                }
                
                if (pedidosMesa.length > 0) {
                    console.log(`🗑️ ${pedidosMesa.length} pedido(s) de Mesa ${numeroMesa} anulado(s)`);
                }
            }
            
            const response = await fetch(`${API_URL}/${mesa.id}/liberar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al liberar mesa');
            }
            
            await cargarMesas();
            renderizarMesas();
            cerrarModal();
            
            mostrarNotificacion(`Mesa ${numeroMesa} liberada`, 'exito');
            console.log(`✅ Mesa ${numeroMesa} liberada (API)`);
            
        } catch (error) {
            console.error('❌ Error al liberar mesa:', error);
            mostrarNotificacion(`Error: ${error.message}`, 'error');
        }
    }
    
    // ==========================================
    // 🔥 ACTUALIZAR TOTAL MESA - API
    // ==========================================
    
    async function actualizarTotalMesa(numeroMesa, monto) {
        const mesa = mesasData.find(m => m.numero === numeroMesa);
        
        if (!mesa) {
            console.error(`Mesa ${numeroMesa} no encontrada`);
            return;
        }
        
        const nuevoTotal = mesa.totalGastado + parseFloat(monto);
        
        try {
            const response = await fetch(`${API_URL}/${mesa.id}/total`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    total: nuevoTotal
                })
            });
            
            if (!response.ok) {
                throw new Error('Error al actualizar total');
            }
            
            mesa.totalGastado = nuevoTotal;
            renderizarMesas();
            
            console.log(`💰 Mesa ${numeroMesa}: +${formatearMoneda(monto)} = ${formatearMoneda(nuevoTotal)} (API)`);
            
        } catch (error) {
            console.error('❌ Error al actualizar total:', error);
        }
    }
    
    // ==========================================
    // 🔥 AGREGAR MESA - API
    // ==========================================
    
    async function agregarMesa() {
        const ultimaMesa = mesasData.length > 0 
            ? Math.max(...mesasData.map(m => m.numero)) 
            : 0;
        
        const numeroNuevo = ultimaMesa + 1;
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    numeroMesa: numeroNuevo,
                    capacidadMesa: 4,
                    estadoMesa: 'disponible'
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al crear mesa');
            }
            
            await cargarMesas();
            renderizarMesas();
            
            mostrarNotificacion(`Mesa ${numeroNuevo} agregada`, 'exito');
            console.log(`✅ Mesa ${numeroNuevo} creada (API)`);
            
        } catch (error) {
            console.error('❌ Error al crear mesa:', error);
            mostrarNotificacion(`Error: ${error.message}`, 'error');
        }
    }
    
    // ==========================================
    // 🔥 MODAL DE COBRO CON VUELTO
    // ==========================================
    
    function cobrarMesaModal(numeroMesa) {
        const cajaActual = obtenerDatos('cajaActual');
        if (!cajaActual) {
            mostrarNotificacion('⚠️ No se puede cobrar sin caja abierta', 'error');
            return;
        }
        
        const mesa = mesasData.find(m => m.numero === numeroMesa);
        
        if (!mesa) {
            mostrarNotificacion('Mesa no encontrada', 'error');
            return;
        }
        
        if (mesa.estado !== 'ocupada') {
            mostrarNotificacion('La mesa no está ocupada', 'error');
            return;
        }
        
        if (mesa.totalGastado <= 0) {
            mostrarNotificacion('La mesa no tiene consumo registrado', 'error');
            return;
        }
        
        validarPedidosYMostrarCobro(numeroMesa, mesa);
    }
    
    async function validarPedidosYMostrarCobro(numeroMesa, mesa) {
        try {
            const response = await fetch(`${API_PEDIDOS}/mesa/${numeroMesa}/activos`);
            
            if (response.ok) {
                const pedidosMesa = await response.json();
                const pedidosNoServidos = pedidosMesa.filter(p => p.estadoPedido !== 'servido');
                
                if (pedidosNoServidos.length > 0) {
                    const estadosPendientes = pedidosNoServidos.map(p => `${p.codigoPedido} (${p.estadoPedido})`).join(', ');
                    mostrarNotificacion(
                        `⚠️ No se puede cobrar. Hay ${pedidosNoServidos.length} pedido(s) sin servir: ${estadosPendientes}`,
                        'error'
                    );
                    return;
                }
            }
            
            mostrarModalCobro(numeroMesa, mesa);
            
        } catch (error) {
            console.error('❌ Error validando pedidos:', error);
            mostrarModalCobro(numeroMesa, mesa);
        }
    }
    
    function mostrarModalCobro(numeroMesa, mesa) {
        cerrarModal();
        
        totalACobrar = mesa.totalGastado;
        
        let contenido = `
            <div class="formulario-cobro">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3>Mesa ${numeroMesa}</h3>
                    <p style="font-size: 28px; font-weight: bold; color: var(--color-primario);">
                        Total: ${formatearMoneda(mesa.totalGastado)}
                    </p>
                </div>
                
                <div class="campo-form">
                    <label>Método de Pago: *</label>
                    <select id="metodo-pago-cobro" class="select-grande" onchange="toggleCampoVuelto()">
                        <option value="Efectivo">Efectivo</option>
                        <option value="Yape">Yape</option>
                        <option value="Plin">Plin</option>
                        <option value="Tarjeta">Tarjeta</option>
                    </select>
                </div>
                
                <div id="seccion-vuelto" class="seccion-vuelto">
                    <div class="campo-form">
                        <label><i class="fas fa-money-bill-wave"></i> Cliente paga con: *</label>
                        <div class="input-moneda">
                            <span class="prefijo-moneda">S/.</span>
                            <input type="number" 
                                   id="monto-recibido" 
                                   placeholder="0.00"
                                   min="0"
                                   step="0.10"
                                   oninput="calcularVuelto()"
                                   class="input-monto-grande">
                        </div>
                    </div>
                    
                    <div class="botones-monto-rapido">
                        <button type="button" class="btn-monto" onclick="setMontoRapido(10)">S/. 10</button>
                        <button type="button" class="btn-monto" onclick="setMontoRapido(20)">S/. 20</button>
                        <button type="button" class="btn-monto" onclick="setMontoRapido(50)">S/. 50</button>
                        <button type="button" class="btn-monto" onclick="setMontoRapido(100)">S/. 100</button>
                        <button type="button" class="btn-monto" onclick="setMontoRapido(200)">S/. 200</button>
                        <button type="button" class="btn-monto btn-monto-exacto" onclick="setMontoExacto()">Exacto</button>
                    </div>
                    
                    <div id="resultado-vuelto" class="resultado-vuelto">
                        <div class="vuelto-label">VUELTO A ENTREGAR:</div>
                        <div class="vuelto-monto" id="monto-vuelto">S/. 0.00</div>
                    </div>
                    
                    <div id="error-monto" class="error-monto" style="display: none;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>El monto recibido es insuficiente</span>
                    </div>
                </div>
                
                <div id="mensaje-pago-digital" class="mensaje-pago-digital" style="display: none;">
                    <i class="fas fa-mobile-alt"></i>
                    <p>Pago digital - Monto exacto: <strong>${formatearMoneda(mesa.totalGastado)}</strong></p>
                    <small>No se requiere vuelto</small>
                </div>
                
                <hr style="margin: 20px 0; border: 1px solid #ecf0f1;">
                
                <div style="margin: 20px 0;">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" id="requiere-comprobante" onchange="toggleComprobante()" style="width: 20px; height: 20px;">
                        <span style="font-weight: bold;">¿Requiere comprobante?</span>
                    </label>
                </div>
                
                <div id="datos-comprobante" style="display: none; background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <div class="campo-form">
                        <label>Tipo de Comprobante: *</label>
                        <select id="tipo-comprobante" class="select-grande" onchange="toggleTipoDocumento()">
                            <option value="boleta">Boleta Electrónica</option>
                            <option value="factura">Factura Electrónica</option>
                        </select>
                    </div>
                    
                    <div class="campo-form">
                        <label id="label-tipo-doc">Tipo de Documento: *</label>
                        <select id="tipo-documento" class="select-grande">
                            <option value="DNI">DNI</option>
                            <option value="CE">Carnet de Extranjería</option>
                        </select>
                    </div>
                    
                    <div class="campo-form">
                        <label id="label-numero-doc">Número de DNI: *</label>
                        <input type="text" 
                               id="numero-documento" 
                               placeholder="Ej: 12345678"
                               maxlength="11">
                    </div>
                    
                    <div class="campo-form">
                        <label id="label-nombre-cliente">Nombre Completo: *</label>
                        <input type="text" 
                               id="nombre-cliente-comprobante" 
                               placeholder="Ej: Juan Pérez García"
                               maxlength="200">
                    </div>
                    
                    <div class="campo-form" id="campo-direccion" style="display: none;">
                        <label>Dirección: *</label>
                        <input type="text" 
                               id="direccion-cliente" 
                               placeholder="Dirección fiscal"
                               maxlength="300">
                    </div>
                </div>
            </div>
        `;
        
        abrirModal(`Cobrar Mesa ${numeroMesa}`, contenido, function() {
            confirmarCobroMesa(numeroMesa);
        });
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Cobrar';
        }
    }
    
    // ==========================================
    // FUNCIONES DE VUELTO
    // ==========================================
    
    window.toggleCampoVuelto = function() {
        const metodoPago = document.getElementById('metodo-pago-cobro').value;
        const seccionVuelto = document.getElementById('seccion-vuelto');
        const mensajeDigital = document.getElementById('mensaje-pago-digital');
        
        if (metodoPago === 'Efectivo') {
            seccionVuelto.style.display = 'block';
            mensajeDigital.style.display = 'none';
            document.getElementById('monto-recibido').value = '';
            document.getElementById('monto-vuelto').textContent = 'S/. 0.00';
            document.getElementById('resultado-vuelto').classList.remove('vuelto-positivo');
            document.getElementById('error-monto').style.display = 'none';
        } else {
            seccionVuelto.style.display = 'none';
            mensajeDigital.style.display = 'flex';
        }
    };
    
    window.calcularVuelto = function() {
        const montoRecibido = parseFloat(document.getElementById('monto-recibido').value) || 0;
        const vuelto = montoRecibido - totalACobrar;
        
        const montoVueltoDiv = document.getElementById('monto-vuelto');
        const resultadoVuelto = document.getElementById('resultado-vuelto');
        const errorMonto = document.getElementById('error-monto');
        
        if (montoRecibido === 0) {
            montoVueltoDiv.textContent = 'S/. 0.00';
            resultadoVuelto.classList.remove('vuelto-positivo', 'vuelto-negativo');
            errorMonto.style.display = 'none';
        } else if (vuelto < 0) {
            montoVueltoDiv.textContent = `- ${formatearMoneda(Math.abs(vuelto))}`;
            resultadoVuelto.classList.remove('vuelto-positivo');
            resultadoVuelto.classList.add('vuelto-negativo');
            errorMonto.style.display = 'flex';
        } else {
            montoVueltoDiv.textContent = formatearMoneda(vuelto);
            resultadoVuelto.classList.remove('vuelto-negativo');
            resultadoVuelto.classList.add('vuelto-positivo');
            errorMonto.style.display = 'none';
        }
    };
    
    window.setMontoRapido = function(monto) {
        document.getElementById('monto-recibido').value = monto;
        calcularVuelto();
    };
    
    window.setMontoExacto = function() {
        document.getElementById('monto-recibido').value = totalACobrar.toFixed(2);
        calcularVuelto();
    };
    
    window.toggleComprobante = function() {
        const checkbox = document.getElementById('requiere-comprobante');
        const datosComprobante = document.getElementById('datos-comprobante');
        datosComprobante.style.display = checkbox.checked ? 'block' : 'none';
    };
    
    window.toggleTipoDocumento = function() {
        const tipoComprobante = document.getElementById('tipo-comprobante').value;
        const tipoDocumento = document.getElementById('tipo-documento');
        const campoDireccion = document.getElementById('campo-direccion');
        const labelNumeroDoc = document.getElementById('label-numero-doc');
        const labelNombre = document.getElementById('label-nombre-cliente');
        
        if (tipoComprobante === 'factura') {
            tipoDocumento.innerHTML = '<option value="RUC">RUC</option>';
            tipoDocumento.value = 'RUC';
            campoDireccion.style.display = 'block';
            labelNumeroDoc.textContent = 'Número de RUC: *';
            labelNombre.textContent = 'Razón Social: *';
            document.getElementById('numero-documento').placeholder = 'Ej: 20123456789';
            document.getElementById('numero-documento').maxLength = 11;
        } else {
            tipoDocumento.innerHTML = `
                <option value="DNI">DNI</option>
                <option value="CE">Carnet de Extranjería</option>
            `;
            tipoDocumento.value = 'DNI';
            campoDireccion.style.display = 'none';
            labelNumeroDoc.textContent = 'Número de DNI: *';
            labelNombre.textContent = 'Nombre Completo: *';
            document.getElementById('numero-documento').placeholder = 'Ej: 12345678';
            document.getElementById('numero-documento').maxLength = 8;
        }
    };
    
    // ==========================================
    // 🔥 CONFIRMAR COBRO - CON API (CORREGIDO)
    // ==========================================
    
    async function confirmarCobroMesa(numeroMesa) {
        const mesa = mesasData.find(m => m.numero === numeroMesa);
        const cajaActual = obtenerDatos('cajaActual');
        
        if (!mesa) {
            mostrarNotificacion('Mesa no encontrada', 'error');
            return;
        }
        
        const metodoPago = document.getElementById('metodo-pago-cobro').value;
        
        if (metodoPago === 'Efectivo') {
            const montoRecibido = parseFloat(document.getElementById('monto-recibido').value) || 0;
            
            if (montoRecibido <= 0) {
                mostrarNotificacion('⚠️ Ingresa el monto recibido del cliente', 'error');
                document.getElementById('monto-recibido').focus();
                return;
            }
            
            if (montoRecibido < mesa.totalGastado) {
                mostrarNotificacion(`⚠️ Monto insuficiente. Faltan ${formatearMoneda(mesa.totalGastado - montoRecibido)}`, 'error');
                document.getElementById('monto-recibido').focus();
                return;
            }
        }
        
        const requiereComprobante = document.getElementById('requiere-comprobante').checked;
        let datosComprobante = null;
        
        if (requiereComprobante) {
            const tipoComprobante = document.getElementById('tipo-comprobante').value;
            const tipoDocumento = document.getElementById('tipo-documento').value;
            const numeroDocumento = document.getElementById('numero-documento').value.trim();
            const nombreCliente = document.getElementById('nombre-cliente-comprobante').value.trim();
            
            if (!numeroDocumento) {
                mostrarNotificacion('Ingresa el número de documento', 'error');
                return;
            }
            
            if (!nombreCliente) {
                mostrarNotificacion('Ingresa el nombre del cliente', 'error');
                return;
            }
            
            if (tipoDocumento === 'DNI' && numeroDocumento.length !== 8) {
                mostrarNotificacion('El DNI debe tener 8 dígitos', 'error');
                return;
            }
            
            if (tipoDocumento === 'RUC' && numeroDocumento.length !== 11) {
                mostrarNotificacion('El RUC debe tener 11 dígitos', 'error');
                return;
            }
            
            let direccion = '';
            if (tipoComprobante === 'factura') {
                direccion = document.getElementById('direccion-cliente').value.trim();
                if (!direccion) {
                    mostrarNotificacion('Ingresa la dirección para factura', 'error');
                    return;
                }
            }
            
            const correlativo = generarCorrelativoComprobante(tipoComprobante);
            
            datosComprobante = {
                tipo: tipoComprobante,
                serie: correlativo.serie,
                numero: correlativo.numero,
                completo: correlativo.completo,
                cliente: {
                    tipoDocumento: tipoDocumento,
                    numeroDocumento: numeroDocumento,
                    nombre: nombreCliente,
                    direccion: direccion
                },
                fechaEmision: obtenerFechaActual(),
                horaEmision: obtenerHoraActual()
            };
        }
        
        // 🔥 Obtener productos de pedidos desde API
        let productosVenta = [];
        
        try {
            const response = await fetch(`${API_PEDIDOS}/mesa/${numeroMesa}`);
            if (response.ok) {
                const pedidosMesa = await response.json();
                
                pedidosMesa.forEach(pedido => {
                    if (pedido.productos) {
                        pedido.productos.forEach(prod => {
                            const productoExistente = productosVenta.find(pv => pv.nombre === prod.nombreProducto);
                            if (productoExistente) {
                                productoExistente.cantidad += prod.cantidad;
                                productoExistente.subtotal += parseFloat(prod.subtotal);
                            } else {
                                productosVenta.push({
                                    nombre: prod.nombreProducto,
                                    cantidad: prod.cantidad,
                                    precio: parseFloat(prod.precioUnitario),
                                    subtotal: parseFloat(prod.subtotal)
                                });
                            }
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error obteniendo productos:', error);
        }
        
        // Calcular vuelto
        let vueltoEntregado = 0;
        let montoRecibidoCliente = 0;
        
        if (metodoPago === 'Efectivo') {
            montoRecibidoCliente = parseFloat(document.getElementById('monto-recibido').value) || 0;
            vueltoEntregado = montoRecibidoCliente - mesa.totalGastado;
        }
        
        // Crear venta (localStorage por ahora)
        const venta = {
            id: generarId('VENTA'),
            idCaja: cajaActual.id,
            numeroMesa: numeroMesa,
            fecha: obtenerFechaActualDDMMYYYY(),
            hora: obtenerHoraActual(),
            total: mesa.totalGastado,
            metodoPago: metodoPago,
            montoRecibido: montoRecibidoCliente,
            vuelto: vueltoEntregado,
            mesero: mesa.mesero,
            productos: productosVenta,
            comprobante: datosComprobante
        };
        
        const ventas = obtenerDatos('ventas') || [];
        ventas.push(venta);
        guardarDatos('ventas', ventas);
        
        if (typeof registrarVentaEnCaja === 'function') {
            registrarVentaEnCaja(numeroMesa, mesa.totalGastado, metodoPago);
        }
        
        if (venta.productos && venta.productos.length > 0) {
            if (typeof descontarInsumosDeVenta === 'function') {
                descontarInsumosDeVenta(venta.productos);
                console.log('📦 Insumos descontados automáticamente');
            }
        }
        
        try {
            // 🔥 MARCAR PEDIDOS COMO COBRADOS (no eliminar)
            await fetch(`${API_PEDIDOS}/mesa/${numeroMesa}/cobrar`, {
                method: 'PUT'
            });
            console.log(`✅ Pedidos de Mesa ${numeroMesa} marcados como COBRADOS`);
            
            // 🔥 LIBERAR MESA EN API
            const response = await fetch(`${API_URL}/${mesa.id}/liberar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al liberar mesa en API');
            }
            
            await cargarMesas();
            renderizarMesas();
            cerrarModal();
            
            let mensaje = `✅ Mesa ${numeroMesa} cobrada: ${formatearMoneda(venta.total)}`;
            
            if (metodoPago === 'Efectivo' && vueltoEntregado > 0) {
                mensaje += `\n💵 Recibido: ${formatearMoneda(montoRecibidoCliente)}`;
                mensaje += `\n🔄 Vuelto: ${formatearMoneda(vueltoEntregado)}`;
            }
            
            if (datosComprobante) {
                mensaje += `\n📄 ${datosComprobante.tipo === 'boleta' ? 'Boleta' : 'Factura'}: ${datosComprobante.completo}`;
            }
            
            mostrarNotificacion(mensaje, 'exito');
            console.log(`💵 Venta registrada: ${venta.id} - ${formatearMoneda(venta.total)} (API)`);
            
        } catch (error) {
            console.error('❌ Error al cobrar:', error);
            mostrarNotificacion('Error al procesar el cobro', 'error');
        }
    }
    
    // ==========================================
    // FUNCIONES DE UTILIDAD
    // ==========================================
    
    function obtenerMesa(numeroMesa) {
        return mesasData.find(m => m.numero === numeroMesa) || null;
    }
    
    function obtenerEstadisticasMesas() {
        const total = mesasData.length;
        const ocupadas = mesasData.filter(m => m.estado === 'ocupada').length;
        const disponibles = mesasData.filter(m => m.estado === 'disponible').length;
        const reservadas = mesasData.filter(m => m.estado === 'reservada').length;
        
        return {
            total,
            ocupadas,
            disponibles,
            reservadas,
            porcentajeOcupacion: total > 0 ? Math.round((ocupadas / total) * 100) : 0
        };
    }
    
    // ==========================================
    // EXPORTAR FUNCIONES GLOBALES
    // ==========================================
    
    window.abrirDetallesMesa = abrirDetallesMesa;
    window.ocuparMesaModal = ocuparMesaModal;
    window.cobrarMesaModal = cobrarMesaModal;
    window.liberarMesa = liberarMesa;
    
    window.agregarMesa = agregarMesa;
    window.actualizarTotalMesa = actualizarTotalMesa;
    window.obtenerMesa = obtenerMesa;
    window.obtenerEstadisticasMesas = obtenerEstadisticasMesas;
    
    window.Mesas = {
        inicializar: inicializar,
        renderizar: renderizarMesas,
        cargar: cargarMesas
    };
    
    console.log('✅ Módulo Mesas cargado (API REST 🔥)');
})();

// ==========================================
// ESTILOS PARA VUELTO
// ==========================================

const estilosMesas = document.createElement('style');
estilosMesas.textContent = `
    .detalle-mesa { padding: 10px; }
    .info-mesa-ocupada { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .info-mesa-ocupada p { margin: 8px 0; }
    .formulario-ocupar { margin: 15px 0; }
    .formulario-cobro { margin: 15px 0; }
    .campo-form { margin-bottom: 15px; }
    .campo-form label { display: block; margin-bottom: 5px; font-weight: 500; color: var(--texto-secundario); }
    .campo-form input, .campo-form select { width: 100%; }
    .select-grande { padding: 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px; }
    .select-grande:focus { border-color: var(--color-primario); outline: none; }
    .seccion-vuelto { background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%); padding: 20px; border-radius: 12px; margin: 15px 0; border: 2px solid #81c784; }
    .input-moneda { position: relative; display: flex; align-items: center; }
    .prefijo-moneda { position: absolute; left: 15px; font-weight: bold; color: #2e7d32; font-size: 18px; }
    .input-monto-grande { width: 100%; padding: 15px 15px 15px 50px !important; font-size: 24px !important; font-weight: bold; text-align: right; border: 2px solid #81c784 !important; border-radius: 8px; }
    .input-monto-grande:focus { border-color: #2e7d32 !important; outline: none; }
    .botones-monto-rapido { display: flex; gap: 8px; flex-wrap: wrap; margin: 15px 0; }
    .btn-monto { flex: 1; min-width: 70px; padding: 10px; border: 2px solid #81c784; background: white; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s ease; }
    .btn-monto:hover { background: #81c784; color: white; }
    .btn-monto-exacto { background: #2e7d32; color: white; border-color: #2e7d32; }
    .btn-monto-exacto:hover { background: #1b5e20; }
    .resultado-vuelto { background: white; padding: 20px; border-radius: 12px; text-align: center; margin-top: 15px; border: 3px solid #e0e0e0; transition: all 0.3s ease; }
    .resultado-vuelto.vuelto-positivo { border-color: #4caf50; background: #e8f5e9; }
    .resultado-vuelto.vuelto-negativo { border-color: #f44336; background: #ffebee; }
    .vuelto-label { font-size: 14px; color: #666; margin-bottom: 5px; font-weight: 600; }
    .vuelto-monto { font-size: 36px; font-weight: bold; color: #2e7d32; }
    .resultado-vuelto.vuelto-negativo .vuelto-monto { color: #f44336; }
    .error-monto { display: flex; align-items: center; gap: 10px; padding: 12px; background: #ffebee; border-radius: 8px; color: #c62828; margin-top: 10px; font-weight: 500; }
    .error-monto i { font-size: 20px; }
    .mensaje-pago-digital { display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); padding: 25px; border-radius: 12px; text-align: center; border: 2px solid #7c4dff; margin: 15px 0; }
    .mensaje-pago-digital i { font-size: 40px; color: #7c4dff; margin-bottom: 10px; }
    .mensaje-pago-digital p { font-size: 18px; margin: 5px 0; color: #333; }
    .mensaje-pago-digital small { color: #666; }
    .mesero-autoasignado { display: flex; align-items: center; gap: 10px; padding: 15px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 8px; border: 2px solid #4caf50; }
    .mesero-autoasignado i { font-size: 24px; color: #2e7d32; }
    .mesero-autoasignado span { font-size: 18px; color: #1b5e20; }
    .mesero-autoasignado small { color: #666; font-style: italic; }
`;
document.head.appendChild(estilosMesas);

console.log('✅ Módulo Mesas listo (API REST + Cobrar sin DELETE 🔥)');