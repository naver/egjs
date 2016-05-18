/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/
eg.module("pauseResume", ["jQuery"], function($) {
	"use strict";

	var animateFn = $.fn.animate;
	var stopFn = $.fn.stop;
	var delayFn = $.fn.delay;
	var uuid = 1;

	function AniProperty(type, el, prop, optall) {
		this.el = el;
		this.opt = optall;
		this.start = -1;
		this.elapsed = 0;
		this.paused = false;
		this.uuid = uuid++;
		this.easingNames = [];
		this.prop = prop;
		this.type = type;
	}

	/**
	 * Generate a new absolute value maker.
	 *
	 * function to avoid JS Hint error "Don't make functions within a loop"
	 */
	function generateAbsoluteValMaker(prevValue, propName, sign) {
		return function absoluteValMaker(match) {
			if (!prevValue || prevValue === "auto") {
				// Empty strings, null, undefined and "auto" are converted to 0.
				// This solution is somewhat extracted from jQuery Tween.propHooks._default.get
				// TODO: Should we consider adopting a Tween.propHooks?
				prevValue = 0;
			} else {
				prevValue = parseFloat(prevValue);
			}
			return prevValue + (match * sign);
		};
	}

	AniProperty.prototype.init = function() {
		var currValue;
		this.start = $.now();
		this.elapsed = 0;

		for (var propName in this.prop) {
			var propValue = this.prop[propName];
			var markIndex;
			var sign;

			//If it has a absoulte value.
			if (typeof propValue !== "string" ||
				(markIndex = propValue.search(/[+|-]=/)) < 0) {
				// this.prop[propName] = propValue;
				continue;
			}

			//If it has a relative value
			sign = propValue.charAt(markIndex) === "-" ? -1 : 1;

			// Current value
			currValue = $.css(this.el, propName);

			// CurrValue + (relativeValue)
			this.prop[propName] = propValue
				.replace(/([-|+])*([\d|\.])+/g,
					generateAbsoluteValMaker(currValue, propName, sign))
				.replace(/[-|+]+=/g, "");
		}
	};

	AniProperty.prototype.addEasingFn = function(easingName) {
		this.easingNames.push(easingName);
	};

	AniProperty.prototype.clearEasingFn = function() {
		var easing;
		while (easing = this.easingNames.shift()) {
			delete $.easing[easing];
		}
		this.easingNames = [];
	};

	function addAniProperty(type, el, prop, optall) {
		var newProp;

		newProp = new AniProperty(type, el, prop, optall);
		el.__aniProps = el.__aniProps || [];

		//Animation is excuted immediately.
		if (el.__aniProps.length === 0) {
			newProp.init();
		}
		el.__aniProps.push(newProp);
	}

	function removeAniProperty(el) {
		var removeProp = el.__aniProps.shift();
		removeProp && removeProp.clearEasingFn();

		el.__aniProps[0] && el.__aniProps[0].init();
	}

	$.fn.animate = function(prop, speed, easing, callback) {
		return this.each(function() {
			//optall should be made for each elements.
			var optall = $.speed(speed, easing, callback);
			var userCallback = optall.old;//hook a user callback.

			//Override to check current animation is done.
			optall.complete = function() {
				//Dequeue animation property that was ended.
				var removeProp = this.__aniProps.shift();
				removeProp.clearEasingFn();

				// Callback should be called before aniProps.init()
				if (userCallback && typeof userCallback === "function") {
					userCallback.call(this);
				}

				// If next ani property exists
				this.__aniProps[0] && this.__aniProps[0].init();
			};

			//Queue animation property to recover the current animation.
			addAniProperty("animate", this, prop, optall);
			animateFn.call($(this), prop, optall);
		});

		// TODO: Below code is more reasonable?
		// return animateFn.call(this, prop, optall); // and declare optall at outside this.each loop.
	};

	// Check if this element can be paused/resume.
	function getStatus(el) {
		if (!el.__aniProps || el.__aniProps.length === 0) {
			// Current element doesn't have animation information.
			// Check 'animate' is applied to this element.
			return "empty";
		}

		return el.__aniProps[0].paused ? "paused" : "inprogress";
	}

	/**
	 * Set a timer to delay execution of subsequent items in the queue.
	 * And it internally manages "fx"queue to support pause/resume if "fx" type.
	 *
	 * @param {Number} An integer indicating the number of milliseconds to delay execution of the next item in the queue.
	 * @param {String} A string containing the name of the queue. Defaults to fx, the standard effects queue.
	 */
	$.fn.delay = function(time, type) {
		var t;
		var isCallByResume = arguments[2];//internal used value.

		if (type && type !== "fx") {
			return delayFn.call(this, time, type);
		}

		t = parseInt(time, 10);
		t = isNaN(t) ? 0 : t;

		return this.each(function() {
			if (!isCallByResume) {
				// Queue delay property to recover the current animation.
				// Don't add property when delay is called by resume.
				addAniProperty("delay", this, null, {duration: t});
			}

			var self = this;
			delayFn.call($(this), time).queue(function(next) {
				next();

				// Remove delay property when delay has been expired.
				removeAniProperty(self);
			});
		});
	};

	/**
	 * Pause animation
	 * @ko 에니메이션을 일시 정지한다
	 *
	 * @name jQuery#pause
	 * @method
	 * @support {"ie": "10+", "ch" : "latest", "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
	 * @example
	 * $("#box").pause(); //paused the current animation
	 */
	$.fn.pause = function() {
		return this.each(function() {
			var p;
			var type = "fx";

			if (getStatus(this) !== "inprogress") {
				return;
			}

			//Clear fx-queue except 1 dummy function
			//for promise not to be expired when calling stop()
			$.queue(this, type || "fx", [$.noop]);
			stopFn.call($(this));

			//Remember current animation property
			if (p = this.__aniProps[0]) {
				p.elapsed += $.now() - p.start;
				p.paused = true;
			}
		});
	};

	/**
	 * Resume animation
	 * @ko 애니메이션을 재개한다
	 *
	 * @name jQuery#resume
	 * @method
	 * @support {"ie": "10+", "ch" : "latest", "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
	 * @example
	 * $("#box").resume(); //resume the paused animation
	 */
	$.fn.resume = function() {
		return this.each(function() {
			var type = "fx";
			var p;
			var i;

			if (getStatus(this) !== "paused") {
				return;
			}

			//Clear fx-queue,
			//And this queue will be initialized by animate call.
			$.queue(this, type || "fx", []);

			// Restore __aniProps
			i = 0;
			while (p = this.__aniProps[i]) {
				// Restore easing status
				if (p.elapsed > 0 && p.opt.easing) {
					var resumePercent = p.elapsed / p.opt.duration;
					var remainPercent = 1 - resumePercent;
					var originalEasing = $.easing[p.opt.easing];
					var startEasingValue = originalEasing(resumePercent);
					var scale = scaler([startEasingValue, 1], [0, 1]);
					var newEasingName = p.opt.easing + "_" + p.uuid;

					// Make new easing function that continues from pause point.
					$.easing[newEasingName] = generateNewEasingFunc(
						resumePercent, remainPercent, scale, originalEasing);
					p.opt.easing = newEasingName;

					//Store new easing function to clear it later.
					p.addEasingFn(newEasingName);
				}

				p.paused = false;
				p.opt.duration -= p.elapsed;

				// If duration remains, request 'animate' with storing aniProps
				if (p.opt.duration > 0 || p.elapsed === 0) {
					i === 0 && p.init();

					if (p.type === "delay") {
						// pass last parameter 'true' not to add an aniProperty.
						$(this).delay(p.opt.duration, "fx", true);
					} else {
						animateFn.call($(this), p.prop, p.opt);
					}
				}

				i++;
			}
		});
	};

	/**
	 * Generate a new easing function.
	 *
	 * function to avoid JS Hint error "Don't make functions within a loop"
	 */
	function generateNewEasingFunc(resumePercent, remainPercent, scale, originalEasing) {
		return function easingFunc(percent) {
			var newPercent = resumePercent + remainPercent * percent;
			return scale(originalEasing(newPercent));
		};
	}

	$.fn.stop = function(type, clearQueue) {
		var clearQ = clearQueue;
		stopFn.apply(this, arguments);

		if (typeof type !== "string") {
			clearQ = type;
		}

		return this.each(function() {
			var p;

			if (!clearQ) {
				p = this.__aniProps.shift();
				p && p.clearEasingFn();
			} else {
				//If clearQueue is requested,
				//then all properties must be initialized
				//for element not to be resumed.
				while (p = this.__aniProps.shift()) {
					p.clearEasingFn();
				}
				this.__aniProps = [];
			}
		});
	};

	jQuery.expr.filters.paused = function(elem) {
		return getStatus(elem) === "paused";
	};

	//Adopt linear scale from d3
	function scaler(domain, range) {
		var u = uninterpolateNumber(domain[0], domain[1]);
		var i = interpolateNumber(range[0], range[1]);

		return function(x) {
			return i(u(x));
		};
	}

	function interpolateNumber(a, b) {
		a = +a, b = +b;
		return function(t) {
			return a * (1 - t) + b * t;
		};
	}

	function uninterpolateNumber(a, b) {
		b = (b -= a = +a) || 1 / b;
		return function(x) {
			return (x - a) / b;
		};
	}
});
