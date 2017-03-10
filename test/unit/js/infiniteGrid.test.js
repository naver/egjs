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


QUnit.module("infiniteGrid initailization/destroy Test", {
	beforeEach : function() {
		this.inst = null;
	},
	afterEach : function() {
		if(this.inst) {
			this.inst.destroy();
			this.inst = null;
		}
	}
});

QUnit.test("check a initialization (there are children)", function(assert) {
	// Given
	// When
	var done = assert.async();
	this.inst = new eg.InfiniteGrid("#grid");
	this.inst.on("layoutComplete", function(e) {
		// Then
		assert.equal(e.target.length, 6, "a number of elements are 6");
		assert.equal(this.items.length, 6, "a number of elements are 6");
		assert.equal(this.isProcessing(), false, "idel in layoutComplete");
		assert.equal(this.$el.get(0).style.width, "", "should not set width value");
		done();
	});
	// Then
	assert.equal(this.inst.isProcessing(), true, "ing...");
});

QUnit.test("check a append after a initialization (there aren't children)", function(assert) {
	// Given
	var done = assert.async();
	var $el = getContent("append");
	this.inst = new eg.InfiniteGrid("#nochildren_grid");
	// When
	assert.equal(this.inst.isProcessing(), false, "idel");
	this.inst.on("layoutComplete",function(e) {
		// Then
		assert.equal(e.target.length, $el.length, "a number of elements are " + $el.length);
		assert.equal(this._appendCols.length, 2, "is correct columnWidth");
		assert.equal(this.isProcessing(), false, "idel in layoutComplete");
		done();
	});
	this.inst.append($el);
});

QUnit.test("release event handler after destroy", function(assert) {
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

	$global.trigger("scroll");
	$global.trigger("resize");

	// Then
	setTimeout(function() {
		// resize, scroll event is fired twice in IE8
		assert.ok(scrollCount > 0, "should exist scroll event");
		assert.ok(resizeCount > 0, "should exist resize event");
		$global.off("scroll resize");
		done();
	},100);
});


QUnit.module("infiniteGrid append Test", {
	beforeEach : function() {
		this.inst = new eg.InfiniteGrid("#nochildren_grid", {
			"count" : 18
		});
	},
	afterEach : function() {
		if(this.inst) {
			this.inst.destroy();
			this.inst = null;
		}
	}
});

QUnit.test("check a append module", function(assert) {
	// Given
	var done = assert.async();
	var addCount = 0,
		itemsCount = 0,
		beforeTotalCroppedCount = 0,
		totalCroppedCount = 0;

	// When
	this.inst.on("layoutComplete",function(e) {
		// Then
		assert.equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
		assert.equal(e.isAppend, true, "append type");
		assert.equal(e.distance, 0, "check distance");
		itemsCount += e.target.length;
		if(this.isRecycling()) {
			totalCroppedCount = itemsCount - this.items.length;
			assert.equal(this.items.length, this.options.count, "a number of elements are always 18");
			assert.equal(e.croppedCount, totalCroppedCount - beforeTotalCroppedCount, "check croppedCount");
		} else {
			assert.equal(itemsCount, this.items.length, "item added " + e.target.length);
		}
		assert.equal(this.el.children.length, this.items.length, "a number of elements(DOM) -> " + this.items.length);
		beforeTotalCroppedCount = totalCroppedCount;

		if(addCount++ < 10) {
			this.append(getContent("append",5));
		} else {
			done();
		}
	});
	itemsCount = this.inst.items.length;
	this.inst.append(getContent("append"));
});


QUnit.test("check a append module with groupkey", function(assert) {
	// Given
	var done = assert.async();
	var addCount = 0,
		groupkey = 0,
		itemsCount = 0,
		group = {},
		beforeTotalCroppedCount = 0,
		totalCroppedCount = 0;

	// When
	this.inst.on("layoutComplete",function(e) {
		// Then
		assert.equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
		assert.equal(e.isAppend, true, "append type");
		group[groupkey] = e.target.length;
		itemsCount += e.target.length;
		if(this.isRecycling()) {
			var groupKeys = this.getGroupKeys();
			var total = 0;
			for(var i=groupKeys[0]; i<=groupKeys[groupKeys.length-1]; i++) {
				total += group[i];
			}
			totalCroppedCount = itemsCount - this.items.length;
			assert.equal(this.items.length, total, "a number of elements are " + total);
			assert.equal(e.croppedCount, totalCroppedCount - beforeTotalCroppedCount, "check croppedCount");
		} else {
			assert.equal(itemsCount, this.items.length, "** item added " + e.target.length);
		}
		assert.equal(this.el.children.length, this.items.length, "a number of elements(DOM) -> " + this.items.length);
		beforeTotalCroppedCount = totalCroppedCount;
		if(addCount++ < 10) {
			this.append(getContent("append"), ++groupkey);
		} else {
			done();
		}
	});
	itemsCount = this.inst.items.length;
	this.inst.append(getContent("append"), groupkey);
});

