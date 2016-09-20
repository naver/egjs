/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

/**
 * A method that extends the <a href=http://api.jquery.com/animate/>.animate()</a> method provided by jQuery. With this method, you can use the transform property and 3D acceleration
 * @ko jQuery의<a href=http://api.jquery.com/animate/>animate() 메서드</a>를 확장한 메서드. CSS의 transform 속성과 3D 가속을 사용할 수 있다.
 * @name jQuery#animate
 * @method
 * @param {Object} properties An object composed of the CSS property and value which will be applied to an animation<ko>애니메이션을 적용할 CSS 속성과 값으로 구성된 객체</ko>
 * @param {Number|String} [duration=4000] Duration of the animation (unit: ms)<ko>애니메이션 진행 시간(단위: ms)</ko>
 * @param {String} [easing="swing"] The easing function to apply to an animation<ko>애니메이션에 적용할 easing 함수</ko>
 * @param {Function} [complete] A function that is called once the animation is complete.<ko>애니메이션을 완료한 다음 호출할 함수</ko>
 *
 * @example
 * $("#box")
 * 		.animate({"transform" : "translate3d(150px, 100px, 0px) rotate(20deg) scaleX(1)"} , 3000)
 * 		.animate({"transform" : "+=translate3d(150px, 10%, -20px) rotate(20deg) scale3d(2, 4.2, 1)"} , 3000);
 * @see {@link http://api.jquery.com/animate/}
 *
 * @support {"ie": "10+", "ch" : "latest", "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
 */
eg.module("transform", ["jQuery", window], function($) {
	"use strict";

	/**
	 * Get a 'px' converted value if it has a %.
	 * Otherwise it returns value appened with 'px'.
	 */
	function getConverted(val, base) {
		var ret = val;
		var num = val.match(/((-|\+)*[0-9]+)%/);

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
		var m = val.match(/((-|\+)*[\d|\.]+)(px|deg|rad)*/);
		if (m && m.length >= 1) {
			return {"num": parseFloat(m[1]), "unit": m[3]};
		}
	}

	function getTransformGenerateFunction(transform) {
		var splitted = transform.split(")");
		var list = [];

		//Make parsed transform list.
		for (var i = 0, len = splitted.length - 1; i < len; i++) {
			var parsed = parseStyle(splitted[i]);

			parsed[1] = $.map(parsed[1], toParsedFloat);
			list.push(parsed);
		}

		return function transformByPos(pos) {
			var transform = "";
			var defaultVal = 0;

			$.each(list, function(i) {
				if (list[i][0].indexOf("scale") >= 0) {
					defaultVal = 1;
				} else {
					defaultVal = 0;
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
		var basePos;

		// Convert translate unit to 'px'.
		endTf = correctUnit(endTf,
					parseFloat($.css(element, "width")) || 0,
					parseFloat($.css(element, "height")) || 0);

		if (isRelative) {
			start = (!startTf || startTf === "none") ?
						"matrix(1, 0, 0, 1, 0, 0)" : startTf;
			end = getTransformGenerateFunction(endTf);
		} else {
			start = toMatrixArray(startTf);
			basePos = toMatrixArray("none");//transform base-position

			//If the type of matrix is not equal, then match to matrix3d
			if (start[1].length < basePos[1].length) {
				start = toMatrix3d(start);
			} else if (start[1].length > basePos[1].length) {
				basePos = toMatrix3d(basePos);
			}

			end = getTransformGenerateFunction(endTf);
		}

		return function(pos) {
			var result = [];
			var ret = "";//matrix for interpolated value from current to base(1, 0, 0, 1, 0, 0)

			if (isRelative) {
				// This means a muliply between a matrix and a transform.
				return start + end(pos);
			}

			if (pos === 1) {
				ret = data2String(basePos);
			} else {
				for (var i = 0, s, e, l = start[1].length; i < l; i++) {
					s = parseFloat(start[1][i]);
					e = parseFloat(basePos[1][i]);

					result.push(s + (e - s) * pos);
				}

				ret = data2String([start[0], result]);
			}

			return ret + end(pos);
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

	/**
	 * Convert matrix string to array type.
	 *
	 * eg. matrix(1, 0, 0, 1, 0, 0) ==>  ["matrix", [1, 0, 0, 1, 0, 0]]
	 * matrix3d(1,0,0,0,0,1,-2.44929e-16,0,0,2.44929e-16,1,0,0,0,0,1)
	 */
	function toMatrixArray(matrixStr) {
		var matched;

		if (!matrixStr || matrixStr === "none") {
			return ["matrix", [ "1", "0", "0", "1", "0", "0"] ];
		}

		matrixStr = matrixStr.replace(/\s/g, "");
		matched = matrixStr.match(/(matrix)(3d)*\((.*)\)/);

		return [matched[1] + (matched[2] || ""), matched[3].split(",")];
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
		toMatrix: toMatrixArray,
		toMatrix3d: toMatrix3d
	};
});
