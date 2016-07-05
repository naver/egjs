/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

var HTML = '<li class="item"><div><img></img></div></li>';
var imglist = ["http://thumb.comic.naver.net/webtoon/25455/thumbnail/title_thumbnail_20100614120245_t125x101.jpg", "http://thumb.comic.naver.net/webtoon/25455/369/inst_thumbnail_20150824151122.jpg", "http://thumb.comic.naver.net/webtoon/25455/368/inst_thumbnail_20150817151137.jpg", "http://thumb.comic.naver.net/webtoon/25455/367/inst_thumbnail_20150810145539.jpg", "http://thumb.comic.naver.net/webtoon/25455/366/inst_thumbnail_20150803143116.jpg", "http://thumb.comic.naver.net/webtoon/25455/365/inst_thumbnail_20150727120816.jpg", "http://thumb.comic.naver.net/webtoon/25455/364/inst_thumbnail_20150720184900.jpg", "http://thumb.comic.naver.net/webtoon/25455/363/inst_thumbnail_20150713114138.jpg", "http://thumb.comic.naver.net/webtoon/25455/362/inst_thumbnail_20150706133629.jpg", "http://thumb.comic.naver.net/webtoon/25455/361/inst_thumbnail_20150624164209.jpg", "http://thumb.comic.naver.net/webtoon/25455/360/inst_thumbnail_20150622152654.jpg", "http://thumb.comic.naver.net/webtoon/25455/359/inst_thumbnail_20150615141213.jpg", "http://thumb.comic.naver.net/webtoon/25455/358/inst_thumbnail_20150608135433.jpg", "http://thumb.comic.naver.net/webtoon/25455/357/inst_thumbnail_20150601135204.jpg", "http://thumb.comic.naver.net/webtoon/25455/356/inst_thumbnail_20150522121047.jpg", "http://thumb.comic.naver.net/webtoon/25455/355/inst_thumbnail_20150518120949.jpg", "http://thumb.comic.naver.net/webtoon/25455/354/inst_thumbnail_20150511150235.jpg", "http://thumb.comic.naver.net/webtoon/25455/353/inst_thumbnail_20150504122037.jpg", "http://thumb.comic.naver.net/webtoon/25455/352/inst_thumbnail_20150106004005.jpg", "http://thumb.comic.naver.net/webtoon/25455/351/inst_thumbnail_20141229145942.jpg", "http://thumb.comic.naver.net/webtoon/25455/350/inst_thumbnail_20141222155245.jpg", "http://thumb.comic.naver.net/webtoon/25455/349/inst_thumbnail_20141212180336.jpg", "http://thumb.comic.naver.net/webtoon/25455/348/inst_thumbnail_20141201141813.jpg", "http://thumb.comic.naver.net/webtoon/25455/347/inst_thumbnail_20141124135647.jpg", "http://thumb.comic.naver.net/webtoon/25455/346/inst_thumbnail_20141117150140.jpg", "http://thumb.comic.naver.net/webtoon/25455/345/inst_thumbnail_20141110153559.jpg", "http://thumb.comic.naver.net/webtoon/25455/344/inst_thumbnail_20141103144248.jpg", "http://thumb.comic.naver.net/webtoon/25455/343/inst_thumbnail_20141027162333.jpg", "http://thumb.comic.naver.net/webtoon/25455/342/inst_thumbnail_20141020122337.jpg", "http://thumb.comic.naver.net/webtoon/25455/341/inst_thumbnail_20141013122602.jpg", "http://thumb.comic.naver.net/webtoon/25455/340/inst_thumbnail_20141006142907.jpg"];
var getContent = function(className, x) {
	var s = "";
	x = x || ( (parseInt(Math.random() * 100) % 10) +1 ) ;
	for(var i=0; i<x; i++) {
		s+= HTML;
	}
	var $el = $(s);
	$el.addClass(className).find("img").height(function() {
		var val = parseInt(Math.random() * 100,10);
		var r = parseInt(Math.random() * 100,10)%imglist.length;
		$(this).attr("src", imglist[r]);
		return val < 40 ? 40 : val;
	});
	return $el;
};


module("util Test", {
	setup : function() {

	},
	teardown : function() {
	}
});

