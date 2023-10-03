const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();

// SETTINGS

//process.env.PORT es por si se sube a la nube, ya que acepta el puerto que le dan
app.set("port", process.env.PORT || 3000);
var engine = require('consolidate');
app.set('views', path.join(__dirname, 'public')); //LAS PAGINAS ESTAN EN VIEWS
app.set('view engine', 'ejs');                      //SON ARCHIVOS .EJS

//MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './public')));
app.use(cors());
app.use(morgan("dev"));

// importe de libreria para la conexion a la base de datos
const { getConnection } = require("./src/database");

// Rutas
app.get("/", async (req, res) => {
  try {
    const result = await fetch("http://localhost:3000/informacion").then(response => response.json()).then(data => data);
    console.log(result);

    res.render('frontend.ejs', {
      data: result,
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error });
  }
});

app.post("/informacion", async (req, res) => {
  const data = req.body;
  const conexion = getConnection();
  const fecha = new Date();
  const query = `INSERT INTO historialOxigeno(porcentaje, fecha) VALUES (?,?);`;

  try {
    const [result, fields] = await conexion.query(query, [
      data.porcentaje,
      fecha,
    ]);

    res.json({ code: 200, message: "Registro exitoso" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error });
  }
});

app.get("/informacion", async (req, res) => {
  const conexion = getConnection();
  const query = `SELECT * FROM historialOxigeno ORDER BY id DESC LIMIT 1;`;

  try {
    const [results, fields] = await conexion.query(query);

    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ code: 500, message: error });
  }
});

app.get("/informacion/:fecha_desde/:fecha_hasta", async (req, res) => {
  const fecha_desde = req.params.fecha_desde;
  const fecha_hasta = req.params.fecha_hasta;

  const conexion = getConnection();
  if (fecha_desde == fecha_hasta) {
    try {
      const sql = `SELECT DATE_FORMAT(fecha, '%H:00:00') AS hora, AVG(porcentaje) AS cantidad
      FROM historialOxigeno c
      WHERE c.fecha >= ? AND c.fecha < DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY DATE_FORMAT(fecha, '%H:00:00')
      ORDER BY hora`;
      const [results, fields] = await conexion.query(sql, [
        fecha_desde,
        fecha_hasta,
      ]);

      res.json({ success: true, info: formatearPorHora(results) });
    } catch (error) {
      res.status(500).json({ code: 500, message: error });
    }
  } else {
    try {
      const sql = `SELECT DATE_FORMAT(fecha, '%d/%m') AS dia, AVG(porcentaje) AS cantidad
      FROM historialOxigeno c
      WHERE c.fecha >= ? AND c.fecha < DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY DATE_FORMAT(fecha, '%d/%m')
      ORDER BY dia`;
      const [results, fields] = await conexion.query(sql, [
        fecha_desde,
        fecha_hasta,
      ]);

      res.json({ success: true, info: results });
    } catch (error) {
      res.status(500).json({ code: 500, message: error });
    }
  }
});

function formatearPorHora(result) {
  let data = [];
  for (let i = 0; i < 24; i++) {
    const valor = result.find((element) => element["hora"] === calcularHora(i));
    if (valor === undefined) {
      data.push(0);
    } else {
      data.push(valor.cantidad);
    }
  }
  return data;
}

function calcularHora(multiplicador) {
  const horas = Math.floor(multiplicador);
  const minutos = (multiplicador - horas) * 60;
  const segundos = minutos * 60;
  return `${horas.toString().padStart(2, "0")}:${minutos
    .toString()
    .padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;
}

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado (http://localhost:${port}/)`);
});
