module("transform Test", {
	setup : function() {
	},
	teardown : function() {
	}
});

test("parseStyle", function() {
	// Given
	var propertyStr = {
		"translate3d(10,20,3px)" : [ "translate3d" , [ "10", "20", "3px"] ],
		"translate(10,20)" : [ "translate" , [ "10", "20"] ],
		"translate(10px,20%)" : [ "translate" , [ "10px", "20%"] ],
		"translateX(10)" : [ "translateX" , ["10"] ],
		"translateX(+=10)"  : [ "translateX" , ["+=10"] ],
		"translateY(10px)"  : [ "translateY" , ["10px"] ],
		"translateY(-=10px)"  : [ "translateY" , ["-=10px"] ],
		"translateZ(10%)"  : [ "translateZ" , ["10%"] ],
		"translateZ(+=10%)"  : [ "translateZ" , ["+=10%"] ],
		"translateZ(-=10%)"  :  [ "translateZ" , ["-=10%"] ],
		"matrix(1, 0, 0, 1, 0, 20)"  :  [ "matrix" , [ "1", "0", "0", "1", "0", "20" ] ],
		"rotateX(0deg)" : [ "rotateX" , ["0deg"] ],
		"perspective( 10 )" : [ "perspective" , ["10"] ],
		"matrix3d(1, 0, 0, 1, 0, 20, 10, 1, 0, 0, 0, 1, 0, 1, 0, 1)" :[ "matrix3d" , [ "1", "0", "0", "1", "0", "20", "10", "1", "0", "0", "0", "1", "0", "1", "0", "1" ] ],
	};

	//When
	for( var p in propertyStr) {
		// Then
		deepEqual(__transform.parseStyle(p), propertyStr[p], p);
	};
});


test("computeValue" , function() {
	//Given
	var baseVal = 20,
		size = 50,
		value;

	// When
	value = {
		"+=10px" : "30",
		"+=10%" : "25",
		"-=10" : "10",
		"-=10%" : "15",
		"+=+10px" : "30",
		"+=+10%" : "25",
		"-=-10px" : "30",
		"-=-10%" : "25",
		"+=-10px" : "10",
		"+=-10%" : "15",
		"-=+10" : "10",
		"-=+10%" : "15",
		"10" : "10",
		"10%" : "5",
		"+10px" : "10",
		"-10px" : "-10",
		"10%" : "5",
		"-10%" : "-5",
		"+=10deg" : "30",
		"-=10" : "10",
		"+=+10deg" : "30",
		"-=-10deg" : "30",
		"+=-10deg" : "10",
		"-=+10" : "10",
		"10deg" : "10",
		"10px" : "10",	// px인 경우 단위 무시.
		"+10deg" : "10",
		"-10deg" : "-10"
	};

	// Then
	for( var p in value) {
		// Then
		equal(__transform.computeValue(p, {
			size : size,
			baseVal : baseVal
		}), value[p], p);
	}
});

test("toMatrix" , function() {
	// Given
	// When
	var value = {
		"none" : ["matrix", [ "1", "0","0","1","0","0"] ],
		"translate3d(20px,29px,0px)" : ["matrix", [ "1.000000", "0.000000", "0.000000", "1.000000", "20.000000", "29.000000"] ],
		"matrix(1.000000, 0.000000, 0.000000, 1.000000, 20.000000, 29.000000)" : ["matrix", [ "1.000000", "0.000000", "0.000000", "1.000000", "20.000000", "29.000000"] ]
	};
	// When
	// Then
	for( var p in value) {
		// Then
		deepEqual(__transform.toMatrix(p), value[p], p);
	}
});

