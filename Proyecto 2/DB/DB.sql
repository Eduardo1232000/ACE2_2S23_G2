drop database if exists arqui2practica2;
create database if not exists arqui2practica2;
use arqui2practica2;

create table if not exists historialOxigeno(
id int primary key auto_increment,
porcentaje int,
fecha datetime
);