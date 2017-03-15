/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

// Agent mockup
var ua = {
	android: {
		navigator: {
			userAgent: "Mozilla/5.0 (Linux; U; Android 2.1; en-us; Nexus One Build/ERD62) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17"
		}
	},
	android4: {
		navigator: {
			userAgent: "Mozilla/5.0 (Linux; U; Android 4.0.4; nl-nl; GT-N8010 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30"
		}
	},
	ios: {
		navigator: {
			userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1"
		}
	}
};

module("rotate", {
	setup: function() {
		this.agent = eg.agent;
		this.fakeDocument = {
			"documentElement": {
				"clientWidth": 100,
				"clientHeight": 200
			}
		};

		this.fakeWindow = ua.android;
		this.clock = sinon.useFakeTimers(Date.now());

	},
	teardown: function() {
		eg.agent = this.agent;
		this.clock.restore();
	}
});

test("orientationChange : android && 2.1 ", function() {
	// Given
	var method = eg.invoke("rotate", [jQuery, null, this.fakeWindow, this.fakeDocument]);

	// When
	$(this.fakeDocument).on("rotate", $.noop);

	// Then
	equal(method.orientationChange(), "resize");
});

test("orientationChange : The window has onorientationchange", function() {
	// Given
	var fakeWindow = $.extend({
		"onorientationchange": "onorientationchange"
	}, ua.ios);

	var method = eg.invoke("rotate", [jQuery, null, fakeWindow, this.fakeDocument]);

	// When
	$(this.fakeDocument).on("rotate", $.noop);

	// Then
	equal(method.orientationChange(), "orientationchange");
});

test("orientationChange : The window not has onorientationchange", function() {
	// Given
	var fakeWindow = $.extend({
		"resize": "resize"
	}, ua.ios);

	var method = eg.invoke("rotate", [jQuery, null, fakeWindow, this.fakeDocument]);

	// When
	$(this.fakeDocument).on("rotate", $.noop);

	// Then
	equal(method.orientationChange(), "resize");
});

test("isVertical : If event is resize then first time call.", function() {
	// Given
	var fakeWindow = $.extend({
		"resize": "resize"
	}, ua.android);

	var fakeDocument = {
		"documentElement": {
			"clientWidth": 100,
			"clientHeight": 200
		}
	};
	var method = eg.invoke("rotate", [jQuery, null, fakeWindow, fakeDocument]);

	// When
	// Then
	ok(method.isVertical());
});

test("isVertical : If event is resize then sencond times call. and rotate vertical.", function() {
	// Given
	var fakeWindow = $.extend({
		"resize": "resize"
	}, ua.android);

	var fakeDocument = {
		"documentElement": {
			"clientWidth": 200,
			"clientHeight": 100
		}
	};
	var method = eg.invoke("rotate", [jQuery, null, fakeWindow, fakeDocument]);
	method.isVertical();

	// When
	fakeDocument.documentElement.clientWidth =  100;
	fakeDocument.documentElement.clientHeight =  200;
	var isVertical = method.isVertical();

	// Then
	ok(isVertical);
});

test("isVertical : If event is resize then sencond times call. and stay.", function() {
	// Given
	var fakeWindow = $.extend({
		"resize": "resize"
	}, ua.android);

	var fakeDocument = {
		"documentElement": {
			"clientWidth": 100,
			"clientHeight": 200
		}
	};
	var method = eg.invoke("rotate", [jQuery, null, fakeWindow, fakeDocument]);
	method.isVertical();

	// When
	fakeDocument.documentElement.clientWidth =  100;
	fakeDocument.documentElement.clientHeight =  200;
	var isVertical = method.isVertical();

	// Then
	equal(isVertical, true);
});

test("isVertical : If event is resize then sencond times call. and rotate horizontal.", function() {
	// Given
	var fakeWindow = $.extend({
		"resize": "resize"
	}, ua.android);

	var fakeDocument = {
		"documentElement": {
			"clientWidth": 100,
			"clientHeight": 200
		}
	};
	var method = eg.invoke("rotate", [jQuery, null, fakeWindow, fakeDocument]);
	method.isVertical();

	// When
	fakeDocument.documentElement.clientWidth =  200;
	fakeDocument.documentElement.clientHeight =  100;
	var isNotVertical =  !method.isVertical();

	// Then
	ok(isNotVertical);
});

