/* ==========================================
   DASHBOARD.JS - CONECTADO CON BACKEND
   🔥 LEE DATOS DESDE API
   ========================================== */

(function() {
    const API_URL = 'http://localhost:8085/api';
    
    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    
    async function inicializar() {
        console.log('📊 Inicializando Dashboard...');
        
        await cargarEstadisticas();
        await cargarMesasOcupadas();
        await cargarPedidosActivos();
        
        // Actualizar cada 30 segundos
        setInterval(async () => {
            await cargarEstadisticas();
            await cargarMesasOcupadas();
            await cargarPedidosActivos();
        }, 30000);
        
        console.log('✅ Dashboard inicializado');
    }
    
    // ==========================================
    // 🔥 CARGAR ESTADÍSTICAS DESDE API
    // ==========================================
    
    async function cargarEstadisticas() {
        try {
            // 1. Obtener ventas de caja
            let ventasHoy = 0;
            try {
                const cajaResponse = await fetch(`${API_URL}/caja/estadisticas`);
                if (cajaResponse.ok) {
                    const cajaData = await cajaResponse.json();
                    ventasHoy = parseFloat(cajaData.ventasHoy || cajaData.totalVentas || 0);
                }
            } catch (e) {
                console.error('Error cargando caja:', e);
            }
            
            // 2. Obtener mesas ocupadas
            let mesasOcupadas = 0;
            let totalMesas = 15;
            try {
                const mesasResponse = await fetch(`${API_URL}/mesas`);
                if (mesasResponse.ok) {
                    const mesas = await mesasResponse.json();
                    totalMesas = mesas.length;
                    mesasOcupadas = mesas.filter(m => 
                        (m.estadoMesa || m.estado) === 'ocupada'
                    ).length;
                }
            } catch (e) {
                console.error('Error cargando mesas:', e);
            }
            
            // 3. Obtener pedidos activos
            let pedidosActivos = 0;
            try {
                const pedidosResponse = await fetch(`${API_URL}/pedidos/hoy`);
                if (pedidosResponse.ok) {
                    const pedidos = await pedidosResponse.json();
                    pedidosActivos = pedidos.length;
                }
            } catch (e) {
                console.error('Error cargando pedidos:', e);
            }
            
            // 4. Calcular ticket promedio
            let ticketPromedio = 0;
            if (pedidosActivos > 0 && ventasHoy > 0) {
                ticketPromedio = ventasHoy / pedidosActivos;
            }
            
            // Actualizar UI
            actualizarTarjeta('ventas-hoy', `S/. ${ventasHoy.toFixed(2)}`);
            actualizarTarjeta('mesas-ocupadas', `${mesasOcupadas}/${totalMesas}`);
            actualizarTarjeta('pedidos-activos', pedidosActivos);
            actualizarTarjeta('ticket-promedio', `S/. ${ticketPromedio.toFixed(2)}`);
            
        } catch (error) {
            console.error('❌ Error cargando estadísticas:', error);
        }
    }
    
    function actualizarTarjeta(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }
    
    // ==========================================
    // CARGAR MESAS OCUPADAS
    // ==========================================
    
    async function cargarMesasOcupadas() {
        const contenedor = document.getElementById('lista-mesas-ocupadas');
        if (!contenedor) return;
        
        try {
            const response = await fetch(`${API_URL}/mesas`);
            if (response.ok) {
                const mesas = await response.json();
                const ocupadas = mesas.filter(m => (m.estadoMesa || m.estado) === 'ocupada');
                
                if (ocupadas.length === 0) {
                    contenedor.innerHTML = '<p class="sin-datos">No hay mesas ocupadas</p>';
                    return;
                }
                
                contenedor.innerHTML = ocupadas.map(mesa => {
                    const numero = mesa.numeroMesa || mesa.numero;
                    const mesero = mesa.mesero || 'Sin asignar';
                    const personas = mesa.cantidadPersonas || 0;
                    const total = parseFloat(mesa.totalConsumoMesa || mesa.totalGastado || 0);
                    const tiempo = calcularTiempo(mesa.horaInicio);
                    
                    return `
                        <div class="item-mesa-ocupada">
                            <div class="mesa-info">
                                <i class="fas fa-utensils"></i>
                                <strong>Mesa ${numero}</strong>
                            </div>
                            <div class="mesa-detalles">
                                <span><i class="fas fa-user"></i> ${mesero}</span>
                                <span><i class="fas fa-users"></i> ${personas} personas</span>
                                <span><i class="fas fa-clock"></i> ${tiempo}</span>
                            </div>
                            <div class="mesa-total">S/. ${total.toFixed(2)}</div>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('Error cargando mesas:', error);
            contenedor.innerHTML = '<p class="sin-datos">Error al cargar mesas</p>';
        }
    }
    
    function calcularTiempo(horaInicio) {
        if (!horaInicio) return '0 min';
        
        const ahora = new Date();
        let inicio;
        
        if (typeof horaInicio === 'string') {
            if (horaInicio.includes('T')) {
                inicio = new Date(horaInicio);
            } else {
                const [h, m] = horaInicio.split(':');
                inicio = new Date();
                inicio.setHours(parseInt(h), parseInt(m), 0);
            }
        } else {
            inicio = new Date(horaInicio);
        }
        
        const diffMinutos = Math.floor((ahora - inicio) / 60000);
        
        if (diffMinutos < 60) {
            return `${diffMinutos} min`;
        } else {
            const horas = Math.floor(diffMinutos / 60);
            const mins = diffMinutos % 60;
            return `${horas}h ${mins}m`;
        }
    }
    
    // ==========================================
    // CARGAR PEDIDOS ACTIVOS
    // ==========================================
    
    async function cargarPedidosActivos() {
        const contenedor = document.getElementById('lista-pedidos-activos');
        if (!contenedor) return;
        
        try {
            const response = await fetch(`${API_URL}/pedidos/hoy`);
            if (response.ok) {
                const pedidos = await response.json();
                
                // Ordenar por hora más reciente
                pedidos.sort((a, b) => {
                    const horaA = a.horaPedido || '00:00';
                    const horaB = b.horaPedido || '00:00';
                    return horaB.localeCompare(horaA);
                });
                
                // Mostrar últimos 10
                const ultimos = pedidos.slice(0, 10);
                
                if (ultimos.length === 0) {
                    contenedor.innerHTML = '<p class="sin-datos">No hay pedidos hoy</p>';
                    return;
                }
                
                contenedor.innerHTML = ultimos.map(pedido => {
                    const estado = pedido.estadoPedido || 'PENDIENTE';
                    const mesa = pedido.numeroMesa || 'N/A';
                    const mesero = pedido.mesero || 'Sin asignar';
                    const total = parseFloat(pedido.totalPedido || 0);
                    const hora = pedido.horaPedido ? pedido.horaPedido.substring(0, 5) : '--:--';
                    
                    let claseEstado = 'badge-secundario';
                    if (estado === 'PENDIENTE') claseEstado = 'badge-warning';
                    else if (estado === 'PREPARANDO') claseEstado = 'badge-info';
                    else if (estado === 'SERVIDO' || estado === 'ENTREGADO') claseEstado = 'badge-success';
                    else if (estado === 'PAGADO' || estado === 'COBRADO') claseEstado = 'badge-primary';
                    else if (estado === 'CANCELADO') claseEstado = 'badge-danger';
                    
                    return `
                        <div class="item-pedido-activo">
                            <div class="pedido-codigo">
                                <i class="fas fa-receipt"></i>
                                <span>${pedido.codigoPedido || 'PED-???'}</span>
                                <span class="badge ${claseEstado}">${estado}</span>
                            </div>
                            <div class="pedido-detalles">
                                <span><i class="fas fa-utensils"></i> Mesa ${mesa}</span>
                                <span><i class="fas fa-user"></i> ${mesero}</span>
                                <span><i class="fas fa-clock"></i> ${hora}</span>
                            </div>
                            <div class="pedido-total">S/. ${total.toFixed(2)}</div>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('Error cargando pedidos:', error);
            contenedor.innerHTML = '<p class="sin-datos">Error al cargar pedidos</p>';
        }
    }
    
    // ==========================================
    // EXPORTAR
    // ==========================================
    
    window.Dashboard = {
        inicializar: inicializar,
        cargarEstadisticas: cargarEstadisticas,
        cargarMesasOcupadas: cargarMesasOcupadas,
        cargarPedidosActivos: cargarPedidosActivos
    };
    
    console.log('✅ Módulo Dashboard cargado - API REST');
})();

// Estilos
const estilosDashboard = document.createElement('style');
estilosDashboard.textContent = `
    .item-mesa-ocupada,.item-pedido-activo{display:flex;justify-content:space-between;align-items:center;padding:15px;margin:10px 0;background:#f8f9fa;border-radius:10px;border-left:4px solid var(--color-primario)}.item-mesa-ocupada:hover,.item-pedido-activo:hover{background:#e9ecef}.mesa-info,.pedido-codigo{display:flex;align-items:center;gap:10px}.mesa-detalles,.pedido-detalles{display:flex;gap:15px;color:#666;font-size:14px}.mesa-total,.pedido-total{font-size:18px;font-weight:bold;color:var(--color-exito)}.sin-datos{text-align:center;color:#999;padding:20px}.badge-warning{background:#fff3cd;color:#856404}.badge-info{background:#d1ecf1;color:#0c5460}.badge-success{background:#d4edda;color:#155724}.badge-primary{background:#cce5ff;color:#004085}.badge-danger{background:#f8d7da;color:#721c24}.badge-secundario{background:#e2e3e5;color:#383d41}
`;
document.head.appendChild(estilosDashboard);