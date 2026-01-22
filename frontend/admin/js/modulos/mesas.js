/* ==========================================
   MESAS.JS - CONECTADO CON BACKEND
   🔥 COBRO REGISTRA EN CAJA VIA API
   ========================================== */

(function() {
    const API_URL = 'http://localhost:8085/api';
    let mesasData = [];
    
    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    
    async function inicializar() {
        console.log('🪑 Inicializando módulo Mesas...');
        await cargarMesas();
        renderizarMesas();
        console.log('✅ Módulo Mesas inicializado');
    }
    
    async function cargarMesas() {
        try {
            const response = await fetch(`${API_URL}/mesas`);
            if (response.ok) {
                mesasData = await response.json();
                console.log(`📊 ${mesasData.length} mesas cargadas`);
            } else {
                mesasData = crearMesasPorDefecto();
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mesasData = crearMesasPorDefecto();
        }
    }
    
    function crearMesasPorDefecto() {
        const mesas = [];
        for (let i = 1; i <= 15; i++) {
            mesas.push({
                idMesa: i, numeroMesa: i, capacidadMesa: 4,
                estadoMesa: 'disponible', cantidadPersonas: 0,
                mesero: null, horaInicio: null, totalConsumoMesa: 0
            });
        }
        return mesas;
    }
    
    // ==========================================
    // RENDERIZADO
    // ==========================================
    
    function renderizarMesas() {
        const contenedor = document.getElementById('grid-mesas');
        if (!contenedor) return;
        contenedor.innerHTML = mesasData.map(mesa => crearTarjetaMesa(mesa)).join('');
    }
    
    function crearTarjetaMesa(mesa) {
        const numero = mesa.numeroMesa || mesa.numero;
        const estado = mesa.estadoMesa || mesa.estado || 'disponible';
        const personas = mesa.cantidadPersonas || 0;
        const total = parseFloat(mesa.totalConsumoMesa || mesa.totalGastado || 0);
        const horaInicio = mesa.horaInicio;
        
        let tiempoStr = '';
        if (horaInicio && estado === 'ocupada') {
            tiempoStr = calcularTiempoTranscurrido(horaInicio);
        }
        
        const claseEstado = estado === 'ocupada' ? 'mesa-ocupada' : 
                           estado === 'reservada' ? 'mesa-reservada' : 'mesa-disponible';
        
        return `
            <div class="tarjeta-mesa ${claseEstado}" onclick="verDetalleMesa(${numero})">
                <div class="mesa-header">
                    <i class="fas fa-utensils"></i>
                    <span class="numero-mesa">Mesa ${numero}</span>
                </div>
                <div class="mesa-estado">
                    <span class="badge-estado badge-${estado}">${estado.toUpperCase()}</span>
                </div>
                ${estado === 'ocupada' ? `
                    <div class="mesa-info">
                        <p><i class="fas fa-users"></i> ${personas} personas</p>
                        ${tiempoStr ? `<p><i class="fas fa-clock"></i> ${tiempoStr}</p>` : ''}
                        <p class="mesa-total">$ S/. ${total.toFixed(2)}</p>
                    </div>
                ` : `
                    <div class="mesa-info">
                        <p><i class="fas fa-chair"></i> Capacidad: ${mesa.capacidadMesa || 4}</p>
                    </div>
                `}
            </div>
        `;
    }
    
    function calcularTiempoTranscurrido(horaInicio) {
        if (!horaInicio) return '';
        const ahora = new Date();
        let inicio;
        if (typeof horaInicio === 'string') {
            if (horaInicio.includes('T')) {
                inicio = new Date(horaInicio);
            } else {
                const [h, m, s] = horaInicio.split(':');
                inicio = new Date();
                inicio.setHours(parseInt(h), parseInt(m), parseInt(s) || 0);
            }
        } else {
            inicio = new Date(horaInicio);
        }
        const diff = Math.floor((ahora - inicio) / 1000);
        const horas = Math.floor(diff / 3600);
        const minutos = Math.floor((diff % 3600) / 60);
        const segundos = diff % 60;
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    }
    
    // ==========================================
    // VER DETALLE DE MESA
    // ==========================================
    
    async function verDetalleMesa(numeroMesa) {
        const mesa = mesasData.find(m => (m.numeroMesa || m.numero) === numeroMesa);
        if (!mesa) {
            mostrarNotificacion('Mesa no encontrada', 'error');
            return;
        }
        
        const estado = mesa.estadoMesa || mesa.estado || 'disponible';
        
        if (estado === 'disponible') {
            mostrarFormularioOcupar(numeroMesa, mesa);
        } else if (estado === 'ocupada') {
            mostrarDetalleMesaOcupada(numeroMesa, mesa);
        }
    }
    
    // ==========================================
    // OCUPAR MESA
    // ==========================================
    
    function mostrarFormularioOcupar(numeroMesa, mesa) {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        
        let contenido = `
            <div class="formulario-mesa">
                <div class="campo-form">
                    <label>Cantidad de Personas: *</label>
                    <input type="number" id="cantidad-personas" min="1" max="${mesa.capacidadMesa || 8}" value="2">
                </div>
                <div class="campo-form">
                    <label>Mesero Responsable:</label>
                    <input type="text" id="mesero-mesa" value="${usuario.nombreCompleto || 'Sin asignar'}" readonly>
                </div>
            </div>
        `;
        
        abrirModal(`Ocupar Mesa ${numeroMesa}`, contenido, function() {
            confirmarOcuparMesa(numeroMesa);
        });
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Ocupar';
        }
    }
    
    async function confirmarOcuparMesa(numeroMesa) {
        const cantidadPersonas = parseInt(document.getElementById('cantidad-personas').value);
        const mesero = document.getElementById('mesero-mesa').value;
        
        if (!cantidadPersonas || cantidadPersonas < 1) {
            mostrarNotificacion('Ingresa la cantidad de personas', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/mesas/${numeroMesa}/ocupar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cantidadPersonas, mesero })
            });
            
            if (response.ok) {
                cerrarModal();
                await cargarMesas();
                renderizarMesas();
                mostrarNotificacion(`Mesa ${numeroMesa} ocupada`, 'exito');
            } else {
                const error = await response.json();
                mostrarNotificacion(error.error || 'Error al ocupar mesa', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            actualizarMesaLocal(numeroMesa, {
                estadoMesa: 'ocupada', cantidadPersonas, mesero,
                horaInicio: new Date().toISOString(), totalConsumoMesa: 0
            });
            cerrarModal();
            renderizarMesas();
            mostrarNotificacion(`Mesa ${numeroMesa} ocupada`, 'exito');
        }
    }
    
    // ==========================================
    // DETALLE MESA OCUPADA
    // ==========================================
    
    async function mostrarDetalleMesaOcupada(numeroMesa, mesa) {
        const total = parseFloat(mesa.totalConsumoMesa || mesa.totalGastado || 0);
        const personas = mesa.cantidadPersonas || 0;
        const mesero = mesa.mesero || 'Sin asignar';
        
        let pedidosHtml = '<p style="color: #999;">No hay pedidos</p>';
        
        try {
            const response = await fetch(`${API_URL}/pedidos/mesa/${numeroMesa}`);
            if (response.ok) {
                const pedidos = await response.json();
                const pendientes = pedidos.filter(p => p.estadoPedido !== 'PAGADO' && p.estadoPedido !== 'CANCELADO');
                if (pendientes.length > 0) {
                    pedidosHtml = pendientes.map(p => `
                        <div class="pedido-item">
                            <span>${p.codigoPedido}</span>
                            <span class="badge badge-${p.estadoPedido.toLowerCase()}">${p.estadoPedido}</span>
                            <span>S/. ${parseFloat(p.totalPedido).toFixed(2)}</span>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error cargando pedidos:', error);
        }
        
        let contenido = `
            <div class="detalle-mesa">
                <div class="mesa-resumen">
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <span>${personas} personas</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-user-tie"></i>
                        <span>${mesero}</span>
                    </div>
                    <div class="info-item total">
                        <i class="fas fa-dollar-sign"></i>
                        <span>S/. ${total.toFixed(2)}</span>
                    </div>
                </div>
                
                <h4>Pedidos de la Mesa:</h4>
                <div class="lista-pedidos">${pedidosHtml}</div>
                
                <div class="acciones-mesa" style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn btn-primario" onclick="nuevoPedidoMesa(${numeroMesa})">
                        <i class="fas fa-plus"></i> Nuevo Pedido
                    </button>
                    ${total > 0 ? `
                        <button class="btn btn-exito" onclick="cobrarMesa(${numeroMesa})">
                            <i class="fas fa-cash-register"></i> Cobrar
                        </button>
                    ` : ''}
                    <button class="btn btn-peligro" onclick="liberarMesa(${numeroMesa})">
                        <i class="fas fa-times"></i> Liberar
                    </button>
                </div>
            </div>
        `;
        
        abrirModal(`Mesa ${numeroMesa} - Ocupada`, contenido, null);
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) btnConfirmar.style.display = 'none';
    }
    
    function nuevoPedidoMesa(numeroMesa) {
        cerrarModal();
        localStorage.setItem('mesaParaPedido', numeroMesa);
        if (typeof cambiarSeccion === 'function') {
            cambiarSeccion('pedidos');
        } else {
            mostrarNotificacion('Ir a Pedidos para crear nuevo pedido', 'info');
        }
    }
    
    // ==========================================
    // 🔥 COBRAR MESA - REGISTRA EN CAJA
    // ==========================================
    
    async function cobrarMesa(numeroMesa) {
        const mesa = mesasData.find(m => (m.numeroMesa || m.numero) === numeroMesa);
        if (!mesa) {
            mostrarNotificacion('Mesa no encontrada', 'error');
            return;
        }
        
        const total = parseFloat(mesa.totalConsumoMesa || mesa.totalGastado || 0);
        
        if (total <= 0) {
            mostrarNotificacion('La mesa no tiene consumo registrado', 'error');
            return;
        }
        
        // 🔥 Verificar si hay caja abierta
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
    // 🔥 CONFIRMAR COBRO - REGISTRA EN CAJA API
    // ==========================================
    
    async function confirmarCobro(numeroMesa, total) {
        const metodoPago = document.getElementById('metodo-pago-cobro').value;
        const montoRecibido = parseFloat(document.getElementById('monto-recibido')?.value || total);
        const vuelto = Math.max(0, montoRecibido - total);
        
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        const registradoPor = usuario.nombreCompleto || 'Sistema';
        
        if (metodoPago === 'Efectivo' && montoRecibido < total) {
            mostrarNotificacion('El monto recibido es menor al total', 'error');
            return;
        }
        
        try {
            // 🔥 1. REGISTRAR VENTA EN CAJA (BACKEND)
            const ventaResponse = await fetch(`${API_URL}/caja/venta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numeroMesa: numeroMesa,
                    monto: total,
                    metodoPago: metodoPago,
                    montoRecibido: metodoPago === 'Efectivo' ? montoRecibido : total,
                    vuelto: metodoPago === 'Efectivo' ? vuelto : 0,
                    registradoPor: registradoPor
                })
            });
            
            if (!ventaResponse.ok) {
                const error = await ventaResponse.json();
                throw new Error(error.error || 'Error al registrar venta en caja');
            }
            
            console.log('✅ Venta registrada en caja');
            
            // 🔥 2. MARCAR PEDIDOS COMO PAGADOS
            try {
                const pedidosResponse = await fetch(`${API_URL}/pedidos/mesa/${numeroMesa}`);
                if (pedidosResponse.ok) {
                    const pedidos = await pedidosResponse.json();
                    for (const pedido of pedidos) {
                        if (pedido.estadoPedido !== 'PAGADO' && pedido.estadoPedido !== 'CANCELADO') {
                            await fetch(`${API_URL}/pedidos/${pedido.idPedido}/pagar`, { method: 'PUT' });
                        }
                    }
                }
            } catch (e) {
                console.error('Error marcando pedidos:', e);
            }
            
            // 🔥 3. LIBERAR LA MESA
            await fetch(`${API_URL}/mesas/${numeroMesa}/liberar`, { method: 'PUT' });
            
            cerrarModal();
            await cargarMesas();
            renderizarMesas();
            
            let mensaje = `✅ Mesa ${numeroMesa} cobrada: S/. ${total.toFixed(2)} (${metodoPago})`;
            if (metodoPago === 'Efectivo' && vuelto > 0) {
                mensaje += `\n💰 Vuelto: S/. ${vuelto.toFixed(2)}`;
            }
            mostrarNotificacion(mensaje, 'exito');
            
            console.log(`💵 Cobro completado: Mesa ${numeroMesa} - S/. ${total.toFixed(2)}`);
            
        } catch (error) {
            console.error('❌ Error en cobro:', error);
            mostrarNotificacion(error.message || 'Error al procesar cobro', 'error');
        }
    }
    
    function mostrarCamposEfectivo() {
        const metodo = document.getElementById('metodo-pago-cobro').value;
        const campos = document.getElementById('campos-efectivo');
        if (campos) {
            campos.style.display = metodo === 'Efectivo' ? 'block' : 'none';
        }
    }
    
    function calcularVuelto(total) {
        const montoRecibido = parseFloat(document.getElementById('monto-recibido').value) || 0;
        const vuelto = Math.max(0, montoRecibido - total);
        document.getElementById('vuelto-cobro').value = `S/. ${vuelto.toFixed(2)}`;
    }
    
    // ==========================================
    // LIBERAR MESA
    // ==========================================
    
    async function liberarMesa(numeroMesa) {
        if (!confirm(`¿Liberar Mesa ${numeroMesa}? Se perderá la información.`)) return;
        
        try {
            await fetch(`${API_URL}/mesas/${numeroMesa}/liberar`, { method: 'PUT' });
            cerrarModal();
            await cargarMesas();
            renderizarMesas();
            mostrarNotificacion(`Mesa ${numeroMesa} liberada`, 'exito');
        } catch (error) {
            console.error('❌ Error:', error);
            actualizarMesaLocal(numeroMesa, {
                estadoMesa: 'disponible', cantidadPersonas: 0,
                mesero: null, horaInicio: null, totalConsumoMesa: 0
            });
            cerrarModal();
            renderizarMesas();
            mostrarNotificacion(`Mesa ${numeroMesa} liberada`, 'exito');
        }
    }
    
    function actualizarMesaLocal(numeroMesa, datos) {
        const mesa = mesasData.find(m => (m.numeroMesa || m.numero) === numeroMesa);
        if (mesa) Object.assign(mesa, datos);
    }
    
    // ==========================================
    // EXPORTAR
    // ==========================================
    
    window.verDetalleMesa = verDetalleMesa;
    window.cobrarMesa = cobrarMesa;
    window.confirmarCobro = confirmarCobro;
    window.liberarMesa = liberarMesa;
    window.nuevoPedidoMesa = nuevoPedidoMesa;
    window.mostrarCamposEfectivo = mostrarCamposEfectivo;
    window.calcularVuelto = calcularVuelto;
    
    window.Mesas = { inicializar, cargarMesas, renderizarMesas };
    
    console.log('✅ Módulo Mesas cargado - API REST');
})();

