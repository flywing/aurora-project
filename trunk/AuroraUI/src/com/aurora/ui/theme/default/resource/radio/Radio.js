Aurora.Radio = Ext.extend(Aurora.Component, {	
	readOnly:false,
	orientation:'horizontal',	
	checkedCss:'item-radio-img-c',
	uncheckedCss:'item-radio-img-u',
	readonyCheckedCss:'item-radio-img-readonly-c',
	readonlyUncheckedCss:'item-radio-img-readonly-u',
	optionCss:'item-radio-option',
	imgCss:'item-radio-img',
	labelCss:'item-radio-lb',
	constructor: function(config){
		config.checked = config.checked || false;
		config.readonly = config.readonly || false;
		this.el=new Aurora.Element(document.createElement('div'));
		Aurora.Radio.superclass.constructor.call(this,config);		
	},
	initComponent:function(config){
		Aurora.Radio.superclass.initComponent.call(this, config);
		this.wrap=Aurora.get(this.id);	
		this.initOption();
		var o=this.el.child('.'+this.optionCss);		
		this.orientation==='horizontal'?o.setStyle('float','left'):o.setStyle('float','none');
		this.initStatus();	
	},
	initEvents:function(){
		Aurora.Radio.superclass.initEvents.call(this);
		this.el.on('click',this.onClick,this);  	
		this.addEvents('click');    
	},
	initOption:function(){//debugger;
		this.el.update('');
		this.otp=new Aurora.Template(
	    '<div class="'+this.optionCss+'" value="{'+this.valueField+'}" index={index}>'+                    		
        	'<div class="'+this.imgCss+'"></div>'+
			'<label class="'+this.labelCss+'">{'+this.displayField+'}</label>'+
        '</div>');
		var datas = this.options.getAll(),l=datas.length;				
		for(var i=0;i<l;i++){			
			var d=Ext.apply(datas[i].data,{index:i});			
			this.otp.append(this.el,d);			
		}
		if(l!=0){
			this.el.appendTo(this.wrap);	
		}
	},
	setValue:function(value,silent){//debugger;
		this.value=value;
		this.initStatus();
		Aurora.Radio.superclass.setValue.call(this,value, silent);
	},
	getNode:function(index){		
		return this.el.dom.childNodes[index];
	},
	setReadOnly:function(b){
		if(typeof(b)==='boolean'){
			this.readonly=b?true:false;	
			this.initStatus();		
		}
	},
	initStatus:function(){
		var datas = this.options.getAll(),l=datas.length;				
		for (var i = 0; i < l; i++) {
			var node=Ext.fly(this.getNode(i)).child('.'+this.imgCss);		
			node.removeClass(this.checkedCss);
			node.removeClass(this.uncheckedCss);
			node.removeClass(this.readonyCheckedCss);
			node.removeClass(this.readonlyUncheckedCss);			
			if(datas[i].data[this.valueField]===this.value){
				this.readonly?node.addClass(this.readonyCheckedCss):node.addClass(this.checkedCss);				
			}else{
				this.readonly?node.addClass(this.readonlyUncheckedCss):node.addClass(this.uncheckedCss);		
			}
		}
	},
	onClick:function(e){
		if(!this.readonly){
			var v=e.target.parentNode.value
			this.setValue(v);
			this.fireEvent('click',this,v);
		}		
	}	
});