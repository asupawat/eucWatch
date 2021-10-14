// heartrate.js
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

function StandardDeviation (array) {
  const n = array.length;
  const mean = E.sum(array) / n; //array.reduce((a, b) => a + b) / n;
  //return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
  return Math.sqrt(E.variance(array, mean));
}

var f1 = require("Storage").open("sleep.0.csv", "w");
var f2 = require("Storage").open("hrm.0.csv", "w");

function hrmtocsv(msg) {
  HRS.removeListener("hrmlog", hrmtocsv);
  print(msg.status);
  print(valdef.lastbpm[0]);
  if(msg.status=="done") {
    if(set.def.slm && (Date().getHours()>=valdef.sleeptime[0] || Date().getHours()<valdef.sleeptime[2])) {
      set.def.hrm=1;
      if(acc.movehrm==0) {
        mqtt.publish("awake", acc.move10);
      }
      f1.write([valdef.lastbpm[1]+":"+valdef.lastbpm[2],valdef.lastbpm[0],acc.movehrm.toFixed(0),acc.move10].join(",")+"\n");
      acc.move10=0;
    }
    if(set.def.hrm) {
      f2.write([valdef.lastbpm[1]+":"+valdef.lastbpm[2],valdef.lastbpm[0],acc.movehrm.toFixed(0)].join(",")+"\n");
    }
  }
}

var HRS = {
  process:0,
  writeByte:(a,d) => {
      i2c.writeTo(0x44,a,d);
  },
  readByte:(a) => {
      i2c.writeTo(0x44, a);
      return i2c.readFrom(0x44,1)[0];
  },
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
  log:(t)=>{
    //if(t>0) t=1; //******remove*******/
    if(this.hrmlog && !set.def.slm && !set.def.hrm) {
      clearInterval(this.hrmlog);
      this.hrmlog=0;
      HRS.stop();
      print("***stop hrm log");
    }
    if(!acc.process && set.def.slm) acc.check(80);
    if(t) {
      print("***start hrm log");
      this.hrmlog=setInterval(()=>{
        if(!HRS.process) HRS.start(30);
      },(t*60*1000)); // t minute
    }
  },
  bpm:[],
  start:(t)=>{
    print("start hrm "+t+"s");
    if (HRS.process) {
      clearInterval(HRS.process);
      HRS.process=0;
      HRS.disable();
      if(acc.process && !set.def.slm && (Date().getHours()>=valdef.sleeptime[0] || Date().getHours()<valdef.sleeptime[2])) acc.check(0);
    }
    HRS.on("hrmlog",hrmtocsv);
    HRS.enable();
    if(!acc.process) acc.check(80); //enable accel at 12.5Hz
    acc.movehrm=0;
    HRS.bpm=[];
    var bpmtime=0;
    var beatcount=0;
    var movetime=0;
    HRS.process=setInterval(()=>{
      var mov1 = acc.ess_stddev[acc.ess_stddev.length-1];
      var mov2 = acc.ess_stddev[acc.ess_stddev.length-2];
      var mov3 = acc.ess_stddev[acc.ess_stddev.length-3];
      var v;
      if(mov1<6) {
        v = HRS.read();
        correlator.put(v);
      }
      if(mov1 < 6 && mov2 < 6 && mov3 < 6) {
        if (pulseDetector.isBeat(v)) {
          beatcount=0;
          var bpm = correlator.bpm();
          if (bpm > 0 && bpm < 200) {
            HRS.bpm.push(bpm);
            if(bpmtime>128) bpm = avgMedFilter.filter(bpm);
            if(valdef.lastbpm[0]!=bpm && bpmtime>256) { //start report ~10s
              valdef.lastbpm[0]=bpm;
              HRS.emit("bpm",{bpm:bpm});
            }
          }
        } else {
          beatcount++;
          if(beatcount>150) {
            HRS.emit("hrmlog",{status:"nodt"});
            HRS.stop();
            bpmtime=0;
            movetime=0;
          }
        }
        bpmtime++;
        HRS.emit("hrm-raw",{raw:v});
      }
      else {
        movetime++;
        if(movetime>500) {// 20sec
          HRS.emit("hrmlog",{status:"mvdt"});
          HRS.stop();
          bpmtime=0;
          movetime=0;
        }
      }
      // stop in 30sec 25in40ms=1000ms 30sec=25*30=750
      if(bpmtime>=(25*t)) {
        HRS.stop();
        //print(HRS.bpm.length);
        HRS.bpm=HRS.bpm.sort();
        var std;
        for(let i=0;i<3;i++) {
          HRS.bpm=HRS.bpm.slice(5,HRS.bpm.length-5);
          std=StandardDeviation(HRS.bpm);
          //print(HRS.bpm);
          //print(std);
          if(std<12) i=3;
        }
        if(std<12 && HRS.bpm.length>=10) {
          valdef.lastbpm[0]=(E.sum(HRS.bpm)/HRS.bpm.length).toFixed(0);
          valdef.lastbpm[1]=Date().getHours();
          valdef.lastbpm[2]=Date().getMinutes();
          if(valdef.hrm.length == 12) valdef.hrm.shift();
          valdef.hrm.push(valdef.lastbpm[0]);
          set.updateSensorVal();
          HRS.emit("bpm",{bpm:valdef.lastbpm[0]});
          HRS.emit("hrmlog",{status:"done"});
          mqtt.publish("bpm", valdef.lastbpm[0]);
        }
        else {
          HRS.emit("hrmlog",{status:"nstd"});
        }
        bpmtime=0;
        movetime=0;
      }
    },40);
  },
  stop:()=>{
    if (HRS.process) {
      clearInterval(HRS.process);
      HRS.process=0;
      HRS.disable();
    }
    if(acc.process && !set.def.slm && (Date().getHours()>=valdef.sleeptime[0] || Date().getHours()<valdef.sleeptime[2])) acc.check(0);
  },
};
HRS.disable();
