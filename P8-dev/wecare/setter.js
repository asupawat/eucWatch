//setter

// graph module
Modules.addCached("graph",function(){exports.drawAxes=function(b,c,a){function h(m){return e+n*(m-u)/z}function l(m){return f+g-g*(m-p)/v}var k=a.padx||0,d=a.pady||0,u=-k,y=c.length+k-1,p=(void 0!==a.miny?a.miny:a.miny=c.reduce((m,w)=>Math.min(m,w),c[0]))-d;c=(void 0!==a.maxy?a.maxy:a.maxy=c.reduce((m,w)=>Math.max(m,w),c[0]))+d;a.gridy&&(d=a.gridy,p=d*Math.floor(p/d),c=d*Math.ceil(c/d));var e=a.x||0,f=a.y||0,n=a.width||b.getWidth()-(e+1),g=a.height||b.getHeight()-(f+1);a.axes&&(null!==a.ylabel&&(e+=6,n-=6),null!==
a.xlabel&&(g-=6));a.title&&(f+=6,g-=6);a.axes&&(b.drawLine(e,f,e,f+g),b.drawLine(e,f+g,e+n,f+g));a.title&&(b.setFontAlign(0,-1),b.drawString(a.title,e+n/2,f-6));var z=y-u,v=c-p;v||(v=1);if(a.gridx){b.setFontAlign(0,-1,0);var x=a.gridx;for(d=Math.ceil((u+k)/x)*x;d<=y-k;d+=x){var t=h(d),q=a.xlabel?a.xlabel(d):d;b.setPixel(t,f+g-1);var r=b.stringWidth(q)/2;null!==a.xlabel&&t>r&&b.getWidth()>t+r&&b.drawString(q,t,f+g+2)}}if(a.gridy)for(b.setFontAlign(0,0,1),d=p;d<=c;d+=a.gridy)k=l(d),q=a.ylabel?a.ylabel(d):
d,b.setPixel(e+1,k),r=b.stringWidth(q)/2,null!==a.ylabel&&k>r&&b.getHeight()>k+r&&b.drawString(q,e-5,k+1);b.setFontAlign(-1,-1,0);return{x:e,y:f,w:n,h:g,getx:h,gety:l}};exports.drawLine=function(b,c,a){a=a||{};a=exports.drawAxes(b,c,a);var h=!0,l;for(l in c)h?b.moveTo(a.getx(l),a.gety(c[l])):b.lineTo(a.getx(l),a.gety(c[l])),h=!1;return a};exports.drawBar=function(b,c,a){a=a||{};a.padx=1;a=exports.drawAxes(b,c,a);for(var h in c)b.fillRect(a.getx(h-.5)+1,a.gety(c[h]),a.getx(h+.5)-1,a.gety(0));return a}});

//settings - run set.upd() after changing BT settings to take effect.
var valdef={
  hrm:[],
  sleep:[300,340,280,370],
  awake:[36,32,38,27],
  lastbpm:[],
  sleeptime:[21,30,6,30]
};

valdef = require('Storage').readJSON('valuedef.json', 1);

