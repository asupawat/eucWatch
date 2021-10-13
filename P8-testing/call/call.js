//call
//code is based on a structure fanoush had on dsd6 scripts. 
face[0] = { //the first face of the call app, called by using `face.go("call",0)` from the cli.
  offms: 5000, //face timeout, will fall to face[1] after it, face[1] is a redirection face, not actually visible.
  g:w.gfx, //set graphics as this.g variable
  init: function(o){ //put here the elements of the page that will not need refreshing and initializations.
    //the way this.g.setColor is used on this project is not the espruino default. You can see changes on it at the init file. The screen driver is set at two colors mode to save on ram, and a flip is used when more colors are needed. The first argument is the color space, 0 or 1, the second argument is the actual color in 12-bit Color code. https://rangevotinthis.g.org/ColorCode.html#
    this.g.clear();
    //print("o :",o);
    if(global.inp==null) global.inp="undefined";
    //print("inp :",global.inp);
    this.g.setColor(0,col("black"));
    this.g.flip();
    this.g.setColor(0,col("dgray1")); //header
    this.g.fillRect(0,0,239,35); 
    this.g.setColor(1,col("lblue"));
    this.g.setFont("Vector",25);
    if(o=="undefined" && global.inp=="undefined") {
      this.g.drawString("CALL NURSE",40,6);
      this.g.flip();
      this.g.setColor(0,col("black"));
      this.g.setColor(1,0xF00);
      this.g.drawImage(require("Storage").read("call.img"),30,55);
    } else if(o=="1" || (global.inp=="1" && o=="undefined")) {
      if(o=="1") digitalPulse(D16,1,[80,100,40]); //send double buzz pulse
      if(o=="undefined") o=global.inp;
      this.g.drawString("CALLING NURSE",15,6);
      this.g.flip();
      this.g.setColor(0,col("black"));
      this.g.setColor(1,0x0F0);
      this.g.drawImage(require("Storage").read("call.img"),30,55);
    } else {
      //clear calling loop
      if (global.calling) {clearInterval(global.calling);global.calling=0;}
      if(o=="undefined") o=global.inp;
      else {
        digitalPulse(D16,1,[200,300,100,100,100]);
        handleMqttEvent({"src":"NURSE","title":o,"body":"IS COMING"});
      }
      this.g.setFont("Vector",22);
      this.g.drawString("NURSE IS COMING",120-(this.g.stringWidth("NURSE IS COMING")/2),9);
      this.g.flip();
      this.g.setColor(0,col("black"));
      this.g.setColor(1,col("white"));
      this.g.setFont("Vector",25);
      this.g.drawString(o,120-(this.g.stringWidth(o)/2),55);
      this.g.flip();
      this.g.setColor(1,0x0F0);
      this.g.fillRect(30,110,210,200);
      this.g.setColor(0,col("black"));
      this.g.setFont("Vector",50);
      this.g.drawString("OK",120-(this.g.stringWidth("OK")/2),135);
      this.g.flip();
    } 
    this.g.flip();
    global.inp=o;
    this.btn=0;
    this.last_btn=this.btn;
	  this.run=true;
  },
  show : function(o){
    if (!this.run) return;
    if (this.btn!==this.last_btn){
      this.last_btn=this.btn;
    }
    this.tid=setTimeout(function(t){ //the face's screen refresh rate. 
      t.tid=-1;
      t.show();
    },50,this);
  },
  tid:-1,
  run:false,
  clear : function(){ //enter here everything needed to clear all app running function on face exit. 
    pal[0]=col("black"); //this is for cleaner face transitions
    this.g.clear(); //as above
    this.run=false;
    if (this.tid>=0) clearTimeout(this.tid); //clears main face[0] timeout loop.
    this.tid=-1;
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
    //print("sleep :",face[0].inp);
    if(face[0].inp!="undefined" || face[0].inp!="1") face.go("call",-1);
    else face.go("main",-1);
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
  if(e!=12 && global.inp!="undefined" && global.inp!="1") return;
  switch (e) {
  case 5: //tap event
	  //digitalPulse(D16,1,50);
    face[0].btn=1-face[0].btn;
    break;
  case 1: //slide down event-on directional swipes the x,y indicate the point of starting the swipe, so one can swipe up/dn on buttons like on the brightenss button at the main settings face.
    face.go("main",-1);return;
    //break;
  case 2: //slide up event
    face.go("settings",0);
    return true;
  case 3: //slide left event
    face.go("main",0);
    return true;
  case 4: //slide right event (back action)
    face.go("notify",0);
    return true;
  case 12: //touch and hold(long press) event
    if(global.inp!="undefined" && global.inp!="1") {
      handleMqttEvent({"src":"NURSE","title":global.inp,"body":"TAKE ACTION"});
      print("Accepted!");
      global.inp="undefined";
      digitalPulse(D16,1,[80,100,40]);
      //mqtt.publish("call", "0");
      face.go("main",0);
      return true;
    } else if(face[0].o=="undefined" && global.inp=="undefined") {
      print("Calling!");
      digitalPulse(D16,1,[80,100,40]);
      handleMqttEvent({"src":"PATIENT","title":"CALLING","body":"FOR HELP"});
      //mqtt.publish("call", "1");
      if (global.calling) {clearInterval(global.calling);global.calling=0;}
      global.calling=setInterval(()=>{
        print("Re-Calling!");
        //mqtt.publish("call", "2");
			},300000); //300000=5min
      break;
    }
    digitalPulse(D16,1,40);
    break;
  default: //reset face timeout on every touch action, this function is in the handler file. 
    this.timeout();
  }
};
