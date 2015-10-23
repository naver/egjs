// jscs:disable maximumLineLength
eg.module("infiniteGrid", ["jQuery", eg, window, "Outlayer"], function($, ns, global, Outlayer) {
	// jscs:enable validateLineBreaks, maximumLineLength
	if (!Outlayer) {
		ns.InfiniteGrid = ns.Class({});
		return;
	}

	// for IE -- start
	var hasEventListener = !!global.addEventListener;
	var eventPrefix = hasEventListener ? "" : "on";
	var bindMethod = hasEventListener ? "addEventListener" : "attachEvent";
	var unbindMethod = hasEventListener ? "removeEventListener" : "detachEvent";
	function bindImage(ele, callback) {
		ele[bindMethod](eventPrefix + "load", callback, true);
		ele[bindMethod](eventPrefix + "error", callback, true);
	}
	function unbindImage(ele, callback) {
		ele[unbindMethod](eventPrefix + "load", callback, true);
		ele[unbindMethod](eventPrefix + "error", callback, true);
	}

	// for IE -- end
	function clone(target, source, what) {
		var s;
		$.each(what, function(i, v) {
			s = source[v];
			if (s != null) {
				if ($.isArray(s)) {
					target[v] = $.merge([], s);
				} else if ($.isPlainObject(s)) {
					target[v] = $.extend(true, {}, s);
				} else {
					target[v] = s;
				}
			}
		});
		return target;
	}

	var InfiniteGridCore = Outlayer.create("InfiniteGrid");
	$.extend(InfiniteGridCore.prototype, {
		// @override (from layout)
		_resetLayout: function() {
			if (!this._isLayoutInited) {
				this._registGroupKey(this.options.defaultGroupKey, this.items);
			}
			this.element.style.width = null;
			this.getSize();	// create size property
			this._measureColumns();
		},

		// @override
		_getContainerSize: function() {
			return {
				height: Math.max.apply(Math, this._appendCols),
				width: this.size.outerWidth
			};
		},

		// @override
		_getItemLayoutPosition: function(item) {
			if (this._equalItemSize) {
				item.size = this._equalItemSize;
			} else {
				item.getSize();
			}
			(item.isAppend == null) && (item.isAppend = true);
			var y;
			var shortColIndex;
			var isAppend = item.isAppend;
			var cols = isAppend ? this._appendCols : this._prependCols;
			y = Math[isAppend ? "min" : "max"].apply(Math, cols);
			shortColIndex = $.inArray(y, cols);
			cols[shortColIndex] = y + (isAppend ?
				item.size.outerHeight : -item.size.outerHeight);

			return {
				x: this.columnWidth * shortColIndex,
				y: isAppend ? y : y - item.size.outerHeight
			};
		},
		resetLayout: function() {
			this._resetLayout();
			this._isLayoutInited = true;
		},
		updateCols: function(isAppend) {
			var col = isAppend ? this._appendCols : this._prependCols;
			var items = this.getColItems(isAppend);
			var base = this._isFitted || isAppend ? 0 : this._getMinY(items);
			var i = 0;
			var len = col.length;
			var item;
			for (; i < len; i++) {
				if (item = items[i]) {
					col[i] = item.position.y + (isAppend ? item.size.outerHeight : -base);
				} else {
					col[i] = 0;
				}
			}
			return base;
		},
		_getMinY: function(items) {
			return Math.min.apply(Math, $.map(items, function(v) {
				return v ? v.position.y : 0;
			}));
		},
		_measureColumns: function() {
			var containerWidth = this.size.outerWidth;
			var columnWidth = this._getColumnWidth();
			var cols = containerWidth / columnWidth;
			var excess = columnWidth - containerWidth % columnWidth;

			// if overshoot is less than a pixel, round up, otherwise floor it
			cols = Math.max(Math[ excess && excess < 1 ? "round" : "floor" ](cols), 1);

			// reset column Y
			this._appendCols = [];
			this._prependCols = [];
			while (cols--) {
				this._appendCols.push(0);
				this._prependCols.push(0);
			}
		},
		_getColumnWidth: function() {
			var el = this.items[0] && this.items[0].element;
			var size;
			if (el) {
				/* jshint ignore:start */
				size = getSize(el);
				/* jshint ignore:end */
			} else {
				size = {
					outerWidth: 0,
					outerHeight: 0
				};
			}
			this.options.isEqualSize && (this._equalItemSize = size);
			this.columnWidth = size.outerWidth || this.size.outerWidth;
			return this.columnWidth;
		},
		_getColIdx: function(item) {
			return parseInt(item.position.x / parseInt(this.columnWidth, 10), 10);
		},
		getColItems: function(isTail) {
			var len = this._appendCols.length;
			var colItems = new Array(len);
			var item;
			var idx;
			var count = 0;
			var i = isTail ? this.items.length - 1 : 0;
			while (item = this.items[i]) {
				idx = this._getColIdx(item);
				if (!colItems[idx]) {
					colItems[idx] = item;
					if (++count === len) {
						return colItems;
					}
				}
				i += isTail ? -1 : 1;
			}
			return colItems;
		},
		clone: function(target, source) {
			clone(target, source, [
				"_equalItemSize",
				"_appendCols",
				"_prependCols",
				"columnWidth",
				"size",
				"options"
				]);
			target.items = target.items || [];
			target.items.length = source.items.length;
			$.each(source.items, function(i) {
				target.items[i] = clone(target.items[i] || {}, source.items[i],
					["position", "size", "isAppend", "groupKey"]);
			});
			return target;
		},
		itemize: function(elements, groupKey) {
			var items = this._itemize(elements);
			this._registGroupKey(groupKey, items);
			return items;
		},
		_registGroupKey: function(groupKey, array) {
			if (groupKey != null) {
				var i = 0;
				var v;
				while (v = array[i++]) {
					v.groupKey = groupKey;
				}
			}
		},

		// @override
		destroy: function() {
			this.off();
			Outlayer.prototype.destroy.apply(this);
		}
	});

	/**
	 * To build Grid layout UI
	 * InfiniteGrid is composed of Outlayer. but this component supports recycle-dom.
	 * the more you add contents, a number of DOM are fixed.
	 * @group egjs
	 * @ko 그리드 레이아웃을 구성하는 UI 컴포넌트. InfiniteGrid는 Outlayer로 구성되어 있다. 하지만, 이 컴포넌트는 recycle-dom을 지원한다.
	 * 컨텐츠를 계속 증가하면 할수록 일정한 DOM 개수를 유지할수 있다.
	 * @class
	 * @name eg.InfiniteGrid
	 * @extends eg.Component
	 *
	 * @param {HTMLElement|String|jQuery} element wrapper element <ko>기준 요소</ko>
	 * @param {Object} [options]
	 * @param {Number} [options.itemSelector] specifies which child elements will be used as item elements in the layout. <ko>레이아웃의 아이템으로 사용될 엘리먼트들의 셀렉터</ko>
	 * @param {Boolean} [options.isEqualSize] determine if the size of all of items are same. <ko> 모든 아이템의 사이즈가 동일한지를 지정한다</ko>
	 * @param {Boolean} [options.defaultGroupKey] when initialzed if you have items in markup, groupkey of them are 'defaultGroupkey' <ko>초기화할때 마크업에 아이템이 있다면, defalutGroupKey를 groupKey로 지정한다</ko>
	 * @param {Boolean} [options.count=30] if count is more than zero, grid is recyclied. <ko>count값이 0보다 클 경우, 그리드는 일정한 dom 개수를 유지한다</ko>
	 *
	 * @codepen {"id":"xwYVNK", "ko":"InfiniteGrid 기본 예제", "en":"InfiniteGrid basic example", "collectionId":"DPYEww", "height": 403}
	 *  @support {"ie": "8+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	 *
	 *  @see Outlayer {@link https://github.com/metafizzy/outlayer}
	 *
	 * @example
	 	<!-- HTML -->
		<ul id="grid">
		    <li class="item">
		      <div>테스트1</div>
		    </li>
		    <li class="item">
		      <div>테스트2</div>
		    </li>
		    <li class="item">
		      <div>테스트3</div>
		    </li>
		    <li class="item">
		      <div>테스트4</div>
		    </li>
		    <li class="item">
		      <div>테스트5</div>
		    </li>
		    <li class="item">
		      <div>테스트6</div>
		    </li>
	  	</ul>
		<script>
	 	var some = new eg.InfiniteGrid("#grid", {
		    itemSelector : ".item"
		}).on("layoutComplete", function(e) {
			// ...
		});
	 	</script>
	 */
	ns.InfiniteGrid = ns.Class.extend(ns.Component, {
		construct: function(el, options) {
			var opts = $.extend({
				"isEqualSize": false,
				"defaultGroupKey": null,
				"count": 30
			}, options);
			opts.transitionDuration = 0;	// don't use this option.
			opts.isInitLayout = false;	// isInitLayout is always 'false' in order to controll layout.
			opts.isResizeBound = false;	// isResizeBound is always 'false' in order to controll layout.
			this.core = new InfiniteGridCore(el, opts)
				.on("layoutComplete", $.proxy(this._onlayoutComplete, this));
			this.$global = $(global);
			this._reset();
			this.core.$element.children().length > 0 && this.layout();
			this._onResize = $.proxy(this._onResize, this);
			this.$global.on("resize", this._onResize);

		},
		_onResize: function() {
			if (this.resizeTimeout) {
				clearTimeout(this.resizeTimeout);
			}
			var self = this;
			function delayed() {
				self.core.element.style.width = null;
				self.core.needsResizeLayout() && self.layout();
				delete self.resizeTimeout;
			}
			this.resizeTimeout = setTimeout(delayed, 100);
		},
		/**
		 * Get current status
		 * @ko infiniteGrid의 현재상태를 반환한다.
		 * @method eg.InfiniteGrid#getStatue
		 * @return {Object} infiniteGrid status Object
		 */
		getStatus: function() {
			var data = [];
			var p;
			for (p in this) {
				if (this.hasOwnProperty(p) && /^_/.test(p)) {
					data.push(p);
				}
			}
			return {
				core: this.core.clone({}, this.core),
				data: clone({}, this, data),
				html: this.core.$element.html(),
				cssText: this.core.element.style.cssText
			};
		},
		/**
		 * Set to current status
		 * @ko infiniteGrid의 현재상태를 설정한다.
		 * @method eg.InfiniteGrid#setStatus
		 * @param {Object} status Object
		 */
		setStatus: function(status) {
			this.core.element.style.cssText = status.cssText;
			this.core.$element.html(status.html);
			this.core.items = this.core.itemize(this.core.$element.children().toArray());
			this.core.clone(this.core, status.core);
			$.extend(this, status.data);
		},
		/**
		 * Check if element is appending or prepending
		 * @ko append나 prepend가 진행중일 경우 true를 반환한다.
		 * @method eg.InfiniteGrid#isProcessing
		 * @return {Boolean}
		 */
		isProcessing: function() {
			return this._isProcessing;
		},
		/**
		 * Check if elements are recycling mode
		 * @ko recycle 모드 여부를 반환한다.
		 * @method eg.InfiniteGrid#isRecycling
		 * @return {Boolean}
		 */
		isRecycling: function() {
			return this.core.options.count > 0 && this._isRecycling;
		},
		/**
		 * Get group keys
		 * @ko 그룹키들을 반환한다.
		 * @method eg.InfiniteGrid#getGroupKeys
		 * @return {Array} groupKeys
		 */
		getGroupKeys: function() {
			var result = [];
			if (this.core._isLayoutInited) {
				var i = 0;
				var item;
				while (item = this.core.items[i++]) {
					result.push(item.groupKey);
				}
			}
			return result;
		},
		/**
		 * Rearrang layout
		 * @ko 레이아웃을 재배치한다.
		 * @method eg.InfiniteGrid#layout
		 */
		layout: function() {
			this._isProcessing = true;
			this._isAppendType = true;
			var i = 0;
			var v;
			while (v = this.core.items[i++]) {
				v.isAppend = true;
			}
			this.core.layout();
		},
		/**
		 * Append elemensts
		 * @ko 엘리먼트를 append 한다.
		 * @method eg.InfiniteGrid#append
		 * @param {Array} elements to be appended elements <ko>append될 엘리먼트 배열</ko>
		 * @param {Number|String} [groupKey] to be appended groupkey of elements<ko>append될 엘리먼트의 그룹키</ko>
		 * @return {Number} length a number of elements
		 */
		append: function(elements, groupKey) {
			if (this._isProcessing ||  elements.length === 0) {
				return;
			}
			this._isProcessing = true;
			if (!this._isRecycling) {
				this._isRecycling =
				(this.core.items.length + elements.length) >= this.core.options.count;
			}
			this._insert(elements, groupKey, true);
			return elements.length;
		},
		/**
		 * Prepend elemensts
		 * @ko 엘리먼트를 prepend 한다.
		 * @method eg.InfiniteGrid#prepend
		 * @param {Array} elements to be prepended elements <ko>prepend될 엘리먼트 배열</ko>
		 * @param {Number|String} [groupKey] to be prepended groupkey of elements<ko>prepend될 엘리먼트의 그룹키</ko>
		 * @return {Number} length a number of elements
		 */
		prepend: function(elements, groupKey) {
			if (!this.isRecycling() || this._removedContent === 0 ||
				this._isProcessing || elements.length === 0) {
				return;
			}
			this._isProcessing = true;
			this._fit();
			if (elements.length - this._removedContent  > 0) {
				elements = elements.slice(elements.length - this._removedContent);
			}
			this._insert(elements, groupKey, false);
			return elements.length;
		},
		/**
		 * Clear elements and data
		 * @ko 엘리먼트와 데이터를 지운다.
		 * @method eg.InfiniteGrid#clear
		 */
		clear: function() {
			this.core.$element.empty();
			this.core.items.length = 0;
			this._reset();
			this.layout();
		},

		/**
		 * Get top element
		 * @ko 가장 위에 있는 엘리먼트를 반환한다.
		 * @method eg.InfiniteGrid#getTopElement
		 *
		 * @return {HTMLElement} element
		 */
		getTopElement: function() {
			var item;
			var min = Infinity;
			$.each(this.core.getColItems(false), function(i, v) {
				if (v && v.position.y < min) {
					min = v.position.y;
					item = v;
				}
			});
			return item ? item.element : null;
		},
		/**
		 * Get bottom element
		 * @ko 가장 아래에 있는 엘리먼트를 반환한다.
		 * @method eg.InfiniteGrid#getBottomElement
		 *
		 * @return {HTMLElement} element
		 */
		getBottomElement: function() {
			var item;
			var max = -Infinity;
			$.each(this.core.getColItems(true), function(i, v) {
				if (v && v.position.y + v.size.outerHeight > max) {
					max = v.position.y + v.size.outerHeight;
					item = v;
				}
			});
			return item ? item.element : null;
		},
		_onlayoutComplete: function(e) {
			var distance = 0;
			var isAppend = this._isAppendType;
			if (isAppend === false) {
				this._isFitted = false;
				this._fit(true);
				distance = e.length > this.core.items.length ?
					0 : this.core.items[e.length].position.y;
			}

			// reset flags
			this._reset(true);

			/**
			 * Occurs when layout is completed (after append / after prepend / after layout)
			 * @ko 레이아웃이 완료 되었을 때 발생하는 이벤트 (append/prepand/layout 메소드 호출 후, 아이템의 배치가 완료되었을때 발생)
			 * @name eg.InfiniteGrid#layoutComplete
			 * @event
			 *
			 * @param {Object} param
			 * @param {Array} param.target target rearranged elements<ko>재배치된 엘리먼트들</ko>
			 * @param {Boolean} param.isAppend isAppend determine if append or prepend (value is true when call layout method)<ko>아이템이 append로 추가되었는지, prepend로 추가되었는지를 반한환다. (layout호출시에는 true)</ko>
			 * @param {Number} param.distance distance<ko>layout 전의 최상단 엘리먼트의 거리</ko>
			 */
			this.trigger("layoutComplete", {
				target: e.concat(),
				isAppend: isAppend,
				distance: distance
			});
		},
		_insert: function(elements, groupKey, isAppend) {
			if (elements.length === 0) {
				return;
			}
			this._isAppendType = isAppend;
			var i = 0;
			var item;
			var items = this.core.itemize(elements, groupKey);
			while (item = items[i++]) {
				item.isAppend = isAppend;
			}
			if (isAppend) {
				this.core.items = this.core.items.concat(items);
			} else {
				this.core.items = items.concat(this.core.items.slice(0));
				items = items.reverse();
			}
			if (this.isRecycling()) {
				this._adjustRange(isAppend, elements);
			}
			var noChild = this.core.$element.children().length === 0;
			this.core.$element[isAppend ? "append" : "prepend"](elements);
			noChild && this.core.resetLayout();		// for init-items

			var needCheck = this._checkImageLoaded(elements);
			var checkCount = needCheck.length;
			checkCount > 0 ? this._waitImageLoaded(items, needCheck) :
					this.core.layoutItems(items, true);
		},
		_adjustRange: function (isTop, elements) {
			var diff = this.core.items.length - this.core.options.count;
			var targets;
			var idx;
			if (diff <= 0 || (idx = this._getDelimiterIndex(isTop, diff)) < 0) {
				return;
			}
			if (isTop) {
				targets = this.core.items.slice(0, idx);
				this.core.items = this.core.items.slice(idx);
				this._isFitted = false;
			} else {
				targets = this.core.items.slice(idx);
				this.core.items = this.core.items.slice(0, idx);
			}

			// @todo improve performance
			var i = 0;
			var item;
			var el;
			var m = elements instanceof $ ? "index" : "indexOf";
			while (item = targets[i++]) {
				el = item.element;
				idx = elements[m](el);
				if (idx !== -1) {
					elements.splice(idx, 1);
				} else {
					el.parentNode.removeChild(el);
				}
			}
			this._removedContent += isTop ? targets.length : -targets.length;

		},
		_getDelimiterIndex: function(isTop, removeCount) {
			var len = this.core.items.length;
			var i;
			var idx = 0;
			var baseIdx = isTop ? removeCount - 1 : len - removeCount;
			var targetIdx = baseIdx + (isTop ? 1 : -1);
			var groupKey = this.core.items[baseIdx].groupKey;
			if (groupKey != null && groupKey === this.core.items[targetIdx].groupKey) {
				if (isTop) {
					for (i = baseIdx; i > 0; i--) {
						if (groupKey !== this.core.items[i].groupKey) {
							break;
						}
					}
					idx =  i === 0 ? -1 : i + 1;
				} else {
					for (i = baseIdx; i < len; i++) {
						if (groupKey !== this.core.items[i].groupKey) {
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
			if (this.core.options.count <= 0) {
				this._fit = function() {
					return false;
				};
				this._isFitted = true;
				return false;
			}

			if (this._isFitted) {
				return false;
			}

			var item;
			var height;
			var i = 0;
			var y = this.core.updateCols();	// for prepend
			while (item = this.core.items[i++]) {
				item.position.y -= y;
				applyDom && item.css({
					"top": item.position.y + "px"
				});
			}
			this.core.updateCols(true);	// for append
			height = this.core._getContainerSize().height;
			applyDom && this.core._setContainerMeasure(height, false);
			this._isFitted = true;
			return true;
		},

		/**
		 * Remove empty space that is removed by append action.
		 * @ko append에 의해 제거된 빈공간을 제거한다.
		 * @return {Boolean} isFitted if empty space is removed, value is true <ko>빈공간이 제거되면 true값을 반환</ko>
		 * @method eg.InfiniteGrid#fit
		 */
		fit: function() {
			return this._fit(true);
		},
		_reset: function(isLayoutComplete) {
			if (!isLayoutComplete) {
				this._isFitted = true;
				this._isRecycling = false;
				this._removedContent = 0;
			}
			this._isAppendType = null;
			this._isProcessing = false;
		},
		_checkImageLoaded: function(elements) {
			var needCheck = [];
			$(elements).each(function(k, v) {
				if (v.nodeName === "IMG") {
					!v.complete && needCheck.push(v);
				} else if (v.nodeType &&
					(v.nodeType === 1 || v.nodeType === 9 || v.nodeType === 11)) {	// ELEMENT_NODE, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE
					needCheck = needCheck.concat($(v).find("img").filter(function(fk, fv) {
						return !fv.complete;
					}).toArray());
				}
			});
			return needCheck;
		},
		_waitImageLoaded: function(items, needCheck) {
			var core = this.core;
			var checkCount = needCheck.length;
			var onCheck;

			if (hasEventListener) {
				onCheck = function() {
					checkCount--;
					if (checkCount <= 0) {
						unbindImage(core.element, onCheck);
						core.layoutItems(items, true);
					}
				};
				bindImage(this.core.element, onCheck);
			} else {
				onCheck = function(e) {
					checkCount--;
					unbindImage(e.srcElement, onCheck);
					if (checkCount <= 0) {
						core.layoutItems(items, true);
					}
				};
				$.each(needCheck, function(k, v) {
					bindImage(v, onCheck);
				});
			}
		},
		/**
		 * Release resources and off custom events
		 * @ko 모든 커스텀 이벤트와 자원을 해제한다.
		 * @method eg.InfiniteGrid#destroy
		 */
		destroy: function() {
			if (this.core) {
				this.core.destroy();
				this.core = null;
			}
			this.$global.off("resize", this._onResize);
			this.off();
		}
	});
});
