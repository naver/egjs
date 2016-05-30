/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

// jscs:disable
// to resolve transform style value
function $getTransformValue(el, match) {
	el = $(el)[0].style;

	var elStyle = el.webkitTransform || el.transform || "",
		rx = /\(-?(\d+)/;

	return match ? (elStyle.match(rx) ||[,])[1] : elStyle;
}

// create Flicking instance
function create(el, option, handler) {
	handler = handler || $.noop;

	return new eg.Flicking(el, option || {}).on({
		beforeFlickStart: handler,
		flick : handler,
		flickEnd : handler,
		beforeRestore : handler,
		restore : handler
	});
}

// run gesture simulator
function simulator(el, option, callback) {
	Simulator.gestures.pan(el, $.extend({
		pos: [50, 50],
		deltaX: -100,
		deltaY: 0,
		duration: 500,
		easing: "linear"
	}, option), callback);
}

var hooks = {
	beforeEach: function() {
		this.inst = null;
	},
	afterEach: function() {
		this.inst && this.inst._mcInst.destroy();
	}
};

module("Initialization", hooks);
test("Check for the initialization", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick1"));

	// When
	// Then
	deepEqual(this.inst.$container.width(), this.inst.$container.parent().width(), "Then panel container was added and the width is same as wrapper element.");
});

module("Setting options", hooks);
test("circular", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick1"));

	// When
	this.inst.moveTo(this.inst._conf.panel.origCount - 1,0);

	// Then
	equal(this.inst.getElement().next().length, 0, "Is not circular?");
	this.inst._mcInst.destroy();

	// Given
	this.inst = new eg.Flicking($("#mflick2"), { circular : true });

	// When
	this.inst.moveTo(this.inst._conf.panel.origCount - 1,0);

	// Then
	ok(this.inst.getNextElement(), "Is circular?");
	this.inst._mcInst.destroy();

	// Given
	this.inst = new eg.Flicking($("#mflick2-1"), { circular : true });

	// When
	// Then
	ok(this.inst._conf.panel.count > this.inst._conf.panel.origCount, "When panel elements are not enough, should be added cloned elements");

	// Given
	this.inst = new eg.Flicking($("#mflick3"), { circular : true, horizontal : false });

	// When
	this.inst.moveTo(this.inst._conf.panel.origCount - 1,0);

	// Then
	ok(this.inst.getNextElement(), "Is circular?");

});

test("previewPadding - horizontal", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick3"), {
		circular : true,
		previewPadding : [ 50, 70 ]
	});

	var padding = this.inst.options.previewPadding,
		right = parseInt(this.inst.$wrapper.css("padding-right"), 10),
		left = parseInt(this.inst.$wrapper.css("padding-left"), 10),
		wrapperWidth = this.inst.$wrapper.width(),
		panelWidth = this.inst.$container.children().width();

	// When
	// Then
	ok(left === padding[0] && right === padding[1], "Preview padding value applied correctly?");
	equal(wrapperWidth, panelWidth, "Each panel's width should be same as wrapper element's width");
});

test("previewPadding - vertical", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick3"), {
		circular : true,
		horizontal : false,
		previewPadding : [ 15, 10 ]
	});

	var padding = this.inst.options.previewPadding,
		top = parseInt(this.inst.$wrapper.css("padding-top"), 10),
		bottom = parseInt(this.inst.$wrapper.css("padding-bottom"), 10),
		wrapperHeight = this.inst.$wrapper.height(),
		panelHeight = this.inst.$container.children().height();

	// When
	// Then
	ok(top === padding[0] && bottom === padding[1], "Preview padding value applied correctly?");
	equal(wrapperHeight - (padding[0] + padding[1]), panelHeight, "Each panel's height should be same as wrapper element's height");
});

test("bounce", function() {
	var bounce = 50;

	// Given
	this.inst = new eg.Flicking($("#mflick3"), {
		bounce : bounce
	});

	// Then
	deepEqual(this.inst.options.bounce, [50, 50], "Bounce value set correctly?");

	bounce = [ 15, 20 ];

	// When
	this.inst = new eg.Flicking($("#mflick3-1"), {
		bounce : bounce
	});

	// Then
	deepEqual(this.inst.options.bounce, bounce, "Bounce value set correctly?");
});

test("bounce - left/up", function(assert) {
	var done = assert.async();
	var done2 = assert.async();

	var el = $("#mflick1")[0];
	var bounce = [ 50, 70 ];
	var depaPos, depaPos2;

	// Given
	new eg.Flicking(el, {
		bounce : bounce
	}).on({
		beforeRestore: function(e) {
			depaPos = e.depaPos[0];
		}
	});

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
		deltaX: 250,
		deltaY: 0,
		duration: 500,
		easing: "linear"
	}, function() {
		// Then
		setTimeout(function () {
			assert.ok(depaPos === -bounce[0], "Left bounce distance is correct?");
			done();
		}, 1000);
	});

	// Given
	var el2 = $("#mflick2")[0];

	new eg.Flicking(el2, {
		bounce : bounce,
		horizontal: false
	}).on({
		beforeRestore: function(e) {
			depaPos2 = e.depaPos[1];
		}
	});

	// When
	Simulator.gestures.pan(el2, {
		pos: [0, 0],
		deltaX: 0,
		deltaY: 250,
		duration: 500,
		easing: "linear"
	}, function() {
		// Then
		setTimeout(function () {
			assert.ok(depaPos2 === -bounce[0], "Left bounce distance is correct?");
			done2();
		}, 1000);
	});
});


test("bounce - right/down", function(assert) {
	var done = assert.async();
	var done2 = assert.async();

	var el = $("#mflick1")[0];
	var bounce = [ 50, 70 ];
	var depaPos, depaPos2;

	// Given
	var inst = new eg.Flicking(el, {
		bounce : bounce,
		defaultIndex: 2
	}).on({
		beforeRestore: function(e) {
			depaPos = e.depaPos[0];
		}
	});

	var max = inst._mcInst.options.max[0];

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
		deltaX: -250,
		deltaY: 0,
		duration: 500,
		easing: "linear"
	}, function() {
		// Then
		setTimeout(function () {
			assert.ok(depaPos === max + bounce[1], "Right bounce distance is correct?");
			done();
		}, 1000);
	});

	// Given
	var el2 = $("#mflick2")[0];

	var inst2 = new eg.Flicking(el2, {
		bounce : bounce,
		defaultIndex: 2,
		horizontal: false
	}).on({
		beforeRestore: function(e) {
			depaPos2 = e.depaPos[1];
		}
	});

	var max2 = inst2._mcInst.options.max[1];

	// When
	Simulator.gestures.pan(el2, {
		pos: [100, 50],
		deltaX: 0,
		deltaY: -250,
		duration: 500,
		easing: "linear"
	}, function() {
		// Then
		setTimeout(function () {
			assert.ok(depaPos2 === max2 + bounce[1], "Down bounce distance is correct?");
			done2();
		}, 1000);
	});
});

