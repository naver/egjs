eg.module("animate", ["jQuery", window], function($, global) {
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
