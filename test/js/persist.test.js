function noop() {};
module("persist", {
	setup: function() {
		this.fakeWindow = {};
		this.fakeEvent = {};
	}
});
test("_isPersisted : pageshow event persisted property supported", function() {
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
test("_isPersisted : pageshow event persisted property not supported", function() {
	// Given
	this.fakeEvent = {};
	var method = __persist(jQuery, this.fakeWindow);
	// Then
	equal(method._isPersisted(this.fakeEvent), false);
});
test("_isBackForwardNavigated : supported ", function() {
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
test("_reset : supported", function() {
	// Given  
	this.fakeWindow = {
		document : {
			title : ""
		},
		location : {
			href : ""
		},
		history : {
			state : {}
		}
	};
	
	var method = __persist(jQuery, this.fakeWindow);
	// When
	method._reset();
	// Then
	equal(this.fakeWindow.history.state, null);
});
test("_clone : new Object but same key and values", function() {
	// Given  
	var data = {
		"name": "evergreen"
	};
	var method = __persist(jQuery, this.fakeWindow);
	// When
	var clonedData = method._clone(data);
	// Then
	notEqual(clonedData, data);
	deepEqual(clonedData, data);
});
test("persist : save state data, get state data", function() {
	// Given  
	var method = __persist(jQuery, this.fakeWindow);
	equal(method.persist(), null);
	// When
	var clonedData = method.persist(data);
	// Then
	notEqual(clonedData, data);
	deepEqual(clonedData, data);
});
test("_onPageshow : when bfCache hits, _reset method must be executed.", function() {
	// Given  
	var data = {
		"scrollTop": 100
	};
	var method = __persist(jQuery, this.fakeWindow);
	var clonedData = method.persist(data);
	deepEqual(clonedData, data);
	// When
	$(this.fakeWindow).trigger({
		type: "pageshow",
		originalEvent: {
			persisted: true
		}
	});
	// Then
	equal(method.persist(data), null);
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
	var data = {
		"scrollTop": 100
	};
	var clonedData = method.persist(data);
	deepEqual(clonedData, data);
	// When
	$(this.fakeWindow).trigger({
		type: "pageshow",
		originalEvent: {
			persisted: false
		}
	});
	// Then
	equal(method.persist(data), null);
	// Given 
	this.fakeWindow.performance.navigation.type = 1;
	var method = __persist(jQuery, this.fakeWindow);
	var clonedData = method.persist(data);
	propEqual(clonedData, data);
	// When
	$(this.fakeWindow).trigger({
		type: "pageshow",
		originalEvent: {
			persisted: false
		}
	});
	// Then
	equal(method.persist(data), null);
});
test("_onPageshow : when bfCache miss and BF navigated, persist event must be triggered.", function() {
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
	var data = {
		"scrollTop": 100
	};
	var clonedData = method.persist(data);
	deepEqual(clonedData, data);
	var restoredState = null;
	$(this.fakeWindow).on("persist", function(e, state) {
		restoredState = state;
	}.bind(this));
	// When
	$(this.fakeWindow).trigger({
		type: "pageshow",
		originalEvent: {
			persisted: false
		}
	});
	// Then
	setTimeout(function() {
		deepEqual(restoredState, data);
		done();
	});
});