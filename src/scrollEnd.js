(function($){
    "use strict";

    var isTouched, isMoved, preTop = 0, preLeft = 0, observerInterval, scrollEndTimer, rotateFlag = false, deviceType = _getDeviceType();

    $.event.special.scrollend = {
        setup: function() {
            _attachEvent();
        },
        teardown: function() {
            _removeEvent();
        }
    };


    function _getDeviceType(){
        var nRet = 0;
        var osInfo = eg.agent.os;
        var browserInfo = eg.agent.browser;

        if(osInfo.name == "android"){
            if(browserInfo.name != "sbrowser" && browserInfo.name == "chrome") {

                nRet = 3;
            } else {
                if(parseInt(osInfo.version, 10) >= 3) {
                    nRet = 2;
                } else {
                    nRet = 1;
                }
            }
        }else if(osInfo.name == "window"){
             if(parseInt(osInfo.version ,10) >= 8) {
                 nRet = 2;
             }
        }else if(osInfo.name == "ios" && parseInt(osInfo.version ,10) >= 8) {
            nRet = 2;
        }

        return nRet;
    }

    function _attachEvent(){

        $(window).on("scroll" , _scroll);

        if(deviceType == 1){
            $(document).on({
                "touchstart" : _touchStart,
                "touchmove" : _touchMove,
                "touchend" : _touchEnd
            });
        }

        if(deviceType == 3) {
            $(window).on("orientationchange" , function(){
                rotateFlag = true;
            });
        }
    }

    function _touchStart(){
        isTouched = true;
        isMoved = false;
        preTop = preLeft = 0;
    }

    function _touchMove(){
        isMoved = true;
    }

    function _touchEnd(){
        isTouched = false;
        if(isMoved) {
            _startObserver();
        }
    }

    function _scroll(){
        switch(deviceType) {
            case 0 :
                _triggerScrollEnd();
                break;
            case 1 : _startObserver(); break;
            case 2 : _triggerScrollEndAlways();
                  break;
            case 3 :
                if(rotateFlag){
                    rotateFlag = false;
                }else{
                    _triggerScrollEnd();
                }
                break;
        }
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
        if(isTouched || (preTop !== window.pageYOffset || preLeft !== window.pageXOffset) ) {
            preTop = window.pageYOffset;
            preLeft = window.pageXOffset;
        } else {
            _stopObserver();
            _triggerScrollEnd();
        }

    }

    function _triggerScrollEnd(){
        var offsetY = window.pageYOffset, offsetX = window.pageXOffset;

        if(preTop !== offsetY || preLeft !== offsetX){
            $(window).trigger("scrollend" , {
                top : offsetY,
                left : offsetX
            });
            preTop = offsetY;
            preLeft = offsetX;
        }
    }

    function _triggerScrollEndAlways() {
        clearTimeout(scrollEndTimer);
        scrollEndTimer = 0;
        scrollEndTimer = setTimeout(function() {
            _triggerScrollEnd();
        },500);
    }

    function _removeEvent(){
        $(document).off({
            "touchstart" : _touchStart,
            "touchmove" : _touchMove,
            "touchend" : _touchEnd
        });
        $(window).off("scroll" , _scroll);
    }
})(jQuery);