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
      port: process.env.DB_PORT
    },
    "single"
  )
);

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ caidas: "Funcionando correctamente" });
});

router.post("/caidas", (req, res) => {
  const now = new Date();
  req.getConnection((err, conn) => {
    const sql = "INSERT INTO caida (fecha_registro) VALUES (?)";
    conn.query(sql, [now], (err, result) => {
      if (err) {
        console.log(err);
      }
      res.json({ success: true, mensaje: "Caida registrada correctamente" });
    });
  });
});

router.get("/caidas/:fechaini/:fechafin", (req, res) => {
  const fecha_desde = req.params.fecha_desde;
  const fecha_hasta = req.params.fecha_hasta;

  if (fecha_desde == fecha_hasta) {
    // req.getConnection((err, conn) => {
    //   const sql = "INSERT INTO caida (fecha_registro) VALUES (?)";
    //   conn.query(sql, [now], (err, result) => {
    //     if (err) {
    //       console.log(err);
    //       res.json({ success: false, mensaje: "Ha ocurrido un error al querer obtener la informacion" });
    //     } else {
    //       res.json({ success: true, info: "Caida registrada correctamente" });
    //     }
    //   });
    // });
  } else {
    // req.getConnection((err, conn) => {
    //   const sql = "INSERT INTO caida (fecha_registro) VALUES (?)";
    //   conn.query(sql, [now], (err, result) => {
    //     if (err) {
    //       console.log(err);
    //       res.json({ success: false, mensaje: "Ha ocurrido un error al querer obtener la informacion" });
    //     } else {
    //       res.json({ success: true, info: "Caida registrada correctamente" });
    //     }
    //   });
    // });
  }
});

app.use("/", router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
