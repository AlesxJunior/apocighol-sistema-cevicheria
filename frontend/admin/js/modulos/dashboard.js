/**
 * ═══════════════════════════════════════════════════════════
 * MÓDULO: DASHBOARD - CONECTADO A API REST
 * 🔥 Mesas y Pedidos desde API MySQL
 * ═══════════════════════════════════════════════════════════
 */

(function() {
    
    // URLs de API
    const API_MESAS = 'http://localhost:8085/api/mesas';
    const API_PEDIDOS = 'http://localhost:8085/api/pedidos';
    
    let intervaloActualizacion = null;
    let mesasData = [];
    let pedidosData = [];
    
    async function inicializar() {
        console.log('📊 Dashboard inicializado (API)');
        
        actualizarFechaActual();
        await actualizarDashboard();
        detenerActualizacionAutomatica();
        
        intervaloActualizacion = setInterval(async () => {
            await actualizarDashboard();
        }, 5000);
        
        console.log('📊 Dashboard con actualización automática cada 5s (API)');
    }
    
    function detenerActualizacionAutomatica() {
        if (intervaloActualizacion) {
            clearInterval(intervaloActualizacion);
            intervaloActualizacion = null;
            console.log('⏸️ Actualización automática del Dashboard detenida');
        }
    }
    
    function actualizarFechaActual() {
        const fechaElemento = document.getElementById('fecha-actual');
        if (!fechaElemento) return;
        
        const ahora = new Date();
        const opciones = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        fechaElemento.textContent = ahora.toLocaleDateString('es-PE', opciones);
    }
    
    // ==========================================
    // 🔥 CARGAR DATOS DESDE API
    // ==========================================
    
    async function cargarMesasDesdeAPI() {
        try {
            const response = await fetch(API_MESAS);
            if (!response.ok) throw new Error('Error al cargar mesas');
            
            const mesasAPI = await response.json();
            
            mesasData = mesasAPI.map(m => ({
                id: m.idMesa,
                numero: m.numeroMesa,
                capacidad: m.capacidadMesa,
                estado: m.estadoMesa || 'disponible',
                cantidadPersonas: m.personasActuales || 0,
                mesero: m.meseroAsignado || null,
                horaInicio: m.horaOcupacionMesa || null,
                totalGastado: parseFloat(m.totalConsumoMesa) || 0
            }));
            
            return mesasData;
        } catch (error) {
            console.error('❌ Error cargando mesas:', error);
            return [];
        }
    }
    
    async function cargarPedidosDesdeAPI() {
        try {
            const response = await fetch(API_PEDIDOS);
            if (!response.ok) throw new Error('Error al cargar pedidos');
            
            const pedidosAPI = await response.json();
            
            pedidosData = pedidosAPI.map(p => ({
                id: p.codigoPedido,
                idBackend: p.idPedido,
                mesa: p.numeroMesa,
                mesero: p.nombreMesero || 'Sin asignar',
                estado: p.estadoPedido || 'pendiente',
                fecha: p.fechaPedido,
                hora: p.horaPedido ? p.horaPedido.substring(0, 5) : '--:--',
                total: parseFloat(p.totalPedido) || 0,
                productos: p.productos || []
            }));
            
            return pedidosData;
        } catch (error) {
            console.error('❌ Error cargando pedidos:', error);
            return [];
        }
    }
    
    // ==========================================
    // ACTUALIZAR DASHBOARD
    // ==========================================
    
    async function actualizarDashboard() {
        // 🔥 Cargar datos desde API
        await cargarMesasDesdeAPI();
        await cargarPedidosDesdeAPI();
        
        actualizarTarjetasResumen();
        renderizarMesasOcupadas();
    }
    
    function actualizarTarjetasResumen() {
        const cajaActual = obtenerDatos('cajaActual'); // Caja sigue en localStorage
        
        // Ventas hoy (localStorage por ahora)
        const ventasHoy = cajaActual ? cajaActual.totalIngresos : 0;
        const ventasHoyEl = document.getElementById('ventas-hoy');
        if (ventasHoyEl) ventasHoyEl.textContent = formatearMoneda(ventasHoy);
        
        // 🔥 Mesas ocupadas desde API
        const mesasOcupadas = mesasData.filter(m => m.estado === 'ocupada').length;
        const totalMesas = mesasData.length;
        const mesasOcupadasEl = document.getElementById('mesas-ocupadas');
        if (mesasOcupadasEl) mesasOcupadasEl.textContent = `${mesasOcupadas}/${totalMesas}`;
        
        // 🔥 Pedidos activos desde API
        const pedidosActivos = pedidosData.filter(p => p.estado !== 'servido').length;
        const pedidosActivosEl = document.getElementById('pedidos-activos');
        if (pedidosActivosEl) pedidosActivosEl.textContent = pedidosActivos;
        
        // Ticket promedio (localStorage por ahora)
        let ticketPromedio = 0;
        if (cajaActual && cajaActual.movimientos) {
            const ventas = cajaActual.movimientos.filter(m => m.tipo === 'venta');
            if (ventas.length > 0) {
                const totalVentas = ventas.reduce((sum, v) => sum + v.monto, 0);
                ticketPromedio = totalVentas / ventas.length;
            }
        }
        const ticketPromedioEl = document.getElementById('ticket-promedio');
        if (ticketPromedioEl) ticketPromedioEl.textContent = formatearMoneda(ticketPromedio);
    }
    
    function renderizarMesasOcupadas() {
        const contenedor = document.getElementById('dashboard-contenido');
        if (!contenedor) return;
        
        // 🔥 Usar datos de API
        const mesasOcupadas = mesasData.filter(m => m.estado === 'ocupada');
        
        let html = '<div class="dashboard-seccion">';
        html += '<h3><i class="fas fa-table"></i> Mesas Ocupadas</h3>';
        
        if (mesasOcupadas.length === 0) {
            html += '<div class="mensaje-vacio"><p>No hay mesas ocupadas</p></div>';
        } else {
            html += '<div class="lista-dashboard">';
            mesasOcupadas.forEach(mesa => {
                const tiempoOcupado = calcularTiempoTranscurrido(mesa.horaInicio);
                
                html += `
                    <div class="item-dashboard">
                        <div class="item-info">
                            <div class="item-titulo">
                                <i class="fas fa-chair"></i>
                                <strong>Mesa ${mesa.numero}</strong>
                            </div>
                            <div class="item-detalles">
                                <span><i class="fas fa-user"></i> ${mesa.mesero || 'Sin asignar'}</span>
                                <span><i class="fas fa-users"></i> ${mesa.cantidadPersonas} personas</span>
                                <span><i class="fas fa-clock"></i> ${tiempoOcupado}</span>
                            </div>
                        </div>
                        <div class="item-valor">
                            ${formatearMoneda(mesa.totalGastado)}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '</div>';
        html += renderizarPedidosActivosHTML();
        html += renderizarEstadoCajaHTML();
        
        contenedor.innerHTML = html;
    }
    
    function renderizarPedidosActivosHTML() {
        // 🔥 Usar datos de API
        const pedidosActivos = pedidosData.filter(p => p.estado !== 'servido');
        
        let html = '<div class="dashboard-seccion">';
        html += '<h3><i class="fas fa-clipboard-list"></i> Pedidos Activos</h3>';
        
        if (pedidosActivos.length === 0) {
            html += '<div class="mensaje-vacio"><p>No hay pedidos activos</p></div>';
        } else {
            html += '<div class="lista-dashboard">';
            pedidosActivos.forEach(pedido => {
                const estadoClass = `badge-${pedido.estado}`;
                
                html += `
                    <div class="item-dashboard">
                        <div class="item-info">
                            <div class="item-titulo">
                                <i class="fas fa-receipt"></i>
                                <strong>${pedido.id}</strong>
                                <span class="badge ${estadoClass}">${pedido.estado.toUpperCase()}</span>
                            </div>
                            <div class="item-detalles">
                                <span><i class="fas fa-chair"></i> Mesa ${pedido.mesa}</span>
                                <span><i class="fas fa-user"></i> ${pedido.mesero}</span>
                                <span><i class="fas fa-clock"></i> ${pedido.hora}</span>
                            </div>
                        </div>
                        <div class="item-valor">
                            ${formatearMoneda(pedido.total)}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '</div>';
        
        return html;
    }
    
    function renderizarEstadoCajaHTML() {
        const cajaActual = obtenerDatos('cajaActual'); // Caja sigue en localStorage
        
        let html = '<div class="dashboard-seccion">';
        html += '<h3><i class="fas fa-cash-register"></i> Estado de Caja</h3>';
        
        if (!cajaActual) {
            html += `
                <div class="mensaje-vacio">
                    <p><i class="fas fa-exclamation-triangle"></i> No hay caja abierta</p>
                    <button class="btn btn-primario" onclick="navegarACaja()">
                        <i class="fas fa-cash-register"></i> Abrir Caja
                    </button>
                </div>
            `;
        } else {
            const enCaja = cajaActual.montoInicial + cajaActual.totalIngresos - cajaActual.totalGastos;
            
            html += `
                <div class="resumen-caja-dashboard">
                    <div class="caja-info-item">
                        <span class="caja-label">Responsable:</span>
                        <span class="caja-valor">${cajaActual.responsable}</span>
                    </div>
                    <div class="caja-info-item">
                        <span class="caja-label">Abierta desde:</span>
                        <span class="caja-valor">${cajaActual.horaApertura}</span>
                    </div>
                    <div class="caja-info-item">
                        <span class="caja-label">Inicial:</span>
                        <span class="caja-valor">${formatearMoneda(cajaActual.montoInicial)}</span>
                    </div>
                    <div class="caja-info-item">
                        <span class="caja-label">Ingresos:</span>
                        <span class="caja-valor texto-exito">+${formatearMoneda(cajaActual.totalIngresos)}</span>
                    </div>
                    <div class="caja-info-item">
                        <span class="caja-label">Gastos:</span>
                        <span class="caja-valor texto-peligro">-${formatearMoneda(cajaActual.totalGastos)}</span>
                    </div>
                    <div class="caja-info-item caja-total">
                        <span class="caja-label">En Caja:</span>
                        <span class="caja-valor">${formatearMoneda(enCaja)}</span>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        
        return html;
    }
    
    function calcularTiempoTranscurrido(horaInicio) {
        if (!horaInicio) return '0 min';
        
        const ahora = new Date();
        const [horas, minutos] = horaInicio.split(':').map(Number);
        
        const inicio = new Date();
        inicio.setHours(horas, minutos, 0, 0);
        
        const diferenciaMs = ahora - inicio;
        const diferenciaMin = Math.floor(diferenciaMs / 60000);
        
        if (diferenciaMin < 0) return '0 min';
        
        if (diferenciaMin < 60) {
            return `${diferenciaMin} min`;
        } else {
            const hrs = Math.floor(diferenciaMin / 60);
            const mins = diferenciaMin % 60;
            return `${hrs}h ${mins}min`;
        }
    }
    
    function navegarACaja() {
        console.log('📍 Navegando a Caja desde Dashboard...');
        
        const enlaceCaja = document.querySelector('.enlace-nav[data-seccion="caja"]');
        
        if (enlaceCaja) {
            enlaceCaja.click();
            console.log('✅ Navegación a Caja exitosa');
        } else {
            console.error('❌ No se encontró el enlace a Caja');
            mostrarNotificacion('Error: No se puede navegar a Caja', 'error');
        }
    }
    
    // Exportar función global
    window.navegarACaja = navegarACaja;
    
    window.Dashboard = {
        inicializar: inicializar,
        detener: detenerActualizacionAutomatica,
        actualizar: actualizarDashboard
    };
    
    console.log('📦 Módulo Dashboard cargado (API REST 🔥)');
    
})();

// ==========================================
// ESTILOS
// ==========================================

const estilosDashboard = document.createElement('style');
estilosDashboard.textContent = `
    .dashboard-seccion {
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 20px;
    }
    
    .dashboard-seccion h3 {
        margin: 0 0 20px 0;
        color: var(--color-primario);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 18px;
    }
    
    .lista-dashboard {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .item-dashboard {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
        border-left: 4px solid var(--color-primario);
    }
    
    .item-dashboard:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transform: translateX(5px);
    }
    
    .item-info {
        flex: 1;
    }
    
    .item-titulo {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        font-size: 16px;
    }
    
    .item-titulo i {
        color: var(--color-primario);
    }
    
    .item-detalles {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        font-size: 13px;
        color: #7f8c8d;
    }
    
    .item-detalles span {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .item-detalles i {
        font-size: 12px;
    }
    
    .item-valor {
        font-size: 20px;
        font-weight: bold;
        color: var(--color-exito);
    }
    
    .mensaje-vacio {
        text-align: center;
        padding: 40px 20px;
        color: #7f8c8d;
    }
    
    .mensaje-vacio i {
        font-size: 48px;
        margin-bottom: 15px;
        color: #bdc3c7;
    }
    
    .mensaje-vacio p {
        margin-bottom: 15px;
    }
    
    .resumen-caja-dashboard {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
    }
    
    .caja-info-item {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .caja-info-item.caja-total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .caja-info-item.caja-total .caja-label,
    .caja-info-item.caja-total .caja-valor {
        color: white;
    }
    
    .caja-label {
        font-size: 13px;
        color: #7f8c8d;
        font-weight: 500;
    }
    
    .caja-valor {
        font-size: 18px;
        font-weight: bold;
        color: var(--color-texto);
    }
    
    .texto-exito {
        color: var(--color-exito);
    }
    
    .texto-peligro {
        color: var(--color-peligro);
    }
    
    @media (max-width: 768px) {
        .item-dashboard {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }
        
        .item-valor {
            font-size: 18px;
        }
        
        .resumen-caja-dashboard {
            grid-template-columns: repeat(2, 1fr);
        }
    }
`;
document.head.appendChild(estilosDashboard);

console.log('✅ Módulo Dashboard completo (API REST 🔥)');