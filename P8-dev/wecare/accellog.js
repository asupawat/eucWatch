//accellog
//code is based on a structure fanoush had on dsd6 scripts. 
face[0] = { //the first face of the hello app, called by using `face.go("hello",0)` from the cli.
  offms: 3000, //face timeout
  init: function(o){ //put here the elements of the page that will not need refreshing and initializations.
    g.setColor(col("dgray1")); //header
    g.fillRect(0,0,239,35); 
    g.setColor(col("lblue"));
    g.setFont("Vector",25);
	  g.drawString("AWAKE",15,6);
  	g.drawString("SLEEP",145,6);
    g.setColor(colo.bck1).fillRect(0,39,121,77);//awake
    g.setColor(colo.txt);
    g.setFont("Vector",32);
    var m = P8.move%60;
    if(m<10) m="0"+m.toFixed(0);
    else m=m.toFixed(0);
    g.drawString((P8.move/60).toFixed(0)+":"+m,25,45);
    g.setColor(colo.bck3).fillRect(122,39,239,77);//sleep
    g.setColor(col("dgray1")).fillRect(0,80,239,239);//graph
    g.setColor(colo.txt1);
    g.setFont("Vector",32);
    m = P8.nmove%60;
    if(m<10) m="0"+m.toFixed(0);
    else m=m.toFixed(0);
    g.drawString((P8.nmove/60).toFixed(0)+":"+m,150,45);
    g.setColor(0x1DA0);
    g.setFont("Vector",25);
    if(valdef.sleep.length==valdef.awake.length && valdef.sleep.length>0) {
      var vmax = 0;
      for (let i=0;i<valdef.sleep.length;i++) {
        if(valdef.sleep[i]>vmax) vmax=valdef.sleep[i];
      }
      require("graph").drawBar(g, valdef.sleep, {
        miny: 0,
        axes : false,
        x : 12,
        y : 110,
        height : 120
      });
      g.setColor(0x37A2);
      require("graph").drawBar(g, valdef.awake, {
        miny: 0,
        axes : false,
        x : 12,
        y : 110,
        height : 120,
        gridy : Math.round(vmax)
      });
    }
    this.run=true;
    return true;
  },
  show : function(o){
    if(!this.run) return;
    this.run=set.def.slm;

    this.tid=setTimeout(function(t){ //the face's screen refresh rate. 
      t.tid=-1;
      t.show();
    },1000,this);
  },
  tid:-1,
  move:-1,
  run:false,
  x:0,
  lasty:239,
  clear : function(){ //enter here everything needed to clear all app running function on face exit. 
    g.clear(); //as above
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
  return true;
  },//only use this part of the face to set redirection.
  show : function(){
  //face.go(face.appRoot[0],face.appRoot[1]); //go to the previous face on screen of the previous app.  
	//face.go(face.appPrev,face.pagePrev); //go to the previous face on screen, even if it was on the same app. 
  //face.go("hello",-1); //sleep and set this face as the on_wake face. 
	//face.go("accellog",-1);//sleep and set this face as the on_wake face. 
	  face.go("main",0);//go to main Clock face. 
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
	  digitalPulse(D16,1,50);
    face[0].btn=1-face[0].btn;
    break;
  case 1: //slide down event
    face.go("accellog",-1);return;
    //break;
  case 2: //slide up event
    face.go("main",0);return;
  case 3: //slide left event
    face.go("main",0);return;
    break;
  case 4: //slide right event
    face.go("heart",0);return;
  case 12: //touch and hold(long press) event
    digitalPulse(D16,1,40);
    break;
  default: //reset face timeout on every touch action, this function is in the handler file. 
    this.timeout();
  }
};
