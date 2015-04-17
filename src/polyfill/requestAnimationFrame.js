// redefine requestAnimationFrame and cancelAnimationFrame

// @todo change to jindo 'timer.js'
    /**
     * @namespace window
     */
    /**
     * requestAnimationFrame polyfill
     * @ko requestAnimationFrame 폴리필
     * @name window.requestAnimationFrame
     * @method
     * @return {Number} key
     * @see  https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
     *
     */

var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame|| window.msRequestAnimationFrame;
var caf = window.cancelAnimationFrame || window.webkitCancelAnimationFrame|| window.mozCancelAnimationFrame|| window.msCancelAnimationFrame;

if(raf&&!caf){
	var keyInfo = {};
	var oldraf = raf;
	raf = function(callback){
		function wrapCallback(){
			if(keyInfo[key]){
			callback();
			}
		}
		var key = oldraf(wrapCallback);
		keyInfo[key] = true;
		return key;
	};
	caf = function(key){
		delete keyInfo[key];
	};
} else if(!(raf&&caf)){
	raf = function(callback) { return window.setTimeout(callback, 16); };
	caf = window.clearTimeout;
}
window.requestAnimationFrame = raf;
window.cancelAnimationFrame = caf;
