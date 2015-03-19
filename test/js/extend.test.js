module("extend Test", {
	setup : function() {
	},
	teardown : function() {
		eg.defaults = {};
	}
});

test("check namespace", function() {
	// Given
	// When
	// Then
	ok("eg" in window, "namespace is window.eg");
});

test("determine the return value of a 'isHardwareAccelerable' function", function() {
	// Given
	var result = eg.isHardwareAccelerable();
	var controllValue = result;
	// When
	eg.defaults.isHardwareAccelerable = function(agent) {
		return !controllValue;
	};
	// Then
	notEqual(result, eg.isHardwareAccelerable(), "change default value");
});

test("pass the return value of a 'isHardwareAccelerable' function", function() {
	var result;
	// Given
	result = eg.isHardwareAccelerable();
	// When
	eg.defaults.isHardwareAccelerable = function(agent) {
		return null;
	};
	// Then
	equal(result, eg.isHardwareAccelerable(), "pass default value");

	// Given
	result = eg.isHardwareAccelerable();
	// When
	eg.defaults.isHardwareAccelerable = function(agent) {
		// undefined
	};
	// Then
	equal(result, eg.isHardwareAccelerable(), "pass default value");
});

test("remove 'defaults' function", function() {
	// Given
	var result = eg.isHardwareAccelerable();
	var controllValue = result;
	eg.defaults.isHardwareAccelerable = function(agent) {
		return !controllValue;
	};
	// When
	delete eg.defaults.isHardwareAccelerable;
	// Then
	equal(result, eg.isHardwareAccelerable(), "pass default value");
});

//@todo multi agent test