/* Low pass, high pass and AGC filters adapted from Daniel Thompson's waspos heartrate module */
var correlator = (function(){
  var bin=atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAt6fBHKk19RAAg1fgAgAcmqPEHAYZGb/AATAApC0ZCRti/AfGAA0/wWwkAJK8Yl/gEoO8YP3nH6woHAvEBChtKCuoCAgAqA/EBChhLuL8C8f8yCuoDA7y/YvB/AgEyACu+vwPx/zNj8H8DATO58QEJB/sHRNrRZEW8vzBGpEYBNqZFuL+mRiUuAfH/McXRCUt7RMP4hMDD+IjgKLEoI1hDTvZgI5P78PC96PCHfwAAgGr////g/v//Akt7RNP4hABwRwC/tv7//wJLe0TT+IgAcEcAv6b+//8JSXlEC2jKGBBxWhwFSxNAACu+vwPx/zNj8H8DATMLYHBHAL9/AACAlv7//w==");
  return {
    put:E.nativeCall(357, "void(int)", bin),
    Cmax:E.nativeCall(341, "int(void)", bin),
    Cmin:E.nativeCall(325, "int(void)", bin),
    bpm:E.nativeCall(141, "int(void)", bin),
  };
})();

var avgMedFilter = (function(){
  var bin=atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcSnpEMLUTaALrgwEBM0hgByGT+/HxwevBAVsaibATYAGoACMRHVH4IxBA+CMQATMHK/fRaUYAIgEyUfgEXxNGBysL0Qcq99EEmwOYGEQFmwNEAyCT+/DwCbAwvVD4I0ClQsG/DWhA+CNQDGAlRgEz5ucAv9r///8=");
  return {
    filter:E.nativeCall(33, "int(int)", bin),
  };
})();

var medianFilter = (function(){
  var bin=atob("BQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAACFJeUT4tQtomgAKMiLwBwIAr63rAg1KaAHrggUBMqhgkvvz8AP7ECIYSEpgbEYAInhEmkIH2gDxCAFR+CIQRPgiEAEy9ecSSnpEACHS+CTAIh9hRRPcUvgEbwExFUYIRphC9tpV+ATvdkXEvxZoLmAA8QEAxL/C+ADgdkbw51T4LAC9Rvi9AL/S////pP///4z///8=");
  return {
    filter:E.nativeCall(41, "int(int)", bin),
  };
})();

var lpfFilter = (function(){
  var bin=atob("AAAAAAAAAACBeO09gXhtPoF47T0dwDi/dfE9PhNLB+4QCntE0+0AatPtBVqT7QFq0+0GesPtAWq47sd6pe7metPtAlqn7sZ60+0DeoPtAHpm7qd65+4letPtBFrm7iV6/e7nehfukApwRwC/2v///w==");
  return {
    filter:E.nativeCall(29, "int(int)", bin),
  };
})();

var hpfFilter = (function(){
  var bin=atob("AAAAAAAAAAAAzl4/AM7evwDOXj+xpNy/mO5BPxNLB+4QCntE0+0AatPtBVqT7QFq0+0GesPtAWq47sd6pe7metPtAlqn7sZ60+0DeoPtAHpm7qd65+4letPtBFrm7iV6/e7nehfukApwRwC/2v///w==");
  return {
    filter:E.nativeCall(29, "int(int)", bin),
  };
})();

var agcFilter = (function(){
  var bin=atob("AACgQcjSgz91k3g/AAAAQIDq4HIeS6Lr4HIH7hAqe0S47sd60+0AerTu53rx7hD6zL+T7QF6k+0CehZLZ+6HegfuEAp7RPjux2qT7QN6w+0Aeifuh2r07sZq8e4Q+hXcJ+5nevTux2rx7hD6DtRkI0NDB+4QOnfup3r47sdqhu6nev3ux3oX7pAKcEcAIHBH3v///7j///8=");
  return {
    filter:E.nativeCall(17, "int(int)", bin),
  };
})();

var pulseDetector = (function(){
  var bin=atob("AAAAAAAAAAAUAAAA7P///xZKekQTeOuxU2iDQgHakGAe4B3d0WiTaFsaFTtA9qIxi0JP8AABjL8AIwEj0WARcAtKekRRaIhCC90AIZFgASERcAbgU2iYQgDa0GAAI+/nACMESnpEUGAYRnBH6v///7r///+Y////");
  return {
    isBeat:E.nativeCall(17, "int(int)", bin),
  };
})();

