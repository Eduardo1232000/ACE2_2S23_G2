DROP DATABASE IF EXISTS ace2_proyecto1;
CREATE DATABASE ace2_proyecto1;
USE ace2_proyecto1;
CREATE TABLE caida (
	id INT PRIMARY KEY AUTO_INCREMENT,
    fecha_registro DATETIME,
    alerta INT
);

CREATE TABLE alerta(
	id INT PRIMARY KEY,
    sonido int,
    led int
);

insert into alerta values (1,0,0);
