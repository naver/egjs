/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

// jscs:disable maximumLineLength
eg.module("scrollEnd", ["jQuery", eg, window], function($, ns, global) {
	"use strict";

	// jscs:eable maximumLineLength
	/**
	* Add scrollEnd event support in jQuery
	* @ko jQuery custom scrollEnd 이벤트 지원
	* @name jQuery#scrollEnd
	* @event
	* @param {Number} e.top top position <ko>상단(top) 위치 값</ko>
	* @param {Number} e.left left position <ko>왼쪽(left) 위치 값</ko>
	* @support {"ie": "9+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"}
	* @example
	* $(window).on("scrollend",function(e){
	*      e.top;
	*      e.left;
	* });
	*
	*/

	var scrollEndTimer;
	var rotateFlag = false;

	var CHROME = 3;
	var TIMERBASE = 2;
	var TOUCHBASE = 1;
	var SCROLLBASE = 0;

	var latency = 250;

	var deviceType = getDeviceType();

	$.event.special.scrollend = {
		setup: function() {
			attachEvent();
		},
		teardown: function() {
			removeEvent();
		}
	};

	/**
	 * iOS & Safari:
	 * 		iOS7 and lower, scroll event occurs once when the scroll is stopped
	 * 		iOS8 and upper, scroll event occurs on every scroll
	 * 		Scroll event occurs when the rotation
	 * Android:
	 *		Scroll event occurs on every scroll
	 *		Scroll event occurs on rotation and should be ignored to handle
	 * @ko
	 * iOS & Safari :
	 *		iOS 7.x 이하에서는 스크롤이 멈췄을때 scroll 이벤트 한번 발생
	 *      iOS 8.x 이상에서는 scroll 이벤트가 android 와 동일하게 스크롤시 매번 발생
	 *		회전시 scroll 이벤트가 발생되어 이를 무시처리해야함
	 *		(orientationchange 에 의해 발생하는 scroll 이벤트 1회만 무시)
	 * Android :
	 *		스크롤시 scroll 이벤트 매번 발생
	 *		회전시 scroll 이벤트가 발생되어 이를 무시 처리해야 함
	 */
	function getDeviceType() {
		var retValue = TIMERBASE;
		var agent = ns.agent();
		var osInfo = agent.os;
		var osVersion = parseInt(osInfo.version, 10);
		var browserInfo = agent.browser;

		// Browsers that trigger scroll event like scrollstop : SCROLLBASE
		if (osInfo.name === "ios") {
			if (browserInfo.webview === true || osVersion <= 7) {
				retValue = SCROLLBASE;
			}
		} else if (osInfo.name === "android") {
			if (browserInfo.name === "default" && osVersion <= 2.3) {
				retValue = SCROLLBASE;
			}
		}
		return retValue;
	}

	function attachEvent() {
		$(global).on("scroll", scroll);
		$(global).on("orientationchange", onOrientationchange);
	}

	function onOrientationchange() {
		rotateFlag = true;
	}

	function scroll() {
		if (rotateFlag) {
			rotateFlag = false;
			return;
		}

		switch (deviceType) {
			case SCROLLBASE :
				triggerScrollEnd();
				break;
			case TIMERBASE :
				triggerScrollEndAlways();
				break;
		}

	}

	function triggerScrollEnd() {
		$(global).trigger("scrollend", {
			top: global.pageYOffset,
			left: global.pageXOffset
		});
	}

	function triggerScrollEndAlways() {
		clearTimeout(scrollEndTimer);
		scrollEndTimer = setTimeout(function() {
			if (rotateFlag) {
				rotateFlag = false;
				return;
			}
			triggerScrollEnd();
		}, latency);
	}

	function removeEvent() {
		$(global).off("scroll", scroll);
		$(global).off("orientationchange", onOrientationchange);
	}

	return {
		getDeviceType: getDeviceType,
		CHROME: CHROME,
		TIMERBASE: TIMERBASE,
		TOUCHBASE: TOUCHBASE,
		SCROLLBASE: SCROLLBASE
	};
});