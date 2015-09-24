QUnit.module( "module", {
  beforeEach: function() {
    window.require = undefined;
    window.jQuery = undefined;
  }
});

QUnit.test( "A parameter is undefined.", function( assert ) {
  //Given
  var param = [window.something];
  //When
  //Then
  assert.throws(
    function() {
      throw eg.module("test",param,function($) {});
    },
    new Error("[egjs] The 1st parameter is undefined in test.\n\rCheck up depandency component.")
  );
});

QUnit.test( "The dependency library did not regist.", function( assert ) {
  //Given
  var param = ["notRegist"];
  //When
  //Then
  assert.throws(
    function() {
      throw eg.module("test",param,function($) {});
    },
    new Error("[egjs] The 1st parameter is notRegist that does not defined in test.\n\rCheck up paratemer name.")
  );
});

QUnit.test( "The dependency library registed but It does not use amd", function( assert ) {
  //Given
  var param = ["jQuery"];
  //When
  //Then
  assert.throws(
    function() {
      throw eg.module("notUseAmd",param,function($) {});
    },
    new Error("[egjs] The 1st parameter is undefined in notUseAmd.\n\rDownload jQuery[http://jquery.com/].")
  );
});

QUnit.test( "The dependency library registed but It did not define in amd.", function( assert ) {
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
    new Error("[egjs] If you use amd(requirejs..) that you have to register \"jQuery\" of defined library name in notRegisteAmd."  )
  );
});

QUnit.test( "The dependency library registed and It defined in amd but It did not load.", function( assert ) {
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
    new Error("[egjs] You can use notLoadAmd after The jQuery loaded."  )
  );
});

QUnit.test( "All parameters is object.", function( assert ) {
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

QUnit.test( "A parameter is string and It did not load amd.", function( assert ) {
  //Given
  window.jQuery = function(){};
  //When
  //Then
  eg.module("like jQuery",["jQuery"],function($) {
    assert.strictEqual(jQuery, $);
  });
});

QUnit.test( "A parameter is string and It loaded amd.", function( assert ) {
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
