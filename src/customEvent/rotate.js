// jscs:disable maximumLineLength
eg.module("rotate", ["jQuery", eg, window, document], function($, ns, global, doc) {
	"use strict";

	// jscs:enable maximumLineLength
	/**
	 * @namespace jQuery
	 * @group jQuery Extension
	 */
	/**
	 * Add rotate event support in jQuery
	 *
	 * @ko jQuery custom rotate 이벤트 지원
	 * @name jQuery#rotate
	 * @event
	 * @param {Event} e event
	 * @param {Boolean} e.isVertical vertical <ko>수직여부</ko>
	 * @support { "ios" : "7+", "an" : "2.1+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	 * @example
	 * $(window).on("rotate",function(e){
	 *      e.isVertical;
	 * });
	 *
	 */

	var beforeScreenWidth = -1;
	var beforeVertical = null;
	var rotateTimer = null;
	var agent = ns.agent();
	var isMobile = /android|ios/.test(agent.os.name);

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
		if ((agent.os.name === "android" && agent.os.version === "2.1")) {//|| htInfo.galaxyTab2)
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

			beforeScreenWidth = screenWidth;
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
				$(global).trigger("rotate");
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
			if (agent.os.name === "android") {
				screenWidth = doc.documentElement.clientWidth;
				if (e.type === "orientationchange" && screenWidth === beforeScreenWidth) {
					global.setTimeout(function() {
						handler(e);
					}, 500);

					// When width value wasn't changed after firing orientationchange, then call handler again after 300ms.
					return false;
				}
				beforeScreenWidth = screenWidth;
			}

			global.clearTimeout(rotateTimer);
			rotateTimer = global.setTimeout(function() {
				triggerRotate();
			}, delay);
		}
	}

	$.event.special.rotate = {
		setup: function() {
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
	 * Check if device is in portrait mode
	 * @ko 해당 기기가 portait(수직방향) 모드일 경우, true을 반환한다.
	 * @method eg#isPortrait
	 * @return {Boolean}
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