test("threshold #1 - (horizontal) when moved more than threshold pixels", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick2")[0],
		changedPanelNo = 0, panelNo;

	var inst =this.inst = new eg.Flicking(el, {
		circular : true,
		threshold : 80
	}).on({
		flickEnd : function(e) {
			changedPanelNo = e.no;
		}
	})

	panelNo = this.inst._conf.panel.no;

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
		deltaX: -100,
		deltaY: 0,
		duration: 500,
		easing: "linear"
	}, function() {
		// Then
		setTimeout(function() {
			assert.deepEqual(panelNo + 1, changedPanelNo, "Moved to next panel?");
			done();
		},1000);
    });
});

test("threshold #2 - (vertical) when moved more than threshold pixels", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick2")[0],
		changedPanelNo = 0, panelNo;

	this.inst = new eg.Flicking(el, {
		circular : true,
		horizontal : false,
		threshold : 20
	}).on({
		flickEnd : function(e) {
			changedPanelNo = e.no;
		}
	})

	panelNo = this.inst._conf.panel.no;

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
		deltaX: 0,
		deltaY: -100,
		duration: 500,
		easing: "linear"
	}, function() {
		// Then
		setTimeout(function() {
			assert.deepEqual(panelNo + 1, changedPanelNo, "Moved to next panel?");
			done();
		},1000);
    });
});

test("threshold #3 - (horizontal) when moved less than threshold pixels", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick2").get(0),
		changedPanelNo;

	this.inst = new eg.Flicking(el, {
		circular : true,
		threshold : 80
	}).on({
		flickEnd : function(e) {
			changedPanelNo = e.no;
		}
	})

	changedPanelNo = panelNo = this.inst._conf.panel.no;

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
		deltaX: -70,
		deltaY: 0,
		duration: 500,
		easing: "linear"
	}, function() {
		// Then
		setTimeout(function() {
			assert.deepEqual(panelNo, changedPanelNo, "Not moved to next panel?");
			done();
		},1000);
    });
});

test("threshold #4 - (vertical) when moved less than threshold pixels", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick2").get(0),
		changedPanelNo;

	this.inst = new eg.Flicking(el, {
		circular : true,
		horizontal : false,
		threshold : 20
	}).on({
		flickEnd : function(e) {
			changedPanelNo = e.no;
		}
	})

	changedPanelNo = panelNo = this.inst._conf.panel.no;

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
		deltaX: 0,
		deltaY: -10,
		duration: 500,
		easing: "linear"
	}, function() {
		// Then
		setTimeout(function() {
			assert.deepEqual(panelNo, changedPanelNo, "Not moved to next panel?");
			done();
		},1000);
    });
});

test("defaultIndex", function () {
	// Given
	var defaultIndex = 3;

	this.inst = new eg.Flicking($("#mflick3"), {
		circular : true,
		defaultIndex : defaultIndex
	});

	// When
	// Then
	equal(this.inst._conf.panel.no, defaultIndex, "The initial panel number should be "+ defaultIndex);
});

test("hwAccelerable", function () {
	// Given
	this.inst = new eg.Flicking($("#mflick3"), {
		hwAccelerable: true,
		defaultIndex: 1
	});

	var container = this.inst.$container,
		panel = this.inst._conf.panel.$list[0];

	// When
	// Then
	ok($.css(container[0], "willChange") === "transform" || $getTransformValue(container).indexOf("3d") >= 0, "HW Acceleration css property is prensent in container element?");
	ok($.css(panel, "willChange") === "transform" || $getTransformValue(panel).indexOf("3d") >= 0, "HW Acceleration css property is prensent in panel element?");
});


module("Methods call", hooks);
test("getIndex()", function() {
	// Given
	var defaultIndex = 3;

	this.inst = new eg.Flicking($("#mflick3"), {
		circular : true,
		defaultIndex : defaultIndex
	});

	// When
	// Then
	equal(defaultIndex, this.inst.getIndex(), "Get current logical panel number");
	notEqual(this.inst.getIndex(true), this.inst.getIndex(), "Physical and logical panel number are different");
	deepEqual(this.inst._conf.panel.$list[this.inst.getIndex(true)], this.inst.getElement()[0], "Get current panel using physical panel number");
});

test("getElement()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick2"), {
		circular : true
	});

	var element = this.inst.getElement(),
		value = (this.inst._getBasePositionIndex() * 100) +"%";

	// When
	// Then
	ok(element.length, "The element was invoked correctly?");
	deepEqual($getTransformValue(element).match(RegExp(value)) + "", value, "Invoked element is placed in right position?");
});

test("getNextElement()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick2"), {
		circular : true
	});

	var element = this.inst.getNextElement(),
		currentTransform = $getTransformValue(this.inst.getElement(), true),
		nextTransform = $getTransformValue(element, true);

	// When
	// Then
	ok(element, "The element was invoked correctly?");
	ok(currentTransform < nextTransform, "Invoked element is placed next to the current element?");
});

test("getNextIndex()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick3"), {
		circular : true
	});

	var index = this.inst.getNextIndex();

	// When
	// Then
	deepEqual(typeof index, "number", "Returned number?");
	deepEqual(index, this.inst.getIndex() + 1, "Is the next index of current?");

	// When
	this.inst.moveTo(this.inst._conf.panel.count - 1,0);  // move to last
	index = this.inst.getNextIndex();

	// Then
	deepEqual(index, 0, "Next index of last, should be '0'");

	// When
	index = this.inst.getNextIndex(true);

	// Then
	ok(index > 0, "Next physical index of last, should be great than 0");
});

test("getPrevElement()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick2"), {
		circular : true
	});

	var element = this.inst.getPrevElement(),
		currentTransform = $getTransformValue(this.inst.getElement(), true),
		prevTransform = $getTransformValue(element, true);

	// When
	// Then
	ok(element, "The element was invoked correctly?");
	ok(currentTransform > prevTransform, "Invoked element is placed previous to the current element?");
});

