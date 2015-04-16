var __transform = (function($, global) {
	"use strict";
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
			if( typeof result[p] === "undefined") {
				result[p] = styleTransform[p];
			}
		}
		result = data2String(result);
		return result;
	}

	// @return function
	function rateFn(element, startTf, endTf) {
		console.info("parsing...: " , startTf, "->", endTf);
		var $el = $(element),
			needToConvert = /%/.test(startTf) || /%/.test(endTf),
			width = needToConvert ? $el.width() : 0,
			height = needToConvert ? $el.height() : 0,
			styleTransform = unMatrix(toMatrix($el.css("transform"))),
			start = parse(startTf, width, height, styleTransform),
			end = parse(endTf, width, height, styleTransform);
		// console.error(start, "->");
		// console.error(end);
		start = toMatrix(start);
		end = toMatrix(end);
		if (/3d|Z|perspective/.test(startTf + endTf) || start[0] !== end[0]) {
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
		var name, unit,html = [];
		if(Array.isArray(property)) {
			name = property[0];
			unit = /translate/.test(name) ? "px" : (/rotate/.test(name) ? "deg" : "");
			return name + "(" + property[1].join(unit + ",") + unit + ")";
		} else {
			for(name in property) {
				unit = /translate/.test(name) ? "px" : (/rotate/.test(name) ? "deg" : "");
				html.push(name + "(" +  property[name] + unit + ")");
			}
			return html.join(" ");
		}
	}

	// Object {translateZ: 0, translateX: 20, translateY: 15, rotate: 0, perspective: 10}
	function divideTransform(parsedProperties) {
		var result = {};
		for(var i=0, p, name, val; p = parsedProperties[i]; i++) {
			val = p[1];
			switch(name = p[0]) {
				case "translate3d":
					name = name.replace(/3d$/, "");
					result[name + "Z"] = val[2];
				case "translate":
				case "scale":
					result[name + "X"] = val[0];
					if (typeof val[1] === "undefined") {
						(name === "scale") && (result[name + "Y"] = val[0]);
					} else {
						result[name + "Y"] = val[1];
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
			value.forEach(function(v,i,a) {
				a[i] = v.trim();
			});
			result = [ name.trim(), value ];
		}
		return result;
	}

	function interpolation(parsedProperty, width, height, styleTransform) {
		width = width || 0;
		height = height || 0;
		var name =parsedProperty[0];
		var options = [];
		var opt = {};

		// prepare % and relative position (translate)
		if(/translate/.test(name)) {
			var m = name.match(/translate([XYZ])/);
			if(m && m.length > 1) {
				switch(m[1]) {
					case "X" : opt.size=width; break;
					case "Y" : opt.size=height; break;
					case "Z" : opt.size=0; break;
				}
				styleTransform  && (opt.baseVal = styleTransform[name] || 0);
				options.push(opt);
			} else { // translate of traslate3d
				options = [ { size : width}, {size: height}, {size: 0} ];
				if(styleTransform) {
					options[0].baseVal = styleTransform["translateX"] || 0;
					options[1].baseVal = styleTransform["translateY"] || 0;
					options[2].baseVal = styleTransform["translateZ"] || 0;
				}
			}
		} else if(styleTransform && /scale[^Z3]|rotate[^XYZ3]/.test(name)) {
			// prepare relative position (scale, scaleX, scaleY, rotate)
			opt.baseVal = styleTransform[name];
		}
		parsedProperty[1].forEach(function(v,i,a) {
			a[i] = computeValue(v, options[i]);
		});
		return parsedProperty;
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
		} else if(/matrix/.test(transform)) {
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
		if(/matrix3d/.test(matrix[0])) {
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
			// @todo 3d일 경우, rotate 반환값 찾기???
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
				scaleZ : parseFloat(sz.toFixed(10)),
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
		// console.log(fx._rateFn(fx.pos));
		fx.$el.css("transform", fx._rateFn(fx.pos));
	};

	return {
		parse : parse,
		parseStyle : parseStyle,
		computeValue : computeValue,
		rateFn : rateFn,
		toMatrix : toMatrix,
		unMatrix : unMatrix,
		toMatrix3d : toMatrix3d,
		divideTransform : divideTransform,
		interpolation : interpolation
	};
	// @testcode parse,parseStyle,computeValue,rateFn,toMatrix,unMatrix,toMatrix3d,divideTransform,interpolation
})(jQuery, window);

__transform;
// https://gist.github.com/fwextensions/2052247