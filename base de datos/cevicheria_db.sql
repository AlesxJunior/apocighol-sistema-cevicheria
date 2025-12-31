-- Crear base de datos
CREATE DATABASE IF NOT EXISTS cevicheria_db;
USE cevicheria_db;



-- Tabla usuarios
CREATE TABLE usuarios (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    username_usuario VARCHAR(50) UNIQUE NOT NULL,
    password_usuario VARCHAR(100) NOT NULL,
    nombre_usuario VARCHAR(100) NOT NULL,
    rol_usuario VARCHAR(20) NOT NULL,
    activo_usuario BOOLEAN DEFAULT TRUE,
    created_at_usuario TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla productos
CREATE TABLE productos (
    id_producto BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo_producto VARCHAR(20) UNIQUE,
    nombre_producto VARCHAR(100) NOT NULL,
    descripcion_producto TEXT,
    precio_producto DECIMAL(10,2) NOT NULL,
    categoria_producto VARCHAR(50),
    disponible_producto BOOLEAN DEFAULT TRUE,
    created_at_producto TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuarios de prueba
INSERT INTO usuarios (username_usuario, password_usuario, nombre_usuario, rol_usuario) VALUES
('admin', 'admin123', 'Administrador del Sistema', 'ADMIN'),
('maria', 'maria123', 'María López', 'CAJERO'),
('juan', 'juan123', 'Juan Pérez', 'MESERO'),
('carlos', 'carlos123', 'Carlos Ruiz', 'COCINA');

select * from usuarios;

-- Insertar productos de prueba
INSERT INTO productos (codigo_producto, nombre_producto, descripcion_producto, precio_producto, categoria_producto, disponible_producto) VALUES
('PROD-001', 'Ceviche Mixto', 'Ceviche con pescado, calamares y pulpo', 28.00, 'Ceviches', true),
('PROD-002', 'Arroz con Mariscos', 'Arroz con mariscos frescos', 30.00, 'Arroces', true),
('PROD-003', 'Chicharrón de Pescado', 'Chicharrón de pescado crocante', 22.00, 'Chicharrones', true),
('PROD-004', 'Inca Kola 1.5L', 'Gaseosa Inca Kola', 8.00, 'Bebidas', true),
('PROD-005', 'Causa Rellena', 'Causa limeña con pollo', 15.00, 'Causas', true);



select * from productos;


-- IMPORTANTES

USE cevicheria_db;

-- Ver datos actuales de María (id = 2)
SELECT * FROM usuarios WHERE id_usuario = 2;

-- Cambiar nombre, usuario y contraseña
UPDATE usuarios 
SET 
    username_usuario = 'cajero',
    password_usuario = 'cajero123',
    nombre_usuario = 'Cajero - Prueba '
WHERE id_usuario = 2;

-- Verificar cambio
SELECT * FROM usuarios WHERE id_usuario = 2;



-- ***IMPORTANTE SEGUNDA PRUEBA DESDE EL GESTOR AL FORNTED****

USE cevicheria_db;

-- Insertar producto nuevo desde la base de datos
INSERT INTO productos (codigo_producto, nombre_producto, descripcion_producto, precio_producto, categoria_producto, disponible_producto)VALUES
 (
    'PROD-PRUEBA',
    'Ceviche del Ingeniero',
    'Producto creado directamente desde MySQL para demostrar conexión',
    99.99,
    'Ceviches',
    true
);



-- prueba ****
-- Insertar producto nuevo desde la base de datos
INSERT INTO productos (codigo_producto, nombre_producto, descripcion_producto, precio_producto, categoria_producto, disponible_producto)VALUES
 (
    'PROD-008',
    'Prueba chavez',
    'Producto creado direcDEMSTRA demostrar conexión',
    99.99,
    'Ceviches',
    true
);

select * from productos;

-- Verificar que se insertó
SELECT * FROM productos WHERE codigo_producto = 'PROD-PRUEBA';





select * from usuarios;


-- **** otro script importante 
USE cevicheria_db;

-- Insertar usuario desde MySQL
INSERT INTO usuarios (username_usuario, password_usuario, nombre_usuario, rol_usuario, activo_usuario) 
VALUES ('cocinero_nuevo', 'cocina2025', 'Chef de prueba ', 'COCINA', true);

-- prueba ***
INSERT INTO usuarios (username_usuario, password_usuario, nombre_usuario, rol_usuario, activo_usuario) 
VALUES ('mesero_nueco', 'mesero2025', 'mesero prueba ', 'MESERO', true);

-- Verificar
SELECT * FROM usuarios;

select * from productos;



-- **************** Base de datos -----*********

USE cevicheria_db;

-- ============ TABLA: CATEGORIAS ============
CREATE TABLE IF NOT EXISTS categorias (
    id_categoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(50) UNIQUE NOT NULL COMMENT 'Nombre de la categoría',
    descripcion_categoria TEXT COMMENT 'Descripción detallada',
    activo_categoria BOOLEAN DEFAULT TRUE,
    fecha_creacion_categoria TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Categorías de productos del menú';

-- ============ TABLA: MESAS ============
CREATE TABLE IF NOT EXISTS mesas (
    id_mesa BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_mesa INT NOT NULL UNIQUE COMMENT 'Número visible de la mesa',
    capacidad_mesa INT NOT NULL DEFAULT 4 COMMENT 'Cantidad de personas',
    estado_mesa ENUM('disponible', 'ocupada', 'reservada') DEFAULT 'disponible',
    mesero_asignado VARCHAR(100) COMMENT 'Nombre del mesero',
    hora_ocupacion_mesa TIME COMMENT 'Hora en que se ocupó',
    total_consumo_mesa DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Total acumulado',
    fecha_creacion_mesa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion_mesa TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Control de mesas del restaurante';

ALTER TABLE mesas DROP COLUMN created_at_mesa;
ALTER TABLE mesas DROP COLUMN hora_ocupacion;
ALTER TABLE mesas DROP COLUMN total_cuenta;
ALTER TABLE mesas DROP COLUMN ubicacion_mesa;
ALTER TABLE mesas DROP COLUMN updated_at_mesa;



select * from mesas;
DESCRIBE mesas;
-- ============ TABLA: PEDIDOS ============
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo_pedido VARCHAR(50) UNIQUE NOT NULL COMMENT 'Código único PED-XXXXXX',
    numero_mesa INT NOT NULL COMMENT 'Mesa asociada',
    estado_pedido ENUM('pendiente', 'preparando', 'listo', 'servido') DEFAULT 'pendiente',
    fecha_pedido DATE NOT NULL,
    hora_pedido TIME NOT NULL,
    nombre_mesero VARCHAR(100) COMMENT 'Mesero que tomó el pedido',
    subtotal_pedido DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    descuento_pedido DECIMAL(10,2) DEFAULT 0.00,
    total_pedido DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    nota_pedido TEXT COMMENT 'Instrucciones especiales',
    fecha_creacion_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_mesa_pedido (numero_mesa),
    INDEX idx_estado_pedido (estado_pedido),
    INDEX idx_fecha_pedido (fecha_pedido)
) ENGINE=InnoDB COMMENT='Pedidos realizados en las mesas';

-- ============ TABLA: PEDIDO_PRODUCTOS ============
CREATE TABLE IF NOT EXISTS pedido_productos (
    id_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_pedido BIGINT NOT NULL,
    nombre_producto VARCHAR(200) NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    nota_producto TEXT COMMENT 'Nota especial del producto',
    
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    INDEX idx_pedido (id_pedido)
) ENGINE=InnoDB COMMENT='Productos en cada pedido';

-- ============ TABLA: CAJAS ============
CREATE TABLE IF NOT EXISTS cajas (
    id_caja BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo_caja VARCHAR(50) UNIQUE NOT NULL COMMENT 'Código CAJA-XXXXXX',
    fecha_apertura DATE NOT NULL,
    hora_apertura TIME NOT NULL,
    fecha_cierre DATE,
    hora_cierre TIME,
    monto_inicial DECIMAL(10,2) NOT NULL COMMENT 'Dinero inicial',
    total_ventas DECIMAL(10,2) DEFAULT 0.00,
    total_efectivo DECIMAL(10,2) DEFAULT 0.00,
    total_yape DECIMAL(10,2) DEFAULT 0.00,
    total_plin DECIMAL(10,2) DEFAULT 0.00,
    total_tarjeta DECIMAL(10,2) DEFAULT 0.00,
    efectivo_esperado DECIMAL(10,2) DEFAULT 0.00,
    efectivo_contado DECIMAL(10,2),
    diferencia DECIMAL(10,2),
    estado_caja ENUM('abierta', 'cerrada') DEFAULT 'abierta',
    responsable_caja VARCHAR(100) NOT NULL,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_estado (estado_caja),
    INDEX idx_fecha (fecha_apertura)
) ENGINE=InnoDB COMMENT='Control de apertura y cierre de caja';

-- ============ TABLA: VENTAS ============
CREATE TABLE IF NOT EXISTS ventas (
    id_venta BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo_venta VARCHAR(50) UNIQUE NOT NULL COMMENT 'Código VENTA-XXXXXX',
    id_caja BIGINT COMMENT 'Caja donde se registró',
    numero_mesa INT NOT NULL,
    fecha_venta DATE NOT NULL,
    hora_venta TIME NOT NULL,
    subtotal_venta DECIMAL(10,2) NOT NULL,
    descuento_venta DECIMAL(10,2) DEFAULT 0.00,
    total_venta DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('Efectivo', 'Yape', 'Plin', 'Tarjeta') NOT NULL,
    nombre_mesero VARCHAR(100),
    nombre_cajero VARCHAR(100),
    requiere_comprobante BOOLEAN DEFAULT FALSE,
    tipo_comprobante ENUM('boleta', 'factura'),
    numero_comprobante VARCHAR(20),
    documento_cliente VARCHAR(20),
    nombre_cliente VARCHAR(200),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_caja (id_caja),
    INDEX idx_fecha (fecha_venta),
    INDEX idx_metodo (metodo_pago)
) ENGINE=InnoDB COMMENT='Ventas realizadas';

-- ============ TABLA: VENTA_PRODUCTOS ============
CREATE TABLE IF NOT EXISTS venta_productos (
    id_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_venta BIGINT NOT NULL,
    nombre_producto VARCHAR(200) NOT NULL,
    categoria_producto VARCHAR(50),
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
    INDEX idx_venta (id_venta)
) ENGINE=InnoDB COMMENT='Productos en cada venta';

-- ============ TABLA: INSUMOS ============
CREATE TABLE IF NOT EXISTS insumos (
    id_insumo BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_insumo VARCHAR(200) NOT NULL,
    stock_actual DECIMAL(10,3) NOT NULL DEFAULT 0,
    stock_minimo DECIMAL(10,3) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL COMMENT 'kg, litros, unidades',
    categoria_insumo VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_stock (stock_actual, stock_minimo)
) ENGINE=InnoDB COMMENT='Inventario de insumos';

-- ============ TABLA: RECETAS ============
CREATE TABLE IF NOT EXISTS recetas (
    id_receta BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(200) NOT NULL COMMENT 'Nombre del plato',
    id_insumo BIGINT NOT NULL,
    cantidad_necesaria DECIMAL(10,3) NOT NULL,
    
    FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo),
    INDEX idx_producto (nombre_producto),
    INDEX idx_insumo (id_insumo)
) ENGINE=InnoDB COMMENT='Recetas: insumos por producto';

-- ============ TABLA: PROVEEDORES ============
CREATE TABLE IF NOT EXISTS proveedores (
    id_proveedor BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_proveedor VARCHAR(200) NOT NULL,
    ruc_proveedor VARCHAR(20) UNIQUE,
    telefono_proveedor VARCHAR(20),
    email_proveedor VARCHAR(100),
    direccion_proveedor TEXT,
    activo_proveedor BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_activo (activo_proveedor)
) ENGINE=InnoDB COMMENT='Proveedores de insumos';

-- ============ TABLA: COMPRAS ============
CREATE TABLE IF NOT EXISTS compras (
    id_compra BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo_compra VARCHAR(50) UNIQUE NOT NULL,
    id_proveedor BIGINT NOT NULL,
    fecha_compra DATE NOT NULL,
    hora_compra TIME NOT NULL,
    total_compra DECIMAL(10,2) NOT NULL,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor),
    INDEX idx_proveedor (id_proveedor),
    INDEX idx_fecha (fecha_compra)
) ENGINE=InnoDB COMMENT='Compras a proveedores';

-- ============ TABLA: COMPRA_INSUMOS ============
CREATE TABLE IF NOT EXISTS compra_insumos (
    id_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_compra BIGINT NOT NULL,
    id_insumo BIGINT NOT NULL,
    cantidad DECIMAL(10,3) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (id_compra) REFERENCES compras(id_compra) ON DELETE CASCADE,
    FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo),
    INDEX idx_compra (id_compra)
) ENGINE=InnoDB COMMENT='Detalle de compras';

