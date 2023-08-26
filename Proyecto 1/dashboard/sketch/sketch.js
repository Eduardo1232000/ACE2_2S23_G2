var alertas = 0; //CONTADOR DE ALERTAS
var fecha_ini = ""; //STRING DE FECHA INICIO
var fecha_fin = ""; //STRING DE FECHA FINAL

var status_sonido = "OFF"; //ESTADO DE ALERTA DE SONIDO
var color_status_sonido = "black";

var status_led = "OFF"; //ESTADO DE ALERTA DE LED
var color_status_led = "black";

var date = new Date(); //FECHA ACTUAL
var dateString = date.toDateString(); //STRING DE FECHA ACTUAL

var btn_sonido; //BOTON DE ALERTA DE SONIDO
var btn_led; //BOTON DE ALERTA DE LED

function setup() {
  createCanvas(1200, 720);
  background("#DEDEDE");
  btn_sonido = createButton(status_sonido).position(200, 125).mousePressed(sonidoPressed);
  btn_led = createButton(status_led).position(200, 225).mousePressed(ledPressed);
  fecha_ini = createInput("2023-01-01", "date").position(600, 30);
  fecha_fin = createInput("2023-01-01", "date").position(600, 80);
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