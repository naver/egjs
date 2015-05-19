module("movableCoord init Test", {
	setup : function() {
		this.inst = null;
	},
	teardown : function() {
		this.inst.destroy();
		this.inst = null;
	}
});

test("check a initialization position value", function() {
	// Given
	// When
	this.inst = new eg.MovableCoord( {
		min : [ -100, 0 ],
		max : [ 300, 400 ]
	});
	// Then
	deepEqual(this.inst._pos, [-100, 0], "set up an initialization position");
});

test("check initialization status", function() {
	// Given
	// When
	this.inst = new eg.MovableCoord( {
		bounce : [ 100, 200, 50, 30 ],
		margin : [ 0, 100, 0, 100 ],
		circular : [ true, false , true, false ]
	});
	// Then
	deepEqual(this.inst.options.bounce, [100, 200, 50, 30], "bounce : check css expression");
	deepEqual(this.inst.options.margin, [0, 100, 0, 100], "margin : check css expression");
	deepEqual(this.inst.options.circular, [true, false, true, false], "circular : check css expression");

	// When
	this.inst = new eg.MovableCoord( {
		bounce : [ 100, 200 ],
		margin : [ 0, 100 ],
		circular : [ true, false ]
	});
	// Then
	deepEqual(this.inst.options.bounce, [100, 200, 100, 200], "bounce : check css expression");
	deepEqual(this.inst.options.margin, [0, 100, 0, 100], "margin : check css expression");
	deepEqual(this.inst.options.circular, [true, false, true, false], "circular : check css expression");

	// When
	this.inst = new eg.MovableCoord( {
		bounce : 50,
		margin : 10,
		circular : false
	});
	// Then
	deepEqual(this.inst.options.bounce, [50, 50, 50, 50], "bounce : check css expression");
	deepEqual(this.inst.options.margin, [10, 10, 10, 10], "margin : check css expression");
	deepEqual(this.inst.options.circular, [false, false, false, false], "circular : check css expression");
});

module("movableCoord bind/unbind Test", {
	setup : function() {
		this.inst = new eg.MovableCoord( {
			min : [ 0, 0 ],
			max : [ 300, 400 ],
			bounce : 100,
			margin : 0,
			circular : false
		});
	},
	teardown : function() {
		this.inst.destroy();
		this.inst = null;
	}
});

test("bind", function() {
	// Given
	var $el = jQuery("#area");
	var before = $el.data(eg.MovableCoord.KEY);
	var beforeHammerCount = Object.keys(this.inst._hammers).length;

	// When
	this.inst.bind($el, {
		direction : eg.DIRECTION_ALL
	});

	// Then
	var key = $el.data(eg.MovableCoord.KEY);
	equal(before, undefined, "key data value is 'undefined'' before call bind method" );
	notEqual(key, undefined, "key data value is something after call bind method" );
	equal(beforeHammerCount+1, Object.keys(this.inst._hammers).length, "added hammer instance after call bind method" );
});

test("unbind", function() {
	// Given
	var $el = jQuery("#area");
	this.inst.bind($el, {
		direction : eg.DIRECTION_ALL
	});
	var before = $el.data(eg.MovableCoord.KEY);
	var beforeHammerCount = Object.keys(this.inst._hammers).length;

	// When
	this.inst.unbind($el);

	// Then
	var key = $el.data(eg.MovableCoord.KEY);
	notEqual(before, key, "key data value was changed after call 'unbind' method" );
	equal(key, undefined, "key data value is 'undefined'' after call bind method" );
	equal(beforeHammerCount-1, Object.keys(this.inst._hammers).length, "removed hammer instance after call bind method" );
});

test("one element, double bind", function() {
	// Given
	var $el = jQuery("#area");
	this.inst.bind($el, {
		direction : eg.DIRECTION_ALL
	});
	var beforeHammerCount = Object.keys(this.inst._hammers).length;
	var before = $el.data(eg.MovableCoord.KEY);
	var beforeHammerInstance = this.inst._hammers[before];

	// When
	this.inst.bind($el, {
		direction : eg.DIRECTION_HORIZONTAL
	});

	// Then
	var key = $el.data(eg.MovableCoord.KEY);
	equal(before, key, "key data value is same" );
	equal(this.inst._hammers[key].get("pan").options.direction, eg.DIRECTION_HORIZONTAL, "options was changed" );
	deepEqual(beforeHammerInstance, this.inst._hammers[key], "recycle hammer instance" );
	equal(beforeHammerCount, Object.keys(this.inst._hammers).length, "hammer instance count is same" );
});

module("movableCoord methods Test", {
	setup : function() {
		this.inst = new eg.MovableCoord( {
			min : [ 0, 0 ],
			max : [ 300, 400 ],
			bounce : 100,
			margin : 0,
			circular : false
		});
	},
	teardown : function() {
		this.inst.destroy();
		this.inst = null;
	}
});

test("get", function() {
	// Given
	// When
	var pos1 = this.inst.get();
	var pos2 = this.inst.get();
	// Then
	notStrictEqual(pos1, pos2, "postion references are not equal.");
	deepEqual(pos1, pos2, "postion values are equal.")
});

