(function(){
var toArray = function(a,i,j){
		return Array.prototype.slice.call(a, i || 0, j || a.length);
	}
Function.prototype.methodize = function(start) {
	var method = this ,_start = Number(start||0);
	return function() {
		return method.apply(this, new Array(_start).concat(toArray(arguments))) ;
	};
}

var DOC=document,
	gradientIndex = 0,
    SVG_NS = 'http://www.w3.org/2000/svg',
    VML_NS = 'urn:schemas-microsoft-com:vml',
    XLINK_NS = 'http://www.w3.org/1999/xlink',
    NONE = 'none',
	hasSVG = !Ext.isIE9 && !!DOC.createElementNS && !!DOC.createElementNS(SVG_NS, "svg").createSVGRect,
	fill = "<v:fill color='{fillColor}' opacity='{fillOpacity}' angle='{angle}' colors='{colors}' type='{type}'></v:fill>",
	stroke = "<v:stroke startarrow='{startArrow}' endarrow='{endArrow}' color='{strokeColor}' joinstyle='miter' weight='{strokeWidth}px' opacity='{strokeOpacity}'></v:stroke>",
    shadow = "<v:shadow on='t' opacity='0.5' offset='0px,3px'></v:shadow>",
    pathReg = /\w|[\s\d-+.,e]*/g,
    numberReg = /[\d-+.e]+/g,
    mathCos = Math.cos,
    mathSin = Math.sin,
    mathPI = Math.PI,
    pInt = parseInt,
    angle2Raduis = mathPI / 180,
    screenWidth,screenHeight,
    capitalize = function(w){
    	return (w = w.trim()).toLowerCase().replace(/^./,w.charAt(0).toUpperCase());
    },
    newSVG = function(tag,id){
    	var e = DOC.createElementNS(SVG_NS, tag);
    	if(!Ext.isEmpty(id)) e.id = id;
    	return Ext.get(e);
    },
    newVML = function(vml,id){
    	var e = DOC.createElement(vml);
    	if(!Ext.isEmpty(id)) e.id = id;
    	return Ext.get(e);
    },
    isSVG = function(el){
    	if(hasSVG){
	    	el = el.dom||el;
	    	return el.namespaceURI == SVG_NS;
    	}
    	return false;
    },
    isVML = function(el){
    	if(!hasSVG){
	    	el = el.dom||el;
	    	return !!el.tagUrn && el.tagUrn == VML_NS;
    	}
    	return false;
    },
    encodeStyle = function(prop,value){
    	var tmp,style,css=[];
        if (!Ext.isObject(prop)) {
            tmp = {};
            tmp[prop] = value;
            prop = tmp;
        }
        for (style in prop) {
            value = prop[style];
            css.push(style);
            css.push(':');
            css.push(value);
            css.push(';');
        }
        return css.join('');
    },
    Color = function (input) {
		var rgba = [], result , isGradient = false,type,linear,stops;
		function init(input) {
			if(!input){
				rgba = [0,0,0,1];
			}else if(input == 'transparent'){
				rgba = [0,0,0,0];
			}else if(input == NONE){
				rgba = NONE;
			}else{
				//gradirent
				if(/gradient/i.test(input)){
					isGradient = true;
					var argString = /^gradient\((.*)\)$/.exec(input)[1],
						beforeStop = /^([^stop]*),[^,]*stop/.exec(argString)[1];
					type = /^[^,]*/.exec(beforeStop)[0];
					linear = beforeStop.match(/[-\d%]+/g);
					stops = function(arg){
						var arr = [];
						Ext.each(arg,function(item){
							var stop = /\(([^\)]*\))\)$/.exec(item)[1],
								reg = /^([^,]*),(.*)$/.exec(stop);
							arr.push([reg[1],reg[2]]);
						})
						return arr;
					}(argString.match(/stop\([^\)]*\)\)/mg));
				}else{
					// rgba
					result = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/.exec(input);
					if (result) {
						rgba = [pInt(result[1]), pInt(result[2]), pInt(result[3]), parseFloat(result[4], 10)];
					} else { // hex
						result = /^#([a-fA-F0-9]{1,2})([a-fA-F0-9]{1,2})([a-fA-F0-9]{1,2})$/.exec(input);
						if (result) {
							rgba = [pInt(plus(result[1]), 16), pInt(plus(result[2]), 16), pInt(plus(result[3]), 16), 1];
						}
					}
				}
			}
		}
		function plus(v){
			return v.length == 1? v+v:v;
		}
		function get(format) {
			var ret = 1;
			if(isGradient){
				if(format === 'gradient'){
					ret = {
						isGradient : isGradient,
						type : type,
						linear : linear,
						stops : stops
					}
				}else{
					ret = '';
				}
			}else if(format === 'a'){
				if(!isNaN(rgba[3])){
					ret = rgba[3];
				}
			}else if (rgba && !isNaN(rgba[0])) {
				if(format === 'hex'){
					ret = '#'+ plus(Number(rgba[0]).toString(16))+plus(Number(rgba[1]).toString(16))+plus(Number(rgba[2]).toString(16));
				}else if (format === 'rgb') {
					ret = 'rgb(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ')';
				} else {
					ret = 'rgba(' + rgba.join(',') + ')';
				}
			}else if(rgba == NONE){
				ret = rgba;
			}else {
				ret = input;
			}
			return ret;
		}
		function brighten(alpha) {
			if (rgba != NONE && isNumber(alpha) && alpha !== 0) {
				var i;
				for (i = 0; i < 3; i++) {
					rgba[i] += pInt(alpha * 255);
	
					if (rgba[i] < 0) {
						rgba[i] = 0;
					}
					if (rgba[i] > 255) {
						rgba[i] = 255;
					}
				}
			}
			return this;
		}
		
		function setOpacity(alpha) {
			if(input == 'transparent' || rgba == NONE || Ext.isEmpty(alpha))return this;
			rgba[3] = alpha;
			return this;
		}
	
		init(input);
	
		return {
			get: get,
			brighten: brighten,
			setOpacity: setOpacity
		};
	},
	measureText = function(text,fontSize){
		var textEl = new Ext.Template('<span style="font-size:{fontSize}">{text}</span>').append(document.body,{fontSize:fontSize,text:text},true),
			textWidth = textEl.getWidth();
		textEl.remove();
		return textWidth;
	},
