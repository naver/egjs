eg.module("visible",[jQuery, eg],function($, ns){
	/**
	 * It check element is visible within the specific element or viewport, regardless of the scroll position
	 * @ko scroll위치와 상관없이 특정 엘리먼트나 viewport 안에 엘리먼트가 보이는지 확인한다.
	 * @class
	 * @name eg.Visible
	 * @extends eg.Component
	 * @group EvergreenJs
	 *
	 * @param {Object} options
	 * @param {HTMLElement|String|jQuery} [options.wrapper=document] The parent element that to check targets (wrapper is only one.) <ko>확인할 영역의 상위 엘리먼트</ko>
	 * @param {String} [options.targetClass="check_visible"] A classname of tagets <ko>확인할 엘리먼트가 가진 클래스명</ko>
	 * @param {Number} [options.expandSize=0] expand size of the wrapper.
	 * e.g. If a wrapper size is 100 x 100 and 'expandSize' option is 20, visible range is 120 x 120
	 * <ko> 상위 엘리먼트 기준으로 추가적인 영역을 확인하도록 지정</ko>
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
		 * If targets was added or removed, you must call 'refresh' method.
		 * <ko> 확인 대상이 영역 안에 추가 된 경우, 또는 확인 대상이 영역 안에서 삭제 된 경우, 영역 내의 확인 대상을 이 메소드를 호출하여 갱신해야한다. <ko>
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
		 * @param {Number} [deply=-1] Delay time in milliseconds <ko>호출 후, 일정 시간이 지난 후에 확인하고자 할때 사용한다.</ko>
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
			 * @param {Array} visible The visible elements (the element type is `HTMLElement`) <ko>보여지게 된 엘리먼트들 </ko>
			 * @param {Array} invisible The invisible elements (the element type is `HTMLElement`) <ko>안 보여지게 된 엘리먼트들 </ko>
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
});