var set={
  bt:0, //Incomming BT service status indicator- Not user settable.0=not_connected|1=unknown|2=webide|3=gadgetbridge|4=atc|5=esp32
  tor:0, //Enables/disables torch- Not user settable.
  ondc:0, //charging indicator-not user settable.
  btsl:0, //bt sleep status-not user settable.
  gIsB:0,//gat status-n.u.s- 0=not busy|1=busy 
  slm:0, //sleep monitor
  hrm:0, // heart rate monitor
  boot:getTime(),
  gDis:function(){
	if (this.gIsB) {
		this.gIsb=2;
		if (global["\xFF"].BLE_GATTS) {
          if (global["\xFF"].BLE_GATTS.connected)
          global["\xFF"].BLE_GATTS.disconnect().then(function (c){this.gIsB=0;});
        }else gIsB=0;
     }
  },
  updateSensorVal:function(){require('Storage').write('valuedef.json', valdef);},
  updateSettings:function(){require('Storage').write('setting.json', set.def);},
  resetSettings:function() {
    set.def = {
      name:"WeCare", //Set the name to be broadcasted by the Bluetooth module. 
      timezone:7, //Timezone
      woe:1, //wake Screen on event.0=disable|1=enable
      wob:1, //wake Screen on Button press.0=disable|1=enable
      rfTX:4, //BT radio tx power, -4=low|0=normal|4=high
      cli:1, //Nordic serial bluetooth access. Enables/disables Espruino Web IDE.
      hid:0, //enable/disable Bluetooth music controll Service.
      gb:1,  //Notifications service. Enables/disables support for "GadgetBridge" playstore app.
      atc:0, //Notifications service. Enables/disables support for "d6 notification" playstore app from ATC1441.
      acc:1, //enables/disables wake-screen on wrist-turn. 
      dnd:1, //Do not disturb mode, if ebabled vibrations are on.
      hidT:"media", //joy/kb/media
      bri:3, //Screen brightness 1..7
      hrm:0,
      slm:0
    };
    set.updateSettings();
  },
  accR:function(){if (this.def.acc)set.def.atc=1; else set.def.atc=0;},
  hidM:undefined, //not user settable.
  clin:0,//not settable
  upd:function(){ //run this for settings changes to take effect.
	  if (this.def.hid==1&&this.hidM==undefined) {
		  Modules.addCached("ble_hid_controls",function(){
		  function b(a,b){NRF.sendHIDReport(a,function(){NRF.sendHIDReport(0,b);});}
		  exports.report=new Uint8Array([5,12,9,1,161,1,21,0,37,1,117,1,149,5,9,181,9,182,9,183,9,205,9,226,129,6,149,2,9,233,9,234,129,2,149,1,129,1,192]);
      exports.next=function(a){b(1,a);};
      exports.prev=function(a){b(2,a);};
      exports.stop=function(a){b(4,a);};
      exports.playpause=function(a){b(8,a);};
      exports.mute=function(a){b(16,a);};
      exports.volumeUp=function(a){b(32,a);};
      exports.volumeDown=function(a){b(64,a);};});
      this.hidM=require("ble_hid_controls");
  	}else if (this.def.hid==0 &&this.hidM!=undefined) {
		  this.hidM=undefined;
		  if (global["\xFF"].modules.ble_hid_controls) Modules.removeCached("ble_hid_controls");
    }
	  if (!Boolean(require('Storage').read('atc'))) this.def.atc=0;
	  if (this.def.atc) eval(require('Storage').read('atc'));
	  else {
		  NRF.setServices(undefined,{uart:(this.def.cli||this.def.gb)?true:false,hid:(this.def.hid&&this.hidM)?this.hidM.report:undefined });
		  if (this.atcW) {this.atcW=undefined;this.atcR=undefined;} 
	  }
	  if (this.def.gb) eval(require('Storage').read('m_gb'));
    else {
      this.handleNotificationEvent=undefined;
      this.handleFindEvent=undefined;
      this.sendBattery=undefined;
      this.gbSend=undefined;
      global.GB=undefined;
    }
    if (!this.def.cli&&!this.def.gb&&!this.def.atc&&!this.def.hid) {
      if (this.bt!=0) NRF.disconnect();
      else{ NRF.sleep();this.btsl=1;}
    }
    else if (this.bt!=0) {
      NRF.disconnect();
    }
    else if (this.btsl==1) {
      NRF.restart();
      init_mqtt();
      this.btsl=0;
    }
  }
};

set.def = require('Storage').readJSON('setting.json', 1);
if (!set.def) set.resetSettings();
//eval(require('Storage').read('handler.set')); //get defaults
E.setTimeZone(set.def.timezone);

//charging notify
setWatch(function(s){
	if (s.state==1) {
		digitalPulse(D16,1,200); 
		set.ondc=1;
	}else {
		digitalPulse(D16,1,[100,80,100]);
		set.ondc=0;
	}
},D19,{repeat:true, debounce:500,edge:0});

function bdis() {
  Bluetooth.removeListener('data',ccon);
  E.setConsole(null,{force:true});
  if (!set.def.cli&&!set.def.gb&&!set.def.atc&&!set.def.hid){
    NRF.sleep();
    set.btsl=1;
  }
  set.bt=0;
}

function bcon() {
  set.bt=1;
  if (set.def.cli==1||set.def.gb==1)  Bluetooth.on('data',ccon);
}

function ccon(l){
  var cli="\x03";
  var gb="\x20\x03";
  if (set.def.cli) {
    if (l.startsWith(cli)) {
      set.bt=2;Bluetooth.removeListener('data',ccon);
      E.setConsole(Bluetooth,{force:false});
      print("Welcome.\n** Working mode **\nUse devmode (Settings-Info-long press on Restart) for uploading files."); 
      handleInfoEvent({"src":"BT","title":"IDE","body":"Connected"});
    }
  }
  if (set.def.gb) if (l.startsWith(gb)){
    set.bt=3;Bluetooth.removeListener('data',ccon);E.setConsole(Bluetooth,{force:false});
    handleInfoEvent({"src":"BT","title":"GB","body":"Connected"});
  }
  if (l.length>5)  NRF.disconnect();
}

NRF.setTxPower(set.def.rfTX);
//E.setConsole(null,{force:true});
NRF.setAdvertising({}, { name:set.def.name,connectable:true });
NRF.on('disconnect',bdis);
NRF.on('connect',bcon);
set.upd();
