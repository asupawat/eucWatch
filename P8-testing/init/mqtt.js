var mqtt = {};
var mqttInBuf = "";
var mqttOutBuf = "";
var mqttPushTimeout;
var sFCC = String.fromCharCode;

mqtt.onData = function(data) {
  mqttInBuf += data;
  var cmd = mqttInBuf.charCodeAt(0);
  var len = mqttInBuf.charCodeAt(1)+2;
  var var_len = mqttInBuf.charCodeAt(3);
  var msg;
  if (len <= mqttInBuf.length) {
	  switch(cmd >> 4) {
      case 2: { // CONNACK
        var bridge = mqttInBuf.substr(4, var_len);
        msg = {
			    bridge: bridge
		    };
        mqtt.emit("connected", msg);
        break;
      }
      case 3: { // PUBLISH
        var topic = mqttInBuf.substr(4, var_len);
		    msg = {
			    topic: topic,
			    message: mqttInBuf.substr(4+var_len, len-var_len)
		    };
        mqtt.emit(topic, msg);
      } break;
	  }
    mqttInBuf="";
  }
};

function mqStr(str) {
  return sFCC(str.length >> 8, str.length&255) + str;
}

function mqPkt(cmd, variable, payload) {
  return sFCC(cmd, variable.length + payload.length) + variable + payload;
}

mqtt.publish = function(topic, data) {
  if((topic.length + data.length) > 127) {throw "tMQTT-TL";}
  mqtt.write(mqPkt(0b00110001, mqStr(topic), data));
  mqtt.emit("published");
};

mqtt.write = function(d) { 
  mqttOutBuf+=d; 
  if (NRF.getSecurityStatus().connected)
    pushMQTTData();
  else
    mqttHasData(true); 
};

function mqttHasData(d) {
  // 2 byte, flags
  // 17 byte, complete 128 bit uuid list,
  NRF.setAdvertising([2,1,6,17,7,18, 195, 81, 99, 210, 101, 252, 63, 31, 128, 190, 67, d?1:0, 0, 145, 172]);
}

function pushMQTTData() {
  if (!mqttOutBuf.length) {
    mqttHasData(false);
    return;
  }
  if (mqttPushTimeout) return; // we'll get called back soon anyway
  if (!NRF.getSecurityStatus().connected) return; // no connection
  var d = mqttOutBuf.substr(0,20);
  mqttOutBuf = mqttOutBuf.substr(20);
  NRF.updateServices({
  'ac910001-43be-801f-3ffc-65d26351c312' : {
    'ac910003-43be-801f-3ffc-65d26351c312': { // rx - from node TO bridge
      value : d,
      notify: true
    }
  }});
  if (mqttOutBuf.length) {
    mqttPushTimeout = setTimeout(function() {
      mqttPushTimeout = undefined;
      pushMQTTData();
    },100);
  }
  else {
    mqttHasData(false);
  }
}

function init_mqtt() {
  NRF.setServices({
    'ac910001-43be-801f-3ffc-65d26351c312' : {
      'ac910002-43be-801f-3ffc-65d26351c312' : { // tx - from bridge TO node
        writable: true,
        value : "",
        maxLen : 20,
        onWrite : function(evt) {
          b = evt.data;
          if (evt.data.length) mqtt.onData(E.toString(evt.data));
          pushMQTTData();
        }
      }, 'ac910003-43be-801f-3ffc-65d26351c312': { // rx - from node TO bridge
        notify: true,
        value : "",
        maxLen : 20
      }
    }
  });

  NRF.setScanResponse([]); // remove scan response packet
  mqttHasData(false);
}

// ===============================================

init_mqtt();

// Answer call/help
mqtt.on("call", function(msg){
  //P8.wake("call",msg.message);
});

// ===============================================

mqtt.on("connected", function(msg){
  console.log("MQTT: connected to", msg.bridge);
});

mqtt.on("published", function(){
   console.log("MQTT: message sent");
});

NRF.on('connect',_=>{
  mqttInBuf=""; // reset buffer in case of bad connection
});

NRF.on('disconnect',_=>{
  mqttInBuf="";
});
