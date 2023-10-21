drop database if exists arqui2practica2;
create database if not exists arqui2practica2;
use arqui2practica2;

create table if not exists usuario(
usuario varchar(20) primary key,
nombre varchar(100),
password varchar(100),
edad int,
altura float(2),
peso float(2)
);

create table if not exists historialOxigeno(
id int primary key auto_increment,
porcentaje int,
frecuencia int,
usuario int,
fecha datetime
);