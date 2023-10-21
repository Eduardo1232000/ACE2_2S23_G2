drop database if exists arqui2practica2;
create database if not exists arqui2practica2;
use arqui2practica2;

drop table if exists horarieSue; 
create table horarioSue(
id int primary key,
dia varchar(10),
horas varchar(20)
);

insert into horarioSue values(1,"Lunes","23:00-8:30");
insert into horarioSue values(2,"Martes","23:00-8:30");
insert into horarioSue values(3,"Miercoles","23:00-8:30");
insert into horarioSue values(4,"Jueves","23:00-8:30");
insert into horarioSue values(5,"Viernes","23:00-8:30");

drop table if exists usuario;
create table if not exists usuario(
usuario varchar(20) primary key,
nombre varchar(100),
pass varchar(100),
edad int,
altura float(2),
peso float(2),
diabetes bool,
cardiovascular bool,
pulmonar bool,
autoinmune bool
);

drop table if exists historialOxigeno;
create table if not exists historialOxigeno(
id int primary key auto_increment,
porcentaje int,
frecuencia int,
usuario int,
fecha datetime
);