test("getPrevIndex()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick3"), {
		circular : true
	});

	var index = this.inst.getPrevIndex();

	// When
	// Then
	deepEqual(typeof index, "number", "Returned number?");
	deepEqual(index, this.inst._conf.panel.count - 1, "Previous index of first, should be "+ (this.inst._conf.panel.count - 1));

	// When
	this.inst.moveTo(2,0);  // move to second
	index = this.inst.getPrevIndex();

	// Then
	deepEqual(index, this.inst.getIndex() - 1, "Is the previous index of current?");

	// When
	this.inst.moveTo(0,0);  // move to the first
	index = this.inst.getPrevIndex(true);

	// Then
	ok(this.inst.getPrevIndex() > index, "Previous physical index, should be less than logical index");
});

test("getAllElements()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick2"), {
		circular : true
	});

	var elements = this.inst.getAllElements();

	// When
	// Then
	deepEqual(elements.length, this.inst.$container.children().length, "Returned all panel elements?");
});

test("getTotalCount()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick1"));

	var counts = this.inst.getTotalCount();

	// When
	// Then
	deepEqual(counts, this.inst.$container.children().length, "Return total panel elements count?");
	this.inst._mcInst.destroy();

	// When
	this.inst = new eg.Flicking($("#mflick2-1"), {
		circular : true
	});

	counts = this.inst.getTotalCount();

	// Then
	ok(counts < this.inst.$container.children().length, "When circular options is set, the elements count is less than physical elements count");

	// When
	counts = this.inst.getTotalCount(true);
	deepEqual(counts, this.inst.$container.children().length, "Returned physical elements total count?");
});

test("isPlaying()", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick3").get(0),
		that = this;

	this.inst = new eg.Flicking(el);

	// Then
	ok(!this.inst.isPlaying(), "Must return 'false' when not animating");

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
		deltaX: -100,
		deltaY: 0,
		duration: 1000,
		easing: "linear"
	}, function() {
		var isPlaying = that.inst.isPlaying();

		// Then
		setTimeout(function() {
			assert.ok(isPlaying, "During the animation must return 'true'");
			done();
		},500);
    });
});

test("next()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick2-1"), {
		circular : true
	});

	var nextElement = this.inst.getNextElement();

	// When
	this.inst.next(0);
	var element = this.inst.getElement(),
		value = (this.inst._getBasePositionIndex() * 100) +"%";

	// When
	// Then
	deepEqual($getTransformValue(element).match(RegExp(value)) + "", value, "Moved to next panel correctly?");
	deepEqual(element[0], nextElement[0], "The next element is what expected?");
});

test("next() - Animation #1", function (assert) {
	var done = assert.async();

	// Given
	this.inst = new eg.Flicking($("#mflick2-1"), {
		circular : true
	});

	var nextElement = this.inst.getNextElement();

	// When
	this.inst.next();

	setTimeout($.proxy(function () {
		var element = this.inst.getElement(),
			value = (this.inst._getBasePositionIndex() * 100) + "%";

		// Then
		assert.deepEqual($getTransformValue(element).match(RegExp(value)) + "", value, "Moved to next panel correctly?");
		assert.deepEqual(element[0], nextElement[0], "The next element is what expected?");

		done();
	}, this), 400);
});

test("next() - Animation #2", function (assert) {
	var done = assert.async();

	// Given
	this.inst = new eg.Flicking($("#mflick2-1"), {
		circular: true
	});

	var nextElement = this.inst.getNextElement();

	// When
	this.inst.next(300);

	setTimeout($.proxy(function() {
		var element = this.inst.getElement(),
			value = (this.inst._getBasePositionIndex() * 100) +"%";

		// When
		// Then
		assert.deepEqual($getTransformValue(element).match(RegExp(value)) + "", value, "Moved to next panel correctly?");
		assert.deepEqual(element[0], nextElement[0], "The next element is what expected?");

		done();
	}, this), 400);
});

test("prev()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick2-1"), {
		circular : true
	});

	var prevElement = this.inst.getPrevElement();

	// When
	this.inst.prev(0);
	var element = this.inst.getElement(),
		value = (this.inst._getBasePositionIndex() * 100) +"%";

	// Then
	deepEqual($getTransformValue(element).match(RegExp(value)) + "", value, "Moved to previous panel correctly?");
	deepEqual(element.html(), prevElement.html(), "The previous element is what expected?");
});

test("prev() - Animation #1", function (assert) {
	var done = assert.async();

	// Given
	this.inst = new eg.Flicking($("#mflick2-1"), {
		circular : true
	});

	var prevElement = this.inst.getPrevElement();

	// When
	this.inst.prev(300);

	setTimeout($.proxy(function() {
		var element = this.inst.getElement(),
			value = (this.inst._getBasePositionIndex() * 100) +"%";

		// Then
		assert.deepEqual($getTransformValue(element).match(RegExp(value)) + "", value, "Moved to previous panel correctly?");
		assert.deepEqual(element.html(), prevElement.html(), "The previous element is what expected?");

		done();
	}, this), 400);
});

test("prev() - Animation #2", function (assert) {
	var done = assert.async();

	// Given
	this.inst = new eg.Flicking($("#mflick2-1"), {
		circular: true
	});

	var prevElement = this.inst.getPrevElement();

	// When
	this.inst.prev();

	setTimeout($.proxy(function () {
		var element = this.inst.getElement(),
			value = (this.inst._getBasePositionIndex() * 100) + "%";

		// Then
		assert.deepEqual($getTransformValue(element).match(RegExp(value)) + "", value, "Moved to previous panel correctly?");
		assert.deepEqual(element.html(), prevElement.html(), "The previous element is what expected?");

		done();
	}, this), 400);
});

test("enableInput() / disableInput()", function(assert) {
	var done1 = assert.async();
	var done2 = assert.async();

	// Given
	var el = $("#mflick1")[0];
	var isEventFired = false;

	var inst = create(el, null, function(e) {
		isEventFired = true;
	});

	// When
	inst.disableInput();

	simulator(el, {
		deltaX: -70
	}, function() {
		assert.ok(!isEventFired, "Input action should be disabled.");
		done1();

		// When
		inst.enableInput();

		simulator(el, {
			deltaX: -70
		}, function() {
			assert.ok(isEventFired, "Input action should be enabled.");
			done2();
		});
	});
});

