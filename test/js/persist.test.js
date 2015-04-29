function noop() {};
module("persist", {
	setup: function() {
		this.fakeWindow = {
			document: {
				title: ""
			},
			location: {
				href: ""
			},
			history: new History()
		};
		this.fakeEvent = {};
		this.data = {
			"scrollTop": 100
		};
		
		this.method = __persist(jQuery, this.fakeWindow);
		/*
		 *	 Mock History Object
		*/
		function History() {
			this.state = null;
		}
		History.prototype.replaceState = function(state) {
			this.state = state;
		};
	},
	teardown: function() {
		this.fakeWindow.history.replaceState(null, "", "");
	}
});

test("_isPersisted : When persisted property of pageshow event supported", function() {
	// Given
	this.fakeEvent = {
		"persisted": true
	};
	var method = __persist(jQuery, this.fakeWindow);
	
	// Then
	equal(method._isPersisted(this.fakeEvent), true);
	
	// Given
	this.fakeEvent = {
		"persisted": false
	};
	
	// Then
	equal(method._isPersisted(this.fakeEvent), false);
});

test("_isPersisted : When persisted property of pageshow event not supported", function() {
	// Given
	this.fakeEvent = {};
	var method = __persist(jQuery, this.fakeWindow);
	
	// Then
	equal(method._isPersisted(this.fakeEvent), false);
});

test("_isBackForwardNavigated", function() {
	// Given
	this.fakeWindow.performance = {};
	this.fakeWindow.performance.navigation = {
		TYPE_BACK_FORWARD: 2,
		TYPE_NAVIGATE: 0,
		TYPE_RELOAD: 1,
		TYPE_RESERVED: 255
	};
	this.fakeWindow.performance.navigation.type = 0;
	var method = __persist(jQuery, this.fakeWindow);
	
	// Then
	equal(method._isBackForwardNavigated(), false);
	
	// Given
	this.fakeWindow.performance.navigation.type = 1;
	var method = __persist(jQuery, this.fakeWindow);
	
	// Then
	equal(method._isBackForwardNavigated(), false);
	
	// Given
	this.fakeWindow.performance.navigation.type = 2;
	var method = __persist(jQuery, this.fakeWindow);
	
	// Then
	equal(method._isBackForwardNavigated(), true);
});

test("_reset", function() {
	// When
	this.method._reset();
	
	// Then
	equal(this.fakeWindow.history.state, null);
});

test("_clone : new Object but same key and values", function() {
	// When
	var clonedData = this.method._clone(this.data);
	
	// Then
	notEqual(clonedData, this.data);
	deepEqual(clonedData, this.data);
});

test("persist : save state data, get state data", function() {
	// Given
	// Then
	equal(this.method.persist(), null);
	
	// When
	var clonedData = this.method.persist(this.data);
	
	// Then
	notEqual(clonedData, this.data);
	deepEqual(clonedData, this.data);
});

test("_onPageshow : when bfCache hits, _reset method must be executed.", function() {
	// When
	$(this.fakeWindow).trigger({
		type: "pageshow",
		originalEvent: {
			persisted: true
		}
	});
	
	// Then
	equal(this.method.persist(), null);
});

test("_onPageshow : when bfCache miss and not BF navigated, _reset method must be executed.", function() {
	// Given  
	this.fakeWindow.performance = {};
	this.fakeWindow.performance.navigation = {
		TYPE_BACK_FORWARD: 2,
		TYPE_NAVIGATE: 0,
		TYPE_RELOAD: 1,
		TYPE_RESERVED: 255
	};
	this.fakeWindow.performance.navigation.type = 0;
	var method = __persist(jQuery, this.fakeWindow);
	
	// When
	$(this.fakeWindow).trigger({
		type: "pageshow",
		originalEvent: {
			persisted: false
		}
	});
	// Then
	equal(method.persist(), null);
	
	// Given 
	this.fakeWindow.performance.navigation.type = 1;
	var method = __persist(jQuery, this.fakeWindow);

	// When
	$(this.fakeWindow).trigger({
		type: "pageshow",
		originalEvent: {
			persisted: false
		}
	});
	// Then
	equal(method.persist(), null);
});

test("_onPageshow : when bfCache miss and BF navigated, persist event must be triggered.", function(assert) {
	// Given  
	var done = assert.async();
	this.fakeWindow.performance = {};
	this.fakeWindow.performance.navigation = {
		TYPE_BACK_FORWARD: 2,
		TYPE_NAVIGATE: 0,
		TYPE_RELOAD: 1,
		TYPE_RESERVED: 255
	};
	this.fakeWindow.performance.navigation.type = 2;
	var method = __persist(jQuery, this.fakeWindow);
	
	// When
	var restoredState = null;
	$(this.fakeWindow).on("persist", function(e, state) {
		restoredState = state;
	});
	var clonedData = method.persist(this.data);
	$(this.fakeWindow).trigger({
		type: "pageshow",
		originalEvent: {
			persisted: false
		}
	});
	
	// Then	
	setTimeout(function() {
		deepEqual(restoredState, clonedData);
		done();
	});

});