//    convertColor = function(color){
//    	if(color && color.search(/rgb/i)!=-1){
//    		var c ="#";
//    		color.replace(/\d+/g,function(item){
//    			var n = Number(item).toString(16);
//    			c += (n.length == 1?"0":"") +n;
//    		})
//    		return c;
//    	}
//    	return color;
//    },
    convertPath = function(){
    	var cache = {};
    	return function(p,zoom){
	    	if(cache[p])return cache[p];
	    	zoom = zoom || 10000;
	    	var arr=p.match(pathReg),p1=[0,0],p2=[0,0],path=[],
	    	f1=function(s,isC){
	    		var arr=Ext.isArray(s)?s:s.match(numberReg);
	    		for(var i=0;i<arr.length;i++){
	    			if(!isC||i/2%3==2){
	    				p2[0]+=f4(arr[i]);
	    				p2[1]+=f4(arr[++i]);
	    				path=path.concat(p2);
	    			}else{
	    				path=path.concat([p2[0]+f4(arr[i]),p2[1]+f4(arr[++i])]);
	    			}
	    		}
	    	},
	    	f2=function(s,re){
	    		var arr=s.match(numberReg);
	    		while(arr.length&&arr.length%7==0){
		    		var	rx=f4(arr.shift()),//圆心x
		    			ry=f4(arr.shift()),//圆心y
		    			rr=Number(arr.shift()),//
		    			la=Number(arr.shift()),//是否是大角度弧线
		    			sw=Number(arr.shift()),//是否是顺时针
		    			x=f4(arr.shift()),//end x
		    			y=f4(arr.shift()),//end y
		    			l,t,r,b;
		    		if(re){
		    			x+=p2[0];
		    			y+=p2[1];
		    		}
		    		var dx=Math.abs(x-p2[0]),dy=Math.abs(y-p2[1]);
		    		rx=dx;ry=dy;
		    		path.push(sw?'wa':'at');
		    		if((sw^la)^x<p2[0]){
						if(y<p2[1]){
							l=p2[0];
							t=p2[1]-ry;
						}else{
							l=p2[0]-rx;
							t=p2[1];
						}
		    		}else{
		    			if(y<p2[1]){
							l=p2[0]-rx;
							t=p2[1]-(ry<<1);
						}else{
							l=p2[0]-(rx<<1);
							t=p2[1]-ry;
						}
		    		}
		    		r=l+(rx<<1);
					b=t+(ry<<1);
		    		path.push(l,t,r,b,p2[0],p2[1],x,y);
		    		p2=[x,y];
	    		}
	    	},
	    	f3=function(s){
	    		var a=s.match(numberReg).slice(-2);
	    		return [f4(a[0]),f4(a[1])];
	    	},
	    	f4=function(n){
	    		return Number(Number(n*zoom).toFixed(0));
	    	},
	    	f5=function(s){
	    		for(var i=0,a=s.match(numberReg);i<a.length;i++){
	    			path.push(f4(a[i]))
	    		}
	    	}
	    	for(var i=0;i<arr.length;i++){
	    		switch(arr[i]){
	    			case 'M': p1=f3(arr[i+1]);
	    			case 'C':
	    			case 'L': p2=f3(arr[i+1]);path.push(arr[i]);f5(arr[++i]);break;
	    			case 'm': path.push('M');f1(arr[++i]);p1=[].concat(p2);break;
	    			case 'c': path.push('C');f1(arr[++i],true);break;
	    			case 'l': path.push('L');f1(arr[++i]);break;
	    			case 'h': path.push('L');f1(arr[++i]+" 0");break;
	    			case 'v': path.push('L');f1("0 "+arr[++i]);break;
	    			case 'H': path.push('L');p2[0]=f4(arr[++i]);path.push(p2[0],p2[1]);break;
	    			case 'V': path.push('L');p2[1]=f4(arr[++i]);path.push(p2[0],p2[1]);break;
	    			case 'A': f2(arr[++i]);break;
	    			case 'a': f2(arr[++i],true);break;
	    			case 'Z': 
	    			case 'z': path.push('X');p2=[].concat(p1);break;
	    		}
	    	}
	    	path.push('E');
	    	cache[p] = path.join(' ');
	    	return cache[p];
	    }
	}(),
    convertConfig = function(record){
    	var config = Ext.util.JSON.decode('{'+(record.get('config')||'').replace(/^{|}$/g,'')+'}');
    	for(var c in config){
    		var lc = String(c).toLowerCase();
    	    if(lc !==c){
	    		config[lc] = config[c];
	    		delete config[c];
    		}
    	}
    	return config;
    },
    transform = hasSVG?function(){
    	var dom,values=Ext.toArray(arguments);
    	if(values.length&&Ext.isObject(values[0])){
    		var el = values.shift();
    		dom = el.dom || el;
    	}else{
	    	dom = (this.el || this.wrap).dom;
    	}
    	var _transform = dom.getAttribute('transform');
    	if(!_transform)_transform = 'translate(0,0) scale(1,1) rotate(0,0 0)';
    	var t = _transform.split('rotate');
    	dom.setAttribute('transform',(t[0].replace(/\(([-.\d]+)\)/g,'($1,$1)')+'rotate'+t[1].replace(/\(([-.\d]+)\)/,'($1,0 0)')).replace(/[-.\d]+/g,function($0){var v=values.shift();return Ext.isEmpty(v)?$0:v}))
    }:function(){
    	var dom,values=Ext.toArray(arguments),options={};
    	if(values.length&&Ext.isObject(values[0])){
    		var el = values.shift();
    		dom = Ext.get(el);
    	}else{
	    	dom = this.el || this.wrap
    	}
    	if(!Ext.isEmpty(values[0])) dom.setStyle('left',values[0] + 'px');
    	if(!Ext.isEmpty(values[1])) dom.setStyle('top',values[1] + 'px');
    	if(!Ext.isEmpty(values[2]) && !Ext.isEmpty(values[3])){
	    	dom.dom.coordsize.value= 100 / values[2]+',' +  100 / values[3];
    	}
    	if(!Ext.isEmpty(values[4])){
    		var xy = dom.getXY(),
    			x = pInt(dom.getStyle('left')||0),
    			y = pInt(dom.getStyle('top')||0),
    			width = dom.getWidth(),
    			height = dom.getHeight(),
    			rotation = values[4],
    			radians = rotation * angle2Raduis, 
				cosA = mathCos(radians),
				sinA = mathSin(radians),
				costheta = mathCos(-radians),
				sintheta = mathSin(-radians),
				costhetb = mathCos(-radians - mathPI/2),
				sinthetb = mathSin(-radians - mathPI/2),
    			dx = dom.dx||x,
    			dy = dom.dy||y,
    			dist = Math.sqrt(dx*dx + dy*dy),
    			angle =  Math.atan(-dy/dx) - radians,
    			x = x -dx + dist * mathCos(angle),
    			y = y -dy - dist * mathSin(angle),
				left,top;
				if(sintheta >= 0){
					if(costheta >= 0){
						left = x;
						top = y - width * sintheta;
					}else{
						left = x + height * costhetb;
						top = y - width * sintheta;
					}
				}else{
					if(costheta >= 0){
						left = x + height * costhetb;
						top = y;
					}else{
						left = x + width * costheta;
						top = y - height * sinthetb;
					}	
				}
    		if(dom.dom.tagName == 'SPAN'){
				dom.setStyle({
					filter: !Ext.isEmpty(rotation) ? ['progid:DXImageTransform.Microsoft.Matrix(M11=', cosA,
						', M12=', -sinA, ', M13=100', ', M21=', sinA, ', M22=', cosA,
						', sizingMethod=\'auto expand\')'].join('') : NONE,
						left : left  + 'px',
						top : top + 'px'
				});
    		}else{
	    		dom.setStyle({
	    			rotation:rotation
	    		})
    		}
    	}
    },
    setTopCmp = function(){
    	var z = 1,el;
    	return function(cmp){
    		cmp = Ext.get(cmp);
    		if(el!=cmp){
				el = cmp;
				if(isSVG(el))
					el.parent().appendChild(el);
				else
					el.setStyle('z-index',z++);
    		}
		}
    }();