test("isVertical : If event is orientationchange then vertical. (orientation:0,180)", function() {
	// Given
	var fakeWindow = $.extend({
		"onorientationchange": "onorientationchange",
		"orientation": 0
	}, ua.android);

	var method = eg.invoke("rotate", [jQuery, null, fakeWindow, this.fakeDocument]);

	// When
	var isVertical =  method.isVertical();

	// Then
	ok(isVertical);

	// When
	fakeWindow.orientation = 180;
	isVertical =  method.isVertical();

	// Then
	ok(isVertical);
});

test("isVertical : If event is orientationchange then horizontal. (orientation:90,-90)", function() {
	// Given
	var fakeWindow = $.extend({
		"onorientationchange": "onorientationchange",
		"orientation": 90
	}, ua.ios);

	var method = eg.invoke("rotate", [jQuery, null, fakeWindow, this.fakeDocument]);

	// When
	var isNotVertical =  !method.isVertical();

	// Then
	ok(isNotVertical);

	// When
	fakeWindow.orientation = -90;
	isNotVertical =  !method.isVertical();

	// Then
	ok(isNotVertical);
});

module("rotate: handler", {
	setup: function() {
		this.clock = sinon.useFakeTimers(Date.now());

		this.fakeWindow = $.extend({
			"onorientationchange": "onorientationchange",
			"orientation": 0,
			"setTimeout": setTimeout,
			"clearTimeout": clearTimeout
		}, ua.ios);

		this.fakeDocument = {
			"documentElement": {
				"clientWidth": 200,
				"clientHeight": 100
			}
		};

	},
	teardown: function() {
		$.extend(this.fakeWindow, ua.ios);
		this.clock.restore();
	}
});

test("Check info object when rotate event fire.", function() {
	// Given
	var method = eg.invoke("rotate", [jQuery, null, this.fakeWindow, this.fakeDocument]);
	var isVertical;
	var isVertical2;
	var isCall = false;
	eg.isPortrait();
	$(this.fakeWindow).on("rotate", function(e, info) {
		isCall = true;
		isVertical = e.isVertical;
		isVertical2 = info.isVertical;
	});

	// When
	this.fakeWindow.orientation =  90;

	method.handler({
		type: "orientationchange"
	});
	this.clock.tick(310);

	// Then
	ok(isCall);
	ok(typeof isVertical === "boolean");
	ok(typeof isVertical2 === "boolean");

});

test("If event is orientationchange then trigger and not android.", function() {
	// Given
	var method = eg.invoke("rotate", [jQuery, null, this.fakeWindow, this.fakeDocument]);
	var isCall = false;
	var isVertical = eg.isPortrait();
	$(this.fakeWindow).on("rotate", function(e) {
		isCall = true;
		isVertical = e.isVertical;
	});

	// When
	method.handler({
		type: "orientationchange"
	});
	this.clock.tick(310);

	// Then
	ok(isVertical);

	// When
	this.fakeWindow.orientation =  90;

	method.handler({
		type: "orientationchange"
	});
	this.clock.tick(310);

	// Then
	ok(isCall);
	ok(!isVertical);
});

test("If event is orientationchange then trigger and android.", function() {
	// Given
	var isCall = false;
	var isVertical = false;

	$.extend(this.fakeWindow, ua.android4);

	var method = eg.invoke("rotate", [jQuery, null, this.fakeWindow, this.fakeDocument]);

	$(this.fakeWindow).on("rotate", function(e) {
		isCall = true;
		isVertical = e.isVertical;
	});

	// When
	var checkFail = method.handler({
		type: "orientationchange"
	});

	// Then
	deepEqual(checkFail, false);
	equal(isCall, false);
	equal(isVertical, false);

	// Given
	this.fakeDocument.documentElement.clientWidth =  100;
	this.fakeDocument.documentElement.clientHeight =  200;
	this.fakeWindow.orientation =  90;

	// When
	this.clock.tick(510);
	checkFail = method.handler({
		type: "orientationchange"
	});
	this.clock.tick(310);

	// Then
	ok(isCall);
	equal(isVertical, false);

});

