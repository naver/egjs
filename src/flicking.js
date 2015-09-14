eg.module("flicking",[window.jQuery, eg, eg.MovableCoord],function($, ns, MC) {
	/**
	 * To build flickable UI
	 * @group egjs
	 * @ko 플리킹 UI를 구성한다.
	 * @class
	 * @name eg.Flicking
	 * @extends eg.Component
	 *
	 * @param {HTMLElement|String|jQuery} element wrapper element <ko>기준 요소</ko>
	 * @param {Object} options
	 * @param {Boolean} [options.hwAccelerable=eg.isHWAccelerable()] Force to use HW compositing <ko>하드웨어 가속 사용여부</ko>
	 * @param {String} [options.prefix=eg-flick] Prefix string for flicking elements <ko>요소에 설정될 접두사</ko>
	 * @param {Number} [options.deceleration=0.0006] Deceleration this value can be altered to change the momentum animation duration. higher numbers make the animation shorter
	 * @param {Boolean} [options.horizontal=true] For move direction (when horizontal is false, then move direction is vertical) <ko>이동방향 설정 (horizontal == true 가로방향, horizontal == false 세로방향)</ko>
	 * @param {Boolean} [options.circular=false] To make panels rotate infinitely  <ko>순환 여부</ko>
	 * @param {Number|Array} [options.previewPadding=[0,0]] Padding value to display previous and next panels. If set array value the order is left(up) to right(down) <ko>이전과 다음 패널을 출력하는 프리뷰 형태에 사용되는 padding 값. 배열 형태로 지정시 좌측(상단), 우측(하단) 순서로 지정</ko>
	 * @param {Number} [options.threshold=40] Threshold pixels to move panels in prev/next direction <ko>다음 패널로 이동되기 위한 임계치 픽셀</ko>
	 * @param {Number} [options.duration=100] Duration time of panel change animation in milliseconds <ko>패널 이동 애니메이션 진행시간(ms) 값</ko>
	 * @param {Function} [options.panelEffect=easeOutCubic] easing function which is used on panel move animation<ko>패널 간의 이동 애니메이션에 사용되는 effect easing 함수</ko>
	 * @param {Number} [options.defaultIndex=0] Default panel index to show in first time <ko>초기에 출력할 패널 인덱스</ko>
	 *
	 * @codepen {"id":"rVOpPK", "ko":"플리킹 기본 예제", "en":"Flicking default example", "collectionId":"ArxyLK", "height" : 403}
	 *
	 * @see Easing Functions Cheat Sheet {@link http://easings.net/}
	 * @see If you want to use another easing function then should be import jQuery easing plugin({@link http://gsgd.co.uk/sandbox/jquery/easing/}) or jQuery UI easing.({@link https://jqueryui.com/easing/})<ko>다른 easing 함수를 사용하고 싶다면, jQuery easing plugin({@link http://gsgd.co.uk/sandbox/jquery/easing/})이나, jQuery UI easing({@link https://jqueryui.com/easing/}) 라이브러리를 삽입해야 한다.</ko>
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
				hwAccelerable : ns.isHWAccelerable(),  // check weather hw acceleration is available
				prefix : "eg-flick",		// prefix value of class name
				deceleration : 0.0006,		// deceleration value
				horizontal : true,			// move direction (true == horizontal, false == vertical)
				circular : false,			// circular mode. In this mode at least 3 panels are required.
				previewPadding : [ 0, 0 ],	// preview padding value in left(up) to right(down) order. In this mode at least 5 panels are required.
				threshold : 40,				// the distance pixel threshold value for change panel
				duration : 100,				// duration ms for animation
				panelEffect : $.easing.easeOutCubic,  // $.easing function for panel change animation
				defaultIndex : 0			// initial panel index to be shown
			}, options);

			var padding = this.options.previewPadding,
				supportHint = window.CSS && window.CSS.supports && window.CSS.supports("will-change", "transform");

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
					size : 0,			// panel size
					count : 0,  		// total physical panel count
					origCount : 0,  	// total count of given original panels
					changed : false,	// if panel changed
					animating : false,	// current animating status boolean
					minCount : padding[0] + padding[1] > 0 ? 5 : 3  // minimum panel count
				},
				touch : {
					holdPos : [ 0, 0 ],	// hold x,y coordinate
					destPos : [ 0, 0 ],	// destination x,y coordinate
					distance : 0,		// touch distance pixel of start to end touch
					direction : null	// touch direction
				},
				customEvent : {},		// for custom event return value
				useLayerHack : this.options.hwAccelerable && !supportHint,
				dirData : [],
				indexToMove : 0,
				triggerFlickEvent : true
			};

			$([[ "LEFT", "RIGHT" ], [ "DOWN", "UP" ]][ +!this.options.horizontal ]).each( $.proxy( function(i,v) {
				this._conf.dirData.push(ns[ "DIRECTION_"+ v ]);
			}, this ) );

			!ns._hasClickBug() && ( this._setPointerEvents = function(){} );

			this._build();
			this._bindEvents();
			this._arrangePanels();

			this.options.hwAccelerable && supportHint && this._setHint();
		},

		/**
		 * Build and set panel nodes to make flicking structure
		 */
		_build : function() {
			var panel = this._conf.panel,
				options = this.options,
			 	children = panel.list = this._wrapper.children(),
				padding = options.previewPadding.concat(),
				prefix = options.prefix,
				horizontal = options.horizontal,
				panelCount = panel.count = panel.origCount = children.length,
				sizeValue = [ panel.size = this._wrapper[ horizontal ? "width" : "height" ]() - (padding[0] + padding[1]), "100%" ],
				temp;

			this._wrapper.css({
				padding : ( horizontal ? "0 "+ padding.reverse().join("px 0 ") : padding.join("px 0 ") ) +"px",
				overflow : "hidden"
			});

			this._getDataByDirection(sizeValue);

			children.addClass(prefix +"-panel").css({
				position : "absolute",
				width : sizeValue[0],
				height : sizeValue[1],
				top : 0,
				left : 0
			});

			sizeValue[temp = +!horizontal] *= panelCount;
			sizeValue[temp] += "px";

			temp = "width:"+ sizeValue[0] +";height:"+ sizeValue[1] + (!horizontal ? ";top:"+ padding[0] +"px;" : ";");
			this._container = children.wrapAll("<div class='"+ prefix +"-container' style='position:relative;z-index:2000;"+ temp +"' />").parent();

			if(this._addClonePanels()) {
				panelCount = panel.count = ( panel.list = this._container.children() ).length;
			}

			// create MovableCoord instance
			this._mcInst = new MC({
				min : [ 0, 0 ],
				max : this._getDataByDirection([ panel.size * ( panelCount-1 ), 0 ]),
				margin : 0,
				circular : false,
				easing : options.panelEffect,
				deceleration : options.deceleration
			}).bind(this._wrapper, {
				scale : this._getDataByDirection( [ -1, 0 ] ),
				direction : ns[ "DIRECTION_"+ ( horizontal ? "HORIZONTAL" : "VERTICAL" ) ],
				interruptable : false
			});

			this._setDefaultPanel(options.defaultIndex);
		},

		/**
		 * To fulfill minimum panel count cloning original node when circular or previewPadding option are set
		 * @return {Boolean} true : added clone node, false : not added
		 */
		_addClonePanels : function() {
			var panel = this._conf.panel,
				panelCount = panel.origCount,
				cloneCount = panel.minCount - panelCount,
				list = panel.list, cloneNodes;

			// if panels are given less than required when circular option is set, then clone node to apply circular mode
			if(this.options.circular && panelCount < panel.minCount) {
				cloneNodes = list.clone();

				while(cloneNodes.length < cloneCount) {
					cloneNodes = cloneNodes.add(list.clone());
				}

				return this._container.append(cloneNodes);
			}
		},

		/**
		 * Move panel's position within array
		 * @param {Number} count element counts to move
		 * @param {Boolean} append where the list to be appended(moved) (true: to the end, false: to the beginning)
		 */
		_movePanelPosition : function(count, append) {
			var panel = this._conf.panel,
				list = panel.list.toArray(),
				listToMove;

			listToMove = list.splice( append ? 0 : panel.count - count, count );
			panel.list = $( append ? list.concat( listToMove ) : listToMove.concat( list ) );
		},

		/**
		 * Set default panel to show
		 * @param {Number} index
		 */
		_setDefaultPanel : function(index) {
			var panel = this._conf.panel,
				lastIndex = panel.count - 1, coords;

			if(this.options.circular) {
				// if default index is given, then move correspond panel to the first position
				if(index > 0 && index <= lastIndex) {
					this._movePanelPosition(index, true);
				}

				// set first panel's position according physical node length
				this._movePanelPosition(this._getBasePositionIndex(), false);

				panel.no = index;
			} else {
				// if defaultIndex option is given, then move to that index panel
				if(index > 0 && index <= lastIndex) {
					panel.index = index;
					coords = [ -(panel.size * index), 0];

					this._setTranslate(coords);
					this._setMovableCoord("setTo", [ Math.abs(coords[0]), Math.abs(coords[1]) ] );
				}
			}
		},

		/**
		 * Arrange panels' position
		 * @param {Boolean} sort Need to sort panel's position
		 * @param {Number} indexToMove Number to move from current position (negative: left, positive: right)
		 */
		_arrangePanels : function(sort, indexToMove) {
			var panel = this._conf.panel,
				touch = this._conf.touch,
				dirData = this._conf.dirData,
				hwAccelerable = this._conf.useLayerHack,
				coords;

			if(this.options.circular) {
				// when arranging panels, set flag to not trigger flick custom event
				this._conf.triggerFlickEvent = false;

				// move elements according direction
				if(sort) {
					indexToMove && ( touch.direction = dirData[ +!Boolean(indexToMove > 0) ] );
					this._arrangePanelPosition(touch.direction, indexToMove);
				}

				// set index for base element's position
				panel.index = this._getBasePositionIndex();

				// arrange MovableCoord's coord position
				this._conf.triggerFlickEvent = !!this._setMovableCoord( "setTo", [ panel.size * panel.index, 0 ], true );
			}

			// set each panel's position in DOM
			panel.list.each(
				$.proxy(function(i, v) {
					coords = this._getDataByDirection([ (100 * i) +"%", 0 ]);
					$(v).css("transform", ns.translate(coords[0], coords[1], hwAccelerable));
				},this));
		},

		/**
		 * Set MovableCoord coord value
		 * @param {String} method
		 * @param {Array} coord
		 * @param {Boolean} isDirVal
		 * @param {Number} duration
		 * @return {Object} MovableCoord instance
		 */
		_setMovableCoord : function(method, coord, isDirVal, duration) {
			var type = typeof duration;

			if( type !== "undefined" ) {
				duration = type === "number" ? duration : this.options.duration;
			}

			isDirVal && this._getDataByDirection(coord);

			return this._mcInst[ method ]( coord[0], coord[1], duration );
		},

		/**
		 * Set hint for browser to decide efficient way of doing transform changes(or animation)
		 * https://dev.opera.com/articles/css-will-change-property/
		 */
		_setHint: function () {
			var value = "transform";
			this._container.css("willChange", value);
			this._conf.panel.list.css("willChange", value);
		},

		/**
		 * Get data according options.horizontal value
		 *
		 * @param {Array} value primary data to handle
		 * @return {Array}
		 */
		_getDataByDirection : function(value) {
			!this.options.horizontal && value.reverse();
			return value;
		},

		/**
		 * Move nodes
		 * @param {Boolean} diretion
		 * @param {Number} indexToMove
		 */
		_arrangePanelPosition : function(direction, indexToMove) {
			var next = direction === this._conf.dirData[0];
			this._movePanelPosition( Math.abs(indexToMove || 1), next );
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
				hold : $.proxy(this._holdHandler, this),
				change : $.proxy(this._changeHandler,this),
				release : $.proxy(this._releaseHandler,this),
				animationStart : $.proxy(this._animationStartHandler,this),
				animationEnd : $.proxy(this._animationEndHandler,this)
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
			 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
			 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
			 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
			 * @param {Number} param.direction Direction of the panel move (see eg.DIRECTION_* constant) <ko>플리킹 방향 (eg.DIRECTION_* constant 확인)</ko>
			 * @param {Array} param.pos Departure coordinate <ko>출발점 좌표</ko>
			 * @param {Number} param.pos.0 Departure x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.pos.1 Departure y-coordinate <ko>y 좌표</ko>
			 */
			this._triggerEvent("touchStart", { pos : e.pos });
		},

		/**
		 * 'change' event handler
		 */
		_changeHandler : function(e) {
			var pos = e.pos,
				eventRes = null;

			this._setPointerEvents(e);  // for "click" bug

			/**
			 * When touch moves
			 * @ko 터치한 상태에서 이동될 때 발생하는 이벤트
			 * @name eg.Flicking#touchMove
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
			 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
			 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
			 * @param {Number} param.direction Direction of the panel move (see eg.DIRECTION_* constant) <ko>플리킹 방향 (eg.DIRECTION_* constant 확인)</ko>
			 * @param {Array} param.pos Departure coordinate <ko>출발점 좌표</ko>
			 * @param {Number} param.pos.0 Departure x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.pos.1 Departure y-coordinate <ko>y 좌표</ko>
			 */
			/**
			 * Occurs during the change
			 * @ko 터치하지 않은 상태에서 패널이 이동될 때 발생하는 이벤트
			 * @name eg.Flicking#change
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
			 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
			 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
			 * @param {Number} param.direction Direction of the panel move (see eg.DIRECTION_* constant) <ko>플리킹 방향 (eg.DIRECTION_* constant 확인)</ko>
			 * @param {Array} param.pos Departure coordinate <ko>출발점 좌표</ko>
			 * @param {Number} param.pos.0 Departure x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.pos.1 Departure y-coordinate <ko>y 좌표</ko>
			 */
			this._conf.triggerFlickEvent && ( eventRes = this._triggerEvent( e.holding ? "touchMove" : "flick", { pos : e.pos } ) );
			( eventRes || eventRes === null ) && this._setTranslate( [ -pos[ +!this.options.horizontal ], 0 ] );
		},

		/**
		 * 'release' event handler
		 */
		_releaseHandler : function(e) {
			var touch = this._conf.touch,
				pos = e.destPos,
				posIndex = +!this.options.horizontal,
				holdPos = touch.holdPos[posIndex],
				panelSize = this._conf.panel.size;

			touch.distance = e.depaPos[posIndex] - touch.holdPos[posIndex];
			touch.direction = this._conf.dirData[ +!Boolean(touch.holdPos[posIndex] < e.depaPos[posIndex]) ];

			pos[posIndex] = Math.max(holdPos - panelSize, Math.min(holdPos, pos[posIndex]));
			touch.destPos[posIndex] = pos[posIndex] = Math.round(pos[posIndex] / panelSize) * panelSize;

			/**
			 * When touch ends
			 * @ko 터치가 종료될 때 발생되는 이벤트
			 * @name eg.Flicking#touchEnd
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
			 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
			 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
			 * @param {Number} param.direction Direction of the panel move (see eg.DIRECTION_* constant) <ko>플리킹 방향 (eg.DIRECTION_* constant 확인)</ko>
			 * @param {Array} param.depaPos Departure coordinate <ko>출발점 좌표</ko>
			 * @param {Number} param.depaPos.0 Departure x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.depaPos.1 Departure y-coordinate <ko>y 좌표</ko>
			 * @param {Array} param.destPos Destination coordinate <ko>도착점 좌표</ko>
			 * @param {Number} param.destPos.0 Destination x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.destPos.1 Destination y-coordinate <ko>y 좌표</ko>
			 */
			this._triggerEvent("touchEnd", {
				depaPos : e.depaPos,
				destPos : e.destPos
			});

			this._setPointerEvents();  // for "click" bug
		},

		/**
		 * 'animationStart' event handler
		 */
		_animationStartHandler : function(e) {
			var panel = this._conf.panel;

			panel.animating = true;
			//e.duration = this.options.duration;

			this._setPhaseValue("start");
			e.destPos[ +!this.options.horizontal ] = panel.size * ( panel.index + this._conf.indexToMove );

			if(this._isMovable()) {
				/**
				 * Before panel changes
				 * @ko 플리킹이 시작되기 전에 발생하는 이벤트
				 * @name eg.Flicking#flickStart
				 * @event
				 *
				 * @param {Object} param
				 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
				 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
				 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
			 	 * @param {Number} param.direction Direction of the panel move (see eg.DIRECTION_* constant) <ko>플리킹 방향 (eg.DIRECTION_* constant 확인)</ko>
				 * @param {Array} param.depaPos Departure coordinate <ko>출발점 좌표</ko>
				 * @param {Number} param.depaPos.0 Departure x-coordinate <ko>x 좌표</ko>
				 * @param {Number} param.depaPos.1 Departure y-coordinate <ko>y 좌표</ko>
				 * @param {Array} param.destPos Destination coordinate <ko>도착점 좌표</ko>
				 * @param {Number} param.destPos.0 Destination x-coordinate <ko>x 좌표</ko>
				 * @param {Number} param.destPos.1 Destination y-coordinate <ko>y 좌표</ko>
				 */
				this._triggerEvent("flickStart", {
					depaPos : e.depaPos,
					destPos : e.destPos
				});

			} else {
				/**
				 * Before panel restores it's last position
				 * @ko 플리킹 임계치에 도달하지 못하고 사용자의 액션이 끝났을 경우, 원래 패널로 복원되기 전에 발생하는 이벤트
				 * @name eg.Flicking#beforeRestore
				 * @event
				 *
				 * @param {Object} param
				 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
				 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
				 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
			 	 * @param {Number} param.direction Direction of the panel move (see eg.DIRECTION_* constant) <ko>플리킹 방향 (eg.DIRECTION_* constant 확인)</ko>
				 * @param {Array} param.depaPos Departure coordinate <ko>출발점 좌표</ko>
				 * @param {Number} param.depaPos.0 Departure x-coordinate <ko>x 좌표</ko>
				 * @param {Number} param.depaPos.1 Departure y-coordinate <ko>y 좌표</ko>
				 * @param {Array} param.destPos Destination coordinate <ko>도착점 좌표</ko>
				 * @param {Number} param.destPos.0 Destination x-coordinate <ko>x 좌표</ko>
				 * @param {Number} param.destPos.1 Destination y-coordinate <ko>y 좌표</ko>
				 */
				if(!(this._conf.customEvent.restore = this._triggerEvent("beforeRestore", {
					depaPos : e.depaPos,
					destPos : e.destPos
				}))) {
					e.stop();
				}
			}
		},

		/**
		 * 'animationEnd' event handler
		 */
		_animationEndHandler : function() {
			var panel = this._conf.panel;

			this._setPhaseValue("end");
			panel.animating = false;

			/**
			 * After panel changes
			 * @ko 플리킹으로 패널이 이동된 후 발생하는 이벤트
			 * @name eg.Flicking#flickEnd
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
			 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
			 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
			 * @param {Number} param.direction Direction of the panel move (see eg.DIRECTION_* constant) <ko>플리킹 방향 (eg.DIRECTION_* constant 확인)</ko>
			 */
			/**
			 * After panel restores it's last position
			 * @ko 플리킹 임계치에 도달하지 못하고 사용자의 액션이 끝났을 경우, 원래 인덱스로 복원된 후 발생하는 이벤트
			 * @name eg.Flicking#restore
			 * @event
			 *
			 * @param {Object} param
			 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
			 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
			 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
			 * @param {Number} param.direction Direction of the panel move (see eg.DIRECTION_* constant) <ko>플리킹 방향 (eg.DIRECTION_* constant 확인)</ko>
			 */
			if(panel.changed) {
				this._triggerEvent("flickEnd");
			} else if(this._conf.customEvent.restore) {
				this._triggerEvent("restore");
			}
		},

		/**
		 * Set value when panel changes
		 * @param {String} phase - [start|end]
		 */
		_setPhaseValue : function(phase) {
			var panel = this._conf.panel;

			if( ~phase.indexOf("start") && ( panel.changed = this._isMovable() ) ) {
				this._conf.indexToMove === 0 && this._setPanelNo();
			}

			if( ~phase.indexOf("end") ) {
				if(this.options.circular && panel.changed) {
					this._arrangePanels(true, this._conf.indexToMove);
				}

				this._setTranslate([ -panel.size * panel.index, 0 ]);
				this._conf.indexToMove = 0;
			}
		},

		/**
		 * Set the logical panel index number
		 */
		_setPanelNo : function() {
			var panel = this._conf.panel,
				count = panel.origCount - 1,
				num = this._conf.touch.direction === this._conf.dirData[0] ? 1 : -1;

			panel.index += num;
			panel.no += num;

			if(panel.no > count) {
				panel.no = 0;
			} else if(panel.no < 0) {
				panel.no = count;
			}
		},

		/**
		 * Set pointerEvents css property on container element due to the iOS click bug
		 * @param {Event} e
		 */
		_setPointerEvents : function(e) {
			var pointer = this._container.css("pointerEvents"), val;

			if( e && e.holding && e.hammerEvent.preventSystemEvent && pointer !== "none" ) {
				val = "none";
			} else if( !e && pointer !== "auto" ) {
				val = "auto";
			}

			val && this._container.css("pointerEvents", val);
		},

		/**
		 * Set translate property value
		 * @param {Array} coords coordinate x,y value
		 */
		_setTranslate : function(coords) {
			// the param comes as [ val, 0 ], whatever the direction. So reorder the value depend the direction.
			this._getDataByDirection(coords);

			this._container.css("transform", ns.translate(
				this._getUnitValue(coords[0]),
				this._getUnitValue(coords[1]),
				this._conf.useLayerHack
			));
		},

		/**
		 * Return unit formatted value
		 * @param {Number|String} val
		 * @return {String} val Value formatted with unit
		 */
		_getUnitValue : function(val) {
			var rx = /(?:[a-z]{2,}|%)$/;
			return ( parseInt(val, 10) || 0 ) + ( String(val).match(rx) || "px" );
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
				next = direction === this._conf.dirData[0],
				result = null, total, index, currentIndex;

			if(physical) {
				total = panel.count;
				index = pos;
			} else {
				total = panel.origCount;
				index = panel.no;
			}

			currentIndex = index;

			if(next) {
				if(index < total-1) {
					index++;
				} else if(circular) {
					index = 0;
				}
			} else {
				if(index > 0) {
					index--;
				} else if(circular) {
					index = total - 1;
				}
			}

			if(currentIndex !== index) {
				result = element ? $(panel.list[ next ? pos + 1 : pos - 1 ]) : index;
			}

			return result;
		},

		/**
		 * Set value to force move panels when duration is 0
		 * @param {Boolean} next
		 */
		_setValueToMove : function( next ) {
			this._conf.touch.distance = this.options.threshold + 1;
			this._conf.touch.direction = this._conf.dirData[ +!next ];
		},

		/**
		 * Move panel to the given direction
		 * @param {Boolean} next
		 * @param {Number} duration
		 */
		_movePanel : function(next, duration) {
			var panel = this._conf.panel;

			if(panel.animating) {
				return;
			}

			this._setValueToMove(next);

			if( this.options.circular || this[ next ? "getNextIndex" : "getPrevIndex" ]() != null ) {
				this._setMovableCoord("setBy", [ panel.size * ( next ? 1 : -1 ), 0 ], true, duration);
				!duration && this._setPhaseValue("startend");
			}
		},

		/**
		 * Get current panel position
		 * @ko 현재 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number} Number Current index number <ko>현재 패널 인덱스 번호</ko>
		 */
		getIndex : function(physical) {
			return this._conf.panel[ physical ? "index" : "no" ];
		},

		/**
		 * Get current panel element
		 * @ko 현재 패널 요소의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getElement
		 * @return {jQuery} jQuery Current element <ko>현재 요소</ko>
		 */
		getElement : function() {
			var panel = this._conf.panel;
			return $(panel.list[panel.index]);
		},

		/**
		 * Get next panel element
		 * @ko 다음 패널 요소의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getNextElement
		 * @return {jQuery} jQuery Next element <ko>다음 패널 요소</ko>
		 */
		getNextElement : function() {
			return this._getElement(this._conf.dirData[0], true);
		},

		/**
		 * Get next panel index
		 * @ko 다음 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getNextIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number} Number Next element index value <ko>다음 패널 인덱스 번호</ko>
		 */
		getNextIndex : function(physical) {
			return this._getElement(this._conf.dirData[0], false, physical);
		},

		/**
		 * Get whole panel elements
		 * @ko 패널을 구성하는 모든 요소들의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getAllElements
		 * @return {jQuery} jQuery All panel elements <ko>모든 패널 요소</ko>
		 */
		getAllElements : function() {
			return this._conf.panel.list;
		},

		/**
		 * Get previous panel element
		 * @ko 이전 패널 요소의 레퍼런스를 반환한다.
		 * @method ns.Flicking#getPrevElement
		 * @return {jQuery} jQuery Previous element <ko>이전 패널 요소</ko>
		 */
		getPrevElement : function() {
			return this._getElement(this._conf.dirData[1], true);
		},

		/**
		 * Get previous panel index
		 * @ko 이전 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getPrevIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number} number Previous element index value <ko>이전 패널 인덱스 번호</ko>
		 */
		getPrevIndex : function(physical) {
			return this._getElement(this._conf.dirData[1], false, physical);
		},

		/**
		 * Get total panel count
		 * @ko 전체 패널의 개수를 반환한다.
		 * @method eg.Flicking#getTotalCount
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number} Number Count of all elements <ko>모든 패널 요소 개수</ko>
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
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds <ko>애니메이션 진행시간(ms)</ko>
		 */
		next : function(duration) {
			this._movePanel( true, duration );
		},

		/**
		 * Move to previous panel
		 * @ko 이전 패널로 이동한다.
		 * @method eg.Flicking#prev
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds <ko>애니메이션 진행시간(ms)</ko>
		 */
		prev : function(duration) {
			this._movePanel( false, duration );
		},

		/**
		 * Move to indicated panel
		 * @ko 지정한 패널로 이동한다.
		 * @method eg.Flicking#moveTo
		 * @param {Number} no logical panel index
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds <ko>애니메이션 진행시간(ms)</ko>
		 */
		moveTo : function(no, duration) {
			var panel = this._conf.panel,
				currentIndex = panel.index,
				indexToMove = 0,
				movableCount, movable;

			if(typeof no !== "number" || no >= panel.origCount || no === panel.no || panel.animating) {
				return;
			}

			movable = this.options.circular || no >= 0 && no < panel.origCount;

			if(this.options.circular) {
				// real panel count which can be moved on each(left(up)/right(down)) sides
				movableCount = [ currentIndex, panel.count - (currentIndex + 1) ];

				if(no > panel.no) {
					indexToMove = no - panel.no;

					if(indexToMove > movableCount[1]) {
						indexToMove = -( movableCount[0] + 1 - ( indexToMove - movableCount[1] ) );
					}
				} else {
					indexToMove = -(panel.no - no);

					if(Math.abs(indexToMove) > movableCount[0]) {
						indexToMove = movableCount[1] + 1 - ( Math.abs(indexToMove) - movableCount[0] );
					}

				}

				panel.no = no;
				this._conf.indexToMove = indexToMove;
				this._setValueToMove( indexToMove > 0 );
				this._setMovableCoord("setBy", [ panel.size * indexToMove, 0 ], true, duration);

			} else if(movable) {
				panel.no = panel.index = no;
				this._setMovableCoord("setTo", [ panel.size * no, 0 ], true, duration);
			}

			movable && !duration && this._setPhaseValue("startend");
		},

		/**
		 * Update panel size according current viewport
		 * @ko 패널 사이즈 정보를 갱신한다.
		 * @method eg.Flicking#resize
		 */
		resize : function() {
			var panel = this._conf.panel,
				width = panel.size = this._wrapper.width(),
				maxCoords = [ width * ( panel.count - 1 ), 0 ];

			// resize panel and parent elements
			this._container.width( maxCoords[0] + width );
			panel.list.css( "width", width );

			// adjust the position of current panel
			this._mcInst.options.max = maxCoords;
			this._setMovableCoord( "setTo", [ width * panel.index, 0 ] );
		}
	});
});