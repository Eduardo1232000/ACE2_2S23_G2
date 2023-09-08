var alertas = 0; //CONTADOR DE ALERTAS
var fecha_ini; //STRING DE FECHA INICIO
var fecha_fin; //STRING DE FECHA FINAL

var status_sonido = "OFF"; //ESTADO DE ALERTA DE SONIDO
var color_status_sonido = "black";

var status_led = "OFF"; //ESTADO DE ALERTA DE LED
var color_status_led = "black";

var btn_sonido; //BOTON DE ALERTA DE SONIDO
var btn_led; //BOTON DE ALERTA DE LED

var numberOfRows = 0;
var numberOfColumns = 0;
const URL_SERVER = "http://localhost:3000";

var dataChartLine;

function setup() {
  createCanvas(1200, 720);
  background("#DEDEDE");
  btn_sonido = createButton(status_sonido)
    .position(200, 125)
    .mousePressed(sonidoPressed);
  btn_led = createButton(status_led)
    .position(200, 225)
    .mousePressed(ledPressed);
  fecha_ini = createInput("2023-08-01", "date").position(600, 30);
  fecha_fin = createInput("2023-08-05", "date").position(600, 80);
  button = createButton("Graficar");
  button.position(670, 130);
  button.mousePressed(mostrarGrafica);
}

let myp5_hora;
function pintarGraficaHora(data) {
  var sketch = function (p) {
    // Configuracion inicial
    p.setup = function () {
      // Se crea un canvas
      var canvas = p.createCanvas(600, 350).position(400, 325);
      p.background(150);

      // Prepara los puntos para el ploteo
      var points = [];
      for (var i = 0; i < data.length; i++) {
        points[i] = new GPoint(i, data[i]);
      }

      // Crea un nuevo ploteo y establece su posicion y dimension en la pantalla.
      var plot = new GPlot(p);
      plot.setPos(10, 10);
      plot.setDim(480, 230);
      plot.getXAxis().setNTicks(24);

      // Establece el titulo del grafico y las etiquetas de los ejes
      plot.getXAxis().setAxisLabelText("Hora");
      plot.getYAxis().setAxisLabelText("Cantidad");
      plot.setPoints(points);

      // Lo dibuja
      p.draw = function () {
        plot.beginDraw();
        plot.drawBackground();
        plot.drawBox();
        plot.drawXAxis();
        plot.drawYAxis();
        plot.drawTitle();
        plot.drawGridLines(GPlot.BOTH);
        plot.drawLines();
        plot.drawPoints();
        plot.endDraw();
      };

      p.noLoop();
    };
  };
  myp5_hora = new p5(sketch);
}

// Restricciones
// 1. En el eje X soporta hasta 31 titulos
// 2. En el eje Y soporta hasta 12 titulos
let myp5_dia;
function pintarGraficaDia(data) {
  // Se verifica que hallan registros que graficar
  if (data.length <= 0) {
    return;
  }

  if (typeof myp5_dia !== "undefined") {
    myp5_dia.remove();
  }

  var sketch = function (p) {
    // Configuracion inicial
    p.setup = function () {
      // Se crea un canvas
      var canvas = p.createCanvas(600, 350).position(400, 325);

      // Configurando el lienzo
      p.fill(0);
      p.textSize(10);

      // Se inicializa las variables para empezar a graficar
      const TAMANIO_LIENZO_X = 527;
      const TAMANIO_LIENZO_Y = 276;
      let cantidad_titulos_y = data.length > 12 ? 12 : data.length;
      let espacio_x = TAMANIO_LIENZO_X / data.length;
      let espacio_y = TAMANIO_LIENZO_Y / cantidad_titulos_y;
      let valor_maximo_y = data.reduce((max, elemento) => {
        return elemento.cantidad > max ? elemento.cantidad : max;
      }, data[0].cantidad);
      let multiplo_y = valor_maximo_y / TAMANIO_LIENZO_Y;

      // Variables para graficar las lineas
      let inicio_grafica_x = 0;
      let inicio_grafica_y = 0;
      let acum = 1;

      // Se dibuja la linea del eje X
      p.line(50, 300, 587, 300);
      // Se dibuja la linea del eje Y
      p.line(50, 300, 50, 14);
      // Se inicia con el pintado de la grafica
      data.forEach((element, i) => {
        // Si hay mas de 31 datos que se deben de mostrar se para de graficar
        if (i > 30) {
          return;
        }

        // Se dibujan los titulos del eje X
        p.push();
        p.rotate(radians(270));
        p.text(element.dia, -330, 50 + (i + 1) * espacio_x);
        p.pop();

        // Se dibujan los titulos del eje Y
        if (cantidad_titulos_y > 0) {
          p.text(
            Math.round(espacio_y * multiplo_y * acum),
            20,
            300 -
              (TAMANIO_LIENZO_Y - espacio_y * cantidad_titulos_y + espacio_y)
          );
          cantidad_titulos_y--;
          acum++;
        }

        // Se dibuja el punto de referencia de la coordenada
        p.push();
        p.stroke("red");
        p.strokeWeight(6);
        p.point(50 + (i + 1) * espacio_x, 300 - element.cantidad / multiplo_y);
        p.pop();

        // Se dibuja la linea que representa la grafica
        p.line(
          50 + inicio_grafica_x,
          300 - inicio_grafica_y,
          50 + (i + 1) * espacio_x,
          300 - element.cantidad / multiplo_y
        );
        inicio_grafica_x = (i + 1) * espacio_x;
        inicio_grafica_y = element.cantidad / multiplo_y;
      });
    };
  };
  myp5_dia = new p5(sketch);
}

