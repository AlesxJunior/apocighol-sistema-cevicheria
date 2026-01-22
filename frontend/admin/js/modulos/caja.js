/* ==========================================
   CAJA.JS - CONECTADO CON BACKEND
   🔥 GESTIÓN DE CAJA VIA API
   ========================================== */

(function() {
    const API_URL = 'http://localhost:8085/api';
    let cajaActual = null;
    let movimientosData = [];
    
    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    
    async function inicializar() {
        console.log('💰 Inicializando módulo Caja...');
        
        await verificarEstadoCaja();
        renderizarCaja();
        
        console.log('✅ Módulo Caja inicializado');
    }
    
    // ==========================================
    // VERIFICAR ESTADO DE CAJA
    // ==========================================
    
    async function verificarEstadoCaja() {
        try {
            const response = await fetch(`${API_URL}/caja/estado`);
            if (response.ok) {
                const data = await response.json();
                
                if (data.cajaAbierta) {
                    cajaActual = data;
                    await cargarMovimientos();
                } else {
                    cajaActual = null;
                    movimientosData = [];
                }
            }
        } catch (error) {
            console.error('❌ Error verificando caja:', error);
            cajaActual = null;
        }
    }
    
    async function cargarMovimientos() {
        try {
            const response = await fetch(`${API_URL}/caja/movimientos`);
            if (response.ok) {
                movimientosData = await response.json();
            }
        } catch (error) {
            console.error('Error cargando movimientos:', error);
            movimientosData = [];
        }
    }
    
    // ==========================================
    // RENDERIZADO
    // ==========================================
    
    function renderizarCaja() {
        const contenedor = document.getElementById('contenido-caja');
        if (!contenedor) return;
        
        if (!cajaActual || !cajaActual.cajaAbierta) {
            contenedor.innerHTML = renderizarCajaCerrada();
        } else {
            contenedor.innerHTML = renderizarCajaAbierta();
        }
    }
    
    function renderizarCajaCerrada() {
        return `
            <div class="caja-cerrada">
                <div class="icono-caja-cerrada">
                    <i class="fas fa-cash-register"></i>
                </div>
                <h3>No hay caja abierta</h3>
                <p>Abre la caja para comenzar a registrar ventas</p>
                <button class="btn btn-primario btn-grande" onclick="abrirCajaModal()">
                    <i class="fas fa-unlock"></i> Abrir Caja
                </button>
            </div>
            
            <div class="seccion-movimientos">
                <h4><i class="fas fa-list"></i> Movimientos de Hoy</h4>
                <p class="sin-datos">No hay movimientos registrados</p>
            </div>
        `;
    }
    
    function renderizarCajaAbierta() {
        const totalVentas = parseFloat(cajaActual.totalVentas || 0);
        const totalEfectivo = parseFloat(cajaActual.totalEfectivo || 0);
        const totalYape = parseFloat(cajaActual.totalYape || 0);
        const totalPlin = parseFloat(cajaActual.totalPlin || 0);
        const totalTarjeta = parseFloat(cajaActual.totalTarjeta || 0);
        const montoInicial = parseFloat(cajaActual.montoInicial || 0);
        
        return `
            <div class="caja-abierta">
                <div class="caja-header">
                    <div class="caja-info">
                        <h3><i class="fas fa-check-circle" style="color: #27ae60;"></i> Caja Abierta</h3>
                        <p>Código: ${cajaActual.codigoCaja || 'N/A'}</p>
                        <p>Abierta: ${cajaActual.horaApertura || 'N/A'}</p>
                    </div>
                    <button class="btn btn-peligro" onclick="cerrarCajaModal()">
                        <i class="fas fa-lock"></i> Cerrar Caja
                    </button>
                </div>
                
                <div class="resumen-caja">
                    <div class="tarjeta-resumen total">
                        <i class="fas fa-dollar-sign"></i>
                        <div>
                            <span class="label">Total Ventas</span>
                            <span class="valor">S/. ${totalVentas.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="tarjeta-resumen efectivo">
                        <i class="fas fa-money-bill-wave"></i>
                        <div>
                            <span class="label">Efectivo</span>
                            <span class="valor">S/. ${totalEfectivo.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="tarjeta-resumen yape">
                        <i class="fas fa-mobile-alt"></i>
                        <div>
                            <span class="label">Yape</span>
                            <span class="valor">S/. ${totalYape.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="tarjeta-resumen plin">
                        <i class="fas fa-mobile-alt"></i>
                        <div>
                            <span class="label">Plin</span>
                            <span class="valor">S/. ${totalPlin.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="tarjeta-resumen tarjeta">
                        <i class="fas fa-credit-card"></i>
                        <div>
                            <span class="label">Tarjeta</span>
                            <span class="valor">S/. ${totalTarjeta.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="tarjeta-resumen inicial">
                        <i class="fas fa-piggy-bank"></i>
                        <div>
                            <span class="label">Monto Inicial</span>
                            <span class="valor">S/. ${montoInicial.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="seccion-movimientos">
                <h4><i class="fas fa-list"></i> Movimientos de Hoy</h4>
                ${renderizarMovimientos()}
            </div>
        `;
    }
    
    function renderizarMovimientos() {
        if (movimientosData.length === 0) {
            return '<p class="sin-datos">No hay movimientos registrados</p>';
        }
        
        return `
            <div class="lista-movimientos">
                ${movimientosData.map(mov => {
                    const esVenta = mov.tipoMovimiento === 'VENTA';
                    const monto = parseFloat(mov.monto || 0);
                    const hora = mov.horaMovimiento ? mov.horaMovimiento.substring(0, 5) : '--:--';
                    
                    return `
                        <div class="item-movimiento ${esVenta ? 'ingreso' : 'egreso'}">
                            <div class="mov-icono">
                                <i class="fas fa-${esVenta ? 'arrow-down' : 'arrow-up'}"></i>
                            </div>
                            <div class="mov-info">
                                <span class="mov-descripcion">${mov.descripcion || 'Movimiento'}</span>
                                <span class="mov-metodo">${mov.metodoPago || ''} - ${hora}</span>
                            </div>
                            <div class="mov-monto ${esVenta ? 'positivo' : 'negativo'}">
                                ${esVenta ? '+' : '-'} S/. ${Math.abs(monto).toFixed(2)}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // ==========================================
    // ABRIR CAJA
    // ==========================================
    
    function abrirCajaModal() {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        
        let contenido = `
            <div class="formulario-caja">
                <div class="campo-form">
                    <label>Monto Inicial en Caja:</label>
                    <input type="number" id="monto-inicial" min="0" step="0.01" value="100.00">
                    <small>Dinero en efectivo al abrir la caja</small>
                </div>
                
                <div class="campo-form">
                    <label>Responsable:</label>
                    <input type="text" id="responsable-caja" value="${usuario.nombreCompleto || 'Administrador'}" readonly>
                </div>
            </div>
        `;
        
        abrirModal('Abrir Caja', contenido, confirmarAbrirCaja);
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-unlock"></i> Abrir Caja';
        }
    }
    
    async function confirmarAbrirCaja() {
        const montoInicial = parseFloat(document.getElementById('monto-inicial').value) || 0;
        const responsable = document.getElementById('responsable-caja').value;
        
        try {
            const response = await fetch(`${API_URL}/caja/abrir`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    montoInicial: montoInicial,
                    responsable: responsable
                })
            });
            
            if (response.ok) {
                cerrarModal();
                await verificarEstadoCaja();
                renderizarCaja();
                mostrarNotificacion('✅ Caja abierta correctamente', 'exito');
            } else {
                const error = await response.json();
                mostrarNotificacion(error.error || 'Error al abrir caja', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    // ==========================================
    // CERRAR CAJA
    // ==========================================
    
    function cerrarCajaModal() {
        const totalEfectivo = parseFloat(cajaActual?.totalEfectivo || 0);
        const montoInicial = parseFloat(cajaActual?.montoInicial || 0);
        const esperado = montoInicial + totalEfectivo;
        
        let contenido = `
            <div class="formulario-caja">
                <div class="resumen-cierre">
                    <p><strong>Monto Inicial:</strong> S/. ${montoInicial.toFixed(2)}</p>
                    <p><strong>Ventas en Efectivo:</strong> S/. ${totalEfectivo.toFixed(2)}</p>
                    <p><strong>Esperado en Caja:</strong> S/. ${esperado.toFixed(2)}</p>
                </div>
                
                <div class="campo-form">
                    <label>Monto Final (contar efectivo):</label>
                    <input type="number" id="monto-final" min="0" step="0.01" 
                           value="${esperado.toFixed(2)}" onchange="calcularDiferencia()">
                </div>
                
                <div class="campo-form">
                    <label>Diferencia:</label>
                    <input type="text" id="diferencia-caja" value="S/. 0.00" readonly 
                           style="font-weight: bold; font-size: 18px;">
                </div>
            </div>
        `;
        
        abrirModal('Cerrar Caja', contenido, confirmarCerrarCaja);
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-lock"></i> Cerrar Caja';
        }
    }
    
    function calcularDiferencia() {
        const totalEfectivo = parseFloat(cajaActual?.totalEfectivo || 0);
        const montoInicial = parseFloat(cajaActual?.montoInicial || 0);
        const esperado = montoInicial + totalEfectivo;
        const montoFinal = parseFloat(document.getElementById('monto-final').value) || 0;
        const diferencia = montoFinal - esperado;
        
        const input = document.getElementById('diferencia-caja');
        input.value = `S/. ${diferencia.toFixed(2)}`;
        input.style.color = diferencia >= 0 ? '#27ae60' : '#e74c3c';
    }
    
    async function confirmarCerrarCaja() {
        const montoFinal = parseFloat(document.getElementById('monto-final').value) || 0;
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        
        try {
            const response = await fetch(`${API_URL}/caja/cerrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    montoFinal: montoFinal,
                    responsable: usuario.nombreCompleto || 'Sistema'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                cerrarModal();
                cajaActual = null;
                movimientosData = [];
                renderizarCaja();
                
                mostrarNotificacion(`✅ Caja cerrada. Total ventas: S/. ${parseFloat(data.totalVentas || 0).toFixed(2)}`, 'exito');
            } else {
                const error = await response.json();
                mostrarNotificacion(error.error || 'Error al cerrar caja', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión', 'error');
        }
    }
    
    // ==========================================
    // EXPORTAR
    // ==========================================
    window.abrirCaja = abrirCajaModal;   
    window.abrirCajaModal = abrirCajaModal;
    window.cerrarCajaModal = cerrarCajaModal;
    window.calcularDiferencia = calcularDiferencia;
    
    window.Caja = {
        inicializar: inicializar,
        verificarEstadoCaja: verificarEstadoCaja,
        renderizarCaja: renderizarCaja
    };
    
    console.log('✅ Módulo Caja cargado - API REST');
})();

// Estilos
const estilosCaja = document.createElement('style');
estilosCaja.textContent = `
    .caja-cerrada{text-align:center;padding:60px 20px;background:white;border-radius:15px;box-shadow:0 2px 10px rgba(0,0,0,.1);margin-bottom:20px}.icono-caja-cerrada{font-size:60px;color:#bdc3c7;margin-bottom:20px}.caja-cerrada h3{color:#7f8c8d;margin-bottom:10px}.btn-grande{padding:15px 30px;font-size:18px}.caja-abierta{background:white;border-radius:15px;box-shadow:0 2px 10px rgba(0,0,0,.1);padding:20px;margin-bottom:20px}.caja-header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;padding-bottom:15px;margin-bottom:20px}.resumen-caja{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px}.tarjeta-resumen{display:flex;align-items:center;gap:15px;padding:15px;border-radius:10px;background:#f8f9fa}.tarjeta-resumen i{font-size:24px}.tarjeta-resumen .label{display:block;font-size:12px;color:#7f8c8d}.tarjeta-resumen .valor{display:block;font-size:18px;font-weight:bold}.tarjeta-resumen.total{background:#d4edda;color:#155724}.tarjeta-resumen.efectivo{background:#fff3cd}.tarjeta-resumen.yape{background:#ffe0f0}.tarjeta-resumen.plin{background:#e0f7fa}.tarjeta-resumen.tarjeta{background:#e3f2fd}.seccion-movimientos{background:white;border-radius:15px;box-shadow:0 2px 10px rgba(0,0,0,.1);padding:20px}.seccion-movimientos h4{margin-bottom:15px;color:var(--color-texto)}.lista-movimientos{max-height:400px;overflow-y:auto}.item-movimiento{display:flex;align-items:center;padding:12px;margin:8px 0;border-radius:8px;background:#f8f9fa}.item-movimiento.ingreso{border-left:4px solid #27ae60}.item-movimiento.egreso{border-left:4px solid #e74c3c}.mov-icono{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:15px}.ingreso .mov-icono{background:#d4edda;color:#27ae60}.egreso .mov-icono{background:#f8d7da;color:#e74c3c}.mov-info{flex:1}.mov-descripcion{display:block;font-weight:500}.mov-metodo{font-size:12px;color:#7f8c8d}.mov-monto{font-size:16px;font-weight:bold}.mov-monto.positivo{color:#27ae60}.mov-monto.negativo{color:#e74c3c}.resumen-cierre{background:#f8f9fa;padding:15px;border-radius:10px;margin-bottom:20px}.resumen-cierre p{margin:5px 0}
`;
document.head.appendChild(estilosCaja);