const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// importe de libreria para la conexion a la base de datos
const { getConnection } = require("./database");

// Rutas
app.get("/", (req, res) => {
  res.send("Arqui2 - S2");
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

    res.json(results);
  } catch (error) {
    res.status(500).json({ code: 500, message: error });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado (http://localhost:${port}/)`);
});
