$(document).ready(function() {

	function desc(str) {
		$(".desc").text(str);
	}

	function enableRotate() {
		var count = 0;
		$(window).on("rotate", function(e){
			count++;
			alert("isVertical : " + e.isVertical);
		});
	}

	function disableRotate() {
		$(window).off("rotate");
	}

	$(".btn_attach").on("click", function(e) {
		e.preventDefault();
		enableRotate();
		desc("'rotate' event attached. Rotate it!.");
	});

	$(".btn_detach").on("click", function(e) {
		e.preventDefault();
		disableRotate();
		desc("'rotate' event detached.");
	});
});