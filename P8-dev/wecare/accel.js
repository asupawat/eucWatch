// accel.js
var ACCEL = {
  writeByte:(a,d) => { 
      i2c.writeTo(0x18,a,d);
  }, 
  readBytes:(a,n) => {
      i2c.writeTo(0x18, a);
      return i2c.readFrom(0x18,n); 
  },
  process:0,
  init:() => {
    if (set.def.acctype==="BMA421"){
      ACCEL.writeByte(0x7E, 0xB6); //Reset
      ACCEL.writeByte(0x7D, 0x04); //Accl Enable
      ACCEL.writeByte(0x40, 0b00010111); //Acc Conf 0b00101000
      ACCEL.writeByte(0x7C, 0x03); //Sleep Enable
      setWatch(()=>{
        var data = ACCEL.readBytes(0x12,6);
        if (200<data[3]&&data[3]<220&&(data[1]<20||data[1]>=220)) {
          ACCEL.emit("faceup");
        }
      },D8,{repeat:true,edge:"rising",debounce:50});
      return 0;
    }else if (set.def.acctype==="SC7A20"){
      var id = ACCEL.readBytes(0x0F,1)[0];
      ACCEL.writeByte(0x20,0x47);
      ACCEL.writeByte(0x21,0x00); //highpass filter disabled
      ACCEL.writeByte(0x22,0x40); //interrupt to INT1
      ACCEL.writeByte(0x23,0x88); //BDU,MSB at high addr, HR
      ACCEL.writeByte(0x24,0x00); //latched interrupt off
      ACCEL.writeByte(0x32,0x10); //threshold = 250 milli g's
      ACCEL.writeByte(0x33,0x01); //duration = 1 * 20ms
      ACCEL.writeByte(0x30,0x02); //XH interrupt 
      pinMode(D8,"input",false);
      setWatch(()=>{
        if (ACCEL.read0()>192) ACCEL.emit("faceup");
      },D8,{repeat:true,edge:"rising",debounce:50});
      return id;
    }
  },
  check:(t)=>{
      if (ACCEL.process) {
        clearInterval(ACCEL.process);
        ACCEL.process=0;
      }
      if(t>=80) { // 12.5 Hz - min
        ACCEL.process=setInterval(()=>{
          ACCEL.read();
          ACCEL.emit("accel");
        },t);
      }
  },
  read0:()=>{
      return ACCEL.readBytes(0x01,1)[0];
  },
  read:()=>{
      function conv(lo,hi) { 
        var i = (hi<<8)+lo;
        return ((i & 0x7FFF) - (i & 0x8000))/16;
      }
      var read_add;
      if (set.def.acctype==="BMA421") read_addr=0x12;
      else read_addr=0xA8;
      var a = ACCEL.readBytes(read_addr,6);
      var x = conv(a[0],a[1]);
      var y = conv(a[2],a[3]);
      var z = conv(a[4],a[5]);
      var m = (x*x + y*y + z*z)/8192;
      var dx = x-P8.accx;
      var dy = y-P8.accy;
      var dz = z-P8.accz;
      var d = dx*dx + dy*dy + dz*dz;
      P8.accx = x;
      P8.accy = y;
      P8.accz = z;
      P8.accmag = m;
      P8.accdiff = d;
      return {ax:x, ay:y, az:z, mag:m, diff:d};
  },
};
