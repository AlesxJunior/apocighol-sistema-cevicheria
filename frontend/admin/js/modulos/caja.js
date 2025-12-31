/* ==========================================
   CAJA.JS - CON RESUMEN DE VUELTOS
   Módulo de gestión de caja
   
   🔥 NUEVO: Resumen de vueltos en cierre de caja
   - Muestra ventas por método de pago
   - Calcula total de vueltos dados en efectivo
   - Ayuda al cajero a cuadrar la caja
   ========================================== */

(function() {
    // ==========================================
    // VARIABLES PRIVADAS DEL MÓDULO
    // ==========================================
    
    // cajaActual: Objeto que guarda la caja del día (si está abierta)
    // cajasHistorial: Array con todas las cajas cerradas
    let cajaActual = null;
    let cajasHistorial = [];
    
    // ==========================================
    // FUNCIÓN DE INICIALIZACIÓN PÚBLICA
    // Esta función se llama cuando se carga el módulo Caja
    // ==========================================
    
    function inicializar() {
        console.log('💰 Inicializando módulo Caja...');
        
        // Cargar datos desde localStorage
        cargarDatosCaja();
        
        // Mostrar la interfaz
        renderizarCaja();
        
        console.log('✅ Módulo Caja inicializado');
    }
    
    // ==========================================
    // FUNCIONES DE CARGA Y GUARDADO
    // Estas funciones manejan localStorage
    // ==========================================
    
    // Carga la caja actual y el historial desde localStorage
    function cargarDatosCaja() {
        cajaActual = obtenerDatos('cajaActual');
        cajasHistorial = obtenerDatos('cajas') || [];
        console.log(`📊 Caja actual: ${cajaActual ? 'ABIERTA' : 'CERRADA'}`);
        console.log(`📊 ${cajasHistorial.length} cajas en historial`);
    }
    
    // Guarda la caja actual en localStorage
    function guardarCajaActual() {
        guardarDatos('cajaActual', cajaActual);
    }
    
    // Guarda el historial de cajas en localStorage
    function guardarHistorial() {
        guardarDatos('cajas', cajasHistorial);
    }
    
    // ==========================================
    // RENDERIZADO PRINCIPAL
    // Estas funciones dibujan la interfaz
    // ==========================================
    
    // Función principal que renderiza toda la sección de caja
    function renderizarCaja() {
        renderizarEstadoActual();  // Panel superior: estado de la caja
        renderizarMovimientos();    // Panel medio: movimientos del día
        renderizarHistorial();      // Panel inferior: cajas cerradas
    }
    
    // Renderiza el estado actual de la caja (abierta o cerrada)
    function renderizarEstadoActual() {
        const contenedor = document.getElementById('caja-estado-actual');
        const btnAbrir = document.getElementById('btn-abrir-caja');
        
        if (!contenedor) return;
        
        // Si NO hay caja abierta, mostrar mensaje para abrir
        if (!cajaActual) {
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-cash-register" style="font-size: 48px; color: #95a5a6; margin-bottom: 15px;"></i>
                    <h3 style="color: #7f8c8d;">No hay caja abierta</h3>
                    <p style="color: #95a5a6;">Abre la caja para comenzar a registrar ventas</p>
                </div>
            `;
            
            if (btnAbrir) {
                btnAbrir.style.display = 'inline-flex';
            }
            return;
        }
        
        // Si HAY caja abierta, mostrar resumen
        // enCaja = montoInicial + ingresos - gastos
        const enCaja = cajaActual.montoInicial + cajaActual.totalIngresos - cajaActual.totalGastos;
        
        contenedor.innerHTML = `
            <div class="caja-abierta-info">
                <div class="caja-header">
                    <div>
                        <span class="badge badge-exito">🟢 CAJA ABIERTA</span>
                        <h3 style="margin: 10px 0 5px 0;">Responsable: ${cajaActual.responsable}</h3>
                        <p style="color: #7f8c8d; margin: 0;">Abierta: ${cajaActual.fecha} - ${cajaActual.horaApertura}</p>
                    </div>
                </div>
                
                <div class="caja-resumen">
                    <h4>💰 Resumen:</h4>
                    <div class="resumen-linea">
                        <span>Inicial:</span>
                        <span>${formatearMoneda(cajaActual.montoInicial)}</span>
                    </div>
                    <div class="resumen-linea ingreso">
                        <span>Ingresos:</span>
                        <span>+${formatearMoneda(cajaActual.totalIngresos)}</span>
                    </div>
                    <div class="resumen-linea egreso">
                        <span>Gastos:</span>
                        <span>-${formatearMoneda(cajaActual.totalGastos)}</span>
                    </div>
                    <div class="resumen-linea total">
                        <span><strong>En Caja:</strong></span>
                        <span><strong>${formatearMoneda(enCaja)}</strong></span>
                    </div>
                </div>
                
                <div class="caja-acciones">
                    <button class="btn btn-secundario" onclick="registrarGasto()">
                        <i class="fas fa-minus-circle"></i> Registrar Gasto
                    </button>
                    <button class="btn btn-peligro" onclick="cerrarCaja()">
                        <i class="fas fa-lock"></i> Cerrar Caja
                    </button>
                </div>
            </div>
        `;
        
        // Ocultar botón de abrir si ya hay caja abierta
        if (btnAbrir) {
            btnAbrir.style.display = 'none';
        }
    }
    
    // Renderiza la lista de movimientos del día
    function renderizarMovimientos() {
        const contenedor = document.getElementById('caja-movimientos-contenido');
        if (!contenedor) return;
        
        // Si no hay caja o no hay movimientos
        if (!cajaActual || cajaActual.movimientos.length === 0) {
            contenedor.innerHTML = '<p style="text-align: center; color: #999;">No hay movimientos registrados</p>';
            return;
        }
        
        // Ordenar por hora (más recientes primero)
        const movimientosOrdenados = [...cajaActual.movimientos].reverse();
        
        contenedor.innerHTML = `
            <div class="lista-movimientos">
                ${movimientosOrdenados.map(mov => `
                    <div class="movimiento-item ${mov.tipo}">
                        <div class="movimiento-info">
                            <span class="movimiento-hora">${mov.hora}</span>
                            <span class="movimiento-tipo">${mov.tipo === 'venta' ? '💵 INGRESO' : '💸 GASTO'}</span>
                            <span class="movimiento-concepto">${mov.concepto}</span>
                        </div>
                        <div class="movimiento-monto ${mov.tipo}">
                            ${mov.tipo === 'venta' ? '+' : '-'}${formatearMoneda(mov.monto)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Renderiza el historial de cajas cerradas
    function renderizarHistorial() {
        const contenedor = document.getElementById('caja-historial-contenido');
        if (!contenedor) return;
        
        if (cajasHistorial.length === 0) {
            contenedor.innerHTML = '<p style="text-align: center; color: #999;">No hay cajas cerradas en el historial</p>';
            return;
        }
        
        // Ordenar por fecha (más recientes primero)
        const historialOrdenado = [...cajasHistorial].reverse();
        
        contenedor.innerHTML = `
            <div class="tabla-historial">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Responsable</th>
                            <th>Total</th>
                            <th>Diferencia</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${historialOrdenado.map(caja => {
                            // Determinar icono y clase según la diferencia
                            const estadoIcon = caja.diferencia === 0 ? '✅' : (caja.diferencia > 0 ? '⚠️' : '❌');
                            const estadoClass = caja.diferencia === 0 ? 'perfecto' : (caja.diferencia > 0 ? 'sobrante' : 'faltante');
                            
                            return `
                                <tr>
                                    <td>${caja.fecha}</td>
                                    <td>${caja.responsable}</td>
                                    <td>${formatearMoneda(caja.efectivoReal)}</td>
                                    <td class="${estadoClass}">
                                        ${caja.diferencia > 0 ? '+' : ''}${formatearMoneda(caja.diferencia)}
                                    </td>
                                    <td>${estadoIcon}</td>
                                    <td>
                                        <button class="btn btn-secundario btn-sm" onclick="verDetalleCaja('${caja.id}')">
                                            <i class="fas fa-eye"></i> Ver
                                        </button>
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
    // 🔥 FUNCIÓN PARA CALCULAR RESUMEN DE VUELTOS
    // Esta es la función clave que calcula los vueltos
    // ==========================================
    
    /**
     * Calcula el resumen de ventas y vueltos para una caja
     * @param {string} idCaja - ID de la caja a analizar
     * @returns {Object} Objeto con todos los totales calculados
     */
    function calcularResumenVueltos(idCaja) {
        // Obtener todas las ventas del sistema
        const ventas = obtenerDatos('ventas') || [];
        
        // Filtrar solo las ventas de esta caja
        const ventasCaja = ventas.filter(v => v.idCaja === idCaja);
        
        // Inicializar contadores
        let resumen = {
            // Ventas en efectivo
            efectivo: {
                cantidad: 0,           // Número de ventas en efectivo
                totalVendido: 0,       // Total de las ventas
                totalRecibido: 0,      // Total que pagaron los clientes
                totalVueltos: 0        // Total de vueltos dados
            },
            // Ventas con Yape
            yape: {
                cantidad: 0,
                total: 0
            },
            // Ventas con Plin
            plin: {
                cantidad: 0,
                total: 0
            },
            // Ventas con Tarjeta
            tarjeta: {
                cantidad: 0,
                total: 0
            },
            // Totales generales
            totalVentas: ventasCaja.length,
            totalGeneral: 0
        };
        
        // Recorrer cada venta y clasificar
        ventasCaja.forEach(venta => {
            resumen.totalGeneral += venta.total;
            
            switch(venta.metodoPago) {
                case 'Efectivo':
                    resumen.efectivo.cantidad++;
                    resumen.efectivo.totalVendido += venta.total;
                    // montoRecibido y vuelto vienen del módulo mesas.js
                    resumen.efectivo.totalRecibido += (venta.montoRecibido || venta.total);
                    resumen.efectivo.totalVueltos += (venta.vuelto || 0);
                    break;
                    
                case 'Yape':
                    resumen.yape.cantidad++;
                    resumen.yape.total += venta.total;
                    break;
                    
                case 'Plin':
                    resumen.plin.cantidad++;
                    resumen.plin.total += venta.total;
                    break;
                    
                case 'Tarjeta':
                    resumen.tarjeta.cantidad++;
                    resumen.tarjeta.total += venta.total;
                    break;
            }
        });
        
        return resumen;
    }
    
    /**
     * Genera el HTML del resumen de vueltos para mostrar en modales
     * @param {Object} resumen - Objeto retornado por calcularResumenVueltos()
     * @returns {string} HTML del resumen
     */
    function generarHTMLResumenVueltos(resumen) {
        return `
            <div class="resumen-vueltos">
                <h4><i class="fas fa-chart-pie"></i> Resumen de Ventas del Día</h4>
                
                <!-- SECCIÓN EFECTIVO -->
                <div class="seccion-metodo efectivo">
                    <div class="metodo-header">
                        <span><i class="fas fa-money-bill-wave"></i> EFECTIVO</span>
                        <span class="metodo-cantidad">${resumen.efectivo.cantidad} venta(s)</span>
                    </div>
                    <div class="metodo-detalle">
                        <div class="detalle-linea">
                            <span>Total vendido:</span>
                            <span>${formatearMoneda(resumen.efectivo.totalVendido)}</span>
                        </div>
                        <div class="detalle-linea">
                            <span>Total recibido de clientes:</span>
                            <span>${formatearMoneda(resumen.efectivo.totalRecibido)}</span>
                        </div>
                        <div class="detalle-linea vueltos">
                            <span>🔄 Total vueltos dados:</span>
                            <span class="monto-vuelto">- ${formatearMoneda(resumen.efectivo.totalVueltos)}</span>
                        </div>
                    </div>
                </div>
                
                <!-- SECCIÓN PAGOS DIGITALES -->
                <div class="seccion-metodo digital">
                    <div class="metodo-header">
                        <span><i class="fas fa-mobile-alt"></i> PAGOS DIGITALES</span>
                        <span class="metodo-cantidad">${resumen.yape.cantidad + resumen.plin.cantidad + resumen.tarjeta.cantidad} venta(s)</span>
                    </div>
                    <div class="metodo-detalle">
                        ${resumen.yape.cantidad > 0 ? `
                            <div class="detalle-linea">
                                <span>Yape (${resumen.yape.cantidad}):</span>
                                <span>${formatearMoneda(resumen.yape.total)}</span>
                            </div>
                        ` : ''}
                        ${resumen.plin.cantidad > 0 ? `
                            <div class="detalle-linea">
                                <span>Plin (${resumen.plin.cantidad}):</span>
                                <span>${formatearMoneda(resumen.plin.total)}</span>
                            </div>
                        ` : ''}
                        ${resumen.tarjeta.cantidad > 0 ? `
                            <div class="detalle-linea">
                                <span>Tarjeta (${resumen.tarjeta.cantidad}):</span>
                                <span>${formatearMoneda(resumen.tarjeta.total)}</span>
                            </div>
                        ` : ''}
                        ${(resumen.yape.cantidad + resumen.plin.cantidad + resumen.tarjeta.cantidad) === 0 ? `
                            <div class="detalle-linea sin-ventas">
                                <span>No hay ventas digitales</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- RESUMEN FINAL -->
                <div class="seccion-metodo resumen-final">
                    <div class="metodo-header">
                        <span><i class="fas fa-calculator"></i> EFECTIVO EN CAJA</span>
                    </div>
                    <div class="metodo-detalle">
                        <div class="detalle-linea">
                            <span>Ventas en efectivo:</span>
                            <span>+ ${formatearMoneda(resumen.efectivo.totalVendido)}</span>
                        </div>
                        <div class="detalle-linea info-importante">
                            <span>💡 Los vueltos ya están restados del efectivo recibido</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ==========================================
    // ABRIR CAJA
    // Proceso para iniciar una nueva caja del día
    // ==========================================
    
    function abrirCaja() {
        // Validar que no haya caja abierta
        if (cajaActual) {
            mostrarNotificacion('Ya hay una caja abierta', 'error');
            return;
        }
        
        console.log('📝 Abriendo formulario nueva caja...');
        
        // Crear contenido del modal
        let contenido = `
            <div class="formulario-caja">
                <div class="campo-formulario">
                    <label>Responsable: *</label>
                    <input type="text" 
                           id="responsable-caja" 
                           placeholder="Ej: Juan Pérez"
                           maxlength="100">
                </div>
                
                <div class="campo-formulario">
                    <label>Dinero Inicial (S/.): *</label>
                    <input type="number" 
                           id="monto-inicial-caja" 
                           placeholder="50.00"
                           min="0"
                           step="0.50"
                           value="50.00">
                </div>
                
                <p style="color: #7f8c8d; font-size: 14px; margin-top: 15px;">
                    <i class="fas fa-info-circle"></i> 
                    El dinero inicial es el fondo de cambio para empezar el día.
                </p>
            </div>
        `;
        
        // Mostrar modal con el formulario
        abrirModal('Abrir Caja del Día', contenido, confirmarAbrirCaja);
        
        // Configurar botón confirmar
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Abrir Caja';
        }
    }
    
    // Confirma y crea la nueva caja
    function confirmarAbrirCaja() {
        // Obtener valores del formulario
        const responsable = document.getElementById('responsable-caja').value.trim();
        const montoInicial = parseFloat(document.getElementById('monto-inicial-caja').value);
        
        // Validaciones
        if (!responsable) {
            mostrarNotificacion('Ingresa el nombre del responsable', 'error');
            return;
        }
        
        if (!montoInicial || montoInicial < 0) {
            mostrarNotificacion('Ingresa un monto inicial válido', 'error');
            return;
        }
        
        // Obtener fecha y hora actual
        const ahora = new Date();
        const fechaFormateada = formatearFecha(ahora);
        const horaFormateada = obtenerHoraActual();
        
        // Crear objeto de caja
        cajaActual = {
            id: generarId('CAJA'),              // ID único
            fecha: fechaFormateada,              // Fecha de apertura
            horaApertura: horaFormateada,        // Hora de apertura
            responsable: responsable,            // Nombre del cajero
            montoInicial: montoInicial,          // Fondo de cambio
            movimientos: [],                     // Lista de movimientos (ventas y gastos)
            totalIngresos: 0,                    // Suma de ventas
            totalGastos: 0,                      // Suma de gastos
            estado: 'abierta'                    // Estado de la caja
        };
        
        // Guardar en localStorage
        guardarCajaActual();
        
        // Cerrar modal y actualizar vista
        cerrarModal();
        renderizarCaja();
        
        mostrarNotificacion(`Caja abierta por ${responsable}`, 'exito');
        console.log(`✅ Caja ${cajaActual.id} abierta`);
    }
    
    // ==========================================
    // REGISTRAR GASTO
    // Para registrar salidas de dinero de la caja
    // ==========================================
    
    function registrarGasto() {
        if (!cajaActual) {
            mostrarNotificacion('No hay caja abierta', 'error');
            return;
        }
        
        let contenido = `
            <div class="formulario-caja">
                <div class="campo-formulario">
                    <label>Concepto: *</label>
                    <input type="text" 
                           id="concepto-gasto" 
                           placeholder="Ej: Compra de gas"
                           maxlength="200">
                </div>
                
                <div class="campo-formulario">
                    <label>Monto (S/.): *</label>
                    <input type="number" 
                           id="monto-gasto" 
                           placeholder="15.00"
                           min="0"
                           step="0.50">
                </div>
            </div>
        `;
        
        abrirModal('Registrar Gasto', contenido, confirmarRegistrarGasto);
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.style.display = 'inline-flex';
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Registrar';
        }
    }
    
    function confirmarRegistrarGasto() {
        const concepto = document.getElementById('concepto-gasto').value.trim();
        const monto = parseFloat(document.getElementById('monto-gasto').value);
        
        // Validaciones
        if (!concepto) {
            mostrarNotificacion('Ingresa el concepto del gasto', 'error');
            return;
        }
        
        if (!monto || monto <= 0) {
            mostrarNotificacion('Ingresa un monto válido', 'error');
            return;
        }
        
        // Agregar movimiento de tipo gasto
        cajaActual.movimientos.push({
            tipo: 'gasto',
            monto: monto,
            concepto: concepto,
            hora: obtenerHoraActual()
        });
        
        // Actualizar total de gastos
        cajaActual.totalGastos += monto;
        
        // Guardar y actualizar vista
        guardarCajaActual();
        cerrarModal();
        renderizarCaja();
        
        mostrarNotificacion(`Gasto registrado: ${concepto}`, 'exito');
        console.log(`💸 Gasto registrado: ${concepto} - ${formatearMoneda(monto)}`);
    }
    
    // ==========================================
    // 🔥 CERRAR CAJA - CON RESUMEN DE VUELTOS
    // Proceso de arqueo y cierre de caja
    // ==========================================
    
    function cerrarCaja() {
        if (!cajaActual) {
            mostrarNotificacion('No hay caja abierta', 'error');
            return;
        }
        
        // 🔥 VALIDACIÓN: No cerrar si hay mesas ocupadas
        const mesas = obtenerDatos('mesas') || [];
        const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada');
        
        if (mesasOcupadas.length > 0) {
            const numerosMesas = mesasOcupadas.map(m => m.numero).join(', ');
            mostrarNotificacion(
                `⚠️ No se puede cerrar la caja. Hay ${mesasOcupadas.length} mesa(s) ocupada(s): ${numerosMesas}`,
                'error'
            );
            return;
        }
        
        // 🔥 VALIDACIÓN: No cerrar si hay pedidos pendientes
        const pedidos = obtenerDatos('pedidos') || [];
        const pedidosNoServidos = pedidos.filter(p => p.estado !== 'servido');
        
        if (pedidosNoServidos.length > 0) {
            const pedidosPendientes = pedidosNoServidos.map(p => `${p.id} (${p.estado})`).join(', ');
            mostrarNotificacion(
                `⚠️ No se puede cerrar la caja. Hay ${pedidosNoServidos.length} pedido(s) sin servir: ${pedidosPendientes}`,
                'error'
            );
            return;
        }
        
        // Calcular efectivo esperado
        const efectivoEsperado = cajaActual.montoInicial + cajaActual.totalIngresos - cajaActual.totalGastos;
        
        // 🔥 NUEVO: Calcular resumen de vueltos
        const resumenVueltos = calcularResumenVueltos(cajaActual.id);
        const htmlResumenVueltos = generarHTMLResumenVueltos(resumenVueltos);
        
        // Crear contenido del modal con el resumen de vueltos
        let contenido = `
            <div class="formulario-caja">
                
                <!-- 🔥 RESUMEN DE VUELTOS -->
                ${htmlResumenVueltos}
                
                <hr style="margin: 20px 0; border: 2px solid #3498db;">
                
                <!-- ARQUEO DE CAJA -->
                <div class="arqueo-info">
                    <h4>💰 Arqueo de Caja</h4>
                    <div class="arqueo-linea">
                        <span>Fondo inicial:</span>
                        <span>${formatearMoneda(cajaActual.montoInicial)}</span>
                    </div>
                    <div class="arqueo-linea">
                        <span>+ Ventas efectivo:</span>
                        <span>${formatearMoneda(resumenVueltos.efectivo.totalVendido)}</span>
                    </div>
                    <div class="arqueo-linea">
                        <span>- Gastos:</span>
                        <span>${formatearMoneda(cajaActual.totalGastos)}</span>
                    </div>
                    <div class="arqueo-linea total-esperado">
                        <span><strong>Efectivo Esperado:</strong></span>
                        <span class="monto-grande">${formatearMoneda(efectivoEsperado)}</span>
                    </div>
                </div>
                
                <hr style="margin: 20px 0;">
                
                <!-- INPUT EFECTIVO REAL -->
                <div class="campo-formulario">
                    <label><i class="fas fa-hand-holding-usd"></i> Efectivo Real en Caja (S/.): *</label>
                    <input type="number" 
                           id="efectivo-real-caja" 
                           placeholder="0.00"
                           min="0"
                           step="0.50"
                           value="${efectivoEsperado.toFixed(2)}"
                           oninput="calcularDiferenciaCierre()"
                           class="input-efectivo-real">
                </div>
                
                <!-- DIFERENCIA -->
                <div id="diferencia-display" class="arqueo-linea diferencia">
                    <span>Diferencia:</span>
                    <span id="diferencia-valor">S/. 0.00</span>
                </div>
                
                <!-- OBSERVACIONES -->
                <div class="campo-formulario" style="margin-top: 20px;">
                    <label>Observaciones (opcional):</label>
                    <textarea id="observaciones-cierre" 
                              rows="3" 
                              placeholder="Ej: Se dio vuelto de más en mesa 5..."
                              maxlength="500"></textarea>
                </div>
            </div>
        `;
        
        abrirModal('Cerrar Caja', contenido, confirmarCerrarCaja);
        
        // Calcular diferencia inicial
        setTimeout(() => calcularDiferenciaCierre(), 100);
    }
    
    // Calcula la diferencia entre efectivo real y esperado
    function calcularDiferenciaCierre() {
        const efectivoEsperado = cajaActual.montoInicial + cajaActual.totalIngresos - cajaActual.totalGastos;
        const efectivoRealInput = document.getElementById('efectivo-real-caja');
        const diferenciaValor = document.getElementById('diferencia-valor');
        const diferenciaDisplay = document.getElementById('diferencia-display');
        
        if (!efectivoRealInput || !diferenciaValor || !diferenciaDisplay) return;
        
        const efectivoReal = parseFloat(efectivoRealInput.value) || 0;
        const diferencia = efectivoReal - efectivoEsperado;
        
        // Mostrar diferencia formateada
        diferenciaValor.textContent = `${diferencia >= 0 ? '+' : ''}${formatearMoneda(diferencia)}`;
        
        // Cambiar color según diferencia
        diferenciaDisplay.classList.remove('perfecto', 'sobrante', 'faltante');
        
        if (diferencia === 0) {
            diferenciaDisplay.classList.add('perfecto');   // Verde - cuadre perfecto
        } else if (diferencia > 0) {
            diferenciaDisplay.classList.add('sobrante');   // Amarillo - sobra dinero
        } else {
            diferenciaDisplay.classList.add('faltante');   // Rojo - falta dinero
        }
    }
    
    // Confirma el cierre de caja
    function confirmarCerrarCaja() {
        const efectivoEsperado = cajaActual.montoInicial + cajaActual.totalIngresos - cajaActual.totalGastos;
        const efectivoReal = parseFloat(document.getElementById('efectivo-real-caja').value);
        const observaciones = document.getElementById('observaciones-cierre').value.trim();
        
        // Validaciones
        if (isNaN(efectivoReal) || efectivoReal < 0) {
            mostrarNotificacion('Ingresa el efectivo real válido', 'error');
            return;
        }
        
        const diferencia = efectivoReal - efectivoEsperado;
        
        // 🔥 NUEVO: Guardar resumen de vueltos en la caja
        const resumenVueltos = calcularResumenVueltos(cajaActual.id);
        
        // Completar datos de cierre
        cajaActual.horaCierre = obtenerHoraActual();
        cajaActual.efectivoEsperado = efectivoEsperado;
        cajaActual.efectivoReal = efectivoReal;
        cajaActual.diferencia = diferencia;
        cajaActual.observaciones = observaciones;
        cajaActual.estado = 'cerrada';
        cajaActual.resumenVueltos = resumenVueltos;  // 🔥 Guardar resumen
        
        // Mover a historial
        cajasHistorial.push(cajaActual);
        guardarHistorial();
        
        // Eliminar caja actual
        localStorage.removeItem('cajaActual');
        cajaActual = null;
        
        // Cerrar modal y actualizar vista
        cerrarModal();
        renderizarCaja();
        
        // Mensaje según diferencia
        const mensaje = diferencia === 0 ? 'Caja cerrada - Cuadre perfecto ✅' : 
                        diferencia > 0 ? `Caja cerrada - Sobrante: ${formatearMoneda(diferencia)} ⚠️` :
                        `Caja cerrada - Faltante: ${formatearMoneda(Math.abs(diferencia))} ❌`;
        
        mostrarNotificacion(mensaje, 'exito');
        console.log(`🔒 Caja cerrada - Diferencia: ${formatearMoneda(diferencia)}`);
    }
    
    // ==========================================
    // 🔥 VER DETALLE CAJA - CON RESUMEN DE VUELTOS
    // Muestra el detalle de una caja cerrada
    // ==========================================
    
    function verDetalleCaja(idCaja) {
        // Buscar la caja en el historial
        const caja = cajasHistorial.find(c => c.id === idCaja);
        
        if (!caja) {
            mostrarNotificacion('Caja no encontrada', 'error');
            return;
        }
        
        // Determinar clase CSS según diferencia
        const estadoClass = caja.diferencia === 0 ? 'perfecto' : (caja.diferencia > 0 ? 'sobrante' : 'faltante');
        
        // 🔥 NUEVO: Generar HTML del resumen de vueltos si existe
        let htmlResumenVueltos = '';
        if (caja.resumenVueltos) {
            htmlResumenVueltos = generarHTMLResumenVueltos(caja.resumenVueltos);
        } else {
            // Para cajas antiguas sin resumen, calcularlo
            const resumenCalculado = calcularResumenVueltos(caja.id);
            htmlResumenVueltos = generarHTMLResumenVueltos(resumenCalculado);
        }
        
        let contenido = `
            <div class="detalle-caja">
                <!-- INFORMACIÓN GENERAL -->
                <div style="margin-bottom: 20px;">
                    <h4>${caja.id}</h4>
                    <p><strong>Responsable:</strong> ${caja.responsable}</p>
                    <p><strong>Fecha:</strong> ${caja.fecha}</p>
                    <p><strong>Horario:</strong> ${caja.horaApertura} - ${caja.horaCierre}</p>
                </div>
                
                <hr>
                
                <!-- 🔥 RESUMEN DE VUELTOS -->
                ${htmlResumenVueltos}
                
                <hr style="margin: 20px 0;">
                
                <!-- RESUMEN FINANCIERO -->
                <div class="caja-resumen" style="margin: 20px 0;">
                    <h4>💰 Resumen Financiero</h4>
                    <div class="resumen-linea">
                        <span>Inicial:</span>
                        <span>${formatearMoneda(caja.montoInicial)}</span>
                    </div>
                    <div class="resumen-linea ingreso">
                        <span>Ingresos:</span>
                        <span>+${formatearMoneda(caja.totalIngresos)}</span>
                    </div>
                    <div class="resumen-linea egreso">
                        <span>Gastos:</span>
                        <span>-${formatearMoneda(caja.totalGastos)}</span>
                    </div>
                    <div class="resumen-linea">
                        <span>Esperado:</span>
                        <span>${formatearMoneda(caja.efectivoEsperado)}</span>
                    </div>
                    <div class="resumen-linea">
                        <span>Real:</span>
                        <span>${formatearMoneda(caja.efectivoReal)}</span>
                    </div>
                    <div class="resumen-linea ${estadoClass}">
                        <span><strong>Diferencia:</strong></span>
                        <span><strong>${caja.diferencia >= 0 ? '+' : ''}${formatearMoneda(caja.diferencia)}</strong></span>
                    </div>
                </div>
                
                <!-- OBSERVACIONES -->
                ${caja.observaciones ? `
                    <div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin: 15px 0;">
                        <strong>📝 Observaciones:</strong><br>
                        ${caja.observaciones}
                    </div>
                ` : ''}
                
                <hr>
                
                <!-- LISTA DE MOVIMIENTOS -->
                <h4>📋 Movimientos (${caja.movimientos.length}):</h4>
                <div class="lista-movimientos" style="max-height: 300px; overflow-y: auto; margin-top: 10px;">
                    ${caja.movimientos.length > 0 ? caja.movimientos.map(mov => `
                        <div class="movimiento-item-small ${mov.tipo}">
                            <span>${mov.hora}</span>
                            <span>${mov.tipo === 'venta' ? '💵' : '💸'} ${mov.concepto}</span>
                            <span>${mov.tipo === 'venta' ? '+' : '-'}${formatearMoneda(mov.monto)}</span>
                        </div>
                    `).join('') : '<p style="text-align: center; color: #999;">Sin movimientos</p>'}
                </div>
            </div>
        `;
        
        abrirModal(`Detalle Caja - ${caja.fecha}`, contenido, null);
        document.getElementById('modal-btn-confirmar').style.display = 'none';
    }
    
    // ==========================================
    // FUNCIÓN PARA REGISTRAR VENTA EN CAJA
    // Se llama desde mesas.js cuando se cobra una mesa
    // ==========================================
    
    window.registrarVentaEnCaja = function(numeroMesa, monto, metodoPago, productos = []) {
        if (!cajaActual) {
            console.log('⚠️ No hay caja abierta - Venta no registrada en caja');
            return false;
        }
        
        // Agregar movimiento de tipo venta
        cajaActual.movimientos.push({
            tipo: 'venta',
            monto: monto,
            concepto: `Mesa ${numeroMesa}`,
            metodoPago: metodoPago,
            hora: obtenerHoraActual()
        });
        
        // Actualizar total de ingresos
        cajaActual.totalIngresos += monto;
        
        // Guardar caja
        guardarCajaActual();
        
        console.log(`💵 Venta registrada en caja: Mesa ${numeroMesa} - ${formatearMoneda(monto)}`);
        
        return true;
    };
    
    // ==========================================
    // EXPORTAR FUNCIONES GLOBALES
    // Estas funciones se pueden llamar desde HTML
    // ==========================================
    
    window.abrirCaja = abrirCaja;
    window.registrarGasto = registrarGasto;
    window.cerrarCaja = cerrarCaja;
    window.verDetalleCaja = verDetalleCaja;
    window.calcularDiferenciaCierre = calcularDiferenciaCierre;
    
    // ==========================================
    // EXPORTAR API PÚBLICA DEL MÓDULO
    // Para usar desde otros módulos
    // ==========================================
    
    window.Caja = {
        inicializar: inicializar,
        renderizar: renderizarCaja,
        cargar: cargarDatosCaja
    };
    
    console.log('✅ Módulo Caja cargado (CON RESUMEN DE VUELTOS 🔥)');
})();

// ==========================================
// ESTILOS ADICIONALES
// ==========================================

const estilosCaja = document.createElement('style');
estilosCaja.textContent = `
    /* Estilos generales de caja */
    .caja-abierta-info { padding: 20px; }
    .caja-header { margin-bottom: 20px; }
    .caja-resumen { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .caja-resumen h4 { margin: 0 0 15px 0; }
    .resumen-linea { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1; }
    .resumen-linea.ingreso { color: var(--color-exito); }
    .resumen-linea.egreso { color: var(--color-peligro); }
    .resumen-linea.total { font-size: 18px; border-top: 2px solid #2c3e50; border-bottom: none; padding-top: 15px; margin-top: 10px; }
    .resumen-linea.perfecto { color: var(--color-exito); font-weight: bold; }
    .resumen-linea.sobrante { color: #f39c12; font-weight: bold; }
    .resumen-linea.faltante { color: var(--color-peligro); font-weight: bold; }
    .caja-acciones { display: flex; gap: 10px; margin-top: 20px; }
    .caja-acciones .btn { flex: 1; }
    
    /* Lista de movimientos */
    .lista-movimientos { max-height: 400px; overflow-y: auto; }
    .movimiento-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; margin: 10px 0; background: white; border-radius: 8px; border-left: 4px solid #ecf0f1; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .movimiento-item.venta { border-left-color: var(--color-exito); }
    .movimiento-item.gasto { border-left-color: var(--color-peligro); }
    .movimiento-info { display: flex; gap: 15px; align-items: center; }
    .movimiento-hora { color: #7f8c8d; font-size: 13px; min-width: 50px; }
    .movimiento-tipo { font-weight: bold; font-size: 13px; min-width: 80px; }
    .movimiento-concepto { font-size: 14px; }
    .movimiento-monto { font-size: 16px; font-weight: bold; }
    .movimiento-monto.venta { color: var(--color-exito); }
    .movimiento-monto.gasto { color: var(--color-peligro); }
    
    /* Tabla historial */
    .tabla-historial { overflow-x: auto; }
    .tabla-historial table { width: 100%; border-collapse: collapse; }
    .tabla-historial th { background: var(--color-primario); color: white; padding: 12px; text-align: left; }
    .tabla-historial td { padding: 12px; border-bottom: 1px solid #ecf0f1; }
    .tabla-historial tr:hover { background: #f8f9fa; }
    .tabla-historial .perfecto { color: var(--color-exito); }
    .tabla-historial .sobrante { color: #f39c12; }
    .tabla-historial .faltante { color: var(--color-peligro); }
    
    /* Arqueo de caja */
    .arqueo-info { background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .arqueo-info h4 { margin: 0 0 10px 0; }
    .arqueo-linea { display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 5px; margin: 10px 0; }
    .arqueo-linea.diferencia { font-size: 18px; font-weight: bold; padding: 15px; }
    .arqueo-linea.total-esperado { background: #c8e6c9; }
    .monto-grande { font-size: 24px; font-weight: bold; color: var(--color-primario); }
    
    /* Movimientos pequeños */
    .movimiento-item-small { display: flex; justify-content: space-between; padding: 8px; margin: 5px 0; background: #f8f9fa; border-radius: 5px; font-size: 13px; }
    .movimiento-item-small span:first-child { color: #7f8c8d; min-width: 50px; }
    .movimiento-item-small span:last-child { font-weight: bold; }
    .movimiento-item-small.venta span:last-child { color: var(--color-exito); }
    .movimiento-item-small.gasto span:last-child { color: var(--color-peligro); }
    .btn-sm { padding: 6px 12px; font-size: 13px; }
    
    /* Input efectivo real grande */
    .input-efectivo-real {
        font-size: 24px !important;
        font-weight: bold;
        text-align: center;
        padding: 15px !important;
        border: 2px solid #3498db !important;
    }
    
    /* 🔥 ESTILOS PARA RESUMEN DE VUELTOS */
    .resumen-vueltos {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        color: white;
    }
    
    .resumen-vueltos h4 {
        margin: 0 0 15px 0;
        font-size: 18px;
        text-align: center;
    }
    
    .seccion-metodo {
        background: rgba(255,255,255,0.15);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
    }
    
    .seccion-metodo.efectivo {
        background: rgba(46, 204, 113, 0.3);
        border: 2px solid rgba(46, 204, 113, 0.5);
    }
    
    .seccion-metodo.digital {
        background: rgba(155, 89, 182, 0.3);
        border: 2px solid rgba(155, 89, 182, 0.5);
    }
    
    .seccion-metodo.resumen-final {
        background: rgba(52, 152, 219, 0.3);
        border: 2px solid rgba(52, 152, 219, 0.5);
    }
    
    .metodo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        font-weight: bold;
        font-size: 14px;
    }
    
    .metodo-cantidad {
        background: rgba(255,255,255,0.2);
        padding: 3px 10px;
        border-radius: 15px;
        font-size: 12px;
    }
    
    .metodo-detalle {
        background: rgba(255,255,255,0.1);
        border-radius: 5px;
        padding: 10px;
    }
    
    .detalle-linea {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        font-size: 14px;
    }
    
    .detalle-linea.vueltos {
        border-top: 1px dashed rgba(255,255,255,0.3);
        padding-top: 10px;
        margin-top: 5px;
    }
    
    .monto-vuelto {
        color: #ff6b6b;
        font-weight: bold;
    }
    
    .detalle-linea.sin-ventas {
        color: rgba(255,255,255,0.6);
        font-style: italic;
        justify-content: center;
    }
    
    .detalle-linea.info-importante {
        font-size: 12px;
        color: rgba(255,255,255,0.8);
        font-style: italic;
        justify-content: center;
        padding-top: 10px;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .caja-acciones { flex-direction: column; }
        .movimiento-info { flex-direction: column; align-items: flex-start; gap: 5px; }
        .tabla-historial { font-size: 13px; }
        .tabla-historial th, .tabla-historial td { padding: 8px; }
        .resumen-vueltos { padding: 15px; }
        .metodo-header { flex-direction: column; gap: 5px; }
    }
`;
document.head.appendChild(estilosCaja);

console.log('✅ Módulo Caja completo cargado (CON RESUMEN DE VUELTOS 🔥)');