test("destroy()", function(assert) {
	var done = assert.async();

	// Given
	var $el = $("#mflick1");
	var $panel = $el.children();
	var isEventFired = false;

	var origPanelStyle = {
		wrapper: {
			className: $el.attr("class"),
			style: $el.attr("style")
		},
		list: $panel.map(function(i,v) {
			return {
				className: $(v).attr("class"),
				style: $(v).attr("style")
			};
		})
	};

	var inst = create($el, null, function(e) {
		isEventFired = true;
	});

	var containerClassName = inst.$container.attr("class");

	// When
	inst.destroy();

	simulator($el[0], {
		deltaX: -70
	}, function() {
		assert.ok(!isEventFired, "Input action should be disabled.");
		assert.ok($el.find("."+ containerClassName).length === 0, "Container element was removed?");

		assert.ok($el.attr("class") === origPanelStyle.wrapper.className, "Wrapper element class has been restored?");
		assert.ok($el.attr("style") === origPanelStyle.wrapper.style, "Wrapper element style has been restored?");

		$panel.each(function(i, v) {
			var $panelEl = $(v);

			assert.ok($panelEl.attr("class") === origPanelStyle.list[i].className, "Panel element class has been restored?");
			assert.ok($panelEl.attr("style") === origPanelStyle.list[i].style, "Panel element style has been restored?");
		});

		// check for the resources release
		for(var x in inst) {
			assert.equal(inst[x], null, "'"+ x +"' is released?");
		}

		done();
	});
});


module("moveTo() method", hooks);
test("Check for functionality", function() {
	// Given
	var eventOrder = ["beforeFlickStart", "flick", "flickEnd"],
		eventFired = [],
		handler = function(e) {
			var type = e.eventType;

			if(eventFired.indexOf(type) == -1) {
				!e.holding && eventFired.push(type);
			}
		};

	var inst = new eg.Flicking("#mflick1").on({
		beforeFlickStart: handler,
		flick: handler,
		flickEnd: handler
	});

	var count = inst._conf.panel.count,
		value = (count - 1) * 100;

	var setCondition = function(no, duration) {
		eventFired = [];
		inst.moveTo(no, duration);
	};

	var runTest = function(no, value) {
		equal(no, inst._conf.panel.no, "Panel number indicate correct panel number?");
		equal($getTransformValue(inst.getElement()).match(RegExp(value)) + "", value, "Invoked element is placed in right position?");
		ok(inst.getElement().html().indexOf("Layer "+ no), "Moved correctly?");
		deepEqual(eventOrder, eventFired, "Custom events are fired?");
	};

	// When
	setCondition(count - 1,0);  // move to last

   	// Then
	runTest(count - 1, value);


	// When
	setCondition(0, 0);  // move to first

	// Then
	runTest(0, "0%");

	inst = new eg.Flicking("#mflick2", {
		defaultIndex: 1
	}).on({
		beforeFlickStart: handler,
		flick: handler,
		flickEnd: handler
	});

	// When
	setCondition(2,0);

	// Then
	runTest(2, value);

	// When
	setCondition(0,0);

	// Then
	runTest(0,"0%");

	inst._mcInst.destroy();

	// Given
	inst = new eg.Flicking("#mflick3", {
		circular : true,
		defaultIndex: 3
	}).on({
		beforeFlickStart: handler,
		flick: handler,
		flickEnd: handler
	});

	count = inst._conf.panel.count;

	// When
	var index = count - 1;
	value = (inst._getBasePositionIndex() * 100) +"%";

	setCondition(index,0);  // move to last

	// Then
	runTest(index,value);

	// When
	setCondition(0,0);  // move to first

	// Then
	runTest(0,"0%");

	// When
	setCondition("2",0);  // move to third

	// Then
	runTest("2",value);

	// Given
	inst = new eg.Flicking("#mflick3-1", {
		circular : true
	}).on({
		beforeFlickStart: handler,
		flick: handler,
		flickEnd: handler
	});
	value = (inst._getBasePositionIndex() * 100) +"%";

	// When
	setCondition(2,0);

	// Then
	runTest(2, value);

	// When
	setCondition(1,0);

	// Then
	runTest(1,value);
});

test("Animation #1 - Default duration value", function(assert) {
	var done = assert.async();

	// Given
	this.inst = new eg.Flicking("#mflick1").on({
		flickEnd: $.proxy(function() {
			// Then
			assert.equal($getTransformValue(this.inst.getElement()).match(RegExp(value)) + "", value, "Moved to last panel?");
			done();
		}, this)
	});

	var count = this.inst._conf.panel.count,
		value = (count - 1) * 100;

	// When
	this.inst.moveTo(count - 1);  // move to last
});

test("Animation #2 - 500ms of duration", function(assert) {
	var done = assert.async();

	// Given
	this.inst = new eg.Flicking("#mflick1").on({
		flickEnd: $.proxy(function () {
			// Then
			assert.equal($getTransformValue(this.inst.getElement()).match(RegExp(value)) + "", value, "Moved to last panel?");
			done();
		}, this)
	});

	var count = this.inst._conf.panel.count,
		value = (count - 1) * 100;

	// When
	this.inst.moveTo(count - 1, 500);  // move to last
});

test("Animation #3 - Moving to last panel", function (assert) {
	var done = assert.async();

	// Given
	this.inst = new eg.Flicking("#mflick3", {
		circular : true
	}).on({
		flickEnd: $.proxy(function() {
			// Then
			assert.equal(count - 1, this.inst._conf.panel.no, "Panel number indicate last panel number?");
			assert.deepEqual($getTransformValue(this.inst.getElement()).match(RegExp(value)) + "", value, "Invoked element is placed in right position?");
			assert.ok(this.inst.getElement().html().indexOf("Layer "+ (count - 1)), "Moved correctly?");

			done();
		}, this)
	});

	count = this.inst._conf.panel.count,
	panelSize = this.inst._conf.panel.size;

	// When
	var index = count - 1;
	value = (this.inst._getBasePositionIndex() * 100) +"%";

	this.inst.moveTo(index,300);  // move to last
});

