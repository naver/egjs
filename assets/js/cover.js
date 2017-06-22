var listEl = document.getElementById("lists");
new eg.MovableCoord({
	min : [0, 0],
	max : [1200, 100],
	bounce : [0, 100, 0, 100]
}).on({
	"change" : function(evt) {
		var pos = evt.pos;
		var base = pos[0] / 300;
		var idx = Math.ceil(base);
		var list = listEl.querySelectorAll("li");
		var len = list.length;

		if (idx >= len) {
			listEl.style[TRANSFORM] = "translate3d(" + (pos[0] - this.options.max[0]) + "px,0,0)";
		} else {
			listEl.style[TRANSFORM] = "translate3d(0,0,0)";
		}

		if (list[idx-1]) { 
			list[idx-1].style[TRANSFORM] = "translate3d(0,0,0)"; 
		}
		if (list[idx]) { 
			list[idx].style[TRANSFORM] = "translate3d(" + ((base-idx)*300) + "px,0,0)";
		}
		if (list[idx+1]) { 
			list[idx+1].style[TRANSFORM] = "translate3d(-300px, 0, 0)";
		}
	},
	"release" : function(evt) {
		var pos = evt.destPos;
		pos[0] = Math.round(pos[0] / 300) * 300;
	}
}).bind("#coverarea", {
	scale : [1, 0.2],
	direction : eg.MovableCoord.DIRECTION_ALL
}).setTo(1200, 100, 0);

var TRANSFORM = (function() {
    var bodyStyle = (document.head || document.getElementsByTagName("head")[0]).style;
    var target = [ "transform", "webkitTransform", "msTransform", "mozTransform" ];
    for(var i=0, len=target.length; i<len; i++) {
        if(target[i] in bodyStyle) {
            return target[i];
        }
    }
    return "";
})();