test("setTo", function() {
	// Given

	// When
	this.inst.setTo(0, 200);
	// Then
	deepEqual(this.inst.get(), [0, 200], "set to position 0,200");

	// When
	this.inst.setTo(-200, 500);
	// Then
	deepEqual(this.inst.get(), [0, 400], "if position parameters was out of range, set to position min or max values.");

	// When
	this.inst.setTo(600, -900);
	// Then
	deepEqual(this.inst.get(), [300, 0], "if position parameters was out of range, set to position min or max values.");
});


test("_isInEasing", function() {
	// Given
	var easing = [
		[ $.easing.easeInQuad, true ],
		[ $.easing.easeInOutCirc, false ],
		[ $.easing.easeInCubic, true ],
		[ $.easing.easeOutQuint, false ]
	];
	// When
	// Then
	easing.forEach(function(v) {
		equal(this.inst._isInEasing(v[0]), v[1], "determine if easing function is 'In' style");
	}, this);
});

asyncTest("setTo : check a 'change' event", function() {
	// Given
	this.inst.on("change", function(e) {
		// Then
		deepEqual(e.pos, [0, 200], "set to position 0,200");
		start();
	})
	// When
	this.inst.setTo(0, 200);
});

test("setBy", function() {
	// Given
	// When
	this.inst.setBy(20, 20);
	// Then
	deepEqual(this.inst.get(), [20, 20], "set to position 20,20 relatively");
	// When
	this.inst.setBy(-10, -10);
	// Then
	deepEqual(this.inst.get(), [10, 10], "set to position -10,-10 relatively");
	// When
	this.inst.setBy(-1000, -1000);
	// Then
	deepEqual(this.inst.get(), [0, 0], "if position parameters was out of range, set to position min or max values.");
	// When
	this.inst.setBy(1000, 1000);
	// Then
	deepEqual(this.inst.get(), [300, 400], "if position parameters was out of range, set to position min or max values.");
});

asyncTest("setBy : check a 'change' event", function() {
	// Given
	this.inst.setBy(20, 20);
	this.inst.on("change", function(e) {
		// Then
		deepEqual(e.pos, [10, 10], "set to position -10,-10 relatively");
		start();
	})
	// When
	this.inst.setBy(-10, -10);
});


module("movableCoord event Test", {
	setup : function() {
		this.inst = new eg.MovableCoord( {
			min : [ 0, 0 ],
			max : [ 300, 400 ],
			bounce : 100,
			margin : 0,
			circular : false
		});
	},
	teardown : function() {
		this.inst.destroy();
		this.inst = null;
	}
});