test("Animation #4 - moving to next panel", function (assert) {
	var done = assert.async();

	// Given
	this.inst = new eg.Flicking("#mflick3", {
		circular : true
	}).on({
		flickEnd: $.proxy(function() {
			// Then
			assert.equal(panelToMove, indexToMove, "The index value to move From current panel is "+ indexToMove +"?");

			assert.equal(this.inst._conf.panel.no, panelToMove, "Panel number indicate 'panel "+ indexToMove +"'?");
			assert.deepEqual($getTransformValue(this.inst.getElement()).match(RegExp(value)) + "", value, "Invoked element is placed in right position?");
			assert.ok(this.inst.getElement().html().indexOf("Layer 2"), "Moved correctly?");

			done();
		}, this)
	});

	var value = (this.inst._getBasePositionIndex() * 100) +"%";
	var panelToMove = 1;  // index value to move from current

	this.inst.moveTo(panelToMove,300);

	var indexToMove = this.inst._conf.indexToMove;
});


module("resize() method", hooks);
test("Check for panel resize", function() {
	// Given
	var element = $("#mflick1"),
		width = element.width(),
		panel, oldCoordMax, maxPosX;

	this.inst = new eg.Flicking(element, {
		defaultIndex: 2
	});

	panel = this.inst._conf.panel;
	oldCoordMax = this.inst._mcInst.options.max;

	// When
	element.width(width + 50);

	// Then
	notDeepEqual(panel.size, element.width(), "The panel width is less than the current wrapper size");

	// When
	this.inst.resize();
	maxPosX = panel.size * ( panel.count - 1 );

	// Then
	equal($getTransformValue(this.inst.$container, true), maxPosX, "Current container element is in right position?");
	deepEqual(maxPosX, this.inst._mcInst.options.max[0], "Max coord value has been set correctly?");
	deepEqual(panel.size, element.width(), "The panel width should be same as current wrapper element");
	deepEqual(this.inst.$container.width(), panel.count * panel.size, "The panel container width should be same as current panels element total width");
	notDeepEqual(oldCoordMax, this.inst._mcInst.options.max, "Should be updated MovableCoord's 'max' options value");
});

test("When change padding option", function() {
	// Given
	var inst = new eg.Flicking("#mflick1", {
		circular: true,
		previewPadding: [10,10]
	}),	panel = inst._conf.panel, padding;

	var	setCondition = function(val) {
		inst.options.previewPadding = val;
		inst.resize();

		padding = $.map(inst.$wrapper[0].style.padding.split(" "), function(num) {
			return parseInt(num, 10);
		});

		// get current padding value
		if (inst.options.horizontal) {
			padding = padding.length === 2 ?
				[ padding[1], padding[1] ] : [ padding[3], padding[1] ];
		} else {
			padding = padding.length === 2 ?
				[ padding[0], padding[0] ] : [ padding[0], padding[2] ];
		}
	};

	var runTest = function(val, horizontal) {
		deepEqual(padding, val, "Padding value changed?");

		var max, panelSize, coord, top;

		if (horizontal) {
			max = inst._mcInst.options.max[0];
			panelSize = panel.$list.width();
			coord = inst._mcInst.get()[0];
		} else {
			max = inst._mcInst.options.max[1];
			panelSize = panel.$list.height();
			coord = inst._mcInst.get()[1];
			top = parseInt(inst.$container.css("top"), 10);
		}

		equal(max, panel.size * (panel.count - 1), "Max coord value has been set correctly?");
		equal(panelSize, panel.size, "The panel width should be same as current wrapper element");
		equal(coord, panel.size * panel.index, "Current MovableCoord's value has been set correctly?");
		top && equal(val[0], top, "Container's top value has been set correctly?");
	};

	// When
	setCondition([20,20]);

	// Then
	runTest([20,20], true);

	// When
	setCondition([20,30]);

	// Then
	runTest([20,30], true);

	// Given
	inst = new eg.Flicking("#mflick2", {
		circular: true,
		previewPadding: [10,10],
		horizontal: false
	});
	panel = inst._conf.panel;

	// When
	setCondition([20,20]);

	// Then
	runTest([20,20]);

	// When
	setCondition([10,20]);

	// Then
	runTest([10,20]);
});


module("restore() method", hooks);
test("Check for basic functionality", function (assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick1").get(0),
		eventOrder = ["beforeRestore", "flick", "restore"],
		eventFired = [],
		handler = function(e) {
			var type = e.eventType;

			if(eventFired.indexOf(type) == -1) {
				!e.holding && eventFired.push(type);
			}
		};

	var inst = new eg.Flicking(el, {
		duration : 200,
		hwAccelerable : true,
		threshold : 70,
		circular: true
	}).on({
			beforeFlickStart: handler,
			flick : handler,
			flickEnd : handler,
			beforeRestore : handler,
			restore : handler
		});

	var panelIndex = {
		no: inst._conf.panel.no,
		index: inst._conf.panel.index
	};

	var setCondition = function() {
		eventFired = [];
		inst._mcInst._pos = [145,0];
		inst._setTranslate([-145,0]);
	};

	var runTest = function() {
		assert.ok(inst._mcInst.get()[0] % inst._conf.panel.size === 0, "Restored in right position?");
		assert.ok(panelIndex.no === inst.getIndex() && panelIndex.index === inst.getIndex(true), "Restored to previous panel number?");
		assert.deepEqual(eventFired, eventOrder, "Custom events are fired correctly?");
	};

	// Given
	setCondition();

	// When
	inst.restore(0);

	// Then
	runTest();

	// Given
	setCondition();

	// When
	inst.restore(100);
	assert.ok(inst.isPlaying(), "Is animating?");

	setTimeout(function() {
		runTest();
		done();
	}, 200);
});

test("When restoring after event stop", function () {
	// Given
	var el = $("#mflick1").get(0),
		eventFired = [],
		handler = function(e) {
			var type = e.eventType;

			if(eventFired.indexOf(type) == -1) {
				!e.holding && eventFired.push(type);
			}
		};

	var inst = new eg.Flicking(el, {
		duration : 100,
		hwAccelerable : true,
		threshold : 70,
		circular: true
	}).on({
		beforeFlickStart: function(e) {
			if(e.no === 0) {
				e.stop();
				this.restore(0);
			}
		},
		flick : handler,
		flickEnd : handler,
		beforeRestore : handler,
		restore : handler
	});

	var panelIndex = {
		no: inst._conf.panel.no,
		index: inst._conf.panel.index
	};

	var runTest = function() {
		ok(inst._mcInst.get()[0] % inst._conf.panel.size === 0, "Panel is in right position?");
		ok(panelIndex.no === inst.getIndex() && panelIndex.index === inst.getIndex(true), "Restored to previous panel number?");
		ok(!eventFired.length, "Events are not fired?");
	};

	// Given
	inst.prev(0);

	// Then
	runTest();

	// Given
	inst.prev(100);

	// Then
	runTest();

	// Given
	inst.moveTo(2);

	// Then
	runTest();


	// Given
	inst.moveTo(2, 100);

	// Then
	runTest();

	// Given
	inst.next(0);
	panelIndex = {
		no: inst._conf.panel.no,
		index: inst._conf.panel.index
	};
	eventFired = [];
	inst.next(0);

	// Then
	runTest();

	// Given
	inst.next(100);

	// Then
	runTest();
});


