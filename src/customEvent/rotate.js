// jscs:disable maximumLineLength
eg.module("rotate", ["jQuery", eg, window, document], function($, ns, global, doc) {
	// jscs:enable maximumLineLength
	/**
	 * @namespace jQuery
	 * @group jQuery Extension
	 */
	/**
	 * Support rotate event in jQuery
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

	/*
	 * This orientationChange method is return event name for bind orientationChange event.
	 */
	var orientationChange = function() {
		var type;
		/**
		 * Android Bug
		 * Android 2.4 has orientationchange but It use change width, height. so Delay 500ms use setTimeout.
		 *  : If android 2.3 made samsung bind resize on window then change rotate then below version browser.
		 * Twice fire orientationchange in android 2.2. (First time change widht, height, second good.)
		 * Below version use resize.
		 *
		 * In app bug
		 * If fire orientationChange in app then change width, height. so delay 200ms using setTimeout.
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
	/*
	* If viewport is vertical return true else return false.
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

	/*
	* Trigger that rotate event on an element.
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

	/*
	* Trigger event handler.
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

					// When fire orientationchange if width not change then again call handler after 300ms.
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

	return {
		"orientationChange": orientationChange,
		"isVertical": isVertical,
		"triggerRotate": triggerRotate,
		"handler": handler
	};
});
