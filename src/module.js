(function(global){
	global.eg = {};
	/**
	 * Regist module.
	 * @private
	 */
	global.eg.module = function(name,di,fp){
	    fp.apply(global,di);
	};
})(window);
