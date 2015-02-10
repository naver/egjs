module("extend Test", {
	setup : function() {
	},
	teardown : function() {
	}
});

test("default", function() {
	var result = jQuery.useCss3d();

	if(result) {
		jQuery.default.useCss3d = -1;
	} else {
		jQuery.default.useCss3d = 1;
	}
	equal(!result, jQuery.useCss3d(), "change default value");
	jQuery.default.useCss3d  = 0;
	equal(result, jQuery.useCss3d(), "restore default value");

	if(result) {
		jQuery.default.useCss3d = function() { return -1; };
	} else {
		jQuery.default.useCss3d = function() { return 1; };
	}
	equal(!result, jQuery.useCss3d(), "change default value");
	jQuery.default.useCss3d  = function() { return 0; };
	equal(result, jQuery.useCss3d(), "restore default value");
	delete jQuery.default.useCss3d;
	equal(result, jQuery.useCss3d(), "delete default value");
});