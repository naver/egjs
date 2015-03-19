"use strict";
(function($, global) {
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
		VERSION : "#__VERSION__#",
		__checkLibrary__ : function(condition, message) {
			if(condition) {
				throw {
					message : message,
					type : "[Evergreen]",
					toString : function() {
						return this.type + " " +this.message;
					}
				};
			}
		},
		defaults : {},
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

	// Hammer constants
	global.eg.DIRECTION_NONE = 1;
	global.eg.DIRECTION_LEFT = 2;
	global.eg.DIRECTION_RIGHT = 4;
	global.eg.DIRECTION_UP = 8;
	global.eg.DIRECTION_DOWN = 16;
	global.eg.DIRECTION_HORIZONTAL = global.eg.DIRECTION_LEFT | global.eg.DIRECTION_RIGHT;
	global.eg.DIRECTION_VERTICAL = global.eg.DIRECTION_UP | global.eg.DIRECTION_DOWN;
	global.eg.DIRECTION_ALL = global.eg.DIRECTION_HORIZONTAL | global.eg.DIRECTION_VERTICAL;
})(jQuery, window);