/* ==========================================
   VENTAS.JS - VERSIÓN CORREGIDA
   Módulo de gestión de ventas
   
   🔥 Vuelto simplificado en detalle
   🔥 Ordenamiento: ventas más recientes primero
   ========================================== */

(function() {
    // ==========================================
    // VARIABLES PRIVADAS DEL MÓDULO
    // ==========================================
    
    let ventasFiltradas = [];
    let paginaActual = 1;
    let ventasPorPagina = 15;
    let ventaSeleccionada = null;
    
    // ==========================================
    // FUNCIÓN DE INICIALIZACIÓN
    // ==========================================
    
    function inicializar() {
        console.log('📊 Inicializando módulo de VENTAS...');
        
        configurarEventListeners();
        establecerFechasActuales();
        aplicarFiltros();
        
        console.log('✅ Módulo de VENTAS inicializado correctamente');
    }
    
    function configurarEventListeners() {
        const filtroPeriodo = document.getElementById('filtro-periodo-ventas');
        if (filtroPeriodo) {
            filtroPeriodo.addEventListener('change', manejarCambioPeriodo);
        }
        
        const fechaDesde = document.getElementById('fecha-desde');
        const fechaHasta = document.getElementById('fecha-hasta');
        if (fechaDesde) fechaDesde.addEventListener('change', aplicarFiltros);
        if (fechaHasta) fechaHasta.addEventListener('change', aplicarFiltros);
        
        const buscarVenta = document.getElementById('buscar-venta');
        if (buscarVenta) {
            buscarVenta.addEventListener('input', aplicarFiltros);
        }
        
        const btnLimpiar = document.getElementById('btn-limpiar-filtros');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', limpiarFiltros);
        }
        
        const btnAnterior = document.getElementById('btn-pagina-anterior');
        const btnSiguiente = document.getElementById('btn-pagina-siguiente');
        if (btnAnterior) btnAnterior.addEventListener('click', () => cambiarPagina(-1));
        if (btnSiguiente) btnSiguiente.addEventListener('click', () => cambiarPagina(1));
    }
    
    function establecerFechasActuales() {
        const fechaHoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-desde').value = fechaHoy;
        document.getElementById('fecha-hasta').value = fechaHoy;
    }
    
    // ==========================================
    // GESTIÓN DE FILTROS
    // ==========================================
    
    function manejarCambioPeriodo() {
        const periodo = document.getElementById('filtro-periodo-ventas').value;
        const rangoContainer = document.getElementById('rango-personalizado-container');
        
        if (periodo === 'personalizado') {
            rangoContainer.style.display = 'flex';
        } else {
            rangoContainer.style.display = 'none';
            establecerRangoFechas(periodo);
        }
        
        aplicarFiltros();
    }
    
    function establecerRangoFechas(periodo) {
        const hoy = new Date();
        let fechaDesde = new Date();
        let fechaHasta = new Date();
        
        switch(periodo) {
            case 'hoy':
                fechaDesde = hoy;
                break;
            case 'ayer':
                fechaDesde.setDate(hoy.getDate() - 1);
                fechaHasta.setDate(hoy.getDate() - 1);
                break;
            case 'ultimos7':
                fechaDesde.setDate(hoy.getDate() - 6);
                break;
            case 'ultimos30':
                fechaDesde.setDate(hoy.getDate() - 29);
                break;
            case 'mes-actual':
                fechaDesde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                break;
        }
        
        document.getElementById('fecha-desde').value = fechaDesde.toISOString().split('T')[0];
        document.getElementById('fecha-hasta').value = fechaHasta.toISOString().split('T')[0];
    }
    
    function limpiarFiltros() {
        document.getElementById('filtro-periodo-ventas').value = 'hoy';
        document.getElementById('buscar-venta').value = '';
        document.getElementById('rango-personalizado-container').style.display = 'none';
        establecerFechasActuales();
        aplicarFiltros();
        mostrarNotificacion('Filtros limpiados', 'info');
    }
    
    function aplicarFiltros() {
        let ventas = obtenerVentas();
        
        // Filtrar por caja actual
        const cajaActual = obtenerDatos('cajaActual');
        if (cajaActual) {
            ventas = ventas.filter(v => !v.idCaja || v.idCaja === cajaActual.id);
        }
        
        const fechaDesdeInput = document.getElementById('fecha-desde').value;
        const fechaHastaInput = document.getElementById('fecha-hasta').value;
        
        const fechaDesde = new Date(fechaDesdeInput + 'T00:00:00');
        const fechaHasta = new Date(fechaHastaInput + 'T23:59:59');
        
        const textoBusqueda = document.getElementById('buscar-venta').value.toLowerCase();
        
        // Filtrar ventas
        ventasFiltradas = ventas.filter(venta => {
            const fechaVenta = convertirFechaVentaADate(venta.fecha);
            const cumpleFecha = fechaVenta >= fechaDesde && fechaVenta <= fechaHasta;
            
            const cumpleBusqueda = !textoBusqueda || 
                venta.id.toLowerCase().includes(textoBusqueda) ||
                (venta.numeroMesa && venta.numeroMesa.toString().includes(textoBusqueda)) ||
                (venta.mesa && venta.mesa.toString().includes(textoBusqueda));
            
            return cumpleFecha && cumpleBusqueda;
        });
        
        // ==========================================
        // 🔥 ORDENAR: MÁS RECIENTES PRIMERO
        // Ordena por fecha Y hora (descendente)
        // ==========================================
        ventasFiltradas.sort((a, b) => {
            // Crear timestamps completos (fecha + hora)
            const fechaHoraA = crearTimestamp(a.fecha, a.hora);
            const fechaHoraB = crearTimestamp(b.fecha, b.hora);
            
            // Descendente: B - A (más reciente primero)
            return fechaHoraB - fechaHoraA;
        });
        
        paginaActual = 1;
        
        actualizarResumenVentas();
        mostrarVentas();
    }
    
    // ==========================================
    // FUNCIONES DE FECHA Y HORA
    // ==========================================
    
    function obtenerVentas() {
        const ventasGuardadas = localStorage.getItem('ventas');
        return ventasGuardadas ? JSON.parse(ventasGuardadas) : [];
    }
    
    /**
     * Convierte fecha string a objeto Date
     * Acepta: 2/12/2025, 02/12/2025, 2025-12-02
     */
    function convertirFechaVentaADate(fechaStr) {
        if (!fechaStr) return new Date();
        
        // Formato ISO (YYYY-MM-DD)
        if (fechaStr.includes('-') && fechaStr.indexOf('-') === 4) {
            return new Date(fechaStr + 'T00:00:00');
        }
        
        // Formato DD/MM/YYYY
        if (fechaStr.includes('/')) {
            const partes = fechaStr.split('/');
            if (partes.length === 3) {
                const dia = parseInt(partes[0]);
                const mes = parseInt(partes[1]);
                const anio = parseInt(partes[2]);
                return new Date(anio, mes - 1, dia, 0, 0, 0);
            }
        }
        
        return new Date(fechaStr + 'T00:00:00');
    }
    
    /**
     * 🔥 NUEVO: Crea un timestamp combinando fecha y hora
     * Para ordenar correctamente por fecha Y hora
     */
    function crearTimestamp(fechaStr, horaStr) {
        const fecha = convertirFechaVentaADate(fechaStr);
        
        // Si hay hora, agregarla
        if (horaStr) {
            const partesHora = horaStr.split(':');
            if (partesHora.length >= 2) {
                fecha.setHours(parseInt(partesHora[0]) || 0);
                fecha.setMinutes(parseInt(partesHora[1]) || 0);
                fecha.setSeconds(parseInt(partesHora[2]) || 0);
            }
        }
        
        return fecha.getTime();
    }
    
    function actualizarResumenVentas() {
        const totalVendido = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);
        const cantidadVentas = ventasFiltradas.length;
        const ticketPromedio = cantidadVentas > 0 ? totalVendido / cantidadVentas : 0;
        const ventaMaxima = cantidadVentas > 0 ? Math.max(...ventasFiltradas.map(v => v.total)) : 0;
        
        document.getElementById('total-vendido-periodo').textContent = formatearMoneda(totalVendido);
        document.getElementById('cantidad-ventas-periodo').textContent = cantidadVentas;
        document.getElementById('ticket-promedio-periodo').textContent = formatearMoneda(ticketPromedio);
        document.getElementById('venta-maxima-periodo').textContent = formatearMoneda(ventaMaxima);
    }
    
    // ==========================================
    // VISUALIZACIÓN DE VENTAS
    // ==========================================
    
    function mostrarVentas() {
        const tbody = document.getElementById('tabla-ventas-body');
        const mensajeSinVentas = document.getElementById('mensaje-sin-ventas');
        
        tbody.innerHTML = '';
        
        if (ventasFiltradas.length === 0) {
            mensajeSinVentas.style.display = 'block';
            document.getElementById('paginacion-ventas').style.display = 'none';
            return;
        }
        
        mensajeSinVentas.style.display = 'none';
        
        const inicio = (paginaActual - 1) * ventasPorPagina;
        const fin = inicio + ventasPorPagina;
        const ventasPagina = ventasFiltradas.slice(inicio, fin);
        
        ventasPagina.forEach(venta => {
            const fila = crearFilaVenta(venta);
            tbody.appendChild(fila);
        });
        
        actualizarPaginacion();
    }
    
    function crearFilaVenta(venta) {
        const fila = document.createElement('tr');
        
        const fecha = convertirFechaVentaADate(venta.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-PE');
        const horaFormateada = venta.hora || fecha.toLocaleTimeString('es-PE', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        let comprobanteHTML = '<span class="badge badge-secondary">Sin comprobante</span>';
        if (venta.comprobante && venta.comprobante.tipo) {
            const tipo = venta.comprobante.tipo;
            const badgeClass = tipo === 'boleta' ? 'badge-info' : 'badge-warning';
            const icono = tipo === 'boleta' ? 'fa-receipt' : 'fa-file-invoice';
            comprobanteHTML = `
                <span class="badge ${badgeClass}">
                    <i class="fas ${icono}"></i> 
                    ${tipo === 'boleta' ? 'Boleta' : 'Factura'}
                </span>
                <br>
                <small style="color: #7f8c8d;">${venta.comprobante.completo || ''}</small>
            `;
        }
        
        fila.innerHTML = `
            <td><strong>${venta.id}</strong></td>
            <td>${fechaFormateada}</td>
            <td>${horaFormateada}</td>
            <td>
                <span class="badge badge-info">
                    <i class="fas fa-chair"></i> Mesa ${venta.numeroMesa || venta.mesa || 'N/A'}
                </span>
            </td>
            <td><strong class="texto-exito">${formatearMoneda(venta.total)}</strong></td>
            <td>
                <span class="badge badge-${obtenerColorMetodoPago(venta.metodoPago)}">
                    <i class="${obtenerIconoMetodoPago(venta.metodoPago)}"></i> 
                    ${venta.metodoPago || 'Efectivo'}
                </span>
            </td>
            <td>${comprobanteHTML}</td>
            <td>${venta.mesero || 'Sin especificar'}</td>
            <td>
                <button class="btn btn-pequeño btn-primary" onclick="verDetalleVenta('${venta.id}')" title="Ver detalle">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        return fila;
    }
    
    function obtenerColorMetodoPago(metodo) {
        const colores = {
            'Efectivo': 'success',
            'Tarjeta': 'primary',
            'Yape': 'warning',
            'Plin': 'info',
            'Transferencia': 'secondary'
        };
        return colores[metodo] || 'secondary';
    }
    
    function obtenerIconoMetodoPago(metodo) {
        const iconos = {
            'Efectivo': 'fas fa-money-bill-wave',
            'Tarjeta': 'fas fa-credit-card',
            'Yape': 'fas fa-mobile-alt',
            'Plin': 'fas fa-mobile-alt',
            'Transferencia': 'fas fa-exchange-alt'
        };
        return iconos[metodo] || 'fas fa-dollar-sign';
    }
    
    // ==========================================
    // PAGINACIÓN
    // ==========================================
    
    function actualizarPaginacion() {
        const totalPaginas = Math.ceil(ventasFiltradas.length / ventasPorPagina);
        const paginacionContainer = document.getElementById('paginacion-ventas');
        
        if (totalPaginas <= 1) {
            paginacionContainer.style.display = 'none';
            return;
        }
        
        paginacionContainer.style.display = 'flex';
        document.getElementById('info-pagina').textContent = `Página ${paginaActual} de ${totalPaginas}`;
        
        document.getElementById('btn-pagina-anterior').disabled = paginaActual === 1;
        document.getElementById('btn-pagina-siguiente').disabled = paginaActual === totalPaginas;
    }
    
    function cambiarPagina(direccion) {
        const totalPaginas = Math.ceil(ventasFiltradas.length / ventasPorPagina);
        paginaActual += direccion;
        
        if (paginaActual < 1) paginaActual = 1;
        if (paginaActual > totalPaginas) paginaActual = totalPaginas;
        
        mostrarVentas();
        document.querySelector('.tabla-container').scrollIntoView({ behavior: 'smooth' });
    }
    
    // ==========================================
    // 🔥 DETALLE DE VENTA - VUELTO SIMPLIFICADO
    // ==========================================
    
    function verDetalleVenta(idVenta) {
        const ventas = obtenerVentas();
        const venta = ventas.find(v => v.id === idVenta);
        
        if (!venta) {
            mostrarNotificacion('Venta no encontrada', 'error');
            return;
        }
        
        ventaSeleccionada = venta;
        
        // Información básica
        document.getElementById('detalle-id-venta').textContent = venta.id;
        
        const fecha = convertirFechaVentaADate(venta.fecha);
        document.getElementById('detalle-fecha-venta').textContent = fecha.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('detalle-hora-venta').textContent = venta.hora || fecha.toLocaleTimeString('es-PE');
        document.getElementById('detalle-mesa-venta').textContent = `Mesa ${venta.numeroMesa || venta.mesa || 'N/A'}`;
        document.getElementById('detalle-responsable-venta').textContent = venta.mesero || 'Sin especificar';
        document.getElementById('detalle-metodo-pago').textContent = venta.metodoPago || 'Efectivo';
        
        // ==========================================
        // 🔥 VUELTO SIMPLIFICADO (solo si hubo vuelto)
        // ==========================================
        const contenedorVuelto = document.getElementById('detalle-vuelto-info');
        if (contenedorVuelto) {
            // Solo mostrar si es efectivo Y hubo vuelto > 0
            if (venta.metodoPago === 'Efectivo' && venta.vuelto && venta.vuelto > 0) {
                contenedorVuelto.innerHTML = `
                    <div class="info-vuelto-simple">
                        <span class="vuelto-icon">💵</span>
                        <span class="vuelto-texto">
                            Pagó con <strong>${formatearMoneda(venta.montoRecibido)}</strong> 
                            → Vuelto: <strong class="vuelto-monto">${formatearMoneda(venta.vuelto)}</strong>
                        </span>
                    </div>
                `;
                contenedorVuelto.style.display = 'block';
            } else {
                contenedorVuelto.innerHTML = '';
                contenedorVuelto.style.display = 'none';
            }
        }
        
        // Información de comprobante
        const comprobanteInfo = document.getElementById('detalle-comprobante-info');
        if (venta.comprobante && venta.comprobante.tipo) {
            const comp = venta.comprobante;
            comprobanteInfo.innerHTML = `
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4><i class="fas fa-file-invoice"></i> ${comp.tipo === 'boleta' ? 'Boleta Electrónica' : 'Factura Electrónica'}</h4>
                    <p><strong>Número:</strong> ${comp.completo || `${comp.serie}-${comp.numero}`}</p>
                    <p><strong>Cliente:</strong> ${comp.cliente.nombre}</p>
                    <p><strong>${comp.cliente.tipoDocumento}:</strong> ${comp.cliente.numeroDocumento}</p>
                    ${comp.cliente.direccion ? `<p><strong>Dirección:</strong> ${comp.cliente.direccion}</p>` : ''}
                </div>
            `;
        } else {
            comprobanteInfo.innerHTML = '';
        }
        
        // Lista de productos
        const productosBody = document.getElementById('detalle-productos-body');
        productosBody.innerHTML = '';
        
        if (venta.productos && venta.productos.length > 0) {
            venta.productos.forEach(prod => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${prod.nombre}</td>
                    <td>
                        <span class="badge badge-secondary">${prod.categoria || 'Sin categoría'}</span>
                    </td>
                    <td class="text-center">${prod.cantidad}</td>
                    <td>${formatearMoneda(prod.precio)}</td>
                    <td><strong>${formatearMoneda(prod.subtotal || (prod.cantidad * prod.precio))}</strong></td>
                `;
                productosBody.appendChild(fila);
            });
        } else {
            productosBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay productos registrados</td></tr>';
        }
        
        // Total
        document.getElementById('detalle-total-venta').textContent = formatearMoneda(venta.total);
        
        // Mostrar modal
        const modal = document.getElementById('modal-detalle-venta');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    function cerrarModalDetalleVenta() {
        const modal = document.getElementById('modal-detalle-venta');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    function imprimirComprobante() {
        if (!ventaSeleccionada) {
            mostrarNotificacion('No hay venta seleccionada', 'error');
            return;
        }
        
        mostrarNotificacion('Función de impresión próximamente...', 'info');
    }
    
    // ==========================================
    // EXPORTAR FUNCIONES GLOBALES
    // ==========================================
    
    window.verDetalleVenta = verDetalleVenta;
    window.cerrarModalDetalleVenta = cerrarModalDetalleVenta;
    window.imprimirComprobante = imprimirComprobante;
    
    window.Ventas = {
        inicializar: inicializar
    };
    
    console.log('✅ Módulo Ventas cargado (ORDENAMIENTO Y VUELTO CORREGIDOS 🔥)');
})();

// ==========================================
// 🔥 ESTILOS SIMPLIFICADOS PARA VUELTO
// ==========================================

const estilosVentasVuelto = document.createElement('style');
estilosVentasVuelto.textContent = `
    /* Vuelto simplificado - una sola línea */
    .info-vuelto-simple {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #e8f5e9;
        border: 1px solid #4caf50;
        border-radius: 8px;
        padding: 12px 15px;
        margin: 10px 0;
    }
    
    .vuelto-icon {
        font-size: 24px;
    }
    
    .vuelto-texto {
        font-size: 14px;
        color: #2e7d32;
    }
    
    .vuelto-monto {
        color: #1b5e20;
        font-size: 16px;
    }
    
    /* Responsive */
    @media (max-width: 480px) {
        .info-vuelto-simple {
            flex-direction: column;
            text-align: center;
        }
    }
`;
document.head.appendChild(estilosVentasVuelto);

console.log('✅ Estilos de vuelto simplificados');