QUnit.module("infiniteGrid prepend Test", {
	beforeEach : function() {
		this.inst = new eg.InfiniteGrid("#nochildren_grid", {
			"count" : 18
		});
	},
	afterEach : function() {
		if(this.inst) {
			this.inst.destroy();
			this.inst = null;
		}
	}
});

QUnit.test("check a prepend module", function(assert) {
	var done = assert.async();
	var addCount = 0,
		beforeItem = null;
	// Given
	// When
	assert.equal(this.inst.items.length, 0, "a number of elements are always 0");
	assert.equal(this.inst.el.children.length, 0, "a number of elements(DOM) are always 0");

	// When
	this.inst.on("layoutComplete",function(e) {
		// When
		this.off();
		this.on("layoutComplete",function(e) {
			beforeItem = this.items[e.target.length];
			assert.equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
			assert.equal(e.isAppend, false, "prepend type");
			assert.equal(e.distance, beforeItem.position.y, "check distance");
			assert.equal(this.isRecycling(), true, "recycle mode");
			assert.equal(this.items.length, 18, "a number of elements are always 18");
			assert.equal(this.el.children.length, 18, "a number of elements(DOM) are always 18");

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
	this.inst.append(getContent("append", 200));
});


QUnit.test("check a prepend module with groupkey", function(assert) {
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
			assert.equal(this.isProcessing(), false, "idel in layoutComplete " + addCount);
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
			assert.equal(e.isAppend, false, "prepend type");
			assert.equal(this.items.length, total, "a number of elements are " + total);
			assert.equal(this.el.children.length, this.items.length, "a number of elements(DOM) -> " + this.items.length);

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

QUnit.test("check a count of remove contents", function(assert) {
	var done = assert.async();
	// Given
	// When
	// Then
	assert.equal(this.inst.isRecycling(), false, "elements are lacked");

	//When
	this.inst.on("layoutComplete",function(e) {
		// Then
		assert.equal(this.isProcessing(), false, "idel in layoutComplete ");
		assert.equal(e.isAppend, true, "append type");
		assert.equal(this.isRecycling(), true, "recycle mode");
		assert.equal(this.items.length, 18, "a number of elements are always 18");
		assert.equal(this.el.children.length, 18, "a number of DOM are always 18");
		assert.equal(e.croppedCount, 188, "a number of removed elements are 188");

		// When
		this.off();
		this.on("layoutComplete",function(e) {
			// Then
			assert.equal(this.isProcessing(), false, "idel in layoutComplete " + e.target.length);
			assert.equal(e.target.length, 18, "a number of prepend elements are 18");
			assert.equal(e.isAppend, false, "prepend type");
			assert.equal(this.isRecycling(), true, "recycle mode");
			assert.equal(this.items.length, 18, "a number of elements are always 18");
			assert.equal(this.el.children.length, 18, "a number of DOM are always 18");
			assert.equal(e.croppedCount, 200, "a number of removed elements are 0");
			done();
		});
		this.prepend(getContent("prepend", 200));
	});
	this.inst.append(getContent("append",206));
});

QUnit.test("check item/element order and check removed parts", function(assert) {
	var done = assert.async();

	function getUniqueX(target) {
		var temp = {};
		var x = $(target).map(function(i, v) {
			return v.position.x;	
		}).each(function(i, v) {
			if (!(v in temp)) {
				temp[v] = v;
			} 
		});
		
		var ret = [];
		for(var p in temp) {
			ret.push(p);
		}
		return ret;
	}

	function getGroups(target) {
		var x = getUniqueX(target);
		var group = {};
		$.each(x, function(i, v) {
			group[v] = $.grep(target, function(gv) {
				return gv.position.x === ~~v;
			}).sort(function(p, c) {
				return p.position.y - c.position.y;
			});
		});
		return group;
	}

	//When
	this.inst.on("layoutComplete",function(e) {
		assert.equal(e.target.length, this.options.count , "check a count of items");
		assert.equal(e.croppedCount, 30 - this.options.count, "check croppedCount");
		this.off();
		this.on("layoutComplete",function(e) {
			// Then
			assert.equal(e.target.length, this.options.count, "check remove a count of items");
			assert.equal(e.croppedCount, 20, "check croppedCount");

			this.$el.children().slice(0,e.target.length).each( function(i, v) {
				assert.equal($(v).data("prepend-index"), i, "check element order " + i);
			});
			var groups = getGroups(e.target);
			for(var p in groups) {
				$.each(groups[p], function(i, v) {
					if (i > 0) {
						assert.ok(v.position.y >=  groups[p][i-1].position.y, "it's greater than or equal to previous value");
						assert.ok($(v.el).data("prepend-index") >=  $(groups[p][i-1].el).data("prepend-index"), "it's greater than or equal to previous value (data)");
					}
				})
			}
			assert.equal(e.isAppend, false, "prepend type");
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

QUnit.test("check a prepend workaround code (doublecheck)", function(assert) {
	// Given
	// When
	var done = assert.async();
	var prependCount = 0;
	this.inst.on({
		"prepend": function(e) {
			prependCount++
		},
		"layoutComplete": function(e) {
			assert.equal(e.isAppend, false, "prepend type");
			$(window).scrollTop(0);
		}
	});

	// When
	this.inst.prepend(getContent("prepend", 200));

	setTimeout(function() {
		// Then
		assert.equal(prependCount, 3);
		done();
	}, 2000);
});


QUnit.module("infiniteGrid unit method Test", {
	beforeEach : function() {
		this.inst = null;
	},
	afterEach : function() {
		if(this.inst) {
			this.inst.destroy();
			this.inst = null;
		}
	}
});

QUnit.test("check object in restore method", function(assert) {
	// Given
	this.inst = new eg.InfiniteGrid("#grid", {
		"count" : 18
	});

	// When
	var before = this.inst.getStatus();
	this.inst.setStatus({});

	// Then
	assert.equal(this.inst.el.style.cssText, before.cssText, "check cssText");
	assert.equal(this.inst.el.innerHTML, before.html, "check html");

	// When
	this.inst.setStatus();

	// Then
	assert.equal(this.inst.el.style.cssText, before.cssText, "check cssText");
	assert.equal(this.inst.el.innerHTML, before.html, "check html");
});

QUnit.test("restore status", function(assert) {
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
		// Then
		assert.equal(beforeStatus.html, this.$el.html(), "check html");
		assert.equal(beforeStatus.cssText, this.el.style.cssText, "check cssText");
		var self = this;
		beforeStatus.items.forEach( function(v,i) {
			assert.deepEqual(v.position, self.items[i].position, "check html and position information");
			assert.deepEqual(v.size, self.items[i].size,"check html and size information");
		});
		for(var v in beforeStatus.prop) {
			assert.equal(this[v], beforeStatus.prop[v], "check infiniteGrid properties " + v);
		};

		// Given
		this.destroy();
		var infinite = new eg.InfiniteGrid("#grid", {
			"count" : 18
		});

		// When
		infinite.setStatus(beforeStatus);

		// Then
		assert.deepEqual(parseCssText(infinite.el.style.cssText), parseCssText(beforeStatus.cssText), "check cssText");
		infinite.items.forEach( function(v,i) {
			assert.deepEqual(v.position, beforeStatus.items[i].position, "check html and position information");
			assert.deepEqual(v.size, beforeStatus.items[i].size,"check html and size information");
			$el = $(v.el);
			assert.deepEqual(v.position, {
				"x" : parseInt(v.el.style.left, 10),
				"y" : parseInt(v.el.style.top, 10)
			}, "check html and position information-3");
		});
		assert.deepEqual(infinite.options, beforeStatus.options, "check options info");
		for(var v in beforeStatus.prop) {
			assert.equal(infinite[v], beforeStatus.prop[v], "check infiniteGrid properties " + v);
		};
		// infinite.destroy();
		done();
	});

	// Then
	this.inst.append(getContent("append",50));
});

QUnit.test("check a clear", function(assert) {
	var done = assert.async();
	// Given
	// When
	this.inst = new eg.InfiniteGrid("#grid");
	this.inst.on("layoutComplete",function(e) {
		// Then
		assert.equal(this.isProcessing(), false, "idel in layoutComplete");
		assert.equal(e.target.length, 6, "a number of elements are 6");
		assert.equal(this.items.length, 6, "a number of elements are 6");
		assert.equal(this.el.children.length, 6, "a number of DOM are 6");

		// When
		this.clear();

		// Then
		assert.equal(this.items.length, 0, "a number of elements are 0");
		assert.equal(this.el.children.length, 0, "a number of DOM are 0");
		assert.equal(this._isRecycling, false, "_isRecycling is false");
		assert.equal(this._isProcessing, false, "_isProcessing is false");
		assert.equal(e.croppedCount, 0, "a number of removedContent are 0");
		done();
	});
});

QUnit.test("Check public methods return", function (assert) {
	var done = assert.async();
	var self = this;

	// Given
	// When
	this.inst = new eg.InfiniteGrid("#grid");
	
	setTimeout(function() {
		var beforeStatus = self.inst.getStatus();

		// Then
		assert.equal(self.inst.setStatus(beforeStatus), self.inst, "return instance");
		assert.equal(self.inst.layout(), self.inst, "return instance");
		assert.equal(self.inst.clear(), self.inst, "return instance");
		done();
	},500);
});

QUnit.test("Check prefixEvent", function (assert) {
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
		assert.equal(isTriggered, true, "check if prefixEvent trigger");
		done();
	},200);
});

QUnit.test("Check append/prepend methods return", function (assert) {
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
			assert.equal(prependCount, 300);
			assert.equal(e.target.length, 18);
			done();
		});

		// When
		prependCount = self.inst.prepend(getContent("prepend",300));
	});

	// Then
	appendCount = this.inst.append(getContent("append",200));
	assert.equal(appendCount, 200);
});

QUnit.test("check getBottomElement method (same position)", function(assert) {
	var done = assert.async();
	var self = this;

	// Given
	this.inst = new eg.InfiniteGrid("#grid", {
		"count" : 18
	}).on("layoutComplete", function(e) {
		assert.equal(self.inst.getBottomElement().style.left, "500px");
		assert.equal(self.inst.getTopElement().style.left, "0px");
		done();
	});
});


var complicatedHTML = "<div class='item'><div class='thumbnail'><img class='img-rounded' src='#' /><div class='caption'><p><a href='http://www.naver.com'></a></p></div></div></div>";

QUnit.module("infiniteGrid data type Test", {
	beforeEach : function() {
		this.inst = new eg.InfiniteGrid("#nochildren_grid", {
			"count" : 20
		});
	},
	afterEach : function() {
		if(this.inst) {
			this.inst.destroy();
			this.inst = null;
		}
	}
});

QUnit.test("Check type #1 - concated String type", function(assert) {
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
			assert.equal(e.target.length, 20, "[append] a number of elements are 20");
			assert.equal(this.items.length, 20, "[append] a number of items are 20");
			assert.equal(this.el.children.length, 20, "[append] a number of DOM are 20");

			// When
			this.prepend(data);
		} else {
			// Then
			assert.equal(e.target.length, 20, "[prepend] a number of elements are 20");
			assert.equal(this.items.length, 20, "[prepend] a number of items are 20");
			assert.equal(this.el.children.length, 20, "[prepend] a number of DOM are 20");
			done();
		}
	});

	// When
	this.inst.append(data);
});

QUnit.test("Check type #2 - array has HTMLElement type", function(assert) {
	// Given
	var done = assert.async();
	var data = [];
	for(var i=0; i<100; i++) {
		data.push($(complicatedHTML).get(0));
	}

	this.inst.on("layoutComplete",function(e) {
		if(e.isAppend) {
			// Then
			assert.equal(e.target.length, 20, "[append] a number of elements are 20");
			assert.equal(this.items.length, 20, "[append] a number of items are 20");
			assert.equal(this.el.children.length, 20, "[append] a number of DOM are 20");

			// When
			this.prepend(data.concat());
		} else {
			// Then
			assert.equal(e.target.length, 20, "[prepend] a number of elements are 20");
			assert.equal(this.items.length, 20, "[prepend] a number of items are 20");
			assert.equal(this.el.children.length, 20, "[prepend] a number of DOM are 20");
			done();
		}
	});

	// When
	this.inst.append(data.concat());
});

QUnit.test("Check type #3 - jQuery type", function(assert) {
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
			assert.equal(e.target.length, 20, "[append] a number of elements are 20");
			assert.equal(this.items.length, 20, "[append] a number of items are 20");
			assert.equal(this.el.children.length, 20, "[append] a number of DOM are 20");

			// When
			this.prepend($(data));
		} else {
			// Then
			assert.equal(e.target.length, 20, "[prepend] a number of elements are 20");
			assert.equal(this.items.length, 20, "[prepend] a number of items are 20");
			assert.equal(this.el.children.length, 20, "[prepend] a number of DOM are 20");
			done();
		}
	});

	// When
	this.inst.append($(data));
});