asyncTest("slow movement test (no-velocity)", function() {
	//Given
	var el = $("#area").get(0);
	var firedHold = false;
	var firedRelease = false;
	var firedAnimationEnd = false;

	this.inst.on( {
		"hold" : function(e) {
			firedHold = true;
			deepEqual(e.pos, [ 0, 0 ], "fire 'hold' event");
			equal(e.hammerEvent.isFirst, true, "'hold' event is first event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"change" : function(e) {
			equal(e.holding, true, "holding value was 'true' after animation event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"release" : function(e) {
			firedRelease = true;
			ok(true, "fire 'release' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animation" : function(e) {
			throws(
				function() {
				  throw "error"
				},
				"must not fired 'animation' event"
			);
		},
		"animationEnd" : function(e) {
			firedAnimationEnd = true;
			ok(true, "fire 'animationEnd' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		}
	});
	this.inst.bind(el);

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
            deltaX: 10,
            deltaY: 10,
            duration: 3000,
            easing: "linear"
	}, function() {
		// Then
		// for test custom event
		setTimeout(function() {
			ok(firedHold, "fired 'hold' event");
			ok(firedRelease, "fired 'release' event");
			ok(firedAnimationEnd, "fired 'animationEnd' event");
			start();
		},1000);
    	});
});

asyncTest("fast movement test (velocity)", function() {
	//Given
	var el = $("#area").get(0);
	var firedHold = false;
	var firedRelease = false;
	var firedAnimation = false;
	var firedAnimationEnd = false;

	this.inst.on( {
		"hold" : function(e) {
			firedHold = true;
			deepEqual(e.pos, [ 0, 0 ], "fire 'hold' event");
			equal(e.hammerEvent.isFirst, true, "'hold' event is first event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"change" : function(e) {
			if(firedAnimation) {
				equal(e.holding, false, "holding value was 'false' before animation event");
			} else {
				equal(e.holding, true, "holding value was 'true' after animation event");
			}
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"release" : function(e) {
			firedRelease = true;
			ok(true, "fire 'release' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animation" : function(e) {
			firedAnimation = true;
			ok(true, "fire 'animation' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animationEnd" : function(e) {
			firedAnimationEnd = true;
			ok(true, "fire 'animationEnd' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		}
	});
	this.inst.bind(el);

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
            deltaX: 100,
            deltaY: 100,
            duration: 1000,
            easing: "linear"
	}, function() {
		// Then
		// for test custom event
		setTimeout(function() {
			ok(firedHold, "fired 'hold' event");
			ok(firedRelease, "fired 'release' event");
			ok(firedAnimation, "fired 'animation' event");
			ok(firedAnimationEnd, "fired 'animationEnd' event");
			start();
		},1000);
    	});
});


asyncTest("movement test when stop method was called in 'animation' event", function() {
	//Given
	var el = $("#area").get(0);
	var timer = null;
	var firedRelease = false;
	var firedAnimation = false;
	var firedAnimationEnd = false;

	this.inst.on( {
		"change" : function(e) {
			if(firedAnimation) {
				equal(e.holding, false, "holding value was 'false' before animation event");
			} else {
				equal(e.holding, true, "holding value was 'true' after animation event");
			}
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"release" : function(e) {
			firedRelease = true;
			ok(true, "fire 'release' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animation" : function(e) {
			firedAnimation = true;
			e.stop();
			timer = setTimeout(function() {
				timer = null;
				e.done();
			}, e.duration);
			ok(true, "fire 'animation' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animationEnd" : function(e) {
			firedAnimationEnd = true;
			ok(true, "fire 'animationEnd' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		}
	});
	this.inst.bind(el);

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
            deltaX: 100,
            deltaY: 100,
            duration: 1000,
            easing: "linear"
	}, function() {
		// Then
		// for test custom event
		setTimeout(function() {
			ok(firedRelease, "fired 'release' event");
			ok(firedAnimation, "fired 'animation' event");
			ok(firedAnimationEnd, "fired 'animationEnd' event");
			start();
		},1000);
    	});
});


module("movableCoord interrupt Test", {
	setup : function() {
		this.inst = new eg.MovableCoord( {
			min : [ 0, 0 ],
			max : [ 300, 400 ],
			bounce : 100,
			margin : 0,
			circular : false,
			interruptable : false
		});
	},
	teardown : function() {
		this.inst.destroy();
		this.inst = null;
	}
});


asyncTest("interrupt test when user's action is fast", function() {
	//Given
	var el = $("#area").get(0);
	var firedHold = false;
	var firedRelease = false;
	var firedAnimation = false;
	var firedAnimationEnd = false;
	equal(this.inst._status.interrupted, false, "init value is 'false'");
	this.inst.on( {
		"hold" : function(e) {
			firedHold = true;
			deepEqual(e.pos, [ 0, 0 ], "fire 'hold' event");
			equal(e.hammerEvent.isFirst, true, "'hold' event is first event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"change" : function(e) {
			if(firedAnimation) {
				equal(e.holding, false, "holding value was 'false' before animation event");
			} else {
				equal(e.holding, true, "holding value was 'true' after animation event");
			}
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"release" : function(e) {
			firedRelease = true;
			ok(true, "fire 'release' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animation" : function(e) {
			firedAnimation = true;
			ok(true, "fire 'animation' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animationEnd" : function(e) {
			firedAnimationEnd = true;
			ok(true, "fire 'animationEnd' event");
			equal(this._isInterrupting(), false, "_isInterrupting is 'false'");
		}
	});
	this.inst.bind(el);

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
            deltaX: 100,
            deltaY: 100,
            duration: 1000,
            easing: "linear"
	}, function() {
		// Then
		// for test custom event
		setTimeout(function() {
			ok(firedHold, "fired 'hold' event");
			ok(firedRelease, "fired 'release' event");
			ok(firedAnimation, "fired 'animation' event");
			ok(firedAnimationEnd, "fired 'animationEnd' event");
			start();
		},1000);
    	});
});

asyncTest("interrupt test when stop method was called in 'animation' event", function() {
	//Given
	var el = $("#area").get(0);
	var timer = null;
	var firedRelease = false;
	var firedAnimation = false;
	var firedAnimationEnd = false;
	equal(this.inst._status.interrupted, false, "init value is 'false'");
	this.inst.on( {
		"change" : function(e) {
			if(firedAnimation) {
				equal(e.holding, false, "holding value was 'false' before animation event");
			} else {
				equal(e.holding, true, "holding value was 'true' after animation event");
			}
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"release" : function(e) {
			firedRelease = true;
			ok(true, "fire 'release' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animation" : function(e) {
			firedAnimation = true;
			e.stop();
			timer = setTimeout(function() {
				timer = null;
				e.done();
			}, e.duration);
			ok(true, "fire 'animation' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animationEnd" : function(e) {
			firedAnimationEnd = true;
			ok(true, "fire 'animationEnd' event");
			equal(this._isInterrupting(), false, "_isInterrupting is 'false'");
		}
	});
	this.inst.bind(el);

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
            deltaX: 100,
            deltaY: 100,
            duration: 1000,
            easing: "linear"
	}, function() {
		// Then
		// for test custom event
		setTimeout(function() {
			ok(firedRelease, "fired 'release' event");
			ok(firedAnimation, "fired 'animation' event");
			ok(firedAnimationEnd, "fired 'animationEnd' event");
			start();
		},1000);
    	});
});
