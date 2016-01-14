/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

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
	var before = $el.data(eg.MovableCoord._KEY);
	var beforeHammerCount = Object.keys(this.inst._hammers).length;

	// When
	this.inst.bind($el, {
		direction : eg.MovableCoord.DIRECTION_ALL
	});

	// Then
	var key = $el.data(eg.MovableCoord._KEY);
	equal(before, undefined, "key data value is 'undefined'' before call bind method" );
	notEqual(key, undefined, "key data value is something after call bind method" );
	equal(beforeHammerCount+1, Object.keys(this.inst._hammers).length, "added hammer instance after call bind method" );
});

test("bind with inputType", function() {
	// Given
	var $el = jQuery("#area");
	var before = $el.data(eg.MovableCoord._KEY);
	var beforeHammerCount = Object.keys(this.inst._hammers).length;

	// When
	var returnVal = this.inst.bind($el, {
		direction : eg.MovableCoord.DIRECTION_ALL,
		inputType : null
	});

	// Then
	var key = $el.data(eg.MovableCoord._KEY);
	equal(returnVal, this.inst, "return instance" );
	equal(before, undefined, "key data value is 'undefined'' before call bind method" );
	equal(key, undefined, "key data value is 'undefined' after call bind method" );
	equal(beforeHammerCount, Object.keys(this.inst._hammers).length, "nothing" );
});

test("unbind", function() {
	// Given
	var $el = jQuery("#area");
	this.inst.bind($el, {
		direction : eg.MovableCoord.DIRECTION_ALL
	});
	var before = $el.data(eg.MovableCoord._KEY);
	var beforeHammerCount = Object.keys(this.inst._hammers).length;

	// When
	var returnVal = this.inst.unbind($el);

	// Then
	var key = $el.data(eg.MovableCoord._KEY);
	equal(returnVal, this.inst, "return instance" );
	notEqual(before, key, "key data value was changed after call 'unbind' method" );
	equal(key, undefined, "key data value is 'undefined'' after call bind method" );
	equal(beforeHammerCount-1, Object.keys(this.inst._hammers).length, "removed hammer instance after call bind method" );
});

test("unbind with inputType", function() {
	// Given
	var $el = jQuery("#area");
	this.inst.bind($el, {
		direction : eg.MovableCoord.DIRECTION_ALL,
		inputType : []
	});
	var before = $el.data(eg.MovableCoord._KEY);
	var beforeHammerCount = Object.keys(this.inst._hammers).length;

	// When
	this.inst.unbind($el);

	// Then
	var key = $el.data(eg.MovableCoord._KEY);
	equal(before, undefined, "key data value is 'undefined'' after call 'unbind' method" );
	equal(key, undefined, "key data value is 'undefined'' after call bind method" );
	equal(beforeHammerCount, Object.keys(this.inst._hammers).length, "nothing" );
});

