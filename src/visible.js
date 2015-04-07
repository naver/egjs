(function($, ns) {
	"use strict";
	/**
	 * Check if elements are within the some element or document, regardless of the scroll position
	 * @class
	 * @name eg.Visible
	 * @extends eg.Component
	 *
	 * @param {Object} options
	 * @param {String} [options.targetClass="check_visible"] a classname of tagets
	 * @param {HTMLElement|String|jQuery} [options.wrapper=document] parent element that to check targets (wrapper is only one.)
	 * @param {Number} [options.expandSize=0] expand size of the wrapper.
	 * e.g. If a wrapper size is 100 x 100 and 'expandSize' option is 20, visible range is 120 x 120
	 */
	ns.Visible = ns.Class.extend(ns.Component,{
		construct : function(options) {
			this.options = {
				wrapper : document,
				targetClass : "check_visible",
				expandSize : 0
			};
			$.extend(this.options, options);

			this._wrapper = $(this.options.wrapper);
			this._wrapper = this._wrapper.length > 0 ? this._wrapper[0] : document;
			this._targets = [];
			this._timer = null;
			this._supportElementsByClassName = (function() {
				var dummy = document.createElement("div"),
					dummies;
				if (!dummy.getElementsByClassName) {
					return false;
				}
				dummies = dummy.getElementsByClassName("dummy");
				dummy.innerHTML = "<span class='dummy'></span>";
				return dummies === 1;
			})();
			this.refresh();
		},
		/**
		 * Update targets
		 * @method eg.Visible#refresh
		 * @return {Instance}
		 *
		 * @remark
		 * if targets was added or removed, you must call 'refresh' method.
		 */
		refresh : function() {
		    if (this._supportElementsByClassName) {
		        this._targets = this._wrapper.getElementsByClassName(this.options.targetClass);
		        this.refresh = function() {return this};
		    } else {
		        this.refresh = function() {
		            this._targets = $(this._wrapper).find("." + this.options.targetClass).each(function() {
		                return this;
		            });
		            return this;
		        }
		    }
		    return this.refresh();
		},

		/**
		 * Checks if the target elements has been changed.
		 * @method eg.Visible#check
		 * @param {Number} [deply=-1] delay time (ms)
		 * @return {Instance}
		 */
		check : function(delay) {
			if (typeof delay === "undefined") { delay = -1; }
			clearTimeout(this._timer);
			if (delay < 0) {
				this._check();
			} else {
				this._timer = setTimeout(function() {
					this._check();
					this._timer = null;
				}.bind(this), delay);
			}
			return this;
		},

		_check : function() {
			var expandSize = parseInt(this.options.expandSize,10),
				wrapper = this._wrapper,
				visibles = [],
				invisibles = [],
				area = null;
			if(!wrapper.nodeType || wrapper.nodeType !== 1) {
				area = {
					top : 0,
					left : 0,
					bottom : window.innerHeight,
					right : window.innerWidth
				};
			} else {
				area = wrapper.getBoundingClientRect();
			}
			area.top -= expandSize;
			area.left -= expandSize;
			area.bottom += expandSize;
			area.right += expandSize;

			for(var i= this._targets.length-1, target, targetArea, after, before; i>=0 ; i--) {
				target=this._targets[i];
				targetArea=target.getBoundingClientRect();

				if (!$(target).hasClass(this.options.targetClass)) {
					delete target.__VISIBLE__;
					this._targets.splice(i, 1);
					continue;
				}
				before = !!target.__VISIBLE__;
				target.__VISIBLE__ = after = !(
		                targetArea.bottom < area.top || area.bottom < targetArea.top ||
		                targetArea.right < area.left || area.right < targetArea.left
		            );
				if(before !== after) {
					if(after) {
						visibles.unshift(target);
					} else {
						invisibles.unshift(target);
					}
				}
			}


			/**
			 * When target elements appear or disappear based on the wrapper.
			 * @name eg.Visible#change
			 * @event
			 * @param {Array} visible visible elements (the element type is `HTMLElement`)
			 * @param {Array} invisible invisible elements (the element type is `HTMLElement`)
			 */
			this.trigger("change", {
				visible : visibles,
				invisible : invisibles
			});
		},

		destroy : function() {
			this.off();
			this._targets = [];
			this._wrapper = null;
			this._timer = null;
		}
	});
})(jQuery, eg);