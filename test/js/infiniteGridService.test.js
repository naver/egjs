function getContents(offset, limit) {
	var html = "";
	offset = offset || 1;
	limit = limit || 10;

	var end = offset + limit;

	var _random = function() {
		return Math.floor((Math.random() * 7) + 1);
	};

	for (; offset < end; offset++) {
		html = html +
			"<li class='item' data-offset='" +
			offset +
			"'><div class='r" +
			_random() +
			"'><a href='http://best.mqoo.com'>테스트 " +
			offset +
			"</a></div></li>";
	}

	return html;
}

module("initialization test", {
	setup: function() {
		this.inst = null;
	},
	teardown: function() {
		this.inst.destroy();
		this.inst = null;
	}
});

test("initialization", function() {
	//When
	this.inst = new eg.InfiniteGridService("#grid");

	//Then
	equal(this.inst instanceof eg.InfiniteGridService, true, "instance to be eg.InfiniteGridService");
});

module("append/prepend test", {
	setup: function() {
		this.inst = null;
		this.inst = new eg.InfiniteGridService("#grid");
	},
	teardown: function() {
		this.inst.destroy();
		this.inst = null;
	}
});

test("with plain HTML contents", function() {
	// Given
	var $grid = $("#grid");
	var html1 = getContents(1, 240);
	var html2 = getContents(241, 30);
	var html3 = getContents(1, 30);

	//When
	var ret1 = this.inst.append(html1);
	var ret2 = this.inst.append(html2);
	var ret3 = this.inst.prepend(html3);

	//Then
	equal(ret1, 240, "appended contents length to be 240");
	equal(ret2, 30, "appended contents length to be 30");
	equal(ret3, 30, "prepended contents length to be 30");
	equal($grid.children().length, 240, "contents length in #grid to be 240");
});

test("with jQuery object contents", function() {
	// Given
	var $grid = $("#grid");
	var $html1 = $(getContents(1, 240));
	var $html2 = $(getContents(241, 30));
	var $html3 = $(getContents(1, 30));

	//When
	var ret1 = this.inst.append($html1);
	var ret2 = this.inst.append($html2);
	var ret3 = this.inst.prepend($html3);

	//Then
	equal(ret1, 240, "appended contents length to be 240");
	equal(ret2, 30, "appended contents length to be 30");
	equal(ret3, 30, "prepended contents length to be 30");
	equal($grid.children().length, 240, "contents length in #grid to be 240");
});

test("append with XHR", function(assert) {
	var done = assert.async();

	// Given
	var $grid = $("#grid");
	var url = "http://128.199.120.3:8081/infiniteGrid/items?offset=1&limit=30";

	//When
	this.inst.append(getContents(1, 240));
	var req = this.inst.prependAjax(url);

	//Then
	req.done(function() {
		equal($grid.children().length, 240, "contents length in #grid to be 240");
		done();
	});
});

test("prepend with XHR", function(assert) {
	var done = assert.async();

	// Given
	var $grid = $("#grid");
	var url = "http://128.199.120.3:8081/infiniteGrid/items?offset=1&limit=30";

	//When
	this.inst.append(getContents(1, 240));
	this.inst.append(getContents(241, 30));
	var req = this.inst.appendAjax(url);

	//Then
	req.done(function() {
		equal($grid.children().length, 240, "contents length in #grid to be 240");
		done();
	});
});

test("append with XHR callback(returns plain HTML)", function(assert) {
	var done = assert.async();

	// Given
	var $grid = $("#grid");
	var url = "http://128.199.120.3:8081/infiniteGrid/items?offset=1&limit=30";

	//When
	this.inst.append(getContents(1, 240), function(data) {
		return data;
	});
	var req = this.inst.prependAjax(url);

	//Then
	req.done(function() {
		equal($grid.children().length, 240, "contents length in #grid to be 240");
		done();
	});
});

