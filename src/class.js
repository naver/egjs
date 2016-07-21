/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

eg.module("class", [eg], function(ns) {
	"use strict";

	/**
	 *
	 * The Class object is used to implement object-oriented style programming
	 * @group egjs
	 * @ko Class는 어플리케이션을 객체지향 프로그래밍 방식으로 구현하는데 사용한다.
	 * @class
	 * @name eg.Class
	 *
	 * @support {"ie": "7+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"}
	 * @param {Object} def Class definition of object literal type. <ko>클래스 정의부로 Object 의 <a href="https://en.wikipedia.org/wiki/Literal_(computer_programming)">리터럴 규칙</a>을 따른다. 단, "construct" 는 생성자 함수를 위해 예약된 키 값이다. </ko>
	 * @param {Function} def.construct constructor of class. <ko>클래스 생성자 함수 (Optional)</ko>
	 *
	 * @example
	 	var Some = eg.Class({
	 		//Class initialize
			"construct" : function(val){
				this.val = val;
			},
			"sumVal" : function(val) {
				return this.val + val;
			}
	 	});

	 	var some = new Some(5);
	 	some.sumVal(5);//10
	 */
	ns.Class = function(def) {
		var typeClass = function typeClass() {
			if (typeof def.construct === "function") {
				def.construct.apply(this, arguments);
			}
		};

		typeClass.prototype = def;

		/**
		 * Retrun instance itself.
		 * @ko 자신의 인스턴스를 반환한다.
		 * @method eg.Class#instance
		 * @return {eg.Class} instance of itself<ko>자신의 인스턴스</ko>
		 */
		typeClass.prototype.instance = function() {
			return this;
		};

		typeClass.prototype.constructor = typeClass;
		return typeClass;
	};
	/**
	 * Extends class
	 * @ko extend는 Class를 상속할 때 사용한다.
	 * @static
	 * @method eg.Class.extend
	 * @param {eg.Class} oSuperClass Super class. <ko>상속하려는 클래스</ko>
	 * @param {Object} def Class definition of object literal type. <ko>클래스 정의부로 Object 의 <a href="https://en.wikipedia.org/wiki/Literal_(computer_programming)">리터럴 규칙</a>을 따른다. 단, "construct" 는 생성자 함수를 위해 예약된 키 값이다.</ko>
	 * @param {Function} def.construct <ko>클래스 생성자 함수 (Optional)</ko>
	 * @return {eg.Class} instance of new eg.Class <ko>새로 생성된 eg.Class 인스턴스</ko>
	 * @example
	 	var Some = eg.Class.extend(eg.Component,{
			"some" : function(){}
	 	})
	 */

	ns.Class.extend = function(superClass, def) {
		var extendClass = function extendClass() {
			// Call a parent constructor
			superClass.apply(this, arguments);

			// Call a child constructor
			if (typeof def.construct === "function") {
				def.construct.apply(this, arguments);
			}
		};

		var ExtProto = function() {};
		ExtProto.prototype = superClass.prototype;

		//extendClass.$super = oSuperClass.prototype; //'super' is supported not yet.

		var extProto = new ExtProto();
		for (var i in def) {
			extProto[i] = def[i];
		}
		extProto.constructor = extendClass;
		extendClass.prototype = extProto;

		return extendClass;
	};
});