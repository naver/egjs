// debug

function __persist($, doc, global) {
	"use strict";
	// debug
	/**
	* Support persist event in jQuery
	* @ko jQuery custom persist 이벤트 지원
	* @name jQuery#persist
	* @event
	* @param {Object} e.state state info to be restored
	* @example
	$(window).on("persist",function(e){
		// restore state
		if(e.state.flickingPage)
			oSlideFlicking.moveTo(e.state.flickingPage);
		
		if(e.state.scrollTop)
			document.scrollTo(e.state.scrollTop);
	});
	*/
	var history = global.history;
	var location = global.location;
	var hasReplaceState = "replaceState" in history;

	function onPageshow(e) {
		if (isPersisted(e.originalEvent)) {
			reset();
		} else {
			if (isBackForwardNavigated() && history.state) {
				$(global).trigger("persist");
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
		hasReplaceState && history.replaceState(null, doc.title, location.href);
	}

	function clone(state) {
		return (state === null) ? null : $.extend(true, {}, state);
	}
	/**
	* Saves state and returns current state.
	* @ko 인자로 넘긴 현재 상태정보를 저장하고, 저장되어있는 현재 상태 객체를 반환한다.
	* @method jQuery.persist
    * @param {Object} state state info to be restored
	* @return {Object} state info to be restored
	* @example
	$("a").on("click",function(e){
		e.preventdefault()	
		// get state
		var state = $.persist();
		
		// update state
		state.scrollTop = document.scrollTop;
		
		// save state
		$.persist(state);
		
		location.href = this.attr("href");
	});
	*/
	$.persist = function(state) {
		if (hasReplaceState && state) {
			history.replaceState(state, doc.title, location.href);
		}
		return clone(history.state);
	};
	$.event.special.persist = {
		setup: function() {
			$(global).on("pageshow", onPageshow);
		},
		teardown: function() {
			$(global).off("pageshow", onPageshow);
		},
		trigger: function(e) {
			e.state = clone(history.state);
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
	__persist(jQuery, document, window);
}
// debug