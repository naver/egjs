// jscs:disable maximumLineLength
eg.module("movableCoord", ["jQuery", eg, "Hammer"], function($, ns, HM) {
	var SUPPORT_TOUCH = ("ontouchstart" in window);

	// jscs:enable maximumLineLength
	// It is scheduled to be removed in case of build process.
	// ns.__checkLibrary__( !("Hammer" in window), "You must download Hammerjs. (http://hammerjs.github.io/)\n\ne.g. bower install hammerjs");
	// ns.__checkLibrary__( !("easeOutQuint" in $.easing), "You must download jQuery Easing Plugin(http://gsgd.co.uk/sandbox/jquery/easing/)\n\ne.g. bower install jquery.easing");
	/**
	 * The MovableCoord can control coordinate by user's action.
	 * @group egjs
	 * @ko MovableCoord는 사용자 행동에 의해, 좌표계를 제어할 수 있다.
	 * @class
	 * @name eg.MovableCoord
	 * @extends eg.Component
	 *
	 * @param {Object} options
	 * @param {Array} options.min The minimum coordinate  <ko>좌표계의 최소값</ko>
	 * @param {Number} [options.min.0=0] The minimum x-coordinate <ko>최소 X좌표</ko>
	 * @param {Number} [options.min.1=0] The minimum y-coordinate <ko>최소 Y좌표</ko>
	 *
	 * @param {Array} options.max The maximum coordinate <ko>좌표계의 최대값</ko>
	 * @param {Number} [options.max.0=100] The maximum x-coordinate <ko>최대 X좌표</ko>
	 * @param {Number} [options.max.1=100] The maximum y-coordinate <ko>최대 Y좌표</ko>
	 *
	 * @param {Array} options.bounce The area can move using animation. <ko>바운스: 애니메이션에 의해 이동할 수 있는 영역 </ko>
	 * @param {Boolean} [options.bounce.0=10] The bounce top range <ko>top 바우스 영역</ko>
	 * @param {Boolean} [options.bounce.1=10] The bounce right range <ko>right 바우스 영역</ko>
	 * @param {Boolean} [options.bounce.2=10] The bounce bottom range <ko>bottom 바우스 영역</ko>
	 * @param {Boolean} [options.bounce.3=10] The bounce left range <ko>left 바우스 영역</ko>
	 *
	 * @param {Array} options.margin The area can move using user's action. <ko>영역별 마진 영역: 사용자의 액션에 의해, 추가로 이동할수 있는 영역</ko>
	 * @param {Boolean} [options.margin.0=0] The margin top range <ko>top 마진 영역</ko>
	 * @param {Boolean} [options.margin.1=0] The margin right range <ko>right 마진 영역</ko>
	 * @param {Boolean} [options.margin.2=0] The margin bottom range <ko>bottom 마진 영역</ko>
	 * @param {Boolean} [options.margin.3=0] The margin left range <ko>left 마진 영역</ko>
	 * @param {Array} options.circular <ko>영역별 순환 여부</ko>
	 * @param {Boolean} [options.circular.0=false] The circular top range <ko>top 순환 영역</ko>
	 * @param {Boolean} [options.circular.1=false] The circular right range <ko>right 순환 영역</ko>
	 * @param {Boolean} [options.circular.2=false] The circular bottom range <ko>bottom 순환 영역</ko>
	 * @param {Boolean} [options.circular.3=false] The circular left range <ko>left 순환 영역</ko>
	 *
	 * @param {Function} [options.easing=easing.easeOutCubic] Function of the Easing (jQuery UI Easing, jQuery Easing Plugin). <ko>Easing 함수</ko>
	 * @param {Number} [options.maximumDuration=Infinity] The maximum duration. <ko>최대 좌표 이동 시간</ko>
	 * @param {Number} [options.deceleration=0.0006] deceleration This value can be altered to change the momentum animation duration. higher numbers make the animation shorter. <ko>감속계수. 높을값이 주어질수록 애니메이션의 동작 시간이 짧아진다.</ko>
	 * @see Hammerjs {@link http://hammerjs.github.io}
	 * @see There is usability issue due to default css properties ({@link http://hammerjs.github.io/jsdoc/Hammer.defaults.cssProps.html}) of the Hammerjs. Therefore, movableCoord removes css properties.
	 * <ko>Hammerjs의 기본 CSS 속성({@link http://hammerjs.github.io/jsdoc/Hammer.defaults.cssProps.html}) 으로 인해 사용성 이슈가 있다. 따라서, movableCoord는 hammerjs의 기본 CSS 속성을 제거하였다.</ko>
	 *
	 * @codepen {"id":"bdVybg", "ko":"MovableCoord 기본 예제", "en":"MovableCoord basic example", "collectionId":"AKpkGW", "height": 403}
	 *
	 * @see Easing Functions Cheat Sheet {@link http://easings.net/}
	 * @see If you want to use another easing function then should be import jQuery easing plugin({@link http://gsgd.co.uk/sandbox/jquery/easing/}) or jQuery UI easing.({@link https://jqueryui.com/easing/})<ko>다른 easing 함수를 사용하고 싶다면, jQuery easing plugin({@link http://gsgd.co.uk/sandbox/jquery/easing/})이나, jQuery UI easing({@link https://jqueryui.com/easing/}) 라이브러리를 삽입해야 한다.</ko>
	 *
	 * @support {"ie": "10+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	 */
	ns.MovableCoord = ns.Class.extend(ns.Component, {
		construct: function(options) {
			this.options = {
				min: [0, 0],
				max: [100, 100],
				bounce: [10, 10, 10, 10],
				margin: [0,0,0,0],
				circular: [false, false, false, false],
				easing: $.easing.easeOutCubic,
				maximumDuration: Infinity,
				deceleration: 0.0006
			};
			this._reviseOptions(options);
			this._status = {
				grabOutside: false,	// check whether user's action started on outside
				curHammer: null,		// current hammer instance
				moveDistance: null,	// a position of the first user's action
				animationParam: null,		// animation infomation
				prevented: false		//  check whether the animation event was prevented
			};
			this._hammers = {};
			this._pos = [ this.options.min[0], this.options.min[1] ];
			this._subOptions = {};
			this._raf = null;
			this._animationEnd = $.proxy(this._animationEnd, this);	// for caching
			this._panmove = $.proxy(this._panmove, this);	// for caching
			this._panend = $.proxy(this._panend, this);	// for caching
		},
		/**
		 * Attach a element to an use for the movableCoord.
		 * @ko movableCoord을 사용하기 위한 엘리먼트를 등록한다.
		 * @method eg.MovableCoord#bind
		 * @param {HTMLElement|String|jQuery} element  A target element. <ko>movableCoord을 사용하기 위한 엘리먼트</ko>
		 * @param {Object} options
		 * @param {Number} [options.direction=eg.DIRECTION_ALL] The controllable directions. <ko>움직일수 있는 방향</ko>
		 * @param {Array} options.scale The moving scale. <ko>이동 배율</ko>
		 * @param {Number} [options.scale.0=1] x-scale <ko>x축 배율</ko>
		 * @param {Number} [options.scale.1=1] y-scale <ko>y축 배율</ko>
		 * @param {Number} [options.thresholdAngle=45] The threshold angle about direction which range is 0~90 <ko>방향에 대한 임계각 (0~90)</ko>
		 * @param {Number} [options.interruptable=true] interruptable This value can be enabled to interrupt cycle of the animation event. <ko>이 값이  true이면, 애니메이션의 이벤트 사이클을 중단할수 있다.</ko>
		 * @param {Array} [options.inputType] inputType you can control input type. a kind of inputs are "touch", "mouse".  default value is ["touch", "mouse"] <ko>입력 타입을 지정할수 있다. 입력타입은 "touch", "mouse" 가 있으며, 배열로 입력할 수 있다. (기본값은 ["touch", "mouse"] 이다)</ko>
		 *
		 * @return {Boolean}
		 */
		bind: function(el, options) {
			var $el = $(el);
			var keyValue = $el.data(ns.MovableCoord.KEY);
			var subOptions = {
				direction: ns.DIRECTION_ALL,
				scale: [ 1, 1 ],
				thresholdAngle: 45,
				interruptable: true,
				inputType: [ "touch", "mouse" ]
			};

			$.extend(subOptions, options);

			var inputClass = this._convertInputType(subOptions.inputType);
			if (!inputClass) {
				return this;
			}
			if (keyValue) {
				this._hammers[keyValue].get("pan").set({
					direction: subOptions.direction
				});
			} else {
				keyValue = Math.round(Math.random() * new Date().getTime());
				this._hammers[keyValue] = this._createHammer(
					$el.get(0),
					subOptions,
					inputClass
				);
				$el.data(ns.MovableCoord.KEY, keyValue);
			}
			return this;
		},

		_createHammer: function(el, subOptions, inputClass) {
			try {
				// create Hammer
				var hammer = new HM.Manager(el, {
						recognizers: [
							[
								HM.Tap, {

									// for long tap
									time: 30000
								}
							],
							[
								HM.Pan, {
									direction: subOptions.direction,
									threshold: 0
								}, ["tap"]
							]
						],

						// css properties were removed due to usablility issue
						// http://hammerjs.github.io/jsdoc/Hammer.defaults.cssProps.html
						cssProps: {},
						inputClass: inputClass
					});
				return hammer.on("hammer.input", $.proxy(function(e) {
					if (e.isFirst) {
						// apply options each
						this._subOptions = subOptions;
						this._status.curHammer = hammer;
						this._panstart(e);
					}
				}, this))
				.on("panstart panmove", this._panmove)
				.on("panend tap", this._panend);
			} catch (e) {
				// console.log(e);
			}
		},

		_convertInputType: function(inputType) {
			var hasTouch = false;
			var hasMouse = false;
			inputType = inputType || [];
			$.each(inputType, function(i, v) {
				switch (v) {
					case "mouse" : hasMouse = true; break;
					case "touch" : hasTouch = SUPPORT_TOUCH; break;
				}
			});
			if (hasTouch) {
				return HM.TouchInput;
			}
			if (hasMouse) {
				return HM.MouseInput;
			}
			return null;
		},

		/**
		 * Dettach a element to an use for the movableCoord.
		 * @ko movableCoord을 사용하기 위한 엘리먼트를 해제한다.
		 * @method eg.MovableCoord#unbind
		 * @param {HTMLElement|String|jQuery} element The target element.<ko>movableCoord을 사용하기 위한 설정한 엘리먼트</ko>
		 * @return {Boolean}
		 */
		unbind: function(el) {
			var $el = $(el);
			var key = $el.data(ns.MovableCoord.KEY);
			if (key) {
				this._hammers[key].destroy();
				delete this._hammers[key];
				$el.data(ns.MovableCoord.KEY, null);
			}
		},

		_grab: function() {
			if (this._status.animationParam) {
				this._pos = this._getCircularPos(this._pos);
				this._triggerChange(this._pos, true);
				this._status.animationParam = null;
				this._raf && ns.cancelAnimationFrame(this._raf);
				this._raf = null;
			}
		},

		_getCircularPos: function(pos, min, max, circular) {
			min = min || this.options.min;
			max = max || this.options.max;
			circular = circular || this.options.circular;

			if (circular[0] && pos[1] < min[1]) { // up
				pos[1] = (pos[1] - min[1]) % (max[1] - min[1] + 1) + max[1];
			}
			if (circular[1] && pos[0] > max[0]) { // right
				pos[0] = (pos[0] - min[0]) % (max[0] - min[0] + 1) + min[0];
			}
			if (circular[2] && pos[1] > max[1]) { // down
				pos[1] = (pos[1] - min[1]) % (max[1] - min[1] + 1) + min[1];
			}
			if (circular[3] && pos[0] < min[0]) { // left
				pos[0] = (pos[0] - min[0]) % (max[0] - min[0] + 1) + max[0];
			}
			pos[0] = +pos[0].toFixed(5), pos[1] = +pos[1].toFixed(5);

			return pos;
		},

		// determine outside
		_isOutside: function(pos, min, max) {
			return pos[0] < min[0] || pos[1] < min[1] ||
				pos[0] > max[0] || pos[1] > max[1];
		},

		// from outside to outside
		_isOutToOut: function(pos, destPos, min, max) {
			return (pos[0] < min[0] || pos[0] > max[0] ||
				pos[1] < min[1] || pos[1] > max[1]) &&
				(destPos[0] < min[0] || destPos[0] > max[0] ||
				destPos[1] < min[1] || destPos[1] > max[1]);
		},

		// panstart event handler
		_panstart: function(e) {
			if (!this._subOptions.interruptable && this._status.prevented) {
				return;
			}
			this._setInterrupt(true);
			var pos = this._pos;
			this._grab();
			/**
			 * When an area was pressed
			 * @ko 스크린에서 사용자가 손을 대었을 때
			 * @name eg.MovableCoord#hold
			 * @event
			 * @param {Object} param
			 * @param {Array} param.pos coordinate <ko>좌표 정보</ko>
			 * @param {Number} param.pos.0 x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.pos.1 y-coordinate <ko>y 좌표</ko>
			 * @param {Object} param.hammerEvent Hammerjs event. if you use api, this value is null. http://hammerjs.github.io/api/#hammer.input-event <ko>사용자의 액션에 대한 hammerjs 이벤트 정보 (API에 의해 호출될 경우, null 을 반환)</ko>
			 *
			 */
			this.trigger("hold", {
				pos: pos.concat(),
				hammerEvent: e
			});
			this._status.moveDistance = pos.concat();
			this._status.grabOutside = this._isOutside(
				pos,
				this.options.min,
				this.options.max
			);
		},

		// panmove event handler
		_panmove: function(e) {
			if (!this._isInterrupting() || !this._status.moveDistance) {
				return;
			}
			var tv;
			var tn;
			var tx;
			var pos = this._pos;
			var min = this.options.min;
			var max = this.options.max;
			var bounce = this.options.bounce;
			var margin = this.options.margin;
			var direction = this._subOptions.direction;
			var scale = this._subOptions.scale;
			var userDirection = this._getDirection(e.angle);
			var out = [
				margin[0] + bounce[0],
				margin[1] + bounce[1],
				margin[2] + bounce[2],
				margin[3] + bounce[3]
			];
			var prevent  = false;

			// not support offset properties in Hammerjs - start
			var prevInput = this._status.curHammer.session.prevInput;
			if (prevInput) {
				e.offsetX = e.deltaX - prevInput.deltaX;
				e.offsetY = e.deltaY - prevInput.deltaY;
			} else {
				e.offsetX = e.offsetY = 0;
			}

			// not support offset properties in Hammerjs - end
			if (direction === ns.DIRECTION_ALL ||
				(direction & ns.DIRECTION_HORIZONTAL &&
				userDirection & ns.DIRECTION_HORIZONTAL)
			) {
				this._status.moveDistance[0] += (e.offsetX * scale[0]);
				prevent = true;
			}
			if (direction === ns.DIRECTION_ALL ||
				(direction & ns.DIRECTION_VERTICAL &&
				userDirection & ns.DIRECTION_VERTICAL)
			) {
				this._status.moveDistance[1] += (e.offsetY * scale[1]);
				prevent = true;
			}
			if (prevent) {
				e.srcEvent.preventDefault();
				e.srcEvent.stopPropagation();
			}

			e.preventSystemEvent = prevent;
			pos[0] = this._status.moveDistance[0];
			pos[1] = this._status.moveDistance[1];
			pos = this._getCircularPos(pos, min, max);

			// from outside to inside
			if (this._status.grabOutside && !this._isOutside(pos, min, max)) {
				this._status.grabOutside = false;
			}

			// when move pointer is holded outside
			if (this._status.grabOutside) {
				tn = min[0] - out[3], tx = max[0] + out[1], tv = pos[0];
				pos[0] = tv > tx ? tx : (tv < tn ? tn : tv);
				tn = min[1] - out[0], tx = max[1] + out[2], tv = pos[1];
				pos[1] = tv > tx ? tx : (tv < tn ? tn : tv);
			} else {

				// when start pointer is holded inside
				// get a initialization slop value to prevent smooth animation.
				var initSlope = this._initSlope();
				if (pos[1] < min[1]) { // up
					tv = (min[1] - pos[1]) / (out[0] * initSlope);
					pos[1] = min[1] - this._easing(tv) * out[0];
				} else if (pos[1] > max[1]) { // down
					tv = (pos[1] - max[1]) / (out[2] * initSlope);
					pos[1] = max[1] + this._easing(tv) * out[2];
				}
				if (pos[0] < min[0]) { // left
					tv = (min[0] - pos[0]) / (out[3] * initSlope);
					pos[0] = min[0] - this._easing(tv) * out[3];
				} else if (pos[0] > max[0]) { // right
					tv = (pos[0] - max[0]) / (out[1] * initSlope);
					pos[0] = max[0] + this._easing(tv) * out[1];
				}

			}
			this._triggerChange(pos, true, e);
		},

		// panend event handler
		_panend: function(e) {
			if (!this._isInterrupting() || !this._status.moveDistance) {
				return;
			}
			var direction = this._subOptions.direction;
			var scale = this._subOptions.scale;
			var vX =  Math.abs(e.velocityX);
			var vY = Math.abs(e.velocityY);

			// console.log(e.velocityX, e.velocityY, e.deltaX, e.deltaY);
			!(direction & ns.DIRECTION_HORIZONTAL) && (vX = 0);
			!(direction & ns.DIRECTION_VERTICAL) && (vY = 0);

			this._animateBy(
				this._getNextOffsetPos([
					vX * (e.deltaX < 0 ? -1 : 1) * scale[0],
					vY * (e.deltaY < 0 ? -1 : 1) * scale[1]
				]),
			this._animationEnd, false, null, e);
			this._status.moveDistance = null;
		},

		_isInterrupting: function() {
			// when interruptable is 'true', return value is always 'true'.
			return this._subOptions.interruptable || this._status.prevented;
		},

		// get user's direction
		_getDirection: function(angle) {
			var thresholdAngle = this._subOptions.thresholdAngle;
			if (thresholdAngle < 0 || thresholdAngle > 90) {
				return ns.DIRECTION_NONE;
			}
			angle = Math.abs(angle);
			return angle > thresholdAngle && angle < 180 - thresholdAngle ?
					ns.DIRECTION_VERTICAL : ns.DIRECTION_HORIZONTAL;
		},

		_animationEnd: function() {
			/**
			 * When animation was ended.
			 * @ko 에니메이션이 끝났을 때 발생한다.
			 * @name eg.MovableCoord#animationEnd
			 * @event
			 */
			var pos = this._pos;
			var min = this.options.min;
			var max = this.options.max;
			this._animateTo([
				Math.min(max[0], Math.max(min[0], pos[0])),
				Math.min(max[1], Math.max(min[1], pos[1]))
			], $.proxy(this.trigger, this, "animationEnd"), true, null);
		},

		_getNextOffsetPos: function(speeds) {
			var normalSpeed = Math.sqrt(
				speeds[0] * speeds[0] + speeds[1] * speeds[1]
			);
			var duration = Math.abs(normalSpeed / -this.options.deceleration);
			return [
				speeds[0] / 2 * duration,
				speeds[1] / 2 * duration
			];
		},

		_getDurationFromPos: function(pos) {
			var normalPos = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1]);
			var duration = Math.sqrt(
				normalPos / this.options.deceleration * 2
			);

			// when duration was under 100, duration is zero
			return duration < 100 ? 0 : duration;
		},

		_animateBy: function(offset, callback, isBounce, duration, e) {
			var pos = this._pos;
			return this._animateTo([
				pos[0] + offset[0],
				pos[1] + offset[1]
			], callback, isBounce, duration, e);
		},

		_getPointOfIntersection: function(depaPos, destPos) {
			var circular = this.options.circular;
			var bounce = this.options.bounce;
			var min = this.options.min;
			var max = this.options.max;
			var boxLT = [ min[0] - bounce[3], min[1] - bounce[0] ];
			var boxRB = [ max[0] + bounce[1], max[1] + bounce[2] ];
			var xd;
			var yd;
			destPos = [destPos[0], destPos[1]];
			xd = destPos[0] - depaPos[0], yd = destPos[1] - depaPos[1];
			if (!circular[3]) {
				destPos[0] = Math.max(boxLT[0], destPos[0]);
			} // left
			if (!circular[1]) {
				destPos[0] = Math.min(boxRB[0], destPos[0]);
			} // right
			destPos[1] = xd ?
							depaPos[1] + yd / xd * (destPos[0] - depaPos[0]) :
							destPos[1];

			if (!circular[0]) {
				destPos[1] = Math.max(boxLT[1], destPos[1]);
			} // up
			if (!circular[2]) {
				destPos[1] = Math.min(boxRB[1], destPos[1]);
			} // down
			destPos[0] = yd ?
							depaPos[0] + xd / yd * (destPos[1] - depaPos[1]) :
							destPos[0];
			return destPos;

		},

		_isCircular: function(circular, destPos, min, max) {
			return (circular[0] && destPos[1] < min[1]) ||
					(circular[1] && destPos[0] > max[0]) ||
					(circular[2] && destPos[1] > max[1]) ||
					(circular[3] && destPos[0] < min[0]);
		},

		_animateTo: function(absPos, callback, isBounce, duration, e) {
			var pos = this._pos;
			var destPos = this._getPointOfIntersection(pos, absPos);
			var param = {
					depaPos: pos.concat(),
					destPos: destPos,
					hammerEvent: e || null
				};
			if (!isBounce && e) {	// check whether user's action
				/**
				 * When an area was released
				 * @ko 스크린에서 사용자가 손을 떼었을 때
				 * @name eg.MovableCoord#release
				 * @event
				 *
				 * @param {Object} param
				 * @param {Array} param.depaPos departure coordinate <ko>현재 좌표</ko>
				 * @param {Number} param.depaPos.0 departure x-coordinate <ko>현재 x 좌표</ko>
				 * @param {Number} param.depaPos.1 departure y-coordinate <ko>현재 y 좌표</ko>
				 * @param {Array} param.destPos destination coordinate <ko>애니메이션에 의해 이동할 좌표</ko>
				 * @param {Number} param.destPos.0 destination x-coordinate <ko>x 좌표</ko>
				 * @param {Number} param.destPos.1 destination y-coordinate <ko>y 좌표</ko>
				 * @param {Object} param.hammerEvent Hammerjs event. if you use api, this value is null. http://hammerjs.github.io/api/#hammer.input-event <ko>사용자의 액션에 대한 hammerjs 이벤트 정보 (API에 의해 호출될 경우, null 을 반환)</ko>
				 *
				 */
				this.trigger("release", param);
			}
			this._afterReleaseProcess(param, callback, isBounce, duration);
		},

		// when user release a finger or poiner or mouse
		_afterReleaseProcess: function(param, callback, isBounce, duration) {
			/*
			caution:: update option values because options was changed by "release" event
			 */
			var pos = this._pos;
			var min = this.options.min;
			var max = this.options.max;
			var circular = this.options.circular;
			var isCircular = this._isCircular(
								circular,
								param.destPos,
								min,
								max
							);
			var destPos = this._isOutToOut(pos, param.destPos, min, max) ?
				pos : param.destPos;
			var distance = [
				Math.abs(destPos[0] - pos[0]),
				Math.abs(destPos[1] - pos[1])
			];
			var animationParam;
			duration = duration === null ?
						this._getDurationFromPos(distance) : duration;
			duration = this.options.maximumDuration > duration ?
						duration : this.options.maximumDuration;

			var done = $.proxy(function(isNext) {
					this._status.animationParam = null;
					pos[0] = Math.round(destPos[0]);
					pos[1] = Math.round(destPos[1]);
					pos = this._getCircularPos(pos, min, max, circular);
					!isNext && this._setInterrupt(false);
					callback();
				}, this);

			if (distance[0] === 0 && distance[1] === 0) {
				return done(!isBounce);
			}

			// prepare animation parameters
			animationParam = {
				duration: duration,
				depaPos: pos.concat(),
				destPos: destPos,
				isBounce: isBounce,
				isCircular: isCircular,
				done: done,
				hammerEvent: param.hammerEvent
			};

			/**
			 * When animation was started.
			 * @ko 에니메이션이 시작했을 때 발생한다.
			 * @name eg.MovableCoord#animationStart
			 * @event
			 * @param {Object} param
			 * @param {Number} param.duration
			 * @param {Array} param.depaPos departure coordinate <ko>현재 좌표</ko>
			 * @param {Number} param.depaPos.0 departure x-coordinate <ko>현재 x 좌표</ko>
			 * @param {Number} param.depaPos.1 departure y-coordinate <ko>현재 y 좌표</ko>
			 * @param {Array} param.destPos destination coordinate <ko>애니메이션에 의해 이동할 좌표</ko>
			 * @param {Number} param.destPos.0 destination x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.destPos.1 destination y-coordinate <ko>y 좌표</ko>
			 * @param {Boolean} param.isBounce When an animation is bounced, a value is 'true'.  <ko>바운스 되는 애니메이션인 경우 true</ko>
			 * @param {Boolean} param.isCircular When the area is circular type, a value is 'true'. <ko>순환하여 움직여야하는 애니메이션인경우 true</ko>
			 * @param {Function} param.done If user control animation, user must call this function. <ko>애니메이션이 끝났다는 것을 알려주는 함수</ko>
			 * @param {Object} param.hammerEvent Hammerjs event. if you use api, this value is null. http://hammerjs.github.io/api/#hammer.input-event <ko>사용자의 액션에 대한 hammerjs 이벤트 정보 (API에 의해 호출될 경우, null 을 반환)</ko>
			 *
			 */
			var retTrigger = this.trigger("animationStart", animationParam);

			// You can't stop the 'animationStart' event when 'circular' is true.
			if (isCircular && !retTrigger) {
				throw new Error(
					"You can't stop the 'animation' " +
					"event when 'circular' is true."
				);
			}
			animationParam.depaPos = pos;
			animationParam.startTime = new Date().getTime();
			this._status.animationParam = animationParam;
			if (retTrigger) {
				if (animationParam.duration) {
					// console.error("depaPos", pos, "depaPos",destPos, "duration", duration, "ms");
					var info = this._status.animationParam;
					var self = this;
					(function loop() {
						self._raf = null;
						if (self._frame(info) >= 1) {
							return done(true);
						} // animationEnd
						self._raf = ns.requestAnimationFrame(loop);
					})();
				} else {
					this._triggerChange(animationParam.destPos, false);
					done(!isBounce);
				}
			}
		},

		// animation frame (0~1)
		_frame: function(param) {
			var curTime = new Date() - param.startTime;
			var easingPer = this._easing(curTime / param.duration);
			var pos = [ param.depaPos[0], param.depaPos[1] ];

			for (var i = 0; i < 2 ; i++) {
				(pos[i] !== param.destPos[i]) &&
				(pos[i] += (param.destPos[i] - pos[i]) * easingPer);
			}
			pos = this._getCircularPos(pos);
			this._triggerChange(pos, false);
			return easingPer;
		},

		// set up 'css' expression
		_reviseOptions: function(options) {
			var key;
			$.each(["bounce", "margin", "circular"], function(i, v) {
				key = options[v];
				if (key != null) {
					if ($.isArray(key)) {
						if (key.length === 2) {
							options[v] = [ key[0], key[1], key[0], key[1] ];
						} else {
							options[v] = [ key[0], key[1], key[2], key[3] ];
						}
					} else if (/string|number|boolean/.test(typeof key)) {
						options[v] = [ key, key, key, key ];
					} else {
						options[v] = null;
					}
				}
			});
			$.extend(this.options, options);
		},

		// trigger 'change' event
		_triggerChange: function(pos, holding, e) {
			/**
			 * When coordinate was changed
			 * @ko 좌표가 변경됐을 때 발생한다.
			 * @name eg.MovableCoord#change
			 * @event
			 *
			 * @param {Object} param
			 * @param {Array} param.pos departure coordinate  <ko>좌표</ko>
			 * @param {Number} param.pos.0 departure x-coordinate <ko>x 좌표</ko>
			 * @param {Number} param.pos.1 departure y-coordinate <ko>y 좌표</ko>
			 * @param {Boolean} param.holding If an area was pressed, this value is 'true'. <ko>스크린을 사용자가 누르고 있을 경우 true </ko>
			 * @param {Object} param.hammerEvent Hammerjs event. if you use api, this value is null. http://hammerjs.github.io/api/#hammer.input-event <ko>사용자의 액션에 대한 hammerjs 이벤트 정보 (API에 의해 호출될 경우, null 을 반환)</ko>
			 *
			 */
			this._pos = pos.concat();
			this.trigger("change", {
				pos: pos.concat(),
				holding: holding,
				hammerEvent: e || null
			});
		},

		/**
		 * Get current positions
		 * @ko 현재 위치를 반환한다.
		 * @method eg.MovableCoord#get
		 * @return {Array} pos
		 * @return {Number} pos.0 x position
		 * @return {Number} pos.1 y position
		 */
		get: function() {
			return this._pos.concat();
		},

		/**
		 * Set to position
		 *
		 * If a duration was greater than zero, 'change' event was triggered for duration.
		 * @ko 위치를 설정한다. 만약, duration이 0보다 크다면 'change' 이벤트가 발생한다.
		 * @method eg.MovableCoord#setTo
		 * @param {Number} x x-coordinate <ko>이동할 x좌표</ko>
		 * @param {Number} y y-coordinate <ko>이동할 y좌표</ko>
		 * @param {Number} [duration=0] Duration of animation in milliseconds. <ko>애니메이션 진행시간(ms)</ko>
		 * @return {Instance}
		 */
		setTo: function(x, y, duration) {
			this._grab();
			var pos = this._pos.concat();
			var circular = this.options.circular;
			var min = this.options.min;
			var max = this.options.max;
			if (x === pos[0] && y === pos[1]) {
				return this;
			}
			this._setInterrupt(true);
			if (x !== pos[0]) {
				if (!circular[3]) {
					x = Math.max(min[0], x);
				}
				if (!circular[1]) {
					x = Math.min(max[0], x);
				}
			}
			if (y !== pos[1]) {
				if (!circular[0]) {
					y = Math.max(min[1], y);
				}
				if (!circular[2]) {
					y = Math.min(max[1], y);
				}
			}
			if (duration) {
				this._animateTo([ x, y ], this._animationEnd, false, duration);
			} else {
				this._pos = this._getCircularPos([ x, y ]);
				this._triggerChange(this._pos, false);
				this._setInterrupt(false);
			}
			return this;
		},
		/**
		 * Set to relative position
		 *
		 * If a duration was greater than zero, 'change' event was triggered for duration
		 * @ko 현재를 기준으로 위치를 설정한다. 만약, duration이 0보다 크다면 'change' 이벤트가 발생한다.
		 * @method eg.MovableCoord#setBy
		 * @param {Number} x x-coordinate <ko>이동할 x좌표</ko>
		 * @param {Number} y y-coordinate <ko>이동할 y좌표</ko>
		 * @param {Number} [duration=0] Duration of animation in milliseconds. <ko>애니메이션 진행시간(ms)</ko>
		 * @return {Array}
		 */
		setBy: function(x, y, duration) {
			return this.setTo(
				x != null ? this._pos[0] + x : this._pos[0],
				y != null ? this._pos[1] + y : this._pos[1],
				duration
			);
		},

		_easing: function(p) {
			if (p > 1) {
				return 1;
			} else {
				return this.options.easing(p, p, 0, 1, 1);
			}
		},

		_initSlope: function() {
			var easing = this.options.easing;
			var isIn = false;
			var p;
			for (p in $.easing) {
				if ($.easing[p] === easing) {
					isIn = !~p.indexOf("Out");
					break;
				}
			}
			return isIn ?
					easing(0.9999, 0.9999, 0, 1, 1) / 0.9999 :
					easing(0.00001, 0.00001, 0, 1, 1) / 0.00001;
		},

		_setInterrupt: function(prevented) {
			!this._subOptions.interruptable &&
			(this._status.prevented = prevented);
		},

		/**
		 * Release resources and off custom events
		 * @ko 모든 커스텀 이벤트와 자원을 해제한다.
		 * @method eg.MovableCoord#destroy
		 */
		destroy: function() {
			this.off();
			for (var p in this._hammers) {
				this._hammers[p].destroy();
				this._hammers[p] = null;
			}
		}
	});
	ns.MovableCoord.KEY = "__MOVABLECOORD__";
});