test("check clone method", function() {
	// Given
	var ig = eg.invoke("infiniteGrid", [ null, null, null, null, null]);

	// When
	var obj = {
		p1 : null,
		p2 : undefined,
		p3 : "string",
		p4 : {
			a:1,
			b:"string"
		},
		p5 : ["a",1,3]
	};
	var result = ig.clone({}, obj, [
		"p1","p2","p3","p4", "p5", "p6"
		]);

	// Then
	ok(typeof obj.p2 === "undefined", "check undefined type");
	deepEqual(obj, result, "check clone");
});

module("infiniteGrid initailization/destroy Test", {
	setup : function() {
		this.inst = null;
	},
	teardown : function() {
		if(this.inst) {
			this.inst.destroy();
			this.inst = null;
		}
	}
});

test("check a initialization (there are children)", function(assert) {
	// Given
	// When
	var done = assert.async();
	this.inst = new eg.InfiniteGrid("#grid");
	this.inst.on("layoutComplete", function(e) {
		// Then
		equal(e.target.length, 6, "a number of elements are 6");
		equal(this.core.items.length, 6, "a number of elements are 6");
		equal(this.isProcessing(), false, "idel in layoutComplete");
		done();
	});
	// Then
	equal(this.inst.isProcessing(), true, "ing...");
});

test("check a append after a initialization (there aren't children)", function(assert) {
	// Given
	var done = assert.async();
	var $el = getContent("append");
	this.inst = new eg.InfiniteGrid("#nochildren_grid");

	// When
	equal(this.inst.isProcessing(), false, "idel");
	this.inst.on("layoutComplete",function(e) {
		// Then
		equal(e.target.length, $el.length, "a number of elements are " + $el.length);
		equal(this.core._appendCols.length, 2, "is correct columnWidth");
		equal(this.isProcessing(), false, "idel in layoutComplete");
		done();
	});
	this.inst.append($el);
});

test("release event handler after destroy", function(assert) {
	// Given
	var done = assert.async();
	var scrollCount = 0;
	var resizeCount = 0;
	var $global = $(window);

	// When
	$global.on("scroll resize", function(e) {
		e.type === "scroll" ? scrollCount++ : resizeCount++;
	});
	this.inst = new eg.InfiniteGrid("#grid");
	this.inst.destroy();
	this.inst = null;

	$global.trigger("scroll");
	$global.trigger("resize");

	// Then
	setTimeout(function() {
		// resize, scroll event is fired twice in IE8
		ok(scrollCount > 0, "should exist scroll event");
		ok(resizeCount > 0, "should exist resize event");
		$global.off("scroll resize");
		done();
	},100);
});


module("infiniteGrid append Test", {
	setup : function() {
		this.inst = new eg.InfiniteGrid("#nochildren_grid", {
			"count" : 18
		});
	},
	teardown : function() {
		if(this.inst) {
			this.inst.destroy();
			this.inst = null;
		}
	}
});

test("check a append module", function(assert) {
	// Given
	var done = assert.async();
	var addCount = 0,
		itemsCount = 0;

	// When
	this.inst.on("layoutComplete",function(e) {
		// Then
		equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
		equal(e.isAppend, true, "append type");
		equal(e.distance, 0, "check distance");
		itemsCount += e.target.length;
		if(this.isRecycling()) {
			equal(this.core.items.length, this.options.count, "a number of elements are always 18");
			equal(e.croppedCount, itemsCount-this.options.count, "check croppedCount");
		} else {
			equal(itemsCount, this.core.items.length, "item added " + e.target.length);
		}
		equal(this.core.$element.children().length, this.core.items.length, "a number of elements(DOM) -> " + this.core.items.length);
		if(addCount++ < 10) {
			this.append(getContent("append",5));
		} else {
			done();
		}
	});
	itemsCount = this.inst.core.items.length;
	this.inst.append(getContent("append"));
});


test("check a append module with groupkey", function(assert) {
	// Given
	var done = assert.async();
	var addCount = 0,
		groupkey = 0,
		itemsCount = 0,
		group = {};

	// When
	this.inst.on("layoutComplete",function(e) {
		// Then
		equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
		equal(e.isAppend, true, "append type");
		group[groupkey] = e.target.length;
		itemsCount += e.target.length;
		if(this.isRecycling()) {
			var groupKeys = this.getGroupKeys();
			var total = 0;
			for(var i=groupKeys[0]; i<=groupKeys[groupKeys.length-1]; i++) {
				total += group[i];
			}
			equal(this.core.items.length, total, "a number of elements are " + total);
			equal(e.croppedCount, itemsCount-this.core.items.length, "check croppedCount");
		} else {
			equal(itemsCount, this.core.items.length, "** item added " + e.target.length);
		}
		equal(this.core.$element.children().length, this.core.items.length, "a number of elements(DOM) -> " + this.core.items.length);
		if(addCount++ < 10) {
			this.append(getContent("append"), ++groupkey);
		} else {
			done();
		}
	});
	itemsCount = this.inst.core.items.length;
	this.inst.append(getContent("append"), groupkey);
});

