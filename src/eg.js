eg.module("eg",[window.jQuery, eg, window],function($, ns, global){
	var raf = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame|| global.msRequestAnimationFrame;
	var caf = global.cancelAnimationFrame || global.webkitCancelAnimationFrame|| global.mozCancelAnimationFrame|| global.msCancelAnimationFrame;

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
		raf = function(callback) { return global.setTimeout(callback, 16); };
		caf = global.clearTimeout;
	}

	function resultCache(scope,name,param,defaultValue){
		var method = scope.hook[name];
		
		if(method){
			defaultValue = method.apply(scope,param);
		}

		scope[name] = function () {
			var method = scope.hook[name];
			if(method){
				 return method.apply(scope,param);
			}
			return defaultValue;
		};
		return defaultValue;
	}

	/**
	 * @namespace eg
	 * @group EvergreenJs
	 */
	var ua;
	var eg = {
		/**
		 * @name eg.VERSION
		 * @description version infomation
		 * @ko 버전 정보
	     */
		VERSION : "#__VERSION__#",
		hook : {
			// isHWAccelerable : null,
			// isTransitional 	: null,
			// agent : null
		},
			/**
			 * Get Agent Information
			 * This method is return cached value.
			 * @ko Agent 정보를 반환한다. 값은 캐싱된다.
			 * @method eg#agent
			 * @return {Object} agent
			 * @return {String} agent.os os infomation <ko>os 정보 객체</ko>
			 * @return {String} agent.os.name os name (android, ios, window, mac) <ko>os 이름 (android, ios, window, mac)</ko>
			 * @return {String} agent.os.version os version <ko>os 버전</ko>
			 * @return {String} agent.browser browser information <ko>브라우저 정보 객체</ko>
			 * @return {String} agent.browser.name browser name (default, safari, chrome, sbrowser, ie, firefox) <ko>브라우저 이름 (default, safari, chrome, sbrowser, ie, firefox)</ko>
			 * @return {String} agent.browser.version browser version <ko>브라우저 버전 정보</ko>
			 * @return {String} agent.browser.webview check whether browser is webview <ko>웹뷰 브라우저 여부</ko>
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

			var osMatch = /(Windows Phone) ([\d|\.]+)/.exec(ua) ||
					/(iPhone |iPad )?OS ([\d|_]+)/.exec(ua) ||
					/(Android) ([\w.]+)/.exec(ua) ||
					/(Windows NT) ([\d|\.]+)/.exec(ua) ||
					/(Windows) ([\w|\.]+)/.exec(ua) ||
					/(Mac OS X)( ([\w.]+))?/.exec(ua) ||
					[],
				browserMatch = /(Chrome|CriOS|Firefox)[\s\/]([\w.]+)/.exec(ua) ||
					/(MSIE|IEMobile)[\/\s]([\d.]+)/.exec(ua) ||
					/(Trident)[\/\s]([\d.]+)/.exec(ua) ||
					/(PhantomJS)\/([\d.]+)/.exec(ua) ||
					[];

			// os
			if(osMatch.length >= 3) {
				if(ua.indexOf("Win") !== -1) {
					osMatch[1] = "window";
					osMatch[2] = osMatch[2] === "2000" ? "5.0" : osMatch[2]; // for window 2000
				} else if(/iPhone|iPad/.test(ua)) {
					osMatch[1] = "ios";
				} else if(ua.indexOf("Mac") !== -1) {
					osMatch[1] = "mac";
				} else {
					osMatch[1] = osMatch[1].toLowerCase();
				}
				osMatch[2] = (osMatch[2] || "").replace(/\_/g,".").replace(/\s/g, "");
			}

			// browser
			if(browserMatch.length >= 3) {
				if(/MSIE|IEMobile|Trident/.test(ua)) {
					browserMatch[1] = "ie";
				} else if(/Chrome|CriOS/.test(ua)) {
					browserMatch[1] = ua.indexOf("SAMSUNG") !== -1 ? "sbrowser" : "chrome";
				} else {
					browserMatch[1] = browserMatch[1].toLowerCase();
				}
			} else if(browserMatch.length === 0 && osMatch[1] && osMatch[1] !== "android") {
				browserMatch = /(Safari)\/([\w.]+)/.exec(ua) || (osMatch[1] === "ios" ? ["", "safari"] : ["",""]);
				browserMatch[1] = browserMatch[1].toLowerCase();
				if(browserMatch[0] && browserMatch[1].indexOf("safari") !== -1 ) {
					browserMatch[2] = ua.indexOf("Apple") !== -1 ? ua.match(/Version\/([\d.]+)/)[1] || null : null;
				}
			}

			var info = {
				os: {
					name : osMatch[1] || "",
					version: osMatch[2] || "-1"
				},
				browser : {
					name : browserMatch[1] || "default",
					version : browserMatch[2] || /*osMatch[2] ||*/ "-1"
				}
			};
			info = this._checkWebview(info, ua);
			return resultCache(this,"agent",[info],info);
		},

		// Check Webview
		// ios : In the absence of version
		// Android 5.0 && chrome 40+ : when there is a keyword of "; wv" in useragent
		// Under android 5.0 :  when there is a keyword of "NAVER or Daum" in useragent
		_checkWebview : function(info, ua){
			info.browser.webview = (info.os.name === "android" && ua.indexOf("; wv") > -1) || // Android
			                (info.os.name === "ios" && info.browser.version === "-1") ||    // ios
			                (ua.indexOf("NAVER") > -1 || ua.indexOf("Daum") > -1) ||        //Other
			                false;

            	return info;
		},

		/**
		 * Get a translate string.
		 * @ko translate 문자를 반환한다.
		 * @method eg#translate
		 * @param {String} x x-coordinate <ko>x 좌표</ko>
		 * @param {String} y y-coordinate <ko>y 좌표</ko>
		 * @param {Boolean} [isHA] isHWAccelerable <ko>하드웨어 가속 여부</ko>
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
			if(browser.indexOf("chrome") !== -1) {
				result = browserVersion >= "25";
			} else if(/ie|firefox|safari|inapp/.test(browser)) {
				result = true;
			} else if( agent.os.name.indexOf("android") !== -1) {
				useragent = (ua.match(/\(.*\)/) || [null])[0];

				// android 4.1+ blacklist
				// EK-GN120 : Galaxy Camera, SM-G386F : Galaxy Core LTE
				result = (osVersion >= "4.1.0" && !/EK-GN120|SM-G386F/.test(useragent)) ||
					// SHW-M420 : Galaxy Nexus , SHW-M200 : NexusS , GT-S7562 : Galaxy S duos
					(osVersion >= "4.0.3" &&
						/SHW-|SHV-|GT-|SCH-|SGH-|SPH-|LG-F160|LG-F100|LG-F180|LG-F200|EK-|IM-A|LG-F240|LG-F260/.test(useragent) &&
						!/SHW-M420|SHW-M200|GT-S7562/.test(useragent));
			}
			return resultCache(this,"isHWAccelerable",[result,agent],result);
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

			var browser = agent.browser.name;

			if(/chrome|firefox/.test(browser)) {
				result = true;
			} else {
				switch(agent.os.name) {
					case "ios" :
						result = /safari|inapp/.test(browser) && parseInt(agent.os.version,10) < 6;
						break;
					case "window" :
						result = browser.indexOf("safari") !== -1 || ( browser.indexOf("ie") !== -1 && parseInt(agent.browser.nativeVersion,10) >= 10 );
						break;
					default :
						result = /chrome|firefox|safari/.test(browser);
						break;
				}
			}
			return resultCache(this,"isTransitional",[result,agent],result);
		},

		// 1. user press one position on screen.
		// 2. user moves to the other position on screen.
		// 3. when user releases fingers on screen, 'click' event is fired at previous position.
		_hasClickBug : function() {
			var agent = this.agent(),
				result = "ios" === agent.os.name;

			return resultCache(this,"_hasClickBug",[result, agent],result);
		},

		/*
		 * requestAnimationFrame polyfill
		 * @ko requestAnimationFrame 폴리필
		 * @method eg#requestAnimationFrame
		 * @param {Function} timer function
		 * @return {Number} key
		 * @example
var timerId = eg.requestAnimationFrame(function() {
	console.log("call");
});
		 * @see  https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
		 */
		requestAnimationFrame : function(fp) {
			return raf(fp);
		},
 		/*
		 * cancelAnimationFrame polyfill
		 * @ko cancelAnimationFrame 폴리필
		 * @method eg#cancelAnimationFrame
		 * @param {Number} key
		 * @example
eg.cancelAnimationFrame(timerId);
		 * @see  https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
		 */
		cancelAnimationFrame : function(key) {
			caf(key);
		}
	};

	// Regist method to eg.
	for(var i in eg){
		ns[i] = eg[i];
	}

	/**
	 * @name eg.DIRECTION_NONE
	 * @constant
    	 * @type {Number}
       */
	ns.DIRECTION_NONE = 1;
	/**
	 * @name eg.DIRECTION_LEFT
	 * @constant
    	 * @type {Number}
       */
	ns.DIRECTION_LEFT = 2;
	/**
	 * @name eg.DIRECTION_RIGHT
	 * @constant
    	 * @type {Number}
       */
	ns.DIRECTION_RIGHT = 4;
	/**
	 * @name eg.DIRECTION_UP
	 * @constant
    	 * @type {Number}
       */
	ns.DIRECTION_UP = 8;
	/**
	 * @name eg.DIRECTION_DOWN
	 * @constant
    	 * @type {Number}
       */
	ns.DIRECTION_DOWN = 16;
	/**
	 * @name eg.DIRECTION_HORIZONTAL
	 * @constant
    	 * @type {Number}
       */
	ns.DIRECTION_HORIZONTAL = ns.DIRECTION_LEFT | ns.DIRECTION_RIGHT;
	/**
	 * @name eg.DIRECTION_VERTICAL
	 * @constant
    	 * @type {Number}
       */
	ns.DIRECTION_VERTICAL = ns.DIRECTION_UP | ns.DIRECTION_DOWN;
	/**
	 * @name eg.DIRECTION_ALL
	 * @constant
    	 * @type {Number}
       */
	ns.DIRECTION_ALL = ns.DIRECTION_HORIZONTAL | ns.DIRECTION_VERTICAL;

	$.extend($.easing, {
		easeOutQuint: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t*t*t + 1) + b;
		}
	});
});
