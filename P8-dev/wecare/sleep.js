face[0] = {
  offms: 10000,
  sleeptime:[-1,-1,-1,-1],
  buf:[0,0,0,0],
  pad:function pad(n) {
    return (n < 10) ? ("0" + n) : n;
  },
  init: function(o){
    var d=(Date()).toString().split(' ');
    var t=(d[4]).toString().split(':');
    g.setColor(col("dgray1")); //header
    g.fillRect(0,0,239,35);
    g.setColor(col("lblue"));
    g.setFont("Vector",25);
	  g.drawString("SLEEP",4,6);
    g.setFont("Vector",32);
  	g.drawString(t[0]+":"+t[1],242-(g.stringWidth(t[0]+":"+t[1])),3);
    g.setFont("Vector",75);
    this.buf[0]=valdef.sleeptime[0];
    this.buf[1]=valdef.sleeptime[1];
    this.buf[2]=valdef.sleeptime[2];
    this.buf[3]=valdef.sleeptime[3];
  	this.run=true;
  },
  show : function(o){
    if (!this.run) return;
    if(this.sleeptime[0]!=this.buf[0]) {
      this.sleeptime[0]=this.buf[0];
      g.setColor(colo.bck3).fillRect(0,39,121,137);
      g.setColor(colo.txt1);
      g.drawString(this.pad(this.buf[0]),66-(g.stringWidth(this.pad(this.buf[0])))/2,55);
    }
    if(this.sleeptime[1]!=this.buf[1]) {
      this.sleeptime[1]=this.buf[1];
      g.setColor(colo.bck1).fillRect(122,39,239,137);
      g.setColor(colo.txt3);
      g.drawString(this.pad(this.buf[1]),190-(g.stringWidth(this.pad(this.buf[1])))/2,55);
    }
    if(this.sleeptime[2]!=this.buf[2]) {
      this.sleeptime[2]=this.buf[2];
      g.setColor(colo.bck2).fillRect(0,142,121,239);
      g.setColor(colo.txt);
      g.drawString(this.pad(this.buf[2]),66-(g.stringWidth(this.pad(this.buf[2])))/2,160);
    }
    if(this.sleeptime[3]!=this.buf[3]) {
      this.sleeptime[3]=this.buf[3];
      g.setColor(colo.bck1).fillRect(122,142,239,239);
      g.setColor(colo.txt3);
      g.drawString(this.pad(this.buf[3]),190-(g.stringWidth(this.pad(this.buf[3])))/2,160);
    }
    this.tid=setTimeout(function(t){
      t.tid=-1;
      t.show(o);
    },100,this);
  },
  tid:-1,
  run:false,

  clear : function(){
    g.clear();
    this.exit();
    return true;
  },
  exit: function(){
    this.run=false;
    if (this.tid>=0) clearTimeout(this.tid);
    this.tid=-1;
    return true;
  },
  off: function(){
    P8.sleep();
    this.clear();
  }
};

face[1] = {
  offms:1000,
  init: function(){
  return true;
  },
  show : function(){
    face.go("main",0);
    return true;
  },
   clear: function(){
  return true;
  }
};

touchHandler[0]=function(e,x,y){
  switch (e) {
  case 5: //tap event
    break;
  case 2: //slide up event
	  if(x<121&&y<137) {
   		face[0].buf[0]++;
		  if (face[0].buf[0]>23) face[0].buf[0]=face[0].buf[0]-24;
    }else if(x<121&&y>142) {
   		face[0].buf[2]++;
		  if (face[0].buf[2]>23) face[0].buf[2]=face[0].buf[2]-24;
    }else if(122<x&&x<183&&y<137){
      face[0].buf[1]+=10;
		  if (face[0].buf[1]>59){
        face[0].buf[1]=face[0].buf[1]-60;
        face[0].buf[0]++;
        if (face[0].buf[0]>23) face[0].buf[0]=face[0].buf[0]-24;
      }
    }else if(x>=183&&y<137){
		  face[0].buf[1]++;
		  if (face[0].buf[1]>59){
        face[0].buf[1]=face[0].buf[1]-60;
        face[0].buf[0]++;
        if (face[0].buf[0]>23) face[0].buf[0]=face[0].buf[0]-24;
      }
    }else if(122<x&&x<183&&y>142){
      face[0].buf[3]+=10;
		  if (face[0].buf[3]>59){
        face[0].buf[3]=face[0].buf[3]-60;
        face[0].buf[2]++;
        if (face[0].buf[2]>23) face[0].buf[2]=face[0].buf[2]-24;
      }
    }else if(x>=183&&y>142){
		  face[0].buf[3]++;
		  if (face[0].buf[3]>59){
        face[0].buf[3]=face[0].buf[3]-60;
        face[0].buf[2]++;
        if (face[0].buf[2]>23) face[0].buf[2]=face[0].buf[2]-24;
      }
    }
    this.timeout();
    break;
  case 1: //slide down
	  if(x<121&&y<137) {
   		face[0].buf[0]--;
		  if (face[0].buf[0]<0) face[0].buf[0]=face[0].buf[0]+24;
    }else if(x<121&&y>142) {
   		face[0].buf[2]--;
		  if (face[0].buf[2]<0) face[0].buf[2]=face[0].buf[2]+24;
    }else if(122<x&&x<183&&y<137){
      face[0].buf[1]-=10;
		  if (face[0].buf[1]<0){
        face[0].buf[1]=face[0].buf[1]+60;
        face[0].buf[0]--;
        if (face[0].buf[0]<0) face[0].buf[0]=face[0].buf[0]+24;
      }
    }else if(x>=183&&y<137){
		  face[0].buf[1]--;
		  if (face[0].buf[1]<0){
        face[0].buf[1]=face[0].buf[1]+60;
        face[0].buf[0]--;
        if (face[0].buf[0]<0) face[0].buf[0]=face[0].buf[0]+24;
      }
    }else if(122<x&&x<183&&y>142){
      face[0].buf[3]-=10;
		  if (face[0].buf[3]<0){
        face[0].buf[3]=face[0].buf[3]+60;
        face[0].buf[2]--;
        if (face[0].buf[2]<0) face[0].buf[2]=face[0].buf[2]+24;
      }
    }else if(x>=183&&y>142){
		  face[0].buf[3]--;
		  if (face[0].buf[3]<0){
        face[0].buf[3]=face[0].buf[3]+60;
        face[0].buf[2]--;
        if (face[0].buf[2]<0) face[0].buf[2]=face[0].buf[2]+24;
      }
    }
    this.timeout();
    break;
  case 3: //slide left event
  case 4: //slide right event
    face.go("settings",0);return;
  case 12: //touch and hold(long press) event
    valdef.sleeptime[0]=face[0].buf[0];
    valdef.sleeptime[1]=face[0].buf[1];
    valdef.sleeptime[2]=face[0].buf[2];
    valdef.sleeptime[3]=face[0].buf[3];
    set.updateSensorVal();
    digitalPulse(D16,1,[80,60,80]);
    face.go("settings",0);
    return;
	default:
    this.timeout();
  }
};