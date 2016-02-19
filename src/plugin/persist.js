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
	var location = global.location;
	var userAgent = global.navigator.userAgent;
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
		if (!isSupportState) {
			if ("sessionStorage" in global) {
				var tmpKey = "__tmp__" + CONST_PERSIST;
				sessionStorage.setItem(tmpKey, CONST_PERSIST);
				return sessionStorage.getItem(tmpKey) === CONST_PERSIST ?
						sessionStorage :
						localStorage;
			} else {
				return global.localStorage;
			}
		}
	})();

	// jscs:disable maximumLineLength
	/* jshint ignore:start */
	if (!isSupportState && !storage ||
		(!JSON && !console.warn(
			"The JSON object is not supported in your browser.\r\n" +
			"For work around use polyfill which can be found at:\r\n" +
			"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON#Polyfill")
		)) {
		return;
	}
	/* jshint ignore:end */

	// jscs:enable maximumLineLength
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
		var stateStr;
		var state = {};
		var isValidStateStr = false;

		if (isSupportState) {
			stateStr = history.state;

			// "null" is not a valid
			isValidStateStr = typeof stateStr === "string" && stateStr !== "null";
		} else {
			stateStr = storage.getItem(location.href + CONST_PERSIST);
			isValidStateStr = stateStr && stateStr.length > 0;
		}

		if (isValidStateStr) {
			try {
				state = JSON.parse(stateStr);

				// like '[ ... ]', '1', '1.234', '"123"' is also not valid
				if (jQuery.type(state) !== "object" || state instanceof Array) {
					throw new Error();
				}
			} catch (e) {
				/* jshint ignore:start */
				console.warn("window.history or session/localStorage has no valid " +
						"format data to be handled in persist.");
				/* jshint ignore:end */
			}
		}

		// Note2 (Android 4.3) return value is null
		return state;
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
		if (isSupportState) {
			try {
				history.replaceState(
					state === null ? null : JSON.stringify(state),
					doc.title,
					location.href
				);
			} catch (e) {
				/* jshint ignore:start */
				console.warn(e.message);
				/* jshint ignore:end */
			}
		} else {
			if (state) {
				storage.setItem(location.href + CONST_PERSIST, JSON.stringify(state));
			} else {
				storage.removeItem(location.href  + CONST_PERSIST);
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
	* Save current state
	* @ko 인자로 넘긴 현재 상태정보를 저장한다.
	* @method jQuery.persist
	* @support {"ie": "9+", "ch" : "latest", "ff" : "1.5+",  "sf" : "latest", "ios" : "7+", "an" : "2.2+ (except 3.x)"}
	* @param {Object} state State object to be stored in order to restore UI component's state <ko>UI 컴포넌트의 상태를 복원하기위해 저장하려는 상태 객체</ko>
	* @example
	$("a").on("click",function(e){
		e.preventdefault();
		// save state
		$.persist(state);
	});
	*/
	/**
	* Return current state
	* @ko 인자로 넘긴 현재 상태정보를 반환한다.
	* @method jQuery.persist
	* @return {Object} state Stored state object <ko>복원을 위해 저장되어있는 상태 객체</ko>
	* @example
	$("a").on("click",function(e){
		e.preventdefault();
		// get state
		var state = $.persist();
	});
	*/
	/**
	* Save current state
	* @ko 인자로 넘긴 현재 상태정보를 저장한다.
	* @method jQuery.persist
    * @param {String} key State key to be stored in order to restore UI component's state <ko>UI 컴포넌트의 상태를 복원하기위해 저장하려는 상태 객체의 키</ko>
    * @param {String} state State object to be stored in order to restore UI component's state <ko>UI 컴포넌트의 상태를 복원하기위해 저장하려는 상태 객체</ko>
	* @return {Object} state Stored state object <ko>복원을 위해 저장되어있는 상태 객체</ko>
	* @example
	$("a").on("click",function(e){
		e.preventdefault();
		// save state
		$.persist("KEY",state);
	});
	*/
	/**
	* Return current state
	* @ko 인자로 넘긴 현재 상태정보를 반환한다.
	* @method jQuery.persist
	* @param {String} key State key to be stored in order to restore UI component's state <ko>UI 컴포넌트의 상태를 복원하기위해 저장하려는 상태 객체의 키</ko>
	* @return {Object} state Stored state object <ko>복원을 위해 저장되어있는 상태 객체</ko>
	* @example
	$("a").on("click",function(e){
		e.preventdefault();
		// get state
		var state = $.persist("KEY");
	});
	*/
	$.persist = function(state) {
		var key;
		var data;
		if (typeof state === "string") {
			key = state;
			data = arguments.length === 2 ? arguments[1] : null;
		} else {
			key = GLOBAL_KEY;
			data = arguments.length === 1 ? state : null;
		}
		data && setStateByKey(key, data);
		return getStateByKey(key);
	};

	/**
	* Return persist needs by checking bfCache support
	* @ko Persist 동작 필요여부를 반환한다.
	* @method $.persist.isApplicable
	* @example
	$.persist.isApplicable();
	*/
	$.persist.isNeeded = function() {
		var agentOs = ns.agent(userAgent).os;
		var isNeeded = true;
		if (agentOs.name === "ios" ||
				(agentOs.name === "android" && parseFloat(agentOs.version) < 4.4)) {
			isNeeded = false;
		}
		$.persist.isNeeded = function() {
			return isNeeded;
		};
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
		"persist": $.persist,
		"isNeeded": $.persist.isNeeded,
		"GLOBALKEY": GLOBAL_KEY
	};
});