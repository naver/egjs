(function($) {
	var _ua = navigator.userAgent,
		_patch = {},
		_check = function(method) {
			var v = null;
			if(typeof _patch[method] == "function") {
				v = _patch[method](_agent);
				switch (v){
					case -1 : return false;
					case 1 : return true;
					default : return null;
				}
			}
			return v;
		},
		_agent = (function() {
			var osMatch = /(iPhone|iPad) OS ([\w.]+)/.exec(_ua) ||
					/(Android) ([\w.]+)/.exec(_ua) ||
					[],
				browserMatch = /(Chrome|CriOS)[ \/]([\w.]+)/.exec(_ua) ||
					[];
			if(osMatch.length >= 2) {
				osMatch[1] = /iPhone|iPad/.test(osMatch[1]) ? "ios" : osMatch[1].toLowerCase() ;
				osMatch[2] = osMatch[2].replace(/\_/g,'.').replace(/\s/g, "");
			}
			if(browserMatch.length >= 2) {
				if(/Chrome|CriOS/.test(browserMatch[1])) {
					browserMatch[1] = /SAMSUNG/.test(_ua) ? "sbrowser" : "chrome";
				}
			}
			return {
				os: osMatch[1] || "",
				osVersion: osMatch[2] || "0",
				browser : browserMatch[1] || "default",
				browserVersion : browserMatch[2] || osMatch[2],
			};
		})();

	$.extend({
		naver : {
			defaults : _patch,
			isHardwareAccelerable : function() {
				var check = _check("isHardwareAccelerable");
				if(check != null) {
					return check;
				} else {
					var result = false;
					// chrome (less then 25) has a text blur bug.
					// but samsung sbrowser fix it.
					if(/chrome/.test(_agent.browser) && _agent.browserVersion < "25") {
						result = false;
					} else if(/android/.test(_agent.os)) {
						var ua = _ua.match(/\(.*\)/);
						if(ua instanceof Array && ua.length > 0){
							ua=ua[0];
						}
						// android 4.1+ blacklist
						// EK-GN120 : Galaxy Camera, SM-G386F : Galaxy Core LTE
						result = (_agent.osVersion >= "4.1.0" && !/EK-GN120|SM-G386F/.test(ua)) ||
							// SHW-M420 : Galaxy Nexus , SHW-M200 : NexusS , GT-S7562 : Galaxy S duos
							(_agent.osVersion >= "4.0.3" &&
								/SHW-|SHV-|GT-|SCH-|SGH-|SPH-|LG-F160|LG-F100|LG-F180|LG-F200|EK-|IM-A|LG-F240|LG-F260/.test(ua) &&
								!/SHW-M420|SHW-M200|GT-S7562/.test(ua));
					} else if(/ios/.test(_agent.os)) {
						result = true;
					}
					return result;
				}
			}
		}
	});
})(jQuery);