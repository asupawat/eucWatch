//Hello face
//code is based on a structure fanoush had on dsd6 scripts. 
face[0] = { //the first face of the hello app, called by using `face.go("hello",0)` from the cli.
  offms: 10000, //face timeout, will fall to face[1] after it, face[1] is a redirection face, not actually visible.
  init: function(o){ //put here the elements of the page that will not need refreshing and initializations.
    //the way g.setColor is used on this project is not the espruino default. You can see changes on it at the init file. The screen driver is set at two colors mode to save on ram, and a flip is used when more colors are needed. The first argument is the color space, 0 or 1, the second argument is the actual color in 12-bit Color code. https://rangevoting.org/ColorCode.html#
    if(o=="acp" || this.inp=="acp") {
      g.setColor("#0F0");
      g.fillCircle(120,110,95);
      g.drawImage(require("Storage").read("nurse.img"),55,17);
      if(o=="acp") {
        digitalPulse(D16,1,[200,300,100,100,100]);
        handleMqttEvent({"src":"BT","title":"NURSE","body":"IS COMING"});
      }
      if(this.inp=="acp") mqtt.publish("user", "answer");
    } else if(o=="ack") {
      g.setColor("#0F0");
      g.drawImage(require("Storage").read("call.img"),30,20);
      digitalPulse(D16,1,[80,100,40]); //send double buzz pulse to indicate tap was acknowledged.
    }
    else {
      g.setColor("#F00");
      g.drawImage(require("Storage").read("call.img"),30,20);
    }
    this.inp=o;
    this.btn=0;
    this.last_btn=this.btn;
	  this.run=true;
  },
  show : function(o){
    if (!this.run) return;
    if (this.btn!==this.last_btn){
      this.last_btn=this.btn;
      //g.setColor("#F00");
      //g.drawImage(require("Storage").read("call.img"),30,20);
    }
    this.tid=setTimeout(function(t){ //the face's screen refresh rate. 
      t.tid=-1;
      t.show();
    },50,this);
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
  return true;
  },//only use this part of the face to set redirection.
  show : function(){
  //face.go(face.appRoot[0],face.appRoot[1]); //go to the previous face on screen of the previous app.  
	//face.go(face.appPrev,face.pagePrev); //go to the previous face on screen, even if it was on the same app. 
  //face.go("hello",-1); //sleep and set this face as the on_wake face. 
	//face.go("main",-1);//sleep and set this face as the on_wake face. 
	//face.go("main",0);//go to main Clock face.
    if(face[0].inp=="acp") face.go("hello",-1);
    else face.go("main",-1);
    //face.appPrev="hello";
    //face.pagePrev=0;
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
	  //digitalPulse(D16,1,50);
    face[0].btn=1-face[0].btn;
    break;
  case 1: //slide down event-on directional swipes the x,y indicate the point of starting the swipe, so one can swipe up/dn on buttons like on the brightenss button at the main settings face.
    if(face[0].inp=="acp") mqtt.publish("user", "answer");
    face.go("heart",0);return;
    //break;
  case 2: //slide up event
    if(face[0].inp=="acp") mqtt.publish("user", "answer");
    face.go("main",0);
    return true;
  case 3: //slide left event
    if(face[0].inp=="acp") mqtt.publish("user", "answer");
    face.go("main",-1);
    return true;
  case 4: //slide right event (back action)
  case 12: //touch and hold(long press) event
    if(face[0].inp=="acp") {
      mqtt.publish("user", "answer");
      face.go("main",-1);
      return true;
    }
    else if(face[0].inp=="ack") {
      face.go("main",-1);
      return true;
    } else {
      mqtt.publish("call", "help");
      digitalPulse(D16,1,[80,100,40]);
      break;
    }
    digitalPulse(D16,1,40);
    break;
  default: //reset face timeout on every touch action, this function is in the handler file. 
    this.timeout();
  }
};


