 
var x = 0;
var lasty = 239;
var lastPeak = 0;
var interval = -1;
var bpminterval;

function doread(){
  var v =  lpfFilter.filter(agcFilter.filter(medianFilter.filter(hpfFilter.filter(HRS.read()))));
  v = 139-v;
  v = v>239?239:v<40?40:v;
  correlator.put(v);
  if (pulseDetector.isBeat(v)) {
    var peakTime = Date.now();
    var bpm = Math.floor(60000/(peakTime-lastPeak));
    if (bpm > 0 && bpm < 200) {
      bpm = avgMedFilter.filter(bpm);
      g.setColor(-1);
      g.drawString("BPM: "+bpm+" ",120,0,true);
    }
    lastPeak=peakTime;
  }
  g.setColor(0);
  g.fillRect(x,40,x+1,239);
  g.setColor(0x07E0);
  g.fillRect(x,lasty,x+1,v);
  lasty=v;
  x+=2;
  if (x>=240) x = 0;
}

function showBPM(){
  var bpm = correlator.bpm();
  g.setColor(0xFFE0).drawString("BPM: "+bpm+" ",10,0,true);
}

function startMeasure() {
  if (interval>0) return;
  else if(interval==-1) {g.setColor(col("black"));g.fillRect(0,80,240,170);}
  HRS.enable();
  interval = setInterval(doread,40);
  bpminterval = setInterval(showBPM,2000);
  g.setColor(col("black"));
  g.fillRect(120,20,190,35);
  digitalPulse(D16,1,40);
}

function stopMeasure() {
  if(interval>0) {
    interval=clearInterval(interval); 
    if (bpminterval) bpminterval = clearInterval(bpminterval);
    HRS.disable();
    g.setColor(0xFD40).drawString("PAUSED",120,20,true);
    digitalPulse(D16,1,[60,100,30]);
  }
}


function bpmisrun() {
  return bpminterval;
}

face[0] = { //the first face of the hello app, called by using `face.go("hello",0)` from the cli.
    offms: 120000, //face timeout, will fall to face[1] after it, face[1] is a redirection face, not actually visible.
    init: function(o){ //put here the elements of the page that will not need refreshing and initializations.
    g.clear();
    g.reset();
    g.setFont("6x8",2);
    g.drawString("BPM: -- ",120,0,true);
    g.setColor(0xFFE0).drawString("BPM: -- ",10,0,true);
    x=0;
    g.drawImage(require("Storage").read("heart.img"),0,30,{scale:2.5});
    this.run=true;
  },
  show : function(o){
    if (!this.run) return;

    this.tid=setTimeout(function(t){ //the face's screen refresh rate. 
      t.tid=-1;
      t.show();
    },40,this);
  },
  tid:-1,
  run:false,
  clear : function(){ //enter here everything needed to clear all app running function on face exit. 
    g.clear(); //as above
    this.run=false;
    if (this.tid>=0) clearTimeout(this.tid); //clears main face[0] timeout loop.
    this.tid=-1;
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
    stopMeasure();
    return true;
  },//only use this part of the face to set redirection.
  show : function(){
   	face.go(face.appRoot[0],face.appRoot[1]); //go to the previous face on screen of the previous app.  
	  //face.go(face.appPrev,face.pagePrev); //go to the previous face on screen, even if it was on the same app. 
  	//face.go("hello",-1); //sleep and set this face as the on_wake face. 
	  //face.go("main",-1);//sleep and set this face as the on_wake face. 
	  //face.go("main",0);//go to main Clock face. 
    return true;
  },
   clear: function(){
   return true;
  },
   off: function(){
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
    stopMeasure();
    face.go("main",0);return; //return when changing faces, so that this action will not reset this face timeout. 
    //break;
  case 2: //slide up event
    stopMeasure();
    face.go(face.appPrev,face.pagePrev);return;
  case 3: //slide left event
    stopMeasure();
    break;
  case 4: //slide right event
    startMeasure();
    break;
  case 12: //touch and hold(long press) event
    digitalPulse(D16,1,40);
    break;
  default: //reset face timeout on every touch action, this function is in the handler file. 
    this.timeout();
  }
};
