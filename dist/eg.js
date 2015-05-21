/*! egjs - v0.0.1
* Copyright (c) 2015 ; Licensed LGPL v2 */
"use strict";
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
    /**
     * @namespace Array
     * @group Polyfill
     */
    /**
     * Array forEach polyfill
     * @ko Array forEach 폴리필
     * @name Array#forEach
     * @method
     * @param {Function} callback
     * @param {This} thisArg
     * @see  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
     *
     */

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
    /**
     * Array isArray polyfill
     * @ko Array.isArray 폴리필
     * @name Array.isArray
     * @method
     * @param {Variable} arg
     * @return {Boolean} result
     * @see  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
     *
     */
if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === "[object Array]";
  };
}
	/**
     * @namespace Function
     * @group Polyfill
     */
if (!Function.prototype.bind) {
    /**
     * Function bind polyfill
     * @ko Function bind 폴리필
     * @name Function#bind
     * @method
     * @param {Variable} arg
     * @return {Function} bound function
     * @see  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
     *
     */
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
if(!Object.keys) {
	/**
     * @namespace Object
     * @group Polyfill
     */
    /**
     * Object keys polyfill
     * @ko Object keys 폴리필
     * @name Object.keys
     * @method
     * @return {Array} keys
     * @see  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
     *
     */
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
    /**
     * @namespace window
     * @group Polyfill
     */
    /**
     * requestAnimationFrame polyfill
     * @ko requestAnimationFrame 폴리필
     * @name window.requestAnimationFrame
     * @method
     * @return {Number} key
     * @see  https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
     *
     */

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

(function(global){
	global.eg = {};
	/**
	 * Regist module.
	 * @private
	 */
	global.eg.module = function(name,di,fp){
	    fp.apply(global,di);
	};
})(window);

eg.module("animate",[jQuery, window],function($, global){
    /**
     * Extends jQuery animate in order to use 'transform' property.
     * @ko jQuery animate 사용시 transform을 사용할 수 있도록 확장한 animate 메소드
     * @name jQuery#animate
     * @method
     * @param {Object} properties An object of CSS properties and values that the animation will move toward.
     * @param {Number|String} [duration=4000] A string or number determining how long the animation will run.
     * @param {String} [easing="swing"] A string indicating which easing function to use for the transition.
     * @param {Function} [complete] A function to call once the animation is complete.
     *<br>
     * <table>
 <thead>
  <tr>
   <th>property</th>
   <th>support unit</th>
   <th>relative function</th>
   <th>remark</th>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td>translate(x,y)</td>
   <td>px, %, none</td>
   <td>+=,-=</td>
   <td></td>
  </tr>
  <tr>
   <td>translateX(x)</td>
   <td>px, %, none</td>
   <td>+=,-=</td>
   <td></td>
  </tr>
  <tr>
   <td>translateY(y)</td>
   <td>px, %, none</td>
   <td>+=,-=</td>
   <td></td>
  </tr>
  <tr>
   <td>translateZ(z)</td>
   <td>px, none</td>
   <td>+=,-=</td>
   <td></td>
  </tr>
  <tr>
   <td>translate3d(x,y,z)</td>
   <td>px, %, none</td>
   <td>+=,-=</td>
   <td>z값에 대해서는 %단위 미지원</td>
  </tr>
  <tr>
   <td>scaleX(x)</td>
   <td>none</td>
   <td>+=,-=</td>
   <td></td>
  </tr>
  <tr>
   <td>scaleY(y)</td>
   <td>none</td>
   <td>+=,-=</td>
   <td></td>
  </tr>
  <tr>
   <td>scaleZ(z)</td>
   <td>none</td>
   <td>+=,-=</td>
   <td></td>
  </tr>
  <tr>
   <td>scale(x,y)</td>
   <td>none</td>
   <td>+=,-=</td>
   <td></td>
  </tr>
  <tr>
   <td>scale3d(x,y,z)</td>
   <td>none</td>
   <td>+=,-=</td>
   <td></td>
  </tr>
  <tr>
   <td>rotate(angle)</td>
   <td>deg, none</td>
   <td>+=,-=</td>
   <td></td>
  </tr>
  <tr>
   <td>matrix(a,b,c,d,x,y)</td>
   <td>none</td>
   <td></td>
   <td></td>
  </tr>
  <tr>
   <td>matrix3d(a1,b1,c1,d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4)</td>
   <td>none</td>
   <td></td>
   <td></td>
  </tr>
 </tbody>
</table>
     * @example
     * $("#box").animate({"transform" : "translate3d(150px,100px,0px) rotate(20deg) scaleX(1)"} , 3000)
     * .animate({"transform" : "translate3d(150px,+=10%,-=20px) rotate(+=20deg) scale3d(+=2, 4.2, -=-1)"} , 3000);
     * @see {@link http://api.jquery.com/animate/}
     */

	var CSSMatrix = global.WebKitCSSMatrix || global.MSCSSMatrix || global.OCSSMatrix || global.MozCSSMatrix || global.CSSMatrix,
		RADIAN = 180 / Math.PI;

	// @return String
	function parse(transform, width, height, styleTransform) {
		if(/matrix|none/.test(transform)) {
			return transform;
		}
		var properties = [],
			m = transform.match(/\w+\([^)]+\)/g),
			result;
		for(var i=0, v; v=m[i]; i++) {
			properties.push(interpolation(parseStyle(v), width, height, styleTransform));
		}
		result = divideTransform(properties);
		for(var p in styleTransform) {
			if( styleTransform.hasOwnProperty(p) && typeof result[p] === "undefined") {
				result[p] = styleTransform[p];
			}
		}
		result = data2String(result);
		return result;
	}

	function interpolation(parsedProperty, width, height, styleTransform) {
		width = width || 0;
		height = height || 0;
		var name =parsedProperty[0],
			m,
			options = [],
			opt = {};

		if( (m = name.match(/(rotate|translate|scale)([XYZ]|3d)?/)) && m.length > 1) {
			switch(m[1]) {
				case "translate" :
				case "scale" :
					if(/[XYZ]/.test(m[2])) {
						if(m[1].indexOf("translate") !== -1) {
							switch(m[2]) {
								case "X" : opt.size=width; break;
								case "Y" : opt.size=height; break;
								case "Z" : opt.size=0; break;
							}
						}
						styleTransform  && (opt.baseVal = styleTransform[name] || 0);
						options.push(opt);
					} else {
						(m[1].indexOf("scale") !== -1) && (width = height = 0);
						options = [ { size : width}, {size: height}, {size: 0} ];
						if(styleTransform) {
							options[0].baseVal = styleTransform[m[1] + "X"] || 0;
							options[1].baseVal = styleTransform[m[1] + "Y"] || 0;
							options[2].baseVal = styleTransform[m[1] + "Z"] || 0;
						}
					}
					break;
				case "rotate" :
					!m[2] && styleTransform  && (opt.baseVal = styleTransform[name] || 0);
					options.push(opt);
					break;
			}
			parsedProperty[1]=parsedProperty[1].map(function(v,i) {
				return computeValue(v, options[i]);
			});
		}
		return parsedProperty;
	}

	// @return function
	function rateFn(element, startTf, endTf) {
		var $el = $(element),
			needToConvert = startTf.indexOf("%") !== -1 || endTf.indexOf("%") !== -1,
			width = needToConvert ? $el.width() : 0,
			height = needToConvert ? $el.height() : 0,
			styleTransform = unMatrix(toMatrix($el.css("transform"))),
			start = toMatrix(startTf),
			end = toMatrix(parse(endTf, width, height, styleTransform));

		if (/3d|Z/.test(startTf + endTf) || start[0] !== end[0]) {
			start = toMatrix3d(start);
			end = toMatrix3d(end);
		}
		return function(pos) {
			if(pos === 1) {
				return data2String(end);
			} else {
				var result = [];
				for(var i=0, s,e, l = start[1].length; i< l; i++) {
					s = parseFloat(start[1][i]);
					e = parseFloat(end[1][i]);
					result.push(s + ( e- s) * pos);
				}
				return data2String([ start[0], result ]);
			}
		};
	}

	function data2String(property) {
		var name,tmp = [];
		if(Array.isArray(property)) {
			name = property[0];
			return name + "(" + property[1].join(unit(name) + ",") + unit(name) + ")";
		} else {
			for(name in property) {
				property.hasOwnProperty(name) && tmp.push(name);
			}
			// order by translate, scale, roate
			tmp = tmp.sort(function(a,b) {
				if(a>b) {
					return -1;
				} else if(a<b) {
					return 1;
				} else {
					return 0;
				}
			});
			return tmp.map(function(v) {
				return v + "(" +  property[v] + unit(v) + ")";
			}).join(" ");
		}
	}

	function unit(name) {
		return name.indexOf("translate") !== -1 ? "px" : (name.indexOf("rotate") !== -1 ? "deg" : "");
	}

	// Object {translateZ: 0, translateX: 20, translateY: 15, rotate: 0, perspective: 10}
	function divideTransform(parsedProperties) {
		var result = {};
		for(var i=0, p, name, val; p = parsedProperties[i]; i++) {
			val = p[1];
			/* jshint -W086 : false */
			//  W086: Expected a 'break' statement before '{a}'.
			switch(name = p[0]) {
				case "translate3d":
				case "scale3d" :
					name = name.replace(/3d$/, "");
					result[name + "Z"] = val[2];
				case "translate":
				case "scale":
					result[name + "X"] = val[0];
					if (typeof val[1] !== "undefined") {
						result[name + "Y"] = val[1];
					} else if (name === "scale") {
						result[name + "Y"] = val[0];
					}
					break;
				case "rotate":
					result[name] = val[0];
					break;
				default:
					result[name] = +val.join("");
					break;
			}
		}
		return result;
	}

	//  [ "translate3d" , [ "10", "20", "3px"] ]
	function parseStyle(property) {
		var m = property.match(/(\b\w+?)\((\s*[^\)]+)/),
			name, value, result = ["",""];
		if(m && m.length > 2) {
			name = m[1];
			value = m[2].split(",");
			value = value.map(function(v){
			    return v.trim();
			});
			result = [ name.trim(), value ];
		}
		return result;
	}

	// compute %, relative value
	function computeValue(text, option) {
		var useInitVal = 0,
			val = text.replace(/px|deg/, ""),
			opt = {
				baseVal : 0,
				size : 0
			};
		$.extend(opt, option);
		useInitVal = /\+=/.test(val) ? 1 : ( /\-=/.test(val) ? -1 : useInitVal);
		(useInitVal !== 0) && (val = val.substring(2));
		val = /%$/.test(val) ? parseFloat(val) / 100 * opt.size : parseFloat(val);
		opt.baseVal = parseFloat(opt.baseVal);
		val = useInitVal > 0 ? opt.baseVal + val : ( useInitVal < 0 ? opt.baseVal - val : val);
		return val;
	}

	function toMatrix3d(matrix) {
		var name = matrix[0],
			val = matrix[1];
		if("matrix3d" === name) { return matrix; }
		// matrix(a, b, c, d, tx, ty) is a shorthand for matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1)
		return [
			name+"3d", [ val[0], val[1], "0", "0", val[2], val[3], "0","0","0","0","1","0",val[4],val[5],"0","1" ]
		];
	}

	function toMatrix(transform) {
		if(transform === "none") {
			return ["matrix" , [ "1", "0","0","1","0","0"] ];
		} else if(transform.indexOf("matrix") !== -1) {
			return parseStyle(transform);
		}
		return CSSMatrix ? parseStyle(new CSSMatrix(transform).toString()) : transform;
	}

	// need to current infomation
	function unMatrix(matrix) {
		if(matrix === "none") {
			return null;
		}
		var m = matrix[1],
			m0 = parseFloat(m[0]),
			m1 = parseFloat(m[1]),
			m2 = parseFloat(m[2]),
			m3 = parseFloat(m[3]),
			// rx, ry, rz,
			sx, sy, sz;
		if(matrix[0].indexOf("matrix3d") !== -1 ) {
			sx = Math.sqrt(m0*m0 + m1*m1 + m2*m2);
			sy = Math.sqrt(m[4]*m[4] + m[5]*m[5] + m[6]*m[6]);
			sz = Math.sqrt(m[8]*m[8] + m[9]*m[9] + m[10]*m[10]);
			// rx = Math.atan2(-m[9]/sz, m[10]/sz) / RADIAN;
			// ry = Math.asin(m[8]/sz) / RADIAN;
			// rz = Math.atan2(-m[4]/sy, m[0]/sx) / RADIAN;
			// if (m[4] === 1 || m[4] === -1) {
			// 	rx = 0;
			// 	ry = m[4] * -Math.PI/2;
			// 	rz = m[4] * Math.atan2(m[6]/sy, m[5]/sy) / RADIAN;
			// }
			return {
				translateX: parseFloat( m[12] ),
				translateY: parseFloat( m[13] ),
				translateZ: parseFloat( m[14] ),
				// rotateX : rx,
				// rotateY : ry,
				// rotateZ : rz,
				rotate : parseFloat((Math.atan2(m1, m0) * RADIAN).toFixed(10)),
				scaleX : parseFloat(sx.toFixed(10)),
				scaleY : parseFloat(sy.toFixed(10)),
				scaleZ : parseFloat(sz.toFixed(10))
			};
		} else {
			sx = Math.sqrt( m0 * m0 + m1 * m1 );
			m0 /= sx;
			m1 /= sx;
			sz = m0 * m2 + m1 * m3;
			m2 -= m0 * sz;
			m3 -= m1 * sz;
			// step (5)
			sy = Math.sqrt( m2 * m2 + m3 * m3 );
			m2 /= sy;
			m3 /= sy;
			sz /= sy;
			// step (6)
			if ( m0 * m3 < m1 * m2 ) {
				m0 = -m0;
				m1 = -m1;
				sx = -sx;
			}
			return {
				rotate : parseFloat((Math.atan2(m1, m0) * RADIAN).toFixed(10)),
				scaleX : parseFloat(sx.toFixed(10)),
				scaleY : parseFloat(sy.toFixed(10)),
				translateX : parseFloat(m[4]),
				translateY : parseFloat(m[5])
			};
		}
	}

	$.fx.step.transform = function(fx) {
		var elem = fx.elem;
		fx.$el = fx.$el || $(elem);
		fx._rateFn = fx._rateFn || rateFn(elem, fx.start, fx.end);
		fx.$el.css("transform", fx._rateFn(fx.pos));
	};

	return {
		parse : parse,
		parseStyle : parseStyle,
		computeValue : computeValue,
		rateFn : rateFn,
		toMatrix : toMatrix,
		unMatrix : unMatrix,
		toMatrix3d : toMatrix3d
	};
	// @testcode parse,parseStyle,computeValue,rateFn,toMatrix,unMatrix,toMatrix3d
});

// https://gist.github.com/fwextensions/2052247

eg.module("cssPrefix",[jQuery, document],function($, doc){
    /**
     * Apply css prefix cssHooks
     * @ko css prefix cssHooks 적용
     *
     * @namespace cssPrefix
     * @group hook
     *
     * @example
     * $("#ID").css("transform", "translate('10px', '10px');
     * $("#ID").css("Transform", "translate('10px', '10px');
     * $("#ID").css("webkitTransform", "translate('10px', '10px');
     * $("#ID").css("transform");
     * $("#ID").css("webkitTransform");
     */

    if ( !$.cssHooks ) {
      throw( new Error( "jQuery 1.4.3+ is needed for this plugin to work" ) );
    }

    // run in jQuery 1.8.x below
    if ( $.fn && $.fn.jquery && $.fn.jquery.replace(/[.]/, "") >= "18" ) {
        return;
    }

    var cssPrefixes = [ "Webkit", "Moz" , "O" , "ms" ],
        acts = ["transitionProperty" , "transitionDuration" , "transition", "transform", "transitionTimingFunction"];

    var vendorPrefix = (function() {
        var bodyStyle = doc.body.style;
        for ( var i = 0, len = cssPrefixes.length ; i < len ; i++ ) {
            if( cssPrefixes[i]+"Transition" in bodyStyle ){
                return cssPrefixes[i];
            }
        }
    })();

    var setCssHooks = function( prop ) {
        var upperProp = prop.charAt(0).toUpperCase() + prop.slice(1),
            vendorProp = vendorPrefix + upperProp;

        $.cssHooks[upperProp] = $.cssHooks[vendorPrefix.toLowerCase() + upperProp] = $.cssHooks[prop] = {
            get: function( elem ){
                return $.css( elem, vendorProp );
            },
            set: function( elem, value ){
                elem.style[vendorProp] = value;
            }
        };
    };

    for( var n = 0, actsLen = acts.length ; n < actsLen ; n++ ){
        setCssHooks(acts[n]);
    }

    return {
       vendorPrefix : vendorPrefix,
       setCssHooks: setCssHooks
    };

});
eg.module("eg",[jQuery, eg, window],function($, ns, global){
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



	var eg = {
		/**
		 * @name eg.VERSION
		 * @description version infomation
		 * @ko 버전 정보
	     */
		VERSION : "0.0.1",
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
					[],
                webviewMatch = /(NAVER|Daum)/.exec(ua) || [];

			// os
			if(osMatch.length >= 3) {
				if(/iPhone|iPad/.test(ua)) {
					osMatch[1] = "ios";
				} else if(ua.indexOf("Win") !== -1) {
					osMatch[1] = "window";
					osMatch[2] = osMatch[2] === "2000" ? "5.0" : osMatch[2]; // for window 2000
				} else if(ua.indexOf("Mac") !== -1) {
					osMatch[1] = "mac";
				} else {
					osMatch[1] = osMatch[1].toLowerCase();
				}
				osMatch[2] = (osMatch[2] || "").replace(/\_/g,".").replace(/\s/g, "");
			}

			// browser
			if(browserMatch.length >= 3) {
				if(/Chrome|CriOS/.test(ua)) {
					browserMatch[1] = ua.indexOf("SAMSUNG") !== -1 ? "sbrowser" : "chrome";
				} else if(/MSIE|Trident/.test(ua)) {
					browserMatch[1] = "ie";
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
					version : browserMatch[2] || /*osMatch[2] ||*/ "-1",
					webview : webviewMatch.length > 0
				}
			};
			info = this.hook.agent  ? this.hook.agent(info) : info;
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
			result = this.hook.isHWAccelerable ? this.hook.isHWAccelerable(result,agent) : result;
			this.isHWAccelerable = function(){
				return result;
			};
			return result;
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
			result = this.hook.isTransitional ? this.hook.isTransitional(result,agent) : result;
			this.isTransitional = function(){
				return result;
			};
			return result;
		},

		// 1. user press one position on screen.
		// 2. user moves to the other position on screen.
		// 3. when user releases fingers on screen, 'click' event is fired at previous position.
		_hasClickBug : function() {
			var agent = this.agent(),
				result = "ios" === agent.os.name;
			result = this.hook._hasClickBug ? this.hook._hasClickBug(result, agent) : result;
			this._hasClickBug = function(){
				return result;
			};
			return result;
		}
	};

	// Regist method to eg.

	for(var i in eg){
		if (eg.hasOwnProperty(i)) {
			ns[i] = eg[i];
		}
	}

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

});