module("Custom events", hooks);
test("When changes panel normally", function(assert) {
	var done1 = assert.async();
	var done2 = assert.async();

	// Given
	var eventOrder = ["beforeFlickStart", "flick", "flickEnd"],
		data = {},
		handler = function(e) {
			var type = e.eventType;
			var id = this.$wrapper[0].id;

			var eventFired = data[id].eventFired;
			var panel = data[id].panel;

			if(eventFired.indexOf(type) == -1) {
				if (!e.holding) {
					eventFired.push(type);

					panel[type] = {
						index: e.index,
						no: e.no,
						getElement: this.getElement(),
						getIndex: this.getIndex(),
						getNextElement: this.getNextElement(),
						getPrevElement: this.getPrevElement(),
						getNextIndex: this.getNextIndex(),
						getPrevIndex: this.getPrevIndex()
					};
				}
			}
		};

	var setCondition = function(el, option) {
		var inst;

		data[el.id] = {
			eventFired: [],
			panel: {},
			inst: inst = create(el, option, handler),
			currentPanel: {
				index: inst._conf.panel.currIndex,
				no: inst._conf.panel.currNo,
				getElement: inst.getElement(),
				getIndex: inst.getIndex(),
				getNextElement: inst.getNextElement(),
				getPrevElement: inst.getPrevElement(),
				getNextIndex: inst.getNextIndex(),
				getPrevIndex: inst.getPrevIndex()
			}
		};
	};

	var runTest = function(el, done) {
		simulator(el, {
			deltaX: -70
		}, function() {

			var eventFired = data[el.id].eventFired;
			var inst = data[el.id].inst;
			var panel = data[el.id].panel;
			var currentPanel = data[el.id].currentPanel;

			// Then
			setTimeout(function() {
				assert.deepEqual(eventOrder, eventFired, "Custom events are fired in correct order");

				var isCircular = inst.options.circular;

				$.each(panel, function(i) {
					var oPanel = panel[i];
					var condition, value;

					if (i === "flickEnd") {
						condition = {
							// after flickEnd -> before flickEnd order
							// ex) getElement() on 'flickEnd' event is same as getNextElement() before 'flickEnd'
							getElement: "getNextElement",
							getIndex: "getNextIndex",
							getNextElement: isCircular ? "getPrevElement" : inst.getNextElement(),
							getNextIndex: currentPanel.no + 2,
							getPrevElement: "getElement",
							getPrevIndex: "getIndex"
						};

						$.each(oPanel, function(x) {
							if (/^(index|no|getIndex)$/.test(x)) {
								var value = currentPanel[x];

								if (!isCircular || (isCircular && x !== "index")) {
									value += 1;
								}

								assert.equal(oPanel[x], value, "Panel "+ x +" should be changed on '"+ i +"' event.");

							} else {
								value = condition[x];

								if (typeof value === "string") {
									value = currentPanel[ value ];
								}

								assert.deepEqual(oPanel[x], value, "The value from '"+ x +"', should be equals with previous '"+ condition[x] +"' changed on "+ i +" event.");
							}
						});

					} else {
						$.each(oPanel, function(x) {
							assert.deepEqual(oPanel[x], currentPanel[x], "The value from '"+ x +"', shouldn't be changed during '"+ i +"' event.");
						});
					}
				});

				done();
			},1000);
		});
	};

	var el = $("#mflick1")[0];
	setCondition(el);
	runTest(el, done1);

	el = $("#mflick2")[0];
	setCondition(el, { circular: true });
	runTest(el, done2);
});

test("When stop event on beforeRestore", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick1").get(0),
		eventFired = [],
		called = false,
		handler = function(e) {
			var type = e.eventType;

			if(eventFired.indexOf(type) == -1) {
				eventFired.push(type);
			}
		};

	this.inst = new eg.Flicking(el, { threshold : 100 }).on({
		beforeFlickStart: handler,
		flick : handler,
		flickEnd : handler,
		beforeRestore : function(e) {
			e.stop();
		},
		restore : function(e) {
			called = true;
		}
	});

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
		deltaX: -70,
		deltaY: 0,
		duration: 500,
		easing: "linear"
	}, function() {
		// Then
		setTimeout(function() {
			assert.ok(!called, "restore event should not be triggered");
			done();
		},1000);
    });
});


test("When stop on flick event", function (assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick1").get(0),
		eventFired = [],
		handler = function(e) {
			var type = e.eventType;

			if(eventFired.indexOf(type) == -1) {
				eventFired.push(type);
			}
		},
		translate = "",
		inst = this.inst = new eg.Flicking(el).on({
			beforeFlickStart: handler,
			flick : function(e) {
				e.stop();
				translate = $getTransformValue(inst.$container, true);
			},
			flickEnd : handler,
			beforeRestore : handler,
			restore : handler
		});

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
		deltaX: -70,
		deltaY: 0,
		duration: 500,
		easing: "linear",
		touches : 1
	}, function() {
		// Then
		setTimeout(function() {
			assert.notEqual(translate, $getTransformValue(inst.$container, true), "The panel should not be moved during change");
			done();
		},800);
    });
});

