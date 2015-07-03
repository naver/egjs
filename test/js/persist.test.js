function noop() {};
module("persist", {
	setup: function() {
		this.fakeDocument = {
			title: ""
		};
		this.fakeWindow = {
			location: {
				href: ""
			},
			history: new History(),
			JSON: JSON
		};
		this.fakeEvent = {};
		this.data = {
			"scrollTop": 100
		};
		
		this.method = eg.invoke("persist",[null, this.fakeWindow, this.fakeDocument]);
		
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

test("onPageshow : when bfCache miss and not BF navigated, _reset method must be executed.", function() {
	// Given  
	this.fakeWindow.performance = {};
	this.fakeWindow.performance.navigation = {
		TYPE_BACK_FORWARD: 2,
		TYPE_NAVIGATE: 0,
		TYPE_RELOAD: 1,
		TYPE_RESERVED: 255
	};
	
	// When
	this.fakeWindow.performance.navigation.type = 2;
	this.fakeWindow.history.state = this.data;
	var method = eg.invoke("persist",[null, this.fakeWindow, this.fakeDocument]);
	
	// Then
	deepEqual(method.persist(), this.data);

	// When
	$(this.fakeWindow).trigger({
		type: "pageshow",
		originalEvent: {
			persisted: false
		}
	});
	
	// Then
	deepEqual(method.persist(), this.data);


	// When
	this.fakeWindow.performance.navigation.type = 0;
	this.fakeWindow.history.state = this.data;
	var method = eg.invoke("persist",[null, this.fakeWindow, this.fakeDocument]);

	// Then
	equal(method.persist(), null);

	// When
	$(this.fakeWindow).trigger({
		type: "pageshow",
		originalEvent: {
			persisted: false
		}
	});
	
	// Then
	equal(method.persist(), null);
	

	// When
	this.fakeWindow.performance.navigation.type = 1;
	this.fakeWindow.history.state = this.data;
	var method = eg.invoke("persist",[null, this.fakeWindow, this.fakeDocument]);
	
	// Then
	equal(method.persist(), null);

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

test("getState, setState: getter, setter of state", function() {
	// When
	this.method.setState(this.data);
	var clonedData = this.method.getState();
	
	// Then
	deepEqual(clonedData, this.data);
});

test("onPageshow : when bfCache miss and BF navigated, persist event must be triggered.", function(assert) {
	// Given  
	this.fakeWindow.performance = {};
	this.fakeWindow.performance.navigation = {
		TYPE_BACK_FORWARD: 2,
		TYPE_NAVIGATE: 0,
		TYPE_RELOAD: 1,
		TYPE_RESERVED: 255
	};
	this.fakeWindow.performance.navigation.type = 2;
	var method = eg.invoke("persist",[null, this.fakeWindow, this.fakeDocument]);

	var restoredState = null;
	$(this.fakeWindow).on("persist", function(e) {
		restoredState = e.state;
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
	deepEqual(restoredState, clonedData);
});