QUnit.module( "module", {
  beforeEach: function() {
    window.require = undefined;
    window.jQuery = undefined;
  }
});

QUnit.test( "When a parameter is undefined.", function( assert ) {
  //Given
  var param = [window.something];
  //When
  //Then
  assert.throws(
    function() {
      throw eg.module("test",param,function($) {});
    },
    new Error("[egjs] The 1st argument of test is undefined.\n\rPlease check and try again.")
  );
});

QUnit.test( "The dependency library was not registered.", function( assert ) {
  //Given
  var param = ["notRegist"];
  //When
  //Then
  assert.throws(
    function() {
      throw eg.module("test",param,function($) {});
    },
    new Error("[egjs] The notRegist parameter of test is not valid.\n\rPlease check and try again.")
  );
});

QUnit.test( "The dependency library was registered, but it does not use AMD", function( assert ) {
  //Given
  var param = ["jQuery"];
  //When
  //Then
  assert.throws(
    function() {
      throw eg.module("notUseAmd",param,function($) {});
    },
    new Error("[egjs] The 1st argument of notUseAmd is missing.\n\rDownload jQuery from [http://jquery.com/].")
  );
});

QUnit.test( "The dependency library was registered, but not defined in AMD.", function( assert ) {
  //Given
  var param = ["jQuery"];
  window.require = function(){

  }
  window.require.specified = function(){
    return false;
  }
  //When
  //Then
  assert.throws(
    function() {
      throw eg.module("notRegisteAmd",param,function($) {});
    },
    new Error("[egjs] For AMD environment (like RequireJS), \"jQuery\" must be declared, which is required by notRegisteAmd."  )
  );
});

QUnit.test( "The dependency library was registered and defined in AMD, but not loaded.", function( assert ) {
  //Given
  var param = ["jQuery"];
  window.require = function(){

  }
  window.require.specified = function(){
    return true;
  }
  window.require.defined = function(){
    return false;
  }
  //When
  //Then
  assert.throws(
    function() {
      throw eg.module("notLoadAmd",param,function($) {});
    },
    new Error("[egjs] The jQuery library must be loaded before notLoadAmd."  )
  );
});

QUnit.test( "All parameters are object.", function( assert ) {
  //Given
  var param = {};
  var param2 = {};
  //When
  //Then
  eg.module("allParameters",[param, param2],function($, _) {
    assert.strictEqual(param, $);
    assert.strictEqual(param2, _);
  });
});

QUnit.test( "When a parameter is string and not loaded as AMD.", function( assert ) {
  //Given
  window.jQuery = function(){};
  //When
  //Then
  eg.module("like jQuery",["jQuery"],function($) {
    assert.strictEqual(jQuery, $);
  });
});

QUnit.test( "When a parameter is string and not loaded as AMD.", function( assert ) {
  //Given
  var Hammer = {};
  window.require = function(){
    return Hammer;
  }
  window.require.specified = function(){
    return true;
  }
  window.require.defined = function(){
    return true;
  }
  //When
  //Then
  eg.module("like Hammer",["Hammer"],function(HM) {
    assert.strictEqual(Hammer, HM);
  });
});

QUnit.test( "Check parameters ordinal numbers.", function( assert ) {
  //Given
  var param = [ 1, 1, 1, 1, 1 ];
  //When

  [ "1st", "2nd", "3rd", "4th", "5th" ].forEach(function(v,i) {
    //Then
    assert.throws(
        function() {
          var arr = param.concat();
          arr[i] = window.something;

          throw eg.module("test",arr,function($) {});
        },
        new Error("[egjs] The "+ v +" argument of test is undefined.\n\rPlease check and try again."),
        "Ordinal number for "+ i +" is "+ v +"?"
    );

  });
});