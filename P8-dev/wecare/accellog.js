Modules.addCached("graph",function(){exports.drawAxes=function(b,c,a){function h(m){return e+n*(m-u)/z}function l(m){return f+g-g*(m-p)/v}var k=a.padx||0,d=a.pady||0,u=-k,y=c.length+k-1,p=(void 0!==a.miny?a.miny:a.miny=c.reduce((m,w)=>Math.min(m,w),c[0]))-d;c=(void 0!==a.maxy?a.maxy:a.maxy=c.reduce((m,w)=>Math.max(m,w),c[0]))+d;a.gridy&&(d=a.gridy,p=d*Math.floor(p/d),c=d*Math.ceil(c/d));var e=a.x||0,f=a.y||0,n=a.width||b.getWidth()-(e+1),g=a.height||b.getHeight()-(f+1);a.axes&&(null!==a.ylabel&&(e+=6,n-=6),null!==
a.xlabel&&(g-=6));a.title&&(f+=6,g-=6);a.axes&&(b.drawLine(e,f,e,f+g),b.drawLine(e,f+g,e+n,f+g));a.title&&(b.setFontAlign(0,-1),b.drawString(a.title,e+n/2,f-6));var z=y-u,v=c-p;v||(v=1);if(a.gridx){b.setFontAlign(0,-1,0);var x=a.gridx;for(d=Math.ceil((u+k)/x)*x;d<=y-k;d+=x){var t=h(d),q=a.xlabel?a.xlabel(d):d;b.setPixel(t,f+g-1);var r=b.stringWidth(q)/2;null!==a.xlabel&&t>r&&b.getWidth()>t+r&&b.drawString(q,t,f+g+2)}}if(a.gridy)for(b.setFontAlign(0,0,1),d=p;d<=c;d+=a.gridy)k=l(d),q=a.ylabel?a.ylabel(d):
d,b.setPixel(e+1,k),r=b.stringWidth(q)/2,null!==a.ylabel&&k>r&&b.getHeight()>k+r&&b.drawString(q,e-5,k+1);b.setFontAlign(-1,-1,0);return{x:e,y:f,w:n,h:g,getx:h,gety:l}};exports.drawLine=function(b,c,a){a=a||{};a=exports.drawAxes(b,c,a);var h=!0,l;for(l in c)h?b.moveTo(a.getx(l),a.gety(c[l])):b.lineTo(a.getx(l),a.gety(c[l])),h=!1;return a};exports.drawBar=function(b,c,a){a=a||{};a.padx=1;a=exports.drawAxes(b,c,a);for(var h in c)b.fillRect(a.getx(h-.5)+1,a.gety(c[h]),a.getx(h+.5)-1,a.gety(0));return a}});
//accellog
//code is based on a structure fanoush had on dsd6 scripts. 
face[0] = { //the first face of the hello app, called by using `face.go("hello",0)` from the cli.
  offms: 600000, //face timeout, will fall to face[1] after it, face[1] is a redirection face, not actually visible.
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
	  face.go("accellog",-1);//sleep and set this face as the on_wake face. 
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