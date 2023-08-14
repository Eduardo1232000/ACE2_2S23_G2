DROP DATABASE IF EXISTS practica1;
CREATE DATABASE practica1;
USE practica1;
CREATE TABLE medicion (
	id INT PRIMARY KEY AUTO_INCREMENT,
    temperatura_externa DECIMAL(10, 2),
    humedad_relativa DECIMAL(10, 2),
    humedad_absoluta DECIMAL(10, 6),
    velocidad_viento DECIMAL(10, 2),
    direccion_viento INT,
    presion_barometrica DECIMAL(10, 2),
    fecha_registro DATETIME
);