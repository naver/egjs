"use strict";
(function($, global) {
	/**
	 * @namespace eg
	 */
	var ua = navigator.userAgent,
		checkDefaults = function(method) {
			var v = null;
			if(typeof eg.defaults[method] === "function") {
				v = eg.defaults[method](agent);
			}
			return v;
		},
		agent = (function() {
			var osMatch = /(iPhone|iPad) OS ([\w.]+)/.exec(ua) ||
					/(Android) ([\w.]+)/.exec(ua) ||
					[],
				browserMatch = /(Chrome|CriOS)[ \/]([\w.]+)/.exec(ua) ||
					[];
			if(osMatch.length >= 2) {
				osMatch[1] = /iPhone|iPad/.test(osMatch[1]) ? "ios" : osMatch[1].toLowerCase() ;
				osMatch[2] = osMatch[2].replace(/\_/g,".").replace(/\s/g, "");
			}
			if(browserMatch.length >= 2) {
				if(/Chrome|CriOS/.test(browserMatch[1])) {
					browserMatch[1] = /SAMSUNG/.test(ua) ? "sbrowser" : "chrome";
				}
			}
			return {
				os: osMatch[1] || "",
				osVersion: osMatch[2] || "0",
				browser : browserMatch[1] || "default",
				browserVersion : browserMatch[2] || osMatch[2],
			};
		})();
	global.eg = {
		/**
		 * @name eg.VERSION
		 * @description version infomation
	       */
		VERSION : "#__VERSION__#",
		defaults : {},
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
		 * get a translate string.
		 *
		 * @method eg#translate
		 * @param {String} x
		 * @param {String} y
		 * @param {Boolean} [isHA]
		 * @return {String}
		 * @example
eg.translate('10px', '200%');  // translate(10px,200%)
eg.translate('10px', '200%', true);  // translate3d(10px,200%,0)
		 */
		translate : function(x,y, isHA) {
			isHA = isHA || false;
			return "translate" + (isHA ? "3d(" : "(") + x + "," + y + (isHA ? ",0)" : ")");
		},
		/**
		 * if your device could use a hardware acceleration, this method returns "true"
		 *
		 * @method eg#isHardwareAccelerable
		 * @param {Function} [interrupt function]
		 * @return {Boolean}
		 * @example
eg.isHardwareAccelerable();  // if your device could use a hardware acceleration, this method returns "true".
		 */
		isHardwareAccelerable : function() {
			var check = checkDefaults("isHardwareAccelerable");
			if( check != null ) {
				return check;
			} else {
				var result = false;
				// chrome (less then 25) has a text blur bug.
				// but samsung sbrowser fix it.
				if(/chrome/.test(agent.browser) && agent.browserVersion < "25") {
					// result = false;
				} else if(/android/.test(agent.os)) {
					var ua = ua.match(/\(.*\)/);
					if(ua instanceof Array && ua.length > 0){
						ua=ua[0];
					}
					// android 4.1+ blacklist
					// EK-GN120 : Galaxy Camera, SM-G386F : Galaxy Core LTE
					result = (agent.osVersion >= "4.1.0" && !/EK-GN120|SM-G386F/.test(ua)) ||
						// SHW-M420 : Galaxy Nexus , SHW-M200 : NexusS , GT-S7562 : Galaxy S duos
						(agent.osVersion >= "4.0.3" &&
							/SHW-|SHV-|GT-|SCH-|SGH-|SPH-|LG-F160|LG-F100|LG-F180|LG-F200|EK-|IM-A|LG-F240|LG-F260/.test(ua) &&
							!/SHW-M420|SHW-M200|GT-S7562/.test(ua));
				} else if(/ios/.test(agent.os)) {
					result = true;
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
})(jQuery, window);