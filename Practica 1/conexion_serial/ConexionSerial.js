// Importación de librerias para conexion serial
const SerialPort = require("serialport").SerialPort;
const ReadLineParser = require("serialport").ReadlineParser;

// Importación de librerias para conexion a base de datos
const { getConnection } = require("./ConexionDB");
const connection = getConnection();

// Creación de objeto puerto para comunicación serial
const puerto = new SerialPort({
  path: "COM3",
  baudRate: 9600,
});

// Creación de objeto parser para lectura de datos
const parser = puerto.pipe(new ReadLineParser());

// Evento de conexion abierta
parser.on("open", () => {
  console.log("Conexion abierta");
});

// Evento de recepción de datos
parser.on("data", (data) => {
  console.log(data);
  // Parsear datos json
  data = JSON.parse(data);
  const now = new Date();

  // Insertar datos en base de datos
  connection.query(
    `INSERT INTO medicion(temperatura_externa,velocidad_viento,humedad_relativa,humedad_absoluta,direccion_viento,presion_barometrica,fecha_registro) VALUES (?,?,?,?,?,?,?);`,
    [
      data.temperatura,
      data.velocidad,
      data.humedadR,
      data.humedadA,
      data.direccion,
      data.presion,
      now,
    ],
    (error, results) => {
      if (error) {
        // En caso de que haya error
        console.log("Error al insertar" + error);
      } else {
        // En caso de que no haya error
        console.log("Insertado correctamente");
      }
    }
  );
});

// Evento de error
puerto.on("error", (err) => {
  console.log(err);
});
