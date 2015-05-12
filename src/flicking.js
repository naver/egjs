eg.module("flicking",[jQuery, eg],function($, ns){
	"use strict";
	/**
	 *
	 * To build flickable UI
	 * @group EvergreenJs
	 * @ko 플리킹 UI를 구성한다.
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
	 * @param {Number|Array} [options.previewPadding=[0,0]] Padding value to display previous and next panels. If set array value the order is left to right
	 * @param {Number} [options.threshold=40] Threshold pixels to move panels in prev/next direction
	 * @param {Number} [options.duration=100] Duration time of panel change animation in milliseconds
	 * @param {Function} [options.panelEffect=easing.easeInCubic] Function of the jQuery Easing Plugin
	 * @param {Number} [options.defaultIndex=0] Default panel index to show in first time
     * 
	 * @codepen {"id":"rVOpPK", "ko":"플리킹 기본 예제", "en":"Flicking default example", "collectionId":"ArxyLK", "height" : 403}
	 *
	 * @see jQuery Easing Plugin {@link http://gsgd.co.uk/sandbox/jquery/easing}
	 * @example
	 	<!-- HTML -->
		<div id="mflick">
			<div>
				<p>Layer 0</p>
			</div>
			<div>
				<p>Layer 1</p>
			</div>
			<div>
				<p>Layer 2</p>
			</div>
		</div>
		<script>
	 	var some = eg.Flicking("#mflick", {
	 		circular : true,
	 		threshold : 50
	 	}).on({
	 		beforeRestore : function(e) { ... },
	 		flickStart : function(e) { ... }
	 	);
	 	</script>
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
				previewPadding : [ 0, 0 ],	// preview padding value (left to right order). In this mode at least 5 panels are required.
				threshold : 40,				// the distance pixel threshold value for change panel
				duration : 100,				// duration ms for animation
				panelEffect : $.easing.easeInCubic, // $.easing function for panel change animation
				defaultIndex : 0			// initial panel index to be shown
			}, options);

			var padding = this.options.previewPadding;

			if(typeof padding === "number") {
				padding = this.options.previewPadding = [ padding, padding ];
			} else if(padding.constructor !== Array) {
				padding = this.options.previewPadding = [ 0, 0 ];
			}

			// config value
			this._conf = {
				panel : {
					list : [],			// panel list
					index : 0,  		// current physical dom index
					no : 0,  			// current logical panel index
					width : 0,			// panel width
					count : 0,  		// total physical panel count
					origCount : 0,  	// total count of given original panels
					reached : false,	// if panel reached first/last panel
					changed : false,	// if panel changed
					animating : false,	// current animating status boolean
					minCount : padding[0] + padding[1] > 0 ? 5 : 3  // minimum panel count
				},
				touch : {
					holdPos : [ 0, 0 ],	// hold x,y coordinate
					destPos : [ 0, 0 ],	// destination x,y coordinate
					distance : 0,		// touch distance pixel of start to end touch
					direction : ns.DIRECTION_RIGHT  // touch direction
				},
				customEvent : {}		// for custom event return value
			};
			this._hasClickBug = ns._hasClickBug();
			this._build();
			this._bindEvents();
			this._arrangePanels();
		},

		/**
		 * Build and set panel nodes to make flicking structure
		 */
		_build : function() {
			var panel = this._conf.panel,
			 	children = panel.list = this._wrapper.children(),
				padding = this.options.previewPadding,
				prefix = this.options.prefix,
				panelWidth = panel.width = this._wrapper.width() - (padding[0] + padding[1]),
				panelCount = panel.count = panel.origCount = children.length;

			this._wrapper.css({
				padding : "0 "+ padding[1] +"px 0 "+ padding[0] +"px",
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
				panelCount = panel.count = ( panel.list = this._container.children() ).length;
			}

			// create MovableCoord instance
			this._mcInst = new ns.MovableCoord({
				min : [ 0, 0 ],
				max : [ panelWidth * (panelCount-1), 0 ],
				bounce : [ 0, 50, 0, 50 ],
				margin : [ 0, 0, 0, 0 ],
				circular :  [ false, false, false, false ],
				easing : this.options.panelEffect,
				deceleration : this.options.deceleration
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
			var panel = this._conf.panel,
				panelCount = panel.origCount,
				cloneCount = panel.minCount - panelCount,
				list = panel.list,
				cloneNodes;

			// if panels are given less than required when circular option is set, then clone node to apply circular mode
			if(this.options.circular) {
				if(panelCount < panel.minCount) {
					cloneNodes = list.clone();

					while(cloneNodes.length < cloneCount) {
						cloneNodes = cloneNodes.add(list.clone());
					}

					this._container.append(cloneNodes);
				}

				return true;
			}

			return false;
		},

		/**
		 * Move panel's position within array
		 * @param {Number} from
		 * @param {To} to
		 */
		_movePanelPosition : function(from, to) {
			var list = this._conf.panel.list;
			list.splice(to, 0, list.splice(from, 1)[0]);
		},

		/**
		 * Set default panel to show
		 * @param {Number} index
		 */
		_setDefaultPanel : function(index) {
			var panel = this._conf.panel,
				lastIndex = panel.count - 1,
				coord = [ 0, 0 ], i, pos;

			if(this.options.circular) {
				// if default index is given, then move correspond panel to the first position
				if(index > 0 && index <= lastIndex) {
					for(i=0; i < index; i++) {
						this._movePanelPosition(0, lastIndex);
					}
				}

				// set first panel's position according physical node length
				for(i=1, pos = this._getBasePositionIndex(); pos >= i; i++) {
					this._movePanelPosition(lastIndex, 0);
				}

				panel.no = index;
			} else {
				// if defaultIndex option is given, then move to that index panel
				if(index > 0 && index <= lastIndex) {
					panel.index = index;
					coord = [ panel.width * index, 0];

					this._setTranslate(-coord[0], coord[1]);
					this._mcInst.setTo(coord[0], coord[1]);
				}
			}
		},

		/**
		 * Arrange panels' position
		 * @param {Boolean} recycle
		 * @param {Number} no - number of panels to arrange
		 */
		_arrangePanels : function(recycle, no) {
			var panel = this._conf.panel,
				touch = this._conf.touch,
				hwCompositing = this.options.hwCompositing;

			if(this.options.circular) {
				// move elements according direction
				if(recycle) {
					if(typeof no !== "undefined") {
						touch.direction = ns[ no > 0 ? "DIRECTION_RIGHT" : "DIRECTION_LEFT" ];
					}

					this._arrangePanelPosition(touch.direction, no);
				}

				// set index for base element's position
				panel.index = this._getBasePositionIndex();
				this._mcInst.setTo(panel.width * panel.index, 0);
			}

			// set each panel's position
			panel.list.each(function(i) {
				$(this).css("transform", ns.translate( (100 * i) +"%", 0, hwCompositing ));
			});
		},

		/**
		 * Move nodes
		 * @param {Boolean} diretion
		 * @param {Number} times
		 */
		_arrangePanelPosition : function(direction, times) {
			var list = this._conf.panel.list,
				lastIndex = list.length - 1,
				right = direction === ns.DIRECTION_RIGHT;

			for(var i=0, len=Math.abs(times || 1); i < len; i++) {
				this._movePanelPosition.apply(this, right ? [ i, lastIndex ] : [ lastIndex, 0 ] );
			}
		},

		/**
		 * Get the base position index of the panel
		 */
		_getBasePositionIndex : function() {
			var panel = this._conf.panel;
			return panel.index = Math.floor(panel.count / 2 - 0.1);
		},

		/**
		 * Bind events
		 */
		_bindEvents : function() {
			this._mcInst.on({
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
			 * @ko 터치가 시작될 때 발생하는 이벤트
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
			// for "click" bug
			this._hasClickBug && e.holding && e.hammerEvent.preventSystemEvent && this._container.css("pointerEvents", "none");

			/**
			 * When touch moves
			 * @ko 터치한 상태에서 이동될 때 발생하는 이벤트
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
			 * @ko 터치하지 않은 상태에서 패널이 이동될 때 발생하는 이벤트
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
			if(this._triggerEvent(e.holding ? "touchMove" : "flick", { pos : e.pos })) {
				this._setTranslate(x, y);
			}
		},

		/**
		 * 'release' event handler
		 */
		_releaseHandler : function(e) {
				var touch = this._conf.touch,
				pos = e.destPos,
				holdPos = touch.holdPos[0],
				panelWidth = this._conf.panel.width;

			touch.distance = e.depaPos[0] - touch.holdPos[0];
			touch.direction = ns[ touch.holdPos[0] < e.depaPos[0] ? "DIRECTION_RIGHT" : "DIRECTION_LEFT" ];

			pos[0] = Math.max(holdPos - panelWidth, Math.min(holdPos + panelWidth, pos[0]));
			touch.destPos[0] = pos[0] = Math.round(pos[0] / panelWidth) * panelWidth;

			// when reach to the last panel
			/*if(pos[0] >= this._mcInst.options.max[0]) {
				this._mcInst.options.max[0] += panelWidth;
			}*/

			/**
			 * When touch ends
			 * @ko 터치가 종료될 때 발생되는 이벤트
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

			// for "click" bug
			this._hasClickBug && this._container.css("pointerEvents", "auto");
		},

		/**
		 * 'animation' event handler
		 */
		_animationHandler : function(e) {
			var panel = this._conf.panel,
				direction = this._conf.touch.direction,
				first = false,
				last = false;

			panel.animating = true;
			e.duration = this.options.duration;

			if(this._isMovable()) {
				/**
				 * Before panel changes
				 * @ko 플리킹이 시작되기 전에 발생하는 이벤트
				 * @name eg.Flicking#flickStart
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
				this._triggerEvent("flickStart", { depaPos : e.depaPos, destPos : e.destPos });

				first = panel.index === 0 && direction === ns.DIRECTION_LEFT;
				last = panel.index === panel.count-1 && direction === ns.DIRECTION_RIGHT;

				// when reach first or last panel do nothing
				if(first || last) {
					panel.reached = first ? "first" : "last";

					if(!this.options.circular) {
						return panel.changed = false;
					}
				} else {
					panel.reached = false;
				}

				panel.index += direction === ns.DIRECTION_RIGHT ? 1 : -1;
				e.destPos[0] = panel.width * panel.index;

				this._setPanelNo(true);
				panel.changed = true;
			} else {
				/**
				 * Before panel restores it's last position
				 * @ko 플리킹 임계치에 도달하지 못하고 사용자의 액션이 끝났을 경우, 원래 패널로 복원되기 전에 발생하는 이벤트
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
				if(!(this._conf.customEvent.restore = this._triggerEvent("beforeRestore", {
					depaPos : e.depaPos, destPos : e.destPos
				}))) {
					e.stop();
				}
			}
		},

		/**
		 * 'animationEnd' event handler
		 */
		_animationEndHandler : function() {
			// adjust panel coordination
			var panel = this._conf.panel,
				x = -panel.width * panel.index,
				y = 0;

			this._setTranslate(x, y);

			if(this.options.circular && panel.changed) {
				this._arrangePanels(true);
				this._setPanelNo();
			}

			panel.animating = false;

			/**
			 * After panel changes
			 * @ko 플리킹으로 패널이 이동된 후 발생하는 이벤트
			 * @name eg.Flicking#flickEnd
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event
			 * @param {Number} param.index Current panel index
			 * @param {Boolean} param.direction Direction of the panel move
			 */
			/**
			 * After panel restores it's last position
			 * @ko 플리킹 임계치에 도달하지 못하고 사용자의 액션이 끝났을 경우, 원래 인덱스로 복원된 후 발생하는 이벤트
			 * @name eg.Flicking#restore
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event
			 * @param {Number} param.index Current panel index
			 * @param {Boolean} param.direction Direction of the panel move
			 */
			if(panel.changed) {
				this._triggerEvent("flickEnd");
			} else if(this._conf.customEvent.restore) {
				this._triggerEvent("restore");
			}
		},

		/**
		 * Set the logical panel index number
		 * @param {Boolean} move - set to increment or decrement
		 */
		_setPanelNo : function(move) {
			var panel = this._conf.panel,
				count = panel.origCount - 1;

			if(move) {
				panel.no += this._conf.touch.direction === ns.DIRECTION_RIGHT ? 1 : -1;
			}

			if(panel.no > count) {
				panel.no = 0;
			} else if(panel.no < 0) {
				panel.no = count;
			}
		},

		/**
		 * Set translate property value
		 * @param {Number} x coordinate
		 * @param {Number} y coordinate
		 */
		_setTranslate : function(x, y) {
			this._container.css("transform", ns.translate(
				this._getUnitValue(x),
				this._getUnitValue(y),
				this.options.hwCompositing
			));
		},

		/**
		 * Return unit formatted value
		 * @param {Number|String} val
		 * @return {String} val Value formatted with unit
		 */
		_getUnitValue : function(val) {
			var rx = /(?:[a-z]{2,}|%)$/,
				unit = "px";

			return ( parseInt(val,10) || 0 ) + ( String(val).match(rx) || unit );
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
		 * @return {Boolean}
		 */
		_triggerEvent : function(name, param) {
			var panel = this._conf.panel;

			return this.trigger(name, param = $.extend({
				eventType : name,
				index : panel.index,
				no : panel.no,
				direction : this._conf.touch.direction
			}, param ));
		},

		/**
		 * Get next/prev panel element/index.
		 * @param {Boolean} direction
		 * @param {Boolean} element - true:to get element, false:to get index
		 * @param {Number} physical - true : physical, false : logical
		 * @return {jQuery|Number}
		 */
		_getElement : function(direction, element, physical) {
			var panel = this._conf.panel,
				circular = this.options.circular,
				pos = panel.index,
				result = null, total, index;

			if(physical) {
				total = panel.count;
				index = pos;
			} else {
				total = panel.origCount;
				index = panel.no;
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

			if(panel[ physical ? "index" : "no" ] !== index) {
				result = element ? $(panel.list[ direction === ns.DIRECTION_RIGHT ? pos + 1 : pos - 1 ]): index;
			}

			return result;
		},

		/**
		 * Move panel to the given direction
		 * @param {Boolean} direction
		 * @param {Number} duration
		 */
		_movePanel : function(direction, duration) {
			var panel = this._conf.panel,
				index = this[ direction === ns.DIRECTION_RIGHT ? "getNextIndex" : "getPrevIndex" ]();

			if(index != null) {
				this._conf.touch.direction = direction;
				this._setPanelNo(true);
				panel.index = index;
				this._mcInst.setBy(panel.width * ( (direction === ns.DIRECTION_RIGHT || this.options.circular) ? 1 : -1 ), 0, duration);
				this._arrangePanels(true);
			}
		},

		/**
		 * Get current panel position
		 * @ko 현재 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical)
		 * @return {Number} Number Current index number
		 */
		getIndex : function(physical) {
			return this._conf.panel[ physical ? "index" : "no" ];
		},

		/**
		 * Get current panel element
		 * @ko 현재 패널 요소의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getElement
		 * @return {jQuery} jQuery Current element
		 */
		getElement : function() {
			var panel = this._conf.panel;
			return $(panel.list[panel.index]);
		},

		/**
		 * Get next panel element
		 * @ko 다음 패널 요소의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getNextElement
		 * @return {jQuery} jQuery Next element
		 */
		getNextElement : function() {
			return this._getElement(ns.DIRECTION_RIGHT, true);
		},

		/**
		 * Get next panel index
		 * @ko 다음 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getNextIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical)
		 * @return {Number} Number Next element index value
		 */
		getNextIndex : function(physical) {
			return this._getElement(ns.DIRECTION_RIGHT, false, physical);
		},

		/**
		 * Get whole panel elements
		 * @ko 패널을 구성하는 모든 요소들의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getAllElements
		 * @return {jQuery} jQuery All panel elements
		 */
		getAllElements : function() {
			return this._conf.panel.list;
		},

		/**
		 * Get previous panel element
		 * @ko 이전 패널 요소의 레퍼런스를 반환한다.
		 * @method ns.Flicking#getPrevElement
		 * @return {jQuery} jQuery Previous element
		 */
		getPrevElement : function() {
			return this._getElement(ns.DIRECTION_LEFT, true);
		},

		/**
		 * Get previous panel index
		 * @ko 이전 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getPrevIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical)
		 * @return {Number} number Previous element index value
		 */
		getPrevIndex : function(physical) {
			return this._getElement(ns.DIRECTION_LEFT, false, physical);
		},

		/**
		 * Get total panel count
		 * @ko 전체 패널의 개수를 반환한다.
		 * @method eg.Flicking#getTotalCount
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical)
		 * @return {Number} Number Count of all elements
		 */
		getTotalCount : function(physical) {
			return this._conf.panel[ physical ? "count" : "origCount" ];
		},

		/**
		 * Return either panel is animating or not
		 * @ko 현재 애니메이션중인지 여부를 리턴한다.
		 * @method eg.Flicking#isPlaying
		 * @return {Boolean}
		 */
		isPlaying : function() {
			return this._conf.panel.animating;
		},

		/**
		 * Move to next panel
		 * @ko 다음 패널로 이동한다.
		 * @method eg.Flicking#next
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds
		 */
		next : function(duration) {
			this._movePanel(ns.DIRECTION_RIGHT, duration || this.options.duration);
		},

		/**
		 * Move to previous panel
		 * @ko 이전 패널로 이동한다.
		 * @method eg.Flicking#prev
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds
		 */
		prev : function(duration) {
			this._movePanel(ns.DIRECTION_LEFT, duration || this.options.duration);
		},

		/**
		 * Move to indicated panel
		 * @ko 지정한 패널로 이동한다.
		 * @method eg.Flicking#moveTo
		 * @param {Number} no logical panel index
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds
		 */
		moveTo : function(no, duration) {
			var panel = this._conf.panel,
				indexToMove = no,
				movableCount;

			duration = duration || this.options.duration;

			if(this.options.circular) {
				if(typeof no !== "number" || no >= panel.origCount || no === panel.no) {
					return;
				}

				// real panel count which can be moved on each(left/right) sides
				movableCount = Math.round((panel.count - this._getBasePositionIndex()) / 2);

				if(panel.no === panel.origCount-1) {
					indexToMove = panel.no > no && no === 0 ? 1 : -(panel.no - no);
				} else if(no > panel.no) {
					indexToMove = no - panel.no;
				} else {
					indexToMove = -(panel.no - no);
				}

				if(indexToMove > movableCount) {
					indexToMove = movableCount - indexToMove;

					if(no === 0) {
						indexToMove = Math.abs(indexToMove);
					} else if(no === panel.origCount-1) {
						indexToMove++;
					} else if(indexToMove < 0) {
						indexToMove--;
					}
				}

				panel.no = no;
				this._arrangePanels(true, indexToMove);

			} else {
				panel.index = no;
				this._mcInst.setTo(panel.width * indexToMove, 0, duration);
			}
		},

		/**
		 * Update panel size according current viewport
		 * @ko 패널 사이즈 정보를 갱신한다.
		 * @method eg.Flicking#resize
		 */
		resize : function() {
			var panel = this._conf.panel,
				width = panel.width = this._wrapper.width(),
				maxCoord = [ width * (panel.count - 1), 0 ];

			// resize panel and parent elements
			this._container.width(maxCoord[0]);
			panel.list.css("width", width);

			// adjust the position of current panel
			this._mcInst.setTo(width * panel.index, 0).options.max = maxCoord;
		}
	});
});
