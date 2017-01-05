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
function create(el, option, customEvt) {
	el = typeof el === "string" ? $(el)[0] : el;
	el.eventFired = [];
	el.eventDirection = [];
	customEvt = customEvt || {};
	var handler;

	if ($.isPlainObject(customEvt)) {
		handler = function(e) {
			var type = e.eventType;
			var fired = el.eventFired;
			var direction = el.eventDirection;

			if (fired.length === 0 || fired[fired.length - 1] !== type) {
				fired.push(type);
				direction.push(e.direction);
			}
		};
	} else if(typeof customEvt === "function") {
		handler = customEvt;
		customEvt = {};
	}

	var inst = new eg.Flicking(el, option || {}).on(
		$.extend({
			beforeFlickStart: handler,
			flick: handler,
			flickEnd: handler,
			beforeRestore: handler,
			restore: handler
		}, customEvt));

	this.inst.push(inst);
	return inst;
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

// hooks for each test
var hooks = {
	beforeEach: function() {
		this.inst = [];
		this.create = window.create;
	},
	afterEach: function() {
		$.each($.makeArray(this.inst), function(i, v) {
			v && v.destroy && v.destroy();
		});

		this.inst = null;
	}
};

QUnit.module("Initialization", hooks);
QUnit.test("Check for the initialization", function(assert) {
	// Given
	var inst1 = this.create("#mflick1");
	var inst2 = this.create("#mflick2", { horizontal: false });

	// https://github.com/naver/egjs/issues/216
	var $container = $("#mflick1-1 > :first-child").attr("id", "container");
	var inst3 = this.create("#mflick1-1");

	// Then
	assert.deepEqual(inst1.$container.width(), inst1.$container.parent().width(), "Then panel container was added and the width is same as wrapper element.");
	assert.deepEqual(inst2.$container.height(), inst2.$container.parent().height(), "Then panel container was added and the height is same as wrapper element.");
	assert.deepEqual(inst3.$container.width(), inst3.$container.parent().width(), "Then panel container was added and the width is same as wrapper element.");

	// Given
	inst1._conf.panel.$list.css("padding", "0 20px");
	inst2._conf.panel.$list.css("padding", "20px 0");

	// Then
	assert.equal(inst1._conf.panel.size, inst1._conf.panel.$list.outerWidth(), "The panel should maintain same width as wrapper element.");
	assert.equal(inst2._conf.panel.size, inst2._conf.panel.$list.outerHeight(), "The panel should maintain same height as wrapper element.");

	assert.equal($container.attr("id"), inst3.$container.attr("id"), "The given DOM is used as container element?");
});

QUnit.module("Setting options", hooks);
QUnit.test("circular", function(assert) {
	// Given
	this.create("#mflick1");
	this.create("#mflick2", { circular : true });
	this.create("#mflick2-1", { circular : true });
	this.create("#mflick3", { circular : true, horizontal : false });

	// Given
	var inst = this.inst[0];

	// When
	inst.moveTo(inst._conf.panel.origCount - 1,0);

	// Then
	assert.equal(inst.getElement().next().length, 0, "Is not circular?");

	// Given
	inst = this.inst[1];

	// When
	inst.moveTo(inst._conf.panel.origCount - 1,0);

	// Then
	assert.ok(inst.getNextElement(), "Is circular?");

	// Given
	inst = this.inst[2];

	// Then
	assert.ok(inst._conf.panel.count > inst._conf.panel.origCount, "When panel elements are not enough, should be added cloned elements");

	// Given
	inst = this.inst[3];

	// When
	inst.moveTo(inst._conf.panel.origCount - 1,0);

	// Then
	assert.ok(inst.getNextElement(), "Is circular?");
});

QUnit.test("previewPadding - horizontal", function(assert) {
	// Given
	var inst = this.create("#mflick3", {
			circular : true,
			previewPadding : [ 50, 70 ]
		});

	var padding = inst.options.previewPadding;
	var right = parseInt(inst.$wrapper.css("padding-right"), 10);
	var left = parseInt(inst.$wrapper.css("padding-left"), 10);
	var wrapperWidth = inst.$wrapper.innerWidth();
	var panelWidth = inst.$container.children().width();

	// Then
	assert.ok(left === padding[0] && right === padding[1], "Preview padding value applied correctly?");
	assert.equal(wrapperWidth, panelWidth + right + left, "Each panel's width should be same as wrapper element's width");
});

QUnit.test("previewPadding - vertical", function(assert) {
	// Given
	var inst = this.create("#mflick3", {
			circular : true,
			horizontal : false,
			previewPadding : [ 15, 10 ]
		});

	var padding = inst.options.previewPadding;
	var top = parseInt(inst.$wrapper.css("padding-top"), 10);
	var bottom = parseInt(inst.$wrapper.css("padding-bottom"), 10);
	var wrapperHeight = inst.$wrapper.innerHeight();
	var panelHeight = inst.$container.children().height();

	// Then
	assert.ok(top === padding[0] && bottom === padding[1], "Preview padding value applied correctly?");
	assert.equal(wrapperHeight, panelHeight + top + bottom, "Each panel's height should be same as wrapper element's height");
});

QUnit.test("bounce", function(assert) {
	var bounce = 50;

	// Given
	var inst = this.create("#mflick3", { bounce : bounce });

	// Then
	assert.deepEqual(inst.options.bounce, [50, 50], "Bounce value set correctly?");

	// When
	bounce = [ 15, 20 ];
	inst = this.create("#mflick3-1", { bounce : bounce });

	// Then
	assert.deepEqual(inst.options.bounce, bounce, "Bounce value set correctly?");
});

QUnit.test("bounce - left/up", function(assert) {
	var done1 = assert.async();
	var done2 = assert.async();

	// Given
	var el1 = $("#mflick1")[0];
	var el2 = $("#mflick2")[0];

	var bounce = [ 50, 70 ];
	var depaPos, depaPos2;

	this.create(el1, { bounce : bounce }, {
		beforeRestore: function(e) {
			depaPos = e.depaPos[0];
		}
	});

	this.create(el2, {
		bounce : bounce,
		horizontal: false
	}, {
		beforeRestore: function(e) {
			depaPos2 = e.depaPos[1];
		}
	});

	// When
	simulator(el1, {
		pos: [0, 0],
		deltaX: 250
	}, function() {
		// Then
		assert.ok(depaPos === -bounce[0], "Left bounce distance is correct?");
		done1();
	});

	// When
	simulator(el2, {
		pos: [0, 0],
		deltaX: 0,
		deltaY: 250
	}, function() {
		// Then
		assert.ok(depaPos2 === -bounce[0], "Left bounce distance is correct?");
		done2();
	});
});


QUnit.test("bounce - right/down", function(assert) {
	var done1 = assert.async();
	var done2 = assert.async();

	// Given
	var el1 = $("#mflick1")[0];
	var el2 = $("#mflick2")[0];

	var bounce = [ 50, 70 ];
	var depaPos, depaPos2;

	var inst = this.inst;

	this.create(el1, {
		bounce : bounce,
		defaultIndex: 2
	}, {
		beforeRestore: function(e) {
			depaPos = e.depaPos[0];
		}
	});

	this.create(el2, {
		bounce : bounce,
		defaultIndex: 2,
		horizontal: false
	}, {
		beforeRestore: function(e) {
			depaPos2 = e.depaPos[1];
		}
	});

	// When
	var max1 = inst[0]._mcInst.options.max[0];

	simulator(el1, {
		pos: [0, 0],
		deltaX: -250,
		deltaY: 0
	}, function() {
		// Then
		assert.ok(depaPos === max1 + bounce[1], "Right bounce distance is correct?");
		done1();
	});

	// When
	var max2 = inst[1]._mcInst.options.max[1];

	simulator(el2, {
		pos: [100, 50],
		deltaX: 0,
		deltaY: -250
	}, function() {
		// Then
		assert.ok(depaPos2 === max2 + bounce[1], "Down bounce distance is correct?");
		done2();
	});
});

QUnit.test("threshold #1 - (horizontal) when moved more than threshold pixels", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick2")[0];
	var changedPanelNo = 0;

	var inst = this.create(el, {
		circular : true,
		threshold : 80
	}, {
		flickEnd : function(e) {
			changedPanelNo = e.no;
		}
	});

	var panelNo = inst._conf.panel.no;

	// When
	simulator(el, {
		pos: [0, 0],
		deltaX: -100,
		deltaY: 0
	}, function() {
		// Then
		setTimeout(function() {
			assert.deepEqual(panelNo + 1, changedPanelNo, "Moved to next panel?");
			done();
		}, 500);
    });
});

