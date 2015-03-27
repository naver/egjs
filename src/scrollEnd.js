"use strict";
(function($){

    var _isTouchEnded, _isMoved, _nPreTop, _nPreLeft, _nObserver, _$;

    $.event.special.scrollend = {
        setup: function() {
            _attachEvent();
            _$ = this;

            return false;
        },
        teardown: function() {
            _removeEvent();
            return false;
        }
    };

    function _attachEvent(){
        $(window).on("touchstart" , _touchStart);
        $(window).on("touchmove" , _touchMove);
        $(window).on("touchend" , _touchEnd);
        $(window).on("scroll" , _scroll);
        $(window).on("touchcancel" , _touchEnd);
    }

    function _touchStart(){
        _isTouchEnded = false;
        _isMoved = false;

        _nPreTop = null;
        _nPreLeft = null;
    }

    function _touchMove(){
        _isMoved = true;
    }

    function _touchEnd(){
        _isTouchEnded = true;
    }

    function _scroll(){
        _startObserver();
    }

    function _startObserver(){
        _stopObserver();
        _runInterval();

    }

    function _runInterval(){
    console.trace();
        _nObserver = setInterval(function() {
            _observe();
        },100);
    }

    function _stopObserver(){
        clearInterval(_nObserver);
        _nObserver = 0;
    }

    function _observe(){
        if(!_isTouchEnded && !_isMoved && (_nPreTop !== window.pageYOffset || _nPreLeft !== window.pageXOffset) ) {
            _nPreTop = window.pageYOffset;
            _nPreLeft = window.pageXOffset;
        } else {
            _stopObserver();
            _fireEventScrollEnd();
            _isMoved = false;
        }

    }

    function _fireEventScrollEnd(){
        $(_$).trigger("scrollend" , {
            nTop : window.pageYOffset,
            nLeft : window.pageXOffset
        });
    }

    function _removeEvent(){
        $(window).off("touchstart" , _touchStart);
        $(window).off("touchmove" , _touchMove);
        $(window).off("touchend" , _touchEnd);
        $(window).off("scroll" , _scroll);
        $(window).off("touchcancel" , _touchEnd);
    }
})(jQuery);