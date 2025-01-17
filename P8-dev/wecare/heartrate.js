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

function hrmtocsv(msg) {
  HRS.removeListener("hrmlog", hrmtocsv);
  print(msg.status);
  print(valdef.lastbpm[0]);
  if(msg.status=="done") {
    if(set.def.slm) {
      if(HRS.issleeptime()) {
        if(!global.sleeplog) {
          print("***start sleep log");
          global.f1 = require("Storage").open("sleep.0.csv", "w");
          global.sleeplog=true;
        }
        set.def.hrm=1;
        global.f1.write([valdef.lastbpm[1]+":"+valdef.lastbpm[2],
                         valdef.lastbpm[0],
                         parseInt(P8.movehrm),
                         P8.move10].join(",")+"\n");
        mqtt.publish("awake", P8.move10.toString());
        P8.move10=0;
      }
      else {
        if(global.sleeplog) print("***stop sleep log");
        global.sleeplog=false;
      }
    }
    if(set.def.hrm) {
      if(!global.hrmlog) {
        global.f2 = require("Storage").open("hrm.0.csv", "w");
        global.hrmlog=true;
      }
      global.f2.write([valdef.lastbpm[1]+":"+valdef.lastbpm[2],
                       valdef.lastbpm[0],
                       parseInt(P8.movehrm)].join(",")+"\n");
    }
    else global.hrmlog=false;
  }
}

var HRS = {
  writeByte:(a,d) => {
      i2c.writeTo(0x44,a,d);
  },
  readByte:(a) => {
      i2c.writeTo(0x44, a);
      return i2c.readFrom(0x44,1)[0];
  },
  run:0,
  process:0,
  logproc:0,
  issleeptime:() => {
    var tstart = valdef.sleeptime[0]*60+valdef.sleeptime[1];
    var tstop = valdef.sleeptime[2]*60+valdef.sleeptime[3];
    var tnow = Date().getHours()*60+Date().getMinutes();
    return ((tstart>tstop && (tnow>=tstart || tnow<tstop))) ||
            (tstart<tstop && (tnow>=tstart && tnow<tstop));
  },
  enable:() => {
    HRS.writeByte( 0x17, 0b00001101 ); //00001101  bits[4:2]=011,HRS gain 8
    HRS.writeByte( 0x16, 0x78 ); //01111000  bits[3:0]=1000,HRS 16bits
    HRS.writeByte( 0x01, 0xd0 ); //11010000  bit[7]=1,HRS enable;bit[6:4]=101,wait time=50ms,bit[3]=0,LED DRIVE=12.5 mA
    HRS.writeByte( 0x0c, 0x6e ); //00101110  bit[6]=0,LED DRIVE=12.5mA;bit[5]=0,sleep mode;p_pulse=1110,duty=50%
    HRS.run=1;
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
    HRS.run=0;
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
    if(HRS.logproc) {
      clearInterval(HRS.logproc);
      HRS.logproc=0;
      HRS.stop();
    }
    if(!ACCEL.process && set.def.slm && HRS.issleeptime()) ACCEL.check(80);
    if(t) {
      HRS.logproc=setInterval(()=>{
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
      if(ACCEL.process && !set.def.slm && (Date().getHours()>=valdef.sleeptime[0] || Date().getHours()<valdef.sleeptime[2])) ACCEL.check(0);
    }
    HRS.on("hrmlog",hrmtocsv);
    HRS.enable();
    if(!ACCEL.process) ACCEL.check(80); //enable accel at 12.5Hz
    P8.movehrm=0;
    HRS.bpm=[];
    var bpmtime=0;
    var beatcount=0;
    var movetime=0;
    for(let i=0;i<128;i++) correlator.put(0);
    for(let i=0;i<7;i++) avgMedFilter.filter(0);
    HRS.process=setInterval(()=>{
      var mov1 = P8.ess_stddev[P8.ess_stddev.length-1];
      var mov2 = P8.ess_stddev[P8.ess_stddev.length-2];
      var mov3 = P8.ess_stddev[P8.ess_stddev.length-3];
      if(mov1 < 6 && mov2 < 6 && mov3 < 6 && (face.pageCurr==-1 || (face.pageCurr==0 && face.appCurr=="heart"))) {
        if(!HRS.run) HRS.enable();
        var v = HRS.read();
        correlator.put(v);
        if (pulseDetector.isBeat(v)) {
          beatcount=0;
          var bpm = correlator.bpm();
          if (bpm > 0 && bpm < 200) {
            bpm = avgMedFilter.filter(bpm);
            if(bpmtime>200 && bpm > 10 && bpm < 200) { // start save after 8s
                HRS.bpm.push(bpm);
                print(bpm);
            }
            if(valdef.lastbpm[0]!=bpm && bpmtime>250) { //start report after 10s
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
        if(mov1>=6) {
          movetime++;
          bpmtime=0; // re-start measure
          if(movetime>250) {// total 10sec force stop
            HRS.emit("hrmlog",{status:"mvdt"});
            HRS.stop();
            bpmtime=0;
            movetime=0;
          }
        }
        if(HRS.run) HRS.disable();
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
          valdef.lastbpm[0]=parseInt(E.sum(HRS.bpm)/HRS.bpm.length);
          valdef.lastbpm[1]=Date().getHours();
          valdef.lastbpm[2]=Date().getMinutes();
          if(valdef.hrm.length == 12) valdef.hrm.shift();
          valdef.hrm.push(valdef.lastbpm[0]);
          set.updateSensorVal();
          HRS.emit("bpm",{bpm:valdef.lastbpm[0]});
          HRS.emit("hrmlog",{status:"done"});
          mqtt.publish("bpm", valdef.lastbpm[0].toString());
          mqtt.publish("movehrm", P8.movehrm.toString());
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
    if(ACCEL.process && !(set.def.slm && (Date().getHours()>=valdef.sleeptime[0] || Date().getHours()<valdef.sleeptime[2]))) ACCEL.check(0);
  },
};
HRS.disable();
