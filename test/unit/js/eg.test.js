/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

QUnit.module("extend Test", {
	setup : function() {
		this.isHWAccelerable = eg.isHWAccelerable;
		this.isTransitional = eg.isTransitional;
	},
	teardown : function() {
		eg.isHWAccelerable = this.isHWAccelerable;
		eg.isTransitional = this.isTransitional;
	}
});

QUnit.test("check namespace", function(assert) {
	// Given
	// When
	// Then
	assert.ok("eg" in window, "namespace is window.eg");
});

QUnit.test("determine the return value of a 'isHWAccelerable' function", function(assert) {
	// Given
	var result = eg.isHWAccelerable();

	var controllValue = result;
	eg.isHWAccelerable = this.isHWAccelerable;
	// When
	eg.hook.isHWAccelerable = function(defaultValue,agent) {
		return !controllValue;
	};
	// Then
	assert.notEqual(result, eg.isHWAccelerable(), "change default value");
});


QUnit.test("If 'isHWAccelerable' called then should be apply hook.", function(assert) {
	// Given
	var result = eg.isHWAccelerable();
	var controllValue = result;

	// When
	eg.hook.isHWAccelerable = function(defaultValue,agent) {
		return !controllValue;
	};

	// Then
	assert.notEqual(result, eg.isHWAccelerable(), "change default value");
});

QUnit.test("remove 'hook' function", function(assert) {
	// Given
	var result = eg.isHWAccelerable();
	var controllValue = result;
	eg.hook.isHWAccelerable = function(defaultValue, agent) {
		return !controllValue;
	};
	// When
	eg.hook.isHWAccelerable = null;
	// Then
	assert.equal(result, eg.isHWAccelerable(), "pass default value");
});

QUnit.test("translate function", function(assert) {
	// Given
	// When
	var x = "20px";
	var y = "300px";
	// Then
	assert.equal(eg.translate(x,y), "translate(20px,300px)", "When assert.HardwareAcceleration was undefined");
	assert.equal(eg.translate(x,y, false), "translate(20px,300px)", "When assert.HardwareAcceleration was false");
	assert.equal(eg.translate(x,y, true), "translate3d(20px,300px,0)", "When assert.HardwareAcceleration was true");
});

QUnit.module("extend Agent Test", {
	setup : function() {
		this.isHWAccelerable = eg.isHWAccelerable;
		this.isTransitional = eg.isTransitional;
		this._hasClickBug = eg._hasClickBug;
		this.fakeWindow = {
			navigator: {}
		};
		},
	teardown : function() {
		eg.isHWAccelerable = this.isHWAccelerable;
		eg.isTransitional = this.isTransitional;
		eg._hasClickBug = this._hasClickBug;
	}
});

$.each( ua, function( i, v ) {
	QUnit.test("isHWAccelerable Test : "+ v.device, function() {
		// Given
		this.fakeWindow.navigator.userAgent = v.ua;
		eg.invoke("eg",[null, null, this.fakeWindow]);
		// When
		var isHWAccelerable = eg.isHWAccelerable();
		//Then
		equal( isHWAccelerable, v.isHWAccelerable, "check return value : " + v.ua);
	});
});

$.each( ua, function( i, v ) {
	QUnit.test("isTransitional Test : "+ v.device, function() {
		// Given
		this.fakeWindow.navigator.userAgent = v.ua;
		eg.invoke("eg",[null, null, this.fakeWindow]);
		// When
		var isTransitional = eg.isTransitional();
		//Then
		equal(isTransitional, v.isTransitional, "check return value : " + v.ua);
	});
});

$.each( ua, function( i, v ) {
	QUnit.test("_hasClickBug Test : "+ v.device, function() {
		// Given
		this.fakeWindow.navigator.userAgent = v.ua;
		eg.invoke("eg",[null, null, this.fakeWindow]);
		// When
		var _hasClickBug = eg._hasClickBug();
		//Then
		equal(_hasClickBug, v._hasClickBug, "check return value : " + v.ua);
	});
});
