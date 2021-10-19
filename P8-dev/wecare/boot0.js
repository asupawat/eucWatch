//.boot0
E.kickWatchdog();
function P8KickWd(){
	"ram";
  if(!BTN1.read())E.kickWatchdog();
}
var wdint=setInterval(P8KickWd,4000);
E.enableWatchdog(20, false);
global.save = function() { throw new Error("You don't need to use save() on P8!"); };

//load in devmode
if (BTN1.read() || Boolean(require("Storage").read("devmode"))) { 
  let mode=(require("Storage").read("devmode"));
  if ( mode=="off"){ 
    require("Storage").write("devmode","done");
    NRF.setAdvertising({},{connectable:false});
    NRF.disconnect();
    NRF.sleep();
    digitalPulse(D16,1,250);
  } else {
    require("Storage").write("devmode","done");
    NRF.setAdvertising({}, { name:"WeCare-DevMode",connectable:true });
    digitalPulse(D16,1,100);
	  print("Welcome!\n*** DevMode ***\nShort press the side button\nto restart in WorkingMode");
  }
  setWatch(function(){
    "ram";
    require("Storage").erase("devmode");
	  require("Storage").erase("devmode.info");
    NRF.setServices({},{uart:false});
    NRF.setServices({},{uart:true}); 
    NRF.disconnect();
    setTimeout(() => {
	     reset();
    }, 500);
  },BTN1,{repeat:false, edge:"rising"}); 
}else{ 
//load in working mode
if (!Boolean(require('Storage').read('setting.json'))) require('Storage').write('setting.json',{"watchtype":"eucwatch"});
NRF.setAdvertising({}, { name:"Espruino-jeff",connectable:true });
const STOR = require("Storage");
const P8 = {
    ON_TIME: 10,
    BRIGHT : 3,
    FACEUP:true,
    awake : true,
    time_left:10,
    ticker:undefined,
    pressedtime:0,
    accx : 0,
    accy : 0,
    accz : 0,
    accmag : 0,
    accdiff : 0,
    bpm : [0,0,0],
    ess_values : [],
    ess_stddev : [],
    hrm : [],
    movehrm : 0,
    move10 : 0,
    move : 0,
    nmove : 0,
    buzz: (v)=>{
      v = v? v : 100;
		  digitalPulse(D16,1,v);
    },

	  batV: (s) => {
      let v=7.1*analogRead(D31);
		  if (s) { v=(v*100-345)*1.43|0; }
		  let hexString = ("0x"+(0x50000700+(D31*4)).toString(16));
		  poke32(hexString,2); // disconnect pin for power saving, otherwise it draws 70uA more 
		  return v;
    },
    isPower:()=>{return D19.read();},
    setLCDTimeout:(v)=>{P8.ON_TIME=v<5?5:v;},
    setLCDBrightness:(v)=>{P8.BRIGHT=v; brightness(v);},
    init:()=>{
      var s = STOR.readJSON("setting.json",1)||{bri:3, timezone:7, acc:1};
      //P8.ON_TIME=s.ontime;
      //P8.time_left=s.ontime;
      P8.BRIGHT=s.bri;
      P8.FACEUP=(s.acc==1);
      E.setTimeZone(s.timezone);
    },
    sleep:() => {
      brightness(0);
      TC.stop();
      P8.emit("sleep",true);
      g.lcd_sleep();
      P8.awake = false;
    },
    wake:(s,o)=> {
      P8.time_left = P8.ON_TIME;
      if(s=="undefined") s=face.appCurr;
      if(o=="undefined") face.go(s,0);
      else face.go(s,0,o);
      TC.start();
      //g.lcd_wake();
      P8.emit("sleep",false);
      //brightness(P8.BRIGHT);
      P8.ticker = setInterval(P8.tick,1000);
      P8.awake = true;
    },
    tick:()=>{
      P8.time_left--;
      if (P8.time_left<=0){
        if (global.ACCEL) if (ACCEL.faceup) {P8.time_left = P8.ON_TIME; return;}
        if (P8.ticker) P8.ticker=clearInterval(P8.ticker);
      }
    }
};

setWatch(()=>{
    P8.emit("power",D19.read());
},D19,{repeat:true,debounce:500});

setWatch(() =>{P8.pressedtime = Date.now();},BTN1,{repeat:true,edge:"rising"});
//fonts
//require('Font7x11Numeric7Seg').add(Graphics);
P8.init();
eval(STOR.read("lcd.js"));
var g = ST7789();

brightness(P8.BRIGHT);
eval(STOR.read("touch.js"));
TC.start();
//TC.on('touch',(p)=>{P8.time_left=P8.ON_TIME;});
//TC.on('swipe',(d)=>{P8.time_left=P8.ON_TIME;});
//TC.on("longtouch", (p)=> {P8.time_left=P8.ON_TIME;if (BTN1.read()) reset(); else face.go("main",0); }); //load("launch.js");

eval(STOR.read("mqtt.js"));
eval(STOR.read("setter.js"));
eval(STOR.read("heartrate.js"));

if (Boolean(STOR.read("accel.js"))){
	eval(STOR.read("accel.js"));
  ACCEL.init();
	ACCEL.on("faceup",()=>{if (!P8.awake&&set.def.acc) P8.wake();});
  if(set.def.slm || set.def.hrm) HRS.log(5); // log every 5min
  var slsnds = 0; // seconds within non-movement
  var mvsnds = 0; // seconds within movement
  ACCEL.on("accel",()=>{
    if(ACCEL.process) {
      var val = P8.accmag;
      P8.ess_values.push(val);
      if (P8.ess_values.length == 13) {
        // calculate standard deviation over ~1s 
        const mean = P8.ess_values.reduce((prev,cur) => cur+prev) / P8.ess_values.length;
        const stddev = Math.sqrt(P8.ess_values.map(val => Math.pow(val-mean,2)).reduce((prev,cur) => prev+cur)/P8.ess_values.length);
        if(P8.ess_stddev.length >= 3) {
          //save avg movement during hrm-run
          if(stddev > 6 && HRS.process) P8.movehrm=(P8.movehrm+stddev)/2;
          if(stddev > 6 && P8.ess_stddev[1] > 6 && P8.ess_stddev[2] > 6) {
            if(P8.ess_stddev[0] > 6) {
              mvsnds++;
              P8.move10++;
            }
            else {
              mvsnds+=3;
              P8.move10+=3;
            }
            if(mvsnds>=60) {
              P8.move++;
              mvsnds=0;
            }
            slsnds=0;
          }
          else {
            if(slsnds >= 660) {
              P8.nmove++;
              slsnds=600;
            }
            else if(slsnds == 600) {
              P8.nmove+=10;
            }
            slsnds++;
          }
          P8.ess_stddev.shift();
        }
        if(P8.ess_stddev.length<3) P8.ess_stddev.push(stddev);
        P8.ess_values = [];
      }
    }
  });
}
P8.ticker = setInterval(P8.tick,1000);
setWatch(() =>{
	if ((Date.now()-P8.pressedtime)>30000) E.reboot();
  else if ((Date.now()-P8.pressedtime)>5000) reset();
},BTN1,{repeat:true,edge:"falling"});
setWatch(function(e) {
  if (!P8.awake) {
    if(face.appCurr!="call" && global.inp=="undefined") P8.wake("main");
    else P8.wake("call");
  }else {
    if(face.appCurr!="call") P8.wake("call");
    else if(global.inp=="undefined") {
      digitalPulse(D16,1,[80,100,40]);
      handleMqttEvent({"src":"SOS","title":"CALLING","body":"FOR HELP"});
      mqtt.publish("call", "1");
      global.calling=setInterval(()=>{
        //print("Re-Calling!");
        mqtt.publish("call", "2");
			},300000); //300000=5min
    }
  }
}, BTN1, { repeat: true, edge: 'rising', debounce: 50 });
}

eval(STOR.read("events.js"));
eval(STOR.read("faces.js"));
eval(STOR.read("themes.js"));
eval(STOR.read("main"));

init_mqtt();

