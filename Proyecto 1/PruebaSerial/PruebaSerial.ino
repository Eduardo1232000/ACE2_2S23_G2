void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(9,INPUT);
}

void loop() {
  double temperatura = random(1,100);
  double humedadr = random(1,100);
  double humedada = random(1,100);
  double presion = random(1,100);
  double velocidad = random(1,100);
  double direccion = random(1,360);

  String json = "{\"temperatura\":"+String(temperatura)+",\"presion\":"+String(presion)+",\"humedadR\":"+String(humedadr)+",\"humedadA\":"+String(humedada)+",\"velocidad\":"+String(velocidad)+",\"direccion\":"+String(direccion)+"}\n";

  Serial.print(json);
  delay(1000);
}
