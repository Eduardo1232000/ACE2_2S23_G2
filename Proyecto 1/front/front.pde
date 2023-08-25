import controlP5.*;

ControlP5 cp5;
int year_start, month_start, day_start;  //PARA FECHA DE INICIO
int year_end, month_end, day_end;        //PARA FECHA DE FIN

int alertas = 0;                          //CONTADOR DE ALERTAS
String fecha_ini = "";                    //STRING DE FECHA INICIO
String fecha_fin = "";                    //STRING DE FECHA FINAL

Toggle sonido_switch;
Toggle led_switch;
Button buscar;



void setup(){
  size(1200,720);                        //SIZE DE LA VENTANA
  background(#DEDEDE);                   //COLOR DE FONDO DE LA VENTANA
  cp5 = new ControlP5(this);

  cp5.addSlider("month_start")          //SELECTOR DE FECHA INICIAL
     .setPosition(400, 100)
     .setSize(200, 20)
     .setRange(1, 12)
     .setValue(month());
  cp5.addSlider("day_start")
     .setPosition(400, 70)
     .setSize(200, 20)
     .setRange(1, 31)
     .setValue(day());
  cp5.addSlider("year_start")
     .setPosition(400, 130)
     .setSize(200, 20)
     .setRange(2000, 2100)
     .setValue(year());     
  
  cp5.addSlider("day_end")                //SELECTOR DE FECHA FINAL
     .setPosition(670, 70)
     .setSize(200, 20)
     .setRange(1, 31)
     .setValue(day());  
  cp5.addSlider("month_end")
     .setPosition(670, 100)
     .setSize(200, 20)
     .setRange(1, 12)
     .setValue(month());
  cp5.addSlider("year_end")                        
     .setPosition(670, 130)
     .setSize(200, 20)
     .setRange(2000, 2100)
     .setValue(year());
     
     
  buscar = cp5.addButton("buscar")                  //BOTON BUSCAR
     .setPosition(560, 170)
     .setSize(150, 30);
     
  sonido_switch = cp5.addToggle("sonido_switch")    //SWITCH SONIDO
     .setPosition(170, 135)
     .setSize(50, 20)
     .setColorActive(color(255, 0, 0))
     .setColorBackground(color(0, 0, 0))
     .setValue(false)
     .setMode(ControlP5.SWITCH);
     
  led_switch = cp5.addToggle("led_switch")          //SWITCH LED
     .setPosition(170, 235)
     .setSize(50, 20)
     .setColorActive(color(255, 0, 0))
     .setColorBackground(color(0, 0, 0))
     .setValue(false)
     .setMode(ControlP5.SWITCH);

}

void draw(){
  String status_sonido = sonido_switch.getBooleanValue() ? "On" : "Off";    //INTERCALA ENTRE On y Off
  String status_led = led_switch.getBooleanValue() ? "On" : "Off";          //INTERCALA ENTRE On y Off
  
  fill(255,255,255);            //COLOR BLANCO
  rect(380,230,650,450);        //AREA DE GRAFICA
  rect(25,25,325,325);          //AREA DE NOTIFICACIONES
  rect(25,375,325,325);         //AREA DE ALERTAS
  
  fill(#DEDEDE);                //COLOR DEL BACKGROUND
  rect(390,20,550,190);         //AREA DE FECHA
  
  fill(0,0,0);                  //COLOR NEGRO
  textSize(50);
  text("GRUPO 2",950,100);
    
  textSize(20);        //TEXTOS SIZE 20
  fecha_ini = day_start + "-" + month_start + "-" + year_start;        //ARMAR LA FECHA INICIO
  fecha_fin = day_end + "-" + month_end + "-" + year_end;              //ARMAR LA FECHA FINAL
  text("FECHA INICIO: " + fecha_ini , 400, 50);
  text("FECHA FIN: " + fecha_fin , 700, 50);
  text("Alerta Sonido",50,150);
  text("Alerta LED",   50,250);
  text(status_sonido, 250,150);
  text(status_led,    250,250);
  
  textSize(30);        //TEXTOS SIZE 30
  text("NOTIFICACIONES",75,75);
  text("NUMERO DE ALERTAS",50,425);
  
  textSize(60);        //TEXTOS SIZE 60
  text("REGISTRO DE CAÍDAS",440,300);
  
  textSize(80);        //TEXTOS SIZE 80
  text((alertas),170,560);
}

void buscar(){
    //ACCION DEL BOTON BUSCAR
    //fecha_ini = fecha inicio
    //fecha_fin = fecha final
    

}

void sonido_switch(boolean state) {      //ACCION DEL SWITCH DE SONIDO AL SER MOVIDO
 // CAMBIA LOS COLORES DEL SWITCH
    if(state == true){
      sonido_switch.setColorBackground(color(0, 0, 0)); 
      sonido_switch.setColorActive(color(0, 255, 0));
    }else{
      sonido_switch.setColorBackground(color(0, 0, 0));
      sonido_switch.setColorActive(color(255, 0, 0));
    }
}

void led_switch(boolean state) {        //ACCION DEL SWITCH DE LED AL SER MOVIDO
  // CAMBIA LOS COLORES DEL SWITCH
    if(state == true){
      led_switch.setColorBackground(color(0, 0, 0)); 
      led_switch.setColorActive(color(0, 255, 0));
    }else{
      led_switch.setColorBackground(color(0, 0, 0)); 
      led_switch.setColorActive(color(255, 0, 0));
    }
}
