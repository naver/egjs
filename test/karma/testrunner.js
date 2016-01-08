(function() {
	var fixture;

	jQuery( "html" ).attr({
		id: "html",

		lang: "en",
		"xml:lang": "en",

		dir: "ltr"
	});

	jQuery( "body" ).attr( "id", "body" );
	// Look for karma template, if found, we are in the karma suite
	if ( window.__html__ ) {
		jQuery( "body" ).append(window.__html__[Object.keys(window.__html__)[0]]);

	// If template has not been found, it must be a QUnit suite
	} else {
		
	}


})();
