(function($){
    "use strict";

    var isTouchEnded, isMoved, preTop, preLeft, observerInterval;

    $.event.special.scrollend = {
        setup: function() {
            _attachEvent();
            return false;
        },
        teardown: function() {
            _removeEvent();
            return false;
        }
    };

    function _attachEvent(){
        $(document).on({
            "touchstart" : _touchStart,
            "touchmove" : _touchMove,
            "touchend" : _touchEnd,
            "touchcancel" : _touchEnd
        });
        $(window).on("scroll" , _scroll);
    }

    function _touchStart(){
        isTouchEnded = isMoved = false;
        preTop = preLeft = null;
    }

    function _touchMove(){
        isMoved = true;
    }

    function _touchEnd(){
        isTouchEnded = true;
    }

    function _scroll(){
        _startObserver();
    }

    function _startObserver(){
        _stopObserver();
        observerInterval = setInterval(_observe,100);

    }

    function _stopObserver(){
        clearInterval(observerInterval);
        observerInterval = 0;
    }

    function _observe(){
        if(!isTouchEnded && !isMoved && (preTop !== window.pageYOffset || preLeft !== window.pageXOffset) ) {
            preTop = window.pageYOffset;
            preLeft = window.pageXOffset;
        } else {
            _stopObserver();
            _fireEventScrollEnd();
            isMoved = false;
        }

    }

    function _fireEventScrollEnd(){
        $(window).trigger("scrollend" , {
            top : window.pageYOffset,
            left : window.pageXOffset
        });
    }

    function _removeEvent(){
        $(document).off({
            "touchstart" : _touchStart,
            "touchmove" : _touchMove,
            "touchend" : _touchEnd,
            "touchcancel" : _touchEnd
        });
        $(window).off("scroll" , _scroll);
    }
})(jQuery);