const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

const mysql = require("mysql2");
const myconnection = require("express-myconnection");
require("dotenv").config();

app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  myconnection(
    mysql,
    {
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT,
    },
    "single"
  )
);

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ caidas: "Funcionando correctamente" });
});

router.get("/caidas", (req, res) => {
  req.getConnection((err, conn) => {
    const sql =
      "select count(*) as caidas, sum(CASE when C.alerta = 1 then 1 else 0 end) as alertas from caida C;";
    conn.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        res.json({ info: { caidas: 0, alertas: 0 } });
      }
      res.json({ info: { caidas: result[0].caidas, alertas: result[0].alertas } });
    });
  });
});

router.get("/caidas/:fecha_desde/:fecha_hasta", (req, res) => {
  const fecha_desde = req.params.fecha_desde;
  const fecha_hasta = req.params.fecha_hasta;

  if (fecha_desde == fecha_hasta) {
    req.getConnection((err, conn) => {
      const sql = `SELECT DATE_FORMAT(fecha_registro, '%H:00:00') AS hora, COUNT(fecha_registro) AS cantidad
      FROM caida c
      WHERE c.fecha_registro >= ? AND c.fecha_registro < DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY DATE_FORMAT(fecha_registro, '%H:00:00')
      ORDER BY hora`;
      conn.query(sql, [fecha_desde, fecha_hasta], (err, result) => {
        if (err) {
          console.log(err);
          res.json({
            success: false,
            mensaje: "Ha ocurrido un error al querer obtener la informacion",
          });
        } else {
          res.json({ success: true, info: formatearPorHora(result) });
        }
      });
    });
  } else {
    req.getConnection((err, conn) => {
      const sql = `SELECT DATE_FORMAT(fecha_registro, '%d/%m') AS dia, COUNT(fecha_registro) AS cantidad
      FROM caida c
      WHERE c.fecha_registro >= ? AND c.fecha_registro < DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY DATE_FORMAT(fecha_registro, '%d/%m')
      ORDER BY dia`;
      conn.query(sql, [fecha_desde, fecha_hasta], (err, result) => {
        if (err) {
          console.log(err);
          res.json({
            success: false,
            mensaje: "Ha ocurrido un error al querer obtener la informacion",
          });
        } else {
          res.json({ success: true, info: result });
        }
      });
    });
  }
});

router.get("/alertas/:fecha_desde/:fecha_hasta", (req, res) => {
  const fecha_desde = req.params.fecha_desde;
  const fecha_hasta = req.params.fecha_hasta;

  req.getConnection((err, conn) => {
    const sql = `SELECT COUNT(id) AS cantidad FROM caida c WHERE c.fecha_registro >= ? AND c.fecha_registro < DATE_ADD(?, INTERVAL 1 DAY)`;
    conn.query(sql, [fecha_desde, fecha_hasta], (err, result) => {
      if (err) {
        console.log(err);
        res.json({
          success: false,
          mensaje: "Ha ocurrido un error al querer obtener la informacion",
        });
      } else {
        res.json({ success: true, info: result[0] });
      }
    });
  });
});

router.put("/caidas/notificacionSound", (req, res) => {
  const sonido = req.body.sonido;
  console.log(req.body);
  req.getConnection((err, conn) => {
    const sql = "UPDATE alerta SET sonido = ? WHERE id = 1";
    conn.query(sql, [sonido], (err, result) => {
      if (err) {
        console.log(err);
        res.json({
          success: false,
          mensaje: "Ha ocurrido un error al querer obtener la informacion",
        });
      } else {
        res.json({ success: true, mensaje: "Actualizado correctamente" });
      }
    });
  });
});

router.put("/caidas/notificacionLed", (req, res) => {
  const led = req.body.led;
  req.getConnection((err, conn) => {
    const sql = "UPDATE alerta SET led = ? WHERE id = 1";
    conn.query(sql, [led], (err, result) => {
      if (err) {
        console.log(err);
        res.json({
          success: false,
          mensaje: "Ha ocurrido un error al querer obtener la informacion",
        });
      } else {
        res.json({ success: true, mensaje: "Actualizado correctamente" });
      }
    });
  });
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

app.use("/", router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
