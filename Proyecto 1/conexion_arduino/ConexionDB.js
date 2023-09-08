// importe de libreria para la conexion a la base de datos
const mysql = require("mysql2");
// importe de variables de entorno
require('dotenv').config();

// Creación de objeto de conexión a la base de datos
const connection = mysql.createConnection({
    host: process.env.HOST,
    database: process.env.DATABASE,
    user: process.env.USER_NAME,
    password: process.env.PASSWORD
});

// Función para obtener la conexión
const getConnection = () => {
    return connection.promise();
}

// Exportación de funciones
module.exports = {
    getConnection
}