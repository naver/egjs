/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

// jscs:disable maximumLineLength
eg.module("scrollEnd", ["jQuery", eg, window], function($, ns, global) {
	"use strict";

	// jscs:eable maximumLineLength
	/**
	* A custom event in jQuery occurs when scroll ends.
	* @ko 스크롤이 끝날 때 발생하는 jQuery 커스텀 이벤트
	* @name jQuery#scrollEnd
	* @event
	* @param {Event} e The Event object in jQuery <ko>jQuery의 Event 객체</ko>
	* @param {Object} info The object of data to be sent when the event is fired<ko>이벤트가 발생할 때 전달되는 데이터 객체</ko>
	* @param {Number} info.top The size of the vertical scroll pane (unit: px)<ko>세로 스크롤 영역의 크기(단위: px)</ko>
	* @param {Number} info.left The size of horizontal scroll pane (unit: px)<ko>가로 스크롤 영역의 크기(단위: px)</ko>
	* @support {"ie": "9+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"}
	* @example
	* $(window).on("scrollend",function(e, info){
	*      info.top;
	*      info.left;
	* });
	*
	*/

	var scrollEndTimer;
	var userAgent = global.navigator.userAgent;
	var rotateFlag = false;

	var CHROME = 3;
	var TIMERBASE = 2;
	var TOUCHBASE = 1;
	var SCROLLBASE = 0;

	var latency = 250;

	var detectType = getDetectType(userAgent);

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
	function getDetectType(userAgent) {
		var deviceName;
		var osVersion;
		var retValue = TIMERBASE;
		var matchedDevice = userAgent.match(/iPhone|iPad|Android/);
		var webviewToken = /NAVER|DAUM|; wv/;
		var webviewToken2 = /Version/;

		// webview : TIMERBASE
		if (matchedDevice !== null && !webviewToken.test(userAgent)) {
			deviceName = matchedDevice[0];

			// Browsers that trigger scroll event like scrollstop : SCROLLBASE
			osVersion = userAgent.match(/\s(\d{1,2})_\d/);

			if (deviceName !== "Android" && webviewToken2.test(userAgent) && osVersion && parseInt(osVersion[1], 10) <= 7) {
				retValue = SCROLLBASE;
			} else if (deviceName === "Android") {
				osVersion = userAgent.match(/Android\b(.*?);/);
				if (!/Chrome/.test(userAgent) && osVersion && parseFloat(osVersion) <= 2.3) {
					retValue = SCROLLBASE;
				}
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

		switch (detectType) {
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
		detectType: detectType,
		getDetectType: getDetectType,
		CHROME: CHROME,
		TIMERBASE: TIMERBASE,
		TOUCHBASE: TOUCHBASE,
		SCROLLBASE: SCROLLBASE
	};
});
