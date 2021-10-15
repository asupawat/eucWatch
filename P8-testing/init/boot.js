E.kickWatchdog();
function P8KickWd(){
	"ram";
  if(!BTN1.read())E.kickWatchdog();
}
var wdint=setInterval(P8KickWd,4000);
E.enableWatchdog(20, false);

function ST7789() {
    var LCD_WIDTH = 240;
    var LCD_HEIGHT = 240;
    var XOFF = 0;
    var YOFF = 0;
    var INVERSE = 1;

    function dispinit(spi, dc, ce, rst,fn) {
        function cmd(c,d) {
            dc.reset();
            spi.write(c, ce);
            if (d!==undefined) {
                dc.set();
                spi.write(d, ce);
            }
        }

        if (rst) {
            digitalPulse(rst,0,10);
        } else {
            cmd(0x01); //ST7735_SWRESET: Software reset, 0 args, w/delay: 150 ms delay
        }
        setTimeout(function() {
        cmd(0x11); //SLPOUT
        setTimeout(function() {
            //MADCTL: Set Memory access control (directions), 1 arg: row addr/col addr, bottom to top refresh
            cmd(0x36, 0xC8);
            //COLMOD: Set color mode, 1 arg, no delay: 16-bit color
            cmd(0x3a, 0x05);
            //PORCTRL: Porch control
            cmd(0xb2, [0x0c, 0x0c, 0x00, 0x33, 0x33]);
            //GCTRL: Gate control
            cmd(0xb7, 0x00);
            // VCOMS: VCOMS setting
            cmd(0xbb, 0x3e);
            //LCMCTRL: CM control
            cmd(0xc0, 0xc0);
            //VDVVRHEN: VDV and VRH command enable
            cmd(0xc2, 0x01);
            // VRHS: VRH Set
            cmd(0xc3, 0x19);
            // VDVS: VDV Set
            cmd(0xc4, 0x20);
            //VCMOFSET: VCOM Offset Set .
            cmd(0xC5, 0xF);
            //PWCTRL1: Power Control 1
            cmd(0xD0, [0xA4, 0xA1]);
            // PVGAMCTRL: Positive Voltage Gamma Control
            //cmd(0xe0, [0x70, 0x15, 0x20, 0x15, 0x10, 0x09, 0x48, 0x33, 0x53, 0x0B, 0x19, 0x15, 0x2a, 0x2f]);
            cmd(0xe0, [208, 4, 13, 17, 19, 43, 63, 84, 76, 24, 13, 11, 31, 35]);
            // NVGAMCTRL: Negative Voltage Gamma Contro
            //cmd(0xe1, [0x70, 0x15, 0x20, 0x15, 0x10, 0x09, 0x48, 0x33, 0x53, 0x0B, 0x19, 0x15, 0x2a, 0x2f]);
            cmd(0xe1, [208, 4, 12, 17, 19, 44, 63, 68, 81, 47, 31, 31, 32, 35]);
            if (INVERSE) {
                //TFT_INVONN: Invert display, no args, no delay
                cmd(0x21);
            } else {
                //TFT_INVOFF: Don't invert display, no args, no delay
                cmd(0x20);
            }
            //TFT_NORON: Set Normal display on, no args, w/delay: 10 ms delay
            cmd(0x13);
            //TFT_DISPON: Set Main screen turn on, no args w/delay: 100 ms delay
            cmd(0x29);
            if (fn) fn();
          }, 50);
          }, 120);
          return cmd;
    }


    function connect(options , callback) {
        var spi=options.spi, dc=options.dc, ce=options.cs, rst=options.rst;
        var g = lcd_spi_unbuf.connect(options.spi, {
            dc: options.dc,
            cs: options.cs,
            height: LCD_HEIGHT,
            width: LCD_WIDTH,
            colstart: XOFF,
            rowstart: YOFF
        });
        g.lcd_sleep = function(){dc.reset(); spi.write(0x10,ce);};
        g.lcd_wake = function(){dc.reset(); spi.write(0x11,ce);};
        return g;
    }

    //var spi = new SPI();
    SPI1.setup({sck:D2, mosi:D3, baud: 8000000});

    return connect({spi:SPI1, dc:D18, cs:D25, rst:D26});
}

//screen brightness function
function brightness(v) {
    v=v>7?1:v;	
	digitalWrite([D23,D22,D14],7-v);
}

var g = ST7789();
brightness(4);

// graph module
Modules.addCached("graph",function(){exports.drawAxes=function(b,c,a){function h(m){return e+n*(m-u)/z}function l(m){return f+g-g*(m-p)/v}var k=a.padx||0,d=a.pady||0,u=-k,y=c.length+k-1,p=(void 0!==a.miny?a.miny:a.miny=c.reduce((m,w)=>Math.min(m,w),c[0]))-d;c=(void 0!==a.maxy?a.maxy:a.maxy=c.reduce((m,w)=>Math.max(m,w),c[0]))+d;a.gridy&&(d=a.gridy,p=d*Math.floor(p/d),c=d*Math.ceil(c/d));var e=a.x||0,f=a.y||0,n=a.width||b.getWidth()-(e+1),g=a.height||b.getHeight()-(f+1);a.axes&&(null!==a.ylabel&&(e+=6,n-=6),null!==
a.xlabel&&(g-=6));a.title&&(f+=6,g-=6);a.axes&&(b.drawLine(e,f,e,f+g),b.drawLine(e,f+g,e+n,f+g));a.title&&(b.setFontAlign(0,-1),b.drawString(a.title,e+n/2,f-6));var z=y-u,v=c-p;v||(v=1);if(a.gridx){b.setFontAlign(0,-1,0);var x=a.gridx;for(d=Math.ceil((u+k)/x)*x;d<=y-k;d+=x){var t=h(d),q=a.xlabel?a.xlabel(d):d;b.setPixel(t,f+g-1);var r=b.stringWidth(q)/2;null!==a.xlabel&&t>r&&b.getWidth()>t+r&&b.drawString(q,t,f+g+2)}}if(a.gridy)for(b.setFontAlign(0,0,1),d=p;d<=c;d+=a.gridy)k=l(d),q=a.ylabel?a.ylabel(d):
d,b.setPixel(e+1,k),r=b.stringWidth(q)/2,null!==a.ylabel&&k>r&&b.getHeight()>k+r&&b.drawString(q,e-5,k+1);b.setFontAlign(-1,-1,0);return{x:e,y:f,w:n,h:g,getx:h,gety:l}};exports.drawLine=function(b,c,a){a=a||{};a=exports.drawAxes(b,c,a);var h=!0,l;for(l in c)h?b.moveTo(a.getx(l),a.gety(c[l])):b.lineTo(a.getx(l),a.gety(c[l])),h=!1;return a};exports.drawBar=function(b,c,a){a=a||{};a.padx=1;a=exports.drawAxes(b,c,a);for(var h in c)b.fillRect(a.getx(h-.5)+1,a.gety(c[h]),a.getx(h+.5)-1,a.gety(0));return a}});

var data = [1,3,8,10,12,10,8,3,1];
g.clear();
g.setColor(0x0F0);
require("graph").drawBar(g, data, {
  miny: 0,
  axes : true,
  gridx : 1,
  gridy : 5
});