test("toMatrix3d" , function() {
	// Given
	// When
	var value = [
		{
			input : ["matrix", [ "1", "0","0","1","0","0"] ],
			output : ["matrix3d", [ "1", "0", "0", "0", "0", "1", "0","0","0","0","1","0","0","0","0","1" ] ]
		},
		{
			input : ["matrix3d", [ "1", "0", "0", "0", "0", "1", "0","0","0","0","1","0","0","0","0","1" ] ],
			output : ["matrix3d", [ "1", "0", "0", "0", "0", "1", "0","0","0","0","1","0","0","0","0","1" ] ]
		},
		{
			input : ["matrix", [ "1.000000", "0.000000", "0.000000", "1.000000", "20.000000", "29.000000"] ],
			output : ["matrix3d", [ "1.000000", "0.000000", "0", "0", "0.000000", "1.000000", "0","0","0","0","1","0","20.000000","29.000000","0","1" ] ]
		},
	];
	// When
	// Then
	value.forEach(function(v) {
		// Then
		deepEqual(__transform.toMatrix3d(v.input), v.output, v.input);
	});
});


test("unMatrix" , function() {
	// Given
	var matrix,
		$box = $("#box");

	// When
	var value = [
		{
			// when translateZ is zero. use 2d-matrix
			input : "translateZ(0px) translateX(150px) translateY(0px) rotate(10deg)",
			output : {
				"translateX" : 150,
				"translateY" : 0,
				"scaleX" : 1,
				"scaleY" : 1,
				"rotate" : 10
			}
		},
		{
			// when translateZ is zero. use 2d-matrix
			input : "translateY(120px) translateX(150px) translateY(0px) rotate(20deg) scaleX(2.32)",
			output : {
				"translateX" : 150,
				"translateY" : 120,
				"scaleX" : 2.32,
				"scaleY" : 1,
				"rotate" : 20
			}
		},
		{
			// when translateZ is zero. use 2d-matrix
			input : "translate(150px,120px) translateY(0px) rotate(20deg) scaleX(2) scaleY(4.2)",
			output : {
				"translateX" : 150,
				"translateY" : 120,
				"scaleX" : 2,
				"scaleY" : 4.2,
				"rotate" : 20
			}
		},
		{
			input : "translate3d(100px,200px,30px) rotate(40deg) scaleX(2) scaleY(4.2) scaleZ(10)",
			output : {
				"translateX" : 100,
				"translateY" : 200,
				"translateZ" : 30,
				"scaleX" : 2,
				"scaleY" : 4.2,
				"scaleZ" : 10,
				"rotate" : 40
			}
		}
	];
	// Then
	value.forEach(function(v) {
		// When
		$box.css("transform", v.input);
		// Then
		deepEqual(__transform.unMatrix(__transform.parseStyle($box.css("transform"))), v.output, v.input);
	});
});


