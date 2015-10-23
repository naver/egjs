eg.module("eg", ["jQuery", eg, window], function($, ns, global) {
	var raf = global.requestAnimationFrame || global.webkitRequestAnimationFrame ||
				global.mozRequestAnimationFrame || global.msRequestAnimationFrame;
	var caf = global.cancelAnimationFrame || global.webkitCancelAnimationFrame ||
				global.mozCancelAnimationFrame || global.msCancelAnimationFrame;

	if (raf && !caf) {
		var keyInfo = {};
		var oldraf = raf;
		raf = function(callback) {
			function wrapCallback() {
				if (keyInfo[key]) {
					callback();
				}
			}
			var key = oldraf(wrapCallback);
			keyInfo[key] = true;
			return key;
		};
		caf = function(key) {
			delete keyInfo[key];
		};
	} else if (!(raf && caf)) {
		raf = function(callback) {
			return global.setTimeout(callback, 16);
		};
		caf = global.clearTimeout;
	}

	function resultCache(scope, name, param, defaultValue) {
		var method = scope.hook[name];
		if (method) {
			defaultValue = method.apply(scope, param);
		}

		scope[name] = function() {
			var method = scope.hook[name];
			if (method) {
				return method.apply(scope, param);
			}
			return defaultValue;
		};
		return defaultValue;
	}

	/**
	 * @namespace eg
	 * @group egjs
	 */

	/**
	 * @name eg.VERSION
	 * @description version infomation
	 * @ko 버전 정보
	 */
	ns.VERSION = "#VERSION#";
	ns.hook =  {
		// isHWAccelerable : null,
		// isTransitional 	: null,
		// agent : null
	};
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
	/*
	*	{String|RegEx} criteria
	*	{String|RegEx} identity
	*	{String} versionSearch
	*	{String} versionAlias
	*	{String|RegEx} webviewBrowserVersion
	*	{String|RegEx} webviewToken
	*/
	var userAgentRules = {
		browser: [{
			criteria: "PhantomJS",
			identity: "PhantomJS"
		}, {
			criteria: /Edge/,
			identity: "Edge",
			versionSearch: "Edge"
		}, {
			criteria: /MSIE|Trident|Windows Phone/,
			identity: "IE",
			versionSearch: "IEMobile|MSIE|rv"
		}, {
			criteria: /SAMSUNG|SamsungBrowser/,
			identity: "SBrowser",
			versionSearch: "Chrome"
		}, {
			criteria: /Chrome|CriOS/,
			identity: "Chrome"
		}, {
			criteria: /Android/,
			identity: "default"
		}, {
			criteria: /iPhone|iPad/,
			identity: "Safari",
			versionSearch: "Version"
		}, {
			criteria: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		}, {
			criteria: "Firefox",
			identity: "Firefox"
		}],
		os: [{
			criteria: /Windows Phone|Windows NT/,
			identity: "Window",
			versionSearch: "Windows Phone|Windows NT"
		}, {
			criteria: "Windows 2000",
			identity: "Window",
			versionAlias: "5.0"
		}, {
			criteria: /iPhone|iPad/,
			identity: "iOS",
			versionSearch: "iPhone OS|CPU OS"
		}, {
			criteria: "Mac",
			versionSearch: "OS X",
			identity: "MAC"
		}, {
			criteria: /Android/,
			identity: "Android"
		}],

		// Check Webview
		// ios : In the absence of version
		// Android 5.0 && chrome 40+ : when there is a keyword of "; wv" in useragent
		// Under android 5.0 :  when there is a keyword of "NAVER or Daum" in useragent
		webview: [{
			criteria: /iPhone|iPad/,
			browserVersionSearch: "Version",
			webviewBrowserVersion: /-1/
		}, {
			criteria: /iPhone|iPad|Android/,
			webviewToken: /NAVER|DAUM|; wv/

		}],
		defaultString: {
			browser: {
				version: "-1",
				name: "default"
			},
			os: {
				version: "-1",
				name: "unknown"
			}
		}
	};

	var UAParser = {
		getBrowserName: function(browserRules) {
			return this.getIdentityStringFromArray(
				browserRules,
				userAgentRules.defaultString.browser
			);
		},
		getBrowserVersion: function(browserName) {
			var browserVersion;
			var versionToken;

			if (!browserName) {
				return;
			}

			versionToken =
				this.getBrowserRule(browserName).versionSearch || browserName;

			browserVersion = this.extractBrowserVersion(versionToken, this.ua);

			return browserVersion;
		},
		extractBrowserVersion: function(versionToken, ua) {
			var browserVersion = userAgentRules.defaultString.browser.version;
			var versionIndex;
			var versionTokenIndex;
			var versionRegexResult =
				(new RegExp("(" + versionToken + ")", "i")).exec(ua);

			if (!versionRegexResult) {
				return browserVersion;
			}

			versionTokenIndex = versionRegexResult.index;
			versionToken = versionRegexResult[0];
			if (versionTokenIndex > -1) {
				versionIndex = versionTokenIndex + versionToken.length + 1;
				browserVersion = ua.substring(versionIndex)
					.split(" ")[0]
					.replace(/_/g, ".")
					.replace(/\;|\)/g, "");
			}

			return browserVersion;
		},
		getOSName: function(osRules) {
			return this.getIdentityStringFromArray(
				osRules,
				userAgentRules.defaultString.os
			);
		},
		getOSVersion: function(osName) {
			var ua = this.ua;
			var osRule = this.getOSRule(osName);
			var defaultOSVersion = userAgentRules.defaultString.os.version;
			var osVersion;
			var osVersionToken;
			var osVersionRegex;
			var osVersionRegexResult;

			if (!osName) {
				return;
			}

			if (osRule.versionAlias) {
				return osRule.versionAlias;
			}

			osVersionToken = osRule.versionSearch || osName;
			osVersionRegex =
				new RegExp(
					"(" + osVersionToken + ")\\s([\\d_\\.]+|\\d_0)",
					"i"
				);

			osVersionRegexResult = osVersionRegex.exec(ua);
			if (osVersionRegexResult) {
				osVersion = osVersionRegex.exec(ua)[2].replace(/_/g, ".")
													.replace(/\;|\)/g, "");
			}

			return osVersion || defaultOSVersion;
		},
		getOSRule: function(osName) {
			return this.getRule(userAgentRules.os, osName);
		},
		getBrowserRule: function(browserName) {
			return this.getRule(userAgentRules.browser, browserName);
		},
		getRule: function(rules, targetIdentity) {
			var criteria;
			var identityMatched;

			for (var i = 0, rule; rule = rules[i]; i++) {
				criteria = rule.criteria;
				identityMatched =
					new RegExp(rule.identity, "i").test(targetIdentity);
				if (criteria ?
					identityMatched && this.isMatched(this.ua, criteria) :
					identityMatched) {
					return rule;
				}
			}
		},
		getIdentityStringFromArray: function(rules, defaultStrings) {
			for (var i = 0, rule; rule = rules[i]; i++) {
				if (this.isMatched(this.ua, rule.criteria)) {
					return rule.identity || defaultStrings.name;
				}
			}
			return defaultStrings.name;
		},
		isMatched: function(base, target) {
			return target &&
				target.test ? !!target.test(base) : base.indexOf(target) > -1;
		},
		isWebview: function() {
			var ua = this.ua;
			var webviewRules = userAgentRules.webview;
			var isWebview = false;
			var browserVersion;

			for (var i = 0, rule; rule = webviewRules[i]; i++) {
				if (!this.isMatched(ua, rule.criteria)) {
					continue;
				}

				browserVersion =
					this.extractBrowserVersion(rule.browserVersionSearch, ua);

				if (this.isMatched(ua, rule.webviewToken) ||
					this.isMatched(browserVersion, rule.webviewBrowserVersion)) {
					isWebview = true;
					break;
				}
			}

			return isWebview;
		}
	};

	UAParser.create = function(useragent) {
		UAParser.ua = useragent;
		var agent = {
			os: {},
			browser: {}
		};

		agent.browser.name = UAParser.getBrowserName(userAgentRules.browser);
		agent.browser.version = UAParser.getBrowserVersion(agent.browser.name);
		agent.os.name = UAParser.getOSName(userAgentRules.os);
		agent.os.version = UAParser.getOSVersion(agent.os.name);
		agent.browser.webview = UAParser.isWebview();

		agent.browser.name = agent.browser.name.toLowerCase();
		agent.os.name = agent.os.name.toLowerCase();

		return agent;
	};

	ns.agent = function(useragent) {
		var info = UAParser.create(useragent || navigator.userAgent);
		return resultCache(this, "agent", [info], info);
	};

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
	ns.translate = function(x, y, isHA) {
		isHA = isHA || false;
		return "translate" + (isHA ?
								"3d(" : "(") + x + "," + y + (isHA ? ",0)" :
								")");
	};

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
	ns.isHWAccelerable = function() {
		var result = false;
		var agent = this.agent();
		var osVersion = agent.os.version;
		var browser = agent.browser.name;
		var browserVersion = agent.browser.version;
		var useragent;

		// chrome (less then 25) has a text blur bug.
		// but samsung sbrowser fix it.
		if (browser.indexOf("chrome") !== -1) {
			result = browserVersion >= "25";
		} else if (/ie|edge|firefox|safari|inapp/.test(browser)) {
			result = true;
		} else if (agent.os.name.indexOf("android") !== -1) {
			// for Xiaomi
			useragent = (UAParser.ua.match(/\(.*\)/) || [null])[0];

			// android 4.1+ blacklist
			// EK-GN120 : Galaxy Camera, SM-G386F : Galaxy Core LTE
			// SHW-M420 : Galaxy Nexus , SHW-M200 : NexusS , GT-S7562 : Galaxy S duos
			result = (osVersion >= "4.1.0" && !/EK-GN120|SM-G386F/.test(useragent)) ||
				(osVersion >= "4.0.3" &&
					/SHW-|SHV-|GT-|SCH-|SGH-|SPH-|LG-F160|LG-F100|LG-F180|LG-F200|EK-|IM-A|LG-F240|LG-F260/.test(useragent) && !/SHW-M420|SHW-M200|GT-S7562/.test(useragent));
		}
		return resultCache(this, "isHWAccelerable", [result, agent], result);
	};

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
	ns.isTransitional = function() {
		var result = false;
		var agent = this.agent();
		var browser = agent.browser.name;

		if (/chrome|firefox/.test(browser)) {
			result = true;
		} else {
			switch (agent.os.name) {
				case "ios" :
					result = /safari|inapp/.test(browser) &&
							parseInt(agent.os.version, 10) < 6;
					break;
				case "window" :
					result = browser.indexOf("safari") !== -1 ||
							(browser.indexOf("ie") !== -1 &&
								parseInt(agent.browser.nativeVersion, 10) >= 10);
					break;
				default :
					result = /chrome|firefox|safari/.test(browser);
					break;
			}
		}
		return resultCache(this, "isTransitional", [result, agent], result);
	};

	// 1. user press one position on screen.
	// 2. user moves to the other position on screen.
	// 3. when user releases fingers on screen, 'click' event is fired at previous position.
	ns._hasClickBug = function() {
		var agent = this.agent();
		var result = agent.os.name === "ios";

		return resultCache(this, "_hasClickBug", [result, agent], result);
	};

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
	ns.requestAnimationFrame = function(fp) {
		return raf(fp);
	};
	/*
	* cancelAnimationFrame polyfill
	* @ko cancelAnimationFrame 폴리필
	* @method eg#cancelAnimationFrame
	* @param {Number} key
	* @example
		eg.cancelAnimationFrame(timerId);
	* @see  https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
	*/
	ns.cancelAnimationFrame = function(key) {
		caf(key);
	};

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
		easeOutCubic: function(p) {
			return 1 - Math.pow(1 - p, 3);
		}
	});
});
