/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

// jscs:disable validateLineBreaks, maximumLineLength
eg.module("infiniteGrid", ["jQuery", eg, window, document], function($, ns, global, doc) {
	"use strict";

	/**
	 * A module used to arrange card elements including content infinitely on a grid layout. With this module, you can implement a grid-pattern user interface composed of different card elements whose sizes vary. It guarantees performance by maintaining the number of DOMs the module is handling under any circumstance
	 * @group egjs
	 * @ko 콘텐츠가 있는 카드 엘리먼트를 그리드 레이아웃에 무한으로 배치하는 모듈. 다양한 크기의 카드 엘리먼트를 격자 모양으로 배치하는 UI를 만들 수 있다. 카드 엘리먼트의 개수가 계속 늘어나도 모듈이 처리하는 DOM의 개수를 일정하게 유지해 최적의 성능을 보장한다
	 * @class
	 * @name eg.InfiniteGrid
	 * @extends eg.Component
	 *
	 * @param {HTMLElement|String|jQuery} element A base element for a module <ko>모듈을 적용할 기준 엘리먼트</ko>
	 * @param {Object} [options] The option object of the eg.InfiniteGrid module <ko>eg.InfiniteGrid 모듈의 옵션 객체</ko>
	 * @param {String} [options.itemSelector] A selector to select card elements that make up the layout (@deprecated since 1.3.0)<ko>레이아웃을 구성하는 카드 엘리먼트를 선택할 선택자(selector) (@deprecated since 1.3.0)</ko>
	 * @param {Number} [options.count=30] The number of DOMs handled by module. If the count value is greater than zero, the number of DOMs is maintained. If the count value is zero or less than zero, the number of DOMs will increase as card elements are added. <ko>모듈이 유지할 실제 DOM의 개수. count 값이 0보다 크면 DOM 개수를 일정하게 유지한다. count 값이 0 이하면 카드 엘리먼트가 추가될수록 DOM 개수가 계속 증가한다.</ko>
	 * @param {String} [options.defaultGroupKey=null] The default group key configured in a card element contained in the markup upon initialization of a module object <ko>모듈 객체를 초기화할 때 마크업에 있는 카드 엘리먼트에 설정할 그룹 키 </ko>
	 * @param {Boolean} [options.isEqualSize=false] Indicates whether sizes of all card elements are equal to one another. If sizes of card elements to be arranged are all equal and this option is set to "true", the performance of layout arrangement can be improved. <ko>카드 엘리먼트의 크기가 동일한지 여부. 배치될 카드 엘리먼트의 크기가 모두 동일할 때 이 옵션을 'true'로 설정하면 레이아웃 배치 성능을 높일 수 있다</ko>
	 * @param {Number} [options.threshold=300] The threshold size of an event area where card elements are added to a layout.<br>- append event: If the current vertical position of the scroll bar is greater than "the bottom property value of the card element at the top of the layout" plus "the value of the threshold option", the append event will occur.<br>- prepend event: If the current vertical position of the scroll bar is less than "the bottom property value of the card element at the top of the layout" minus "the value of the threshold option", the prepend event will occur. <ko>−	레이아웃에 카드 엘리먼트를 추가하는 이벤트가 발생하는 기준 영역의 크기.<br>- append 이벤트: 현재 스크롤의 y 좌표 값이 '레이아웃의 맨 아래에 있는 카드 엘리먼트의 top 속성의 값 + threshold 옵션의 값'보다 크면 append 이벤트가 발생한다.<br>- prepend 이벤트: 현재 스크롤의 y 좌표 값이 '레이아웃의 맨 위에 있는 카드 엘리먼트의 bottom 속성의 값 - threshold 옵션의 값'보다 작으면 prepend 이벤트가 발생한다</ko>
	 *
	 * @codepen {"id":"zvrbap", "ko":"InfiniteGrid 데모", "en":"InfiniteGrid example", "collectionId":"DPYEww", "height": 403}
	 *  @support {"ie": "8+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"}
	 *
	 * @example
		<!-- HTML -->
		<ul id="grid">
			<li class="card">
				<div>test1</div>
			</li>
			<li class="card">
				<div>test2</div>
			</li>
			<li class="card">
				<div>test3</div>
			</li>
			<li class="card">
				<div>test4</div>
			</li>
			<li class="card">
				<div>test5</div>
			</li>
			<li class="card">
				<div>test6</div>
			</li>
		</ul>
		<script>
		var some = new eg.InfiniteGrid("#grid").on("layoutComplete", function(e) {
			// ...
		});
		</script>
	 */
	var EVENTS = {
		"layoutComplete": "layoutComplete",
		"append": "append",
		"prepend": "prepend"
	};
	var RETRY = 3;
	ns.InfiniteGrid = ns.Class.extend(ns.Component, {
		_events: function() {
			return EVENTS;
		},
		construct: function(el, options, _prefix) {
			var ua = global.navigator.userAgent;
			this.options = $.extend({
				isEqualSize: false,
				defaultGroupKey: null,
				count: 30,
				threshold: 300
			}, options);

			// if el is jQuery instance, el should change to HTMLElement.
			this.$el = el instanceof $ ? el : $(el);
			this.el = this.$el.get(0);
			this.el.style.position = "relative";
			this._prefix = _prefix || "";
			this._isIos = /iPhone|iPad/.test(ua);
			this._isIE = /MSIE|Trident|Windows Phone|Edge/.test(ua);
			this._appendCols = this._prependCols = [];
			this.$view = $(global);
			this._reset();
			this._refreshViewport();
			if (this.el.children.length > 0) {
				this.layout(true, this._itemize($.makeArray(this.el.children), this.options.defaultGroupKey));
			}

			this._onScroll = $.proxy(this._onScroll, this);
			this._onResize = $.proxy(this._onResize, this);
			this.$view.on("scroll", this._onScroll)
				.on("resize", this._onResize);
		},
		_getScrollTop: function() {
			return doc.body.scrollTop || doc.documentElement.scrollTop;
		},
		_onScroll: function() {
			if (this.isProcessing()) {
				return;
			}
			var scrollTop = this._getScrollTop();
			var prevScrollTop = this._prevScrollTop;

			if (this._isIos && scrollTop === 0 || prevScrollTop === scrollTop) {
				return;
			}
			var ele;
			var rect;
			if (prevScrollTop < scrollTop) {
				if ($.isEmptyObject(this._bottomElement)) {
					this._bottomElement = this.getBottomElement();
					if (this._bottomElement == null) {
						return;
					}
				}
				ele = this._bottomElement;
				rect = ele.getBoundingClientRect();
				if (rect.top <= this._clientHeight + this.options.threshold) {
					/**
					 * This event is fired when a card element must be added at the bottom of a grid layout because there is no card to be displayed on screen when a user scrolls near bottom.
					 * @ko 카드 엘리먼트가 그리드 레이아웃의 아래에 추가돼야 할 때 발생하는 이벤트. 사용자가 아래로 스크롤해서 화면에 표시될 카드가 없을 때 발생한다
					 * @name eg.InfiniteGrid#append
					 * @event
					 *
					 * @param {Object} param The object of data to be sent to an event <ko>이벤트에 전달되는 데이터 객체</ko>
					 * @param {Number} param.scrollTop Current vertical position of the scroll bar<ko>현재 스크롤의 y 좌표 값</ko>
					 */
					this.trigger(this._prefix + EVENTS.append, {
						scrollTop: scrollTop
					});
				}
			} else {
				if ($.isEmptyObject(this._topElement)) {
					this._topElement = this.getTopElement();
					if (this._topElement == null) {
						return;
					}
				}
				ele = this._topElement;
				rect = ele.getBoundingClientRect();
				if (rect.bottom >= -this.options.threshold) {
					/**
					 * This event is fired when a card element must be added at the top of a grid layout because there is no card to be displayed on screen when a user scrolls near top. This event is available only if the isRecycling() method returns true.
					 * @ko 카드가 그리드 레이아웃의 위에 추가돼야 할 때 발생하는 이벤트. 사용자가 위로 스크롤해서 화면에 표시될 카드가 없을 때 발생한다. 이 이벤트는 isRecycling() 메서드의 반환값이 'true'일 때만 발생한다
					 * @name eg.InfiniteGrid#prepend
					 * @event
					 *
					 * @param {Object} param The object of data to be sent to an event<ko>이벤트에 전달되는 데이터 객체</ko>
					 * @param {Number} param.scrollTop Current vertical position of the scroll bar<ko>현재 스크롤의 y 좌표 값</ko>
					 */
					var croppedDistance = this.fit();
					if (croppedDistance > 0) {
						scrollTop -= croppedDistance;
						this.$view.scrollTop(scrollTop);
					}
					this.trigger(this._prefix + EVENTS.prepend, {
						scrollTop: scrollTop
					});
				}
			}
			this._prevScrollTop = scrollTop;
		},
		_onResize: function() {
			if (this._resizeTimeout) {
				clearTimeout(this._resizeTimeout);
			}
			var self = this;
			this._resizeTimeout = setTimeout(function() {
				self._refreshViewport();
				(self.$el.innerWidth() !== self._containerWidth) && self.layout(true);
				self._resizeTimeout = null;
				self._prevScrollTop = -1;
			}, 100);
		},
		_refreshViewport: function() {
			var el = this.$view.get(0);
			if (el) {
				this._clientHeight = $.isWindow(el) ? el.innerHeight || document.documentElement.clientHeight : el.clientHeight;
			}
		},
		/**
		 * Returns the current state of a module such as location information. You can use the setStatus() method to restore the information returned through a call to this method.
		 * @ko 카드의 위치 정보 등 모듈의 현재 상태 정보를 반환한다. 이 메서드가 반환한 정보를 저장해 두었다가 setStatus() 메서드로 복원할 수 있다
		 * @method eg.InfiniteGrid#getStatus
		 * @return {Object} State object of the eg.InfiniteGrid module<ko>eg.InfiniteGrid 모듈의 상태 객체</ko>
		 */
		getStatus: function() {
			var data = {};
			var p;
			for (p in this) {
				if (this.hasOwnProperty(p) && /^_/.test(p) &&
					typeof this[p] !== "function" && !(this[p] instanceof Element)) {
					data[p] = this[p];
				}
			}
			return {
				prop: data,
				options: $.extend({}, this.options),
				items: $.map(this.items, function(v) {
					var clone = $.extend({}, v);
					delete clone.el;
					return clone;
				}),
				html: this.el.innerHTML,
				cssText: this.el.style.cssText
			};
		},
		/**
		 * Sets the state of the eg.InfiniteGrid module with the information returned through a call to the getStatue() method.
		 * @ko getStatue() 메서드가 저장한 정보로 eg.InfiniteGrid 모듈의 상태를 설정한다.
		 * @method eg.InfiniteGrid#setStatus
		 * @param {Object} status State object of the eg.InfiniteGrid module <ko>eg.InfiniteGrid 모듈의 상태 객체</ko>
		 * @return {eg.InfiniteGrid} An instance of a module itself<ko>모듈 자신의 인스턴스</ko>
		 */
		setStatus: function(status) {
			if (!status || !status.cssText || !status.html ||
				!status.prop || !status.items) {
				return this;
			}
			this.el.style.cssText = status.cssText;
			this.el.innerHTML = status.html;
			$.extend(this, status.prop);
			this._topElement = this._bottomElement = null;
			this.items = $.map(this.el.children, function(v, i) {
				status.items[i].el = v;
				return status.items[i];
			});
			return this;
		},
		/**
		 * Checks whether a card element is being added.
		 * @ko 카드 엘리먼트 추가가 진행 중인지 확인한다
		 * @method eg.InfiniteGrid#isProcessing
		 * @return {Boolean} Indicates whether a card element is being added <ko>카드 엘리먼트 추가 진행 중 여부</ko>
		 */
		isProcessing: function() {
			return this._isProcessing;
		},
		/**
		 * Checks whether the total number of added card elements is greater than the value of the count option. Note that the value of the count option is always greater than zero. If it returns true, the number of DOMs won't increase even though card elements are added; instead of adding a new DOM, existing DOMs are recycled to maintain the number of DOMs.
		 * @ko 추가된 카드 엘리먼트의 전체 개수가 count 옵션의 값보다 큰지 확인한다. 단, count 옵션의 값은 0보다 크다. 'true'가 반환되면 카드 엘리먼트가 더 추가돼도 DOM의 개수를 증가하지 않고 기존 DOM을 재활용(recycle)해 DOM의 개수를 일정하게 유지한다
		 * @method eg.InfiniteGrid#isRecycling
		 * @return {Boolean} Indicates whether the total number of added card elements is greater than the value of the count option. <ko>추가된 카드 엘리먼트의 전체 개수가 count 옵션의 값보다 큰지 여부</ko>
		 */
		isRecycling: function() {
			return (this.options.count > 0) && this._isRecycling;
		},
		/**
		 * Returns the list of group keys which belongs to card elements currently being maintained. You can use the append() or prepend() method to configure group keys so that multiple card elements can be managed at once. If you do not use these methods to configure group keys, it returns undefined as a group key.
		 * @ko 현재 유지하고 있는 카드 엘리먼트의 그룹 키 목록을 반환한다. 여러 개의 카드 엘리먼트를 묶어서 관리할 수 있도록 append() 메서드나 prepend() 메서드에서 그룹 키를 지정할 수 있다. append() 메서드나 prepend() 메서드에서 그룹 키를 지정하지 않았다면 'undefined'가 그룹 키로 반환된다
		 * @method eg.InfiniteGrid#getGroupKeys
		 * @return {Array} List of group keys <ko>그룹 키의 목록</ko>
		 */
		getGroupKeys: function() {
			return $.map(this.items, function(v) {
				return v.groupKey;
			});
		},
		/**
		 * Rearranges a layout.
		 * @ko 레이아웃을 다시 배치한다.
		 * @method eg.InfiniteGrid#layout
		 * @param {Boolean} [isRelayout=true] Indicates whether a card element is being relayouted <ko>카드 엘리먼트 재배치 여부</ko>
		 * @return {eg.InfiniteGrid} An instance of a module itself<ko>모듈 자신의 인스턴스</ko>
		 *
		 *  [private parameter]
		 * _addItems: added items
		 * _options: {
		 *	 isAppend: Checks whether the append() method is used to add a card element.
		 *	 removedCount: The number of deleted card elements to maintain the number of DOMs.
		 *}
		 */
		layout: function(isRelayout, _addItems, _options) {
			var options = $.extend({
				isAppend: true,
				removedCount: 0
			}, _options);
			isRelayout = typeof isRelayout === "undefined" || isRelayout;

			// for except case.
			if (!_addItems && !options.isAppend) {
				options.isAppend = true;
			}
			this._waitResource(isRelayout, options.isAppend ? _addItems : _addItems.reverse(), options);
			return this;
		},
		_layoutComplete: function(isRelayout, addItems, options) {
			var isInit = !this.items.length;

			// insert items (when appending)
			if (addItems && options.isAppend) {
				this.items = this.items.concat(addItems);
			}

			if (isInit) {
				$.each(addItems, function(i, v) {
					v.el.style.position = "absolute";
				});
			}

			if (isInit || isRelayout) {
				this._resetCols(this._measureColumns());
			} else {
				if (!addItems) {
					this._appendCols = this._prependCols.concat();
				}
			}
			this._layoutItems(isRelayout, addItems, options);
			this._postLayout(isRelayout, addItems, options);
		},
		_layoutItems: function(isRelayout, addItems, options) {
			var self = this;
			var items = addItems || this.items;

			$.each(items, function(i, v) {
				v.position = self._getItemLayoutPosition(isRelayout, v, options.isAppend);
			});
			if (addItems && !options.isAppend) {
				// insert items (when prepending)
				this.items = addItems.sort(function(p, c) {
					return p.position.y - c.position.y;
				}).concat(this.items);

				var y = this._getTopPositonY();
				if (y !== 0) {
					items = this.items;
					$.each(items, function(i, v) {
						v.position.y -= y;
					});
					this._syncCols(false);	// for prepending
					this._syncCols(true);	// for appending
				}
			}

			// for performance
			$.each(items, function(i, v) {
				if (v.el) {
					var style = v.el.style;
					style.left = v.position.x + "px";
					style.top = v.position.y + "px";
				}
			});
		},
		/**
		 * Adds a card element at the bottom of a grid layout. This method is available only if the isProcessing() method returns false.
		 * @ko 카드 엘리먼트를 그리드 레이아웃의 아래에 추가한다. isProcessing() 메서드의 반환값이 'false'일 때만 이 메서드를 사용할 수 있다
		 * 이 메소드는 isProcessing()의 반환값이 false일 경우에만 사용 가능하다.
		 * @method eg.InfiniteGrid#append
		 * @param {Array|String|jQuery} elements Array of the card elements to be added <ko>추가할 카드 엘리먼트의 배열</ko>
		 * @param {Number|String} [groupKey] The group key to be configured in a card element. It is set to "undefined" by default.<ko>추가할 카드 엘리먼트에 설정할 그룹 키. 생략하면 값이 'undefined'로 설정된다</ko>
		 * @return {Number} The number of added card elements <ko>추가된 카드 엘리먼트의 개수</ko>
		 */
		append: function($elements, groupKey) {
			if (this._isProcessing || $elements.length === 0) {
				return;
			}

			// convert jQuery instance
			$elements = $($elements);
			this._insert($elements, groupKey, true);
			return $elements.length;
		},
		/**
		 * Adds a card element at the top of a grid layout. This method is available only if the isProcessing() method returns false and the isRecycling() method returns true.
		 * @ko 카드 엘리먼트를 그리드 레이아웃의 위에 추가한다. isProcessing() 메서드의 반환값이 'false'이고, isRecycling() 메서드의 반환값이 'true'일 때만 이 메서드를 사용할 수 있다
		 * @method eg.InfiniteGrid#prepend
		 * @param {Array|String|jQuery} elements Array of the card elements to be added <ko>추가할 카드 엘리먼트 배열</ko>
		 * @param {Number|String} [groupKey] The group key to be configured in a card element. It is set to "undefined" by default.<ko>추가할 카드 엘리먼트에 설정할 그룹 키. 생략하면 값이 'undefined'로 설정된다</ko>
		 * @return {Number} The number of added card elements <ko>추가된 카드 엘리먼트의 개수</ko>
		 */
		prepend: function($elements, groupKey) {
			if (this._isProcessing || $elements.length === 0) {
				return;
			}

			// convert jQuery instance
			$elements = $($elements);
			this._insert($elements, groupKey, false);
			return $elements.length;
		},
		/**
		 * Clears added card elements and data.
		 * @ko 추가된 카드 엘리먼트와 데이터를 모두 지운다.
		 * @method eg.InfiniteGrid#clear
		 * @return {eg.InfiniteGrid} An instance of a module itself<ko>모듈 자신의 인스턴스</ko>
		 */
		clear: function() {
			this.el.innerHTML = "";
			this.el.style.height = "";
			this._reset();
			return this;
		},

		/**
		 * Returns a card element at the top of a layout.
		 * @ko 레이아웃의 맨 위에 있는 카드 엘리먼트를 반환한다.
		 * @method eg.InfiniteGrid#getTopElement
		 *
		 * @return {HTMLElement} Card element at the top of a layout. (if the position of card elements are same, it returns the first left element) <ko>레이아웃의 맨 위에 있는 카드 엘리먼트 (카드의 위치가 같은 경우, 왼쪽 엘리먼트가 반환된다)</ko>
		 */
		getTopElement: function() {
			var item = this._getTopItem();
			return item && item.el;
		},

		_getTopItem: function() {
			var item = null;
			var min = Infinity;
			$.each(this._getColItems(false), function(i, v) {
				if (v && v.position.y < min) {
					min = v.position.y;
					item = v;
				}
			});

			return item;
		},

		_getTopPositonY: function() {
			var item = this._getTopItem();
			return item ? item.position.y : 0;
		},

		/**
		 * Returns a card element at the bottom of a layout.
		 * @ko 레이아웃의 맨 아래에 있는 카드 엘리먼트를 반환한다.
		 * @method eg.InfiniteGrid#getBottomElement
		 *
		 * @return {HTMLElement} Card element at the bottom of a layout (if the position of card elements are same, it returns the first right element)<ko>레이아웃의 맨 아래에 있는 카드 엘리먼트 (카드의 위치가 같은 경우, 오른쪽 엘리먼트가 반환된다)</ko>
		 */
		getBottomElement: function() {
			var item = null;
			var max = -Infinity;
			var pos;
			$.each(this._getColItems(true), function(i, v) {
				pos = v ? v.position.y + v.size.height : 0;
				if (pos >= max) {
					max = pos;
					item = v;
				}
			});
			return item && item.el;
		},

		_postLayout: function(isRelayout, addItems, options) {
			if (!this._isProcessing) {
				return;
			}
			addItems = addItems || [];

			this.el.style.height = this._getContainerSize().height + "px";
			this._doubleCheckCount = RETRY;

			// refresh element
			this._topElement = this.getTopElement();
			this._bottomElement = this.getBottomElement();

			var distance = 0;
			if (!options.isAppend) {
				distance = addItems.length >= this.items.length ?
					0 : this.items[addItems.length].position.y;
				if (distance > 0) {
					this._prevScrollTop = this._getScrollTop() + distance;
					this.$view.scrollTop(this._prevScrollTop);
				}
			}

			// reset flags
			this._isProcessing = false;

			/**
			 * This event is fired when layout is successfully arranged through a call to the append(), prepend(), or layout() method.
			 * @ko 레이아웃 배치가 완료됐을 때 발생하는 이벤트. append() 메서드나 prepend() 메서드, layout() 메서드 호출 후 카드의 배치가 완료됐을 때 발생한다
			 * @name eg.InfiniteGrid#layoutComplete
			 * @event
			 *
			 * @param {Object} param The object of data to be sent to an event <ko>이벤트에 전달되는 데이터 객체</ko>
			 * @param {Array} param.target Rearranged card elements<ko>재배치된 카드 엘리먼트들</ko>
			 * @param {Boolean} param.isAppend Checks whether the append() method is used to add a card element. It returns true even though the layoutComplete event is fired after the layout() method is called. <ko>카드 엘리먼트가 append() 메서드로 추가됐는지 확인한다. layout() 메서드가 호출된 후 layoutComplete 이벤트가 발생해도 'true'를 반환한다.</ko>
			 * @param {Number} param.distance Distance the card element at the top of a grid layout has moved after the layoutComplete event is fired. In other words, it is the same as an increased height with a new card element added using the prepend() method <ko>그리드 레이아웃의 맨 위에 있던 카드 엘리먼트가 layoutComplete 이벤트 발생 후 이동한 거리. 즉, prepend() 메서드로 카드 엘리먼트가 추가돼 늘어난 높이다.</ko>
			 * @param {Number} param.croppedCount The number of deleted card elements to maintain the number of DOMs<ko>일정한 DOM 개수를 유지하기 위해, 삭제한 카드 엘리먼트들의 개수</ko>
			 */
			this.trigger(this._prefix + EVENTS.layoutComplete, {
				target: addItems.concat(),
				isAppend: options.isAppend,
				distance: distance,
				croppedCount: options.removedCount
			});

			// doublecheck!!! (workaround)
			if (!options.isAppend) {
				if (this._getScrollTop() === 0) {
					var self = this;
					clearInterval(this._doubleCheckTimer);
					this._doubleCheckTimer = setInterval(function() {
						if (self._getScrollTop() === 0) {
							self.trigger(self._prefix + EVENTS.prepend, {
								scrollTop: 0
							});
							(--self._doubleCheckCount <= 0) && clearInterval(self._doubleCheckTimer);
						}
					}, 500);
				}
			}
		},

		// $elements => $([HTMLElement, HTMLElement, ...])
		_insert: function($elements, groupKey, isAppend) {
			this._isProcessing = true;
			if (!this.isRecycling()) {
				this._isRecycling = (this.items.length + $elements.length) >= this.options.count;
			}
			if ($elements.length === 0) {
				return;
			}
			var elements = $elements.toArray();
			var $cloneElements = $(elements);
			var dummy = -this._clientHeight + "px";
			$.each(elements, function(i, v) {
				v.style.position = "absolute";
				v.style.top = dummy;
			});
			var removedCount = this._adjustRange(isAppend, $cloneElements);

			// prepare HTML
			this.$el[isAppend ? "append" : "prepend"]($cloneElements);
			this.layout(false, this._itemize($cloneElements, groupKey), {
				isAppend: isAppend,
				removedCount: removedCount
			});
		},
		_waitResource: function(isRelayout, addItems, options) {
			this._isProcessing = true;
			var needCheck = this._checkImageLoaded();
			var self = this;
			var callback = function() {
				self._layoutComplete(isRelayout, addItems, options);
			};
			if (needCheck.length > 0) {
				this._waitImageLoaded(needCheck, callback);
			} else {
				// convert to async
				setTimeout(function() {
					callback && callback();
				}, 0);
			}
		},

		_adjustRange: function (isTop, $elements) {
			var removedCount = 0;
			if (!this.isRecycling()) {
				return removedCount;
			}

			// trim $elements
			if (this.options.count <= $elements.length) {
				removedCount += isTop ? $elements.splice(0, $elements.length - this.options.count).length
					: $elements.splice(this.options.count).length;
			}
			var diff = this.items.length + $elements.length - this.options.count;
			var targets;
			var idx;
			if (diff <= 0 || (idx = this._getDelimiterIndex(isTop, diff)) < 0) {
				return removedCount;
			}
			if (isTop) {
				targets = this.items.splice(0, idx);
				this._syncCols(false);	// for prepending
			} else {
				targets = idx === this.items.length ? this.items.splice(0) : this.items.splice(idx, this.items.length - idx);
				this._syncCols(true);	// for appending;
			}

			// @todo improve performance
			$.each(targets, function(i, v) {
				idx = $elements.index(v.el);
				if (idx !== -1) {
					$elements.splice(idx, 1);
				} else {
					v.el.parentNode.removeChild(v.el);
				}
			});
			removedCount += targets.length;
			return removedCount;
		},
		_getDelimiterIndex: function(isTop, removeCount) {
			var len = this.items.length;
			if (len === removeCount) {
				return len;
			}
			var i;
			var idx = 0;
			var baseIdx = isTop ? removeCount - 1 : len - removeCount;
			var targetIdx = baseIdx + (isTop ? 1 : -1);
			var groupKey = this.items[baseIdx].groupKey;
			if (groupKey != null && groupKey === this.items[targetIdx].groupKey) {
				if (isTop) {
					for (i = baseIdx; i > 0; i--) {
						if (groupKey !== this.items[i].groupKey) {
							break;
						}
					}
					idx =  i === 0 ? -1 : i + 1;
				} else {
					for (i = baseIdx; i < len; i++) {
						if (groupKey !== this.items[i].groupKey) {
							break;
						}
					}
					idx = i === len ? -1 : i;
				}
			} else {
				idx = isTop ? targetIdx : baseIdx;
			}
			return idx;
		},

		// fit size
		_fit: function(applyDom) {
			// for caching
			if (this.options.count <= 0) {
				this._fit = function() {
					return 0;
				};
				return 0;
			}
			var y = this._getTopPositonY();
			if (y !== 0) {
				// need to fit
				$.each(this.items, function(i, v) {
					v.position.y -= y;
					applyDom && (v.el.style.top = v.position.y + "px");
				});
				this._syncCols(false);	// for prepending
				this._syncCols(true);	// for appending
				applyDom && (this.el.style.height = this._getContainerSize().height + "px");
			}
			return y;
		},

		/**
		* Removes extra space caused by adding card elements.
		* @ko 카드 엘리먼트를 추가한 다음 생긴 빈 공간을 제거한다
		* @method eg.InfiniteGrid#fit
		* @deprecated since version 1.3.0
		* @return {Number} Actual length of space removed (unit: px) <ko>빈 공간이 제거된 실제 길이(단위: px)</ko>
		*/
		fit: function() {
			return this._fit(true);
		},

		_reset: function() {
			this._isProcessing = false;
			this._topElement = null;
			this._bottomElement = null;
			this._isRecycling = false;
			this._prevScrollTop = 0;
			this._equalItemSize = 0;
			this._resizeTimeout = null;
			this._doubleCheckTimer = null;
			this._doubleCheckCount = RETRY;
			this._resetCols(this._appendCols.length || 0);
			this.items = [];
		},
		_checkImageLoaded: function() {
			return this.$el.find("img").filter(function(k, v) {
				if (v.nodeType && ($.inArray(v.nodeType, [1,9,11]) !== -1)) {
					return !v.complete;
				}
			}).toArray();
		},
		_waitImageLoaded: function(needCheck, callback) {
			var checkCount = needCheck.length;
			var onCheck = function(e) {
				checkCount--;
				$(e.target).off("load error");
				checkCount <= 0 && callback && callback();
			};
			var $el;
			var self = this;
			$.each(needCheck, function(i, v) {
				$el = $(v);

				// workaround for IE
				if (self._isIE) {
					var url = v.getAttribute("src");
					v.setAttribute("src", "");
					v.setAttribute("src", url);
				}
				$el.on("load error", onCheck);
			});
		},
		_measureColumns: function() {
			this.el.style.width = null;
			this._containerWidth = this.$el.innerWidth();
			this._columnWidth = this._getColumnWidth() || this._containerWidth;
			var cols = this._containerWidth / this._columnWidth;
			var excess = this._columnWidth - this._containerWidth % this._columnWidth;

			// if overshoot is less than a pixel, round up, otherwise floor it
			cols = Math.max(Math[ excess && excess <= 1 ? "round" : "floor" ](cols), 1);
			return cols || 0;
		},
		_resetCols: function(count) {
			count = typeof count === "undefined" ? 0 : count;
			var arr = [];
			while (count--) {
				arr.push(0);
			}
			this._appendCols = arr.concat();
			this._prependCols = arr.concat();
		},
		_getContainerSize: function() {
			return {
				height: Math.max.apply(Math, this._appendCols),
				width: this._containerWidth
			};
		},
		_getColumnWidth: function() {
			var el =  this.items[0] && this.items[0].el;
			var width = 0;
			if (el) {
				var $el = $(el);
				width = $el.innerWidth();
				if (this.options.isEqualSize) {
					this._equalItemSize = {
						width: width,
						height: $el.innerHeight()
					};
				}
			}
			return width;
		},
		_syncCols: function(isBottom) {
			if (!this.items.length) {
				return;
			}
			var items = this._getColItems(isBottom);
			var col = isBottom ? this._appendCols : this._prependCols;
			var len = col.length;
			var i;
			for (i = 0; i < len; i++) {
				col[i] = items[i].position.y + (isBottom ? items[i].size.height : 0);
			}
		},
		_getColIdx: function(item) {
			return parseInt(item.position.x / parseInt(this._columnWidth, 10), 10);
		},
		_getColItems: function(isBottom) {
			var len = this._appendCols.length;
			var colItems = new Array(len);
			var item;
			var idx;
			var count = 0;
			var i = isBottom ? this.items.length - 1 : 0;
			while (item = this.items[i]) {
				idx = this._getColIdx(item);
				if (!colItems[idx]) {
					colItems[idx] = item;
					if (++count === len) {
						return colItems;
					}
				}
				i += isBottom ? -1 : 1;
			}
			return colItems;
		},
		_itemize: function(elements, groupKey) {
			return $.map(elements, function(v) {
				return {
					el: v,
					position: {
						x: 0,
						y: 0
					},
					groupKey: typeof groupKey === "undefined" ? null : groupKey
				};
			});
		},
		_getItemLayoutPosition: function(isRelayout, item, isAppend) {
			if (!item || !item.el) {
				return;
			}
			var $el = $(item.el);
			if (isRelayout || !item.size) {
				item.size = this._getItemSize($el);
			}
			var cols = isAppend ? this._appendCols : this._prependCols;
			var y = Math[isAppend ? "min" : "max"].apply(Math, cols);
			var shortColIndex;
			if (isAppend) {
				shortColIndex = $.inArray(y, cols);
			} else {
				var i = cols.length;
				while (i-- >= 0) {
					if (cols[i] === y) {
						shortColIndex = i;
						break;
					}
				}
			}
			cols[shortColIndex] = y + (isAppend ? item.size.height : -item.size.height);

			return {
				x: this._columnWidth * shortColIndex,
				y: isAppend ? y : y - item.size.height
			};
		},
		_getItemSize: function($el) {
			return this._equalItemSize || {
				width: $el.innerWidth(),
				height: $el.innerHeight()
			};
		},
		/**
		 * Removes a card element on a grid layout.
		 * @ko 그리드 레이아웃의 카드 엘리먼트를 삭제한다.
		 * @method eg.InfiniteGrid#remove
		 * @param {HTMLElement} Card element to be removed <ko>삭제될 카드 엘리먼트</ko>
		 * @return {Object}  Removed card element <ko>삭제된 카드 엘리먼트 정보</ko>
		 */
		remove: function(element) {
			var item = null;
			var idx = -1;
			for (var i = 0, len = this.items.length; i < len; i++) {
				if (this.items[i].el === element) {
					idx = i;
					break;
				}
			}
			if (~idx) {
				// remove item information
				item = $.extend({}, this.items[idx]);
				this.items.splice(idx, 1);

				// remove item element
				item.el.parentNode.removeChild(item.el);
			}
			return item;
		},
		/**
		 * Destroys elements, properties, and events used on a grid layout.
		 * @ko 그리드 레이아웃에 사용한 엘리먼트와 속성, 이벤트를 해제한다
		 * @method eg.InfiniteGrid#destroy
		 */
		destroy: function() {
			this.off();
			this.$view.off("resize", this._onResize)
				.off("scroll", this._onScroll);
			this._reset();
		}
	});
});
/**
 * A jQuery plugin available in the eg.InfiniteGrid module.
 * @ko eg.InfiniteGrid 모듈의 jQuery 플러그인
 * @method jQuery.infiniteGrid
 * @example
		 <ul id="grid">
				<li class="item">
					<div>test1</div>
				</li>
				<li class="item">
					<div>test3</div>
				</li>
			</ul>
		<script>
	// create
	$("#grid").infiniteGrid();
	// method
	$("#grid").infiniteGrid("option","count","60"); //Set option
	$("#grid").infiniteGrid("instance"); // Return infiniteGrid instance
	$("#grid").infiniteGrid("getBottomElement"); // Get bottom element
	</script>
 * @see eg.InfiniteGrid
 */
