	/**
     * @namespace Function
     */
if (!Function.prototype.bind) {
    /**
     * Function bind polyfill
     * @ko Function bind 폴리필
     * @name Function#bind
     * @method
     * @param {Variable} arg
     * @return {Function} bound function
     * @see  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
     *
     */
	Function.prototype.bind = function(oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5
			// internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}
		var aArgs  = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			NOP  = function() {},
			Bound  = function() {
			  return fToBind.apply(this instanceof NOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
			};
		NOP.prototype = this.prototype;
		Bound.prototype = new NOP();
		return Bound;
	};
}