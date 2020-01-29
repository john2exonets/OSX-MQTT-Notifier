//
// Notifier.js  --  show OSX Notifications from MQTT Notification messages.
//
// John D. Allen
// Sept 2016
//
// Node-Notifier:  https://github.com/mikaelbr/node-notifier
//

var mqtt = require('mqtt');
var notify = require('node-notifier');

var BROKER = "mqtt://10.1.1.28";
var TOPSPEED = 24.99;

var copts = {
  clientId: "LT_Notifier",
  keepalive: 20000
};

var client = mqtt.connect(BROKER, copts);

client.on('connect', function() {
  console.log("MQTT Notification daemon Connected...");
  client.subscribe('alert/#');
  client.subscribe('wind/speed');
});

client.on('message', function(topic, msg) {
  if(topic.indexOf('wind') != -1) {
    var rr = JSON.parse(msg.toString());
    if(rr.speed > TOPSPEED) {
      notify.notify({
        title: '--ALERT!-- High Winds',
        message: 'Wind speed of ' + rr.speed + ' MPH was just recorded.',
        sound: "Sosumi"
      }, function(err,rsp) {
        // do nothing...we don't care if it error'd, or there was a response.
      });
    }
  } else {
    notify.notify({
      title: '--ALERT!--  ' + topic,
      message: msg.toString(),
      sound: "Sosumi"
    }, function(err,resp) {
      //'resp' is any response from the notification system.
    });
  }

  //var out = topic + ": " + message.toString();
  //console.log(out);
});

process.on('SIGINT', function() {     // catch CTRL-C for exiting program
  console.log('Exiting...');
  client.unsubscribe('alert/+');
  client.end();
  process.exit();
});