/**
 * @class Aurora.Graphics
 * @extends Aurora.Component
 * 图形基础组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Graphics=Ext.extend($A.Component,{
	constructor: function(config) {
		this.root = config.root;
		this.top = config.top||this;
		this.cmps = [];
		$A.Graphics.superclass.constructor.call(this,config);
		return this;
	},
	initComponent : function(config){ 
		$A.Graphics.superclass.initComponent.call(this,config);
		if(!this.wrap)this['init'+(hasSVG?'SVG':'VML')+'Wrap']();
		this['init'+(hasSVG?'SVG':'VML')+'Element']();
    },
    initEvents : function(){
    	$A.Graphics.superclass.initEvents.call(this);
    	this.addEvents(
	    	/**
	         * @event click
	         * 单击事件.
	         * @param {Aurora.Graphics} obj 图形对象.
	         * @param {Aurora.DataSet} dataset 数据集对象.
	         * @param {Aurora.Record} record 数据行对象.
	         */
    		'click',
    		'drop',
    		'move',
    		'drawn'
    	)
    },
	processListener: function(ou){
		$A.Graphics.superclass.processListener.call(this,ou);
		this.wrap[ou]('click',this.onClick,this,{preventDefault:true});
		this.wrap[ou]('mouseover',this.onMouseOver,this,{preventDefault:true});
		this.wrap[ou]('mouseout',this.onMouseOut,this,{preventDefault:true});
		this.wrap[ou]('mousedown',this.onMouseDown,this);
    },
    processDataSetLiestener:function(ou){
    	ds = this.dataset;
    	if(ds){
	    	ds[ou]('load', this.onLoad, this);
	    	ds[ou]('update', this.onUpdate, this);
	    	ds[ou]('add', this.onAdd, this);
	    	ds[ou]('remove', this.onRemove, this);
	    	ds[ou]('indexchange', this.onIndexChange, this);
    	}
    },
    initSVGElement : function(){
    	var svg = newSVG("svg");
    	svg.setStyle({'height':'100%','width':'100%'});//Fixed for FF 11;
    	this.root = newSVG("g");
    	this.wrap.appendChild(svg);
    	svg.appendChild(this.root);
    },
    initVMLElement : function(){
    	if (!DOC.namespaces.hcv) {
            DOC.namespaces.add('v', VML_NS);
            DOC.createStyleSheet().cssText = 
                'v\\:shadow,v\\:roundrect,v\\:oval,v\\:image,v\\:polyline,v\\:line,v\\:group,v\\:fill,v\\:path,v\\:shape,v\\:stroke'+
                '{ behavior:url(#default#VML); display: inline-block; } ';
        }
        this.root = newVML("v:group");
        this.root.setStyle({position:'absolute',width:100+'px',height:100+'px'})
        this.root.set({coordsize:'100,100'})
        this.wrap.appendChild(this.root);
//        this.root = this.wrap;
    },
    initProxy : function(){//alert(this.wrap.dom.innerHTML)
    	if(hasSVG){
    		var clone = this.wrap.dom.cloneNode(true);
    		clone.id = this.id + '_proxy';
    		this.proxy = Ext.get(clone);
    	}else{
    		var clone = this.wrap.dom.cloneNode(false);
    		clone.id = this.id + '_proxy';
    		this.proxy = Ext.get(clone);
    		var vml = this.wrap.dom.innerHTML.replace(/^<\?xml[^\/]*\/>/i,'').replace(/id\=([\S]*)/img,"id=$1_proxy");
    		new Ext.Template(vml).append(clone,{},true);
    	}
    	this.proxy.setStyle({'background-color':'transparent','border':NONE,'position':'absolute','z-index':'99999'});
    	Ext.getBody().insertFirst(this.proxy);
    },
    onMouseDown : function(e,t){
    	this.fire('mousedown',e,t);
    	if(this.candrawline){
			this.startLine(e,t);
    	}else {
    		if(this.dataset){
	    		var el = this.getGElement(t);
	    		if(el && el.record){
	    			this.dataset.locate(this.dataset.getAll().indexOf(el.record)+1);
	    		}
    		}else{
    			this.focus(t)
    		}
    		if(this.dropto||this.moveable){
		    	var xy = this.wrap.getXY();
		    	if(isSVG(this.wrap)){
		    		var _xy = this.top.wrap.getXY();
		    		xy[0] = this.x + _xy[0];
		    		xy[1] = this.y + _xy[1];
		    	}
		    	this.relativeX=xy[0]-e.getPageX();
				this.relativeY=xy[1]-e.getPageY();
				screenWidth = $A.getViewportWidth();
		        screenHeight = $A.getViewportHeight();
		    	if(this.dropto){
			    	if(!this.dropEl)
			    		this.dropEl = $(this.dropto);
			    	if(!this.proxy)
			    		this.initProxy();
			    	this.proxy.moveTo(xy[0],xy[1]);
		    	}else{
		    		this.proxy = this.wrap;
		    	}
		    	if(this.moveable)setTopCmp(this.proxy);
		    	Ext.get(DOC).on('mousemove',this.onMouseMove,this);
		    	Ext.get(DOC).on('mouseup',this.onMouseUp,this);
	    	}
    	}
    },
    onMouseMove : function(e){
    	e.stopEvent();
    	var tx = e.getPageX()+this.relativeX,
    		ty = e.getPageY()+this.relativeY,
    		w = this.width||this.rx*2,
    		h = this.height||this.ry*2,
    		sl = DOC[Ext.isStrict&&!Ext.isWebKit?'documentElement':'body'].scrollLeft,
			st = DOC[Ext.isStrict&&!Ext.isWebKit?'documentElement':'body'].scrollTop,
    		sw = sl + screenWidth,
    		sh = st + screenHeight;
    	if(tx < 0) tx = 0;
    	else if((tx+w) >= sw) tx = Math.max(sw - w,0);
    	if(ty < 0) ty = 0;
    	else if((ty+h) >= sh) ty = Math.max(sh - h,0);
    	if(this.moveable)this.fireEvent('move',this,this.dataset,null,tx,ty);
    	this.proxy.moveTo(tx,ty);
    },
    onMouseUp : function(e){
    	Ext.get(DOC).un('mousemove',this.onMouseMove,this);
    	Ext.get(DOC).un('mouseup',this.onMouseUp,this);
    	if(this.dropto){
    		var wrap = this.dropEl.wrap,
    			xy = wrap.getXY(),
    			l = xy[0],
    			t = xy[1],
    			r = l + wrap.getWidth(),
    			b = t + wrap.getHeight(),
    			ex = e.getPageX(),
    			ey = e.getPageY();
    		if(ex >= xy[0] && ey >= xy[1] && ex <= r && ey <= b){
				this.dropEl.fireEvent('drop',this.proxy,this.top.dataset,ex+this.relativeX-l+(hasSVG?4:0),ey+this.relativeY-t+(hasSVG?4:0));
    		}
	    	this.proxy.moveTo(-1000,-1000);
    	}
    },
    onMouseOver : function(e,t){
    	this.fire('mouseover',e,t);
    },
    onMouseOut : function(e,t){
    	this.fire('mouseout',e,t);
    },
    onClick : function(e,t){
    	this.fire('click',e,t);
    },
    getGElement : function(t){
    	var a = t.id.match(/(.*)_(\d+)(_.*)*$/),id,ds,record;
    	if(a){
    		id = a[2];
	    	if(id){
	    		ds = this.top.dataset;
		    	if(ds)
		    		record = ds.findById(id)
		    	if(a[1]){
		    		t = $(a[1]+'_'+id);
		    	}
		    	return {el:t,record:record}
	    	}
    	}
    },
    fire : function(name,e,t){
    	if(!t) return;
    	var el = this.getGElement(t);
    	if(el){
    		this.fireEvent(name,e,el.el,this.dataset,el.record);
    		return el.el;
    	}
    	this.fireEvent(name,e,t);
    },
    create : function(g){
    	var type = g.get('type'),config = convertConfig(g);
		config.id = this.id + "_" + g.id;
		//config.dataset = this.dataset;
		if(this.renderer){
    	var fder = $A.getRenderer(this.renderer);
	        if(fder == null){
	            alert("未找到"+this.renderer+"方法!")
	            return;
	        }
	        var v = fder.call(window,g,type,config);
	        if(!Ext.isEmpty(v)){
		        if(!Ext.isObject(v)){
		        	v = '{'+String(v).replace(/^{|}$/g,'').toLowerCase()+'}';
		        }else{
		        	v = Ext.util.JSON.encode(v).toLowerCase();
		        }
		        Ext.apply(config,Ext.util.JSON.decode(v));
	        }
		}
		
		this.createGElement(config.type||type,config);
    },
    resizeSVG : function(){
    	if(hasSVG){
	    	var graphic = this.top.wrap;
	    	var	_xy = graphic.getXY()
	    	var sl = DOC[Ext.isStrict&&!Ext.isWebKit?'documentElement':'body'].scrollLeft;
	    	var st = DOC[Ext.isStrict&&!Ext.isWebKit?'documentElement':'body'].scrollTop;
	    	var g = this.root.dom;
	    	var svg = g.ownerSVGElement;
			var box = g.getBoundingClientRect();
			var width = box.left - _xy[0] + box.width +sl;
			var height = box.top - _xy[1] + box.height +st;
			Ext.fly(svg).set({'width':width,'height':height});
    	}
    },
    moveTo :function(x,y){
    	if(isSVG(this.wrap)){
    		transform(this.wrap,x,y);
    	}else{
    		var xy = this.top.wrap.getXY();
    		this.wrap.moveTo(xy[0]+x,xy[1]+y);
    	}
    },
    syncFocusMask : function(t){
    	if(!t.moveable)return this.focusMask;
    	var delta = t.strokewidth/2 + 3;
		return this.focusMask.setStyle({'left':t.x-delta+'px',top:t.y-delta+'px'}).setWidth(t.width+delta*2).setHeight(t.height+delta*2);
    },
    focus : function(t){
    	t = this.fire('focus',null,t);
    	if(t){
			if(this.focusItem)this.blur();
			if(this.editable){
		    	if(t.editable){
					t.showEditors()
				}
				if(t.moveable){
					if(!this.focusMask){
						this.focusMask = new Ext.Template('<div style="-moz-user-select:none;-webkit-user-select:none;cursor:pointer;background:none;position:absolute;border:1px dashed #000;z-index:999;"></div>').insertFirst(this.wrap.dom,{},true);
					}
					this.syncFocusMask(t).show().on('mousedown',t.onMouseDown,t);	
				}
			}
			this.focusItem = t;
    	}else{
    		this.fireEvent('focus')
    	}
    },
    blur : function(){
    	var t = this.focusItem;
    	if(t){
	    	if(t.editable){
				t.hideEditors()
			}
			if(t.moveable){
				if(this.focusMask){
					this.focusMask.hide().un('mousedown',t.onMouseDown,t);	
				}
			}
			this.fire('blur',null,t);
			this.focusItem = null;
    	}
    },
    startLine : function(e,t){
    	var focusMask = this.focusMask,
    		el = this.getGElement(focusMask && focusMask.dom === t? this.focusItem:t);
    	if(el){
	    	var _xy = this.wrap.getXY();
			this.startEl = el;
			this.drawLinePoints = [e.getPageX() - _xy[0],e.getPageY() - _xy[1]];
			Ext.get(DOC).on('mousemove',this.drawLine,this);
			Ext.get(DOC).on('mouseup',this.endLine,this);
    	}
    },
    drawLine : function(e){
    	var _xy = this.wrap.getXY();
    	var x1 = this.drawLinePoints[0], y1 = this.drawLinePoints[1],
    		x2 = e.getPageX() - _xy[0],y2 = e.getPageY() - _xy[1],
    		dx = x2 - x1,dy = y2 - y1,d = 10;
		if(dx == 0){
			y2 += dy>0?-d:d;
		}else if(dy == 0){
			x2 += dx>0?-d:d;
		}else{
			var ll = Math.sqrt(dx*dx+dy*dy);
			x2 = (ll-d)/ll*dx+x1;
			y2 = (ll-d)/ll*dy+y1;
		}
    	var points = x1 + ',' + y1  + ' ' + Math.round(x2) + ',' + Math.round(y2);
    	if(!this.newline){
    		var r = this.startEl.record,table_id = r.get(this.tableidfield)|| r.get('table_id');
    		this.newline = this.dataset.create({'type':'line','config':'strokewidth:1,strokecolor:"#aaaaaa",strokeopacity:"1",titlecolor:"black",titlesize:14,titlex:0,titley:0,endarrow:"classic",points:"'+points+'",editable:true'+(Ext.isEmpty(table_id)?'':(',from:'+table_id))});
    	}else{
    		var config = convertConfig(this.newline);
    		config.points = points;
    		this.newline.set('config',Ext.util.JSON.encode(config));
    	}
    },
    endLine : function(e,t){
    	Ext.get(DOC).un('mousemove',this.drawLine,this);
		Ext.get(DOC).un('mouseup',this.endLine,this);
    	if(this.newline){
    		var el = this.getGElement(t);
    		if(!el||el.el == this.startEl.el||el.record == this.newline){
    			this.dataset.remove(this.newline);
    		}else{
    			var r = el.record,table_id = r.get(this.tableidfield)|| r.get('table_id'),config = convertConfig(this.newline);
	    		config.to = table_id;
	    		this.newline.set('config',Ext.util.JSON.encode(config));
	    		this.focus($(this.id+'_'+this.newline.id));
	    		this.fireEvent('drawn');
    		}
    	}
    	delete this.drawLinePoints;
    	delete this.newline;
    	delete this.startEl;
    },
    bind : function(ds,name){
    	this.dataset = $(ds);
    	this.tableidfield = name||'table_id';
    	this.processDataSetLiestener('on');
    	this.onLoad();
    },
    onLoad : function(){
    	this.clear();
    	var ds = this.dataset,prepareRemove = [],
    		graphics = ds.getAll();
    	graphics.sort(function(a,b){
    		var at=a.get('type'),bt=b.get('type');
    		if(at === 'line')return 1;
    		else if(bt === 'line')return -1;
    		else return 0;
    	})
    	for(var i = 0,l = graphics.length;i<l;i++){
    		var r = graphics[i],
    			type = r.get('type')
    		if(!type){
    			r.data['type'] = 'rect';
    			r.isNew = true;
    		}
    		this.create(r);
    	}
    },
    onAdd : function(ds,record,index){
    	this.create(record);
    },
    onRemove : function(ds,record,index){
    	var el = $(this.id+'_'+record.id);
    	if(this.focusItem == el)this.focusItem = null;
    	el.destroy();
    },
    onIndexChange : function(ds,record){
    	this.focus($(this.id + '_' +record.id));
    },
    onUpdate : function(ds,record, name, value,ov){
    	var el = $(this.id+'_'+record.id),
    		config = convertConfig(record),
    		type = record.get('type');
    		config.type = type,
    		x = el.x,y = el.y;
    	if(pub[capitalize(type)].processConfig && pub[capitalize(type)].processConfig(config)==false){
    		record.set(name,ov);
    		return;
    	}
    	for(var key in el.initConfig){
    		if(key != 'dataset' && key != 'top' && key != 'root' && key != 'id'){
	    		if(!key in config)delete el[key];
    		}
    	}
    	Ext.apply(el,config);
    	el.initConfig = config;
    	el.processListener('un');
    	el.el.remove();
    	if(el.text)el.text.remove();
    	el['init'+(hasSVG?'SVG':'VML')+'Element'] = pub[type == 'image'?'Image':'Path'].prototype['init'+(hasSVG?'SVG':'VML')+'Element'];
    	if(!hasSVG)el.vmlTpl = pub[type == 'image'?'Image':'Path'].prototype.vmlTpl;
    	el.initComponent(config);
    	if(Ext.isWebKit)el.wrap.dom.setAttribute('transform',el.wrap.dom.getAttribute('transform'));
    	el.syncLineEditors(el.x - x,el.y - y);
    	if(el == this.focusItem && this.focusMask){
    		this.syncFocusMask(el);
    	}
    	el.processListener('on');
    	if(el.editors && el.points){
    		var i = 0,eds = el.editors;
    		var te = eds[eds.length-1],has = !!te.bindEl;
    		if(has){
	    		var les = te.bindEl.lineEditors;
	    		les.splice(les.indexOf(te),1);
	    		delete te.bindEl;
    		}
			for(p = el.points,l=p.length;i<l;i++){
				var ed = eds[i];
				if(ed){
					var rx = ed.width/2,ry = ed.height/2,stroke = ed.strokewidth;
					ed.x = p[i][0]-rx;
    				ed.y = p[i][1]-ry;
					if(hasSVG && stroke % 2 ==1&&el.shadow){
						rx -= 0.5;
						ry -= 0.5;
					}
					ed.moveTo(p[i][0]-rx,p[i][1]-ry);
				}else{
					el.createEditor(p[i][0],p[i][1]);
				}
			}
			while(eds.length > i){
				var ed = eds.pop();
				ed.un('move',el.editorMove,el);
				ed.destroy();
			}
			el.bindEditor(el.to);
    	}
    	//this.focus(el);
    },
	createGElement : function(name,config){
		var el = new pub[capitalize(name)](Ext.apply(config||{},{type:name,root:(config && Ext.get(config.root))||this.root,top:this.top}));
    	//this.resizeSVG();
		this.top.cmps.push(el);
    	return el;
    },
    createElement : function(name){
    	var el = hasSVG?newSVG(name):newVML(name);
    	this.root.appendChild(el)
    	return el;
    },
    clear : function(){
    	while(this.cmps.length){
    		this.cmps.pop().destroy();
    		this.focusItem = null;
    	}
    },
    destroy : function(){
    	this.wrap.remove();
    	if(this.proxy && this.proxy!=this.wrap)this.proxy.remove()
    	$A.Graphics.superclass.destroy.call(this);
    	this.processDataSetLiestener('un');
    },
    translate : transform.methodize(),
    scale : transform.methodize(2),
    rotate : transform.methodize(4),
    setTopCmp : setTopCmp,
    hasSVG : hasSVG
});
var pub ={
	Path:Ext.extend($A.Graphics,{
		zoom:10000,
		constructor: function(config) {
			this.lineEditors = [];
			return pub.Path.superclass.constructor.call(this,config);
		}, 
		initComponent : function(config){
			config.fillcolor = Color(config.fillcolor).setOpacity(config.fillopacity);
			config.fillopacity = config.fillcolor.get('a');
			config.strokecolor = Color(config.strokecolor).setOpacity(config.strokeopacity);
			config.strokeopacity = config.strokecolor.get('a');
			pub.Path.superclass.initComponent.call(this,config);
			if(this.title)this['init'+(hasSVG?'SVG':'VML')+'Title']();
			this['init'+(hasSVG?'SVG':'VML')+'Info']();
			if(hasSVG && this.shadow)this.initSVGShadow();
			var xy = this.top.wrap.getXY();
	    },
		initSVGWrap : function(){
			this.wrap = newSVG("g",this.id);
			this.root.appendChild(this.wrap);
		},
    	initVMLWrap : function(){
	    	this.wrap = newVML("v:group",this.id);
	    	this.root.appendChild(this.wrap);
	    },
		initSVGElement : function(){
			var gradient = this.createGradient(this.fillcolor.get('gradient')),
				fillcolor = this.fillcolor.get(),
				strokecolor = this.strokecolor.get('hex');
			if(this.x||this.y) {
				if(this.strokewidth&&this.strokewidth%2==1&&!this.shadow)
					transform(this.wrap,this.x+0.5,this.y+0.5);
				else
					transform(this.wrap,this.x,this.y);
			}
			this.el = newSVG("path",this.id+'_el');
	    	this.el.dom.style.cssText=encodeStyle({
	    		'fill':fillcolor,
	    		'fill-opacity':this.fillopacity,
	    		'stroke':strokecolor,
	    		'stroke-width':this.strokewidth,
	    		'stroke-opacity':this.strokewidth?this.strokeopacity:0,
	    		'cursor':this.cursor || 'pointer'
	    	})+this.style;
	    	var config = {d:this.d,fill:gradient};
	    	if(this.strokewidth){
		    	if(!this.el.dom.style.stroke){
		    		strokecolor = this.el.dom.style.stroke = "#000000";
		    	}
		    	if(this.startarrow || this.endarrow){
		    		var a = this.d.match(numberReg),l = a.length;
		    		var id = '-' + strokecolor + '-' + this.strokeopacity * 100;
		    		if(Ext.isIE9) id += '-' + this.strokewidth;
			    	if(this.startarrow){
			    		config['marker-start'] = 'url(#start-arrow-' + this.startarrow + id + ')';
			    		var point = this.convertArrow(Number(a[0]),y1 = Number(a[1]), x2 = Number(a[2]),y2 = Number(a[3]));
			    		a[0] = point.x;a[1] = point.y;
			    		config.d = config.d.replace(/[\d-+.]+\s+[\d-+.]+/,point.x+' '+point.y);
			    	}
			    	if(this.endarrow){
			    		config['marker-end'] = 'url(#end-arrow-' + this.endarrow + id + ')';
			    		var point = this.convertArrow(Number(a[l-2]),y1 = Number(a[l-1]), x2 = Number(a[l-4]),y2 = Number(a[l-3]));
			    		config.d = config.d.replace(/([\d-+.]+\s+[\d-+.]+)[^\d]*$/,point.x+' '+point.y);
			    	}
		    		new pub.Arrow({color:strokecolor,width:this.strokewidth,opacity:this.strokeopacity,endarrow:this.endarrow,startarrow:this.startarrow,root:this.root})
		    	}
	    	}
	    	this.el.set(config);
	    	this.wrap.insertFirst(this.el);
	    },
	    initVMLElement : function(){
	    	var gradient = this.createGradient(this.fillcolor.get('gradient')),
	    		fillcolor = this.fillcolor.get('rgb'),
	    		strokecolor = this.strokecolor.get('rgb');
	    	var stroke=true,fill=true,filled=true;
	    	if(Ext.isEmpty(this.strokewidth))this.strokewidth=1;
	    	if(strokecolor==NONE||this.strokeopacity==0||this.strokewidth==0)stroke=false;
	    	if(fillcolor==NONE)fill=false;
	    	this.wrap.setStyle({position:'absolute',width:100+'px',height:100+'px',left:(this.x||0)+'px',top:(this.y||0)+'px'});
	        this.wrap.set({coordsize:'100,100'});
	    	this.el=new Ext.Template(this.getVmlTpl(stroke,fill,this.shadow)).insertFirst(this.wrap.dom,Ext.apply({
	    		id:this.id+'_el',
	    		style:this.style,
	    		path:this.path || convertPath(this.d,this.zoom),
	    		zoom:this.zoom,
	    		fillColor:fillcolor,
	    		fillOpacity:this.fillopacity,
	    		strokeColor:strokecolor,
	    		strokeWidth:this.strokewidth,
	    		strokeOpacity:this.strokeopacity,
	    		endArrow:this.endarrow,
	    		startArrow:this.startarrow,
	    		cursor:this.cursor||'pointer'
	    	},gradient),true);
	    	this.wrap.set({'title':this.info||''});
	    },
	    createGradient : hasSVG?function(options){
	    	if(!options.isGradient)return NONE;
	    	var id = 'graphics-gradient' + gradientIndex++,
	    		defs = this.root.child('defs');
	    	if(!defs){
				defs = newSVG('defs');
				this.root.insertFirst(defs);
			}
			var gradient = newSVG(options.type+'Gradient',id),
				linear = options.linear,
				stops = options.stops;
				gradient.set({'x1':linear[0],'y1':linear[1],'x2':linear[2],'y2':linear[3],'gradientUnits':'userSpaceOnUse'});
				defs.appendChild(gradient);
				Ext.each(stops,function(item){
					var color = Color(item[1]),
						stop = newSVG('stop');
						stop.set({'offset':item[0],'stop-color':color.get('rgb'),'stop-opacity':color.get('a')});
					gradient.appendChild(stop);
				})
			return 'url('+location.href+'#'+id+')';
	    }:function(options){
	    	if(!options.isGradient)return {};
	    	var type = options.type == 'linear'?'gradient':'',
	    		linear = options.linear,
				stops = options.stops,
				width = this.top.width,
				height = this.top.height,
				angle,colors='';
				Ext.each(linear,function(item,index,all){
					if(/\%/.test(item)){
						item = pInt(item)/100;
						all[index] = (index % 2 == 0 ?width : height) * item;
					}
				})
				angle = Math.atan((linear[2] - linear[0]) / (linear[3] - linear[1])) / angle2Raduis + 180;
				Ext.each(stops,function(item){
					var color = Color(item[1]);
						colors += item[0] + ' ' + color.get('rgb') + ';';
				})
				return {
					type : type,
					angle : angle,
					colors : colors,
					fillOpacity : 1
				}
	    },
	    initSVGShadow : function(){
    		var fid = 'graphics-filter-shadow'
    		if(!Ext.get(fid)){
    			var defs = this.root.child('defs');
				if(!defs){
					defs = newSVG('defs');
					this.root.insertFirst(defs);
				}
    			var filter = newSVG('filter',fid);
    			filter.set({'x':-0.25,'y':-0.25,'width':1.5,'height':1.5,'color-interpolation-filters':'sRGB'});
    			defs.appendChild(filter);
    			var feGaussianBlur = newSVG('feGaussianBlur');
    			feGaussianBlur.set({'result':'blur','stdDeviation':1,'in':'SourceAlpha'});
    			var feColorMatrix = newSVG('feColorMatrix');
    			feColorMatrix.set({'values':'1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.6 0 ','type':'matrix','result':'bluralpha'});
    			var feOffset = newSVG('feOffset');
    			feOffset.set({'result':'offsetBlur','dx':0,'dy':3,'in':'bluralpha'});
    			var feMerge = newSVG('feMerge');
    			filter.appendChild(feGaussianBlur);
    			filter.appendChild(feColorMatrix);
    			filter.appendChild(feOffset);
    			filter.appendChild(feMerge);
    			var feMergeNode1 = newSVG('feMergeNode');
    			feMergeNode1.set({'in':'offsetBlur'});
    			var feMergeNode2 = newSVG('feMergeNode');
    			feMergeNode2.set({'in':'SourceGraphic'});
    			feMerge.appendChild(feMergeNode1);
    			feMerge.appendChild(feMergeNode2);
    		}
    		this.el.setStyle({'filter':'url(#'+fid+')'});
	    },
	    initSVGTitle : function(){
	    	this.text = pub.Text.prototype.initSVGElement.call({text:this.title,id:this.id+'_title',size:this.titlesize||14,dx:this.titlex||0,dy:this.titley||0,color:this.titlecolor,fontfamily:this.titlefontfamily,rotation:this.titlerotation,wrap:this.wrap,style:'cursor:pointer;-webkit-user-select:none'});
	    },
	    initVMLTitle : function(){
    		var x = this.titlex||0, y = this.titley||0,size = this.titlesize||14,root = this.wrap;
			if(this.type == 'line' || this.type == 'path'){
				x += this.x;
				y += this.y;
				root = this.top.wrap;
			}else{
				var strokewidth = this.strokewidth;
				x += strokewidth/2;
				y += strokewidth/2;
			}
			this.text = pub.Text.prototype.initVMLElement.call({text:this.title,id:this.id+'_title',size:size,dx:x,dy:y,color:this.titlecolor,fontfamily:this.titlefontfamily,rotation:this.titlerotation,wrap:root,positionwrap:this,vmlTpl:pub.Text.prototype.vmlTpl});
    	},
    	initSVGInfo : function(){
    		if(this.info){
	    		if(!this.infoEl){
		    		this.infoEl = newSVG('title');
		    		this.wrap.appendChild(this.infoEl)
	    		}
		    	this.infoEl.dom.textContent = this.info;
	    	}else{
	    		if(this.infoEl){
	    			this.infoEl.remove();
	    			this.infoEl = null;
	    		}
	    	}
    	},
    	initVMLInfo : function(){
    		this.wrap.set({'title':this.info||''});
    	},
	    convertArrow : function(x1,y1,x2,y2){
	    	var dx = x1 - x2,dy = y1 - y2,d = this.strokewidth*3/2;
	    	if(dx == 0){
				y1 += dy>0?-d:d;
			}else if(dy == 0){
				x1 += dx>0?-d:d;
			}else{
				var ll = Math.sqrt(dx*dx+dy*dy);
				x1 = (ll-d)/ll*dx+x2;
				y1 = (ll-d)/ll*dy+y2;
			}
			return {x:x1,y:y1};
	    },
	    createEditors : function(){
	    	if(this.editable){
				this.editors = [];
				var points = this.points;
				for(var i=0;i<points.length;i++){
					var x = points[i][0],y = points[i][1];
					this.createEditor(x,y);
				}
				this.bindEditor(this.from,true);
				this.bindEditor(this.to);
			}
	    },
	    bindEditor : function(id,isFrom){
	    	if(!Ext.isEmpty(id)){
		    	var eds = this.editors,ds = this.top.dataset;
				var tr = ds.find(this.top.tableidfield,id);
				if(tr){
					var el = $(this.top.id+"_"+tr.id);
					if(el){
						var ed = eds[isFrom?0:eds.length-1];
						ed.bindEl = el;
		    			el.lineEditors.add(ed);
	    			}
				}
			}
	    },
	    syncLineEditors : function(dx,dy){
	    	for(var i = 0,l = this.lineEditors.length;i<l;i++){
				var ed = this.lineEditors[i];
				ed.x += dx;ed.y += dy; 
				ed.moveTo(ed.x,ed.y);
				ed.fireEvent('move');
			}
	    },
	    createEditor : function(x,y){
	    	var eds = this.editors,i = eds.length;
	    	eds[i] = new pub.Oval({id:this.id+'_editor'+i,'x':x-5,'y':y-5,'height':10,'width':10,'strokewidth':1,'strokecolor':'rgba(0,0,0,1)','fillcolor':'transparent','root':this.root,'top':this.top,'moveable':true});
	    	eds[i].on('move',this.editorMove,this);
	    },
	    editorMove : function(el,ds,record,x,y){
	    	var record = this.getRecord();
			var config = convertConfig(record),points="";
			for(var i=0,l=this.editors.length;i<l;i++){
				var ed = this.editors[i];
				points += (ed.x+5)+','+(ed.y+5)+" ";
			}
			config.points = points;
			record.set('config',Ext.util.JSON.encode(config));
   		},
   		showEditors : function(){
	    	if(this.editors){
	    		for(var i = 0,l = this.editors.length;i<l;i++){
	    			setTopCmp(this.editors[i].wrap);
		    		this.editors[i].wrap.show();
	    		}
	    	}
	    },
	    hideEditors : function(){
	    	if(this.editors){
	    		for(var i = 0,l = this.editors.length;i<l;i++){
	    			this.editors[i].wrap.hide();
	    		}
	    	}
	    },
	    clearEditors : function(){
	    	if(this.editors){
	    		while(this.editors.length){
	    			var ed = this.editors.pop(),el = ed.bindEl;
	    			if(el && el.lineEditors){
	    				el.lineEditors.remove(ed);
	    			}
	    			ed.un('move',this.editorMove,this);
	    			ed.destroy();
	    		}
	    	}
	    	this.editors = null;
	    },
	    onMouseDown : function(e,t){
	    	if(this.top.editable && !this.top.candrawline){
	    		if(this.dropto || this.moveable){
			    	var xy = this.wrap.getXY();
			    	if(isSVG(this.wrap)){
			    		var _xy = this.top.wrap.getXY();
			    		xy[0] = this.x + _xy[0];
			    		xy[1] = this.y + _xy[1];
			    	}
			    	this.relativeX=xy[0]-e.getPageX();
					this.relativeY=xy[1]-e.getPageY();
			    	if(this.dropto){
				    	if(!this.dropEl)
				    		this.dropEl = $(this.dropto);
				    	if(!this.proxy)
				    		this.initProxy();
				    	this.proxy.moveTo(xy[0],xy[1]);
			    	}else{
			    		this.proxy = this.wrap;
			    	}
			    	if(this.moveable)setTopCmp(this.proxy);
			    	Ext.get(DOC).on('mousemove',this.onMouseMove,this);
			    	Ext.get(DOC).on('mouseup',this.onMouseUp,this);
		    	}else if(this.editable){
		    		setTopCmp(this.wrap);
		    	}
	    	}
	    },
	    onMouseMove : function(e){
	    	e.stopEvent();
	    	var w = this.width||this.rx*2,
	    		h = this.height||this.ry*2,
	    		graphic = this.top.wrap,
    			sw = graphic.getWidth(),
    			sh = graphic.getHeight(),
    			stroke = this.strokewidth||0,
	    		_xy = graphic.getXY(),
	    		tx = e.getPageX()+this.relativeX - _xy[0],
	    		ty = e.getPageY()+this.relativeY - _xy[1],
	    		b=0;
    		if(stroke && isVML(this.wrap)){
    			b =  - stroke/2;
    		}
    		if(tx <= b) tx = b;
    		else if(tx + this.width - b> sw - 2) tx = sw - 2 - this.width + b;
    		if(ty <= b) ty = b;
    		else if(ty + this.height - b> sh - 2) ty = sh - 2 - this.height + b;
    		var x = this.x,y = this.y;
			this.x = Math.round(tx - b);
			this.y = Math.round(ty - b);
			if(this.moveable){
				var ds = this.top.dataset,
					record = ds.getCurrentRecord(),
        			config = convertConfig(record),
        			stroke = config.strokewidth/2;
        		config.x = this.x;
        		config.y = this.y;
        		this.top.syncFocusMask(config);
        		record.data['config']=Ext.util.JSON.encode(config).replace(/^{|}$/g,'');
        		record.dirty = true;
				this.fireEvent('move',this,ds,record,config.x - b,config.y - b);
				this.top.fireEvent('move',this,ds,record,config.x - b,config.y - b);
			}
    		if(isSVG(this.wrap)){
    			if(stroke % 2 == 1&&!this.shadow){
					tx += 0.5;
					ty += 0.5;
    			}
				transform(this.proxy,tx,ty);
			}else{
				tx += _xy[0];
	    		ty += _xy[1];
	    		this.proxy.moveTo(tx,ty);
			}
			this.syncLineEditors(this.x - x,this.y - y);
	    },
		getRecord : function(){
	    	var a = this.id.match(/(.*)_(\d+)(_.*)*$/),id;
	    	if(a){
	    		id=a[2];
		    	if(this.top.dataset)
		    		return this.top.dataset.findById(id)
	    	}
	    },
	    destroy : function(){
	    	this.clearEditors();
	    	if(this.focusMask){
	    		this.focusMask.un('mousedown',this.onMouseDown,this);
	    		this.focusMask.remove();
	    	}
    		this.text && this.text.remove&&this.text.remove()	
	    	pub.Path.superclass.destroy.call(this);
	    },
	    getVmlTpl : function(s,f,sd){
	    	var tpl = ["<v:shape id='{id}' filled='"+f+"' stroked='"+s+"' coordsize='{zoom},{zoom}' style='position:absolute;left:0;top:0;width:1px;height:1px;cursor:{cursor};{style}' path='{path}'>"];
	    	if(f)tpl.push(fill);
	    	if(s)tpl.push(stroke);
	    	if(sd)tpl.push(shadow);
	    	tpl.push("</v:shape>");
	    	return tpl;
	    }
	}),
	Group : Ext.extend($A.Graphics,{
		initSVGWrap : function(){
			this.wrap = newSVG("g",this.id);
			this.root.appendChild(this.wrap);
		},
    	initVMLWrap : function(){
	    	this.wrap = newVML("v:group",this.id);
	    	this.wrap.setStyle({position:'absolute',width:100+'px',height:100+'px'});
	        this.wrap.set({coordsize:'100,100'});
	    	this.root.appendChild(this.wrap);
	    },
		initSVGElement : function(){
	    },
	    initVMLElement : function(){
	    }
	}),
	Line : function(config){
		if(pub.Line.processConfig(config)==false)return;
		var line = new pub.Path(config);
		line.createEditors();
		line.hideEditors();
		return line;
	},
	Oval:function(config){
		pub.Oval.processConfig(config);
		return new pub.Path(config);
	},
	Arc:function(config){
		pub.Arc.processConfig(config);
		return new pub.Path(config);
	},
	Rect : function(config){
		pub.Rect.processConfig(config);
		return new pub.Path(config);
	},
	Diamond : function(config){
		pub.Diamond.processConfig(config);
		return new pub.Path(config);
	},
	Arrow : function(config){
		if(!config.startarrow && !config.endarrow )return;
		var defs = config.root.child('defs');
		if(!defs){
			defs = newSVG('defs');
			config.root.insertFirst(defs);
		}
		var color = config.color||'#000000',opacity = config.opacity||1,width = config.width||2,
			id = '-' + color + '-' + opacity * 100,vb = '0 0 100 100';
		if(Ext.isIE9){
			id += '-' + width;
			var dt = width / 2 * Math.sqrt(5);
			vb = -dt + " " + (-dt) + " " + (100 + 2 * dt) + " " + (100 + 2 * dt);
		}
		if(config.startarrow){
			var sid = 'start-arrow-' + config.startarrow + id,
				marker = Ext.get(sid);
			if(!marker){
				marker = newSVG('marker',sid);
				marker.set({viewBox:vb,refX:50,refY:50,orient:'auto'});
				defs.appendChild(marker);
				new pub.Path({fillcolor:color,fillopacity:opacity,d:'M 100 0 L 0 50 L 100 100 L 66.66 50 z',root:marker});
			}
		}
		if(config.endarrow){
			var sid = 'end-arrow-' + config.endarrow + id,
				marker = Ext.get(sid);
			if(!marker){
				marker = newSVG('marker',sid);
				marker.set({viewBox:vb,refX:50,refY:50,orient:'auto'});
				defs.appendChild(marker);
				new pub.Path({fillcolor:color,fillopacity:opacity,d:'M 0 0 L 100 50 L 0 100 L 33.33 50 z',root:marker});
			}
		}
	}
}
Ext.apply(pub,{
	Image : Ext.extend(pub.Path,{
		initSVGElement : function(){
			if(this.x||this.y) transform(this.wrap,this.x,this.y);
			this.el = newSVG("image",this.id+"_el");
	    	this.el.dom.style.cssText=encodeStyle({
	    		'stroke':this.strokecolor,
	    		'stroke-width':this.strokewidth,
	    		'stroke-opacity':this.strokeopacity,
	    		'-moz-user-select':NONE
	    	})+this.style;
	    	this.el.dom.setAttributeNS(XLINK_NS,'xlink:href',this.image);
	    	this.el.set({x:0,y:0,width:this.width,height:this.height});
	    	this.wrap.appendChild(this.el);
	    },
	    initVMLElement : function(){
	    	this.wrap.setStyle({position:'absolute',width:100+'px',height:100+'px',left:this.x+'px',top:this.y+'px'});
	        this.wrap.set({coordsize:'100,100'});
	    	this.el=new Ext.Template(this.vmlTpl).append(this.wrap.dom,{
	    		id:this.id+'_el',
	    		src:this.image,
	    		style:this.style,
	    		width:this.width,
	    		height:this.height,
	    		strokeColor:this.strokecolor||NONE,
	    		strokeWidth:this.strokecolor?this.strokewidth:0,
	    		strokeOpacity:this.strokecolor?(this.strokeopacity||1):0
	    	},true)
	    },
	    vmlTpl : ["<v:image id='{id}' src='{src}' style='position:absolute;left:0;top:0;width:{width}px;height:{height}px;{style}'>",stroke,"</v:image>"]
	}),
	Text : Ext.extend(pub.Path,{
		initSVGWrap : function(){
			this.wrap = newSVG("g",this.id);
			this.root.appendChild(this.wrap);
		},
    	initVMLWrap : function(){
	    	this.wrap = newVML("v:group",this.id);
	    	this.root.appendChild(this.wrap);
	    },
		initSVGElement : function(){
			var size = this.size||14;
			this.el = newSVG("text",this.id+'_el');
	    	this.el.dom.style.cssText=encodeStyle({
	    		'fill':this.color,
	    		'font-size':size+'px',
	    		'font-family':this.fontfamily,
	    		'line-height':size+'px',
	    		'cursor':'text'
	    	})+this.style;
	    	this.el.set({dx:this.dx+1,dy:this.dy+size-2});
	    	this.el.dom.textContent = this.text;
	    	this.wrap.appendChild(this.el);
	    	if(!Ext.isEmpty(this.rotation))transform(this.el,null,null,null,null,this.rotation);
	    	return this.el;
	    },
	    initVMLElement : function(){
	    	var size = this.size||14;
	    	this.el=new Ext.Template(this.vmlTpl).append(this.wrap.dom,{
	    		id:this.id+'_el',
	    		style:encodeStyle({'line-height':size+'px','font-size':size+'px','font-family':this.fontfamily})+this.style,
	    		left:this.dx,
	    		top:this.dy,
	    		color:this.color||'black'
	    	},true)
	    	this.el.update(this.text);
	    	if(!Ext.isEmpty(this.rotation)){
	    		var x,y;
	    		if(this.positionwrap){
	    			x =  this.positionwrap.x;
	    			y =  this.positionwrap.y;
	    			this.el.dx = this.positionwrap.titlex;
	    			this.el.dy = this.positionwrap.titley;
	    		}
	    		transform(this.el,null,null,null,null,this.rotation,x,y);
	    	}
	    	return this.el;
	    },
	    vmlTpl : "<span id='{id}' unselectable='on'  onselectstart='return false;' style='position:absolute;left:{left}px;top:{top}px;color:{color};cursor:pointer;white-space:nowrap;{style}'></span>"
	})
})

