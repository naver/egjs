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
	// Given
	this.inst = new eg.InfiniteGrid("#grid", {
		"isInitLayout" : false,
	});
	this.inst.on("layoutComplete",function(e) {
		// Then
		equal(e.target.length, 6, "a number of elements are 6");
		equal(this.core.items.length, 6, "a number of elements are 6");
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
		equal(e.target.length, 0, "a number of elements are 0");
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
			equal(this.core.items.length, 18, "a number of elements are always 18");
		} else {
			equal(beforeItemsCount + e.target.length, this.core.items.length, "item added " + e.target.length);
			beforeItemsCount = this.core.items.length;
		}
		equal(this.core.$element.children().length, this.core.items.length, "a number of elements(DOM) -> " + this.core.items.length);
		if(addCount++ < 10) {
			this.append(getContent("append",5));
		} else {
			start();
		}
	});
	beforeItemsCount = this.inst.core.items.length;
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
		group[groupkey] = e.target.length;
		if(this.isRecycling()) {
			var groupRange = this.getGroupRange();
			var total = 0;
			for(var i=groupRange[0]; i<=groupRange[1]; i++) {
				total += group[i];
			}
			equal(this.core.items.length, total, "a number of elements are " + total);
		} else {
			equal(beforeItemsCount + e.target.length, this.core.items.length, "item added " + e.target.length);
			beforeItemsCount = this.core.items.length;
		}
		equal(this.core.$element.children().length, this.core.items.length, "a number of elements(DOM) -> " + this.core.items.length);
		if(addCount++ < 10) {
			this.append(getContent("append"), ++groupkey);
		} else {
			start();
		}
	});
	beforeItemsCount = this.inst.core.items.length;
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
	equal(this.inst.core.items.length, 0, "a number of elements are always 0");
	equal(this.inst.core.$element.children().length, 0, "a number of elements(DOM) are always 0");

	// When
	this.inst.append(getContent("append",20));
	this.inst.on("layoutComplete",function(e) {
		// Then
		equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
		equal(this.isRecycling(), true, "elements are enough");
		equal(this.core.items.length, 18, "a number of elements are always 18");
		equal(this.core.$element.children().length, 18, "a number of elements(DOM) are always 18");
		
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
		group[groupkey] = e.target.length;
		if(this.isRecycling()) {
			var groupRange = this.getGroupRange();
			var total = 0;
			for(var i=groupRange[1]; i>=groupRange[0]; i--) {
				total += group[i];
			}
			equal(this.core.items.length, total, "a number of elements are " + total);
			equal(this.core.$element.children().length, this.core.items.length, "a number of elements(DOM) -> " + this.core.items.length);
		}

		if(addCount++ < 10) {
			this.prepend(getContent("prepend"), --groupkey);
		} else {
			start();
		}
	});
	beforeItemsCount = this.inst.core.items.length;
	this.inst.prepend(getContent("prepend"), groupkey);
});

test("restore status", function() {
	var $el,
		getProperties = function(target) {
			var data=[];
			for(var p in target) {
			    if(target.hasOwnProperty(p) && /^_/.test(p)) {
			        data.push(p);
			    }
			}
			return data;
		};
	// Given
	this.inst = new eg.InfiniteGrid("#grid", {
		"count" : 18
	});

	// When
	this.inst.append(getContent("append",50));
	var properties = getProperties(this.inst);
	var beforeStatus = this.inst.getStatus();
	
	// Then
	equal(beforeStatus.html, this.inst.core.$element.html(), "check html");
	equal(beforeStatus.cssText, this.inst.core.element.style.cssText, "check cssText");
	beforeStatus.core.items.forEach(function(v,i,a) {
		deepEqual(v.position, this.inst.core.items[i].position, "check html and position information");
		deepEqual(v.size, this.inst.core.items[i].size,"check html and size information");
	}, this);
	deepEqual(beforeStatus.core._appendCols, this.inst.core._appendCols, "check appendCol info");
	deepEqual(beforeStatus.core._prependCols, this.inst.core._prependCols, "check appendCol info");
	deepEqual(beforeStatus.core.columnWidth, this.inst.core.columnWidth, "check columnWidth info");
	deepEqual(beforeStatus.core.size, this.inst.core.size, "check size info");
	deepEqual(beforeStatus.core.options, this.inst.core.options, "check options info");
	properties.forEach(function(v,i,a) {
		equal(this.inst[v], beforeStatus.data[v], "check infiniteGrid properties " + v	);
	}, this);

	// Given
	this.inst.destroy();
	this.inst = new eg.InfiniteGrid("#grid", {
		"count" : 18
	});

	// When
	this.inst.setStatus(beforeStatus);

	// Then
	equal(this.inst.core.element.style.cssText, beforeStatus.cssText, "check cssText");
	this.inst.core.items.forEach(function(v,i,a) {
		deepEqual(v.position, beforeStatus.core.items[i].position, "check html and position information");
		deepEqual(v.size, beforeStatus.core.items[i].size,"check html and size information");
		$el = $(v.element);
		deepEqual(v.position, {
			"x" : parseInt($el.css("left"),10),
			"y" : parseInt($el.css("top"),10)
		}, "check html and position information");
	});
	deepEqual(this.inst.core._appendCols, beforeStatus.core._appendCols, "check appendCol info");
	deepEqual(this.inst.core._prependCols, beforeStatus.core._prependCols, "check appendCol info");
	deepEqual(this.inst.core.columnWidth, beforeStatus.core.columnWidth, "check columnWidth info");
	deepEqual(this.inst.core.size, beforeStatus.core.size, "check size info");
	deepEqual(this.inst.core.options, beforeStatus.core.options, "check options info");
	properties.forEach(function(v,i,a) {
		equal(this.inst[v], beforeStatus.data[v], "check infiniteGrid properties " + v	);
	}, this);
});

asyncTest("check a clear", function() {
	// Given
	var beforeClear = true;
	this.inst = new eg.InfiniteGrid("#grid", {
		"isInitLayout" : false,
	});
	this.inst.on("layoutComplete",function(e) {
		// Then
		if(beforeClear) {
			equal(this.isProcessing(), false, "idel in layoutComplete");
			equal(e.target.length, 6, "a number of elements are 6");
			equal(this.core.items.length, 6, "a number of elements are 6");
			equal(this.core.$element.children().length, 6, "a number of DOM are 6");
			beforeClear = false;
			this.clear();
		} else {
			equal(e.target.length, 0, "a number of elements are 0");
			equal(this.core.items.length, 0, "a number of elements are 0");
			equal(this.core.$element.children().length, 0, "a number of DOM are 0");
			equal(this._addType, null, "addType is null");
			equal(this._isFitted, true, "isFitted is true");
			equal(this._contentCount, 0, "a number of contentCount are 0");
			start();
		}
	});
	// When
	// Then
	equal(this.inst.isProcessing(), false, "idel");

	// When
	this.inst.layout();
});

//@todo prepend count값에 대한 테스트
//@todo equalSize에 대한 테스트 
//@todo updateCol에 대한 별도 테스트