test("prepend with XHR callback(returns plain HTML)", function(assert) {
	var done = assert.async();

	// Given
	var $grid = $("#grid");
	var url = "http://128.199.120.3:8081/infiniteGrid/items?offset=1&limit=30";

	//When
	this.inst.append(getContents(1, 240));
	this.inst.append(getContents(241, 30));
	var req = this.inst.appendAjax(url, function(data) {
		return data;
	});

	//Then
	req.done(function() {
		equal($grid.children().length, 240, "contents length in #grid to be 240");
		done();
	});
});

test("append with XHR callback(returns jQuery object)", function(assert) {
	var done = assert.async();

	// Given
	var $grid = $("#grid");
	var url = "http://128.199.120.3:8081/infiniteGrid/items?offset=1&limit=30";

	//When
	this.inst.append(getContents(1, 240), function(data) {
		return $(data);
	});
	var req = this.inst.prependAjax(url);

	//Then
	req.done(function() {
		equal($grid.children().length, 240, "contents length in #grid to be 240");
		done();
	});
});

test("prepend with XHR callback(returns plain HTML)", function(assert) {
	var done = assert.async();

	// Given
	var $grid = $("#grid");
	var url = "http://128.199.120.3:8081/infiniteGrid/items?offset=1&limit=30";

	//When
	this.inst.append(getContents(1, 240));
	this.inst.append(getContents(241, 30));
	var req = this.inst.appendAjax(url, function(data) {
		return $(data);
	});

	//Then
	req.done(function() {
		equal($grid.children().length, 240, "contents length in #grid to be 240");
		done();
	});
});

test("clear", function() {
	// Given
	var $grid = $("#grid");

	//When
	this.inst.append(getContents(1, 240));
	this.inst.append(getContents(241, 30));
	this.inst.prepend(getContents(1, 30));

	this.inst.clear();

	//Then
	equal($grid.children().length, 0, "contents length in #grid to be 0");
});

module("persist test", {
	setup: function() {
		this.inst = null;
		this.inst = new eg.InfiniteGridService("#grid");
	},
	teardown: function() {
		this.inst.destroy();
		this.inst = null;
	}
});

test("store/restore", function() {
	//When
	this.inst.append(getContents(1, 240));
	this.inst.append(getContents(241, 30));
	this.inst.prepend(getContents(1, 30));

	this.inst.store();
	var ret = this.inst.restore();

	//Then
	equal(ret, true, "restore to be returns 'true'");
});

module("event test", {
	setup: function() {
		this.inst = null;
		this.inst = new eg.InfiniteGridService("#grid");
	},
	teardown: function() {
		this.inst.destroy();
		this.inst = null;
	}
});

test("'layoutComplete' event", function(assert) {
	var done = assert.async();

	// Given
	var eventFiredCount = 0;

	//When
	this.inst.on("layoutComplete", function() {
		then();
	});

	this.inst.append(getContents(1, 240));
	this.inst.append(getContents(241, 30));
	this.inst.prepend(getContents(1, 30));

	//Then
	function then() {
		eventFiredCount++;
		if(eventFiredCount === 3) {
			ok(true, "layoutComplete fired");
			done();
		}
	}
});

test("'beforeStore' event", function(assert) {
	var done = assert.async();

	//When
	this.inst.append(getContents(1, 240));
	this.inst.append(getContents(241, 30));
	this.inst.prepend(getContents(1, 30));

	this.inst.on("beforeStore", function(data) {
		then(data);
	});

	this.inst.store();

	//Then
	function then(data) {
		ok(data.infiniteGridStatus, "infiniteGridStatus to be exist");
		equal(data.eventType, "beforeStore", "event type to be 'beforeStore'");
		done();
	}
});

test("'restore' event", function(assert) {
	var done = assert.async();

	//When
	this.inst.append(getContents(1, 240));
	this.inst.append(getContents(241, 30));
	this.inst.prepend(getContents(1, 30));

	this.inst.on("restore", function(data) {
		then(data);
	});

	this.inst.store();
	this.inst.restore();

	//Then
	function then(data) {
		ok(data.infiniteGridStatus, "infiniteGridStatus to be exist");
		equal(data.eventType, "restore", "event type to be 'restore'");
		done();
	}
});