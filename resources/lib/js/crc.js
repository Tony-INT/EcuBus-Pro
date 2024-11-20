(()=>{"use strict";var e={d:(t,i)=>{for(var s in i)e.o(i,s)&&!e.o(t,s)&&Object.defineProperty(t,s,{enumerable:!0,get:i[s]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};e.r(t),e.d(t,{CRC:()=>s});const i=class{static Reflect8(e){for(var t=0,i=0;i<8;i++)e&1<<i&&(t|=1<<7-i&255);return t}static Reflect16(e){for(var t=0,i=0;i<16;i++)e&1<<i&&(t|=1<<15-i&65535);return t}static Reflect32(e){for(var t=0,i=0;i<32;i++)e&1<<i&&(t|=1<<31-i&4294967295);return t}static ReflectGeneric(e,t){for(var i=0,s=0;s<t;s++)e&1<<s&&(i|=1<<t-1-s);return i}};class s{_width;_name;_polynomial;_initialVal;_finalXorVal;_inputReflected;_resultReflected;static _list;_crcTable;_castMask;_msbMask;get width(){return this._width}set width(e){switch(this._width=e,e){case 8:this._castMask=255;break;case 16:this._castMask=65535;break;case 32:this._castMask=4294967295;break;default:throw"Invalid CRC width"}this._msbMask=1<<e-1}get name(){return this._name}set name(e){this._name=e}get polynomial(){return this._polynomial}set polynomial(e){this._polynomial=e}get initial(){return this._initialVal}set initial(e){this._initialVal=e}get finalXor(){return this._finalXorVal}set finalXor(e){this._finalXorVal=e}get inputReflected(){return this._inputReflected}set inputReflected(e){this._inputReflected=e}get resultReflected(){return this._resultReflected}set resultReflected(e){this._resultReflected=e}constructor(e,t,i,s,r,a,n){this.width=t,this.name=e,this.polynomial=i,this.initial=s,this.finalXor=r,this.inputReflected=a,this.resultReflected=n}static get defaults(){return this._list||(this._list=[new s("CRC8",8,7,0,0,!1,!1),new s("CRC8_SAE_J1850",8,29,255,255,!1,!1),new s("CRC8_SAE_J1850_ZERO",8,29,0,0,!1,!1),new s("CRC8_8H2F",8,47,255,255,!1,!1),new s("CRC8_CDMA2000",8,155,255,0,!1,!1),new s("CRC8_DARC",8,57,0,0,!0,!0),new s("CRC8_DVB_S2",8,213,0,0,!1,!1),new s("CRC8_EBU",8,29,255,0,!0,!0),new s("CRC8_ICODE",8,29,253,0,!1,!1),new s("CRC8_ITU",8,7,0,85,!1,!1),new s("CRC8_MAXIM",8,49,0,0,!0,!0),new s("CRC8_ROHC",8,7,255,0,!0,!0),new s("CRC8_WCDMA",8,155,0,0,!0,!0),new s("CRC16_CCIT_ZERO",16,4129,0,0,!1,!1),new s("CRC16_ARC",16,32773,0,0,!0,!0),new s("CRC16_AUG_CCITT",16,4129,7439,0,!1,!1),new s("CRC16_BUYPASS",16,32773,0,0,!1,!1),new s("CRC16_CCITT_FALSE",16,4129,65535,0,!1,!1),new s("CRC16_CDMA2000",16,51303,65535,0,!1,!1),new s("CRC16_DDS_110",16,32773,32781,0,!1,!1),new s("CRC16_DECT_R",16,1417,0,1,!1,!1),new s("CRC16_DECT_X",16,1417,0,0,!1,!1),new s("CRC16_DNP",16,15717,0,65535,!0,!0),new s("CRC16_EN_13757",16,15717,0,65535,!1,!1),new s("CRC16_GENIBUS",16,4129,65535,65535,!1,!1),new s("CRC16_MAXIM",16,32773,0,65535,!0,!0),new s("CRC16_MCRF4XX",16,4129,65535,0,!0,!0),new s("CRC16_RIELLO",16,4129,45738,0,!0,!0),new s("CRC16_T10_DIF",16,35767,0,0,!1,!1),new s("CRC16_TELEDISK",16,41111,0,0,!1,!1),new s("CRC16_TMS37157",16,4129,35308,0,!0,!0),new s("CRC16_USB",16,32773,65535,65535,!0,!0),new s("CRC16_A",16,4129,50886,0,!0,!0),new s("CRC16_KERMIT",16,4129,0,0,!0,!0),new s("CRC16_MODBUS",16,32773,65535,0,!0,!0),new s("CRC16_X_25",16,4129,65535,65535,!0,!0),new s("CRC16_XMODEM",16,4129,0,0,!1,!1),new s("CRC32",32,79764919,4294967295,4294967295,!0,!0),new s("CRC32_BZIP2",32,79764919,4294967295,4294967295,!1,!1),new s("CRC32_C",32,517762881,4294967295,4294967295,!0,!0),new s("CRC32_D",32,2821953579,4294967295,4294967295,!0,!0),new s("CRC32_MPEG2",32,79764919,4294967295,0,!1,!1),new s("CRC32_POSIX",32,79764919,0,4294967295,!1,!1),new s("CRC32_Q",32,2168537515,0,0,!1,!1),new s("CRC32_JAMCRC",32,79764919,4294967295,0,!0,!0),new s("CRC32_XFER",32,175,0,0,!1,!1)]),this._list}makeCrcTable(){this._crcTable=new Array(256);for(var e=0;e<256;e++){for(var t=e<<this._width-8&this._castMask,i=0;i<8;i++)t&this._msbMask?(t<<=1,t^=this._polynomial):t<<=1;this._crcTable[e]=t&this._castMask}}makeCrcTableReversed(){this._crcTable=new Array(256);for(var e=0;e<256;e++){for(var t=i.Reflect8(e)<<this._width-8&this._castMask,s=0;s<8;s++)t&this._msbMask?(t<<=1,t^=this._polynomial):t<<=1;t=i.ReflectGeneric(t,this.width),this._crcTable[e]=t&this._castMask}}compute(e){this._crcTable||this.makeCrcTable();for(var t=this._initialVal,s=0;s<e.length;s++){var r=255&e[s];this.inputReflected&&(r=i.Reflect8(r));var a=(t=(t^r<<this._width-8)&this._castMask)>>this.width-8&255;t=((t=t<<8&this._castMask)^this._crcTable[a])&this._castMask}return this.resultReflected&&(t=i.ReflectGeneric(t,this.width)),(t^this._finalXorVal)&this._castMask}computeBuffer(e){let t=this.compute(e);if(8===this.width)return Buffer.from([t]);if(16===this.width){let e=Buffer.alloc(2);return e.writeUInt16BE(t,0),e}if(32===this.width){let e=Buffer.alloc(4);return e.writeUInt32BE(t,0),e}throw new Error("Unsupported length")}get table(){return this._crcTable}static default(e){return s.defaults.find((t=>t.name===e))}}var r=exports;for(var a in t)r[a]=t[a];t.__esModule&&Object.defineProperty(r,"__esModule",{value:!0})})();