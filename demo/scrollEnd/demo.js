$(document).ready(function() {

	function desc(str) {
		$(".desc").text(str);
	}

	function enableScrollEnd() {
		var count = 0;
		$(window).on("scrollend", function(e, a){
			count++;
			alert("top : " + a.top + "\nleft : " + a.left + " \ncount : " + count);
		});
	}

	function disableScrollEnd() {
		$(window).off("scrollend");
	}

	$(".btn_attach").on("click", function(e) {
		e.preventDefault();
		enableScrollEnd();
		desc("'scrollEnd' event attached. Scroll it!.");
	});

	$(".btn_detach").on("click", function(e) {
		e.preventDefault();
		disableScrollEnd();
		desc("'scrollEnd' event detached.");
	});
});