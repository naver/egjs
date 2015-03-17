"use strict";
(function($, ns) {
	ns.MovableCoord = ns.Class.extend(ns.Component,{
		construct : function(pos, options) {
			this.options = {
				min : [0, 0],
				max : [100, 100],
				bounce : [10, 10, 10, 10],
				margin : [0,0,0,0],
				circular : [false, false, false, false],
				deceleration : 0.0006
			};
			this._extendOptions(options);
			this._grabOutside = false;
			this._animating = null;
			this._raf = null;
			this._hammers = {};
			this._curHammer = null;
			this._pos = pos || [0,0];


			this._subOptions = {};

			//@todo init event
			// this.trigger("init");
		},

		bind : function(el, options) {
			var key = ns.MovableCoord.KEY + Math.round(Math.random() * new Date().getTime()),
				$el = $(el),
				subOptions = {
					direction : Hammer.DIRECTION_ALL,
					scale : [ 1, 1 ],
					easing : $.easing.easeOutQuint,
					maximumSpeed : Infinity
				};
			$.extend(subOptions, options);

			if($el.data(ns.MovableCoord.KEY)) {
				this.unbind(el);
			}
			this._hammers[key] = this._createHammer($el.get(0), subOptions);
			$el.data(ns.MovableCoord.KEY, key);
			return this;
		},

		_createHammer : function(el, subOptions) {
			// create Hammer
			var hammer = new Hammer.Manager(el, {
					recognizers : [
						[
							Hammer.Pan, {
								direction: subOptions.direction,
								threshold: 0
							}
						]
					]
				});
			hammer.on("panstart", function(e) {
				// apply options each
				this._subOptions = subOptions;
				this._curHammer = hammer;
				this._panstart(e);
			}.bind(this, hammer))
			.on("panmove", this._panmove.bind(this))
			.on("panend", this._panend.bind(this));
			return hammer;
		},

		unbind : function(el) {
			var $el = $(el),
				key = $el.data(ns.MovableCoord.KEY);
			if(key) {
				this._hammers[key].destroy();
				delete this._hammers[key];
				$el.data(ns.MovableCoord.KEY, null);
			}
		},
		_grab : function() {
			if(this._animating) {
				this._pos = this._getCircularPos(this._pos);
				this._triggerChange(this._pos, true);
				this._animating = null;
				this._raf && cancelAnimationFrame(this._raf);
				this._raf = null;
			}
		},
		_getCircularPos : function(pos, min, max, circular) {
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
			return pos;
		},
		// determine outside
		_isOutside : function(pos, min, max) {
			return pos[0] < min[0] || pos[1] < min[1] || pos[0] > max[0] || pos[1] > max[1];
		},

		// from outside to outside
		_isOutToOut : function(pos, destPos, min, max) {
			return (pos[0] < min[0] || pos[0] > max[0] || pos[1] < min[1] || pos[1] > max[1]) &&
				(destPos[0] < min[0] || destPos[0] > max[0] || destPos[1] < min[1] || destPos[1] > max[1]);
		},

		// panstart event handler
		_panstart : function(e) {
			var pos = this._pos;
			this._grab();
			this.trigger("hold", {
				event : e,
				pos : [ pos[0], pos[1] ]
			});
			this._grabOutside = this._isOutside(pos, this.options.min, this.options.max);
			// this._movingPos = [pos[0], pos[1]];
		},

		// panmove event handler
		_panmove : function(e) {
			e.srcEvent.preventDefault();
			e.srcEvent.stopPropagation();

			var tv, tn, tx, pos = this._pos,
				min = this.options.min,
				max = this.options.max,
				bounce = this.options.bounce,
				margin = this.options.margin,
				direction = this._subOptions.direction,
				scale = this._subOptions.scale,
				easing = this._subOptions.easing,
				out = [ margin[0] + bounce[0], margin[1] + bounce[1], margin[2] + bounce[2], margin[3] + bounce[3] ];

			// not support offset properties in Hammerjs - start
			var prevInput = this._curHammer.session.prevInput || {};
			if(prevInput) {
			    e.offsetX = e.deltaX - prevInput.deltaX;
			    e.offsetY = e.deltaY - prevInput.deltaY;
			} else {
			    e.offsetX = e.offsetY = 0;
			}
			// not support offset properties in Hammerjs - end

			if(direction & Hammer.DIRECTION_HORIZONTAL) {
				pos[0] += e.offsetX * scale[0];
			}
			if(direction & Hammer.DIRECTION_VERTICAL) {
				pos[1] += e.offsetY * scale[1];
			}
			// pos[0] = movingPos[0], pos[1] = movingPos[1];
			pos = this._getCircularPos(pos, min, max);

			// from outside to inside
			if (this._grabOutside && !this._isOutside(pos, min, max)) {
				this._grabOutside = false;
			}

			// when move pointer is holded outside
			if (this._grabOutside) {
				tn = min[0]-out[3], tx = max[0]+out[1], tv = pos[0];
				pos[0] = tv>tx?tx:(tv<tn?tn:tv);
				tn = min[1]-out[0], tx = max[1]+out[2], tv = pos[1];
				pos[1] = tv>tx?tx:(tv<tn?tn:tv);
			} else {	// when start pointer is holded inside
				// to prevent smooth animation
				var initSlop = easing(null, 0.0001 , 0, 1, 1) / 0.0001;
				if (pos[1] < min[1]) { // up
					tv = (min[1]-pos[1])/(out[0]*initSlop);
					pos[1] = min[1]-easing(null, tv>1?1:tv , 0, 1, 1)* out[0];
				} else if (pos[1] > max[1]) { // down
					tv = (pos[1]-max[1])/(out[2]*initSlop);
					pos[1] = max[1]+easing(null, tv>1?1:tv , 0, 1, 1)*out[2];
				}
				if (pos[0] < min[0]) { // left
					tv = (min[0]-pos[0])/(out[3]*initSlop);
					pos[0] = min[0]-easing(null, tv>1?1:tv , 0, 1, 1)*out[3];
				} else if (pos[0] > max[0]) { // right
					tv = (pos[0]-max[0])/(out[1]*initSlop);
					pos[0] = max[0]+easing(null, tv>1?1:tv , 0, 1, 1)*out[1];
				}
			}

			this._triggerChange(pos, true);
		},

		// panend event handler
		_panend : function(e) {
			var direction = this._subOptions.direction,
				scale = this._subOptions.scale,
				vX =  Math.abs(e.velocityX),
				vY = Math.abs(e.velocityY);

			// console.log(e.velocityX, e.velocityY, e.deltaX, e.deltaY);
			!(direction & Hammer.DIRECTION_HORIZONTAL) && (vX = 0);
			!(direction & Hammer.DIRECTION_VERTICAL) && (vY = 0);
			this._move(this._getNextOffsetPos( [
				vX * (e.deltaX < 0 ? -1 : 1) * scale[0],
				vY * (e.deltaY < 0 ? -1 : 1) * scale[1]
			], this._subOptions.maximumSpeed ), true, Infinity);
			// this._movingPos = null;
		},

		_getNextOffsetPos : function(speeds, maximumSpeed) {
			var normalSpeed = Math.min(maximumSpeed || Infinity, Math.sqrt(speeds[0]*speeds[0]+speeds[1]*speeds[1])),
				duration = Math.abs(normalSpeed / -this.options.deceleration);
			return [
				speeds[0]/2 * duration,
				speeds[1]/2 * duration
			];
		},

		_getDurationFromPos : function(pos) {
			var normalPos = Math.sqrt(pos[0]*pos[0]+pos[1]*pos[1]),
				duration = Math.sqrt(normalPos / this.options.deceleration * 2);

			// when duration was under 10, duration is zero
			return duration < 10 ? 0 : duration;
		},

		_move : function(pos, bBy, maximumDuration) {
			this[bBy ? "_animateBy" : "_animateTo"](pos, function() {
				var pos = this._pos,
					min = this.options.min,
					max = this.options.max;
				this._animateTo( [ Math.min(max[0], Math.max(min[0], pos[0])), Math.min(max[1], Math.max(min[1], pos[1])) ] , function() {
					this.trigger("animationEnd");
				}.bind(this), true, maximumDuration);

			}.bind(this), false, maximumDuration);
		},

		_animateBy : function(offset, callback, isBounce, maximumDuration) {
			var pos = this._pos;
			return this._animateTo([
				pos[0] + offset[0],
				pos[1] + offset[1]
			], callback, isBounce, maximumDuration);
		},

		_getPointOfIntersection : function(depaPos, destPos) {
			var circular = this.options.circular,
				bounce = this.options.bounce,
				min = this.options.min,
				max = this.options.max,
				boxLT = [ min[0]-bounce[3], min[1]-bounce[0] ],
				boxRB = [ max[0]+bounce[1], max[1]+bounce[2] ];

			destPos = [destPos[0], destPos[1]];
			var xd = destPos[0]-depaPos[0], yd = destPos[1]-depaPos[1];
			if (!circular[3]) { destPos[0] = Math.max(boxLT[0], destPos[0]); } // left
			if (!circular[1]) { destPos[0] = Math.min(boxRB[0], destPos[0]); } // right
			destPos[1] = xd ? depaPos[1]+yd/xd*(destPos[0]-depaPos[0]) : destPos[1];

			if (!circular[0]) { destPos[1] = Math.max(boxLT[1], destPos[1]); } // up
			if (!circular[2]) { destPos[1] = Math.min(boxRB[1], destPos[1]); } // down
			destPos[0] = yd ? depaPos[0]+xd/yd*(destPos[1]-depaPos[1]) : destPos[0];
			return destPos;

		},

		_isCircular : function(circular, destPos, min, max) {
			return (circular[0] && destPos[1] < min[1]) ||
				(circular[1] && destPos[0] > max[0]) ||
				(circular[2] && destPos[1] > max[1]) ||
				(circular[3] && destPos[0] < min[0]);
		},

		_animateTo : function(absPos, callback, isBounce, maximumDuration) {
			var pos = this._pos,
				destPos = this._getPointOfIntersection(pos, absPos),
				param = {
					depaPos : [ pos[0], pos[1] ],
					destPos : destPos,
					bounce : isBounce
				};
			if (!isBounce) {
				this.trigger("release", param);
			}
			this._afterReleaseProcess(param, callback, isBounce, maximumDuration);
		},

		_afterReleaseProcess : function(param, callback, isBounce, maximumDuration) {
			/*
			caution :: update option values because options was changed by "release" event
			 */
			var pos = this._pos,
				min = this.options.min,
				max = this.options.max,
				circular = this.options.circular,
				destPos = param.destPos,
				isCircular = this._isCircular(circular, destPos, min, max);

			this._isOutToOut(pos, destPos, min, max) && (destPos = pos);

			var duration = Math.min( maximumDuration,
				this._getDurationFromPos( [ Math.abs(destPos[0]-pos[0]), Math.abs(destPos[1]-pos[1]) ] ) ),
				done = function() {
					this._animating = null;
					// 내부 좌표값 변경
					pos[0] = Math.round(destPos[0]);
					pos[1] = Math.round(destPos[1]);
					pos = this._getCircularPos(pos, min, max, circular);
					callback && callback();
				}.bind(this);

			if (!duration) { return done(); }

			// prepare animation parameters
			param = {
				duration : duration,
				easing : this._subOptions.easing,
				depaPos : [ pos[0], pos[1] ],
				destPos : destPos,
				isBounce : isBounce,
				isCircular : isCircular,
				done : done
			};

			var retTrigger = this.trigger("animation", param);
			// bCircular 가 true 인데 이벤트 stop 했으면
			if (isCircular && !retTrigger) {
				throw new Error("You can't stop the 'animation' event when 'circular' is true.");
			}
			param.depaPos = pos;
			param.startTime = new Date().getTime();
			this._animating = param;

			if (retTrigger) {
				// console.error("depaPos", pos, "depaPos",destPos, "duration", duration, "ms");
				var animating = this._animating,
					self = this;
				(function loop() {
					self._raf=null;
					if (self._frame(animating) >= 1) { return done(); } // 애니메이션 끝
					self._raf = requestAnimationFrame(loop);
				})();
			}
		},

		_frame : function(animating) {
			var curTime = new Date() - animating.startTime,
				per = Math.min(1, curTime / animating.duration),
				easingPer = animating.easing(null, curTime, 0, 1, animating.duration),
				dist,
				pos = [ animating.depaPos[0], animating.depaPos[1] ];

			if(pos[0] !== animating.destPos[0]) {
				dist = animating.destPos[0] - pos[0];
				pos[0] += dist * easingPer;
			}
			if(pos[1] !== animating.destPos[1]) {
				dist = animating.destPos[1] - pos[1];
				pos[1] += dist * easingPer;
			}
			pos = this._getCircularPos(pos);
			this._triggerChange(pos, false);
			return per;
		},

		_extendOptions : function(options) {
			var key;
			["bounce", "margin", "circular"].forEach(function(v) {
				key = options[v];
				if(key) {
					if(Array.isArray(key) ) {
						if( key.length === 2) {
							options[v] = [ key[0], key[1], key[0], key[1] ];
						} else {
							options[v] = [ key[0], key[1], key[2], key[3] ];
						}
					} else if(/string|number/.test(typeof key) ) {
						options[v] = [ key, key, key, key ];
					} else {
						delete options[v];
					}
				}
			});
			$.extend(this.options, options);
		},

		_triggerChange : function(pos, holding) {
			this.trigger("change", {
				pos : [ pos[0], pos[1] ],
				holding : holding
			});
		},

		destruct : function() {
			for(var p in this._hammers) {
				this._hammers[p].destroy();
				delete this._hammers[p];
			}
		}
	});
	ns.MovableCoord.KEY = "__MOVABLECOORD__";
})(jQuery, eg);