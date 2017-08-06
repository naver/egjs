/**
 * Copyright (c) NAVER Corp.
 * egjs-visible projects are licensed under the MIT license
 */
import Component from "@egjs/component";

// IE8
// https://stackoverflow.com/questions/43216659/babel-ie8-inherit-issue-with-object-create
/* eslint-disable */
if (typeof Object.create !== "function") {
	Object.create = function (o, properties) {
		if (typeof o !== "object" && typeof o !== "function") {
			throw new TypeError("Object prototype may only be an Object: " + o);
		} else if (o === null) {
			throw new Error("This browser's implementation of Object.create is a shim and doesn't support 'null' as the first argument.");
		}
		function F() {}
		F.prototype = o;
		return new F();
	};
}
/* eslint-enable */

/**
 * A Class used to check whether an element is visible in the base element or viewport.
 * @ko 엘리먼트가 기준 엘리먼트나 뷰포트 안에 보이는지 확인하는 클래스
 * @alias eg.Visible
 * @extends eg.Component
 *
 * @support {"ie": "8+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"}
 */
class Visible extends Component {
	/**
	 * @param {HTMLElement|String|jQuery} [element=document] A base element that detects if another element is visible<ko>엘리먼트가 보이는 기준 엘리먼트</ko>
	 * @param {Object} options The option object of the Visible module<ko>Visible 모듈의 옵션 객체</ko>
	 * @param {String} [options.targetClass="check_visible"] The class name of the element to be checked<ko>보이는지 확인할 엘리먼트의 클래스 이름</ko>
	 * @param {Number} [options.expandSize=0] The size of the expanded area to be checked whether an element is visible. If this value is less than zero, the size of the area is smaller than that of the base element. <ko>기준 엘리먼트의 경계를 넘어 엘리먼트가 보이는지 확인할 영역의 크기. 값이 0보다 작으면 엘리먼트가 보이는지 확인할 영역의 크기가 기준 엘리먼트보다 작아진다</ko>
	 */
	constructor(element, options) {
		super();
		this.options = {
			targetClass: "check_visible",
			expandSize: 0,
		};
		Object.assign(this.options, options);

		if (element === undefined) {
			this._wrapper = document;
		}
		if (typeof element === "object") {
			this._wrapper = element;
		} else if (typeof element === "string") {
			this._wrapper = document.querySelector(element);
		}

		// this._wrapper is Element, or may be Window
		if (this._wrapper.nodeType && this._wrapper.nodeType === 1) {
			this._getAreaRect = this._getWrapperRect;
		} else {
			this._getAreaRect = Visible._getWindowRect;
		}

		this._targets = [];
		this._timer = null;
		this._supportElementsByClassName = (() => {
			const dummy = document.createElement("div");

			if (!dummy.getElementsByClassName) {
				return false;
			}

			const dummies = dummy.getElementsByClassName("dummy");

			dummy.innerHTML = "<span class='dummy'></span>";
			return dummies.length === 1;
		})();

		this.refresh();
	}

	static _hasClass(el, className) {
		if (el.classList) {
			return el.classList.contains(className);
		} else {
			return new RegExp(`(^| )${className}( |$)`, "gi").test(el.className);
		}
	}

	/**
	 * Updates the list of elements where the visibility property is to be checked
	 * @ko visibility 속성을 검사할 엘리먼트의 목록을 갱신한다
	 * @return {eg.Visible} An instance of a module itself<ko>모듈 자신의 인스턴스</ko>
	 *
	 * @remark
	 * If targets was added or removed from DOM tree, must call refresh method to update internal target list.
	 * <ko>확인 대상이 영역 안에 추가되거나 삭제된 경우, 모듈내부에서 사용하는 확인 대상 목록을 이 메소드를 호출하여 갱신해야한다.<ko>
	 */
	refresh() {
		if (this._supportElementsByClassName) {
			this._targets = this._wrapper.getElementsByClassName(this.options.targetClass);
			this.refresh = function() {
				return this;
			};
		} else {
			this.refresh = function() {
				const targets = this._wrapper.querySelectorAll(`.${this.options.targetClass}`);

				this._targets = [];
				for (let i = 0; i < targets.length; i++) {
					this._targets.push(targets[i]);
				}
				return this;
			};
		}
		return this.refresh();
	}

