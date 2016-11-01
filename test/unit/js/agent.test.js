QUnit.module("extend Agent Test", {
	setup : function() {
		this.agent = eg.agent;
		this.fakeWindow = {
			navigator: {}
		};
		},
	teardown : function() {
		eg.agent = this.agent;
	}
});

$.each( ua, function( i, v ) {
	QUnit.test("agent Test : "+ v.device, function(assert) {
		// Given
		this.fakeWindow.navigator.userAgent = v.ua;
		eg.invoke("eg",[null, this.fakeWindow]);
		// When
		var agent = eg.agent();
		//Then
		assert.equal(agent.os.name, v.os.name, "check os name : " + v.ua);
		assert.equal(agent.os.version, v.os.version, "check os Version");
		assert.equal(agent.browser.name, v.browser.name, "check browser name");
		assert.equal(agent.browser.version, v.browser.version, "check browser Version");
		assert.equal(agent.browser.webview, v.browser.webview, "check webview");
	});
});

$.each( nativeVersionProfile, function( i, v ) {
	QUnit.test("agent hook nativeVersion Test"+i, function(assert) {
		// Given
		this.fakeWindow.navigator.userAgent = v.ua;
		eg.invoke("eg",[null, this.fakeWindow]);
		eg.hook = {};
		eg.hook.agent = function(agent){
			var dm = dm || v._documentMode || -1,
				nativeVersion;
			if(dm > 0) {
				if(m = /(Trident)[\/\s]([\d.]+)/.exec(v.ua)) {
					if(m[2] > 3) {
						nativeVersion = parseFloat(m[2],10) + 4;
					}
				} else {
					nativeVersion = dm;
				}
			} else {
				nativeVersion = parseFloat(agent.browser.version,10);
			}

			agent.browser.nativeVersion = nativeVersion;
			return agent;
		};
		// When
		var agent = eg.agent();
		//Then
		assert.equal(agent.browser.nativeVersion, v.browser.nativeVersion,
			  "check browser native Version: " +
			  v.ua + " , " +
			  agent.browser.nativeVersion + " , " +
			  v.browser.nativeVersion);
	});
});
