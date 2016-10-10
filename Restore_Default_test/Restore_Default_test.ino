#include <Sparki.h>  // include the robot library

void setup() {
  Serial1.begin(9600);
}

int count = 0;
void loop() {
  int inByte = Serial1.read();
//  Serial1.println("Hello World");
  sparki.clearLCD(); // wipe the LCD clear
  sparki.drawChar(10, 1, (char)inByte);
  sparki.updateLCD();
  delay(1000);
}
