module("extend Test", {
	setup : function() {
	},
	teardown : function() {
	}
});

test("isHardwareAccelerable", function() {
	var result = $.naver.isHardwareAccelerable();
	if(result) {
		$.naver.defaults.isHardwareAccelerable = function(agent) {
			return -1;
		};
	} else {
		$.naver.defaults.isHardwareAccelerable = function(agent) {
			return 1;
		};
	}
	equal(!result, $.naver.isHardwareAccelerable(), "change default value");
	$.naver.defaults.isHardwareAccelerable  = function(agent) {
		return 0;
	};
	equal(result, $.naver.isHardwareAccelerable(), "restore default value");
	delete $.naver.defaults.isHardwareAccelerable;
	equal(result, $.naver.isHardwareAccelerable(), "delete default value");
});