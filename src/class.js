"use strict";
(function(ns) {
    ns.Class = function(oDef) {
		var typeClass = function typeClass() {
			if (typeof oDef.construct === "function") {
				oDef.construct.apply(this, arguments);
			}
		};

		typeClass.prototype = oDef;
		typeClass.prototype.constructor = typeClass;
		return typeClass;
	};

	ns.Class.extend = function(oSuperClass, oDef) {
		var extendClass = function extendClass() {
			// Call a parent constructor
			oSuperClass.apply(this, arguments);

			// Call a child constructor
			if (typeof oDef.construct === "function") {
				oDef.construct.apply(this, arguments);
			}
		};

		var ExtProto = function() {};
		ExtProto.prototype = oSuperClass.prototype;
		//extendClass.$super = oSuperClass.prototype; //'super' is supported not yet.

		var oExtProto = new ExtProto();
		for (var i in oDef) {
			if (oDef.hasOwnProperty(i)) {
				oExtProto[i] = oDef[i];
			}
		}
		oExtProto.constructor = extendClass;
		extendClass.prototype = oExtProto;

		return extendClass;
	};
})(eg);