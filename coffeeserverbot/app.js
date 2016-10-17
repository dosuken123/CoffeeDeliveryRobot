'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
// var SQLite = require('sqlite3').verbose();
var SlackBot = require('slackbots');
var SerialPort = require('serialport');

// local variables
var slack_bot_user = null;
var stock_data = "";
var current_sparki_info = null;
var current_sparki_state = { 'behavior': 'I am free at home', 'flag': 0, 'pool': 0, 'pool_timeout': 0 };
var pool_threshold = 10;
var pool_timeout_max = 5;
var threshold = 400;

// Arguments
// e.g.
// SLACK_BOT_API_TOKEN=xxx SLACK_BOT_NAME=coffeeserverbot SERIALPORT_NAME="/dev/tty.usbserial-FTBQY24X" SERIALPORT_BAUDRATE=115200 node app.js 
var slack_bot_api_token = process.env.SLACK_BOT_API_TOKEN; // || require('../token');
var slack_bot_name = process.env.SLACK_BOT_NAME;
var serialport_name = process.env.SERIALPORT_NAME;
var serialport_baudrate = process.env.SERIALPORT_BAUDRATE;

if (!slack_bot_api_token || !slack_bot_name || !serialport_name ||  !serialport_baudrate) {
  console.log('[ERROR] Required parameters are missing. e.g. SLACK_BOT_API_TOKEN');
  process.exit(1);
} 

var serialPort = new SerialPort(serialport_name, {
  baudRate: +serialport_baudrate
});

var slackbot = new SlackBot({
    token: slack_bot_api_token,
    name: slack_bot_name
});

//////////////////////////////////////////////////// Serial Communication

serialPort.on('open', function(){
  // console.log('Serial Port Opend');
  // serialport.on('data', function(data){
  //  console.log(data[0]);
  // });
  // serialPort.write('main screen turn on', function(err) {
  //   if (err) {
  //     return console.log('Error on write: ', err.message);
  //   }
  //   console.log('message written');
  // });

  // // // debug
  // current_sparki_state.flag = 0;
  // current_sparki_state.pool = 0;
  // current_sparki_state.pool_timeout = 0;
  // current_sparki_state.behavior = 'I am going to grab a coffee at pot';
  // serialPort.write('!7' + current_sparki_state.behavior + '\n', serialPortCallback); // LCD text

  // serialPort.write('!26\n', serialPortCallback); // move forward
  // current_sparki_state.flag = 0;
  //           serialPort.write('!28\n', serialPortCallback); // 90 degree turn right
  //           serialPort.write('!28\n', serialPortCallback); // 90 degree turn right
  //           serialPort.write('!26\n', serialPortCallback); // move forward
  //           current_sparki_state.behavior = 'I am going back to my home';
  console.log('Opend!');
  serialPort.write('!10\n',serialPortCallback); // Data Request

});

serialPort.on('error', function(err) {
  console.log('Error: ', err.message);
})

serialPort.on('close', function() {
  console.log('Closed');
})

var serialPortCallback = function(err) {
  if (err) { 
    return console.log('Error on write: ', err.message) ;
  }
};

var linefollowing = function() {
  if (current_sparki_info.lineCenter < threshold) {
    serialPort.write('!26\n', serialPortCallback); // move forward
  }
  else {
    if (current_sparki_info.lineLeft < threshold) {
      serialPort.write('!25\n', serialPortCallback); // turn left
    } 
    else if (current_sparki_info.lineRight < threshold) {
      serialPort.write('!27\n', serialPortCallback); // turn right
    }
    else {
      if (current_sparki_info.edgeLeft < threshold) {
      serialPort.write('!25\n', serialPortCallback); // turn left
      } 
      else if (current_sparki_info.edgeRight < threshold) {
        serialPort.write('!27\n', serialPortCallback); // turn right
      }
      else {
       serialPort.write('!23\n', serialPortCallback); // moveBackward
       // serialPort.write('!50\n', serialPortCallback); // delay 500msec
       // serialPort.write('!50\n', serialPortCallback); // delay 500msec
       // serialPort.write('!24\n', serialPortCallback); // stop
      }
    }
  }
};
var lineBacking = function() {
  if (current_sparki_info.lineCenter < threshold) {
    serialPort.write('!23\n', serialPortCallback); // moveBackward
  }
  else {
    if (current_sparki_info.lineLeft < threshold) {
      serialPort.write('!27\n', serialPortCallback); // turn right
    } 
    else if (current_sparki_info.lineRight < threshold) {
      serialPort.write('!25\n', serialPortCallback); // turn left
    }
    else {
      if (current_sparki_info.edgeLeft < threshold) {
        serialPort.write('!27\n', serialPortCallback); // turn right
      } 
      else if (current_sparki_info.edgeRight < threshold) {
        serialPort.write('!25\n', serialPortCallback); // turn left
      }
      else {
        serialPort.write('!26\n', serialPortCallback); // move forward
      }
    }
  }
};

