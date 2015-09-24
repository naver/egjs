eg.module("css", ["jQuery", document], function($, doc) {
	/**
	 * Apply css prefix cssHooks
	 * @ko css prefix cssHooks 적용
	 *
	 * @name jQuery#css
	 * @method
	 *
	 * * @support {"ie": "10+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	 * @example
	 * $("#ID").css("transform", "translate('10px', '10px');
	 * $("#ID").css("Transform", "translate('10px', '10px');
	 * $("#ID").css("webkitTransform", "translate('10px', '10px');
	 * $("#ID").css("transform");
	 * $("#ID").css("webkitTransform");
	 */

	if (!$.cssHooks) {
		throw (new Error("jQuery 1.4.3+ is needed for this plugin to work"));
	}

	// run in jQuery 1.8.x below
	if ($.fn && $.fn.jquery && $.fn.jquery.replace(/\./, "") >= "18") {
		return;
	}

	var cssPrefixes = [ "Webkit", "Moz", "O", "ms" ];
	var acts = ["transitionProperty", "transitionDuration", "transition",
				"transform", "transitionTimingFunction"];

	var vendorPrefix = (function() {
		var bodyStyle = (doc.head || doc.getElementsByTagName("head")[0]).style;
		for (var i = 0, len = cssPrefixes.length ; i < len ; i++) {
			if (cssPrefixes[i] + "Transition" in bodyStyle) {
				return cssPrefixes[i];
			}
		}
	})();

	// ie7, 8 - transform and transition not support
	// ie9 - transition not support
	if (!vendorPrefix) {
		return;
	}

	// If "ms" using "Ms" property in the get function
	var setCssHooks = function(prop) {
		var upperProp = prop.charAt(0).toUpperCase() + prop.slice(1);
		var vendorProp = vendorPrefix + upperProp;
		var getVendorProp = vendorPrefix === "ms" ? "Ms" + upperProp : vendorProp;

		$.cssHooks[upperProp] =
		$.cssHooks[vendorPrefix.toLowerCase() + upperProp] =
		$.cssHooks[prop] = {
			get: function(elem, computed) {
				return computed ? $.css(elem, getVendorProp) : elem.style[vendorProp];
			},
			set: function(elem, value) {
				elem.style[vendorProp] = value;
			}
		};
	};

	for (var n = 0, actsLen = acts.length; n < actsLen; n++) {
		setCssHooks(acts[n]);
	}

	return {
		vendorPrefix: vendorPrefix,
		setCssHooks: setCssHooks
	};

});