/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

// jscs:disable maximumLineLength
eg.module("rotate", ["jQuery", eg, window, document], function($, ns, global, doc) {
	"use strict";

	// jscs:enable maximumLineLength
	/**
	 * @namespace jQuery
	 * @group jQuery Extension
	 */
	/**
	 * This jQuery custom event is fired when device rotates.
	 *
	 * @ko 기기가 회전할 때 발생하는 jQuery 커스텀 이벤트
	 * @name jQuery#rotate
	 * @event
	 * @param {Event} e The Event object in jQuery<ko>jQuery의 Event 객체</ko>
	 * @param {Object} info The object of data to be sent when the event is fired<ko>이벤트가 발생할 때 전달되는 데이터 객체</ko>
	 * @param {Boolean} info.isVertical The orientation of the device (true: portrait, false: landscape) <ko>기기의 화면 방향(true: 수직 방향, false: 수평 방향)</ko>
	 * @support { "ios" : "7+", "an" : "2.1+ (except 3.x)"}
	 * @example
	 * $(window).on("rotate",function(e, info){
	 *      info.isVertical;
	 * });
	 *
	 */

	var beforeScreenWidth = -1;
	var beforeVertical = null;
	var rotateTimer = null;

	var agent = (function() {
		var ua = global.navigator.userAgent;
		var match = ua.match(/(iPhone OS|CPU OS|Android)\s([^\s;-]+)/);  // fetch Android & iOS env only
		var res = {
			os: "",
			version: ""
		};

		if (match) {
			res.os = match[1].replace(/(?:CPU|iPhone)\sOS/, "ios").toLowerCase();
			res.version = match[2].replace(/\D/g, ".");
		}

		return res;
	})();

	var isMobile = /android|ios/.test(agent.os);

	if (!isMobile) {
		ns.isPortrait = function() {
			return false;
		};

		return;
	}

	/**
	 * Return event name string for orientationChange according browser support
	 */
	var orientationChange = function() {
		var type;
		/**
		 * Some platform/broswer returns previous widht/height state value. For workaround, give some delays.
		 *
		 * Android bug:
		 * - Andorid 2.3 - Has orientationchange with bug. Needs 500ms delay.
		 *
		 *   Note: Samsung's branded Android 2.3
		 *   When check orientationchange using resize event, could cause browser crash if user binds resize event on window
		 *
		 * - Android 2.2 - orientationchange fires twice(at first time width/height are not updated, but second returns well)
		 * - Lower than 2.2 - use resize event
		 *
		 * InApp bug:
		 * - Set 200ms delay
		 */
		if ((agent.os === "android" && agent.version === "2.1")) {//|| htInfo.galaxyTab2)
			type = "resize";
		} else {
			type = "onorientationchange" in global ? "orientationchange" : "resize";
		}

		orientationChange = function() {
			return type;
		};
		return type;

	};
	/**
	* When viewport orientation is portrait, return true otherwise false
	*/
	function isVertical() {
		var eventName = orientationChange();
		var screenWidth;
		var degree;
		var vertical;

		if (eventName === "resize") {
			screenWidth = doc.documentElement.clientWidth;

			if (beforeScreenWidth === -1) { //first call isVertical
				vertical = screenWidth < doc.documentElement.clientHeight;
			} else {
				if (screenWidth < beforeScreenWidth) {
					vertical = true;
				} else if (screenWidth === beforeScreenWidth) {
					vertical = beforeVertical;
				} else {
					vertical = false;
				}
			}
		} else {
			degree = global.orientation;
			if (degree === 0 || degree === 180) {
				vertical = true;
			} else if (degree === 90 || degree === -90) {
				vertical = false;
			}
		}
		return vertical;
	}

	/**
	* Trigger rotate event
	*/
	function triggerRotate() {

		var currentVertical = isVertical();
		if (isMobile) {
			if (beforeVertical !== currentVertical) {
				beforeVertical = currentVertical;
				beforeScreenWidth = doc.documentElement.clientWidth;
				$(global).trigger("rotate", {
					isVertical: beforeVertical
				});
			}
		}
	}

	/**
	* Trigger event handler
	*/
	function handler(e) {

		var eventName = orientationChange();
		var delay;
		var screenWidth;

		if (eventName === "resize") {
			global.setTimeout(function() {
				triggerRotate();
			}, 0);
		} else {
			delay = 300;
			if (agent.os === "android") {
				screenWidth = doc.documentElement.clientWidth;
				if (e.type === "orientationchange" && screenWidth === beforeScreenWidth) {
					global.setTimeout(function() {
						handler(e);
					}, 500);

					// When width value wasn't changed after firing orientationchange, then call handler again after 300ms.
					return false;
				}
			}

			global.clearTimeout(rotateTimer);
			rotateTimer = global.setTimeout(function() {
				triggerRotate();
			}, delay);
		}
	}

	$.event.special.rotate = {
		setup: function() {
			beforeVertical = isVertical();
			beforeScreenWidth = doc.documentElement.clientWidth;
			$(global).on(orientationChange(), handler);
		},
		teardown: function() {
			$(global).off(orientationChange(), handler);
		},
		trigger: function(e) {
			e.isVertical = beforeVertical;
		}
	};

	/**
	 * Checks whether the current orientation of the device is portrait.
	 * @ko 기기의 화면이 수직 방향인지 확인한다
	 * @method eg#isPortrait
	 * @return {Boolean} The orientation of the device (true: portrait, false: landscape) <ko>기기의 화면 방향(true: 수직 방향, false: 수평 방향)</ko>
	 * @example
eg.isPortrait();  // Check if device is in portrait mode
	*/
	ns.isPortrait = isVertical;

	return {
		"orientationChange": orientationChange,
		"isVertical": isVertical,
		"triggerRotate": triggerRotate,
		"handler": handler
	};
});
