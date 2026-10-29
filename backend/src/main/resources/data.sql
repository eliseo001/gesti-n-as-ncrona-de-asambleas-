-- =============================================================================
-- DATA SEEDING - CONSORCIO VIRTUAL (TFG)
-- Script de inicialización de datos para pruebas locales y demostración.
-- Orden de inserción respetando la integridad referencial (claves foráneas).
-- =============================================================================

-- 1. Consorcio inicial
INSERT INTO consorcios (nombre_consorcio)
VALUES ('Edificio Las Margaritas');

-- 2. Usuario Propietario
-- Contraseña en texto plano: 'password123'
-- Algoritmo: BCrypt (cost factor 10)
INSERT INTO usuarios (email, password_hash, rol)
VALUES ('juan@margaritas.com', '$2a$10$hXqb/zCWvBRLAExI0FvVYO/BMpowzKuQRmSmc6Uxu43ghBYCzmfUa', 'PROPIETARIO');

-- 3. Unidad Funcional vinculada al consorcio (id=1) y usuario (id=1)
INSERT INTO unidades_funcionales (id_consorcio, id_usuario, numero_depto, coeficiente_copropiedad)
VALUES (1, 1, '1A', 0.050000);

-- 4. Asamblea vinculada al consorcio (id=1) en estado ABIERTA y dentro de la ventana temporal
-- Se utilizan funciones de PostgreSQL (NOW()) para fijar la ventana entre ayer y mañana
INSERT INTO asambleas (id_consorcio, ventana_inicio, ventana_fin, estado)
VALUES (1, NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', 'ABIERTA');

-- 5. Tema del orden del día asociado a la asamblea (id=1)
INSERT INTO temas (id_asamblea, titulo, descripcion)
VALUES (1, 'Aprobación Presupuesto 2027', 'Discusión y votación del presupuesto general para el ejercicio 2027.');

