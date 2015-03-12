var namespace = null;//namespace 지정

(function(ns) {
    ns.Class = function(oDef) {
    	var _constructor = null;

    	if ("constructor" in oDef) {
			_constructor = oDef.constructor;
			//delete oDef.constructor;
		}

		var typeClass = function() {
			if (_constructor !== null) {
				_constructor.apply(this, arguments);
			}
		};

		for (var i in oDef) {
			if (oDef.hasOwnProperty(i)/* && i !== "prototype"*/) {
				typeClass.prototype[i] = oDef[i];
			}
		}
		typeClass._constructor = _constructor;
		typeClass.extends = _extends;
		typeClass.prototype.constructor = typeClass;
		return typeClass;
	};

	function _extends(oSuperClass) {
		if (!oSuperClass) {
			return this;
		}

		var oTypeClass = this;
		var extendClass = function () {
			// Call a parent constructor
			oSuperClass.apply(this, arguments);
				
			// Call a child constructor
			if (oTypeClass._constructor !== null) {
				oTypeClass._constructor.apply(this, arguments);
			}
		};
		
		var ExtProto = function() {};

		ExtProto.prototype = oSuperClass.prototype;
		var oExtProto = new ExtProto();
		extendClass.super = oSuperClass.prototype;

		for (var i in oTypeClass.prototype) {
			if (oTypeClass.prototype.hasOwnProperty(i)/* && i !== "prototype"*/) {
				oExtProto[i] = oTypeClass.prototype[i];
			}
		}
		extendClass.prototype = oExtProto;
		extendClass.prototype.constructor = extendClass;

		return extendClass;
	}
})(namespace || window);