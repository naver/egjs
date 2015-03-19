module("movableCoord init Test", {
	setup : function() {
		this.inst = null;
	},
	teardown : function() {
		this.inst.destruct();
		this.inst = null;
	}
});

test("check initialization status", function() {
	// Given
	// When
	this.inst = new eg.MovableCoord( {
		min : [ -100, 0 ],
		max : [ 300, 400 ],
		bounce : [ 100, 200, 50, 30 ],
		margin : [ 0, 100 ],
		circular : [ true, false ]
	});
	// Then
	deepEqual(this.inst._pos, [-100, 0], "set up an initialization position");
	deepEqual(this.inst.options.bounce, [100, 200, 50, 30], "bounce : check css expression");
	deepEqual(this.inst.options.margin, [0, 100, 0, 100], "margin : check css expression");
	deepEqual(this.inst.options.circular, [true, false, true, false], "circular : check css expression");
});

module("movableCoord bind/unbind Test", {
	setup : function() {
		this.inst = new eg.MovableCoord( {
			min : [ 0, 0 ],
			max : [ 300, 400 ],
			bounce : 100,
			margin : 0,
			circular : false
		});
	},
	teardown : function() {
		this.inst.destruct();
		this.inst = null;
	}
});

test("bind", function() {
	// Given
	var $el = jQuery("#area");
	var before = $el.data(eg.MovableCoord.KEY);
	var beforeHammerCount = Object.keys(this.inst._hammers).length;

	// When
	this.inst.bind($el, {
		direction : eg.DIRECTION_ALL
	});

	// Then
	var key = $el.data(eg.MovableCoord.KEY);
	equal(before, undefined, "key data value is 'undefined'' before call bind method" );
	notEqual(key, undefined, "key data value is something after call bind method" );
	equal(beforeHammerCount+1, Object.keys(this.inst._hammers).length, "added hammer instance after call bind method" );
});

test("unbind", function() {
	// Given
	var $el = jQuery("#area");
	this.inst.bind($el, {
		direction : eg.DIRECTION_ALL
	});
	var before = $el.data(eg.MovableCoord.KEY);
	var beforeHammerCount = Object.keys(this.inst._hammers).length;

	// When
	this.inst.unbind($el);

	// Then
	var key = $el.data(eg.MovableCoord.KEY);
	notEqual(before, key, "key data value was changed after call 'unbind' method" );
	equal(key, undefined, "key data value is 'undefined'' after call bind method" );
	equal(beforeHammerCount-1, Object.keys(this.inst._hammers).length, "removed hammer instance after call bind method" );
});

test("one element, double bind", function() {
	// Given
	var $el = jQuery("#area");
	this.inst.bind($el, {
		direction : eg.DIRECTION_ALL
	});
	var beforeHammerCount = Object.keys(this.inst._hammers).length;
	var before = $el.data(eg.MovableCoord.KEY);
	var beforeHammerInstance = this.inst._hammers[before];

	// When
	this.inst.bind($el, {
		direction : eg.DIRECTION_HORIZONTAL
	});

	// Then
	var key = $el.data(eg.MovableCoord.KEY);
	equal(before, key, "key data value is same" );
	equal(this.inst._hammers[key].get("pan").options.direction, eg.DIRECTION_HORIZONTAL, "options was changed" );
	deepEqual(beforeHammerInstance, this.inst._hammers[key], "recycle hammer instance" );
	equal(beforeHammerCount, Object.keys(this.inst._hammers).length, "hammer instance count is same" );
})