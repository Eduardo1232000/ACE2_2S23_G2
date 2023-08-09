const express = require("express");
const path = require("path");
const morgan = require("morgan");
const app = express();
const mysql = require("mysql2");
const myconnection = require("express-myconnection");
require("dotenv").config();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(morgan("dev"));
app.use(
  myconnection(
    mysql,
    {
      host: process.env.HOST,
      database: process.env.DATABASE,
      user: process.env.USER_NAME,
      password: process.env.PASSWORD,
    },
    "single"
  )
);

// Importacion de rutas
const router = express.Router();

router.get("/", (req, res) => {
  req.getConnection((err, conn) => {
    const sql = "SELECT * FROM prueba";
    conn.query(sql, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.render("dashboard", {
        data: result,
      });
    });
  });
});

router.get("/Fechas", (req, res) => {
  res.render("fechas");
});

router.get("/informacion/:fecha_desde/:fecha_hasta", (req, res) => {

  const fecha_desde = req.params.fecha_desde;
  const fecha_hasta = req.params.fecha_hasta;

  if (fecha_desde == fecha_hasta) {
    req.getConnection((err, conn) => {
      const sql = `SELECT DATE_FORMAT(fecha_registro, '%H:00:00') AS hora, AVG(temperatura_externa) AS prom_temp,
      AVG(humedad_relativa) AS prom_hum_rel, AVG(humedad_absoluta) AS prom_hum_abs, AVG(velocidad_viento) AS prom_vel_viento,
      AVG(presion_barometrica) AS prom_presion
      FROM medicion
      WHERE fecha_registro >= '` + fecha_desde + `' AND fecha_registro < DATE_ADD('` + fecha_hasta + `', INTERVAL 1 DAY)
      GROUP BY DATE_FORMAT(fecha_registro, '%H:00:00')
      ORDER BY hora`;
      conn.query(sql, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.json(formatearPorHora(result));
        }
      });
    });
  } else {
    req.getConnection((err, conn) => {
      const sql = `SELECT DATE_FORMAT(fecha_registro, '%d/%m') AS dia, AVG(temperatura_externa) AS prom_temp,
      AVG(humedad_relativa) AS prom_hum_rel, AVG(humedad_absoluta) AS prom_hum_abs, AVG(velocidad_viento) AS prom_vel_viento,
      AVG(presion_barometrica) AS prom_presion
      FROM medicion
      WHERE fecha_registro >= '` + fecha_desde + `' AND fecha_registro < DATE_ADD('` + fecha_hasta + `', INTERVAL 1 DAY)
      GROUP BY DATE_FORMAT(fecha_registro, '%d/%m')
      ORDER BY dia ASC;`;
      conn.query(sql, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.json(formatearPorDia(result));
        }
      });
    });
  }
});

function formatearPorHora(result) {
  let labels = [];
  let data_prom_temp = [];
  let data_prom_hum_rel = [];
  let data_prom_hum_abs = [];
  let data_prom_vel_viento = [];
  let data_prom_presion = [];
  for (let i = 0; i < 24; i++) {
    const valor = result.find(element => element['hora'] === calcularHora(i));
    if (valor === undefined) {
      data_prom_temp.push(0);
      data_prom_hum_rel.push(0);
      data_prom_hum_abs.push(0);
      data_prom_vel_viento.push(0);
      data_prom_presion.push(0);
    } else {
      data_prom_temp.push(valor.prom_temp);
      data_prom_hum_rel.push(valor.prom_hum_rel);
      data_prom_hum_abs.push(valor.prom_hum_abs);
      data_prom_vel_viento.push(valor.prom_vel_viento);
      data_prom_presion.push(valor.prom_presion);
    }
    labels.push(calcularHora(i));
  }
  return {
    labels: labels,
    data_prom_temp: data_prom_temp,
    data_prom_hum_rel: data_prom_hum_rel,
    data_prom_hum_abs: data_prom_hum_abs,
    data_prom_vel_viento: data_prom_vel_viento,
    data_prom_presion: data_prom_presion
  };
}

function formatearPorDia(result) {
  let labels = [];
  let data_prom_temp = [];
  let data_prom_hum_rel = [];
  let data_prom_hum_abs = [];
  let data_prom_vel_viento = [];
  let data_prom_presion = [];
  result.forEach(element => {
    labels.push(element.dia);
    data_prom_temp.push(element.prom_temp);
    data_prom_hum_rel.push(element.prom_hum_rel);
    data_prom_hum_abs.push(element.prom_hum_abs);
    data_prom_vel_viento.push(element.prom_vel_viento);
    data_prom_presion.push(element.prom_presion);
  });

  return {
    labels: labels,
    data_prom_temp: data_prom_temp,
    data_prom_hum_rel: data_prom_hum_rel,
    data_prom_hum_abs: data_prom_hum_abs,
    data_prom_vel_viento: data_prom_vel_viento,
    data_prom_presion: data_prom_presion
  };
}

function calcularHora(multiplicador) {
  const horas = Math.floor(multiplicador);
  const minutos = (multiplicador - horas) * 60;
  const segundos = minutos * 60;
  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

app.use("/", router);

app.use(express.static(path.join(__dirname, "public")));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
