/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

eg.module("raf", [eg, window], function(ns, global) {
	"use strict";

	var raf = global.requestAnimationFrame || global.webkitRequestAnimationFrame ||
				global.mozRequestAnimationFrame || global.msRequestAnimationFrame;
	var caf = global.cancelAnimationFrame || global.webkitCancelAnimationFrame ||
				global.mozCancelAnimationFrame || global.msCancelAnimationFrame;

	// https://gist.github.com/paulirish/5438650
	(function() {

		if ("performance" in global === false) {
			global.performance = {};
		}

		global.Date.now = (global.Date.now || function () {  // thanks IE8
			return new global.Date().getTime();
		});

		if ("now" in global.performance === false) {

			var nowOffset = global.Date.now();

			if (global.performance.timing && global.performance.timing.navigationStart) {
				nowOffset = global.performance.timing.navigationStart;
			}

			global.performance.now = function now() {
				return global.Date.now() - nowOffset;
			};
		}

	})();

	if (raf && !caf) {
		var keyInfo = {};
		var oldraf = raf;
		raf = function(callback) {
			function wrapCallback(timestamp) {
				if (keyInfo[key]) {
					callback(timestamp);
				}
			}
			var key = oldraf(wrapCallback);
			keyInfo[key] = true;
			return key;
		};
		caf = function(key) {
			delete keyInfo[key];
		};
	} else if (!(raf && caf)) {
		raf = function(callback) {
			return global.setTimeout(function() {
				callback(global.performance.now());
			}, 16);
		};
		caf = global.clearTimeout;
	}

	/**
	* A polyfill for the window.requestAnimationFrame() method.
	* @ko window.requestAnimationFrame() 메서드의 polyfill 함수다
	* @method eg#requestAnimationFrame
	* @param {Function} timer The function returned through a call to the requestAnimationFrame() method <ko>requestAnimationFrame() 메서드가 호출할 함수</ko>
	* @return {Number} ID of the requestAnimationFrame() method. <ko>requestAnimationFrame() 메서드의 아이디</ko>
	* @example
		var timerId = eg.requestAnimationFrame(function() {
			console.log("call");
		});
	* @see  https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
	*/
	ns.requestAnimationFrame = function(fp) {
		return raf(fp);
	};
	/**
	* A polyfill for the window.cancelAnimationFrame() method. It cancels an animation executed through a call to the requestAnimationFrame() method.
	* @ko window.cancelAnimationFrame() 메서드의 polyfill 함수다. requestAnimationFrame() 메서드로 실행한 애니메이션을 중단한다
	* @method eg#cancelAnimationFrame
	* @param {Number} key −	The ID value returned through a call to the requestAnimationFrame() method. <ko>requestAnimationFrame() 메서드가 반환한 아이디 값</ko>
	* @example
		eg.cancelAnimationFrame(timerId);
	* @see  https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
	*/
	ns.cancelAnimationFrame = function(key) {
		caf(key);
	};
});
