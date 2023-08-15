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
    const sql = "SELECT * FROM medicion ORDER BY id DESC LIMIT 1";
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
      FROM
      (SELECT CASE
        WHEN direccion_viento >= 0 AND direccion_viento < 45 THEN 'N'
          WHEN direccion_viento >= 45 AND direccion_viento < 90 THEN 'NE'
          WHEN direccion_viento >= 90 AND direccion_viento < 135 THEN 'E'
          WHEN direccion_viento >= 135 AND direccion_viento < 180 THEN 'SE'
          WHEN direccion_viento >= 180 AND direccion_viento < 225 THEN 'S'
          WHEN direccion_viento >= 225 AND direccion_viento < 270 THEN 'SO'
          WHEN direccion_viento >= 270 AND direccion_viento < 315 THEN 'O'
          WHEN direccion_viento >= 315 AND direccion_viento < 360 THEN 'NO'
      END AS direccion_viento, fecha_registro
      FROM medicion m) AS query
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
      FROM
      (SELECT CASE
        WHEN direccion_viento >= 0 AND direccion_viento < 45 THEN 'N'
          WHEN direccion_viento >= 45 AND direccion_viento < 90 THEN 'NE'
          WHEN direccion_viento >= 90 AND direccion_viento < 135 THEN 'E'
          WHEN direccion_viento >= 135 AND direccion_viento < 180 THEN 'SE'
          WHEN direccion_viento >= 180 AND direccion_viento < 225 THEN 'S'
          WHEN direccion_viento >= 225 AND direccion_viento < 270 THEN 'SO'
          WHEN direccion_viento >= 270 AND direccion_viento < 315 THEN 'O'
          WHEN direccion_viento >= 315 AND direccion_viento < 360 THEN 'NO'
      END AS direccion_viento, fecha_registro
      FROM medicion m) AS query
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
  let data_noreste = [];
  let data_noroeste = [];
  let data_oeste = [];
  let data_sur = [];
  let data_sureste = [];
  let data_suroeste = [];

  const este = result.filter(element => element['direccion_viento'] === 'E');
  const norte = result.filter(element => element['direccion_viento'] === 'N');
  const noreste = result.filter(element => element['direccion_viento'] === 'NE');
  const noroeste = result.filter(element => element['direccion_viento'] === 'NO');
  const oeste = result.filter(element => element['direccion_viento'] === 'O');
  const sur = result.filter(element => element['direccion_viento'] === 'S');
  const sureste = result.filter(element => element['direccion_viento'] === 'SE');
  const suroeste = result.filter(element => element['direccion_viento'] === 'SO');

  for (let i = 0; i < 24; i++) {
    labels.push(calcularHora(i));
    almacenarRegistroHora(este, data_este, i);
    almacenarRegistroHora(norte, data_norte, i);
    almacenarRegistroHora(noreste, data_noreste, i);
    almacenarRegistroHora(noroeste, data_noroeste, i);
    almacenarRegistroHora(oeste, data_oeste, i);
    almacenarRegistroHora(sur, data_sur, i);
    almacenarRegistroHora(sureste, data_sureste, i);
    almacenarRegistroHora(suroeste, data_suroeste, i);
  }
  return {
    labels: labels,
    direccion: { 0: data_este, 1: data_norte, 2: data_noreste, 3: data_noroeste, 4: data_oeste, 5: data_sur, 6: data_sureste, 7: data_suroeste }
  };
}

let labelsNoRepetidos;
function formatearPorDiaRadial(result) {

  let labels = [];
  let data_este = [];
  let data_norte = [];
  let data_noreste = [];
  let data_noroeste = [];
  let data_oeste = [];
  let data_sur = [];
  let data_sureste = [];
  let data_suroeste = [];

  const este = result.filter(element => element['direccion_viento'] === 'E');
  const norte = result.filter(element => element['direccion_viento'] === 'N');
  const noreste = result.filter(element => element['direccion_viento'] === 'NE');
  const noroeste = result.filter(element => element['direccion_viento'] === 'NO');
  const oeste = result.filter(element => element['direccion_viento'] === 'O');
  const sur = result.filter(element => element['direccion_viento'] === 'S');
  const sureste = result.filter(element => element['direccion_viento'] === 'SE');
  const suroeste = result.filter(element => element['direccion_viento'] === 'SO');

  // Se determina el label del grafico
  extraerDias(este, labels);
  extraerDias(norte, labels);
  extraerDias(noreste, labels);
  extraerDias(noroeste, labels);
  extraerDias(oeste, labels);
  extraerDias(sur, labels);
  extraerDias(sureste, labels);
  extraerDias(suroeste, labels);
  const labelsOrdenados = labels.sort(compararFechas);
  labelsNoRepetidos = labelsOrdenados.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });

  // Se almacena el registro del dia a dia
  almacenarRegistroDia(este, data_este);
  almacenarRegistroDia(norte, data_norte);
  almacenarRegistroDia(noreste, data_noreste);
  almacenarRegistroDia(noroeste, data_noroeste);
  almacenarRegistroDia(oeste, data_oeste);
  almacenarRegistroDia(sur, data_sur);
  almacenarRegistroDia(sureste, data_sureste);
  almacenarRegistroDia(suroeste, data_suroeste);

  return {
    labels: labelsNoRepetidos,
    direccion: { 0: data_este, 1: data_norte, 2: data_noreste, 3: data_noroeste, 4: data_oeste, 5: data_sur, 6: data_sureste, 7: data_suroeste }
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

function extraerDias(data, labels) {
  data.forEach(element => {
    labels.push(element.dia);
  });
}

function almacenarRegistroDia(data, array_store) {

  // Se crea una variable temporal la cual se modificara para la obtencion de los registros
  let temp_data = data;

  labelsNoRepetidos.forEach(dia => {

    let aux = false;

    temp_data.forEach(element => {
      if (dia == element.dia) {
        array_store.push(element.prom_direccion_viento);
        aux = true;
        return;
      }
    });

    if (!aux) {
      array_store.push(0);
    }

  });
}

function almacenarRegistroHora(data, array_store, indice) {
  const valor_encontrado = data.find(element => element['hora'] === calcularHora(indice));
  if (valor_encontrado === undefined) {
    array_store.push(0);
  } else {
    array_store.push(valor_encontrado.prom_direccion_viento);
  }
}

app.use("/", router);

app.use(express.static(path.join(__dirname, "public")));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