QUnit.test("threshold #2 - (vertical) when moved more than threshold pixels", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick2")[0];
	var changedPanelNo = 0;

	var inst = this.create(el, {
		circular : true,
		horizontal : false,
		threshold : 20
	}, {
		flickEnd : function(e) {
			changedPanelNo = e.no;
		}
	});

	var panelNo = inst._conf.panel.no;

	// When
	simulator(el, {
		pos: [0, 0],
		deltaX: 0,
		deltaY: -100
	}, function() {
		// Then
		setTimeout(function() {
			assert.deepEqual(panelNo + 1, changedPanelNo, "Moved to next panel?");
			done();
		},500);
    });
});

QUnit.test("threshold #3 - (horizontal) when moved less than threshold pixels", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick2")[0];
	var inst = this.create(el, {
		circular : true,
		threshold : 80
	}, {
		flickEnd : function(e) {
			panelNo = e.no;
		}
	});

	var panelNo = inst._conf.panel.no;

	// When
	simulator(el, {
		pos: [0, 0],
		deltaX: -70,
		deltaY: 0
	}, function() {
		// Then
		assert.deepEqual(inst._conf.panel.no, panelNo, "Not moved to next panel?");
		done();
    });
});

QUnit.test("threshold #4 - (vertical) when moved less than threshold pixels", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick2")[0];
	var inst = this.create(el, {
		circular : true,
		horizontal : false,
		threshold : 20
	}, {
		flickEnd : function(e) {
			panelNo = e.no;
		}
	});

	var panelNo = inst._conf.panel.no;

	// When
	simulator(el, {
		pos: [0, 0],
		deltaX: 0,
		deltaY: -10
	}, function() {
		// Then
		assert.deepEqual(inst._conf.panel.no, panelNo, "Not moved to next panel?");
		done();
    });
});

QUnit.test("defaultIndex", function(assert) {
	// Given
	var defaultIndex = 3;
	var inst = this.create("#mflick3", {
		circular : true,
		defaultIndex : defaultIndex
	});

	// Then
	assert.equal(inst._conf.panel.no, defaultIndex, "The initial panel number should be "+ defaultIndex);
});

QUnit.test("hwAccelerable", function(assert) {
	// Given
	var inst = this.create("#mflick3", {
		hwAccelerable: true,
		defaultIndex: 1
	});

	var container = inst.$container;
	var panel = inst._conf.panel.$list[0];

	// Then
	assert.ok($.css(container[0], "willChange") === "transform" || $getTransformValue(container).indexOf("3d") >= 0, "HW Acceleration css property is prensent in container element?");
	assert.ok($.css(panel, "willChange") === "transform" || $getTransformValue(panel).indexOf("3d") >= 0, "HW Acceleration css property is prensent in panel element?");
});

