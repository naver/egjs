/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

QUnit.config.reorder = false;

module("Absolute animate Test", {
	beforeEach : function() {
		this.egAnimate = eg.invoke("transform",[jQuery,window]);
		this.$el1 = $("#box1");
		this.$el2 = $("#box2");
	},
	afterEach : function() {
		this.$el1.css("transform", "none");
		this.$el2.css("transform", "none");
	}
});

var ABSOLUTE_CASE = [
	{title : "rotate(45deg)", css : "rotate(45deg)", transform: "rotate(45deg)"},
	{title : "skewX(30deg) skewY(10deg)", css : "skewX(30deg) skewY(10deg)", transform: "skewX(30deg) skewY(10deg)"},
	{title : "translate(100px, 10px)", css : "translate(100px, 10px)", transform: "translate(100px, 10px)"},
	{title : "matrix(.5, .433, -.5, 1.033, 50, -10)", css : "matrix(.5, .433, -.5, 1.033, 50, -10)", transform: "matrix(.5, .433, -.5, 1.033, 50, -10)"},
	{title : "rotate(45deg) translate(38px)", css : "rotate(45deg) translate(38px)", transform: "rotate(45deg) translate(38px)"},
	{title : "multiplex transform: rotate & translate & skew & scale & matrix", css : "rotate(45deg) translateY(-68px) skewX(-30deg) scale(1.2) matrix(.5, .433, -.5, 1.033, 50, -10)", transform: "rotate(45deg) translateY(-68px) skewX(-30deg) scale(1.2) matrix(.5, .433, -.5, 1.033, 50, -10)"},
	{title : "translate(50%, 100%)", css : "translate(60px, 120px)", transform: "translate(50%, 100%)"},
	{title : "translate(20, 100%)", css : "translate(20px, 120px)", transform: "translate(20, 100%)"},
	{title : "translate(25%, 100px)", css : "translate(30px, 100px)", transform: "translate(25%, 100px)"}
];

$.each(ABSOLUTE_CASE, function(i, val) {
	//Given
	//ABSOLUTE_CASE

	test(val.title, function(assert) {
		var done = assert.async(),
			self = this;

		//When
		this.$el1
			.css("transform", val.css);

		this.$el2
			.animate({"transform" : val.transform}, function() {
				//Then
				var expected = self.egAnimate.toMatrix(self.$el1.css("transform")),
					actual = self.egAnimate.toMatrix(self.$el2.css("transform"));

				// Ignore very tiny difference.
				// Because output matrixes can be different with input matrixes.)
				$.each(expected[1], function(i) {
					expected[1][i] = parseFloat(expected[1][i]).toFixed(3);
					actual[1][i] = parseFloat(actual[1][i]).toFixed(3);
				});

				equal(actual[1].toString(), expected[1].toString());
				// setTimeout(function() {
				done();
				// }, 1000);

			});
	});
});

/**
 * On PhantomJS, 'Relative animate Test' case cannot be tested.
 * Because jQuery cannot get a start matrix which is latest position.
 *
 */
if ( navigator.userAgent.indexOf("PhantomJS") == -1 ) {
	module("Relative animate Test", {
		beforeEach : function() {
			this.egAnimate = eg.invoke("transform",[jQuery,window]);
		},
		afterEach : function() {
		}
	});

	var RELATIVE_CASE = [
		{title : "+=translate(100px, 0)", css : "translate(100px, 0px)", transform: "+=translate(100px, 0)"},
		{title : "+=translate(0, 100px)", css : "translate(100px, 100px)", transform: "+=translate(0, 100px)"},
		{title : "+=translate(100, 100)", css : "translate(200px, 200px)", transform: "+=translate(100, 100)"},
		{title : "+=scale(2) translate(-100, -100)", css : "scale(2) translate(0px, 0px)", transform: "+=scale(2) translate(-100, -100)"},
		{title : "+=scale(0.5) rotate(30deg)", css : "rotate(30deg)", transform: "+=scale(0.5) rotate(30deg)"},
		{title : "+=rotate(-30deg) translate(10px, 50%)", css : "translate(10px, 60px)", transform: "+=rotate(-30deg) translate(10px, 50%)"}
	];

	$.each( RELATIVE_CASE, function(i, val) {
		//Given
		var $el1 = $("#box1"),
			$el2 = $("#box2");

		var initialTransform = "none";
		$el1.css("transform", initialTransform);
		$el2.css("transform", initialTransform);

		//RELATIVE_CASE
		test(val.title, function(assert) {
			var done = assert.async(),
				self = this;

			//When
			$el1
				.css("transform", val.css);

			$el2
				.animate({"transform" : val.transform},
					function() {
						//Then
						var expected = self.egAnimate.toMatrix($el1.css("transform")),
						 	result = self.egAnimate.toMatrix($el2.css("transform"));

						// Ignore very tiny difference.
						// Because output matrixes can be different with input matrixes.)
						$.each(expected[1], function(i) {
							expected[1][i] = parseFloat(parseFloat(expected[1][i]).toFixed(3));
							result[1][i] = parseFloat(parseFloat(result[1][i]).toFixed(3));
						});

						equal(result[1].toString(), expected[1].toString());
						//setTimeout(function() {
							done();
						//}, 500);
					}
				);
		});
	});
}

