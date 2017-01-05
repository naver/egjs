// jscs:disable validateLineBreaks, maximumLineLength
/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/
eg.module("flicking", ["jQuery", eg, window, document, eg.MovableCoord], function ($, ns, global, doc, MC) {
	"use strict";

	// jscs:enable validateLineBreaks, maximumLineLength
	/**
	 * A module used to implement flicking interactions. With this module, you can make flicking gestures, which are ways to navigate left and right to move between panels arranged side by side.
	 * @group egjs
	 * @ko 플리킹 UI를 구현하는 모듈. 나란히 배치한 패널을 쓸어 넘겨 다음 패널이나 이전 패널로 이동하는 플리킹 UI를 만들 수 있다.
	 * @class
	 * @name eg.Flicking
	 * @extends eg.Component
	 *
	 * @param {HTMLElement|String|jQuery} element A base element for the eg.Flicking module <ko>eg.Flicking 모듈을 사용할 기준 엘리먼트</ko>
	 * @param {Object} options The option object of the eg.Flicking module<ko>eg.Flicking 모듈의 옵션 객체</ko>
	 * @param {Boolean} [options.hwAccelerable=eg.isHWAccelerable()] Force hardware compositing <ko>하드웨어 가속 사용 여부</ko>
	 * @param {String} [options.prefix=eg-flick] A prefix for class names of the panel elements <ko>패널 엘리먼트의 클래스 이름에 설정할 접두사</ko>
	 * @param {Number} [options.deceleration=0.0006] Deceleration of the animation where acceleration is manually enabled by user. A higher value indicates shorter running time <ko>사용자의 동작으로 가속도가 적용된 애니메이션의 감속도. 값이 높을수록 애니메이션 실행 시간이 짧아진다</ko>
	 * @param {Boolean} [options.horizontal=true] Direction of the panel movement (true: horizontal, false: vertical) <ko>패널 이동 방향 (true 가로방향, false 세로방향)</ko>
	 * @param {Boolean} [options.circular=false] Indicates whether a circular panel is available <ko>패널 순환 여부</ko>
	 * @param {Number|Array} [options.previewPadding=[0,0]] The preview size for the previous or next panel. If direction is set to "horizontal", the preview section will be displayed on the left and right of the panel. If direction is set to "vertical", it will be displayed on the top and bottom of the panel <ko>이전 패널과 다음 패널을 미리 보는 영역의 크기. 패널 이동 방향이 가로 방향이면 패널 왼쪽과 오른쪽에 미리 보는 영역이 나타난다. 패널 이동 방향이 세로 방향이면 패널 위쪽과 아래쪽에 미리 보는 영역이 나타난다</ko>
	 * @param {Number|Array} [options.bounce=[10,10]] −	The size of bouncing area. If a panel is set to "non-circulable", the start and end panels can exceed the base element area and move further as much as the bouncing area. If a panel is dragged to the bouncing area and then dropped, the panel where bouncing effects are applied is retuned back into the base element area. <ko>바운스 영역의 크기. 패널이 순환하지 않도록 설정됐다면 시작 패널과 마지막 패널은 기준 엘리먼트 영역을 넘어 바운스 영역의 크기만큼 더 이동할 수 있다. 패널을 바운스 영역까지 끌었다가 놓으면, 바운스 효과가 적용된 패널이 다시 기준 엘리먼트 영역 안으로 들어온다</ko>
	 * @param {Number} [options.threshold=40] Distance threshold. If the drag exceeds the threshold value, it will be changed to the next panel <ko>다음 패널로 바뀌는 기준 이동 거리. 패널을 기준 이동 거리 이상 끌었다 놓으면 패널이 다음 패널로 바뀐다</ko>
	 * @param {Number} [options.duration=100] Duration of the panel movement (unit: ms) <ko>패널 이동 애니메이션 진행 시간(단위: ms)</ko>
	 * @param {Function} [options.panelEffect=easeOutCubic] The easing function to apply to a panel moving animation <ko>패널 이동 애니메이션에 적용할 easing 함수</ko>
	 * @param {Number} [options.defaultIndex=0] The index number of a panel to be selected upon module initialization <ko>모듈이 초기화될 때 선택할 패널의 인덱스 번호</ko>
	 * @param {Array} [options.inputType] Types of input devices.<br>- touch: A touch screen can be used to move a panel.<br>- mouse: A mouse can be used to move a panel. <ko>입력 장치 종류.<br>- touch: 터치 입력 장치로 패널을 이동할 수 있다.<br>- mouse: 마우스로 패널을 이동할 수 있다.</ko>
	 * @param {Number} [options.thresholdAngle=45] The threshold value that determines whether user action is horizontal or vertical (0~90) <ko>사용자의 동작이 가로 방향인지 세로 방향인지 판단하는 기준 각도(0~90)</ko>
	 * @param {Boolean} [options.adaptiveHeight=false] Set container's height be adaptive according panel's height.<br>(Note: on Android 4.1.x stock browser, has rendering bug which not correctly render height value on panel with single node. To avoid just append another empty node at the end.)<ko>컨테이너 영역이 패널의 높이값에 따라 변경될지 여부<br>(참고: Android 4.1.x 스톡 브라우저에서 단일 노드로 구성된 패널의 높이값 변경이 제대로 렌더링 되지 않는 버그가 있음. 비어있는 노드를 추가하면 해결이 가능하다.)</ko>
	 *
	 * @codepen {"id":"rVOpPK", "ko":"플리킹 UI 기본 예제", "en":"Flicking UI default example", "collectionId":"ArxyLK", "height" : 403}
	 * @support {"ie": "10+", "ch" : "latest", "ff" : "latest",  "sf" : "latest" , "edge" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
	 *
	 * @see Easing Functions Cheat Sheet {@link http://easings.net/}
	 * @see If you want to try a different easing function, use the jQuery easing plugin ({@link http://gsgd.co.uk/sandbox/jquery/easing}) or the jQuery UI easing library ({@link https://jqueryui.com/easing}). <ko>다른 easing 함수를 사용하려면 jQuery easing 플러그인({@link http://gsgd.co.uk/sandbox/jquery/easing})이나, jQuery UI easing 라이브러리({@link https://jqueryui.com/easing})를 사용한다</ko>
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
			});
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

			this._setOptions(options);
			this._setConfig($children, _prefix);

			!ns._hasClickBug() && (this._setPointerEvents = $.noop);

			this._build();
			this._bindEvents(true);

			this._applyPanelsCss();
			this._arrangePanels();

			this.options.hwAccelerable && SUPPORT_WILLCHANGE && this._setHint();
			this.options.adaptiveHeight && this._setAdaptiveHeight();

			this._adjustContainerCss("end");
		},

		/**
		 * Set options values
		 * @param {Object} options
		 */
		_setOptions: function(options) {
			var arrVal = {
				previewPadding: [ 0, 0 ],
				bounce: [ 10, 10 ]
			};

			$.extend(this.options = {
				hwAccelerable: ns.isHWAccelerable(),  // check weather hw acceleration is available
				prefix: "eg-flick",         // prefix value of class name
				deceleration: 0.0006,       // deceleration value
				horizontal: true,           // move direction (true == horizontal, false == vertical)
				circular: false,			// circular mode. In this mode at least 3 panels are required.
				previewPadding: arrVal.previewPadding,	// preview padding value in left(up) to right(down) order. In this mode at least 5 panels are required.
				bounce: arrVal.bounce,      // bounce value in left(up) to right(down) order. Works only in non-circular mode.
				threshold: 40,				// the distance pixel threshold value for change panel
				duration: 100,				// duration ms for animation
				panelEffect: $.easing.easeOutCubic,  // $.easing function for panel change animation
				defaultIndex: 0,			// initial panel index to be shown
				inputType: ["touch", "mouse"],  // input type
				thresholdAngle: 45,			// the threshold value that determines whether user action is horizontal or vertical (0~90)
				adaptiveHeight: false		// Set container's height be adaptive according panel's height
			}, options);

			var self = this;
			$.each(arrVal, function(i, v) {
				var val = self.options[i];

				if ($.isNumeric(val)) {
					val = [ val, val ];
				} else if (!$.isArray(val)) {
					val = v;
				}

				self.options[i] = val;
			});
		},

		/**
		 * Set config values
		 * @param {jQuery} $children wrappers' children elements
		 * @param {String} _prefix event prefix
		 */
		_setConfig: function($children, _prefix) {
			var options = this.options;
			var padding = options.previewPadding;

			if ($children.eq(0).hasClass(options.prefix + "-container")) {
				this.$container = $children;
				$children = $children.children();
			}

			// config value
			this._conf = {
				panel: {
					$list: $children,	// panel list
					index: 0,			// dom index used among process
					no: 0,				// panel no used among process
					currIndex: 0,       // current physical dom index
					currNo: 0,          // current logical panel number
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
					lastPos: 0,			// to determine move on holding
					holding: false
				},
				customEvent: {			// for custom events value
					flick: true,
					restore: false,
					restoreCall: false
				},
				origPanelStyle: {		// remember original class and inline style in case of restoration on destroy()
					wrapper: {
						className: this.$wrapper.attr("class") || null,
						style: this.$wrapper.attr("style") || null
					},
					list: $children.map(function(i, v) {
						return {
							className: $(v).attr("class") || null,
							style: $(v).attr("style") || null
						};
					})
				},
				inputEvent: false,		// input event biding status
				useLayerHack: options.hwAccelerable && !SUPPORT_WILLCHANGE,
				dirData: [],			// direction constant value according horizontal or vertical
				indexToMove: 0,
				eventPrefix: _prefix || "",

				// For buggy link highlighting on Android 2.x
				$dummyAnchor: null
			};

			$([["LEFT", "RIGHT"], ["UP", "DOWN"]][+!options.horizontal]).each(
				$.proxy(function (i, v) {
					this._conf.dirData.push(MC["DIRECTION_" + v]);
				}, this));
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
			var bounce = options.bounce;

			this._setPadding(padding, true);
			var sizeValue = this._getDataByDirection([ panel.size, "100%" ]);

			// create container element
			cssValue = "position:relative;z-index:2000;width:100%;height:100%;" +
				(horizontal ? "" : "top:0;");

			if (this.$container) {
				this.$container.attr("style", cssValue);
			} else {
				this.$container = $children.wrapAll(
					"<div class='" + prefix + "-container' style='" + cssValue + "'>"
				).parent();
			}

			// panels' css values
			$children.addClass(prefix + "-panel").css({
				position: "absolute",
				width: sizeValue[0],
				height: sizeValue[1],
				boxSizing: "border-box",
				top: 0,
				left: 0
			});

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
				deceleration: options.deceleration,
				bounce: this._getDataByDirection([ 0, bounce[1], 0, bounce[0] ])
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
			var paddingSum = padding[0] + padding[1];
			var cssValue = {};

			if (paddingSum || !build) {
				cssValue.padding = (horizontal ?
					"0 " + padding.reverse().join("px 0 ") :
					padding.join("px 0 ")) + "px";
			}

			if (build) {
				cssValue.overflow = "hidden";
				cssValue.boxSizing = "border-box";
			}

			!$.isEmptyObject(cssValue) &&
				this.$wrapper.css(cssValue);

			panel.size = this.$wrapper[ horizontal ? "width" : "height" ]();
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
			var baseIndex;

			if (this.options.circular) {
				// if default index is given, then move correspond panel to the first position
				if (index > 0 && index <= lastIndex) {
					this._movePanelPosition(index, true);
				}

				// set first panel's position according physical node length
				baseIndex = this._getBasePositionIndex();
				this._movePanelPosition(baseIndex, false);

				this._setPanelNo({
					no: index,
					currNo: index
				});
			} else {
				// if defaultIndex option is given, then move to that index panel
				if (index > 0 && index <= lastIndex) {
					this._setPanelNo({
						index: index,
						no: index,
						currIndex: index,
						currNo: index
					});

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
			var baseIndex;

			if (this.options.circular) {
				// when arranging panels, set flag to not trigger flick custom event
				conf.customEvent.flick = false;

				// move elements according direction
				if (sort) {
					indexToMove && (touch.direction = dirData[+!Boolean(indexToMove > 0)]);
					this._arrangePanelPosition(touch.direction, indexToMove);
				}

				// set index for base element's position
				baseIndex = this._getBasePositionIndex();

				this._setPanelNo({
					index: baseIndex,
					currIndex: baseIndex
				});

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
						value !== paddingTop && (container.top = "0px");
					}

					this._setTranslate([-coords[+!options.horizontal], 0]);

				} else if (phase === "end") {
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
			if (isDirVal) {
				coord = this._getDataByDirection(coord);
			}

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
			value = value.concat();
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
			return Math.floor(this._conf.panel.count / 2 - 0.1);
		},

		/**
		 * Bind events
		 * @param {Boolean} bind
		 */
		_bindEvents: function (bind) {
			var options = this.options;
			var $wrapper = this.$wrapper;
			var mcInst = this._mcInst;

			if (bind) {
				mcInst.bind($wrapper, {
					scale: this._getDataByDirection([-1, 0]),
					direction: MC["DIRECTION_" +
					(options.horizontal ? "HORIZONTAL" : "VERTICAL")],
					interruptable: false,
					inputType: options.inputType,
					thresholdAngle: options.thresholdAngle
				}).on({
					hold: $.proxy(this._holdHandler, this),
					change: $.proxy(this._changeHandler, this),
					release: $.proxy(this._releaseHandler, this),
					animationStart: $.proxy(this._animationStartHandler, this),
					animationEnd: $.proxy(this._animationEndHandler, this)
				});
			} else {
				mcInst.unbind($wrapper).off();
			}

			this._conf.inputEvent = !!bind;
		},

		/**
		 * 'hold' event handler
		 */
		_holdHandler: function (e) {
			var conf = this._conf;

			conf.touch.holdPos = e.pos;
			conf.touch.holding = true;
			conf.panel.changed = false;

			this._adjustContainerCss("start", e.pos);
		},

		/**
		 * 'change' event handler
		 */
		_changeHandler: function (e) {
			var conf = this._conf;
			var touch = conf.touch;
			var posIndex = +!this.options.horizontal;
			var pos = e.pos[posIndex];
			var holdPos = touch.holdPos[posIndex];
			var direction;
			var eventRes = null;
			var movedPx;

			this._setPointerEvents(e);  // for "click" bug

			/**
			 * This event is fired when panel moves.
			 * @ko 패널이 이동할 때 발생하는 이벤트
			 * @name eg.Flicking#flick
			 * @event
			 * @param {Object} param The object of data to be sent to an event <ko>이벤트에 전달되는 데이터 객체</ko>
			 * @param {String} param.eventType The name of the event<ko>이름명</ko>
			 * @param {Number} param.index Physical index number of the current panel element, which is relative to DOM (@deprecated since 1.3.0)<ko>현재 패널 엘리먼트의 물리적 인덱스 번호. DOM 엘리먼트를 기준으로 하는 인덱스 번호다 (@deprecated since 1.3.0)</ko>
			 * @param {Number} param.no Logical index number of the current panel element, which is relative to the panel content <ko>현재 패널 엘리먼트의 논리적 인덱스 번호. 패널 콘텐츠를 기준으로 하는 인덱스 번호다</ko>
			 * @param {Number} param.direction Direction of the movement (see eg.MovableCoord.DIRECTION_* constant) <ko>이동 방향(eg.MovableCoord.DIRECTION_* constant 참고)</ko>
			 * @param {Array} param.pos Start coordinate <ko>출발점 좌표</ko>
			 * @param {Number} param.pos.0 x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.pos.1 y-coordinate <ko>y 좌표</ko>
			 * @param {Boolean} param.holding Indicates whether a user holds an element on the screen of the device. <ko>사용자가 기기의 화면을 누르고 있는지 여부</ko>
			 * @param {Number} param.distance Distance moved from then starting point. According the move direction, positive on eg.MovableCoord.DIRECTION_LEFT/UP and negative on eg.MovableCoord.DIRECTION_RIGHT/DOWN <ko>시작점부터 이동된 거리의 값. 이동 방향에 따라 eg.MovableCoord.DIRECTION_LEFT/UP의 경우 양수를 eg.MovableCoord.DIRECTION_RIGHT/DOWN의 경우는 음수를 반환</ko>
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
				direction: direction || touch.direction,
				distance: pos - (holdPos || (touch.holdPos[posIndex] = pos))
			}));

			(eventRes || eventRes === null) && this._setTranslate([ -pos, 0 ]);
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
			touch.holding = false;

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

			if (e.hammerEvent) {
				e.duration = this.options.duration;

				e.destPos[+!this.options.horizontal] =
					panel.size * (
						panel.index + conf.indexToMove
					);
			}

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
		 * Set container's height value according to children's height
		 * @param {Number} direction
		 */
		_setAdaptiveHeight: function(direction) {
			var $panel;
			var $first;
			var $children;
			var height;
			var dataName = "data-height";

			$panel = this[ "get" + (
					direction === MC.DIRECTION_LEFT && "Next" ||
					direction === MC.DIRECTION_RIGHT && "Prev" || ""
				) + "Element" ]();

			$first = $panel.find(":first");
			height = $first.attr(dataName);

			if (!height) {
				$children = $panel.children();
				height = ($children.length > 1 ? $panel.css("height", "auto") : $first)
					.outerHeight(true);

				$first.attr(dataName, height);
			}

			this.$wrapper.height(height);
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
			 * This event is fired before an element is restored to its original position when user action is done while the element is not dragged until a certain distance threshold is reached
			 * @ko 다음 패널로 바뀌는 기준 이동 거리만큼 이동하기 전에 사용자의 동작이 끝났을 때 원래 패널로 복원되기 전에 발생하는 이벤트
			 * @name eg.Flicking#beforeRestore
			 * @event
			 * @param {Object} param The object of data to be sent to an event <ko>이벤트에 전달되는 데이터 객체</ko>
			 * @param {String} param.eventType The name of the event <ko>이름명</ko>
			 * @param {Number} param.index Physical index number of the current panel element, which is relative to DOM. (@deprecated since 1.3.0)<ko>현재 패널 엘리먼트의 물리적 인덱스 번호. DOM 엘리먼트를 기준으로 하는 인덱스 번호다. (@deprecated since 1.3.0)</ko>
			 * @param {Number} param.no Logical index number of the current panel element, which is relative to the panel content.<ko>현재 패널 엘리먼트의 논리적 인덱스 번호. 패널 콘텐츠를 기준으로 하는 인덱스 번호다</ko>
			 * @param {Number} param.direction Direction of the movement (see eg.MovableCoord.DIRECTION_* constant) <ko>이동 방향(eg.MovableCoord.DIRECTION_* constant 참고)</ko>
			 * @param {Array} param.depaPos Start coordinate <ko>출발점 좌표</ko>
			 * @param {Number} param.depaPos.0 x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.depaPos.1 y-coordinate <ko>y 좌표</ko>
			 * @param {Array} param.destPos End coordinate <ko>도착점 좌표</ko>
			 * @param {Number} param.destPos.0 x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.destPos.1 y-coordinate <ko>y 좌표</ko>
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
			 * This event is fired after an element is restored to its original position when user action is done while the element is not dragged until a certain distance threshold is reached.
			 * @ko 다음 패널로 바뀌는 기준 이동 거리만큼 이동하기 전에 사용자의 동작이 끝났을 때 원래 패널로 복원된 다음 발생하는 이벤트
			 * @name eg.Flicking#restore
			 * @event
			 * @param {Object} param The object of data to be sent to an event <ko>이벤트에 전달되는 데이터 객체</ko>
			 * @param {String} param.eventType The name of the event <ko>이름명</ko>
			 * @param {Number} param.index Physical index number of the current panel element, which is relative to DOM(@deprecated since 1.3.0)<ko>현재 패널 엘리먼트의 물리적 인덱스 번호. DOM 엘리먼트를 기준으로 하는 인덱스 번호다 (@deprecated since 1.3.0)</ko>
			 * @param {Number} param.no Logical index number of the current panel element, which is relative to the panel content. <ko>현재 패널 엘리먼트의 논리적 인덱스 번호. 패널 콘텐츠를 기준으로 하는 인덱스 번호다</ko>
			 * @param {Number} param.direction Direction of the panel move (see eg.MovableCoord.DIRECTION_* constant) <ko>이동 방향(eg.MovableCoord.DIRECTION_* constant 참고)</ko>
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
				/**
				 * This event is fired before flicking starts
				 * @ko 플리킹이 시작하기 전에 발생하는 이벤트
				 * @name eg.Flicking#beforeFlickStart
				 * @event
				 * @param {Object} param The object of data to be sent to an event <ko>이벤트에 전달되는 데이터 객체</ko>
				 * @param {String} param.eventType The name of the event <ko>이름명</ko>
				 * @param {Number} param.index Physical index number of the current panel element, which is relative to DOM. (@deprecated since 1.3.0)<ko>현재 패널 엘리먼트의 물리적 인덱스 번호. DOM 엘리먼트를 기준으로 하는 인덱스 번호다 (@deprecated since 1.3.0)</ko>
				 * @param {Number} param.no Logical index number of the current panel element, which is relative to the panel content.<ko>현재 패널 엘리먼트의 논리적 인덱스 번호. 패널 콘텐츠를 기준으로 하는 인덱스 번호다</ko>
				 * @param {Number} param.direction Direction of the movement (see eg.MovableCoord.DIRECTION_* constant) <ko>−	이동 방향(eg.MovableCoord.DIRECTION_* constant 참고)</ko>
				 * @param {Array} param.depaPos Start coordinate <ko>출발점 좌표</ko>
				 * @param {Number} param.depaPos.0 x-coordinate <ko>x 좌표</ko>
				 * @param {Number} param.depaPos.1 y-coordinate <ko>y 좌표</ko>
				 * @param {Array} param.destPos End coordinate <ko>도착점 좌표</ko>
				 * @param {Number} param.destPos.0 x-coordinate <ko>x 좌표</ko>
				 * @param {Number} param.destPos.1 y-coordinate <ko>y 좌표</ko>
				 */
				if (!this._triggerEvent(EVENTS.beforeFlickStart, pos)) {
					return panel.changed = panel.animating = false;
				} else {
					options.adaptiveHeight && this._setAdaptiveHeight(conf.touch.direction);
				}

				conf.indexToMove === 0 && this._setPanelNo();
			} else if (phase === "end") {
				if (options.circular && panel.changed) {
					this._arrangePanels(true, conf.indexToMove);
				}

				!IS_ANDROID2 && this._setTranslate([-panel.size * panel.index, 0]);
				conf.touch.distance = conf.indexToMove = 0;

				/**
				 * This event is fired after panel moves.
				 * @ko 패널이 이동한 다음 발생하는 이벤트
				 * @name eg.Flicking#flickEnd
				 * @event
				 * @param {Object} param The object of data to be sent to an event <ko>이벤트에 전달되는 데이터 객체</ko>
				 * @param {String} param.eventType The name of the event <ko>이름명</ko>
				 * @param {Number} param.index Physical index number of the current panel element, which is relative to DOM (@deprecated since 1.3.0)<ko>현재 패널 엘리먼트의 물리적 인덱스 번호. DOM 엘리먼트를 기준으로 하는 인덱스 번호다 (@deprecated since 1.3.0)</ko>
				 * @param {Number} param.no Logical index number of the current panel element, which is relative to the panel content. <ko>현재 패널 엘리먼트의 논리적 인덱스 번호. 패널 콘텐츠를 기준으로 하는 인덱스 번호다.</ko>
				 * @param {Number} param.direction Direction of the movemen (see eg.MovableCoord.DIRECTION_* constant) <ko>−	이동 방향(eg.MovableCoord.DIRECTION_* constant 참고</ko>
				 */
				panel.changed && this._triggerEvent(EVENTS.flickEnd);
			}

			!(phase === "start" && pos === undefined) && this._adjustContainerCss(phase);
		},

		/**
		 * Get positive or negative according direction
		 */
		_getNumByDirection: function() {
			var conf = this._conf;
			return conf.touch.direction === conf.dirData[0] ? 1 : -1;
		},

		/**
		 * Revert panel number
		 */
		_revertPanelNo: function() {
			var panel = this._conf.panel;
			var num = this._getNumByDirection();

			var index = panel.currIndex >= 0 ? panel.currIndex : panel.index - num;
			var no = panel.currNo >= 0 ? panel.currNo : panel.no - num;

			this._setPanelNo({
				index: index,
				no: no
			});
		},

		/**
		 * Set the panel number
		 * @param {Object} obj number object
		 */
		_setPanelNo: function (obj) {
			var panel = this._conf.panel;
			var count = panel.origCount - 1;
			var num = this._getNumByDirection();

			if ($.isPlainObject(obj)) {
				$.each(obj, function(i, v) {
					panel[i] = v;
				});

			} else {
				// remember current value
				panel.currIndex = panel.index;
				panel.currNo = panel.no;

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
			coords = this._getDataByDirection(coords);

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
			var options = this.options;
			var mcInst = this._mcInst;
			var isMovable = Math.abs(this._conf.touch.distance) >= options.threshold;
			var max;
			var currPos;

			if (!options.circular && isMovable) {
				max = this._getDataByDirection(mcInst.options.max)[0];
				currPos = this._getDataByDirection(mcInst.get())[0];

				// if current position out of range
				if (currPos < 0 || currPos > max) {
					return false;
				}
			}

			return isMovable;
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

			// pass changed panel no only on 'flickEnd' event
			if (name === EVENTS.flickEnd) {
				panel.currNo = panel.no;
				panel.currIndex = panel.index;
			}

			return this.trigger(conf.eventPrefix + name, $.extend({
				eventType: name,
				index: panel.currIndex,
				no: panel.currNo,
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
			var pos = panel.currIndex;
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
				index = panel.currNo;
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
		 * Returns the index number of the current panel element.
		 * @ko 현재 패널 엘리먼트의 인덱스 번호를 반환한다
		 * @method eg.Flicking#getIndex
		 * @param {Boolean} [physical=false] Types of index numbers<br>- true: Indicates physical index numbers relative to DOM.<br>- false: Indicates logical index numbers relative to the panel content. <ko>−	인덱스 번호의 종류<br>- true: 물리적 인덱스 번호. DOM 엘리먼트를 기준으로 하는 인덱스 번호다.<br>- false: 논리적 인덱스 번호. 패널 콘텐츠를 기준으로 하는 인덱스 번호다.</ko>
		 * @return {Number} Index number of the current panel element <ko>현재 패널의 인덱스 번호</ko>
		 */
		getIndex: function (physical) {
			return this._conf.panel[ physical ? "currIndex" : "currNo" ];
		},

		/**
		 * Returns the reference of the current panel element.
		 * @ko 현재 패널 엘리먼트의 레퍼런스를 반환한다
		 * @method eg.Flicking#getElement
		 * @return {jQuery} Current element <ko>현재 엘리먼트</ko>
		 */
		getElement: function () {
			var panel = this._conf.panel;
			return $(panel.$list[ panel.currIndex ]);
		},

		/**
		 * Returns the reference of the next panel element.
		 * @ko 다음 패널 엘리먼트의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getNextElement
		 * @return {jQuery|null} Next panel element or null if it does not exist.<ko>다음 패널 엘리먼트. 패널이 없으면 'null'을 반환한다.</ko>
		 */
		getNextElement: function () {
			return this._getElement(this._conf.dirData[0], true);
		},

		/**
		 * Returns the index number of the next panel element.
		 * @ko 다음 패널 엘리먼트의 인덱스 번호를 반환한다
		 * @method eg.Flicking#getNextIndex
		 * @param {Boolean} [physical=false] Types of index numbers<br>- true: Indicates physical index numbers relative to DOM.<br>- false: Indicates logical index numbers relative to the panel content. <ko>−	인덱스 번호의 종류<br>- true: 물리적 인덱스 번호. DOM 엘리먼트를 기준으로 하는 인덱스 번호다.<br>- false: 논리적 인덱스 번호. 패널 콘텐츠를 기준으로 하는 인덱스 번호다.</ko>
		 * @return {Number|null} Index number of the next panel element or null if it does not exist. <ko>다음 패널 엘리먼트의 인덱스 번호. 패널이 없으면 'null'을 반환한다</ko>
		 */
		getNextIndex: function (physical) {
			return this._getElement(this._conf.dirData[0], false, physical);
		},

		/**
		 * Returns the references of whole panel elements.
		 * @ko 패널을 구성하는 모든 엘리먼트의 레퍼런스를 반환한다
		 * @method eg.Flicking#getAllElements
		 * @return {jQuery} Whole panel elements <ko>모든 패널 엘리먼트</ko>
		 */
		getAllElements: function () {
			return this._conf.panel.$list;
		},

		/**
		 * Returns the reference of the previous panel element.
		 * @ko 이전 패널 엘리먼트의 레퍼런스를 반환한다.
		 * @method eg.Flicking#getPrevElement
		 * @return {jQuery|null} Previous panel element or null if it does not exist. <ko>이전 패널 엘리먼트. 패널이 없으면 'null'을 반환한다</ko>
		 */
		getPrevElement: function () {
			return this._getElement(this._conf.dirData[1], true);
		},

		/**
		 * Returns the index number of the previous panel element.
		 * @ko 이전 패널 엘리먼트의 인덱스 번호를 반환한다
		 * @method eg.Flicking#getPrevIndex
		 * @param {Boolean} [physical=false] Types of index numbers<br>- true: Indicates physical index numbers relative to DOM.<br>- false: Indicates logical index numbers relative to the panel content. <ko>−	인덱스 번호의 종류<br>- true: 물리적 인덱스 번호. DOM 엘리먼트를 기준으로 하는 인덱스 번호다.<br>- false: 논리적 인덱스 번호. 패널 콘텐츠를 기준으로 하는 인덱스 번호다.</ko>
		 * @return {Number|null} Previous element index value or null if no more element exist<ko>이전 패널 인덱스 번호. 패널이 없는 경우에는 null</ko>
		 */
		getPrevIndex: function (physical) {
			return this._getElement(this._conf.dirData[1], false, physical);
		},

		/**
		 * Returns the total number of whole panel elements.
		 * @ko 전체 패널 엘리먼트의 개수를 반환한다
		 * @method eg.Flicking#getTotalCount
		 * @deprecated since 1.3.0
		 * @param {Boolean} [physical=false] Number of elements relative to (true: DOM, false: panel content)<ko>엘리먼트 개수의 기준(true: DOM 엘리먼트 기준, false: 패널 콘텐츠 기준)</ko>
		 * @return {Number} Total number of whole panel elements <ko>모든 패널 엘리먼트의 개수</ko>
		 */
		getTotalCount: function (physical) {
			return this._conf.panel[ physical ? "count" : "origCount" ];
		},

		/**
		 * Checks whether the animated panel is playing.
		 * @ko 패널 이동 애니메이션이 진행 중인지 확인한다.
		 * @method eg.Flicking#isPlaying
		 * @return {Boolean} Indicates whether the animated panel is playing <ko>패널 이동 애니메이션 진행 중 여부</ko>
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
			var conf = this._conf;
			var panel = conf.panel;
			var options = this.options;

			if (panel.animating || conf.touch.holding) {
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
		 * Moves an element to the next panel.
		 * @ko 다음 패널로 이동한다.
		 * @method eg.Flicking#next
		 * @param {Number} [duration=options.duration] Duration of the panel movement (unit: ms) <ko>패널 이동 애니메이션 진행 시간(단위: ms)</ko>
		 * @return {eg.Flicking} An instance of a module itself <ko>모듈 자신의 인스턴스</ko>
		 */
		next: function (duration) {
			return this._movePanel(true, duration);
		},

		/**
		 * Moves an element to the previous panel.
		 * @ko 이전 패널로 이동한다.
		 * @method eg.Flicking#prev
		 * @param {Number} [duration=options.duration] Duration of the panel movement (unit: ms) <ko>패널 이동 애니메이션 진행 시간(단위: ms)</ko>
		 * @return {eg.Flicking} An instance of a module itself<ko>모듈 자신의 인스턴스</ko>
		 */
		prev: function (duration) {
			return this._movePanel(false, duration);
		},

		/**
		 * Moves an element to the indicated panel.
		 * @ko 지정한 패널로 이동한다.
		 * @method eg.Flicking#moveTo
		 * @param {Number} no Logical index number of the target panel element, which is relative to the panel content. <ko>이동할 패널 엘리먼트의 논리적 인덱스 번호. 패널 콘텐츠를 기준으로 하는 인덱스 번호다</ko>
		 * @param {Number} [duration=options.duration] Duration of the panel movement (unit: ms) <ko>패널 이동 애니메이션 진행 시간(단위: ms)</ko>
		 * @return {eg.Flicking} An instance of a module itself<ko>모듈 자신의 인스턴스</ko>
		 */
		moveTo: function (no, duration) {
			var conf = this._conf;
			var panel = conf.panel;
			var circular = this.options.circular;
			var currentIndex = panel.index;
			var indexToMove;
			var isPositive;

			no = this._getNumValue(no, -1);

			if (no < 0 || no >= panel.origCount || no === panel.no ||
				panel.animating || conf.touch.holding) {
				return this;
			}

			indexToMove = no - (circular ? panel.no : currentIndex);
			isPositive = indexToMove > 0;

			// check for real panel count which can be moved on each sides in circular mode
			if (circular &&
				Math.abs(indexToMove) >
					(isPositive ? panel.count - (currentIndex + 1) : currentIndex)) {
				indexToMove = indexToMove + (isPositive ? -1 : 1) * panel.count;
				isPositive = indexToMove > 0;
			}

			this._setPanelNo(circular ? { no: no } : { no: no, index: no });
			this._conf.indexToMove = indexToMove;
			this._setValueToMove(isPositive);

			this._movePanelByPhase(
				circular ? "setBy" : "setTo",
				[ panel.size * (circular ? indexToMove : no), 0 ],
				duration
			);

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
		 * Updates the size of the panel.
		 * @ko 패널의 크기를 갱신한다
		 * @method eg.Flicking#resize
		 * @return {eg.Flicking} An instance of a module itself<ko>모듈 자신의 인스턴스</ko>
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
		 * Restores an element to its original position when it movement stops while the element is not dragged until a certain distance threshold is reached.
		 * @ko 다음 패널로 바뀌기 전에 패널 이동이 멈췄을 때 원래 패널로 복원한다
		 * @method eg.Flicking#restore
		 * @param {Number} [duration=options.duration] Duration of the panel movement (unit: ms) <ko>패널 이동 애니메이션 진행 시간(단위: ms)</ko>
		 * @return {eg.Flicking} An instance of a module itself<ko>모듈 자신의 인스턴스</ko>
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
			if (currPos[0] !== panel.currIndex * panel.size) {
				conf.customEvent.restoreCall = true;
				duration = this._getNumValue(duration, this.options.duration);

				this._revertPanelNo();
				destPos = this._getDataByDirection([panel.size * panel.index, 0]);

				this._triggerBeforeRestore({ depaPos: currPos, destPos: destPos });
				this._setMovableCoord("setTo", destPos, true, duration);

				if (!duration) {
					this._adjustContainerCss("end");
					this._triggerRestore();
				}

				// to handle on api call
			} else if (panel.changed) {
				this._revertPanelNo();
				conf.touch.distance = conf.indexToMove = 0;
			}

			return this;
		},

		/**
		 * Set input event biding
		 * @param {Boolean} bind - true: bind, false: unbind
		 * @return {eg.Flicking} instance of itself
		 */
		_setInputEvent: function(bind) {
			var inputEvent = this._conf.inputEvent;

			if (bind ^ inputEvent) {
				this._bindEvents(bind);
			}

			return this;
		},

		/**
		 * Enables input devices.
		 * @ko 입력 장치를 사용할 수 있게 한다
		 * @method eg.Flicking#enableInput
		 * @return {eg.Flicking} An instance of a module itself <ko>모듈 자신의 인스턴스</ko>
		 */
		enableInput: function() {
			return this._setInputEvent(true);
		},

		/**
		 * Disables input devices.
		 * @ko 입력 장치를 사용할 수 없게 한다.
		 * @method eg.Flicking#disableInput
		 * @return {eg.Flicking} An instance of a module itself <ko>모듈 자신의 인스턴스</ko>
		 */
		disableInput: function() {
			return this._setInputEvent();
		},

		/**
		 * Destroys elements, properties, and events used in a panel.
		 * @ko 패널에 사용한 엘리먼트와 속성, 이벤트를 해제한다
		 * @method eg.Flicking#destroy
		 */
		destroy: function() {
			var conf = this._conf;
			var origPanelStyle = conf.origPanelStyle;
			var wrapper = origPanelStyle.wrapper;
			var list = origPanelStyle.list;

			// unwrap container element and restore original inline style
			this.$wrapper.attr("class", wrapper.className)
				.attr("style", wrapper.style);

			this.$container.children().unwrap().each(function(i, v) {
				var $el = $(v);

				if (i > list.length - 1) {
					return !!$el.remove();
				}

				$el.attr("class", list[i].className)
					.attr("style", list[i].style);
			});

			// unbind events
			this.disableInput();
			this.off();

			// release resources
			for (var x in this) {
				this[x] = null;
			}
		}
	});
});
/**
 * A jQuery plugin available in the eg.Flicking module.
 *
 * @ko eg.Flicking 모듈의 jQuery 플러그인
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
 * A jQuery custom event of the eg.Flicking module. This event is fired before an element is restored to its original position when user action is done while the element is not dragged until a certain distance threshold is reached.
 *
 * @ko eg.Flicking 모듈의 jQuery 커스텀 이벤트. 다음 패널로 바뀌는 기준 이동 거리만큼 이동하기 전에 사용자의 동작이 끝났을 때 원래 패널로 복원되기 전에 발생한다
 * @name jQuery#flicking:beforeRestore
 * @event
 * @example
 $("#mflick").on("flicking:beforeRestore",callback);
 $("#mflick").off("flicking:beforeRestore",callback);
 $("#mflick").trigger("flicking:beforeRestore",callback);
 * @see eg.Flicking#event:beforeRestore
 */
/**
 * A jQuery custom event of the eg.Flicking module, which occurs before the flicking starts.
 *
 * @ko eg.Flicking 모듈의 jQuery 커스텀 이벤트. 플리킹을 시작하기 전에 발생한다
 * @name jQuery#flicking:beforeFlickStart
 * @event
 * @example
 $("#mflick").on("flicking:beforeFlickStart",callback);
 $("#mflick").off("flicking:beforeFlickStart",callback);
 $("#mflick").trigger("flicking:beforeFlickStart",callback);
 * @see eg.Flicking#event:beforeFlickStart
 */
/**
 * A jQuery custom event of the eg.Flicking module. This event is fired when panel moves.
 *
 * @ko eg.Flicking 모듈의 jQuery 커스텀 이벤트. 패널이 이동될 때 발생한다
 * @name jQuery#flicking:flick
 * @event
 * @example
 $("#mflick").on("flicking:flick",callback);
 $("#mflick").off("flicking:flick",callback);
 $("#mflick").trigger("flicking:flick",callback);
 * @see eg.Flicking#event:flick
 */
/**
 * A jQuery custom event of the eg.Flicking module. This event is fired after the panel moves.
 *
 * @ko eg.Flicking 모듈의 jQuery 커스텀 이벤트. 패널이 이동된 뒤 발생한다
 * @name jQuery#flicking:flickEnd
 * @event
 * @example
 $("#mflick").on("flicking:flickEnd",callback);
 $("#mflick").off("flicking:flickEnd",callback);
 $("#mflick").trigger("flicking:flickEnd",callback);
 * @see eg.Flicking#event:flickEnd
 */
/**
 * A jQuery custom event of the eg.Flicking module. This event is fired after an element is restored to its original position when user action is done while the element has not bene dragged until a certain distance threshold is reached.
 *
 * @ko eg.Flicking 모듈의 jQuery 커스텀 이벤트. 다음 패널로 바뀌는 기준 이동 거리만큼 이동하기 전에 사용자의 동작이 끝났을 때 원래 패널로 복원된 다음 발생한다
 * @name jQuery#flicking:restore
 * @event
 * @example
 $("#mflick").on("flicking:restore",callback);
 $("#mflick").off("flicking:restore",callback);
 $("#mflick").trigger("flicking:restore",callback);
 * @see eg.Flicking#event:restore
 */