/**
 * A jQuery custom event of the eg.InfiniteGrid module. This event is fired when a layout is successfully arranged.
 *
 * @ko eg.InfiniteGrid 모듈의 jQuery 커스텀 이벤트. 레이아웃 배치가 완료됐을 때 발생한다
 * @name jQuery#infiniteGrid:layoutComplete
 * @event
 * @example
		 <ul id="grid">
				<li class="item">
					<div>test1</div>
				</li>
				<li class="item">
					<div>test3</div>
				</li>
			</ul>
		<script>
	// create
	$("#grid").infiniteGrid();
	// event
	$("#grid").on("infiniteGrid:layoutComplete",callback);
	$("#grid").off("infiniteGrid:layoutComplete",callback);
	$("#grid").trigger("infiniteGrid:layoutComplete",callback);
	</script>
 * @see eg.InfiniteGrid#event:layoutComplete
 */
/**
 * A jQuery custom event of the eg.InfiniteGrid module. This event is fired when a card element must be added at the bottom of a grid layout
 *
 * @ko eg.InfiniteGrid 모듈의 jQuery 커스텀 이벤트. 그리드 레이아웃 아래에 카드 엘리먼트가 추가돼야 할 때 발생한다.
 * @name jQuery#infiniteGrid:append
 * @event
 * @example
		 <ul id="grid">
				<li class="item">
					<div>test1</div>
				</li>
				<li class="item">
					<div>test3</div>
				</li>
			</ul>
		<script>
	// create
	$("#grid").infiniteGrid();
	// event
	$("#grid").on("infiniteGrid:append",callback);
	$("#grid").off("infiniteGrid:append",callback);
	$("#grid").trigger("infiniteGrid:append",callback);
	</script>
 * @see eg.InfiniteGrid#event:append
 */
/**
 * A jQuery custom event of the eg.InfiniteGrid module. This event is fired when a card element must be added at the top of a grid layout
 *
 * @ko eg.InfiniteGrid 모듈의 jQuery 커스텀 이벤트. 그리드 레이아웃 위에 카드 엘리먼트가 추가돼야 할 때 발생한다
 * @name jQuery#infiniteGrid:prepend
 * @event
 * @example
		 <ul id="grid">
				<li class="item">
					<div>test1</div>
				</li>
				<li class="item">
					<div>test3</div>
				</li>
			</ul>
		<script>
	// create
	$("#grid").infiniteGrid();
	// event
	$("#grid").on("infiniteGrid:prepend",callback);
	$("#grid").off("infiniteGrid:prepend",callback);
	$("#grid").trigger("infiniteGrid:prepend",callback);
	</script>
 * @see eg.InfiniteGrid#event:prepend
 */
