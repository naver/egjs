var n = {};
var namespace = null;//namespace 지정

(function(ns) {
    ns.Class = function(oDef) {
		var typeClass = function() {
			if (oDef.constructor !== null) {
				oDef.constructor.apply(this, arguments);
			}
		};

		for (var i in oDef) {
			if (oDef.hasOwnProperty(i)/* && i !== "prototype"*/) {
				typeClass.prototype[i] = oDef[i];
			}
		}
		
		typeClass.prototype.constructor = typeClass;
		return typeClass;
	};


	ns.Class.extends = function(oSuperClass, oDef) {
		var extendClass = function () {
			// Call a parent constructor
			oSuperClass.apply(this, arguments);
				
			// Call a child constructor
			if (oDef.constructor !== null) {
				oDef.constructor.apply(this, arguments);
			}
		};

		var ExtProto = function() {};

		ExtProto.prototype = oSuperClass.prototype;
		var oExtProto = new ExtProto();
		extendClass.super = oSuperClass.prototype;

		for (var i in oDef) {
			if (oDef.hasOwnProperty(i)/* && i !== "prototype"*/) {
				oExtProto[i] = oDef[i];
			}
		}
		extendClass.prototype = oExtProto;
		extendClass.prototype.constructor = extendClass;

		return extendClass;
	}

	// function _extends(oSuperClass) {
	// 	if (!oSuperClass) {
	// 		return this;
	// 	}

	// 	var oTypeClass = this;
	// 	var extendClass = function () {
	// 		// Call a parent constructor
	// 		oSuperClass.apply(this, arguments);
				
	// 		// Call a child constructor
	// 		if (oTypeClass._constructor !== null) {
	// 			oTypeClass._constructor.apply(this, arguments);
	// 		}
	// 	};
		
	// 	var ExtProto = function() {};

	// 	ExtProto.prototype = oSuperClass.prototype;
	// 	var oExtProto = new ExtProto();
	// 	extendClass.super = oSuperClass.prototype;

	// 	for (var i in oTypeClass.prototype) {
	// 		if (oTypeClass.prototype.hasOwnProperty(i)/* && i !== "prototype"*/) {
	// 			oExtProto[i] = oTypeClass.prototype[i];
	// 		}
	// 	}
	// 	extendClass.prototype = oExtProto;
	// 	extendClass.prototype.constructor = extendClass;

	// 	return extendClass;
	// }
})(namespace || window);