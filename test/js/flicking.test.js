// to resolve transform style value
function $getTransformValue(el, match) {
	el = $(el)[0].style;

	var elStyle = el.webkitTransform || el.transform || "",
		rx = /\(-?(\d+)/;

	return match ? (elStyle.match(rx) ||[,])[1] : elStyle;
}


module("Flicking component test", {
	setup : function() {
		this.inst = null;
	},
	teardown : function() {
		this.inst && this.inst._mcInst.destroy();
	}
});

test("Check for the initialization", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick1"));

	// When
	// Then
	deepEqual(this.inst._container.width(), this.inst._conf.panel.count * this.inst._conf.panel.size, "Then panel container was added and the width is same as total panels width.");
});

test("Option: circular", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick1"));

	// When
	this.inst.moveTo(this.inst._conf.panel.origCount - 1);

	// Then
	equal(this.inst.getElement().next().length, 0, "Is not circular?");
	this.inst._mcInst.destroy();

	// Given
	this.inst = new eg.Flicking($("#mflick2"), { circular : true });

	// When
	this.inst.moveTo(this.inst._conf.panel.origCount - 1);

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
	this.inst.moveTo(this.inst._conf.panel.origCount - 1);

	// Then
	ok(this.inst.getNextElement(), "Is circular?");

});

test("Option: preview - horizontal", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick3"), {
		circular : true,
		previewPadding : [ 50, 70 ]
	});

	var padding = this.inst.options.previewPadding,
		right = parseInt(this.inst._wrapper.css("padding-right"),10),
		left = parseInt(this.inst._wrapper.css("padding-left"),10),
		wrapperWidth = this.inst._wrapper.width(),
		panelWidth = this.inst._container.children().width();

	// When
	// Then
	ok(left === padding[0] && right === padding[1], "Preview padding value applied correctly?");
	equal(wrapperWidth, panelWidth, "Each panel's width should be same as wrapper element's width");
});

test("Option: preview - vertical", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick3"), {
		circular : true,
		horizontal : false,
		previewPadding : [ 15, 10 ]
	});

	var padding = this.inst.options.previewPadding,
		top = parseInt(this.inst._wrapper.css("padding-top"),10),
		bottom = parseInt(this.inst._wrapper.css("padding-bottom"),10),
		wrapperHeight = this.inst._wrapper.height(),
		panelHeight = this.inst._container.children().height();

	// When
	// Then
	ok(top === padding[0] && bottom === padding[1], "Preview padding value applied correctly?");
	equal(wrapperHeight - (padding[0] + padding[1]), panelHeight, "Each panel's height should be same as wrapper element's height");
});

asyncTest("Option: threshold #1 - (horizontal) when moved more than threshold pixels", function() {
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
			deepEqual(panelNo + 1, changedPanelNo, "Moved to next panel?");
			start();
		},1000);
    });
});

asyncTest("Option: threshold #2 - (vertical) when moved more than threshold pixels", function() {
	// Given
	var el = $("#mflick2")[0],
		changedPanelNo = 0, panelNo;

	var inst =this.inst = new eg.Flicking(el, {
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
			deepEqual(panelNo + 1, changedPanelNo, "Moved to next panel?");
			start();
		},1000);
    });
});

asyncTest("Option: threshold #3 - (horizontal) when moved less than threshold pixels", function() {
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
			deepEqual(panelNo, changedPanelNo, "Not moved to next panel?");
			start();
		},1000);
    });
});

asyncTest("Option: threshold #4 - (vertical) when moved less than threshold pixels", function() {
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
			deepEqual(panelNo, changedPanelNo, "Not moved to next panel?");
			start();
		},1000);
    });
});

