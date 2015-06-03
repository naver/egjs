eg.module("persist", [jQuery, window, document], function($, global, doc){
	"use strict";
	/**
	* Support persist event in jQuery
	* @ko jQuery custom persist 이벤트 지원
	* @name jQuery#persist
	* @event
	* @param {Event} e event <ko>이벤트 객체</ko>
	* @param {Object} e.state state info to be restored <ko>복원되어야 하는 상태의 정보</ko>
	* @example
	$(window).on("persist",function(e){
		// restore state
		if(e.state.flickingPage)
			oSlideFlicking.moveTo(e.state.flickingPage);
		
		if(e.state.scrollTop)
			document.scrollTo(e.state.scrollTop);
	});
	*/
	var history = global.history,
	location = global.location,
	hasReplaceState = "replaceState" in history,
	hasStateProperty = "state" in history;
	
	function onPageshow(e) {
		if (isPersisted(e.originalEvent)) {
			reset();
		} else {
			if (isBackForwardNavigated()) {
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
		return (wp && wp.navigation && (wp.navigation.type === wp.navigation.TYPE_BACK_FORWARD));
	}
	/*
	 * flush current history state
	 */

	function reset() {
		history.replaceState(null, doc.title, location.href);
	}

	function clone(state) {
		return (state === null) ? null : $.extend(true, {}, state);
	}
	/**
	* Saves state and returns current state.
	* @ko 인자로 넘긴 현재 상태정보를 저장하고, 저장되어있는 현재 상태 객체를 반환한다.
	* @method jQuery.persist
    * @param {Object} state State object to be stored in order to restore UI component's state <ko>UI 컴포넌트의 상태를 복원하기위해 저장하려는 상태 객체</ko>
	* @return {Object} state Stored state object <ko>복원을 위해 저장되어있는 상태 객체</ko>
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
	if(hasReplaceState && hasStateProperty) {
		$.persist = function(state) {
			if(state) {
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
	} else {
		$.persist = function() {};
	}
	
	return {
		"isPersisted": isPersisted,
		"isBackForwardNavigated": isBackForwardNavigated,
		"onPageshow": onPageshow,
		"reset": reset,
		"clone": clone,
		"persist": $.persist
	};
});