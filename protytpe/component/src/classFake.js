var n = {};
var namespace = null;//namespace 지정

(function(ns) {
    ns.$Class = function(oDef) {
		var typeClass = function() {
			// console.log(oDef.$init);
			if (oDef.$init !== undefined) {
				oDef.$init.apply(this, arguments);
			}
		};

		typeClass.prototype = oDef;
		// typeClass.prototype.constructor = typeClass;
		return typeClass;
	};


	ns.$Class.extend = function(oSuperClass, oDef) {
		var extendClass = function () {
			// Call a parent constructor
			oSuperClass.apply(this, arguments);
				
			// Call a child constructor
			if (oDef.$init !== undefined) {
				oDef.$init.apply(this, arguments);
			}
		};

		var ExtProto = function() {};

		ExtProto.prototype = oSuperClass.prototype;
		var oExtProto = new ExtProto();
		extendClass.$super = oSuperClass.prototype;

		for (var i in oDef) {
			if (oDef.hasOwnProperty(i)/* && i !== "prototype"*/) {
				oExtProto[i] = oDef[i];
			}
		}
		extendClass.prototype = oExtProto;
		// extendClass.prototype.constructor = extendClass;

		return extendClass;
	};

})(namespace || window);