QUnit.test("adaptiveHeight", function(assert) {
	// Given
	var inst = this.create("#mflick4", {
		adaptiveHeight: true,
		circular: true
	});

	// Then
	for (var i = 0; i < inst._conf.panel.count; i++) {
		var panelHeight = inst.getElement().outerHeight(true);
		assert.ok(panelHeight === inst.$container.height(), "Should update container's height according to each panel's height");
		inst.next(0);
		assert.ok(panelHeight === Number(inst.getPrevElement().children(':first').attr('data-height')), "Should cache each panel's height to first element");
	}
});

QUnit.test("thresholdAngle", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick3")[0];
	var changedPanelNo = 0;

	this.create(el, {
		circular: true,
		threshold: 30,
		thresholdAngle: 15
	}, {
		flickEnd: function(e) {
			changedPanelNo = e.no;

			// Then
			assert.equal(changedPanelNo, 1, "Panel should be changed.");
			done();
		},

	});

	// When
	simulator(el, {
		pos: [100, 0],
		deltaX: -100,
		deltaY: 30,
		duration: 500
	}, function() {
		setTimeout(function() {
			assert.equal(changedPanelNo, 0, "Panel should not be changed.");

			simulator(el, {
				pos: [100, 0],
				deltaX: -100,
				deltaY: 10,
				duration: 500
			});
		}, 300)
	});
});


QUnit.module("Methods call", hooks);
QUnit.test("getIndex()", function(assert) {
	// Given
	var defaultIndex = 3;
	var inst = this.create("#mflick3", {
		circular : true,
		defaultIndex : defaultIndex
	});

	// Then
	assert.equal(defaultIndex, inst.getIndex(), "Get current logical panel number");
	assert.notEqual(inst.getIndex(true), inst.getIndex(), "Physical and logical panel number are different");
	assert.deepEqual(inst._conf.panel.$list[inst.getIndex(true)], inst.getElement()[0], "Get current panel using physical panel number");
});

QUnit.test("getElement()", function(assert) {
	// Given
	var inst = this.create("#mflick2", { circular : true });
	var element = inst.getElement();
	var value = (inst._getBasePositionIndex() * 100) +"%";

	// Then
	assert.ok(element.length, "The element was invoked correctly?");
	assert.deepEqual($getTransformValue(element).match(RegExp(value)) + "", value, "Invoked element is placed in right position?");
});

QUnit.test("getNextElement()", function(assert) {
	// Given
	var inst = this.create("#mflick2", { circular : true });
	var element = inst.getNextElement();
	var currentTransform = $getTransformValue(inst.getElement(), true);
	var nextTransform = $getTransformValue(element, true);

	// Then
	assert.ok(element, "The element was invoked correctly?");
	assert.ok(currentTransform < nextTransform, "Invoked element is placed next to the current element?");
});

QUnit.test("getNextIndex()", function(assert) {
	// Given
	var inst = this.create("#mflick3", { circular : true });
	var index = inst.getNextIndex();

	// Then
	assert.deepEqual(typeof index, "number", "Returned number?");
	assert.deepEqual(index, inst.getIndex() + 1, "Is the next index of current?");

	// When
	inst.moveTo(inst._conf.panel.count - 1,0);  // move to last
	index = inst.getNextIndex();

	// Then
	assert.deepEqual(index, 0, "Next index of last, should be '0'");

	// When
	index = inst.getNextIndex(true);

	// Then
	assert.ok(index > 0, "Next physical index of last, should be great than 0");
});

QUnit.test("getPrevElement()", function(assert) {
	// Given
	var inst = this.create("#mflick2", { circular : true });
	var element = inst.getPrevElement();
	var currentTransform = $getTransformValue(inst.getElement(), true);
	var prevTransform = $getTransformValue(element, true);

	// Then
	assert.ok(element, "The element was invoked correctly?");
	assert.ok(currentTransform > prevTransform, "Invoked element is placed previous to the current element?");
});

QUnit.test("getPrevIndex()", function(assert) {
	// Given
	var inst = this.create("#mflick3", { circular : true });
	var index = inst.getPrevIndex();

	// Then
	assert.deepEqual(typeof index, "number", "Returned number?");
	assert.deepEqual(index, inst._conf.panel.count - 1, "Previous index of first, should be "+ (inst._conf.panel.count - 1));

	// When
	inst.moveTo(2,0);  // move to second
	index = inst.getPrevIndex();

	// Then
	assert.deepEqual(index, inst.getIndex() - 1, "Is the previous index of current?");

	// When
	inst.moveTo(0,0);  // move to the first
	index = inst.getPrevIndex(true);

	// Then
	assert.ok(inst.getPrevIndex() > index, "Previous physical index, should be less than logical index");
});

QUnit.test("getAllElements()", function(assert) {
	// Given
	var inst = this.create("#mflick2", { circular : true });
	var elements = inst.getAllElements();

	// Then
	assert.deepEqual(elements.length, inst.$container.children().length, "Returned all panel elements?");
});

QUnit.test("getTotalCount()", function(assert) {
	// Given
	this.create("#mflick1");
	this.create("#mflick2-1", { circular : true });

	var inst = this.inst[0];

	// When
	var counts = inst.getTotalCount();

	// Then
	assert.deepEqual(counts, inst.$container.children().length, "Return total panel elements count?");

	// Given
	inst = this.inst[1];

	// When
	counts = inst.getTotalCount();

	// Then
	assert.ok(counts < inst.$container.children().length, "When circular options is set, the elements count is less than physical elements count");

	// When
	counts = inst.getTotalCount(true);
	assert.deepEqual(counts, inst.$container.children().length, "Returned physical elements total count?");
});

