var SerialPort = require('serialport');
var port = new SerialPort("/dev/tty.usbserial-FTBQY24X", {
  baudRate: 115200
});
port.on('open', function(){
	// console.log('Serial Port Opend');
	// serialport.on('data', function(data){
	// 	console.log(data[0]);
	// });
  port.write('main screen turn on', function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('message written');
  });
});

port.on('error', function(err) {
  console.log('Error: ', err.message);
})

port.on('data', function (data) {
  console.log('Data: ' + data);
});