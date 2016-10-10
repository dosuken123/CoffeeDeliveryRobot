/*******************************************
 RGB Fade
 
 Sparki has a Red, Green, Blue LED on its
 back. Using Red, Green and Blue, you can
 make any color you want. This program makes
 cycles through the 3 led by fading them.
 
 http://arcbotics.com/products/sparki/parts/rgb-led/
********************************************/
#include <Sparki.h> // include the sparki library

void setup()
{
  Serial1.begin(9600);
}
//int time = 3;
int time = 1000;
void loop()
{ 
//  sparki.clearLCD();
//  sparki.drawLine(0,0,127,63);
//  sparki.drawLine(0,63,127,0);
//  sparki.updateLCD();
//  delay(time);
//  if (Serial.available())
//  {
//    int inByte = Serial.read();
//    Serial.println((char)inByte);
//  }
//  else
//  {
    Serial1.println("Hey");
    delay(time);
//    delay(time);
//  }
}
