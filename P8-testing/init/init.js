
//watchdog
E.kickWatchdog();
function P8KickWd(){
  "ram";
  if(!BTN1.read())E.kickWatchdog();
}
var wdint=setInterval(P8KickWd,3000);
E.enableWatchdog(30, false);
E.showMessage=print; //apploader suport
global.save = function() { throw new Error("You don't need to use save() on P8!"); };
//load in devmode
if (BTN1.read() || Boolean(require("Storage").read("devmode"))) { 
  let mode=(require("Storage").read("devmode"));
  if ( mode=="loader"){ 
    digitalPulse(D16,1,80);
  } else {
    require("Storage").write("devmode","done");
    NRF.setAdvertising({}, { name:"Espruino-devmode",connectable:true });
    digitalPulse(D16,1,100);
	  print("Welcome!\n*** DevMode ***\nShort press the side button\nto restart in WorkingMode");
  }
  setWatch(function(){
    "ram";
    require("Storage").erase("devmode");
	  require("Storage").erase("devmode.info");
    NRF.setServices({},{uart:false});
    NRF.setServices({},{uart:true}); 
    NRF.disconnect();
    setTimeout(() => {
	    reset();
    }, 500);
  },BTN1,{repeat:false, edge:"rising"}); 
}else{ //load in working mode
  var w;
  var pal=[];
  Modules.addCached("P8",function(){

    //battery
    const battVoltage=function(s){
      let v=7.1*analogRead(D31);
      if (s) { v=(v*100-340)*1.33|0;}
      let hexString = ("0x"+(0x50000700+(D31*4)).toString(16));
      poke32(hexString,2); // disconnect pin for power saving, otherwise it draws 70uA more 
      return v;
    };

    //screen driver
    //
    // MIT License (c) 2020 fanoush https://github.com/fanoush
    // see full license text at https://choosealicense.com/licenses/mit/
    // compiled with options LCD_BPP=12,SHARED_SPIFLASH,SPIFLASH_CS=(1<<5)
    var SPI2 = (function(){
      var bin=atob("AAAAAAAAAAAAAAAAAAAAAAAAAAD///////////////8QtQNMfEQigGCAoYDjgBC92P///wdLe0QbiUOxBEoTaAAr/NAAIxNgA0p6RBOBcEcYMQJAxv///7L///8t6fBHkEYZTBlO//fl/xlK3/hkwAAjASUTYE/w/w5TYKlGI2AQMh9G/ykA6wMKwvgAoIu//zMxYMb4AOAAIYi//znM+ACQuPEADwbQKbkLS3tEHYEAIL3o8IfU+ACguvEAD/rQJ2AAKd7R8+cYMQJASDUCQDQ1AkAQMAJAUP///y3p8E+dsM3pARJWSnpEBkaS+ACQACgA8JuAACkA8JiACfH/MwcrAPKTgAEjA/oJ8wE727IEeAOTQ3hHSZeIROoDJAKbAPECC0RIHEEgIwNgByMLYNNopLLN6QYBC7FAShNgT+pJA9uyBJM/S3tEE6gFkwqrzekIME/wAAhBRgWbAp2z+AKgA5sBmiNARPoJ9DL4E8ADmyNARPoJ9DL4EyAEmx1E7bIHLULYpLJP6iwTQ1QTEgHxAg5D6gwcQxgDMarxAgojKYP4AcAf+or6APgOIAndASL/91P/2PEBCAu/CZgImEFGACG68QAPy9EfS3tEAT/biB5Ev7JzeDR4ROoDJAKbHEEG8QILpLIAL7bR2bE6Rv/3NP8VS3tE22gLsQaaE2AHmwAgGGAdsL3o8I/eRgg9HvgBO+2yxfEICwP6C/McQ6Sy80aw5//3Bf/j50/w/zDp5wC/ADUCQAgFAFAMBQBQFP///7T+//8w/v//Bv7//xlKekT4tQZGEGkPRhCzE0wTTSAjI2AHIytgEksYYNJoArEaYAAiASEwRv/37/4PS3tEAS8baSNgBN0AInkecBz/9+T+Ckt7RNtoA7EjYAAgKGD4vU/w/zD75wC/CAUAUAA1AkAMBQBQqv3//3z9//9m/f//E7UAKB7bACmmv434BRACJAEkACqkvwKpCRmN+AQApL8BNAH4BCwAK6K/AqoSGQE0IUYBqKi/AvgEPP/3p/8gRgKwEL0AJPrncLUFRoixRhgAJChGEPgBGxmxRRi1QgLZZEIgRnC9//eR/wAo+dEBNO/nBEb15wAADUsbaBC1o7kMSxtoC7EMShNgDksLSntEAAZcaRRgnGlUYNppCEtJABpgWGFZZAEgEL1P8P8w++cANQJABDMCQAgzAkAINQJAEDUCQKr8//8FSgAjE2Ci9X5yE2ADSxtoC7HC+AAycEcANQJABDMCQBC1Bkx8RMTpBQEBIQH6AvIB+gPz4mAjYRC9AL9M/P//");
      return {
        cmd:E.nativeCall(593, "int(int,int)", bin),
        cmds:E.nativeCall(781, "int(int,int)", bin),
        cmd4:E.nativeCall(709, "int(int,int,int,int)", bin),
        setpins:E.nativeCall(941, "void(int,int,int,int)", bin),
        enable:E.nativeCall(829, "int(int,int)", bin),
        disable:E.nativeCall(909, "void()", bin),
        blit_setup:E.nativeCall(33, "void(int,int,int,int)", bin),
        blt_pal:E.nativeCall(221, "int(int,int,int)", bin),
      };
    })();

    // this method would produce code string that can replace bin declaration above with heatshrink compressed variant
    // however it seems the gain is very small so is not worth it
    //    shrink:function(){return `var bin=E.toString(require("heatshrink").decompress(atob("${btoa(require("heatshrink").compress(bin))}")))`;}
    //*/
    //P8 pins
    CS=D25;DC=D18;RST=D26;BL=D14;
    SCK=D2;MOSI=D3;
    RST.reset();
    // CLK,MOSI,CS,DC
    D2.write(0);D3.write(0);CS.write(1);DC.write(1);
    SPI2.setpins(SCK,MOSI,CS,DC);
    SPI2.enable(0x80,0); //8MBit, mode 0

    function delayms(ms){
      digitalPulse(DC,0,ms); // just to wait 10ms
      digitalPulse(DC,0,0);
    }

    function toFlatString(arr){
      var b=E.toString(arr);if (b) return b;
      print("toFlatString() fail&retry!");E.defrag();b=E.toString(arr);if (b) return b;
      print("fail&retry again!");E.defrag();b=E.toString(arr);if (b) return b;
      print("failed!"); return b;
    }

    function toFlatBuffer(a){return E.toArrayBuffer(toFlatString(a));}

    function cmd(a){
      var l=a.length;
      if (!l)return SPI2.cmd4(a,-1,-1,-1);
      if (l==2)return SPI2.cmd4(a[0],a[1],-1,-1);
      if (l==3)return SPI2.cmd4(a[0],a[1],a[2],-1);
      if (l==4)return SPI2.cmd4(a[0],a[1],a[2],a[3]);
      if (l==1)return SPI2.cmd4(a[0],-1,-1,-1);
      var b=toFlatString(a);
      SPI2.cmd(E.getAddressOf(b,true),b.length);
    }

    function cmds(arr){
      var b=toFlatString(arr);
      var c=SPI2.cmds(E.getAddressOf(b,true),b.length);
      if (c<0)print('lcd_cmds: buffer mismatch, cnt='+c);
      return c;
    }

    RST.set();

    function init(){
      cmd(0x11); // sleep out
      delayms(20);

      cmd([0x36, 0]);     // MADCTL - This is an unrotated screen
      cmd([0x37,0,0]);
      cmd([0x3A, 0x03]);  // COLMOD - interface pixel format - 03 - 12bpp, 05 - 16bpp
      cmd([0xB2, 0xC, 0xC, 0, 0x33, 0x33]); // PORCTRL (B2h): Porch Setting
      cmd([0xB7, 0]);     // GCTRL (B7h): Gate Control
      cmd([0xBB, 0x3E]);  // VCOMS (BBh): VCOM Setting 
      cmd([0xC2, 1]);     // VDVVRHEN (C2h): VDV and VRH Command Enable
      cmd([0xC3, 0x19]);  // VRHS (C3h): VRH Set 
      cmd([0xC4, 0x20]);  // VDVS (C4h): VDV Set
      cmd([0xC5, 0xF]);   // VCMOFSET (C5h): VCOM Offset Set .
      cmd([0xD0, 0xA4, 0xA1]);   // PWCTRL1 (D0h): Power Control 1 
      cmd([0xe0, 0x70, 0x15, 0x20, 0x15, 0x10, 0x09, 0x48, 0x33, 0x53, 0x0B, 0x19, 0x15, 0x2a, 0x2f]);   // PVGAMCTRL (E0h): Positive Voltage Gamma Control
      cmd([0xe1, 0x70, 0x15, 0x20, 0x15, 0x10, 0x09, 0x48, 0x33, 0x53, 0x0B, 0x19, 0x15, 0x2a, 0x2f]);   // NVGAMCTRL (E1h): Negative Voltage Gamma Contro
      cmd(0x29); // DISPON (29h): Display On 
      cmd(0x21); // INVON (21h): Display Inversion On
    }

    bpp=1; // powers of two work, 3=8 colors would be nice
    var g=Graphics.createArrayBuffer(240,240,bpp);
    g.isOn=false;
    if (bpp==2) pal= Uint16Array([0x000,0xf00,0x0f0,0x00f]);
    else pal= Uint16Array([0x000,0xfff]);
    g.sc=g.setColor;
    g.setColor=function(c,v){ 
      if (c==1) pal[1]=v; else pal[0]=v;
      g.sc(c);
    };

    // preallocate setwindow command buffer for flip
    g.winCmd=toFlatBuffer([5, 0x2a, 0,0, 0,0,5, 0x2b, 0,0, 0,0,1, 0x2c,0]);
    // precompute addresses for flip
    g.winA=E.getAddressOf(g.winCmd,true);
    g.palA=E.getAddressOf(pal.buffer,true); // pallete address
    g.buffA=E.getAddressOf(g.buffer,true); // framebuffer address
    g.stride=g.getWidth()*bpp/8;

    g.flip=function(force){
      var r=g.getModified(true);
      if (force)
        r={x1:0,y1:0,x2:this.getWidth()-1,y2:this.getHeight()-1};
      if (r === undefined) return;
      var x1=r.x1&0xfe;var x2=(r.x2+2)&0xfe; // for 12bit mode align to 2 pixels
      var xw=(x2-x1);
      var yw=(r.y2-r.y1+1);
      if (xw<1||yw<1) {print("empty rect ",xw,yw);return;}
      var c=g.winCmd;
      c[3]=x1;c[5]=x2-1; //0x2a params
      c[9]=r.y1;c[11]=r.y2; // 0x2b params
      SPI2.blit_setup(xw,yw,bpp,g.stride);
      var xbits=x1*bpp;
      var bitoff=xbits%8;
      var addr=g.buffA+(xbits-bitoff)/8+r.y1*g.stride; // address of upper left corner
      SPI2.cmds(g.winA,c.length);
      SPI2.blt_pal(addr,g.palA,bitoff);
    };

    g.bri={lv:((require("Storage").readJSON("setting.json",1)||{}).bri)?(require("Storage").readJSON("setting.json",1)||{}).bri:3,
      set:function(o){	
        if (o) this.lv=o; else { this.lv++; if (this.lv>7) this.lv=1; o=this.lv; }
        digitalWrite([D23,D22,D14],7-o);
        set.def.bri=o;
        return o;
      }
    };

    g.isOn=false;
    init();

    g.on=function(){
      if (this.isOn) return;
      cmd(0x11);
      this.bri.set(this.bri.lv);
      this.isOn=true;
    };


    g.off=function(){
      if (!this.isOn) return;
      cmd(0x10);
      digitalWrite([D23,D22,D14],7);
      this.isOn=false;
    };

    module.exports = {
      battVoltage: battVoltage,
      gfx: g
    };
  });
  w=require("P8");
  //load
  require("Storage").erase("colmode16");
  eval(require('Storage').read('handler'));
  eval(require('Storage').read('main'));
  eval(require('Storage').read('mqtt.js'));

  digitalPulse(D16,1,[100,30,100]);
  setTimeout(function(){
  if (global.face) face.go('main',0);
  setTimeout(function(){ if (global.set) set.accR(); },1000);
    digitalPulse(D16,1,[100]);
  },200); 
}
