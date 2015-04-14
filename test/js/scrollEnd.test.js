var bFireEvent = false;
module("scrollEnd Test", {
	setup : function() {
        $(window).on("scrollend", function(){
            bFireEvent = true;
        });
	},
	teardown : function() {
	    $(window).off("scrollend");
//	    window.scrollTo(0, 1);
        bFireEvent = false;
	}
});

test("widnow scroll", function() {
	// Given
	// When
	    $(window).trigger("touchstart");
	    $(window).trigger("touchmove");
//	    $(window).trigger("touchend");
	    window.scrollTo(0, 20);
	// Then
	stop();
	setTimeout(function(){
	    strictEqual(bFireEvent , true, "scrollend event occurred");
//	    window.scrollTo(0, 1);

	    start();
	}, 300);
});

test("tab", function() {
	// Given
    bFireEvent = false;
	// When
	    $(window).trigger("touchstart");
	    $(window).trigger("touchend");
	// Then
	stop();
	setTimeout(function(){
	    strictEqual(bFireEvent , false, "scrollend event does not occur");
	    start();
	}, 300);
});

