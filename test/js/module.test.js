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
    new Error("[egjs] The test in 1st argument is undefined.\n\rPlease check and try again.")
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
    new Error("[egjs] The notRegist parameter of test is not valid.\n\rPlease check and try again.")
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
    new Error("[egjs] The notUseAmd in 1st argument is missing.\n\rDownload jQuery from [http://jquery.com/].")
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
    new Error("[egjs] For AMD evnronment (like RequireJS), \"jQuery\" must be declared, which is required by notRegisteAmd."  )
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
    new Error("[egjs] The jQuery library must be loaded before notLoadAmd."  )
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
