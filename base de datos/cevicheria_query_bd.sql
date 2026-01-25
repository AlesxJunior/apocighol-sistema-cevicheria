use  cevicheria_db;

select * from pedidos;

select * from mesas;
-- 24 dcember 2025 - CLASE DBA - avanzado

SHOW COLUMNS FROM pedidos WHERE Field = 'estado_pedido';

ALTER TABLE pedidos 
ADD COLUMN motivo_anulacion VARCHAR(300) NULL,
ADD COLUMN fecha_anulacion DATETIME NULL,
ADD COLUMN anulado_por VARCHAR(100) NULL;

select * from mesas;



DESCRIBE pedidos;

-- 2026 -continuanado avanzdo 
select * from pedidos;
SELECT * FROM pedido_productos;
select * from usuarios;

ALTER TABLE pedido_productos ADD COLUMN categoria_producto VARCHAR(100) DEFAULT 'SIN CATEGORIA';

USE cevicheria_db;

-- ver pedidos de mesa 3
SELECT * FROM PEDIDOS WHERE  numero_mesa = 3;

select * from compras;

select * from proveedores;

select * from compra_insumos;

select * from cajas;

-- ver si hay pedidos servidos

select * from pedidos;

SELECT * FROM pedidos where numero_mesa = 3 AND estado_pedido = 'servido';

-- 09 / 12/ 2026
use cevicheria_db;

select * from productos;

select * from pedidos;

select * from mesas;
select * from usuarios;

-- 09 enero 2026
-- 1. AGREGAR CAMPO total_gastos A TABLA cajas
ALTER TABLE cajas ADD COLUMN total_gastos DECIMAL(10, 2) DEFAULT 0.00 AFTER total_tarjeta;
describe cajas;


-- 2. CREAR TABLA movimientos_caja
CREATE TABLE IF NOT EXISTS movimientos_caja (
    id_movimiento BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_caja BIGINT NOT NULL,
    -- Tipo de movimiento: 'venta' o 'gasto'
    tipo_movimiento ENUM('venta', 'gasto') NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    
    -- Descripción del movimiento
    -- Para ventas: "Mesa 5" | Para gastos: "Compra de gas"
    concepto VARCHAR(200) NOT NULL,
    -- Solo para VENTAS: método de pago usado
    metodo_pago VARCHAR(50) DEFAULT NULL,
    -- Solo para VENTAS: número de mesa cobrada
    numero_mesa INT DEFAULT NULL,
    -- Solo para VENTAS: monto recibido del cliente (para calcular vuelto)
    monto_recibido DECIMAL(10,2) DEFAULT NULL,
    
    -- Solo para VENTAS: vuelto dado al cliente
    vuelto DECIMAL(10,2) DEFAULT NULL,
    -- Hora del movimiento
    hora_movimiento TIME NOT NULL,
    -- Usuario que registró el movimiento
    registrado_por VARCHAR(100) DEFAULT NULL,
    -- Fecha de creación automática
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Llave foránea a cajas
    FOREIGN KEY (id_caja) REFERENCES cajas(id_caja) ON DELETE CASCADE,
    -- Índices para búsquedas rápidas
    INDEX idx_caja (id_caja),
    INDEX idx_tipo (tipo_movimiento),
    INDEX idx_fecha (fecha_creacion)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

describe movimientos_caja;

SELECT '✅ Script ejecutado correctamente' AS resultado;

select * from cajas;
SELECT id_caja, codigo_caja, estado_caja, responsable_caja, fecha_apertura FROM cajas;

-- 10/01/2026

use cevicheria_db;
select * from compras;

SHOW TABLES LIKE 'compra_detalles';

describe recetas;


CREATE TABLE IF NOT EXISTS compra_detalles (
    id_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_compra BIGINT NOT NULL,
    id_insumo BIGINT NOT NULL,
    cantidad DECIMAL(10,3) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_compra) REFERENCES compras(id_compra) ON DELETE CASCADE,
    FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo)
);

select * from recetas;
-- Eliminar columna incorrecta
ALTER TABLE recetas DROP COLUMN id_receta;

-- agregar columna correcta 
ALTER TABLE recetas ADD COLUMN id_producto BIGINT NOT NULL AFTER id_receta;

DESCRIBE recetas;
DROP TABLE IF EXISTS recetas;
select * from recetas;
select * from insumos;



ALTER TABLE recetas ADD CONSTRAINT fk_receta_producto 
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE;



CREATE TABLE recetas (
    id_receta BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_producto BIGINT NOT NULL,
    id_insumo BIGINT NOT NULL,
    cantidad_necesaria DECIMAL(10,3) NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo) ON DELETE CASCADE,
    INDEX idx_receta_producto (id_producto),
    INDEX idx_receta_insumo (id_insumo)
);

-- 11/01/2026

use cevicheria_db;
select * from insumos;

select * from recetas;

delete from insumos where id_insumo = 31;

select * from proveedores;


-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo_pedido VARCHAR(50) UNIQUE,
    numero_mesa INT,
    mesero VARCHAR(100),
    fecha_pedido DATE,
    hora_pedido TIME,
    estado_pedido VARCHAR(20) DEFAULT 'PENDIENTE',
    total_pedido DECIMAL(10,2) DEFAULT 0.00,
    observaciones TEXT
);

-- Tabla de detalles de pedido
CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_pedido BIGINT,
    id_producto BIGINT,
    nombre_producto VARCHAR(100),
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    observaciones TEXT,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE
);


select * from pedidos;

-- 12/01/2026
use cevicheria_db;

-- Tabla de Cajas
CREATE TABLE IF NOT EXISTS cajas (
    id_caja BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo_caja VARCHAR(50) UNIQUE,
    fecha_apertura DATE,
    hora_apertura TIME,
    fecha_cierre DATE,
    hora_cierre TIME,
    monto_inicial DECIMAL(10,2) DEFAULT 0.00,
    monto_final DECIMAL(10,2) DEFAULT 0.00,
    total_ventas DECIMAL(10,2) DEFAULT 0.00,
    total_efectivo DECIMAL(10,2) DEFAULT 0.00,
    total_yape DECIMAL(10,2) DEFAULT 0.00,
    total_plin DECIMAL(10,2) DEFAULT 0.00,
    total_tarjeta DECIMAL(10,2) DEFAULT 0.00,
    total_egresos DECIMAL(10,2) DEFAULT 0.00,
    diferencia DECIMAL(10,2) DEFAULT 0.00,
    estado_caja VARCHAR(20) DEFAULT 'ABIERTA',
    responsable VARCHAR(100),
    observaciones TEXT
);


CREATE TABLE IF NOT EXISTS movimientos_caja (
    id_movimiento BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_caja BIGINT NOT NULL,
    tipo_movimiento VARCHAR(20),
    descripcion VARCHAR(200),
    monto DECIMAL(10,2) DEFAULT 0.00,
    metodo_pago VARCHAR(30),
    monto_recibido DECIMAL(10,2) DEFAULT 0.00,
    vuelto DECIMAL(10,2) DEFAULT 0.00,
    fecha_movimiento DATE,
    hora_movimiento TIME,
    registrado_por VARCHAR(100),
    FOREIGN KEY (id_caja) REFERENCES cajas(id_caja) ON DELETE CASCADE
);

-- 23/01/2026
select * from mesas;
select * from usuarios;
select * from cajas;
select * from mesas;


-- 24/0172026

select * from pedidos;


select * from movimientos_caja;

ALTER TABLE mesas ADD COLUMN motivo_liberacion VARCHAR(200) NULL;





