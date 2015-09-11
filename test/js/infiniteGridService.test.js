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

module("initialization", {
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
	equal(this.inst instanceof eg.InfiniteGridService, true, "Instance of eg.InfiniteGridService");
});

test("initialization with static contents", function() {
	// Given
	var offset = 1;
	var limit = 30;
	var $grid = $("#grid");
	$grid.append(getContents(offset, limit));

	//When
	this.inst = new eg.InfiniteGridService("#grid");

	//Then
	equal($grid.children().length, limit - offset + 1, "Grid contents length : " + (limit - offset + 1));
});

module("append", {
	setup: function() {
		this.inst = null;
	},
	teardown: function() {
		this.inst.destroy();
		this.inst = null;
	}
});

test("append contents with plain HTML string", function() {
	// Given
	var offset = 1;
	var limit = 30;
	var $grid = $("#grid");
	var html = getContents(offset, limit);

	//When
	this.inst = new eg.InfiniteGridService("#grid");
	var returnVal = this.inst.append(html);

	//Then
	equal(typeof html, "string", "Append parameter is plain HTML string");
	equal($grid.children().length, limit - offset + 1, "Grid contents length : " + (limit - offset + 1));
	equal(returnVal, $grid.children().length, "return value is appended item count");
});

test("append contents with jQuery object", function() {
	// Given
	var offset = 1;
	var limit = 30;
	var $grid = $("#grid");
	var html = getContents(offset, limit);
	var $html = $(html);

	//When
	this.inst = new eg.InfiniteGridService("#grid");
	var returnVal = this.inst.append($html);

	//Then
	equal($html instanceof jQuery, true, "Append parameter is jQuery object");
	equal($grid.children().length, limit - offset + 1, "Grid contents length : " + (limit - offset + 1));
	equal(returnVal, $grid.children().length, "return value is appended item count");
});

asyncTest("append contents with URL for XHR", function() {
	//Given
	var offset = 1;
	var limit = 30;
	var $grid = $("#grid");
	var url = "http://localhost:9099/infiniteGrid/items?offset=" + offset + "&limit=" + limit;

	//When
	this.inst = new eg.InfiniteGridService("#grid");
	var returnVal = this.inst.appendAjax(url).done( function() {
		equal($grid.children().length, limit - offset + 1, "Grid contents length : " + (limit - offset + 1));
	});

	//Then
	equal(typeof url, "string", "URL for XHR is plain string");
	equal(typeof returnVal.readyState, "number", "Return value has readyState. It is jQuery.jqXHR");
});

asyncTest("append contents with configure the Ajax request", function() {
	//Given
	var offset = 1;
	var limit = 30;
	var $grid = $("#grid");
	var settings = {
  		method: "GET",
  		url: "http://localhost:9099/infiniteGrid/items?offset=" + offset + "&limit=" + limit,
  		data: {offset: offset, limit: limit}
	}

	//When
	this.inst = new eg.InfiniteGridService("#grid");
	var returnVal = this.inst.appendAjax(setting).done(function() {
		equal($grid.children().length, limit - offset + 1, "Grid contents length : " + (limit - offset + 1));
	});

	//Then
	equal(typeof settings, "object", "Settings for XHR is object");
	equal(typeof returnVal.readyState, "number", "Return value has readyState. It is jQuery.jqXHR");
});