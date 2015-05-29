(function(global, undefined){
	"use strict";
	global.eg = {};
	global.eg._module = {};
	global.eg.module = function(name,di,fp){
	    this._module[name] = [di,fp];
	    fp.apply(global,di);
	}
	
	global.eg.invoke = function(name,param){
	    var module = this._module[name],
	        di = module[0],
	        fp = module[1];
	        param = param || [];

	    return fp.apply(global, di.map(function(v,i){
	        return param[i] == null ? v : param[i];
	    }));
	}	
})(window);
