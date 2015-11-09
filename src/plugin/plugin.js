eg.module("plugin", ["jQuery", eg, window], function($, ns, global) {

	function capitalizeFirstLetter(str) {
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}

	ns.plugin = function(name, events) {
		$.fn[ name ] = function( options ) {
			this.data("eg-"+name) = new ns[capitalizeFirstLetter]( options||{} );
		}
	}
});