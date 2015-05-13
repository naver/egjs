
function noop(){};

module("rotate", {
  setup : function() {
    this.agent = eg.agent;
    this.fakeDocument = {
      "documentElement" : {
        "clientWidth" : 100,
        "clientHeight" : 200
      }
    };
    this.fakeWindow = {};

    this.clock = sinon.useFakeTimers( Date.now() );

  },
  teardown : function() {
    eg.agent = this.agent;
    this.clock.restore();
  }
});




test("orientationChange : android && 2.1 ", function() {
  // Given
  eg.hook.agent = function(){
    return {
          "os" : {
            "name" : "android",
            "version" : "2.1"
          }
    };
  }
  
  var method = eg._invoke("rotate",[jQuery, null, this.fakeWindow, this.fakeDocument]);

  // When
  $(this.fakeDocument).on("rotate",noop);

  // Then
  equal(method.orientationChange(), "resize");
});

test("orientationChange : The window has onorientationchange", function() {
  // Given
  eg.hook.agent = function(){
    return {
          "os" : {
            "name" : "ios"
          }
    };
  };

  var fakeWindow = {
    "onorientationchange" : "onorientationchange"
  };
  var method = eg._invoke("rotate",[jQuery, null, fakeWindow, this.fakeDocument]);

  // When
  $(this.fakeDocument).on("rotate",noop);

  // Then
  equal(method.orientationChange(), "orientationchange");
});

test("orientationChange : The window not has onorientationchange", function() {
  // Given
  eg.hook.agent = function(){
    return {
          "os" : {
            "name" : "ios"
          }
    };
  };
  var fakeWindow = {
    "resize" : "resize"
  };
  var method = eg._invoke("rotate",[jQuery, null, fakeWindow, this.fakeDocument]);

  // When
  $(this.fakeDocument).on("rotate",noop);

  // Then
  equal(method.orientationChange(), "resize");
});


test("isVertical : If event is resize then first time call.", function() {
  // Given
  eg.hook.agent = function(){
    return {
      "os" : {
        "name" : "android",
        "version" : "2.1"
      }
    };
  };

  var fakeWindow = {
    "resize" : "resize"
  };
  var fakeDocument = {
    "documentElement" : {
      "clientWidth" : 100,
      "clientHeight" : 200
    }
  };
  var method = eg._invoke("rotate",[jQuery, null, fakeWindow, fakeDocument]);

  // When
  // Then
  ok(method.isVertical());
});

test("isVertical : If event is resize then sencond times call. and rotate vertical.", function() {
  // Given 
  eg.hook.agent = function(){
    return {
      "os" : {
        "name" : "android",
        "version" : "2.1"
      }  
    };
  };  
  var fakeWindow = {
    "resize" : "resize"
  };
  var fakeDocument = {
    "documentElement" : {
      "clientWidth" : 200,
      "clientHeight" : 100
    }
  };
  var method = eg._invoke("rotate",[jQuery, null, fakeWindow, fakeDocument]);
  method.isVertical();

  // When
  fakeDocument.documentElement.clientWidth =  100;
  fakeDocument.documentElement.clientHeight =  200;
  var isVertical = method.isVertical();

  // Then
  ok(isVertical);
});


test("isVertical : If event is resize then sencond times call. and stay.", function() {
  // Given
   eg.hook.agent = function(){
      return {
        "os" : {
          "name" : "android",
          "version" : "2.1"
        }
    }
  };
  var fakeWindow = {
    "resize" : "resize"
  };
  var fakeDocument = {
    "documentElement" : {
      "clientWidth" : 100,
      "clientHeight" : 200
    }
  };
  var method = eg._invoke("rotate",[jQuery, null, fakeWindow, fakeDocument]);
  method.isVertical();

  // When
  fakeDocument.documentElement.clientWidth =  100;
  fakeDocument.documentElement.clientHeight =  200;
  var isVertical = method.isVertical();

  // Then
  equal(isVertical,null);
});

test("isVertical : If event is resize then sencond times call. and rotate horizontal.", function() {
  // Given
   eg.hook.agent = function(){
    return {
      "os" : {
        "name" : "android",
        "version" : "2.1"
      }
    }
  };
  var fakeWindow = {
    "resize" : "resize"
  };
  var fakeDocument = {
    "documentElement" : {
      "clientWidth" : 100,
      "clientHeight" : 200
    }
  };
  var method = eg._invoke("rotate",[jQuery, null, fakeWindow, fakeDocument]);
  method.isVertical();

  // When
  fakeDocument.documentElement.clientWidth =  200;
  fakeDocument.documentElement.clientHeight =  100;
  var isNotVertical =  !method.isVertical();

  // Then
  ok(isNotVertical);
});