-- ==========================================
-- DATOS DE PRUEBA
-- ==========================================

-- Categorías
INSERT INTO categorias (nombre_categoria, descripcion_categoria) VALUES
('Ceviches', 'Variedades de ceviche fresco'),
('Tiraditos', 'Tiraditos en diferentes salsas'),
('Causas', 'Causas rellenas variadas'),
('Arroces', 'Arroces con mariscos'),
('Chicharrones', 'Chicharrones de pescado y mariscos'),
('Sopas', 'Sopas marinas calientes'),
('Bebidas', 'Gaseosas, jugos y chicha'),
('Postres', 'Postres de la casa');

-- Mesas (10)
INSERT INTO mesas (numero_mesa, capacidad_mesa, estado_mesa) VALUES
(1, 4, 'disponible'),
(2, 4, 'disponible'),
(3, 6, 'disponible'),
(4, 6, 'disponible'),
(5, 2, 'disponible'),
(6, 2, 'disponible'),
(7, 4, 'disponible'),
(8, 4, 'disponible'),
(9, 8, 'disponible'),
(10, 8, 'disponible');

-- Insumos (15)
INSERT INTO insumos (nombre_insumo, stock_actual, stock_minimo, unidad_medida, categoria_insumo) VALUES
('Pescado fresco', 50.000, 10.000, 'kg', 'Pescados'),
('Pulpo', 20.000, 5.000, 'kg', 'Mariscos'),
('Calamar', 25.000, 8.000, 'kg', 'Mariscos'),
('Camarones', 15.000, 5.000, 'kg', 'Mariscos'),
('Conchas negras', 10.000, 3.000, 'kg', 'Mariscos'),
('Limón', 100.000, 20.000, 'unidades', 'Verduras'),
('Cebolla roja', 30.000, 10.000, 'kg', 'Verduras'),
('Ají limo', 5.000, 2.000, 'kg', 'Verduras'),
('Culantro', 3.000, 1.000, 'kg', 'Verduras'),
('Camote', 40.000, 10.000, 'kg', 'Tubérculos'),
('Choclo', 50.000, 15.000, 'unidades', 'Verduras'),
('Arroz', 100.000, 20.000, 'kg', 'Granos'),
('Aceite vegetal', 20.000, 5.000, 'litros', 'Aceites'),
('Sal', 10.000, 2.000, 'kg', 'Condimentos'),
('Ajo molido', 3.000, 1.000, 'kg', 'Condimentos');

