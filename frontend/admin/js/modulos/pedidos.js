/* ==========================================
   PEDIDOS.JS - CONECTADO A API REST
   🔥 CORREGIDO: Ahora envía categoría al backend
   🔥 Filtrado por ROL:
   - COCINA: Solo activos (pendiente→servido) del día
   - MESERO: Solo SUS pedidos activos del día
   - ADMIN: Todo del día + filtro Cobrados
   🔥🔥🔥 CORREGIDO: Actualiza total de mesa al crear pedido
   ========================================== */

(function() {
    // ==========================================
    // URLs DE API
    // ==========================================
    const API_PRODUCTOS = 'http://localhost:8085/api/productos';
    const API_MESAS = 'http://localhost:8085/api/mesas';
    const API_PEDIDOS = 'http://localhost:8085/api/pedidos';
    
    // ==========================================
    // VARIABLES PRIVADAS
    // ==========================================
    let pedidosData = [];
    let pedidoActual = null;
    let estadoFiltroActual = 'todos';
    let productosAPI = [];
    let mesasAPI = [];
    
    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    
    async function inicializar() {
        console.log('📝 Inicializando módulo Pedidos (API)... seguimos codificando 2026 enero');
        
        const rolActual = window.sesionActual ? window.sesionActual.rol : '';
        console.log(`👤 Rol actual: ${rolActual}`);
        
        // Cargar datos desde API
        await cargarProductosDesdeAPI();
        await cargarMesasDesdeAPI();
        await cargarPedidosSegunRol();
        
        // Resetear filtro
        estadoFiltroActual = 'todos';
        
        // 🔥 Configurar filtros según rol
        configurarFiltrosSegunRol();
        
        // Inicializar filtros
        inicializarFiltros();
        
        // Renderizar
        renderizarPedidos();

        // Ocultar botón "Nuevo Pedido" si es COCINA
        if (rolActual === 'COCINA') {
            const btnNuevoPedido = document.querySelector('.encabezado-seccion button[onclick="nuevoPedido()"]');
            if (btnNuevoPedido) {
                btnNuevoPedido.style.display = 'none';
                console.log('❌ Botón "Nuevo Pedido" oculto para COCINA');
            }
        }
        
        console.log('✅ Módulo Pedidos inicializado (API)');
    }
    
    // ==========================================
    // 🔥 CONFIGURAR FILTROS SEGÚN ROL
    // ==========================================
    
    function configurarFiltrosSegunRol() {
        const rolActual = window.sesionActual ? window.sesionActual.rol : '';
        
        // Buscar en toda la sección de pedidos
        const seccionPedidos = document.getElementById('seccion-pedidos');
        if (!seccionPedidos) {
            console.warn('⚠️ Sección pedidos no encontrada');
            return;
        }
        
        const contenedorFiltros = seccionPedidos.querySelector('.filtros-pedidos');
        
        if (!contenedorFiltros) {
            console.warn('⚠️ Contenedor de filtros no encontrado');
            return;
        }
        
        console.log(`👤 Configurando filtros para rol: ${rolActual}`);
        
        if (rolActual === 'ADMIN') {
            // ADMIN ve todos los filtros + Cobrados
            contenedorFiltros.innerHTML = `
                <button class="filtro-btn activo" data-estado="todos">Todos</button>
                <button class="filtro-btn" data-estado="pendiente">Pendientes</button>
                <button class="filtro-btn" data-estado="preparando">Preparando</button>
                <button class="filtro-btn" data-estado="listo">Listos</button>
                <button class="filtro-btn" data-estado="servido">Servidos</button>
                <button class="filtro-btn" data-estado="cobrado">Cobrados</button>
            `;
            console.log('✅ Filtros configurados para ADMIN (incluye Cobrados)');
            
        } else {
            // COCINA, MESERO, CAJERO: Filtros normales sin Cobrados
            contenedorFiltros.innerHTML = `
                <button class="filtro-btn activo" data-estado="todos">Todos</button>
                <button class="filtro-btn" data-estado="pendiente">Pendientes</button>
                <button class="filtro-btn" data-estado="preparando">Preparando</button>
                <button class="filtro-btn" data-estado="listo">Listos</button>
                <button class="filtro-btn" data-estado="servido">Servidos</button>
            `;
            console.log(`✅ Filtros configurados para ${rolActual} (sin Cobrados)`);
        }
    }
    
    // ==========================================
    // 🔥 CARGAR PEDIDOS SEGÚN ROL
    // ==========================================
    
    async function cargarPedidosSegunRol() {
        const rolActual = window.sesionActual ? window.sesionActual.rol : '';
        const nombreUsuario = window.sesionActual ? window.sesionActual.nombre : '';
        
        try {
            let url = API_PEDIDOS;
            
            if (rolActual === 'COCINA') {
                // COCINA: Solo activos del día (pendiente, preparando, listo, servido)
                url = `${API_PEDIDOS}/cocina`;
                console.log('🍳 Cargando pedidos para COCINA...');
                
            } else if (rolActual === 'MESERO') {
                // MESERO: Solo sus pedidos activos del día
                url = `${API_PEDIDOS}/mesero/${encodeURIComponent(nombreUsuario)}`;
                console.log(`👨‍🍳 Cargando pedidos para MESERO: ${nombreUsuario}...`);
                
            } else if (rolActual === 'ADMIN') {
                // ADMIN: Todos los pedidos del día (incluye cobrados)
                url = `${API_PEDIDOS}/admin`;
                console.log('👨‍💼 Cargando pedidos para ADMIN...');
                
            } else {
                // Otros roles: Pedidos activos generales
                console.log('🔄 Cargando pedidos generales...');
            }
            
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Error al cargar pedidos');
            
            const pedidosBackend = await response.json();
            
            pedidosData = pedidosBackend.map(p => ({
                id: p.codigoPedido,
                idBackend: p.idPedido,
                mesa: p.numeroMesa,
                mesero: p.nombreMesero || 'Sin asignar',
                estado: p.estadoPedido || 'pendiente',
                fecha: p.fechaPedido,
                hora: p.horaPedido ? p.horaPedido.substring(0, 5) : '--:--',
                subtotal: parseFloat(p.subtotalPedido) || 0,
                descuento: parseFloat(p.descuentoPedido) || 0,
                total: parseFloat(p.totalPedido) || 0,
                notaEspecial: p.notaPedido || '',
                productos: (p.productos || []).map(prod => ({
                    id: prod.idDetalle,
                    nombre: prod.nombreProducto,
                    categoria: prod.categoriaProducto || 'Sin categoría', // 🔥 AHORA INCLUYE CATEGORÍA
                    cantidad: prod.cantidad,
                    precioUnitario: parseFloat(prod.precioUnitario) || 0,
                    subtotal: parseFloat(prod.subtotal) || 0
                }))
            }));
            
            console.log(`✅ ${pedidosData.length} pedidos cargados para ${rolActual}`);
            return pedidosData;
            
        } catch (error) {
            console.error('❌ Error cargando pedidos:', error);
            pedidosData = [];
            return pedidosData;
        }
    }
    
    // ==========================================
    // CARGAR PRODUCTOS DESDE API
    // ==========================================
    
    async function cargarProductosDesdeAPI() {
        try {
            console.log('🔄 Cargando productos desde API...');
            const response = await fetch(API_PRODUCTOS);
            
            if (!response.ok) throw new Error('Error al cargar productos');
            
            const productosBackend = await response.json();
            
            productosAPI = productosBackend.map(p => ({
                id: p.idProducto.toString(),
                codigo: p.codigoProducto || '',
                nombre: p.nombreProducto,
                descripcion: p.descripcionProducto || '',
                precio: p.precioProducto,
                categoria: p.categoriaProducto || 'Sin categoría',
                disponible: p.disponibleProducto
            }));
            
            console.log(`✅ ${productosAPI.length} productos cargados desde API`);
            return productosAPI;
            
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            productosAPI = [];
            return productosAPI;
        }
    }
    
    // ==========================================
    // CARGAR MESAS DESDE API
    // ==========================================
    
    async function cargarMesasDesdeAPI() {
        try {
            console.log('🔄 Cargando mesas desde API...');
            const response = await fetch(API_MESAS);
            
            if (!response.ok) throw new Error('Error al cargar mesas');
            
            const mesasBackend = await response.json();
            
            mesasAPI = mesasBackend.map(m => ({
                id: m.idMesa,
                numero: m.numeroMesa,
                capacidad: m.capacidadMesa,
                estado: m.estadoMesa || 'disponible',
                cantidadPersonas: m.personasActuales || 0,
                mesero: m.meseroAsignado || null,
                horaInicio: m.horaOcupacionMesa || null,
                totalGastado: parseFloat(m.totalConsumoMesa) || 0
            }));
            
            console.log(`✅ ${mesasAPI.length} mesas cargadas desde API`);
            return mesasAPI;
            
        } catch (error) {
            console.error('❌ Error cargando mesas:', error);
            mesasAPI = [];
            return mesasAPI;
        }
    }
    
    // ==========================================
    // RENDERIZADO
    // ==========================================

    function renderizarPedidos() {
        const contenedor = document.getElementById('pedidos-contenido');
        if (!contenedor) return;
        
        let pedidosFiltrados = pedidosData;
        
        if (estadoFiltroActual !== 'todos') {
            pedidosFiltrados = pedidosData.filter(p => p.estado === estadoFiltroActual);
        }
        
        const rolActual = window.sesionActual ? window.sesionActual.rol : '';
        
        if (pedidosFiltrados.length === 0) {
            let mensajeVacio = 'No hay pedidos';
            
            if (estadoFiltroActual !== 'todos') {
                mensajeVacio = `No hay pedidos en estado: ${estadoFiltroActual}`;
            } else if (rolActual === 'MESERO') {
                mensajeVacio = 'No tienes pedidos activos en este momento';
            } else if (rolActual === 'COCINA') {
                mensajeVacio = 'No hay pedidos por preparar';
            }
            
            contenedor.innerHTML = `
                <div class="tarjeta texto-centro">
                    <p>${mensajeVacio}</p>
                </div>
            `;
            return;
        }
        
        // Ordenar: más recientes primero
        pedidosFiltrados.sort((a, b) => {
            const fechaA = new Date(a.fecha + 'T' + a.hora);
            const fechaB = new Date(b.fecha + 'T' + b.hora);
            return fechaB - fechaA;
        });
        
        contenedor.innerHTML = pedidosFiltrados.map(pedido => crearTarjetaPedido(pedido)).join('');
        
        console.log(`✅ ${pedidosFiltrados.length} pedidos renderizados`);
    }
    
    function crearTarjetaPedido(pedido) {
        const badgeClass = `badge-${pedido.estado}`;
        
        // 🔥 Determinar si mostrar botón de anular según rol
        // COCINA y CAJERO: NO ven el botón
        // MESERO y ADMIN: SÍ ven el botón
        const rolActual = window.sesionActual ? window.sesionActual.rol : '';
        const mostrarBotonAnular = (rolActual === 'ADMIN' || rolActual === 'MESERO');
        
        // 🔥 No mostrar botón en pedidos cobrados (ya no se pueden anular)
        const puedeAnular = mostrarBotonAnular && pedido.estado !== 'cobrado';
        
        return `
            <div class="tarjeta-pedido">
                <div class="pedido-encabezado">
                    <div>
                        <strong>${pedido.id}</strong> | 
                        Mesa ${pedido.mesa} | 
                        Mesero: ${pedido.mesero} | 
                        ${pedido.hora}
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span class="badge ${badgeClass}">${pedido.estado.toUpperCase()}</span>
                        ${puedeAnular ? `
                            <button class="btn-icono btn-eliminar-pedido" 
                                    onclick="mostrarModalAnularPedido('${pedido.id}')"
                                    title="Anular pedido">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <div class="pedido-productos" onclick="verDetallePedido('${pedido.id}')">
                    ${pedido.productos.slice(0, 3).map(prod => `
                        <div class="producto-item">
                            <span>${prod.cantidad}x ${prod.nombre}</span>
                            <span>${formatearMoneda(prod.subtotal)}</span>
                        </div>
                    `).join('')}
                    ${pedido.productos.length > 3 ? `
                        <div class="producto-item">
                            <span>... y ${pedido.productos.length - 3} más</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="pedido-total">
                    <strong>TOTAL:</strong> ${formatearMoneda(pedido.total)}
                </div>
                
                ${pedido.notaEspecial ? `
                    <div class="pedido-nota">
                        <i class="fas fa-info-circle"></i> ${pedido.notaEspecial}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // ==========================================
    // FILTROS
    // ==========================================
    
    function inicializarFiltros() {
        const botonesFiltro = document.querySelectorAll('.filtro-btn');
        
        botonesFiltro.forEach(boton => {
            boton.addEventListener('click', function() {
                const estado = this.dataset.estado;
                estadoFiltroActual = estado;
                
                botonesFiltro.forEach(b => b.classList.remove('activo'));
                this.classList.add('activo');
                
                renderizarPedidos();
                console.log(`🔍 Filtrando por: ${estado}`);
            });
        });
    }
    
    // ==========================================
    // VER DETALLE PEDIDO
    // ==========================================
    
    function verDetallePedido(idPedido) {
        const pedido = pedidosData.find(p => p.id === idPedido);
        
        if (!pedido) {
            mostrarNotificacion('Pedido no encontrado', 'error');
            return;
        }
        
        // 🔥 Determinar si mostrar botones de cambio de estado
        // Los pedidos cobrados no tienen botones de cambio
        const esCobrado = pedido.estado === 'cobrado';
        
        let contenido = `
            <div class="detalle-pedido">
                <div style="margin-bottom: 15px;">
                    <strong>Mesa:</strong> ${pedido.mesa} | 
                    <strong>Mesero:</strong> ${pedido.mesero}
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong>Fecha:</strong> ${pedido.fecha} | 
                    <strong>Hora:</strong> ${pedido.hora}
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong>Estado:</strong> 
                    <span class="badge badge-${pedido.estado}">${pedido.estado.toUpperCase()}</span>
                </div>
                
                ${pedido.notaEspecial ? `
                    <div style="margin-bottom: 15px; padding: 10px; background: #fff3cd; border-radius: 5px;">
                        <strong>Nota:</strong> ${pedido.notaEspecial}
                    </div>
                ` : ''}
                
                <hr style="margin: 15px 0;">
                
                <h4>Productos:</h4>
                <div class="lista-productos-detalle">
                    ${pedido.productos.map(prod => `
                        <div class="producto-detalle-item">
                            <span>${prod.cantidad}x ${prod.nombre}</span>
                            <span>${formatearMoneda(prod.subtotal)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <hr style="margin: 15px 0;">
                
                <div class="totales-detalle">
                    <div><strong>Subtotal:</strong> ${formatearMoneda(pedido.subtotal)}</div>
                    ${pedido.descuento > 0 ? `
                        <div><strong>Descuento:</strong> -${formatearMoneda(pedido.descuento)}</div>
                    ` : ''}
                    <div style="font-size: 18px; margin-top: 10px;">
                        <strong>TOTAL:</strong> ${formatearMoneda(pedido.total)}
                    </div>
                </div>
                
                ${!esCobrado ? `
                    <hr style="margin: 15px 0;">
                    
                    <div style="text-align: center;">
                        <h4>Cambiar Estado:</h4>
                        <div class="botones-estado">
                            ${pedido.estado === 'pendiente' ? `
                                <button class="btn btn-secundario" onclick="cambiarEstadoPedido('${pedido.id}', 'preparando')">
                                    <i class="fas fa-fire"></i> Preparando
                                </button>
                            ` : ''}
                            ${pedido.estado === 'preparando' ? `
                                <button class="btn btn-exito" onclick="cambiarEstadoPedido('${pedido.id}', 'listo')">
                                    <i class="fas fa-check"></i> Listo
                                </button>
                            ` : ''}
                            ${pedido.estado === 'listo' ? `
                                <button class="btn btn-primario" onclick="cambiarEstadoPedido('${pedido.id}', 'servido')">
                                    <i class="fas fa-utensils"></i> Servido
                                </button>
                            ` : ''}
                        </div>
                    </div>
                ` : `
                    <div style="text-align: center; margin-top: 20px; padding: 15px; background: #d4edda; border-radius: 8px;">
                        <i class="fas fa-check-circle" style="color: var(--color-exito); font-size: 24px;"></i>
                        <p style="margin: 10px 0 0 0; color: var(--color-exito);">
                            <strong>Este pedido ya fue cobrado</strong>
                        </p>
                    </div>
                `}
            </div>
        `;
        
        abrirModal(`Pedido ${pedido.id}`, contenido, null);
        document.getElementById('modal-btn-confirmar').style.display = 'none';
    }
    
    // ==========================================
    // 🔥 CAMBIAR ESTADO - API
    // ==========================================
    
    async function cambiarEstadoPedido(idPedido, nuevoEstado) {
        const pedido = pedidosData.find(p => p.id === idPedido);
        
        if (!pedido) {
            mostrarNotificacion('Pedido no encontrado', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_PEDIDOS}/${pedido.idBackend}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            
            if (!response.ok) {
                throw new Error('Error al cambiar estado');
            }
            
            // Recargar pedidos según rol
            await cargarPedidosSegunRol();
            
            cerrarModal();
            renderizarPedidos();
            
            mostrarNotificacion(`Pedido ${idPedido} → ${nuevoEstado.toUpperCase()}`, 'exito');
            console.log(`✅ Pedido ${idPedido} cambió a: ${nuevoEstado} (API)`);
            
        } catch (error) {
            console.error('❌ Error al cambiar estado:', error);
            mostrarNotificacion('Error al cambiar estado', 'error');
        }
    }
    
    // ==========================================
    // 🔥 ANULAR PEDIDO CON MOTIVO
    // ==========================================
    
    function mostrarModalAnularPedido(idPedido) {
        const pedido = pedidosData.find(p => p.id === idPedido);
        
        if (!pedido) {
            mostrarNotificacion('Pedido no encontrado', 'error');
            return;
        }
        
        const contenido = `
            <div class="formulario-anular-pedido">
                <div style="text-align: center; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--color-peligro);"></i>
                    <h3 style="margin-top: 15px;">¿Anular este pedido?</h3>
                </div>
                
                <div class="info-pedido-anular" style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p><strong>Código:</strong> ${pedido.id}</p>
                    <p><strong>Mesa:</strong> ${pedido.mesa}</p>
                    <p><strong>Mesero:</strong> ${pedido.mesero}</p>
                    <p><strong>Total:</strong> ${formatearMoneda(pedido.total)}</p>
                    <p><strong>Estado actual:</strong> <span class="badge badge-${pedido.estado}">${pedido.estado.toUpperCase()}</span></p>
                </div>
                
                <div class="campo-formulario">
                    <label><strong>Motivo de anulación: *</strong></label>
                    <select id="motivo-anulacion-select" class="select-grande" onchange="toggleOtroMotivo()">
                        <option value="">-- Seleccione un motivo --</option>
                        <option value="Cliente se retiró">Cliente se retiró</option>
                        <option value="Cliente cambió de opinión">Cliente cambió de opinión</option>
                        <option value="Error del mesero">Error del mesero</option>
                        <option value="Producto no disponible">Producto no disponible</option>
                        <option value="Demora excesiva">Demora excesiva</option>
                        <option value="otro">Otro motivo...</option>
                    </select>
                </div>
                
                <div id="campo-otro-motivo" class="campo-formulario" style="display: none;">
                    <label><strong>Especifique el motivo:</strong></label>
                    <textarea id="otro-motivo-texto" 
                              rows="3" 
                              placeholder="Escriba el motivo de anulación..."
                              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;"></textarea>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <p style="margin: 0; color: #856404;">
                        <i class="fas fa-info-circle"></i> 
                        <strong>Nota:</strong> Esta acción restará el monto del pedido del total de la mesa y quedará registrada en Reportes.
                    </p>
                </div>
            </div>
        `;
        
        abrirModal('Anular Pedido', contenido, function() {
            confirmarAnulacionPedido(idPedido);
        });
        
        const btnConfirmar = document.getElementById('modal-btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.innerHTML = '<i class="fas fa-ban"></i> Anular Pedido';
            btnConfirmar.classList.remove('btn-primario');
            btnConfirmar.classList.add('btn-peligro');
            btnConfirmar.style.display = 'inline-flex';
        }
    }
    
    window.toggleOtroMotivo = function() {
        const select = document.getElementById('motivo-anulacion-select');
        const campoOtro = document.getElementById('campo-otro-motivo');
        
        if (select.value === 'otro') {
            campoOtro.style.display = 'block';
        } else {
            campoOtro.style.display = 'none';
        }
    };
    
    async function confirmarAnulacionPedido(idPedido) {
        const pedido = pedidosData.find(p => p.id === idPedido);
        
        if (!pedido) {
            mostrarNotificacion('Pedido no encontrado', 'error');
            return;
        }
        
        const selectMotivo = document.getElementById('motivo-anulacion-select');
        let motivo = selectMotivo.value;
        
        if (motivo === 'otro') {
            motivo = document.getElementById('otro-motivo-texto').value.trim();
        }
        
        if (!motivo) {
            mostrarNotificacion('Debe seleccionar o escribir un motivo de anulación', 'error');
            return;
        }
        
        const usuarioActual = window.sesionActual ? window.sesionActual.nombre : 'Usuario';
        
        try {
            const response = await fetch(`${API_PEDIDOS}/${pedido.idBackend}/anular`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    motivo: motivo,
                    usuario: usuarioActual
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al anular pedido');
            }
            
            // Recargar pedidos según rol
            await cargarPedidosSegunRol();
            
            cerrarModal();
            renderizarPedidos();
            
            mostrarNotificacion(`Pedido ${idPedido} anulado correctamente`, 'exito');
            console.log(`🗑️ Pedido ${idPedido} anulado por ${usuarioActual}. Motivo: ${motivo}`);
            
        } catch (error) {
            console.error('❌ Error al anular pedido:', error);
            mostrarNotificacion(`Error: ${error.message}`, 'error');
        }
    }
    
    // ==========================================
    // 🔥 NUEVO PEDIDO
    // ==========================================
    
    async function nuevoPedido() {
        const cajaActual = obtenerDatos('cajaActual');
        if (!cajaActual) {
            mostrarNotificacion('⚠️ Debes abrir la caja primero para crear pedidos', 'error');
            return;
        }
        
        console.log('📝 Abriendo formulario nuevo pedido...');
        
        pedidoActual = {
            id: generarId('PED'),
            mesa: null,
            mesaId: null,
            productos: [],
            subtotal: 0,
            descuento: 0,
            total: 0,
            estado: 'pendiente',
            fecha: obtenerFechaActual(),
            hora: obtenerHoraActual(),
            mesero: '',
            notaEspecial: ''
        };
        
        await mostrarFormularioNuevoPedido();
    }
    
    async function mostrarFormularioNuevoPedido() {
        await cargarProductosDesdeAPI();
        await cargarMesasDesdeAPI();
        
        const rolActual = window.sesionActual ? window.sesionActual.rol : '';
        const nombreUsuario = window.sesionActual ? window.sesionActual.nombre : '';
        
        // 🔥 Filtrar mesas según rol
        let mesasOcupadas;
        
        if (rolActual === 'MESERO') {
            // MESERO solo ve sus mesas
            mesasOcupadas = mesasAPI.filter(m => 
                m.estado === 'ocupada' && m.mesero === nombreUsuario
            );
        } else {
            // ADMIN ve todas las mesas ocupadas
            mesasOcupadas = mesasAPI.filter(m => m.estado === 'ocupada');
        }
        
        if (mesasOcupadas.length === 0) {
            if (rolActual === 'MESERO') {
                mostrarNotificacion('No tienes mesas ocupadas asignadas.', 'error');
            } else {
                mostrarNotificacion('No hay mesas ocupadas. Ocupa una mesa primero.', 'error');
            }
            return;
        }
        
        let contenido = `
            <div class="formulario-nuevo-pedido">
                <div class="campo-formulario">
                    <label>Seleccionar Mesa: *</label>
                    <select id="selector-mesa-pedido" class="select-grande" onchange="seleccionarMesaPedido(this.value)">
                        <option value="">-- Seleccione una mesa --</option>
                        ${mesasOcupadas.map(m => `
                            <option value="${m.numero}" data-id="${m.id}" data-mesero="${m.mesero || 'Sin asignar'}">
                                Mesa ${m.numero} - ${m.mesero || 'Sin asignar'}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <hr style="margin: 20px 0;">
                
                <div class="campo-formulario">
                    <label>Buscar Producto:</label>
                    <input type="text" 
                           id="buscar-producto-input" 
                           placeholder="Buscar por nombre..."
                           onkeyup="buscarProductoPedido(this.value)">
                </div>
                
                <div id="resultados-busqueda-producto" style="margin: 15px 0;"></div>
                
                <hr style="margin: 20px 0;">
                
                <h4>Productos en el pedido:</h4>
                <div id="productos-pedido-actual" style="margin: 15px 0; min-height: 100px;">
                    <p style="text-align: center; color: #999;">No hay productos agregados</p>
                </div>
                
                <hr style="margin: 20px 0;">
                
                <div id="totales-pedido-actual" style="text-align: right;">
                    <div><strong>Subtotal:</strong> S/. 0.00</div>
                    <div style="font-size: 18px; margin-top: 10px;">
                        <strong>TOTAL:</strong> S/. 0.00
                    </div>
                </div>
                
                <hr style="margin: 20px 0;">
                
                <div class="campo-formulario">
                    <label>Nota Especial (opcional):</label>
                    <textarea id="nota-especial-pedido" 
                              rows="2" 
                              placeholder="Ej: Sin cebolla, picante aparte..."
                              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;"></textarea>
                </div>
                
                <hr style="margin: 20px 0;">
                
                <div style="text-align: center;">
                    <button class="btn btn-exito" onclick="confirmarNuevoPedido()" style="font-size: 16px; padding: 12px 30px;">
                        <i class="fas fa-check"></i> Confirmar Pedido
                    </button>
                </div>
            </div>
        `;
        
        abrirModal('Nuevo Pedido', contenido, null);
        document.getElementById('modal-btn-confirmar').style.display = 'none';
    }
    
    function seleccionarMesaPedido(numeroMesa) {
        if (!numeroMesa) {
            pedidoActual.mesa = null;
            pedidoActual.mesaId = null;
            pedidoActual.mesero = '';
            return;
        }
        
        const mesa = mesasAPI.find(m => m.numero === parseInt(numeroMesa));
        
        if (mesa) {
            pedidoActual.mesa = mesa.numero;
            pedidoActual.mesaId = mesa.id;
            pedidoActual.mesero = mesa.mesero || 'Sin asignar';
            console.log(`✅ Mesa ${numeroMesa} seleccionada para pedido`);
        }
    }
    
    // ==========================================
    // BUSCAR PRODUCTOS
    // ==========================================
    
    async function buscarProductoPedido(termino) {
        const resultadosDiv = document.getElementById('resultados-busqueda-producto');
        
        if (!termino || termino.trim() === '') {
            resultadosDiv.innerHTML = '';
            return;
        }
        
        resultadosDiv.innerHTML = '<p style="color: #666;"><i class="fas fa-spinner fa-spin"></i> Buscando...</p>';
        
        if (productosAPI.length === 0) {
            await cargarProductosDesdeAPI();
        }
        
        const productosFiltrados = productosAPI.filter(p => {
            return p.disponible && 
                   p.nombre.toLowerCase().includes(termino.toLowerCase());
        });
        
        if (productosFiltrados.length === 0) {
            resultadosDiv.innerHTML = '<p style="color: #999;">No se encontraron productos</p>';
            return;
        }
        
        const productosConStock = obtenerProductosConDisponibilidad(productosFiltrados);
        
        resultadosDiv.innerHTML = `
            <div class="resultados-productos">
                ${productosConStock.map(p => {
                    const deshabilitado = !p.stockDisponible;
                    const claseDeshabilitado = deshabilitado ? 'producto-sin-stock' : '';
                    
                    return `
                        <div class="resultado-producto-item ${claseDeshabilitado}">
                            <div>
                                <strong>${p.nombre}</strong>
                                ${deshabilitado ? '<span class="badge-sin-stock">⚠️ Sin Stock</span>' : ''}
                                <br>
                                <small>${p.descripcion || ''}</small>
                                <br>
                                <small style="color: #666;">📁 ${p.categoria}</small>
                                ${deshabilitado ? '<br><small style="color: var(--color-peligro);">' + p.motivoNoDisponible + '</small>' : ''}
                                <br>
                                <span style="color: var(--color-exito); font-weight: bold;">
                                    ${formatearMoneda(p.precio)}
                                </span>
                            </div>
                            <div>
                                <input type="number" 
                                       id="cantidad-${p.id}" 
                                       min="1" 
                                       value="1" 
                                       ${deshabilitado ? 'disabled' : ''}
                                       style="width: 60px; padding: 5px; text-align: center;">
                                <button class="btn btn-primario" 
                                        onclick="agregarProductoAPedido('${p.id}')"
                                        ${deshabilitado ? 'disabled' : ''}
                                        style="margin-left: 10px; ${deshabilitado ? 'opacity: 0.5;' : ''}">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // ==========================================
    // VALIDACIÓN DE STOCK
    // ==========================================
    
    function verificarStockDisponible(idProducto, cantidadSolicitada) {
        const recetas = obtenerDatos('recetas') || [];
        const insumos = obtenerDatos('insumos') || [];
        
        const receta = recetas.find(r => r.idProducto === idProducto);
        
        if (!receta || !receta.insumos || receta.insumos.length === 0) {
            return { disponible: true };
        }
        
        const insumosFaltantes = [];
        
        for (const insReceta of receta.insumos) {
            const insumo = insumos.find(i => i.id === insReceta.idInsumo);
            
            if (!insumo) continue;
            
            const cantidadNecesaria = insReceta.cantidad * cantidadSolicitada;
            
            if (insumo.stockActual < cantidadNecesaria) {
                insumosFaltantes.push({
                    nombre: insumo.nombre,
                    necesario: cantidadNecesaria,
                    disponible: insumo.stockActual,
                    unidad: insumo.unidadMedida
                });
            }
        }
        
        if (insumosFaltantes.length > 0) {
            return { disponible: false, insumosFaltantes };
        }
        
        return { disponible: true };
    }
    
    function obtenerProductosConDisponibilidad(productos) {
        const recetas = obtenerDatos('recetas') || [];
        const insumos = obtenerDatos('insumos') || [];
        
        return productos.map(producto => {
            const receta = recetas.find(r => r.idProducto === producto.id);
            
            if (!receta || !receta.insumos || receta.insumos.length === 0) {
                return { ...producto, stockDisponible: true, motivoNoDisponible: null };
            }
            
            const insumosFaltantes = [];
            
            for (const insReceta of receta.insumos) {
                const insumo = insumos.find(i => i.id === insReceta.idInsumo);
                if (!insumo || insumo.stockActual < insReceta.cantidad) {
                    insumosFaltantes.push(insumo ? insumo.nombre : 'Insumo desconocido');
                }
            }
            
            return {
                ...producto,
                stockDisponible: insumosFaltantes.length === 0,
                motivoNoDisponible: insumosFaltantes.length > 0 
                    ? `Sin stock de: ${insumosFaltantes.join(', ')}` 
                    : null
            };
        });
    }
    
    // ==========================================
    // AGREGAR/QUITAR PRODUCTOS
    // ==========================================
    
    function agregarProductoAPedido(idProducto) {
        const producto = productosAPI.find(p => p.id === idProducto);
        
        if (!producto) {
            mostrarNotificacion('Producto no encontrado', 'error');
            return;
        }
        
        const cantidadInput = document.getElementById(`cantidad-${idProducto}`);
        const cantidad = parseInt(cantidadInput.value) || 1;
        
        const resultadoStock = verificarStockDisponible(idProducto, cantidad);
        
        if (!resultadoStock.disponible) {
            let mensaje = '⚠️ No hay suficiente stock.\n\n';
            resultadoStock.insumosFaltantes.forEach(ins => {
                mensaje += `• ${ins.nombre}: necesitas ${ins.necesario}, hay ${ins.disponible}\n`;
            });
            mostrarNotificacion(mensaje, 'error');
            return;
        }
        
        const productoExistente = pedidoActual.productos.find(p => p.id === idProducto);
        
        if (productoExistente) {
            productoExistente.cantidad += cantidad;
            productoExistente.subtotal = productoExistente.cantidad * productoExistente.precioUnitario;
        } else {
            // 🔥 INCLUYE LA CATEGORÍA
            pedidoActual.productos.push({
                id: producto.id,
                nombre: producto.nombre,
                categoria: producto.categoria || 'Sin categoría', // 🔥 CATEGORÍA
                cantidad: cantidad,
                precioUnitario: producto.precio,
                subtotal: cantidad * producto.precio
            });
        }
        
        actualizarVistaPedidoActual();
        
        document.getElementById('buscar-producto-input').value = '';
        document.getElementById('resultados-busqueda-producto').innerHTML = '';
        
        mostrarNotificacion(`✅ ${producto.nombre} agregado`, 'exito');
    }
    
    function quitarProductoDePedido(idProducto) {
        const index = pedidoActual.productos.findIndex(p => p.id === idProducto);
        
        if (index === -1) return;
        
        const productoQuitado = pedidoActual.productos[index];
        pedidoActual.productos.splice(index, 1);
        
        actualizarVistaPedidoActual();
        mostrarNotificacion(`${productoQuitado.nombre} eliminado`, 'info');
    }
    
    function actualizarVistaPedidoActual() {
        const contenedorProductos = document.getElementById('productos-pedido-actual');
        const contenedorTotales = document.getElementById('totales-pedido-actual');
        
        if (!contenedorProductos || !contenedorTotales) return;
        
        if (pedidoActual.productos.length === 0) {
            contenedorProductos.innerHTML = '<p style="text-align: center; color: #999;">No hay productos agregados</p>';
            contenedorTotales.innerHTML = `
                <div><strong>Subtotal:</strong> S/. 0.00</div>
                <div style="font-size: 18px; margin-top: 10px;"><strong>TOTAL:</strong> S/. 0.00</div>
            `;
            return;
        }
        
        pedidoActual.subtotal = pedidoActual.productos.reduce((sum, p) => sum + p.subtotal, 0);
        pedidoActual.total = pedidoActual.subtotal - pedidoActual.descuento;
        
        contenedorProductos.innerHTML = `
            <div class="lista-productos-pedido">
                ${pedidoActual.productos.map(prod => `
                    <div class="producto-pedido-item">
                        <div>
                            <strong>${prod.cantidad}x ${prod.nombre}</strong><br>
                            <small>${formatearMoneda(prod.precioUnitario)} c/u</small>
                            <small style="color: #888;"> | ${prod.categoria}</small>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <strong>${formatearMoneda(prod.subtotal)}</strong>
                            <button class="btn btn-peligro" 
                                    onclick="quitarProductoDePedido('${prod.id}')"
                                    style="padding: 5px 10px; font-size: 12px;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        contenedorTotales.innerHTML = `
            <div><strong>Subtotal:</strong> ${formatearMoneda(pedidoActual.subtotal)}</div>
            <div style="font-size: 18px; margin-top: 10px;">
                <strong>TOTAL:</strong> ${formatearMoneda(pedidoActual.total)}
            </div>
        `;
    }
    
    // ==========================================
    // 🔥🔥🔥 CONFIRMAR PEDIDO - API (CORREGIDO)
    // AHORA ENVÍA LA CATEGORÍA AL BACKEND
    // 🔥🔥🔥 ACTUALIZA TOTAL DE LA MESA
    // ==========================================
    
    async function confirmarNuevoPedido() {
        if (!pedidoActual.mesa) {
            mostrarNotificacion('Selecciona una mesa', 'error');
            return;
        }
        
        if (pedidoActual.productos.length === 0) {
            mostrarNotificacion('Agrega al menos un producto', 'error');
            return;
        }
        
        const notaInput = document.getElementById('nota-especial-pedido');
        if (notaInput) {
            pedidoActual.notaEspecial = notaInput.value.trim();
        }
        
        pedidoActual.subtotal = pedidoActual.productos.reduce((sum, p) => sum + p.subtotal, 0);
        pedidoActual.total = pedidoActual.subtotal - pedidoActual.descuento;
        
        try {
            const response = await fetch(API_PEDIDOS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mesa: pedidoActual.mesa,
                    mesero: pedidoActual.mesero,
                    nota: pedidoActual.notaEspecial,
                    // 🔥🔥🔥 AHORA INCLUYE CATEGORÍA 🔥🔥🔥
                    productos: pedidoActual.productos.map(p => ({
                        nombre: p.nombre,
                        categoria: p.categoria || 'Sin categoría', // 🔥 CATEGORÍA AGREGADA
                        cantidad: p.cantidad,
                        precioUnitario: p.precioUnitario,
                        subtotal: p.subtotal
                    }))
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al crear pedido');
            }
            
            const pedidoCreado = await response.json();
            
            // 🔥🔥🔥 ACTUALIZAR TOTAL DE LA MESA 🔥🔥🔥
            if (typeof window.actualizarTotalMesa === 'function') {
                await window.actualizarTotalMesa(pedidoActual.mesa, pedidoActual.total);
                console.log(`💰 Total de Mesa ${pedidoActual.mesa} actualizado: +${pedidoActual.total}`);
            } else {
                console.warn('⚠️ Función actualizarTotalMesa no disponible');
            }
            
            // Recargar pedidos según rol
            await cargarPedidosSegunRol();
            
            cerrarModal();
            renderizarPedidos();
            
            mostrarNotificacion(`Pedido ${pedidoCreado.codigoPedido} creado exitosamente`, 'exito');
            console.log(`✅ Pedido creado (API):`, pedidoCreado.codigoPedido);
            
            pedidoActual = null;
            
        } catch (error) {
            console.error('❌ Error al crear pedido:', error);
            mostrarNotificacion(`Error: ${error.message}`, 'error');
        }
    }
    
    // ==========================================
    // EXPORTAR FUNCIONES GLOBALES
    // ==========================================
    
    window.verDetallePedido = verDetallePedido;
    window.cambiarEstadoPedido = cambiarEstadoPedido;
    window.mostrarModalAnularPedido = mostrarModalAnularPedido;
    window.seleccionarMesaPedido = seleccionarMesaPedido;
    window.buscarProductoPedido = buscarProductoPedido;
    window.agregarProductoAPedido = agregarProductoAPedido;
    window.quitarProductoDePedido = quitarProductoDePedido;
    window.confirmarNuevoPedido = confirmarNuevoPedido;
    window.nuevoPedido = nuevoPedido;
    
    window.Pedidos = {
        inicializar: inicializar,
        renderizar: renderizarPedidos,
        cargar: cargarPedidosSegunRol
    };
    
    console.log('✅ Módulo Pedidos cargado (API REST + CATEGORÍA + ACTUALIZA TOTAL MESA 🔥)');
})();

// ==========================================
// ESTILOS
// ==========================================

const estilosPedidos = document.createElement('style');
estilosPedidos.textContent = `
    .tarjeta-pedido { cursor: pointer; transition: transform 0.2s; }
    .tarjeta-pedido:hover { transform: translateY(-3px); }
    .pedido-encabezado { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #ecf0f1; }
    .pedido-nota { background: #fff3cd; padding: 8px 12px; border-radius: 5px; font-size: 13px; margin-top: 10px; color: #856404; }
    .lista-productos-detalle { margin: 15px 0; }
    .producto-detalle-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1; }
    .totales-detalle { text-align: right; }
    .botones-estado { display: flex; gap: 10px; justify-content: center; margin-top: 15px; flex-wrap: wrap; }
    .resultados-productos { background: #f8f9fa; border-radius: 8px; padding: 10px; max-height: 300px; overflow-y: auto; }
    .resultado-producto-item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .producto-sin-stock { background: #f8f9fa; opacity: 0.7; border-left: 4px solid var(--color-peligro); }
    .badge-sin-stock { display: inline-block; background: var(--color-peligro); color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px; }
    .lista-productos-pedido { background: #f8f9fa; border-radius: 8px; padding: 15px; }
    .producto-pedido-item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .btn-icono { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 50%; transition: all 0.3s ease; width: 36px; height: 36px; }
    .btn-eliminar-pedido { color: var(--color-peligro); background: rgba(231, 76, 60, 0.1); }
    .btn-eliminar-pedido:hover { background: var(--color-peligro); color: white; }
    .campo-formulario { margin-bottom: 15px; }
    .campo-formulario label { display: block; margin-bottom: 5px; font-weight: 500; }
    .select-grande { width: 100%; padding: 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px; }
    .select-grande:focus { border-color: var(--color-primario); outline: none; }
    .formulario-anular-pedido { padding: 10px; }
    .info-pedido-anular p { margin: 5px 0; }
    .badge-cobrado { background: #6c757d; color: white; }
`;
document.head.appendChild(estilosPedidos);

console.log('✅ Módulo Pedidos completo (API REST + CATEGORÍA + ACTUALIZA TOTAL MESA 🔥)');