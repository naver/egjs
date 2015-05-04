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
	var _hasReplaceState = ("replaceState" in history) ? true : false;


	function _onPageshow(e) {
		if (_isPersisted(e.originalEvent)) {
			_reset();
		} else {
			if (_isBackForwardNavigated() && history.state) {
				$(global).trigger("persist", _clone(history.state));
			} else {
				_reset();
			}
		}
	}
	
	/*
	 * If page is persisted(bfCache hit) return true else return false.
	 */
	function _isPersisted(e) {
		return !!e.persisted;
	}
	
	/*
	 * If current page navigated by browser back or forward button, returns true else returns false.
	 */
	function _isBackForwardNavigated() {
		var wp = global.performance;
		return !(wp && wp.navigation && (wp.navigation.type === wp.navigation.TYPE_NAVIGATE || wp.navigation.type === wp.navigation.TYPE_RELOAD));
	}
	
	/*
	 * flush current history state
	 */
	function _reset() {
		_hasReplaceState && history.replaceState(null, document.title, location.href);
	}
	
	function _clone(state) {
		return (state === null) ? null : $.extend(true, {}, state);
	}
	
	/*
	 * $.persist method saves state at history.state by history replaceState and returns current state.
	 */
	$.persist = function(state) {
		if (_hasReplaceState && state) {
			history.replaceState(state, document.title, location.href);
		}
		return _clone(history.state);
	};
	
	$.event.special.persist = {
		setup: function() {
			$(global).on("pageshow", _onPageshow);
		},
		teardown: function() {
			$(global).off("pageshow", _onPageshow);
		}
	};
		
	// debug
	return {
		"_isPersisted": _isPersisted,
		"_isBackForwardNavigated": _isBackForwardNavigated,
		"_onPageshow": _onPageshow,
		"_reset": _reset,
		"_clone": _clone,
		"persist": $.persist
	};
}
if (!eg.debug) {
	__persist(jQuery, window);
}
// debug