test("When stop on beforeFlickStart event", function (assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick1").get(0),
		eventFired = [],
		eventDirection = [],
		handler = function (e) {
			var type = e.eventType;

			if (eventFired.indexOf(type) == -1) {
				eventFired.push(type);
				eventDirection.push(e.direction);
			}
		},
		translate = "",
		inst = this.inst = new eg.Flicking(el).on({
			beforeFlickStart: function (e) {
				e.stop();
				eventFired = [];
				eventDirection = [];
				translate = $getTransformValue(inst.$container, true);
			},
			flick: handler,
			flickEnd: handler,
			beforeRestore: handler,
			restore: handler
		}),
		panelIndex = {
			no: inst._conf.panel.no,
			index: inst._conf.panel.index
		};

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
		deltaX: -70,
		deltaY: 0,
		duration: 500,
		easing: "linear",
		touches: 1
	}, function () {
		// Then
		var currPos = inst._getDataByDirection(inst._mcInst.get())[0];

		assert.ok(currPos % inst._conf.panel.size, "The panel stopped to move and is not positioned well?");

		// When
		inst.restore(0);
		currPos = inst._getDataByDirection(inst._mcInst.get())[0];

		// Then
		assert.ok(currPos % inst._conf.panel.size === 0, "The panel restored in its original position?");

		assert.deepEqual(panelIndex, {
			no: inst._conf.panel.no,
			index: inst._conf.panel.index
		}, "Restored panel index value?");

		assert.deepEqual(["beforeRestore", "flick", "restore"], eventFired, "Restore events are fired correctly?");

		var direction = $.unique(eventDirection);
		assert.ok(direction.length === 1 && direction[0] === eg.MovableCoord.DIRECTION_RIGHT, "Direction value of restore event are right?");
		done();
	});
});

test("Events fired on move API call when duration is 0", function () {
	var el = $("#mflick1").get(0),
		eventFired = [],
		eventOrder = ["beforeFlickStart", "flick", "flickEnd"],
		panel = {},
		handler = function (e) {
			var type = e.eventType;

			if (eventFired.indexOf(type) == -1) {
				eventFired.push(type);

				panel[type] = {
					index: e.index,
					no: e.no
				};
			}
		},
		inst = new eg.Flicking(el, { circular: true }).on({
			beforeFlickStart: handler,
			flick: handler,
			flickEnd: handler
		});

	var currentPanel,
		setCondition = function() {
			eventFired = [];

			currentPanel = {
				index: inst._conf.panel.index,
				no: inst._conf.panel.no
			};
		},
		runTest = function() {
			$.each(panel, function(i, v) {
				var oPanel = panel[i];

				if (i === "flickEnd") {
					ok(oPanel.no === currentPanel.no + 1 || oPanel.no === currentPanel.no - 1, "Panel no should be change on 'flickEnd' event.");
				} else {
					equal(oPanel.no, currentPanel.no, "Panel no shouldn't be changed before 'flickEnd' event.");
				}
			});
		}


	// When
	setCondition();
	inst.next(0);

	// Then
	deepEqual(eventFired, eventOrder, "Events are fired in correct order, after calling next()?");
	runTest();

	// When
	setCondition();
	inst.prev(0);

	// Then
	deepEqual(eventFired, eventOrder, "Events are fired in correct order, after calling prev()?");
	runTest();

	// When
	setCondition();
	inst.moveTo(1,0);

	// Then
	deepEqual(eventFired, eventOrder, "Events are fired in correct order, after calling moveTo()?");
	runTest();
});

test("Events fired on move API call when duration is greater than 0", function (assert) {
	var done = assert.async();
	var el = $("#mflick1").get(0),
		eventFired = {
			next: [],
			prev: [],
			moveTo: []
		},
		eventOrder = ["beforeFlickStart", "flick", "flickEnd"],
		method = "",
		handler = function (e) {
			var type = e.eventType,
				event = eventFired[method];

			if (event.indexOf(type) == -1) {
				event.push(type);
			}
		},
		inst = this.inst = new eg.Flicking(el, { circular: true }).on({
			beforeFlickStart: handler,
			flick: handler,
			flickEnd: handler
		});

	// When
	setTimeout(function() {
		method = "next";
		inst.next(10);
	}, 200);

	// When
	setTimeout(function() {
		method = "prev";
		inst.prev(10);
	}, 400);

	// When
	setTimeout(function() {
		method = "moveTo";
		inst.moveTo(1, 10);
	}, 600);

	setTimeout(function() {
		for(var x in eventFired) {
			assert.deepEqual(eventFired[x], eventOrder, "Events are fired in correct order, after calling "+ x +"()?");
		}
		done();
	}, 1000);
});

test("Check for continuous action: 1)restore, 2)flick ", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick1").get(0),
		eventFired = [],
		handler = function(e) {
			var type = e.eventType;

			if(eventFired.indexOf(type) == -1) {
				!e.holding && eventFired.push(type);
			}
		};

	this.inst = new eg.Flicking(el).on({
		beforeFlickStart: handler,
		flick : handler,
		flickEnd : handler,
		beforeRestore : handler,
		restore : handler
	});

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
		deltaX: -30,
		deltaY: 0,
		duration: 500,
		easing: "linear"
	}, function() {
		// Then
		setTimeout(function() {
			assert.deepEqual(["beforeRestore", "flick", "restore"], eventFired, "Custom events for restoring are fired in correct order");
			eventFired = [];

			// When
			Simulator.gestures.pan(el, {
				pos: [0, 0],
				deltaX: -70,
				deltaY: 0,
				duration: 500,
				easing: "linear"
			}, function() {
				// Then
				setTimeout(function() {
					assert.deepEqual(["beforeFlickStart", "flick", "flickEnd"], eventFired, "Custom events for normal moves are fired in correct order");
					done();
				},1000);
			});
		},1000);
	});
});

