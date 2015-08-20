var HTML = '<li class="item"><div>테스트</div></li>';
var getContent = function(className, x) {
	var s = "";
	x = x || ( (parseInt(Math.random() * 100) % 10) +1 ) ;
	for(var i=0; i<x; i++) {
		s+= HTML;
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
	var addCount = 0,
		beforeItemsCount = 0;
	this.inst = new eg.InfiniteGrid("#nochildren_grid", {
		"count" : 18
	});

	// When
	this.inst.on("layoutComplete",function(e) {
		// Then
		equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
		if(this.isRecycling()) {
			equal(this.items.length, 18, "a number of elements are always 18");
		} else {
			equal(beforeItemsCount + e.length, this.items.length, "item added " + e.length);
			beforeItemsCount = this.items.length;
		}
		equal(this.$element.children().length, this.items.length, "a number of elements(DOM) -> " + this.items.length);
		if(addCount++ < 10) {
			this.append(getContent("append",5));
		} else {
			start();
		}
	});
	beforeItemsCount = this.inst.items.length;
	this.inst.append(getContent("append"));
});


asyncTest("check a append module with groupkey", function() {
	// Given
	var addCount = 0,
		groupkey = 0,
		beforeItemsCount = 0,
		group = {};
	this.inst = new eg.InfiniteGrid("#nochildren_grid", {
		"count" : 18
	});

	// When
	this.inst.on("layoutComplete",function(e) {
		// Then
		equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
		group[groupkey] = e.length;
		if(this.isRecycling()) {
			var groupRange = this.getGroupRange();
			var total = 0;
			for(var i=groupRange[0]; i<=groupRange[1]; i++) {
				total += group[i];
			}
			equal(this.items.length, total, "a number of elements are " + total);
		} else {
			equal(beforeItemsCount + e.length, this.items.length, "item added " + e.length);
			beforeItemsCount = this.items.length;
		}
		equal(this.$element.children().length, this.items.length, "a number of elements(DOM) -> " + this.items.length);
		if(addCount++ < 10) {
			this.append(getContent("append"), ++groupkey);
		} else {
			start();
		}
	});
	beforeItemsCount = this.inst.items.length;
	this.inst.append(getContent("append"), groupkey);
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
	this.inst.append(getContent("append",20));
	this.inst.on("layoutComplete",function(e) {
		// Then
		equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
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


asyncTest("check a prepend module with groupkey", function() {
	var addCount = 0,
		groupkey = 10,
		beforeItemsCount = 0,
		group = {};
	// Given
	this.inst = new eg.InfiniteGrid("#nochildren_grid", {
		"count" : 18
	});

	// When
	this.inst.append(getContent("append",20),groupkey--);
	group[10] = 20;
	this.inst.on("layoutComplete",function(e) {
		// Then
		equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
		group[groupkey] = e.length;
		if(this.isRecycling()) {
			var groupRange = this.getGroupRange();
			var total = 0;
			for(var i=groupRange[1]; i>=groupRange[0]; i--) {
				total += group[i];
			}
			equal(this.items.length, total, "a number of elements are " + total);
			equal(this.$element.children().length, this.items.length, "a number of elements(DOM) -> " + this.items.length);
		}

		if(addCount++ < 10) {
			this.prepend(getContent("prepend"), --groupkey);
		} else {
			start();
		}
	});
	beforeItemsCount = this.inst.items.length;
	this.inst.prepend(getContent("prepend"), groupkey);
});

test("restore status", function() {
	var self = this, $el;
	// Given
	this.inst = new eg.InfiniteGrid("#grid", {
		"count" : 18
	});

	// When
	this.inst.append(getContent("append",50));
	
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


//@todo prepend count값에 대한 테스트
//@todo equalSize에 대한 테스트 
//@todo _updateCol에 대한 별도 테스트