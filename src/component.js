eg.module("component",[eg],function(ns){
	/**
	 * Component
	 * @class
	 * @group EvergreenJs
	 * @name eg.Component
	 */
	ns.Component = ns.Class({
		construct : function() {
			this.eventHandler = {};
			// The reference count is not support yet.
			// this.constructor.$count = (this.constructor.$count || 0) + 1;
		},
		/**
		 * The event fire with custom event.
		 * @ko 커스텀 이벤트를 실행합니다.
		 * @method eg.Component#trigger
		 * @param {String} eventName
		 * @param {Object} customEvent
		 * @return {Boolean}
		 * @example
		 	var Some = eg.Class.extend(eg.Component,{
				"some" : function(){
					this.tigger("hi");// fire hi event.
				}
		 	});
		 */
		trigger : function(eventName, customEvent) {
			customEvent = customEvent || {};
			var handlerList = this.eventHandler[eventName] || [],
				hasHandlerList = handlerList.length > 0;

			if (!hasHandlerList) {
				return true;
			}
			// If detach method call in handler in first time then handeler list calls.
			handlerList = handlerList.concat();

			customEvent.eventType = eventName;

			var isCanceled = false;
			customEvent.stop = function(){
				isCanceled = true;
			};

			var arg = [customEvent], i, len;


			if((len = arguments.length)>2){
				arg = arg.concat(Array.prototype.slice.call(arguments,2,len));
			}


			var handler;
			for (i = 0; handler = handlerList[i]; i++) {
				handler.apply(this, arg);
			}


			return !isCanceled;
		},
		/**
		 * Checks whether the event has been assigned to the Component.
		 * @ko 컴포넌트에 등록된 이벤트를 확인합니다.
		 * @method eg.Component#hasOn
		 * @param {String} eventName
		 * @return {Boolean}
	 	 * @example
		 	var Some = eg.Class.extend(eg.Component,{
				"some" : function(){
					this.hasOn("hi");// check hi event.
				}
		 	});
		 */
		hasOn : function(eventName){
			return !!this.eventHandler[eventName];
		},
		/**
		 * Attach an event handler function.
		 * @ko 이벤트를 등록합니다.
		 * @method eg.Component#on
		 * @param {eventName} eventName
		 * @param {Function} handlerToAttach
		 * @return {Instance}
	 	 * @example
		 	var Some = eg.Class.extend(eg.Component,{
		 		"hi" : function(){},
				"some" : function(){
					this.on("hi",this.hi); //attach event
				}
			});
		 */
		on : function(eventName, handlerToAttach) {
			if (typeof handlerToAttach === "undefined") {
				var eventHash = eventName, i;
				for(i in eventHash){
					this.on(i, eventHash[i]);
				}
				return this;
			}

			var handlerList = this.eventHandler[eventName];

			if (typeof handlerList === "undefined"){
				handlerList = this.eventHandler[eventName] = [];
			}

			handlerList.push(handlerToAttach);

			return this;
		},
		/**
		 * Detach an event handler function.
		 * @ko 이벤트를 해제합니다.
		 * @method eg.Component#off
		 * @param {eventName} eventName
		 * @param {Function} handlerToDetach
		 * @return {Instance}
	 	 * @example
		 	var Some = eg.Class.extend(eg.Component,{
		 		"hi" : function(){},
				"some" : function(){
					this.off("hi",this.hi); //detach event
				}
			});
		 */
		off : function(eventName, handlerToDetach) {
			// All event detach.
			if (arguments.length === 0){
				this.eventHandler = {};
				return this;
			}

			// All handler of specific event detach.
			if (typeof handlerToDetach === "undefined") {
				if (typeof eventName === "string"){
					this.eventHandler[eventName] = null;
					return this;
				} else {
					var eventHash = eventName;
					for (var i in eventHash){
						this.off(i, eventHash[i]);
					}
					return this;
				}
			}

			// The handler of specific event detach.
			var handlerList = this.eventHandler[eventName];
			if (handlerList) {
				for (var k = 0, handlerFunction; handlerFunction = handlerList[k]; k++) {
					if (handlerFunction === handlerToDetach) {
						handlerList = handlerList.splice(k, 1);
						break;
					}
				}
			}

			return this;
		}
	});
});



