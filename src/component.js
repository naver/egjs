var Component = $Class({
	$init : function() {
		this._htEventHandler = {};
		// 참조 카운트는 당장필요하지 않기 때문에 넣지 않음
		// this.constructor.$count = (this.constructor.$count || 0) + 1;
	},
	fire : function(sEvent, oEvent) {
		oEvent = oEvent || {};
		var aHandlerList = this._htEventHandler[sEvent] || [],
			bHasHandlerList = aHandlerList.length > 0;
			
		if (!bHasHandlerList) {
			return true;
		}
		//fireEvent수행시 핸들러 내부에서 detach되어도 최초수행시의 핸들러리스트는 모두 수행
		aHandlerList = aHandlerList.concat(); 
		
		oEvent.eventType = sEvent;

		var bCanceled = false;
		oEvent.stop = function(){
			bCanceled = true;
		};

		var aArg = [oEvent], i, nLen;
		

		if((nLen = arguments.length)>2){
			aArg = aArg.concat(Array.prototype.slice.call(arguments,2,nLen));
		}

		if (bHasHandlerList) {
			var fHandler;
			for (i = 0, fHandler; (fHandler = aHandlerList[i]); i++) {
				fHandler.apply(this, aArg);
			}
		}
		
		return !bCanceled;
	},

	on : function(sEvent, fHandlerToAttach) {
		if (typeof fHandlerToAttach === "undefined") {
			var oEvent = sEvent;
			for(var i in oEvent){
				this.on(i, oEvent[i]);
			}
			return this;
		}
		
		var aHandler = this._htEventHandler[sEvent];
		
		if (typeof aHandler === "undefined"){
			aHandler = this._htEventHandler[sEvent] = [];
		}
		
		aHandler.push(fHandlerToAttach);
		
		return this;
	},
	off : function(sEvent, fHandlerToDetach) {

		if (typeof fHandlerToDetach === "undefined") {
			if (typeof sEvent === "string"){
				delete this._htEventHandler[sEvent];
				return this;
			} else {
				var oEvent = sEvent;
				for (var i in oEvent){ 
					if(oEvent.hasOwnProperty(i)) {
						this.off(i, oEvent[i]);
					}
				}
				return this;
			}
		}
		
		var aHandler = this._htEventHandler[sEvent];
		if (aHandler) {
			for (var k = 0, fHandler; (fHandler = aHandler[k]); k++) {
				if (fHandler === fHandlerToDetach) {
					aHandler = aHandler.splice(k, 1);
					break;
				}
			}
		}
		
		return this;
	}
});