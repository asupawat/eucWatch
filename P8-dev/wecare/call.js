//call
//code is based on a structure fanoush had on dsd6 scripts. 
face[0] = { //the first face of the call app, called by using `face.go("call",0)` from the cli.
  offms: 3000, //face timeout
  init: function(o){ //put here the elements of the page that will not need refreshing and initializations.
    //the way g.setColor https://rangevoting.org/ColorCode.html#
    if(global.inp==null) global.inp="undefined";
    //print("o :",o);
    //print("inp :",global.inp);
    g.setColor(col("dgray1"));
    g.fillRect(0,0,239,35);
    g.setColor(col("lblue"));
    g.setFont("Vector",25);
    if(o=="0") {
      o="undefined";
      face.go("main",0);
    } else if(o=="undefined" && global.inp=="undefined") {
      g.drawString("CALL NURSE",40,6);
      g.setColor("#F00");
      g.drawImage(require("Storage").read("call.img"),30,55);
    } else if(o=="1" || (global.inp=="1" && o=="undefined")) {
      this.offms=3000;
      if(o=="1") digitalPulse(D16,1,[80,100,40]); //send double buzz pulse
      if(o=="undefined") o=global.inp;
      g.drawString("CALLING NURSE",15,6);
      g.setColor("#0F0");
      g.drawImage(require("Storage").read("call.img"),30,55);
    } else {
      //clear calling loop
      if (global.calling) {clearInterval(global.calling);global.calling=0;}
      this.offms=8000;
      g.setFont("Vector",22);
      g.drawString("NURSE IS COMING",120-(g.stringWidth("NURSE IS COMING")/2),9);
      g.setColor(col("white"));
      g.setFont("Vector",25);
      if(o=="undefined") {
        o=global.inp;
        g.drawString(o,120-(g.stringWidth(o)/2),55);
        g.setColor("#0F0");
        g.fillRect(30,110,210,200);
        g.setColor(col("black"));
        g.setFont("Vector",50);
        g.drawString("OK",120-(g.stringWidth("OK")/2),135);
      } else {
        g.drawString(o,120-(g.stringWidth(o)/2),55);
        digitalPulse(D16,1,[200,300,100,100,100]);
        handleMqttEvent({"src":"NURSE","title":o,"body":"IS COMING"});
        mqtt.publish("call", "3");
        g.setColor(col("white"));
        g.drawImage(require("Storage").read("nurse.img"),70,90,{scale:0.7});
      }
    }
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
    if(face[0].inp!="undefined" || face[0].inp!="1") face.go("call",-1);
    else face.go("main",-1);
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
  //if(e!=1 && e!=12 && global.inp!="undefined" && global.inp!="1") return;
  switch (e) {
  case 5: //tap event
    face[0].btn=1-face[0].btn;
    break;
  case 1: //slide down event
    face.go("call",-1);
    return;
  case 2: //slide up event
    face.go("main",0);
    return true;
  case 3: //slide left event
    face.go("heart",0);
    return true;
  case 4: //slide right event (back action)
    face.go("main",0);
    return true; 
  case 12: //touch and hold(long press) event
    if(global.inp!="undefined" && global.inp!="1") {
      handleMqttEvent({"src":"NURSE","title":global.inp,"body":"TAKE ACTION"});
      //print("Accepted!");
      face[0].offms+=5000;
      digitalPulse(D16,1,[80,100,40]);
      mqtt.publish("call", "0");
      return true;
    } else if(face[0].o=="undefined" && global.inp=="undefined") {
      //print("Calling!");
      digitalPulse(D16,1,[80,100,40]);
      handleMqttEvent({"src":"PATIENT","title":"CALLING","body":"FOR HELP"});
      mqtt.publish("call", "1");
      if (global.calling) {clearInterval(global.calling);global.calling=0;}
      global.calling=setInterval(()=>{
        //print("Re-Calling!");
        mqtt.publish("call", "2");
			},300000); //300000=5min
      break;
    }
    digitalPulse(D16,1,40);
    break;
  }
  //reset face timeout on every touch action
  this.timeout();
};


