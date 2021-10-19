// heart
var x = 0;
var lasty = 139;

function bpmHandler(hrm) {
  //print(hrm);
  g.setFont("Vector",32);
  g.setColor(col("dgray1"));
  g.fillRect(90,0,160,35);
  g.setColor(0x07E0);
  g.drawString(valdef.lastbpm[0],90,6);
}

function hrmHandler(hrm) {
  //print(hrm);
  g.setColor(0);
  g.fillRect(x,40,x+1,239);
  g.setColor(0x07E0);
  var v = 139-hrm.raw;
  v = v>239?239:v<40?40:v;
  g.fillRect(x,lasty,x+1,v);
  lasty=v;
  x+=2;
  if (x>=240) x = 0;
}

function startMeasure() {
  if (HRS.process) return;
  HRS.start(30); // run for 30sec
  HRS.on("hrm-raw", hrmHandler);
  g.setColor(col("black"));
  if(face[0].process==-1) { g.fillRect(0,40,240,240); }
  face[0].process=0;
  digitalPulse(D16,1,40);
}

function stopMeasure() {
  if(HRS.process) {
    HRS.removeListener("hrm-raw", hrmHandler);
    face[0].process=1;
    HRS.stop();
    digitalPulse(D16,1,[60,100,30]);
  }
}

face[0] = { //the first face of the hello app, called by using `face.go("hello",0)` from the cli.
  offms: 10000, //face timeout, will fall to face[1] after it, face[1] is a redirection face, not actually visible.
  init: function(o){ //put here the elements of the page that will not need refreshing and initializations.
    g.setColor(col("dgray1")); //header
    g.fillRect(0,0,239,35);
    g.setColor(col("lblue"));
    g.setFont("Vector",32);
	  g.drawString("BPM",4,4);
    g.setColor(0x07E0);
    g.drawString(valdef.lastbpm[0],90,4);
    g.setFont("Vector",25);
    g.setColor(col("white"));
    if(valdef.lastbpm[0] || valdef.lastbpm[1]) g.drawString(valdef.lastbpm[1]+":"+valdef.lastbpm[2],240-(g.stringWidth(valdef.lastbpm[1]+":"+valdef.lastbpm[2])),10);
    x=0;
    HRS.on("bpm", bpmHandler);
    g.setColor(col("black"));
    g.fillRect(0,40,240,240);
    g.setColor(0x07E0);
    if(valdef.hrm.length==0) {
      g.drawImage(require("Storage").read("heart.img"),0,30,{scale:2.5});
    } else {
      var vmax = 0;
      for (let i=0;i<valdef.hrm.length;i++) {
        if(valdef.hrm[i]>vmax) vmax=valdef.hrm[i];
      }
      require("graph").drawBar(g, valdef.hrm, {
        miny: 0,
        axes : false,
        x : 12,
        y : 70,
        height : 160,
        gridy : Math.round(vmax/2)+1
      });
    }
  },
  show : function(o){
    if(this.process==0 && !HRS.process && valdef.hrm.length>0) {
      this.process=-1;
      HRS.removeListener("hrm-raw", hrmHandler);
      g.setColor(col("dgray1"));
      g.fillRect(240-(g.stringWidth(valdef.lastbpm[1]+":"+valdef.lastbpm[2])),0,239,35);
      g.setColor(col("black"));
      g.fillRect(0,40,240,240);
      g.setFont("Vector",25);
      g.setColor(col("white"));
      if(valdef.lastbpm[1] || valdef.lastbpm[2]) g.drawString(valdef.lastbpm[1]+":"+valdef.lastbpm[2],240-(g.stringWidth(valdef.lastbpm[1]+":"+valdef.lastbpm[2])),10);
      g.setColor(0x07E0);
      var vmax = 0;
      for (let i=0;i<valdef.hrm.length;i++) {
        if(valdef.hrm[i]>vmax) vmax=valdef.hrm[i];
      }
      require("graph").drawBar(g, valdef.hrm, {
        miny: 0,
        axes : false,
        x : 12,
        y : 70,
        height : 160,
        gridy : Math.round(vmax/2)+1
      });
      x=0;
   }
    this.tid=setTimeout(function(t){
      t.tid=-1;
      t.show();
    },500,this);
  },
  tid:-1,
  raw: [],
  process:-1,
  clear : function(){ //enter here everything needed to clear all app running function on face exit.
    x=-10;
    HRS.removeListener("hrm-raw", hrmHandler);
    HRS.removeListener("bpm", bpmHandler);
    g.clear(); //as above
    if (this.tid>=0) clearTimeout(this.tid); //clears main face[0] timeout loop.
    this.tid=-1;
    this.process=-1;
    return true;
  },
  off: function(){
    P8.sleep();
    this.clear();
  }
};
//Redirection face, is used when time expires or the side button is pressed on page[0].
face[1] = {
  offms:1000,
  init: function(){
  return true;
  },//only use this part of the face to set redirection.
  show : function(){
	  face.go("heart",-1);//go to main Clock face.
    return true;
  },
   clear: function(){
   return true;
  },
   off: function(){
   P8.sleep();
   this.clear();
  }
};
//touch actions are set here, e is the event, x,y are the coordinates on screen.
touchHandler[0]=function(e,x,y){ 
  switch (e) {
  case 5: //tap event
    if (HRS.process) {
      stopMeasure();
      g.setFont("Vector",16);
      g.setColor(col("black"));
      g.fillRect(240-(g.stringWidth("PAUSED")),40,239,56);
      g.setColor(0xFD40).drawString("PAUSED",240-(g.stringWidth("PAUSED")),40);
    }
    break;
  case 1: //slide down event
    face.go("heart",-1);return;
  case 2: //slide up event
    face.go("main",0);return;
  case 3: //slide left event
    face.go("accellog",0);return;
  case 4: //slide right event
    face.go("call",0);return;
  case 12: //touch and hold(long press) event
    startMeasure();
    g.setFont("Vector",16);
    g.setColor(col("black"));
    g.fillRect(120,40,239,56);
    g.setFont("Vector",32);
    face[0].offms=40000;
    this.timeout();
    break;
  default: //reset face timeout on every touch action, this function is in the handler file. 
    this.timeout();
  }
};
