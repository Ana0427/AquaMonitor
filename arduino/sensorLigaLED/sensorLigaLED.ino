/*******************************************************************************
* Sensor de Fluxo D'Agua: Primeiros Passos (v1.0) + LED Indicador
* 
* Adaptação: LED acende quando NÃO há fluxo
*             LED apaga quando HÁ fluxo
*******************************************************************************/

//definição do pino do sensor e de interrupção
const int INTERRUPCAO_SENSOR = 0; // interrupt = 0 equivale ao pino digital 2
const int PINO_SENSOR = 2;

//definição do pino do LED
const int PINO_LED = 8;  // escolha um pino digital disponível

//definição da variável de contagem de voltas
unsigned long contador = 0;

//definição do fator de calibração para conversão do valor lido
const float FATOR_CALIBRACAO = 4.5;

//definição das variáveis de fluxo e volume
float fluxo = 0;
float volume = 0;
float volume_total = 0;

//definição da variável de intervalo de tempo
unsigned long tempo_antes = 0;

void setup() {

  //inicialização do monitor serial
  Serial.begin(9600);

  //mensagem de inicialização
  Serial.println("Medidor de Fluxo e Volume de Liquidos\n");

  //configuração do pino do sensor
  pinMode(PINO_SENSOR, INPUT_PULLUP);

  //configuração do LED como saída
  pinMode(PINO_LED, OUTPUT);

  //garante que o LED inicie apagado
  digitalWrite(PINO_LED, LOW);

  //inicia a contagem de pulsos
  attachInterrupt(INTERRUPCAO_SENSOR, contador_pulso, FALLING);
}

void loop() {

  //executa a contagem de pulsos uma vez por segundo
  if ((millis() - tempo_antes) > 1000) {

    //desabilita a interrupção para realizar a conversão do valor de pulsos
    detachInterrupt(INTERRUPCAO_SENSOR);

    //conversão do valor de pulsos para L/min
    fluxo = ((1000.0 / (millis() - tempo_antes)) * contador) / FATOR_CALIBRACAO;

    //exibição do valor de fluxo
    Serial.print("Fluxo de:");
    Serial.print(fluxo);
    Serial.println(" L/min");

    //cálculo do volume em L passado pelo sensor
    volume = fluxo / 60;

    //armazenamento do volume
    volume_total += volume;

    //exibição do valor de volume
    Serial.print("Volume: ");
    Serial.print(volume_total);
    Serial.println(" L");
    Serial.println();

    //controle do LED
    if (fluxo >= 0.1) {
      // sem fluxo → LED aceso
      digitalWrite(PINO_LED, HIGH);
    } else {
      // com fluxo → LED apagado
      digitalWrite(PINO_LED, LOW);
    }

    //reinicialização do contador de pulsos
    contador = 0;

    //atualização da variável tempo_antes
    tempo_antes = millis();

    //reativa a contagem de pulsos do sensor
    attachInterrupt(INTERRUPCAO_SENSOR, contador_pulso, FALLING);
  }
}

//função chamada pela interrupção para contagem de pulsos
void contador_pulso() {
  contador++;
}
