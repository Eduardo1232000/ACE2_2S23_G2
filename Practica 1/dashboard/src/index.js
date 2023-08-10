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

router.get("/informacion_lineal/:fecha_desde/:fecha_hasta", (req, res) => {

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
          res.json(formatearPorHoraLineal(result));
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
          res.json(formatearPorDiaLineal(result));
        }
      });
    });
  }
});

router.get("/informacion_radial/:fecha_desde/:fecha_hasta", (req, res) => {

  const fecha_desde = req.params.fecha_desde;
  const fecha_hasta = req.params.fecha_hasta;

  if (fecha_desde == fecha_hasta) {
    req.getConnection((err, conn) => {
      const sql = `SELECT direccion_viento, DATE_FORMAT(fecha_registro, '%H:00:00') AS hora, COUNT(direccion_viento) AS prom_direccion_viento
      FROM medicion
      WHERE fecha_registro >= '` + fecha_desde + `' AND fecha_registro < DATE_ADD('` + fecha_hasta + `', INTERVAL 1 DAY)
      GROUP BY direccion_viento, DATE_FORMAT(fecha_registro, '%H:00:00')
      ORDER BY direccion_viento, hora ASC;`;
      conn.query(sql, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.json(formatearPorHoraRadial(result));
        }
      });
    });
  } else {
    req.getConnection((err, conn) => {
      const sql = `SELECT direccion_viento, DATE_FORMAT(fecha_registro, '%d/%m') AS dia, COUNT(direccion_viento) AS prom_direccion_viento
      FROM medicion
      WHERE fecha_registro >= '` + fecha_desde + `' AND fecha_registro < DATE_ADD('` + fecha_hasta + `', INTERVAL 1 DAY)
      GROUP BY direccion_viento, DATE_FORMAT(fecha_registro, '%d/%m')
      ORDER BY direccion_viento, dia ASC;`;
      conn.query(sql, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.json(formatearPorDiaRadial(result));
        }
      });
    });
  }
});

function formatearPorHoraLineal(result) {
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

function formatearPorDiaLineal(result) {
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

function formatearPorHoraRadial(result) {

  let labels = [];
  let data_este = [];
  let data_norte = [];
  let data_oeste = [];
  let data_sur = [];

  const este = result.filter(element => element['direccion_viento'] === 'E');
  const norte = result.filter(element => element['direccion_viento'] === 'N');
  const oeste = result.filter(element => element['direccion_viento'] === 'O');
  const sur = result.filter(element => element['direccion_viento'] === 'S');

  for (let i = 0; i < 24; i++) {
    labels.push(calcularHora(i));

    const val_este = este.find(element => element['hora'] === calcularHora(i));
    if (val_este === undefined) {
      data_este.push(0);
    } else {
      data_este.push(val_este.prom_direccion_viento);
    }

    const val_norte = norte.find(element => element['hora'] === calcularHora(i));
    if (val_norte === undefined) {
      data_norte.push(0);
    } else {
      data_norte.push(val_norte.prom_direccion_viento);
    }

    const val_oeste = oeste.find(element => element['hora'] === calcularHora(i));
    if (val_oeste === undefined) {
      data_oeste.push(0);
    } else {
      data_oeste.push(val_oeste.prom_direccion_viento);
    }

    const val_sur = sur.find(element => element['hora'] === calcularHora(i));
    if (val_sur === undefined) {
      data_sur.push(0);
    } else {
      data_sur.push(val_sur.prom_direccion_viento);
    }
  }
  return {
    labels: labels,
    direccion: { 0: data_este, 1: data_norte, 2: data_oeste, 3: data_sur }
  };
}

function formatearPorDiaRadial(result) {

  let labels = [];
  let data_este = [];
  let data_norte = [];
  let data_oeste = [];
  let data_sur = [];

  const este = result.filter(element => element['direccion_viento'] === 'E');
  const norte = result.filter(element => element['direccion_viento'] === 'N');
  const oeste = result.filter(element => element['direccion_viento'] === 'O');
  const sur = result.filter(element => element['direccion_viento'] === 'S');

  este.forEach(element => {
    labels.push(element.dia);
    data_este.push(element.prom_direccion_viento);
  });

  norte.forEach(element => {
    labels.push(element.dia);
    data_norte.push(element.prom_direccion_viento);
  });

  oeste.forEach(element => {
    labels.push(element.dia);
    data_oeste.push(element.prom_direccion_viento);
  });

  sur.forEach(element => {
    labels.push(element.dia);
    data_sur.push(element.prom_direccion_viento);
  });

  let labelsNoRepetidos = labels.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });

  const labelsOrdenados = labelsNoRepetidos.sort(compararFechas);

  return {
    labels: labelsOrdenados,
    direccion: { 0: data_este, 1: data_norte, 2: data_oeste, 3: data_sur }
  };
}

function calcularHora(multiplicador) {
  const horas = Math.floor(multiplicador);
  const minutos = (multiplicador - horas) * 60;
  const segundos = minutos * 60;
  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

function compararFechas(a, b) {
  const fechaA = a.split('/').reverse().join('');
  const fechaB = b.split('/').reverse().join('');
  return fechaA.localeCompare(fechaB);
}

app.use("/", router);

app.use(express.static(path.join(__dirname, "public")));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
