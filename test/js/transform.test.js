module("transform Test", {
	setup : function() {

	},
	teardown : function() {
	}
});

test("parse transform properties", function() {
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
		deepEqual(__transform.parseProperty(p), propertyStr[p], p);
	};
});

// test("convert Value properties", function() {
// 	// Given
// 	var propertyStr = {
// 		"translate3d(10,20,3px)" : [ "translate3d" , [ "10", "20", "3px"] ],
// 		"translate(10,20)" : [ "translate" , [ "10", "20"] ],
// 		"translate(10px,20%)" : [ "translate" , [ "10px", "20%"] ],
// 		"translateX(10)" : [ "translateX" , ["10"] ],
// 		"translateX(+=10)"  : [ "translateX" , ["+=10"] ],
// 		"translateY(10px)"  : [ "translateY" , ["10px"] ],
// 		"translateY(-=10px)"  : [ "translateY" , ["-=10px"] ],
// 		"translateZ(10%)"  : [ "translateZ" , ["10%"] ],
// 		"translateZ(+=10%)"  : [ "translateZ" , ["+=10%"] ],
// 		"translateZ(-=10%)"  :  [ "translateZ" , ["-=10%"] ],
// 		"matrix(1, 0, 0, 1, 0, 20)"  :  [ "matrix" , [ "1", "0", "0", "1", "0", "20" ] ],
// 		"rotateX(0deg)" : [ "rotateX" , ["0deg"] ],
// 		"perspective( 10 )" : [ "perspective" , ["10"] ],
// 		"matrix3d(1, 0, 0, 1, 0, 20, 10, 1, 0, 0, 0, 1, 0, 1, 0, 1)" :[ "matrix3d" , [ "1", "0", "0", "1", "0", "20", "10", "1", "0", "0", "0", "1", "0", "1", "0", "1" ] ],
// 	};

// 	//When
// 	for( var p in propertyStr) {
// 		// Then
// 		deepEqual(__transform.parseProperty(p), propertyStr[p], p);
// 	};
// });


test("parse ", function() {
	ok(true, "---");
	var fn = __transform.rateFn(__transform.parse("#box", $("#box").css("transform")),
		__transform.parse("#box", "translate3d(20px, +=30%, 0) rotateX(40deg) perspective( 10 ) scale(1)"));
	console.log("1",fn(0.5));


	console.log(fn(1));
});



// test("unifyUnit" , function() {
// 	//Given
// 	var baseVal = 20,
// 		size = 50,
// 		unitStr;

// 	// When
// 	unitStr = {
// 		"+=10px" : "30px",
// 		"+=10%" : "25px",
// 		"-=10" : "10px",
// 		"-=10%" : "15px",
// 		"+=+10px" : "30px",
// 		"+=+10%" : "25px",
// 		"-=-10px" : "30px",
// 		"-=-10%" : "25px",
// 		"+=-10px" : "10px",
// 		"+=-10%" : "15px",
// 		"-=+10" : "10px",
// 		"-=+10%" : "15px",
// 		"10px" : "10px",
// 		"10" : "10px",
// 		"10%" : "5px",
// 		"+10px" : "10px",
// 		"-10px" : "-10px",
// 		"10%" : "5px",
// 		"-10%" : "-5px"
// 	};

// 	// Then
// 	for( var p in unitStr) {
// 		// Then
// 		equal(__transform.unifyUnit(p, "px", {
// 			size : size,
// 			baseVal : baseVal
// 		}), unitStr[p], p);
// 	}

// 	// When
// 	unitStr = {
// 		"+=10deg" : "30deg",
// 		"+=10%" : "30deg",	// %인 경우 단위 무시.
// 		"-=10" : "10deg",
// 		"+=+10deg" : "30deg",
// 		"-=-10deg" : "30deg",
// 		"+=-10deg" : "10deg",
// 		"-=+10" : "10deg",
// 		"10deg" : "10deg",
// 		"10px" : "10deg",	// px인 경우 단위 무시.
// 		"10%" : "10deg",	// %인 경우 단위 무시.
// 		"+10deg" : "10deg",
// 		"-10deg" : "-10deg"
// 	};

// 	// Then
// 	for( var p in unitStr) {
// 		equal(__transform.unifyUnit(p, "deg", {
// 			size : size,
// 			baseVal : baseVal
// 		}), unitStr[p], p);
// 	}


// 	// When
// 	unitStr = {
// 		"+=10" : "30",
// 		"+=10%" : "30",	// %인 경우 단위 무시.
// 		"-=10" : "10",
// 		"+=+10" : "30",
// 		"-=-10" : "30",
// 		"+=-10" : "10",
// 		"-=+10" : "10",
// 		"10deg" : "10",	// deg인 경우 단위 무시.
// 		"10px" : "10",	// px인 경우 단위 무시.
// 		"10%" : "10",	// %인 경우 단위 무시.
// 		"+10" : "10",
// 		"-10" : "-10"
// 	};

// 	// Then
// 	for( var p in unitStr) {
// 		equal(__transform.unifyUnit(p, "", {
// 			size : size,
// 			baseVal : baseVal
// 		}), unitStr[p], p);
// 	}

// });


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