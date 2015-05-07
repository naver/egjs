// debug

function __persist($, global) {
	"use strict";
	// debug
	/**
	 * Support persist event in jQuery
	 * @ko jQuery custom persist 이벤트 지원
	 * @name jQuery.extention#persist
	 * @event
	 * @param {Event} e event
	 * @param {Object} state
	 * @example
	 * $(window).on("persist",function(e, state){
	 *     // restore state
	 * });
	 *
	 */
	var history = global.history;
	var location = global.location;
	var hasReplaceState = ("replaceState" in history) ? true : false;


	function onPageshow(e) {
		if (isPersisted(e.originalEvent)) {
			reset();
		} else {
			if (isBackForwardNavigated() && history.state) {
				$(global).trigger("persist", clone(history.state));
			} else {
				reset();
			}
		}
	}
	
	/*
	 * If page is persisted(bfCache hit) return true else return false.
	 */
	function isPersisted(e) {
		return !!e.persisted;
	}
	
	/*
	 * If current page navigated by browser back or forward button, returns true else returns false.
	 */
	function isBackForwardNavigated() {
		var wp = global.performance;
		return !(wp && wp.navigation && (wp.navigation.type === wp.navigation.TYPE_NAVIGATE || wp.navigation.type === wp.navigation.TYPE_RELOAD));
	}
	
	/*
	 * flush current history state
	 */
	function reset() {
		hasReplaceState && history.replaceState(null, document.title, location.href);
	}
	
	function clone(state) {
		return (state === null) ? null : $.extend(true, {}, state);
	}
	
	/*
	 * $.persist method saves state at history.state by history replaceState and returns current state.
	 */
	$.persist = function(state) {
		if (hasReplaceState && state) {
			history.replaceState(state, document.title, location.href);
		}
		return clone(history.state);
	};
	
	$.event.special.persist = {
		setup: function() {
			$(global).on("pageshow", onPageshow);
		},
		teardown: function() {
			$(global).off("pageshow", onPageshow);
		}
	};
		
	// debug
	return {
		"isPersisted": isPersisted,
		"isBackForwardNavigated": isBackForwardNavigated,
		"onPageshow": onPageshow,
		"reset": reset,
		"clone": clone,
		"persist": $.persist
	};
}
if (!eg.debug) {
	__persist(jQuery, window);
}
// debug