pub.Line.processConfig = function(config){
	var a= config.points.match(numberReg),points = [];
	if(!a)return false;
	for(var i = 0,l = a.length;i < l;i += 2){
		points.push([a[i],a[i+1]]);
	}
	if(points.length < 2)return false;
	var x = points[0][0], y = points[0][1];
	a = ["M",0,0,"L"];
	for(var i = 1,l = points.length; i < l;i++){
		a.push(points[i][0] - x,points[i][1] - y);
	}
	config.d = a.join(' ');
	if(config.strokewidth == 1)config.strokewidth = 2;
	config.fillcolor = NONE;
	config.points = points;
	config.x = Number(x);
	config.y = Number(y);
}
pub.Rect.processConfig=function(config){
	var h = Number(config.height)||200,
	w = Number(config.width)||200,
	rx = Math.min(Number(config.rx)||0,w/2),
	ry = Math.min(Number(config.ry)||0,h/2),
	round = rx>0&&ry>0,
	lx = rx!=w/2,
	ly = ry!=h/2,
	d = ['M',0,round?ry:0];
	if(round)d.push('A',rx,ry,0,0,1,rx,0);
	if(lx)d.push('H',w-(round?rx:0));
	if(round)d.push('A',rx,ry,0,0,1,w,ry);
	if(ly)d.push('V',h-(round?ry:0));
	if(round)d.push('A',rx,ry,0,0,1,w-rx,h);
	if(lx)d.push('H',round?rx:0);
	if(round)d.push('A',rx,ry,0,0,1,0,h-ry);
	if(ly)d.push('Z');
	config.d = d.join(' ');
}
pub.Oval.processConfig = function(config){
	config.height = config.height||config.ry*2;
	config.width = config.width||config.rx*2;
	config.ry = config.height/2;
	config.rx = config.width/2;
	pub.Rect.processConfig(config);
}
pub.Arc.processConfig = hasSVG?function (options) {
	var x = options.x,
		y = options.y,
		start = options.start % (2 *mathPI),
		radius = options.r ,
		end = options.end % (2 * mathPI) - 0.000001, // to prevent cos and sin of start and end from becoming equal on 360 arcs
		innerRadius = options.innerR || 0,
		open = options.open,
		cosStart = mathCos(start),
		sinStart = mathSin(start),
		cosEnd = mathCos(end),
		sinEnd = mathSin(end),
		longArc = (end > start? end : end + 2 * mathPI) - start < mathPI ? 0 : 1;
	options.d = [
		'M',
		x + radius * cosStart,
		y - radius * sinStart,
		'A', // arcTo
		radius, // x radius
		radius, // y radius
		0, // slanting
		longArc, // long or short arc
		0, // clockwise
		x + radius * cosEnd,
		y - radius * sinEnd,
		open ? 'M' : 'L',
		x + innerRadius * cosEnd,
		y - innerRadius * sinEnd,
		'A', // arcTo
		innerRadius, // x radius
		innerRadius, // y radius
		0, // slanting
		longArc, // long or short arc
		1, // clockwise
		x + innerRadius * cosStart,
		y - innerRadius * sinStart,

		open ? '' : 'Z' // close
	].join(' ');
	options.x = 0;
	options.y = 0;
}:function (options) {
	var zoom = options.zoom || 10000,
		x = options.x * zoom,
		y = options.y * zoom,
		start = options.start ,
		end = options.end ,
		radius = options.r * zoom,
		cosStart = mathCos(start),
		sinStart = mathSin(start),
		cosEnd = mathCos(end),
		sinEnd = mathSin(end),
		innerRadius = (options.innerR  || 0)* zoom,
		circleCorrection = 0.08 / radius, // #760
		innerCorrection = (innerRadius && 0.1 / innerRadius) || 0,
		ret;

	if (end - start === 0) { // no angle, don't show it.
		return ['x'];

	}
//	else if (2 * mathPI - end + start < circleCorrection) { // full circle
//		// empirical correction found by trying out the limits for different radii
//		cosEnd = -circleCorrection;
//	} else if (end - start < innerCorrection) { // issue #186, another mysterious VML arc problem
//		cosEnd = mathCos(start + innerCorrection);
//	}

	ret = [
		'at', // clockwise arc to
		pInt(- radius), // left
		pInt(- radius), // top
		pInt(radius), // right
		pInt(radius), // bottom
		pInt(radius * cosStart), // start x
		pInt(- radius * sinStart), // start y
		pInt(radius * cosEnd), // end x
		pInt(- radius * sinEnd)  // end y
	];
	if(innerRadius){
		ret.push(
			'wa', // anti clockwise arc to
			pInt(- innerRadius), // left
			pInt(- innerRadius), // top
			pInt(innerRadius), // right
			pInt(innerRadius), // bottom
			pInt(innerRadius * cosEnd), // start x
			pInt(- innerRadius * sinEnd), // start y
			pInt(innerRadius * cosStart), // end x
			pInt(- innerRadius * sinStart) // end y
		);
	}
	ret.push(
		'x', // finish path
		'e' // close
	);
	options.path = ret.join(' ');
}
pub.Diamond.processConfig = function(config){
	var h = Number(config.height)||100,
	w = Number(config.width)||200,
	d = ['M',
		0,h/2,
		'L',
		w/2,0,
		w,h/2,
		w/2,h,
		'Z'];
	config.d = d.join(' ');
}
})();