test("defaultIndex option", function() {
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

test("Method: getIndex()", function() {
	// Given
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
	deepEqual(this.inst._conf.panel.list[this.inst.getIndex(true)], this.inst.getElement()[0], "Get current panel using physical panel number");
});

test("Method: getElement()", function() {
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

test("Method: getNextElement()", function() {
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

test("Method: getNextIndex()", function() {
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
	this.inst.moveTo(this.inst._conf.panel.count - 1);  // move to last
	index = this.inst.getNextIndex();

	// Then
	deepEqual(index, 0, "Next index of last, should be '0'");

	// When
	index = this.inst.getNextIndex(true);

	// Then
	ok(index > 0, "Next physical index of last, should be great than 0");
});

test("Method: getPrevElement()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick2"), {
		circular : true
	});

	var element = this.inst.getPrevElement(),
		rx = /\(-?(\d+)/,
		currentTransform = $getTransformValue(this.inst.getElement(), true),
		prevTransform = $getTransformValue(element, true);

	// When
	// Then
	ok(element, "The element was invoked correctly?");
	ok(currentTransform > prevTransform, "Invoked element is placed previous to the current element?");
});

test("Method: getPrevIndex()", function() {
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
	this.inst.moveTo(2);  // move to second
	index = this.inst.getPrevIndex();

	// Then
	deepEqual(index, this.inst.getIndex() - 1, "Is the previous index of current?");

	// When
	this.inst.moveTo(0);  // move to the first
	index = this.inst.getPrevIndex(true);

	// Then
	ok(this.inst.getPrevIndex() > index, "Previous physical index, should be less than logical index");
});

test("Method: getAllElements()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick2"), {
		circular : true
	});

	var elements = this.inst.getAllElements();

	// When
	// Then
	deepEqual(elements.length, this.inst._container.children().length, "Returned all panel elements?");
});

test("Method: getTotalCount()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick1"));

	var counts = this.inst.getTotalCount();

	// When
	// Then
	deepEqual(counts, this.inst._container.children().length, "Return total panel elements count?");
	this.inst._mcInst.destroy();

	// When
	this.inst = new eg.Flicking($("#mflick2-1"), {
		circular : true
	});

	counts = this.inst.getTotalCount();

	// Then
	ok(counts < this.inst._container.children().length, "When circular options is set, the elements count is less than physical elements count");

	// When
	counts = this.inst.getTotalCount(true);
	deepEqual(counts, this.inst._container.children().length, "Returned physical elements total count?");
});

asyncTest("Method: isPlaying()", function() {
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
			ok(isPlaying, "During the animation must return 'true'");
			start();
		},500);
    });
});

test("Method: next()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick2-1"), {
		circular : true
	});

	var nextElement = this.inst.getNextElement();

	// When
	this.inst.next();
	var element = this.inst.getElement(),
		value = (this.inst._getBasePositionIndex() * 100) +"%";

	// When
	// Then
	deepEqual($getTransformValue(element).match(RegExp(value)) + "", value, "Moved to next panel correctly?");
	deepEqual(element[0], nextElement[0], "The next element is what expected?");
});

test("Method: prev()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick2-1"), {
		circular : true
	});

	var prevElement = this.inst.getPrevElement();

	// When
	this.inst.prev();
	var element = this.inst.getElement(),
		value = (this.inst._getBasePositionIndex() * 100) +"%";

	// Then
	deepEqual($getTransformValue(element).match(RegExp(value)) + "", value, "Moved to previous panel correctly?");
	deepEqual(element.html(), prevElement.html(), "The previous element is what expected?");
});

test("Method: moveTo()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick1"));

	var count = this.inst._conf.panel.count,
		panelSize = this.inst._conf.panel.size,
		value = (count - 1) * 100;

	// When
	this.inst.moveTo(count - 1);  // move to last

   	// Then
   	equal($getTransformValue(this.inst.getElement()).match(RegExp(value)) + "", value, "Moved to last panel?");

	// When
	this.inst.moveTo(0);  // move to first

	// Then
	ok($getTransformValue(this.inst.getElement()).match(/0%/), "Moved to first panel?");

	this.inst._mcInst.destroy();

	// Given
	this.inst = new eg.Flicking($("#mflick3"), {
		circular : true
	});

	count = this.inst._conf.panel.count,
	panelSize = this.inst._conf.panel.size;

	// When
	var index = count - 1;
	value = (this.inst._getBasePositionIndex() * 100) +"%";

	this.inst.moveTo(index);  // move to last

	// Then
	equal(count - 1, this.inst._conf.panel.no, "Panel number indicate last panel number?");
	deepEqual($getTransformValue(this.inst.getElement()).match(RegExp(value)) + "", value, "Invoked element is placed in right position?");

});

