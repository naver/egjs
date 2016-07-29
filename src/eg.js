/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

eg.module("eg", ["jQuery", eg, window, eg.Agent], function($, ns, global, Agent) {
	"use strict";

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
	 * @description A string containing the egjs version number.
	 * @ko egjs 버전
	 */
	ns.VERSION = "#__VERSION__#";
	ns.hook =  {};
	/**
	* Get the value of user-agent information the browser.
	* @ko 브라우저의 user-agent 정보를 반환한다.
	* @method eg#agent
	* @return {Object} agent
	* @return {Object} agent.os os infomation <ko>os 정보</ko>
	* @return {String} agent.os.name os name (android, ios, window, mac) <ko>os 이름 (android, ios, window, mac)</ko>
	* @return {String} agent.os.version os version <ko>os 버전</ko>
	* @return {String} agent.browser browser information <ko>브라우저 정보</ko>
	* @return {String} agent.browser.name browser name (default, safari, chrome, sbrowser, ie, firefox) <ko>브라우저 이름 (default, safari, chrome, sbrowser, ie, firefox)</ko>
	* @return {String} agent.browser.version browser version <ko>브라우저 버전 </ko>
	* @return {String} agent.browser.webview check to see if the browser is a webview<ko>웹뷰 브라우저 여부</ko>
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
	ns.agent = function() {
		var info = Agent.create(global.navigator.userAgent);
		return resultCache(this, "agent", [info], info);
	};

	/**
	 * Get the string containing css 'translate' syntax.
	 *
	 * @ko CSS translate 구문을 반환한다.
	 * @method eg#translate
	 * @param {String} x x-axis <ko>x축</ko>
	 * @param {String} y y-axis <ko>y축</ko>
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
	 * Check to see if the hardware acceleration is suitable to use.
	 *
	 * @ko 하드웨어 가속을 사용하는 것이 적합한지 확인한다.
	 * @method eg#isHWAccelerable
	 * @return {Boolean}
	 * @example
eg.isHWAccelerable();  // Returns 'true' when hardware acceleration is supported

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
		var agent = ns.agent();
		var osVersion = agent.os.version;
		var browser = agent.browser.name;
		var browserVersion = agent.browser.version;
		var useragent;

		// chrome 25- has a text blur bug (except Samsung's sbrowser)
		if (browser.indexOf("chrome") !== -1) {
			result = browserVersion >= "25";
		} else if (/ie|edge|firefox|safari|inapp/.test(browser)) {
			result = true;
		} else if (agent.os.name.indexOf("android") !== -1) {
			// for Xiaomi
			useragent = (Agent.ua.match(/\(.*\)/) || [null])[0];

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
	 * Check to see CSS transition is suitable to use.
	 *
	 * @ko CSS transtion을 사용하는 것이 적합한지 확인한다.
	 * @method eg#isTransitional
	 * @return {Boolean}
	 * @example
eg.isTransitional();  // Returns 'true' when CSS transition is supported.

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
		var agent = ns.agent();
		var browser = agent.browser.name;

		if (/chrome|firefox|sbrowser/.test(browser)) {
			result = true;
		} else {
			switch (agent.os.name) {
				case "ios" :
					result = /safari|inapp/.test(browser) &&
							parseInt(agent.os.version, 10) < 6;
					break;
				case "window" :
					result = /safari/.test(browser) ||
							(/ie/.test(browser) &&
								parseInt(agent.browser.nativeVersion, 10) >= 10);
					break;
				default :
					result = /safari/.test(browser);
					break;
			}
		}
		return resultCache(this, "isTransitional", [result, agent], result);
	};

	// 1. user press one position on screen.
	// 2. user moves to the other position on screen.
	// 3. when user releases fingers on screen, 'click' event is fired at previous position.
	ns._hasClickBug = function() {
		var agent = ns.agent();
		var result = agent.browser.name === "safari";

		return resultCache(this, "_hasClickBug", [result, agent], result);
	};

	/**
	* The polyfill for 'requestAnimationFrame'
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
	/**
	* The polyfill for 'cancelAnimationFrame'
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

	$.extend($.easing, {
		easeOutCubic: function(p) {
			return 1 - Math.pow(1 - p, 3);
		}
	});
});