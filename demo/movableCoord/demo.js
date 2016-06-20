var $box = $("#box"),
	inst = new eg.MovableCoord({
		min : [ 0, 0 ],
		max : [ 360, 360 ],
		circular : true,
		deceleration : 0.0024
	}).on({
		"change" : function(evt) {
			var pos = evt.pos;
			$box.css("transform", "rotateY(" + pos[0] + "deg) rotateX(" + pos[1] + "deg)");
		}
	});

inst.bind(document.body, {
	direction : eg.DIRECTION_ALL,
	maximumSpeed : 50
});