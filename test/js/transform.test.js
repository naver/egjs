module("transform Test", {
	setup : function() {

	},
	teardown : function() {
	}
});

test("parse transform types", function() {
	// Given
	var TYPE = __transform.TYPE;
	var propertyStr = {
		"translate3d(10,20,3px)" : TYPE.MULTI_3D,
		"translate(10,20)" : TYPE.MULTI_2D,
		"translate(10px,20%)" : TYPE.MULTI_2D,
		"translateX(10)" : TYPE.UNIT,
		"translateX(+=10)"  : TYPE.UNIT,
		"translateY(10px)"  : TYPE.UNIT,
		"translateY(-=10px)"  : TYPE.UNIT,
		"translateZ(10%)"  : TYPE.UNIT,
		"translateZ(+=10%)"  : TYPE.UNIT,
		"translateZ(-=10%)"  : TYPE.UNIT,
		"matrix(1, 0, 0, 1, 0, 20)"  : TYPE.MATRIX_2D,
		"rotateX(0deg)" : TYPE.UNIT,
		"perspective( 10 )" : TYPE.UNIT,
		"matrix3d(1, 0, 0, 1, 0, 20, 10, 1, 0, 0, 0, 1, 0, 1, 0, 1)" : TYPE.MATRIX_3D
	};

	//When
	for( var p in propertyStr) {
		// Then
		equal(__transform.parseType(p), propertyStr[p], p);
	};
});


test("parse transform parseProperties", function() {
	// Given
	var propertyStr = {
		"translate3d(10,20,3px)" : [ "translate3d" , [ "10", "20", "3px"] ],
		"translate(10,20)" : [ "translate" , [ "10", "20"] ],
		"translate(10px,20%)" : [ "translate" , [ "10px", "20%"] ],
		"translateX(10)" : [ "translateX" , "10" ],
		"translateX(+=10)"  : [ "translateX" , "+=10" ],
		"translateY(10px)"  : [ "translateY" , "10px" ],
		"translateY(-=10px)"  : [ "translateY" , "-=10px" ],
		"translateZ(10%)"  : [ "translateZ" , "10%" ],
		"translateZ(+=10%)"  : [ "translateZ" , "+=10%" ],
		"translateZ(-=10%)"  :  [ "translateZ" , "-=10%" ],
		"matrix(1, 0, 0, 1, 0, 20)"  :  [ "matrix" , [ "1", "0", "0", "1", "0", "20" ] ],
		"rotateX(0deg)" : [ "rotateX" , "0deg" ],
		"perspective( 10 )" : [ "perspective" , "10" ],
		"matrix3d(1, 0, 0, 1, 0, 20, 10, 1, 0, 0, 0, 1, 0, 1, 0, 1)" :[ "matrix3d" , [ "1", "0", "0", "1", "0", "20", "10", "1", "0", "0", "0", "1", "0", "1", "0", "1" ] ],
	};

	//When
	for( var p in propertyStr) {
		// Then
		deepEqual(__transform.parseProperty(p), propertyStr[p], p);
	};
});


// test("---", function() {
// 	// When
// 	transformStr = "translate3d(1,2,3) rotateX(0deg)";
// 	// // Then
// 	__transform.parse(transformStr);

// 	transformStr = "matrix(1, 0, 0, 1, 0, 20) translate(0%,10px) rotateX(0deg)";
// 	__transform.parse(transformStr);

// 	// transformStr = "translate3d(0,0,0) rotateX(0deg) matrix(1, 0, 0, 1, 0, 20)";
// 	// __transform.parse(transformStr);

// 	transformStr = "translateY(0) translateX(0) translateZ(20)";
// 	__transform.parse(transformStr);


// 	// transformStr = "matrix(1, 0, 0, 1, 0, 20) translate3d(0,+=10,0) rotateX(+=10deg)";
// 	// __transform.parse(transformStr);

// 	// transformStr = "translate3d(0,+=10,0) rotateX(+=10deg)";
// 	// __transform.parse(transformStr);

// 	//
// 	// Then
// 	ok("eg" in window, "namespace is window.eg");
// });