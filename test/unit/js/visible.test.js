/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

module("Visible document Test", {
	setup : function() {
		// make list
		var html =[];
		for(var i=0; i<100; i++) {
			html.push("<li class='list check_document_visible'>#");
			html.push(i+1);
			html.push("</li>");
		}
		$("#content").html(html.join(""));

		boxheight = $("#content li").first().height();

		this.inst = new eg.Visible( document, {
			targetClass : "check_document_visible"
		});
	},
	teardown : function() {
		window.scrollTo(0,0);
		$("#content").empty();
		this.inst.destroy();
		this.inst = null;
	}
});

test("check a visible/invisible status", function(assert) {
	var done = assert.async();
	// Given
	var length = Math.ceil(document.documentElement.clientHeight/boxheight);
	if(document.documentElement.clientHeight%boxheight === 0) {
		length++;
	}
	// When
	this.inst.options.expandSize = 0;
	this.inst.on("change", function(e) {
		// Then
		equal(e.invisible.length, 0 , "no invisible");
		equal(e.visible.length, length , "check a count of the visible elements");
		done();
	});
	this.inst.check();
});

test("When a scroll position of the window was changed", function(assert) {
	// Given
	var done = assert.async();
	var i, el,
		invisible = [],
		visible = [];

	// When
	this.inst.check(-1);
	this.inst.options.expandSize = 0;
	this.inst.on("change", function(e) {
		// visible 22~27
		visible = e.visible;
		// invisible 1~5
		invisible = e.invisible;
	});
	window.scrollTo(0,250);

	var self = this;
	setTimeout(function() {
		// Then
		self.inst.check(-1);
		ok(visible.length > 0, "visible element length");
		ok(invisible.length > 0, "invisible element length");
		done();
	},500);
});

test("check a visible/invisible status in the expanded window ", function(assert) {
	var done = assert.async();
	// Given
	var length = Math.ceil( (document.documentElement.clientHeight+ (2*boxheight))/boxheight );
	if(document.documentElement.clientHeight%boxheight === 0) {
		length++;
	}
	// When
	this.inst.options.expandSize = boxheight * 2;
	this.inst.on("change", function(e) {
		// Then
		equal(e.invisible.length, 0 , "no invisible");
		ok(e.visible.length >= length, "check a count of the visible elements");
		done();
	});
	this.inst.check();
});

module("Visible refresh Test", {
	setup : function() {
		// make list
		var html =[];
		for(var i=0; i<100; i++) {
			html.push("<li class='list check_visible'>#");
			html.push(i+1);
			html.push("</li>");
		}
		$("#content").html(html.join(""));

		boxheight = $("#content li").first().height();

		this.inst = new eg.Visible( document, {
			targetClass : "check_visible"
		});
	},
	teardown : function() {
		window.scrollTo(0,0);
		$("#content").empty();
		this.inst.destroy();
		this.inst = null;
	}
});

test("check added elements", function() {
	// Given
	var targetLength = this.inst._targets.length;
	// When
	$("#content").append("<li class='list check_visible'>APPEND</li>")
		.append("<li class='list check_visible'>APPEND</li>")
		.append("<li class='list check_visible'>APPEND</li>");
	// Then
	if(this.inst._supportElementsByClassName) {
		equal(this.inst._targets.length, targetLength+3, "check added elements (auto)");
	} else {
		this.inst.refresh();
		equal(this.inst._targets.length, targetLength+3, "check added elements");
	}
});

// Run test only when IScroll works
if(document.querySelector && window.addEventListener) {
	module("Visible wrapper Test", {
		setup : function() {
			$("#view").show();
			this.inst = new eg.Visible( "#view", {
				targetClass : "check_visible"
			});
			this.scroll = new IScroll("#view");
		},
		teardown : function() {
			$("#view").hide();
			this.scroll.destroy();
			this.scroll = null;
			this.inst.destroy();
			this.inst = null;
		}
	});

	test("When a iscroll position was changed", function(assert) {
		var done = assert.async();
		// Given
		var self = this.inst;
		// When
		this.inst.check(-1);
		this.inst.on("change", function(e) {
			// Then
			equal(e.visible.length, 5, "visible element length (5)");
			equal(e.invisible.length, 7, "invisible element length (7)");
			done();
		});
		this.scroll.scrollTo(0, -400,0);
		self.check(500);
	});
}


module("Visible Test when unsupported getElementsByClassName", {
	setup : function() {
		// make list
		var html =[];
		for(var i=0; i<100; i++) {
			html.push("<li class='list check_document_visible'>#");
			html.push(i+1);
			html.push("</li>");
		}
		$("#unsupportClassName").html(html.join(""));

		this.boxheight = $("#unsupportClassName li").first().height();

		// copy original method
		this.originalReviseElements = eg.Visible.prototype._reviseElements;
		this.originalRefresh = eg.Visible.prototype.refresh;

		this.inst = new eg.Visible( document, {
			targetClass : "check_document_visible"
		});

		// replace method for test
		this.inst._supportElementsByClassName = false;
		this.inst._reviseElements = this.originalReviseElements;
		this.inst.refresh = this.originalRefresh;
		this.inst.refresh();
	},
	teardown : function() {
		window.scrollTo(0,0);
		$("#unsupportClassName").empty();
		this.inst.destroy();
		this.inst = null;
	}
});

module("Visible event Test", {
	setup : function() {
		$("#view").show();
	},
	teardown : function() {
		$("#view").hide();
		this.inst.destroy();
		this.inst = null;
	}
});
test("Check prefixEvent", function (assert) {
	var done = assert.async();
	// Given
	var isTriggered = false;
	// When
	this.inst = new eg.Visible( "#view", {
		targetClass : "check_visible"
	}, "TEST:");
	this.inst.on("TEST:change", function() {
		isTriggered = true;
	});
	window.scrollTo(0,300);
	this.inst.check();

	// Then
	setTimeout(function() {
		equal(isTriggered, true, "check if prefixEvent trigger");
		done();
	},200);
});

module ("containment elements check test", {
	setup: function() {
		var i,
			$wrapper,
			html;

		html = [];
		for(i = 0; i < 10; i++) {
			html.push("<li class='list check_document_visible'>#" + (i + 1) + "</li>");
		}

		$wrapper = $("<div class='wrapper' style='overflow:scroll;height:100px'></div>");
		$wrapper.append(html);
		$("#content").append($wrapper);

		this.inst = new eg.Visible($wrapper, {
			targetClass : "check_document_visible"
		});
		this.$wrapper = $wrapper;
	},
	teardown: function() {
		window.scrollTo(0,0);
		$("#content").empty();
		this.inst.destroy();
		this.inst = null;
	}
});

test("default", function(assert) {
	var done = assert.async();

	this.inst.on("change", function(e) {
		ok(e.visible.length === 2, "visible element length");
		ok(e.visible[0].innerText === "#1", "visible element length");
		ok(e.visible[1].innerText === "#2", "visible element length");
		done();
	});

	this.inst.check(true);
});

test("scroll position change", function(assert) {
	var done = assert.async();
	this.inst.check(true);

	this.inst.on("change", function(e) {
		ok(e.visible.length === 1, "visible element length is 1");
		ok(e.invisible.length === 2, "invisible element length is 2");
		ok(e.invisible[0].innerText === "#1", "first invisible element is #1");
		ok(e.invisible[1].innerText === "#2", "second invisible element is #2");
		ok(e.visible[0].innerText === "#4", "first visible element is #4");
		done();
	});

	//when
	this.$wrapper.scrollTop(110);
	this.inst.check(true);
});
