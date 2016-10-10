/*******************************************
 Melody
 
This example shows how to make a short melody
with Sparki's buzzer.

This example is based on the Arduino example
by Tom Igoe.
********************************************/
#include <Sparki.h> // include the sparki library

int Baudrate = 9600;
String inputString = "";
boolean returnFlag = false;

void setup() {
  Serial1.begin(Baudrate);
}

void loop() {
  if (Serial1.available()) {
    int inByte = Serial1.read();
    inputString += (char)inByte;
  }
  sparki.clearLCD(); // wipe the LCD clear
  char charBuf[50];
  inputString.toCharArray(charBuf, 50);
  sparki.drawString(10, 1, charBuf);
  sparki.updateLCD(); // put the drawings on the screen
  delay(1000);
//  Serial1.print("");
//  Serial1.println("");
}