serialPort.on('data', function (data) {
  stock_data += data;
  if (data.indexOf("\n") > -1) {
    if (stock_data.length > 2) {

      if (stock_data.charAt(0) == '!' && stock_data.charAt(1) == '1' && stock_data.charAt(2) == '1') { // header + data sending + response
        var response = stock_data.substring(3);
        response = response.replace(/\n$/, "").replace(/\r$/, "");
        console.log('response: ' + response);
        var array = response.split(',');

        // Update status
        current_sparki_info = { 'edgeLeft': parseInt(array[0]), 'lineLeft': parseInt(array[1]), 'lineCenter': parseInt(array[2]), 'lineRight': parseInt(array[3]), 'edgeRight': parseInt(array[4]), 
                                'ping_cm': parseInt(array[5]), 'isGripperOpened': Boolean(array[6]) };
        serialPort.write('!10\n',serialPortCallback); // Data Request

        // 
        if (current_sparki_state.behavior == 'I am free at home')
        {

        }
        else if (current_sparki_state.behavior == 'I am going to grab a coffee at pot')
        {
          if (current_sparki_state.flag == 0) { // Take off terminal
            linefollowing();
            // lift off - Check
            if (current_sparki_info.edgeLeft >= threshold && 
              current_sparki_info.edgeRight >= threshold) {
              current_sparki_state.flag = 1;  // On my way to intersection
            }
          }
          else if (current_sparki_state.flag == 1) { // On my way to intersection
            linefollowing();
            // Intersection - Check
            if (current_sparki_info.edgeLeft < threshold && 
                current_sparki_info.lineLeft < threshold && 
                current_sparki_info.lineCenter < threshold && 
                current_sparki_info.lineRight < threshold && 
                current_sparki_info.edgeRight < threshold) {
              serialPort.write('!24\n', serialPortCallback); // stop
              current_sparki_state.flag = 2;  // Make sure interestion
            }
          }
          else if (current_sparki_state.flag == 2) { // Make sure interestion
            if (current_sparki_state.pool_timeout > pool_timeout_max) {
              current_sparki_state.flag = 1; // On my way to intersection
              current_sparki_state.pool_timeout = 0;
            }
            else {
              current_sparki_state.pool_timeout++;
              if (current_sparki_info.edgeLeft < threshold && 
                  current_sparki_info.lineLeft < threshold && 
                  current_sparki_info.lineCenter < threshold && 
                  current_sparki_info.lineRight < threshold && 
                  current_sparki_info.edgeRight < threshold) {
                if (current_sparki_state.pool > pool_threshold) {
                  current_sparki_state.pool = 0;
                  current_sparki_state.pool_timeout = 0;
                  current_sparki_state.flag = 3; // On my way to Terminal
                  // Go forward little bit, and turn left.
                  serialPort.write('!26\n', serialPortCallback); // move forward
                  serialPort.write('!50\n', serialPortCallback); // delay 500msec
                  serialPort.write('!50\n', serialPortCallback); // delay 500msec
                  serialPort.write('!29\n', serialPortCallback); // 90 degree turn left
                }
                else {
                  current_sparki_state.pool++;
                  current_sparki_state.pool_timeout = 0;
                }
              }
            }
          }
          else if (current_sparki_state.flag == 3) { // On my way to Terminal
            linefollowing();
            // Terminal - Check
            if (current_sparki_info.edgeLeft < threshold && 
                current_sparki_info.lineLeft < threshold && 
                current_sparki_info.lineCenter < threshold && 
                current_sparki_info.lineRight < threshold && 
                current_sparki_info.edgeRight < threshold) {
              serialPort.write('!24\n', serialPortCallback); // stop
              current_sparki_state.flag = 4;  // Make sure Terminal
            }
          }
          else if (current_sparki_state.flag == 4) { // Make sure Terminal
            if (current_sparki_state.pool_timeout > pool_timeout_max) {
              current_sparki_state.flag = 3; // On my way to Terminal
              current_sparki_state.pool_timeout = 0;
            }
            else {
              current_sparki_state.pool_timeout++;
              if (current_sparki_info.edgeLeft < threshold && 
                  current_sparki_info.lineLeft < threshold && 
                  current_sparki_info.lineCenter < threshold && 
                  current_sparki_info.lineRight < threshold && 
                  current_sparki_info.edgeRight < threshold) {
                if (current_sparki_state.pool > pool_threshold) {
                  current_sparki_state.pool = 0;
                  current_sparki_state.pool_timeout = 0;
                  // Mission completed. Go Next.
                  serialPort.write('!60\n', serialPortCallback); // melody
                  current_sparki_state.flag = 0;
                  current_sparki_state.behavior = 'I am waiting at pot for someone passes me a coffee';
                  // serialPort.write('!7' + current_sparki_state.behavior + '\n', serialPortCallback); // LCD text
                }
                else {
                  current_sparki_state.pool++;
                  current_sparki_state.pool_timeout = 0;
                }
              }
            }
          }
        }
        else if (current_sparki_state.behavior == 'I am waiting at pot for someone passes me a coffee')
        {
          // grip
          if (current_sparki_info.ping_cm > 20) {
            serialPort.write('!35\n', serialPortCallback); // open the robot's gripper by 3 centimeters
          } else if (current_sparki_info.ping_cm < 10) {
            if (current_sparki_info.isGripperOpened != 2) {
              serialPort.write('!36\n', serialPortCallback); // close the robot's gripper by 3 centimeters
            }
            current_sparki_state.flag++;
          }
          if (current_sparki_state.flag > 30) {
            // Mission completed. Go Next.
            serialPort.write('!28\n', serialPortCallback); // 90 degree turn right
            serialPort.write('!28\n', serialPortCallback); // 90 degree turn right
            current_sparki_state.flag = 0;
            current_sparki_state.behavior = 'I am bringing a coffee to reception room';
            // serialPort.write('!7' + current_sparki_state.behavior + '\n', serialPortCallback); // LCD text
          }
        }
        else if (current_sparki_state.behavior == 'I am bringing a coffee to reception room')
        {
          if (current_sparki_state.flag == 0) { // Take off terminal
            linefollowing();
            // lift off - Check
            if (current_sparki_info.edgeLeft >= threshold && 
              current_sparki_info.edgeRight >= threshold) {
              current_sparki_state.flag = 3;  // On my way to Terminal
            }
          }
          else if (current_sparki_state.flag == 3) { // On my way to Terminal
            linefollowing();
            // Terminal - Check
            if (current_sparki_info.edgeLeft < threshold && 
                current_sparki_info.lineLeft < threshold && 
                current_sparki_info.lineCenter < threshold && 
                current_sparki_info.lineRight < threshold && 
                current_sparki_info.edgeRight < threshold) {
              serialPort.write('!24\n', serialPortCallback); // stop
              current_sparki_state.flag = 4;  // Make sure Terminal
            }
          }
          else if (current_sparki_state.flag == 4) { // Make sure Terminal
            if (current_sparki_state.pool_timeout > pool_timeout_max) {
              current_sparki_state.flag = 3; // On my way to Terminal
              current_sparki_state.pool_timeout = 0;
            }
            else {
              current_sparki_state.pool_timeout++;
              if (current_sparki_info.edgeLeft < threshold && 
                  current_sparki_info.lineLeft < threshold && 
                  current_sparki_info.lineCenter < threshold && 
                  current_sparki_info.lineRight < threshold && 
                  current_sparki_info.edgeRight < threshold) {
                if (current_sparki_state.pool > pool_threshold) {
                  current_sparki_state.pool = 0;
                  current_sparki_state.pool_timeout = 0;
                  // Mission completed. Go Next.
                  serialPort.write('!35\n', serialPortCallback); // open the robot's gripper by 3 centimeters
                  serialPort.write('!60\n', serialPortCallback); // melody
                  current_sparki_state.flag = 0;
                  current_sparki_state.behavior = 'I am waiting at reception room for someone grabs my coffee';
                  // serialPort.write('!7' + current_sparki_state.behavior + '\n', serialPortCallback); // LCD text
                }
                else {
                  current_sparki_state.pool++;
                  current_sparki_state.pool_timeout = 0;
                }
              }
            }
          }
          // // Line following
          // if (current_sparki_state.flag == 0 || current_sparki_state.flag == 1) {
          //   if (current_sparki_info.lineCenter < threshold) {
          //     serialPort.write('!26\n', serialPortCallback); // move forward
          //   }
          //   else {
          //     if (current_sparki_info.lineLeft < threshold) {
          //       serialPort.write('!25\n', serialPortCallback); // turn left
          //     } 
          //     else if (current_sparki_info.lineRight < threshold) {
          //       serialPort.write('!27\n', serialPortCallback); // turn right
          //     }
          //   }
          // }
          // if (current_sparki_info.edgeLeft >= threshold && 
          //     current_sparki_info.edgeRight >= threshold) {
          //     current_sparki_state.flag = 1;
          // }
          // if (current_sparki_state.flag == 1) {
          //   if (current_sparki_info.edgeLeft < threshold && 
          //       current_sparki_info.lineLeft < threshold && 
          //       current_sparki_info.lineCenter < threshold && 
          //       current_sparki_info.lineRight < threshold && 
          //       current_sparki_info.edgeRight < threshold) {
          //     current_sparki_state.flag = 0;
          //     current_sparki_state.behavior = 'I am waiting at reception room for someone grabs my coffee';
          //     serialPort.write('!24\n', serialPortCallback); // stop
          //     serialPort.write('!35\n', serialPortCallback); // open the robot's gripper by 3 centimeters
          //   }
          // }
        }
        else if (current_sparki_state.behavior == 'I am waiting at reception room for someone grabs my coffee')
        {
          // grip
          if (current_sparki_info.ping_cm > 20) {
            current_sparki_state.flag++;
          } else if (current_sparki_info.ping_cm < 10) {
            current_sparki_state.flag = 0;
          }
          if (current_sparki_state.flag > 30) {
            // Mission completed. Go Next.
            serialPort.write('!28\n', serialPortCallback); // 90 degree turn right
            serialPort.write('!28\n', serialPortCallback); // 90 degree turn right
            current_sparki_state.flag = 0;
            current_sparki_state.behavior = 'I am going back to my home';
            // serialPort.write('!7' + current_sparki_state.behavior + '\n', serialPortCallback); // LCD text
          }
        }
        else if (current_sparki_state.behavior == 'I am going back to my home')
        {
          if (current_sparki_state.flag == 0) { // Take off terminal
            linefollowing();
            // lift off - Check
            if (current_sparki_info.edgeLeft >= threshold && 
              current_sparki_info.edgeRight >= threshold) {
              current_sparki_state.flag = 1;  // On my way to intersection
            }
          }
          else if (current_sparki_state.flag == 1) { // On my way to intersection
            linefollowing();
            // Intersection - Check
            if (current_sparki_info.edgeLeft < threshold && 
                current_sparki_info.lineLeft < threshold && 
                current_sparki_info.lineCenter < threshold && 
                current_sparki_info.lineRight < threshold) {
              serialPort.write('!24\n', serialPortCallback); // stop
              current_sparki_state.flag = 2;  // Make sure interestion
            }
          }
          else if (current_sparki_state.flag == 2) { // Make sure interestion
            if (current_sparki_state.pool_timeout > pool_timeout_max) {
              current_sparki_state.flag = 1; // On my way to intersection
              current_sparki_state.pool_timeout = 0;
            }
            else {
              current_sparki_state.pool_timeout++;
              if (current_sparki_info.edgeLeft < threshold && 
                  current_sparki_info.lineLeft < threshold && 
                  current_sparki_info.lineCenter < threshold && 
                  current_sparki_info.lineRight < threshold) {
                if (current_sparki_state.pool > pool_threshold) {
                  current_sparki_state.pool = 0;
                  current_sparki_state.pool_timeout = 0;
                  current_sparki_state.flag = 3; // On my way to Terminal
                  // Go forward little bit, and turn left.
                  serialPort.write('!26\n', serialPortCallback); // move forward
                  serialPort.write('!50\n', serialPortCallback); // delay 500msec
                  serialPort.write('!50\n', serialPortCallback); // delay 500msec
                  serialPort.write('!29\n', serialPortCallback); // 90 degree turn left
                }
                else {
                  current_sparki_state.pool++;
                  current_sparki_state.pool_timeout = 0;
                }
              }
            }
          }
          else if (current_sparki_state.flag == 3) { // On my way to Terminal
            linefollowing();
            // Terminal - Check
            if (current_sparki_info.edgeLeft < threshold && 
                current_sparki_info.lineLeft < threshold && 
                current_sparki_info.lineCenter < threshold && 
                current_sparki_info.lineRight < threshold && 
                current_sparki_info.edgeRight < threshold) {
              serialPort.write('!24\n', serialPortCallback); // stop
              current_sparki_state.flag = 4;  // Make sure Terminal
            }
          }
          else if (current_sparki_state.flag == 4) { // Make sure Terminal
            if (current_sparki_state.pool_timeout > pool_timeout_max) {
              current_sparki_state.flag = 3; // On my way to Terminal
              current_sparki_state.pool_timeout = 0;
            }
            else {
              current_sparki_state.pool_timeout++;
              if (current_sparki_info.edgeLeft < threshold && 
                  current_sparki_info.lineLeft < threshold && 
                  current_sparki_info.lineCenter < threshold && 
                  current_sparki_info.lineRight < threshold && 
                  current_sparki_info.edgeRight < threshold) {
                if (current_sparki_state.pool > pool_threshold) {
                  current_sparki_state.pool = 0;
                  current_sparki_state.pool_timeout = 0;
                  current_sparki_state.flag = 5;  // Backing
                  serialPort.write('!28\n', serialPortCallback); // 90 degree turn right
                  serialPort.write('!28\n', serialPortCallback); // 90 degree turn right
                }
                else {
                  current_sparki_state.pool++;
                  current_sparki_state.pool_timeout = 0;
                }
              }
            }
          }
          else if (current_sparki_state.flag == 5) { // Backing
            lineBacking();
            // Terminal - Check
            if (current_sparki_info.edgeLeft < threshold && 
                current_sparki_info.lineLeft < threshold && 
                current_sparki_info.lineCenter < threshold && 
                current_sparki_info.lineRight < threshold && 
                current_sparki_info.edgeRight < threshold) {
              serialPort.write('!24\n', serialPortCallback); // stop
              current_sparki_state.flag = 6;  // Make sure Terminal
            }
          }
          else if (current_sparki_state.flag == 6) { // Make sure Terminal
            if (current_sparki_state.pool_timeout > pool_timeout_max) {
              current_sparki_state.flag = 5; // On my way to Terminal
              current_sparki_state.pool_timeout = 0;
            }
            else {
              current_sparki_state.pool_timeout++;
              if (current_sparki_info.edgeLeft < threshold && 
                  current_sparki_info.lineLeft < threshold && 
                  current_sparki_info.lineCenter < threshold && 
                  current_sparki_info.lineRight < threshold && 
                  current_sparki_info.edgeRight < threshold) {
                if (current_sparki_state.pool > pool_threshold) {
                  current_sparki_state.pool = 0;
                  current_sparki_state.pool_timeout = 0;
                  // Mission completed. Go Next.
                  current_sparki_state.flag = 0;  // Backing
                  current_sparki_state.behavior = 'I am free at home';
                  // serialPort.write('!7' + current_sparki_state.behavior + '\n', serialPortCallback); // LCD text
                }
                else {
                  current_sparki_state.pool++;
                  current_sparki_state.pool_timeout = 0;
                }
              }
            }
          }
          // // Line following
          // if (current_sparki_state.flag == 0 || current_sparki_state.flag == 1 || current_sparki_state.flag == 2 || current_sparki_state.flag == 3) {
          //   if (current_sparki_info.lineCenter < threshold) {
          //     serialPort.write('!26\n', serialPortCallback); // move forward
          //   }
          //   else {
          //     if (current_sparki_info.lineLeft < threshold) {
          //       serialPort.write('!25\n', serialPortCallback); // turn left
          //     } 
          //     else if (current_sparki_info.lineRight < threshold) {
          //       serialPort.write('!27\n', serialPortCallback); // turn right
          //     }
          //   }
          // }
          // if (current_sparki_info.edgeLeft >= threshold && 
          //     current_sparki_info.edgeRight >= threshold) {
          //   if (current_sparki_state.flag == 0) {
          //     current_sparki_state.flag = 1;
          //   }
          //   else if (current_sparki_state.flag == 2) {
          //     current_sparki_state.flag = 3;
          //   }
          // }
          // if (current_sparki_state.flag == 1) {
          //   if (current_sparki_info.edgeLeft < threshold && 
          //       current_sparki_info.lineLeft < threshold && 
          //       current_sparki_info.lineCenter < threshold && 
          //       current_sparki_info.lineRight < threshold) {
          //     var sleep = 0;
          //     while ((sleep++) < 50000 ) { console.log('waiting..........'); };
          //     current_sparki_state.flag = 2;
          //     serialPort.write('!29\n', serialPortCallback); // 90 degree turn left
          //   }
          // } 
          // else if (current_sparki_state.flag == 3) {
          //   if (current_sparki_info.edgeLeft < threshold && 
          //       current_sparki_info.lineLeft < threshold &&   
          //       current_sparki_info.lineCenter < threshold && 
          //       current_sparki_info.lineRight < threshold && 
          //       current_sparki_info.edgeRight < threshold) {
          //     current_sparki_state.flag = 4;
          //     // current_sparki_state.flag = 0;
          //     // current_sparki_state.behavior = 'I am free at home';
          //     serialPort.write('!24\n', serialPortCallback); // stop
          //     serialPort.write('!28\n', serialPortCallback); // 90 degree turn right
          //     serialPort.write('!28\n', serialPortCallback); // 90 degree turn right
          //     serialPort.write('!23\n', serialPortCallback); // moveBackward
          //   }
          // }
          // else if (current_sparki_state.flag >= 4 && current_sparki_state.flag <= 9) {
          //   current_sparki_state.flag++;
          // }
          // else if (current_sparki_state.flag == 10) {
          //   if (current_sparki_info.edgeLeft < threshold && 
          //       current_sparki_info.lineLeft < threshold &&   
          //       current_sparki_info.lineCenter < threshold && 
          //       current_sparki_info.lineRight < threshold && 
          //       current_sparki_info.edgeRight < threshold) {
          //     current_sparki_state.flag = 0;
          //     current_sparki_state.behavior = 'I am free at home';
          //     serialPort.write('!24\n', serialPortCallback); // stop
          //   }
          // }
        }
      }
    }
    stock_data = "";
  }
});