	/**
	 * Checks whether the visible of the target elements has changed. It trigger that change event on a component.
	 * @ko 대상 엘리먼트의 가시성이 변경됐는지 체크한다. change 이벤트를 발생한다.
	 * @param {Number} [delay=-1] Delay time. It delay that change event trigger.<ko>지연시간. change 이벤트 발생을 지연한다.</ko>
	 * @param {Boolean} [containment=false] Whether to check only elements that are completely contained within the reference area.<ko>기준 영역 안에 완전히 포함된 엘리먼트만 체크할지 여부.</ko>
	 * @return {eg.Visible} An instance of a module itself<ko>모듈 자신의 인스턴스</ko>
	 */
	check(...params) {
		let delay = params[0];
		let containment = params[1];

		if (typeof delay !== "number") {
			containment = delay;
			delay = -1;
		}

		if (typeof delay === "undefined") {
			delay = -1;
		}

		if (typeof containment === "undefined") {
			containment = false;
		}

		clearTimeout(this._timer);
		if (delay < 0) {
			this._check(containment);
		} else {
			this._timer = setTimeout(() => {
				this._check(containment);
				this._timer = null;
			}, delay);
		}
		return this;
	}

	_getWrapperRect() {
		return this._wrapper.getBoundingClientRect();
	}

	static _getWindowRect() {
		// [IE7] document.documentElement.clientHeight has always value 0 (bug)
		return {
			top: 0,
			left: 0,
			bottom: document.documentElement.clientHeight ||
				document.body.clientHeight,
			right: document.documentElement.clientWidth ||
				document.body.clientWidth,
		};
	}

	_reviseElements(...params) {
		if (this._supportElementsByClassName) {
			this._reviseElements = () => true;
		} else {
			this._reviseElements = (target, i) => {
				if (!Visible._hasClass(target, this.options.targetClass)) {
					target.__VISIBLE__ = null;
					this._targets.splice(i, 1);
					return false;
				}
				return true;
			};
		}
		return this._reviseElements(...params);
	}

	_check(containment) {
		const expandSize = parseInt(this.options.expandSize, 10);
		const visibles = [];
		const invisibles = [];

		let i;
		let target;
		let targetArea;
		let before;
		let after;

		// Error Fix: Cannot set property top of #<ClientRect> which has only a getter
		const rect = this._getAreaRect();
		const area = {
			top: rect.top - expandSize,
			left: rect.left - expandSize,
			bottom: rect.bottom + expandSize,
			right: rect.right + expandSize,
		};

		for (i = this._targets.length - 1;
			(target = this._targets[i]); i--) {
			targetArea = target.getBoundingClientRect();

			if (targetArea.width === 0 && targetArea.height === 0) {
				continue;
			}

			if (this._reviseElements(target, i)) {
				before = !!target.__VISIBLE__;

				if (containment) {
					after = !(
						targetArea.top < area.top ||
						targetArea.bottom > area.bottom ||
						targetArea.right > area.right ||
						targetArea.left < area.left
					);
					target.__VISIBLE__ = after;
				} else {
					after = !(
						targetArea.bottom < area.top ||
						area.bottom < targetArea.top ||
						targetArea.right < area.left ||
						area.right < targetArea.left
					);
					target.__VISIBLE__ = after;
				}

				if (before !== after) {
					if (after) {
						visibles.unshift(target);
					} else {
						invisibles.unshift(target);
					}
				}
			}
		}
		/**
		 * This event is fired when the event is compared with the last verified one and there is an element of which the visibility property has changed.
		 * @ko 마지막으로 확인한 결과와 비교해 visibility 속성이 변경된 엘리먼트가 있을 때 발생하는 이벤트
		 * @event eg.Visible#change
		 * @param {Array} visible Visible elements  (the element type is `HTMLElement`) <ko>보이게 된 엘리먼트들</ko>
		 * @param {Array} invisible Invisible elements  (the element type is `HTMLElement`) <ko>안 보이게 된 엘리먼트들</ko>
		 */
		this.trigger("change", {
			visible: visibles,
			invisible: invisibles,
		});
	}

	destroy() {
		this.off();
		this._targets = [];
		this._wrapper = null;
		this._timer = null;
	}
}

Visible.VERSION = "#__VERSION__#";
export default Visible;
