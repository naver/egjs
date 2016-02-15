/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

module("scrollEnd", {
  setup : function() {
    this.agent = eg.agent;
    this.isFireEvent = false;
    this.topPos = 10;
    this.intervalNum = 0;

  },
  teardown : function() {
    eg.agent = this.agent;
    $(window).off("scrollend");
  }
});


test("getDeviceType : android && 2.1 ", function() {
    // Given
  eg.agent = function(){
      return {
         "os" : {
             "name" : "android",
             "version" : "2.1"
         },
         "browser" : {}
      }
    }
    var method = eg.invoke("scrollEnd");

    // When
    $(window).on("scrollend", function(){
    });

    // Then
    equal(method.getDeviceType(), method.TIMERBASE);

});

test("getDeviceType : android && chrome ", function() {
    // Given
  eg.agent = function(){
    return {
       "os" : {
           "name" : "android",
           "version" : "2.1"
       },
       "browser" : {
            "name" : "chrome"
       }
     }
    };
    var method = eg.invoke("scrollEnd");

    // When
    $(window).on("scrollend", function(){
    });

    // Then
    equal(method.getDeviceType(), method.TIMERBASE);

});


test("getDeviceType : android && version 3.x over ", function() {
    // Given
  eg.agent = function(){
    return {
       "os" : {
           "name" : "android",
           "version" : "3.0"
       },
       "browser" : {
            "name" : ""
       }
     }
    };
    var method = eg.invoke("scrollEnd");

    // When
    $(window).on("scrollend", function(){
    });

    // Then
    equal(method.getDeviceType(), method.TIMERBASE);

});

test("getDeviceType : ios && version 8.x over ", function() {
    // Given
  eg.agent = function(){
    return {
       "os" : {
           "name" : "ios",
           "version" : "8.0"
       },
       "browser" : {
            "name" : ""
       }
     }
    };
    var method = eg.invoke("scrollEnd");

    // When
    $(window).on("scrollend", function(){
    });

    // Then
    equal(method.getDeviceType(), method.TIMERBASE);

});


test("getDeviceType : window && version 8.x over ", function() {
    // Given
  eg.agent = function(){
    return {
       "os" : {
           "name" : "window",
           "version" : "8.0"
       },
       "browser" : {
            "name" : ""
       }
     }
  };
    var method = eg.invoke("scrollEnd");

    // When
    $(window).on("scrollend", function(){
    });

    // Then
    equal(method.getDeviceType(), method.TIMERBASE);

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
	  eg.agent = function(){
	    return {
	       "os" : {
	           "name" : "ios",
	           "version" : "7.0"
	       },
	       "browser" : {
	            "name" : ""
	       }
	     }
	    };
	
	    window.scrollTo(0, 1);
	    var method = eg.invoke("scrollEnd");
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
	  equal(method.getDeviceType(), method.SCROLLBASE);
	
	  stop();
	  setTimeout(function(){
	      strictEqual(self.isFireEvent , true, "scrollend event occurred");
	      start();
	  }, 500);
	});
	
	
	test("timer scroll", function() {
	  // Given
	  eg.agent = function(){
	    return {
	       "os" : {
	           "name" : "ios",
	           "version" : "8.0"
	       },
	       "browser" : {
	            "name" : ""
	       }
	     }
	    };
	
	    window.scrollTo(0, 1);
	    var method = eg.invoke("scrollEnd");
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
	  equal(method.getDeviceType(), method.TIMERBASE);
	
	  stop();
	  setTimeout(function(){
	      strictEqual(self.isFireEvent , true, "scrollend event occurred");
	      start();
	  }, 500);
	});
	
	
	test("chrome scroll", function() {
	  // Given
	  eg.agent = function(){
	    return {
	       "os" : {
	           "name" : "android",
	           "version" : "4.1"
	       },
	       "browser" : {
	            "name" : "chrome"
	       }
	     }
	    };
	
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
	  equal(method.getDeviceType(), method.TIMERBASE);
	
	  stop();
	  setTimeout(function(){
	      strictEqual(self.isFireEvent , true, "scrollend event occurred");
	      start();
	  }, 500);
	});
}
