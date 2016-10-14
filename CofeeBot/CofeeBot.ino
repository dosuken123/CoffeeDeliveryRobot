/*******************************************
 Melody
 
This example shows how to make a short melody
with Sparki's buzzer.

This example is based on the Arduino example
by Tom Igoe.
********************************************/
#include <Sparki.h> // include the sparki library
#include "pitches.h" // include a list of pitches

int Baudrate = 9600;
String inputString = "";
//boolean ready = true;
boolean isGripperOpened = true; // initalize, opened, closed

// notes in the melody:
int melody[] = { NOTE_C4, NOTE_G3,NOTE_G3, NOTE_A3, NOTE_G3,0, NOTE_B3, NOTE_C4 };

// note durations: 4 = quarter note, 8 = eighth note, etc.:
int noteDurations[] = { 4, 8, 8, 4, 4, 4, 4, 4 };

void setup() {
  Serial1.begin(Baudrate);
  sparki.servo(SERVO_CENTER); 
  isGripperOpened = true;
  sparki.gripperOpen(3);
}

//boolean send_info_flg = false;
//int ave_num_max = 10;
//int ave_num = 0;
//int ave_lineLeft   = 0;   // measure the left IR sensor
//int ave_lineCenter = 0; // measure the center IR sensor
//int ave_lineRight  = 0;  // measure the right IR sensor
//int ave_edgeLeft   = 0;   // measure the left edge IR sensor
//int ave_edgeRight  = 0;  // measure the right edge IR sensor
//int ave_ping_cm = 0; // measures the distance with Sparki's eyes
            
void loop() {

//  if (send_info_flg) {
//    if (ave_num < ave_num_max) {
//      ave_lineLeft   += sparki.lineLeft();   // measure the left IR sensor
//      ave_lineCenter += sparki.lineCenter(); // measure the center IR sensor
//      ave_lineRight  += sparki.lineRight();  // measure the right IR sensor
//      ave_edgeLeft   += sparki.edgeLeft();   // measure the left edge IR sensor
//      ave_edgeRight  += sparki.edgeRight();  // measure the right edge IR sensor
//      ave_ping_cm += sparki.ping(); // measures the distance with Sparki's eyes
//    } else if (ave_num >= ave_num_max) {
//      String line = "!11" + 
//                    String(ave_edgeLeft/ave_num_max) + "," + 
//                    String(ave_lineLeft/ave_num_max)  + "," +  
//                    String(ave_lineCenter/ave_num_max) + "," +  
//                    String(ave_lineRight/ave_num_max) + "," + 
//                    String(ave_edgeRight/ave_num_max) + "," +
//                    String(ave_ping_cm/ave_num_max) + "," + String(isGripperOpened);
//      Serial1.println(line);
//      send_info_flg = false;
//    }
//    ave_num++;
//  }
  
  // Update info
  if (Serial1.available()) {
    int inByte = Serial1.read();
    inputString += (char)inByte;
    if ((char)inByte == '\n') {
      if (inputString.length() > 2) {
        if (inputString[0] == '!' &&  // header
            inputString[1] == '1' &&  // data sending
            inputString[2] == '0') {  // request
//              ave_num = 0;
//              ave_lineLeft   = 0;   // measure the left IR sensor
//              ave_lineCenter = 0; // measure the center IR sensor
//              ave_lineRight  = 0;  // measure the right IR sensor
//              ave_edgeLeft   = 0;   // measure the left edge IR sensor
//              ave_edgeRight  = 0;  // measure the right edge IR sensor
//              ave_ping_cm = 0; // measures the distance with Sparki's eyes
//              send_info_flg = true;
            float magX  = sparki.magX();   // measure the accelerometer x-axis
            float magY  = sparki.magY();   // measure the accelerometer y-axis
            float magZ  = sparki.magZ();   // measure the accelerometer z-axis
            int lineLeft   = sparki.lineLeft();   // measure the left IR sensor
            int lineCenter = sparki.lineCenter(); // measure the center IR sensor
            int lineRight  = sparki.lineRight();  // measure the right IR sensor
            int edgeLeft   = sparki.edgeLeft();   // measure the left edge IR sensor
            int edgeRight  = sparki.edgeRight();  // measure the right edge IR sensor
            int ping_cm = sparki.ping(); // measures the distance with Sparki's eyes
            // header + data sending + response
//            String line = "!11" + String(magX) + "," + String(magY)  + "," +  String(magZ) + "," + 
//                                  String(lineLeft)  + "," +  String(lineCenter) + "," +  String(lineRight) + "," + 
//                                  String(edgeLeft)  + "," +  String(edgeRight);  
            String line = "!11" + String(edgeLeft) + "," + String(lineLeft)  + "," +  String(lineCenter) + "," +  String(lineRight) + "," + String(edgeRight) + "," +
                                  String(ping_cm) + "," + String(isGripperOpened) + "," + String(magX) + "," + String(magY)  + "," + String(magZ) ;
            Serial1.println(line);
        }
        else if (inputString[0] == '!' &&  // header
                 inputString[1] == '2') {  // sparki move
          if (inputString[2] == '5') {  // turn left
            sparki.moveLeft();
//            Serial1.println("!21"); // response
          }
          else if (inputString[2] == '6') {  // move forward
            sparki.moveForward();
//            Serial1.println("!21"); // response
          }
          else if (inputString[2] == '7') {  // turn right
            sparki.moveRight();
//            Serial1.println("!21"); // response
          }
          else if (inputString[2] == '8') {  // 90 degree turn right
            sparki.moveRight(90);
            delay(2000);
          }
          else if (inputString[2] == '9') {  // 90 degree turn left
            sparki.moveLeft(90);
            delay(2000);
          }
          else if (inputString[2] == '4') {  // stop
            sparki.moveStop();
//            Serial1.println("!21"); // response
          }
          else if (inputString[2] == '3') {  // moveBackward
            sparki.moveBackward();
//            Serial1.println("!21"); // response
          }
        }
        else if (inputString[0] == '!' &&  // header
                 inputString[1] == '3') {  // sparki gripper
          if (inputString[2] == '5') {  // open the robot's gripper by 3 centimeters
            if (!isGripperOpened) {
              sparki.gripperOpen(3);  
              isGripperOpened = true;
//              Serial1.println("!31"); // response
            }
          }
          else if (inputString[2] == '6') {  // close the robot's gripper by 3 centimeters
            if (isGripperOpened) {
              sparki.gripperClose(3); 
              isGripperOpened = false;
//              Serial1.println("!31"); // response
            }
          }
        }
        else if (inputString[0] == '!' &&  // header
                 inputString[1] == '4') {  // sparki servo
          if (inputString[2] == '5') {  // rotate the servo to is 0 degree postion (forward)
            sparki.servo(SERVO_CENTER); 
//            Serial1.println("!41"); // response
          }
        }
        else if (inputString[0] == '!' &&  // header
                 inputString[1] == '5') {  // delay 500msec
          if (inputString[2] == '0') {  // delay 500msec
            delay(500);
          }
        }
        else if (inputString[0] == '!' &&  // header
                 inputString[1] == '6') {  // melody
          if (inputString[2] == '0') {  // melody
            delay(1000);
            // play each note in the arrays
            for (int thisNote = 0; thisNote < 8; thisNote++) {
          
              // calculate the note duration as 1 second divided by note type.
              //e.g. quarter note = 1000 / 4, eighth note = 1000/8, etc.
              int noteDuration = 1000/noteDurations[thisNote];
              sparki.beep(melody[thisNote],noteDuration);
          
              // to distinguish the notes, set a minimum time between them.
              // the note's duration + 30% seems to work well:
              int pauseBetweenNotes = noteDuration * 1.30;
              delay(pauseBetweenNotes);
              // stop the tone playing:
              sparki.noBeep();
            }
          }
        }
//        else if (inputString[0] == '!' &&  // header
//                 inputString[1] == '7') {  // LCD text
//          delay(1000);
//          sparki.clearLCD(); // wipe the LCD clear
//          char charBuf[100];
//          inputString.toCharArray(charBuf, 100);
//          charBuf[0] = ' ';
//          charBuf[1] = ' ';
//          sparki.drawString(10, 1, charBuf);
//          sparki.updateLCD(); // put the drawings on the screen
//          delay(1000);
//        }
      }
      inputString = "";
    }
  }
  
}

