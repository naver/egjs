eg.module("infiniteGrid",[window.jQuery, eg, window.Outlayer],function($, ns, Outlayer){
	/**
	 * InfiniteGrid
	 * @group EvergreenJs
	 * @ko InfiniteGrid
	 * @class
	 * @name eg.InfiniteGrid
	 * @extends eg.Component
	 *
	 * @param {HTMLElement|String|jQuery} element wrapper element <ko>기준 요소</ko>
	 * @param {Object} options
	 * @param {Number} options.count
	 * @param {Number} options.itemSelector
	 * @param {Boolean} options.equalSize
	 * @param {Boolean} options.isLayoutInstant
	 */
	if(!Outlayer) {
		ns.InfiniteGrid = $.noop();
		return;
	}

	var InfiniteGrid = Outlayer.create("InfiniteGrid", {
		"transitionDuration" : 0,
		"isLayoutInstant" : true,
		"equalSize" : false,
		"count" : 30
	});
	$.extend(InfiniteGrid.prototype, {
		// @override
		layout : function() {
			this._isProcessing = true;
			this._addType = null;
			for(var i=0,v; v = this.items[i]; i++) {
				v.insertType = "append";
			}
			Outlayer.prototype.layout.apply(this);
		},
		// @override (from layout)
		_resetLayout : function() {
			if(!this._isLayoutInited) {
				this._addType = null;
				this._isFitted = true;
				this._isProcessing = true;
				this._isRecycling = false;
				this._contentCount = this.items.length;
				this.on("layoutComplete",$.proxy(function() {
					switch(this._addType) {
						case "prepend" : 
							//@todo 좌표 이동에 대한 별도의 이벤트 구현 필요
							this._isFitted = false;
							this._fit(true);
							break;
						case "append" :
							break;
						default :
							break;
					}
					this._isProcessing = false;
				},this));
			}
			this.getSize();	// create size property
			this._measureColumns();
		},
		// @override
		_getContainerSize : function() {
			return {
				height: Math.max.apply( Math, this._appendCols ),
				width : this.size.outerWidth
			};
		},
		// @override
		_getItemLayoutPosition : function(item) {
			if(this._equalItemSize) {
				item.size = $.extend({}, this._equalItemSize);
			} else {
				item.getSize();
			}
			!item.insertType && (item.insertType = "append");
			var cols, y, shortColIndex = -1;
			if(item.insertType === "append") {
				cols = this._appendCols;
				y = Math.min.apply( Math, cols );
				shortColIndex = $.inArray( y , cols );
				cols[shortColIndex] = y + item.size.outerHeight;
			} else {
				cols = this._prependCols,
				y = Math.max.apply( Math, cols );
				var i = cols.length;
				while(i--) {
					if(cols[i] === y) {
						shortColIndex = i;
						break;
					}
				}
				y -= item.size.outerHeight;
				cols[shortColIndex] = y;
			}
			return {
				x: this.columnWidth * shortColIndex,
				y: y
			};
		},
		_getColumnWidth : function() {
			if(!this.columnWidth) {
				var el = this.items[0] && this.items[0].element,
					size = el && 
					/* jshint ignore:start */
					getSize(el) ||
					/* jshint ignore:end */
					{
						outerWidth : 0,
						outerHeight : 0
					};
				this.options.equalSize && (this._equalItemSize = $.extend({}, size));
				this.columnWidth = size.outerWidth || this.size.outerWidth;
			}
			return this.columnWidth;
		},

		// current status (for persist)
		getStatus : function() {
			return {
				data : this._cloneStatus({}, this),
				html : this.$element.html(),
				cssText : this.element.style.cssText
			};
		},
		// set previous status (for persist)
		setStatus : function(status) {
			// this.init(null, true);
			this.element.style.cssText = status.cssText;
			this.$element.html(status.html);
			this.items = this._itemize( this.$element.children().toArray() );
			this._cloneStatus(this, status.data);
		},
		// check if element is appending or prepending
		isProcessing : function() {
			return !!this._isProcessing;
		},
		// check if elements are recycling
		isRecycling : function() {
			return this.options.count > 0 && !!this._isRecycling;
		},
		// return page key range [0, 20]
		getGroupRange : function() {
			if(this._isLayoutInited) {
				return [this.items[0].groupKey, this.items[this.items.length-1].groupKey];
			} else {
				return [];
			}
		},
		_measureColumns : function() {
			var containerWidth = this.size.outerWidth,
				columnWidth = this._getColumnWidth(),
				cols = containerWidth / columnWidth,
				excess = columnWidth - containerWidth % columnWidth;
			// if overshoot is less than a pixel, round up, otherwise floor it
			cols = Math.max( Math[ excess && excess < 1 ? "round" : "floor" ]( cols ), 1);
			// reset column Y
			this._appendCols = [];
			this._prependCols = [];
			while(cols--) {
				this._appendCols.push( 0 );
				this._prependCols.push( 0 );
			}
			// console.warn(this._prependCols, this._appendCols);
		},
		// append element
		append : function(elements, groupKey) {
			if(!this._isLayoutInited || this._isProcessing ||  elements.length === 0 ) { return; }

			this._addType = "append";
			this._isRecycling = (this.items.length + elements.length) >= this.options.count;
			this._insert(elements, groupKey, true);
		},
		// prepend element
		prepend : function(elements, groupKey) {
			if(!this._isLayoutInited || !this.isRecycling() || this._isProcessing || elements.length === 0 ) { return; }
			//@todo prepend 시 처음넣었던 엘리먼트보다 더 큰많은 element가 추가된 경우.
			this._addType = "prepend";

			// prepare fit content
			this._fit();
			this._insert(elements, groupKey, false);
		},
		_updateCols : function(isAppend) {
			var col = isAppend ? this._appendCols : this._prependCols,
				items = this._getColItems(isAppend),
				base = this._isFitted || isAppend ? 0 : this._getMinY();
			for(var i=0, len = col.length; i < len; i++) {
				col[i] = items[i].position.y + ( isAppend ? items[i].size.outerHeight : - base);
			}
			// console.trace(isAppend ? "_appendCols" : "_prependCols", col, base);
		},
		_getColItems : function(isTail) {
			var len = this._appendCols.length,
				items = new Array(len),
				item, idx, count = 0,
				i = isTail ? this.items.length-1 : 0;
			while( item = this.items[i] ) {
				idx = this._getColIdx(item);
				if( !items[idx] ) {
					items[idx] = item;
					if(++count === len) {
						return items;
					}
				}
				i += isTail ? -1 : 1;
			}
			return items;
		},
		_insert : function(elements, groupKey, isAppend ) {
			var items = this._itemize(elements);
			this._contentCount += isAppend ? items.length : -items.length;
			this._adjustRange(isAppend, elements.length);
			this._registGroupKey(groupKey,items);
			this.$element[isAppend ? "append" : "prepend"](elements);
			
			if(isAppend) {
				this.items = this.items.concat( items );
			} else {
				for(var i=0,item; item = items[i]; i++) {
					item.insertType = "prepend";
				}
	  			this.items = items.concat(this.items.slice(0));
				items = items.reverse();
			}
			this.layoutItems( items, true );
			// console.log("컨텐츠의 개수 : " , this._contentCount);
		},
		_adjustRange : function (isTop, addtional) {
			// if(!this.isRecycling()) { 
			// 	return;
			// }
			var targets, idx, diff = this.items.length + addtional - this.options.count;
			// console.info("cur-tot", this.items.length ,"diff", diff, "andditional", addtional);
			if(diff <= 0 || (idx = this._getDelimiterIndex(isTop, diff)) < 0 ) {
				return;
			}
			// console.warn("_adjustRange", idx, this.getGroupRange(), "+" , addtional)
			if(isTop) {
				targets = this.items.slice(0,idx);
				this.items = this.items.slice(idx);
				this._isFitted = false;
			} else {
				targets = this.items.slice(idx);
				this.items = this.items.slice(0, idx);
			}
			// @todo improve performance
			for(var i=0, item, len=targets.length; i < len; i++) {
				item = targets[i].element;
				item.parentNode.removeChild( item );
			}
		},
		_getColIdx : function(item) {
			return parseInt(item.position.x/parseInt(this.columnWidth,10),10);
		},
		_registGroupKey : function(groupKey, array) {
			if( groupKey != null ) {
				for(var i=0,v; v = array[i]; i++) {
					v.groupKey = groupKey;
				}
			}
		},
		_getDelimiterIndex : function(isTop, removeCount) {
			var len = this.items.length;
			if( len < removeCount) {
				return -1;
			}
						
			var	i, idx = 0,
				baseIdx = isTop ? removeCount-1 : len-removeCount,
				targetIdx = baseIdx + (isTop ? 1 : -1),
				groupKey = this.items[baseIdx].groupKey;
			// console.info("_getDelimiterIndex", "baseIdx", baseIdx, "targetIdx", targetIdx, "removeCount",removeCount,groupKey);
			if(groupKey != null && groupKey === this.items[targetIdx].groupKey) {
				if(isTop) {
					for(i=baseIdx; i>0; i--) {
						if(groupKey !== this.items[i].groupKey) {
							break;
						}
					}
					idx =  i === 0 ? -1 : i+1;
				} else {
					for(i=baseIdx; i<len; i++) {
						if(groupKey !== this.items[i].groupKey) {
							break;
						}
					}
					idx = i === len ? -1 : i;
				}
			} else {
				idx = isTop? targetIdx : baseIdx;
			}
			return idx;
		},
		// fit size
		_fit : function(applyDom) {
			// for caching
			if(this.options.count <= 0) {
				this._fit = $.noop();
				this._isFitted = true;
				return;
			}
			if(this._isFitted) {
				return;
			}
			var item, height, i=0, y = this._getMinY();
			this._updateCols();
			while(item = this.items[i++]) {
				item.position.y -= y;
				applyDom && item.goTo(item.position.x, item.position.y);
			}
			this._updateCols(true);
			height = this._getContainerSize().height;
			applyDom && this._setContainerMeasure( height, false );
			this._isFitted = true;
		},
		_getMinY : function() {
			return Math.min.apply( Math, $.map(this._getColItems(), function(v) { 
				return v.position.y; 
			}) );
		},
		_clone : function(target, source, what) {
			var s;
			$.each(what, function(i,v) {
				if(s = source[v]) {
					if($.isArray(s)) {
						target[v] = $.merge([], s);
					} else if($.isPlainObject(s)) {
						target[v] = $.extend(true, {}, s);
					} else {
						target[v] = s;
					}
				}
			});
			return target;
		},
		_cloneStatus : function(target, source) {
			var self = this;
			this._clone(target, source, ["_equalItemSize", "_appendCols", "_prependCols", "columnWidth", "size", "options", "settings"]);
			// item 정보 저장
			target.items = target.items || [];
			target.items.length = source.items.length;
			$.each(source.items, function(i) {
				target.items[i] = self._clone(target.items[i] || {}, source.items[i], ["position", "size", "insertType", "groupKey"]);
			});
			return target;
		},
		// clear elements and data
		// clear : function() {
		// },
		// // refresh contents
		// refresh : function() {
		// },
		// @override
		destroy : function() {
			Outlayer.prototype.destroy.apply(this);
		}
	});
	ns.InfiniteGrid = InfiniteGrid;
});