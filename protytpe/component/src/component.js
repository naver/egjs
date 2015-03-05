
var Component = (function(){
	var componentMethods = {
		option : function(sName, vValue) {
			switch (typeof sName) {
				case "undefined" :
					var oOption = {};
					for(var i in this._htOption){
						if(!(i == "htCustomEventHandler" || i == "_htSetter")){
							oOption[i] = this._htOption[i];
						}
					}
					return oOption;
				case "string" : 
					if (typeof vValue != "undefined") {
						if (sName == "htCustomEventHandler") {
							if (typeof this._htOption[sName] == "undefined") {
								this.attach(vValue);
							} else {
								return this;
							}
						}
						
						this._htOption[sName] = vValue;
						if (typeof this._htOption._htSetter[sName] == "function") {
							this._htOption._htSetter[sName](vValue);	
						}
					} else {
						return this._htOption[sName];
					}
					break;
				case "object" :
					for(var sKey in sName) {
						if (sKey == "htCustomEventHandler") {
							if (typeof this._htOption[sKey] == "undefined") {
								this.attach(sName[sKey]);
							} else {
								continue;
							}
						}
						if(sKey !== "_htSetter"){
							this._htOption[sKey] = sName[sKey];
						}
						
						if (typeof this._htOption._htSetter[sKey] == "function") {
							this._htOption._htSetter[sKey](sName[sKey]);	
						}
					}
					break;
			}
			return this;
		},
		optionSetter : function(sName, fSetter) {
			switch (typeof sName) {
				case "undefined" :
					return this._htOption._htSetter;
				case "string" : 
					if (typeof fSetter != "undefined") {
						this._htOption._htSetter[sName] = fSetter.bind(this);
					} else {
						return this._htOption._htSetter[sName];
					}
					break;
				case "object" :
					for(var sKey in sName) {
						this._htOption._htSetter[sKey] = sName[sKey].bind(this);
					}
					break;
			}
			return this;
		},
		fireEvent : function(sEvent, oEvent) {
			oEvent = oEvent || {};
			var fInlineHandler = this['on' + sEvent],
				aHandlerList = this._htEventHandler[sEvent] || [],
				bHasInlineHandler = typeof fInlineHandler == "function",
				bHasHandlerList = aHandlerList.length > 0;
				
			if (!bHasInlineHandler && !bHasHandlerList) {
				return true;
			}
			aHandlerList = aHandlerList.concat(); //fireEvent수행시 핸들러 내부에서 detach되어도 최초수행시의 핸들러리스트는 모두 수행
			
			oEvent.sType = sEvent;
			if (typeof oEvent._aExtend == 'undefined') {
				oEvent._aExtend = [];
				oEvent.stop = function(){
					if (oEvent._aExtend.length > 0) {
						oEvent._aExtend[oEvent._aExtend.length - 1].bCanceled = true;
					}
				};
			}
			oEvent._aExtend.push({
				sType: sEvent,
				bCanceled: false
			});
			
			var aArg = [oEvent], 
				i, nLen;
				
			for (i = 2, nLen = arguments.length; i < nLen; i++){
				aArg.push(arguments[i]);
			}
			
			if (bHasInlineHandler) {
				fInlineHandler.apply(this, aArg);
			}
		
			if (bHasHandlerList) {
				var fHandler;
				for (i = 0, fHandler; (fHandler = aHandlerList[i]); i++) {
					fHandler.apply(this, aArg);
				}
			}
			
			return !oEvent._aExtend.pop().bCanceled;
		},
	
		attach : function(sEvent, fHandlerToAttach) {
			if (arguments.length == 1) {
				var oEvent = arguments[0];
				for(var i in oEvent){
					this.attach(i, oEvent[i]);
				}
				return this;
			}
			
			var aHandler = this._htEventHandler[sEvent];
			
			if (typeof aHandler == 'undefined'){
				aHandler = this._htEventHandler[sEvent] = [];
			}
			
			aHandler.push(fHandlerToAttach);
			
			return this;
		},
	
		detach : function(sEvent, fHandlerToDetach) {
			if (arguments.length == 1) {
				var oEvent = arguments[0];
				for(var i in oEvent){
					this.detach(i, oEvent[i]);
				}
			
				return this;
			}

			var aHandler = this._htEventHandler[sEvent];
			if (aHandler) {
				for (var i = 0, fHandler; (fHandler = aHandler[i]); i++) {
					if (fHandler === fHandlerToDetach) {
						aHandler = aHandler.splice(i, 1);
						break;
					}
				}
			}

			return this;
		},
	
		detachAll : function(sEvent) {
			var aHandler = this._htEventHandler;
			
			if (arguments.length) {
				
				if (typeof aHandler[sEvent] == 'undefined') {
					return this;
				}
		
				delete aHandler[sEvent];
		
				return this;
			}	
			
			for (var o in aHandler) {
				delete aHandler[o];
			}
			return this;				
		},

		bind : function(type){
			var events;
			if(type){
				events = {};
				events[type] = this.$events[type];
			}else{
				events = this.$events;	
			}
			var baseElement = this.option("baseElement")||document;
			var data, eventName, selector;
			for (var i in events) if (events.hasOwnProperty(i)) {
			// backbone과 같이 white space로 할까?
				if(!this._domeEventHandler[i]){

					data = i.split("@");
					if(data.length>1){
						eventName = data[0];
						selector = data.slice(1).join("@");
					}else{
						eventName = data[0];
						selector = undefined;
					}

					this._domeEventHandler[i] = {
						"event" : eventName,
						"selector" : selector,
						"fp" : this[events[i]].bind(this)
					};	
				}
				

				jQuery(baseElement).on(
						this._domeEventHandler[i].event,
						this._domeEventHandler[i].selector,
						this._domeEventHandler[i].fp);
			}else{
				console.log("앖앖음");
			}

			
			return this;
		},
		// unbind할 때 객체를 지우는게 좋은지 아닌지 확인해보고, 부분적으로 지울때 사용성어 어떤지 확인
		unbind : function(type){
			var events;
			if(type){
				events = {};
				events[type] = this._domeEventHandler[type];
			}else{
				events = this._domeEventHandler;	
			}
			var baseElement = this.option("baseElement")||document;
			var data;
			
			for (var i in events) if (events.hasOwnProperty(i)) {

				jQuery(baseElement).off(
					events[i].event,
					events[i].selector,
					events[i].fp);

				// delete eventHandler[i];
			}	

			
			return this;
		}
	};

	return function(methods){
		function Klass(option){
			this._domeEventHandler = {};
			this._htEventHandler = {};
			this._htOption = {};
			this._htOption._htSetter = {};
			this.constructor.$count = (this.constructor.$count || 0) + 1;
			var ad = new AsyncDOM();
			this.$ = ad.$.bind(ad);
			
			if(this.$init) this.$init(option);

			
			if(this.option("autoBind")){
				this.bind();
			}
			if(this.option("autoSetup")){
				this.setup();
			}
		}
		
		Klass.prototype = componentMethods;
		for (var i in methods) if (methods.hasOwnProperty(i)) {
			Klass.prototype[i] = methods[i];
		}
		Klass.prototype.constructor = Klass;
		return Klass;
	}
})();