test("isVertical : If event is orientationchange then vertical.", function() {
  // Given
   eg.hook.agent = function(){
    return {
      "os" : {
        "name" : "ios"
      }
    };
  }
  var fakeWindow = {
    "onorientationchange" : "onorientationchange",
    "orientation" : 0
  };  
  var method = eg._invoke("rotate",[jQuery, null, fakeWindow, this.fakeDocument]);

  // When
  var isVertical =  method.isVertical();
  // Then
  ok(isVertical);

  // When
  fakeWindow.orientation = 180;
  isVertical =  method.isVertical();
  // Then
  ok(isVertical);
});

test("isVertical : If event is orientationchange then vertical.", function() {
  // Given
   eg.hook.agent = function(){
    return {
      "os" : {
        "name" : "ios"
      }
    };
  }
  var fakeWindow = {
    "onorientationchange" : "onorientationchange",
    "orientation" : 90
  };  
  var method = eg._invoke("rotate",[jQuery, null, fakeWindow, this.fakeDocument]);

  // When
  var isNotVertical =  !method.isVertical();
  // Then
  ok(isNotVertical);

  // When
  fakeWindow.orientation = -90;
  isNotVertical =  !method.isVertical();
  // Then
  ok(isNotVertical);
});

module("rotate: handler", {
  setup : function() {
   var agent = eg.agent();
   this.clock = sinon.useFakeTimers( Date.now() );
   this.realOSAgent = agent.os;
   agent.os.name = "ios";
   eg.agent = function(){
      return agent;
   }

    this.fakeWindow = {
      "onorientationchange" : "onorientationchange",
      "orientation" : 0,
      "setTimeout" : setTimeout,
      "clearTimeout" : clearTimeout
    };

    this.fakeDocument = {
      "documentElement" : {
        "clientWidth" : 200,
        "clientHeight" : 100
      }
    };

  },
  teardown : function() {
    var agent = eg.agent();
    agent.os = this.realOSAgent;
    eg.agent = function(){
      return agent;
    }
    this.clock.restore();
  }
});


test("If event is orientationchange then trigger and not android.", function() {
  // Given
  var method = eg._invoke("rotate",[jQuery, null, this.fakeWindow, this.fakeDocument]);
  var isCall = false;
  var isVertical = false;
  $(this.fakeWindow).on("rotate",function(e){
    isCall = true;
    isVertical = e.isVertical;
  });

  // When
  method.handler({
    type : "orientationchange"
  });
  this.clock.tick( 310 );

  // Then
  ok(isCall);  
  ok(isVertical);

  // When
  this.fakeWindow.orientation =  90;

  method.handler({
    type : "orientationchange"
  });
  this.clock.tick( 310 );

  // Then
  ok(isCall);  
  ok(!isVertical);
});


test("If event is orientationchange then trigger and android.", function() {
  // Given
  var isCall = false;
  var isVertical = false;
  var agent = eg.agent();
  agent.os = {
        "name" : "android",
        "version" :"4"
  };
  eg.agent = function(){
    return agent;
  }
  var method = eg._invoke("rotate",[jQuery, null, this.fakeWindow, this.fakeDocument]);

  $(this.fakeWindow).on("rotate",function(e){
    isCall = true;
    isVertical = e.isVertical;
  });

  // When
  method.isVertical();
  var checkFail = method.handler({
    type : "orientationchange"
  });
  
  // Then
  deepEqual(checkFail, false);
  equal(isCall,false);  
  equal(isVertical,false);



  // Given
  this.fakeDocument.documentElement.clientWidth =  100;
  this.fakeDocument.documentElement.clientHeight =  200;
  this.fakeWindow.orientation =  90;

  // When
  this.clock.tick( 510 );
  var checkFail = method.handler({
    type : "orientationchange"
  });
  this.clock.tick( 310 );

  // Then
  ok(isCall);  
  equal(isVertical,false);

});


test("If event is resize then trigger.", function() {
  // Given
  var isCall = false;
  var isVertical = false;
  eg.hook.agent = function(){
    return {
      "os" : {
        "name" : "android",
        "version" :"2.1"
      }
    };
  };


  delete this.fakeWindow.onorientationchange;
  this.fakeWindow.resize = "resize";


  var method = eg._invoke("rotate",[jQuery, null, this.fakeWindow, this.fakeDocument]);
  $(this.fakeWindow).on("rotate",function(e){
    isCall = true;
    isVertical = e.isVertical;
  });

  this.fakeDocument.documentElement.clientWidth =  100;
  this.fakeDocument.documentElement.clientHeight =  200;

  // When
  method.handler({
    type : "resize"
  });
  this.clock.tick( 10 );

  // Then
  ok(isCall);  
  ok(isVertical);

  // When
  this.fakeDocument.documentElement.clientWidth =  200;
  this.fakeDocument.documentElement.clientHeight =  100;

  method.handler({
    type : "resize"
  });
  this.clock.tick( 10 );

  // Then
  ok(isCall);  
  ok(!isVertical);
});

