// jscs:disable validateLineBreaks, maximumLineLength
/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/
eg.module("flicking", ["jQuery", eg, window, document, eg.MovableCoord], function ($, ns, global, doc, MC) {
	"use strict";

	// jscs:enable validateLineBreaks, maximumLineLength
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
	 * @param {Number} [options.deceleration=0.0006] Deceleration value can be altered to change the momentum animation duration. higher numbers make the animation shorter <ko>감속계수는 가속도를 조절하여 애니메이션 시간을 변경할 수 있다. 높을수록 애니메이션이 짧아진다.</ko>
	 * @param {Boolean} [options.horizontal=true] For move direction (when horizontal is false, then move direction is vertical) <ko>이동방향 설정 (horizontal == true 가로방향, horizontal == false 세로방향)</ko>
	 * @param {Boolean} [options.circular=false] To make panels rotate infinitely  <ko>순환 여부</ko>
	 * @param {Number|Array} [options.previewPadding=[0,0]] Padding value to display previous and next panels. If set array value the order is left(up) to right(down) <ko>이전과 다음 패널을 출력하는 프리뷰 형태에 사용되는 padding 값. 배열 형태로 지정시 좌측(상단), 우측(하단) 순서로 지정</ko>
	 * @param {Number} [options.threshold=40] Threshold pixels to move panels in prev/next direction <ko>다음 패널로 이동되기 위한 임계치 픽셀</ko>
	 * @param {Number} [options.duration=100] Duration time of panel change animation in milliseconds <ko>패널 이동 애니메이션 진행시간(ms) 값</ko>
	 * @param {Function} [options.panelEffect=easeOutCubic] easing function which is used on panel move animation<ko>패널 간의 이동 애니메이션에 사용되는 effect easing 함수</ko>
	 * @param {Number} [options.defaultIndex=0] Default panel index to show in first time <ko>초기에 출력할 패널 인덱스</ko>
	 * @param {Array} [options.inputType] inputType you can control input type. a kind of inputs are "touch", "mouse".  default value is ["touch", "mouse"] <ko>입력 타입을 지정할수 있다. 입력타입은 "touch", "mouse"가 있으며, 배열로 입력할 수 있다. (기본값은 ["touch", "mouse"] 이다)</ko>
	 *
	 * @codepen {"id":"rVOpPK", "ko":"플리킹 기본 예제", "en":"Flicking default example", "collectionId":"ArxyLK", "height" : 403}
	 *
	 * @support {"ie": "10+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
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
	 	var some = new eg.Flicking("#mflick", {
	 		circular : true,
	 		threshold : 50
	 	}).on({
	 		beforeRestore : function(e) { ... },
	 		flickStart : function(e) { ... }
	 	);
	 	</script>
	 */

	// define custom events name
	var EVENTS = {
		"beforeFlickStart": "beforeFlickStart",
		"beforeRestore": "beforeRestore",
		"flick": "flick",
		"flickEnd": "flickEnd",
		"restore": "restore"
	};

	// check for css transform support
	var SUPPORT_TRANSFORM = doc.documentElement.style;
	SUPPORT_TRANSFORM = "transform" in SUPPORT_TRANSFORM ||
		"webkitTransform" in SUPPORT_TRANSFORM;

	// check for will-change support
	var SUPPORT_WILLCHANGE = global.CSS && global.CSS.supports &&
		global.CSS.supports("will-change", "transform");

	// check for Android 2.x
	var IS_ANDROID2 = ns.agent().os;
	IS_ANDROID2 = IS_ANDROID2.name === "android" && /^2\./.test(IS_ANDROID2.version);

	ns.Flicking = ns.Class.extend(ns.Component, {
		_events: function() {
			return EVENTS;
		},
		/**
		 * Constructor
		 * @param {HTMLElement|String|jQuery} element - base element
		 * @param {Object} options
		 */
		construct: function (element, options, _prefix) {
			this.$wrapper = $(element);

			var $children = this.$wrapper.children();
			if (!$children.length) {
				// jscs:disable validateLineBreaks, maximumLineLength
				throw new Error("Given base element doesn't exist or it hasn't proper DOM structure to be initialized.");

				// jscs:enable validateLineBreaks, maximumLineLength
			}

			$.extend(this.options = {
				hwAccelerable: ns.isHWAccelerable(),  // check weather hw acceleration is available
				prefix: "eg-flick",		// prefix value of class name
				deceleration: 0.0006,		// deceleration value
				horizontal: true,			// move direction (true == horizontal, false == vertical)
				circular: false,			// circular mode. In this mode at least 3 panels are required.
				previewPadding: [0, 0],	// preview padding value in left(up) to right(down) order. In this mode at least 5 panels are required.
				threshold: 40,				// the distance pixel threshold value for change panel
				duration: 100,				// duration ms for animation
				panelEffect: $.easing.easeOutCubic,  // $.easing function for panel change animation
				defaultIndex: 0,			// initial panel index to be shown
				inputType: ["touch", "mouse"]	// input type
			}, options);

			var padding = this.options.previewPadding;

			if (typeof padding === "number") {
				padding = this.options.previewPadding = [ padding, padding ];
			} else if (padding.constructor !== Array) {
				padding = this.options.previewPadding = [ 0, 0 ];
			}

			// config value
			this._conf = {
				panel: {
					$list: $children,	// panel list
					index: 0,			// current physical dom index
					no: 0,				// current logical panel index
					size: 0,			// panel size
					count: 0,			// total physical panel count
					origCount: 0,		// total count of given original panels
					changed: false,		// if panel changed
					animating: false,	// current animating status boolean
					minCount: padding[0] + padding[1] > 0 ? 5 : 3  // minimum panel count
				},
				touch: {
					holdPos: [0, 0],	// hold x,y coordinate
					destPos: [0, 0],	// destination x,y coordinate
					distance: 0,		// touch distance pixel of start to end touch
					direction: null,	// touch direction
					lastPos: 0			// to determine move on holding
				},
				customEvent: {			// for custom events value
					flick: true,
					restore: false,
					restoreCall: false
				},
				useLayerHack: this.options.hwAccelerable && !SUPPORT_WILLCHANGE,
				dirData: [],			// direction constant value according horizontal or vertical
				indexToMove: 0,
				eventPrefix: _prefix || "",

				// For buggy link highlighting on Android 2.x
				$dummyAnchor: null
			};

			$([["LEFT", "RIGHT"], ["UP", "DOWN"]][+!this.options.horizontal]).each(
				$.proxy(function (i, v) {
					this._conf.dirData.push(MC["DIRECTION_" + v]);
				}, this));

			!ns._hasClickBug() && (this._setPointerEvents = $.noop);

			this._build();
			this._bindEvents();

			this._applyPanelsCss();
			this._arrangePanels();

			this.options.hwAccelerable && SUPPORT_WILLCHANGE && this._setHint();
			this._adjustContainerCss("end");
		},

		/**
		 * Build and set panel nodes to make flicking structure
		 */
		_build: function () {
			var panel = this._conf.panel;
			var options = this.options;
			var $children = panel.$list;
			var padding = options.previewPadding.concat();
			var prefix = options.prefix;
			var horizontal = options.horizontal;
			var panelCount = panel.count = panel.origCount = $children.length;
			var cssValue;

			this._setPadding(padding, true);
			var sizeValue = this._getDataByDirection([ panel.size, "100%" ]);

			// panels' css values
			$children.addClass(prefix + "-panel").css({
				position: "absolute",
				width: sizeValue[0],
				height: sizeValue[1],
				top: 0,
				left: 0
			});

			// create container element
			cssValue = "position:relative;z-index:2000;width:100%;height:100%;" +
				(!horizontal ? "top:" + padding[0] + "px;" : "");

			this.$container = $children.wrapAll(
				"<div class='" + prefix + "-container' style='" + cssValue + "' />"
			).parent();

			if (this._addClonePanels()) {
				panelCount = panel.count = (
					panel.$list = this.$container.children()
				).length;
			}

			// create MovableCoord instance
			this._mcInst = new MC({
				min: [0, 0],
				max: this._getDataByDirection([panel.size * (panelCount - 1), 0]),
				margin: 0,
				circular: false,
				easing: options.panelEffect,
				deceleration: options.deceleration
			}).bind(this.$wrapper, {
				scale: this._getDataByDirection([-1, 0]),
				direction: MC["DIRECTION_" +
					(horizontal ? "HORIZONTAL" : "VERTICAL")],
				interruptable: false,
				inputType: options.inputType
			});

			this._setDefaultPanel(options.defaultIndex);
		},

		/**
		 * Set preview padding value
		 * @param {Array} padding
		 * @param {Boolean} build
		 */
		_setPadding: function(padding, build) {
			var horizontal = this.options.horizontal;
			var panel = this._conf.panel;

			panel.size = this.$wrapper[
				horizontal ? "outerWidth" : "height"
			]() - (padding[0] + padding[1]);

			var cssValue = {
				padding: (horizontal ?
				"0 " + padding.reverse().join("px 0 ") :
				padding.join("px 0 ")) + "px"
			};

			if (build) {
				cssValue.overflow = "hidden";
			} else if (!horizontal) {
				this.$container.css("top", padding[0]);
			}

			this.$wrapper.css(cssValue);
		},

		/**
		 * To fulfill minimum panel count cloning original node when circular or previewPadding option are set
		 * @return {Boolean} true : added clone node, false : not added
		 */
		_addClonePanels: function () {
			var panel = this._conf.panel;
			var panelCount = panel.origCount;
			var cloneCount = panel.minCount - panelCount;
			var list = panel.$list;
			var cloneNodes;

			// if panels are given less than required when circular option is set, then clone node to apply circular mode
			if (this.options.circular && panelCount < panel.minCount) {
				cloneNodes = list.clone();

				while (cloneNodes.length < cloneCount) {
					cloneNodes = cloneNodes.add(list.clone());
				}

				return this.$container.append(cloneNodes);
			}
		},

		/**
		 * Move panel's position within array
		 * @param {Number} count element counts to move
		 * @param {Boolean} append where the list to be appended(moved) (true: to the end, false: to the beginning)
		 */
		_movePanelPosition: function (count, append) {
			var panel = this._conf.panel;
			var list = panel.$list.toArray();
			var listToMove;

			listToMove = list.splice(append ? 0 : panel.count - count, count);
			panel.$list = $(append ? list.concat(listToMove) : listToMove.concat(list));
		},

		/**
		 * Set default panel to show
		 * @param {Number} index
		 */
		_setDefaultPanel: function (index) {
			var panel = this._conf.panel;
			var lastIndex = panel.count - 1;
			var coords;

			if (this.options.circular) {
				// if default index is given, then move correspond panel to the first position
				if (index > 0 && index <= lastIndex) {
					this._movePanelPosition(index, true);
				}

				// set first panel's position according physical node length
				this._movePanelPosition(this._getBasePositionIndex(), false);

				panel.no = index;
			} else {
				// if defaultIndex option is given, then move to that index panel
				if (index > 0 && index <= lastIndex) {
					panel.no = panel.index = index;
					coords = [ -(panel.size * index), 0];

					this._setTranslate(coords);
					this._setMovableCoord("setTo", [
						Math.abs(coords[0]), Math.abs(coords[1])
					], true, 0);
				}
			}
		},

		/**
		 * Arrange panels' position
		 * @param {Boolean} sort Need to sort panel's position
		 * @param {Number} indexToMove Number to move from current position (negative: left, positive: right)
		 */
		_arrangePanels: function (sort, indexToMove) {
			var conf = this._conf;
			var panel = conf.panel;
			var touch = conf.touch;
			var dirData = conf.dirData;

			if (this.options.circular) {
				// when arranging panels, set flag to not trigger flick custom event
				conf.customEvent.flick = false;

				// move elements according direction
				if (sort) {
					indexToMove && (touch.direction = dirData[+!Boolean(indexToMove > 0)]);
					this._arrangePanelPosition(touch.direction, indexToMove);
				}

				// set index for base element's position
				panel.index = this._getBasePositionIndex();

				// arrange MovableCoord's coord position
				conf.customEvent.flick = !!this._setMovableCoord("setTo", [
					panel.size * panel.index, 0
				], true, 0);
			}

			this._applyPanelsPos();
		},

		/**
		 * Set each panel's position in DOM
 		 */
		_applyPanelsPos: function() {
			this._conf.panel.$list.each(
				$.proxy(this._applyPanelsCss, this)
			);
		},

		/**
		 * Set CSS style values to move elements
		 *
		 * Initialize setting up checking if browser support transform css property.
		 * If browser doesn't support transform, then use left/top properties instead.
		 */
		_setMoveStyle: (function () {
			return SUPPORT_TRANSFORM ?
				function ($element, coords) {
					$element.css("transform",
						ns.translate(coords[0], coords[1], this._conf.useLayerHack)
					);
				} :	function ($element, coords) {
					$element.css({ left: coords[0], top: coords[1] });
				};
		})(),

		/**
		 * Callback function for applying CSS values to each panels
		 *
		 * Need to be initialized before use, to set up for Android 2.x browsers or others.
		 */
		_applyPanelsCss: function () {
			var conf = this._conf;
			var dummyAnchorClassName = "__dummy_anchor";

			if (IS_ANDROID2) {
				conf.$dummyAnchor = $("." + dummyAnchorClassName);

				!conf.$dummyAnchor.length && this.$wrapper.append(
					conf.$dummyAnchor = $("<a href='javascript:void(0);' class='" +
						dummyAnchorClassName +
						"' style='position:absolute;height:0px;width:0px;'>")
				);

				this._applyPanelsCss = function (i, v) {
					var coords = this._getDataByDirection([
						(this._conf.panel.size * i) + "px", 0
					]);

					$(v).css({
						left: coords[0],
						top: coords[1]
					});
				};
			} else {
				this._applyPanelsCss = function (i, v) {
					var coords = this._getDataByDirection([
						SUPPORT_TRANSFORM ?
							(100 * i) + "%" :
							(this._conf.panel.size * i) + "px", 0]);

					this._setMoveStyle($(v), coords);
				};
			}
		},

		/**
		 * Adjust container's css value to handle Android 2.x link highlighting bug
		 *
		 * @param {String} phase
		 *    start - set left/top value to 0
		 *    end - set translate value to 0
		 * @param {Array} coords coordinate value
		 */
		_adjustContainerCss: function (phase, coords) {
			var conf = this._conf;
			var panel = conf.panel;
			var options = this.options;
			var horizontal = options.horizontal;
			var paddingTop = options.previewPadding[0];
			var container = this.$container;
			var value;

			if (IS_ANDROID2) {
				if (!coords) {
					coords = [-panel.size * panel.index, 0];
				}

				if (phase === "start") {
					container = container[0].style;
					value = parseInt(container[horizontal ? "left" : "top"], 10);

					if (horizontal) {
						value && (container.left = 0);
					} else {
						value !== paddingTop && (container.top = paddingTop + "px");
					}

					this._setTranslate([-coords[+!options.horizontal], 0]);

				} else if (phase === "end") {
					!horizontal && (coords[0] += paddingTop);
					coords = this._getCoordsValue(coords);

					container.css({
						left: coords.x,
						top: coords.y,
						transform: ns.translate(0, 0, conf.useLayerHack)
					});

					conf.$dummyAnchor[0].focus();
				}
			}
		},

		/**
		 * Set MovableCoord coord value
		 * @param {String} method
		 * @param {Array} coord
		 * @param {Boolean} isDirVal
		 * @param {Number} duration
		 * @return {eg.MovableCoord} MovableCoord instance
		 */
		_setMovableCoord: function (method, coord, isDirVal, duration) {
			isDirVal && this._getDataByDirection(coord);
			return this._mcInst[method](coord[0], coord[1], duration);
		},

		/**
		 * Set hint for browser to decide efficient way of doing transform changes(or animation)
		 * https://dev.opera.com/articles/css-will-change-property/
		 */
		_setHint: function () {
			var value = "transform";
			this.$container.css("willChange", value);
			this._conf.panel.$list.css("willChange", value);
		},

		/**
		 * Get data according options.horizontal value
		 *
		 * @param {Array} value primary data to handle
		 * @return {Array}
		 */
		_getDataByDirection: function (value) {
			!this.options.horizontal && value.reverse();
			return value;
		},

		/**
		 * Move nodes
		 * @param {Boolean} direction
		 * @param {Number} indexToMove
		 */
		_arrangePanelPosition: function (direction, indexToMove) {
			var next = direction === this._conf.dirData[0];
			this._movePanelPosition(Math.abs(indexToMove || 1), next);
		},

		/**
		 * Get the base position index of the panel
		 */
		_getBasePositionIndex: function () {
			var panel = this._conf.panel;
			return panel.index = Math.floor(panel.count / 2 - 0.1);
		},

		/**
		 * Bind events
		 */
		_bindEvents: function () {
			this._mcInst.on({
				hold: $.proxy(this._holdHandler, this),
				change: $.proxy(this._changeHandler, this),
				release: $.proxy(this._releaseHandler, this),
				animationStart: $.proxy(this._animationStartHandler, this),
				animationEnd: $.proxy(this._animationEndHandler, this)
			});
		},

		/**
		 * 'hold' event handler
		 */
		_holdHandler: function (e) {
			this._conf.touch.holdPos = e.pos;
			this._conf.panel.changed = false;

			this._adjustContainerCss("start", e.pos);
		},

		/**
		 * 'change' event handler
		 */
		_changeHandler: function (e) {
			var conf = this._conf;
			var touch = conf.touch;
			var pos = e.pos;
			var direction;
			var eventRes = null;
			var movedPx;

			this._setPointerEvents(e);  // for "click" bug

			/**
			 * Occurs during the change
			 * @ko 패널이 이동될 때 발생하는 이벤트
			 * @name eg.Flicking#flick
			 * @event
			 * @param {Object} param
			 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
			 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
			 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
			 * @param {Number} param.direction Direction of the panel move (see eg.MovableCoord.DIRECTION_* constant) <ko>플리킹 방향 (eg.MovableCoord.DIRECTION_* constant 확인)</ko>
			 * @param {Array} param.pos Departure coordinate <ko>출발점 좌표</ko>
			 * @param {Number} param.pos.0 Departure x-coordinate <ko>x 좌표</ko>
			 * @param {Boolean} param.holding Holding if an area is pressed, this value is 'true'. <ko>스크린을 사용자가 누르고 있을 경우 true </ko>
			 */
			if (e.hammerEvent) {
				direction = e.hammerEvent.direction;

				// Adjust direction in case of diagonal touch move
				movedPx = e.hammerEvent[ this.options.horizontal ? "deltaX" : "deltaY" ];

				if (!~$.inArray(direction, conf.dirData)) {
					direction = conf.dirData[ +(Math.abs(touch.lastPos) <= movedPx) ];
				}

				touch.lastPos = movedPx;
			} else {
				touch.lastPos = null;
			}

			conf.customEvent.flick && (eventRes = this._triggerEvent(EVENTS.flick, {
				pos: e.pos,
				holding: e.holding,
				direction: direction || touch.direction
			}));

			(eventRes || eventRes === null) && this._setTranslate([
				-pos[+!this.options.horizontal], 0
			]);
		},

		/**
		 * 'release' event handler
		 */
		_releaseHandler: function (e) {
			var touch = this._conf.touch;
			var pos = e.destPos;
			var posIndex = +!this.options.horizontal;
			var holdPos = touch.holdPos[posIndex];
			var panelSize = this._conf.panel.size;

			touch.distance = e.depaPos[posIndex] - touch.holdPos[posIndex];

			touch.direction = this._conf.dirData[
				+!Boolean(touch.holdPos[posIndex] < e.depaPos[posIndex])
			];

			pos[posIndex] = Math.max(
				holdPos - panelSize, Math.min(holdPos, pos[posIndex])
			);

			touch.destPos[posIndex] =
				pos[posIndex] = Math.round(pos[posIndex] / panelSize) * panelSize;

			touch.distance === 0 && this._adjustContainerCss("end");

			this._setPointerEvents();  // for "click" bug
		},

		/**
		 * 'animationStart' event handler
		 */
		_animationStartHandler: function (e) {
			var conf = this._conf;
			var panel = conf.panel;
			var customEvent = conf.customEvent;

			panel.animating = true;

			if (!customEvent.restoreCall && e.hammerEvent &&
				this._setPhaseValue("start", {
					depaPos: e.depaPos,
					destPos: e.destPos
				}) === false) {
				e.stop();
			}

			e.hammerEvent && (e.duration = this.options.duration);
			e.destPos[+!this.options.horizontal] =
				panel.size * (
					panel.index + conf.indexToMove
				);

			if (this._isMovable()) {
				!customEvent.restoreCall && (customEvent.restore = false);
			} else {
				this._triggerBeforeRestore(e);
			}
		},

		/**
		 * 'animationEnd' event handler
		 */
		_animationEndHandler: function () {
			this._setPhaseValue("end");

			this._conf.panel.animating = false;
			this._triggerRestore();
		},

		/**
		 * Trigger beforeRestore event
		 * @param {Object} e event object
		 */
		_triggerBeforeRestore: function(e) {
			var conf = this._conf;
			var touch = conf.touch;

			// reverse direction value when restore
			touch.direction = ~~conf.dirData.join("").replace(touch.direction, "");

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
			 * @param {Number} param.direction Direction of the panel move (see eg.MovableCoord.DIRECTION_* constant) <ko>플리킹 방향 (eg.MovableCoord.DIRECTION_* constant 확인)</ko>
			 * @param {Array} param.depaPos Departure coordinate <ko>출발점 좌표</ko>
			 * @param {Number} param.depaPos.0 Departure x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.depaPos.1 Departure y-coordinate <ko>y 좌표</ko>
			 * @param {Array} param.destPos Destination coordinate <ko>도착점 좌표</ko>
			 * @param {Number} param.destPos.0 Destination x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.destPos.1 Destination y-coordinate <ko>y 좌표</ko>
			 */
			conf.customEvent.restore = this._triggerEvent(EVENTS.beforeRestore, {
				depaPos: e.depaPos,
				destPos: e.destPos
			});

			if (!conf.customEvent.restore) {
				"stop" in e && e.stop();
				conf.panel.animating = false;
			}
		},

		/**
		 * Trigger restore event
		 */
		_triggerRestore: function() {
			var customEvent = this._conf.customEvent;

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
			 * @param {Number} param.direction Direction of the panel move (see eg.MovableCoord.DIRECTION_* constant) <ko>플리킹 방향 (eg.MovableCoord.DIRECTION_* constant 확인)</ko>
			 */
			customEvent.restore && this._triggerEvent(EVENTS.restore);
			customEvent.restoreCall = false;
		},

		/**
		 * Set value when panel changes
		 * @param {String} phase - [start|end]
		 * @param {Object} pos
		 */
		_setPhaseValue: function (phase, pos) {
			var conf = this._conf;
			var options = this.options;
			var panel = conf.panel;

			if (phase === "start" && (panel.changed = this._isMovable())) {
				conf.indexToMove === 0 && this._setPanelNo();

				/**
				 * Before panel changes
				 * @ko 플리킹이 시작되기 전에 발생하는 이벤트
				 * @name eg.Flicking#beforeFlickStart
				 * @event
				 *
				 * @param {Object} param
				 * @param {String} param.eventType Name of event <ko>이벤트명</ko>
				 * @param {Number} param.index Current panel physical index <ko>현재 패널 물리적 인덱스</ko>
				 * @param {Number} param.no Current panel logical position <ko>현재 패널 논리적 인덱스</ko>
				 * @param {Number} param.direction Direction of the panel move (see eg.MovableCoord.DIRECTION_* constant) <ko>플리킹 방향 (eg.MovableCoord.DIRECTION_* constant 확인)</ko>
				 * @param {Array} param.depaPos Departure coordinate <ko>출발점 좌표</ko>
				 * @param {Number} param.depaPos.0 Departure x-coordinate <ko>x 좌표</ko>
				 * @param {Number} param.depaPos.1 Departure y-coordinate <ko>y 좌표</ko>
				 * @param {Array} param.destPos Destination coordinate <ko>도착점 좌표</ko>
				 * @param {Number} param.destPos.0 Destination x-coordinate <ko>x 좌표</ko>
				 * @param {Number} param.destPos.1 Destination y-coordinate <ko>y 좌표</ko>
				 */
				if (!this._triggerEvent(EVENTS.beforeFlickStart, pos)) {
					return panel.changed = panel.animating = false;
				}
			} else if (phase === "end") {
				if (options.circular && panel.changed) {
					this._arrangePanels(true, conf.indexToMove);
				}

				!IS_ANDROID2 && this._setTranslate([-panel.size * panel.index, 0]);
				conf.touch.distance = conf.indexToMove = 0;

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
				 * @param {Number} param.direction Direction of the panel move (see eg.MovableCoord.DIRECTION_* constant) <ko>플리킹 방향 (eg.MovableCoord.DIRECTION_* constant 확인)</ko>
				 */
				panel.changed && this._triggerEvent(EVENTS.flickEnd);
			}

			!(phase === "start" && pos === undefined) && this._adjustContainerCss(phase);
		},

		/**
		 * Set the logical panel index number
		 * @param {Boolean} recover
		 */
		_setPanelNo: function (recover) {
			var panel = this._conf.panel;
			var count = panel.origCount - 1;
			var num = this._conf.touch.direction === this._conf.dirData[0] ? 1 : -1;

			if (recover) {
				panel.index = panel.prevIndex >= 0 ?
					panel.prevIndex : panel.index - num;

				panel.no = panel.prevNo >= 0 ?
					panel.prevNo : panel.no - num;

			} else {
				panel.index += num;
				panel.no += num;
			}

			if (panel.no > count) {
				panel.no = 0;
			} else if (panel.no < 0) {
				panel.no = count;
			}
		},

		/**
		 * Set pointerEvents css property on container element due to the iOS click bug
		 * @param {Event} e
		 */
		_setPointerEvents: function (e) {
			var pointer = this.$container.css("pointerEvents");
			var val;

			if (e && e.holding &&
				e.hammerEvent && e.hammerEvent.preventSystemEvent &&
				pointer !== "none"
			) {
				val = "none";
			} else if (!e && pointer !== "auto") {
				val = "auto";
			}

			val && this.$container.css("pointerEvents", val);
		},

		/**
		 * Get coordinate value with unit
		 * @param coords {Array} x,y numeric value
		 * @return {Object} x,y coordinate value with unit
		 */
		_getCoordsValue: function (coords) {
			// the param comes as [ val, 0 ], whatever the direction. So reorder the value depend the direction.
			this._getDataByDirection(coords);

			return {
				x: this._getUnitValue(coords[0]),
				y: this._getUnitValue(coords[1])
			};
		},

		/**
		 * Set translate property value
		 * @param {Array} coords coordinate x,y value
		 */
		_setTranslate: function (coords) {
			var options = this.options;

			if (!SUPPORT_TRANSFORM && !options.horizontal) {
				coords[0] += options.previewPadding[0];
			}

			coords = this._getCoordsValue(coords);
			this._setMoveStyle(this.$container, [ coords.x, coords.y ]);
		},

		/**
		 * Return unit formatted value
		 * @param {Number|String} val
		 * @return {String} val Value formatted with unit
		 */
		_getUnitValue: function (val) {
			var rx = /(?:[a-z]{2,}|%)$/;
			return (parseInt(val, 10) || 0) + (String(val).match(rx) || "px");
		},

		/**
		 * Check if panel passed through threshold pixel
		 */
		_isMovable: function () {
			return Math.abs(this._conf.touch.distance) >= this.options.threshold;
		},

		/**
		 * Trigger custom events
		 * @param {String} name - event name
		 * @param {Object} param - additional event value
		 * @return {Boolean}
		 */
		_triggerEvent: function (name, param) {
			var conf = this._conf;
			var panel = conf.panel;

			return this.trigger(conf.eventPrefix + name, $.extend({
				eventType: name,
				index: panel.index,
				no: panel.no,
				direction: conf.touch.direction
			}, param));
		},

		/**
		 * Get next/prev panel element/index.
		 * @param {Boolean} direction
		 * @param {Boolean} element - true:to get element, false:to get index
		 * @param {Number} physical - true : physical, false : logical
		 * @return {jQuery|Number}
		 */
		_getElement: function (direction, element, physical) {
			var panel = this._conf.panel;
			var circular = this.options.circular;
			var pos = panel.index;
			var next = direction === this._conf.dirData[0];
			var result = null;
			var total;
			var index;
			var currentIndex;

			if (physical) {
				total = panel.count;
				index = pos;
			} else {
				total = panel.origCount;
				index = panel.no;
			}

			currentIndex = index;

			if (next) {
				if (index < total - 1) {
					index++;
				} else if (circular) {
					index = 0;
				}
			} else {
				if (index > 0) {
					index--;
				} else if (circular) {
					index = total - 1;
				}
			}

			if (currentIndex !== index) {
				result = element ? $(panel.$list[next ? pos + 1 : pos - 1]) : index;
			}

			return result;
		},

		/**
		 * Set value to force move panels when duration is 0
		 * @param {Boolean} next
		 */
		_setValueToMove: function (next) {
			var conf = this._conf;

			conf.touch.distance = this.options.threshold + 1;
			conf.touch.direction = conf.dirData[ +!next ];
		},

		/**
		 * Check and parse value to number
		 * @param {Number|String} val
		 * @param {Number} defVal
		 * @return {Number}
		 */
		_getNumValue: function (val, defVal) {
			return isNaN(val = parseInt(val, 10)) ? defVal : val;
		},

		/**
		 * Get current panel position
		 * @ko 현재 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number} Number Current index number <ko>현재 패널 인덱스 번호</ko>
		 */
		getIndex: function (physical) {
			return this._conf.panel[ physical ? "index" : "no" ];
		},

		/**
		 * Get current panel element
		 * @ko 현재 패널 요소의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getElement
		 * @return {jQuery} jQuery Current element <ko>현재 요소</ko>
		 */
		getElement: function () {
			var panel = this._conf.panel;
			return $(panel.$list[panel.index]);
		},

		/**
		 * Get next panel element
		 * @ko 다음 패널 요소의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getNextElement
		 * @return {jQuery|null} Next element or null if no more element exist<ko>다음 패널 요소. 패널이 없는 경우에는 null</ko>
		 */
		getNextElement: function () {
			return this._getElement(this._conf.dirData[0], true);
		},

		/**
		 * Get next panel index
		 * @ko 다음 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getNextIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number|null} Next element index value or null if no more element exist<ko>다음 패널 인덱스 번호. 패널이 없는 경우에는 null</ko>
		 */
		getNextIndex: function (physical) {
			return this._getElement(this._conf.dirData[0], false, physical);
		},

		/**
		 * Get whole panel elements
		 * @ko 패널을 구성하는 모든 요소들의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getAllElements
		 * @return {jQuery} jQuery All panel elements <ko>모든 패널 요소</ko>
		 */
		getAllElements: function () {
			return this._conf.panel.$list;
		},

		/**
		 * Get previous panel element
		 * @ko 이전 패널 요소의 레퍼런스를 반환한다.
		 * @method ns.Flicking#getPrevElement
		 * @return {jQuery|null} Previous element or null if no more element exist <ko>이전 패널 요소. 패널이 없는 경우에는 null</ko>
		 */
		getPrevElement: function () {
			return this._getElement(this._conf.dirData[1], true);
		},

		/**
		 * Get previous panel index
		 * @ko 이전 패널의 인덱스 값을 반환한다.
		 * @method eg.Flicking#getPrevIndex
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number|null} Previous element index value or null if no more element exist<ko>이전 패널 인덱스 번호. 패널이 없는 경우에는 null</ko>
		 */
		getPrevIndex: function (physical) {
			return this._getElement(this._conf.dirData[1], false, physical);
		},

		/**
		 * Get total panel count
		 * @ko 전체 패널의 개수를 반환한다.
		 * @method eg.Flicking#getTotalCount
		 * @param {Boolean} [physical=false] Boolean to get physical or logical index (true : physical, false : logical) <ko>물리적/논리적 값 인덱스 불리언(true: 물리적, false: 논리적)</ko>
		 * @return {Number} Number Count of all elements <ko>모든 패널 요소 개수</ko>
		 */
		getTotalCount: function (physical) {
			return this._conf.panel[ physical ? "count" : "origCount" ];
		},

		/**
		 * Return either panel is animating or not
		 * @ko 현재 애니메이션중인지 여부를 리턴한다.
		 * @method eg.Flicking#isPlaying
		 * @return {Boolean}
		 */
		isPlaying: function () {
			return this._conf.panel.animating;
		},

		/**
		 * Move panel to the given direction
		 * @param {Boolean} next
		 * @param {Number} duration
		 */
		_movePanel: function (next, duration) {
			var panel = this._conf.panel;
			var options = this.options;

			if (panel.animating) {
				return;
			}

			this._setValueToMove(next);

			if (options.circular ||
				this[next ? "getNextIndex" : "getPrevIndex"]() != null
			) {
				this._movePanelByPhase("setBy", [
					panel.size * (next ? 1 : -1), 0
				], duration);
			}

			return this;
		},

		/**
		 * Move panel applying start/end phase value
		 * @param {String} method movableCoord method name
		 * @param {Object} coords coordinate array value
		 * @param {Number} duration duration value
		 */
		_movePanelByPhase: function(method, coords, duration) {
			duration = this._getNumValue(duration, this.options.duration);

			if (this._setPhaseValue("start") !== false) {
				this._setMovableCoord(method, coords, true, duration);
				!duration && this._setPhaseValue("end");
			}
		},

		/**
		 * Move to next panel
		 * @ko 다음 패널로 이동한다.
		 * @method eg.Flicking#next
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds <ko>애니메이션 진행시간(ms)</ko>
		 * @return {eg.Flicking} instance of itself<ko>자신의 인스턴스</ko>
		 */
		next: function (duration) {
			return this._movePanel(true, duration);
		},

		/**
		 * Move to previous panel
		 * @ko 이전 패널로 이동한다.
		 * @method eg.Flicking#prev
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds <ko>애니메이션 진행시간(ms)</ko>
		 * @return {eg.Flicking} instance of itself<ko>자신의 인스턴스</ko>
		 */
		prev: function (duration) {
			return this._movePanel(false, duration);
		},

		/**
		 * Move to indicated panel
		 * @ko 지정한 패널로 이동한다.
		 * @method eg.Flicking#moveTo
		 * @param {Number} no logical panel index
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds <ko>애니메이션 진행시간(ms)</ko>
		 * @return {eg.Flicking} instance of itself<ko>자신의 인스턴스</ko>
		 */
		moveTo: function (no, duration) {
			var panel = this._conf.panel;
			var options = this.options;
			var currentIndex = panel.index;
			var indexToMove = 0;
			var movableCount;
			var movable;

			no = this._getNumValue(no);

			if (typeof no !== "number" ||
				no >= panel.origCount ||
				no === panel.no ||
				panel.animating
			) {
				return this;
			}

			// remember current value in case of restoring
			panel.prevIndex = panel.index;
			panel.prevNo = panel.no;

			movable = options.circular || no >= 0 && no < panel.origCount;

			if (options.circular) {
				// real panel count which can be moved on each(left(up)/right(down)) sides
				movableCount = [ currentIndex, panel.count - (currentIndex + 1) ];

				if (no > panel.no) {
					indexToMove = no - panel.no;

					if (indexToMove > movableCount[1]) {
						indexToMove = -(movableCount[0] + 1 - (indexToMove - movableCount[1]));
					}
				} else {
					indexToMove = -(panel.no - no);

					if (Math.abs(indexToMove) > movableCount[0]) {
						indexToMove = movableCount[1] + 1 -
							(Math.abs(indexToMove) - movableCount[0]);
					}
				}

				panel.no = no;
				this._conf.indexToMove = indexToMove;
				this._setValueToMove(indexToMove > 0);
				this._movePanelByPhase("setBy", [ panel.size * indexToMove, 0 ], duration);

			} else if (movable) {
				panel.no = panel.index = no;
				this._movePanelByPhase("setTo", [ panel.size * no, 0 ], duration);
			}

			return this;
		},

		/**
		 * Update panel's previewPadding size according options.previewPadding
		 */
		_checkPadding: function () {
			var options = this.options;
			var previewPadding = options.previewPadding.concat();
			var padding = this.$wrapper.css("padding").split(" ");

			options.horizontal && padding.reverse();

			// get current padding value
			padding = padding.length === 2 ?
				[ padding[0], padding[0] ] : [ padding[0], padding[2] ];

			padding = $.map(padding, function(num) {
				return parseInt(num, 10);
			});

			// update padding when current and given are different
			if (previewPadding.length === 2 &&
				previewPadding[0] !== padding[0] || previewPadding[1] !== padding[1]) {

				this._setPadding(previewPadding);
			}
		},

		/**
		 * Update panel size according current viewport
		 * @ko 패널 사이즈 정보를 갱신한다.
		 * @method eg.Flicking#resize
		 * @return {eg.Flicking} instance of itself<ko>자신의 인스턴스</ko>
		 * @example
			var some = new eg.Flicking("#mflick", {
				previewPadding: [10,10]
			});

			// when device orientaion changes
			some.resize();

			// or when changes previewPadding option from its original value
			some.options.previewPadding = [20, 30];
			some.resize();
		 */
		resize: function () {
			var conf = this._conf;
			var options = this.options;
			var panel = conf.panel;
			var horizontal = options.horizontal;
			var panelSize;
			var maxCoords;

			if (~~options.previewPadding.join("")) {
				this._checkPadding();
				panelSize = panel.size;
			} else if (horizontal) {
				panelSize = panel.size = this.$wrapper.width();
			}

			maxCoords = this._getDataByDirection([panelSize * (panel.count - 1), 0]);

			// resize elements
			horizontal && this.$container.width(maxCoords[0] + panelSize);
			panel.$list.css(horizontal ? "width" : "height", panelSize);

			this._mcInst.options.max = maxCoords;
			this._setMovableCoord("setTo", [panelSize * panel.index, 0], true, 0);

			if (IS_ANDROID2) {
				this._applyPanelsPos();
				this._adjustContainerCss("end");
			}

			return this;
		},

		/**
		 * Restore panel in its right position
		 * @ko 패널의 위치가 올바로 위치하지 않게 되는 경우, 제대로 위치하도록 보정한다.
		 * @method eg.Flicking#restore
		 * @param {Number} [duration=options.duration] Duration of animation in milliseconds <ko>애니메이션 진행시간(ms)</ko>
		 * @return {eg.Flicking} instance of itself<ko>자신의 인스턴스</ko>
		 * @example
			var some = new eg.Flicking("#mflick").on({
				beforeFlickStart : function(e) {
					if(e.no === 2) {
						e.stop();  // stop flicking
						this.restore(100);  // restoring to previous position
					}
				}
			);
		 */
		restore: function (duration) {
			var conf = this._conf;
			var panel = conf.panel;
			var currPos = this._getDataByDirection(this._mcInst.get());
			var destPos;

			// check if the panel isn't in right position
			if (currPos[0] % panel.size) {
				conf.customEvent.restoreCall = true;
				duration = this._getNumValue(duration, this.options.duration);

				this._setPanelNo(true);
				destPos = this._getDataByDirection([panel.size * panel.index, 0]);

				this._triggerBeforeRestore({ depaPos: currPos, destPos: destPos });
				this._setMovableCoord("setTo", destPos, true, duration);

				if (!duration) {
					this._adjustContainerCss("end");
					this._triggerRestore();
				}

				// to handle on api call
			} else if (panel.changed) {
				this._setPanelNo(true);

				conf.touch.distance = conf.indexToMove = 0;
				panel.prevIndex = panel.prevNo = -1;
			}

			return this;
		}
	});
});
/**
 * Flicking in jQuery plugin
 *
 * @ko Flicking in jQuery plugin
 * @method jQuery.flicking
 * @example
	<div id="content">
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
	// create
	$("#content").flicking({
        circular : true,
     	threshold : 50
    });
 	// method
	$("#content").flicking("option","circular",true); //Set option
	$("#content").flicking("instance"); // Return flicking instance
	$("#content").flicking("getNextIndex",1); // Get next panel index
 	</script>
 * @see eg.Flicking
 */
/**
 * flicking:beforeRestore jQuery event plugin
 *
 * @ko flicking:beforeRestore jQuery event plugin
 * @name jQuery#flicking:beforeRestore
 * @event
 * @example
 $("#mflick").on("flicking:beforeRestore",callback);
 $("#mflick").off("flicking:beforeRestore",callback);
 $("#mflick").trigger("flicking:beforeRestore",callback);
 * @see eg.Flicking#event:beforeRestore
 */
/**
 * flicking:beforeFlickStart jQuery event plugin
 *
 * @ko flicking:beforeFlickStart jQuery event plugin
 * @name jQuery#flicking:beforeFlickStart
 * @event
 * @example
 $("#mflick").on("flicking:beforeFlickStart",callback);
 $("#mflick").off("flicking:beforeFlickStart",callback);
 $("#mflick").trigger("flicking:beforeFlickStart",callback);
 * @see eg.Flicking#event:beforeFlickStart
 */
/**
 * flicking:flick jQuery event plugin
 *
 * @ko flicking:flick jQuery event plugin
 * @name jQuery#flicking:flick
 * @event
 * @example
 $("#mflick").on("flicking:flick",callback);
 $("#mflick").off("flicking:flick",callback);
 $("#mflick").trigger("flicking:flick",callback);
 * @see eg.Flicking#event:flick
 */
/**
 * flicking:flickEnd jQuery event plugin
 *
 * @ko flicking:flickEnd jQuery event plugin
 * @name jQuery#flicking:flickEnd
 * @event
 * @example
 $("#mflick").on("flicking:flickEnd",callback);
 $("#mflick").off("flicking:flickEnd",callback);
 $("#mflick").trigger("flicking:flickEnd",callback);
 * @see eg.Flicking#event:flickEnd
 */
/**
 * flicking:restore jQuery event plugin
 *
 * @ko flicking:restore jQuery event plugin
 * @name jQuery#flicking:restore
 * @event
 * @example
 $("#mflick").on("flicking:restore",callback);
 $("#mflick").off("flicking:restore",callback);
 $("#mflick").trigger("flicking:restore",callback);
 * @see eg.Flicking#event:restore
 */