if (navigator.userAgent.indexOf("WebKit") >= 0 || navigator.userAgent.indexOf("Firefox") >= 0) {
	module("3d animate Test", {
		beforeEach : function() {
			this.egAnimate = eg.invoke("transform",[jQuery,window]);
		},
		afterEach : function() {
		}
	});

	var ANI_3D_CASE = [
		{title : "translateX(-100px)", css : "translateX(-100px)", transform: "translateX(-100px)"},
		{title : "translateY(-50%)", css : "translateY(-60px)", transform: "translateY(-50%)"},
		{title : "translateZ(100px)", css : "translateZ(100px)", transform: "translateZ(100px)"},
		{title : "translate3d(10px, 10%, 0)", css : "translate3d(10px, 12px, 0)", transform: "translate3d(10px, 10%, 0)"},
		{title : "scaleX(2)", css : "scaleX(2)", transform: "scaleX(2)"},
		{title : "scaleY(0.5)", css : "scaleY(0.5)", transform: "scaleY(0.5)"},
		{title : "scaleZ(1)", css : "scaleZ(1)", transform: "scaleZ(1)"},
		{title : "scale3d(2, 0.5, 1)", css : "scale3d(2, 0.5, 1)", transform: "scale3d(2, 0.5, 1)"},
		{title : "rotateX(-90deg)", css : "rotateX(-90deg)", transform: "rotateX(-90deg)"},
		{title : "rotateY(180deg)", css : "rotateY(180deg)", transform: "rotateY(180deg)"},
		{title : "rotateZ(360deg)", css : "rotateZ(360deg)", transform: "rotateZ(360deg)"},
		{title : "rotate3d(1, -1, 1, 180deg)", css : "rotate3d(1, -1, 1, 180deg)", transform: "rotate3d(1, -1, 1, 180deg)"},
		{title : "scaleX(0.5) scaleY(2) rotate3d(0, 0, 1, 45deg)", css : "scaleX(0.5) scaleY(2) rotate3d(0, 0, 1, 45deg)", transform: "scaleX(0.5) scaleY(2) rotate3d(0, 0, 1, 45deg)"},
		{title : "translate3d(100px, 100px, 100px)", css : "translate3d(100px, 100px, 100px)", transform: "translate3d(100px, 100px, 100px)"}
	];

	/**
	 * On PhantomJS, 'Relative animate Test' case cannot be tested.
	 * Because jQuery cannot get a start matrix which is latest position.
	 *
	 */
	if (navigator.userAgent.indexOf("PhantomJS") == -1) {
		ANI_3D_CASE.push({title : "+=translate(0px, 100px)", css : "translate3d(100px, 200px, 100px)", transform: "+=translate(0px, 100px)"});
		ANI_3D_CASE.push({title : "translate3d(100%, 200px, 0)", css : "translate3d(120px, 200px, 0)", transform: "translate3d(100%, 200px, 0)"});
		ANI_3D_CASE.push({title : "translate3d(0, 0, 0)", css : "translate3d(0px, 0px, 0px)", transform: "translate3d(0, 0, 0)"});
		ANI_3D_CASE.push({title : "+=scale(2) translate3d(-100, -100, 100)", css : "scale(2) translate3d(-100px, -100px, 100px)", transform: "+=scale(2) translate3d(-100, -100, 100)"});
	}

	$.each( ANI_3D_CASE, function(i, val) {
		//Given
		var $el1 = $("#box1"),
			$el2 = $("#box2");

		$el1.css("transform", "none");
		$el2.css("transform", "none");

		//RELATIVE_CASE
		test(val.title, function(assert) {
			var done = assert.async(),
				self = this;

			//When
			$el1
				.css( "transform", val.css );

			$el2
				.animate({"transform" : val.transform},
					function() {
						//Then
						var t1 = self.egAnimate.toMatrix($el1.css("transform")),
						 	t2 = self.egAnimate.toMatrix($el2.css("transform"));

						if (t1[1].length < t2[1].length) {
							t1 = self.egAnimate.toMatrix3d(t1);
						} else if (t1[1].length > t2[1].length) {
							t2 = self.egAnimate.toMatrix3d(t2);
						}

						// Ignore very tiny difference.
						// Because output matrixes can be different with input matrixes.)
						$.each(t1[1], function(i) {
							t1[1][i] = parseFloat(t1[1][i]).toFixed(3);
							t2[1][i] = parseFloat(t2[1][i]).toFixed(3);
						});

						equal(t1[1].toString(), t2[1].toString());
						done();
					}
				);
		});
	});

	// test("Unintended 2d converting is prevented", function(assert) {
	// 	var transformString = "translate3d(0, 0, 0)",
	// 		done = assert.async(),
	// 		$el1, $el2, convertedStyle;

	// 	//Given
	// 	$el1 = $("#box1"),
	// 	$el2 = $("#box2");
	// 	$el1.css("transform", transformString);// This code is needless but matches style of other test.($el1, $el2 pair matching)

	// 	//When
	// 	$el2.animate({"transform": transformString}, function() {
	// 		//Then
	// 		debugger;
	// 		convertedStyle = $("#box2")[0].style.cssText;
	// 		ok(convertedStyle.indexOf("matrix3d") >= 0);
	// 		done();
	// 	});
	// });
}

