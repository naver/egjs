module("Component Test");

var TestClass = eg.Class.extend(eg.Component,{
	"construct" : function(option){
		this.options = option;
	}
});
function noop() {}

module("on method", {
	setup : function(){
		this.oClass = new TestClass();
	}
});

test("Basic test",function(){
	//Given
	//When
	var returnVal = this.oClass.on("returnTest", noop);
	//Then
	strictEqual(returnVal, this.oClass, "When custom event added by on(), return value must be instance itself");
});

test("Add event handler by Object type",function(){
	//Given
	//When
	var returnVal = this.oClass.on({
		"test2" : noop,
		"test3" : noop
	});

	this.oClass.on({
		"test2" : noop,
		"test3" : noop
	});

	this.oClass.on('test3', noop);
	//Then
	strictEqual(returnVal.eventHandler.test2.length,2,"Event handler must added to 'test2'.");
	strictEqual(returnVal.eventHandler.test3.length,3,"Event handler must added to 'test3'");
	strictEqual(returnVal, this.oClass, "When custom event added by Object type, return value must be instance itself.");
});

test("Add event handler by invalid type",function(){
	//Given
	function getPropertyCount(obj) {
		var count = 0;
		for(var prop in obj) {
			if(this.hasOwnProperty(prop)) {
				// remove constructor (es6) in case of phantomjs
				if(prop !== "constructor") {
					count = count + 1;
				}
			}
		}
		return count;
	}
	//When
	var returnVal1 = this.oClass.on("test_string");
	var returnVal2 = this.oClass.on(123);
	var returnVal3 = this.oClass.on(true);
	var returnVal4 = this.oClass.on(noop);
	var returnVal5 = this.oClass.on({test: 123});

	//Then
	strictEqual(getPropertyCount(returnVal1), 0,  "When parameter has string only, it doesn't added to event handler.");
	strictEqual(returnVal1, this.oClass, "Return value must be instance itself.");
	strictEqual(getPropertyCount(returnVal2), 0, "When parameter has number only, it doesn't added to event handler.");
	strictEqual(returnVal2, this.oClass, "Return value must be instance itself.");
	strictEqual(getPropertyCount(returnVal3), 0, "When parameter has boolean only, it doesn't added to event handler.");
	strictEqual(returnVal3, this.oClass, "Return value must be instance itself.");
	strictEqual(getPropertyCount(returnVal4), 0, "When parameter has function only, it doesn't added to event handler.");
	strictEqual(returnVal4, this.oClass, "Return value must be instance itself.");
	strictEqual(getPropertyCount(returnVal5), 0, "When parameter has invalid, it doesn't added to event handler.");
	strictEqual(returnVal5, this.oClass, "Return value must be instance itself.");
});

module("on method", {
	setup : function(){
		this.oClass = new TestClass();
	}
});

test("Basic part",function(){
	//Given
	var oClass = this.oClass.on("customEvent", noop);
	//When
	var nHandlerLength = this.oClass.eventHandler["customEvent"].length;
	//Then
	strictEqual(oClass , this.oClass, "When remove custom event handler, return value must be instance itself.");
	strictEqual(nHandlerLength , 1, "Event handler length must be 1");
});

test("Re-attach after event detach by string type",function(){
	//Given
	//When
	this.oClass.on("customEvent", noop);
	this.oClass.on("customEvent", noop);
	this.oClass.off("customEvent");
	var oClass = this.oClass.on("customEvent", noop);
	//Then
	strictEqual(oClass.eventHandler.customEvent.length, 1, "When attach two events to same name and detach event by it name re-attach again, eventHandler length should be 1.");
	strictEqual(oClass.eventHandler.customEvent[0], noop, "Handler of customEvent should be noop.");
});

test("Re-attach after event detach by string, function type",function(){
	//Given
	//When
	this.oClass.on("customEvent", noop);
	this.oClass.on("customEvent", noop);
	this.oClass.off("customEvent", noop);
	var oClass = this.oClass.on("customEvent", noop);
	//Then
	strictEqual(oClass.eventHandler.customEvent.length, 2, "When attach two events to same name and detach event by it name re-attach again, eventHandler length should be 2.");
	strictEqual(oClass.eventHandler.customEvent[0], noop, "First handler of customEvent should be noop.");
	strictEqual(oClass.eventHandler.customEvent[1], noop, "Second handler of customEvent should be noop.");
});

module("off method", {
	setup : function(){
		this.oClass = new TestClass();
	}
});

test("Basic part",function(){
	//Given
	this.oClass.on("customEvent", noop);
	//When
	var oClass = this.oClass.off("customEvent", noop);
	var nHandlerLength = this.oClass.eventHandler["customEvent"].length;
	//Then
	strictEqual(oClass , this.oClass, "When remove custom event handler, return value must be instance itself.");
	strictEqual(nHandlerLength ,0, "Event handler length must be decrease.");
});

test("Remove nonexistence event handler",function(){
	//Given
	this.oClass.on("test1", noop);
	//When
	var oClass = this.oClass.off("noevent", noop);
	//Then
	strictEqual(oClass.eventHandler.test1.length,1,"It shouldn't remove existing 'test1'");
	strictEqual( oClass, this.oClass, "When remove nonexistence custom event handler, return value must be instance itself.");
});

