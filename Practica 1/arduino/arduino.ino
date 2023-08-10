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

void setup() {
  Serial.begin(9600);
  dht.begin();
  if(!bmp.begin()){ // Validando que se haya inicializado correctamente
    Serial.println("BMP no encontrado");
    while(1);       // Deteniendo flujo de datos
  }
  analogReference(INTERNAL);// pone como referencia interna 1.1V
}

void loop() {
  temperatura = dht.readTemperature();        // °C
  humedad_relativa = dht.readHumidity();      // %
  presion = bmp.readPressure();               // Pa
  humedad_absoluta= (((presion/101300)*18)/(0.0821*(temperatura+273.15)))*0.01; // g/m3
  presion = presion*0.00750062;               // mmHg
  v1 =(analogRead(0));                        // lectura de sensor a0
  velocidad_viento = (v1*0.190);              // 0,190 corresponde a la pendiente de la curva aca deben poner el numero que calcularon

  String json = "{\"temperatura\":"+String(temperatura)+",\"presion\":"+String(presion)+",\"humedadR\":"+String(humedad_relativa)+",\"humedadA\":"+String(humedad_absoluta)+",\"velocidad\":"+String(velocidad_viento)+",\"direccion\":"+String(direccion)+"}\n";
  Serial.write(json.c_str());
  delay(1000);
}
