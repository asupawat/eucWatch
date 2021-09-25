//sccellog
//code is based on a structure fanoush had on dsd6 scripts. 
face[0] = { //the first face of the hello app, called by using `face.go("hello",0)` from the cli.
  offms: 60000, //face timeout, will fall to face[1] after it, face[1] is a redirection face, not actually visible.
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
    g.setColor(colo.txt1);
    g.setFont("Vector",32);
    m = P8.nmove%60;
    if(m<10) m="0"+m.toFixed(0);
    else m=m.toFixed(0);
    g.drawString((P8.nmove/60).toFixed(0)+":"+m,150,45);
    this.run=true;
    return true;
  },
  show : function(o){
    if(!this.run) return;
    this.run=set.def.slm;


    /*if(this.move!=P8.ess_stddev[P8.ess_stddev.length-1]) {
      this.move=P8.ess_stddev[P8.ess_stddev.length-1];
      g.setColor(col("black"));
      g.fillRect(100,0,240,35);
      g.setColor(col("blue"));
      g.drawString(P8.ess_stddev[P8.ess_stddev.length-1].toFixed(2)+" ",100,0,true);
    }*/
    /*for (let i=(P8.ess_stddev.length-1);i>=0;i--) {
      var v = P8.ess_stddev[i];
      v = 239-v;
      v = v>239?239:v<40?40:v;
      g.setColor(0);
      this.x=i*2;
      g.fillRect(this.x,40,this.x+1,239);
      g.setColor(0x07E0);
      g.fillRect(this.x,this.lasty,this.x+1,v);
      this.lasty=v;
    }*/
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
	  face.go("main",-1);//sleep and set this face as the on_wake face. 
	//face.go("main",0);//go to main Clock face. 
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
  case 1: //slide down event-on directional swipes the x,y indicate the point of starting the swipe, so one can swipe up/dn on buttons like on the brightenss button at the main settings face. 
    face.go("main",0);return;
    //break;
  case 2: //slide up event
    face.go(face.appPrev,face.pagePrev);return;
  case 3: //slide left event
    digitalPulse(D16,1,40);    
    break;
  case 4: //slide right event (back action)
    face.go(face.appPrev,face.pagePrev);return; //return when changing faces, so that this action will not reset this face timeout. 
    //break;
  case 12: //touch and hold(long press) event
    digitalPulse(D16,1,40);  
    break;
  default: //reset face timeout on every touch action, this function is in the handler file. 
    this.timeout();
  }
};