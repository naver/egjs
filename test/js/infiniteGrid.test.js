var HTML = '<li class="item"><div>테스트1</div></li><li class="item"><div>테스트2</div></li><li class="item"><div>테스트3</div></li><li class="item"><div>테스트4</div></li><li class="item"><div>테스트5</div></li><li class="item">';
var getContent = function(className, x) {
	var s = "";
	if(x) {
		for(var i=0; i<x; i++) {
			s+= HTML;
		}
	} else {
		s = HTML;
	}
	return $(s).addClass(className).find("div").height(function() {
		var val = parseInt(Math.random() * 100,10);
		return val < 40 ? 40 : val;
	}); 
};

module("infiniteGrid Test", {
	setup : function() {
		this.inst = null;
	},
	teardown : function() {
		this.inst.destroy();
		this.inst = null;
	}
});


asyncTest("check a initialization (there are children)", function() {
	// 
	// Given
	this.inst = new eg.InfiniteGrid("#grid", {
		"isInitLayout" : false,
	});
	this.inst.on("layoutComplete",function(e) {
		// Then
		equal(e.length, 6, "a number of elements are 6");
		equal(this.items.length, 6, "a number of elements are 6");
		equal(this.isProcessing(), false, "idel in layoutComplete");
		start();
	});
	// When
	// Then
	equal(this.inst.isProcessing(), false, "idel");

	// When
	this.inst.layout();
});


asyncTest("check a initialization (there aren't children)", function() {
	// Given
	this.inst = new eg.InfiniteGrid("#nochildren_grid", {
		"isInitLayout" : false,
	});
	this.inst.on("layoutComplete",function(e) {
		// Then
		equal(e.length, 0, "a number of elements are 0");
		equal(this.isProcessing(), false, "idel in layoutComplete");
		start();
	});
	// When
	// Then
	equal(this.inst.isProcessing(), false, "idel");

	// When
	this.inst.layout();
});

asyncTest("check a append module", function() {
	// Given
	var addCount = 0;
	this.inst = new eg.InfiniteGrid("#nochildren_grid", {
		"count" : 18
	});

	// When
	this.inst.on("layoutComplete",function(e) {
		// Then
		equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
		equal(e.length, 5, "appended elements are 5");
		if(addCount++ < 3) {
			equal(this.isRecycling(), false, "elements are lacked");
			equal(this.items.length, 5 * addCount, "a number of elements are " + (5 * addCount));
			equal(this.$element.children().length, 5 * addCount, "a number of elements(DOM) are " + (5 * addCount));

		} else {
			equal(this.isRecycling(), true, "elements are enough");
			equal(this.items.length, 18, "a number of elements are always 18");
			equal(this.$element.children().length, 18, "a number of elements(DOM) are always 18");
		}
		if(addCount < 10) {
			this.append(getContent("append"));
		} else {
			start();
		}
	});
	this.inst.append(getContent("append"));
});

asyncTest("check a prepend module", function() {
	var addCount = 0;
	// Given
	this.inst = new eg.InfiniteGrid("#nochildren_grid", {
		"count" : 18
	});

	// When
	this.inst.prepend(getContent("prepend"));
	// Then
	equal(this.inst.items.length, 0, "a number of elements are always 0");
	equal(this.inst.$element.children().length, 0, "a number of elements(DOM) are always 0");

	// When
	this.inst.append(getContent("append",4));
	this.inst.on("layoutComplete",function(e) {
		// Then
		equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
		equal(e.length, 5, "prepended elements are 5");
		equal(this.isRecycling(), true, "elements are enough");
		equal(this.items.length, 18, "a number of elements are always 18");
		equal(this.$element.children().length, 18, "a number of elements(DOM) are always 18");
		
		if(addCount++ < 10) {
			this.prepend(getContent("prepend"));
		} else {
			start();
		}
	});
	this.inst.prepend(getContent("prepend"));

});


test("restore status", function() {
	var self = this, $el;
	// Given
	this.inst = new eg.InfiniteGrid("#grid", {
		"count" : 18
	});

	// When
	this.inst.append(getContent("append",10));
	
	var beforeStatus = this.inst.getStatus();
	
	// Then
	equal(beforeStatus.html, this.inst.$element.html(), "check html");
	equal(beforeStatus.cssText, this.inst.element.style.cssText, "check cssText");
	beforeStatus.data.items.forEach(function(v,i,a) {
		deepEqual(v.position, self.inst.items[i].position, "check html and position information");
		deepEqual(v.size, self.inst.items[i].size,"check html and size information");
	});
	deepEqual(beforeStatus.data._appendCols, this.inst._appendCols, "check appendCol info");
	deepEqual(beforeStatus.data._prependCols, this.inst._prependCols, "check appendCol info");
	deepEqual(beforeStatus.data.columnWidth, this.inst.columnWidth, "check columnWidth info");
	deepEqual(beforeStatus.data.size, this.inst.size, "check size info");
	deepEqual(beforeStatus.data.options, this.inst.options, "check options info");

	// Given
	this.inst.destroy();
	this.inst = new eg.InfiniteGrid("#grid", {
		"count" : 18
	});

	// When
	this.inst.setStatus(beforeStatus);

	// Then
	equal(this.inst.element.style.cssText, beforeStatus.cssText, "check cssText");
	this.inst.items.forEach(function(v,i,a) {
		deepEqual(v.position, beforeStatus.data.items[i].position, "check html and position information");
		deepEqual(v.size, beforeStatus.data.items[i].size,"check html and size information");
		$el = $(v.element);
		deepEqual(v.position, {
			"x" : parseInt($el.css("left"),10),
			"y" : parseInt($el.css("top"),10)
		}, "check html and position information");
	});
	deepEqual(this.inst._appendCols, beforeStatus.data._appendCols, "check appendCol info");
	deepEqual(this.inst._prependCols, beforeStatus.data._prependCols, "check appendCol info");
	deepEqual(this.inst.columnWidth, beforeStatus.data.columnWidth, "check columnWidth info");
	deepEqual(this.inst.size, beforeStatus.data.size, "check size info");
	deepEqual(this.inst.options, beforeStatus.data.options, "check options info");
});


//@todo group append/prepend 테스트
//@todo prepend count값에 대한 테스트
//@todo equalSize에 대한 테스트 