QUnit.test("isPlaying()", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick3")[0];
	var inst = this.create(el);

	// Then
	assert.ok(!inst.isPlaying(), "Must return 'false' when not animating");

	// When
	simulator(el, {
		pos: [0, 0],
		deltaX: -100,
		deltaY: 0,
		duration: 1000
	}, function() {
		// Then
		assert.ok(inst.isPlaying(), "During the animation must return 'true'");
		done();
    });
});

QUnit.test("next()", function(assert) {
	// Given
	var inst = this.create("#mflick2-1", { circular : true });
	var nextElement = inst.getNextElement();

	// When
	inst.next(0);
	var element = inst.getElement();
	var value = (inst._getBasePositionIndex() * 100) +"%";

	// Then
	assert.deepEqual($getTransformValue(element).match(RegExp(value)) + "", value, "Moved to next panel correctly?");
	assert.deepEqual(element[0], nextElement[0], "The next element is what expected?");
});

QUnit.test("prev()", function(assert) {
	// Given
	var inst = this.create("#mflick2-1", { circular : true });
	var prevElement = inst.getPrevElement();

	// When
	inst.prev(0);
	var element = inst.getElement();
	var value = (inst._getBasePositionIndex() * 100) +"%";

	// Then
	assert.deepEqual($getTransformValue(element).match(RegExp(value)) + "", value, "Moved to previous panel correctly?");
	assert.deepEqual(element.html(), prevElement.html(), "The previous element is what expected?");
});

QUnit.test("prev() / next() - Animation", function(assert) {
	var done = assert.async();

	// Given
	var handler = function() {
		var element = this.getElement();
		var value = (this._getBasePositionIndex() * 100) + "%";

		var html = element.html();
		var targetHtml = nextElement.length ?
			nextElement.shift().html() : prevElement.shift().html();

		// Then
		assert.deepEqual($getTransformValue(element).match(RegExp(value)) + "", value, "Moved to next panel correctly?");
		assert.deepEqual(html, targetHtml, "The previous/next element is what expected?");

		!prevElement.length && done();
	};

	var inst = this.inst;

	this.create("#mflick1", { circular : true }, { flickEnd: handler });
	this.create("#mflick2", { circular : true }, { flickEnd: handler });
	this.create("#mflick2-1", { circular : true }, { flickEnd: handler });
	this.create("#mflick3-1", { circular : true }, { flickEnd: handler });

	var nextElement = [ inst[0].getNextElement(), inst[1].getNextElement() ];
	var prevElement = [ inst[2].getPrevElement(), inst[3].getPrevElement() ];

	// When
	inst[0].next();
	inst[1].next(100);

	inst[2].prev();
	inst[3].prev(300);
});

