/* ==========================================
   CAJA.JS - RESTAURADO AL DISEÑO ORIGINAL
   🔥 GESTIÓN DE CAJA VIA API
   ========================================== */

(function() {
    const API_URL = 'http://localhost:8085/api';
    let cajaActual = null;
    let movimientosData = [];
    let historialData = [];
    
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
                console.log('📊 Movimientos cargados:', movimientosData.length);
            }
        } catch (error) {
            console.error('Error cargando movimientos:', error);
            movimientosData = [];
        }
    }
    
    // ==========================================
    // RENDERIZADO PRINCIPAL
    // ==========================================
    
    function renderizarCaja() {
        renderizarEstadoCaja();
        renderizarMovimientos();
        renderizarHistorial();
    }
    
    // ==========================================
    // RENDERIZAR ESTADO DE CAJA
    // ==========================================
    
    function renderizarEstadoCaja() {
        const contenedor = document.getElementById('caja-estado-actual');
        if (!contenedor) {
            console.warn('⚠️ Contenedor caja-estado-actual no encontrado');
            return;
        }
        
        if (!cajaActual || !cajaActual.cajaAbierta) {
            contenedor.innerHTML = generarHTMLCajaCerrada();
            // Mostrar botón de abrir
            const btnAbrir = document.getElementById('btn-abrir-caja');
            if (btnAbrir) btnAbrir.style.display = 'inline-flex';
        } else {
            contenedor.innerHTML = generarHTMLCajaAbierta();
            // Ocultar botón de abrir
            const btnAbrir = document.getElementById('btn-abrir-caja');
            if (btnAbrir) btnAbrir.style.display = 'none';
        }
    }
    
    // ==========================================
    // HTML: CAJA CERRADA
    // ==========================================
    
    function generarHTMLCajaCerrada() {
        return `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-cash-register" style="font-size: 80px; color: #95a5a6; margin-bottom: 20px;"></i>
                <h3 style="color: #7f8c8d; margin: 0;">No hay caja abierta</h3>
                <p style="color: #95a5a6;">Abre la caja para comenzar a registrar ventas</p>
            </div>
        `;
    }
    
    // ==========================================
    // HTML: CAJA ABIERTA (DISEÑO ORIGINAL)
    // ==========================================
    
    function generarHTMLCajaAbierta() {
        const montoInicial = parseFloat(cajaActual.montoInicial || 0);
        const totalVentas = parseFloat(cajaActual.totalVentas || 0);
        const totalEfectivo = parseFloat(cajaActual.totalEfectivo || 0);
        const totalYape = parseFloat(cajaActual.totalYape || 0);
        const totalPlin = parseFloat(cajaActual.totalPlin || 0);
        const totalTarjeta = parseFloat(cajaActual.totalTarjeta || 0);
        const totalGastos = parseFloat(cajaActual.totalGastos || 0);
        
        // 💰 EFECTIVO FÍSICO EN CAJA (destacado)
        const efectivoEnCaja = montoInicial + totalEfectivo - totalGastos;
        
        return `
            <!-- Indicador de Caja Abierta -->
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <div style="width: 12px; height: 12px; background: #27ae60; border-radius: 50%;"></div>
                <span style="font-weight: bold; color: #27ae60; font-size: 14px;">CAJA ABIERTA</span>
            </div>
            
            <!-- Información de la Caja -->
            <div style="margin-bottom: 20px;">
                <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">
                    Responsable: ${cajaActual.responsable || 'N/A'}
                </p>
                <p style="margin: 5px 0; color: #7f8c8d; font-size: 14px;">
                    Abierta: ${cajaActual.fechaApertura || 'N/A'} - ${cajaActual.horaApertura || 'N/A'}
                </p>
                <p style="margin: 5px 0; color: #95a5a6; font-size: 12px;">
                    📦 ${cajaActual.codigoCaja || 'N/A'}
                </p>
            </div>
            
            <!-- Resumen -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-fire" style="color: #e74c3c;"></i>
                    Resumen:
                </h4>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Inicial:</span>
                    <span style="font-weight: bold;">S/. ${montoInicial.toFixed(2)}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span style="color: #27ae60; font-weight: bold;">Ventas Totales:</span>
                    <span style="color: #27ae60; font-weight: bold;">+S/. ${totalVentas.toFixed(2)}</span>
                </div>
                
                <!-- Desglose por Método de Pago -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px; padding: 10px; background: white; border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #27ae60;">💵</span>
                        <span style="font-size: 13px;">Efectivo: S/. ${totalEfectivo.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #9b59b6;">📱</span>
                        <span style="font-size: 13px;">Yape: S/. ${totalYape.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #3498db;">📱</span>
                        <span style="font-size: 13px;">Plin: S/. ${totalPlin.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #e67e22;">💳</span>
                        <span style="font-size: 13px;">Tarjeta: S/. ${totalTarjeta.toFixed(2)}</span>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px dashed #ddd;">
                    <span style="color: #e74c3c;">Gastos:</span>
                    <span style="color: #e74c3c; font-weight: bold;">-S/. ${totalGastos.toFixed(2)}</span>
                </div>
            </div>
            
            <!-- EFECTIVO EN CAJA (DESTACADO) -->
            <div style="background: linear-gradient(135deg, #f39c12 0%, #f1c40f 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="margin: 0; color: white; font-size: 14px; font-weight: 500;">Efectivo en Caja:</p>
                <p style="margin: 5px 0 0 0; color: white; font-size: 32px; font-weight: bold;">S/. ${efectivoEnCaja.toFixed(2)}</p>
            </div>
            
            <!-- Botones de Acción -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-secundario" onclick="Caja.registrarGastoModal()" style="flex: 1;">
                    <i class="fas fa-minus-circle"></i> Registrar Gasto
                </button>
                <button class="btn btn-peligro" onclick="Caja.cerrarCajaModal()" style="flex: 1;">
                    <i class="fas fa-lock"></i> Cerrar Caja
                </button>
            </div>
        `;
    }
    
    // ==========================================
    // RENDERIZAR MOVIMIENTOS
    // ==========================================
    
    function renderizarMovimientos() {
        const contenedor = document.getElementById('caja-movimientos-contenido');
        if (!contenedor) return;
        
        if (movimientosData.length === 0) {
            contenedor.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay movimientos registrados</p>';
        } else {
            contenedor.innerHTML = generarHTMLMovimientos();
        }
    }
    
    function generarHTMLMovimientos() {
        return `
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${movimientosData.map(mov => {
                    const esVenta = mov.tipoMovimiento === 'VENTA';
                    const monto = parseFloat(mov.monto || 0);
                    const hora = mov.horaMovimiento || '--:--';
                    const descripcion = mov.descripcion || mov.concepto || 'Movimiento';
                    const metodo = mov.metodoPago || '';
                    
                    const colorBorde = esVenta ? '#27ae60' : '#e74c3c';
                    const icono = esVenta ? 'arrow-down' : 'arrow-up';
                    const signo = esVenta ? '+' : '-';
                    
                    return `
                        <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-left: 4px solid ${colorBorde}; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="flex-shrink: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: ${colorBorde}20; border-radius: 50%;">
                                <i class="fas fa-${icono}" style="color: ${colorBorde}; font-size: 16px;"></i>
                            </div>
                            <div style="flex: 1;">
                                <p style="margin: 0; font-weight: bold; font-size: 14px;">${hora}</p>
                                <p style="margin: 3px 0 0 0; color: #7f8c8d; font-size: 13px;">
                                    ${esVenta ? '✅' : '💸'} ${esVenta ? 'VENTA' : 'GASTO'} ${descripcion} ${metodo ? `(${metodo})` : ''}
                                </p>
                            </div>
                            <div style="font-size: 18px; font-weight: bold; color: ${colorBorde};">
                                ${signo}S/. ${Math.abs(monto).toFixed(2)}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // ==========================================
    // RENDERIZAR HISTORIAL
    // ==========================================
    
    async function cargarHistorial() {
        try {
            const response = await fetch(`${API_URL}/caja/historial`);
            if (response.ok) {
                historialData = await response.json();
                console.log('📊 Historial cargado:', historialData.length, 'cajas');
            }
        } catch (error) {
            console.error('Error cargando historial:', error);
            historialData = [];
        }
    }
    
    async function renderizarHistorial() {
        const contenedor = document.getElementById('caja-historial-contenido');
        if (!contenedor) return;
        
        await cargarHistorial();
        
        if (historialData.length === 0) {
            contenedor.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay cajas cerradas en el historial</p>';
            return;
        }
        
        contenedor.innerHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                            <th style="padding: 12px; text-align: left;">Código</th>
                            <th style="padding: 12px; text-align: left;">Responsable</th>
                            <th style="padding: 12px; text-align: left;">Apertura</th>
                            <th style="padding: 12px; text-align: left;">Cierre</th>
                            <th style="padding: 12px; text-align: right;">Inicial</th>
                            <th style="padding: 12px; text-align: right;">Ventas</th>
                            <th style="padding: 12px; text-align: right;">Efectivo Final</th>
                            <th style="padding: 12px; text-align: right;">Diferencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${historialData.slice(0, 10).map(caja => {
                            const diferencia = parseFloat(caja.diferencia || 0);
                            const colorDif = diferencia > 0 ? '#1976d2' : diferencia < 0 ? '#c62828' : '#27ae60';
                            const signoDif = diferencia > 0 ? '+' : '';
                            
                            return `
                                <tr style="border-bottom: 1px solid #e0e0e0;">
                                    <td style="padding: 10px; font-family: monospace; font-size: 12px;">${caja.codigoCaja || 'N/A'}</td>
                                    <td style="padding: 10px;">${caja.responsable || 'N/A'}</td>
                                    <td style="padding: 10px; font-size: 13px;">
                                        ${caja.fechaApertura || 'N/A'}<br>
                                        <small style="color: #666;">${caja.horaApertura || ''}</small>
                                    </td>
                                    <td style="padding: 10px; font-size: 13px;">
                                        ${caja.fechaCierre || 'N/A'}<br>
                                        <small style="color: #666;">${caja.horaCierre || ''}</small>
                                    </td>
                                    <td style="padding: 10px; text-align: right;">S/. ${parseFloat(caja.montoInicial || 0).toFixed(2)}</td>
                                    <td style="padding: 10px; text-align: right; color: #27ae60; font-weight: bold;">S/. ${parseFloat(caja.totalVentas || 0).toFixed(2)}</td>
                                    <td style="padding: 10px; text-align: right; font-weight: bold;">S/. ${parseFloat(caja.montoFinal || 0).toFixed(2)}</td>
                                    <td style="padding: 10px; text-align: right; color: ${colorDif}; font-weight: bold;">
                                        ${signoDif}S/. ${Math.abs(diferencia).toFixed(2)}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    // ==========================================
    // ABRIR CAJA - MODAL
    // ==========================================
    
    function abrirCaja() {
        if (cajaActual && cajaActual.cajaAbierta) {
            mostrarNotificacion('Ya existe una caja abierta', 'info');
            return;
        }
        abrirCajaModal();
    }
    
    function abrirCajaModal() {
        const usuario = JSON.parse(localStorage.getItem('sesionApocighol') || '{}');
        
        let contenido = `
            <div class="formulario-caja">
                <div class="campo-form">
                    <label>Monto Inicial en Caja:</label>
                    <input type="number" id="monto-inicial" min="0" step="0.01" value="100.00" 
                           style="font-size: 18px; padding: 12px;">
                    <small style="color: #7f8c8d; display: block; margin-top: 5px;">
                        Dinero en efectivo al abrir la caja
                    </small>
                </div>
                
                <div class="campo-form">
                    <label>Responsable:</label>
                    <input type="text" id="responsable-caja" 
                           value="${usuario.nombre || 'Administrador'}" 
                           readonly style="background: #f8f9fa; font-weight: bold;">
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
        
        if (montoInicial < 0) {
            mostrarNotificacion('El monto inicial debe ser mayor o igual a 0', 'error');
            return;
        }
        
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
            mostrarNotificacion('Error de conexión con el servidor', 'error');
        }
    }
    
    // ==========================================
    // CERRAR CAJA - MODAL
    // ==========================================
    
    function cerrarCajaModal() {
        if (!cajaActual || !cajaActual.cajaAbierta) {
            mostrarNotificacion('No hay caja abierta', 'error');
            return;
        }
        
        const montoInicial = parseFloat(cajaActual.montoInicial || 0);
        const totalEfectivo = parseFloat(cajaActual.totalEfectivo || 0);
        const totalYape = parseFloat(cajaActual.totalYape || 0);
        const totalPlin = parseFloat(cajaActual.totalPlin || 0);
        const totalTarjeta = parseFloat(cajaActual.totalTarjeta || 0);
        const totalGastos = parseFloat(cajaActual.totalGastos || 0);
        
        // Calcular vueltos dados (si el backend lo proporciona)
        const totalVueltos = calcularTotalVueltos();
        
        const efectivoEsperado = montoInicial + totalEfectivo - totalGastos;
        
        let contenido = `
            <div class="formulario-caja">
                <!-- Resumen de Ventas del Día -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-chart-line"></i>
                        Resumen de Ventas del Día
                    </h4>
                    
                    <!-- EFECTIVO -->
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-weight: bold;">💵 EFECTIVO</span>
                            <span style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px;">
                                ${contarVentasEfectivo()} venta(s)
                            </span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span style="font-size: 14px;">Total vendido:</span>
                            <span style="font-weight: bold;">S/. ${totalEfectivo.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span style="font-size: 14px;">Total recibido de clientes:</span>
                            <span style="font-weight: bold;">S/. ${(totalEfectivo + totalVueltos).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2);">
                            <span style="font-size: 14px;">💰 Total vueltos dados:</span>
                            <span style="font-weight: bold; color: #ff6b6b;">-S/. ${totalVueltos.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <!-- PAGOS DIGITALES -->
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-weight: bold;">📱 PAGOS DIGITALES</span>
                            <span style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px;">
                                ${contarVentasDigitales()} venta(s)
                            </span>
                        </div>
                        ${totalYape > 0 || totalPlin > 0 || totalTarjeta > 0 ? `
                            ${totalYape > 0 ? `<div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>Yape:</span><span>S/. ${totalYape.toFixed(2)}</span></div>` : ''}
                            ${totalPlin > 0 ? `<div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>Plin:</span><span>S/. ${totalPlin.toFixed(2)}</span></div>` : ''}
                            ${totalTarjeta > 0 ? `<div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>Tarjeta:</span><span>S/. ${totalTarjeta.toFixed(2)}</span></div>` : ''}
                        ` : '<p style="text-align: center; margin: 10px 0; font-style: italic; opacity: 0.8;">No hay ventas digitales</p>'}
                    </div>
                    
                    <!-- EFECTIVO EN CAJA -->
                    <div style="background: linear-gradient(135deg, #f39c12 0%, #f1c40f 100%); padding: 15px; border-radius: 8px;">
                        <div style="font-weight: bold; margin-bottom: 10px;">💰 EFECTIVO EN CAJA</div>
                        <div style="display: flex; justify-content: space-between; margin: 5px 0; font-size: 13px;">
                            <span>Ventas en efectivo:</span>
                            <span>+S/. ${totalEfectivo.toFixed(2)}</span>
                        </div>
                        ${totalGastos > 0 ? `
                        <div style="display: flex; justify-content: space-between; margin: 5px 0; font-size: 13px;">
                            <span>Gastos:</span>
                            <span style="color: #ff6b6b;">-S/. ${totalGastos.toFixed(2)}</span>
                        </div>
                        ` : ''}
                        <p style="text-align: center; margin: 10px 0 0 0; font-size: 11px; opacity: 0.9;">
                            <i class="fas fa-info-circle"></i> Los vueltos ya están restados del efectivo recibido
                        </p>
                    </div>
                </div>
                
                <!-- Campos de Cierre -->
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 15px 0; color: #2c3e50;">Arqueo de Caja</h4>
                    
                    <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
                        <span>Fondo Inicial:</span>
                        <span style="font-weight: bold;">S/. ${montoInicial.toFixed(2)}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
                        <span>+ Ventas Efectivo:</span>
                        <span style="font-weight: bold; color: #27ae60;">+S/. ${totalEfectivo.toFixed(2)}</span>
                    </div>
                    
                    ${totalGastos > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
                        <span>- Gastos:</span>
                        <span style="font-weight: bold; color: #e74c3c;">-S/. ${totalGastos.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    
                    <div style="display: flex; justify-content: space-between; margin: 15px 0; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 5px; font-size: 16px;">
                        <span style="font-weight: bold;">Efectivo Esperado:</span>
                        <span style="font-weight: bold; font-size: 20px;">S/. ${efectivoEsperado.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="campo-form">
                    <label>Monto Final Contado (en efectivo):</label>
                    <input type="number" id="monto-final" min="0" step="0.01" 
                           value="${efectivoEsperado.toFixed(2)}" 
                           onchange="Caja.calcularDiferenciaCierre(${efectivoEsperado})"
                           style="font-size: 18px; padding: 12px;">
                    <small style="color: #7f8c8d; display: block; margin-top: 5px;">
                        Contar el efectivo físico en la caja
                    </small>
                </div>
                
                <div class="campo-form">
                    <label>Diferencia:</label>
                    <input type="text" id="diferencia-caja" value="S/. 0.00" readonly 
                           style="font-weight: bold; font-size: 20px; text-align: center; background: #e8f5e9; color: #27ae60; padding: 15px; border: 2px solid #27ae60;">
                </div>
                
                <div class="campo-form">
                    <label>Observaciones (opcional):</label>
                    <textarea id="observaciones-cierre" rows="3" 
                              placeholder="Alguna nota sobre el cierre de caja..."
                              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"></textarea>
                </div>
            </div>
        `;
        
        abrirModal('Cerrar Caja', contenido, confirmarCerrarCaja);
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Cerrar Caja';
        }
    }
    
    function calcularDiferenciaCierre(esperado) {
        const montoFinal = parseFloat(document.getElementById('monto-final').value) || 0;
        const diferencia = montoFinal - esperado;
        
        const inputDiferencia = document.getElementById('diferencia-caja');
        if (inputDiferencia) {
            inputDiferencia.value = `S/. ${Math.abs(diferencia).toFixed(2)}`;
            
            if (diferencia > 0) {
                inputDiferencia.style.background = '#e3f2fd';
                inputDiferencia.style.color = '#1976d2';
                inputDiferencia.style.borderColor = '#1976d2';
                inputDiferencia.value = `+S/. ${diferencia.toFixed(2)} (Sobrante)`;
            } else if (diferencia < 0) {
                inputDiferencia.style.background = '#ffebee';
                inputDiferencia.style.color = '#c62828';
                inputDiferencia.style.borderColor = '#c62828';
                inputDiferencia.value = `-S/. ${Math.abs(diferencia).toFixed(2)} (Faltante)`;
            } else {
                inputDiferencia.style.background = '#e8f5e9';
                inputDiferencia.style.color = '#27ae60';
                inputDiferencia.style.borderColor = '#27ae60';
                inputDiferencia.value = `S/. 0.00 (Exacto ✓)`;
            }
        }
    }
    
    async function confirmarCerrarCaja() {
        const montoFinal = parseFloat(document.getElementById('monto-final').value) || 0;
        const observaciones = document.getElementById('observaciones-cierre').value;
        
        const montoInicial = parseFloat(cajaActual.montoInicial || 0);
        const totalEfectivo = parseFloat(cajaActual.totalEfectivo || 0);
        const totalGastos = parseFloat(cajaActual.totalGastos || 0);
        const esperado = montoInicial + totalEfectivo - totalGastos;
        const diferencia = montoFinal - esperado;
        
        if (!confirm(`¿Confirmar cierre de caja?\n\nEsperado: S/. ${esperado.toFixed(2)}\nContado: S/. ${montoFinal.toFixed(2)}\nDiferencia: S/. ${diferencia.toFixed(2)}`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/caja/cerrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    montoFinal: montoFinal,
                    observaciones: observaciones
                })
            });
            
            if (response.ok) {
                cerrarModal();
                await verificarEstadoCaja();
                renderizarCaja();
                mostrarNotificacion('✅ Caja cerrada correctamente', 'exito');
            } else {
                const error = await response.json();
                mostrarNotificacion(error.error || 'Error al cerrar caja', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión con el servidor', 'error');
        }
    }
    
    // ==========================================
    // REGISTRAR GASTO - MODAL
    // ==========================================
    
    function registrarGastoModal() {
        if (!cajaActual || !cajaActual.cajaAbierta) {
            mostrarNotificacion('No hay caja abierta', 'error');
            return;
        }
        
        let contenido = `
            <div class="formulario-caja">
                <div class="campo-form">
                    <label>Concepto del Gasto: *</label>
                    <input type="text" id="concepto-gasto" 
                           placeholder="Ej: Compra de gas, Delivery, etc."
                           style="padding: 12px;">
                </div>
                
                <div class="campo-form">
                    <label>Monto: *</label>
                    <input type="number" id="monto-gasto" min="0" step="0.01" 
                           placeholder="0.00"
                           style="font-size: 18px; padding: 12px;">
                </div>
            </div>
        `;
        
        abrirModal('Registrar Gasto', contenido, confirmarRegistrarGasto);
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-save"></i> Registrar';
        }
    }
    
    async function confirmarRegistrarGasto() {
        const concepto = document.getElementById('concepto-gasto').value.trim();
        const monto = parseFloat(document.getElementById('monto-gasto').value) || 0;
        
        if (!concepto) {
            mostrarNotificacion('Ingresa el concepto del gasto', 'error');
            return;
        }
        
        if (monto <= 0) {
            mostrarNotificacion('El monto debe ser mayor a 0', 'error');
            return;
        }
        
        const usuario = JSON.parse(localStorage.getItem('sesionApocighol') || '{}');
        
        try {
            const response = await fetch(`${API_URL}/caja/gasto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    concepto: concepto,
                    monto: monto,
                    registradoPor: usuario.nombre || 'Sistema'
                })
            });
            
            if (response.ok) {
                cerrarModal();
                await verificarEstadoCaja();
                renderizarCaja();
                mostrarNotificacion(`✅ Gasto registrado: S/. ${monto.toFixed(2)}`, 'exito');
            } else {
                const error = await response.json();
                mostrarNotificacion(error.error || 'Error al registrar gasto', 'error');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            mostrarNotificacion('Error de conexión con el servidor', 'error');
        }
    }
    
    // ==========================================
    // FUNCIONES AUXILIARES
    // ==========================================
    
    function calcularTotalVueltos() {
        let totalVueltos = 0;
        movimientosData.forEach(mov => {
            if (mov.tipoMovimiento === 'VENTA' && mov.vuelto) {
                totalVueltos += parseFloat(mov.vuelto);
            }
        });
        return totalVueltos;
    }
    
    function contarVentasEfectivo() {
        return movimientosData.filter(m => m.tipoMovimiento === 'VENTA' && m.metodoPago === 'Efectivo').length;
    }
    
    function contarVentasDigitales() {
        return movimientosData.filter(m => 
            m.tipoMovimiento === 'VENTA' && 
            (m.metodoPago === 'Yape' || m.metodoPago === 'Plin' || m.metodoPago === 'Tarjeta')
        ).length;
    }
    
    // ==========================================
    // EXPORTAR FUNCIONES
    // ==========================================
    
    window.Caja = {
        inicializar,
        abrirCaja,
        abrirCajaModal,
        cerrarCajaModal,
        registrarGastoModal,
        calcularDiferenciaCierre
    };
    
    // Exportar globalmente para compatibilidad con onclick en HTML
    window.abrirCaja = abrirCaja;
    
    console.log('✅ Módulo Caja cargado - DISEÑO ORIGINAL RESTAURADO');
})();