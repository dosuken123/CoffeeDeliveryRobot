'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
// var SQLite = require('sqlite3').verbose();
var SlackBot = require('slackbots');
var SerialPort = require('serialport');

// local variables
var slack_bot_user = null;
var current_sparki_info = { location: 0, accel: 1, power: 3};

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

//////////////////////////////////////////////////// Serial Communication

var serialPort = new SerialPort(serialport_name, {
  baudRate: +serialport_baudrate
});

serialPort.on('open', function(){
  // console.log('Serial Port Opend');
  // serialport.on('data', function(data){
  //  console.log(data[0]);
  // });
  serialPort.write('main screen turn on', function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('message written');
  });
});

serialPort.on('error', function(err) {
  console.log('Error: ', err.message);
})

serialPort.on('data', function (data) {
  console.log('Data: ' + data);
});

//////////////////////////////////////////////////// Slack bot

var slackbot = new SlackBot({
    token: slack_bot_api_token,
    name: slack_bot_name
});

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

    console.log('this msg is for slack bot operation data.text: ', data.text);
    if (data.text.indexOf('info') > -1) {
      var channel = this.channels.filter(function (item) {
        return item.id === data.channel;
      })[0];
      slackbot.postMessageToChannel(channel.name, JSON.stringify(current_sparki_info), {as_user: true});
    }
});
