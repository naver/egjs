/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

// jscs:disable maximumLineLength
eg.module("persist", ["jQuery", eg, window, document], function($, ns, global, doc) {
	"use strict";

	// jscs:enable maximumLineLength
	var wp = global.performance;
	var history = global.history;
	var agent = ns.agent();

	var isNeeded = (function() {
		var version = parseFloat(agent.os.version);

		return !(
				agent.os.name === "ios" ||
				(agent.os.name === "mac" && agent.browser.name === "safari") ||
				(agent.os.name === "android" &&
					(version <= 4.3 && agent.browser.webview === true || version < 3))
		);
	})();

	var JSON = global.JSON;
	var CONST_PERSIST = "___persist___";
	var GLOBAL_KEY = "KEY" + CONST_PERSIST;
	var $global = $(global);
	var isPersisted = $global.attr(CONST_PERSIST) === true;

	// In case of IE8, TYPE_BACK_FORWARD is undefined.
	var isBackForwardNavigated = (wp && wp.navigation &&
									(wp.navigation.type === (wp.navigation.TYPE_BACK_FORWARD || 2)));
	var isSupportState = "replaceState" in history && "state" in history;

	var storage = (function() {
		if (isStorageAvailable(global.sessionStorage)) {
			return global.sessionStorage;
		} else if (isStorageAvailable(global.localStorage)) {
			return global.localStorage;
		}
	})();

	function isStorageAvailable(storage) {
		if (!storage) {
			return;
		}
		var TMP_KEY = "__tmp__" + CONST_PERSIST;

		try {
			// In case of iOS safari private mode, calling setItem on storage throws error
			storage.setItem(TMP_KEY, CONST_PERSIST);

			// In Chrome incognito mode, can not get saved value
			// In IE8, calling storage.getItem occasionally makes "Permission denied" error
			return storage.getItem(TMP_KEY) === CONST_PERSIST;
		} catch (e) {
			return false;
		}
	}
	if (!isSupportState && !storage) {
		return;
	}

	// jscs:disable maximumLineLength
	/* jshint ignore:start */
	if (!JSON) {
		console.warn(
		"The JSON object is not supported in your browser.\r\n" +
		"For work around use polyfill which can be found at:\r\n" +
		"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON#Polyfill");
		return;
	}
	/* jshint ignore:end */

	// jscs:enable maximumLineLength

	/**
	 * This jQuery custom event is fired when device rotates.
	 *
	 * @ko 기기가 회전할 때 발생하는 jQuery 커스텀 이벤트
	 * @name jQuery#persist
	 * @event
	 * @deprecated since version 1.2.0
	 * @example
	 * $(window).on("persist",function(){
	 *      var state = $.persist("KEY");
	 *		// Restore state
	 * });
	 *
	 */
	function onPageshow(e) {
		isPersisted = isPersisted || (e.originalEvent && e.originalEvent.persisted);
		if (!isPersisted && isBackForwardNavigated) {
			$global.trigger("persist");
		} else {
			reset();
		}
	}

	/*
	 * flush current history state
	 */
	function reset() {
		setState(null);
	}
	/*
	 * Get state value
	 */
	function getState() {
		var state;
		var stateStr = storage ?
			storage.getItem(global.location.href + CONST_PERSIST) : history.state;

		// the storage is clean
		if (stateStr === null) {
			return {};
		}

		// "null" is not a valid
		var isValidStateStr = typeof stateStr === "string" &&
									stateStr.length > 0 && stateStr !== "null";
		var isValidType;

		try {
			state = JSON.parse(stateStr);

			// like '[ ... ]', '1', '1.234', '"123"' is also not valid
			isValidType = !($.type(state) !== "object" || state instanceof Array);

			if (!isValidStateStr || !isValidType) {
				throw new Error();
			}
		} catch (e) {
			warnInvalidStorageValue();
			state = {};
		}

		// Note2 (Android 4.3) return value is null
		return state;
	}

	function warnInvalidStorageValue() {
		/* jshint ignore:start */
		console.warn("window.history or session/localStorage has no valid " +
				"format data to be handled in persist.");
		/* jshint ignore:end */
	}

	function getStateByKey(key) {
		var result = getState()[key];

		// some device returns "null" or undefined
		if (result === "null" || typeof result === "undefined") {
			result = null;
		}
		return result;
	}
	/*
	 * Set state value
	 */
	function setState(state) {
		if (storage) {
			if (state) {
				storage.setItem(
					global.location.href + CONST_PERSIST, JSON.stringify(state));
			} else {
				storage.removeItem(global.location.href  + CONST_PERSIST);
			}
		} else {
			try {
				history.replaceState(
					state === null ? null : JSON.stringify(state),
					doc.title,
					global.location.href
				);
			} catch (e) {
				/* jshint ignore:start */
				console.warn(e.message);
				/* jshint ignore:end */
			}
		}

		state ? $global.attr(CONST_PERSIST, true) : $global.attr(CONST_PERSIST, null);
	}

	function setStateByKey(key, data) {
		var beforeData = getState();
		beforeData[key] = data;
		setState(beforeData);
	}
	/**
	* Get or store the current state of the web page using JSON.
	* @ko 웹 페이지의 현재 상태를 JSON 형식으로 저장하거나 읽는다.
	* @method jQuery.persist
    * @param {String} key The key of the state information to be stored <ko>저장할 상태 정보의 키</ko>
    * @param {Object} [state] The value to be stored in a given key <ko>키에 저장할 값</ko>
	* @example
	// when 'key' and 'value' are given, it saves state object
	$.persist("KEY",state);
	// when only 'key' is given, it loads state object
	var state = $.persist("KEY");
	* @example
	// this is deprecated API
	// save state without Key
	$.persist(state);
	// get state without Key
	var state = $.persist();
	*/
	$.persist = function(state, data) {
		var key;

		if (typeof state === "string") {
			key = state;
		} else {
			key = GLOBAL_KEY;
			data = arguments.length === 1 ? state : null;
		}

		if (data || arguments.length === 2) {
			setStateByKey(key, data);
		}

		return getStateByKey(key);
	};

	/**
	* Return whether you need "Persist" module by checking the bfCache support of the current browser
	* @ko 현재 브라우저의 bfCache 지원여부에 따라 persist 모듈의 필요여부를 반환한다.
	* @group jQuery Extension
	* @namespace
	* @property {function} isNeeded
	* @example
	$.persist.isNeeded();
	*/
	$.persist.isNeeded = function() {
		return isNeeded;
	};

	// in case of reload
	!isBackForwardNavigated && reset();

	$.event.special.persist = {
		setup: function() {
			$global.on("pageshow", onPageshow);
		},
		teardown: function() {
			$global.off("pageshow", onPageshow);
		},
		trigger: function(e) {
			//If you use 'persist' event, you can get global-key only!
			e.state = getStateByKey(GLOBAL_KEY);
		}
	};
	return {
		"isBackForwardNavigated": isBackForwardNavigated,
		"onPageshow": onPageshow,
		"reset": reset,
		"getState": getState,
		"setState": setState,
		"GLOBALKEY": GLOBAL_KEY
	};
});