const estilosMesas = document.createElement('style');
estilosMesas.textContent = `.grid-mesas{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:20px;margin-top:20px}.tarjeta-mesa{background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1);cursor:pointer;transition:all .3s;border:3px solid transparent}.tarjeta-mesa:hover{transform:translateY(-5px);box-shadow:0 4px 15px rgba(0,0,0,.15)}.mesa-disponible{border-color:#27ae60}.mesa-ocupada{border-color:#e74c3c;background:#fff5f5}.mesa-reservada{border-color:#f39c12}.mesa-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}.mesa-header i{font-size:20px;color:var(--color-primario)}.numero-mesa{font-size:18px;font-weight:bold}.mesa-estado{margin:10px 0}.badge-estado{padding:5px 12px;border-radius:20px;font-size:12px;font-weight:bold}.badge-disponible{background:#d4edda;color:#155724}.badge-ocupada{background:#f8d7da;color:#721c24}.badge-reservada{background:#fff3cd;color:#856404}.mesa-info{margin-top:15px}.mesa-info p{margin:5px 0;font-size:14px;color:#666}.mesa-total{font-size:18px!important;font-weight:bold;color:var(--color-primario)!important}.detalle-mesa{padding:10px}.mesa-resumen{display:flex;justify-content:space-around;margin-bottom:20px;padding:15px;background:#f8f9fa;border-radius:10px}.info-item{display:flex;flex-direction:column;align-items:center;gap:5px}.info-item i{font-size:20px;color:var(--color-primario)}.info-item.total span{font-size:24px;font-weight:bold;color:var(--color-exito)}.lista-pedidos{max-height:200px;overflow-y:auto}.pedido-item{display:flex;justify-content:space-between;align-items:center;padding:10px;margin:5px 0;background:#f8f9fa;border-radius:8px}.formulario-cobro{padding:10px}.select-grande{font-size:16px;padding:12px}`;
document.head.appendChild(estilosMesas);