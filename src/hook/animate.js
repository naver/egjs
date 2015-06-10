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
     *
     * @example
     * $("#box")
     * 		.animate({"transform" : "translate3d(150px,100px,0px) rotate(20deg) scaleX(1)"} , 3000)
     * 		.animate({"transform" : "+=translate3d(150px,10%,-20px) rotate(20deg) scale3d(2, 4.2, 1)"} , 3000);
     * @see {@link http://api.jquery.com/animate/}
     */
var div = document.createElement("div"),
		divStyle = div.style,
		suffix = "Transform",
		testProperties = [
			"O" + suffix,
			"ms" + suffix,
			"Webkit" + suffix,
			"Moz" + suffix
		],
		i = testProperties.length,
		supportProperty,
		supportFloat32Array = "Float32Array" in window,
		CSSMatrix = global.WebKitCSSMatrix || global.MSCSSMatrix || global.OCSSMatrix || global.MozMatrix || global.CSSMatrix;

	//test different vendor prefixes of these properties
	while ( i-- ) {
		if ( testProperties[i] in divStyle ) {
			$.support["transform"] = supportProperty = testProperties[i];
			$.support["transformOrigin"] = supportProperty + "Origin";
			continue;
		}
	}

	/*
	 * Utility functions
	 */
	// turns a transform string into its "matrix(A,B,C,D,X,Y)" form (as an array, though)
	function _matrix( transform ) {
		transform = transform.split(")");
		var trim = $.trim,
			i = -1,
			// last element of the array is an empty string, get rid of it
			l = transform.length -1,
			split, prop, val,
			prev = supportFloat32Array ? new Float32Array(6) : [],
			curr = supportFloat32Array ? new Float32Array(6) : [],
			rslt = supportFloat32Array ? new Float32Array(6) : [1,0,0,1,0,0];

		prev[0] = prev[3] = rslt[0] = rslt[3] = 1;
		prev[1] = prev[2] = prev[4] = prev[5] = 0;

		// Loop through the transform properties, parse and multiply them
		while ( ++i < l ) {
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
					curr[3] = val.length>1 ? val[1] : val[0];
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
			parseInt(value,10) * (Math.PI * 2 / 360):
			~value.indexOf("grad") ?
				parseInt(value,10) * (Math.PI/200):
				parseFloat(value);
	}

	// Multiply matrix (For the use of First Edition)
	// function _multiplyMatrices(prev, curr) {
	//     var rslt = [];

	// 	for (var i = 0, len = prev.length; i < len; i++) {
	// 		prev[i] = parseFloat(prev[i]);
	// 		curr[i] = parseFloat(curr[i]);
	// 	}

	// 	rslt[0] = prev[0] * curr[0] + prev[2] * curr[1];
	// 	rslt[1] = prev[1] * curr[0] + prev[3] * curr[1];
	// 	rslt[2] = prev[0] * curr[2] + prev[2] * curr[3];
	// 	rslt[3] = prev[1] * curr[2] + prev[3] * curr[3];
	// 	rslt[4] = prev[0] * curr[4] + prev[2] * curr[5] + prev[4];
	// 	rslt[5] = prev[1] * curr[4] + prev[3] * curr[5] + prev[5];

	//     return rslt;
	// }

	/**
	 * Get a 'px' converted value if it has a %.
	 * Otherwise it returns value appened with 'px'.
	 */
	function _getConverted( val, base ) {
		var ret = val,
			num = val.match(/([0-9]*)%/);

		if ( num && num.length >= 1 ) {
			ret = base * ( parseFloat( num[1] ) / 100 ) + "px";
		} else if ( val.indexOf( "px" ) === -1 ){
			ret = val + "px";
		}

		return ret;
	}

	function _correctUnit(transform, width, height) {
		var m, ret = "",
			arr = transform.split(")");

		for (var i = 0, len = arr.length - 1; i < len; i++) {
			var name = arr[i];

			// '%' is only meaningful on translate.
			if( (m = name.match(/(translate([XYZ]|3d)?|rotate)\(([^)]*)/)) && m.length > 1 ) {
				if ( m[1] === "rotate" ) {
					if ( m[3].indexOf( "deg" ) === -1 ) {
						name = m[1] + "(" + m[3] + "deg";
					}
				} else {
					switch ( m[2] ) {
					case "X":
						name = m[1] + "(" + _getConverted( m[3], width );
						break;
					case "Y":
						name = m[1] + "(" +  _getConverted( m[3], height );
						break;
					case "Z":
						//Meaningless. Do nothing
						break;
					default://2d, 3d
						var nums = m[3].split( "," ),
							bases = [width, height, 100];

						for (var k = 0, l = nums.length; k < l; k++ ) {
							nums[k] = _getConverted( nums[k], bases[k] );
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

	function _getTransformFunction(transform) {
		var splitted = transform.split(")"),
			list = [], unit = [];

		function toFloat(val) {
			var m = val.match(/(-*[\d|\.]+)(px|deg|rad)*/);
			if ( m && m.length >= 1 ) {
				m[2] && (unit[i] = m[2]);
				return parseFloat(m[1]);
			}
		}

		for ( var i = 0, len = splitted.length - 1; i < len; i++) {
			var parsed = _parseStyle( splitted[i] );
			parsed[1] = $.map(parsed[1], toFloat);
			list.push(parsed);
		}

		//
		return function transformByPos(pos) {
			var transform = "", defaultVal = 0;

			$.each( list, function(i) {
				if ( list[i][0] === "scale" ) {
					defaultVal = 1;
				}

				var valStr = $.map(list[i][1], function(value) {
					defaultVal === 1 && (value = value - 1);
					return ( defaultVal + value * pos ) + ( unit[i] || "" );
				}).join(",");

				transform += list[i][0] + "(" + valStr + ") ";
			});

			return transform;
		};
	}

	function rateFn(element, startTf, endTf) {
		var $el = $(element),
			isRelative = endTf.indexOf( "+=" ) >= 0,
			start, end;

		// Convert translate unit to 'px'.
		endTf = _correctUnit(endTf, $el.width(), $el.height());

		// // Matrix converting (First Edition)
		// start = _toMatrix(startTf);
		// end = _toMatrix(endTf);

		// // Relative Position Calculate
		// if ( isRelative ) {
		// 	end[1] = _multiplyMatrices(start[1], end[1]);
		// }

		// Second Edition
		if ( isRelative ) {
			start = (!startTf || startTf === "none") ? "matrix(1, 0, 0, 1, 0, 0)" : startTf;
			end = _getTransformFunction(endTf);
		} else {
			start = _toMatrix(startTf);
			end = _toMatrix(endTf);

			//If the type of matrix is not equal, then match to matrix3d
			if (start[1].length < end[1].length) {
				start = _toMatrix3d(start);
			} else if (start[1].length > end[1].length) {
				end = _toMatrix3d(end);
			}
		}

		return function(pos) {
			var result = [], ret = "";

			if ( isRelative ) {
				// This means a muliply between a matrix and a transform.
				return start + end( pos );
			}

			if(pos === 1) {
				ret = _data2String(end);
			} else {
				for(var i = 0, s, e, l = start[1].length; i < l; i++) {
					s = parseFloat( start[1][i] );
					e = parseFloat( end[1][i] );
					result.push( s + ( e- s ) * pos );
				}

				ret = _data2String([ start[0], result ]);	
			}

			return ret;
		};
	}

	/**
	 * ["translate", [100, 0]] --> translate(100px, 0)
	 * {translate : [100, 0]} --> translate(100px, 0)
	 * {matrix : [1, 0, 1, 0, 100, 0]} --> matrix(1, 0, 1, 0, 100, 0)
	 */
	function _data2String(property) {
		var name,tmp = [];
		if(Array.isArray(property)) {
			name = property[0];
			return name + "(" + property[1].join(_unit(name) + ",") + _unit(name) + ")";
		} else {
			for(name in property) {
				property.hasOwnProperty(name) && tmp.push(name);
			}

			return tmp.map(function(v) {
				return v + "(" +  property[v] + _unit(v) + ")";
			}).join(" ");
		}
	}

	function _unit(name) {
		return /translate/.test(name) ? "px" : (/rotate/.test(name) ? "deg" : "");
	}

	// [ "translate" , [ "10", "20"] ]
	function _parseStyle(property) {
		var m = property.match(/(\b\w+?)\((\s*[^\)]+)/),
			name, value, result = ["",""];

		if(m && m.length > 2) {
			name = m[1];
			value = m[2].split(",");
			value = $.map(value, function(v) {
				return $.trim(v);
			});
			result = [ $.trim(name), value ];
		}
		return result;
	}

	function _toMatrix(transform) {
		if( !transform || transform === "none" ) {
			return ["matrix" , [ "1", "0","0","1","0","0"] ];
		}

		return CSSMatrix ? _parseStyle(new CSSMatrix(transform).toString()) : ["matrix", _matrix(transform)];
	}

	function _toMatrix3d(matrix) {
		var name = matrix[0],
			val = matrix[1];
		
		if("matrix3d" === name) { 
			return matrix; 
		}
		// matrix(a, b, c, d, tx, ty) is a shorthand for matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1)
		return [
			name+"3d", [ val[0], val[1], "0", "0", val[2], val[3], "0","0","0","0","1","0",val[4],val[5],"0","1" ]
		];
	}

	$.fx.step.transform = function(fx) {
		var elem = fx.elem;
		fx.$el = fx.$el || $(elem);
		fx._rateFn = fx._rateFn || rateFn(elem, fx.start, fx.end);
		fx.$el.css(supportProperty, fx._rateFn(fx.pos));
	};

	// All of this interfaces are functions for unit testing.
	return {
		toMatrix : _toMatrix,
		toMatrix3d : _toMatrix3d
	};
});