module("infiniteGrid prepend Test", {
	setup : function() {
		this.inst = new eg.InfiniteGrid("#nochildren_grid", {
			"count" : 18
		});
	},
	teardown : function() {
		if(this.inst) {
			this.inst.destroy();
			this.inst = null;
		}
	}
});

test("check a prepend module", function(assert) {
	var done = assert.async();
	var addCount = 0,
		beforeItem = null;
	// Given
	// When
	this.inst.prepend(getContent("prepend"));
	// Then
	equal(this.inst.core.items.length, 0, "a number of elements are always 0");
	equal(this.inst.core.$element.children().length, 0, "a number of elements(DOM) are always 0");

	// When
	this.inst.on("layoutComplete",function(e) {
		// When
		this.off();
		this.on("layoutComplete",function(e) {
			beforeItem = this.core.items[e.target.length];
			equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
			equal(e.isAppend, false, "prepend type");
			equal(e.distance, beforeItem.position.y, "check distance");
			equal(this.isRecycling(), true, "recycle mode");
			equal(this.core.items.length, 18, "a number of elements are always 18");
			equal(this.core.$element.children().length, 18, "a number of elements(DOM) are always 18");

			if(addCount++ < 10) {
				if(this.prepend(getContent("prepend")) == 0) {
					done();
				}
			} else {
				done();
			}
		});
		// Then
		this.prepend(getContent("prepend"));
	});

	// Then
	this.inst.append(getContent("append",200));
});


test("check a prepend module with groupkey", function(assert) {
	var done = assert.async();
	// Given
	function beforeGroupInfo(inst, group) {
		var groupKey = inst.getGroupKeys()[0]-1;
		return {
			groupKey : groupKey,
			count : group[groupKey]
		};
	}
	var addCount = 0,
		groupkey = 0,
		groupInfo = {},
		group = {};

	// When
	this.inst.on("layoutComplete",function(e) {
		if(addCount++ <5) {
			group[groupkey] = e.target.length;
			equal(this.core.$element.children().length, this.core.items.length, "a number of elements(DOM) -> " + this.core.items.length + ", removeCount : " + this._removedContent);
			equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
			this.append(getContent("append",20),groupkey++);
		} else {
			prependTest(this);
		}
	});
	// Then
	this.inst.append(getContent("append",20),groupkey++);

	function prependTest(inst) {
		// Given
		inst.off();
		inst.on("layoutComplete",function(e) {
			var groupKeys = this.getGroupKeys();
			var total = 0;

			for(var i=groupKeys[groupKeys.length-1]; i>=groupKeys[0]; i--) {
				total += group[i];
			}
			// Then
			equal(e.isAppend, false, "prepend type");
			equal(this.core.items.length, total, "a number of elements are " + total);
			equal(this.core.$element.children().length, this.core.items.length, "a number of elements(DOM) -> " + this.core.items.length);

			if(addCount-- <= 0) {
				groupInfo = beforeGroupInfo(inst, group);
				inst.prepend(getContent("prepend", groupInfo.count), groupInfo.groupKey);
			} else {
				done();
			}
		});
		// When
		groupInfo = beforeGroupInfo(inst, group);
		inst.prepend(getContent("prepend", groupInfo.count), groupInfo.groupKey);
	}
});

test("check a count of remove contents", function(assert) {
	var done = assert.async();
	// Given
	// When
	// Then
	equal(this.inst._removedContent, 0, "content is 0 from markup");
	equal(this.inst.isRecycling(), false, "elements are lacked");

	//When
	this.inst.on("layoutComplete",function(e) {
		// Then
		equal(this.isProcessing(), false, "idel in layoutComplete ");
		equal(e.isAppend, true, "append type");
		equal(this.isRecycling(), true, "recycle mode");
		equal(this.core.items.length, 18, "a number of elements are always 18");
		equal(this.core.$element.children().length, 18, "a number of DOM are always 18");
		equal(e.croppedCount, 188, "a number of removed elements are 188");

		// When
		this.off();
		this.on("layoutComplete",function(e) {
			// Then
			equal(this.isProcessing(), false, "idel in layoutComplete " + e.target.length);
			equal(e.target.length, 188, "a number of prepend elements are 188");
			equal(e.isAppend, false, "prepend type");
			equal(this.isRecycling(), true, "recycle mode");
			equal(this.core.items.length, 18, "a number of elements are always 18");
			equal(this.core.$element.children().length, 18, "a number of DOM are always 18");
			equal(e.croppedCount, 0, "a number of removed elements are 0");
			done();
		});
		this.prepend(getContent("prepend", 200));
	});
	this.inst.append(getContent("append",206));
});

