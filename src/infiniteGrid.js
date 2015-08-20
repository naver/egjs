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
	 * @param {Boolean} options.isEqualSize
	 * @param {Boolean} options.isLayoutInstant
	 */
	if(!Outlayer) {
		ns.InfiniteGrid = ns.Class({});
		return;
	}

	function clone(target, source, what) {
		var s;
		$.each(what, function(i,v) {
			s = source[v];
			if(s != null) {
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
	}

	var InfiniteGridCore = Outlayer.create("InfiniteGrid");
	$.extend(InfiniteGridCore.prototype, {
		// @override (from layout)
		_resetLayout : function() {
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
				item.size = this._equalItemSize;
			} else {
				item.getSize();
			}
			!item.insertType && (item.insertType = "append");
			
			var y, shortColIndex,
				isAppend = item.insertType === "append",
				cols = isAppend ? this._appendCols : this._prependCols;
			y = Math[isAppend ? "min" : "max"].apply( Math, cols );
			shortColIndex = $.inArray( y , cols );
			cols[shortColIndex] = y + (isAppend ? item.size.outerHeight : -item.size.outerHeight);

			return {
				x: this.columnWidth * shortColIndex,
				y: isAppend ? y : y-item.size.outerHeight
			};
		},
		updateCols : function(isAppend) {
			var col = isAppend ? this._appendCols : this._prependCols,
				items = this._getColItems(isAppend),
				base = this._isFitted || isAppend ? 0 : this.getMinY();
			for(var i=0, len = col.length; i < len; i++) {
				col[i] = items[i].position.y + ( isAppend ? items[i].size.outerHeight : - base);
			}
			// console.trace(isAppend ? "_appendCols" : "_prependCols", col, base);
		},
		getMinY : function() {
			return Math.min.apply( Math, $.map(this._getColItems(), function(v) { 
				return v.position.y; 
			}) );
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
				this.options.isEqualSize && (this._equalItemSize = $.extend({}, size));
				this.columnWidth = size.outerWidth || this.size.outerWidth;
			}
			return this.columnWidth;
		},
		_getColIdx : function(item) {
			return parseInt(item.position.x/parseInt(this.columnWidth,10),10);
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
		clone : function(target, source) {
			clone(target, source, ["_equalItemSize", "_appendCols", "_prependCols", "columnWidth", "size", "options"]);
			target.items = target.items || [];
			target.items.length = source.items.length;
			$.each(source.items, function(i) {
				target.items[i] = clone(target.items[i] || {}, source.items[i], ["position", "size", "insertType", "groupKey"]);
			});
			return target;
		},
		// @override
		destroy : function() {
			this.off();
			Outlayer.prototype.destroy.apply(this);
		}
	});

	ns.InfiniteGrid = ns.Class.extend(ns.Component, {
		construct : function(el, options) {
			this.core = new InfiniteGridCore(el, $.extend({
				"transitionDuration" : 0,
				"isLayoutInstant" : true,
				"isEqualSize" : false,
				"count" : 30
			}, options)).on("layoutComplete", $.proxy(this._onlayoutComplete,this));
			
			this._reset();
			//@todo 초기 마크업에 의한 groupKey는 어떻게 할것인가?
			this._registGroupKey(null, this.core.items);
		},

		_onlayoutComplete : function(e) {
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
			this.trigger("layoutComplete", {
				"type" : this._addType,
				"target" : e.concat()
			});
		},
		// current status (for persist)
		getStatus : function() {
			var data=[];
			for(var p in this) {
			    if(this.hasOwnProperty(p) && /^_/.test(p)) {
			        data.push(p);
			    }
			}
			return {
				core : this.core.clone({}, this.core),
				data : clone({}, this, data),
				html : this.core.$element.html(),
				cssText : this.core.element.style.cssText
			};
		},
		// set status (for persist)
		setStatus : function(status) {
			this.core.element.style.cssText = status.cssText;
			this.core.$element.html(status.html);
			this.core.items = this.core._itemize( this.core.$element.children().toArray() );
			this.core.clone(this.core, status.core);
			$.extend(this, status.data);
		},
		// check if element is appending or prepending
		isProcessing : function() {
			return !!this._isProcessing;
		},
		// check if elements are recycling
		isRecycling : function() {
			return this.core.options.count > 0 && !!this._isRecycling;
		},
		// return page key range [0, 20]
		getGroupRange : function() {
			if(this.core._isLayoutInited) {
				return [this.core.items[0].groupKey, this.core.items[this.core.items.length-1].groupKey];
			} else {
				return [];
			}
		},
		layout : function() {
			this._isProcessing = true;
			this._addType = null;
			for(var i=0,v; v = this.core.items[i]; i++) {
				v.insertType = "append";
			}
			this.core.layout();
		},
		// append element
		append : function(elements, groupKey) {
			if(!this.core._isLayoutInited || this._isProcessing ||  elements.length === 0 ) { return; }

			this._addType = "append";
			this._isRecycling = (this.core.items.length + elements.length) >= this.core.options.count;
			this._insert(elements, groupKey, true);
		},
		// prepend element
		prepend : function(elements, groupKey) {
			if(!this.core._isLayoutInited || !this.isRecycling() || this._isProcessing || elements.length === 0 ) { return; }
			//@todo prepend 시 처음넣었던 엘리먼트보다 더 큰많은 element가 추가된 경우.
			this._addType = "prepend";

			// prepare fit content
			this._fit();
			this._insert(elements, groupKey, false);
		},
		_insert : function(elements, groupKey, isAppend ) {
			var items = this.core._itemize(elements);
			this._contentCount += isAppend ? items.length : -items.length;
			this.isRecycling() && this._adjustRange(isAppend, elements.length);
			this._registGroupKey(groupKey,items);
			this.core.$element[isAppend ? "append" : "prepend"](elements);
			
			if(isAppend) {
				this.core.items = this.core.items.concat( items );
			} else {
				for(var i=0,item; item = items[i]; i++) {
					item.insertType = "prepend";
				}
	  			this.core.items = items.concat(this.core.items.slice(0));
				items = items.reverse();
			}
			this.core.layoutItems( items, true );
			// console.log("컨텐츠의 개수 : " , this._contentCount);
		},
		_adjustRange : function (isTop, addtional) {
			var targets, idx, diff = this.core.items.length + addtional - this.core.options.count;
			// console.info("cur-tot", this.core.items.length ,"diff", diff, "andditional", addtional);
			if(diff <= 0 || (idx = this._getDelimiterIndex(isTop, diff)) < 0 ) {
				return;
			}
			// console.warn("_adjustRange", idx, this.getGroupRange(), "+" , addtional)
			if(isTop) {
				targets = this.core.items.slice(0,idx);
				this.core.items = this.core.items.slice(idx);
				this._isFitted = false;
			} else {
				targets = this.core.items.slice(idx);
				this.core.items = this.core.items.slice(0, idx);
			}
			// @todo improve performance
			for(var i=0, item, len=targets.length; i < len; i++) {
				item = targets[i].element;
				item.parentNode.removeChild( item );
			}
		},
		_registGroupKey : function(groupKey, array) {
			if( groupKey != null ) {
				for(var i=0,v; v = array[i]; i++) {
					v.groupKey = groupKey;
				}
			}
		},
		_getDelimiterIndex : function(isTop, removeCount) {
			var len = this.core.items.length;
			if( len < removeCount) {
				return -1;
			}
						
			var	i, idx = 0,
				baseIdx = isTop ? removeCount-1 : len-removeCount,
				targetIdx = baseIdx + (isTop ? 1 : -1),
				groupKey = this.core.items[baseIdx].groupKey;
			// console.info("_getDelimiterIndex", "baseIdx", baseIdx, "targetIdx", targetIdx, "removeCount",removeCount,groupKey);
			if(groupKey != null && groupKey === this.core.items[targetIdx].groupKey) {
				if(isTop) {
					for(i=baseIdx; i>0; i--) {
						if(groupKey !== this.core.items[i].groupKey) {
							break;
						}
					}
					idx =  i === 0 ? -1 : i+1;
				} else {
					for(i=baseIdx; i<len; i++) {
						if(groupKey !== this.core.items[i].groupKey) {
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
			if(this.core.options.count <= 0) {
				this._fit = $.noop();
				this._isFitted = true;
				return;
			}
			if(this._isFitted) {
				return;
			}
			var item, height, i=0, y = this.core.getMinY();
			this.core.updateCols();	// for prepend
			while(item = this.core.items[i++]) {
				item.position.y -= y;
				applyDom && item.goTo(item.position.x, item.position.y);
			}
			this.core.updateCols(true);	// for append
			height = this.core._getContainerSize().height;
			applyDom && this.core._setContainerMeasure( height, false );
			this._isFitted = true;
		},
		// clear elements and data
		clear : function() {
			this.core.$element.empty();
			this.core.items.length = 0;
			this._reset();
			this.layout();
		},
		_reset : function() {
			this._addType = null;
			this._isFitted = true;
			this._isProcessing = false;
			this._isRecycling = false;
			this._contentCount = this.core.items.length;
		},
		destroy : function() {
			if(this.core) {
				this.core.destroy();
				this.core = null;
			}
			this.off();
		}
	});
});