(function(global, undefined){
	global.eg = {};
	/**
	 * Regist module.
	 * @private
	 */
	global.eg.module = function(name,di,fp){
	    di.forEach(function(v){
	        if(v === undefined){
	            throw( "Unable to verify the references" );
	        }
	    });
	    fp.apply(global,di);
	};
})(window);