test("one element, double bind", function() {
	// Given
	var $el = jQuery("#area");
	this.inst.bind($el, {
		direction : eg.MovableCoord.DIRECTION_ALL
	});
	var beforeHammerCount = Object.keys(this.inst._hammers).length;
	var before = $el.data(eg.MovableCoord._KEY);
	var beforeHammerInstance = this.inst._hammers[before];

	// When
	this.inst.bind($el, {
		direction : eg.MovableCoord.DIRECTION_HORIZONTAL
	});

	// Then
	var key = $el.data(eg.MovableCoord._KEY);
	equal(before, key, "key data value is same" );
	equal(this.inst._hammers[key].get("pan").options.direction, eg.MovableCoord.DIRECTION_HORIZONTAL, "options was changed" );
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

test("setTo : check 'change' event", function(assert) {
	var done = assert.async();
	// Given
	this.inst.on("change", function(e) {
		// Then
		deepEqual(e.pos, [0, 200], "set to position 0,200");
		done();
	});
	// When
	this.inst.setTo(0, 200, 0);
});

test("setBy", function() {

	// Given
	// When
	var resultVal = this.inst.setBy(20, 20);
	// Then
	equal(resultVal, this.inst, "return instance");
	deepEqual(this.inst.get(), [20, 20], "set to position 20,20 relatively");
	// When
	resultVal = this.inst.setBy(-10, -10);
	// Then
	equal(resultVal, this.inst, "return instance");
	deepEqual(this.inst.get(), [10, 10], "set to position -10,-10 relatively");
	// When
	resultVal = this.inst.setBy(-1000, -1000);
	// Then
	equal(resultVal, this.inst, "return instance");
	deepEqual(this.inst.get(), [0, 0], "if position parameters was out of range, set to position min or max values.");
	// When
	resultVal = this.inst.setBy(1000, 1000);
	// Then
	equal(resultVal, this.inst, "return instance");
	deepEqual(this.inst.get(), [300, 400], "if position parameters was out of range, set to position min or max values.");
});

test("setBy : check a 'change' event", function(assert) {
	var done = assert.async();
	// Given
	this.inst.setBy(20, 20);
	this.inst.on("change", function(e) {
		// Then
		deepEqual(e.pos, [10, 10], "set to position -10,-10 relatively");
		done();
	});
	// When
	this.inst.setBy(-10, -10);
});

test("_grap : when position which not changed", function(assert) {
	// Given
	var done = assert.async();
	var firedChanged = false;
	this.inst.on("change", function(e) {
		firedChanged = true;
	});

	// When
	this.inst._status.animationParam = {};

	// Then
	this.inst._grab();
	setTimeout(function() {
		equal(firedChanged, false, "must not fire 'change' event");
		done();
	},100);
});

module("movableCoord methods Test when inputType is []", {
	setup : function() {
		this.inst = new eg.MovableCoord( {
			min : [ 0, 0 ],
			max : [ 300, 400 ],
			bounce : 100,
			margin : 0,
			circular : false,
			inputType : []
		});
	},
	teardown : function() {
		this.inst.destroy();
		this.inst = null;
	}
});

test("setTo when inputType is []", function() {
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

test("setTo when inputType is [] : check 'change' event", function(assert) {
	var done = assert.async();
	// Given
	this.inst.on("change", function(e) {
		// Then
		deepEqual(e.pos, [0, 200], "set to position 0,200");
		done();
	})
	// When
	this.inst.setTo(0, 200, 0);
});


test("setBy when inputType is []", function() {
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

module("movableCoord setTo duration Test", {
	setup : function() {
		var self=this;
		this.firedChangeEvent = false;
		this.firedAnimationStartEvent = 0;
		this.firedAnimationEndEvent = 0;

		this.inst = new eg.MovableCoord( {
			min : [ 0, 0 ],
			max : [ 300, 400 ],
			bounce : 100,
			margin : 0,
			circular : false,
			maximumDuration : 200
		}).on("change", function(e) {
			self.firedChangeEvent = true;
		}).on("release", function(e) {
			ok(false, "must not fired 'release' event");
		}).on("hold", function(e) {
			ok(false, "must not fired 'hold' event");
		}).on("animationStart", function(e) {
			self.firedAnimationStartEvent++;
		}).on("animationEnd", function(e) {
			self.firedAnimationEndEvent++;
		});

	},
	teardown : function() {
		this.inst.destroy();
		this.inst = null;
	}
});

test("setTo : check event flow when maximumDuration(200ms) is bigger than a duration of setTo", function(assert) {
	var done = assert.async();
	// Given
	var self = this;
	// When
	this.inst.setTo(200, 200, 100);

	// Then
	setTimeout(function() {
		ok(self.firedChangeEvent, "fired 'change' event");
		equal(self.firedAnimationStartEvent, 1, "fired 'animationStart' event");
		equal(self.firedAnimationEndEvent, 1, "fired 'animationEnd' event");
		done();
	},150);
});

test("setTo : check event flow when a duration of setTo is bigger than maximumDuration(200ms)", function(assert) {
	var done = assert.async();
	// Given
	var self = this;

	// When
	this.inst.setTo(200, 200, 3000);

	// Then
	setTimeout(function() {
		ok(self.firedChangeEvent, "fired 'change' event");
		equal(self.firedAnimationStartEvent, 1, "fired 'animationStart' event");
		equal(self.firedAnimationEndEvent, 1, "fired 'animationEnd' event");
		done();
	},250);
});

test("setTo : check event flow when a duration of setTo is '0'", function(assert) {
	var done = assert.async();
	// Given
	var self = this;

	// When
	this.inst.setTo(200, 200, 0);

	// Then
	ok(self.firedChangeEvent, "fired 'change' event");
	equal(self.firedAnimationStartEvent, 0, "not fired 'animationStart' event");
	equal(self.firedAnimationEndEvent, 0, "not fired 'animationEnd' event");
	done();
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

test("slow movement test (no-velocity)", function(assert) {
	var done = assert.async();
	//Given
	var el = $("#area").get(0);
	var firedHold =0;
	var firedRelease = 0;
	var firedAnimationEnd = 0;

	this.inst.on( {
		"hold" : function(e) {
			firedHold++;
			deepEqual(e.pos, [ 0, 0 ], "fire 'hold' event");
			equal(e.hammerEvent.isFirst, true, "'hold' event is first event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"change" : function(e) {
			equal(e.holding, true, "holding value is 'true' before animationStart event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"release" : function(e) {
			firedRelease++;
			ok(true, "fire 'release' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animationStart" : function(e) {
			ok(false, "must not fired 'animationStart' event");
		},
		"animationEnd" : function(e) {
			//@todo we should fix it for flicking
			//ok(false, "must not fired 'animationEnd' event");
			firedAnimationEnd++;
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
			equal(firedHold, 1, "fired 'hold' event");
			equal(firedRelease, 1,"fired 'release' event");
			equal(firedAnimationEnd, 1, "fired 'animationEnd' event");
			done();
		},1000);
    	});
});

test("slow movement test (no-velocity), release outside", function(assert) {
	var done = assert.async();
	//Given
	var el = $("#area").get(0);
	var firedHold =0;
	var firedRelease = 0;
	var firedAnimationEnd = 0;
	var firedAnimationStart = 0;

	this.inst.on( {
		"hold" : function(e) {
			firedHold++;
			deepEqual(e.pos, [ 0, 0 ], "fire 'hold' event");
			equal(e.hammerEvent.isFirst, true, "'hold' event is first event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"change" : function(e) {
			if(firedAnimationStart === 0) {
				equal(e.holding, true, "holding value is 'true' before animationStart event");
			} else {
				equal(e.holding, false, "holding value is 'false' after animationStart event");
			}
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"release" : function(e) {
			firedRelease++;
			ok(true, "fire 'release' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animationStart" : function(e) {
			firedAnimationStart++;
			ok(true, "must fired 'animationStart' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animationEnd" : function(e) {
			firedAnimationEnd++;
			ok(true, "fire 'animationEnd' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		}
	});
	this.inst.bind(el);

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
            deltaX: 350,
            deltaY: 10,
            duration: 1000,
            easing: "linear"
	}, function() {
		// Then
		// for test custom event
		setTimeout(function() {
			equal(firedHold, 1, "fired 'hold' event");
			equal(firedRelease, 1,"fired 'release' event");
			equal(firedAnimationStart, 1, "fired 'animationStrt' event");
			equal(firedAnimationEnd, 1, "fired 'animationEnd' event");
			done();
		},1000);
    	});
});

test("fast movement test (velocity)", function(assert) {
	var done = assert.async();
	//Given
	var el = $("#area").get(0);
	var firedHold = 0;
	var firedRelease = 0;
	var firedAnimationStart = 0;
	var firedAnimationEnd = 0;

	this.inst.on( {
		"hold" : function(e) {
			firedHold++;
			deepEqual(e.pos, [ 0, 0 ], "fire 'hold' event");
			equal(e.hammerEvent.isFirst, true, "'hold' event is first event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"change" : function(e) {
			if(firedAnimationStart) {
				equal(e.holding, false, "holding value was 'false' before animationStart event");
			} else {
				equal(e.holding, true, "holding value was 'true' after animationStart event");
			}
			equal(this._pos[0], e.pos[0], "event x-pos must equal x-pos of the object");
			equal(this._pos[1], e.pos[1], "event y-pos must equal y-pos of the object");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"release" : function(e) {
			firedRelease++;
			ok(true, "fire 'release' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animationStart" : function(e) {
			firedAnimationStart++;
			ok(true, "fire 'animationStart' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animationEnd" : function(e) {
			firedAnimationEnd++;
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
			equal(firedHold, 1,"fired 'hold' event");
			equal(firedRelease,1,"fired 'release' event");
			equal(firedAnimationStart, 1,"fired 'animationStart' event");
			equal(firedAnimationEnd, 1,"fired 'animationEnd' event");
			done();
		},1000);
    	});
});

test("movement test when stop method was called in 'animationStart' event", function(assert) {
	var done = assert.async();
	//Given
	var el = $("#area").get(0);
	var timer = null;
	var firedRelease = 0;
	var firedAnimationStart = 0;
	var firedAnimationEnd = 0;

	this.inst.on( {
		"change" : function(e) {
			if(firedAnimationStart) {
				equal(e.holding, false, "holding value was 'false' before animationStart event");
			} else {
				equal(e.holding, true, "holding value was 'true' after animationStart event");
			}
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"release" : function(e) {
			firedRelease++;
			ok(true, "fire 'release' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animationStart" : function(e) {
			firedAnimationStart++;
			e.stop();
			timer = setTimeout(function() {
				timer = null;
				e.done();
			}, e.duration);
			ok(true, "fire 'animationStart' event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"animationEnd" : function(e) {
			firedAnimationEnd++;
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
			equal(firedRelease,1,"fired 'release' event");
			equal(firedAnimationStart, 1,"fired 'animationStart' event");
			equal(firedAnimationEnd, 1,"fired 'animationEnd' event");
			done();
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
			circular : false
		});
	},
	teardown : function() {
		this.inst.destroy();
		this.inst = null;
	}
});


test("interrupt test when user's action is fast", function(assert) {
	var done = assert.async();
	//Given
	var el = $("#area").get(0);
	var firedHold = 0;
	var firedRelease = 0;
	var firedAnimationStart = 0;
	var firedAnimationEnd = 0;
	equal(this.inst._status.prevented, false, "init value is 'false'");
	this.inst.on( {
		"hold" : function(e) {
			firedHold++;
			deepEqual(e.pos, [ 0, 0 ], "fire 'hold' event");
			equal(e.hammerEvent.isFirst, true, "'hold' event is first event");
			equal(this._status.prevented, true, "prevented property is 'true'");
		},
		"change" : function(e) {
			if(firedAnimationStart) {
				equal(e.holding, false, "holding value was 'false' before animation event");
			} else {
				equal(e.holding, true, "holding value was 'true' after animation event");
			}
			equal(this._pos[0], e.pos[0], "event x-pos must equal x-pos of the object");
			equal(this._pos[1], e.pos[1], "event y-pos must equal y-pos of the object");
			equal(this._status.prevented, true, "prevented property is 'true'");
		},
		"release" : function(e) {
			firedRelease++;
			ok(true, "fire 'release' event");
			equal(this._status.prevented, true, "prevented property is 'true'");
		},
		"animationStart" : function(e) {
			firedAnimationStart++;
			ok(true, "fire 'animationStart' event");
			equal(this._status.prevented, true, "prevented property is 'true'");
		},
		"animationEnd" : function(e) {
			firedAnimationEnd++;
			ok(true, "fire 'animationEnd' event");
			equal(this._status.prevented, false, "prevented property is 'false'");
		}
	});
	this.inst.bind(el, {
		interruptable : false
	});

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
			equal(firedHold, 1,"fired 'hold' event");
			equal(firedRelease,1,"fired 'release' event");
			equal(firedAnimationStart, 1,"fired 'animationStart' event");
			equal(firedAnimationEnd, 1,"fired 'animationEnd' event");
			done();
		},1000);
    	});
});

test("interrupt test when stop method was called in 'animationStart' event", function(assert) {
	var done = assert.async();
	//Given
	var el = $("#area").get(0);
	var timer = null;
	var firedRelease = 0;
	var firedAnimationStart = 0;
	var firedAnimationEnd = 0;
	equal(this.inst._status.prevented, false, "init value is 'false'");
	this.inst.on( {
		"change" : function(e) {
			if(firedAnimationStart) {
				equal(e.holding, false, "holding value was 'false' before animation event");
			} else {
				equal(e.holding, true, "holding value was 'true' after animation event");
			}
			equal(this._status.prevented, true, "prevented property is 'true'");
		},
		"release" : function(e) {
			firedRelease++;
			ok(true, "fire 'release' event");
			equal(this._status.prevented, true, "prevented property is 'true'");
		},
		"animationStart" : function(e) {
			firedAnimationStart++;
			e.stop();
			timer = setTimeout(function() {
				timer = null;
				e.done();
			}, e.duration);
			ok(true, "fire 'animation' event");
			equal(this._status.prevented, true, "prevented property is 'true'");
		},
		"animationEnd" : function(e) {
			firedAnimationEnd++;
			ok(true, "fire 'animationEnd' event");
			equal(this._status.prevented, false, "prevented property is 'false'");
		}
	});
	this.inst.bind(el, {
		interruptable : false
	});

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
			equal(firedRelease,1,"fired 'release' event");
			equal(firedAnimationStart, 1,"fired 'animationStart' event");
			equal(firedAnimationEnd, 1,"fired 'animationEnd' event");
			done();
		},1000);
    	});
});

test("interrupt test when 'setTo' method is called : duration = 0", function() {
	//Given
	var el = $("#area").get(0);
	equal(this.inst._status.prevented, false, "init value is 'false'");
	this.inst.on( {
		"change" : function(e) {
			equal(this._status.prevented, true, "prevented property is 'true'");
		}
	});
	this.inst.bind(el, {
		interruptable : false
	});

	// When
	this.inst.setTo(200,200);

	// Then
	equal(this.inst._status.prevented, false, "prevented property is 'false'");

	// When
	this.inst.setTo(100,100);

	// Then
	equal(this.inst._status.prevented, false, "prevented property is 'false'");
});


test("interrupt test when 'setTo' method is called : duration = 100", function(assert) {
	var done = assert.async();
	//Given
	var el = $("#area").get(0);
	equal(this.inst._status.prevented, false, "init value is 'false'");
	this.inst.on( {
		"change" : function(e) {
			equal(this._status.prevented, true, "prevented property is 'true'");
		},
		"animationStart" : function(e) {
			equal(this._status.prevented, true, "prevented property is 'true'");
		},
		"animationEnd" : function(e) {
			equal(this._status.prevented, false, "prevented property is 'false'");
		}
	});
	this.inst.bind(el, {
		interruptable : false
	});

	// When
	var self = this;
	this.inst.setTo(200,200,100);
	setTimeout(function() {
		// Then
		equal(self.inst._status.prevented, false, "prevented property is 'false'");
		self.inst.setTo(100,0,100);
		setTimeout(function() {
			// Then
			equal(self.inst._status.prevented, false, "prevented property is 'false'");
			done();
		},150);
	},150);
});

test("interrupt test after 'setTo' method is called : move to same position", function(assert) {
	var done = assert.async();
	//Given
	var el = $("#area").get(0);
	equal(this.inst._status.prevented, false, "init value is 'false'");
	this.inst.on( {
		"change" : function(e) {
			equal(this._status.prevented, true, "prevented property is 'true'");
		},
		"animationStart" : function(e) {
			equal(this._status.prevented, true, "prevented property is 'true'");
		},
		"animationEnd" : function(e) {
			equal(this._status.prevented, false, "prevented property is 'false'");
		}
	});
	this.inst.bind(el, {
		interruptable : false
	});

	// When
	var self = this;
	this.inst.setTo(200,200,100);
	setTimeout(function() {
		// Then
		equal(self.inst._status.prevented, false, "prevented property is 'false'");
		// move to same position
		self.inst.setTo(200,200,100);
		setTimeout(function() {
			// Then
			equal(self.inst._status.prevented, false, "prevented property is 'false'");
			done();
		},150);
	},150);
});


test("interrupt test after tap gesture", function(assert) {
	var done = assert.async();
	//Given
	var el = $("#area").get(0);
	var firedHold =0;
	var firedRelease = 0;

	this.inst.on( {
		"hold" : function(e) {
			firedHold++;
			deepEqual(e.pos, [ 0, 0 ], "fire 'hold' event");
			equal(e.hammerEvent.isFirst, true, "'hold' event is first event");
			equal(this._isInterrupting(), true, "_isInterrupting is 'true'");
		},
		"change" : function(e) {
			ok(false, "must not fired 'change' event");
		},
		"release" : function(e) {
			firedRelease++;
			ok(true, "fire 'release' event");
			equal(this._isInterrupting(), false, "_isInterrupting is 'false'");
		},
		"animationStart" : function(e) {
			ok(false, "must not fired 'animationStart' event");
		},
		"animationEnd" : function(e) {
			ok(false, "must not fired 'animationEnd' event");
		}
	});
	this.inst.bind(el, {
		interruptable : false
	});

	// When
	Simulator.gestures.tap(el, {
		pos: [50, 50]
	}, function() {
		// Then
		// for test custom event
		setTimeout(function() {
			equal(firedHold,1,"fired 'hold' event");
			equal(firedRelease,1,"fired 'release' event");
			done();
		},1000);
    	});
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

test("check user's direction", function() {
	//Given
	// When
	this.inst._subOptions.thresholdAngle = 45;

	// Then
	equal(this.inst._getDirection(0), eg.MovableCoord.DIRECTION_HORIZONTAL, "check if a direction is horizontal")
	equal(this.inst._getDirection(20), eg.MovableCoord.DIRECTION_HORIZONTAL, "check if a direction is horizontal")
	equal(this.inst._getDirection(45), eg.MovableCoord.DIRECTION_HORIZONTAL, "check if a directgion is horizontal");
	equal(this.inst._getDirection(100), eg.MovableCoord.DIRECTION_VERTICAL, "check if a direction is vertical");
	equal(this.inst._getDirection(134), eg.MovableCoord.DIRECTION_VERTICAL, "check if a direction is vertical");
	equal(this.inst._getDirection(135), eg.MovableCoord.DIRECTION_HORIZONTAL, "check if a direction is horizontal");
	equal(this.inst._getDirection(136), eg.MovableCoord.DIRECTION_HORIZONTAL, "check if a direction is horizontal");
	equal(this.inst._getDirection(180), eg.MovableCoord.DIRECTION_HORIZONTAL, "check if a direction is horizontal");

	// When
	this.inst._subOptions.thresholdAngle = 20;

	// Then
	equal(this.inst._getDirection(0), eg.MovableCoord.DIRECTION_HORIZONTAL, "check if a direction is horizontal")
	equal(this.inst._getDirection(10), eg.MovableCoord.DIRECTION_HORIZONTAL, "check if a direction is horizontal");
	equal(this.inst._getDirection(20), eg.MovableCoord.DIRECTION_HORIZONTAL, "check if a direction is horizontal");
	equal(this.inst._getDirection(30), eg.MovableCoord.DIRECTION_VERTICAL, "check if a direction is vertical");
	equal(this.inst._getDirection(50), eg.MovableCoord.DIRECTION_VERTICAL, "check if a direction is vertical");
	equal(this.inst._getDirection(160), eg.MovableCoord.DIRECTION_HORIZONTAL, "check if a direction is horizontal");
	equal(this.inst._getDirection(161), eg.MovableCoord.DIRECTION_HORIZONTAL, "check if a direction is horizontal");
	equal(this.inst._getDirection(180), eg.MovableCoord.DIRECTION_HORIZONTAL, "check if a direction is horizontal");
});


test("movement direction test (DIRECTION_ALL)", function(assert) {
	var done = assert.async();
	//Given
	var el = $("#area").get(0);

	this.inst.on( {
		"release" : function(e) {
			equal(e.depaPos[0], 10)
			equal(e.depaPos[1], 10)
			equal(this._pos[0], 10)
			equal(this._pos[1], 10)
		}
	});
	this.inst.bind(el, {
		direction : eg.MovableCoord.DIRECTION_ALL
	});

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
            deltaX: 10,
            deltaY: 10,
            duration: 2000,
            easing: "linear"
	}, function() {
		done();
    	});
});


test("movement direction test (DIRECTION_HORIZONTAL)", function(assert) {
	var done = assert.async();
	//Given
	var el = $("#area").get(0);

	this.inst.on( {
		"release" : function(e) {
			equal(e.depaPos[0], 10)
			equal(e.depaPos[1], 0)
			equal(this._pos[0], 10)
			equal(this._pos[1], 0)
		}
	});
	this.inst.bind(el, {
		direction : eg.MovableCoord.DIRECTION_HORIZONTAL
	});

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
            deltaX: 10,
            deltaY: 10,
            duration: 2000,
            easing: "linear"
	}, function() {
		done();
    	});
});


test("movement direction test (DIRECTION_VERTICAL)", function(assert) {
	var done = assert.async();
	//Given
	var el = $("#area").get(0);

	this.inst.on( {
		"release" : function(e) {
			equal(e.depaPos[0], 0)
			equal(e.depaPos[1], 10)
			equal(this._pos[0], 0)
			equal(this._pos[1], 10)
		}
	});
	this.inst.bind(el, {
		direction : eg.MovableCoord.DIRECTION_VERTICAL
	});

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
            deltaX: 3,
            deltaY: 10,
            duration: 2000,
            easing: "linear"
	}, function() {
		done();
    	});
});

test("_convertInputType (support touch)", function() {
	// Given
	var globalWithToucnSupport = {
		"ontouchstart": {}
	};
	var method = eg.invoke("movableCoord", [jQuery, eg, globalWithToucnSupport, Hammer]);
	var inst = new method.MovableCoord( {
		min : [ 0, 0 ],
		max : [ 300, 400 ],
		bounce : 100,
		margin : 0,
		circular : false
	});
	var supportTouch = true;
	var notSupportTouch = false;

	// When
	var inputType = [ "touch", "mouse" ];
	// Then
	equal(inst._convertInputType(inputType), Hammer.TouchInput, "check TouchInput");

	// When
	inputType = [ "touch" ];
	// Then
	equal(inst._convertInputType(inputType), Hammer.TouchInput, "check TouchInput");

	// When
	inputType = [ "mouse" ];
	// Then
	equal(inst._convertInputType(inputType), Hammer.MouseInput, "check MouseInput");

	// When
	inputType = [ ];
	// Then
	equal(inst._convertInputType(inputType), null, "type is null");
});

test("_convertInputType (not support touch)", function() {
	// Given
	var globalWithoutToucnSupport = {};
	var method = eg.invoke("movableCoord", [jQuery, eg, globalWithoutToucnSupport, Hammer]);
	var inst = new method.MovableCoord( {
		min : [ 0, 0 ],
		max : [ 300, 400 ],
		bounce : 100,
		margin : 0,
		circular : false
	});
	var supportTouch = true;
	var notSupportTouch = false;

	// When
	var inputType = [ "touch", "mouse" ];
	// Then
	equal(inst._convertInputType(inputType), Hammer.MouseInput, "check TouchInput(not supporting touch)");

	// When
	inputType = [ "touch" ];
	// Then
	equal(inst._convertInputType(inputType), null, "check TouchInput(not supporting touch)");

	// When
	inputType = [ "mouse" ];
	// Then
	equal(inst._convertInputType(inputType), Hammer.MouseInput, "check MouseInput(not supporting touch)");

	// When
	inputType = [ ];
	// Then
	equal(inst._convertInputType(inputType), null, "type is null(not supporting touch)");
});