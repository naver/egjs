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
	var wp = global.performance,
	history = global.history,
	location = global.location,
	JSON = global.JSON,
	CONST_PERSIST = "___persist___",
	$global = $(global),
	isPersisted = $global.attr(CONST_PERSIST) === true,
	// In case of IE8, TYPE_BACK_FORWARD is undefined.
	isBackForwardNavigated = (wp && wp.navigation && (wp.navigation.type === (wp.navigation.TYPE_BACK_FORWARD || 2) )),
	isSupportState = "replaceState" in history && "state" in history,
	storage = (function() {
		if(!isSupportState) {
			if("sessionStorage" in global) {
				var tmpKey = "__tmp__" + CONST_PERSIST;
				sessionStorage.setItem(tmpKey, CONST_PERSIST);
				return sessionStorage.getItem(tmpKey) === CONST_PERSIST ? sessionStorage :  localStorage;
			} else {
				return localStorage;
			}
		}
	})();

	function onPageshow(e) {
		isPersisted = isPersisted || ( e.originalEvent && e.originalEvent.persisted );
		if(!isPersisted && isBackForwardNavigated) {
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

	function clone(state) {
		return (state === null) ? null : $.extend(true, {}, state);
	}

	/*
	 * Getter for state
	 */	
	function getState() {
		if(isSupportState) {
			return clone(history.state);
		} else {
			var stateStr = storage.getItem(location.href + CONST_PERSIST);
			// Note2 (4.3) return value is null
			return (stateStr && stateStr.length > 0) ? JSON.parse(stateStr) : null;
		}		
	}
	
	/*
	 * Setter for state
	 */
	function setState(state) {
		if(isSupportState) {
			history.replaceState(state, doc.title, location.href);
		} else {
			if(state) {
				storage.setItem(location.href + CONST_PERSIST, JSON.stringify(state));
			} else {
				storage.removeItem(location.href  + CONST_PERSIST);
			}
		}	
		state ? $global.attr(CONST_PERSIST, true) : $global.attr(CONST_PERSIST, null);
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
	$.persist = function(state) {
		if(state) {
			setState(state);
		}			
		return getState();
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
			e.state = clone(history.state);
		}
	};
	
	return {
		"isBackForwardNavigated": isBackForwardNavigated,
		"onPageshow": onPageshow,
		"reset": reset,
		"clone": clone,
		"getState": getState,
		"setState": setState,
		"persist": $.persist
	};
});