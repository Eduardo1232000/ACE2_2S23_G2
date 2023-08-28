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
      host: process.env.HOST,
      database: process.env.DATABASE,
      user: process.env.USER_NAME,
      password: process.env.PASSWORD,
    },
    "single"
  )
);

const router = express.Router();

router.get("/", (req, res) => {
  /* req.getConnection((err, conn) => {
    const sql = "SELECT * FROM medicion ORDER BY id DESC LIMIT 1";
    conn.query(sql, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.json(result);
    });
  });*/
  res.json({ caidas: Math.floor(Math.random() * 10) });
});

router.get("/barra/:fechaini/:fechafin", (req, res) => {
  const fecha_desde = req.params.fecha_desde;
  const fecha_hasta = req.params.fecha_hasta;
  /* req.getConnection((err, conn) => {
      const sql = "SELECT * FROM medicion ORDER BY id DESC LIMIT 1";
      conn.query(sql, (err, result) => {
        if (err) {
          console.log(err);
        }
        res.json(result);
      });
    });*/
  res.json([
    {
      fecha: "2021-04-01",
      caidas: 2,
    },
    {
      fecha: "2021-04-03",
      caidas: 3,
    },
    {
      fecha: "2021-04-01",
      caidas: 9,
    },
    {
      fecha: "2021-04-03",
      caidas: 5,
    },
    {
      fecha: "2021-04-01",
      caidas: 0,
    },
    {
      fecha: "2021-04-03",
      caidas: 8,
    },
  ]);
});

app.use("/", router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
