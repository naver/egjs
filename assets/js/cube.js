var box = document.getElementById("box");
new eg.MovableCoord({
	min: [0, 0],
	max: [360, 360],
	circular: true,
	deceleration: 0.0024
}).on("change", function(e) {
	box.style[TRANSFORM] = "rotateY(" + e.pos[0] + "deg) rotateX(" + e.pos[1] + "deg)";
}).bind("#area", {
	direction: eg.MovableCoord.DIRECTION_ALL,
	maximumSpeed : 50
}).setTo(40, 315, 100);

// util
var TRANSFORM = (function() {
    var bodyStyle = (document.head || document.getElementsByTagName("head")[0]).style;
    var target = [ "transform", "webkitTransform", "msTransform", "mozTransform"];
    for(var i=0, len=target.length; i<len; i++) {
        if(target[i] in bodyStyle) {
            return target[i];
        }
    }
    return "";
})();