function draw() {
  fill(255, 255, 255); //COLOR BLANCO
  rect(380, 230, 650, 450); //AREA DE GRAFICA
  rect(25, 25, 325, 325); //AREA DE NOTIFICACIONES
  rect(25, 375, 325, 325); //AREA DE ALERTAS
  rect(390, 20, 550, 190); //AREA DE FECHA

  fill(0, 0, 0); //COLOR NEGRO
  textSize(50);
  text("GRUPO 2", 950, 100);

  textSize(20); //TEXTOS SIZE 20
  text("FECHA INICIO: ", 400, 50);
  text("FECHA FIN: ", 400, 100);
  text("Alerta Sonido", 50, 150);
  text("Alerta LED", 50, 250);

  textSize(30); //TEXTOS SIZE 30
  text("NOTIFICACIONES", 75, 75);
  textSize(25); //TEXTOS SIZE 25
  text("NUMERO DE ALERTAS", 50, 425);

  textSize(50); //TEXTOS SIZE 60
  text("REGISTRO DE CAÍDAS", 440, 300);

  textSize(80); //TEXTOS SIZE 80
  text(alertas, 120, 560);

  fill(color_status_sonido);
  rect(244, 126, 30, 28);
  fill(color_status_led);
  rect(244, 226, 30, 28);
}

function mostrarGrafica() {
  if (fecha_ini.value() == fecha_fin.value()) {
    fetch(URL_SERVER + "/caidas/" + fecha_ini.value() + "/" + fecha_fin.value())
      .then((response) => response.json())
      .then((data) => {
        if (typeof myp5_dia !== "undefined") {
          myp5_dia.remove();
        }
        pintarGraficaHora(data.info);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    fetch(URL_SERVER + "/caidas/" + fecha_ini.value() + "/" + fecha_fin.value())
      .then((response) => response.json())
      .then((data) => {
        if (typeof myp5_hora !== "undefined") {
          myp5_hora.remove();
        }
        console.log(data.info);
        pintarGraficaDia(data.info);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  fetch(URL_SERVER + "/alertas/" + fecha_ini.value() + "/" + fecha_fin.value())
    .then((response) => response.json())
    .then((data) => {
      alertas = data.info.cantidad;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function sonidoPressed() {
  if (status_sonido == "OFF") {
    fetch(URL_SERVER + "/caidas/notificacionSound", {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sonido: 1 }),
    })
      .then((response) => response.json())
      .then((data) => {
        status_sonido = "ON";
        btn_sonido.html("ON");
        color_status_sonido = "green";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    fetch(URL_SERVER + "/caidas/notificacionSound", {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sonido: 0 }),
    })
      .then((response) => response.json())
      .then((data) => {
        status_sonido = "OFF";
        btn_sonido.html("OFF");
        color_status_sonido = "black";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

function ledPressed() {
  if (status_led == "OFF") {
    fetch(URL_SERVER + "/caidas/notificacionLed", {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ led: 1 }),
    })
      .then((response) => response.json())
      .then((data) => {
        status_led = "ON";
        btn_led.html("ON");
        color_status_led = "green";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    fetch(URL_SERVER + "/caidas/notificacionLed", {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ led: 0 }),
    })
      .then((response) => response.json())
      .then((data) => {
        status_led = "OFF";
        btn_led.html("OFF");
        color_status_led = "black";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}