//  if (Serial1.available()) {
//    int inByte = Serial1.read();
//    inputString += (char)inByte;
//  }
  
//  sparki.clearLCD(); // wipe the LCD clear
//  char charBuf[50];
//  inputString.toCharArray(charBuf, 50);
//  sparki.drawString(10, 1, charBuf);
//  sparki.updateLCD(); // put the drawings on the screen
//  delay(1000);

//  Serial1.print("!!01");

//    Serial1.print(x);
          //    Serial1.print(",");
          //    Serial1.print(y);
          //    Serial1.print(",");
          //    Serial1.print(z);
          //    Serial1.println("");
          
//          sparki.clearLCD(); // wipe the LCD clear
//  char charBuf[50];
//  inputString.toCharArray(charBuf, 50);
//  sparki.drawString(10, 1, charBuf);
//  sparki.updateLCD(); // put the drawings on the screen
//  delay(1000);
  
//    if (ready)
//    {
//      float x  = sparki.magX();   // measure the accelerometer x-axis
//      float y  = sparki.magY();   // measure the accelerometer y-axis
//      float z  = sparki.magZ();   // measure the accelerometer z-axis
//      //  Serial1.print("!!01");
//      String line = String(x) + "," + String(y)  + "," +  String(z);
//    //    Serial1.print(x);
//    //    Serial1.print(",");
//    //    Serial1.print(y);
//    //    Serial1.print(",");
//    //    Serial1.print(z);
//    //    Serial1.println("");
//      Serial1.println(line);
//      ready = false;
//    }

//  }

//  Serial1.print("");
//  Serial1.println("");
