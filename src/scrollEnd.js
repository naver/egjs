(function($, ns){
    "use strict";

    var isTouched, isMoved, preTop = 0, preLeft = 0, observerInterval, scrollEndTimer, rotateFlag = false, deviceType = getDeviceType();

    $.event.special.scrollend = {
        setup: function() {
            attachEvent();
        },
        teardown: function() {
            removeEvent();
        }
    };


    function getDeviceType(){
        var retValue = 0;
        var osInfo = ns.agent.os;
        var browserInfo = ns.agent.browser;

        if(osInfo.name === "android"){
            if(browserInfo.name !== "sbrowser" && browserInfo.name === "chrome") {
                retValue = 3;
            } else {
                if(parseInt(osInfo.version, 10) >= 3) {
                    retValue = 2;
                } else {
                    retValue = 1;
                }
            }
        }else if(osInfo.name === "window"){
             if(parseInt(osInfo.version ,10) >= 8) {
                 retValue = 2;
             }
        }else if(osInfo.name === "ios" && parseInt(osInfo.version ,10) >= 8) {
            retValue = 2;
        }

        return retValue;
    }

    function attachEvent(){

        $(window).on("scroll" , scroll);

        if(deviceType === 1){
            $(document).on({
                "touchstart" : touchStart,
                "touchmove" : touchMove,
                "touchend" : touchEnd
            });
        }

        if(deviceType === 3) {
            $(window).on("orientationchange" , function(){
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
            case 0 :
                triggerScrollEnd();
                break;
            case 1 : startObserver(); break;
            case 2 : triggerScrollEndAlways();
                  break;
            case 3 :
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
        if(isTouched || (preTop !== window.pageYOffset || preLeft !== window.pageXOffset) ) {
            preTop = window.pageYOffset;
            preLeft = window.pageXOffset;
        } else {
            stopObserver();
            triggerScrollEnd();
        }

    }

    function triggerScrollEnd(){
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

    function triggerScrollEndAlways() {
        clearTimeout(scrollEndTimer);
        scrollEndTimer = 0;
        scrollEndTimer = setTimeout(function() {
            triggerScrollEnd();
        },500);
    }

    function removeEvent(){
        $(document).off({
            "touchstart" : touchStart,
            "touchmove" : touchMove,
            "touchend" : touchEnd
        });
        $(window).off("scroll" , scroll);
    }
})(jQuery, eg);