QUnit.test("enableInput() / disableInput()", function(assert) {
	var done1 = assert.async();
	var done2 = assert.async();

	// Given
	var el = $("#mflick1")[0];
	var isEventFired = false;

	var inst = this.create(el, null, function(e) {
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

QUnit.test("destroy()", function(assert) {
	var done = assert.async();

	// Given
	var $el = $("#mflick1");
	var $panel = $el.children();
	var isEventFired = false;

	var origPanelStyle = {
		wrapper: {
			className: $el.attr("class") || "",
			style: $el.attr("style") || ""
		},
		list: $panel.map(function(i,v) {
			return {
				className: $(v).attr("class") || "",
				style: $(v).attr("style") || ""
			};
		})
	};

	var inst = this.create($el, {
			defaultIndex: 2,
			circular: true
		}, function(e) {
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

		assert.equal($el.attr("class") || "", origPanelStyle.wrapper.className, "Wrapper element class has been restored?");
		assert.equal($el.attr("style") || "", origPanelStyle.wrapper.style, "Wrapper element style has been restored?");

		$panel.each(function(i, v) {
			var $panelEl = $(v);

			assert.equal($panelEl.attr("class") || "", origPanelStyle.list[i].className, "Panel element class has been restored?");
			assert.equal($panelEl.attr("style") || "", origPanelStyle.list[i].style, "Panel element style has been restored?");
		});

		// check for the resources release
		for(var x in inst) {
			assert.equal(inst[x], null, "'" + x + "' is released?");
		}

		done();
	});

	// Given
	var $el2 = $("#mflick2");
	var panelCount = $el2.children().length;
	var inst2 = this.create($el2[0], {
		previewPadding: 10,
		circular: true
	});

	// When
	inst2.destroy();

	// Then
	assert.equal(panelCount, $el2.children().length, "Removed cloned panel elements?");
});


QUnit.module("moveTo() method", hooks);
QUnit.test("Check for functionality", function(assert) {
	// Given
	var eventOrder = [ "beforeFlickStart", "flick", "flickEnd" ];

	var setCondition = function(no, duration) {
		el = inst.$wrapper[0];
		el.eventFired = [];
		inst.moveTo(no, duration);
	};

	var runTest = function(no, value) {
		assert.equal(inst._conf.panel.no, no, "Panel number indicate correct panel number?");
		assert.equal($getTransformValue(inst.getElement()).match(RegExp(value)) + "", value, "Invoked element is placed in right position?");
		assert.ok(inst.getElement().html().indexOf("Layer "+ no), "Moved correctly?");
		assert.deepEqual(el.eventFired, eventOrder, "Custom events are fired?");
	};

	var el;
	this.create("#mflick1");
	this.create("#mflick2", { defaultIndex: 1 });
	this.create("#mflick3", {
		circular : true,
		defaultIndex: 3
	});
	this.create("#mflick3-1", { circular : true });

	// Given - test #1
	var inst = this.inst[0];
	var count = inst._conf.panel.count;
	var value = (count - 1) * 100;

	// When
	setCondition(count - 1,0);  // move to last

   	// Then
	runTest(count - 1, value);

	// When
	setCondition(0, 0);  // move to first

	// Then
	runTest(0, "0%");


	// Given - test #2
	inst = this.inst[1];

	// When
	setCondition(2,0);

	// Then
	runTest(2, value);

	// When
	setCondition(0,0);

	// Then
	runTest(0,"0%");

	// Given - test #3
	inst = this.inst[2];
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

	// Given - test #4
	inst = this.inst[3];
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

QUnit.test("Check for the direction", function(assert) {
	var el;
	var inst;
	var MC = eg.MovableCoord;

	var setCondition = function(no) {
		el = inst.$wrapper[0];

		el.eventDirection = [];
		inst.moveTo(no, 0);
	};

	var runTest = function(direction) {
		var eventDirection = $.unique(el.eventDirection);
		var strDirection = direction === MC.DIRECTION_LEFT ? "LEFT" : "RIGHT";

		assert.equal(direction, eventDirection.length === 1 && eventDirection[0], "Panel moved to "+ strDirection +"?");
	};

	// non-circular
	inst = this.create("#mflick1");
	setCondition(1);
	runTest(MC.DIRECTION_LEFT);

	setCondition(0);
	runTest(MC.DIRECTION_RIGHT);

	// circular
	inst = this.create("#mflick2", {
		circular : true
	});

	setCondition(2);
	runTest(MC.DIRECTION_RIGHT);

	setCondition(0);
	runTest(MC.DIRECTION_LEFT);

	setCondition(1);
	runTest(MC.DIRECTION_LEFT);
});

QUnit.test("Animation #1 - Default duration value", function(assert) {
	var done = assert.async();

	// Given
	var customEvt = {
		flickEnd: function(e) {
			var id = this.$wrapper.attr("id");

			// Then
			assert.equal($getTransformValue(this.getElement()).match(RegExp(value)) + "", value, "Moved to last panel?");

			id === "mflick2" && done();
		}
	};

	var inst = this.inst;

	this.create("#mflick1", null, customEvt);
	this.create("#mflick2", null, customEvt);

	var count = inst[0]._conf.panel.count;
	var value = (count - 1) * 100;

	// When
	inst[0].moveTo(count - 1);  // move to last
	inst[1].moveTo(count - 1, 500);  // move to last
});

QUnit.test("Animation #2 - Moving to last panel", function(assert) {
	var done = assert.async();

	// Given
	var inst = this.create("#mflick3", { circular : true }, {
		flickEnd: function() {
			// Then
			assert.equal(count - 1, this._conf.panel.no, "Panel number indicate last panel number?");
			assert.deepEqual($getTransformValue(this.getElement()).match(RegExp(value)) + "", value, "Invoked element is placed in right position?");
			assert.ok(this.getElement().html().indexOf("Layer " + (count - 1)), "Moved correctly?");

			done();
		}
	});

	var count = inst._conf.panel.count;
	var index = count - 1;
	var value = (inst._getBasePositionIndex() * 100) +"%";

	// When
	inst.moveTo(index, 300);  // move to last
});

QUnit.test("Animation #3 - moving to next panel", function(assert) {
	var done = assert.async();

	// Given
	var inst = this.create("#mflick3", { circular : true }, {
		flickEnd: function() {
			// Then
		assert.equal(panelToMove, indexToMove, "The index value to move From current panel is "+ indexToMove +"?");
		assert.equal(this._conf.panel.no, panelToMove, "Panel number indicate 'panel "+ indexToMove +"'?");
		assert.deepEqual($getTransformValue(this.getElement()).match(RegExp(value)) + "", value, "Invoked element is placed in right position?");
		assert.ok(this.getElement().html().indexOf("Layer 2"), "Moved correctly?");

			done();
		}
	});

	var value = (inst._getBasePositionIndex() * 100) +"%";
	var panelToMove = 1;  // index value to move from current

	// When
	inst.moveTo(panelToMove,300);
	var indexToMove = inst._conf.indexToMove;
});


QUnit.module("resize() method", hooks);
QUnit.test("Check for panel resize", function(assert) {
	// Given
	var el = $("#mflick1");
	var width = el.width();
	var inst = this.create(el, { defaultIndex: 2 });

	var panel = inst._conf.panel;
	var oldCoordMax = inst._mcInst.options.max;

	// When
	el.width(width + 50);

	// Then
	assert.notDeepEqual(panel.size, el.width(), "The panel width is less than the current wrapper size");

	// When
	inst.resize();
	var maxPosX = panel.size * ( panel.count - 1 );

	// Then
	assert.equal($getTransformValue(inst.$container, true), maxPosX, "Current container element is in right position?");
	assert.deepEqual(maxPosX, inst._mcInst.options.max[0], "Max coord value has been set correctly?");
	assert.deepEqual(panel.size, el.width(), "The panel width should be same as current wrapper element");
	assert.deepEqual(inst.$container.width(), panel.count * panel.size, "The panel container width should be same as current panels element total width");
	assert.notDeepEqual(oldCoordMax, inst._mcInst.options.max, "Should be updated MovableCoord's 'max' options value");
});

QUnit.test("When change padding option", function(assert) {
	// Given
	var inst = this.create("#mflick1", {
		circular: true,
		previewPadding: [10,10]
	});
	var panel = inst._conf.panel;
	var padding;

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
		assert.deepEqual(padding, val, "Padding value changed?");

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

		assert.equal(max, panel.size * (panel.count - 1), "Max coord value has been set correctly?");
		assert.equal(panelSize, panel.size, "The panel width should be same as current wrapper element");
		assert.equal(coord, panel.size * panel.index, "Current MovableCoord's value has been set correctly?");

		top &&assert.equal(val[0], top, "Container's top value has been set correctly?");
	};

	// When
	setCondition([20,20]);

	// Then
	runTest([20,20], true);

	// When
	setCondition([20,30]);

	// Then
	runTest([20,30], true);
	inst.destroy();

	// Given
	inst = this.create("#mflick2", {
		circular: true,
		previewPadding: [10, 10],
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


QUnit.module("restore() method", hooks);
QUnit.test("Check for basic functionality", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick1")[0];
	var eventOrder = ["beforeRestore", "flick", "restore"];
	var inst = this.create(el, {
		duration : 200,
		hwAccelerable : true,
		threshold : 70,
		circular: true
	});

	var panelIndex = {
		no: inst._conf.panel.no,
		index: inst._conf.panel.index
	};

	var setCondition = function() {
		inst._mcInst._pos = [145,0];
		inst._setTranslate([-145,0]);
	};

	var setCondition2 = function() {
		var panel = inst._conf.panel;
		var pos = panel.size * (panel.currIndex + 1);

		inst._mcInst._pos = [pos,0];
		inst._setTranslate([-pos,0]);
	};

	var runTest = function() {
	var currPos = inst._mcInst.get()[0];
	var panel = inst._conf.panel;

	assert.ok(currPos % panel.size === 0 && currPos === panel.currIndex * panel.size, "Restored in right position?");
	assert.ok(panelIndex.no === inst.getIndex() && panelIndex.index === inst.getIndex(true), "Restored to previous panel number?");
	assert.deepEqual(el.eventFired, eventOrder, "Custom events are fired correctly?");

		el.eventFired = [];
	};

	// Given
	setCondition();

	// When
	inst.restore(0);

	// Then
	runTest();

	// Given
	setCondition2();

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

QUnit.test("When restoring after event stop", function(assert) {
	// Given
	var el = $("#mflick1")[0];

	var inst = this.create(el, {
		duration : 100,
		hwAccelerable : true,
		threshold : 70,
		circular: true
	}, {
		beforeFlickStart: function(e) {
			if(e.no === 0) {
				e.stop();
				this.restore(0);
			}
		}
	});

	var panelIndex = {
		no: inst._conf.panel.no,
		index: inst._conf.panel.index
	};

	var runTest = function() {
		assert.ok(inst._mcInst.get()[0] % inst._conf.panel.size === 0, "Panel is in right position?");
		assert.ok(panelIndex.no === inst.getIndex() && panelIndex.index === inst.getIndex(true), "Restored to previous panel number?");
		assert.ok(!el.eventFired.length, "Events are not fired?");
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
	inst.next(0);

	// Then
	runTest();

	// Given
	inst.next(100);

	// Then
	runTest();
});


QUnit.module("Custom events", hooks);
QUnit.test("When changes panel normally", function(assert) {
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

	var setCondition = $.proxy(function(el, option) {
		var f = this.create(el, option, handler);

		data[el.id] = {
			eventFired: [],
			panel: {},
			inst: f,
			currentPanel: {
				index: f._conf.panel.currIndex,
				no: f._conf.panel.currNo,
				getElement: f.getElement(),
				getIndex: f.getIndex(),
				getNextElement: f.getNextElement(),
				getPrevElement: f.getPrevElement(),
				getNextIndex: f.getNextIndex(),
				getPrevIndex: f.getPrevIndex()
			}
		};
	}, this);

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

QUnit.test("When stop event on beforeRestore", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick1")[0];
	var called = false;

	this.create(el, { threshold : 100 }, {
		beforeRestore : function(e) {
			e.stop();
		},
		restore : function(e) {
			called = true;
		}
	});

	// When
	simulator(el, {
		pos: [0, 0],
		deltaX: -70
	}, function() {
		// Then
		assert.ok(!called, "restore event should not be triggered");
		done();
    });
});

QUnit.test("When stop on flick event", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick1")[0];
	var translate = "";

	var inst = this.create(el, null, {
			flick : function(e) {
				e.stop();
				translate = $getTransformValue(inst.$container, true);
			}
		});

	// When
	simulator(el, {
		pos: [0, 0],
		deltaX: -70,
		touches : 1
	}, function() {
		// Then
		setTimeout(function() {
			assert.notEqual(translate, $getTransformValue(inst.$container, true), "The panel should not be moved during change");
			done();
		}, 500);
    });
});

QUnit.test("When stop on beforeFlickStart event", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick1")[0];
	var translate = "";
	var inst = this.create(el, null, {
			beforeFlickStart: function (e) {
				e.stop();
				el.eventFired = [];
				el.eventDirection = [];
				translate = $getTransformValue(inst.$container, true);
			}
		});

	var panelIndex = {
			no: inst._conf.panel.no,
			index: inst._conf.panel.index
		};

	// When
	simulator(el, {
		pos: [0, 0],
		deltaX: -70,
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

		assert.deepEqual(el.eventFired, [ "beforeRestore", "flick", "restore" ], "Restore events are fired correctly?");

		var direction = $.unique(el.eventDirection);
		assert.ok(direction.length === 1 && direction[0] === eg.MovableCoord.DIRECTION_RIGHT, "Direction value of restore event are right?");
		done();
	});
});

QUnit.test("Events fired on move API call when duration is 0", function(assert) {
	// Given
	var el = $("#mflick1")[0];
	var eventOrder = ["beforeFlickStart", "flick", "flickEnd"];
	var panel = {};
	var currentPanel;

	var handler = function (e) {
			var type = e.eventType;

			if (el.eventFired.indexOf(type) == -1) {
				el.eventFired.push(type);

				panel[type] = {
					index: e.index,
					no: e.no
				};
			}
		};

	var inst = this.create(el, { circular: true }, {
			beforeFlickStart: handler,
			flick: handler,
			flickEnd: handler
		});

	var setCondition = function() {
			el.eventFired = [];

			currentPanel = {
				index: inst._conf.panel.index,
				no: inst._conf.panel.no
			};
		};

	var runTest = function() {
			$.each(panel, function(i, v) {
				var oPanel = panel[i];

				if (i === "flickEnd") {
				assert.ok(oPanel.no === currentPanel.no + 1 || oPanel.no === currentPanel.no - 1, "Panel no should be change on 'flickEnd' event.");
				} else {
				assert.equal(oPanel.no, currentPanel.no, "Panel no shouldn't be changed before 'flickEnd' event.");
				}
			});
		};

	// When
	setCondition();
	inst.next(0);

	// Then
	assert.deepEqual(el.eventFired, eventOrder, "Events are fired in correct order, after calling next()?");
	runTest();

	// When
	setCondition();
	inst.prev(0);

	// Then
	assert.deepEqual(el.eventFired, eventOrder, "Events are fired in correct order, after calling prev()?");
	runTest();

	// When
	setCondition();
	inst.moveTo(1,0);

	// Then
	assert.deepEqual(el.eventFired, eventOrder, "Events are fired in correct order, after calling moveTo()?");
	runTest();
});

QUnit.test("Events fired on move API call when duration is greater than 0", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick1")[0];
	var eventOrder = ["beforeFlickStart", "flick", "flickEnd"];
	var method = "";
	var eventFired = {
		next: [],
		prev: [],
		moveTo: []
	};

	var handler = function (e) {
			var type = e.eventType;
			var event = eventFired[method];

			if (event.indexOf(type) == -1) {
				event.push(type);
			}
		};

	var inst = this.create(el, { circular: true }, {
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

QUnit.test("Check for continuous action: 1)restore, 2)flick ", function(assert) {
	var done1 = assert.async();
	var done2 = assert.async();

	// Given
	var el1 = $("#mflick1")[0];
	var el2 = $("#mflick2")[0];

	this.create(el1);
	this.create(el2);

	// When
	simulator(el1, {
		pos: [0, 0],
		deltaX: -30
	}, function() {
		// Then
		setTimeout(function() {
			assert.deepEqual(el1.eventFired, [ "flick", "beforeRestore", "flick", "restore" ], "Custom events for restoring are fired in correct order");
			done1();
		},500);
	});

	simulator(el2, {
		pos: [0, 0],
		deltaX: -70
	}, function() {
		// Then
		setTimeout(function() {
			assert.deepEqual(el2.eventFired, [ "flick", "beforeFlickStart", "flick", "flickEnd" ], "Custom events for normal moves are fired in correct order");
			done2();
		},500);
	});
});

QUnit.test("Check for direction during hold and unhold on flick event", function(assert) {
	var done1 = assert.async();
	var done2 = assert.async();
	var done3 = assert.async();
	var done4 = assert.async();

	// Given
	var directionHold = {};
	var directionUnhold = {};
	var handler = function(e) {
			var id = this.$wrapper[0].id;

			if (!directionHold[id]) {
				directionHold[id] = [];
				directionUnhold[id] = [];
			}

			e.holding ?
				directionHold[ id ].push(e.direction) :
				directionUnhold[ id ].push(e.direction);
		};

	var setCondition = $.proxy(function(elem, options) {
		this.create(elem, options || { circular: true }, {
			flick: handler,
			circular: true
		});
	}, this);

	var check = function(arr, val) {
		return arr.join("").replace(new RegExp(val,"g"), "") === "";
	};

	// When
	var el = $("#mflick1")[0];
	setCondition(el);

	simulator(el, { deltaX: -100, deltaY: 90 }, function() {
		var id = el.id;

		// Then
		assert.ok(check(directionHold[id], eg.MovableCoord.DIRECTION_LEFT), "Is left during touch hold?");
		assert.ok(check(directionUnhold[id], eg.MovableCoord.DIRECTION_LEFT), "Is left during touch unhold?");
		done1();
	});

	// Given
	var el2 = $("#mflick2")[0];
	setCondition(el2);

	// When
	simulator(el2, { deltaX: 100, deltaY: 50 }, function() {
		var id = el2.id;

		// Then
		assert.ok(check(directionHold[id], eg.MovableCoord.DIRECTION_RIGHT), "Is right during touch hold?");
		assert.ok(check(directionUnhold[id], eg.MovableCoord.DIRECTION_RIGHT), "Is right during touch unhold?");
		done2();
	});

	// Given
	var el3 = $("#mflick3")[0];
	setCondition(el3, {
		circular: true,
		horizontal: false
	});

	// When
	simulator(el3, { deltaX: 50, deltaY: -100 }, function() {
		var id = el3.id;

		// Then
		assert.ok(check(directionHold[id], eg.MovableCoord.DIRECTION_UP), "Is up during touch hold?");
		assert.ok(check(directionUnhold[id], eg.MovableCoord.DIRECTION_UP), "Is up during touch unhold?");
		done3();
	});

	// Given
	var el4 = $("#mflick3-1")[0];
	setCondition(el4, {
		circular: true,
		horizontal: false
	});

	// When
	simulator(el4, { deltaX: -50, deltaY: 100 }, function() {
		var id = el4.id;

		// Then
		assert.ok(check(directionHold[id], eg.MovableCoord.DIRECTION_DOWN), "Is down during touch hold?");
		assert.ok(check(directionUnhold[id], eg.MovableCoord.DIRECTION_DOWN), "Is down during touch unhold?");
		done4();
	});
});

QUnit.test("Distance value during flick event", function(assert) {
	var done = [];

	// Given
	var self = this;

	var runTest = function(id, options, pos, isPositive) {
		done.push(assert.async());

		var el = $(id)[0];
		var distance = [];
		var index = 0;

		var inst = self.create(el, options, {
			flick: function(e) {
				distance.push(e.distance);
			},
			flickEnd: function(e) {
				distance = [];

				if (index === 0) {
					simulator(el, pos, function () {
						assert.equal($.map(distance, function(v) {
							return (isPositive ? v >= 0 : v <= 0) ? v : null;
						}).length, distance.length, "");

						done.shift()();
					});
				}

				index++;
			}
		});

		inst[ isPositive ? "next" : "prev" ]();
	};

	runTest("#mflick1", { circular: true }, { deltaX: -100, deltaY: 0 }, true);
	runTest("#mflick2", { circular: true }, { deltaX: 100, deltaY: 0 }, false);
	runTest("#mflick2-1", { circular: true, horizontal: false },  { deltaX: 0, deltaY: -100 }, true);
	runTest("#mflick3-1", { circular: true, horizontal: false },  { deltaX: 0, deltaY: 100 }, false);
});


QUnit.module("Miscellaneous", hooks);
QUnit.test("Workaround for buggy link highlighting on android 2.x", function(assert) {
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
	var inst = this.create("#mflick1");
	var $dummyAnchor = $(inst.$wrapper).find("> a:last-child")[0];
	var leftValue;

	// Then
	assert.ok($dummyAnchor.tagName === "A" && !$dummyAnchor.innerHTML, "Dummy anchor element should be added.");

	// When
	inst.next(0);
	leftValue = $.css(inst.getElement()[0], "left");

	// Then
	assert.ok(leftValue && parseInt(leftValue, 10) > 0, "Panel should be moved using left property instead of translate.");
});

QUnit.test("Check public methods return", function (assert) {
	var inst = this.create("#mflick1", { circular: true });
	var instances = [
		{ method: "next()", data: inst.next(0) },
		{ method: "prev()", data: inst.prev(0) },
		{ method: "moveTo()", data: inst.moveTo(1,0) },
		{ method: "resize()", data: inst.resize() },
		{ method: "restore()", data: inst.restore(0) }
	];

	$.each(instances, function(i, v) {
		assert.deepEqual(v.data, inst, v.method + " is returning instance it self?");
	});
});

QUnit.test("Check panel move method, depending existence of css transform property", function(assert) {
	// when
	var inst = this.create("#mflick1", { circular: true });
	inst.next(0);

	// Then
	assert.ok($getTransformValue(inst.$container).indexOf("translate") >= 0, "When support transform, should use translate to move.");

	// When
	var fakeDoc = {
		documentElement : { style: {} }
	};

	eg.invoke("flicking",[null, null, null, fakeDoc]);
	var inst2 = this.create("#mflick2", { circular: true });
	inst2.next(0);

	// Then
	assert.ok(inst2.$container[0].style.left.length > 0, "When doesn't support transform, should use left/top to move.");
});

QUnit.test("When intent to initialize with non-existent element, should throw error.", function(assert) {
	assert.throws(function() {
		// When
		new eg.Flicking("#NO-ELEMENT");
	}, function() {
		// Then
		return true;
	});

	// Given
	$(document.body).append("<div id='no-child'> </div>");

	assert.throws(function() {
		// When
		new eg.Flicking("#no-child");
	}, function() {
		// Then
		return true;
	});
});

QUnit.test("Custom event name with prefix: to handle jQuery plugin style", function(assert) {
	// When
	var events = [
			"flicking:beforeFlickStart",
			"flicking:flick",
			"flicking:flickEnd",
			"flicking:beforeRestore",
			"flicking:restore"
		];
	var eventFired = [];
	var handler = function(e) {
			eventFired.push(e.eventType);
		};

	var inst = this.inst = new eg.Flicking("#mflick1",{ circular: true }, "flicking:").on({
		"flicking:beforeFlickStart": handler,
		"flicking:flick": handler,
		"flicking:flickEnd": handler,
		"flicking:beforeRestore": handler,
		"flicking:restore": handler
	});

	inst.next(0);
	inst.trigger("flicking:beforeRestore");
	inst.trigger("flicking:restore");

	assert.deepEqual(events, eventFired, "Events did fired correctly?");
});

QUnit.test("Disallow API move calls during touch hold", function(assert) {
	var done = assert.async();

	// Given
	var el = $("#mflick1")[0];
	var inst = this.create(el, { circular: true });
	var index = [];

	var interval = setInterval(function() {
			index.push(inst.getIndex());
			inst.next(100);
		}, 200);

	simulator(el, { pos: [ 200, 50], deltaX: -200, deltaY: 0, duration: 1000 }, function() {
		clearInterval(interval);
		assert.equal(index.length, index.filter(function(v) { return v === 0; }).length, "Panel shouldn't have to moved during touch hold.");

		done();
	});
});
