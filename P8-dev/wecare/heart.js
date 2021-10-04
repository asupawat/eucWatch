Modules.addCached("graph",function(){exports.drawAxes=function(b,c,a){function h(m){return e+n*(m-u)/z}function l(m){return f+g-g*(m-p)/v}var k=a.padx||0,d=a.pady||0,u=-k,y=c.length+k-1,p=(void 0!==a.miny?a.miny:a.miny=c.reduce((m,w)=>Math.min(m,w),c[0]))-d;c=(void 0!==a.maxy?a.maxy:a.maxy=c.reduce((m,w)=>Math.max(m,w),c[0]))+d;a.gridy&&(d=a.gridy,p=d*Math.floor(p/d),c=d*Math.ceil(c/d));var e=a.x||0,f=a.y||0,n=a.width||b.getWidth()-(e+1),g=a.height||b.getHeight()-(f+1);a.axes&&(null!==a.ylabel&&(e+=6,n-=6),null!==
a.xlabel&&(g-=6));a.title&&(f+=6,g-=6);a.axes&&(b.drawLine(e,f,e,f+g),b.drawLine(e,f+g,e+n,f+g));a.title&&(b.setFontAlign(0,-1),b.drawString(a.title,e+n/2,f-6));var z=y-u,v=c-p;v||(v=1);if(a.gridx){b.setFontAlign(0,-1,0);var x=a.gridx;for(d=Math.ceil((u+k)/x)*x;d<=y-k;d+=x){var t=h(d),q=a.xlabel?a.xlabel(d):d;b.setPixel(t,f+g-1);var r=b.stringWidth(q)/2;null!==a.xlabel&&t>r&&b.getWidth()>t+r&&b.drawString(q,t,f+g+2)}}if(a.gridy)for(b.setFontAlign(0,0,1),d=p;d<=c;d+=a.gridy)k=l(d),q=a.ylabel?a.ylabel(d):
d,b.setPixel(e+1,k),r=b.stringWidth(q)/2,null!==a.ylabel&&k>r&&b.getHeight()>k+r&&b.drawString(q,e-5,k+1);b.setFontAlign(-1,-1,0);return{x:e,y:f,w:n,h:g,getx:h,gety:l}};exports.drawLine=function(b,c,a){a=a||{};a=exports.drawAxes(b,c,a);var h=!0,l;for(l in c)h?b.moveTo(a.getx(l),a.gety(c[l])):b.lineTo(a.getx(l),a.gety(c[l])),h=!1;return a};exports.drawBar=function(b,c,a){a=a||{};a.padx=1;a=exports.drawAxes(b,c,a);for(var h in c)b.fillRect(a.getx(h-.5)+1,a.gety(c[h]),a.getx(h+.5)-1,a.gety(0));return a}});
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
  if (HRS.loop()) return;
  HRS.start(30); // run for 30sec
  HRS.on("hrm-raw", hrmHandler);
  g.setColor(col("black"));
  if(face[0].process==-1) { g.fillRect(0,40,240,240); }
  face[0].process=0;
  digitalPulse(D16,1,40);
}

function stopMeasure() {
  if(HRS.loop()) {
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
    if(this.process==0 && !HRS.loop() && valdef.hrm.length>0) {
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
    digitalPulse(D16,1,40); //send short buzz pulse to indicate tap was not acknowledged.
    break;
  case 1: //slide down event
    //stopMeasure();
    face.go("accellog",0);return; //return when changing faces, so that this action will not reset this face timeout. 
    //break;
  case 2: //slide up event
    //stopMeasure();
    face.go("call",0);return;
  case 3: //slide left event
    if (HRS.loop()) {
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