test("If event is resize then trigger.", function() {
	// Given
	var isCall = false;
	var isVertical = false;

	$.extend(this.fakeWindow, ua.android);

	delete this.fakeWindow.onorientationchange;
	this.fakeWindow.resize = "resize";

	var method = eg.invoke("rotate", [jQuery, null, this.fakeWindow, this.fakeDocument]);
	$(this.fakeWindow).on("rotate", function(e) {
		isCall = true;
		isVertical = e.isVertical;
	});

	this.fakeDocument.documentElement.clientWidth =  100;
	this.fakeDocument.documentElement.clientHeight =  200;

	// When
	method.handler({
		type: "resize"
	});
	this.clock.tick(10);

	// Then
	ok(isCall);
	ok(isVertical);

	// When
	this.fakeDocument.documentElement.clientWidth =  200;
	this.fakeDocument.documentElement.clientHeight =  100;

	method.handler({
		type: "resize"
	});
	this.clock.tick(10);

	// Then
	ok(isCall);
	ok(!isVertical);
});

test("test using isPortrait first", function() {
	// Given
	eg.invoke("rotate", []);

	// When
	var val = eg.isPortrait();

	// Then
	equal(typeof val, "boolean");
});

test("If eg.isPortrait() affect the rotate event not to be fired.", function() {
	// Given
	var isCall = false;
	var isVertical1 = false;
	var isVertical2 = false;
	// Note: Please check this 'agent' variable is actually used.
	var agent = eg.agent();
	agent = {
		os: "android",
		version: "2.1"
	};

	delete this.fakeWindow.onorientationchange;
	this.fakeWindow.resize = "resize";

	this.fakeDocument.documentElement.clientWidth =  200;
	this.fakeDocument.documentElement.clientHeight =  100;

	var method = eg.invoke("rotate", [jQuery, null, this.fakeWindow, this.fakeDocument]);
	$(this.fakeWindow).on("rotate", function(e) {
		isCall = true;
		isVertical2 = e.isVertical;
	});

	// When
	this.fakeDocument.documentElement.clientWidth =  100;
	this.fakeDocument.documentElement.clientHeight =  200;

	// isVertical() should not affect isVertical2.
	isVertical1 = method.isVertical();

	method.handler({
		type: "resize"
	});
	this.clock.tick(10);

	// Then
	ok(isCall, "rotate event is fired by resize");
	ok(isVertical1, "Does isVertical return true?");
	ok(isVertical2, "Does rotate event handler get vertical?");

	// When
	isCall = false;
	agent = {
		os: "android",
		version: "4.3"
	};
	this.fakeWindow.onorientationchange = $.noop;
	this.fakeWindow.orientation = 90;

	method = eg.invoke("rotate", [jQuery, null, this.fakeWindow, this.fakeDocument]);
	$(this.fakeWindow).on("rotate", function(e) {
		isCall = true;
		isVertical2 = e.isVertical;
	});

	// isVertical() should not affect isVertical2.
	isVertical1 = method.isVertical();
	method.handler({
		type: "orientationchange"
	});

	this.clock.tick(500);

	// Then
	ok(isCall, "rotate event is fired by onorientationchange");
	ok(!isVertical1, "Does isVertical return false?");
	ok(!isVertical2, "Does rotate event handler get horizontal?");
});

test("orientationChange : mac(PC) ", function() {
	// Given
	$.extend(this.fakeWindow, {
		navigator: {
			userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18"
		}
	});

	var method = eg.invoke("rotate", [jQuery, null, this.fakeWindow, this.fakeDocument]);

	// When
	// Then
	equal(method, null, "Invocation of rotate in mac Browser returns null");

	//Given
	// Given
	$.extend(this.fakeWindow, {
		navigator: {
			userAgent: "Mozilla/5.0 (Windows NT 6.1; WOW64; APCPMS=^N20120502090046254556C65BBCE3E22DEE3F_28573^; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; InfoPath.3; TCO_20161104143520; rv:11.0) like Gecko"
		}
	});

	method = eg.invoke("rotate", [jQuery, null, this.fakeWindow, this.fakeDocument]);

	// When
	// Then
	equal(method, null, "Invocation of rotate in windows Browser returns null");
});
