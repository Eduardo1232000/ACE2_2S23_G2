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
      if (err){
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

router.get("/Fechas/:fecha1/:fecha2", (req, res) => {
  
});

app.use("/", router);

app.use(express.static(path.join(__dirname, "public")));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
