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
const RUTA_REQUEST = 'http://35.245.231.94:3000/';

// Variable para determinar los rangos de actividades
let rango_actividades = {
  // Para problema pulmonar
  0: {
    intensa: [70, 85, 90],
    normal: [50, 70, 88],
    reposo: [60, 80, 88],
    irregular_suenio: [60, 100, 88]
  },
  // Para problema cardiovascular
  1: {
    intensa: [70, 85, 90],
    normal: [50, 70, 95],
    reposo: [60, 80, 95],
    irregular_suenio: [60, 100, 95]
  },
  // Para problema diabetes
  2: {
    intensa: [70, 85, 90],
    normal: [50, 70, 95],
    reposo: [60, 80, 95],
    irregular_suenio: [60, 100, 95]
  },
  // Para problema autoinmune
  3: {
    intensa: [70, 250, 90],
    normal: [50, 70, 95],
    reposo: [60, 80, 95],
    irregular_suenio: [60, 100, 95]
  },
};

// Rutas
app.get("/", async (req, res) => {
  try {
    res.render('frontend.ejs', {
      ruta_request: RUTA_REQUEST
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error });
  }
});

app.post("/informacion", async (req, res) => {
  const data = req.body;
  const conexion = getConnection();
  const fecha = new Date();
  const query = `INSERT INTO historialOxigeno(porcentaje,frecuencia,usuario,fecha) VALUES (?,?,?,?);`;

  try {
    const [result, fields] = await conexion.query(query, [
      data.porcentaje,
      data.frecuencia,
      data.usuario,
      fecha,
    ]);

    res.json({ code: 200, message: "Registro exitoso" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error });
  }
});

app.get("/informacion/:usuario", async (req, res) => {

  const usuario = req.params.usuario;
  const conexion = getConnection();
  const query = `SELECT * FROM historialOxigeno WHERE usuario = ?  ORDER BY id DESC LIMIT 1;`;

  try {
    const [results, fields] = await conexion.query(query, [usuario]);
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ code: 500, message: error });
  }
});