QUnit.module("infiniteGrid event handler Test", {
	beforeEach : function() {
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
	afterEach : function() {
		if(this.inst) {
			this.inst.destroy();
			this.inst = null;
		}
	}
});

QUnit.test("Test append event", function(assert) {
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
		};
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
			assert.equal(e.scrollTop, 100, "check scrollTop parameter");
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


QUnit.test("Test prepend event", function(assert) {
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
		};
	};

	this.inst.on({
		"layoutComplete": function(e) {
			// Then
			assert.equal(self.inst.isRecycling(), true, "recycle mode");
			assert.equal(e.croppedCount, 200 - self.inst.options.count, "check croppedCount");

			// When
			rect.bottom -= self.inst.options.threshold;
			self.fakeDoc.body.scrollTop = 100;
			$(window).trigger("scroll");
		},
		"prepend": function(e) {
			// Then
			assert.equal(e.scrollTop, 100, "check scrollTop parameter");
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

QUnit.test("check a clear after scrolling", function(assert) {
	var done = assert.async();
	// Given
	// When
	var self = this;
	this.inst = new eg.InfiniteGrid("#grid");
	this.inst.on("layoutComplete",function(e) {
		// Then
		assert.equal(this.isProcessing(), false, "idel in layoutComplete");
		assert.equal(e.target.length, 6, "a number of elements are 6");
		assert.equal(this.items.length, 6, "a number of elements are 6");
		assert.equal(this.el.children.length, 6, "a number of DOM are 6");

		// When
		this.clear();

		assert.equal(this.items.length, 0, "a number of elements are 0");
		assert.equal(this.el.children.length, 0, "a number of DOM are 0");
		assert.equal(this._isRecycling, false, "_isRecycling is false");
		assert.equal(this._isProcessing, false, "_isProcessing is false");
		assert.equal(e.croppedCount, 0, "a number of removedContent are 0");
		self.fakeDoc.body.scrollTop = 100;
		$(window).trigger("scroll");
		setTimeout(function() {
			done();
		}, 100);
	});
});

QUnit.test("if width is not changed, layout should be not called on resize event.", function(assert) {
	// Given
	var done = assert.async();
	var resizeCount = 0;
	var layoutCount = 0;
	var $global = $(window);
	var inst = this.inst = new eg.InfiniteGrid("#grid");
	this.inst.on("layoutComplete", function(e) {
		this.off("layoutComplete");
		this.on("layoutComplete", function(e) {
			assert.ok(false, "layoutComplete event should not be called");
		});
	});
	$global.on("resize", function(e) {
		resizeCount++;
	});
	$global.scrollTop(10000);
	
	// When
	$global.trigger("resize");

	// Then
	setTimeout(function() {
		assert.ok(resizeCount > 0, "should exist resize event");
		assert.equal(inst.$el.innerWidth(), inst._containerWidth, "width is not changed");
		done();
	},100);
});


QUnit.module("infiniteGrid private method/property Test", {
	beforeEach : function() {
		this.fakeWnd = {
			navigator : {
				userAgent: "iPad"
			},
			innerHeight: 100,
			clientHeight: 100
		};
		eg.invoke("infiniteGrid", [ null, null, this.fakeWnd, null, null]);
	},
	afterEach : function() {
		if(this.inst) {
			this.inst.destroy();
			this.inst = null;
		}
	}
});


QUnit.test("check _refreshViewport method", function(assert) {
	// Given
	var inst = new eg.InfiniteGrid("#grid");
	// When
	assert.equal(inst._clientHeight, 100, "height is not changed");
	
	this.fakeWnd.innerHeight = this.fakeWnd.clientHeight = 200;
	inst._refreshViewport();

	// Then
	assert.equal(inst._clientHeight, 200, "height is changed");
});

QUnit.test("check _isIE method", function(assert) {
	// Given
	var fakeWin = {
		navigator: {
			userAgent: ""
		}
	};
	eg.invoke("infiniteGrid", [ null, null, fakeWin, null, null]);
	
	// when (android)
	fakeWin.navigator.userAgent = "Mozilla/5.0 (Linux; Android 6.0.1; SAMSUNG SM-G935L Build/MMB29K) AppleWebkit/537.36 (KHTML, like Gecko) SamsungBrowser/4.0 Chrome/44.0.2403.133 Mobile Safari/537.36";
	var inst = new eg.InfiniteGrid("#nochildren_grid");

	// Then
	assert.equal(inst._isIE, false);
	inst.destroy();

	// when (ios)
	fakeWin.navigator.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12B440";
	inst = new eg.InfiniteGrid("#nochildren_grid");

	// Then
	assert.equal(inst._isIE, false);
	inst.destroy();

	// when (IE)
	fakeWin.navigator.userAgent = "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)";
	inst = new eg.InfiniteGrid("#nochildren_grid");

	// Then
	assert.equal(inst._isIE, true);
	inst.destroy();	

	// when (chrome)
	fakeWin.navigator.userAgent = "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36";
	inst = new eg.InfiniteGrid("#nochildren_grid");

	// Then
	assert.equal(inst._isIE, false);
	inst.destroy();	

	// when (firefox)
	fakeWin.navigator.userAgent = "Mozilla/5.0 (Windows NT 6.1; rv:36.0) Gecko/20100101 Firefox/36.0";
	inst = new eg.InfiniteGrid("#nochildren_grid");

	// Then
	assert.equal(inst._isIE, false);
	inst.destroy();	

	// when (safari)
	fakeWin.navigator.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18";
	inst = new eg.InfiniteGrid("#nochildren_grid");

	// Then
	assert.equal(inst._isIE, false);
	inst.destroy();	
});

QUnit.test("check _prevScrollTop after resize event.", function(assert) {
	// Given
	var done = assert.async();
	var inst = this.inst = new eg.InfiniteGrid("#grid");
	assert.equal(inst._prevScrollTop, 0);
	
	// When
	inst._onResize();

	// Then
	setTimeout(function() {
		assert.equal(inst._prevScrollTop, -1);
		done();
	},200);
});

QUnit.module("infiniteGrid layout(false) Test", {
	beforeEach : function() {
		this.inst = new eg.InfiniteGrid("#nochildren_grid", {
			"count" : 30
		});
	},
	afterEach : function() {
		if(this.inst) {
			this.inst.destroy();
			this.inst = null;
		}
	}
});

QUnit.test("check a remove module", function(assert) {
	var done = assert.async();
	var beforePrependCols = null;
	var beforePosition = null;
	function getItem(items, position) {
		return $.grep(items, function(v) {
			return v.position.x === position.x && v.position.y === position.y;
		});
	}

	// Given
	// When
	this.inst.on("layoutComplete",function(e) {
		$.each(this._prependCols, function(i, v) {
			assert.ok(v === 0, "prependCols values are zero");
		});

		this.off();
		this.on("layoutComplete",function(e) {
			// Given
			beforePrependCols = this._prependCols.concat();
			$.each(this._prependCols, function(i, v) {
				assert.ok(v !== 0, "prependCols values aren't zero");
			});

			beforePosition = e.target[5].position;
			var beforeItemLen = this.items.length;
			var beforeElementLen = this.el.children.length;
			var ret = getItem(this.items, beforePosition);
			assert.equal(ret.length, 1, "only one");
			
			// When 
			this.remove(e.target[5].el);
			
			// Then 
			ret = getItem(this.items, beforePosition);
			assert.equal(ret.length, 0, "nothing");
			assert.equal(this.items.length, beforeItemLen-1, "remove items");
			assert.equal(this.el.children.length, beforeElementLen-1, "remove DOM");

			this.off();
			this.on("layoutComplete",function(e) {
				beforePrependCols = this._prependCols.concat();
				$.each(this._prependCols, function(i, v) {
					assert.equal(v, beforePrependCols[i], "equal before PrependCols");
				});
				// Then
				var ret = getItem(this.items, beforePosition);
				assert.equal(ret.length, 1, "relayout items");
				done();
			});
			// Then
			this.layout(false);
		});
		this.append(getContent("append", 25));	
	});

	// Then
	this.inst.append(getContent("append", 25));
});