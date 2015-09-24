/*! egjs - v0.0.2
* Copyright (c) 2015 ; Licensed LGPL v2 */
"use strict";
(function(global) {
	global.eg = {};
	/**
	 * Regist module.
	 * @private
	 */
	global.eg.module = function(name, di, fp) {
		fp.apply(global, di);
	};
})(window);

eg.module("animate", [window.jQuery, window], function($, global) {
	/**
     * Extends jQuery animate in order to use 'transform' property.
     * @ko jQuery animate 사용시 transform을 사용할 수 있도록 확장한 animate 메소드
     * @name jQuery#animate
     * @method
     * @param {Object} properties An object of CSS properties and values that the animation will move toward.
     * @param {Number|String} [duration=4000] A string or number determining how long the animation will run.
     * @param {String} [easing="swing"] A string indicating which easing function to use for the transition.
     * @param {Function} [complete] A function to call once the animation is complete.
     *
     * @example
     * $("#box")
     * 		.animate({"transform" : "translate3d(150px, 100px, 0px) rotate(20deg) scaleX(1)"} , 3000)
     * 		.animate({"transform" : "+=translate3d(150px, 10%, -20px) rotate(20deg) scale3d(2, 4.2, 1)"} , 3000);
     * @see {@link http://api.jquery.com/animate/}
     *
     * @support {"ie": "10+", "ch" : "latest", "sf" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
     */
	var supportFloat32Array = "Float32Array" in window;
	var CSSMatrix = global.WebKitCSSMatrix || global.MSCSSMatrix ||
					global.OCSSMatrix || global.MozMatrix || global.CSSMatrix;

	/*
	 * Utility functions : matrix and toRadian is copied from transform2d
	 */

	// turns a transform string into its "matrix(A, B, C, D, X, Y)" form (as an array, though)
	function matrix(transform) {
		transform = transform.split(")");
		var trim = $.trim;
		var i = -1;

		// last element of the array is an empty string, get rid of it
		var l = transform.length - 1;
		var split;
		var prop;
		var val;
		var prev = supportFloat32Array ? new Float32Array(6) : [];
		var curr = supportFloat32Array ? new Float32Array(6) : [];
		var rslt = supportFloat32Array ? new Float32Array(6) : [1, 0, 0, 1, 0, 0];

		prev[0] = prev[3] = rslt[0] = rslt[3] = 1;
		prev[1] = prev[2] = prev[4] = prev[5] = 0;

		// Loop through the transform properties, parse and multiply them
		while (++i < l) {
			split = transform[i].split("(");
			prop = trim(split[0]);
			val = split[1];
			curr[0] = curr[3] = 1;
			curr[1] = curr[2] = curr[4] = curr[5] = 0;

			switch (prop) {
				case "translateX":
					curr[4] = parseInt(val, 10);
					break;

				case "translateY":
					curr[5] = parseInt(val, 10);
					break;

				case "translate":
					val = val.split(",");
					curr[4] = parseInt(val[0], 10);
					curr[5] = parseInt(val[1] || 0, 10);
					break;

				case "rotate":
					val = toRadian(val);
					curr[0] = Math.cos(val);
					curr[1] = Math.sin(val);
					curr[2] = -Math.sin(val);
					curr[3] = Math.cos(val);
					break;

				case "scaleX":
					curr[0] = +val;
					break;

				case "scaleY":
					curr[3] = val;
					break;

				case "scale":
					val = val.split(",");
					curr[0] = val[0];
					curr[3] = val.length > 1 ? val[1] : val[0];
					break;

				case "skewX":
					curr[2] = Math.tan(toRadian(val));
					break;

				case "skewY":
					curr[1] = Math.tan(toRadian(val));
					break;

				case "matrix":
					val = val.split(",");
					curr[0] = val[0];
					curr[1] = val[1];
					curr[2] = val[2];
					curr[3] = val[3];
					curr[4] = parseInt(val[4], 10);
					curr[5] = parseInt(val[5], 10);
					break;
			}

			// Matrix product (array in column-major order)
			rslt[0] = prev[0] * curr[0] + prev[2] * curr[1];
			rslt[1] = prev[1] * curr[0] + prev[3] * curr[1];
			rslt[2] = prev[0] * curr[2] + prev[2] * curr[3];
			rslt[3] = prev[1] * curr[2] + prev[3] * curr[3];
			rslt[4] = prev[0] * curr[4] + prev[2] * curr[5] + prev[4];
			rslt[5] = prev[1] * curr[4] + prev[3] * curr[5] + prev[5];

			prev = [rslt[0],rslt[1],rslt[2],rslt[3],rslt[4],rslt[5]];
		}
		return rslt;
	}

	// converts an angle string in any unit to a radian Float
	function toRadian(value) {
		return ~value.indexOf("deg") ?
			parseInt(value, 10) * (Math.PI * 2 / 360) :
			~value.indexOf("grad") ?
				parseInt(value, 10) * (Math.PI / 200) :
				parseFloat(value);
	}

	/**
	 * Get a 'px' converted value if it has a %.
	 * Otherwise it returns value appened with 'px'.
	 */
	function getConverted(val, base) {
		var ret = val;
		var num = val.match(/([0-9]*)%/);

		if (num && num.length >= 1) {
			ret = base * (parseFloat(num[1]) / 100) + "px";
		} else if (val.indexOf("px") === -1) {
			ret = val + "px";
		}

		return ret;
	}

	function correctUnit(transform, width, height) {
		var m;
		var ret = "";
		var arr = transform.split(")");

		for (var i = 0, len = arr.length - 1; i < len; i++) {
			var name = arr[i];

			// '%' is only meaningful on translate.
			if ((m = name.match(/(translate([XYZ]|3d)?|rotate)\(([^)]*)/)) && m.length > 1) {
				if (m[1] === "rotate") {
					if (m[3].indexOf("deg") === -1) {
						name = m[1] + "(" + m[3] + "deg";
					}
				} else {
					switch (m[2]) {
					case "X":
						name = m[1] + "(" + getConverted(m[3], width);
						break;
					case "Y":
						name = m[1] + "(" +  getConverted(m[3], height);
						break;
					case "Z":

						//Meaningless. Do nothing
						break;
					default://2d, 3d
						var nums = m[3].split(",");
						var bases = [width, height, 100];

						for (var k = 0, l = nums.length; k < l; k++) {
							nums[k] = getConverted(nums[k], bases[k]);
						}
						name = m[1] + "(" + nums.join(",");
						break;
					}
				}
			}

			name = " " + name + ")";
			ret += name;
		}

		//Remove wrong '%'s and '+=' because it cannot be translated to a matrix.
		ret = ret.replace("%", "").replace("+=", "");
		return ret;
	}

	/**
	 * Parse a transform atom value.
	 *
	 * "30px" --> {num: 30, unit: "px"}
	 *
	 * Because calculation of string number is heavy,
	 * In advance, convert a string number to a float number with an unit for the use of transformByPos,
	 * which is called very frequently.
	 */
	function toParsedFloat(val) {
		var m = val.match(/(-*[\d|\.]+)(px|deg|rad)*/);
		if (m && m.length >= 1) {
			return {"num": parseFloat(m[1]), "unit": m[2]};
		}
	}

	function getTransformGenerateFunction(transform) {
		var splitted = transform.split(")");
		var list = [];

		for (var i = 0, len = splitted.length - 1; i < len; i++) {
			var parsed = parseStyle(splitted[i]);

			parsed[1] = $.map(parsed[1], toParsedFloat);
			list.push(parsed);
		}

		return function transformByPos(pos) {
			var transform = "";
			var defaultVal = 0;

			$.each(list, function(i) {
				if (list[i][0] === "scale") {
					defaultVal = 1;
				}

				var valStr = $.map(list[i][1], function(value) {
					var val = value.num;
					defaultVal === 1 && (val = val - 1);
					return (defaultVal + val * pos) + (value.unit || "");
				}).join(",");

				transform += list[i][0] + "(" + valStr + ") ";
			});

			return transform;
		};
	}

	function rateFn(element, startTf, endTf) {
		var isRelative = endTf.indexOf("+=") >= 0;
		var start;
		var end;

		// Convert translate unit to 'px'.
		endTf = correctUnit(endTf,
					parseFloat($.css(element, "width")) || 0,
					parseFloat($.css(element, "height")) || 0);

		if (isRelative) {
			start = (!startTf || startTf === "none") ?
						"matrix(1, 0, 0, 1, 0, 0)" : startTf;
			end = getTransformGenerateFunction(endTf);
		} else {
			start = toMatrix(startTf);
			end = toMatrix(endTf);

			//If the type of matrix is not equal, then match to matrix3d
			if (start[1].length < end[1].length) {
				start = toMatrix3d(start);
			} else if (start[1].length > end[1].length) {
				end = toMatrix3d(end);
			}
		}

		return function(pos) {
			var result = [];
			var ret = "";

			if (isRelative) {
				// This means a muliply between a matrix and a transform.
				ret = start + end(pos);
				return ret;
			}

			if (pos === 1) {
				ret = data2String(end);
			} else {
				for (var i = 0, s, e, l = start[1].length; i < l; i++) {
					s = parseFloat(start[1][i]);
					e = parseFloat(end[1][i]);
					result.push(s + (e - s) * pos);
				}

				ret = data2String([start[0], result]);
			}

			return ret;
		};
	}

	/**
	 * ["translate", [100, 0]] --> translate(100px, 0)
	 * {translate : [100, 0]} --> translate(100px, 0)
	 * {matrix : [1, 0, 1, 0, 100, 0]} --> matrix(1, 0, 1, 0, 100, 0)
	 */
	function data2String(property) {
		var name;
		var tmp = [];

		if ($.isArray(property)) {
			name = property[0];
			return name + "(" + property[1].join(unit(name) + ",") + unit(name) + ")";
		} else {
			for (name in property) {
				tmp.push(name);
			}

			return $.map(tmp, function(v) {
				return v + "(" +  property[v] + unit(v) + ")";
			}).join(" ");
		}
	}

	function unit(name) {
		return name.indexOf("translate") >= 0 ?
				"px" : name.indexOf("rotate") >= 0 ? "deg" : "";
	}

	// ["translate" , ["10", "20"]]
	function parseStyle(property) {
		var m = property.match(/(\b\w+?)\((\s*[^\)]+)/);
		var name;
		var value;
		var result = ["",""];

		if (m && m.length > 2) {
			name = m[1];
			value = m[2].split(",");
			value = $.map(value, function(v) {
				return $.trim(v);
			});
			result = [ $.trim(name), value ];
		}
		return result;
	}

	function toMatrix(transform) {
		var retMatrix = [];

		if (!transform || transform === "none") {
			return ["matrix", [ "1", "0", "0", "1", "0", "0"] ];
		}

		retMatrix = CSSMatrix ? parseStyle(new CSSMatrix(transform).toString()) :
								["matrix", matrix(transform)];

		/**
		 * Make an unintended 2d matrix to 3d matrix.
		 *
		 * WebkitCSSMatrix changes 'transform3d' style to '2d matix' if it is judged as needless.
		 * But generally, Developers would intend 3d transform by force for a HW Accelation. eg. translate3d(a, b, 0)
		 */
		if (transform.indexOf("3d") >= 0 && retMatrix[0].indexOf("3d") < 0) {
			retMatrix = toMatrix3d(retMatrix);
		}

		return retMatrix;
	}

	function toMatrix3d(matrix) {
		var name = matrix[0];
		var val = matrix[1];

		if (name === "matrix3d") {
			return matrix;
		}

		// matrix(a, b, c, d, tx, ty) is a shorthand for matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1)
		return [
			name + "3d", [val[0], val[1], "0", "0",
						val[2], val[3], "0", "0",
						"0", "0", "1", "0",
						val[4], val[5], "0", "1"]
		];
	}

	$.fx.step.transform = function(fx) {
		fx.rateFn = fx.rateFn || rateFn(fx.elem, fx.start, fx.end);
		$.style(fx.elem, "transform", fx.rateFn(fx.pos));
	};

	// All of this interfaces are functions for unit testing.
	return {
		toMatrix: toMatrix,
		toMatrix3d: toMatrix3d
	};
});

