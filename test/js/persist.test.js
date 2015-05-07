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

test("isPersisted : When persisted property of pageshow event supported", function() {
	// Given
	this.fakeEvent = {
		"persisted": true
	};
	var method = __persist(jQuery, this.fakeWindow);
	
	// When
	var isPersisted = method.isPersisted(this.fakeEvent);
	
	// Then
	equal(isPersisted, true);
	
	// Given
	this.fakeEvent = {
		"persisted": false
	};

	// When
	isPersisted = method.isPersisted(this.fakeEvent);
		
	// Then
	equal(isPersisted, false);
});

test("isPersisted : When persisted property of pageshow event not supported", function() {
	// Given
	this.fakeEvent = {};
	var method = __persist(jQuery, this.fakeWindow);
	
	// When
	var isPersisted = method.isPersisted(this.fakeEvent);
	
	// Then
	equal(isPersisted, false);
});

test("isBackForwardNavigated", function() {
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
	var isBackForwardNavigated = method.isBackForwardNavigated();

	// Then
	equal(isBackForwardNavigated, false);
	
	// Given
	this.fakeWindow.performance.navigation.type = 1;
	var method = __persist(jQuery, this.fakeWindow);

	// When
	isBackForwardNavigated = method.isBackForwardNavigated();
		
	// Then
	equal(isBackForwardNavigated, false);
	
	// Given
	this.fakeWindow.performance.navigation.type = 2;
	var method = __persist(jQuery, this.fakeWindow);
	
	// When
	isBackForwardNavigated = method.isBackForwardNavigated();
	
	// Then
	equal(isBackForwardNavigated, true);
});

test("reset", function() {
	// When
	this.method.reset();
	
	// Then
	equal(this.fakeWindow.history.state, null);
});

test("persist : save state data, get state data", function() {
	// When
	var state = this.method.persist();
	
	// Then
	equal(state, null);
	
	// When
	var clonedState = this.method.persist(this.data);
	
	// Then
	notEqual(clonedState, this.data);
});

test("onPageshow : when bfCache hits, _reset method must be executed.", function() {
	// When : pageshow 이벤트가 호출되면 연동된 persist 이벤트가 호출되고 핸들러인 _onPageshow 가 실행된다.
	$(this.fakeWindow).trigger({
		type: "pageshow",
		originalEvent: {
			persisted: true
		}
	});
	
	// Then
	equal(this.method.persist(), null);
});

test("onPageshow : when bfCache miss and not BF navigated, _reset method must be executed.", function() {
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

test("clone: new Object but same key and values", function() {
	// When
	var clonedData = this.method.clone(this.data);
	
	// Then
	notEqual(clonedData, this.data);
	deepEqual(clonedData, this.data);
});

test("clone: null in, null out", function() {
	// When
	var clonedData = this.method.clone(null);
	
	// Then
	equal(clonedData, null);
});

test("onPageshow : when bfCache miss and BF navigated, persist event must be triggered.", function(assert) {
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

	var restoredState = null;
	$(this.fakeWindow).on("persist", function(e, state) {
		restoredState = state;
	});
	var clonedData = method.persist(this.data);
		
	// When
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