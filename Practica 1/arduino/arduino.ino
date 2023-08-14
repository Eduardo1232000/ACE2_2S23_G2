// Para DHT11
#include <DHT.h>
#include <DHT_U.h>

// Para BMP280
#include <Wire.h>             // Para I2C
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>

// Para DHT11
#define DHTPIN 2
#define DHTTYPE DHT11

// Para DHT11
float temperatura;
float humedad_relativa;

// Para BMP280
float presion;
float humedad_absoluta;

// Para el anemometro
float velocidad_viento;// entrada A0
float v1;

// Para la veleta
int direccion;

DHT dht(DHTPIN, DHTTYPE);
Adafruit_BMP280 bmp;

// Cableado de TCS3200 a Arduino
#define S0 4
#define S1 5
#define S2 6
#define S3 7
#define sensorSalida 8

int rojo = 0;  
int verde = 0;  
int azul = 0;  

void setup() {
  Serial.begin(9600);
  dht.begin();
  if(!bmp.begin()){ // Validando que se haya inicializado correctamente
    Serial.println("BMP no encontrado");
    while(1);       // Deteniendo flujo de datos
  }
  analogReference(INTERNAL);// pone como referencia interna 1.1V
  pinMode(S0, OUTPUT);
  pinMode(S1, OUTPUT);
  pinMode(S2, OUTPUT);
  pinMode(S3, OUTPUT);
  pinMode(sensorSalida, INPUT);
  // Configura la escala de Frecuencia en 20%
  digitalWrite(S0,HIGH);
  digitalWrite(S1,LOW);
}

void loop() {
  temperatura = dht.readTemperature();        // °C
  humedad_relativa = dht.readHumidity();      // %
  presion = bmp.readPressure();               // Pa
  humedad_absoluta= (((presion/101300)*18)/(0.0821*(temperatura+273.15)))*1000; // g/m3
  presion = presion*0.00750062;               // mmHg
  v1 =(analogRead(0));                        // lectura de sensor a0
  velocidad_viento = (v1*0.190);              // 0,190 corresponde a la pendiente de la curva aca deben poner el numero que calcularon
  color();
  
  if ((rojo < verde && rojo < azul && verde <= azul && rojo <= 40) || (rojo >= 9 && rojo <= 40 && verde >= 28 && verde <= 65 && azul >= 50 && azul <= 82)){   
    // AMARILLO
    direccion = 270; // oeste
  } else if ((rojo < verde && rojo <= azul && verde > azul && rojo <= 46 && verde >= 52 && verde <= 100) || (rojo >= 11 && rojo <= 46 && verde >= 52 && verde <= 95 && azul >= 25 && azul <= 55)){   
    // ROSADO
    direccion = 315; // Noreste
  } else if ((rojo > verde && rojo > azul && verde > azul) || rojo >= 46 && rojo <= 125 && verde >= 45 && verde <= 90 && azul >= 30 && azul <= 60){   
    // CELESTE
    direccion = 0; // Norte
  } else if ((rojo < verde && rojo <= azul && verde > azul && verde >= 105 && rojo <= 70) || rojo >= 35 && rojo <= 80 && verde >= 105 && verde <= 199 && azul >= 70 && azul <= 145){   
    // ROJO
    direccion = 45; // noreste
  } else if ((rojo > verde && rojo < azul && verde < azul) || rojo >= 39 && rojo <= 69 && verde >= 29 && verde <= 80 && azul >= 57 && azul <= 98){   
    // VERDE
    direccion = 90; // este 
  } else if ((rojo < verde && rojo <= azul && verde > azul && rojo >= 75) || rojo >= 75 && rojo <= 160 && verde >= 70 && verde <= 200 && azul >= 100 && azul <= 175){   
    // CAFE
    direccion = 135; // sureste
  } else if ((rojo < verde && rojo <= azul && verde > azul && rojo >= 160) || rojo >= 160 && verde >= 210 && azul >= 165){   
    // NEGRO
    direccion = 180; // sur
  } else if ((rojo <= verde && rojo > azul && verde > azul) || rojo >= 80 && rojo <= 195 && verde >= 102 && verde <= 190 && azul >= 53 && azul <= 130){   
    // AZUL
    direccion = 225; // suroeste
  }

  String json = "{\"temperatura\":"+String(temperatura)+",\"presion\":"+String(presion)+",\"humedadR\":"+String(humedad_relativa)+",\"humedadA\":"+String(humedad_absoluta)+",\"velocidad\":"+String(velocidad_viento)+",\"direccion\":"+String(direccion)+"}\n";
  Serial.write(json.c_str());
  delay(1000);
}

void color() {
  digitalWrite(S2, LOW);
  digitalWrite(S3, LOW);
  rojo = pulseIn(sensorSalida, digitalRead(sensorSalida) == HIGH ? LOW : HIGH);
  digitalWrite(S3, HIGH);
  azul = pulseIn(sensorSalida, digitalRead(sensorSalida) == HIGH ? LOW : HIGH);
  digitalWrite(S2, HIGH);
  verde = pulseIn(sensorSalida, digitalRead(sensorSalida) == HIGH ? LOW : HIGH);
}
