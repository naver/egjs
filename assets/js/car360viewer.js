(function() {
	var images = Array.prototype.slice.call(document.querySelectorAll(".car_rotate img"));
	var imagesNum = images.length;
	var ape = 360 / imagesNum; // angle per each
	
	new eg.MovableCoord({
		min: [0, 0],
		max: [720, 0],
		bounce: [0, 0, 0, 0],
		circular: [false, true, false, true],
		deceleration: 0.00034,
	}).on({
		"change": function(e) {
			var index = Math.min(Math.round(e.pos[0] % 360 / ape), imagesNum - 1);
			images.forEach(function(v, i) {
				v.style.display = i === index ? "inline-block" : "none";
			});
		}
	}).bind(".car_rotate");
})();