test("check item/element order and check removed parts", function(assert) {
	var done = assert.async();

	//When
	this.inst.on("layoutComplete",function(e) {
		this.off();
		this.on("layoutComplete",function(e) {
			// Then
			var self = this;
			equal(e.target.length, 30-this.options.count , "check remove a count of items");
			this.core.$element.children().slice(0,e.target.length).each(function(i,v) {
				equal($(v).data("prepend-index"), i, "check element order" );
				deepEqual(self.core.items[i].element,v, "check item order");
			});
			equal(e.isAppend, false, "prepend type");
			done();
		});

		// When
		var $prependElement = getContent("prepend", 20);
		$prependElement.each(function(i,v) {
			$(v).data("prepend-index", i);
		});
		this.prepend($prependElement);
	});
	this.inst.append(getContent("append",30));
});

module("infiniteGrid unit method Test", {
	setup : function() {
		this.inst = null;
	},
	teardown : function() {
		if(this.inst) {
			this.inst.destroy();
			this.inst = null;
		}
	}
});

test("check object in restore method", function() {
	// Given
	this.inst = new eg.InfiniteGrid("#grid", {
		"count" : 18
	});

	// When
	var before = this.inst.getStatus();
	this.inst.setStatus({});

	// Then
	equal(this.inst.core.element.style.cssText, before.cssText, "check cssText");
	equal(this.inst.core.$element.html(), before.html, "check html");

	// When
	this.inst.setStatus();

	// Then
	equal(this.inst.core.element.style.cssText, before.cssText, "check cssText");
	equal(this.inst.core.$element.html(), before.html, "check html");
});

test("restore status", function(assert) {
	var done = assert.async();
	var $el;
	// Given
	this.inst = new eg.InfiniteGrid("#grid", {
		"count" : 18
	});

	// When
	this.inst.on("layoutComplete",function(e) {
		var parseCssText = function(str) {
			var ht = {};
			var $styles = $(str.split(";"));
			$styles = $styles.map(function(i,v) {
    		return $.trim(v);
			}).filter(function(i,v) {
				return !$.isEmptyObject(v);
			}).each(function(i,v) {
		    var a =v.split(":");
		    var val = $.trim(a[1]);
		    if(!$.isEmptyObject(val)) {
		        ht[a[0]] = $.trim(a[1]);
		    }
			});
			return ht;
		};
		var beforeStatus = this.getStatus();
		var self = this;

		// Then
		equal(beforeStatus.html, this.core.$element.html(), "check html");
		equal(beforeStatus.cssText, this.core.element.style.cssText, "check cssText");
		$.each(beforeStatus.core.items, function(i, v) {
			deepEqual(v.position, self.core.items[i].position, "check html and position information");
			deepEqual(v.size, self.core.items[i].size,"check html and size information");
		});
		equal(beforeStatus.core._isLayoutInited, this.core._isLayoutInited, "check _isLayoutInited info");
		deepEqual(beforeStatus.core._appendCols, this.core._appendCols, "check _appendCols info");
		deepEqual(beforeStatus.core._prependCols, this.core._prependCols, "check _prependCols info");
		deepEqual(beforeStatus.core.columnWidth, this.core.columnWidth, "check columnWidth info");
		deepEqual(beforeStatus.core.size, this.core.size, "check size info");
		deepEqual(beforeStatus.core.options, this.core.options, "check options info");
		$.each(beforeStatus.data, function(i, v) {
			equal(self[v], beforeStatus.data[v], "check infiniteGrid properties " + v);
		});

		// Given
		this.destroy();
		var infinite = new eg.InfiniteGrid("#grid", {
			"count" : 18
		});

		// When
		infinite.setStatus(beforeStatus);

		// Then
		deepEqual(parseCssText(infinite.core.element.style.cssText), parseCssText(beforeStatus.cssText), "check cssText");
		$.each(infinite.core.items, function(i, v) {
			deepEqual(v.position, beforeStatus.core.items[i].position, "check html and position information");
			deepEqual(v.size, beforeStatus.core.items[i].size,"check html and size information");
			$el = $(v.element);
			deepEqual(v.position, {
				"x" : parseInt($el.css("left"),10),
				"y" : parseInt($el.css("top"),10)
			}, "check html and position information");
		});
		deepEqual(infinite.core._appendCols, beforeStatus.core._appendCols, "check appendCol info");
		deepEqual(infinite.core._prependCols, beforeStatus.core._prependCols, "check appendCol info");
		deepEqual(infinite.core.columnWidth, beforeStatus.core.columnWidth, "check columnWidth info");
		deepEqual(infinite.core.size, beforeStatus.core.size, "check size info");
		deepEqual(infinite.core.options, beforeStatus.core.options, "check options info");
		$.each(beforeStatus.data, function(i, v) {
			equal(infinite[v], beforeStatus.data[v], "check infiniteGrid properties " + v);
		});
		done();
	});

	// Then
	this.inst.append(getContent("append",50));
});

