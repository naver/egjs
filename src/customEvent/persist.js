// debug
function __persist($, global){
    "use strict";
// debug

    /**
     * @namespace jQuery.extention
     */
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


    /*
     * When pageshow event fires, triggers persist event depends on condition.
     */
	$(global).on("pageshow", _onPageshow);

	function _onPageshow(e) {
		if (_isPersisted(e.originalEvent)) {
			_reset(); // 이거 꼭 해야되남여 
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
     * If browser supports history.replaceState, returns true else returns false.
     */	
	var _hasReplaceState = function() {
		var result = ("replaceState" in history) ? true : false;
		_hasReplaceState = function(){
			return result;
		};
		return result;		
	};

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
		_hasReplaceState() && history.replaceState(null, document.title, location.href);
	}
	
	function _clone(obj) {
		if (null === obj || "object" !== typeof obj) {
			return obj;
		}
		var copy = obj.constructor();
		for (var attr in obj) {
			obj.hasOwnProperty(attr) && (copy[attr] = obj[attr]);
		}
		return copy;
	}

	function persist(state) {
		if (_hasReplaceState() && state) {
			history.replaceState(state, document.title, location.href);
		}
		return _clone(history.state);
	}
	
	$.persist = persist;

// debug
    return {
	    "_isPersisted" : _isPersisted,
	    "_isBackForwardNavigated" : _isBackForwardNavigated,
        "_onPageshow" : _onPageshow,
        "_reset" : _reset,
        "_clone" : _clone,
        "persist" : persist
    };
}

if(!eg.debug){
    __persist(jQuery, window);
}
// debug