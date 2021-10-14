// heart
var x = 0;
var lasty = 139;

function bpmHandler(hrm) {
  //print(hrm);
  face[0].g.setFont("Vector",32);
  face[0].g.setColor(0,col("dgray1"));
  face[0].g.fillRect(90,0,160,35);
  face[0].g.setColor(1,0x07E0);
  face[0].g.drawString(valdef.lastbpm[0],90,6);
  face[0].g.flip();
}

function hrmHandler(hrm) {
  //print(hrm);
  face[0].g.setColor(0,col("black"));
  face[0].g.fillRect(x,40,x+1,239);
  face[0].g.setColor(1,0x07E0);
  var v = 139-hrm.raw;
  v = v>239?239:v<40?40:v;
  face[0].g.fillRect(x,lasty,x+1,v);
  face[0].g.flip();
  lasty=v;
  x+=2;
  if (x>=240) x = 0;
}

function startMeasure() {
  if (HRS.process) return;
  HRS.start(30); // run for 30sec
  HRS.on("hrm-raw", hrmHandler);
  if(face[0].process==-1) {
    face[0].g.setColor(0,col("black"));
    face[0].g.fillRect(0,40,240,240);
    face[0].g.flip();
  }
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
  g:w.gfx, //set graphics as this.g variable
  init: function(o){ //put here the elements of the page that will not need refreshing and initializations.
    this.g.clear();
    this.g.setColor(0,col("black"));
    this.g.flip();
    this.g.setColor(0,col("dgray1"));
    this.g.fillRect(0,0,239,35);
    this.g.setColor(1,col("lblue"));
    this.g.setFont("Vector",32);
	  this.g.drawString("BPM",4,4);
    this.g.setColor(1,0x07E0);
    this.g.drawString(valdef.lastbpm[0],90,4);
    this.g.flip();
    this.g.setFont("Vector",25);
    this.g.setColor(1,col("white"));
    if(valdef.lastbpm[0] || valdef.lastbpm[1]) this.g.drawString(valdef.lastbpm[1]+":"+valdef.lastbpm[2],240-(this.g.stringWidth(valdef.lastbpm[1]+":"+valdef.lastbpm[2])),10);
    this.g.flip();
    x=0;
    HRS.on("bpm", bpmHandler);
    this.g.setColor(0,col("black"));
    this.g.fillRect(0,40,240,240);
    this.g.setColor(1,0x07E0);
    if(valdef.hrm.length==0) {
      //this.g.drawImage(require("Storage").read("heart.img"),0,30,{scale:2.5});
    } else {
      var vmax = 0;
      for (let i=0;i<valdef.hrm.length;i++) {
        if(valdef.hrm[i]>vmax) vmax=valdef.hrm[i];
      }
      require("graph").drawBar(this.g, valdef.hrm, {
        miny: 0,
        axes : false,
        x : 12,
        y : 70,
        height : 160,
        gridy : Math.round(vmax/2)+1
      });
    }
    this.g.flip();
  },
  show : function(o){
    if(this.process==0 && !HRS.process && valdef.hrm.length>0) {
      this.process=-1;
      HRS.removeListener("hrm-raw", hrmHandler);
      this.g.setColor(0,col("dgray1"));
      this.g.fillRect(240-(this.g.stringWidth(valdef.lastbpm[1]+":"+valdef.lastbpm[2])),0,239,35);
      this.g.flip();
      this.g.setColor(0,col("black"));
      this.g.fillRect(0,40,240,240);
      this.g.flip();
      this.g.setFont("Vector",25);
      this.g.setColor(1,col("white"));
      if(valdef.lastbpm[1] || valdef.lastbpm[2]) this.g.drawString(valdef.lastbpm[1]+":"+valdef.lastbpm[2],240-(this.g.stringWidth(valdef.lastbpm[1]+":"+valdef.lastbpm[2])),10);
      this.g.flip();
      this.g.setColor(1,0x07E0);
      var vmax = 0;
      for (let i=0;i<valdef.hrm.length;i++) {
        if(valdef.hrm[i]>vmax) vmax=valdef.hrm[i];
      }
      require("graph").drawBar(this.g, valdef.hrm, {
        miny: 0,
        axes : false,
        x : 12,
        y : 70,
        height : 160,
        gridy : Math.round(vmax/2)+1
      });
      this.g.flip();
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
    this.g.clear(); //as above
    if (this.tid>=0) clearTimeout(this.tid); //clears main face[0] timeout loop.
    this.tid=-1;
    this.process=-1;
    return true;
  },
  off: function(){
    this.g.off();
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
   face[0].g.off();
   this.clear();
  }
};
//touch actions are set here, e is the event, x,y are the coordinates on screen.
touchHandler[0]=function(e,x,y){ 
  switch (e) {
  case 5: //tap event
    digitalPulse(D16,1,40); //send short buzz pulse to indicate tap was not acknowledged.
    break;
  case 1: //slide down event
    face.go("accellog",0);return; //return when changing faces, so that this action will not reset this face timeout. 
    //break;
  case 2: //slide up event
    face.go("call",0);return;
  case 3: //slide left event
    if (HRS.process) {
      stopMeasure();
      face[0].g.setFont("Vector",16);
      face[0].g.setColor(0,col("black"));
      face[0].g.fillRect(240-(face[0].g.stringWidth("PAUSED")),40,239,56);
      face[0].g.setColor(1,0xFD40);
      face[0].g.drawString("PAUSED",240-(face[0].g.stringWidth("PAUSED")),40);
      face[0].g.flip();
    }
    break;
  case 4: //slide right event
    startMeasure();
    face[0].g.setFont("Vector",16);
    face[0].g.setColor(1,col("black"));
    face[0].g.fillRect(120,40,239,56);
    face[0].g.setFont("Vector",32);
    face[0].g.flip();
    face[0].offms=40000;
    this.timeout();
    break;
  case 12: //touch and hold(long press) event
    digitalPulse(D16,1,40);
    break;
  default: //reset face timeout on every touch action, this function is in the handler file. 
    this.timeout();
  }
};