test("check a clear", function(assert) {
	var done = assert.async();
	// Given
	// When
	var beforeClear = true;
	this.inst = new eg.InfiniteGrid("#grid");
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
			equal(this._isRecycling, false, "_isRecycling is false");
			equal(this._isAppendType, null, "_isAppendType is null");
			equal(this._isProcessing, false, "_isProcessing is false");
			equal(e.croppedCount, 0, "a number of removedContent are 0");
			done();
		}
	});
});

test("Check public methods return", function () {
	// Given
	// When
	this.inst = new eg.InfiniteGrid("#grid");
	var beforeStatus = this.inst.getStatus();

	// Then
	equal(this.inst.setStatus(beforeStatus), this.inst, "return instance");
	equal(this.inst.layout(), this.inst, "return instance");
	equal(this.inst.clear(), this.inst, "return instance");
});

test("Check prefixEvent", function (assert) {
	var done = assert.async();
	// Given
	var isTriggered = false;
	// When
	this.inst = new eg.InfiniteGrid("#grid", {}, "TEST:");
	this.inst.on("TEST:layoutComplete", function() {
		isTriggered = true;
	});
	this.inst.layout();

	// Then
	setTimeout(function() {
		equal(isTriggered, true, "check if prefixEvent trigger");
		done();
	},200);
});


test("Check append/prepend methods return", function (assert) {
	var done = assert.async();
	var appendCount = 0,
		prependCount = 0,
		self = this;
	// Given
	this.inst = new eg.InfiniteGrid("#nochildren_grid", {
		"count" : 18
	});
	// When
	this.inst.on("layoutComplete",function(e) {
		// Given
		this.off();
		this.on("layoutComplete",function(e) {
			// Then
			equal(prependCount, 182);
			equal(e.target.length, 182);
			done();
		});

		// When
		prependCount = self.inst.prepend(getContent("prepend",300));
	});

	// Then
	appendCount = this.inst.append(getContent("append",200));
	equal(appendCount, 200);
});

var complicatedHTML = "<div class='item'><div class='thumbnail'><img class='img-rounded' src='#' /><div class='caption'><p><a href='http://www.naver.com'></a></p></div></div></div>";

module("infiniteGrid data type Test", {
	setup : function() {
		this.inst = new eg.InfiniteGrid("#nochildren_grid", {
			"count" : 20
		});
	},
	teardown : function() {
		if(this.inst) {
			this.inst.destroy();
			this.inst = null;
		}
	}
});

test("Check type #1 - concated String type", function(assert) {
	// Given
	var done = assert.async();
	var data = [];
	for(var i=0; i<100; i++) {
		data.push(complicatedHTML);
	}
	data = data.join("");

	this.inst.on("layoutComplete",function(e) {
		if(e.isAppend) {
			// Then
			equal(e.target.length, 100, "[append] a number of elements are 100");
			equal(this.core.items.length, 20, "[append] a number of items are 20");
			equal(this.core.$element.children().length, 20, "[append] a number of DOM are 20");

			// When
			this.prepend(data);
		} else {
			// Then
			equal(e.target.length, 80, "[prepend] a number of elements are 80");
			equal(this.core.items.length, 20, "[prepend] a number of items are 20");
			equal(this.core.$element.children().length, 20, "[prepend] a number of DOM are 20");
			done();
		}
	});

	// When
	this.inst.append(data);
});