var HRS = {
  writeByte:(a,d) => {
      i2c.writeTo(0x44,a,d);
  },
  readByte:(a) => {
      i2c.writeTo(0x44, a);
      return i2c.readFrom(0x44,1)[0];
  },
  process:0,
  enable:() => {
    HRS.writeByte( 0x17, 0b00001101 ); //00001101  bits[4:2]=011,HRS gain 8
    HRS.writeByte( 0x16, 0x78 ); //01111000  bits[3:0]=1000,HRS 16bits
    HRS.writeByte( 0x01, 0xd0 ); //11010000  bit[7]=1,HRS enable;bit[6:4]=101,wait time=50ms,bit[3]=0,LED DRIVE=12.5 mA
    HRS.writeByte( 0x0c, 0x6e ); //00101110  bit[6]=0,LED DRIVE=12.5mA;bit[5]=0,sleep mode;p_pulse=1110,duty=50% 
  },
  disable:() => {
    HRS.writeByte( 0x01, 0x08 );
    HRS.writeByte( 0x02, 0x80 );
    HRS.writeByte( 0x0c, 0x4e );

    HRS.writeByte( 0x16, 0x88 );

    HRS.writeByte( 0x0c, 0x22 );
    HRS.writeByte( 0x01, 0xf0 );
    HRS.writeByte( 0x0c, 0x02 );

    HRS.writeByte( 0x0c, 0x22 );
    HRS.writeByte( 0x01, 0xf0 );
    HRS.writeByte( 0x0c, 0x02 );

    HRS.writeByte( 0x0c, 0x22 );
    HRS.writeByte( 0x01, 0xf0 );
    HRS.writeByte( 0x0c, 0x02 );

    HRS.writeByte( 0x0c, 0x22 );
    HRS.writeByte( 0x01, 0xf0 );
    HRS.writeByte( 0x0c, 0x02 );
  },
  read:()=>{
      var m = HRS.readByte(0x09);
      var h = HRS.readByte(0x0A);
      var l = HRS.readByte(0x0F);
      var v = (m<<8)|((h&0x0F)<<4)|(l&0x0F); //16 bit
      return lpfFilter.filter(agcFilter.filter(medianFilter.filter(hpfFilter.filter(v))));
  },
  bpm:0,
  start:(t)=>{
    if (HRS.process) {
      clearInterval(HRS.process);
      HRS.process=0;
      HRS.disable();
    }
    HRS.enable();
    var bpmtime=0;
    var beatcount=0;
    HRS.process=setInterval(()=>{
      var v = HRS.read();
      correlator.put(v);
      if (pulseDetector.isBeat(v)) {
        beatcount=0;
        this.bpm = correlator.bpm();
        if (this.bpm > 0 && this.bpm < 200) {
          if(bpmtime>128) {
            this.bpm = avgMedFilter.filter(this.bpm);
            if(bpmtime>256) {
              print("bpm: ",this.bpm);
              HRS.emit("bpm",{bpm:this.bpm});
            }
          }
        }
      } else {
        beatcount++;
        if(beatcount>150) { // 150x40ms=6sec
          HRS.stop();
        }
      }
      bpmtime++;
      HRS.emit("hrm-raw",{raw:v});
      // stop in t sec 25x40ms=1s
      if(bpmtime>=(25*t)) {
        HRS.stop();
        bpmtime=0;
      }
    },40);
  },
  stop:()=>{
    if (HRS.process) {
      clearInterval(HRS.process);
      HRS.process=0;
      HRS.disable();
    }
  },
};
HRS.disable();

var x = 0;
var lasty = 139;

function bpmHandler(hrm) {
  //print(hrm);
  g.setFont("Vector",32);
  g.setColor(col("dgray1"));
  g.fillRect(90,0,160,35);
  g.setColor(0x07E0);
  g.drawString(hrm.bpm,90,6);
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
    g.drawString(HRS.bpm,90,4);
    x=0;
    HRS.on("bpm", bpmHandler);
  },
  show : function(o){
    if(this.process==0 && !HRS.process) {
      this.process=-1;
      HRS.removeListener("hrm-raw", hrmHandler);
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
    digitalPulse(D16,1,40); //send short buzz pulse to indicate tap was not acknowledged.
    break;
  case 1: //slide down event
    stopMeasure();
    break;
  case 2: //slide up event
    stopMeasure();
    break;
  case 3: //slide left event
    if (HRS.process) {
      stopMeasure();
      g.setFont("Vector",16);
      g.setColor(col("black"));
      g.fillRect(240-(g.stringWidth("PAUSED")),40,239,56);
      g.setColor(0xFD40).drawString("PAUSED",240-(g.stringWidth("PAUSED")),40);
    }
    break;
  case 4: //slide right event
    startMeasure();
    g.setFont("Vector",16);
    g.setColor(col("black"));
    g.fillRect(120,40,239,56);
    g.setFont("Vector",32);
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
