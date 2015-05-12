(function(global){
	"use strict";
	global.eg = {};
	global.eg._module = {};
	global.eg.module = function(name,di,fp){
	    this._module[name] = [di,fp];
	    fp.apply(global,di);
	}
	
	global.eg._invoke = function(name,param){
	    var module = this._module[name],
	        di = module[0],
	        fp = module[1];
	    return fp.apply(global, param.map(function(v,i){
	        return v===null?di[i]:v;
	    }));
	}	
})(window);