test("Check type #2 - array has HTMLElement type", function(assert) {
	// Given
	var done = assert.async();
	var data = [];
	for(var i=0; i<100; i++) {
		data.push($(complicatedHTML).get(0));
	}

	this.inst.on("layoutComplete",function(e) {
		if(e.isAppend) {
			// Then
			equal(e.target.length, 100, "[append] a number of elements are 100");
			equal(this.core.items.length, 20, "[append] a number of items are 20");
			equal(this.core.$element.children().length, 20, "[append] a number of DOM are 20");

			// When
			this.prepend(data.concat());
		} else {
			// Then
			equal(e.target.length, 80, "[prepend] a number of elements are 80");
			equal(this.core.items.length, 20, "[prepend] a number of items are 20");
			equal(this.core.$element.children().length, 20, "[prepend] a number of DOM are 20");
			done();
		}
	});

	// When
	this.inst.append(data.concat());
});

test("Check type #3 - jQuery type", function(assert) {
	// Given
	var done = assert.async();
	var data = [];
	for(var i=0; i<100; i++) {
		data.push(complicatedHTML);
	}
	data = data.join("");

	this.inst.on("layoutComplete",function(e) {
		if(e.isAppend) {
			// Then
			equal(e.target.length, 100, "[append] a number of elements are 100");
			equal(this.core.items.length, 20, "[append] a number of items are 20");
			equal(this.core.$element.children().length, 20, "[append] a number of DOM are 20");

			// When
			this.prepend($(data));
		} else {
			// Then
			equal(e.target.length, 80, "[prepend] a number of elements are 80");
			equal(this.core.items.length, 20, "[prepend] a number of items are 20");
			equal(this.core.$element.children().length, 20, "[prepend] a number of DOM are 20");
			done();
		}
	});

	// When
	this.inst.append($(data));
});

module("infiniteGrid event handler Test", {
	setup : function() {
		// viewportSize: { width: 360, height: 640 }
		this.fakeDoc = {
			body: {
				scrollTop: 0,
				clientHeight : 640,
				clientWidth : 360
			},
			documentElement: {
				scrollTop: 0
			}
		};
		eg.invoke("infiniteGrid", [ null, null, null, this.fakeDoc, null]);
		this.inst = new eg.InfiniteGrid("#nochildren_grid", {
			"count" : 20,
			"threshold": 100
		});
	},
	teardown : function() {
		if(this.inst) {
			this.inst.destroy();
			this.inst = null;
		}
	}
});

test("Test append event", function(assert) {
	// Given
	var done = assert.async();
	var rect = {
		top : 0
	};
	var self = this;
	this.inst._clientHeight = 640;
	this.inst.getBottomElement = function() {
		return {
			getBoundingClientRect : function() {
				return rect;
			}
		}
	};

	this.inst.on({
		"layoutComplete": function(e) {
			// When
			rect.top = self.inst._clientHeight + self.inst.options.threshold;
			self.fakeDoc.body.scrollTop = 100;
			$(window).trigger("scroll");
		},
		"append": function(e) {
			// Then
			equal(e.scrollTop, 100, "check scrollTop parameter");
			rect.top += 1;
			self.fakeDoc.body.scrollTop = 110;
			$(window).trigger("scroll");
			setTimeout(function() {
				done();
			},100);
		}
	});

	// When
	this.inst.append(getContent("append",200));
});


test("Test prepend event", function(assert) {
	// Given
	var done = assert.async();
	var rect = {
		bottom : 0
	};
	var self = this;
	this.inst._clientHeight = 640;
	this.inst.getTopElement = function() {
		return {
			getBoundingClientRect : function() {
				return rect;
			}
		}
	};

	this.inst.on({
		"layoutComplete": function(e) {
			// Then
			equal(self.inst.isRecycling(), true, "recycle mode");
			equal(e.croppedCount, 200 - self.inst.options.count, "check croppedCount");

			// When
			rect.bottom -= self.inst.options.threshold;
			self.fakeDoc.body.scrollTop = 100;
			$(window).trigger("scroll");
		},
		"prepend": function(e) {
			// Then
			equal(e.scrollTop, 100, "check scrollTop parameter");
			rect.bottom -= 1;
			self.fakeDoc.body.scrollTop = 90;
			$(window).trigger("scroll");
			setTimeout(function() {
				done();
			},100);
		}
	});

	// When
	this.inst._prevScrollTop = this.fakeDoc.body.scrollTop = 300;
	this.inst.append(getContent("append",200));
});

//@todo add column count test when outlayer.js dropped.
//outlayer couldn't invoke window properties