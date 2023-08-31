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
  fecha_fin = createInput("2023-08-01", "date").position(600, 80);
  button = createButton('Graficar');
  button.position(670, 130);
  button.mousePressed(mostrarGrafica);
}

function fillData() {

  // loadJSON("http://localhost:3000", gotData);
  // loadJSON(
  //   "http://localhost:3000/barra/" +
  //     fecha_ini.value() +
  //     "/" +
  //     fecha_fin.value(),
  //   gotDataG
  // );
}

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
      plot.setPoints(points);;

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
  var myp5 = new p5(sketch);
}

function gotData(data) {
  console.log(data);
  alertas = data.caidas;
}

function gotDataG(data) {
  console.log(data);
  numberOfRows = data.length;
  numberOfColumns = 2;
  dataChartLine = data;
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
  text(alertas, 170, 560);

  fill(color_status_sonido);
  rect(244, 126, 30, 28);
  fill(color_status_led);
  rect(244, 226, 30, 28);

  if (dataChartLine) {
    lineChart();
  }
}

function lineChart() {
  fill(0);
  textSize(10);

  var max_value = 0;

  for (var i = 0; i < numberOfRows; i++) {
    //place years
    push();
    rotate(radians(270));
    text(dataChartLine[i].fecha, -655, 505 + i * 30);
    pop();

    if (dataChartLine[i].caidas > max_value)
      max_value = dataChartLine[i].caidas;

    //draw graph
    if (i == 0) {
      line(
        i * 30 + 470,
        600,
        (i + 1) * 30 + 470,
        600 - dataChartLine[i].caidas * 10
      );
    } else {
      line(
        i * 30 + 470,
        600 - dataChartLine[i - 1].caidas * 10,
        (i + 1) * 30 + 470,
        600 - dataChartLine[i].caidas * 10
      );
    }
  }

  for (var k = 0; k <= max_value; k = k + 1) {
    text(k, 450, 600 - k * 10);
  }
}

function mostrarGrafica() {
  if (fecha_ini.value() == fecha_fin.value()) {
    fetch(URL_SERVER + '/caidas/' + fecha_ini.value() + '/' + fecha_fin.value())
      .then(response => response.json())
      .then(data => {
        pintarGraficaHora(data.info);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  } else {
    // console.log("Graficar");
  }
}

function sonidoPressed() {
  if (status_sonido == "OFF") {
    status_sonido = "ON";
    btn_sonido.html("ON");
    color_status_sonido = "green";
  } else {
    status_sonido = "OFF";
    btn_sonido.html("OFF");
    color_status_sonido = "black";
  }
}

function ledPressed() {
  if (status_led == "OFF") {
    status_led = "ON";
    btn_led.html("ON");
    color_status_led = "green";
  } else {
    status_led = "OFF";
    btn_led.html("OFF");
    color_status_led = "black";
  }
}
