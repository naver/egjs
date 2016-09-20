/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

eg.module("visible", ["jQuery", eg, document], function($, ns, doc) {
	"use strict";

	/**
	 * A module used to check whether an element is visible in the base element or viewport.
	 * @ko 엘리먼트가 기준 엘리먼트나 뷰포트 안에 보이는지 확인하는 모듈
	 * @class
	 * @name eg.Visible
	 * @extends eg.Component
	 * @group egjs
	 *
	 * @param {HTMLElement|String|jQuery} [element=document] A base element that detects if another element is visible<ko>엘리먼트가 보이는 기준 엘리먼트</ko>
	 * @param {Object} options The option object of the eg.Visible module<ko>eg.Visible 모듈의 옵션 객체</ko>
	 * @param {String} [options.targetClass="check_visible"] The class name of the element to be checked<ko>보이는지 확인할 엘리먼트의 클래스 이름</ko>
	 * @param {Number} [options.expandSize=0] The size of the expanded area to be checked whether an element is visible. If this value is less than zero, the size of the area is smaller than that of the base element. <ko>기준 엘리먼트의 경계를 넘어 엘리먼트가 보이는지 확인할 영역의 크기. 값이 0보다 작으면 엘리먼트가 보이는지 확인할 영역의 크기가 기준 엘리먼트보다 작아진다</ko>
	 * @support {"ie": "7+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"}
	 *
	 * @codepen {"id":"WbWzqq", "ko":"Visible 기본 예제", "en":"Visible basic example", "collectionId":"Ayrabj", "height" : 403}
	 */
	var EVENTS = {
		"change": "change"
	};
	ns.Visible = ns.Class.extend(ns.Component, {
		_events: function() {
			return EVENTS;
		},
		construct: function(element, options, _prefix) {
			this._prefix = _prefix || "";
			this.options = {
				targetClass: "check_visible",
				expandSize: 0
			};
			$.extend(this.options, options);

			this._wrapper = $(element)[0] || doc;

			// this._wrapper is Element, or may be Window
			if (this._wrapper.nodeType && this._wrapper.nodeType === 1) {
				this._getAreaRect = this._getWrapperRect;
			} else {
				this._getAreaRect = this._getWindowRect;
			}

			this._targets = [];
			this._timer = null;
			this._supportElementsByClassName = (function() {
				var dummy = doc.createElement("div");
				var dummies;
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
		 * Updates the list of elements where the visibility property is to be checked
		 * @ko visibility 속성을 검사할 엘리먼트의 목록을 갱신한다
		 * @method eg.Visible#refresh
		 * @return {eg.Visible} An instance of a module itself<ko>모듈 자신의 인스턴스</ko>
		 *
		 * @remark
		 * If targets was added or removed from DOM tree, must call refresh method to update internal target list.
		 * <ko>확인 대상이 영역 안에 추가되거나 삭제된 경우, 모듈내부에서 사용하는 확인 대상 목록을 이 메소드를 호출하여 갱신해야한다.<ko>
		 */
		refresh: function() {
			if (this._supportElementsByClassName) {
				this._targets = this._wrapper
					.getElementsByClassName(this.options.targetClass);
				this.refresh = function() {
					return this;
				};
			} else {
				this.refresh = function() {
					this._targets = $(this._wrapper)
						.find("." + this.options.targetClass)
						.get();
					return this;
				};
			}
			return this.refresh();
		},
		/**
		 * Checks whether the visibility property of the target elements has changed. The change event is fired when the property has changed.
		 * @ko 보이는지 확인할 대상 엘리먼트 목록의 visibility 속성이 변경됐는지 확인한다. 속성이 변경됐으면 change 이벤트가 발생한다
		 * @method eg.Visible#check
		 * @param {Number} [delay=-1] Delay time. It is used to check the property after a method is called and a period of time has passed.<ko>속성 확인 지연 시간. 메서드를 호출하고 일정 시간이 지난 후에 속성을 확인할 때 사용한다</ko>
		 * @return {eg.Visible} An instance of a module itself<ko>모듈 자신의 인스턴스</ko>
		 */
		check: function(delay) {
			if (typeof delay === "undefined") {
				delay = -1;
			}
			clearTimeout(this._timer);
			if (delay < 0) {
				this._check();
			} else {
				this._timer = setTimeout($.proxy(function() {
					this._check();
					this._timer = null;
				}, this), delay);
			}
			return this;
		},
		_getWrapperRect: function() {
			return this._wrapper.getBoundingClientRect();
		},
		_getWindowRect: function() {
			// [IE7] document.documentElement.clientHeight has always value 0 (bug)
			return {
				top: 0,
				left: 0,
				bottom: doc.documentElement.clientHeight ||
							doc.body.clientHeight,
				right: doc.documentElement.clientWidth ||
							doc.body.clientWidth
			};
		},
		_reviseElements: function(target, i) {
			if (this._supportElementsByClassName) {
				this._reviseElements = function() {
					return true;
				};
			} else {
				this._reviseElements = function(target, i) {
					if (!$(target).hasClass(this.options.targetClass)) {
						target.__VISIBLE__ = null;
						this._targets.splice(i, 1);
						return false;
					}
					return true;
				};
			}
			return this._reviseElements(target, i);
		},
		_check: function() {
			var expandSize = parseInt(this.options.expandSize, 10);
			var visibles = [];
			var invisibles = [];
			var area = this._getAreaRect();

			// Error Fix: Cannot set property top of #<ClientRect> which has only a getter
			area = $.extend({}, area);

			area.top -= expandSize;
			area.left -= expandSize;
			area.bottom += expandSize;
			area.right += expandSize;
			for (var i = this._targets.length - 1, target, targetArea, after, before;
					target = this._targets[i] ; i--) {
				targetArea = target.getBoundingClientRect();
				if (targetArea.width === 0 && targetArea.height === 0) {
					continue;
				}
				if (this._reviseElements(target, i)) {
					before = !!target.__VISIBLE__;
					target.__VISIBLE__ = after = !(
						targetArea.bottom < area.top ||
						area.bottom < targetArea.top ||
						targetArea.right < area.left ||
						area.right < targetArea.left
					);
					(before !== after) && (after ? visibles : invisibles).unshift(target);
				}
			}
			/**
			 * This event is fired when the event is compared with the last verified one and there is an element of which the visibility property has changed.
			 * @ko 마지막으로 확인한 결과와 비교해 visibility 속성이 변경된 엘리먼트가 있을 때 발생하는 이벤트
			 * @name eg.Visible#change
			 * @event
			 * @param {Array} visible Visible elements  (the element type is `HTMLElement`) <ko>보이게 된 엘리먼트들</ko>
			 * @param {Array} invisible Invisible elements  (the element type is `HTMLElement`) <ko>안 보이게 된 엘리먼트들</ko>
			 */
			this.trigger(this._prefix + EVENTS.change, {
				visible: visibles,
				invisible: invisibles
			});
		},
		destroy: function() {
			this.off();
			this._targets = [];
			this._wrapper = this._timer = null;
		}
	});
});
/**
 * A jQuery custom event of the eg.Visible module. This event is fired when the event is compared with the last verified one and there is an element of which the visibility property has changed.
 *
 * @ko eg.Visible 모듈의 jQuery 커스텀 이벤트. 마지막으로 확인한 결과와 비교해 visibility 속성이 변경된 엘리먼트가 있을 때 발생한다
 * @name jQuery#visible:change
 * @event
 * @example
	// create
	$("body").visible();

 	// event
 	$("body").on("visible:change",callback);
 	$("body").off("visible:change",callback);
 	$("body").trigger("visible:change",callback);
 * @see eg.Visble
 */
/**
 * A jQuery plugin available in the eg.Visible module.
 * @ko eg.Visible 모듈의 jQuery 플러그인
 * @method jQuery.visible
 * @example
	// create
	$("body").visible();

 	// event
 	$("body").on("visible:change",callback);
 	$("body").off("visible:change",callback);
 	$("body").trigger("visible:change",callback);

 	// method
 	$("body").visible("option","circular",true); //Set option
 	$("body").visible("instance"); // Return flicking instance
 	$("body").visible("check",10); // Check to change target elements.
 * @see eg.Visble#event:change
 */
