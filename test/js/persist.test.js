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
			JSON: JSON,
			performance: {
				navigation: {
					TYPE_BACK_FORWARD: 2,
					TYPE_NAVIGATE: 0,
					TYPE_RELOAD: 1,
					TYPE_RESERVED: 255,
					type: 0
				}
			},
			navigator: {},
			sessionStorage: {
				getItem: function(key) {
					return this.storage[key];
				},
				setItem: function(key, val) {
					this.storage[key] = val;
				},
				removeItem: function(key) {
					this.storage[key] = undefined;
				}
			}
		};
		this.fakeEvent = {};
		this.data = {
			"scrollTop": 100
		};
		this.storage = {};

		this.method = eg.invoke("persist",[null, eg, this.fakeWindow, this.fakeDocument]);
		this.GLOBALKEY = this.method.GLOBALKEY;
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
		"replaceState" in this.fakeWindow.history && this.fakeWindow.history.replaceState(null, "", "");
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
	deepEqual(clonedState, this.data);
});

test("persist : save state data by key, get state data by key", function() {
	// When
	var state = this.method.persist("TESTKEY");

	// Then
	equal(state, null);

	// When
	var clonedState = this.method.persist("TESTKEY", this.data);

	// Then
	notEqual(clonedState, this.data);
	deepEqual(clonedState, this.data);
});

test("onPageshow : when bfCache miss and not BF navigated, _reset method must be executed.", function() {
	// Given
	var ht = {};
	ht[this.GLOBALKEY] = this.data;
	this.fakeWindow.performance.navigation.type = 2;	// navigation
	this.fakeWindow.history.state = JSON.stringify(ht);

	var method = eg.invoke("persist",[null, eg, this.fakeWindow, this.fakeDocument]);
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
	this.fakeWindow.performance.navigation.type = 0;	// enter url...
	this.fakeWindow.history.state = JSON.stringify(ht);
	var method = eg.invoke("persist",[null, eg, this.fakeWindow, this.fakeDocument]);

	// Then
	equal(method.persist(), null);	// must reset

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
	this.fakeWindow.history.state = JSON.stringify(ht);
	var method = eg.invoke("persist",[null, eg, this.fakeWindow, this.fakeDocument]);

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
	var method = eg.invoke("persist",[null, eg, this.fakeWindow, this.fakeDocument]);

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
 
test("Test not throwing error for legacy browsers", function() {
	this.fakeWindow.history = {};
	delete this.fakeWindow.sessionStorage;

	var method = eg.invoke("persist",[null, eg, this.fakeWindow, this.fakeDocument]);
	ok(!method, "If browser don't have history.state neither web storage, persist shouldn't be defined.");
});

test("Test for browsers which don't have JSON object", function() {
	this.fakeWindow.JSON = undefined;

	var method = eg.invoke("persist",[null, eg, this.fakeWindow, this.fakeDocument]);
	ok(!method, "If browser don't have JSON object, persist shouldn't be defined.");
});

var ua = [

	{
		"device":  "Android 4.3.0",
		"ua": "Mozilla/5.0 (Linux; Android 4.3.0; SM-G900S Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.108 Mobile Safari/537.36",
		"isNeeded": false
	},
	{
		"device":  "Android 5.1.1",
		"ua": "Mozilla/5.0 (Linux; Android 5.1.1; SAMSUNG SM-G925S Build/LMY47X) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/3.2 Chrome/38.0.2125.102 Mobile Safari/537.36",
		"isNeeded": true
	},
	{
		"device":  "iOS 8.0",
		"ua": "Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12B440",
		"isNeeded": false
	}
];

module("extend Agent Test", {
	setup : function() {
		this.fakeWindow = {
			location: {
				href: ""
			},
			history: window.history,
			JSON: JSON,
			performance : {
					navigation : {
						TYPE_BACK_FORWARD: 2,
						TYPE_NAVIGATE: 0,
						TYPE_RELOAD: 1,
						TYPE_RESERVED: 255,
						type : 0
					}
			},
			sessionStorage: {
				getItem: function(key) {
					return this.storage[key];
				},
				setItem: function(key, val) {
					this.storage[key] = val;
				},
				removeItem: function(key) {
					this.storage[key] = undefined;
				}
			},
			navigator: {}
		};
		this.agent = eg.agent;
	},
	teardown : function() {
		eg.agent = this.agent;
	}
});

ua.forEach(function(v,i) {
	test("$.persist.isNeeded : "+ v.device, function() {
		// Given
		this.fakeWindow.navigator.userAgent = v.ua;
		var method = eg.invoke("persist",[null, eg, this.fakeWindow, this.fakeDocument]);
		var isNeeded;

		// When
		isNeeded = method.isNeeded();

		//Then
		equal(isNeeded, v.isNeeded);
	});
});