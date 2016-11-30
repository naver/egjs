/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

module("scrollEnd", {
  setup : function() {
    this.isFireEvent = false;
    this.topPos = 10;
    this.intervalNum = 0;

  },
  teardown : function() {
    $(window).off("scrollend");
  }
});

test("It should fire scrollend event.", function() {

   // Given
  var checkInfo;

  window.scrollTo(0, 1);
  var method = eg.invoke("scrollEnd");
  method.detectType = method.SCROLLBASE;
  var self = this;

  // When
  $(window).on("scrollend", function(e,info){
    checkInfo = info;
  });

  this.intervalNum = setInterval(function(){
    self.topPos += 10;
    window.scrollTo(0, self.topPos);
    if(self.topPos > 20){
      clearInterval(self.intervalNum);
    }
  }, 30);

  // Then
  stop();
  setTimeout(function(){
    equal(checkInfo.top, 30);
    equal(checkInfo.left, 0);
    start();
  }, 500);
});

test("getDetectType : android && 2.1 ", function() {
    // Given
    var method = eg.invoke("scrollEnd");

    // When
    var type = method.getDetectType("Mozilla/5.0 (Linux;U;Android 2.1;ko-kr;SHW-M110S Build/ÉCLAIR) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17");

    // Then
    equal(type, method.TIMERBASE);

});

test("getDetectType : android && chrome ", function() {
    // Given
    var method = eg.invoke("scrollEnd");

    // When
    var type = method.getDetectType("Mozilla/5.0 (Linux; U;Android 4.0.3;ko-kr; SHW-M250S Build/IML74K) AppleWebKit/535.7 (KHTML, like Gecko) Chrome/16.0.912.77 Mobile Safari/535.7");

    // Then
    equal(type, method.TIMERBASE);

});


test("getDetectType : android && version 3.x over ", function() {
    // Given
    var method = eg.invoke("scrollEnd");

    // When
    var type = method.getDetectType("Mozilla/5.0 (Linux;U;Android 4.0.1;ko-kr;Galaxy Nexus Build/ITL41F)AppleWebKit/534.30 (KHTML, like Gecko)Version/4.0 Mobile Safari/534.30");

    // Then
    equal(type, method.TIMERBASE);

});



test("getDetectType : webview ", function() {
    // Given
    var method = eg.invoke("scrollEnd");
    var type;

    // When
    type = method.getDetectType("Mozilla/5.0 (Linux; Android 4.4.2; SM-G900S Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/28.0.1500.94 Mobile Safari/537.36 NAVER(inapp; search; 340; 6.0.5)");
    // Then
    equal(type, method.TIMERBASE);

    // When
    type = method.getDetectType("Mozilla/5.0 (Linux; Android 5.0; SM-G900S Build/LRX21T; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/42.0.2311.138 Mobile Safari/537.36");
    // Then
    equal(type, method.TIMERBASE);

    // When
    type = method.getDetectType("Mozilla/5.0 (Linux; Android 4.4.2; SM-G900S Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.61 Mobile Safari/537.36 NAVER(higgs; search; 340; 6.0.5; 1.0.6.2)");
    // Then
    equal(type, method.TIMERBASE);

});

test("getDetectType : ios 7 && not webview ", function() {
    // Given
    var method = eg.invoke("scrollEnd");
    var type;

    // When
    type = method.getDetectType("Mozilla/5.0 (iPhone;CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B146 Safari/8536.25");
    // Then
    equal(type, method.SCROLLBASE);

});


test("getDetectType : ios && version 8.x over ", function() {
  // Given
  var method = eg.invoke("scrollEnd");
  var type;

  // When
  type = method.getDetectType("Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13A452 Safari/601.1");
  // Then
  equal(type, method.TIMERBASE);

});

test("getDetectType : ios 8 && webview ", function() {
  // Given
  var method = eg.invoke("scrollEnd");
  var type;

  // When
  type = method.getDetectType("Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12B440");
  // Then
  equal(type, method.TIMERBASE);

});

test("getDetectType : ios 7 && webview ", function() {
  // Given
  var method = eg.invoke("scrollEnd");
  var type;

  // When
  type = method.getDetectType("Mozilla/5.0 (iPhone;CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Mobile/10B146");
  // Then
  equal(type, method.TIMERBASE);

});

test("getDetectType : window && version 8.x over ", function() {
	// Given
  var method = eg.invoke("scrollEnd");
  var type;

  // When
  type = method.getDetectType("Mozilla/5.0 (Windows NT 6.3; Win64, x64; Trident/7.0; Touch; rv:11.0) like Gecko");
  // Then
  equal(type, method.TIMERBASE);

});

test("scroll after rotate", function() {
  // Given
    window.scrollTo(0, 1);
    var method = eg.invoke("scrollEnd");
    var self = this;

  // When
    $(window).on("scrollend", function(){
       self.isFireEvent = true;
    });
    $(window).trigger("orientationchange");

    this.intervalNum = setInterval(function(){
        self.topPos += 10;
        window.scrollTo(0, self.topPos);
        if(self.topPos > 40){
            clearInterval(self.intervalNum);
        }
    }, 30);

  // Then
  stop();
  setTimeout(function(){
      strictEqual(self.isFireEvent , true, "scrollend event occurred");
      start();
  }, 1000);
});

if(eg.agent().browser.name === "PhantomJS") {
  test("scroll scroll", function() {
		// Given

		var method = eg.invoke("scrollEnd");
		method.detectType = method.SCROLLBASE;
		window.scrollTo(0, 1);
		var self = this;

		// When
		$(window).on("scrollend", function(){
			self.isFireEvent = true;
		});

		this.intervalNum = setInterval(function(){
			self.topPos += 10;
			window.scrollTo(0, self.topPos);
			if(self.topPos > 20){
				clearInterval(self.intervalNum);
			}
		}, 30);

		// Then

		stop();
		setTimeout(function(){
			strictEqual(self.isFireEvent , true, "scrollend event occurred");
			start();
		}, 500);
  });


  test("timer scroll", function() {
	  // Given
    var method = eg.invoke("scrollEnd");
    method.detectType = method.TIMERBASE;
    window.scrollTo(0, 1);
    var self = this;

	  // When
    $(window).on("scrollend", function(){
       self.isFireEvent = true;
    });

    this.intervalNum = setInterval(function(){
        self.topPos += 10;
        window.scrollTo(0, self.topPos);
        if(self.topPos > 20){
            clearInterval(self.intervalNum);
        }
    }, 30);

	  // Then
	  stop();
	  setTimeout(function(){
	      strictEqual(self.isFireEvent , true, "scrollend event occurred");
	      start();
	  }, 500);
  });
}