// debug
eg.module("persist",[jQuery, window, document],function($, global, doc){
// debug
	/**
	* Support persist event in jQuery
	* @ko jQuery custom persist 이벤트 지원
	* @name jQuery#persist
	* @event
	* @param {Object} e.state state info to be restored
	* @example
	$(window).on("persist",function(e){
		// restore state
		if(e.state.flickingPage)
			oSlideFlicking.moveTo(e.state.flickingPage);
		
		if(e.state.scrollTop)
			document.scrollTo(e.state.scrollTop);
	});
	*/
	var history = global.history;
	var location = global.location;
	var hasReplaceState = "replaceState" in history;

	function onPageshow(e) {
		if (isPersisted(e.originalEvent)) {
			reset();
		} else {
			if (isBackForwardNavigated() && history.state) {
				$(global).trigger("persist");
			} else {
				reset();
			}
		}
	}
	/*
	 * If page is persisted(bfCache hit) return true else return false.
	 */

	function isPersisted(e) {
		return !!e.persisted;
	}
	/*
	 * If current page navigated by browser back or forward button, returns true else returns false.
	 */

	function isBackForwardNavigated() {
		var wp = global.performance;
		return !(wp && wp.navigation && (wp.navigation.type === wp.navigation.TYPE_NAVIGATE || wp.navigation.type === wp.navigation.TYPE_RELOAD));
	}
	/*
	 * flush current history state
	 */

	function reset() {
		hasReplaceState && history.replaceState(null, doc.title, location.href);
	}

	function clone(state) {
		return (state === null) ? null : $.extend(true, {}, state);
	}
	/**
	* Saves state and returns current state.
	* @ko 인자로 넘긴 현재 상태정보를 저장하고, 저장되어있는 현재 상태 객체를 반환한다.
	* @method jQuery.persist
    * @param {Object} state state info to be restored
	* @return {Object} state info to be restored
	* @example
	$("a").on("click",function(e){
		e.preventdefault()	
		// get state
		var state = $.persist();
		
		// update state
		state.scrollTop = document.scrollTop;
		
		// save state
		$.persist(state);
		
		location.href = this.attr("href");
	});
	*/
	$.persist = function(state) {
		if (hasReplaceState && state) {
			history.replaceState(state, doc.title, location.href);
		}
		return clone(history.state);
	};
	$.event.special.persist = {
		setup: function() {
			$(global).on("pageshow", onPageshow);
		},
		teardown: function() {
			$(global).off("pageshow", onPageshow);
		},
		trigger: function(e) {
			e.state = clone(history.state);
		}
	};
	// debug
	return {
		"isPersisted": isPersisted,
		"isBackForwardNavigated": isBackForwardNavigated,
		"onPageshow": onPageshow,
		"reset": reset,
		"clone": clone,
		"persist": $.persist
	};
});
// debug
eg.module("rotate",[jQuery, eg, window, document],function($, ns, global, doc){
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
     * @param {Boolean} e.isVertical vertical
     * @example
     * $(window).on("rotate",function(e){
     *      e.isVertical;
     * });
     *
     */

    var beforeScreenWidth = -1,
        beforeVertical = null,
        rotateTimer = null,
        agent = ns.agent(),
        isMobile = /android|ios/.test(agent.os.name);

    /*
     * This orientationChange method is return event name for bind orientationChange event.
     */
    var orientationChange = function (){
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
        if( (agent.os.name === "android" && agent.os.version === "2.1") ) {//|| htInfo.galaxyTab2)
            type = "resize";
        }else{
            type = "onorientationchange" in global ? "orientationchange" : "resize";
        }

        orientationChange = function(){
            return type;    
        };
        return type;
        
    };
    /*
     * If viewport is vertical return true else return false.
     */
    function isVertical() {
        var eventName = orientationChange(),
            screenWidth, degree, vertical;

        if(eventName === "resize") {
            screenWidth = doc.documentElement.clientWidth;

            if(beforeScreenWidth === -1) { //first call isVertical
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
    function handler(e){

        var eventName = orientationChange(),
            delay, screenWidth;
  
        if (eventName === "resize") {
            global.setTimeout(function(){
                triggerRotate();
            }, 0);
        } else {
            delay = 300;
            if(agent.os.name === "android") {
                screenWidth = doc.documentElement.clientWidth;
                if (e.type === "orientationchange" && screenWidth === beforeScreenWidth) {
                    global.setTimeout(function(){
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
            },delay);
        }
    }
    
    $.event.special.rotate = {
        setup: function() {
            beforeScreenWidth = doc.documentElement.clientWidth;
            $(global).on(orientationChange(),handler);
        },
        teardown: function() {
            $(global).off(orientationChange(),handler);
        },
        trigger : function(e){
            e.isVertical = beforeVertical;
        }
    };

    return {
        "orientationChange" : orientationChange,
        "isVertical" : isVertical,
        "triggerRotate" : triggerRotate,
        "handler" : handler
    };    
});

eg.module("scrollEnd",[jQuery, eg, window, document],function($, ns, global, doc){
/**
     * Support scrollEnd event in jQuery
     * @ko jQuery custom scrollEnd 이벤트 지원
     * @name jQuery#scrollEnd
     * @event
     * @param {Number} e.top top position <ko>상단(top) 위치 값</ko>
     * @param {Number} e.left left position <ko>왼쪽(left) 위치 값</ko>
     * @example
     * $(window).on("scrollend",function(e){
     *      e.top;
     *      e.left;
     * });
     *
     */

    var isTouched, isMoved, preTop = 0, preLeft = 0, observerInterval, scrollEndTimer, rotateFlag = false,
    CHROME = 3,
    TIMERBASE = 2,
    TOUCHBASE = 1,
    SCROLLBASE = 0,
    deviceType = getDeviceType();

    $.event.special.scrollend = {
        setup: function() {
            attachEvent();
        },
        teardown: function() {
            removeEvent();
        }
    };

    /**
     * Below iOS7 : Scroll event occurs once when the scroll is stopped
     * Since iOS8 : Scroll event occurs every time scroll
     * android : Scroll event occurs every time scroll
     * Below android 2.x : Touch event-based processing
     * android & chrome : Scroll event occurs when the rotation
     * @ko
     * iOS : iOS 7.x 이하에서는 스크롤이 멈췄을때 scroll 이벤트 한번 발생
     *       iOS 8.x 이상에서는 scroll 이벤트가 android 와 동일하게 스크롤시 매번 발생
     * android : 스크롤시 scroll 이벤트는 매번 발생
     *           android 2.x 이하에서는 터치 이벤트 기반으로 처리
     * android & chrome : 회전시 scroll 이벤트가 발생되어 이를 처리하기 위함.
     */

    function getDeviceType(){
        var retValue = SCROLLBASE,
            agent = ns.agent(),
            osInfo = agent.os,
            browserInfo = agent.browser,
            version = parseInt(osInfo.version, 10);

        if(osInfo.name === "android"){
            retValue = browserInfo.name === "chrome" ? CHROME : (version >= 3 ? TIMERBASE : TOUCHBASE);
        }else if(/^(?:window|ios)$/.test(osInfo.name) && version >= 8){
                 retValue = TIMERBASE;
        }

        return retValue;
    }

    function attachEvent(){

        var winEvent = $(global).on("scroll" , scroll);

        if(deviceType === TOUCHBASE){
            $(doc).on({
                "touchstart" : touchStart,
                "touchmove" : touchMove,
                "touchend" : touchEnd
            });
        }

        if(deviceType === CHROME) {
            winEvent.on("orientationchange" , function(){
                rotateFlag = true;
            });
        }
    }

    function touchStart(){
        isTouched = true;
        isMoved = false;
        preTop = preLeft = 0;
    }

    function touchMove(){
        isMoved = true;
    }

    function touchEnd(){
        isTouched = false;
        if(isMoved) {
            startObserver();
        }
    }

    function scroll(){
        switch(deviceType) {
            case SCROLLBASE :
                triggerScrollEnd();
                break;
            case TOUCHBASE :
                startObserver();
                break;
            case TIMERBASE :
                triggerScrollEndAlways();
                break;
            case CHROME :
                if(rotateFlag){
                    rotateFlag = false;
                }else{
                    triggerScrollEnd();
                }
                break;
        }
    }

    function startObserver(){
        stopObserver();
        observerInterval = setInterval(observe,100);

    }

    function stopObserver(){
        observerInterval && clearInterval(observerInterval);
        observerInterval = null;
    }

    function observe(){
        if(isTouched || (preTop !== global.pageYOffset || preLeft !== global.pageXOffset) ) {
            preTop = global.pageYOffset;
            preLeft = global.pageXOffset;
        } else {
            stopObserver();
            triggerScrollEnd();
        }

    }

    function triggerScrollEnd(){
        $(global).trigger("scrollend" , {
            top : global.pageYOffset,
            left : global.pageXOffset
        });
    }

    function triggerScrollEndAlways() {
        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(function() {
            triggerScrollEnd();
        },350);
    }

    function removeEvent(){
        $(doc).off({
            "touchstart" : touchStart,
            "touchmove" : touchMove,
            "touchend" : touchEnd
        });
        $(global).off("scroll" , scroll);
    }

    // @qunit getDeviceType, CHROME, TIMERBASE, TOUCHBASE, SCROLLBASE
   return {
       getDeviceType : getDeviceType,
       CHROME : CHROME,
       TIMERBASE : TIMERBASE,
       TOUCHBASE : TOUCHBASE,
       SCROLLBASE : SCROLLBASE
   };
});
eg.module("class",[eg],function(ns){
/**
	 *
	 * Class
	 * The Class() object is used to implement the application using object-oriented programming.
	 * @group EvergreenJs
	 * @ko Class는 어플리케이션을 객체지향 프로그래밍 방식으로 구현하는데 사용합니다.
	 * @class
	 * @name eg.Class
	 * @param {Object} oDef Class definition of object literal type. <ko>리터럴 형태의 클래스 정의부</ko>
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
	 * @ko extend는 Class를 상속할 때 사용합니다.
	 * @static
	 * @method eg.Class.extend
	 * @param {eg.Class} oSuperClass Super class. <ko>상속하려는 클래스</ko>
	 * @param {Object} oDef Class definition of object literal type. <ko>리터럴 형태의 클래스 정의부</ko>
	 * @return {Class}
	 * @example
	 	var Some = eg.Class.extend(eg.Component,{
			"some" : function(){}
	 	})
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
});
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
});




eg.module("movableCoord",[jQuery, eg],function($, ns){
	// It is scheduled to be removed in case of build process.
	// ns.__checkLibrary__( !("Hammer" in window), "You must download Hammerjs. (http://hammerjs.github.io/)\n\ne.g. bower install hammerjs");
	// ns.__checkLibrary__( !("easeOutQuint" in $.easing), "You must download jQuery Easing Plugin(http://gsgd.co.uk/sandbox/jquery/easing/)\n\ne.g. bower install jquery.easing");
	/**
	 * The MovableCoord can control coordinate by user's action.
	 * @group EvergreenJs
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
	 * @param {Array} options.bounce The area can move using animation. <ko>바운스 : 애니메이션에 의해 이동할 수 있는 영역 </ko>
	 * @param {Boolean} [options.bounce.0=10] The bounce top range <ko>top 바우스 영역</ko>
	 * @param {Boolean} [options.bounce.1=10] The bounce right range <ko>right 바우스 영역</ko>
	 * @param {Boolean} [options.bounce.2=10] The bounce bottom range <ko>bottom 바우스 영역</ko>
	 * @param {Boolean} [options.bounce.3=10] The bounce left range <ko>left 바우스 영역</ko>
	 *
	 * @param {Array} options.margin The area can move using user's action. <ko>영역별 마진 영역 : 사용자의 액션에 의해, 추가로 이동할수 있는 영역</ko>
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
	 * @param {Function} [options.easing a easing=easing.easeOutQuint] Function of the jQuery Easing Plugin <ko>jQuery Easing 플러그인 함수</ko>
	 * @param {Number} [options.deceleration=0.0006] deceleration This value can be altered to change the momentum animation duration. higher numbers make the animation shorter. <ko>감속계수. 높을값이 주어질수록 애니메이션의 동작 시간이 짧아진다.</ko>
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
			this._status = {
				grabOutside : false,
				curHammer : null,
				moveDistance : null,
				animating : null
			};
			this._hammers = {};
			this._pos = [ this.options.min[0], this.options.min[1] ];
			this._subOptions = {};
			this._raf = null;
			this._animationEnd = this._animationEnd.bind(this);	// for caching
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
		 * @param {Number} [options.maximumSpeed=Infinity] The maximum speed. <ko>최대 좌표 변환 속도 (px/ms)</ko>
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
			hammer.on("hammer.input", function(e) {
				if(e.isFirst) {
					// apply options each
					this._subOptions = subOptions;
					this._status.curHammer = hammer;
					this._panstart(e);
				}
			}.bind(this))
			.on("panstart panmove", this._panmove.bind(this))
			.on("panend", this._panend.bind(this));
			return hammer;
		},
		/**
		 * Dettach a element to an use for the movableCoord.
		 * @ko movableCoord을 사용하기 위한 엘리먼트를 해제한다.
		 * @method eg.MovableCoord#unbind
		 * @param {HTMLElement|String|jQuery} element The target element.<ko>movableCoord을 사용하기 위한 설정한 엘리먼트</ko>
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
			if(this._status.animating) {
				this._pos = this._getCircularPos(this._pos);
				this._triggerChange(this._pos, true);
				this._status.animating = null;
				this._raf && cancelAnimationFrame(this._raf);
				this._raf = null;
			}
		},

		_getCircularPos : function(pos, min, max, circular) {
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
		_panstart : function(e) {
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
				pos : [ pos[0], pos[1] ],
				hammerEvent : e
			});
			this._status.moveDistance = [ pos[0], pos[1] ];
			this._status.grabOutside = this._isOutside(pos, this.options.min, this.options.max);
		},

		// panmove event handler
		_panmove : function(e) {
			var tv, tn, tx, pos = this._pos,
				min = this.options.min,
				max = this.options.max,
				bounce = this.options.bounce,
				margin = this.options.margin,
				easing = this.options.easing,
				direction = this._subOptions.direction,
				scale = this._subOptions.scale,
				out = [ margin[0] + bounce[0], margin[1] + bounce[1], margin[2] + bounce[2], margin[3] + bounce[3] ],
				prevent  = false;

			// not support offset properties in Hammerjs - start
			var prevInput = this._status.curHammer.session.prevInput || {};
			if(prevInput) {
			    e.offsetX = e.deltaX - prevInput.deltaX;
			    e.offsetY = e.deltaY - prevInput.deltaY;
			} else {
			    e.offsetX = e.offsetY = 0;
			}
			// not support offset properties in Hammerjs - end

 			if((e.offsetDirection & ns.DIRECTION_HORIZONTAL) && (direction & ns.DIRECTION_HORIZONTAL)) {
				this._status.moveDistance[0] += (e.offsetX * scale[0]);
	              	prevent = true;
			}
			if((e.offsetDirection & ns.DIRECTION_VERTICAL) && (direction & ns.DIRECTION_VERTICAL)) {
			     this._status.moveDistance[1] += (e.offsetY * scale[1]);
			     prevent = true;
			}
			if(prevent) {
				e.srcEvent.preventDefault();
				e.srcEvent.stopPropagation();
			}
			e.preventSystemEvent = prevent;
			pos[0] = this._status.moveDistance[0], pos[1] = this._status.moveDistance[1];
			pos = this._getCircularPos(pos, min, max);

			// from outside to inside
			if (this._status.grabOutside && !this._isOutside(pos, min, max)) {
				this._status.grabOutside = false;
			}

			// when move pointer is holded outside
			if (this._status.grabOutside) {
				tn = min[0]-out[3], tx = max[0]+out[1], tv = pos[0];
				pos[0] = tv>tx?tx:(tv<tn?tn:tv);
				tn = min[1]-out[0], tx = max[1]+out[2], tv = pos[1];
				pos[1] = tv>tx?tx:(tv<tn?tn:tv);
			} else {	// when start pointer is holded inside
				// get a initialization slop value to prevent smooth animation.
				var initSlope = this._isInEasing ? easing(null, 0.9999 , 0, 1, 1) / 0.9999 : easing(null, 0.0001 , 0, 1, 1) / 0.0001;
				if (pos[1] < min[1]) { // up
					tv = (min[1]-pos[1])/(out[0]*initSlope);
					pos[1] = min[1]-easing(null, tv>1?1:tv , 0, 1, 1)* out[0];
				} else if (pos[1] > max[1]) { // down
					tv = (pos[1]-max[1])/(out[2]*initSlope);
					pos[1] = max[1]+easing(null, tv>1?1:tv , 0, 1, 1)*out[2];
				}
				if (pos[0] < min[0]) { // left
					tv = (min[0]-pos[0])/(out[3]*initSlope);
					pos[0] = min[0]-easing(null, tv>1?1:tv , 0, 1, 1)*out[3];
				} else if (pos[0] > max[0]) { // right
					tv = (pos[0]-max[0])/(out[1]*initSlope);
					pos[0] = max[0]+easing(null, tv>1?1:tv , 0, 1, 1)*out[1];
				}
			}
			this._triggerChange(pos, true, e);
		},

		// panend event handler
		_panend : function(e) {
			if(!this._status.moveDistance) { return; }
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
			this._animationEnd, false, null, e);
			this._status.moveDistance = null;
		},

		_animationEnd : function() {
			/**
			 * When animation was ended.
			 * @ko 에니메이션이 끝났을 때 발생한다.
			 * @name eg.MovableCoord#animationEnd
			 * @event
			 */
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

		_animateBy : function(offset, callback, isBounce, duration, e) {
			var pos = this._pos;
			return this._animateTo([
				pos[0] + offset[0],
				pos[1] + offset[1]
			], callback, isBounce, duration, e);
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

		_animateTo : function(absPos, callback, isBounce, duration, e) {
			var pos = this._pos,
				destPos = this._getPointOfIntersection(pos, absPos),
				param = {
					depaPos : [ pos[0], pos[1] ],
					destPos : destPos,
					bounce : isBounce,
					hammerEvent : e || {}
				};
			if (!isBounce) {
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
					this._status.animating = null;
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

			/**
			 * When animation was started.
			 * @ko 에니메이션이 시작했을 때 발생한다.
			 * @name eg.MovableCoord#animation
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
			var retTrigger = this.trigger("animation", param);
			// You can't stop the 'animation' event when 'circular' is true.
			if (isCircular && !retTrigger) {
				throw new Error("You can't stop the 'animation' event when 'circular' is true.");
			}
			param.depaPos = pos;
			param.startTime = new Date().getTime();
			this._status.animating = param;

			if (retTrigger) {
				// console.error("depaPos", pos, "depaPos",destPos, "duration", duration, "ms");
				var info = this._status.animating,
					self = this;
				(function loop() {
					self._raf=null;
					if (self._frame(info) >= 1) { return done(); } // animationEnd
					self._raf = requestAnimationFrame(loop);
				})();
			}
		},

		// animation frame (0~1)
		_frame : function(param) {
			var curTime = new Date() - param.startTime,
				per = Math.min(1, curTime / param.duration),
				easingPer = this.options.easing(null, curTime, 0, 1, param.duration),
				pos = [ param.depaPos[0], param.depaPos[1] ];
			for (var i = 0; i <2 ; i++) {
			    (pos[i] !== param.destPos[i]) && (pos[i] += (param.destPos[i] - pos[i]) * easingPer);
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
		_triggerChange : function(pos, holding, e) {
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
			this.trigger("change", {
				pos : [ pos[0], pos[1] ],
				holding : holding,
				hammerEvent : e || { }
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
		get : function() {
			return [ this._pos[0],this._pos[1] ];
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
		setTo : function(x, y, duration) {
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
			if(duration) {
				this._animateTo( [ x, y ], this._animationEnd, false, duration);
			} else {
				this._pos = this._getCircularPos( [ x, y ] );
				this._triggerChange(this._pos, false);
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
		setBy : function(x, y, duration) {
			return this.setTo(
				x != null ? this._pos[0] + x : this._pos[0],
				y != null ? this._pos[1] + y : this._pos[1],
				duration
			);
		},

		_isInEasing : function(easing) {
			for(var p in $.easing) {
				if($.easing[p] === easing) {
					return !~p.indexOf("Out");
				}
			}
			return false;
		},

		/**
		 * Release resources and off custom events
		 * @ko 모든 커스텀 이벤트와 자원을 해제한다.
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
});

eg.module("flicking",[jQuery, eg, eg.MovableCoord],function($, ns, MC) {
	/**
	 * To build flickable UI
	 * @group EvergreenJs
	 * @ko 플리킹 UI를 구성한다.
	 * @class
	 * @name eg.Flicking
	 * @extends eg.Component
	 *
	 * @param {HTMLElement|String|jQuery} element wrapper element <ko>기준 요소</ko>
	 * @param {Object} options
	 * @param {Function} [options.effect=easing.linear] jQuery Easing Plugin function <ko>jQuery Easing 플러그인 함수</ko>
	 * @param {Boolean} [options.hwAccelerable=eg.isHWAccelerable()] Force to use HW compositing <ko>하드웨어 가속 사용여부</ko>
	 * @param {String} [options.prefix=eg-flick] Prefix string for flicking elements <ko>요소에 설정될 접두사</ko>
	 * @param {Number} [options.deceleration=0.0006] Deceleration this value can be altered to change the momentum animation duration. higher numbers make the animation shorter
	 * @param {Boolean} [options.horizontal=true] For move direction (when horizontal is false, then move direction is vertical) <ko>이동방향 설정 (horizontal == true 가로방향, horizontal == false 세로방향)</ko>
	 * @param {Boolean} [options.circular=false] To make panels rotate infinitely  <ko>순환 여부</ko>
	 * @param {Number|Array} [options.previewPadding=[0,0]] Padding value to display previous and next panels. If set array value the order is left(up) to right(down) <ko>이전과 다음 패널을 출력하는 프리뷰 형태에 사용되는 padding 값. 배열 형태로 지정시 좌측(상단), 우측(하단) 순서로 지정</ko>
	 * @param {Number} [options.threshold=40] Threshold pixels to move panels in prev/next direction <ko>다음 패널로 이동되기 위한 임계치 픽셀</ko>
	 * @param {Number} [options.duration=100] Duration time of panel change animation in milliseconds <ko>패널 이동 애니메이션 진행시간(ms) 값</ko>
	 * @param {Function} [options.panelEffect=easing.easeOutQuint] Function of the jQuery Easing Plugin <ko>jQuery Easing 플러그인 함수</ko>
	 * @param {Number} [options.defaultIndex=0] Default panel index to show in first time <ko>초기에 출력할 패널 인덱스</ko>
	 *
	 * @codepen {"id":"rVOpPK", "ko":"플리킹 기본 예제", "en":"Flicking default example", "collectionId":"ArxyLK", "height" : 403}
	 *
	 * @see jQuery Easing Plugin {@link http://gsgd.co.uk/sandbox/jquery/easing}
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
	 	var some = eg.Flicking("#mflick", {
	 		circular : true,
	 		threshold : 50
	 	}).on({
	 		beforeRestore : function(e) { ... },
	 		flickStart : function(e) { ... }
	 	);
	 	</script>
	 */
	ns.Flicking = ns.Class.extend(ns.Component,{
		/**
		 * Constructor
		 * @param {HTMLElement|String|jQuery} element - base element
		 * @param {Object} options
		 */
		construct : function(element, options) {
			this._wrapper = $(element);

			$.extend(this.options = {
				effect : $.easing.linear,	// $.easing functions for animation
				hwAccelerable : ns.isHWAccelerable(),  // check weather hw acceleration is available
				prefix : "eg-flick",		// prefix value of class name
				deceleration : 0.0006,		// deceleration value
				horizontal : true,			// move direction (true == horizontal, false == vertical)
				circular : false,			// circular mode. In this mode at least 3 panels are required.
				previewPadding : [ 0, 0 ],	// preview padding value in left(up) to right(down) order. In this mode at least 5 panels are required.
				threshold : 40,				// the distance pixel threshold value for change panel
				duration : 100,				// duration ms for animation
				panelEffect : $.easing.easeOutQuint, // $.easing function for panel change animation
				defaultIndex : 0			// initial panel index to be shown
			}, options);

			var padding = this.options.previewPadding,
				supportHint = window.CSS && window.CSS.supports && window.CSS.supports("will-change", "transform");

			if(typeof padding === "number") {
				padding = this.options.previewPadding = [ padding, padding ];
			} else if(padding.constructor !== Array) {
				padding = this.options.previewPadding = [ 0, 0 ];
			}

			// config value
			this._conf = {
				panel : {
					list : [],			// panel list
					index : 0,  		// current physical dom index
					no : 0,  			// current logical panel index
					size : 0,			// panel size
					count : 0,  		// total physical panel count
					origCount : 0,  	// total count of given original panels
					changed : false,	// if panel changed
					animating : false,	// current animating status boolean
					minCount : padding[0] + padding[1] > 0 ? 5 : 3  // minimum panel count
				},
				touch : {
					holdPos : [ 0, 0 ],	// hold x,y coordinate
					destPos : [ 0, 0 ],	// destination x,y coordinate
					distance : 0,		// touch distance pixel of start to end touch
					direction : null	// touch direction
				},
				customEvent : {},		// for custom event return value
				clickBug : ns._hasClickBug(),
				useLayerHack : this.options.hwAccelerable && !supportHint,
				useHint : this.options.hwAccelerable && supportHint,
				dirData : []
			};

			[[ "RIGHT", "LEFT" ], [ "DOWN", "UP" ]][ +!this.options.horizontal ].forEach(function(v) {
				this._conf.dirData.push(ns[ "DIRECTION_"+ v ]);
			}, this);

			this._build();
			this._bindEvents();
			this._arrangePanels();
		},

		/**
		 * Build and set panel nodes to make flicking structure
		 */
		_build : function() {
			var panel = this._conf.panel,
				options = this.options,
			 	children = panel.list = this._wrapper.children(),
				padding = options.previewPadding.concat(),
				prefix = options.prefix,
				horizontal = options.horizontal,
				panelCount = panel.count = panel.origCount = children.length,
				sizeValue = [ panel.size = this._wrapper[ horizontal ? "width" : "height" ]() - (padding[0] + padding[1]), "100%" ],
				temp;

			this._wrapper.css({
				padding : ( horizontal ? "0 "+ padding.reverse().join("px 0 ") : padding.join("px 0 ") ) +"px",
				overflow : "hidden"
			});

			this._getDataByDirection(sizeValue);

			children.addClass(prefix +"-panel").css({
				position : "absolute",
				width : sizeValue[0],
				height : sizeValue[1],
				top : 0,
				left : 0
			});

			sizeValue[temp = +!horizontal] *= panelCount;
			sizeValue[temp] += "px";

			temp = "width:"+ sizeValue[0] +";height:"+ sizeValue[1] + (!horizontal ? ";top:"+ padding[0] +"px;" : ";");
			this._container = children.wrapAll("<div class='"+ prefix +"-container' style='position:relative;"+ temp +"' />").parent();

			if(this._addClonePanels()) {
				panelCount = panel.count = ( panel.list = this._container.children() ).length;
			}

			// create MovableCoord instance
			this._mcInst = new MC({
				min : [ 0, 0 ],
				max : this._getDataByDirection([ panel.size * ( panelCount-1 ), 0 ]),
				margin : 0,
				circular : false,
				easing : options.panelEffect,
				deceleration : options.deceleration
			}).bind(this._wrapper, {
				scale : this._getDataByDirection( [ -1, 0 ] ),
				direction : ns[ "DIRECTION_"+ ( horizontal ? "HORIZONTAL" : "VERTICAL" ) ],
				maximumSpeed : options.duration
			});

			this._setDefaultPanel(options.defaultIndex);
		},

		/**
		 * To fulfill minimum panel count cloning original node when circular or previewPadding option are set
		 * @return {Boolean} true : added clone node, false : not added
		 */
		_addClonePanels : function() {
			var panel = this._conf.panel,
				panelCount = panel.origCount,
				cloneCount = panel.minCount - panelCount,
				list = panel.list, cloneNodes;

			// if panels are given less than required when circular option is set, then clone node to apply circular mode
			if(this.options.circular && panelCount < panel.minCount) {
				cloneNodes = list.clone();

				while(cloneNodes.length < cloneCount) {
					cloneNodes = cloneNodes.add(list.clone());
				}

				return this._container.append(cloneNodes);
			}
		},

		/**
		 * Move panel's position within array
		 * @param {Number} count element counts to move
		 * @param {Boolean} append where the list to be appended(moved) (true: to the end, false: to the beginning)
		 */
		_movePanelPosition : function(count, append) {
			var panel = this._conf.panel,
				list = panel.list, listToMove;

			listToMove = list.splice(append ? 0 : panel.count - count, count);
			this._conf.panel.list = $(append ? $.merge(list, listToMove) : $.merge(listToMove, list));
		},

		/**
		 * Set default panel to show
		 * @param {Number} index
		 */
		_setDefaultPanel : function(index) {
			var panel = this._conf.panel,
				lastIndex = panel.count - 1, coords;

			if(this.options.circular) {
				// if default index is given, then move correspond panel to the first position
				if(index > 0 && index <= lastIndex) {
					this._movePanelPosition(index, true);
				}

				// set first panel's position according physical node length
				this._movePanelPosition(this._getBasePositionIndex(), false);

				panel.no = index;
			} else {
				// if defaultIndex option is given, then move to that index panel
				if(index > 0 && index <= lastIndex) {
					panel.index = index;
					coords = [ -(panel.size * index), 0];

					this._setTranslate(coords);
					this._mcInst.setTo( Math.abs(coords[0]), Math.abs(coords[1]) );
				}
			}
		},

		/**
		 * Arrange panels' position
		 * @param {Boolean} recycle
		 * @param {Number} no - number of panels to arrange
		 */
		_arrangePanels : function(recycle, no) {
			var panel = this._conf.panel,
				touch = this._conf.touch,
				dirData = this._conf.dirData,
				hwAccelerable = this._conf.useLayerHack,
				coords;

			if(this.options.circular) {
				// move elements according direction
				if(recycle) {
					if(typeof no !== "undefined") {
						touch.direction = dirData[ +!Boolean(no > 0) ];
					}

					this._arrangePanelPosition(touch.direction, no);
				}

				// set index for base element's position
				panel.index = this._getBasePositionIndex();
				coords = this._getDataByDirection([ panel.size * panel.index, 0 ]);

				this._mcInst.setTo(coords[0], coords[1]);
			}

			// set each panel's position
			panel.list.each((function(i, v) {
				coords = this._getDataByDirection([ (100 * i) +"%", 0 ]);
				$(v).css("transform", ns.translate(coords[0], coords[1], hwAccelerable));
			}).bind(this));
		},

		/**
		 * Set hint for browser to decide efficient way of doing transform changes(or animation)
		 * https://dev.opera.com/articles/css-will-change-property/
		 * @param {Boolean} set
		 */
		_setHint : function(set) {
			if(this._conf.useHint) {
				var value = set ? "transform" : "";
				this._container.css("willChange", value);
				this._conf.panel.list.css("willChange", value);
			}
		},

		/**
		 * Get data according options.horizontal value
		 *
		 * @param {Array} value primary data to handle
		 * @return {Array}
		 */
		_getDataByDirection : function(value) {
			!this.options.horizontal && value.reverse();
			return value;
		},

		/**
		 * Move nodes
		 * @param {Boolean} diretion
		 * @param {Number} times
		 */
		_arrangePanelPosition : function(direction, times) {
			var next = direction === this._conf.dirData[0];
			this._movePanelPosition( Math.abs(times || 1), next );
		},

		/**
		 * Get the base position index of the panel
		 */
		_getBasePositionIndex : function() {
			var panel = this._conf.panel;
			return panel.index = Math.floor(panel.count / 2 - 0.1);
		},

		/**
		 * Bind events
		 */
		_bindEvents : function() {
			this._mcInst.on({
				hold : this._holdHandler.bind(this),
				change : this._changeHandler.bind(this),
				release : this._releaseHandler.bind(this),
				animation : this._animationHandler.bind(this),
				animationEnd : this._animationEndHandler.bind(this)
			});
		},

		/**
		 * 'hold' event handler
		 */
		_holdHandler : function(e) {
			this._conf.touch.holdPos = e.pos;
			this._conf.panel.changed = false;
			this._setHint(true);

			/**
			 * When touch starts
			 * @ko 터치가 시작될 때 발생하는 이벤트
			 * @name eg.Flicking#touchStart
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
			this._triggerEvent("touchStart", { pos : e.pos });
		},

		/**
		 * 'change' event handler
		 */
		_changeHandler : function(e) {
			var pos = e.pos;

			this._setPointerEvents(e);  // for "click" bug

			/**
			 * When touch moves
			 * @ko 터치한 상태에서 이동될 때 발생하는 이벤트
			 * @name eg.Flicking#touchMove
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
			/**
			 * Occurs during the change
			 * @ko 터치하지 않은 상태에서 패널이 이동될 때 발생하는 이벤트
			 * @name eg.Flicking#change
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
			if(this._triggerEvent(e.holding ? "touchMove" : "flick", { pos : e.pos })) {
				this._setTranslate([ -pos[ +!this.options.horizontal ], 0 ]);
			}
		},

		/**
		 * 'release' event handler
		 */
		_releaseHandler : function(e) {
			var touch = this._conf.touch,
				pos = e.destPos,
				posIndex = +!this.options.horizontal,
				holdPos = touch.holdPos[posIndex],
				panelWidth = this._conf.panel.size;

			touch.distance = e.depaPos[posIndex] - touch.holdPos[posIndex];
			touch.direction = this._conf.dirData[ +!Boolean(touch.holdPos[posIndex] < e.depaPos[posIndex]) ];

			pos[posIndex] = Math.max(holdPos - panelWidth, Math.min(holdPos + panelWidth, pos[posIndex]));
			touch.destPos[posIndex] = pos[posIndex] = Math.round(pos[posIndex] / panelWidth) * panelWidth;

			// when reach to the last panel
			/*if(pos[0] >= this._mcInst.options.max[0]) {
				this._mcInst.options.max[0] += panelWidth;
			}*/

			/**
			 * When touch ends
			 * @ko 터치가 종료될 때 발생되는 이벤트
			 * @name eg.Flicking#touchEnd
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
			this._triggerEvent("touchEnd", {
				depaPos : e.depaPos,
				destPos : e.destPos
			});

			this._setPointerEvents();  // for "click" bug
		},

		/**
		 * 'animation' event handler
		 */
		_animationHandler : function(e) {
			var panel = this._conf.panel,
				direction = this._conf.touch.direction,
				dirData = this._conf.dirData;

			panel.animating = true;
			e.duration = this.options.duration;

			if(this._isMovable()) {
				/**
				 * Before panel changes
				 * @ko 플리킹이 시작되기 전에 발생하는 이벤트
				 * @name eg.Flicking#flickStart
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
				this._triggerEvent("flickStart", {
					depaPos : e.depaPos,
					destPos : e.destPos
				});

				panel.index += direction === dirData[0] ? 1 : -1;
				e.destPos[ +!this.options.horizontal ] = panel.size * panel.index;

				this._setPanelNo(true);
				panel.changed = true;

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
				if(!(this._conf.customEvent.restore = this._triggerEvent("beforeRestore", {
					depaPos : e.depaPos,
					destPos : e.destPos
				}))) {
					e.stop();
				}
			}
		},

		/**
		 * 'animationEnd' event handler
		 */
		_animationEndHandler : function() {
			// adjust panel coordination
			var panel = this._conf.panel;

			this._setTranslate([ -panel.size * panel.index, 0 ]);

			if(this.options.circular && panel.changed) {
				this._arrangePanels(true);
				this._setPanelNo();
			}

			this._setHint(panel.animating = false);

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
			if(panel.changed) {
				this._triggerEvent("flickEnd");
			} else if(this._conf.customEvent.restore) {
				this._triggerEvent("restore");
			}
		},

		/**
		 * Set the logical panel index number
		 * @param {Boolean} move - set to increment or decrement
		 */
		_setPanelNo : function(move) {
			var panel = this._conf.panel,
				count = panel.origCount - 1,
				direction = this._conf.touch.direction,
				dirData = this._conf.dirData;

			if(move) {
				panel.no += direction === dirData[0] ? 1 : -1;
			}

			if(panel.no > count) {
				panel.no = 0;
			} else if(panel.no < 0) {
				panel.no = count;
			}
		},

		/**
		 * Set pointerEvents css property on container element due to the iOS click bug
		 * @param {Event} e
		 */
		_setPointerEvents : function(e) {
			if(this._conf.clickBug) {
				this._container.css("pointerEvents", e && e.holding && e.hammerEvent.preventSystemEvent ? "none" : "auto");
			}
		},

		/**
		 * Set translate property value
		 * @param {Array} coords coordinate x,y value
		 */
		_setTranslate : function(coords) {
			// the param comes as [ val, 0 ], whatever the direction. So reorder the value depend the direction.
			this._getDataByDirection(coords);

			this._container.css("transform", ns.translate(
				this._getUnitValue(coords[0]),
				this._getUnitValue(coords[1]),
				this._conf.useLayerHack
			));
		},

		/**
		 * Return unit formatted value
		 * @param {Number|String} val
		 * @return {String} val Value formatted with unit
		 */
		_getUnitValue : function(val) {
			var rx = /(?:[a-z]{2,}|%)$/;
			return ( parseInt(val, 10) || 0 ) + ( String(val).match(rx) || "px" );
		},

		/**
		 * Check if panel passed through threshold pixel
		 */
		_isMovable : function() {
			return Math.abs(this._conf.touch.distance) >= this.options.threshold;
		},

		/**
		 * Trigger custom events
		 * @param {String} name - event name
		 * @param {Object} param - additional event value
		 * @return {Boolean}
		 */
		_triggerEvent : function(name, param) {
			var panel = this._conf.panel;

			return this.trigger(name, param = $.extend({
				eventType : name,
				index : panel.index,
				no : panel.no,
				direction : this._conf.touch.direction
			}, param ));
		},

		/**
		 * Get next/prev panel element/index.
		 * @param {Boolean} direction
		 * @param {Boolean} element - true:to get element, false:to get index
		 * @param {Number} physical - true : physical, false : logical
		 * @return {jQuery|Number}
		 */
		_getElement : function(direction, element, physical) {
			var panel = this._conf.panel,
				circular = this.options.circular,
				pos = panel.index,
				next = direction === this._conf.dirData[0],
				result = null, total, index, currentIndex;

			if(physical) {
				total = panel.count;
				index = pos;
			} else {
				total = panel.origCount;
				index = panel.no;
			}

			currentIndex = index;

			if(next) {
				if(index < total-1) {
					index++;
				} else if(circular) {
					index = 0;
				}
			} else {
				if(index > 0) {
					index--;
				} else if(circular) {
					index = total - 1;
				}
			}

			if(currentIndex !== index) {
				result = element ? $(panel.list[ next ? pos + 1 : pos - 1 ]) : index;
			}

			return result;
		},

		/**
		 * Move panel to the given direction
		 * @param {Boolean} direction
		 * @param {Number} duration
		 */
		_movePanel : function(direction, duration) {
			var panel = this._conf.panel,
				next = direction === this._conf.dirData[0],
				index = this[ next ? "getNextIndex" : "getPrevIndex" ](),
				coords;

			if(index != null) {
				this._conf.touch.direction = direction;
				this._setPanelNo(true);
				panel.index = index;

				coords = this._getDataByDirection([ panel.size * ( next ? 1 : -1 ), 0 ]);
				this._mcInst.setBy(coords[0], coords[1], duration);
				this._arrangePanels(true);
			}
		},

		/**
		 * Get current panel position
		 * @ko 현재 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number} Number Current index number <ko>현재 패널 인덱스 번호</ko>
		 */
		getIndex : function(physical) {
			return this._conf.panel[ physical ? "index" : "no" ];
		},

		/**
		 * Get current panel element
		 * @ko 현재 패널 요소의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getElement
		 * @return {jQuery} jQuery Current element <ko>현재 요소</ko>
		 */
		getElement : function() {
			var panel = this._conf.panel;
			return $(panel.list[panel.index]);
		},

		/**
		 * Get next panel element
		 * @ko 다음 패널 요소의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getNextElement
		 * @return {jQuery} jQuery Next element <ko>다음 패널 요소</ko>
		 */
		getNextElement : function() {
			return this._getElement(this._conf.dirData[0], true);
		},

		/**
		 * Get next panel index
		 * @ko 다음 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getNextIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number} Number Next element index value <ko>다음 패널 인덱스 번호</ko>
		 */
		getNextIndex : function(physical) {
			return this._getElement(this._conf.dirData[0], false, physical);
		},

		/**
		 * Get whole panel elements
		 * @ko 패널을 구성하는 모든 요소들의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getAllElements
		 * @return {jQuery} jQuery All panel elements <ko>모든 패널 요소</ko>
		 */
		getAllElements : function() {
			return this._conf.panel.list;
		},

		/**
		 * Get previous panel element
		 * @ko 이전 패널 요소의 레퍼런스를 반환한다.
		 * @method ns.Flicking#getPrevElement
		 * @return {jQuery} jQuery Previous element <ko>이전 패널 요소</ko>
		 */
		getPrevElement : function() {
			return this._getElement(this._conf.dirData[1], true);
		},

		/**
		 * Get previous panel index
		 * @ko 이전 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getPrevIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number} number Previous element index value <ko>이전 패널 인덱스 번호</ko>
		 */
		getPrevIndex : function(physical) {
			return this._getElement(this._conf.dirData[1], false, physical);
		},

		/**
		 * Get total panel count
		 * @ko 전체 패널의 개수를 반환한다.
		 * @method eg.Flicking#getTotalCount
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number} Number Count of all elements <ko>모든 패널 요소 개수</ko>
		 */
		getTotalCount : function(physical) {
			return this._conf.panel[ physical ? "count" : "origCount" ];
		},

		/**
		 * Return either panel is animating or not
		 * @ko 현재 애니메이션중인지 여부를 리턴한다.
		 * @method eg.Flicking#isPlaying
		 * @return {Boolean}
		 */
		isPlaying : function() {
			return this._conf.panel.animating;
		},

		/**
		 * Move to next panel
		 * @ko 다음 패널로 이동한다.
		 * @method eg.Flicking#next
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds <ko>애니메이션 진행시간(ms)</ko>
		 */
		next : function(duration) {
			this._movePanel(this._conf.dirData[0], duration || this.options.duration);
		},

		/**
		 * Move to previous panel
		 * @ko 이전 패널로 이동한다.
		 * @method eg.Flicking#prev
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds <ko>애니메이션 진행시간(ms)</ko>
		 */
		prev : function(duration) {
			this._movePanel(this._conf.dirData[1], duration || this.options.duration);
		},

		/**
		 * Move to indicated panel
		 * @ko 지정한 패널로 이동한다.
		 * @method eg.Flicking#moveTo
		 * @param {Number} no logical panel index
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds <ko>애니메이션 진행시간(ms)</ko>
		 */
		moveTo : function(no, duration) {
			var panel = this._conf.panel,
				currentIndex = panel.index,
				indexToMove = 0,
				movableCount, coords;

			if(typeof no !== "number" || no >= panel.origCount || no === panel.no) {
				return;
			}

			if(this.options.circular) {
				// real panel count which can be moved on each(left(up)/right(down)) sides
				movableCount = [ currentIndex, panel.count - (currentIndex + 1) ];

				if(no > panel.no) {
					indexToMove = no - panel.no;

					if(indexToMove > movableCount[1]) {
						indexToMove = -( movableCount[0] + 1 - ( indexToMove - movableCount[1] ) );
					}
				} else {
					indexToMove = -(panel.no - no);

					if(Math.abs(indexToMove) > movableCount[0]) {
						indexToMove = movableCount[1] + 1 - ( Math.abs(indexToMove) - movableCount[0] );
					}

				}

				panel.no = no;
				this._arrangePanels(true, indexToMove);

			} else {
				panel.index = no;
				coords = this._getDataByDirection([ panel.size * indexToMove, 0 ]);
				this._mcInst.setTo(coords[0], coords[1], duration || this.options.duration);
			}
		},

		/**
		 * Update panel size according current viewport
		 * @ko 패널 사이즈 정보를 갱신한다.
		 * @method eg.Flicking#resize
		 */
		resize : function() {
			var panel = this._conf.panel,
				width = panel.size = this._wrapper.width(),
				maxCoords = [ width * (panel.count - 1), 0 ];

			// resize panel and parent elements
			this._container.width(maxCoords[0]);
			panel.list.css("width", width);

			// adjust the position of current panel
			this._mcInst.setTo(width * panel.index, 0).options.max = maxCoords;
		}
	});
});
eg.module("visible",[jQuery, eg],function($, ns){
	/**
	 * It check element is visible within the specific element or viewport, regardless of the scroll position
	 * @ko scroll위치와 상관없이 특정 엘리먼트나 viewport 안에 엘리먼트가 보이는지 확인한다.
	 * @class
	 * @name eg.Visible
	 * @extends eg.Component
	 * @group EvergreenJs
	 *
	 * @param {Object} options
	 * @param {HTMLElement|String|jQuery} [options.wrapper=document] The parent element that to check targets (wrapper is only one.) <ko>확인할 영역의 상위 엘리먼트</ko>
	 * @param {String} [options.targetClass="check_visible"] A classname of tagets <ko>확인할 엘리먼트가 가진 클래스명</ko>
	 * @param {Number} [options.expandSize=0] expand size of the wrapper.
	 * e.g. If a wrapper size is 100 x 100 and 'expandSize' option is 20, visible range is 120 x 120
	 * <ko> 상위 엘리먼트 기준으로 추가적인 영역을 확인하도록 지정</ko>
	 */
	ns.Visible = ns.Class.extend(ns.Component,{
		construct : function(options) {
			this.options = {
				wrapper : document,
				targetClass : "check_visible",
				expandSize : 0
			};
			$.extend(this.options, options);

			this._wrapper = $(this.options.wrapper);
			this._wrapper = this._wrapper.length > 0 ? this._wrapper[0] : document;
			this._targets = [];
			this._timer = null;
			this._supportElementsByClassName = (function() {
				var dummy = document.createElement("div"),
					dummies;
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
		refresh : function() {
		    if (this._supportElementsByClassName) {
		        this._targets = this._wrapper.getElementsByClassName(this.options.targetClass);
		        this.refresh = function() {return this; };
		    } else {
		        this.refresh = function() {
		            this._targets = $(this._wrapper).find("." + this.options.targetClass).each(function() {
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
		 * @param {Number} [deply=-1] Delay time in milliseconds <ko>호출 후, 일정 시간이 지난 후에 확인하고자 할때 사용한다.</ko>
		 * @return {Instance}
		 */
		check : function(delay) {
			if (typeof delay === "undefined") { delay = -1; }
			clearTimeout(this._timer);
			if (delay < 0) {
				this._check();
			} else {
				this._timer = setTimeout(function() {
					this._check();
					this._timer = null;
				}.bind(this), delay);
			}
			return this;
		},
		_reviseElements : function(target,i){
			if(this._supportElementsByClassName){
				this._reviseElements = function(){return true;};
			}else{
				this._reviseElements = function(target,i){
					if (!$(target).hasClass(this.options.targetClass)) {
						target.__VISIBLE__ = null;
						this._targets.splice(i, 1);
						return false;
					}
					return true;
				};
			}
			return this._reviseElements(target,i);
		},

		_check : function() {
			var expandSize = parseInt(this.options.expandSize,10),
				wrapper = this._wrapper,
				visibles = [],
				invisibles = [],
				area = null;
			if(!wrapper.nodeType || wrapper.nodeType !== 1) {
				area = {
					top : 0,
					left : 0,
					bottom : window.innerHeight,
					right : window.innerWidth
				};
			} else {
				area = wrapper.getBoundingClientRect();
			}
			area.top -= expandSize;
			area.left -= expandSize;
			area.bottom += expandSize;
			area.right += expandSize;

			for(var i= this._targets.length-1, target, targetArea, after, before; target=this._targets[i] ; i--) {
				targetArea=target.getBoundingClientRect();
				if(this._reviseElements(target,i)){
					before = !!target.__VISIBLE__;
					target.__VISIBLE__ = after = !(
			                targetArea.bottom < area.top || area.bottom < targetArea.top ||
			                targetArea.right < area.left || area.right < targetArea.left
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
				visible : visibles,
				invisible : invisibles
			});
		},

		destroy : function() {
			this.off();
			this._targets = [];
			this._wrapper = this._timer = null;
		}
	});
});
