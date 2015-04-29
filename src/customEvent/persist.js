// debug
function __persist($, global){
    "use strict";
// debug

	var history = global.history;
	var location = global.location;

	$(global).on("pageshow", _onPageshow);

	function _onPageshow(e) {
		if (_isPersisted(e.originalEvent)) {
			_reset(); // 이거 꼭 해야되남여 
		} else {
			if (_isBackForwardNavigated()) {
				history.state && $(global).trigger("persist", _clone(history.state));
			} else {
				_reset();
			}
		}
	}

	function _isPersisted(e) {
		return !!e.persisted;
	}
	
	var _hasReplaceState = function() {
		var result = ("replaceState" in history) ? true : false;
		_hasReplaceState = function(){
			return result;
		};
		return result;		
	};
	
	function _isBackForwardNavigated() {
		var wp = global.performance;
		return !(wp && wp.navigation && (wp.navigation.type === wp.navigation.TYPE_NAVIGATE || wp.navigation.type === wp.navigation.TYPE_RELOAD));
	}
	
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