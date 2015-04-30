"use strict";
(function($, global) {
	/**
	 * @namespace eg
	 * @group EvergreenJs
	 */
	var ua;
	// ,
	// 	checkDefaults = function(method) {
	// 		var v = null;
	// 		if(typeof eg.defaults[method] === "function") {
	// 			v = eg.defaults[method](agent);
	// 		}
	// 		return v;
	// 	};



	global.eg = {
		/**
		 * @name eg.VERSION
		 * @description version infomation
		 * @ko 버전 정보
	     */
		VERSION : "#__VERSION__#",
		hook : {
			isHWAccelerable : null,
			isTransitional 	: null,
			agent : null
		},
			/**
			 * Get Agent Information
			 * This method is return cached value.
			 * @ko Agent 정보를 반환한다. 값은 캐싱된다.
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
eg.agent();
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


eg.hook.agent = function(agent) {
	if(agent.os.name === "naver") {
		agent.browser.name = "inapp";
		return agent;
	} 
}


			 */

		agent : function(useragent){
			ua = useragent || navigator.userAgent;

			var osMatch = /(iPhone |iPad )?OS ([\d|_]+)/.exec(ua) ||
					/(Android) ([\w.]+)/.exec(ua) ||
					/(Windows NT) ([\d|\.]+)/.exec(ua) ||
					/(Windows Phone) ([\d|\.]+)/.exec(ua) ||
					/(Windows) ([\w|\.]+)/.exec(ua) ||
					/(Mac OS X)( ([\w.]+))?/.exec(ua) ||
					[],
				browserMatch = /(Chrome|CriOS|Firefox)[\s\/]([\w.]+)/.exec(ua) ||
					/(MSIE|Trident)[\/\s]([\d.]+)/.exec(ua) ||
					/(PhantomJS)\/([\d.]+)/.exec(ua) ||
					[];

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
				osMatch[2] = (osMatch[2] || "").replace(/\_/g,".").replace(/\s/g, "");
			}

			// browser
			if(browserMatch.length >= 3) {
				if(/Chrome|CriOS/.test(ua)) {
					browserMatch[1] = /SAMSUNG/.test(ua) ? "sbrowser" : "chrome";
				} else if(/MSIE|Trident/.test(ua)) {
					browserMatch[1] = "ie";
				} else {
					browserMatch[1] = browserMatch[1].toLowerCase();
				}
			} else if(browserMatch.length === 0 && osMatch[1] && osMatch[1] !== "android") {
				browserMatch = /(Safari)\/([\w.]+)/.exec(ua) || ["","inapp"];
				browserMatch[1] = browserMatch[1].toLowerCase();
				if(/safari/.test(browserMatch[1]) ) {
					browserMatch[2] = /Apple/.test(ua) ? ua.match(/Version\/([\d.]+)/)[1] : null;
				}
			}

			var info = {
				os: {
					name : osMatch[1] || "",
					version: osMatch[2] || "-1"
				},
				browser : {
					name : browserMatch[1] || "default",
					version : browserMatch[2] || osMatch[2] || "-1"
				}
			};

			if(this.hook.agent !== null){
				info = this.hook.agent(info);
			}

			this.agent = function(){
				return info;
			};

			return info;

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
		 * @ko translate 문자를 반환한다.
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
		 * This method is return cached value.
		 * @ko 해당 기기에서 하드웨어 가속을 할 수 있다면 true을 반환하며, 값은 캐싱된다.
		 * @method eg#isHWAccelerable
		 * @return {Boolean}
		 * @example
eg.isHWAccelerable();  // if your device could use a hardware acceleration, this method returns "true".

// also, you can control return value
eg.hook.isHWAccelerable = function(defalutVal,agent) {
	if(agent.os.name === "ios") {
		// if os is 'ios', return value is 'false'
		return false;
	} else if(agent.browser.name === "chrome" ) {
		// if browser is 'chrome', return value is 'true'
		return true;
	}
	return defaultVal;

}
		 */
		isHWAccelerable : function() {
			var result = false,
				agent = this.agent(),
				osVersion = agent.os.version,
				browser = agent.browser.name,
				browserVersion = agent.browser.version,
				useragent;

			// chrome (less then 25) has a text blur bug.
			// but samsung sbrowser fix it.
			if(/chrome/.test(browser)) {
				result = browserVersion >= "25";
			} else if(/ie|firefox|safari|inapp/.test(browser)) {
				result = true;
			} else if(/android/.test(agent.os.name)) {
				useragent = (ua.match(/\(.*\)/) || [null])[0];

				// android 4.1+ blacklist
				// EK-GN120 : Galaxy Camera, SM-G386F : Galaxy Core LTE
				result = (osVersion >= "4.1.0" && !/EK-GN120|SM-G386F/.test(useragent)) ||
					// SHW-M420 : Galaxy Nexus , SHW-M200 : NexusS , GT-S7562 : Galaxy S duos
					(osVersion >= "4.0.3" &&
						/SHW-|SHV-|GT-|SCH-|SGH-|SPH-|LG-F160|LG-F100|LG-F180|LG-F200|EK-|IM-A|LG-F240|LG-F260/.test(useragent) &&
						!/SHW-M420|SHW-M200|GT-S7562/.test(useragent));
			}

			if(this.hook.isHWAccelerable !== null){
				result = this.hook.isHWAccelerable(result,agent);
			}

			this.isHWAccelerable = function(){
				return result;
			};
			return this.isHWAccelerable();
		},
		/**
		 * If your device could use a css transtion, this method returns "true"
		 * This method is return cached value.
		 * @ko 해당 기기에서 css transtion을 할 수 있다면 true을 반환하며, 값은 캐싱된다.
		 * @method eg#isTransitional
		 * @return {Boolean}
		 * @example
eg.isTransitional();  // if your device could use a css transtion, this method returns "true".

// also, you can control return value
eg.hook.isTransitional = function(defaultVal, agent) {
	if(agent.os.name === "ios") {
		// if os is 'ios', return value is 'false'
		return false;
	} else if(agent.browser.name === "chrome" ) {
		// if browser is 'chrome', return value is 'true'
		return true;
	} 
	return defaultVal;
}
		 */
		isTransitional : function() {
			var result = false,
				agent = this.agent();

			// if( result === null ) {
			var browser = agent.browser.name;

			if(/chrome|firefox/.test(browser)) {
				result = true;
			} else {
				switch(agent.os.name) {
					case "ios" :
						result = /safari|inapp/.test(browser) && parseInt(agent.os.version,10) < 6;
						break;
					case "window" :
						result = /safari/.test(browser) || (/ie/.test(browser) && parseInt(agent.browser.nativeVersion,10) >= 10);
						break;
					default :
						result = /chrome|firefox|safari/.test(browser);
						break;
				}
			}
			// }

			this.isTransitional = function(){
				return result;
			};
			return this.isTransitional();
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