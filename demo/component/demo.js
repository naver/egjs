$(document).ready(function() {

	var Some = eg.Class.extend(eg.Component,{
		"foo": function(){
			this.trigger("hi");// fire hi event.
		}
	});
	var some = new Some();


	function desc(str) {
		$(".desc").text(str);
	}
	function desc2(str) {
		$(".desc2").text(str);
	}
	var count = 0;
	function fired(){
		count++;
		desc2(count+" fired hi event");
	}


	$(".btn_trigger").on("click", function(e) {
		e.preventDefault();
		some.foo();
		desc("'hi' event trigger.");
	});

	$(".btn_attach").on("click", function(e) {
		e.preventDefault();
		some.on("hi",fired);
		desc("'hi' event on.");
	});

	$(".btn_detach").on("click", function(e) {
		e.preventDefault();
		some.off("hi",fired);
		desc("'hi' event off.");
	});
});