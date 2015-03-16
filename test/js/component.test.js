module("Component Test");

var TestClass = eg.Class.extend(eg.Component,{});
function noop() {}
	
module("on 메서드", {
	setup : function(){
		this.oClass = new TestClass();
	}
});

test("기본 테스트",function(){
	//Given
	//When
	var returnVal = this.oClass.on("returnTest", noop);
	//Then
	strictEqual(returnVal, this.oClass, "on() 메소드로 커스텀이벤트 핸들러를 등록하면 해당 객체 인스턴스를 리턴한다.");
});

test("객체로 등록한 경우",function(){
	//Given
	//When
	var returnVal = this.oClass.on({
		"test2" : noop,
		"test3" : noop
	});
	//Then
	strictEqual(returnVal._htEventHandler.test2.length,1,"test2에 정상적으로 동록해야 한다.");
	strictEqual(returnVal._htEventHandler.test3.length,1,"test3에 정상적으로 동록해야 한다.");
	strictEqual(returnVal, this.oClass, "객체타입으로도 설정할 수 있고 해당 객체 인스턴스를 리턴한다.");
});


module("off 메서드", {
	setup : function(){
		this.oClass = new TestClass();
	}
});

test("기본 기능",function(){
	//Given
	this.oClass.on("customEvent", noop);
	//When
	var oClass = this.oClass.off("customEvent", noop);
	var nHandlerLength = this.oClass._htEventHandler["customEvent"].length;
	//Then
	strictEqual(oClass , this.oClass, "커스텀이벤트 핸들러를 해제하면 해당 객체 인스턴스를 리턴한다.");
	strictEqual(nHandlerLength ,0, "등록된 핸들러 배열의 길이가 줄어들어야 한다.");
});

test("존재하지 않은 커스텀이벤트 핸들러를 해제",function(){
	//Given
	this.oClass.on("test1", noop);
	//When
	var oClass = this.oClass.off("noevent", noop);
	//Then
	strictEqual(oClass._htEventHandler.test1.length,1,"기존에 있는 테스트는 해제가 안된다.");
	strictEqual( oClass, this.oClass, "존재하지 않는 커스텀이벤트 핸들러를 해제하면 해당 객체 인스턴스를 리턴한다.");
});

test("객체단위로 해제",function(){
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
	strictEqual(count , 0, "핸들러를 해제는 객체타입으로도 가능하다.");
	strictEqual(oClass , this.oClass, "해당 객체 인스턴스를 리턴한다.");

});

test("같은 이벤트의 모든 핸들러 해제.",function(){
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
	strictEqual(allOffTestCount,0,"이벤트 이름만 넣으면 한번에 해당 이벤트의 모든 핸들러는 삭제되어야 한다");
})


	


module("trigger 메서드", {
	setup : function(){
		this.oClass = new TestClass();
	}
});
test("trigger 메서드 반환 값 테스트",function(){
	//Given
	//When	
	var returnVal = this.oClass.trigger("noevent");
	//Then
	ok(returnVal, "trigger(이벤트명) 수행시 등록된 핸들러가 없으면 true를 리턴한다.");

	//Given
	this.oClass.on("test", noop);
	//When	
	var returnVal = this.oClass.trigger("test");
	//Then
	ok(returnVal, "test 커스텀이벤트를 발생시키면 true를 리턴한다.");
});

test("trigger 메서드 실행 테스트",function(){
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
	strictEqual(oCustomEvent.nValue,100, "이벤트핸들러가 제대로 수행되어 oCustomEvent의 nValue 값이 100으로 바뀌어야 한다.");
	deepEqual(param,[1,2,3], "trigger() 메소드는 2개 이상의 파라메터를 전달할 수 있다.");
	
});
test("커스텀 이벤트 확인",function(){
	//Given
	var eventType, stopType;
	this.oClass.on("eventType",function(oCustomEvent){
		eventType = oCustomEvent.eventType;
		stopType = typeof oCustomEvent.stop;
	});
	//When
	this.oClass.trigger("eventType");
	//Then
	strictEqual(eventType,"eventType","eventType은 지정된 이벤트명이 나와야 한다.");
	strictEqual(stopType,"function","stop메서드가 있어야 한다.");
});

module("stop 메서드", {
	setup : function(){
		this.oClass = new TestClass();
	}
});

test("기본 테스트",function(){
	//Given
	this.oClass.on("test", function(oCustomEvent){
		oCustomEvent.stop();
	});
	//When
	var result = this.oClass.trigger("test");
	//Then
	ok( result === false, "stop() 메소드가 수행되면 false를 리턴한다.");
});

test("여러개 핸들러를 등록한 경우",function(){
	//Given
	this.oClass.on("test", function(oCustomEvent){
		oCustomEvent.stop();
	});
	this.oClass.on("test", noop);
	//When
	var result = this.oClass.trigger("test");
	//Then
	ok( result === false, "하나의 커스텀이벤트에 여러개의 핸들러를 수행시키면 하나의 핸들러라도 stop() 메소드가 수행되면 false를 리턴한다.");
});