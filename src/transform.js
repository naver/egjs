

var __transform = (function($, global) {
	"use strict";

	var TYPE = {
		NONE : 0,
		UNIT : 1,
		MULTI_2D : 2,
		MULTI_3D : 3,
		MATRIX_2D : 4,
		MATRIX_3D : 5
	};

	function parse(transform) {
		var transform = property.match(/\w+\([^)]+\)/g);
		var result = [];

		for(var i=0, v, m, type; v=transform[i]; i++) {

		}
	}

	function parseType(type) {
		var result = TYPE.NONE;
		if(/matrix/.test(type)) {
			result = /3d/.test(type) ? TYPE.MATRIX_3D :  TYPE.MATRIX_2D;
		} else if(/perspective|[XYZ]/.test(type) ) {
			result = TYPE.UNIT;
		} else {
			result = /3d/.test(type) ? TYPE.MULTI_3D :  TYPE.MULTI_2D;
		}
		return result;
	}

	function parseProperty(property) {
		var m = property.match(/\b(\w+?)\(/),
			name, result = "";
		if(m && m.length > 1) {
			name = m[1];
			// console.log(name, parseType(name));
			switch(parseType(name)) {
				case TYPE.UNIT :
				case TYPE.MULTI_2D :
				case TYPE.MULTI_3D :
					m = property.match(/\(\s*([^,\)]+)((,)?\s*[^,\)]+\s*)+/);
					// var a = [];
					// for(var i=0, l = m.length; i<l ; i++) {
					// 	a.push[m[i]];
					// }
					// console.log(a);

					// m && m.length >1 && (result = [ type, m[1].trim() ]);
				break;
				case TYPE.MATRIX_2D :  break;
				case TYPE.MATRIX_3D :  break;
			}
		}
		return result;
	};


			// if(/translate|(3d)\(/.test(v)) {
			// 	m=v.match( /\b(translate(3d)?)\(\s*([^,]+)\s*,\s*([^,\)]+)\s*(,\s*([^,\)]+)\s*)?\)/ );
			// 	console.log(m);
			// }
			// if(/translate[XYZ]\(/.test(v)) {
			// 	m=v.match(/\b(translate([XY]))\(\s*([^\)]+)/ );
			// 	console.info(m);
			// }
			// if(/rotate[XYZ]/.test) {

			// }
			// if(/scale[XYZ]/.test) {

			// }



			// v = v.replace( /\b(translate(3d)?)\(\s*([^,]+)\s*,\s*([^,\)]+)\s*(,\s*([^,\)]+)\s*)?\)/g, function(_1_, prop, is3d, x, y, _2_, z) {
			// 	console.log(arguments);
			// 	return prop + "(" + x +"," + y + "," + z + ")";
			// })
			// .replace(/\b(translate([XY]))\(\s*([^\)]+)/g, function(_1_, prop, type, val) {
			// 	console.log(arguments);
			// 	return key + '(' + val;
			// });
			// console.warn("after", type);

	$.fx.step.transform = function(fx) {
		var elem = fx.elem,
			start = fx.start,
			end = fx.end,
			pos = fx.pos;
		console.log(elem, "s-",start, "e-",end);
		parseTransform(end);
	};
	return {
		parse : parse,
		parseType : parseType,
		parseProperty : parseProperty,
		TYPE : TYPE
	};
})(jQuery, window);


	// /**
	// 	Effect 컴퍼넌트의 기능을 사용 할 수 없는 시작값과 종료값을 가진 Effect 객체를 동작 할 수 있게 만들어 주는 함수

	// 	var my = jindo.m.Effect.linear();

	// 	my.start = 'scale3d(2, 1.5, 1) translate(100px, 30px) rotate(10deg)';
	// 	my.end = 'translateX(300px)';

	// 	var func = ..._getTransformFunction(my);
	// 	func(0.5); // 'scaleX(2) scaleY(1.5) scaleZ(1) translateX(200px) translateY(30px) rotate(10deg)'
	// **/
	// _getTransformFunction : function(sDepa, sDest, fEffect, elBox) {

	// 	var sKey;

	// 	var oDepa, oDest;

	// 	// matrix transform 이 바뀌는거면
	// 	if (/matrix/.test(sDepa + sDest)) {

	// 		// 둘다 matric 객체로 변환
	// 		oDepa = this._getMatrixObj(sDepa, elBox);
	// 		oDest = this._getMatrixObj(sDest, elBox);

	// 		// 종류가 다르면 범용적으로 맞출 수 있는 matrix3d 로 변환
	// 		if (oDepa.key !== oDest.key) {
	// 			oDepa = this._convertMatrix3d(oDepa);
	// 			oDest = this._convertMatrix3d(oDest);
	// 		}

	// 		fEffect = fEffect(oDepa.val, oDest.val);

	// 		return function(nRate) {
	// 			return nRate === 1 ? sDest : oDepa.key + '(' + fEffect(nRate).replace(/ /g, ',') + ')';
	// 		};

	// 	}

	// 	// 시작값과 종료값을 각각 파싱
	// 	oDepa = this._parseTransformText(sDepa);
	// 	oDest = this._parseTransformText(sDest);

	// 	var oProp = {};

	// 	// 시작값에 있는 내용으로 속성들 셋팅
	// 	for (sKey in oDepa) if (oDepa.hasOwnProperty(sKey)) {
	// 		// 시작값, 종료값 셋팅 (만약 종료값이 지정되어 있지 않으면 1 또는 0 셋팅)
	// 		oProp[sKey] = fEffect(oDepa[sKey], oDest[sKey] || (/^scale/.test(sKey) ? 1 : 0));
	// 	}

	// 	// 종료값에 있는 내용으로 속성들 셋팅
	// 	for (sKey in oDest) if (oDest.hasOwnProperty(sKey) && !(sKey in oDepa)) { // 이미 셋팅되어 있지 않는 경우에만
	// 		// 시작값, 종료값 셋팅 (만약 시작값이 지정되어 있지 않으면 1 또는 0 셋팅)
	// 		oProp[sKey] = fEffect(oDepa[sKey] || (/^scale/.test(sKey) ? 1 : 0), oDest[sKey]);
	// 	}

	// 	var fpFunc = function(nRate) {
	// 		var aRet = [];
	// 		for (var sKey in oProp) if (oProp.hasOwnProperty(sKey)) {
	// 			aRet.push(sKey + '(' + oProp[sKey](nRate)+ ')');
	// 		}
	// 		/*
	// 		aRet = aRet.sort(function(a, b) {
	// 			return a === b ? 0 : (a > b ? -1 : 1);
	// 		});
	// 		*/

	// 		return aRet.join(' ');
	// 	};

	// 	return fpFunc;

	// }