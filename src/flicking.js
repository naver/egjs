(function($, ns) {
	"use strict";

	/**
	 * To build flickable UI
	 * @class
	 * @name eg.Flicking
	 * @extends eg.Component
	 *
	 * @param {HTMLElement|String|jQuery} element wrapper element
	 * @param {Object} options
	 * @param {Function} [options.effect=easing.linear] Function of the jQuery Easing Plugin
	 * @param {Boolean} [options.hwCompositing=eg.isHWAccelerable()] Force to use HW compositing
	 * @param {Number} [options.zIndex=1000] z-index value of the wrapper element
	 * @param {Number} [options.deceleration=0.0006] Deceleration this value can be altered to change the momentum animation duration. higher numbers make the animation shorter.
	 * @param {Boolean} [options.circular=false] To make panels rotate infinitely
	 * @param {Number} [options.previewPadding=0] Padding value to display previous and next panels
	 * @param {Number} [options.threshold=40] Threshold pixels to move panels in prev/next direction
	 * @param {Number} [options.duration=100] Duration time of panel change animation in milliseconds
	 * @param {Function} [options.panelEffect=easing.easeInCubic] Function of the jQuery Easing Plugin
	 * @param {Number} [options.defaultIndex=0] Default panel index to show in first time
	 *
	 * @see jQuery Easing Plugin {@link http://gsgd.co.uk/sandbox/jquery/easing}
	 */
	ns.Flicking = ns.Class.extend(ns.Component,{
		/**
		 * Constructor
		 * @param {HTMLElement|String|jQuery} element - base element
		 * @param {Object} options
		 */
		construct : function(element, options) {
			this._wrapper = $(element);

			$.extend(this.options = {
				effect : $.easing.linear,	// $.easing functions for animation
				hwCompositing : eg.isHWAccelerable(),  // check weather hw acceleration is available
				zIndex : 1000,				// z-index value for base element
				deceleration : 0.0006,		// deceleration value
				horizontal : true,			// set if only horizontal move is permitted
				circular : false,			// circular mode. In this mode at least 3 panels are required.
				previewPadding : 0,			// preview padding value. In this mode at least 5 panels are required.
				threshold : 40,				// the distance pixel threshold value for change panel
				duration : 100,				// duration ms for animation
				panelEffect : $.easing.easeInCubic, // $.easing function for panel change animation
				defaultIndex : 0			// initial panel index to be shown
			}, options);

			// config value
			this._conf = {
				prefix : "eg-flick",
				panel : {
					index : 0,  // current physical dom index
					no : 0,  // current logical panel index
					width : 0,
					count : 0,  // total physical panel count
					origCount : 0,  // total count of given original panels
					recycleCount : this.options.previewPadding ? 6 : 3,  // panel count for recycle use
					reached : false,
					changed : false,  // if panel changed
					animating : false
				},
				touch : {
					holdPos : [ 0, 0 ],  // hold x,y coordinate
					destPos : [ 0, 0 ],  // destination x,y coordinate
					distance : 0,  // touch distance pixel of start to end touch
					direction : true  // touch direction - true:next, fasle:prev
				}
			};

			this._build();
			this._bindEvents();
			this._arrangePanels();
		},

		/**
		 * Build and set panel nodes to make flicking structure
		 */
		_build : function() {
			var children = this._wrapper.children(),
				panelWidth = this._conf.panel.width = this._wrapper.width() - (this.options.previewPadding * 2),
				panelCount = this._conf.panel.count = this._conf.panel.origCount = children.length;

			this._wrapper.css({
				zIndex : this.options.zIndex,
				padding : "0 "+ this.options.previewPadding +"px",
				overflow : "hidden"
			});

			this._container = children.addClass(this._conf.prefix +"-panel").css({
					position : "absolute",
					width : panelWidth,
					float :"left"
				})
				.wrapAll("<div class='"+ this._conf.prefix +"-container' style='position:relative;width:"+ (panelWidth * panelCount) +"px;height:100%' />")
				.parent();


			if(this._addClonePanels()) {
				children = this._container.children();
				panelCount = this._conf.panel.count = children.length;
			}

			// create MovableCoord instance
			this._movableCoord = new eg.MovableCoord({
				min : [ 0, 0 ],
				max : [ panelWidth * (panelCount-1), 0 ],
				bounce : [ 0, 50, 0, 50 ],
				margin : [ 0, 0, 0, 0 ],
				circular :  [ false, false, false, false ],
				easing : this.options.panelEffect,
				deceleration : this.options.deceleration,
			}).bind(this._wrapper, {
				scale : [ -1, 0 ],
				direction : eg[ "DIRECTION_"+ (this.options.horizontal ? "HORIZONTAL" : "VERTICAL") ],
				maximumSpeed : this.options.duration
			});

			this._setDefaultPanel(this.options.defaultIndex);
		},

		/**
		 * To fulfill minimum panel count cloning original node when circular or previewPadding option are set
		 * @return {Boolean} true : added clone node, false : not added
		 */
		_addClonePanels : function() {
			var df = $(document.createDocumentFragment()),
				panelCount = this._conf.panel.origCount,
				nodeCountToClone = this._conf.panel.recycleCount - panelCount,
				children = this._container.children();

			// if panels are given less than required when circular option is set, then clone node to apply circular mode
			if(this.options.circular) {
				if(panelCount < this._conf.panel.recycleCount) {

					while(df.children().length <= nodeCountToClone) {
						df.append(children.clone());
					}

					if(df.children().length) {
						df.children().splice(nodeCountToClone);
						this._container.append(df.children());
					}
					//this._conf.panel.count = this._container.children();
				}

				return true;
			}

			return false;
		},

		/**
		 * Set default panel to show
		 * @param {Number} index
		 */
		_setDefaultPanel : function(index) {
			var panelCount = this._conf.panel.count,
				coord = [ 0, 0 ],
				children, i, pos;

			if(this.options.circular) {
				children = this._container.children();

				// if default index is given, then move correspond panel to the first position
				if(index > 0 && index < panelCount) {
					for(i=1; i <= index; i++) {
						this._container.append(children[i-1]);
					}
					children = this._container.children();
				}

				// set first panel's position according physical node length
				for(i=1, pos = this._getBasePositionIndex(); pos >= i; i++) {
					this._container.prepend(children[panelCount - i]);
				}

				this._conf.panel.no = index;
			} else {
				// if defaultIndex option is given, then move to that index panel
				if(index > 0 && index < panelCount) {
					this._conf.panel.index = index;
					coord = [ this._conf.panel.width * index, 0];

					this._setTranslate(this._container, -coord[0], coord[1]);
					this._movableCoord.setTo(coord[0], coord[1]);
				}
			}
		},

		/**
		 * Arrange panels' position
		 * @param {Boolean} doRecycle
		 * @param {Number} no - number of panels to arrange
		 */
		_arrangePanels : function(doRecycle, no) {
			var panelWidth = this._conf.panel.width;

			if(this.options.circular) {
				// move elements according direction
				if(doRecycle) {
					if(typeof no !== "undefined") {
						this._conf.touch.direction = no > 0;
					}

					this._arrangePanelNodes(this._conf.touch.direction, no);
				}

				// set index for base element's position
				this._conf.panel.index = this._getBasePositionIndex();
				this._movableCoord.setTo(this._conf.panel.width * this._conf.panel.index, 0);
			}

			// set each panel's position
			this._container.children().each(function(i) {
				$(this).css({
					top : 0,
					left : panelWidth * i
				});
			});
		},

		/**
		 * Move nodes
		 * @param {Boolean} diretion - true:next, false:prev
		 * @param {Number} times
		 */
		_arrangePanelNodes : function(direction, times) {
			var children = this._container.children();

			for(var i=0, len=Math.abs(times || 1); i < len; i++) {
				direction ?
					this._container.append(children[i]) :
					this._container.prepend(children[ this._conf.panel.count - (i+1) ]);
			}
		},

		/**
		 * Get the base position index of the panel
		 */
		_getBasePositionIndex : function() {
			return this._conf.panel.index = Math.floor(this._conf.panel.count / 2 - 0.1);
		},

		/**
		 * Bind events
		 */
		_bindEvents : function() {
			this._movableCoord.on({
				hold : this._holdHandler.bind(this),
				change : this._changeHandler.bind(this),
				release : this._releaseHandler.bind(this),
				animation : this._animationHandler.bind(this),
				animationEnd : this._animationEndHandler.bind(this)
			});
		},

		/**
		 * 'hold' event handler
		 */
		_holdHandler : function(e) {
			this._conf.touch.holdPos = e.pos;
			this._conf.panel.changed = false;

			/**
			 * When touch starts
			 * @name eg.Flicking#touchStart
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event
			 * @param {Number} param.index Current panel physical index
			 * @param {Number} param.no Current panel logical position
			 * @param {Boolean} param.direction Direction of the panel move (true:right, false:left)
			 * @param {Array} param.pos Departure coordinate
			 * @param {Number} param.pos.0 Departure x-coordinate
			 * @param {Number} param.pos.1 Departure y-coordinate
			 */
			this._triggerEvent("touchStart", { pos : e.pos });
		},

		/**
		 * 'change' event handler
		 */
		_changeHandler : function(e) {
			var pos = e.pos, x = -pos[0], y = 0;
			this._setTranslate(this._container, x, y);

			/**
			 * When touch moves
			 * @name eg.Flicking#touchMove
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event
			 * @param {Number} param.index Current panel physical index
			 * @param {Number} param.no Current panel logical position
			 * @param {Boolean} param.direction Direction of the panel move (true:right, false:left)
			 * @param {Array} param.pos Departure coordinate
			 * @param {Number} param.pos.0 Departure x-coordinate
			 * @param {Number} param.pos.1 Departure y-coordinate
			 */
			e.holding && this._triggerEvent("touchMove", { pos : e.pos });
		},

		/**
		 * 'release' event handler
		 */
		_releaseHandler : function(e) {
			var pos = e.destPos,
				holdPos = this._conf.touch.holdPos[0],
				panelWidth = this._conf.panel.width;

			this._conf.touch.distance = e.depaPos[0] - this._conf.touch.holdPos[0];
			this._conf.touch.direction = this._conf.touch.holdPos[0] < e.depaPos[0];  // true : next, false : prev

			pos[0] = Math.max(holdPos - panelWidth, Math.min(holdPos + panelWidth, pos[0]));
			this._conf.touch.destPos[0] = pos[0] = Math.round(pos[0] / panelWidth) * panelWidth;

			// when reach to the last panel
			/*if(pos[0] >= this._movableCoord.options.max[0]) {
				this._movableCoord.options.max[0] += panelWidth;
			}*/

			/**
			 * When touch ends
			 * @name eg.Flicking#touchEnd
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event
			 * @param {Number} param.index Current panel physical index
			 * @param {Number} param.no Current panel logical position
			 * @param {Boolean} param.direction Direction of the panel move (true:right, false:left)
			 * @param {Array} param.depaPos Departure coordinate
			 * @param {Number} param.depaPos.0 Departure x-coordinate
			 * @param {Number} param.depaPos.1 Departure y-coordinate
			 * @param {Array} param.destPos Destination coordinate
			 * @param {Number} param.destPos.0 Destination x-coordinate
			 * @param {Number} param.destPos.1 Destination y-coordinate
			 */
			this._triggerEvent("touchEnd", { depaPos : e.depaPos, destPos : e.destPos });
		},

		/**
		 * 'animation' event handler
		 */
		_animationHandler : function(e) {
			var first = false, last = false;

			this._conf.panel.animating = true;
			e.duration = this.options.duration;

			if(this._isMovable()) {
				/**
				 * Before panel changes
				 * @name eg.Flicking#beforeChange
				 * @event
				 *
				 * @param {Object} param
				 * @param {String} param.eventType Name of event
				 * @param {Number} param.index Current panel physical index
				 * @param {Number} param.no Current panel logical position
				 * @param {Boolean} param.direction Direction of the panel move (true:right, false:left)
				 * @param {Array} param.depaPos Departure coordinate
				 * @param {Number} param.depaPos.0 Departure x-coordinate
				 * @param {Number} param.depaPos.1 Departure y-coordinate
				 * @param {Array} param.destPos Destination coordinate
				 * @param {Number} param.destPos.0 Destination x-coordinate
				 * @param {Number} param.destPos.1 Destination y-coordinate
				 */
				this._triggerEvent("beforeChange", { depaPos : e.depaPos, destPos : e.destPos });

				first = this._conf.panel.index === 0 && !this._conf.touch.direction;
				last = this._conf.panel.index === this._conf.panel.count-1 && this._conf.touch.direction;

				// when reach first or last panel do nothing
				if(first || last) {
					this._conf.panel.reached = first ? "first" : "last";

					if(!this.options.circular) {
						return this._conf.panel.changed = false;
					}
				} else {
					this._conf.panel.reached = false;
				}

				this._conf.panel.index += this._conf.touch.direction ? 1 : -1;
				e.destPos[0] = this._conf.panel.width * this._conf.panel.index;

				this._setPanelNo(true);
				this._conf.panel.changed = true;
			} else {

				/**
				 * Before panel restores it's current position
				 * @name eg.Flicking#beforeRestore
				 * @event
				 *
				 * @param {Object} param
				 * @param {String} param.eventType Name of event
				 * @param {Number} param.index Current panel physical index
				 * @param {Number} param.no current Panel logical position
				 * @param {Boolean} param.direction Direction of the panel move (true:right, false:left)
				 * @param {Array} param.depaPos Departure coordinate
				 * @param {Number} param.depaPos.0 Departure x-coordinate
				 * @param {Number} param.depaPos.1 Departure y-coordinate
				 * @param {Array} param.destPos Destination coordinate
				 * @param {Number} param.destPos.0 Destination x-coordinate
				 * @param {Number} param.destPos.1 Destination y-coordinate
				 */
				this._triggerEvent("beforeRestore", { depaPos : e.depaPos, destPos : e.destPos });
			}
		},

		/**
		 * 'animationEnd' event handler
		 */
		_animationEndHandler : function() {
			// adjust panel coordination
			var x = -this._conf.panel.width * this._conf.panel.index, y = 0;

			this._setTranslate(this._container, x, y);

			if(this.options.circular && this._conf.panel.changed) {
				this._arrangePanels(true);
				this._setPanelNo();
			}

			this._conf.panel.animating = false;

			/**
			 * After panel changes
			 * @name eg.Flicking#afterChange
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event
			 * @param {Number} param.index Current panel index
			 * @param {Boolean} param.direction Direction of the panel move (true:right, false:left)
			 */
			/**
			 * After panel restores it's current position
			 * @name eg.Flicking#restore
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event
			 * @param {Number} param.index Current panel index
			 * @param {Boolean} param.direction Direction of the panel move (true:right, false:left)
			 */
			this._triggerEvent(this._conf.panel.changed ? "afterChange" : "restore");
		},

		/**
		 * Set the logical panel index number
		 * @param {Boolean} move - set to increment or decrement
		 */
		_setPanelNo : function(move) {
			if(move) {
				this._conf.panel.no += this._conf.touch.direction ? 1 : -1;
			}

			var count = this._conf.panel.origCount - 1;

			if(this._conf.panel.no > count) {
				this._conf.panel.no = 0;
			} else if(this._conf.panel.no < 0) {
				this._conf.panel.no = count;
			}
		},

		/**
		 * Set translate property value
		 * @param {jQuery} element
		 * @param {Number} x coordinate
		 * @param {Number} y coordinate
		 */
		_setTranslate : function(element, x, y) {
			var property = "translate",
				coord = [ x || 0, y || 0 ];

			if(this.options.hwCompositing) {
				property += "3d";
				coord.push(0);
			}

			element.css({ "webkitTransform" : property +"("+ coord.join("px,") +"px)" });
		},

		/**
		 * Check if panel passed through threshold pixel
		 */
		_isMovable : function() {
			return Math.abs(this._conf.touch.distance) >= this.options.threshold;
		},

		/**
		 * Trigger custom events
		 * @param {String} name - event name
		 * @param {Object} param - additional event value
		 */
		_triggerEvent : function(name, param) {
			this.trigger(name, $.extend({
				eventType : name,
				index : this._conf.panel.index,
				no : this._conf.panel.no,
				direction : this._conf.touch.direction
			}, param));
		},

		/**
		 * Get next/prev panel element/index.
		 * @param {Boolean} direction - true:next, false:prev
		 * @param {Boolean} element - true:to get element, false:to get index
		 * @param {Number} physical - true : physical, false : logical
		 * @return {jQuery|Number}
		 */
		 //this._getElement(true, false, physical);
		_getElement : function(direction, element, physical) {
			var circular = this.options.circular,
				result = null, total, index;

			if(physical) {
				total = this._conf.panel.count;
				index = this._conf.panel.index;
			} else {
				total = this._conf.panel.origCount;
				index = this._conf.panel.no;
			}

			if(direction) {
				if(index < total-1) {
					index++;
				} else if(circular) {
					index = 0;
				}
			} else {
				if(!direction && index > 0) {
					index--;
				} else if(circular) {
					index = total - 1;
				}
			}

			if(this._conf.panel[ physical ? "index" : "no" ] !== index) {
				result = element ? this.getElement()[ direction ? "next" : "prev" ]() : index;
			}

			return result;
		},

		/**
		 * Move panel to the given direction
		 * @param {Boolean} direction
		 * @param {Number} duration
		 */
		_movePanel : function(direction, duration) {
			var index = this[ direction ? "getNextIndex" : "getPrevIndex" ]();

			if(index != null) {
				this._conf.touch.direction = direction;
				this._setPanelNo(true);
				this._conf.panel.index = index;
				this._movableCoord.setBy(this._conf.panel.width * ( direction || this.options.circular ? 1 : -1 ), 0, duration);
				this._arrangePanels(true);
			}
		},

		/**
		 * Get current panel position
		 * @method eg.Flicking#getIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical)
		 * @return {Number} Number Current index number
		 */
		getIndex : function(physical) {
			return this._conf.panel[ physical ? "index" : "no" ];
		},

		/**
		 * Get current panel element
		 * @method eg.Flicking#getElement
		 * @return {jQuery} jQuery Current element
		 */
		getElement : function() {
			return $(this._container.children()[ this._conf.panel.index ]);
		},

		/**
		 * Get next panel element
		 * @method eg.Flicking#getNextElement
		 * @return {jQuery} jQuery Next element
		 */
		getNextElement : function() {
			return this._getElement(true, true);
		},

		/**
		 * Get next panel index
		 * @method eg.Flicking#getNextIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical)
		 * @return {Number} Number Next element index value
		 */
		getNextIndex : function(physical) {
			return this._getElement(true, false, physical);
		},

		/**
		 * Get whole panel elements
		 * @method eg.Flicking#getAllElements
		 * @return {jQuery} jQuery All panel elements
		 */
		getAllElements : function() {
			return this._container.children();
		},

		/**
		 * Get previous panel element
		 * @method eg.Flicking#getPrevElement
		 * @return {jQuery} jQuery Previous element
		 */
		getPrevElement : function() {
			return this._getElement(false, true);
		},

		/**
		 * Get previous panel index
		 * @method eg.Flicking#getPrevIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical)
		 * @return {Number} number Previous element index value
		 */
		getPrevIndex : function(physical) {
			return this._getElement(false, false, physical);
		},

		/**
		 * Get total panel count
		 * @method eg.Flicking#getElementsCount
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical)
		 * @return {Number} Number Count of all elements
		 */
		getElementsCount : function(physical) {
			return this._conf.panel[ physical ? "count" : "origCount" ];
		},

		/**
		 * Return either panel is animating or not
		 * @method eg.Flicking#isPlaying
		 * @return {Boolean}
		 */
		isPlaying : function() {
			return this._conf.panel.animating;
		},

		/**
		 * Move to next panel
		 * @method eg.Flicking#next
		 * @param {Number} [duration=0] Duration of animation in milliseconds
		 */
		next : function(duration) {
			this._movePanel(true, duration || 0);
		},

		/**
		 * Move to previous panel
		 * @method eg.Flicking#prev
		 * @param {Number} [duration=0] Duration of animation in milliseconds
		 */
		prev : function(duration) {
			this._movePanel(false, duration || 0);
		},

		/**
		 * Move to indicated panel
		 * @method eg.Flicking#moveTo
		 * @param {Number} no logical panel index
		 * @param {Number} [duration=0] Duration of animation in milliseconds
		 */
		moveTo : function(no, duration) {
			var indexToMove = no, movableCount;

			duration = duration || 0;

			if(this.options.circular) {
				if(typeof no !== "number" || no >= this._conf.panel.origCount || no === this._conf.panel.no) {
					return;
				}

				// real panel count which can be moved on each(left/right) sides
				movableCount = (this._conf.panel.count - this._getBasePositionIndex()) / 2;

				if(this._conf.panel.no === this._conf.panel.origCount-1) {
					indexToMove = this._conf.panel.no - no;

					if(!(this._conf.panel.no > no && no === 0)) {
						indexToMove = -indexToMove;
					}
				} else if(no > this._conf.panel.no) {
					indexToMove = no - this._conf.panel.no;
				} else {
					indexToMove = -(this._conf.panel.no - no);
				}

				if(indexToMove > movableCount) {
					indexToMove = movableCount - indexToMove;

					if(no === 0) {
						indexToMove = Math.abs(indexToMove);
					}
				}

				this._conf.panel.no = no;
				this._movableCoord.setBy(this._conf.panel.width * indexToMove, 0, duration);
				this._arrangePanels(true, indexToMove);

			} else {
				this._conf.panel.index = no;
				this._movableCoord.setTo(this._conf.panel.width * indexToMove, 0, duration);
			}
		},

		/**
		 * Update panel size according current viewport
		 * @method eg.Flicking#resize
		 */
		resize : function() {
			var width = this._conf.panel.width = this._wrapper.width(),
				panels = this._container.children(),
				maxCoord = [ width * (this._conf.panel.count - 1), 0 ];

			// resize panel and parent elements
			panels.each(function(i) {
				$(this).css({
					width : width,
					left : width * i
				});
			});

			this._container.width(maxCoord[0]);

			// adjust the position of current panel
			this._movableCoord.setTo(width * this._conf.panel.index, 0).options.max = maxCoord;
		}
	});
})(jQuery, eg);