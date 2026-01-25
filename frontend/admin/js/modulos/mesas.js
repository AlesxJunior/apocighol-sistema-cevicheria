(function() {
    'use strict';
    
    const API_URL = 'http://localhost:8085/api';
    let mesasData = [];
    
    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    
    async function inicializar() {
        console.log('📋 Inicializando módulo Mesas...');
        await cargarMesas();
        renderizarMesas();
    }
    
    // ==========================================
    // CARGAR MESAS DESDE BACKEND
    // ==========================================
    
    async function cargarMesas() {
        try {
            const response = await fetch(`${API_URL}/mesas`);
            if (response.ok) {
                mesasData = await response.json();
                console.log('✅ Mesas cargadas:', mesasData.length);
            }
        } catch (error) {
            console.error('❌ Error cargando mesas:', error);
            mesasData = [];
        }
    }
    
    // ==========================================
    // RENDERIZAR MESAS - CORREGIDO
    // ==========================================
    
    function renderizarMesas() {
        const contenedor = document.getElementById('grid-mesas');
        if (!contenedor) return;
        
        if (mesasData.length === 0) {
            contenedor.innerHTML = '<p style="text-align: center; color: #999;">No hay mesas disponibles</p>';
            return;
        }
        
        contenedor.innerHTML = mesasData.map(mesa => {
            const numero = mesa.numeroMesa || mesa.numero;
            const estado = (mesa.estadoMesa || mesa.estado || 'disponible').toLowerCase();
            const personas = mesa.personasActuales || mesa.cantidadPersonas || 0;
            const mesero = mesa.meseroAsignado || mesa.mesero || '';
            const total = parseFloat(mesa.totalConsumoMesa || mesa.totalGastado || 0);
            const hora = mesa.horaOcupacionMesa || mesa.horaInicio || '';
            
            let claseEstado = 'mesa-disponible';
            let colorBorde = '#27ae60';
            let iconoEstado = '✓';
            
            if (estado === 'ocupada') {
                claseEstado = 'mesa-ocupada';
                colorBorde = '#e74c3c';
                iconoEstado = '👥';
            }
            
            // ============================================
            // DISPONIBLE: Solo número y estado (limpio)
            // ============================================
            if (estado === 'disponible') {
                return `
                    <div class="mesa-card ${claseEstado}" onclick="verDetalleMesa(${numero})">
                        <div class="mesa-header" style="border-left: 4px solid ${colorBorde};">
                            <div class="mesa-numero">
                                <i class="fas fa-utensils"></i>
                                Mesa ${numero}
                            </div>
                            <span class="mesa-estado-badge ${claseEstado}">
                                ${iconoEstado} DISPONIBLE
                            </span>
                        </div>
                    </div>
                `;
            }
            
            // ============================================
            // OCUPADA: Toda la info en ORDEN CORRECTO
            // Orden: número → estado → personas → hora → mesero → total
            // ============================================
            return `
                <div class="mesa-card ${claseEstado}" onclick="verDetalleMesa(${numero})">
                    <div class="mesa-header" style="border-left: 4px solid ${colorBorde};">
                        <div class="mesa-numero">
                            <i class="fas fa-utensils"></i>
                            Mesa ${numero}
                        </div>
                        <span class="mesa-estado-badge ${claseEstado}">
                            ${iconoEstado} OCUPADA
                        </span>
                    </div>
                    <div class="mesa-info">
                        <div class="info-item">
                            <i class="fas fa-users"></i>
                            <span>${personas} personas</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span>${hora}</span>
                        </div>
                        ${mesero ? `
                            <div class="info-item">
                                <i class="fas fa-user"></i>
                                <span>${mesero}</span>
                            </div>
                        ` : ''}
                        <div class="info-item" style="font-weight: bold; color: #27ae60;">
                            <i class="fas fa-dollar-sign"></i>
                            <span>S/. ${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // ==========================================
    // VER DETALLE MESA - CONTROL DE BOTONES
    // ==========================================
    
    async function verDetalleMesa(numeroMesa) {
        const sesion = JSON.parse(localStorage.getItem('sesionApocighol') || '{}');
        const rol = sesion.rol;
        
        const mesa = mesasData.find(m => (m.numeroMesa || m.numero) === numeroMesa);
        if (!mesa) return;
        
        const estado = (mesa.estadoMesa || mesa.estado || 'disponible').toLowerCase();
        
        // CAJERO no puede ocupar mesas
        if (rol === 'CAJERO' && estado === 'disponible') {
            mostrarNotificacion('❌ Los cajeros no pueden ocupar mesas.', 'error');
            return;
        }
        
        // ============================================
        // DISPONIBLE: Ir directo a ocupar
        // ============================================
        if (estado === 'disponible' && (rol === 'MESERO' || rol === 'ADMIN')) {
            mostrarFormularioOcupar(numeroMesa, mesa);
            return;
        }
        
        // ============================================
        // OCUPADA: Mostrar detalles y OCULTAR botones pie
        // ============================================
        const numero = mesa.numeroMesa || mesa.numero;
        const personas = mesa.personasActuales || mesa.cantidadPersonas || 0;
        const mesero = mesa.meseroAsignado || mesa.mesero || 'Sin asignar';
        const total = parseFloat(mesa.totalConsumoMesa || mesa.totalGastado || 0);
        const hora = mesa.horaOcupacionMesa || mesa.horaInicio || '';
        
        let contenido = `
            <div style="padding: 20px;">
                <div style="margin-bottom: 20px;">
                    <strong>Estado actual:</strong> 
                    <span style="color: #e74c3c; font-weight: bold;">OCUPADA</span>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong>👥 Personas:</strong> ${personas}
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong>🕐 Hora inicio:</strong> ${hora}
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong>👤 Mesero:</strong> ${mesero}
                </div>
                
                <div style="margin-bottom: 20px;">
                    <strong>💵 Total gastado:</strong> 
                    <span style="color: #27ae60; font-weight: bold;">S/. ${total.toFixed(2)}</span>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    ${(rol === 'CAJERO' || rol === 'ADMIN') ? `
                        <button class="btn btn-exito" onclick="cobrarMesa(${numero})" 
                                style="flex: 1; padding: 12px;">
                            💰 Cobrar
                        </button>
                    ` : ''}
                    ${(rol === 'MESERO' || rol === 'ADMIN') ? `
                        <button class="btn btn-peligro" onclick="liberarMesa(${numero})"
                                style="flex: 1; padding: 12px;">
                            🚪 Liberar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        abrirModal(`Mesa ${numero}`, contenido);
        
        // 🔥 OCULTAR botones del pie para modal OCUPADA
        const modalPie = document.querySelector('.modal-pie');
        if (modalPie) {
            modalPie.style.display = 'none';
        }
    }
    
    // ==========================================
    // OCUPAR MESA - MOSTRAR BOTONES PIE
    // ==========================================
    
    async function mostrarFormularioOcupar(numeroMesa, mesa) {
        const sesion = JSON.parse(localStorage.getItem('sesionApocighol') || '{}');
        const rol = sesion.rol;
        const nombreUsuario = sesion.nombre || 'Usuario';
        
        cerrarModal();
        
        // Cargar meseros desde BD
        let meseros = [];
        try {
            const response = await fetch(`${API_URL}/usuarios`);
            if (response.ok) {
                const usuarios = await response.json();
                meseros = usuarios.filter(u => u.rolUsuario === 'MESERO' || u.rol === 'MESERO');
            }
        } catch (error) {
            console.error('Error cargando meseros:', error);
        }
        
        let contenido = `
            <div style="padding: 20px;">
                <div style="margin-bottom: 20px;">
                    <strong>Estado actual:</strong> 
                    <span style="color: #27ae60; font-weight: bold;">DISPONIBLE</span>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #555;">Cantidad de personas:</label>
                    <input type="number" id="cantidad-personas" min="1" value="2" 
                           style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #555;">Mesero: *</label>
                    ${rol === 'ADMIN' ? `
                        <select id="mesero-mesa" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
                            <option value="">-- Seleccione un mesero --</option>
                            ${meseros.map(m => `
                                <option value="${m.nombreUsuario || m.nombre}">${m.nombreUsuario || m.nombre}</option>
                            `).join('')}
                            <option value="${nombreUsuario}">Administrador del Sistema</option>
                        </select>
                    ` : `
                        <input type="text" id="mesero-mesa" value="${nombreUsuario}" readonly 
                               style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; background: #f5f5f5; color: #666;">
                    `}
                </div>
            </div>
        `;
        
        abrirModal(`Mesa ${numeroMesa}`, contenido, function() {
            confirmarOcuparMesa(numeroMesa);
        });
        
        // 🔥 MOSTRAR botones del pie para modal OCUPAR
        const modalPie = document.querySelector('.modal-pie');
        if (modalPie) {
            modalPie.style.display = 'flex';
        }
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.textContent = 'Ocupar Mesa';
        }
    }
    
    // ==========================================
    // CONFIRMAR OCUPAR MESA
    // ==========================================
    
    async function confirmarOcuparMesa(numeroMesa) {
        const personas = parseInt(document.getElementById('cantidad-personas').value);
        const meseroElement = document.getElementById('mesero-mesa');
        const mesero = meseroElement.tagName === 'SELECT' ? 
                       meseroElement.value : 
                       meseroElement.value;
        
        if (!personas || personas < 1) {
            mostrarNotificacion('❌ Ingresa la cantidad de personas', 'error');
            return;
        }
        
        if (!mesero) {
            mostrarNotificacion('❌ Selecciona un mesero', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/mesas/${numeroMesa}/ocupar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ personas, mesero })
            });
            
            if (response.ok) {
                cerrarModal();
                await cargarMesas();
                renderizarMesas();
                mostrarNotificacion(`✅ Mesa ${numeroMesa} ocupada por ${mesero}`, 'exito');
            } else {
                const error = await response.json();
                mostrarNotificacion(error.error || 'Error al ocupar mesa', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('❌ Error al ocupar mesa', 'error');
        }
    }
    
    // ==========================================
    // COBRAR MESA - CORREGIDO
    // ==========================================
    
    async function cobrarMesa(numeroMesa) {
        const mesa = mesasData.find(m => (m.numeroMesa || m.numero) === numeroMesa);
        if (!mesa) return;
        
        const total = parseFloat(mesa.totalConsumoMesa || mesa.totalGastado || 0);
        
        const sesion = JSON.parse(localStorage.getItem('sesionApocighol') || '{}');
        const rol = sesion.rol;
        
        if (rol !== 'CAJERO' && rol !== 'ADMIN') {
            mostrarNotificacion('❌ Solo cajeros y administradores pueden cobrar', 'error');
            return;
        }
        
        // Verificar caja abierta
        let cajaAbierta = false;
        try {
            const response = await fetch(`${API_URL}/caja/estado`);
            if (response.ok) {
                const data = await response.json();
                cajaAbierta = data.cajaAbierta;
            }
        } catch (error) {
            console.error('Error verificando caja:', error);
        }
        
        if (!cajaAbierta) {
            mostrarNotificacion('⚠️ No hay caja abierta. Abre la caja primero en el módulo Caja.', 'error');
            return;
        }
        
        // Validar que TODOS los pedidos estén SERVIDOS
        try {
            const validacion = await fetch(`${API_URL}/mesas/${numeroMesa}/puede-cobrar`);
            if (validacion.ok) {
                const resultado = await validacion.json();
                if (!resultado.puedeCobrar) {
                    mostrarNotificacion(`❌ ${resultado.mensaje || 'Hay pedidos sin servir'}`, 'error');
                    return;
                }
            }
        } catch (error) {
            console.error('Error validando pedidos:', error);
            mostrarNotificacion('❌ Error al validar pedidos. Verifica que todos estén servidos.', 'error');
            return;
        }
        
        cerrarModal();
        
        let contenido = `
            <div class="formulario-cobro">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3>Mesa ${numeroMesa}</h3>
                    <p style="font-size: 28px; font-weight: bold; color: var(--color-exito);">
                        Total: S/. ${total.toFixed(2)}
                    </p>
                </div>
                
                <div class="campo-form">
                    <label>Método de Pago: *</label>
                    <select id="metodo-pago-cobro" class="select-grande" onchange="mostrarCamposEfectivo()">
                        <option value="Efectivo">💵 Efectivo</option>
                        <option value="Yape">📱 Yape</option>
                        <option value="Plin">📱 Plin</option>
                        <option value="Tarjeta">💳 Tarjeta</option>
                    </select>
                </div>
                
                <div id="campos-efectivo">
                    <div class="campo-form">
                        <label>Monto Recibido:</label>
                        <input type="number" id="monto-recibido" min="0" step="0.01" 
                               value="${total.toFixed(2)}" onchange="calcularVuelto(${total})">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 10px 0;">
                        <button onclick="setMontoRecibido(10, ${total})" class="btn-billete">S/. 10</button>
                        <button onclick="setMontoRecibido(20, ${total})" class="btn-billete">S/. 20</button>
                        <button onclick="setMontoRecibido(50, ${total})" class="btn-billete">S/. 50</button>
                        <button onclick="setMontoRecibido(100, ${total})" class="btn-billete">S/. 100</button>
                        <button onclick="setMontoRecibido(${total}, ${total})" class="btn-billete">Exacto</button>
                    </div>
                    
                    <div class="campo-form">
                        <label>Vuelto:</label>
                        <input type="text" id="vuelto-cobro" value="S/. 0.00" readonly 
                               style="background: #e8f5e9; font-size: 20px; font-weight: bold; color: #27ae60;">
                    </div>
                </div>
            </div>
        `;
        
        abrirModal(`💰 Cobrar Mesa ${numeroMesa}`, contenido, function() {
            confirmarCobro(numeroMesa, total);
        });
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Confirmar Cobro';
        }
    }
    
    // ==========================================
    // FUNCIONES AUXILIARES COBRO
    // ==========================================
    
    function mostrarCamposEfectivo() {
        const metodo = document.getElementById('metodo-pago-cobro').value;
        const camposEfectivo = document.getElementById('campos-efectivo');
        if (camposEfectivo) {
            camposEfectivo.style.display = metodo === 'Efectivo' ? 'block' : 'none';
        }
    }
    
    function setMontoRecibido(monto, total) {
        const input = document.getElementById('monto-recibido');
        if (input) {
            input.value = monto;
            calcularVuelto(total);
        }
    }
    
    function calcularVuelto(total) {
        const recibido = parseFloat(document.getElementById('monto-recibido').value) || 0;
        const vuelto = recibido - total;
        const vueltoInput = document.getElementById('vuelto-cobro');
        if (vueltoInput) {
            vueltoInput.value = `S/. ${Math.max(0, vuelto).toFixed(2)}`;
        }
    }
    
    async function confirmarCobro(numeroMesa, total) {
        const metodo = document.getElementById('metodo-pago-cobro').value;
        const sesion = JSON.parse(localStorage.getItem('sesionApocighol') || '{}');
        
        let montoRecibido = total;
        let vuelto = 0;
        
        if (metodo === 'Efectivo') {
            montoRecibido = parseFloat(document.getElementById('monto-recibido').value);
            if (montoRecibido < total) {
                mostrarNotificacion('❌ El monto recibido es menor al total', 'error');
                return;
            }
            vuelto = montoRecibido - total;
        }
        
        try {
            const response = await fetch(`${API_URL}/caja/venta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    monto: total,
                    metodoPago: metodo,
                    montoRecibido: montoRecibido,
                    vuelto: vuelto,
                    registradoPor: sesion.nombre || 'Sistema',
                    numeroMesa: numeroMesa
                })
            });
            
            if (response.ok) {
                // Actualizar pedidos a COBRADO
                await fetch(`${API_URL}/pedidos/mesa/${numeroMesa}/cobrar`, { method: 'PUT' });
                
                // Liberar mesa
                await fetch(`${API_URL}/mesas/${numeroMesa}/liberar`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ motivo: 'Cobro realizado' })
                });
                
                cerrarModal();
                await cargarMesas();
                renderizarMesas();
                
                mostrarNotificacion(`✅ Cobro registrado. Vuelto: S/. ${vuelto.toFixed(2)}`, 'exito');
            } else {
                mostrarNotificacion('❌ Error al registrar cobro', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('❌ Error al procesar cobro', 'error');
        }
    }
    
    // ==========================================
    // LIBERAR MESA - CORREGIDO CON BOTONES
    // ==========================================
    
    async function liberarMesa(numeroMesa) {
        const mesa = mesasData.find(m => (m.numeroMesa || m.numero) === numeroMesa);
        if (!mesa) return;
        
        cerrarModal();
        
        let contenido = `
            <div class="formulario-mesa">
                <p style="margin-bottom: 20px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle"></i> 
                    ¿Estás seguro de liberar la Mesa ${numeroMesa}?
                </p>
                <div class="campo-form">
                    <label>Motivo de liberación: *</label>
                    <textarea id="motivo-liberacion" rows="3" 
                              placeholder="Ej: Cliente se fue sin pagar, canceló pedido, etc."
                              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"></textarea>
                </div>
                <p style="font-size: 13px; color: #666; margin-top: 10px;">
                    * Se perderá toda la información de la mesa
                </p>
            </div>
        `;
        
        abrirModal(`Liberar Mesa ${numeroMesa}`, contenido, function() {
            confirmarLiberarMesa(numeroMesa);
        });
        
        // 🔥 MOSTRAR botones del pie para modal LIBERAR
        const modalPie = document.querySelector('.modal-pie');
        if (modalPie) {
            modalPie.style.display = 'flex';
        }
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-door-open"></i> Liberar Mesa';
            btnConfirmar.className = 'btn btn-peligro';
        }
    }
    
    async function confirmarLiberarMesa(numeroMesa) {
        const motivo = document.getElementById('motivo-liberacion').value.trim();
        
        if (!motivo) {
            mostrarNotificacion('❌ Debes indicar el motivo de liberación', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/mesas/${numeroMesa}/liberar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ motivo: motivo })
            });
            
            if (response.ok) {
                cerrarModal();
                await cargarMesas();
                renderizarMesas();
                mostrarNotificacion(`✅ Mesa ${numeroMesa} liberada`, 'exito');
            } else {
                mostrarNotificacion('❌ Error al liberar mesa', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('❌ Error al liberar mesa', 'error');
        }
    }
    
    // ==========================================
    // AGREGAR NUEVA MESA
    // ==========================================
    
    async function agregarMesa() {
        cerrarModal();
        
        let contenido = `
            <div class="formulario-mesa">
                <div class="campo-form">
                    <label>Número de Mesa: *</label>
                    <input type="number" id="numero-mesa-nueva" min="1" placeholder="Ej: 16">
                </div>
                <div class="campo-form">
                    <label>Capacidad: *</label>
                    <input type="number" id="capacidad-mesa-nueva" min="1" max="20" value="4">
                </div>
            </div>
        `;
        
        abrirModal('Nueva Mesa', contenido, function() {
            confirmarAgregarMesa();
        });
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-plus"></i> Crear Mesa';
        }
    }
    
    async function confirmarAgregarMesa() {
        const numero = parseInt(document.getElementById('numero-mesa-nueva').value);
        const capacidad = parseInt(document.getElementById('capacidad-mesa-nueva').value);
        
        if (!numero || numero < 1) {
            mostrarNotificacion('❌ Ingresa un número de mesa válido', 'error');
            return;
        }
        
        if (!capacidad || capacidad < 1) {
            mostrarNotificacion('❌ Ingresa una capacidad válida', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/mesas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numeroMesa: numero,
                    capacidadMesa: capacidad,
                    estadoMesa: 'disponible'
                })
            });
            
            if (response.ok) {
                cerrarModal();
                await cargarMesas();
                renderizarMesas();
                mostrarNotificacion(`✅ Mesa ${numero} creada`, 'exito');
            } else {
                const error = await response.json();
                mostrarNotificacion(error.error || 'Error al crear mesa', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('❌ Error al crear mesa', 'error');
        }
    }
    
    // ==========================================
    // EXPORTAR FUNCIONES AL SCOPE GLOBAL
    // ==========================================
    
    window.Mesas = {
        inicializar
    };
    
    window.verDetalleMesa = verDetalleMesa;
    window.mostrarFormularioOcupar = mostrarFormularioOcupar;
    window.cobrarMesa = cobrarMesa;
    window.liberarMesa = liberarMesa;
    window.mostrarCamposEfectivo = mostrarCamposEfectivo;
    window.setMontoRecibido = setMontoRecibido;
    window.calcularVuelto = calcularVuelto;
    window.agregarMesa = agregarMesa;
    
    console.log('✅ Módulo Mesas cargado correctamente');
})();