app.get("/informacion/:usuario/:fecha_desde/:fecha_hasta", async (req, res) => {
  const fecha_desde = req.params.fecha_desde;
  const fecha_hasta = req.params.fecha_hasta;
  const usuario = req.params.usuario;

  const conexion = getConnection();
  if (fecha_desde == fecha_hasta) {
    try {
      const sql = `SELECT DATE_FORMAT(fecha, '%H:00:00') AS hora, ROUND(AVG(porcentaje)) AS cantidad, ROUND(AVG(frecuencia)) AS cantidadf
      FROM historialOxigeno c
      WHERE c.fecha >= ? AND c.fecha < DATE_ADD(?, INTERVAL 1 DAY) and c.usuario = ?
      GROUP BY DATE_FORMAT(fecha, '%H:00:00')
      ORDER BY hora`;
      const [results, fields] = await conexion.query(sql, [fecha_desde, fecha_hasta, usuario]);
      const [data, data2] = formatearPorHora(results);
      res.json({ success: true, titulos_eje_x: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"], valores_eje_y: data, valores_eje_y_f: data2 });
    } catch (error) {
      res.status(500).json({ code: 500, message: error });
    }
  } else {
    try {
      const sql = `SELECT DATE_FORMAT(fecha, '%d/%m') AS dia, ROUND(AVG(porcentaje)) AS cantidad, ROUND(AVG(frecuencia)) AS cantidadf
      FROM historialOxigeno c
      WHERE c.fecha >= ? AND c.fecha < DATE_ADD(?, INTERVAL 1 DAY) and c.usuario = ?
      GROUP BY DATE_FORMAT(fecha, '%d/%m')
      ORDER BY dia`;
      const [results, fields] = await conexion.query(sql, [fecha_desde, fecha_hasta, usuario]);

      const titulos_eje_x = results.map(item => item.dia);
      const valores_eje_y = results.map(item => item.cantidad);
      const valores_eje_y_f = results.map(item => item.cantidadf);
      res.json({ success: true, titulos_eje_x: titulos_eje_x, valores_eje_y: valores_eje_y, valores_eje_y_f: valores_eje_y_f });
    } catch (error) {
      res.status(500).json({ code: 500, message: error });
    }
  }
});

app.get("/lista-actividades/:usuario/:fecha_desde/:fecha_hasta", async (req, res) => {

  const fecha_desde = req.params.fecha_desde;
  const fecha_hasta = req.params.fecha_hasta;
  const usuario = req.params.usuario;

  const conexion = getConnection();
  const query = `SELECT ho.id, ho.porcentaje, ho.frecuencia, u.usuario, DATE_FORMAT(ho.fecha, '%d/%m/%Y %H:%i:%s') AS fecha,
  CASE WHEN u.pulmonar = TRUE THEN 0 WHEN u.cardiovascular = TRUE THEN 1 WHEN u.diabetes = TRUE THEN 2 WHEN u.autoinmune = TRUE THEN 3 END AS indice,
  CASE
    WHEN (DAYOFWEEK(ho.fecha) = u.horarioSue + 1 AND HOUR(ho.fecha) >= 23) OR (DAYOFWEEK(ho.fecha) = (u.horarioSue + 2) AND TIME(ho.fecha) <= '08:30:00')
    THEN True ELSE False
  END AS es_horario_suenio
  FROM historialOxigeno ho
  INNER JOIN usuario u ON u.usuario = ho.usuario
  WHERE u.usuario = ? AND ho.fecha >= ? AND ho.fecha < DATE_ADD(?, INTERVAL 1 DAY)
  ORDER BY fecha DESC`;

  try {
    const [results, fields] = await conexion.query(query, [usuario, fecha_desde, fecha_hasta]);
    res.json(formatearListaActividades(results));
  } catch (error) {
    res.status(500).json({ code: 500, message: error });
  }

});

app.post("/registrar", async (req, res) => {
  const data = req.body;
  const conexion = getConnection();
  const query = `INSERT INTO usuario VALUES (?,?,?,?,?,?,?,?,?,?,?);`;

  try {
    const [result, fields] = await conexion.query(query, [
      data.usuario,
      data.nombre,
      data.pass,
      data.edad,
      data.altura,
      data.peso,
      data.diabetes,
      data.cardiovascular,
      data.pulmonar,
      data.autoinmune,
      data.horarioSue
    ]);

    if (result.affectedRows == 0) {
      res.status(500).json({ code: 500, message: "No se pudo registrar" });
    }

    res.json({ code: 200, message: "Registro exitoso" });
  } catch (error) {
    res.status(500).json({ code: 500, message: error });
  }
});

app.get("/login/:usuario/:pass", async (req, res) => {
  const datos = req.params;

  const conexion = getConnection();

  try {
    const sql = `SELECT * FROM usuario WHERE usuario = ? AND pass = ?`;
    const [results, fields] = await conexion.query(sql, [datos.usuario, datos.pass]);

    if (results.length > 0) {
      res.json({ code: 200, message: "¡Bienvenido!", session: results[0].usuario });
    } else {
      res.status(500).json({ code: 500, message: "Usuario o contraseña incorrecta" });
    }
  } catch (error) {
    res.status(500).json({ code: 500, message: error });
  }
});

function formatearPorHora(result) {
  let data = [];
  let data2 = [];
  for (let i = 0; i < 24; i++) {
    const valor = result.find((element) => element["hora"] === calcularHora(i));
    if (valor === undefined) {
      data.push(0);
      data2.push(0);
    } else {
      data.push(valor.cantidad);
      data2.push(valor.cantidadf);
    }
  }
  return [data, data2];
}

function calcularHora(multiplicador) {
  const horas = Math.floor(multiplicador);
  const minutos = (multiplicador - horas) * 60;
  const segundos = minutos * 60;
  return `${horas.toString().padStart(2, "0")}:${minutos
    .toString()
    .padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;
}

function formatearListaActividades(result) {

  let respuesta = "";
  let actividad = "";
  let color = "";

  result.forEach(element => {

    // Se analiza unicamente la irregularidad del suenio
    if (element.es_horario_suenio) {
      if ((element.frecuencia < rango_actividades[element.indice].irregular_suenio[0] || element.frecuencia > rango_actividades[element.indice].irregular_suenio[1]) &&
        (element.porcentaje >= rango_actividades[element.indice].irregular_suenio[2])) {
        actividad = "Irregularidad durante el sueño";
        color = "Rojo";
      } else {
        actividad = "Normal durante el sueño";
        color = "Cafe";
      }
    }
    // Se analiza si la actividad fisica es intensa, normal, reposo
    else {
      if ((element.frecuencia > rango_actividades[element.indice].intensa[0] && element.frecuencia <= rango_actividades[element.indice].intensa[1]) &&
        (element.porcentaje >= rango_actividades[element.indice].intensa[2])) {
        actividad = "Actividad intensa";
        color = "Anaranjado";
      } else if ((element.frecuencia >= rango_actividades[element.indice].normal[0] && element.frecuencia <= rango_actividades[element.indice].normal[1]) &&
        (element.porcentaje >= rango_actividades[element.indice].normal[2])) {
        actividad = "Actividad normal";
        color = "Verde";
      } else if ((element.frecuencia >= rango_actividades[element.indice].reposo[0] && element.frecuencia <= rango_actividades[element.indice].reposo[1]) &&
        (element.porcentaje >= rango_actividades[element.indice].reposo[2])) {
        actividad = "Reposo";
        color = "Azul";
      } else {
        actividad = "Irregularidad durante alguna actividad";
        color = "Morado";
      }
    }

    respuesta += element.usuario + "," +
      element.id + "," +
      element.fecha + "," +
      actividad + "," +
      element.porcentaje + "%," +
      element.frecuencia + "," +
      color + "," +
      (element.es_horario_suenio ? 'Si' : 'No') + ";"
  });

  return respuesta;
}

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado (http://localhost:${port}/)`);
});
