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
	 * @param {String} [options.prefix=eg-flick] Prefix string for flicking elements
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
				hwCompositing : ns.isHWAccelerable(),  // check weather hw acceleration is available
				prefix : "eg-flick",		// prefix value of class name
				deceleration : 0.0006,		// deceleration value
				horizontal : true,			// set if only horizontal move is permitted
				circular : false,			// circular mode. In this mode at least 3 panels are required.
				previewPadding : [ 0, 0 ],	// preview padding value. In this mode at least 5 panels are required.
				threshold : 40,				// the distance pixel threshold value for change panel
				duration : 100,				// duration ms for animation
				panelEffect : $.easing.easeInCubic, // $.easing function for panel change animation
				defaultIndex : 0			// initial panel index to be shown
			}, options);

			var previewPadding = this.options.previewPadding;

			if(typeof previewPadding === "number") {
				this.options.previewPadding = [ previewPadding, previewPadding ];
			} else if(previewPadding.constructor !== Array) {
				this.options.previewPadding = [ 0, 0 ];
			}

			// config value
			this._conf = {
				triggerEvent : true,  // boolean of event stop on custom event
				panel : {
					index : 0,  // current physical dom index
					no : 0,  // current logical panel index
					width : 0,
					count : 0,  // total physical panel count
					origCount : 0,  // total count of given original panels
					recycleCount : this.options.previewPadding[0] + this.options.previewPadding[1] > 0 ? 5 : 3,  // panel count for recycle use
					reached : false,
					changed : false,  // if panel changed
					animating : false
				},
				touch : {
					holdPos : [ 0, 0 ],  // hold x,y coordinate
					destPos : [ 0, 0 ],  // destination x,y coordinate
					distance : 0,  // touch distance pixel of start to end touch
					direction : ns.DIRECTION_RIGHT  // touch direction
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
				previewPadding = this.options.previewPadding,
				prefix = this.options.prefix,
				panelWidth, panelCount;

			if(typeof previewPadding === "number") {
				previewPadding = [ previewPadding, previewPadding ];
			}

			panelWidth = this._conf.panel.width = this._wrapper.width() - (previewPadding[0] + previewPadding[1]),
			panelCount = this._conf.panel.count = this._conf.panel.origCount = children.length;

			this._wrapper.css({
				padding : "0 "+ previewPadding[1] +"px 0 "+ previewPadding[0] +"px",
				overflow : "hidden"
			});

			this._container = children.addClass(prefix +"-panel").css({
					position : "absolute",
					width : panelWidth,
					float :"left",
					top : 0,
					left : 0
				})
				.wrapAll("<div class='"+ prefix +"-container' style='position:relative;width:"+ (panelWidth * panelCount) +"px;height:100%' />")
				.parent();


			if(this._addClonePanels()) {
				children = this._container.children();
				panelCount = this._conf.panel.count = children.length;
			}

			// create MovableCoord instance
			this._movableCoord = new ns.MovableCoord({
				min : [ 0, 0 ],
				max : [ panelWidth * (panelCount-1), 0 ],
				bounce : [ 0, 50, 0, 50 ],
				margin : [ 0, 0, 0, 0 ],
				circular :  [ false, false, false, false ],
				easing : this.options.panelEffect,
				deceleration : this.options.deceleration,
			}).bind(this._wrapper, {
				scale : [ -1, 0 ],
				direction : ns[ "DIRECTION_"+ (this.options.horizontal ? "HORIZONTAL" : "VERTICAL") ],
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
				children = this._container.children(),
				dfChildren;

			// if panels are given less than required when circular option is set, then clone node to apply circular mode
			if(this.options.circular) {
				if(panelCount < this._conf.panel.recycleCount) {

					while((dfChildren = df.children()).length < nodeCountToClone) {
						df.append(children.clone());
					}

					dfChildren.length && this._container.append(dfChildren);
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
			var hwCompositing = this.options.hwCompositing;

			if(this.options.circular) {
				// move elements according direction
				if(doRecycle) {
					if(typeof no !== "undefined") {
						this._conf.touch.direction = ns[ no > 0 ? "DIRECTION_RIGHT" : "DIRECTION_LEFT" ];
					}

					this._arrangePanelNodes(this._conf.touch.direction, no);
				}

				// set index for base element's position
				this._conf.panel.index = this._getBasePositionIndex();
				this._movableCoord.setTo(this._conf.panel.width * this._conf.panel.index, 0);
			}

			// set each panel's position
			this._container.children().each(function(i) {
				$(this).css("transform", ns.translate( (100 * i) +"%", "0px", hwCompositing ));
			});
		},

		/**
		 * Move nodes
		 * @param {Boolean} diretion
		 * @param {Number} times
		 */
		_arrangePanelNodes : function(direction, times) {
			var children = this._container.children();

			for(var i=0, len=Math.abs(times || 1); i < len; i++) {
				direction === ns.DIRECTION_RIGHT ?
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
			this._conf.triggerEvent = true;

			/**
			 * When touch starts
			 * @name eg.Flicking#touchStart
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event
			 * @param {Number} param.index Current panel physical index
			 * @param {Number} param.no Current panel logical position
			 * @param {Boolean} param.direction Direction of the panel move
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
			 * @param {Boolean} param.direction Direction of the panel move
			 * @param {Array} param.pos Departure coordinate
			 * @param {Number} param.pos.0 Departure x-coordinate
			 * @param {Number} param.pos.1 Departure y-coordinate
			 */
			/**
			 * Occurs during the change
			 * @name eg.Flicking#change
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event
			 * @param {Number} param.index Current panel physical index
			 * @param {Number} param.no Current panel logical position
			 * @param {Boolean} param.direction Direction of the panel move
			 * @param {Array} param.pos Departure coordinate
			 * @param {Number} param.pos.0 Departure x-coordinate
			 * @param {Number} param.pos.1 Departure y-coordinate
			 */
			this._triggerEvent(e.holding ? "touchMove" : "change", { pos : e.pos });
		},

		/**
		 * 'release' event handler
		 */
		_releaseHandler : function(e) {
			var pos = e.destPos,
				holdPos = this._conf.touch.holdPos[0],
				panelWidth = this._conf.panel.width;

			this._conf.touch.distance = e.depaPos[0] - this._conf.touch.holdPos[0];
			this._conf.touch.direction = ns[ this._conf.touch.holdPos[0] < e.depaPos[0] ? "DIRECTION_RIGHT" : "DIRECTION_LEFT" ];

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
			 * @param {Boolean} param.direction Direction of the panel move
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
				 * @param {Boolean} param.direction Direction of the panel move
				 * @param {Array} param.depaPos Departure coordinate
				 * @param {Number} param.depaPos.0 Departure x-coordinate
				 * @param {Number} param.depaPos.1 Departure y-coordinate
				 * @param {Array} param.destPos Destination coordinate
				 * @param {Number} param.destPos.0 Destination x-coordinate
				 * @param {Number} param.destPos.1 Destination y-coordinate
				 */
				this._triggerEvent("beforeChange", { depaPos : e.depaPos, destPos : e.destPos });

				first = this._conf.panel.index === 0 && this._conf.touch.direction === ns.DIRECTION_LEFT;
				last = this._conf.panel.index === this._conf.panel.count-1 && this._conf.touch.direction === ns.DIRECTION_RIGHT;

				// when reach first or last panel do nothing
				if(first || last) {
					this._conf.panel.reached = first ? "first" : "last";

					if(!this.options.circular) {
						return this._conf.panel.changed = false;
					}
				} else {
					this._conf.panel.reached = false;
				}

				this._conf.panel.index += this._conf.touch.direction === ns.DIRECTION_RIGHT ? 1 : -1;
				e.destPos[0] = this._conf.panel.width * this._conf.panel.index;

				this._setPanelNo(true);
				this._conf.panel.changed = true;
			} else {

				/**
				 * Before panel restores it's last position
				 * @name eg.Flicking#beforeRestore
				 * @event
				 *
				 * @param {Object} param
				 * @param {String} param.eventType Name of event
				 * @param {Number} param.index Current panel physical index
				 * @param {Number} param.no current Panel logical position
				 * @param {Boolean} param.direction Direction of the panel move
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
			 * @param {Boolean} param.direction Direction of the panel move
			 */
			/**
			 * After panel restores it's last position
			 * @name eg.Flicking#restore
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event
			 * @param {Number} param.index Current panel index
			 * @param {Boolean} param.direction Direction of the panel move
			 */
			this._triggerEvent(this._conf.panel.changed ? "afterChange" : "restore");
		},

		/**
		 * Set the logical panel index number
		 * @param {Boolean} move - set to increment or decrement
		 */
		_setPanelNo : function(move) {
			if(move) {
				this._conf.panel.no += this._conf.touch.direction === ns.DIRECTION_RIGHT ? 1 : -1;
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
		 * @param {jQuery|HTMLElement} element
		 * @param {Number} x coordinate
		 * @param {Number} y coordinate
		 */
		_setTranslate : function(element, x, y) {
			var xUnit, yUnit, rx = /(?:[a-z]+|%)$/;

			xUnit = (String(x).match(rx) || "px") +"";
			yUnit = (String(y).match(rx) || "px") +"";

			$(element).css("transform", ns.translate( (x || 0) + xUnit, (y || 0) + yUnit, this.options.hwCompositing ));
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
		 * @return {Object} param event value object
		 */
		_triggerEvent : function(name, param) {
			if(!this._conf.triggerEvent) {
				return;
			}

			this._conf.triggerEvent = this.trigger(name, param = $.extend({
				eventType : name,
				index : this._conf.panel.index,
				no : this._conf.panel.no,
				direction : this._conf.touch.direction
			}, param ));

			return param;
		},

		/**
		 * Get next/prev panel element/index.
		 * @param {Boolean} direction
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

			if(direction === ns.DIRECTION_RIGHT) {
				if(index < total-1) {
					index++;
				} else if(circular) {
					index = 0;
				}
			} else {
				if(direction === ns.DIRECTION_LEFT && index > 0) {
					index--;
				} else if(circular) {
					index = total - 1;
				}
			}

			if(this._conf.panel[ physical ? "index" : "no" ] !== index) {
				result = element ? this.getElement()[ direction === ns.DIRECTION_RIGHT ? "next" : "prev" ]() : index;
			}

			return result;
		},

		/**
		 * Move panel to the given direction
		 * @param {Boolean} direction
		 * @param {Number} duration
		 */
		_movePanel : function(direction, duration) {
			var index = this[ direction === ns.DIRECTION_RIGHT ? "getNextIndex" : "getPrevIndex" ]();

			if(index != null) {
				this._conf.touch.direction = direction;
				this._setPanelNo(true);
				this._conf.panel.index = index;
				this._movableCoord.setBy(this._conf.panel.width * ( (direction === ns.DIRECTION_RIGHT || this.options.circular) ? 1 : -1 ), 0, duration);
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
			return this._getElement(ns.DIRECTION_RIGHT, true);
		},

		/**
		 * Get next panel index
		 * @method eg.Flicking#getNextIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical)
		 * @return {Number} Number Next element index value
		 */
		getNextIndex : function(physical) {
			return this._getElement(ns.DIRECTION_RIGHT, false, physical);
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
		 * @method ns.Flicking#getPrevElement
		 * @return {jQuery} jQuery Previous element
		 */
		getPrevElement : function() {
			return this._getElement(ns.DIRECTION_LEFT, true);
		},

		/**
		 * Get previous panel index
		 * @method eg.Flicking#getPrevIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical)
		 * @return {Number} number Previous element index value
		 */
		getPrevIndex : function(physical) {
			return this._getElement(ns.DIRECTION_LEFT, false, physical);
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
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds
		 */
		next : function(duration) {
			this._movePanel(ns.DIRECTION_RIGHT, duration || this.options.duration);
		},

		/**
		 * Move to previous panel
		 * @method ns.Flicking#prev
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds
		 */
		prev : function(duration) {
			this._movePanel(ns.DIRECTION_LEFT, duration || this.options.duration);
		},

		/**
		 * Move to indicated panel
		 * @method eg.Flicking#moveTo
		 * @param {Number} no logical panel index
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds
		 */
		moveTo : function(no, duration) {
			var indexToMove = no, movableCount;

			duration = duration || this.options.duration;

			if(this.options.circular) {
				if(typeof no !== "number" || no >= this._conf.panel.origCount || no === this._conf.panel.no) {
					return;
				}

				// real panel count which can be moved on each(left/right) sides
				movableCount = Math.round((this._conf.panel.count - this._getBasePositionIndex()) / 2);

				if(this._conf.panel.no === this._conf.panel.origCount-1) {
					indexToMove = this._conf.panel.no > no && no === 0 ? 1 : -(this._conf.panel.no - no);
				} else if(no > this._conf.panel.no) {
					indexToMove = no - this._conf.panel.no;
				} else {
					indexToMove = -(this._conf.panel.no - no);
				}

				if(indexToMove > movableCount) {
					indexToMove = movableCount - indexToMove;

					if(no === 0) {
						indexToMove = Math.abs(indexToMove);
					} else if(no === this._conf.panel.origCount-1) {
						indexToMove++;
					} else if(indexToMove < 0) {
						indexToMove--;
					}
				}

				this._conf.panel.no = no;
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
				maxCoord = [ width * (this._conf.panel.count - 1), 0 ];

			// resize panel and parent elements
			this._container.width(maxCoord[0]).children().css("width", width);

			// adjust the position of current panel
			this._movableCoord.setTo(width * this._conf.panel.index, 0).options.max = maxCoord;
		}
	});
})(jQuery, eg);