test("Check for direction during hold and unhold on flick event", function(assert) {
	var done1 = assert.async();
	var done2 = assert.async();
	var done3 = assert.async();
	var done4 = assert.async();

	// Given
	var el,
		directionHold = [],
		directionUnhold = [],
		handler = function(e) {
			if(e.holding) {
				directionHold.push(e.direction);
			} else {
				directionUnhold.push(e.direction);
			}
		};

	var check = function(arr, val) {
		return arr.join("").replace(new RegExp(val,"g"), "") === "";
	};

	// When
	el = $("#mflick1")[0];
	direction = null;

	this.inst = new eg.Flicking(el, {
		circular: true
	}).on({
		flick: handler,
		circular: true
	});

	Simulator.gestures.pan(el, {
		pos: [50, 50],
		deltaX: -100,
		deltaY: 90,
		duration: 1000,
		easing: "linear"
	}, function() {
		// Then
		assert.ok(check(directionHold, eg.MovableCoord.DIRECTION_LEFT), "Is left during touch hold?");
		assert.ok(check(directionUnhold,eg.MovableCoord.DIRECTION_LEFT), "Is left during touch unhold?");
		done1();
	});

	// Given
	setTimeout(function() {
		el = $("#mflick2")[0];
		direction = null;
		directionHold = [];
		directionUnhold = [];

		this.inst = new eg.Flicking(el, {
			circular: true
		}).on({
			flick: handler,
			circular: true
		});

		// When
		Simulator.gestures.pan(el, {
			pos: [50, 50],
			deltaX: 100,
			deltaY: 50,
			duration: 1000,
			easing: "linear"
		}, function() {
			// Then
			assert.ok(check(directionHold, eg.MovableCoord.DIRECTION_RIGHT), "Is right during touch hold?");
			assert.ok(check(directionUnhold, eg.MovableCoord.DIRECTION_RIGHT), "Is right during touch unhold?");
			done2();
		});
	}, 1500);

	// Given
	setTimeout(function() {
		el = $("#mflick3")[0];
		direction = null;
		directionHold = [];
		directionUnhold = [];

		this.inst = new eg.Flicking(el, {
			circular: true,
			horizontal: false
		}).on({
			flick: handler,
			circular: true
		});

		// When
		Simulator.gestures.pan(el, {
			pos: [50, 50],
			deltaX: 50,
			deltaY: -100,
			duration: 1000,
			easing: "linear"
		}, function() {
			// Then
			assert.ok(check(directionHold, eg.MovableCoord.DIRECTION_UP), "Is up during touch hold?");
			assert.ok(check(directionUnhold, eg.MovableCoord.DIRECTION_UP), "Is up during touch unhold?");
			done3();
		});
	}, 3000);

	// Given
	setTimeout(function() {
		el = $("#mflick3-1")[0];
		direction = null;
		directionHold = [];
		directionUnhold = [];

		this.inst = new eg.Flicking(el, {
			circular: true,
			horizontal: false
		}).on({
			flick: handler,
			circular: true
		});

		// When
		Simulator.gestures.pan(el, {
			pos: [50, 50],
			deltaX: -50,
			deltaY: 100,
			duration: 1000,
			easing: "linear"
		}, function() {
			// Then
			assert.ok(check(directionHold, eg.MovableCoord.DIRECTION_DOWN), "Is down during touch hold?");
			assert.ok(check(directionUnhold, eg.MovableCoord.DIRECTION_DOWN), "Is down during touch unhold?");
			done4();
		});
	}, 4500);
});


module("Miscellaneous", hooks);
test("Workaround for buggy link highlighting on android 2.x", function () {
	// Given
	eg.hook.agent = function () {
		return {
			// GalaxyS:2.3.4
			"device": "GalaxyS:2.3.4",
			"ua": "Mozilla/5.0 (Linux;U;Android 2.3.4;ko-kr;SHW-M110S Build/GINGERBREAD)AppleWebKit/533.1(KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
			"os": {
				"name": "android",
				"version": "2.3.4"
			},
			"browser": {
				"name": "default",
				"version": "-1"
			},
			"isHWAccelerable": false,
			"isTransitional": false,
			"_hasClickBug": false
		};
	};

	eg.invoke("flicking",[null, eg]);

	// When
	var inst = this.inst = new eg.Flicking("#mflick1"),
		$dummyAnchor = $(inst.$wrapper).find("> a:last-child")[0],
		leftValue;

	// Then
	ok($dummyAnchor.tagName === "A" && !$dummyAnchor.innerHTML, "Dummy anchor element should be added.");

	// When
	inst.next(0);

	leftValue = $.css(inst.getElement()[0], "left");

	// Then
	ok(leftValue && parseInt(leftValue, 10) > 0, "Panel should be moved using left property instead of translate.");
});

test("Check public methods return", function (assert) {
	var done = assert.async();
	var inst = new eg.Flicking("#mflick1", { circular: true });
	var instance = [];

	// When
	setTimeout(function() {
		instance.push({ method: "next()", data: inst.next(0) });
	}, 100);

	// When
	setTimeout(function() {
		instance.push({ method: "prev()", data: inst.prev(0) });
	}, 200);

	// When
	setTimeout(function() {
		instance.push({ method: "moveTo()", data: inst.moveTo(1,0) });
	}, 300);

	// When
	setTimeout(function() {
		instance.push({ method: "resize()", data: inst.resize() });
	}, 400);

	// When
	setTimeout(function() {
		instance.push({ method: "restore()", data: inst.restore() });
	}, 500);

	setTimeout(function() {
		instance.forEach(function(v,i) {
			assert.deepEqual(v.data, inst, v.method + " is returning instance it self?");
		});
		done();
	}, 1200);

});

test("Check panel move method, depending existence of css transform property", function () {
	// when
	var inst = new eg.Flicking("#mflick1", { circular: true });
	inst.next(0);

	// Then
	ok($getTransformValue(inst.$container).indexOf("translate") >= 0, "When support transform, should use translate to move.");

	// When
	var fakeDoc = {
		documentElement : {
			style: {}
		}
	};

	eg.invoke("flicking",[null, null, null, fakeDoc]);
	var inst2 = new eg.Flicking("#mflick2", { circular: true });
	inst2.next(0);

	// Then
	ok(inst2.$container[0].style.left.length > 0, "When doesn't support transform, should use left/top to move.");
});

test("When intent to initialize with non-existent element, should throw error.", function (assert) {
	assert.throws(function() {
		// When
		new eg.Flicking("#NO-ELEMENT");
	}, function( err ) {
		// Then
		return true;
	});

	// Given
	$(document.body).append("<div id='no-child'> </div>");

	assert.throws(function() {
		// When
		new eg.Flicking("#no-child");
	}, function( err ) {
		// Then
		return true;
	});
});

test("Custom event name with prefix: to handle jQuery plugin style", function () {
	// When
	var events = [
			"flicking:beforeFlickStart",
			"flicking:flick",
			"flicking:flickEnd",
			"flicking:beforeRestore",
			"flicking:restore"
		],
		eventFired = [],
		handler = function(e) {
			eventFired.push(e.eventType);
		};

	this.inst = new eg.Flicking("#mflick1",{ circular: true }, "flicking:").on({
		"flicking:beforeFlickStart": handler,
		"flicking:flick": handler,
		"flicking:flickEnd": handler,
		"flicking:beforeRestore": handler,
		"flicking:restore": handler
	});

	this.inst.next(0);
	this.inst.trigger("flicking:beforeRestore");
	this.inst.trigger("flicking:restore");

	deepEqual(events, eventFired, "Events did fired correctly?");
});