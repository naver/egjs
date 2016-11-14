module("raf");

QUnit.test( "When browser not support that raf have to pass timestamp.", function( assert ) {
  //Given
	var MockDate = function(){
		return {getTime : function(){ return 1;}};
	};

	eg.invoke("raf",[eg, {
		Date: MockDate,
		setTimeout: function(callback){
			callback();
		}
	}]);
	var done = assert.async();
	//When
	eg.requestAnimationFrame(function(timestamp){
		//Then
		assert.equal( typeof timestamp , "number");
		done();
	});
});

QUnit.test( "When browser support that raf have to pass timestamp.", function( assert ) {
  //Given
	var MockDate = function(){
		return {getTime : function(){ return 1;}};
	};
	eg.invoke("raf",[eg, {
		Date: MockDate,
		requestAnimationFrame:function(callback){
			setTimeout(function(){
				callback(1);
			});
			return "random";
		}
	}]);
	var done = assert.async();
	//When
	eg.requestAnimationFrame(function(timestamp){
		//Then
		assert.equal( typeof timestamp , "number");
		done();
	});
});
