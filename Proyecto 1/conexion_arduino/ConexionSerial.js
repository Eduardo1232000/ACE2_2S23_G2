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
puerto.on("open", () => {
  console.log("Conexion abierta");
});

// Evento de recepción de datos
parser.on("data", async (data) => {
  data = JSON.parse(data);
  if (data.alerta == 1) {
    // Parsear datos json
    const now = new Date();
    let [result, error] = await connection.query(
      `select sonido, led from alerta where id=1;`
    );

    await connection.query(
      `INSERT INTO caida(fecha_registro,alerta) VALUES (?,?);`,
      [now, result[0].sonido == 1 || result[0].led == 1 ? 1 : 0]
    );
    
    puerto.write(JSON.stringify(result[0])+"\n");
  }
  console.log(data);
});

// Evento de error
puerto.on("error", (err) => {
  console.log(err);
});
