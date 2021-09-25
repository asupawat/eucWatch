//calc
if (typeof global.calc=="undefined"){
  global.calc={
    val:"",
    disp:"",
    tot:"",
    sum:"",
    hist:[],
      par:-1
  };
  }
  //calculator
  face[0] = {
    offms: 15000,
    comf: function(num){
        var parts = (''+(num<0?-num:num)).split("."), s=parts[0], L, i=L= s.length, o='';
        while(i--){ o = (i===0?'':((L-i)%3?'':',')) 
          +s.charAt(i) +o; }
          return (num<0?'-':'') + o + (parts[1] ? (o.length>5?'.' + parts[1].toString().substr(0,3): '.' + parts[1]) : ''); 
    },
    init: function(){
  //rows
      g.setColor(col("lgray"));
      g.fillRect(0,40,57,90);//1
      g.fillRect(60,40,117,90);//2
      g.fillRect(120,40,179,90);//3
      g.fillRect(0,93,57,140);//4
      g.fillRect(60,93,117,140);//5
      g.fillRect(120,93,179,140);//6
      g.fillRect(0,143,57,190);//7
      g.fillRect(60,143,117,190);//8
      g.fillRect(120,143,179,190);//9
      g.fillRect(0,193,57,239);//.
      g.fillRect(60,193,117,239);//0
  //
      g.setColor(col("black"));
      g.setFont("Vector",35);
      g.drawString("1",20,50);
    g.drawString("2",80,50);
    g.drawString("3",140,50);
      g.drawString("4",20,102);
    g.drawString("5",80,102);
    g.drawString("6",140,102);
      g.drawString("7",20,152);
    g.drawString("8",80,152);
    g.drawString("9",140,152);
      g.drawString(".",25,198);
    g.drawString("0",80,202);
      g.flip();
  //side   
      g.setColor(col("blue"));
      g.fillRect(120,193,179,239);//=
      g.setColor(col("white"));
    g.drawString("=",140,204);
      g.flip();
      g.setColor(col("raf3"));
      g.fillRect(181,40,239,90);///
      g.fillRect(182,93,239,140);//*
      g.fillRect(182,143,239,190);//-
      g.fillRect(182,193,239,239);//+
      g.setColor(col("lblue"));
      g.drawString("/",201,50);
      g.drawString("*",202,107);		
      g.drawString("-",205,152);
    g.drawString("+",201,202); 
      g.flip();
      this.run=true;
      this.disp=-1;
      this.key=-1;
      this.tim={};
      this.pvdisp=-1;
    },
    show : function(){
      if (!this.run) return;
      if(calc.disp!="") this.disp=calc.disp;
      else if(calc.val!="") this.disp=calc.val;
      else if(calc.sum!="") this.disp=calc.sum;
      else this.disp=0;
      if (String(this.disp)!=String(this.pvdisp)){
        g.setColor(col("black"));
        g.fillRect(0,0,239,35);
        if (calc.disp.length>16) {calc.disp=""; }
        if (calc.disp==""){
          if (calc.val!=""){
            this.pvdisp=calc.val;
            if (calc.val!="-"){
              g.setColor(col("yellow"));
              this.out=this.comf(eval(calc.val.substring(0,calc.val.length-1)))+calc.val.substring(calc.val.length-1);
            }else {this.out="-"; g.setColor(col("white"));}
          }else if (calc.sum!=""){
            this.pvdisp=calc.sum;
            g.setColor(col("blue"));
            this.out=this.comf(Number(calc.sum));
          }else {g.setColor(col("lgray"));this.out=0;this.pvdisp=0;}
        }else {g.setColor(col("white"));
          this.pvdisp=calc.disp;
          this.out=calc.disp;
          if (calc.disp.substring(0)==".") this.out="0.";
          else if (calc.disp.substring(calc.disp.length-1)==".") this.out=this.comf(Number(this.out))+".";
          else if (calc.disp.indexOf(".")>=0) {
            if (calc.disp.substring(0,1)==".")
              this.out="0"+this.out;
            else 
              this.out=this.comf(Number(this.out.substr(0,this.out.indexOf("."))))+this.out.substr(this.out.indexOf("."));
          }else  this.out=this.comf(Number(this.out));
        }
        g.setFont("Vector",30);
        if (this.out.length>28) g.setFont("Vector",18);
        else if (this.out.length>15) g.setFont("Vector",22);
        else if (this.out.length>13) g.setFont("Vector",26);
        g.drawString(this.out,239-(g.stringWidth(this.out)),3); //calc
        g.flip();
      }
      if (this.key!=-1) {
        this.act(this.key,col("white"),col("blue"));
        if (this.tim[this.key]>=0) clearTimeout(this.tim[this.key]);
        this.tim[this.key]=setTimeout(function(k,a,t){
          a(k,col("black"),col("lgray"));
          t[k]=-1;
        },300,this.key,this.act,this.tim); 
        this.key=-1;
      }

     //loop
      this.tid=setTimeout(function(t,o){
        t.tid=-1;
        t.show(o);
      },100,this);
    },
    act:function(k,f,b){
          g.setColor(b);
          g.setFont("Vector",35);
          if (k==1 || k==2 || k==3 ){
            g.fillRect((60*k)-60,40,(60*k)-3,90);
            g.setColor(f);
            g.drawString(k,(60*k)-40,50);
          }else if  (k==4 || k==5 || k==6 ){
            g.fillRect((60*(k-3))-60,93,(60*(k-3))-3,140);
            g.setColor(f);
            g.drawString(k,(60*(k-3))-40,102);
          }else if  (k==7 || k==8 || k==9 ){
            g.fillRect((60*(k-6))-60,143,(60*(k-6))-3,190);
            g.setColor(f);
            g.drawString(k,(60*(k-6))-40,152);
          } else if  (k==0 ){
            g.fillRect(60,193,117,239);
            g.setColor(f);
            g.drawString(k,80,202);
           } else if  (k=="." ){
            g.fillRect(0,193,57,239);
            g.setColor(f);
            g.drawString(k,25,198);
          }
          g.flip();
    },
    math:function(s){
      let va=calc.val.substring(calc.val.length-1,calc.val.length);
      if (calc.disp!="") {
        if(calc.disp.substring(calc.disp.length-1)==".") {digitalPulse(D16,1,40);return;}
        if(calc.disp.substring(calc.disp.length-1)=="-") {digitalPulse(D16,1,40);return;}
        if(calc.par==1) {calc.par=-1;calc.val="("+calc.val+calc.disp+")"+s;
        }else calc.val=calc.val+calc.disp+s;
        calc.disp=""; 
        if (s=="+"||s=="-") calc.par=1;
      }else if (va=="*"||va=="+"||va=="/"||va=="-"){
        calc.val=calc.val.substring(0,calc.val.length-1)+s;
      }else if (calc.val==""){
        if (calc.sum==""&&s=='-') calc.disp=s;
        else if (calc.sum!="") calc.val=calc.sum+s;
        else {digitalPulse(D16,1,40);return;}
      }digitalPulse(D16,1,[30,50,30]);
    },
    num:function(n){
          face[0].key=n;
          calc.disp=calc.disp+n;
      digitalPulse(D16,1,[30,50,30]);
    },
    tid:-1,
    run:false,
    clear : function(o){
      g.clear();
      this.run=false;
      if (this.tid>=0) clearTimeout(this.tid);
      this.tid=-1;
      for(var key in this.tim) {
          if (this.tim[key]!=-1)
          clearTimeout(this.tim[key]);
      }
      return true;
    },
    off: function(o){
      g.off();
      this.clear(o);
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
  //history
  face[5] = {
    offms: 4000,
    init: function(){
      g.setColor(col("black")); //header
      g.fillRect(0,0,239,35); 
      g.setColor(col("lblue"));
      g.setFont("Vector",24);
    g.drawString("HISTORY",4,6); 
      this.hist=0;
      this.at=0;
      this.tot=-1;
      this.line=0;
      this.math=0;
      if (calc.hist.length>0) {	
        this.at=-1;
        this.run=true;
      } else{ 
        g.flip();
        g.setColor(col("dgray")); //header
        g.fillRect(0,36,239,239); 
        g.setColor(col("white"));
        g.setFont("Vector",24);
        g.drawString("NO ENTRIES",120-(g.stringWidth("NO ENTRIES")/2),100); 
      }  
    g.flip();
    },
    show : function(){
      if (!this.run) return;
      if (this.hist!=this.at) {
      this.at=this.hist; 
      g.setFont("Vector",26);
      g.setColor(col("black")); //header
      g.fillRect(160,0,239,35); 
      g.setColor(col("lblue"));
      g.drawString((this.hist+1)+"/"+calc.hist.length,242-(g.stringWidth((this.hist+1)+"/"+calc.hist.length)),3);
      g.flip();
      g.setColor(col("dgray")); //header
      g.fillRect(0,36,239,195); 
      g.setColor(col("white"));
      this.math=calc.hist[this.hist].substr(0,calc.hist[this.hist].indexOf('|=')).split('|');
      this.tot=calc.hist[this.hist].substr(calc.hist[this.hist].indexOf('|=')+2);
      for (var entry=this.line;entry<this.line+4&&entry<this.math.length;entry++) {
        var start=45;
        if(entry==0)g.drawString(face[0].comf(this.math[entry]),239-(g.stringWidth(face[0].comf(this.math[entry]))),start);
        else{
          g.drawString(this.math[entry].substr(0,1),5,start+((entry-this.line)*40));
          g.drawString(face[0].comf(this.math[entry].substr(1)),239-(g.stringWidth(face[0].comf(this.math[entry].substr(1)))),start+((entry-this.line)*40));
        } 
      }
      g.flip();
      g.setColor(col("dgray")); //header
      g.fillRect(0,196,239,239);
      g.setColor(col("blue"));
      g.drawLine(10,200,229,200);
      g.setFont("Vector",30);
  //    g.drawString('=',2,210);
      this.out=face[0].comf(Number(this.tot));
      if (this.out.length>28) g.setFont("Vector",18);
      else if (this.out.length>15) g.setFont("Vector",22);
      else if (this.out.length>13) g.setFont("Vector",26);
      g.drawString(this.out,120-(g.stringWidth(this.out)/2),210);
      g.flip();
  
      }
      this.tid=setTimeout(function(t,o){
        t.tid=-1;
        t.show(o);
      },100,this);
    
    },
    tid:-1,
    run:false,
    clear : function(o){
      g.clear();
      this.run=false;
      if (this.tid>=0) clearTimeout(this.tid);
      this.tid=-1;
      return true;
    },
    off: function(o){
      g.off();
      this.clear(o);
    }
  };
  //touch
  touchHandler[0]=function(e,x,y){
   //   var va;
  //short press
      if (e==5){
        if (y<35) { //back-delete last digit
        if(calc.disp!="") {
        calc.disp=calc.disp.substring(0,calc.disp.length-1);
          digitalPulse(D16,1,80);
          }  else digitalPulse(D16,1,40);		
        }else if(0<x&&x<58&&42<y&&y<91){ //1-2-3
          face[0].num(1);
        }else if(59<x&&x<118&&42<y&&y<91){
          face[0].num(2);
      digitalPulse(D16,1,[30,50,30]);
        }else if(119<x&&x<180&&42<y&&y<91){
          face[0].num(3);
        }else if(181<x&&x<239&&42<y&&y<91){ // /
          face[0].math('/');
        }else if(0<x&&x<58&&92<y&&y<141){ //4-5-6
          face[0].num(4);
        }else if(59<x&&x<118&&92<y&&y<141){
          face[0].num(5);
        }else if(119<x&&x<180&&92<y&&y<142){
          face[0].num(6);
        }else if(181<x&&x<239&&92<y&&y<141){ //*
          face[0].math('*');
        }else if(0<x&&x<58&&142<y&&y<191){ //7-8-9
          face[0].num(7);
        }else if(59<x&&x<118&&142<y&&y<191){
          face[0].num(8);
        }else if(119<x&&x<180&&142<y&&y<191){
          face[0].num(9);
        }else if(181<x&&x<239&&142<y&&y<191){ //-
          face[0].math('-');
        }else if(0<x&&x<58&&192<y&&y<239){ //.
          face[0].key=".";
          if (calc.disp.indexOf(".")>=0)
            digitalPulse(D16,1,40);
          else {
            calc.disp=calc.disp+".";
        digitalPulse(D16,1,[30,50,30]);
          }
        }else if(59<x&&x<118&&192<y&&y<239){ //0
          face[0].key=0;
      if (calc.disp!="") {
            calc.disp=calc.disp+"0";
            digitalPulse(D16,1,[30,50,30]);
          }else digitalPulse(D16,1,40);
        }else if(119<x&&x<180&&192<y&&y<239){ //=
          if (calc.val!=""&&calc.disp!="") {
            calc.tot=calc.val+calc.disp;
            calc.sum=eval(calc.tot);
            calc.hist.unshift(calc.tot.replace(/(\*)/g, '|$1').replace(/(\/)/g, '|$1').replace(/(\+)/g, '|$1').replace(/(\-)/g, '|$1').replace(/[{()}]/g, '')+"|="+calc.sum);
            if (calc.hist.length>10) calc.hist.pop();
            calc.val="";calc.tot="";calc.disp="";
        digitalPulse(D16,1,[30,50,30]);
          }  else digitalPulse(D16,1,40);
        }else if(181<x&&x<239&&192<y&&y<239){ //+
          face[0].math('+');
        } else digitalPulse(D16,1,40);
      }else if  (e==1){ //slide dn
      //face.go("calc",-1);return;
      face.go("main",0);return;
      }else if  (e==2){ //slide up
      if (y>160&&x<50) {
          if (g.bri.lv!==7) {this.bri=g.bri.lv;g.bri.set(7);}
          else g.bri.set(this.bri);
      digitalPulse(D16,1,[30,50,30]);
        }else if (y>200) {  
      face.go("settings",0);return;
        }else digitalPulse(D16,1,40);
      }else if  (e==3){ //slide left
      face.go("calc",5);return;
      }else if  (e==4){ //slide right
        face.go("settings",0);return;
      }else if  (e==12){ //long press
        //if(y<40){
          calc.val="";calc.sum="";calc.disp="";calc.tot="";
          digitalPulse(D16,1,[100,50,80]);
        //}
      }
     this.timeout();
  };
  //
  touchHandler[5]=function(e,x,y){
      if (e==5){
        if (face[5].tot!=-1){
        calc.disp=face[5].tot;
        digitalPulse(D16,1,[30,50,30]);
        face.go("calc",0);return;
        }else digitalPulse(D16,1,40);
      }else if  (e==1){
        if (face[5].line>0){
          face[5].line--;
          face[5].at=-1;
         digitalPulse(D16,1,[30,50,30]);
        }else  digitalPulse(D16,1,40);
      }else if  (e==2){
        if (y<210) {
          if (face[5].math.length){
        if (face[5].math.length-face[5].line>4){
            face[5].line++;
            face[5].at=-1;
           digitalPulse(D16,1,[30,50,30]);
        } else digitalPulse(D16,1,40);
          }else digitalPulse(D16,1,40);
        }else if (y>160&&x<50) {
          if (g.bri.lv!==7) {this.bri=g.bri.lv;g.bri.set(7);}
          else g.bri.set(this.bri);
      digitalPulse(D16,1,[30,50,30]);
        }else if (y>200) {  
      face.go("settings",0);return;
        }else digitalPulse(D16,1,40);    
      }else if  (e==3){
        if (face[5].hist<calc.hist.length-1){
          face[5].line=0;
          face[5].hist++;
          digitalPulse(D16,1,[30,50,30]);
        }else  {
      face.go("calc",0);return;
      }
      }else if  (e==4){
        if (face[5].hist>0){
          face[5].line=0;
          face[5].hist--;
          digitalPulse(D16,1,[30,50,30]);
        }else  face.go("calc",0);return;
      }else if  (e==12){
          digitalPulse(D16,1,[80,50,60]);
          face[5].hist=0;
      calc.hist=[];
      face.go("calc",0);return;
      }
     this.timeout();
  };
    