#include <ArduinoJson.h>

#include <NewPing.h>  // Para controlar los sensore ultrasonicos

// Ultrasonico 1
#define TRIGGER_PIN 3
#define ECHO_PIN 4
// Ultrasonico 2
#define TRIGGER_PIN_2 5
#define ECHO_PIN_2 6
// Ultrasonico 3
#define TRIGGER_PIN_3 7
#define ECHO_PIN_3 8
// Leds
#define LED_1 9
#define LED_2 10
#define BUZZER 11
#define MAX_DISTANCE 400 // Distancia máxima de medición en centímetros que puede medir

NewPing sonar1(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE); // Configurar el objeto NewPing
NewPing sonar2(TRIGGER_PIN_2, ECHO_PIN_2, MAX_DISTANCE); // Configurar el objeto NewPing
NewPing sonar3(TRIGGER_PIN_3, ECHO_PIN_3, MAX_DISTANCE); // Configurar el objeto NewPing

bool flag = true;
const size_t bufferSize = 2 * JSON_OBJECT_SIZE(3); // Ajusta este tamaño según tu JSON
StaticJsonDocument<bufferSize> jsonDocument;
DeserializationError jsonError;

// Distancias que mide actualmente
int dist_act_1 = 0;
int dist_act_2 = 0;
int dist_act_3 = 0;

// Distancias que midió en un momento anterior
int dist_ant_1 = 0;
int dist_ant_2 = 0;
int dist_ant_3 = 0;

// Diferencia minima que debe haber entre
// la distancia anterior y la actual (distancia_actual - distancia_anterior)
int error = 20;
// Numero de lecturas que hará (para sacar un promedio de las distancias)
int num_lect = 30;

int leerUltrasonico(/*int TRIGGER, int ECHO*/NewPing sonar) {
  int total = 0;
  int promedio = 0;
  int val_invalidos = 0;

  // Obteniendo promedio de mediciones
  for (int i = 0; i < num_lect; i++) {
    int valor = sonar.ping_cm();        // Obteniendo la distancia en centimetros
    if (valor > 400 /*or valor < 100*/) {   // Datos no validos
      val_invalidos++;
    }
    else {
      total += valor;
    }
    delay(15);
  }

  promedio = total / (num_lect - val_invalidos);
  return promedio;
}

void setup() {
  pinMode(TRIGGER_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(TRIGGER_PIN_2, OUTPUT);
  pinMode(ECHO_PIN_2, INPUT);
  pinMode(TRIGGER_PIN_3, OUTPUT);
  pinMode(ECHO_PIN_3, INPUT);
  pinMode(LED_1, OUTPUT);
  pinMode(LED_2, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
  // Lectura inicial
  dist_ant_1 = leerUltrasonico(/*TRIGGER_PIN, ECHO_PIN*/sonar1);
  dist_ant_2 = leerUltrasonico(/*TRIGGER_PIN_2, ECHO_PIN_2*/sonar2);
  dist_ant_3 = leerUltrasonico(/*TRIGGER_PIN_3, ECHO_PIN_3*/sonar3);
}

void loop() {
  // Lectura actual
  dist_act_1 = leerUltrasonico(/*TRIGGER_PIN, ECHO_PIN*/sonar1);
  dist_act_2 = leerUltrasonico(/*TRIGGER_PIN_2, ECHO_PIN_2*/sonar2);
  dist_act_3 = leerUltrasonico(/*TRIGGER_PIN_3, ECHO_PIN_3*/sonar3);
  
  // No aceptar valores nulos
  if (dist_act_1 != -1 and dist_act_2 != -1 and dist_act_3 != -1) {
    if ( flag and (abs(dist_ant_1 - dist_act_1) > error) or (abs(dist_ant_2 - dist_act_2) > error) or (abs(dist_ant_3 - dist_act_3) > error)) {
      //Serial.println("OBJETO CAIDO");

      String json = "{\"alerta\":" + String(1) + "}\n";
      Serial.write(json.c_str());
      delay(500);

      int led = -1;
      int buzzer = -1;
      int cont = 0;

      if (Serial.available() > 0) {
        String jsonString = Serial.readStringUntil('\n'); // Lee la cadena JSON hasta el salto de línea
        jsonError = deserializeJson(jsonDocument, jsonString);

        if (jsonError) {
          Serial.print("Error al parsear JSON: ");
          Serial.println(jsonError.c_str());
        } else {
          buzzer = jsonDocument["sonido"].as<int>();
          led = jsonDocument["led"].as<int>();
        }
      }
      json = "{\"sonido\":" + String(buzzer) + ",\"led\":" + String(led) + "}\n";
      Serial.write(json.c_str());

      if (led == 1) {
        digitalWrite(LED_1, HIGH);  
        digitalWrite(LED_2, HIGH);
        delay(10000);               // 10 s
        digitalWrite(LED_1, LOW);
        digitalWrite(LED_2, LOW);
      }
      if (buzzer == 1) {
        digitalWrite(BUZZER, HIGH); 
        delay(30000);               // 30 s
        digitalWrite(BUZZER, LOW);
      }

      flag = false;
    }
    else {
      flag = true;
    }
    dist_ant_1 = dist_act_1;
    dist_ant_2 = dist_act_2;
    dist_ant_3 = dist_act_3;
    delay(50);
  }
}