//////////////////////////////////////////////////// Slack bot

slackbot.on('start', function() {
    // var self = this;
    console.log('slack bot started!');
    // console.log('self.name : ' + self.name);
    slack_bot_user = this.users.filter(function (user) {
        return user.name === slack_bot_name;
    })[0];
    // console.log('slack_bot_user', slack_bot_user);
});

slackbot.on('message', function(data) {
    // all ingoing events https://api.slack.com/rtm 
    // console.log(data);
    if (data.type !== 'message' || !Boolean(data.text)) return;
    if (typeof data.channel !== 'string' || data.channel[0] !== 'C') return;
    if (data.user === slack_bot_user.id) return;
    if (data.text.indexOf(slack_bot_user.id) <= -1) return;

    // console.log('this msg is for slack bot operation data.text: ', data.text);
    var channel = this.channels.filter(function (item) {
      return item.id === data.channel;
    })[0];
    if (data.text.toLowerCase().indexOf('info') > -1) {
      slackbot.postMessageToChannel(channel.name, JSON.stringify(current_sparki_info), {as_user: true});
    }
    else if (data.text.toLowerCase().indexOf('what') > -1) {
      // slackbot.postMessageToChannel(channel.name, JSON.stringify(current_sparki_state), {as_user: true});
      slackbot.postMessageToChannel(channel.name, current_sparki_state.behavior, {as_user: true});
    }
    else if (data.text.toLowerCase().indexOf('coffee') > -1) {
      if (current_sparki_state.behavior == 'I am free at home') {
        slackbot.postMessageToChannel(channel.name, "Got it! Please be patient in minutes.", {as_user: true});
        current_sparki_state.flag = 0;
        current_sparki_state.behavior = 'I am going to grab a coffee at pot';
      }
      else {
        slackbot.postMessageToChannel(channel.name, "Sorry... I'm on work. Ask me Later.", {as_user: true});
      }
      // serialPort.write('!7' + current_sparki_state.behavior + '\n', serialPortCallback); // LCD text
    }
    else if (data.text.toLowerCase().indexOf('close') > -1) {
      slackbot.postMessageToChannel(channel.name, "Closing Serial port.....", {as_user: true});
      serialPort.close();
    }
    else if (data.text.toLowerCase().indexOf('hey') > -1) {
      slackbot.postMessageToChannel(channel.name, "hold on.....", {as_user: true});
      serialPort.write('!10\n',serialPortCallback); // Data Request
    }
});
