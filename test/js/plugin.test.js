module("Plugin Test", {
	setup : function(){
		this.Sample = eg.Class.extend(eg.Component, {
			"construct": function(ele,option){
				this.options = option;
				this.ele = ele;
			},
			"setNum": function( num ){
				this.options.num = num;
				return this;
			},
			"getNum": function( num ){
				return this.options.num;
			}
		});
		this.Sample.events = function(){
			return ["some","thing"];
		}
	},
	"teardown" : function(){
		$.fn[ "sample" ] = undefined;
		$.event.special["some"] = undefined;
		$.event.special["thing"] = undefined;
	}
});

test("If It didn`t find name that should be throw Error.",function( assert ){
	// Given
	// When
	assert.throws(
		function() {
			eg.plugin("notFound");	
		},
		function( err ) {
			// Then
			return err.toString() === "Error: Not found NotFound object in eg.";
	    }
	)
	
});

test("If It didn`t find events function that should be throw Error.",function( assert ){
	// Given
	var Foo = eg.Class.extend(eg.Component, {
		"construct": function(ele,option){
			this.options = option;
			this.ele = ele;
		},
		"setNum": function( num ){
			this.num += num;
			return this;
		},
		"getNum": function( num ){
			return this.num;
		}
	});
	// When
	assert.throws(
		function() {
			eg.plugin("foo", Foo);	
		},
		function( err ) {
			// Then
			return err.toString() === "Error: Not found events function in eg.Foo. If eg.Foo will make plugin that have to make events function.";
	    }
	)
	
});

test("Already registered name that should be throw Error.",function( assert ){
	// Given
	var Foo = eg.Class.extend(eg.Component, {
		"construct": function(ele,option){
			this.options = option;
			this.ele = ele;
		},
		"setNum": function( num ){
			this.options.num = num;
			return this;
		},
		"getNum": function( num ){
			return this.options.num;
		}
	});
	Foo.events = function(){
		return ["some"];
	}
	$.fn["foo"] = function(){};

	// When
	assert.throws(
		function() {
			eg.plugin("foo", Foo);	
		},
		function( err ) {
			// Then
			return err.toString() === "Error: Foo has already registered. so eg.Foo can`t register for plugin.";
	    }
	)
	
});


test("none parameter.",function( assert ){
	// Given
	eg.plugin("sample", this.Sample);
	// When
	$("#foo").sample();
	// Then
	ok($("#foo").data("eg-sample") instanceof this.Sample);
	equal($("#foo").data("eg-sample").ele[0], $("#foo")[0]);
	
});

test("has options parameter.",function( assert ){
	// Given
	eg.plugin("sample", this.Sample);
	// When
	$("#foo").sample({
		"num": 1,
		"bar" : "bar"
	});

	// Then
	ok($("#foo").data("eg-sample") instanceof this.Sample);
	equal($("#foo").data("eg-sample").option("num"), 1);
});

test("call instance method",function( assert ){
	// Given
	eg.plugin("sample", this.Sample);
	$("#foo").sample({
		"num": 1,
		"bar" : "bar"
	});
	// When
	// Then
	equal($("#foo").sample("getNum"),1);
});

test("If component returned instance that The plugin returned jQuery instance.",function( assert ){
	// Given
	eg.plugin("sample", this.Sample);
	$("#foo").sample({
		"num": 1,
		"bar" : "bar"
	});
	// When
	// Then
	equal($("#foo").sample("setNum",2)[0],$("#foo")[0]);
	equal($("#foo").sample("getNum"),2);
});

test("should be set special events",function( assert ){
	// Given
	eg.plugin("sample", this.Sample);
	$("#foo").sample({
		"num": 1,
		"bar" : "bar"
	});
	// When
	// Then
	ok(!!$.event.special.some);
	ok(!!$.event.special.thing);
});

test("If jQuery already have special events before that override method.",function( assert ){
	// Given
	$.event.special.some = {
		"trigger": function(){},
		"add": function(){},
		"remove": function(){}
	}
	$.event.special.thing = {
		"trigger": function(){},
		"add": function(){},
		"remove": function(){}
	}
	// When
	eg.plugin("sample", this.Sample);
	// Then
	ok(!!$.event.special.some);
	ok(!!$.event.special.thing);
	ok(!!$.event.special.some.oldtrigger);
	ok(!!$.event.special.some.oldadd);
	ok(!!$.event.special.some.oldremove);
	ok(!!$.event.special.thing.oldtrigger);
	ok(!!$.event.special.thing.oldadd);
	ok(!!$.event.special.thing.oldremove);
});

test("custom event trigger/on",function( assert ){
	// Given
	eg.plugin("sample", this.Sample);
	$("#foo").sample({
		"num": 1,
		"bar" : "bar"
	});
	var count = 0;
	function noop(){
		count++;
	}
	$("#foo").on("some.sample",noop);

	// When
	$("#foo").trigger("some.sample");

	// Then
	equal(count,1);

});

test("custom event off",function( assert ){
	// Given
	eg.plugin("sample", this.Sample);
	$("#foo").sample({
		"num": 1,
		"bar" : "bar"
	});
	var count = 0;
	function noop(){
		count++;
	}
	$("#foo").on("some.sample",noop);
	$("#foo").trigger("some.sample");
	equal(count,1);

	// When
	$("#foo").off("some.sample",noop);
	$("#foo").trigger("some.sample");

	// Then
	equal(count,1);	
	
});


test("If jQuery already have special events. Plugin have to fire before special events.",function( assert ){
	// Given
	var someTrigger = 1;
	var someAdd = 1;
	var someRemove = 1;
	var onCallSome = 0;
	var onCallThing = 0;
	function some(){
		onCallSome++;
	}

	$.event.special.some = {
		"trigger": function(){someTrigger++;},
		"add": function(){someAdd++;},
		"remove": function(){someRemove++;}
	};

	// When
	eg.plugin("sample", this.Sample);
	$("#foo").sample({
		"num": 1,
		"bar" : "bar"
	})
	.on("some.sample",some)
	.on("thing.sample",function(){
		onCallThing++;
	});
	$("#foo").trigger("some.sample");
	$("#foo").trigger("thing.sample");
	$("#foo").off("some.sample",some);
	
	// Then
	equal(someTrigger,2);
	equal(someAdd,2);
	equal(someRemove,2);
	equal(onCallSome,1);
	equal(onCallThing,1);
});
