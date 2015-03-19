"use strict";

window.eg = window.eg || {};
(function(ns) {
	ns.Component = ns.Class({
		construct : function() {
			this._htEventHandler = {};
			// The reference count is not support yet.
			// this.constructor.$count = (this.constructor.$count || 0) + 1;
		},
		trigger : function(sEvent, oEvent) {
			oEvent = oEvent || {};
			var aHandlerList = this._htEventHandler[sEvent] || [],
				bHasHandlerList = aHandlerList.length > 0;
				
			if (!bHasHandlerList) {
				return true;
			}
			// If detach method call in handler in first time then handeler list calls.
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

			
			var fHandler;
			for (i = 0, fHandler; (fHandler = aHandlerList[i]); i++) {
				fHandler.apply(this, aArg);
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
			// All event detach.
			if (arguments.length === 0){
				this._htEventHandler = {};
				return this;
			}
			
			// All handler of specific event detach.
			if (typeof fHandlerToDetach === "undefined") {
				if (typeof sEvent === "string"){
					this._htEventHandler[sEvent] = null;
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

			// The handler of specific event detach.
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
})(eg);



