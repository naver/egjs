/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

eg.module("component", [eg], function(ns) {
	"use strict";

	/**
	 * A class used to manage events and options in a component
	 * @class
	 * @group egjs
	 * @name eg.Component
	 * @ko 컴포넌트의 이벤트와 옵션을 관리할 수 있게 하는 클래스
	 *
	 * @support {"ie": "7+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"}
	 */
	ns.Component = ns.Class({
		construct: function() {
			// The reference count does not support yet.
			// this.constructor.$count = (this.constructor.$count || 0) + 1;
			this.eventHandler = {};
			this.options = {};
		},
		/**
		 * Sets options in a component or returns them.
		 * @ko 컴포넌트에 옵션을 설정하거나 옵션을 반환한다
		 * @method eg.Component#option
		 * @param {String} key The key of the option<ko>옵션의 키</ko>
		 * @param {Object} [value] The option value that corresponds to a given key <ko>키에 해당하는 옵션값</ko>
		 * @return {eg.Component|Object} An instance, an option value, or an option object of a component itself.<br>- If both key and value are used to set an option, it returns an instance of a component itself.<br>- If only a key is specified for the parameter, it returns the option value corresponding to a given key.<br>- If nothing is specified, it returns an option object. <ko>컴포넌트 자신의 인스턴스나 옵션값, 옵션 객체.<br>- 키와 값으로 옵션을 설정하면 컴포넌트 자신의 인스턴스를 반환한다.<br>- 파라미터에 키만 설정하면 키에 해당하는 옵션값을 반환한다.<br>- 파라미터에 아무것도 설정하지 않으면 옵션 객체를 반환한다.</ko>
		 * @example
			var Some = eg.Class.extend(eg.Component, {
				construct: function(options){
					this.options = options; // You have to set this.options.
				}
			});

			var some = new Some({
				"foo": 1,
				"bar": 2,
			});
			some.option("foo"); // return 1
			some.option("foo",3); // return some instance
			some.option(); // return options object.
			some.option({
				"foo" : 10,
				"bar" : 20,
				"baz" : 30
			}); // return some instance.
		 */
		option: function(key, value) {
			if (arguments.length >= 2) {
				this.options[key] = value;
				return this;
			}

			if (typeof key === "string") {
				return this.options[key];
			}

			if (arguments.length === 0) {
				return this.options;
			}

			for (var i in key) {
				this.options[i] = key[i];
			}

			return this;
		},
		/**
		 * Triggers a custom event.
		 * @ko 커스텀 이벤트를 발생시킨다
		 * @method eg.Component#trigger
		 * @param {String} eventName The name of the custom event to be triggered <ko>발생할 커스텀 이벤트의 이름</ko>
		 * @param {Object} customEvent Event data to be sent when triggering a custom event <ko>커스텀 이벤트가 발생할 때 전달할 데이터</ko>
		 * @return {Boolean} Indicates whether the event has occurred. If the stop() method is called by a custom event handler, it will return false and prevent the event from occurring. <ko>이벤트 발생 여부. 커스텀 이벤트 핸들러에서 stop() 메서드를 호출하면 'false'를 반환하고 이벤트 발생을 중단한다.</ko>
		 * @example
			var Some = eg.Class.extend(eg.Component,{
				"some": function(){
					this.trigger("hi");// fire hi event.
				}
			});
		 */
		trigger: function(eventName, customEvent) {
			customEvent = customEvent || {};
			var handlerList = this.eventHandler[eventName] || [];
			var hasHandlerList = handlerList.length > 0;

			if (!hasHandlerList) {
				return true;
			}

			// If detach method call in handler in first time then handeler list calls.
			handlerList = handlerList.concat();

			customEvent.eventType = eventName;

			var isCanceled = false;
			var arg = [customEvent];
			var i;
			var len;
			var handler;

			customEvent.stop = function() {
				isCanceled = true;
			};

			if ((len = arguments.length) > 2) {
				arg = arg.concat(Array.prototype.slice.call(arguments, 2, len));
			}

			for (i = 0; handler = handlerList[i]; i++) {
				handler.apply(this, arg);
			}

			return !isCanceled;
		},
		/**
		 * Executed event just one time.
		 * @ko 이벤트가 한번만 실행된다.
		 * @method eg.Component#once
		 * @param {eventName} eventName The name of the event to be attached <ko>등록할 이벤트의 이름</ko>
		 * @param {Function} handlerToAttach The handler function of the event to be attached <ko>등록할 이벤트의 핸들러 함수</ko>
		 * @return {eg.Component} An instance of a component itself<ko>컴포넌트 자신의 인스턴스</ko>
		 * @example
			var Some = eg.Class.extend(eg.Component,{
				"hi": function(){
					alert("hi");
				},
				"thing": function(){
					this.once("hi",this.hi);
				}
			});

			var some = new Some();
			some.thing();
			some.trigger("hi");
			// fire alert("hi");
			some.trigger("hi");
			// Nothing happens
		 */
		once: function(eventName, handlerToAttach) {
			if (typeof eventName === "object" &&
			typeof handlerToAttach === "undefined") {
				var eventHash = eventName;
				var i;
				for (i in eventHash) {
					this.once(i, eventHash[i]);
				}
				return this;
			} else if (typeof eventName === "string" &&
				typeof handlerToAttach === "function") {
				var self = this;
				this.on(eventName, function listener() {
					var arg = Array.prototype.slice.call(arguments);
					handlerToAttach.apply(self, arg);
					self.off(eventName, listener);
				});
			}

			return this;
		},
		/**
		 * Checks whether an event has been attached to a component.
		 * @ko 컴포넌트에 이벤트가 등록됐는지 확인한다.
		 * @method eg.Component#hasOn
		 * @param {String} eventName The name of the event to be attached <ko>등록 여부를 확인할 이벤트의 이름</ko>
		 * @return {Boolean} Indicates whether the event is attached. <ko>이벤트 등록 여부</ko>
		 * @example
			var Some = eg.Class.extend(eg.Component,{
				"some": function(){
					this.hasOn("hi");// check hi event.
				}
			});
		 */
		hasOn: function(eventName) {
			return !!this.eventHandler[eventName];
		},
		/**
		 * Attaches an event to a component.
		 * @ko 컴포넌트에 이벤트를 등록한다.
		 * @method eg.Component#on
		 * @param {eventName} eventName The name of the event to be attached <ko>등록할 이벤트의 이름</ko>
		 * @param {Function} handlerToAttach The handler function of the event to be attached <ko>등록할 이벤트의 핸들러 함수</ko>
		 * @return {eg.Component} An instance of a component itself<ko>컴포넌트 자신의 인스턴스</ko>
		 * @example
			var Some = eg.Class.extend(eg.Component,{
				"hi": function(){},
				"some": function(){
					this.on("hi",this.hi); //attach event
				}
			});
		 */
		on: function(eventName, handlerToAttach) {
			if (typeof eventName === "object" &&
			typeof handlerToAttach === "undefined") {
				var eventHash = eventName;
				var i;
				for (i in eventHash) {
					this.on(i, eventHash[i]);
				}
				return this;
			} else if (typeof eventName === "string" &&
				typeof handlerToAttach === "function") {
				var handlerList = this.eventHandler[eventName];

				if (typeof handlerList === "undefined") {
					handlerList = this.eventHandler[eventName] = [];
				}

				handlerList.push(handlerToAttach);
			}

			return this;
		},
		/**
		 * Detaches an event from the component.
		 * @ko 컴포넌트에 등록된 이벤트를 해제한다
		 * @method eg.Component#off
		 * @param {eventName} eventName The name of the event to be detached <ko>해제할 이벤트의 이름</ko>
		 * @param {Function} handlerToDetach The handler function of the event to be detached <ko>해제할 이벤트의 핸들러 함수</ko>
		 * @return {eg.Component} An instance of a component itself <ko>컴포넌트 자신의 인스턴스</ko>
		 * @example
			var Some = eg.Class.extend(eg.Component,{
				"hi": function(){},
				"some": function(){
					this.off("hi",this.hi); //detach event
				}
			});
		 */
		off: function(eventName, handlerToDetach) {
			// All event detach.
			if (arguments.length === 0) {
				this.eventHandler = {};
				return this;
			}

			// All handler of specific event detach.
			if (typeof handlerToDetach === "undefined") {
				if (typeof eventName === "string") {
					this.eventHandler[eventName] = undefined;
					return this;
				} else {
					var eventHash = eventName;
					for (var i in eventHash) {
						this.off(i, eventHash[i]);
					}
					return this;
				}
			}

			// The handler of specific event detach.
			var handlerList = this.eventHandler[eventName];
			if (handlerList) {
				var k;
				var handlerFunction;
				for (k = 0; handlerFunction = handlerList[k]; k++) {
					if (handlerFunction === handlerToDetach) {
						handlerList.splice(k, 1);
						break;
					}
				}
			}

			return this;
		}
	});
});

