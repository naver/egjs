$(document).ready(function() {
	$(".version").text(eg.VERSION);
	$(".agent").html(JSON.stringify(eg.agent()));
	$(".isHWAccelerable").text(eg.isHWAccelerable());
	$(".isPortrait").text(eg.isHWAccelerable());
	$(".isTransitional").text(eg.isTransitional());
	$(".translate").html(eg.translate('10px', '200%') + "<br>" + eg.translate('10px', '200%', true));
});