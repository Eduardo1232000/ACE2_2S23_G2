#include <SoftwareSerial.h>
#include <Wire.h>
#include "MAX30100_PulseOximeter.h"

SoftwareSerial miBT(10, 11);
char dato = 0;

// Variables para el sensor
#define REPORTING_PERIOD_MS     3000

PulseOximeter pox;
uint32_t tsLastReport = 0;

// Variables para almacenar lecturas anteriores
int lastHeartRate = 0;
int lastSpO2 = 0;

void onBeatDetected()
{
    Serial.println("Beat!");
}

void setup(){
  miBT.begin(38400);

  Serial.begin(115200);
  Serial.print("Inicializando el oxímetro de pulso...");

  if (!pox.begin()) {
      Serial.println("FALLÓ");
      for (;;) ;
  } else {
      Serial.println("ÉXITO");
  }

  pox.setOnBeatDetectedCallback(onBeatDetected);
}

void loop() {
  pox.update();

  if (millis() - tsLastReport > REPORTING_PERIOD_MS) {
      int heartRate = pox.getHeartRate();
      int spo2 = pox.getSpO2();

      // Verificar si las lecturas son válidas y han cambiado
      if (heartRate > 0 && spo2 > 0 && spo2 <= 100) {
          String dato = "\"porcentaje\":" + String(spo2) + ",\"frecuencia\":" + String(heartRate) + "\n";
          miBT.print(dato);

          // Actualizar las lecturas anteriores
          lastHeartRate = heartRate;
          lastSpO2 = spo2;
      }
      tsLastReport = millis();
  }

}
