/*! EvergreenJs - v0.0.1 - 2015-03-31
* Copyright (c) 2015 ; Licensed LGPL v2 */
"use strict";
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(callback, thisArg) {
    var T, k;

    if (this == null) {
      throw new TypeError(" this is null or not defined");
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);
    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {
      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {
        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[k];
        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
  // 8. return undefined
  };
}

if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === "[object Array]";
  };
}
if (!Function.prototype.bind) {
	Function.prototype.bind = function(oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5
			// internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}
		var aArgs  = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			NOP  = function() {},
			Bound  = function() {
			  return fToBind.apply(this instanceof NOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
			};
		NOP.prototype = this.prototype;
		Bound.prototype = new NOP();
		return Bound;
	};
}
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if(!Object.keys) {
	Object.keys = (function() {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({ toString: null }).propertyIsEnumerable("toString"),
			dontEnums = [
				"toString",
				"toLocaleString",
				"valueOf",
				"hasOwnProperty",
				"isPrototypeOf",
				"propertyIsEnumerable",
				"constructor"
			],
			dontEnumsLength = dontEnums.length;

		return function(obj) {
			if (typeof obj !== "object" && (typeof obj !== "function" || obj === null)) {
				throw new TypeError("Object.keys called on non-object");
			}

			var result = [], prop, i;

			for (prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					result.push(prop);
				}
			}

			if (hasDontEnumBug) {
				for (i = 0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) {
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	}());
}
// redefine requestAnimationFrame and cancelAnimationFrame

// @todo change to jindo 'timer.js'
var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame|| window.msRequestAnimationFrame;
var caf = window.cancelAnimationFrame || window.webkitCancelAnimationFrame|| window.mozCancelAnimationFrame|| window.msCancelAnimationFrame;

if(raf&&!caf){
	var keyInfo = {};
	var oldraf = raf;
	raf = function(callback){
		function wrapCallback(){
			if(keyInfo[key]){
			callback();
			}
		}
		var key = oldraf(wrapCallback);
		keyInfo[key] = true;
		return key;
	};
	caf = function(key){
		delete keyInfo[key];
	};
} else if(!(raf&&caf)){
	raf = function(callback) { return window.setTimeout(callback, 16); };
	caf = window.clearTimeout;
}
window.requestAnimationFrame = raf;
window.cancelAnimationFrame = caf;

(function($, global) {
	/**
	 * @namespace eg
	 */
	var ua, agent,
		checkDefaults = function(method) {
			var v = null;
			if(typeof eg.defaults[method] === "function") {
				v = eg.defaults[method](agent);
			}
			return v;
		};



	global.eg = {
		/**
		 * @name eg.VERSION
		 * @description version infomation
	       */
		VERSION : "0.0.1",
		defaults : {},
		_init : function(useragent, dm) {
			ua = useragent || navigator.userAgent;
			dm = dm || document.documentMode || -1;
			/**
			 * Get Agent Information
			 * @method eg#agent
			 * @return {Object} agent
			 * @return {String} agent.os os infomation
			 * @return {String} agent.os.name os name (android, ios, window, mac)
			 * @return {String} agent.os.version os version
			 * @return {String} agent.browser browser information
			 * @return {String} agent.browser.name browser name (default, safari, chrome, sbrowser, ie, firefox)
			 * @return {String} agent.browser.version browser version
			 * @return {String} agent.browser.nativeVersion browser version (in case of ie)
		 	 * @example
// {
//     os : {
//          name : "ios",
//          version : "8.2"
//     },
//     browser : {
//          name : "safari",
//          version : "8.2"
//          nativeVersion : "-1"
//     }
// }
eg.agent;
			 */
			agent = (function() {
				var osMatch = /(iPhone |iPad )?OS ([\d|_]+)/.exec(ua) ||
						/(Android) ([\w.]+)/.exec(ua) ||
						/(Windows NT) ([\d|\.]+)/.exec(ua) ||
						/(Windows Phone) ([\d|\.]+)/.exec(ua) ||
						/(Windows) ([\w|\.]+)/.exec(ua) ||
						/(Mac OS X) ([\w.]+)/.exec(ua) ||
						[],
					browserMatch = /(Chrome|CriOS|Firefox)[\s\/]([\w.]+)/.exec(ua) ||
						/(MSIE|Trident)[\/\s]([\d.]+)/.exec(ua) ||
						[],
					nativeVersion, m;

				// os
				if(osMatch.length >= 3) {
					if(/iPhone|iPad/.test(ua)) {
						osMatch[1] = "ios";
					} else if(/Win/.test(ua)) {
						osMatch[1] = "window";
						osMatch[2] = osMatch[2] === "2000" ? "5.0" : osMatch[2]; // for window 2000
					} else if(/Mac/.test(ua)) {
						osMatch[1] = "mac";
					} else {
						osMatch[1] = osMatch[1].toLowerCase();
					}
					osMatch[2] = osMatch[2].replace(/\_/g,".").replace(/\s/g, "");
				}

				// browser
				if(browserMatch.length >= 3) {
					if(/Chrome|CriOS/.test(ua)) {
						browserMatch[1] = /SAMSUNG/.test(ua) ? "sbrowser" : "chrome";
					} else if(/MSIE|Trident/.test(ua)) {
						browserMatch[1] = "ie";
						// nativeVersion
						if(dm > 0) {
							if(m = /(Trident)[\/\s]([\d.]+)/.exec(ua)) {
								if(m[2] > 3) {
									nativeVersion = parseFloat(m[2],10) + 4;
								}
							} else {
								nativeVersion = dm;
							}
						} else {
							nativeVersion = browserMatch[2];
						}
					} else {
						browserMatch[1] = browserMatch[1].toLowerCase();
					}
				} else if(browserMatch.length === 0 && osMatch[1] && osMatch[1] !== "android") {
					browserMatch = /(Safari)\/([\w.]+)/.exec(ua) || [];
					browserMatch[1] = browserMatch[1].toLowerCase();
					if(/safari/.test(browserMatch[1]) ) {
						browserMatch[2] = /Apple/.test(ua) ? ua.match(/Version\/([\d.]+)/)[1] : null;
					}
				}

				return {
					os: {
						name : osMatch[1] || "",
						version: osMatch[2] || "-1"
					},
					browser : {
						name : browserMatch[1] || "default",
						version : browserMatch[2] || osMatch[2] || "-1",
						nativeVersion : (nativeVersion + "") || "-1"
					}
				};
			})();
			this.agent = agent;
		},
		// __checkLibrary__ : function(condition, message) {
		// 	if(condition) {
		// 		throw {
		// 			message : message,
		// 			type : "[Evergreen]",
		// 			toString : function() {
		// 				return this.type + " " +this.message;
		// 			}
		// 		};
		// 	}
		// },
		/**
		 * Get a translate string.
		 *
		 * @method eg#translate
		 * @param {String} x
		 * @param {String} y
		 * @param {Boolean} [isHA]
		 * @return {String}
		 * @example
eg.translate('10px', '200%');  // translate(10px,200%);
eg.translate('10px', '200%', true);  // translate3d(10px,200%,0);
		 */
		translate : function(x,y, isHA) {
			isHA = isHA || false;
			return "translate" + (isHA ? "3d(" : "(") + x + "," + y + (isHA ? ",0)" : ")");
		},
		/**
		 * If your device could use a hardware acceleration, this method returns "true"
		 *
		 * @method eg#isHWAccelerable
		 * @return {Boolean}
		 * @example
eg.isHWAccelerable();  // if your device could use a hardware acceleration, this method returns "true".

// also, you can control return value
eg.defaults.isHWAccelerable = function(agent) {
	if(agent.os.name === "ios") {
		// if os is 'ios', return value is 'false'
		return false;
	} else if(agent.browser.name === "chrome" ) {
		// if browser is 'chrome', return value is 'true'
		return true;
	} else {
		// defer to a return value of the isHWAccelerable method.
		return null; 	// or return;
	}
}
		 */
		isHWAccelerable : function() {
			var check = checkDefaults("isHWAccelerable");
			if( check != null ) {
				return check;
			} else {
				var result = false,
					osVersion = agent.os.version,
					browser = agent.browser.name,
					browserVersion = agent.browser.version;

				// chrome (less then 25) has a text blur bug.
				// but samsung sbrowser fix it.
				if(/chrome/.test(browser)) {
					result = browserVersion >= "25";
				} else if(/ie|firefox|safari/.test(browser)) {
					result = true;
				} else if(/android/.test(agent.os.name)) {
					var useragent = (ua.match(/\(.*\)/) || [null])[0];

					// android 4.1+ blacklist
					// EK-GN120 : Galaxy Camera, SM-G386F : Galaxy Core LTE
					result = (osVersion >= "4.1.0" && !/EK-GN120|SM-G386F/.test(useragent)) ||
						// SHW-M420 : Galaxy Nexus , SHW-M200 : NexusS , GT-S7562 : Galaxy S duos
						(osVersion >= "4.0.3" &&
							/SHW-|SHV-|GT-|SCH-|SGH-|SPH-|LG-F160|LG-F100|LG-F180|LG-F200|EK-|IM-A|LG-F240|LG-F260/.test(useragent) &&
							!/SHW-M420|SHW-M200|GT-S7562/.test(useragent));
				}
				return result;
			}
		},
		/**
		 * If your device could use a css transtion, this method returns "true"
		 *
		 * @method eg#isTransitional
		 * @return {Boolean}
		 * @example
eg.isTransitional();  // if your device could use a css transtion, this method returns "true".

// also, you can control return value
eg.defaults.isTransitional = function(agent) {
	if(agent.os.name === "ios") {
		// if os is 'ios', return value is 'false'
		return false;
	} else if(agent.browser.name === "chrome" ) {
		// if browser is 'chrome', return value is 'true'
		return true;
	} else {
		// defer to a return value of the isTransitional method.
		return null; 	// or return;
	}
}
		 */
		isTransitional : function() {
			var check = checkDefaults("isTransitional");
			if( check != null ) {
				return check;
			} else {
				var result = false,
					browser = agent.browser.name;
				if(/chrome|firefox/.test(browser)) {
					result = true;
				} else {
					switch(agent.os.name) {
						case "ios" :
							result = /safari/.test(browser) && parseInt(agent.os.version,10) < 6;
							break;
						case "window" :
							result = /safari/.test(browser) || (/ie/.test(browser) && parseInt(agent.browser.nativeVersion,10) >= 10);
							break;
						default :
							result = /chrome|firefox|safari/.test(browser);
							break;
					}
				}
				return result;
			}
		}
	};

	/**
	 * @name eg.DIRECTION_NONE
	 * @constant
    	 * @type {Number}
       */
	global.eg.DIRECTION_NONE = 1;
	/**
	 * @name eg.DIRECTION_LEFT
	 * @constant
    	 * @type {Number}
       */
	global.eg.DIRECTION_LEFT = 2;
	/**
	 * @name eg.DIRECTION_RIGHT
	 * @constant
    	 * @type {Number}
       */
	global.eg.DIRECTION_RIGHT = 4;
	/**
	 * @name eg.DIRECTION_UP
	 * @constant
    	 * @type {Number}
       */
	global.eg.DIRECTION_UP = 8;
	/**
	 * @name eg.DIRECTION_DOWN
	 * @constant
    	 * @type {Number}
       */
	global.eg.DIRECTION_DOWN = 16;
	/**
	 * @name eg.DIRECTION_HORIZONTAL
	 * @constant
    	 * @type {Number}
       */
	global.eg.DIRECTION_HORIZONTAL = global.eg.DIRECTION_LEFT | global.eg.DIRECTION_RIGHT;
	/**
	 * @name eg.DIRECTION_VERTICAL
	 * @constant
    	 * @type {Number}
       */
	global.eg.DIRECTION_VERTICAL = global.eg.DIRECTION_UP | global.eg.DIRECTION_DOWN;
	/**
	 * @name eg.DIRECTION_ALL
	 * @constant
    	 * @type {Number}
       */
	global.eg.DIRECTION_ALL = global.eg.DIRECTION_HORIZONTAL | global.eg.DIRECTION_VERTICAL;

	global.eg._init();
})(jQuery, window);
(function(ns) {
	/**
	 * Class
	 * The Class() object is used to implement the application using object-oriented programming.
	 * @class
	 * @name eg.Class
	 */
    ns.Class = function(oDef) {
		var typeClass = function typeClass() {
			if (typeof oDef.construct === "function") {
				oDef.construct.apply(this, arguments);
			}
		};

		typeClass.prototype = oDef;
		typeClass.prototype.constructor = typeClass;
		return typeClass;
	};
	/**
	 * The extend() method extends a specific class.
	 * @static
	 * @method eg.Class.extend
	 * @param {Class} oSuperClass
	 * @param {Object} oDef
	 * @return {Class}
	 */

	ns.Class.extend = function(oSuperClass, oDef) {
		var extendClass = function extendClass() {
			// Call a parent constructor
			oSuperClass.apply(this, arguments);

			// Call a child constructor
			if (typeof oDef.construct === "function") {
				oDef.construct.apply(this, arguments);
			}
		};

		var ExtProto = function() {};
		ExtProto.prototype = oSuperClass.prototype;
		//extendClass.$super = oSuperClass.prototype; //'super' is supported not yet.

		var oExtProto = new ExtProto();
		for (var i in oDef) {
			if (oDef.hasOwnProperty(i)) {
				oExtProto[i] = oDef[i];
			}
		}
		oExtProto.constructor = extendClass;
		extendClass.prototype = oExtProto;

		return extendClass;
	};
})(eg);
window.eg = window.eg || {};
(function(ns) {
	/**
	 * Component
	 * @class
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
		 * @method eg.Component#trigger
		 * @param {String} eventName
		 * @param {Object} customEvent
		 * @return {Boolean} 
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
		 * @method eg.Component#hasOn
		 * @param {String} eventName
		 * @return {Boolean} 
		 */
		hasOn : function(eventName){
			return !!this.eventHandler[eventName];
		},
		/**
		 * Attach an event handler function.
		 * @method eg.Component#on
		 * @param {eventName} eventName
		 * @param {Function} handlerToAttach
		 * @return {Instance} 
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
		 * @method eg.Component#off
		 * @param {eventName} eventName
		 * @param {Function} handlerToDetach
		 * @return {Instance} 
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
						if(eventHash.hasOwnProperty(i)) {
							this.off(i, eventHash[i]);
						}
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
})(eg);




(function($, ns) {
	// It is scheduled to be removed in case of build process.
	// ns.__checkLibrary__( !("Hammer" in window), "You must download Hammerjs. (http://hammerjs.github.io/)\n\ne.g. bower install hammerjs");
	// ns.__checkLibrary__( !("easeOutQuint" in $.easing), "You must download jQuery Easing Plugin(http://gsgd.co.uk/sandbox/jquery/easing/)\n\ne.g. bower install jquery.easing");
	/**
	 * MovableCoord
	 * @class
	 * @name eg.MovableCoord
	 * @extends eg.Component
	 *
	 * @param {Object} [options]
	 * @param {Array} options.min
	 * @param {Number} options.min.0 minimum x position
	 * @param {Number} options.min.1 minimum y position
	 *
	 * @param {Array} options.max
	 * @param {Number} options.max.0 maximum x position
	 * @param {Number} options.max.1 maximum y position
	 *
	 * @param {String} options.bounce
	 * @param {Array} options.bounce
	 * @param {Boolean} options.bounce.0 maximum y position
	 * @param {Boolean} options.bounce.1 maximum y position
	 *
	 * @param {Array} options.bounce
	 * @param {Boolean} options.bounce.0 bounce top range
	 * @param {Boolean} options.bounce.1 bounce right range
	 * @param {Boolean} options.bounce.2 bounce bottom range
	 * @param {Boolean} options.bounce.3 bounce left range
	 *
	 * @param {Array|String} options.margin
	 * @param {Array|String} options.circular
	 * @param {Function} options.easing a easing function of the jQuery Easing Plugin
	 * @param {Number} options.deceleration
	 * @see Hammerjs {@link http://hammerjs.github.io}
	 * @see jQuery Easing Plugin {@link http://gsgd.co.uk/sandbox/jquery/easing}
	 */
	ns.MovableCoord = ns.Class.extend(ns.Component,{
		construct : function(options) {
			this.options = {
				min : [0, 0],
				max : [100, 100],
				bounce : [10, 10, 10, 10],
				margin : [0,0,0,0],
				circular : [false, false, false, false],
				easing : $.easing.easeOutQuint,
				deceleration : 0.0006
			};
			this._reviseOptions(options);
			this._grabOutside = false;
			this._animating = null;
			this._raf = null;
			this._hammers = {};
			this._curHammer = null;
			this._pos = [ this.options.min[0], this.options.min[1] ];
			this._subOptions = {};
			this._animationEnd = this._animationEnd.bind(this);	// for caching
		},
		/**
		 * @method eg.MovableCoord#bind
		 * @param {HTMLElement|String|jQuery} element
		 * @param {Object} [options]
		 * @param {Number} options.direction
		 * @param {Array} options.scale
		 * @param {Number} options.scale.0 x scale
		 * @param {Number} options.scale.1 y scale
		 * @param {Number} options.maximumSpeed
		 * @return {Boolean}
		 */
		bind : function(el, options) {
			var $el = $(el),
				keyValue = $el.data(ns.MovableCoord.KEY),
				subOptions = {
					direction : ns.DIRECTION_ALL,
					scale : [ 1, 1 ],
					maximumSpeed : Infinity
				};
			$.extend(subOptions, options);

			if(keyValue) {
				this._hammers[keyValue].get("pan").set({ direction: subOptions.direction });
			} else {
				keyValue = Math.round(Math.random() * new Date().getTime());
				this._hammers[keyValue] = this._createHammer($el.get(0), subOptions);
				$el.data(ns.MovableCoord.KEY, keyValue);
			}
			return this;
		},
		_createHammer : function(el, subOptions) {
			// create Hammer
			var hammer = new Hammer.Manager(el, {
					recognizers : [
						[
							Hammer.Pan, {
								direction: subOptions.direction,
								threshold: 0
							}
						]
					]
				});
			hammer.on("panstart", function(e) {
				// apply options each
				this._subOptions = subOptions;
				this._curHammer = hammer;
				this._panstart(e);
			}.bind(this, hammer))
			.on("panmove", this._panmove.bind(this))
			.on("panend", this._panend.bind(this));
			return hammer;
		},
		/**
		 * @method eg.MovableCoord#unbind
		 * @param {HTMLElement|String|jQuery} element
		 * @return {Boolean}
		 */
		unbind : function(el) {
			var $el = $(el),
				key = $el.data(ns.MovableCoord.KEY);
			if(key) {
				this._hammers[key].destroy();
				delete this._hammers[key];
				$el.data(ns.MovableCoord.KEY, null);
			}
		},
		_grab : function() {
			if(this._animating) {
				this._pos = this._getCircularPos(this._pos);
				this._triggerChange(this._pos, true);
				this._animating = null;
				this._raf && cancelAnimationFrame(this._raf);
				this._raf = null;
			}
		},
		_getCircularPos : function(pos, min, max, circular) {
			var val;
			min = min || this.options.min;
			max = max || this.options.max;
			circular = circular || this.options.circular;

			// right & left
			if( val = ( (circular[1] && pos[0] > max[0]) && min[0] ) || ( (circular[3] && pos[0] < min[0]) && max[0] ) ) {
			    pos[0] = (pos[0] - min[0]) % (max[0] - min[0] + 1) + val;
			}
			// up & down
			if( val = ( (circular[0] && pos[1] < min[1]) && max[1] ) || ( (circular[2] && pos[1] > max[1]) && min[1] ) ) {
			    pos[1] = (pos[1] - min[1]) % (max[1] - min[1] + 1) + val;
			}
			return pos;
		},
		// determine outside
		_isOutside : function(pos, min, max) {
			return pos[0] < min[0] || pos[1] < min[1] || pos[0] > max[0] || pos[1] > max[1];
		},

		// from outside to outside
		_isOutToOut : function(pos, destPos, min, max) {
			return (pos[0] < min[0] || pos[0] > max[0] || pos[1] < min[1] || pos[1] > max[1]) &&
				(destPos[0] < min[0] || destPos[0] > max[0] || destPos[1] < min[1] || destPos[1] > max[1]);
		},

		// panstart event handler
		_panstart : function() {
			var pos = this._pos;
			this._grab();
			this.trigger("hold", {
				pos : [ pos[0], pos[1] ]
			});
			this._grabOutside = this._isOutside(pos, this.options.min, this.options.max);
		},

		// panmove event handler
		_panmove : function(e) {
			e.srcEvent.preventDefault();
			e.srcEvent.stopPropagation();

			var tv, tn, tx, pos = this._pos,
				min = this.options.min,
				max = this.options.max,
				bounce = this.options.bounce,
				margin = this.options.margin,
				easing = this.options.easing,
				direction = this._subOptions.direction,
				scale = this._subOptions.scale,
				out = [ margin[0] + bounce[0], margin[1] + bounce[1], margin[2] + bounce[2], margin[3] + bounce[3] ];

			// not support offset properties in Hammerjs - start
			var prevInput = this._curHammer.session.prevInput || {};
			if(prevInput) {
			    e.offsetX = e.deltaX - prevInput.deltaX;
			    e.offsetY = e.deltaY - prevInput.deltaY;
			} else {
			    e.offsetX = e.offsetY = 0;
			}
			// not support offset properties in Hammerjs - end

			if(direction & ns.DIRECTION_HORIZONTAL) {
				pos[0] += e.offsetX * scale[0];
			}
			if(direction & ns.DIRECTION_VERTICAL) {
				pos[1] += e.offsetY * scale[1];
			}
			pos = this._getCircularPos(pos, min, max);

			// from outside to inside
			if (this._grabOutside && !this._isOutside(pos, min, max)) {
				this._grabOutside = false;
			}

			// when move pointer is holded outside
			if (this._grabOutside) {
				tn = min[0]-out[3], tx = max[0]+out[1], tv = pos[0];
				pos[0] = tv>tx?tx:(tv<tn?tn:tv);
				tn = min[1]-out[0], tx = max[1]+out[2], tv = pos[1];
				pos[1] = tv>tx?tx:(tv<tn?tn:tv);
			} else {	// when start pointer is holded inside
				// get a initialization slop value to prevent smooth animation.
				var initSlop = easing(null, 0.0001 , 0, 1, 1) / 0.0001;
				if (pos[1] < min[1]) { // up
					tv = (min[1]-pos[1])/(out[0]*initSlop);
					pos[1] = min[1]-easing(null, tv>1?1:tv , 0, 1, 1)* out[0];
				} else if (pos[1] > max[1]) { // down
					tv = (pos[1]-max[1])/(out[2]*initSlop);
					pos[1] = max[1]+easing(null, tv>1?1:tv , 0, 1, 1)*out[2];
				}
				if (pos[0] < min[0]) { // left
					tv = (min[0]-pos[0])/(out[3]*initSlop);
					pos[0] = min[0]-easing(null, tv>1?1:tv , 0, 1, 1)*out[3];
				} else if (pos[0] > max[0]) { // right
					tv = (pos[0]-max[0])/(out[1]*initSlop);
					pos[0] = max[0]+easing(null, tv>1?1:tv , 0, 1, 1)*out[1];
				}
			}
			this._triggerChange(pos, true);
		},

		// panend event handler
		_panend : function(e) {
			var direction = this._subOptions.direction,
				scale = this._subOptions.scale,
				vX =  Math.abs(e.velocityX),
				vY = Math.abs(e.velocityY);

			// console.log(e.velocityX, e.velocityY, e.deltaX, e.deltaY);
			!(direction & ns.DIRECTION_HORIZONTAL) && (vX = 0);
			!(direction & ns.DIRECTION_VERTICAL) && (vY = 0);

			this._animateBy(
				this._getNextOffsetPos( [
					vX * (e.deltaX < 0 ? -1 : 1) * scale[0],
					vY * (e.deltaY < 0 ? -1 : 1) * scale[1]
				], this._subOptions.maximumSpeed ),
			this._animationEnd, false);
		},

		_animationEnd : function() {
			var pos = this._pos,
				min = this.options.min,
				max = this.options.max;
			this._animateTo( [
				Math.min(max[0], Math.max(min[0], pos[0])),
				Math.min(max[1], Math.max(min[1], pos[1]))
			] , this.trigger.bind(this, "animationEnd"), true);
		},

		_getNextOffsetPos : function(speeds, maximumSpeed) {
			var normalSpeed = Math.min(maximumSpeed || Infinity, Math.sqrt(speeds[0]*speeds[0]+speeds[1]*speeds[1])),
				duration = Math.abs(normalSpeed / -this.options.deceleration);
			return [
				speeds[0]/2 * duration,
				speeds[1]/2 * duration
			];
		},

		_getDurationFromPos : function(pos) {
			var normalPos = Math.sqrt(pos[0]*pos[0]+pos[1]*pos[1]),
				duration = Math.sqrt(normalPos / this.options.deceleration * 2);

			// when duration was under 100, duration is zero
			return duration < 100 ? 0 : duration;
		},

		_animateBy : function(offset, callback, isBounce, duration) {
			var pos = this._pos;
			return this._animateTo([
				pos[0] + offset[0],
				pos[1] + offset[1]
			], callback, isBounce, duration);
		},

		_getPointOfIntersection : function(depaPos, destPos) {
			var circular = this.options.circular,
				bounce = this.options.bounce,
				min = this.options.min,
				max = this.options.max,
				boxLT = [ min[0]-bounce[3], min[1]-bounce[0] ],
				boxRB = [ max[0]+bounce[1], max[1]+bounce[2] ],
				xd, yd;
			destPos = [destPos[0], destPos[1]];
			xd = destPos[0]-depaPos[0], yd = destPos[1]-depaPos[1];
			if (!circular[3]) { destPos[0] = Math.max(boxLT[0], destPos[0]); } // left
			if (!circular[1]) { destPos[0] = Math.min(boxRB[0], destPos[0]); } // right
			destPos[1] = xd ? depaPos[1]+yd/xd*(destPos[0]-depaPos[0]) : destPos[1];

			if (!circular[0]) { destPos[1] = Math.max(boxLT[1], destPos[1]); } // up
			if (!circular[2]) { destPos[1] = Math.min(boxRB[1], destPos[1]); } // down
			destPos[0] = yd ? depaPos[0]+xd/yd*(destPos[1]-depaPos[1]) : destPos[0];
			return destPos;

		},

		_isCircular : function(circular, destPos, min, max) {
			return (circular[0] && destPos[1] < min[1]) ||
				(circular[1] && destPos[0] > max[0]) ||
				(circular[2] && destPos[1] > max[1]) ||
				(circular[3] && destPos[0] < min[0]);
		},

		_animateTo : function(absPos, callback, isBounce, duration) {
			var pos = this._pos,
				destPos = this._getPointOfIntersection(pos, absPos),
				param = {
					depaPos : [ pos[0], pos[1] ],
					destPos : destPos,
					bounce : isBounce
				};
			if (!isBounce) {
				this.trigger("release", param);
			}
			this._afterReleaseProcess(param, callback, isBounce, duration);
		},
		// when user release a finger or poiner or mouse
		_afterReleaseProcess : function(param, callback, isBounce, duration) {
			/*
			caution :: update option values because options was changed by "release" event
			 */
			var pos = this._pos,
				min = this.options.min,
				max = this.options.max,
				circular = this.options.circular,
				destPos = param.destPos,
				isCircular = this._isCircular(circular, destPos, min, max);
			this._isOutToOut(pos, destPos, min, max) && (destPos = pos);

			duration = duration || Math.min( Infinity,
				this._getDurationFromPos( [ Math.abs(destPos[0]-pos[0]), Math.abs(destPos[1]-pos[1]) ] ) );

			var	done = function() {
					this._animating = null;
					// 내부 좌표값 변경
					pos[0] = Math.round(destPos[0]);
					pos[1] = Math.round(destPos[1]);
					pos = this._getCircularPos(pos, min, max, circular);
					callback && callback();
				}.bind(this);

			if (!duration) { return done(); }

			// prepare animation parameters
			param = {
				duration : duration,
				depaPos : [ pos[0], pos[1] ],
				destPos : destPos,
				isBounce : isBounce,
				isCircular : isCircular,
				done : done
			};

			var retTrigger = this.trigger("animation", param);
			// You can't stop the 'animation' event when 'circular' is true.
			if (isCircular && !retTrigger) {
				throw new Error("You can't stop the 'animation' event when 'circular' is true.");
			}
			param.depaPos = pos;
			param.startTime = new Date().getTime();
			this._animating = param;

			if (retTrigger) {
				// console.error("depaPos", pos, "depaPos",destPos, "duration", duration, "ms");
				var animating = this._animating,
					self = this;
				(function loop() {
					self._raf=null;
					if (self._frame(animating) >= 1) { return done(); } // animationEnd
					self._raf = requestAnimationFrame(loop);
				})();
			}
		},

		// animation frame (0~1)
		_frame : function(animating) {
			var curTime = new Date() - animating.startTime,
				per = Math.min(1, curTime / animating.duration),
				easingPer = this.options.easing(null, curTime, 0, 1, animating.duration),
				dist,
				pos = [ animating.depaPos[0], animating.depaPos[1] ];

			if(pos[0] !== animating.destPos[0]) {
				dist = animating.destPos[0] - pos[0];
				pos[0] += dist * easingPer;
			}
			if(pos[1] !== animating.destPos[1]) {
				dist = animating.destPos[1] - pos[1];
				pos[1] += dist * easingPer;
			}
			pos = this._getCircularPos(pos);
			this._triggerChange(pos, false);
			return per;
		},

		// set up 'css' expression
		_reviseOptions : function(options) {
			var key;
			["bounce", "margin", "circular"].forEach(function(v) {
				key = options[v];
				if(key != null) {
					if(Array.isArray(key) ) {
						if( key.length === 2) {
							options[v] = [ key[0], key[1], key[0], key[1] ];
						} else {
							options[v] = [ key[0], key[1], key[2], key[3] ];
						}
					} else if(/string|number|boolean/.test(typeof key) ) {
						options[v] = [ key, key, key, key ];
					} else {
						options[v] = null;
					}
				}
			});
			$.extend(this.options, options);
		},

		// trigger 'change' event
		_triggerChange : function(pos, holding) {
			this.trigger("change", {
				pos : [ pos[0], pos[1] ],
				holding : holding
			});
		},


		/**
		 * get current position
		 * @method eg.MovableCoord#get
		 * @return {Array} pos
		 * @return {Number} pos.0 x position
		 * @return {Number} pos.1 y position
		 */
		get : function() {
			return [ this._pos[0],this._pos[1] ];
		},

		/**
		 * set to position
		 * @method eg.MovableCoord#setTo
		 * @param {Number} x
		 * @param {Number} y
		 * @return {Instance}
		 */
		setTo : function(x, y) {
			this._grab();
			var pos = [ this._pos[0], this._pos[1] ],
				circular = this.options.circular,
				min = this.options.min,
				max = this.options.max;
			if( x === pos[0] && y === pos[1] ) {
				return this;
			}

			if( x !== pos[0] ) {
				if (!circular[3]) { x = Math.max(min[0], x); }
				if (!circular[1]) { x = Math.min(max[0], x); }
			}
			if( y !== pos[1] ) {
				if (!circular[0]) { y = Math.max(min[1], y); }
				if (!circular[2]) { y = Math.min(max[1], y); }
			}
			this._pos = this._getCircularPos( [ x, y ] );
			this._triggerChange(this._pos, false);
			return this;
		},
		/**
		 * set to position relatively
		 * @method eg.MovableCoord#setBy
		 * @param {Number} x
		 * @param {Number} y
		 * @return {Array}
		 */
		setBy : function(x, y) {
			return this.setTo(
				x != null ? this._pos[0] + x : this._pos[0],
				y != null ? this._pos[1] + y : this._pos[1]
			);
		},

		/**
		 * release resources and off custom events
		 * @method eg.MovableCoord#destroy
		 */
		destroy : function() {
			this.off();
			for(var p in this._hammers) {
				if(this._hammers.hasOwnProperty(p)) {
					this._hammers[p].destroy();
					this._hammers[p] = null;
				}
			}
		}
	});
	ns.MovableCoord.KEY = "__MOVABLECOORD__";
})(jQuery, eg);