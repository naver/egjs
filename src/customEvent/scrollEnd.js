(function($, ns, global, doc){
    "use strict";
    /**
     * Support scrollEnd event in jQuery
     * @ko jQuery custom scrollEnd 이벤트 지원
     * @name jQuery.extention#scrollEnd
     * @event
     * @param {Number} e.top top position
     * @param {Number} e.left left position
     * @example
     * $(window).on("scrollend",function(e){
     *      e.top;
     *      e.left;
     * });
     *
     */

    var isTouched, isMoved, preTop = 0, preLeft = 0, observerInterval, scrollEndTimer, rotateFlag = false,
    CHROME = 3,
    TIMERBASE = 2,
    TOUCHBASE = 1,
    SCROLLBASE = 0,
    deviceType = getDeviceType();

    $.event.special.scrollend = {
        setup: function() {
            attachEvent();
        },
        teardown: function() {
            removeEvent();
        }
    };


    function getDeviceType(){
        var retValue = SCROLLBASE;
        var osInfo = ns.agent.os;
        var browserInfo = ns.agent.browser;

        if(osInfo.name === "android"){
            if(browserInfo.name === "chrome") {
                retValue = CHROME;
            } else {
                if(parseInt(osInfo.version, 10) >= 3) {
                    retValue = TIMERBASE;
                } else {
                    retValue = TOUCHBASE;
                }
            }
        }else if((osInfo.name === "window" || osInfo.name === "ios") && parseInt(osInfo.version ,10) >= 8){
                 retValue = TIMERBASE;
        }

        return retValue;
    }

    function attachEvent(){

        $(global).on("scroll" , scroll);
        if(deviceType === TOUCHBASE){
            $(doc).on({
                "touchstart" : touchStart,
                "touchmove" : touchMove,
                "touchend" : touchEnd
            });
        }

        if(deviceType === CHROME) {
            $(global).on("orientationchange" , function(){
                rotateFlag = true;
            });
        }
    }

    function touchStart(){
        isTouched = true;
        isMoved = false;
        preTop = preLeft = 0;
    }

    function touchMove(){
        isMoved = true;
    }

    function touchEnd(){
        isTouched = false;
        if(isMoved) {
            startObserver();
        }
    }

    function scroll(){
        switch(deviceType) {
            case SCROLLBASE :
                triggerScrollEnd();
                break;
            case TOUCHBASE :
                startObserver();
                break;
            case TIMERBASE :
                triggerScrollEndAlways();
                break;
            case CHROME :
                if(rotateFlag){
                    rotateFlag = false;
                }else{
                    triggerScrollEnd();
                }
                break;
        }
    }

    function startObserver(){
        stopObserver();
        observerInterval = setInterval(observe,100);

    }

    function stopObserver(){
        clearInterval(observerInterval);
        observerInterval = 0;
    }

    function observe(){
        if(isTouched || (preTop !== global.pageYOffset || preLeft !== global.pageXOffset) ) {
            preTop = global.pageYOffset;
            preLeft = global.pageXOffset;
        } else {
            stopObserver();
            triggerScrollEnd();
        }

    }

    function triggerScrollEnd(){
        var offsetY = global.pageYOffset, offsetX = global.pageXOffset;

        if(preTop !== offsetY || preLeft !== offsetX){
            $(global).trigger("scrollend" , {
                top : offsetY,
                left : offsetX
            });
            preTop = offsetY;
            preLeft = offsetX;
        }
    }

    function triggerScrollEndAlways() {
        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(function() {
            triggerScrollEnd();
        },500);
    }

    function removeEvent(){
        $(doc).off({
            "touchstart" : touchStart,
            "touchmove" : touchMove,
            "touchend" : touchEnd
        });
        $(global).off("scroll" , scroll);
    }
})(jQuery, eg, window, document);