test("Method: resize()", function() {
	// Given
	var element = $("#mflick1"),
		width = element.width(),
		panelWidth, coordMax;

	this.inst = new eg.Flicking(element);

	panelWidth = this.inst._conf.panel.size;
	coordMax = this.inst._mcInst.options.max;

	// When
	element.width(width + 50);

	// Then
	notDeepEqual(panelWidth, element.width(), "The panel width is less than the current wrapper size");

	// When
	this.inst.resize();

	// Then
	deepEqual(this.inst._conf.panel.size, element.width(), "The panel width should be same as current wrapper element");
	notDeepEqual(coordMax, this.inst._mcInst.options.max, "Should be updated MovableCoord's 'max' options value");
});

asyncTest("Custom events #1 - When changes panel normally", function() {
	// Given
	var el = $("#mflick1").get(0),
		eventOrder = ["touchStart", "touchMove", "touchEnd", "flickStart", "flick", "flickEnd"],
		eventFired = [],
		handler = function(e) {
			var type = e.eventType;

			if(eventFired.indexOf(type) == -1) {
				eventFired.push(type);
			}
		};

	this.inst = new eg.Flicking(el).on({
		touchStart : handler,
		touchMove : handler,
		touchEnd : handler,
		flickStart : handler,
		flick : handler,
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
		easing: "linear"
	}, function() {
		// Then
		setTimeout(function() {
			deepEqual(eventOrder, eventFired, "Custom events are fired in correct order");
			start();
		},1000);
    });
});

asyncTest("Custom events #2 - When stop event on beforeRestore", function() {
	// Given
	var el = $("#mflick1").get(0),
		eventFired = [],
		called = false,
		handler = function(e) {
			var type = e.eventType;

			if(eventFired.indexOf(type) == -1) {
				eventFired.push(type);
			}
		},
		inst = this.inst = new eg.Flicking(el, { threshold : 100 }).on({
			touchStart : handler,
			touchMove : handler,
			touchEnd : handler,
			flickStart : handler,
			flick : handler,
			flickEnd : handler,
			beforeRestore : function(e) {
				e.stop();
			},
			restore : function(e) {
				called = true;
			}
		}),
		rx = /\(-?(\d+)/,
		currentTransform = $getTransformValue(inst._container, true);

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
			ok(!called, "restore event should not be triggered");
			//notEqual(currentTransform, $getTransformValue(inst._container, true), "the panel should not be restored");
			start();
		},1000);
    });
});

asyncTest("Custom events #3 - When stop on touchMove event", function() {
	// Given
	var el = $("#mflick1").get(0),
		eventFired = [],
		handler = function(e) {
			var type = e.eventType;

			if(eventFired.indexOf(type) == -1) {
				eventFired.push(type);
			}
		},
		rx = /\(-?(\d+)/,
		called = false,
		inst = this.inst = new eg.Flicking(el).on({
			touchStart : handler,
			touchMove : function(e) {
				e.stop();
				called = !!$getTransformValue(inst._container);
			},
			touchEnd : handler,
			flickStart : handler,
			flick : handler,
			flickEnd : handler,
			beforeRestore : handler,
			restore : handler
		});

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
		deltaX: -70,
		deltaY: 0,
		duration: 1000,
		easing: "linear",
		touches : 1
	}, function() {
		// Then
		setTimeout(function() {
			ok(!called, "The panel should not be moved during touch move");
			start();
		},500);
    });
});

asyncTest("Custom events #5 - When stop on change event", function() {
	// Given
	var el = $("#mflick1").get(0),
		eventFired = [],
		handler = function(e) {
			var type = e.eventType;

			if(eventFired.indexOf(type) == -1) {
				eventFired.push(type);
			}
		},
		rx = /\(-?(\d+)/,
		translate = "",
		inst = this.inst = new eg.Flicking(el).on({
			touchStart : handler,
			touchMove : handler,
			touchEnd : handler,
			flickStart : handler,
			flick : function(e) {
				e.stop();
				translate = $getTransformValue(inst._container, true);
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
			notEqual(translate, $getTransformValue(inst._container, true), "The panel should not be moved during change");
			start();
		},800);
    });
});