eg.module("persist", ["jQuery", window, document], function($, global, doc) {
	/**
	* Support persist event in jQuery
	* @ko jQuery custom persist 이벤트 지원
	* @name jQuery#persist
	* @event
	* @param {Event} e event <ko>이벤트 객체</ko>
	* @param {Object} e.state state info to be restored <ko>복원되어야 하는 상태의 정보</ko>
	*
	* @support {"ie": "9+", "ch" : "latest", "ff" : "1.5+",  "sf" : "latest", "ios" : "7+", "an" : "2.2+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	*
	* @example
	$(window).on("persist",function(e){
		// restore state
		if(e.state.flickingPage)
			oSlideFlicking.moveTo(e.state.flickingPage);
		if(e.state.scrollTop)
			document.scrollTo(e.state.scrollTop);
	});
	*/
	var wp = global.performance;
	var history = global.history;
	var location = global.location;
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
				return localStorage;
			}
		}
	})();

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
	 * Getter for state
	 */
	function getState() {
		if (isSupportState) {
			return JSON.parse(history.state) || {};
		} else {
			var stateStr = storage.getItem(location.href + CONST_PERSIST);

			// Note2 (4.3) return value is null
			return (stateStr && stateStr.length > 0) ? JSON.parse(stateStr) : {};
		}
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
	 * Setter for state
	 */
	function setState(state) {
		if (isSupportState) {
			history.replaceState(JSON.stringify(state), doc.title, location.href);
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
	* Saves state and returns current state.
	* @ko 인자로 넘긴 현재 상태정보를 저장한다.
	* @method jQuery.persist
    * @param {Object} state State object to be stored in order to restore UI component's state <ko>UI 컴포넌트의 상태를 복원하기위해 저장하려는 상태 객체</ko>
	* @example
	$("a").on("click",function(e){
		e.preventdefault();
		// save state
		$.persist(state);
	});
	*/
	/**
	* Saves state and returns current state.
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
	* Saves state and returns current state.
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
	* Saves state and returns current state.
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
		"GLOBALKEY": GLOBAL_KEY
	};
});