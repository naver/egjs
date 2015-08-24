eg.module("infiniteGrid",[window.jQuery, eg, window.Outlayer],function($, ns, Outlayer){
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
			if(!this._isLayoutInited) {
				this._registGroupKey(this.options.defaultGroupKey, this.items);
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
				item.size = this._equalItemSize;
			} else {
				item.getSize();
			}
			(item.isAppend == null) && (item.isAppend = true);
			var y, shortColIndex,
				isAppend = item.isAppend,
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
				base = this._isFitted || isAppend ? 0 : this.getMinY(items);
			for(var i=0, item, len = col.length; i < len; i++) {
				if(item = items[i]) {
					col[i] = item.position.y + ( isAppend ? item.size.outerHeight : - base);
				} else {
					col[i] = 0;
				}
			}
			return base;
			// console.trace(isAppend ? "_appendCols" : "_prependCols", col, base);
		},
		getMinY : function(items) {
			return Math.min.apply( Math, $.map(items, function(v) { 				
				return v ? v.position.y : 0;
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
					size;
				if(el) {
					/* jshint ignore:start */
					size = getSize(el);
					/* jshint ignore:end */
				} else {
					size = {
						outerWidth : 0,
						outerHeight : 0
					};
				}
				this.options.isEqualSize && (this._equalItemSize = size);
				this.columnWidth = size.outerWidth || this.size.outerWidth;
			}
			return this.columnWidth;
		},
		_getColIdx : function(item) {
			return parseInt(item.position.x/parseInt(this.columnWidth,10),10);
		},
		_getColItems : function(isTail) {
			var len = this._appendCols.length,
				colItems = new Array(len),
				item, idx, count = 0,
				i = isTail ? this.items.length-1 : 0;
			while( item = this.items[i] ) {
				idx = this._getColIdx(item);
				if( !colItems[idx] ) {
					colItems[idx] = item;
					if(++count === len) {
						return colItems;
					}
				}
				i += isTail ? -1 : 1;
			}
			return colItems;
		},
		clone : function(target, source) {
			clone(target, source, ["_equalItemSize", "_appendCols", "_prependCols", "columnWidth", "size", "options"]);
			target.items = target.items || [];
			target.items.length = source.items.length;
			$.each(source.items, function(i) {
				target.items[i] = clone(target.items[i] || {}, source.items[i], ["position", "size", "isAppend", "groupKey"]);
			});
			return target;
		},
		itemize : function(elements, groupKey) {
			var items = this._itemize(elements);
			this._registGroupKey(groupKey, items);
			return items;
		},
		_registGroupKey : function(groupKey, array) {
			if( groupKey != null ) {
				for(var i=0,v; v = array[i]; i++) {
					v.groupKey = groupKey;
				}
			}
		},		
		// @override
		destroy : function() {
			this.off();
			Outlayer.prototype.destroy.apply(this);
		}
	});
	
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
	ns.InfiniteGrid = ns.Class.extend(ns.Component, {
		construct : function(el, options) {
			var opts = $.extend({
				"isLayoutInstant" : true,
				"isEqualSize" : false,
				"defaultGroupKey" : null,
				"count" : 30
			}, options);
			opts["transitionDuration"] = 0;	// don't use this option.
			this.core = new InfiniteGridCore(el, opts).on("layoutComplete", $.proxy(this._onlayoutComplete,this));
			this._reset();			
		},
		_onlayoutComplete : function(e) {
			var distance = 0;
			if(this._isAppendType === false) {
				this._isFitted = false;
				this._fit(true);
				distance = this.core.items[e.length].position.y;
			}
			this._isProcessing = false;
			this.trigger("layoutComplete", {
				target : e.concat(),
				isAppend : this._isAppendType,
				distance : distance
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
			this.core.items = this.core.itemize( this.core.$element.children().toArray() );
			this.core.clone(this.core, status.core);
			$.extend(this, status.data);
		},
		// check if element is appending or prepending
		isProcessing : function() {
			return this._isProcessing;
		},
		// check if elements are recycling
		isRecycling : function() {
			return this.core.options.count > 0 && this._isRecycling;
		},
		// return page key range [0, 20]
		getGroupKeyRange : function() {
			if(this.core._isLayoutInited) {
				return [this.core.items[0].groupKey, this.core.items[this.core.items.length-1].groupKey];
			} else {
				return [];
			}
		},
		layout : function() {
			this._isProcessing = true;
			this._isAppendType = true;
			for(var i=0,v; v = this.core.items[i]; i++) {
				v.isAppend = true;
			}
			this.core.layout();
		},
		// append element
		append : function(elements, groupKey) {
			if(!this.core._isLayoutInited || this._isProcessing ||  elements.length === 0 ) { return; }

			this._isRecycling = (this.core.items.length + elements.length) >= this.core.options.count;
			this._insert(elements, groupKey, true);
			return elements.length;
		},
		// prepend element
		prepend : function(elements, groupKey) {
			if(!this.core._isLayoutInited || !this.isRecycling() || this._isProcessing || elements.length === 0 ) { return; }
			if(elements.length - this._contentCount  > 0) {
				elements = elements.slice(elements.length - this._contentCount);
			}
			// prepare fit content
			this._fit();
			this._insert(elements, groupKey, false);
			return elements.length;
		},
		_insert : function(elements, groupKey, isAppend ) {
			if(elements.length === 0) {
				return;
			}
			var items = this.core.itemize(elements, groupKey);
			this._isAppendType = isAppend;
			this._contentCount += isAppend ? items.length : -items.length;
			this.isRecycling() && this._adjustRange(isAppend, elements.length);
			this.core.$element[isAppend ? "append" : "prepend"](elements);

			for(var i=0,item; item = items[i]; i++) {
				item.isAppend = isAppend;
			}
			if(isAppend) {
				this.core.items = this.core.items.concat( items );
			} else {
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
			// console.warn("_adjustRange", idx, this.getGroupKeyRange(), "+" , addtional)
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
			var item, height, i=0, 
				y = this.core.updateCols();	// for prepend
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
			this._isAppendType = null;
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