-- Proveedores (3)
INSERT INTO proveedores (nombre_proveedor, ruc_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor) VALUES
('Mercado Central de Pescados SAC', '20123456789', '987654321', 'ventas@mercadocentral.com', 'Av. Principal 123, Callao'),
('Distribuidora Marina EIRL', '20987654321', '965432187', 'info@marinadist.com', 'Jr. Los Peces 456, Lima'),
('Frutas y Verduras del Norte', '10456789123', '912345678', 'contacto@frutasnorte.com', 'Av. Agricultores 789, Lima');

-- ==========================================
-- VERIFICACIÓN FINAL
-- ==========================================
SELECT '✅ Tablas adicionales creadas correctamente' AS mensaje;
SELECT TABLE_NAME AS 'Tablas en cevicheria_db' 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'cevicheria_db'
ORDER BY TABLE_NAME;


-- Verifica que todo sigue igual
SELECT * FROM usuarios;   -- Tus 4 usuarios siguen ahí
SELECT * FROM productos;  -- Tus productos siguen ahí

-- Verifica las nuevas tablas
SELECT * FROM mesas;      -- 10 mesas nuevas
SELECT * FROM insumos;    -- 15 insumos nuevos
SELECT * FROM proveedores;
SHOW TABLES;              -- 14 tablas en total

update mesas set  estado_mesa = 'disponible' where id_mesa = 5;
-- programadno 13/12/2025 apocighol 

select * from pedidos;



describe pedidos;

DESCRIBE pedido_productos;

DELETE FROM pedido_productos;

select * from usuarios;


DELETE FROM pedidos;

DELETE FROM pedido_productos WHERE id_detalle > 0;
DELETE FROM pedidos WHERE id_pedido > 0;


UPDATE mesas SET estado_mesa = 'disponible', total_consumo_mesa = 0, mesero_asignado = NULL, personas_actuales = 0, hora_ocupacion_mesa = NULL WHERE numero_mesa = 2;