test("parse", function() {
	// Given
	var width = 100;
	var height = 200;
	var propertyStr = {
		//2d
		"translate(150px,120px) rotate(20deg) scale(2)" : {
			currentStyle : {rotate: 0, scaleX: 1, scaleY: 1, translateX: 0, translateY: 0},
			output : "translateY(120px) translateX(150px) scaleY(2) scaleX(2) rotate(20deg)"
		},

		//2d
		"translate(150px,120px) rotate(20deg) scale(2,4.2)" : {
			currentStyle : {rotate: 0, scaleX: 1, scaleY: 1, translateX: 0, translateY: 0},
			output : "translateY(120px) translateX(150px) scaleY(4.2) scaleX(2) rotate(20deg)"
		},
		// 2d
		"translate(100%,50%) rotate(+=20deg) scaleX(1.2) scaleY(4.2)" : {
			currentStyle : {rotate: 20, scaleX: 1, scaleY: 1, translateX: 0, translateY: 0},
			output : "translateY(100px) translateX(100px) scaleY(4.2) scaleX(1.2) rotate(40deg)"
		},
		// 2d
		"translate(100%,50%) rotate(+=20deg)" : {
			currentStyle : {rotate: 20, scaleX: 1, scaleY: 1, translateX: 0, translateY: 0},
			output : "translateY(100px) translateX(100px) scaleY(1) scaleX(1) rotate(40deg)"
		},
		// 2d
		"translate(+=100%,-=50%) rotate(-=20deg)" : {
			currentStyle : {rotate: 20, scaleX: 1, scaleY: 1, translateX: 200, translateY: 0},
			output : "translateY(-100px) translateX(300px) scaleY(1) scaleX(1) rotate(0deg)"
		},

		// 3d
		"translateZ(0px) rotate(20deg) scaleX(2) scaleY(4.2)" : {
			currentStyle : {rotate: 0, scaleX: 1, scaleY: 1,scaleZ: 1, translateX: 0, translateY: 0, translateZ: 0 },
			output : "translateZ(0px) translateY(0px) translateX(0px) scaleZ(1) scaleY(4.2) scaleX(2) rotate(20deg)"
		},

		// 3d
		"translateZ(0px) rotate(20deg) scaleZ(1)" : {
			currentStyle : {rotate: 0, scaleX: 1, scaleY: 1,scaleZ: 1, translateX: 0, translateY: 0, translateZ: 0 },
			output : "translateZ(0px) translateY(0px) translateX(0px) scaleZ(1) scaleY(1) scaleX(1) rotate(20deg)"
		},

		// 3d
		"translate3d(150px,+=10%,-=20px) rotate(+=20deg) scale3d(+=2, 4.2, -=-1)" : {
			currentStyle : {rotate: 30, scaleX: 2, scaleY: 1,scaleZ: 2, translateX: 0, translateY: 120, translateZ: 10 },
			output : "translateZ(-10px) translateY(140px) translateX(150px) scaleZ(3) scaleY(4.2) scaleX(4) rotate(50deg)"
		},

		// 3d
		"translate3d(150px,+=10%,-=20px) rotate(+=20deg) scale(+=2, 4.2)" : {
			currentStyle : {rotate: 30, scaleX: 2, scaleY: 1,scaleZ: 2, translateX: 0, translateY: 120, translateZ: 10 },
			output : "translateZ(-10px) translateY(140px) translateX(150px) scaleZ(2) scaleY(4.2) scaleX(4) rotate(50deg)"
		},

		// 3d
		"translate3d(150px,+=10%,-=20px) rotate(+=20deg) scale(2)" : {
			currentStyle : {rotate: 30, scaleX: 2, scaleY: 1,scaleZ: 2, translateX: 0, translateY: 120, translateZ: 10 },
			output : "translateZ(-10px) translateY(140px) translateX(150px) scaleZ(2) scaleY(2) scaleX(2) rotate(50deg)"
		},

		// 3d
		"rotate(20deg) scaleZ(1)" : {
			currentStyle : {rotate: 0, scaleX: 1, scaleY: 1,scaleZ: 1, translateX: 0, translateY: 0, translateZ: 0 },
			output : "translateZ(0px) translateY(0px) translateX(0px) scaleZ(1) scaleY(1) scaleX(1) rotate(20deg)"
		},

		// matrix
		"matrix(1.000000, 0.000000, 0.000000, 1.000000, 20.000000, 29.000000)" : {
			currentStyle : {rotate: 0, scaleX: 1, scaleY: 1, translateX: 0, translateY: 0},
			output : "matrix(1.000000, 0.000000, 0.000000, 1.000000, 20.000000, 29.000000)"
		},

		// matrix-3d
		"matrix3d(1, 0, 0, 1, 0, 20, 10, 1, 0, 0, 0, 1, 0, 1, 0, 1)" : {
			currentStyle : {rotate: 0, scaleX: 1, scaleY: 1, translateX: 0, translateY: 0},
			output : "matrix3d(1, 0, 0, 1, 0, 20, 10, 1, 0, 0, 0, 1, 0, 1, 0, 1)"
		}
	};

	//When
	for( var p in propertyStr) {
		// Then
		deepEqual(__transform.parse(p, width, height, propertyStr[p].currentStyle), propertyStr[p].output, p);
	};
});