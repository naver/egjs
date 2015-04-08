module("Flicking component test", {
	setup : function() {
		this.inst = null;
	},
	teardown : function() {
		this.inst && this.inst._movableCoord.destroy();
	}
});

test("Check for the initialization", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick1"));

	// When
	// Then
	deepEqual(this.inst._container.width(), this.inst._conf.panel.count * this.inst._conf.panel.width, "Then panel container was added and the width is same as total panels width.");
});

test("Option: circular", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick1"));

	// When
	this.inst.moveTo(this.inst._conf.panel.origCount - 1);

	// Then
	equal(this.inst.getElement().next().length, 0, "Is not circular?");
	this.inst._movableCoord.destroy();

	// Given
	this.inst = new eg.Flicking($("#mflick2"), { circular : true });

	// When
	this.inst.moveTo(this.inst._conf.panel.origCount - 1);

	// Then
	ok(this.inst.getElement().next().length, "Is circular?");
	this.inst._movableCoord.destroy();

	// Given
	this.inst = new eg.Flicking($("#mflick2-1"), { circular : true });

	// When
	// Then
	ok(this.inst._conf.panel.count > this.inst._conf.panel.origCount, "When panel elements are not enough, should be added cloned elements");
});

test("Option: preview", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick3"), {
		circular : true,
		previewPadding : 50
	});

	var right = parseInt(this.inst._wrapper.css("padding-right"),10),
		left = parseInt(this.inst._wrapper.css("padding-left"),10),
		wrapperWidth = this.inst._wrapper.width(),
		panelWidth = this.inst._container.children().width();

	// When
	// Then
	ok((right === left) && left === this.inst.options.previewPadding, "Preview padding value applied correctly?");
	equal(wrapperWidth, panelWidth, "Each panel's width should be same as wrapper element's width");
});


asyncTest("Option: threshold #1 - when moved more than threshold pixels", function() {
	// Given
	var el = $("#mflick2").get(0),
		changedPanelNo, panelNo;

	this.inst = new eg.Flicking(el, {
		circular : true,
		threshold : 80
	}).on({
		afterChange : function(e) {
			changedPanelNo = e.no;
		}
	})

	panelNo = this.inst._conf.panel.no;

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
            deltaX: -100,
            deltaY: 100,
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

asyncTest("Option: threshold #2 - when moved less than threshold pixels", function() {
	// Given
	var el = $("#mflick2").get(0),
		changedPanelNo;

	this.inst = new eg.Flicking(el, {
		circular : true,
		threshold : 80
	}).on({
		afterChange : function(e) {
			changedPanelNo = e.no;
		}
	})

	changedPanelNo = panelNo = this.inst._conf.panel.no;

	// When
	Simulator.gestures.pan(el, {
		pos: [0, 0],
            deltaX: -70,
            deltaY: 100,
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
	deepEqual(this.inst._container.children()[this.inst.getIndex(true)], this.inst.getElement()[0], "Get current panel using physical panel number");
});

test("Method: getElement()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick2"), {
		circular : true
	});

	var element = this.inst.getElement();

	// When
	// Then
	ok(element.length, "The element was invoked correctly?");
	deepEqual(parseInt(element.css("left"),10), this.inst._conf.panel.width, "Invoked element is placed in right position?");

});

test("Method: getNextElement()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick2"), {
		circular : true
	});

	var element = this.inst.getNextElement();

	// When
	// Then
	ok(element.length, "The element was invoked correctly?");
	deepEqual(this.inst.getElement().next(), element, "Invoked element is placed next to the current element?");
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

	var element = this.inst.getPrevElement();

	// When
	// Then
	ok(element.length, "The element was invoked correctly?");
	deepEqual(this.inst.getElement().prev(), element, "Invoked element is placed previous to the current element?");
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
	deepEqual(index, this.inst._conf.panel.count - 1, "Previous index of first, should be "+ this.inst._conf.panel.count - 1);

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
	deepEqual(elements, this.inst._container.children(), "Returned all panel elements?");
});

test("Method: getElementCount()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick1"));

	var counts = this.inst.getElementsCount();

	// When
	// Then
	deepEqual(counts, this.inst._container.children().length, "Return total panel elements count?");
	this.inst._movableCoord.destroy();

	// When
	this.inst = new eg.Flicking($("#mflick2-1"), {
		circular : true
	});

	counts = this.inst.getElementsCount();

	// Then
	ok(counts < this.inst._container.children().length, "When circular options is set, the elements count is less than physical elements count");

	// When
	counts = this.inst.getElementsCount(true);
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
            deltaY: 100,
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
	var element = this.inst.getElement();

	// Then
	deepEqual(parseInt(element.css("left"),10), this.inst._conf.panel.width, "Moved to next panel correctly?");
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
	var element = this.inst.getElement();

	// Then
	deepEqual(parseInt(element.css("left"),10), this.inst._conf.panel.width, "Moved to previous panel correctly?");
	deepEqual(element[0], prevElement[0], "The previous element is what expected?");
});

test("Method: moveTo()", function() {
	// Given
	this.inst = new eg.Flicking($("#mflick1"));

	var count = this.inst._conf.panel.count,
		panelWidth = this.inst._conf.panel.width;

	// When
	this.inst.moveTo(count - 1);  // move to last

	// Then
	var left = parseInt(this.inst._container.children().last().css("left"),10);
	deepEqual(left, panelWidth * (count - 1), "Moved to last panel?");

	// When
	this.inst.moveTo(0);  // move to first

	// Then
	var left = parseInt(this.inst._container.children().first().css("left"),10);
	deepEqual(left, 0, "Moved to first panel?");
	this.inst._movableCoord.destroy();

	// Given
	this.inst = new eg.Flicking($("#mflick3"), {
		circular : true
	});

	count = this.inst._conf.panel.count,
	panelWidth = this.inst._conf.panel.width;

	// When
	var index = count - 1;
	this.inst.moveTo(index);  // move to last

	// Then
	equal(count - 1, this.inst._conf.panel.no, "Panel number indicate last panel number?");
	deepEqual(parseInt(this.inst.getElement().css("left"),10), this.inst._conf.panel.index * this.inst._conf.panel.width, "Invoked element is placed in right position?");

});

test("Method: resize()", function() {
	// Given
	var element = $("#mflick1"),
		width = element.width(),
		panelWidth,
		coordMax;

	this.inst = new eg.Flicking(element);

	panelWidth = this.inst._conf.panel.width;
	coordMax = this.inst._movableCoord.options.max;

	// When
	element.width(width + 50);

	// Then
	notDeepEqual(panelWidth, element.width(), "The panel width is less than the current wrapper size");

	// When
	this.inst.resize();

	// Then
	deepEqual(this.inst._conf.panel.width, element.width(), "The panel width should be same as current wrapper element");
	notDeepEqual(coordMax, this.inst._movableCoord.options.max, "Should be updated MovableCoord's 'max' options value");
});