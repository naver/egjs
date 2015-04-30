(function($, ns) {
	"use strict";

	/**
	 * It check element is visible within the specific element or viewport, regardless of the scroll position
	 * @ko scroll위치와 상관없이 특정 엘리먼트나 viewport 안에 엘리먼트가 보이는지 확인한다.
	 * @class
	 * @name eg.Visible
	 * @extends eg.Component
	 * @group EvergreenJs
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
				return dummies.length === 1;
			})();

			this.refresh();
		},
		/**
		 * Update targets
		 * @ko target들을 갱신한다.
		 * @method eg.Visible#refresh
		 * @return {Instance}
		 *
		 * @remark
		 * if targets was added or removed, you must call 'refresh' method.
		 */
		refresh : function() {
		    if (this._supportElementsByClassName) {
		        this._targets = this._wrapper.getElementsByClassName(this.options.targetClass);
		        this.refresh = function() {return this; };
		    } else {
		        this.refresh = function() {
		            this._targets = $(this._wrapper).find("." + this.options.targetClass).each(function() {
		                return this;
		            });
		            return this;
		        };
		    }
		    return this.refresh();
		},

		/**
		 * Checks if the target elements has been changed.
		 * @ko target들이 변경했는지 확인한다.
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
		_reviseElements : function(target,i){
			if(this._supportElementsByClassName){
				this._reviseElements = function(){return true;};
			}else{
				this._reviseElements = function(target,i){
					if (!$(target).hasClass(this.options.targetClass)) {
						target.__VISIBLE__ = null;
						this._targets.splice(i, 1);
						return false;
					}
					return true;
				};
			}
			return this._reviseElements(target,i);
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

			for(var i= this._targets.length-1, target, targetArea, after, before; target=this._targets[i] ; i--) {
				targetArea=target.getBoundingClientRect();
				if(this._reviseElements(target,i)){
					before = !!target.__VISIBLE__;
					target.__VISIBLE__ = after = !(
			                targetArea.bottom < area.top || area.bottom < targetArea.top ||
			                targetArea.right < area.left || area.right < targetArea.left
			            );
					(before !== after) && (after ? visibles : invisibles).unshift(target);
				}

			}


			/**
			 * When target elements appear or disappear based on the base area.
			 * @ko 기준 영역을 기준으로 보이는 엘리먼트와 사라진 엘리먼트가 변경된 경우 발생하는 이벤트
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
			this._wrapper = this._timer = null;
		}
	});
})(jQuery, eg);
