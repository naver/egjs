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

		this.inst = new eg.Visible( {
			wrapper : document,
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

asyncTest("check a visible/invisible status", function() {
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
		start();
	});
	this.inst.check();
});

test("When a scroll position of the window was changed", function() {
	// Given
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
	window.scrollTo(0,300);
	this.inst.check();

	// Then
	equal(visible.length, 6, "visible element length (6)");
	equal(invisible.length, 5, "invisible element length (5)");
});

asyncTest("check a visible/invisible status in the expanded window ", function() {
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
		equal(e.visible.length, length, "check a count of the visible elements");
		start();
	});
	this.inst.check();
});

test("When a scroll position of the expanded window was changed", function() {
	// Given
	var i, el,
		invisible = [],
		visible = [];

	// When
	this.inst.check();
	this.inst.options.expandSize = boxheight * 2;
	this.inst.on("change", function(e) {
		// visible 22~29
		visible = e.visible;
		// invisible 1~3
		invisible = e.invisible;
	});
	window.scrollTo(0,300);
	this.inst.check();

	// Then
	equal(visible.length, 8, "visible element length (8)");
	equal(invisible.length, 3, "invisible element length (3)");
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

		this.inst = new eg.Visible( {
			wrapper : document,
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


module("Visible wrapper Test", {
	setup : function() {
		$("#view").show();
		this.inst = new eg.Visible( {
			wrapper : "#view",
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


test("When a iscroll position was changed", function() {
	// Given
	var visibleLength = 0,
		invisibleLength = 0;
	// When
	this.inst.check();
	this.inst.on("change", function(e) {
		visibleLength = e.visible.length;
		invisibleLength = e.invisible.length;
	});
	this.scroll.scrollTo(0, -300,0);
	this.inst.check();
	// Then
	equal(visibleLength, 5, "visible element length (5)");
	equal(invisibleLength, 7, "invisible element length (7)");
});