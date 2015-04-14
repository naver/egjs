

var __transform = (function($, global) {
	"use strict";
	var CSSMatrix = window.WebKitCSSMatrix || window.MSCSSMatrix || window.OCSSMatrix || window.MozCSSMatrix || window.CSSMatrix;
	function parse(element, transform) {
		var result = {},
			m;
		if(transform === "none") {
			return result;
		}
		if(/matrix/.test(transform)) {
			result = transform;
		} else {
			var $el = $(element);
			var needToCurStyle = /\-=|\+=/.test(transform);
			var needToConvert = /%/.test(transform);
			var width = needToConvert ? $el.width() : 0;
			var height = needToConvert ? $el.height() : 0;
			var styleTransform = needToCurStyle ? $el.css("transform") : "none";
			var properties = [];
			m = transform.match(/\w+\([^)]+\)/g);
			for(var i=0, v; v=m[i]; i++) {
				properties.push(interpolation(parseProperty(v), width, height, styleTransform));
			}
			result = data2String(properties);
			// result = parseTransform(properties);
		}
		console.log(result);
		return result;
	}

	function rateFn(start, end) {
		if (/matrix/.test(start + end)) {
			var is3d = /3d/.test(start + end);
			start = toMatrix(start);
			end = toMatrix(end);
			if (is3d || start[0] !== end[0]) {
				start = toMatrix3d(start);
				end = toMatrix3d(end);
			}
			// console.log(start, end);
			return function(pos) {
				if(pos === 1) {
					return data2String([end]);
				} else {
					var result = [];
					for(var i=0, s,e, l = start[1].length; i< l; i++) {
						s = parseFloat(start[1][i],10);
						e = parseFloat(end[1][i],10);
						result.push(s + ( e- s) * pos);
					}
					return data2String([ [ start[0], result ] ]);
				}
			}
		} else {

		}
	}

	function data2String(properties) {
		var result = [];
		for(var i=0, p, name, unit; p = properties[i]; i++) {
			name = p[0];
			unit = /translate/.test(name) ? "px" : (/rotate/.test(name) ? "deg" : "");
			result.push(name + "(" + p[1].join(unit + ",") + unit + ")");
		}
		return result.join(" ");
	}

	// Object {translateZ: 0, translateX: 20, translateY: 15, rotateX: 0, perspective: 10}
	function parseTransform(parsedProperties) {
		var result = {};
		for(var i=0, p, name, val; p = parsedProperties[i]; i++) {
			val = p[1];
			switch(name = p[0]) {
				case "translate3d":
				case "scale3d":
				case "rotate3d":
					name = name.replace(/3d$/, "");
					result[name + "Z"] = val[2];
				case "translate":
				case "scale":
				case "rotate":
					result[name + "X"] = val[0];
					if (typeof val[1] === "undefined") {
						(name === "scale") && (result[name + "Y"] = val[0]);
					} else {
						result[name + "Y"] = val[1];
					}
					break;
				default:
					result[name] = +val.join("");
					break;
			}
		}
		return result;
	}

	function interpolation(parsedProperty, width, height, styleTransform) {
		var name =parsedProperty[0];
		var options = [];
		// var transform = "";

		// prepare %
		if(/translate/.test(name)) {
			var m = name.match(/translate([XYZ])/);
			if(m && m.length > 1) {
				switch(m[1]) {
					case "X" : options.push({ size : width}); break;
					case "Y" : options.push({ size : height}); break;
					case "Z" : options.push({ size : 0}); break;
				}
			} else { // translate of traslate3d
				options = [ { size : width}, {size: height} ];
				/3d/.test(name) && options.push({size : 0});
			}
		}
		// prepare relative position
		if(styleTransform !== "none") {

		}

		parsedProperty[1].forEach(function(v,i,a) {
			a[i] = unifyUnit(v, options[i]);
		});
		return parsedProperty;
	}

	//  [ "translate3d" , [ "10", "20", "3px"] ]
	function parseProperty(property) {
		var m = property.match(/(\b\w+?)\((\s*[^\)]+)/),
			name, value, result = ["",""];
		if(m && m.length > 2) {
			name = m[1];
			value = m[2].split(",");
			value.forEach(function(v,i,a) {
				a[i] = v.trim();
			});
			result = [ name.trim(), value ];
		}
		return result;
	}

	// unify unit (%, relative value)
	function unifyUnit(text, option) {
		var useInitVal = 0,
			val = text.replace(/px|deg/, ""),
			opt = {
				baseVal : 0,
				size : 0
			};
		$.extend(opt, option);
		useInitVal = /\+=/.test(val) ? 1 : ( /\-=/.test(val) ? -1 : useInitVal);

		(useInitVal !== 0) && (val = val.substring(2));
		/%$/.test(val) && (val = parseFloat(val,10) / 100 * opt.size);

		val = parseFloat(val,10);
		val = useInitVal > 0 ? opt.baseVal + val : ( useInitVal < 0 ? opt.baseVal - val : val);
		return val;
	}


	function toMatrix3d(property) {
		var name = property[0];
		var val = property[1];
		if("matrix3d" === name) { return property; }
		// matrix(a, b, c, d, tx, ty) is a shorthand for matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1)
		return [
			name+"3d", [ val[0], val[1], "0", "0", val[2], val[3], "0","0","0","0","1","0",val[4],val[5],"0","1" ]
		];
	}


	function toMatrix(transform) {
		if (CSSMatrix) {

		} else {
			// @@ todo matrix 지원 안되는 경우 처리
		}
		return parseProperty(new CSSMatrix(transform).toString());
	}

	$.fx.step.transform = function(fx) {
		var elem = fx.elem;
		fx.$el = fx.$el || $(elem);
		fx._rateFn = fx._rateFn || rateFn(parse(elem, fx.start), parse(elem, fx.end));
		fx.$el.css("transform", fx._rateFn(fx.pos));
	};
	return {
		parse : parse,
		parseProperty : parseProperty,
		unifyUnit : unifyUnit,
		rateFn : rateFn
	};
})(jQuery, window);