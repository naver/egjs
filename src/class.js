/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

eg.module("class", [eg], function(ns) {
	"use strict";

	/**
	 *
	 * A module used to implement an application in object-oriented programming style
	 * @group egjs
	 * @ko 애플리케이션을 객체지향 프로그래밍 방식으로 구현할 때 사용하는 모듈
	 * @class
	 * @name eg.Class
	 *
	 * @support {"ie": "7+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"}
	 * @param {Object} def definition. Follow the rules under <a href="https://en.wikipedia.org/wiki/Literal_(computer_programming)">Literals of objects</a>. Note that "construct" is a key reserved as a constructor function. <ko>클래스를 정의하는 부분. <a href="https://en.wikipedia.org/wiki/Literal_(computer_programming)">객체 리터럴 규칙</a>을 따른다. 단, 'construct'는 생성자 함수로 예약된 키다</ko>
	 * @param {Function} [def.construct] The constructor of the class <ko>클래스 생성자 함수 (Optional)</ko>
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
		 * Returns an instance of a class itself.
		 * @ko 클래스 자신의 인스턴스를 반환한다.
		 * @method eg.Class#instance
		 * @return {eg.Class} An instance of a class itself<ko>클래스 자신의 인스턴스</ko>
		 */
		typeClass.prototype.instance = function() {
			return this;
		};

		typeClass.prototype.constructor = typeClass;
		return typeClass;
	};
	/**
	 * Extends a class.
	 * @ko 클래스를 상속한다.
	 * @static
	 * @method eg.Class.extend
	 * @param {eg.Class} oSuperClass Superclass <ko>상속하려는 클래스</ko>
	 * @param {Object} def Class definition. Follow the rules under <a href="https://en.wikipedia.org/wiki/Literal_(computer_programming)">Literals of objects</a>. Note that "construct" is a key reserved as a constructor function. <ko>클래스를 정의하는 부분. <a href="https://en.wikipedia.org/wiki/Literal_(computer_programming)">객체 리터럴 규칙</a>을 따른다. 단, 'construct'는 생성자 함수로 예약된 키다.</ko>
	 * @param {Function} [def.construct] The constructor of the class <ko>클래스 생성자 함수 (Optional)</ko>
	 * @return {eg.Class} An instance of a new class <ko>새로 생성된 클래스의 인스턴스</ko>
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