eg.module("css", [window.jQuery, document], function($, doc) {
	/**
	 * Apply css prefix cssHooks
	 * @ko css prefix cssHooks 적용
	 *
	 * @name jQuery#css
	 * @method
	 *
	 * * @support {"ie": "10+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	 * @example
	 * $("#ID").css("transform", "translate('10px', '10px');
	 * $("#ID").css("Transform", "translate('10px', '10px');
	 * $("#ID").css("webkitTransform", "translate('10px', '10px');
	 * $("#ID").css("transform");
	 * $("#ID").css("webkitTransform");
	 */

	if (!$.cssHooks) {
		throw (new Error("jQuery 1.4.3+ is needed for this plugin to work"));
	}

	// run in jQuery 1.8.x below
	if ($.fn && $.fn.jquery && $.fn.jquery.replace(/\./, "") >= "18") {
		return;
	}

	var cssPrefixes = [ "Webkit", "Moz", "O", "ms" ];
	var acts = ["transitionProperty", "transitionDuration", "transition",
				"transform", "transitionTimingFunction"];

	var vendorPrefix = (function() {
		var bodyStyle = (doc.head || doc.getElementsByTagName("head")[0]).style;
		for (var i = 0, len = cssPrefixes.length ; i < len ; i++) {
			if (cssPrefixes[i] + "Transition" in bodyStyle) {
				return cssPrefixes[i];
			}
		}
	})();

	// ie7, 8 - transform and transition not support
	// ie9 - transition not support
	if (!vendorPrefix) {
		return;
	}

	// If "ms" using "Ms" property in the get function
	var setCssHooks = function(prop) {
		var upperProp = prop.charAt(0).toUpperCase() + prop.slice(1);
		var vendorProp = vendorPrefix + upperProp;
		var getVendorProp = vendorPrefix === "ms" ? "Ms" + upperProp : vendorProp;

		$.cssHooks[upperProp] =
		$.cssHooks[vendorPrefix.toLowerCase() + upperProp] =
		$.cssHooks[prop] = {
			get: function(elem, computed) {
				return computed ? $.css(elem, getVendorProp) : elem.style[vendorProp];
			},
			set: function(elem, value) {
				elem.style[vendorProp] = value;
			}
		};
	};

	for (var n = 0, actsLen = acts.length; n < actsLen; n++) {
		setCssHooks(acts[n]);
	}

	return {
		vendorPrefix: vendorPrefix,
		setCssHooks: setCssHooks
	};

});
eg.module("eg", [window.jQuery, eg, window], function($, ns, global) {
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
	var ua;
	var eg = {
		/**
		 * @name eg.VERSION
		 * @description version infomation
		 * @ko 버전 정보
		 */
		VERSION: "0.0.2",
		hook: {
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

		agent: function(useragent) {
			ua = useragent || navigator.userAgent;

			var osMatch = /(Windows Phone) ([\d|\.]+)/.exec(ua) ||
					/(iPhone |iPad )?OS ([\d|_]+)/.exec(ua) ||
					/(Android) ([\w.]+)/.exec(ua) ||
					/(Windows NT) ([\d|\.]+)/.exec(ua) ||
					/(Windows) ([\w|\.]+)/.exec(ua) ||
					/(Mac OS X)( ([\w.]+))?/.exec(ua) ||
					[];
			var browserMatch = /(Chrome|CriOS|Firefox)[\s\/]([\w.]+)/.exec(ua) ||
					/(MSIE|IEMobile)[\/\s]([\d.]+)/.exec(ua) ||
					/(Trident)[\/\s]([\d.]+)/.exec(ua) ||
					/(PhantomJS)\/([\d.]+)/.exec(ua) ||
					[];

			// os
			if (osMatch.length >= 3) {
				if (ua.indexOf("Win") !== -1) {
					osMatch[1] = "window";
					osMatch[2] = osMatch[2] === "2000" ? "5.0" : osMatch[2]; // for window 2000
				} else if (/iPhone|iPad/.test(ua)) {
					osMatch[1] = "ios";
				} else if (ua.indexOf("Mac") !== -1) {
					osMatch[1] = "mac";
				} else {
					osMatch[1] = osMatch[1].toLowerCase();
				}
				osMatch[2] = (osMatch[2] || "").replace(/\_/g, ".").replace(/\s/g, "");
			}

			// browser
			if (browserMatch.length >= 3) {
				if (/MSIE|IEMobile|Trident/.test(ua)) {
					browserMatch[1] = "ie";
				} else if (/Chrome|CriOS/.test(ua)) {
					browserMatch[1] = ua.indexOf("SAMSUNG") !== -1 ? "sbrowser" : "chrome";
				} else {
					browserMatch[1] = browserMatch[1].toLowerCase();
				}
			} else if (browserMatch.length === 0 && osMatch[1] &&
						osMatch[1] !== "android") {
				browserMatch = /(Safari)\/([\w.]+)/.exec(ua) ||
								(osMatch[1] === "ios" ? ["", "safari"] : ["", ""]);
				browserMatch[1] = browserMatch[1].toLowerCase();
				if (browserMatch[0] && browserMatch[1].indexOf("safari") !== -1) {
					browserMatch[2] = ua.indexOf("Apple") !== -1 ?
											ua.match(/Version\/([\d.]+)/)[1] || null :
											null;
				}
			}

			var info = {
				os: {
					name: osMatch[1] || "",
					version: osMatch[2] || "-1"
				},
				browser: {
					name: browserMatch[1] || "default",
					version: browserMatch[2] || /*osMatch[2] ||*/ "-1"
				}
			};
			info = this._checkWebview(info, ua);
			return resultCache(this, "agent", [info], info);
		},

		// Check Webview
		// ios : In the absence of version
		// Android 5.0 && chrome 40+ : when there is a keyword of "; wv" in useragent
		// Under android 5.0 :  when there is a keyword of "NAVER or Daum" in useragent
		_checkWebview: function(info, ua) {
			info.browser.webview =
				(info.os.name === "android" && ua.indexOf("; wv") > -1) ||// Android
				(info.os.name === "ios" && info.browser.version === "-1") ||// ios
				(ua.indexOf("NAVER") > -1 || ua.indexOf("Daum") > -1) ||// Other
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
		translate: function(x, y, isHA) {
			isHA = isHA || false;
			return "translate" + (isHA ?
									"3d(" : "(") + x + "," + y + (isHA ? ",0)" :
									")");
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
		isHWAccelerable: function() {
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
			} else if (/ie|firefox|safari|inapp/.test(browser)) {
				result = true;
			} else if (agent.os.name.indexOf("android") !== -1) {
				useragent = (ua.match(/\(.*\)/) || [null])[0];

				// android 4.1+ blacklist
				// EK-GN120 : Galaxy Camera, SM-G386F : Galaxy Core LTE
				// SHW-M420 : Galaxy Nexus , SHW-M200 : NexusS , GT-S7562 : Galaxy S duos
				result = (osVersion >= "4.1.0" && !/EK-GN120|SM-G386F/.test(useragent)) ||
					(osVersion >= "4.0.3" &&
						/SHW-|SHV-|GT-|SCH-|SGH-|SPH-|LG-F160|LG-F100|LG-F180|LG-F200|EK-|IM-A|LG-F240|LG-F260/.test(useragent) && !/SHW-M420|SHW-M200|GT-S7562/.test(useragent));
			}
			return resultCache(this, "isHWAccelerable", [result, agent], result);
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
		isTransitional: function() {
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
		},

		// 1. user press one position on screen.
		// 2. user moves to the other position on screen.
		// 3. when user releases fingers on screen, 'click' event is fired at previous position.
		_hasClickBug: function() {
			var agent = this.agent();
			var result = agent.os.name === "ios";

			return resultCache(this, "_hasClickBug", [result, agent], result);
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
		requestAnimationFrame: function(fp) {
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
		cancelAnimationFrame: function(key) {
			caf(key);
		}
	};

	// Regist method to eg.
	for (var i in eg) {
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
		easeOutCubic: function(p) {
			return 1 - Math.pow(1 - p, 3);
		}
	});
});

// jscs:disable maximumLineLength
eg.module("rotate", [window.jQuery, eg, window, document], function($, ns, global, doc) {
	// jscs:enable maximumLineLength
	/**
	 * @namespace jQuery
	 * @group jQuery Extension
	 */
	/**
	 * Support rotate event in jQuery
	 *
	 * @ko jQuery custom rotate 이벤트 지원
	 * @name jQuery#rotate
	 * @event
	 * @param {Event} e event
	 * @param {Boolean} e.isVertical vertical <ko>수직여부</ko>
	 * @support { "ios" : "7+", "an" : "2.1+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	 * @example
	 * $(window).on("rotate",function(e){
	 *      e.isVertical;
	 * });
	 *
	 */

	var beforeScreenWidth = -1;
	var beforeVertical = null;
	var rotateTimer = null;
	var agent = ns.agent();
	var isMobile = /android|ios/.test(agent.os.name);

	/*
	 * This orientationChange method is return event name for bind orientationChange event.
	 */
	var orientationChange = function() {
		var type;
		/**
		 * Android Bug
		 * Android 2.4 has orientationchange but It use change width, height. so Delay 500ms use setTimeout.
		 *  : If android 2.3 made samsung bind resize on window then change rotate then below version browser.
		 * Twice fire orientationchange in android 2.2. (First time change widht, height, second good.)
		 * Below version use resize.
		 *
		 * In app bug
		 * If fire orientationChange in app then change width, height. so delay 200ms using setTimeout.
		 */
		if ((agent.os.name === "android" && agent.os.version === "2.1")) {//|| htInfo.galaxyTab2)
			type = "resize";
		} else {
			type = "onorientationchange" in global ? "orientationchange" : "resize";
		}

		orientationChange = function() {
			return type;
		};
		return type;

	};
	/*
	* If viewport is vertical return true else return false.
	*/
	function isVertical() {
		var eventName = orientationChange();
		var screenWidth;
		var degree;
		var vertical;

		if (eventName === "resize") {
			screenWidth = doc.documentElement.clientWidth;

			if (beforeScreenWidth === -1) { //first call isVertical
				vertical = screenWidth < doc.documentElement.clientHeight;
			} else {
				if (screenWidth < beforeScreenWidth) {
					vertical = true;
				} else if (screenWidth === beforeScreenWidth) {
					vertical = beforeVertical;
				} else {
					vertical = false;
				}
			}

			beforeScreenWidth = screenWidth;
		} else {
			degree = global.orientation;
			if (degree === 0 || degree === 180) {
				vertical = true;
			} else if (degree === 90 || degree === -90) {
				vertical = false;
			}
		}
		return vertical;
	}

	/*
	* Trigger that rotate event on an element.
	*/
	function triggerRotate() {
		var currentVertical = isVertical();
		if (isMobile) {
			if (beforeVertical !== currentVertical) {
				beforeVertical = currentVertical;
				$(global).trigger("rotate");
			}
		}
	}

	/*
	* Trigger event handler.
	*/
	function handler(e) {

		var eventName = orientationChange();
		var delay;
		var screenWidth;

		if (eventName === "resize") {
			global.setTimeout(function() {
				triggerRotate();
			}, 0);
		} else {
			delay = 300;
			if (agent.os.name === "android") {
				screenWidth = doc.documentElement.clientWidth;
				if (e.type === "orientationchange" && screenWidth === beforeScreenWidth) {
					global.setTimeout(function() {
						handler(e);
					}, 500);

					// When fire orientationchange if width not change then again call handler after 300ms.
					return false;
				}
				beforeScreenWidth = screenWidth;
			}

			global.clearTimeout(rotateTimer);
			rotateTimer = global.setTimeout(function() {
				triggerRotate();
			}, delay);
		}
	}

	$.event.special.rotate = {
		setup: function() {
			beforeScreenWidth = doc.documentElement.clientWidth;
			$(global).on(orientationChange(), handler);
		},
		teardown: function() {
			$(global).off(orientationChange(), handler);
		},
		trigger: function(e) {
			e.isVertical = beforeVertical;
		}
	};

	return {
		"orientationChange": orientationChange,
		"isVertical": isVertical,
		"triggerRotate": triggerRotate,
		"handler": handler
	};
});

// jscs:disable maximumLineLength
eg.module("scrollEnd", [jQuery, eg, window, document], function($, ns, global) {
	// jscs:eable maximumLineLength
/**
	* Support scrollEnd event in jQuery
	* @ko jQuery custom scrollEnd 이벤트 지원
	* @name jQuery#scrollEnd
	* @event
	* @param {Number} e.top top position <ko>상단(top) 위치 값</ko>
	* @param {Number} e.left left position <ko>왼쪽(left) 위치 값</ko>
	* @support {"ie": "9+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	* @example
	* $(window).on("scrollend",function(e){
	*      e.top;
	*      e.left;
	* });
	*
	*/

	var scrollEndTimer;
	var rotateFlag = false;

	var CHROME = 3;
	var TIMERBASE = 2;
	var TOUCHBASE = 1;
	var SCROLLBASE = 0;

	var deviceType = getDeviceType();

	$.event.special.scrollend = {
		latency: 250,
		setup: function() {
			attachEvent();
		},
		teardown: function() {
			removeEvent();
		}
	};

	/**
	 * iOS & safari :
	 * 		Below iOS7, Scroll event occurs once when the scroll is stopped.
	 * 		Since iOS8, Scroll event occurs every time scroll
	 * 		Scroll event occurs when the rotation
	 * android :
	 *		Scroll event occurs every time scroll
	 *		Scroll event occurs when the rotation
	 * @ko
	 * iOS & safari :
	 *		iOS 7.x 이하에서는 스크롤이 멈췄을때 scroll 이벤트 한번 발생
	 *      iOS 8.x 이상에서는 scroll 이벤트가 android 와 동일하게 스크롤시 매번 발생
	 *		회전시 scroll 이벤트가 발생되어 이를 무시처리해야함
	 *		(orientationchange 에 의해 발생하는 scroll 이벤트 1회만 무시)
	 * android :
	 *		스크롤시 scroll 이벤트 매번 발생
	 *		회전시 scroll 이벤트가 발생되어 이를 무시처리해야함
	 */

	function getDeviceType() {
		var retValue = TIMERBASE;
		var agent = ns.agent();
		var osInfo = agent.os;
		var osVersion = osInfo.version;
		var browserInfo = agent.browser;

		// Browsers that trigger scroll event like scrollstop : SCROLLBASE
		if (osInfo.name === "ios") {
			if (browserInfo.webview === true || osVersion.indexOf("7.") !== -1) {
				retValue = SCROLLBASE;
			}
		}
		return retValue;
	}

	function attachEvent() {
		$(global).on("scroll", scroll);
		$(global).on("orientationchange", onOrientationchange);
	}

	function onOrientationchange() {
		rotateFlag = true;
	}

	function scroll() {
		if (rotateFlag) {
			rotateFlag = false;
			return;
		}

		switch (deviceType) {
			case SCROLLBASE :
				triggerScrollEnd();
				break;
			case TIMERBASE :
				triggerScrollEndAlways();
				break;
		}

	}

	function triggerScrollEnd() {
		$(global).trigger("scrollend", {
			top: global.pageYOffset,
			left: global.pageXOffset
		});
	}

	function triggerScrollEndAlways() {
		clearTimeout(scrollEndTimer);
		scrollEndTimer = setTimeout(function() {
			if (rotateFlag) {
				rotateFlag = false;
				return;
			}
			triggerScrollEnd();
		}, $.event.special.scrollend.latency);
	}

	function removeEvent() {
		$(global).off("scroll", scroll);
		$(global).off("orientationchange", onOrientationchange);
	}

	return {
		getDeviceType: getDeviceType,
		CHROME: CHROME,
		TIMERBASE: TIMERBASE,
		TOUCHBASE: TOUCHBASE,
		SCROLLBASE: SCROLLBASE
	};
});
eg.module("class", [eg], function(ns) {
/**
	 *
	 * Class
	 * The Class() object is used to implement the application using object-oriented programming.
	 * @group egjs
	 * @ko Class는 어플리케이션을 객체지향 프로그래밍 방식으로 구현하는데 사용합니다.
	 * @class
	 * @name eg.Class
	 *
	 * @support {"ie": "7+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	 * @param {Object} def Class definition of object literal type. <ko>리터럴 형태의 클래스 정의부</ko>
	 * @example
	 	var Some = eg.Class({
	 		//Class initialize
			"construct" : function(val){
				this.val = val;
			},
			"sumVal" : function(val) {
				return this.val + val;
			}
	 	});

	 	var some = new Some(5);
	 	some.sumVal(5);//10
	 */
	ns.Class = function(def) {
		var typeClass = function typeClass() {
			if (typeof def.construct === "function") {
				def.construct.apply(this, arguments);
			}
		};

		typeClass.prototype = def;
		typeClass.prototype.constructor = typeClass;
		return typeClass;
	};
	/**
	 * The extend() method extends a specific class.
	 * @ko extend는 Class를 상속할 때 사용합니다.
	 * @static
	 * @method eg.Class.extend
	 * @param {eg.Class} oSuperClass Super class. <ko>상속하려는 클래스</ko>
	 * @param {Object} def Class definition of object literal type. <ko>리터럴 형태의 클래스 정의부</ko>
	 * @return {Class}
	 * @example
	 	var Some = eg.Class.extend(eg.Component,{
			"some" : function(){}
	 	})
	 */

	ns.Class.extend = function(superClass, def) {
		var extendClass = function extendClass() {
			// Call a parent constructor
			superClass.apply(this, arguments);

			// Call a child constructor
			if (typeof def.construct === "function") {
				def.construct.apply(this, arguments);
			}
		};

		var ExtProto = function() {};
		ExtProto.prototype = superClass.prototype;

		//extendClass.$super = oSuperClass.prototype; //'super' is supported not yet.

		var extProto = new ExtProto();
		for (var i in def) {
			extProto[i] = def[i];
		}
		extProto.constructor = extendClass;
		extendClass.prototype = extProto;

		return extendClass;
	};
});
eg.module("component", [eg], function(ns) {
	/**
	 * Component
	 * @class
	 * @group egjs
	 * @name eg.Component
	 *
	 * @support {"ie": "7+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	 */
	ns.Component = ns.Class({
		construct: function() {
			// The reference count is not support yet.
			// this.constructor.$count = (this.constructor.$count || 0) + 1;
			this.eventHandler = {};
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
				"some": function(){
					this.tigger("hi");// fire hi event.
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
		 * Checks whether the event has been assigned to the Component.
		 * @ko 컴포넌트에 등록된 이벤트를 확인합니다.
		 * @method eg.Component#hasOn
		 * @param {String} eventName
		 * @return {Boolean}
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
		 * Attach an event handler function.
		 * @ko 이벤트를 등록합니다.
		 * @method eg.Component#on
		 * @param {eventName} eventName
		 * @param {Function} handlerToAttach
		 * @return {Instance}
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
		 * Detach an event handler function.
		 * @ko 이벤트를 해제합니다.
		 * @method eg.Component#off
		 * @param {eventName} eventName
		 * @param {Function} handlerToDetach
		 * @return {Instance}
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
				for (k = 0, handlerFunction; handlerFunction = handlerList[k]; k++) {
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


// jscs:disable maximumLineLength
eg.module("movableCoord", [window.jQuery, eg, window.Hammer], function($, ns, HM) {
	// jscs:enable maximumLineLength
	// It is scheduled to be removed in case of build process.
	// ns.__checkLibrary__( !("Hammer" in window), "You must download Hammerjs. (http://hammerjs.github.io/)\n\ne.g. bower install hammerjs");
	// ns.__checkLibrary__( !("easeOutQuint" in $.easing), "You must download jQuery Easing Plugin(http://gsgd.co.uk/sandbox/jquery/easing/)\n\ne.g. bower install jquery.easing");
	/**
	 * The MovableCoord can control coordinate by user's action.
	 * @group egjs
	 * @ko MovableCoord는 사용자 행동에 의해, 좌표계를 제어할 수 있다.
	 * @class
	 * @name eg.MovableCoord
	 * @extends eg.Component
	 *
	 * @param {Object} options
	 * @param {Array} options.min The minimum coordinate  <ko>좌표계의 최소값</ko>
	 * @param {Number} [options.min.0=0] The minimum x-coordinate <ko>최소 X좌표</ko>
	 * @param {Number} [options.min.1=0] The minimum y-coordinate <ko>최소 Y좌표</ko>
	 *
	 * @param {Array} options.max The maximum coordinate <ko>좌표계의 최대값</ko>
	 * @param {Number} [options.max.0=100] The maximum x-coordinate <ko>최대 X좌표</ko>
	 * @param {Number} [options.max.1=100] The maximum y-coordinate <ko>최대 Y좌표</ko>
	 *
	 * @param {Array} options.bounce The area can move using animation. <ko>바운스: 애니메이션에 의해 이동할 수 있는 영역 </ko>
	 * @param {Boolean} [options.bounce.0=10] The bounce top range <ko>top 바우스 영역</ko>
	 * @param {Boolean} [options.bounce.1=10] The bounce right range <ko>right 바우스 영역</ko>
	 * @param {Boolean} [options.bounce.2=10] The bounce bottom range <ko>bottom 바우스 영역</ko>
	 * @param {Boolean} [options.bounce.3=10] The bounce left range <ko>left 바우스 영역</ko>
	 *
	 * @param {Array} options.margin The area can move using user's action. <ko>영역별 마진 영역: 사용자의 액션에 의해, 추가로 이동할수 있는 영역</ko>
	 * @param {Boolean} [options.margin.0=0] The margin top range <ko>top 마진 영역</ko>
	 * @param {Boolean} [options.margin.1=0] The margin right range <ko>right 마진 영역</ko>
	 * @param {Boolean} [options.margin.2=0] The margin bottom range <ko>bottom 마진 영역</ko>
	 * @param {Boolean} [options.margin.3=0] The margin left range <ko>left 마진 영역</ko>
	 * @param {Array} options.circular <ko>영역별 순환 여부</ko>
	 * @param {Boolean} [options.circular.0=false] The circular top range <ko>top 순환 영역</ko>
	 * @param {Boolean} [options.circular.1=false] The circular right range <ko>right 순환 영역</ko>
	 * @param {Boolean} [options.circular.2=false] The circular bottom range <ko>bottom 순환 영역</ko>
	 * @param {Boolean} [options.circular.3=false] The circular left range <ko>left 순환 영역</ko>
	 *
	 * @param {Function} [options.easing=easing.easeOutCubic] Function of the Easing (jQuery UI Easing, jQuery Easing Plugin). <ko>Easing 함수</ko>
	 * @param {Number} [options.maximumDuration=Infinity] The maximum duration. <ko>최대 좌표 이동 시간</ko>
	 * @param {Number} [options.deceleration=0.0006] deceleration This value can be altered to change the momentum animation duration. higher numbers make the animation shorter. <ko>감속계수. 높을값이 주어질수록 애니메이션의 동작 시간이 짧아진다.</ko>
	 * @see Hammerjs {@link http://hammerjs.github.io}
	 * @see There is usability issue due to default css properties ({@link http://hammerjs.github.io/jsdoc/Hammer.defaults.cssProps.html}) of the Hammerjs. Therefore, movableCoord removes css properties.
	 * <ko>Hammerjs의 기본 CSS 속성({@link http://hammerjs.github.io/jsdoc/Hammer.defaults.cssProps.html}) 으로 인해 사용성 이슈가 있다. 따라서, movableCoord는 hammerjs의 기본 CSS 속성을 제거하였다.</ko>
	 *
	 * @codepen {"id":"bdVybg", "ko":"MovableCoord 기본 예제", "en":"MovableCoord basic example", "collectionId":"AKpkGW", "height": 403}
	 *
	 * @see Easing Functions Cheat Sheet {@link http://easings.net/}
	 * @see If you want to use another easing function then should be import jQuery easing plugin({@link http://gsgd.co.uk/sandbox/jquery/easing/}) or jQuery UI easing.({@link https://jqueryui.com/easing/})<ko>다른 easing 함수를 사용하고 싶다면, jQuery easing plugin({@link http://gsgd.co.uk/sandbox/jquery/easing/})이나, jQuery UI easing({@link https://jqueryui.com/easing/}) 라이브러리를 삽입해야 한다.</ko>
	 *
	 * @support {"ie": "10+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	 */
	ns.MovableCoord = ns.Class.extend(ns.Component, {
		construct: function(options) {
			this.options = {
				min: [0, 0],
				max: [100, 100],
				bounce: [10, 10, 10, 10],
				margin: [0,0,0,0],
				circular: [false, false, false, false],
				easing: $.easing.easeOutCubic,
				maximumDuration: Infinity,
				deceleration: 0.0006
			};
			this._reviseOptions(options);
			this._status = {
				grabOutside: false,	// check whether user's action started on outside
				curHammer: null,		// current hammer instance
				moveDistance: null,	// a position of the first user's action
				animationParam: null,		// animation infomation
				prevented: false		//  check whether the animation event was prevented
			};
			this._hammers = {};
			this._pos = [ this.options.min[0], this.options.min[1] ];
			this._subOptions = {};
			this._raf = null;
			this._animationEnd = $.proxy(this._animationEnd, this);	// for caching
			this._panmove = $.proxy(this._panmove, this);	// for caching
			this._panend = $.proxy(this._panend, this);	// for caching
		},
		/**
		 * Attach a element to an use for the movableCoord.
		 * @ko movableCoord을 사용하기 위한 엘리먼트를 등록한다.
		 * @method eg.MovableCoord#bind
		 * @param {HTMLElement|String|jQuery} element  A target element. <ko>movableCoord을 사용하기 위한 엘리먼트</ko>
		 * @param {Object} options
		 * @param {Number} [options.direction=eg.DIRECTION_ALL] The controllable directions. <ko>움직일수 있는 방향</ko>
		 * @param {Array} options.scale The moving scale. <ko>이동 배율</ko>
		 * @param {Number} [options.scale.0=1] x-scale <ko>x축 배율</ko>
		 * @param {Number} [options.scale.1=1] y-scale <ko>y축 배율</ko>
		 * @param {Number} [options.thresholdAngle=45] The threshold angle about direction which range is 0~90 <ko>방향에 대한 임계각 (0~90)</ko>
		 * @param {Number} [options.interruptable=true] interruptable This value can be enabled to interrupt cycle of the animation event. <ko>이 값이  true이면, 애니메이션의 이벤트 사이클을 중단할수 있다.</ko>
		 * @param {Array} [options.inputType] inputType you can control input type. a kind of inputs are "touch", "mouse".  default value is ["touch", "mouse"] <ko>입력 타입을 지정할수 있다. 입력타입은 "touch", "mouse" 가 있으며, 배열로 입력할 수 있다. (기본값은 ["touch", "mouse"] 이다)</ko>
		 *
		 * @return {Boolean}
		 */
		bind: function(el, options) {
			var $el = $(el);
			var keyValue = $el.data(ns.MovableCoord.KEY);
			var subOptions = {
				direction: ns.DIRECTION_ALL,
				scale: [ 1, 1 ],
				thresholdAngle: 45,
				interruptable: true,
				inputType: [ "touch", "mouse" ]
			};

			$.extend(subOptions, options);

			if (keyValue) {
				this._hammers[keyValue].get("pan").set(
					{ direction: subOptions.direction }
				);
			} else {
				keyValue = Math.round(Math.random() * new Date().getTime());
				this._hammers[keyValue] = this._createHammer(
					$el.get(0),
					subOptions
				);
				$el.data(ns.MovableCoord.KEY, keyValue);
			}
			return this;
		},
		_createHammer: function(el, subOptions) {
			try {
				// create Hammer
				var hammer = new HM.Manager(el, {
						recognizers: [
							[
								HM.Pan, {
									direction: subOptions.direction,
									threshold: 0
								}
							]
						],

						// css properties were removed due to usablility issue
						// http://hammerjs.github.io/jsdoc/Hammer.defaults.cssProps.html
						cssProps: {},
						inputClass: this._convertInputType(subOptions.inputType)
					});
				return hammer.on("hammer.input", $.proxy(function(e) {
					if (e.isFirst) {
						// apply options each
						this._subOptions = subOptions;
						this._status.curHammer = hammer;
						this._panstart(e);
					}
				}, this))
				.on("panstart panmove", this._panmove)
				.on("panend", this._panend);
			} catch (e) {
				// console.log(e);
			}
		},

		_convertInputType: function(inputType) {
			var hasTouch = false;
			var hasMouse = false;
			$.each(inputType, function(i, v) {
				switch (v) {
					case "mouse" : hasMouse = true; break;
					case "touch" : hasTouch = true; break;
				}
			});

			if (hasMouse) {
				return hasTouch ? HM.TouchMouseInput : HM.MouseInput;
			} else if (hasTouch) {
				return HM.TouchInput;
			} else {
				return HM.TouchMouseInput;
			}
		},

		/**
		 * Dettach a element to an use for the movableCoord.
		 * @ko movableCoord을 사용하기 위한 엘리먼트를 해제한다.
		 * @method eg.MovableCoord#unbind
		 * @param {HTMLElement|String|jQuery} element The target element.<ko>movableCoord을 사용하기 위한 설정한 엘리먼트</ko>
		 * @return {Boolean}
		 */
		unbind: function(el) {
			var $el = $(el);
			var key = $el.data(ns.MovableCoord.KEY);
			if (key) {
				this._hammers[key].destroy();
				delete this._hammers[key];
				$el.data(ns.MovableCoord.KEY, null);
			}
		},

		_grab: function() {
			if (this._status.animationParam) {
				this._pos = this._getCircularPos(this._pos);
				this._triggerChange(this._pos, true);
				this._status.animationParam = null;
				this._raf && ns.cancelAnimationFrame(this._raf);
				this._raf = null;
			}
		},

		_getCircularPos: function(pos, min, max, circular) {
			min = min || this.options.min;
			max = max || this.options.max;
			circular = circular || this.options.circular;

			if (circular[0] && pos[1] < min[1]) { // up
				pos[1] = (pos[1] - min[1]) % (max[1] - min[1] + 1) + max[1];
			}
			if (circular[1] && pos[0] > max[0]) { // right
				pos[0] = (pos[0] - min[0]) % (max[0] - min[0] + 1) + min[0];
			}
			if (circular[2] && pos[1] > max[1]) { // down
				pos[1] = (pos[1] - min[1]) % (max[1] - min[1] + 1) + min[1];
			}
			if (circular[3] && pos[0] < min[0]) { // left
				pos[0] = (pos[0] - min[0]) % (max[0] - min[0] + 1) + max[0];
			}
			pos[0] = +pos[0].toFixed(5), pos[1] = +pos[1].toFixed(5);

			return pos;
		},

		// determine outside
		_isOutside: function(pos, min, max) {
			return pos[0] < min[0] || pos[1] < min[1] ||
				pos[0] > max[0] || pos[1] > max[1];
		},

		// from outside to outside
		_isOutToOut: function(pos, destPos, min, max) {
			return (pos[0] < min[0] || pos[0] > max[0] ||
				pos[1] < min[1] || pos[1] > max[1]) &&
				(destPos[0] < min[0] || destPos[0] > max[0] ||
				destPos[1] < min[1] || destPos[1] > max[1]);
		},

		// panstart event handler
		_panstart: function(e) {
			if (!this._subOptions.interruptable && this._status.prevented) {
				return;
			}
			this._setInterrupt(true);
			var pos = this._pos;
			this._grab();
			/**
			 * When an area was pressed
			 * @ko 스크린에서 사용자가 손을 대었을 때
			 * @name eg.MovableCoord#hold
			 * @event
			 * @param {Object} param
			 * @param {Array} param.pos coordinate <ko>좌표 정보</ko>
			 * @param {Number} param.pos.0 x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.pos.1 y-coordinate <ko>y 좌표</ko>
			 * @param {Object} param.hammerEvent Hammerjs event. http://hammerjs.github.io/api/#hammer.input-event <ko>사용자의 액션에 대한 hammerjs 이벤트 정보</ko>
			 *
			 */
			this.trigger("hold", {
				pos: pos.concat(),
				hammerEvent: e
			});
			this._status.moveDistance = pos.concat();
			this._status.grabOutside = this._isOutside(
				pos,
				this.options.min,
				this.options.max
			);
		},

		// panmove event handler
		_panmove: function(e) {
			if (!this._isInterrupting() || !this._status.moveDistance) {
				return;
			}
			var tv;
			var tn;
			var tx;
			var pos = this._pos;
			var min = this.options.min;
			var max = this.options.max;
			var bounce = this.options.bounce;
			var margin = this.options.margin;
			var direction = this._subOptions.direction;
			var scale = this._subOptions.scale;
			var userDirection = this._getDirection(e.angle);
			var out = [
				margin[0] + bounce[0],
				margin[1] + bounce[1],
				margin[2] + bounce[2],
				margin[3] + bounce[3]
			];
			var prevent  = false;

			// not support offset properties in Hammerjs - start
			var prevInput = this._status.curHammer.session.prevInput;
			if (prevInput) {
				e.offsetX = e.deltaX - prevInput.deltaX;
				e.offsetY = e.deltaY - prevInput.deltaY;
			} else {
				e.offsetX = e.offsetY = 0;
			}

			// not support offset properties in Hammerjs - end
			if (direction === ns.DIRECTION_ALL ||
				(direction & ns.DIRECTION_HORIZONTAL &&
				userDirection & ns.DIRECTION_HORIZONTAL)
			) {
				this._status.moveDistance[0] += (e.offsetX * scale[0]);
				prevent = true;
			}
			if (direction === ns.DIRECTION_ALL ||
				(direction & ns.DIRECTION_VERTICAL &&
				userDirection & ns.DIRECTION_VERTICAL)
			) {
				this._status.moveDistance[1] += (e.offsetY * scale[1]);
				prevent = true;
			}
			if (prevent) {
				e.srcEvent.preventDefault();
				e.srcEvent.stopPropagation();
			}

			e.preventSystemEvent = prevent;
			pos[0] = this._status.moveDistance[0];
			pos[1] = this._status.moveDistance[1];
			pos = this._getCircularPos(pos, min, max);

			// from outside to inside
			if (this._status.grabOutside && !this._isOutside(pos, min, max)) {
				this._status.grabOutside = false;
			}

			// when move pointer is holded outside
			if (this._status.grabOutside) {
				tn = min[0] - out[3], tx = max[0] + out[1], tv = pos[0];
				pos[0] = tv > tx ? tx : (tv < tn ? tn : tv);
				tn = min[1] - out[0], tx = max[1] + out[2], tv = pos[1];
				pos[1] = tv > tx ? tx : (tv < tn ? tn : tv);
			} else {

				// when start pointer is holded inside
				// get a initialization slop value to prevent smooth animation.
				var initSlope = this._initSlope();
				if (pos[1] < min[1]) { // up
					tv = (min[1] - pos[1]) / (out[0] * initSlope);
					pos[1] = min[1] - this._easing(tv) * out[0];
				} else if (pos[1] > max[1]) { // down
					tv = (pos[1] - max[1]) / (out[2] * initSlope);
					pos[1] = max[1] + this._easing(tv) * out[2];
				}
				if (pos[0] < min[0]) { // left
					tv = (min[0] - pos[0]) / (out[3] * initSlope);
					pos[0] = min[0] - this._easing(tv) * out[3];
				} else if (pos[0] > max[0]) { // right
					tv = (pos[0] - max[0]) / (out[1] * initSlope);
					pos[0] = max[0] + this._easing(tv) * out[1];
				}

			}
			this._triggerChange(pos, true, e);
		},

		// panend event handler
		_panend: function(e) {
			if (!this._isInterrupting() || !this._status.moveDistance) {
				return;
			}
			var direction = this._subOptions.direction;
			var scale = this._subOptions.scale;
			var vX =  Math.abs(e.velocityX);
			var vY = Math.abs(e.velocityY);

			// console.log(e.velocityX, e.velocityY, e.deltaX, e.deltaY);
			!(direction & ns.DIRECTION_HORIZONTAL) && (vX = 0);
			!(direction & ns.DIRECTION_VERTICAL) && (vY = 0);

			this._animateBy(
				this._getNextOffsetPos([
					vX * (e.deltaX < 0 ? -1 : 1) * scale[0],
					vY * (e.deltaY < 0 ? -1 : 1) * scale[1]
				]),
			this._animationEnd, false, null, e);
			this._status.moveDistance = null;
		},

		_isInterrupting: function() {
			// when interruptable is 'true', return value is always 'true'.
			return this._subOptions.interruptable || this._status.prevented;
		},

		// get user's direction
		_getDirection: function(angle) {
			var thresholdAngle = this._subOptions.thresholdAngle;
			if (thresholdAngle < 0 || thresholdAngle > 90) {
				return ns.DIRECTION_NONE;
			}
			angle = Math.abs(angle);
			return angle > thresholdAngle && angle < 180 - thresholdAngle ?
					ns.DIRECTION_VERTICAL : ns.DIRECTION_HORIZONTAL;
		},

		_animationEnd: function() {
			/**
			 * When animation was ended.
			 * @ko 에니메이션이 끝났을 때 발생한다.
			 * @name eg.MovableCoord#animationEnd
			 * @event
			 */
			var pos = this._pos;
			var min = this.options.min;
			var max = this.options.max;
			this._animateTo([
				Math.min(max[0], Math.max(min[0], pos[0])),
				Math.min(max[1], Math.max(min[1], pos[1]))
			], $.proxy(this.trigger, this, "animationEnd"), true, null);
		},

		_getNextOffsetPos: function(speeds) {
			var normalSpeed = Math.sqrt(
				speeds[0] * speeds[0] + speeds[1] * speeds[1]
			);
			var duration = Math.abs(normalSpeed / -this.options.deceleration);
			return [
				speeds[0] / 2 * duration,
				speeds[1] / 2 * duration
			];
		},

		_getDurationFromPos: function(pos) {
			var normalPos = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1]);
			var duration = Math.sqrt(
				normalPos / this.options.deceleration * 2
			);

			// when duration was under 100, duration is zero
			return duration < 100 ? 0 : duration;
		},

		_animateBy: function(offset, callback, isBounce, duration, e) {
			var pos = this._pos;
			return this._animateTo([
				pos[0] + offset[0],
				pos[1] + offset[1]
			], callback, isBounce, duration, e);
		},

		_getPointOfIntersection: function(depaPos, destPos) {
			var circular = this.options.circular;
			var bounce = this.options.bounce;
			var min = this.options.min;
			var max = this.options.max;
			var boxLT = [ min[0] - bounce[3], min[1] - bounce[0] ];
			var boxRB = [ max[0] + bounce[1], max[1] + bounce[2] ];
			var xd;
			var yd;
			destPos = [destPos[0], destPos[1]];
			xd = destPos[0] - depaPos[0], yd = destPos[1] - depaPos[1];
			if (!circular[3]) {
				destPos[0] = Math.max(boxLT[0], destPos[0]);
			} // left
			if (!circular[1]) {
				destPos[0] = Math.min(boxRB[0], destPos[0]);
			} // right
			destPos[1] = xd ?
							depaPos[1] + yd / xd * (destPos[0] - depaPos[0]) :
							destPos[1];

			if (!circular[0]) {
				destPos[1] = Math.max(boxLT[1], destPos[1]);
			} // up
			if (!circular[2]) {
				destPos[1] = Math.min(boxRB[1], destPos[1]);
			} // down
			destPos[0] = yd ?
							depaPos[0] + xd / yd * (destPos[1] - depaPos[1]) :
							destPos[0];
			return destPos;

		},

		_isCircular: function(circular, destPos, min, max) {
			return (circular[0] && destPos[1] < min[1]) ||
					(circular[1] && destPos[0] > max[0]) ||
					(circular[2] && destPos[1] > max[1]) ||
					(circular[3] && destPos[0] < min[0]);
		},

		_animateTo: function(absPos, callback, isBounce, duration, e) {
			var pos = this._pos;
			var destPos = this._getPointOfIntersection(pos, absPos);
			var param = {
					depaPos: pos.concat(),
					destPos: destPos,
					hammerEvent: e || {}
				};
			if (!isBounce && e) {	// check whether user's action
				/**
				 * When an area was released
				 * @ko 스크린에서 사용자가 손을 떼었을 때
				 * @name eg.MovableCoord#release
				 * @event
				 *
				 * @param {Object} param
				 * @param {Array} param.depaPos departure coordinate <ko>현재 좌표</ko>
				 * @param {Number} param.depaPos.0 departure x-coordinate <ko>현재 x 좌표</ko>
				 * @param {Number} param.depaPos.1 departure y-coordinate <ko>현재 y 좌표</ko>
				 * @param {Array} param.destPos destination coordinate <ko>애니메이션에 의해 이동할 좌표</ko>
				 * @param {Number} param.destPos.0 destination x-coordinate <ko>x 좌표</ko>
				 * @param {Number} param.destPos.1 destination y-coordinate <ko>y 좌표</ko>
				 * @param {Object} param.hammerEvent Hammerjs event. http://hammerjs.github.io/api/#hammer.input-event <ko>사용자의 액션에 대한 hammerjs 이벤트 정보</ko>
				 *
				 */
				this.trigger("release", param);
			}
			this._afterReleaseProcess(param, callback, isBounce, duration);
		},

		// when user release a finger or poiner or mouse
		_afterReleaseProcess: function(param, callback, isBounce, duration) {
			/*
			caution:: update option values because options was changed by "release" event
			 */
			var pos = this._pos;
			var min = this.options.min;
			var max = this.options.max;
			var circular = this.options.circular;
			var isCircular = this._isCircular(
								circular,
								param.destPos,
								min,
								max
							);
			var destPos = this._isOutToOut(pos, param.destPos, min, max) ?
				pos : param.destPos;
			var distance = [
				Math.abs(destPos[0] - pos[0]),
				Math.abs(destPos[1] - pos[1])
			];
			var animationParam;
			duration = duration === null ?
						this._getDurationFromPos(distance) : duration;
			duration = this.options.maximumDuration > duration ?
						duration : this.options.maximumDuration;

			var	done = $.proxy(function(isNext) {
					this._status.animationParam = null;
					pos[0] = Math.round(destPos[0]);
					pos[1] = Math.round(destPos[1]);
					pos = this._getCircularPos(pos, min, max, circular);
					!isNext && this._setInterrupt(false);
					callback();
				}, this);

			if (distance[0] === 0 && distance[1] === 0) {
				return done(!isBounce);
			}

			// prepare animation parameters
			animationParam = {
				duration: duration,
				depaPos: pos.concat(),
				destPos: destPos,
				isBounce: isBounce,
				isCircular: isCircular,
				done: done
			};

			/**
			 * When animation was started.
			 * @ko 에니메이션이 시작했을 때 발생한다.
			 * @name eg.MovableCoord#animationStart
			 * @event
			 * @param {Object} param
			 * @param {Number} param.duration
			 * @param {Array} param.depaPos departure coordinate <ko>현재 좌표</ko>
			 * @param {Number} param.depaPos.0 departure x-coordinate <ko>현재 x 좌표</ko>
			 * @param {Number} param.depaPos.1 departure y-coordinate <ko>현재 y 좌표</ko>
			 * @param {Array} param.destPos destination coordinate <ko>애니메이션에 의해 이동할 좌표</ko>
			 * @param {Number} param.destPos.0 destination x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.destPos.1 destination y-coordinate <ko>y 좌표</ko>
			 * @param {Boolean} param.isBounce When an animation is bounced, a value is 'true'.  <ko>바운스 되는 애니메이션인 경우 true</ko>
			 * @param {Boolean} param.isCircular When the area is circular type, a value is 'true'. <ko>순환하여 움직여야하는 애니메이션인경우 true</ko>
			 * @param {Function} param.done If user control animation, user must call this function. <ko>애니메이션이 끝났다는 것을 알려주는 함수</ko>
			 *
			 */
			var retTrigger = this.trigger("animationStart", animationParam);

			// You can't stop the 'animationStart' event when 'circular' is true.
			if (isCircular && !retTrigger) {
				throw new Error(
					"You can't stop the 'animation' " +
					"event when 'circular' is true."
				);
			}
			animationParam.depaPos = pos;
			animationParam.startTime = new Date().getTime();
			this._status.animationParam = animationParam;
			if (retTrigger) {
				if (animationParam.duration) {
					// console.error("depaPos", pos, "depaPos",destPos, "duration", duration, "ms");
					var info = this._status.animationParam;
					var self = this;
					(function loop() {
						self._raf = null;
						if (self._frame(info) >= 1) {
							return done(true);
						} // animationEnd
						self._raf = ns.requestAnimationFrame(loop);
					})();
				} else {
					this._triggerChange(animationParam.destPos, false);
					done(!isBounce);
				}
			}
		},

		// animation frame (0~1)
		_frame: function(param) {
			var curTime = new Date() - param.startTime;
			var easingPer = this._easing(curTime / param.duration);
			var pos = [ param.depaPos[0], param.depaPos[1] ];

			for (var i = 0; i < 2 ; i++) {
				(pos[i] !== param.destPos[i]) &&
				(pos[i] += (param.destPos[i] - pos[i]) * easingPer);
			}
			pos = this._getCircularPos(pos);
			this._triggerChange(pos, false);
			return easingPer;
		},

		// set up 'css' expression
		_reviseOptions: function(options) {
			var key;
			$.each(["bounce", "margin", "circular"], function(i, v) {
				key = options[v];
				if (key != null) {
					if ($.isArray(key)) {
						if (key.length === 2) {
							options[v] = [ key[0], key[1], key[0], key[1] ];
						} else {
							options[v] = [ key[0], key[1], key[2], key[3] ];
						}
					} else if (/string|number|boolean/.test(typeof key)) {
						options[v] = [ key, key, key, key ];
					} else {
						options[v] = null;
					}
				}
			});
			$.extend(this.options, options);
		},

		// trigger 'change' event
		_triggerChange: function(pos, holding, e) {
			/**
			 * When coordinate was changed
			 * @ko 좌표가 변경됐을 때 발생한다.
			 * @name eg.MovableCoord#change
			 * @event
			 *
			 * @param {Object} param
			 * @param {Array} param.pos departure coordinate  <ko>좌표</ko>
			 * @param {Number} param.pos.0 departure x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.pos.1 departure y-coordinate <ko>y 좌표</ko>
			 * @param {Boolean} param.holding If an area was pressed, this value is 'true'. <ko>스크린을 사용자가 누르고 있을 경우 true </ko>
			 * @param {Object} param.hammerEvent Hammerjs event. http://hammerjs.github.io/api/#hammer.input-event <ko>사용자의 액션에 대한 hammerjs 이벤트 정보</ko>
			 *
			 */
			this._pos = pos.concat();
			this.trigger("change", {
				pos: pos.concat(),
				holding: holding,
				hammerEvent: e || { }
			});
		},

		/**
		 * Get current positions
		 * @ko 현재 위치를 반환한다.
		 * @method eg.MovableCoord#get
		 * @return {Array} pos
		 * @return {Number} pos.0 x position
		 * @return {Number} pos.1 y position
		 */
		get: function() {
			return this._pos.concat();
		},

		/**
		 * Set to position
		 *
		 * If a duration was greater than zero, 'change' event was triggered for duration.
		 * @ko 위치를 설정한다. 만약, duration이 0보다 크다면 'change' 이벤트가 발생한다.
		 * @method eg.MovableCoord#setTo
		 * @param {Number} x x-coordinate <ko>이동할 x좌표</ko>
		 * @param {Number} y y-coordinate <ko>이동할 y좌표</ko>
		 * @param {Number} [duration=0] Duration of animation in milliseconds. <ko>애니메이션 진행시간(ms)</ko>
		 * @return {Instance}
		 */
		setTo: function(x, y, duration) {
			this._grab();
			var pos = this._pos.concat();
			var circular = this.options.circular;
			var min = this.options.min;
			var max = this.options.max;
			if (x === pos[0] && y === pos[1]) {
				return this;
			}
			this._setInterrupt(true);

			if (x !== pos[0]) {
				if (!circular[3]) {
					x = Math.max(min[0], x);
				}
				if (!circular[1]) {
					x = Math.min(max[0], x);
				}
			}
			if (y !== pos[1]) {
				if (!circular[0]) {
					y = Math.max(min[1], y);
				}
				if (!circular[2]) {
					y = Math.min(max[1], y);
				}
			}
			if (duration) {
				this._animateTo([ x, y ], this._animationEnd, false, duration);
			} else {
				this._pos = this._getCircularPos([ x, y ]);
				this._triggerChange(this._pos, false);
				this._setInterrupt(false);
			}
			return this;
		},
		/**
		 * Set to relative position
		 *
		 * If a duration was greater than zero, 'change' event was triggered for duration
		 * @ko 현재를 기준으로 위치를 설정한다. 만약, duration이 0보다 크다면 'change' 이벤트가 발생한다.
		 * @method eg.MovableCoord#setBy
		 * @param {Number} x x-coordinate <ko>이동할 x좌표</ko>
		 * @param {Number} y y-coordinate <ko>이동할 y좌표</ko>
		 * @param {Number} [duration=0] Duration of animation in milliseconds. <ko>애니메이션 진행시간(ms)</ko>
		 * @return {Array}
		 */
		setBy: function(x, y, duration) {
			return this.setTo(
				x != null ? this._pos[0] + x : this._pos[0],
				y != null ? this._pos[1] + y : this._pos[1],
				duration
			);
		},

		_easing: function(p) {
			if (p > 1) {
				return 1;
			} else {
				return this.options.easing(p, p, 0, 1, 1);
			}
		},

		_initSlope: function() {
			var easing = this.options.easing;
			var isIn = false;
			var p;
			for (p in $.easing) {
				if ($.easing[p] === easing) {
					isIn = !~p.indexOf("Out");
					break;
				}
			}
			return isIn ?
					easing(0.9999, 0.9999, 0, 1, 1) / 0.9999 :
					easing(0.00001, 0.00001, 0, 1, 1) / 0.00001;
		},

		_setInterrupt: function(prevented) {
			!this._subOptions.interruptable &&
			(this._status.prevented = prevented);
		},

		/**
		 * Release resources and off custom events
		 * @ko 모든 커스텀 이벤트와 자원을 해제한다.
		 * @method eg.MovableCoord#destroy
		 */
		destroy: function() {
			this.off();
			for (var p in this._hammers) {
				this._hammers[p].destroy();
				this._hammers[p] = null;
			}
		}
	});
	ns.MovableCoord.KEY = "__MOVABLECOORD__";
});
// jscs:disable validateLineBreaks, maximumLineLength
eg.module("flicking", [window.jQuery, eg, eg.MovableCoord], function ($, ns, MC) {
	// jscs:enable validateLineBreaks, maximumLineLength
	/**
	 * To build flickable UI
	 * @group egjs
	 * @ko 플리킹 UI를 구성한다.
	 * @class
	 * @name eg.Flicking
	 * @extends eg.Component
	 *
	 * @param {HTMLElement|String|jQuery} element wrapper element <ko>기준 요소</ko>
	 * @param {Object} options
	 * @param {Boolean} [options.hwAccelerable=eg.isHWAccelerable()] Force to use HW compositing <ko>하드웨어 가속 사용여부</ko>
	 * @param {String} [options.prefix=eg-flick] Prefix string for flicking elements <ko>요소에 설정될 접두사</ko>
	 * @param {Number} [options.deceleration=0.0006] Deceleration this value can be altered to change the momentum animation duration. higher numbers make the animation shorter
	 * @param {Boolean} [options.horizontal=true] For move direction (when horizontal is false, then move direction is vertical) <ko>이동방향 설정 (horizontal == true 가로방향, horizontal == false 세로방향)</ko>
	 * @param {Boolean} [options.circular=false] To make panels rotate infinitely  <ko>순환 여부</ko>
	 * @param {Number|Array} [options.previewPadding=[0,0]] Padding value to display previous and next panels. If set array value the order is left(up) to right(down) <ko>이전과 다음 패널을 출력하는 프리뷰 형태에 사용되는 padding 값. 배열 형태로 지정시 좌측(상단), 우측(하단) 순서로 지정</ko>
	 * @param {Number} [options.threshold=40] Threshold pixels to move panels in prev/next direction <ko>다음 패널로 이동되기 위한 임계치 픽셀</ko>
	 * @param {Number} [options.duration=100] Duration time of panel change animation in milliseconds <ko>패널 이동 애니메이션 진행시간(ms) 값</ko>
	 * @param {Function} [options.panelEffect=easeOutCubic] easing function which is used on panel move animation<ko>패널 간의 이동 애니메이션에 사용되는 effect easing 함수</ko>
	 * @param {Number} [options.defaultIndex=0] Default panel index to show in first time <ko>초기에 출력할 패널 인덱스</ko>
	 * @param {Array} [options.inputType] inputType you can control input type. a kind of inputs are "touch", "mouse".  default value is ["touch", "mouse"] <ko>입력 타입을 지정할수 있다. 입력타입은 "touch", "mouse"가 있으며, 배열로 입력할 수 있다. (기본값은 ["touch", "mouse"] 이다)</ko>
	 *
	 * @codepen {"id":"rVOpPK", "ko":"플리킹 기본 예제", "en":"Flicking default example", "collectionId":"ArxyLK", "height" : 403}
	 *
	 * @support {"ie": "10+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	 *
	 * @see Easing Functions Cheat Sheet {@link http://easings.net/}
	 * @see If you want to use another easing function then should be import jQuery easing plugin({@link http://gsgd.co.uk/sandbox/jquery/easing/}) or jQuery UI easing.({@link https://jqueryui.com/easing/})<ko>다른 easing 함수를 사용하고 싶다면, jQuery easing plugin({@link http://gsgd.co.uk/sandbox/jquery/easing/})이나, jQuery UI easing({@link https://jqueryui.com/easing/}) 라이브러리를 삽입해야 한다.</ko>
	 * @example
	 	<!-- HTML -->
		<div id="mflick">
			<div>
				<p>Layer 0</p>
			</div>
			<div>
				<p>Layer 1</p>
			</div>
			<div>
				<p>Layer 2</p>
			</div>
		</div>
		<script>
	 	var some = new eg.Flicking("#mflick", {
	 		circular : true,
	 		threshold : 50
	 	}).on({
	 		beforeRestore : function(e) { ... },
	 		flickStart : function(e) { ... }
	 	);
	 	</script>
	 */
	ns.Flicking = ns.Class.extend(ns.Component, {
		/**
		 * Constructor
		 * @param {HTMLElement|String|jQuery} element - base element
		 * @param {Object} options
		 */
		construct: function (element, options) {
			this.$wrapper = $(element);

			$.extend(this.options = {
				hwAccelerable: ns.isHWAccelerable(),  // check weather hw acceleration is available
				prefix: "eg-flick",		// prefix value of class name
				deceleration: 0.0006,		// deceleration value
				horizontal: true,			// move direction (true == horizontal, false == vertical)
				circular: false,			// circular mode. In this mode at least 3 panels are required.
				previewPadding: [0, 0],	// preview padding value in left(up) to right(down) order. In this mode at least 5 panels are required.
				threshold: 40,				// the distance pixel threshold value for change panel
				duration: 100,				// duration ms for animation
				panelEffect: $.easing.easeOutCubic,  // $.easing function for panel change animation
				defaultIndex: 0,			// initial panel index to be shown
				inputType: ["touch", "mouse"]	// input type
			}, options);

			var padding = this.options.previewPadding;
			var supportHint = window.CSS &&
				window.CSS.supports &&
				window.CSS.supports("will-change", "transform");

			var os = ns.agent().os;

			if (typeof padding === "number") {
				padding = this.options.previewPadding = [ padding, padding ];
			} else if (padding.constructor !== Array) {
				padding = this.options.previewPadding = [ 0, 0 ];
			}

			// config value
			this._conf = {
				panel: {
					$list: [],			// panel list
					index: 0,			// current physical dom index
					no: 0,				// current logical panel index
					size: 0,			// panel size
					count: 0,			// total physical panel count
					origCount: 0,		// total count of given original panels
					changed: false,		// if panel changed
					animating: false,	// current animating status boolean
					minCount: padding[0] + padding[1] > 0 ? 5 : 3  // minimum panel count
				},
				touch: {
					holdPos: [0, 0],	// hold x,y coordinate
					destPos: [0, 0],	// destination x,y coordinate
					distance: 0,		// touch distance pixel of start to end touch
					direction: null	// touch direction
				},
				customEvent: {},		// for custom event return value
				useLayerHack: this.options.hwAccelerable && !supportHint,
				dirData: [],
				indexToMove: 0,
				triggerFlickEvent: true,

				// For buggy link highlighting on Android 2.x
				isAndroid2: os.name === "android" && /^2\./.test(os.version),
				$dummyAnchor: null
			};

			$([["LEFT", "RIGHT"], ["DOWN", "UP"]][+!this.options.horizontal]).each(
				$.proxy(function (i, v) {
					this._conf.dirData.push(ns["DIRECTION_" + v]);
				}, this));

			!ns._hasClickBug() && (this._setPointerEvents = function () {
			});

			this._build();
			this._bindEvents();

			this._applyPanelsCss();
			this._arrangePanels();

			this.options.hwAccelerable && supportHint && this._setHint();
			this._adjustContainerCss("end");
		},

		/**
		 * Build and set panel nodes to make flicking structure
		 */
		_build: function () {
			var panel = this._conf.panel;
			var options = this.options;
			var children = panel.$list = this.$wrapper.children();
			var padding = options.previewPadding.concat();
			var prefix = options.prefix;
			var horizontal = options.horizontal;
			var panelCount = panel.count = panel.origCount = children.length;
			var sizeValue = [
				panel.size = this.$wrapper[
						horizontal ? "width" : "height"
						]() - (padding[0] + padding[1]), "100%"
			];
			var cssValue;

			this.$wrapper.css({
				padding: (
					horizontal ?
					"0 " + padding.reverse().join("px 0 ") :
						padding.join("px 0 ")
				) + "px",
				overflow: "hidden"
			});

			this._getDataByDirection(sizeValue);

			// panels' css values
			children.addClass(prefix + "-panel").css({
				position: "absolute",
				width: sizeValue[0],
				height: sizeValue[1],
				top: 0,
				left: 0
			});

			// create container element
			cssValue = "position:relative;z-index:2000;width:100%;height:100%;" +
				(!horizontal ? "top:" + padding[0] + "px;" : "");

			this.$container = children.wrapAll(
				"<div class='" + prefix + "-container' style='" + cssValue + "' />"
			).parent();

			if (this._addClonePanels()) {
				panelCount = panel.count = (
					panel.$list = this.$container.children()
				).length;
			}

			// create MovableCoord instance
			this._mcInst = new MC({
				min: [0, 0],
				max: this._getDataByDirection([panel.size * (panelCount - 1), 0]),
				margin: 0,
				circular: false,
				easing: options.panelEffect,
				deceleration: options.deceleration
			}).bind(this.$wrapper, {
				scale: this._getDataByDirection([-1, 0]),
				direction: ns["DIRECTION_" + (horizontal ? "HORIZONTAL" : "VERTICAL")],
				interruptable: false,
				inputType: options.inputType
			});

			this._setDefaultPanel(options.defaultIndex);
		},

		/**
		 * To fulfill minimum panel count cloning original node when circular or previewPadding option are set
		 * @return {Boolean} true : added clone node, false : not added
		 */
		_addClonePanels: function () {
			var panel = this._conf.panel;
			var panelCount = panel.origCount;
			var cloneCount = panel.minCount - panelCount;
			var list = panel.$list;
			var cloneNodes;

			// if panels are given less than required when circular option is set, then clone node to apply circular mode
			if (this.options.circular && panelCount < panel.minCount) {
				cloneNodes = list.clone();

				while (cloneNodes.length < cloneCount) {
					cloneNodes = cloneNodes.add(list.clone());
				}

				return this.$container.append(cloneNodes);
			}
		},

		/**
		 * Move panel's position within array
		 * @param {Number} count element counts to move
		 * @param {Boolean} append where the list to be appended(moved) (true: to the end, false: to the beginning)
		 */
		_movePanelPosition: function (count, append) {
			var panel = this._conf.panel;
			var list = panel.$list.toArray();
			var listToMove;

			listToMove = list.splice(append ? 0 : panel.count - count, count);
			panel.$list = $(append ? list.concat(listToMove) : listToMove.concat(list));
		},

		/**
		 * Set default panel to show
		 * @param {Number} index
		 */
		_setDefaultPanel: function (index) {
			var panel = this._conf.panel;
			var lastIndex = panel.count - 1;
			var coords;

			if (this.options.circular) {
				// if default index is given, then move correspond panel to the first position
				if (index > 0 && index <= lastIndex) {
					this._movePanelPosition(index, true);
				}

				// set first panel's position according physical node length
				this._movePanelPosition(this._getBasePositionIndex(), false);

				panel.no = index;
			} else {
				// if defaultIndex option is given, then move to that index panel
				if (index > 0 && index <= lastIndex) {
					panel.index = index;
					coords = [ -(panel.size * index), 0];

					this._setTranslate(coords);
					this._setMovableCoord("setTo", [
						Math.abs(coords[0]), Math.abs(coords[1])
					], true, 0);
				}
			}
		},

		/**
		 * Arrange panels' position
		 * @param {Boolean} sort Need to sort panel's position
		 * @param {Number} indexToMove Number to move from current position (negative: left, positive: right)
		 */
		_arrangePanels: function (sort, indexToMove) {
			var conf = this._conf;
			var panel = conf.panel;
			var touch = conf.touch;
			var dirData = conf.dirData;

			if (this.options.circular) {
				// when arranging panels, set flag to not trigger flick custom event
				conf.triggerFlickEvent = false;

				// move elements according direction
				if (sort) {
					indexToMove && (touch.direction = dirData[+!Boolean(indexToMove > 0)]);
					this._arrangePanelPosition(touch.direction, indexToMove);
				}

				// set index for base element's position
				panel.index = this._getBasePositionIndex();

				// arrange MovableCoord's coord position
				conf.triggerFlickEvent = !!this._setMovableCoord("setTo", [
					panel.size * panel.index, 0
				], true, 0);
			}

			this._applyPanelsPos();
		},

		/**
		 * Set each panel's position in DOM
 		 */
		_applyPanelsPos: function() {
			this._conf.panel.$list.each(
				$.proxy(this._applyPanelsCss, this)
			);
		},

		/**
		 * Callback function for applying CSS values to each panels
		 */
		_applyPanelsCss: function () {
			var conf = this._conf;
			var dummyAnchorClassName = "__dummy_anchor";

			if (conf.isAndroid2) {
				conf.$dummyAnchor = $("." + dummyAnchorClassName);

				!conf.$dummyAnchor.length && this.$wrapper.append(
					conf.$dummyAnchor = $("<a href='javascript:void(0);' class='" +
						dummyAnchorClassName +
						"' style='position:absolute;height:0px;width:0px;'>")
				);

				this._applyPanelsCss = function (i, v) {
					var coords = this._getDataByDirection([
						(this._conf.panel.size * i) + "px", 0
					]);

					$(v).css({
						left: coords[0],
						top: coords[1]
					});
				};
			} else {
				this._applyPanelsCss = function (i, v) {
					var coords = this._getDataByDirection([(100 * i) + "%", 0]);
					$(v).css("transform", ns.translate(
						coords[0], coords[1], this._conf.useLayerHack
					));
				};
			}
		},

		/**
		 * Adjust container's css value to handle Android 2.x link highlighting bug
		 *
		 * @param {String} phase
		 *    start - set left/top value to 0
		 *    end - set translate value to 0
		 * @param {Array} coords coordinate value
		 */
		_adjustContainerCss: function (phase, coords) {
			var conf = this._conf;
			var panel = conf.panel;
			var options = this.options;
			var horizontal = options.horizontal;
			var paddingTop = options.previewPadding[0];
			var container = this.$container;
			var value;

			if (conf.isAndroid2) {
				if (phase === "start") {
					container = container[0].style;
					value = parseInt(container[horizontal ? "left" : "top"], 10);

					if (horizontal) {
						value && (container.left = 0);
					} else {
						value !== paddingTop && (container.top = paddingTop + "px");
					}

					this._setTranslate([-coords[+!options.horizontal], 0]);

				} else if (phase === "end") {
					if (!coords) {
						coords = [-panel.size * panel.index, 0];
					}

					!horizontal && (coords[0] += paddingTop);
					coords = this._getCoordsValue(coords);

					container.css({
						left: coords.x,
						top: coords.y,
						transform: ns.translate(0, 0, conf.useLayerHack)
					});

					conf.$dummyAnchor[0].focus();
				}
			}
		},

		/**
		 * Set MovableCoord coord value
		 * @param {String} method
		 * @param {Array} coord
		 * @param {Boolean} isDirVal
		 * @param {Number} duration
		 * @return {Object} MovableCoord instance
		 */
		_setMovableCoord: function (method, coord, isDirVal, duration) {
			isDirVal && this._getDataByDirection(coord);
			return this._mcInst[method](coord[0], coord[1], duration);
		},

		/**
		 * Set hint for browser to decide efficient way of doing transform changes(or animation)
		 * https://dev.opera.com/articles/css-will-change-property/
		 */
		_setHint: function () {
			var value = "transform";
			this.$container.css("willChange", value);
			this._conf.panel.$list.css("willChange", value);
		},

		/**
		 * Get data according options.horizontal value
		 *
		 * @param {Array} value primary data to handle
		 * @return {Array}
		 */
		_getDataByDirection: function (value) {
			!this.options.horizontal && value.reverse();
			return value;
		},

		/**
		 * Move nodes
		 * @param {Boolean} diretion
		 * @param {Number} indexToMove
		 */
		_arrangePanelPosition: function (direction, indexToMove) {
			var next = direction === this._conf.dirData[0];
			this._movePanelPosition(Math.abs(indexToMove || 1), next);
		},

		/**
		 * Get the base position index of the panel
		 */
		_getBasePositionIndex: function () {
			var panel = this._conf.panel;
			return panel.index = Math.floor(panel.count / 2 - 0.1);
		},

		/**
		 * Bind events
		 */
		_bindEvents: function () {
			this._mcInst.on({
				hold: $.proxy(this._holdHandler, this),
				change: $.proxy(this._changeHandler, this),
				release: $.proxy(this._releaseHandler, this),
				animationStart: $.proxy(this._animationStartHandler, this),
				animationEnd: $.proxy(this._animationEndHandler, this)
			});
		},

		/**
		 * 'hold' event handler
		 */
		_holdHandler: function (e) {
			this._conf.touch.holdPos = e.pos;
			this._conf.panel.changed = false;

			this._adjustContainerCss("start", e.pos);
		},

		/**
		 * 'change' event handler
		 */
		_changeHandler: function (e) {
			var pos = e.pos;
			var eventRes = null;

			this._setPointerEvents(e);  // for "click" bug

			/**
			 * Occurs during the change
			 * @ko 터치하지 않은 상태에서 패널이 이동될 때 발생하는 이벤트
			 * @name eg.Flicking#flick
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
			 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
			 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
			 * @param {Number} param.direction Direction of the panel move (see eg.DIRECTION_* constant) <ko>플리킹 방향 (eg.DIRECTION_* constant 확인)</ko>
			 * @param {Array} param.pos Departure coordinate <ko>출발점 좌표</ko>
			 * @param {Number} param.pos.0 Departure x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.pos.1 Departure y-coordinate <ko>y 좌표</ko>
			 */
			this._conf.triggerFlickEvent && !e.holding &&
			(eventRes = this._triggerEvent("flick", {pos: e.pos}));

			(eventRes || eventRes === null) && this._setTranslate([
				-pos[+!this.options.horizontal], 0
			]);
		},

		/**
		 * 'release' event handler
		 */
		_releaseHandler: function (e) {
			var touch = this._conf.touch;
			var pos = e.destPos;
			var posIndex = +!this.options.horizontal;
			var holdPos = touch.holdPos[posIndex];
			var panelSize = this._conf.panel.size;

			touch.distance = e.depaPos[posIndex] - touch.holdPos[posIndex];

			touch.direction = this._conf.dirData[
				+!Boolean(touch.holdPos[posIndex] < e.depaPos[posIndex])
			];

			pos[posIndex] = Math.max(
				holdPos - panelSize, Math.min(holdPos, pos[posIndex])
			);

			touch.destPos[posIndex] =
				pos[posIndex] = Math.round(pos[posIndex] / panelSize) * panelSize;

			touch.distance === 0 && this._adjustContainerCss("end");

			this._setPointerEvents();  // for "click" bug
		},

		/**
		 * 'animationStart' event handler
		 */
		_animationStartHandler: function (e) {
			var conf = this._conf;
			var panel = conf.panel;
			var pos = {
				depaPos: e.depaPos,
				destPos: e.destPos
			};
			var fpStop = function () {
					e.stop();
					panel.animating = false;
				};

			panel.animating = true;

			//e.duration = this.options.duration;

			this._setPhaseValue("start");
			e.destPos[+!this.options.horizontal] =
				panel.size * (
					panel.index + this._conf.indexToMove
				);

			if (this._isMovable()) {
				/**
				 * Before panel changes
				 * @ko 플리킹이 시작되기 전에 발생하는 이벤트
				 * @name eg.Flicking#beforeFlickStart
				 * @event
				 *
				 * @param {Object} param
				 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
				 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
				 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
			 	 * @param {Number} param.direction Direction of the panel move (see eg.DIRECTION_* constant) <ko>플리킹 방향 (eg.DIRECTION_* constant 확인)</ko>
				 * @param {Array} param.depaPos Departure coordinate <ko>출발점 좌표</ko>
				 * @param {Number} param.depaPos.0 Departure x-coordinate <ko>x 좌표</ko>
				 * @param {Number} param.depaPos.1 Departure y-coordinate <ko>y 좌표</ko>
				 * @param {Array} param.destPos Destination coordinate <ko>도착점 좌표</ko>
				 * @param {Number} param.destPos.0 Destination x-coordinate <ko>x 좌표</ko>
				 * @param {Number} param.destPos.1 Destination y-coordinate <ko>y 좌표</ko>
				 */
				if (!this._triggerEvent("beforeFlickStart", pos)) {
					fpStop();
					panel.changed = false;
				}

			} else {
				/**
				 * Before panel restores it's last position
				 * @ko 플리킹 임계치에 도달하지 못하고 사용자의 액션이 끝났을 경우, 원래 패널로 복원되기 전에 발생하는 이벤트
				 * @name eg.Flicking#beforeRestore
				 * @event
				 *
				 * @param {Object} param
				 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
				 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
				 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
			 	 * @param {Number} param.direction Direction of the panel move (see eg.DIRECTION_* constant) <ko>플리킹 방향 (eg.DIRECTION_* constant 확인)</ko>
				 * @param {Array} param.depaPos Departure coordinate <ko>출발점 좌표</ko>
				 * @param {Number} param.depaPos.0 Departure x-coordinate <ko>x 좌표</ko>
				 * @param {Number} param.depaPos.1 Departure y-coordinate <ko>y 좌표</ko>
				 * @param {Array} param.destPos Destination coordinate <ko>도착점 좌표</ko>
				 * @param {Number} param.destPos.0 Destination x-coordinate <ko>x 좌표</ko>
				 * @param {Number} param.destPos.1 Destination y-coordinate <ko>y 좌표</ko>
				 */
				conf.customEvent.restore = this._triggerEvent("beforeRestore", pos);

				if (!conf.customEvent.restore) {
					fpStop();
				}
			}
		},

		/**
		 * 'animationEnd' event handler
		 */
		_animationEndHandler: function () {
			var panel = this._conf.panel;

			this._setPhaseValue("end");
			panel.animating = false;

			/**
			 * After panel changes
			 * @ko 플리킹으로 패널이 이동된 후 발생하는 이벤트
			 * @name eg.Flicking#flickEnd
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
			 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
			 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
			 * @param {Number} param.direction Direction of the panel move (see eg.DIRECTION_* constant) <ko>플리킹 방향 (eg.DIRECTION_* constant 확인)</ko>
			 */
			/**
			 * After panel restores it's last position
			 * @ko 플리킹 임계치에 도달하지 못하고 사용자의 액션이 끝났을 경우, 원래 인덱스로 복원된 후 발생하는 이벤트
			 * @name eg.Flicking#restore
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
			 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
			 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
			 * @param {Number} param.direction Direction of the panel move (see eg.DIRECTION_* constant) <ko>플리킹 방향 (eg.DIRECTION_* constant 확인)</ko>
			 */
			if (panel.changed) {
				this._triggerEvent("flickEnd");
			} else if (this._conf.customEvent.restore) {
				this._triggerEvent("restore");
			}
		},

		/**
		 * Set value when panel changes
		 * @param {String} phase - [start|end]
		 */
		_setPhaseValue: function (phase) {
			var conf = this._conf;
			var options = this.options;
			var panel = conf.panel;
			var coords;

			if (~phase.indexOf("start") && (panel.changed = this._isMovable())) {
				conf.indexToMove === 0 && this._setPanelNo();
			}

			if (~phase.indexOf("end")) {
				if (options.circular && panel.changed) {
					this._arrangePanels(true, conf.indexToMove);
				}

				coords = [-panel.size * panel.index, 0];

				conf.isAndroid2 ?
					this._adjustContainerCss("end", coords) :
					this._setTranslate(coords);

				conf.indexToMove = 0;
			}
		},

		/**
		 * Set the logical panel index number
		 * @param {Boolean} recover
		 */
		_setPanelNo: function (recover) {
			var panel = this._conf.panel;
			var count = panel.origCount - 1;
			var num = this._conf.touch.direction === this._conf.dirData[0] ? 1 : -1;

			if (recover) {
				panel.index -= num;
				panel.no -= num;
			} else {
				panel.index += num;
				panel.no += num;
			}

			if (panel.no > count) {
				panel.no = 0;
			} else if (panel.no < 0) {
				panel.no = count;
			}
		},

		/**
		 * Set pointerEvents css property on container element due to the iOS click bug
		 * @param {Event} e
		 */
		_setPointerEvents: function (e) {
			var pointer = this.$container.css("pointerEvents");
			var val;

			if (e && e.holding &&
				e.hammerEvent.preventSystemEvent &&
				pointer !== "none"
			) {
				val = "none";
			} else if (!e && pointer !== "auto") {
				val = "auto";
			}

			val && this.$container.css("pointerEvents", val);
		},

		/**
		 * Get coordinate value with unit
		 * @param coords {Array} x,y numeric value
		 * @return {Object} x,y coordinate value with unit
		 */
		_getCoordsValue: function (coords) {
			// the param comes as [ val, 0 ], whatever the direction. So reorder the value depend the direction.
			this._getDataByDirection(coords);

			return {
				x: this._getUnitValue(coords[0]),
				y: this._getUnitValue(coords[1])
			};
		},

		/**
		 * Set translate property value
		 * @param {Array} coords coordinate x,y value
		 */
		_setTranslate: function (coords) {
			coords = this._getCoordsValue(coords);

			this.$container.css("transform", ns.translate(
				coords.x, coords.y, this._conf.useLayerHack
			));
		},

		/**
		 * Return unit formatted value
		 * @param {Number|String} val
		 * @return {String} val Value formatted with unit
		 */
		_getUnitValue: function (val) {
			var rx = /(?:[a-z]{2,}|%)$/;
			return (parseInt(val, 10) || 0) + (String(val).match(rx) || "px");
		},

		/**
		 * Check if panel passed through threshold pixel
		 */
		_isMovable: function () {
			return Math.abs(this._conf.touch.distance) >= this.options.threshold;
		},

		/**
		 * Trigger custom events
		 * @param {String} name - event name
		 * @param {Object} param - additional event value
		 * @return {Boolean}
		 */
		_triggerEvent: function (name, param) {
			var panel = this._conf.panel;

			return this.trigger(name, param = $.extend({
				eventType: name,
				index: panel.index,
				no: panel.no,
				direction: this._conf.touch.direction
			}, param));
		},

		/**
		 * Get next/prev panel element/index.
		 * @param {Boolean} direction
		 * @param {Boolean} element - true:to get element, false:to get index
		 * @param {Number} physical - true : physical, false : logical
		 * @return {jQuery|Number}
		 */
		_getElement: function (direction, element, physical) {
			var panel = this._conf.panel;
			var circular = this.options.circular;
			var pos = panel.index;
			var next = direction === this._conf.dirData[0];
			var result = null;
			var total;
			var index;
			var currentIndex;

			if (physical) {
				total = panel.count;
				index = pos;
			} else {
				total = panel.origCount;
				index = panel.no;
			}

			currentIndex = index;

			if (next) {
				if (index < total - 1) {
					index++;
				} else if (circular) {
					index = 0;
				}
			} else {
				if (index > 0) {
					index--;
				} else if (circular) {
					index = total - 1;
				}
			}

			if (currentIndex !== index) {
				result = element ? $(panel.$list[next ? pos + 1 : pos - 1]) : index;
			}

			return result;
		},

		/**
		 * Set value to force move panels when duration is 0
		 * @param {Boolean} next
		 */
		_setValueToMove: function (next) {
			this._conf.touch.distance = this.options.threshold + 1;
			this._conf.touch.direction = this._conf.dirData[ +!next ];
		},

		/**
		 * Check and parse value to number
		 * @param {Number|String} val
		 * @param {Number} defVal
		 * @returns {Number}
		 */
		_getNumValue: function (val, defVal) {
			return isNaN(val = parseInt(val, 10)) ? defVal : val;
		},

		/**
		 * Move panel to the given direction
		 * @param {Boolean} next
		 * @param {Number} duration
		 */
		_movePanel: function (next, duration) {
			var panel = this._conf.panel;
			var options = this.options;

			if (panel.animating) {
				return;
			}

			duration = this._getNumValue(duration, options.duration);

			this._setValueToMove(next);

			if (options.circular ||
				this[next ? "getNextIndex" : "getPrevIndex"]() != null
			) {
				this._setMovableCoord("setBy", [
					panel.size * (next ? 1 : -1), 0
				], true, duration);

				!duration && this._setPhaseValue("startend");
			}
		},

		/**
		 * Get current panel position
		 * @ko 현재 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number} Number Current index number <ko>현재 패널 인덱스 번호</ko>
		 */
		getIndex: function (physical) {
			return this._conf.panel[ physical ? "index" : "no" ];
		},

		/**
		 * Get current panel element
		 * @ko 현재 패널 요소의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getElement
		 * @return {jQuery} jQuery Current element <ko>현재 요소</ko>
		 */
		getElement: function () {
			var panel = this._conf.panel;
			return $(panel.$list[panel.index]);
		},

		/**
		 * Get next panel element
		 * @ko 다음 패널 요소의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getNextElement
		 * @return {jQuery} jQuery Next element <ko>다음 패널 요소</ko>
		 */
		getNextElement: function () {
			return this._getElement(this._conf.dirData[0], true);
		},

		/**
		 * Get next panel index
		 * @ko 다음 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getNextIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number} Number Next element index value <ko>다음 패널 인덱스 번호</ko>
		 */
		getNextIndex: function (physical) {
			return this._getElement(this._conf.dirData[0], false, physical);
		},

		/**
		 * Get whole panel elements
		 * @ko 패널을 구성하는 모든 요소들의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getAllElements
		 * @return {jQuery} jQuery All panel elements <ko>모든 패널 요소</ko>
		 */
		getAllElements: function () {
			return this._conf.panel.$list;
		},

		/**
		 * Get previous panel element
		 * @ko 이전 패널 요소의 레퍼런스를 반환한다.
		 * @method ns.Flicking#getPrevElement
		 * @return {jQuery} jQuery Previous element <ko>이전 패널 요소</ko>
		 */
		getPrevElement: function () {
			return this._getElement(this._conf.dirData[1], true);
		},

		/**
		 * Get previous panel index
		 * @ko 이전 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getPrevIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number} number Previous element index value <ko>이전 패널 인덱스 번호</ko>
		 */
		getPrevIndex: function (physical) {
			return this._getElement(this._conf.dirData[1], false, physical);
		},

		/**
		 * Get total panel count
		 * @ko 전체 패널의 개수를 반환한다.
		 * @method eg.Flicking#getTotalCount
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number} Number Count of all elements <ko>모든 패널 요소 개수</ko>
		 */
		getTotalCount: function (physical) {
			return this._conf.panel[ physical ? "count" : "origCount" ];
		},

		/**
		 * Return either panel is animating or not
		 * @ko 현재 애니메이션중인지 여부를 리턴한다.
		 * @method eg.Flicking#isPlaying
		 * @return {Boolean}
		 */
		isPlaying: function () {
			return this._conf.panel.animating;
		},

		/**
		 * Move to next panel
		 * @ko 다음 패널로 이동한다.
		 * @method eg.Flicking#next
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds <ko>애니메이션 진행시간(ms)</ko>
		 */
		next: function (duration) {
			this._movePanel(true, duration);
		},

		/**
		 * Move to previous panel
		 * @ko 이전 패널로 이동한다.
		 * @method eg.Flicking#prev
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds <ko>애니메이션 진행시간(ms)</ko>
		 */
		prev: function (duration) {
			this._movePanel(false, duration);
		},

		/**
		 * Move to indicated panel
		 * @ko 지정한 패널로 이동한다.
		 * @method eg.Flicking#moveTo
		 * @param {Number} no logical panel index
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds <ko>애니메이션 진행시간(ms)</ko>
		 */
		moveTo: function (no, duration) {
			var panel = this._conf.panel;
			var options = this.options;
			var currentIndex = panel.index;
			var indexToMove = 0;
			var movableCount;
			var movable;

			no = this._getNumValue(no);

			if (typeof no !== "number" ||
				no >= panel.origCount ||
				no === panel.no ||
				panel.animating
			) {
				return;
			}

			duration = this._getNumValue(duration, options.duration);
			movable = options.circular || no >= 0 && no < panel.origCount;

			if (options.circular) {
				// real panel count which can be moved on each(left(up)/right(down)) sides
				movableCount = [ currentIndex, panel.count - (currentIndex + 1) ];

				if (no > panel.no) {
					indexToMove = no - panel.no;

					if (indexToMove > movableCount[1]) {
						indexToMove = -(movableCount[0] + 1 - (indexToMove - movableCount[1]));
					}
				} else {
					indexToMove = -(panel.no - no);

					if (Math.abs(indexToMove) > movableCount[0]) {
						indexToMove = movableCount[1] + 1 -
							(Math.abs(indexToMove) - movableCount[0]);
					}

				}

				panel.no = no;
				this._conf.indexToMove = indexToMove;
				this._setValueToMove(indexToMove > 0);

				this._setMovableCoord("setBy", [
					panel.size * indexToMove, 0
				], true, duration);

			} else if (movable) {
				panel.no = panel.index = no;
				this._setMovableCoord("setTo", [ panel.size * no, 0 ], true, duration);
			}

			movable && !duration && this._setPhaseValue("startend");
		},

		/**
		 * Update panel size according current viewport
		 * @ko 패널 사이즈 정보를 갱신한다.
		 * @method eg.Flicking#resize
		 */
		resize: function () {
			var conf = this._conf;
			var panel = conf.panel;
			var width = panel.size = this.$wrapper.width();
			var maxCoords = [width * (panel.count - 1), 0];

			// resize panel and parent elements
			this.$container.width(maxCoords[0] + width);
			panel.$list.css("width", width);

			// adjust the position of current panel
			this._mcInst.options.max = maxCoords;
			this._setMovableCoord("setTo", [width * panel.index, 0], true, 0);

			if (conf.isAndroid2) {
				this._applyPanelsPos();
				this._adjustContainerCss("end");
			}
		},

		/**
		 * Restore panel in its right position
		 * @ko 패널의 위치가 올바로 위치하지 않게 되는 경우, 제대로 위치하도록 보정한다.
		 */
		restore: function () {
			var conf = this._conf;
			var panel = conf.panel;
			var currPos = this._getDataByDirection(this._mcInst.get())[0];

			// check if the panel isn't in right position
			if (currPos % panel.size) {
				this._setPanelNo(true);
				this._setMovableCoord("setTo", [panel.size * panel.index, 0], true, 0);
				conf.isAndroid2 && this._adjustContainerCss("end");
			}
		}
	});
});
// jscs:disable maximumLineLength
eg.module("infiniteGrid", [window.jQuery, eg, window, window.Outlayer, window.global], function($, ns, global, Outlayer) {
	// jscs:enable validateLineBreaks, maximumLineLength
	if (!Outlayer) {
		ns.InfiniteGrid = ns.Class({});
		return;
	}

	// for IE -- start
	var hasEventListener = !!global.addEventListener;
	var eventPrefix = hasEventListener ? "" : "on";
	var bindMethod = hasEventListener ? "addEventListener" : "attachEvent";
	var unbindMethod = hasEventListener ? "removeEventListener" : "detachEvent";
	function bindImage(ele, callback) {
		ele[bindMethod](eventPrefix + "load", callback, true);
		ele[bindMethod](eventPrefix + "error", callback, true);
	}
	function unbindImage(ele, callback) {
		ele[unbindMethod](eventPrefix + "load", callback, true);
		ele[unbindMethod](eventPrefix + "error", callback, true);
	}

	// for IE -- end
	function clone(target, source, what) {
		var s;
		$.each(what, function(i, v) {
			s = source[v];
			if (s != null) {
				if ($.isArray(s)) {
					target[v] = $.merge([], s);
				} else if ($.isPlainObject(s)) {
					target[v] = $.extend(true, {}, s);
				} else {
					target[v] = s;
				}
			}
		});
		return target;
	}

	var InfiniteGridCore = Outlayer.create("InfiniteGrid");
	$.extend(InfiniteGridCore.prototype, {
		// @override (from layout)
		_resetLayout: function() {
			if (!this._isLayoutInited) {
				this._registGroupKey(this.options.defaultGroupKey, this.items);
			}
			this.element.style.width = null;
			this.getSize();	// create size property
			this._measureColumns();
		},

		// @override
		_getContainerSize: function() {
			return {
				height: Math.max.apply(Math, this._appendCols),
				width: this.size.outerWidth
			};
		},

		// @override
		_getItemLayoutPosition: function(item) {
			if (this._equalItemSize) {
				item.size = this._equalItemSize;
			} else {
				item.getSize();
			}
			(item.isAppend == null) && (item.isAppend = true);
			var y;
			var shortColIndex;
			var isAppend = item.isAppend;
			var cols = isAppend ? this._appendCols : this._prependCols;
			y = Math[isAppend ? "min" : "max"].apply(Math, cols);
			shortColIndex = $.inArray(y, cols);
			cols[shortColIndex] = y + (isAppend ?
				item.size.outerHeight : -item.size.outerHeight);

			return {
				x: this.columnWidth * shortColIndex,
				y: isAppend ? y : y - item.size.outerHeight
			};
		},
		resetLayout: function() {
			this._resetLayout();
			this._isLayoutInited = true;
		},
		updateCols: function(isAppend) {
			var col = isAppend ? this._appendCols : this._prependCols;
			var items = this.getColItems(isAppend);
			var base = this._isFitted || isAppend ? 0 : this._getMinY(items);
			var i = 0;
			var len = col.length;
			var item;
			for (; i < len; i++) {
				if (item = items[i]) {
					col[i] = item.position.y + (isAppend ? item.size.outerHeight : -base);
				} else {
					col[i] = 0;
				}
			}
			return base;
		},
		_getMinY: function(items) {
			return Math.min.apply(Math, $.map(items, function(v) {
				return v ? v.position.y : 0;
			}));
		},
		_measureColumns: function() {
			var containerWidth = this.size.outerWidth;
			var columnWidth = this._getColumnWidth();
			var cols = containerWidth / columnWidth;
			var excess = columnWidth - containerWidth % columnWidth;

			// if overshoot is less than a pixel, round up, otherwise floor it
			cols = Math.max(Math[ excess && excess < 1 ? "round" : "floor" ](cols), 1);

			// reset column Y
			this._appendCols = [];
			this._prependCols = [];
			while (cols--) {
				this._appendCols.push(0);
				this._prependCols.push(0);
			}
		},
		_getColumnWidth: function() {
			var el = this.items[0] && this.items[0].element;
			var size;
			if (el) {
				/* jshint ignore:start */
				size = getSize(el);
				/* jshint ignore:end */
			} else {
				size = {
					outerWidth: 0,
					outerHeight: 0
				};
			}
			this.options.isEqualSize && (this._equalItemSize = size);
			this.columnWidth = size.outerWidth || this.size.outerWidth;
			return this.columnWidth;
		},
		_getColIdx: function(item) {
			return parseInt(item.position.x / parseInt(this.columnWidth, 10), 10);
		},
		getColItems: function(isTail) {
			var len = this._appendCols.length;
			var colItems = new Array(len);
			var item;
			var idx;
			var count = 0;
			var i = isTail ? this.items.length - 1 : 0;
			while (item = this.items[i]) {
				idx = this._getColIdx(item);
				if (!colItems[idx]) {
					colItems[idx] = item;
					if (++count === len) {
						return colItems;
					}
				}
				i += isTail ? -1 : 1;
			}
			return colItems;
		},
		clone: function(target, source) {
			clone(target, source, [
				"_equalItemSize",
				"_appendCols",
				"_prependCols",
				"columnWidth",
				"size",
				"options"
				]);
			target.items = target.items || [];
			target.items.length = source.items.length;
			$.each(source.items, function(i) {
				target.items[i] = clone(target.items[i] || {}, source.items[i],
					["position", "size", "isAppend", "groupKey"]);
			});
			return target;
		},
		itemize: function(elements, groupKey) {
			var items = this._itemize(elements);
			this._registGroupKey(groupKey, items);
			return items;
		},
		_registGroupKey: function(groupKey, array) {
			if (groupKey != null) {
				var i = 0;
				var v;
				while (v = array[i++]) {
					v.groupKey = groupKey;
				}
			}
		},

		// @override
		destroy: function() {
			this.off();
			Outlayer.prototype.destroy.apply(this);
		}
	});

	/**
	 * To build Grid layout UI
	 * InfiniteGrid is composed of Outlayer. but this component supports recycle-dom.
	 * the more you add contents, a number of DOM are fixed.
	 * @group egjs
	 * @ko 그리드 레이아웃을 구성하는 UI 컴포넌트. InfiniteGrid는 Outlayer로 구성되어 있다. 하지만, 이 컴포넌트는 recycle-dom을 지원한다.
	 * 컨텐츠를 계속 증가하면 할수록 일정한 DOM 개수를 유지할수 있다.
	 * @class
	 * @name eg.InfiniteGrid
	 * @extends eg.Component
	 *
	 * @param {HTMLElement|String|jQuery} element wrapper element <ko>기준 요소</ko>
	 * @param {Object} [options]
	 * @param {Number} [options.itemSelector] specifies which child elements will be used as item elements in the layout. <ko>레이아웃의 아이템으로 사용될 엘리먼트들의 셀렉터</ko>
	 * @param {Boolean} [options.isEqualSize] determine if the size of all of items are same. <ko> 모든 아이템의 사이즈가 동일한지를 지정한다</ko>
	 * @param {Boolean} [options.defaultGroupKey] when initialzed if you have items in markup, groupkey of them are 'defaultGroupkey' <ko>초기화할때 마크업에 아이템이 있다면, defalutGroupKey를 groupKey로 지정한다</ko>
	 * @param {Boolean} [options.count=30] if count is more than zero, grid is recyclied. <ko>count값이 0보다 클 경우, 그리드는 일정한 dom 개수를 유지한다</ko>
	 *
	 *  @support {"ie": "8+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	 *
	 *  @see Outlayer {@link https://github.com/metafizzy/outlayer}
	 *
	 * @example
	 	<!-- HTML -->
		<ul id="grid">
		    <li class="item">
		      <div>테스트1</div>
		    </li>
		    <li class="item">
		      <div>테스트2</div>
		    </li>
		    <li class="item">
		      <div>테스트3</div>
		    </li>
		    <li class="item">
		      <div>테스트4</div>
		    </li>
		    <li class="item">
		      <div>테스트5</div>
		    </li>
		    <li class="item">
		      <div>테스트6</div>
		    </li>
	  	</ul>
		<script>
	 	var some = new eg.InfiniteGrid("#grid", {
		    itemSelector : ".item"
		}).on({
	 		beforeRestore : function(e) { ... },
	 		flickStart : function(e) { ... }
	 	);
	 	</script>
	 */
	ns.InfiniteGrid = ns.Class.extend(ns.Component, {
		construct: function(el, options) {
			var opts = $.extend({
				"isEqualSize": false,
				"defaultGroupKey": null,
				"count": 30
			}, options);
			opts.transitionDuration = 0;	// don't use this option.
			opts.isInitLayout = false;	// isInitLayout is always 'false' in order to controll layout.
			opts.isResizeBound = false;	// isResizeBound is always 'false' in order to controll layout.
			this.core = new InfiniteGridCore(el, opts)
				.on("layoutComplete", $.proxy(this._onlayoutComplete, this));
			this.$global = $(global);
			this._reset();
			this.core.$element.children().length > 0 && this.layout();
			this._onResize = $.proxy(this._onResize, this);
			this.$global.on("resize", this._onResize);

		},
		_onResize: function() {
			if (this.resizeTimeout) {
				clearTimeout(this.resizeTimeout);
			}
			var self = this;
			function delayed() {
				self.core.element.style.width = null;
				self.core.needsResizeLayout() && self.layout();
				delete self.resizeTimeout;
			}
			this.resizeTimeout = setTimeout(delayed, 100);
		},
		/**
		 * Get current status
		 * @ko infiniteGrid의 현재상태를 반환한다.
		 * @method eg.InfiniteGrid#getStatue
		 * @return {Object} infiniteGrid status Object
		 */
		getStatus: function() {
			var data = [];
			var p;
			for (p in this) {
				if (this.hasOwnProperty(p) && /^_/.test(p)) {
					data.push(p);
				}
			}
			return {
				core: this.core.clone({}, this.core),
				data: clone({}, this, data),
				html: this.core.$element.html(),
				cssText: this.core.element.style.cssText
			};
		},
		/**
		 * Set to current status
		 * @ko infiniteGrid의 현재상태를 설정한다.
		 * @method eg.InfiniteGrid#setStatus
		 * @param {Object} status Object
		 */
		setStatus: function(status) {
			this.core.element.style.cssText = status.cssText;
			this.core.$element.html(status.html);
			this.core.items = this.core.itemize(this.core.$element.children().toArray());
			this.core.clone(this.core, status.core);
			$.extend(this, status.data);
		},
		/**
		 * Check if element is appending or prepending
		 * @ko append나 prepend가 진행중일 경우 true를 반환한다.
		 * @method eg.InfiniteGrid#isProcessing
		 * @return {Boolean}
		 */
		isProcessing: function() {
			return this._isProcessing;
		},
		/**
		 * Check if elements are recycling mode
		 * @ko recycle 모드 여부를 반환한다.
		 * @method eg.InfiniteGrid#isRecycling
		 * @return {Boolean}
		 */
		isRecycling: function() {
			return this.core.options.count > 0 && this._isRecycling;
		},
		/**
		 * Get group keys
		 * @ko 그룹키들을 반환한다.
		 * @method eg.InfiniteGrid#getGroupKeys
		 * @return {Array} groupKeys
		 */
		getGroupKeys: function() {
			var result = [];
			if (this.core._isLayoutInited) {
				var i = 0;
				var item;
				while (item = this.core.items[i++]) {
					result.push(item.groupKey);
				}
			}
			return result;
		},
		/**
		 * Rearrang layout
		 * @ko 레이아웃을 재배치한다.
		 * @method eg.InfiniteGrid#layout
		 */
		layout: function() {
			this._isProcessing = true;
			this._isAppendType = true;
			var i = 0;
			var v;
			while (v = this.core.items[i++]) {
				v.isAppend = true;
			}
			this.core.layout();
		},
		/**
		 * Append elemensts
		 * @ko 엘리먼트를 append 한다.
		 * @method eg.InfiniteGrid#append
		 * @param {Array} elements to be appended elements <ko>append될 엘리먼트 배열</ko>
		 * @param {Number|String} [groupKey] to be appended groupkey of elements<ko>append될 엘리먼트의 그룹키</ko>
		 * @return {Number} length a number of elements
		 */
		append: function(elements, groupKey) {
			if (this._isProcessing ||  elements.length === 0) {
				return;
			}
			this._isProcessing = true;
			if (!this._isRecycling) {
				this._isRecycling =
				(this.core.items.length + elements.length) >= this.core.options.count;
			}
			this._insert(elements, groupKey, true);
			return elements.length;
		},
		/**
		 * Prepend elemensts
		 * @ko 엘리먼트를 prepend 한다.
		 * @method eg.InfiniteGrid#prepend
		 * @param {Array} elements to be prepended elements <ko>prepend될 엘리먼트 배열</ko>
		 * @param {Number|String} [groupKey] to be prepended groupkey of elements<ko>prepend될 엘리먼트의 그룹키</ko>
		 * @return {Number} length a number of elements
		 */
		prepend: function(elements, groupKey) {
			if (!this.isRecycling() || this._removedContent === 0 ||
				this._isProcessing || elements.length === 0) {
				return;
			}
			this._isProcessing = true;
			this._fit();
			if (elements.length - this._removedContent  > 0) {
				elements = elements.slice(elements.length - this._removedContent);
			}
			this._insert(elements, groupKey, false);
			return elements.length;
		},
		/**
		 * Clear elements and data
		 * @ko 엘리먼트와 데이터를 지운다.
		 * @method eg.InfiniteGrid#clear
		 */
		clear: function() {
			this.core.$element.empty();
			this.core.items.length = 0;
			this._reset();
			this.layout();
		},

		/**
		 * Get top element
		 * @ko 가장 위에 있는 엘리먼트를 반환한다.
		 * @method eg.InfiniteGrid#getTopElement
		 *
		 * @return {HTMLElement} element
		 */
		getTopElement: function() {
			var item;
			var min = Infinity;
			$.each(this.core.getColItems(false), function(i, v) {
				if (v && v.position.y < min) {
					min = v.position.y;
					item = v;
				}
			});
			return item ? item.element : null;
		},
		/**
		 * Get bottom element
		 * @ko 가장 아래에 있는 엘리먼트를 반환한다.
		 * @method eg.InfiniteGrid#getBottomElement
		 *
		 * @return {HTMLElement} element
		 */
		getBottomElement: function() {
			var item;
			var max = -Infinity;
			$.each(this.core.getColItems(true), function(i, v) {
				if (v && v.position.y + v.size.outerHeight > max) {
					max = v.position.y + v.size.outerHeight;
					item = v;
				}
			});
			return item ? item.element : null;
		},
		_onlayoutComplete: function(e) {
			var distance = 0;
			var isAppend = this._isAppendType;
			if (isAppend === false) {
				this._isFitted = false;
				this._fit(true);
				distance = e.length > this.core.items.length ?
					0 : this.core.items[e.length].position.y;
			}

			// reset flags
			this._reset(true);

			/**
			 * Occurs when layout is completed (after append / after prepend / after layout)
			 * @ko 레이아웃이 완료 되었을 때 발생하는 이벤트 (append/prepand/layout 메소드 호출 후, 아이템의 배치가 완료되었을때 발생)
			 * @name eg.InfiniteGrid#layoutComplete
			 * @event
			 *
			 * @param {Object} param
			 * @param {Array} param.target target rearranged elements<ko>재배치된 엘리먼트들</ko>
			 * @param {Boolean} param.isAppend isAppend determine if append or prepend (value is true when call layout method)<ko>아이템이 append로 추가되었는지, prepend로 추가되었는지를 반한환다. (layout호출시에는 true)</ko>
			 * @param {Number} param.distance distance<ko>layout 전의 최상단 엘리먼트의 거리</ko>
			 */
			this.trigger("layoutComplete", {
				target: e.concat(),
				isAppend: isAppend,
				distance: distance
			});
		},
		_insert: function(elements, groupKey, isAppend) {
			if (elements.length === 0) {
				return;
			}
			this._isAppendType = isAppend;
			var i = 0;
			var item;
			var items = this.core.itemize(elements, groupKey);
			while (item = items[i++]) {
				item.isAppend = isAppend;
			}
			if (isAppend) {
				this.core.items = this.core.items.concat(items);
			} else {
				this.core.items = items.concat(this.core.items.slice(0));
				items = items.reverse();
			}
			if (this.isRecycling()) {
				this._adjustRange(isAppend, elements);
			}
			var noChild = this.core.$element.children().length === 0;
			this.core.$element[isAppend ? "append" : "prepend"](elements);
			noChild && this.core.resetLayout();		// for init-items

			var needCheck = this._checkImageLoaded(elements);
			var checkCount = needCheck.length;
			checkCount > 0 ? this._waitImageLoaded(items, needCheck) :
					this.core.layoutItems(items, true);
		},
		_adjustRange: function (isTop, elements) {
			var diff = this.core.items.length - this.core.options.count;
			var targets;
			var idx;
			if (diff <= 0 || (idx = this._getDelimiterIndex(isTop, diff)) < 0) {
				return;
			}
			if (isTop) {
				targets = this.core.items.slice(0, idx);
				this.core.items = this.core.items.slice(idx);
				this._isFitted = false;
			} else {
				targets = this.core.items.slice(idx);
				this.core.items = this.core.items.slice(0, idx);
			}

			// @todo improve performance
			var i = 0;
			var item;
			var el;
			var m = elements instanceof $ ? "index" : "indexOf";
			while (item = targets[i++]) {
				el = item.element;
				idx = elements[m](el);
				if (idx !== -1) {
					elements.splice(idx, 1);
				} else {
					el.parentNode.removeChild(el);
				}
			}
			this._removedContent += isTop ? targets.length : -targets.length;

		},
		_getDelimiterIndex: function(isTop, removeCount) {
			var len = this.core.items.length;
			var i;
			var idx = 0;
			var baseIdx = isTop ? removeCount - 1 : len - removeCount;
			var targetIdx = baseIdx + (isTop ? 1 : -1);
			var groupKey = this.core.items[baseIdx].groupKey;
			if (groupKey != null && groupKey === this.core.items[targetIdx].groupKey) {
				if (isTop) {
					for (i = baseIdx; i > 0; i--) {
						if (groupKey !== this.core.items[i].groupKey) {
							break;
						}
					}
					idx =  i === 0 ? -1 : i + 1;
				} else {
					for (i = baseIdx; i < len; i++) {
						if (groupKey !== this.core.items[i].groupKey) {
							break;
						}
					}
					idx = i === len ? -1 : i;
				}
			} else {
				idx = isTop ? targetIdx : baseIdx;
			}
			return idx;
		},

		// fit size
		_fit: function(applyDom) {
			if (this._isFitted) {
				return;
			}

			// for caching
			if (this.core.options.count <= 0) {
				this._fit = $.noop();
				this._isFitted = true;
				return;
			}
			var item;
			var height;
			var i = 0;
			var y = this.core.updateCols();	// for prepend
			while (item = this.core.items[i++]) {
				item.position.y -= y;
				applyDom && item.css({
					"top": item.position.y + "px"
				});
			}
			this.core.updateCols(true);	// for append
			height = this.core._getContainerSize().height;
			applyDom && this.core._setContainerMeasure(height, false);
			this._isFitted = true;
		},
		_reset: function(isLayoutComplete) {
			if (!isLayoutComplete) {
				this._isFitted = true;
				this._isRecycling = false;
				this._removedContent = 0;
			}
			this._isAppendType = null;
			this._isProcessing = false;
		},
		_checkImageLoaded: function(elements) {
			var needCheck = [];
			$(elements).each(function(k, v) {
				if (v.nodeName === "IMG") {
					!v.complete && needCheck.push(v);
				} else if (v.nodeType &&
					(v.nodeType === 1 || v.nodeType === 9 || v.nodeType === 11)) {	// ELEMENT_NODE, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE
					needCheck = needCheck.concat($(v).find("img").filter(function(fk, fv) {
						return !fv.complete;
					}).toArray());
				}
			});
			return needCheck;
		},
		_waitImageLoaded: function(items, needCheck) {
			var core = this.core;
			var checkCount = needCheck.length;
			var onCheck;

			if (hasEventListener) {
				onCheck = function() {
					checkCount--;
					if (checkCount <= 0) {
						unbindImage(core.element, onCheck);
						core.layoutItems(items, true);
					}
				};
				bindImage(this.core.element, onCheck);
			} else {
				onCheck = function(e) {
					checkCount--;
					unbindImage(e.srcElement, onCheck);
					if (checkCount <= 0) {
						core.layoutItems(items, true);
					}
				};
				$.each(needCheck, function(k, v) {
					bindImage(v, onCheck);
				});
			}
		},
		/**
		 * Release resources and off custom events
		 * @ko 모든 커스텀 이벤트와 자원을 해제한다.
		 * @method eg.InfiniteGrid#destroy
		 */
		destroy: function() {
			if (this.core) {
				this.core.destroy();
				this.core = null;
			}
			this.$global.off("resize", this._onResize);
			this.off();
		}
	});
});
eg.module("infiniteGridService",
	[window.jQuery, eg, window, document], function($, ns, global, doc) {
	/**
	 * Infinite cascading grid layout service for infiniteGrid
	 * @ko infiniteGrid를 통한 무한 그리드 레이아웃 서비스.
	 *
	 * @param {String} DOM Element to be InfiniteGride. <ko>타겟 엘리먼트</ko>
	 * @param {Object} [Options] A set of key/value pairs that configure the InfiniteGridService. <ko>key/value 형태의 옵션</ko>
	 * @param {Number} [options.count=60] Count DOM count for recycle. If value is -1, DOM does increase without limit -1. <ko>재사용할 DOM 갯수. -1일 경우 DOM은 계속 늘어남.</ko>
	 * @param {Number} [threshold=120] Threshold Scroll coordinate threshold. <ko>append, prepend 이벤트가 발생하기 위한 스크롤 좌표 임계치.</ko>
	 * @param {Boolean} [usePersist=true] usePersist Determines whether allows persist. <ko>persist 사용 여부.</ko>
	 */
	ns.InfiniteGridService = ns.Class.extend(ns.Component, {
		/**
		 * Constructor
		 * @param {String} Element selector
		 * @param {Object} options
		 */
		construct: function(element, options) {
			this._$global = $(global);
			this._$wrapper = $(element);

			this._prevScrollTop = 0;
			this._inserting = false;

			this._topElement;
			this._bottomElemment;
			this._prependTopElementInfo;

			this._PERSIST_KEY = "__INFINITEGRIDSERVICE_PERSISTKEY__";
			this._EVENT_NAMESPACE = ".infiniteGridService" + Math.floor((Math.random() * 100000) + 1);

			this._options = $.extend({
				count: 120,
				threshold: 100,
				usePersist: true
			}, options);

			if (this._isEnablePersist()) {
				this._$wrapper.addClass("NO_TAP_HIGHLIGHT");
			}

			this._getScrollTop();
			this._infiniteGrid = new eg.InfiniteGrid(element, this._options);

			this._infiniteGrid.on("layoutComplete", $.proxy(function(e) {
				this._setBoundaryElements();

				if (!e.isAppend) {
					this._adjustPrependScroll(e);
				}

				this._inserting = false;
			}, this));

			this.activate();
		},
		_getScrollTop: function() {
			var fn;

			if (typeof global.scrollY === "number") {
				fn = function() {
					return global.scrollY;
				};
			} else if (typeof global.pageYOffset === "number") {
				fn = function() {
					return global.pageYOffset;
				};
			} else if (typeof doc.documentElement.scrollTop === "number") {
				fn = function() {
					return doc.documentElement.scrollTop;
				};
			} else if (typeof doc.body.scrollTop === "number") {
				fn = function() {
					return doc.body.scrollTop;
				};
			}

			this._getScrollTop = fn;
			return fn();
		},
		_setBoundaryElements: function() {
			var element;

			if (element = this._infiniteGrid.getTopElement()) {
				this._topElement = element;
			}

			if (element = this._infiniteGrid.getBottomElement()) {
				this._bottomElemment = element;
			}
		},
		_isEnablePersist: function() {
			var agent = eg.agent();
			var enablePersist = true;

			if (!this._options.usePersist ||
					agent.os.name === "ios" ||
					(agent.os.name === "android" && parseFloat(agent.os.version) < 4.4)) {
				enablePersist = false;
			}

			this._isEnablePersist = function () {
				return enablePersist;
			};

			return enablePersist;
		},
		_handleScrollEnd: function() {
			if (this._inserting) {
				return;
			}

			if (this._prevScrollTop < this._getScrollTop()) {
				if (this._bottomElemment) {
					var bottomElementBoundingClientRect =
						this._bottomElemment.getBoundingClientRect();

					if (bottomElementBoundingClientRect.top <=
							this._$global.height() + this._options.threshold) {
						this.trigger("append");
					}
				}
			} else {
				if (this._infiniteGrid.isRecycling() && this._topElement) {
					var topElementBoundingClientRect =
						this._topElement.getBoundingClientRect();

					if (topElementBoundingClientRect.bottom >=
							(0 - this._options.threshold)) {
						this.trigger("prepend");
					}
				}
			}

			this._prevScrollTop = this._getScrollTop();
		},
		_insertElements: function(mode, elements) {
			this._inserting = true;

			var length = 0;
			var $elements;

			if (typeof elements === "string") {
				$elements = $(elements);
			} else {
				$elements = elements;
			}

			if (mode === "append") {
				length = this._infiniteGrid.append($elements);
			} else if (mode === "prepend") {
				this._setPrependTopElementInfo();
				length = this._infiniteGrid.prepend($elements);
			}

			this._inserting = false;

			return length;
		},
		_insertAjax: function(mode, url, options, callback) {
			this._inserting = true;

			if (typeof url === "object") {
				options = url;
				url = undefined;
			}

			if ($.isFunction(options)) {
				callback = options;
				options = undefined;
			}

			return $.ajax(url, options)
				.always($.proxy(function(data, textStatus) {
					var $elements;

					if (textStatus === "success") {
						if (callback) {
							$elements = callback(data);
						} else {
							$elements = $(data);
						}
					}

					this._insertElements(mode, $elements);
				}, this));
		},
		_setPrependTopElementInfo: function() {
			if (this._topElement) {
				this._prependTopElementInfo = {
					element: this._topElement,
					boundingClientRect: this._topElement.getBoundingClientRect()
				};
			}
		},
		_adjustPrependScroll: function() {
			if (this._prependTopElementInfo.element) {
				var $element = $(this._prependTopElementInfo.element);
				var scrollTop =
						this._$wrapper.offset().top + $element.offset().top +
						$element.outerHeight() +
						(0 - this._prependTopElementInfo.boundingClientRect.bottom);

				global.scrollTo(0, scrollTop);
			}
		},
		/**
		 * Activate
		 * @ko 활성화
		 * @method eg.InfiniteGridService#activate
		 * @return {Object} infiniteGridService Instance itself.
		 */
		activate: function() {
			$(global).on("scrollend" + this._EVENT_NAMESPACE, $.proxy(this._handleScrollEnd, this));
			return this;
		},
		/**
		 * Deactivate
		 * @ko 비활성화
		 * @method eg.InfiniteGridService#deactivate
		 * @return {Object} infiniteGridService Instance itself.
		 */
		deactivate: function() {
			$(global).off("scrollend" + this._EVENT_NAMESPACE);
			return this;
		},
		/**
		 * Append elements
		 * @ko 하단에 요소 추가
		 * @method eg.InfiniteGridService#append
		 * @param {String|jQuery} DOM Element to append in a target. <ko>타겟요소에 추가할 DOM 엘리먼트</ko>
		 * @return {Number} Length The number of elements to prepended. <ko>추가한 요소의 갯수</ko>
		 * @example
		 *    infiniteGrid.append("<li> contents </li>");
		 *    infiniteGrid.append($("<li> contents </li>"));
		 */
		append: function(elements) {
			return this._insertElements("append", elements);
		},
		/**
		 * Prepend elements
		 * @ko 상단에 요소 추가
		 * @method eg.InfiniteGridService#preppend
		 * @param {String|jQuery} DOM Element to append in a target. <ko>타겟요소에 추가할 DOM 엘리먼트</ko>
		 * @return {Number} Length The number of elements to prepended. <ko>추가한 요소의 갯수</ko>
		 * @example
		 * infiniteGrid.prepend("<li> contents </li>");
		 * infiniteGrid.prepend($("<li> contents </li>"));
		 */
		prepend: function(elements) {
			return this._insertElements("prepend", elements);
		},
		/**
		 * Append Ajax response elements
		 * @ko 하단에 Ajax 호출 결과 추가
		 * @method eg.InfiniteGridService#ajaxAppend
		 * @param {String} URL A string containing the URL to which the request is sent. <ko> 요청할 URL </ko>
		 * @param {Object} [Settings] A set of key/value pairs that configure the Ajax request. <ko> Ajax 요청 설정 객체 </ko>
		 * @param {Function} [Callback] A function to be called when the before append. The function receives one argument: data will append. <ko>요청 완료 후 실행 할 콜백. 응답 데이터를 파라메터로 받는다.</ko>
		 * @return {Object} jqXHR.
		 * @example
		 *    infiniteGrid.ajaxAppend("http://server.com/contents", function(data) {
		 *        return $(data);
		 *    } );
		 */
		appendAjax: function(url, settings, callback) {
			return this._insertAjax("append", url, settings, callback);
		},
		/**
		 * Prepend Ajax response elements
		 * @ko 상단에 요소 추가
		 * @method eg.InfiniteGridService#preppend
		 * @param {String} URL A string containing the URL to which the request is sent. <ko> 요청할 URL </ko>
		 * @param {Object} [Settings] A set of key/value pairs that configure the Ajax request. <ko> Ajax 요청 설정 객체 </ko>
		 * @param {Function} [Callback] A function to be called when the before append. The function receives one argument: data to prepended. <ko>요청 완료 후 실행 할 콜백. 응답 데이터를 파라메터로 받는다.</ko>
		 * @return {Object} jqXHR.
		 * @example
			infiniteGrid.ajaxPrepend("http://server.com/contents", function(data) {
				return $(data);
			} );
		 */
		prependAjax: function(url, settings, callback) {
			return this._insertAjax("prepend", url, settings, callback);
		},
		/**
		 * Stores state
		 * @ko 상태 저장
		 * @method eg.InfiniteGridService#storeContents
		 * @param {String} [key] The type of keys maintained <ko>저장/복원을 위해 관리하는 키</ko>
		 * @example
			infiniteGridService.store();
			infiniteGridService.store("customKey");
		*/
		store: function(key) {
			if (this._isEnablePersist()) {
				var data;

				key = key || this._PERSIST_KEY;

				data = {
					"infiniteGridStatus": this._infiniteGrid.getStatus(),
					"scrollTop": this._getScrollTop()
				};

				this.trigger("store", data);
				$.persist(key, data);
			}
		},
		/**
		 * Restores state
		 * @ko 상태 복원
		 * @method eg.InfiniteGridService#restore
		 * @param {String} [key] The type of keys maintained <ko>저장/복원을 위해 관리하는 키</ko>
		 * @example
			infiniteGridService.restore();
			infiniteGridService.restore("customKey");
		*/
		restore: function(key) {
			var data;
			var isRestored = false;

			if (this._isEnablePersist()) {

				key = key || this._PERSIST_KEY;

				data = $.persist(key);

				if (data) {
					this._infiniteGrid.setStatus(data.infiniteGridStatus);
					global.scrollTo(0, data.scrollTop);
					this._setBoundaryElements();
					isRestored = true;
				}

				this.trigger("restore", data);
			}

			return isRestored;
		},
		/**
		 * Clear elements
		 * @ko 요소를 지움
		 * @method eg.infiniteGrid#clear
		 */
		clear: function() {
			this._infiniteGrid.clear();
		},
		/**
		 * Release resources and off custom events
		 * @ko 모든 커스텀 이벤트와 자원 해제
		 * @method eg.infiniteGrid#destroy
		 */
		destroy: function() {
			if (this._infiniteGrid) {
				this._infiniteGrid.destroy();
				this._infiniteGrid = null;
			}

			this.deactivate();
			this.off();
		}
	});
});
eg.module("visible", [window.jQuery, eg], function($, ns) {
	/**
	 * It check element is visible within the specific element or viewport, regardless of the scroll position
	 * @ko scroll 위치와 상관없이 특정 엘리먼트나 viewport 안에 엘리먼트가 보이는지 확인한다.
	 * @class
	 * @name eg.Visible
	 * @extends eg.Component
	 * @group egjs
	 *
	 * @param {Object} options
	 * @param {HTMLElement|String|jQuery} [options.wrapper=document] The parent element that to check targets (wrapper is only one.) <ko>확인할 영역의 상위 엘리먼트</ko>
	 * @param {String} [options.targetClass="check_visible"] A class name of targets <ko>확인할 엘리먼트가 가진 클래스명</ko>
	 * @param {Number} [options.expandSize=0] expand size of the wrapper.
	 * e.g. If a wrapper size is 100 x 100 and 'expandSize' option is 20, visible range is 120 x 120
	 * <ko> 상위 엘리먼트 기준으로 추가적인 영역을 확인하도록 지정</ko>
	 * @support {"ie": "7+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	 *
	 * @codepen {"id":"WbWzqq", "ko":"Visible 기본 예제", "en":"Visible basic example", "collectionId":"Ayrabj", "height" : 403}
	 */
	ns.Visible = ns.Class.extend(ns.Component, {
		construct: function(options) {
			this.options = {
				wrapper: document,
				targetClass: "check_visible",
				expandSize: 0
			};
			$.extend(this.options, options);

			this._$wrapper = $(this.options.wrapper);
			this._$wrapper = this._$wrapper.length > 0 ? this._$wrapper[0] : document;

			// this._$wrapper is Element, or may be Window
			if (this._$wrapper.nodeType && this._$wrapper.nodeType === 1) {
				this._getAreaRect = this._getWrapperRect;
			} else {
				this._getAreaRect = this._getWindowRect;
			}

			this._targets = [];
			this._timer = null;
			this._supportElementsByClassName = (function() {
				var dummy = document.createElement("div");
				var dummies;
				if (!dummy.getElementsByClassName) {
					return false;
				}
				dummies = dummy.getElementsByClassName("dummy");
				dummy.innerHTML = "<span class='dummy'></span>";
				return dummies.length === 1;
			})();

			this.refresh();
		},
		/**
		 * Update targets
		 * @ko target들을 갱신한다.
		 * @method eg.Visible#refresh
		 * @return {Instance}
		 *
		 * @remark
		 * If targets was added or removed, you must call 'refresh' method.
		 * <ko> 확인 대상이 영역 안에 추가 된 경우, 또는 확인 대상이 영역 안에서 삭제 된 경우, 영역 내의 확인 대상을 이 메소드를 호출하여 갱신해야한다. <ko>
		 */
		refresh: function() {
			if (this._supportElementsByClassName) {
				this._targets = this._$wrapper
					.getElementsByClassName(this.options.targetClass);
				this.refresh = function() {
					return this;
				};
			} else {
				this.refresh = function() {
					this._targets = $(this._$wrapper)
						.find("." + this.options.targetClass)
						.each(function() {
						return this;
					});
					return this;
				};
			}
			return this.refresh();
		},
		/**
		 * Checks if the target elements has been changed.
		 * @ko target들이 변경했는지 확인한다.
		 * @method eg.Visible#check
		 * @param {Number} [delay=-1] Delay time in milliseconds <ko>호출 후, 일정 시간이 지난 후에 확인하고자 할때 사용한다.</ko>
		 * @return {Instance}
		 */
		check: function(delay) {
			if (typeof delay === "undefined") {
				delay = -1;
			}
			clearTimeout(this._timer);
			if (delay < 0) {
				this._check();
			} else {
				this._timer = setTimeout($.proxy(function() {
					this._check();
					this._timer = null;
				}, this), delay);
			}
			return this;
		},
		_getWrapperRect: function() {
			return this._$wrapper.getBoundingClientRect();
		},
		_getWindowRect: function() {
			// [IE7] document.documentElement.clientHeight has always value 0 (bug)
			return {
				top: 0,
				left: 0,
				bottom: document.documentElement.clientHeight ||
							document.body.clientHeight,
				right: document.documentElement.clientWidth ||
							document.body.clientWidth
			};
		},
		_reviseElements: function(target, i) {
			if (this._supportElementsByClassName) {
				this._reviseElements = function() {
					return true;
				};
			} else {
				this._reviseElements = function(target, i) {
					if (!$(target).hasClass(this.options.targetClass)) {
						target.__VISIBLE__ = null;
						this._targets.splice(i, 1);
						return false;
					}
					return true;
				};
			}
			return this._reviseElements(target, i);
		},
		_check: function() {
			var expandSize = parseInt(this.options.expandSize, 10);
			var visibles = [];
			var invisibles = [];
			var area = this._getAreaRect();

			// Error Fix: Cannot set property top of #<ClientRect> which has only a getter
			area = $.extend({}, area);

			area.top -= expandSize;
			area.left -= expandSize;
			area.bottom += expandSize;
			area.right += expandSize;

			for (var i = this._targets.length - 1, target, targetArea, after, before;
					target = this._targets[i] ; i--) {
				targetArea = target.getBoundingClientRect();
				if (this._reviseElements(target, i)) {
					before = !!target.__VISIBLE__;
					target.__VISIBLE__ = after = !(
						targetArea.bottom < area.top ||
						area.bottom < targetArea.top ||
						targetArea.right < area.left ||
						area.right < targetArea.left
					);
					(before !== after) && (after ? visibles : invisibles).unshift(target);
				}
			}
			/**
			 * When target elements appear or disappear based on the base area.
			 * @ko 기준 영역을 기준으로 보이는 엘리먼트와 사라진 엘리먼트가 변경된 경우 발생하는 이벤트
			 * @name eg.Visible#change
			 * @event
			 * @param {Array} visible The visible elements (the element type is `HTMLElement`) <ko>보여지게 된 엘리먼트들 </ko>
			 * @param {Array} invisible The invisible elements (the element type is `HTMLElement`) <ko>안 보여지게 된 엘리먼트들 </ko>
			 */
			this.trigger("change", {
				visible: visibles,
				invisible: invisibles
			});
		},
		destroy: function() {
			this.off();
			this._targets = [];
			this._$wrapper = this._timer = null;
		}
	});
});