test("Remove event handler by Object type",function(){
	//Given
	var count = 0;
	function test(){
		count++;
	}
	this.oClass.on("customEvent", test);
	//When
	var oClass = this.oClass.off({
		"customEvent" : test
	});
	oClass.trigger("customEvent");
	//Then
	strictEqual(count , 0, "Remove event handler must be possible by Object type.");
	strictEqual(oClass , this.oClass, "Return value must be instance itself.");

});

test("Remove all event handlers for same.",function(){
	//Given
	var allOffTestCount = 0;
	this.oClass.on("allOffTest",function(oCustomEvent){
		allOffTestCount++;
	});
	this.oClass.on("allOffTest",function(oCustomEvent){
		allOffTestCount++;
	});
	//When
	this.oClass.off("allOffTest");

	this.oClass.trigger("allOffTest");
	this.oClass.trigger("allOffTest");
	//Then
	strictEqual(allOffTestCount,0,"When event name given, it must be removed all event handlers for same.");
});

test("Remove all event handlers.",function(){
	//Given
	var allOffTestCount = 0;
	this.oClass.on("allOffTest",function(oCustomEvent){
		allOffTestCount++;
	});
	this.oClass.on("allOffTest",function(oCustomEvent){
		allOffTestCount++;
	});
	this.oClass.on("allOffTest2",function(oCustomEvent){
		allOffTestCount++;
	});
	this.oClass.on("allOffTest2",function(oCustomEvent){
		allOffTestCount++;
	});
	//When
	this.oClass.off();

	this.oClass.trigger("allOffTest");
	this.oClass.trigger("allOffTest2");
	//Then
	strictEqual(allOffTestCount,0,"If there is no event name for off(), it must be removed all event handlers of component.");
});





module("trigger method", {
	setup : function(){
		this.oClass = new TestClass();
	}
});
test("Return value test for trigger method",function(){
	//Given
	//When
	var returnVal = this.oClass.trigger("noevent");
	//Then
	ok(returnVal, "If there is no event handler for event name, return value must be true.");

	//Given
	this.oClass.on("test", noop);
	//When
	var returnVal = this.oClass.trigger("test");
	//Then
	ok(returnVal, "When pull the event handler trigger for 'test', return value must be true.");
});

test("Test for run trigger method",function(){
	//Given
	var oCustomEvent = { nValue : 3 };
	var param = [];
	this.oClass.on("test", function (oCustomEvent,a,b,c) {
		oCustomEvent.nValue = 100;
		param.push(a);
		param.push(b);
		param.push(c);
	});
	//When
	var parameterCheck = this.oClass.trigger("test", oCustomEvent, 1, 2, 3);
	//Then
	strictEqual(oCustomEvent.nValue,100, "After event handler running, value of 'oCustomEvent.nValue' must be change to 100.");
	deepEqual(param,[1,2,3], "More than 2 parameters will be passed to 'trigger()' method.");

});
test("Check custom event",function(){
	//Given
	var eventType, stopType;
	this.oClass.on("eventType",function(oCustomEvent){
		eventType = oCustomEvent.eventType;
		stopType = typeof oCustomEvent.stop;
	});
	//When
	this.oClass.trigger("eventType");
	//Then
	strictEqual(eventType,"eventType","EventType value must be appointed event name.");
	strictEqual(stopType,"function","It should have stop method.");
});

module("stop method", {
	setup : function(){
		this.oClass = new TestClass();
	}
});

test("Basic test",function(){
	//Given
	this.oClass.on("test", function(oCustomEvent){
		oCustomEvent.stop();
	});
	//When
	var result = this.oClass.trigger("test");
	//Then
	ok( result === false, "Stop() method should return false.");
});

test("Test for multiple event handler",function(){
	//Given
	this.oClass.on("test", function(oCustomEvent){
		oCustomEvent.stop();
	});
	this.oClass.on("test", noop);
	//When
	var result = this.oClass.trigger("test");
	//Then
	ok( result === false, "When stop method called while running multiple event handler for same custom event, return value must be false.");
});

module("hasOn method", {
	setup : function(){
		this.oClass = new TestClass();
	}
});

test("Event existence/nonexistence",function(){
	//Given
	this.oClass.on("test", noop);
	//When
	var result = this.oClass.hasOn("test");
	//Then
	ok( result, "Event existence.");

	//When
	var result2 = this.oClass.hasOn("test2");
	//Then
	ok( !result2, "Event nonexistence.");
});



module("option method", {
	setup : function(){
		this.oClass = new TestClass({
			"foo": 1,
			"bar": 2
		});
	}
});

test("Option method should be support 4 features.",function(){
	//Given
	//When
	var result = this.oClass.option("foo");
	//Then
	ok( result, 1);

	//Given
	//When
	var result = this.oClass.option("foo",2);
	//Then
	equal( this.oClass.option("foo"), 2);
	ok( result instanceof TestClass );

	//Given
	//When
	var result = this.oClass.option({
		"foo": 3,
		"bar": 4
	});
	//Then
	equal( this.oClass.option("foo"), 3);
	equal( this.oClass.option("bar"), 4);
	ok( result instanceof TestClass );

	//Given
	//When
	var result = this.oClass.option();
	//Then
	deepEqual( result, {
		"foo": 3,
		"bar": 4
	});
});

module("instance method", {
	setup : function(){
		this.oClass = new TestClass();
	}
});

test("should be return self instance.",function(){
	//Given
	//When
	//Then
	ok( this.oClass.instance(), this.oClass);
});