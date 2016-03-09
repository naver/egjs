/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/
eg.module("pauseResume", ["jQuery"], function($) {
	"use strict";

	var animateFn = $.fn.animate;
	var stopFn = $.fn.stop;
	var uuid = 1;

	function now() {
		return new Date().getTime();
	}

	function AniProperty(prop, optall, prevProp, isFirst) {
		this.opt = optall;
		this.start = -1;
		this.elapsed = 0;
		this.paused = false;
		this.uuid = uuid++;
		this.easingNames = [];
		this.prop = isFirst ? {} : $.extend({}, prevProp);

		for (var propName in prop) {
			var propValue = prop[propName];
			var markIndex;

			//If it has a absoulte value.
			if (typeof(propValue) !== "string" ||
				(markIndex = propValue.search(/[+|-]=/)) < 0) {
				this.prop[propName] = propValue;
				continue;
			}

			var sign = propValue.charAt(markIndex) === "-" ? -1 : 1;

			//If it has a relative value
			this.prop[propName] = propValue
				.replace(/([-|+])*([\d|\.])+/g,
					generateAbsoluteValMaker(prevProp, propName, sign))
				.replace(/[-|+]+=/g, "");
		}
	}

	/**
	 * Generate a new absolute value maker.
	 *
	 * function to avoid JS Hint error "Don't make functions within a loop"
	 */
	function generateAbsoluteValMaker(prevProp, propName, sign) {
		return function absoluteValMaker(match) {
			var currValue = prevProp[propName] ? parseFloat(prevProp[propName]) : 0;
			return currValue + Number(match) * sign;
		};
	}

	AniProperty.prototype.init = function() {
		this.start = now();
		this.elapsed = 0;
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

	function addAniProperty(el, prop, optall) {
		var prevProp;
		var propCount = el.__aniProps ? el.__aniProps.length : 0;
		var isFirst = false;

		if (propCount === 0) {
			prevProp = el.style;
			isFirst = true;
		} else {
			prevProp = el.__aniProps[propCount - 1].prop;
		}

		var newProp = new AniProperty(prop, optall, prevProp, isFirst);
		el.__aniProps = el.__aniProps || [];

		//Animation is excuted immediately.
		if (el.__aniProps.length === 0) {
			newProp.init();
		}
		el.__aniProps.push(newProp);
	}

	function getOptAll(speed, easing, fn) {
		var opt = speed && typeof speed === "object" ?
		jQuery.extend({}, speed) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction(speed) && speed,
			duration: speed,
			easing: fn && easing ||
					easing && !jQuery.isFunction(easing) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ?
			opt.duration : opt.duration in jQuery.fx.speeds ?
				jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

		// normalize opt.queue - true/undefined/null -> "fx"
		if (opt.queue == null || opt.queue === true) {
			opt.queue = "fx";
		}

		return opt;
	}

	$.fn.animate = function(prop, speed, easing, callback) {
		return this.each(function() {
			//optall should be made for each elements.
			var optall = getOptAll(speed, easing, callback);
			var orginalComplete = optall.complete;

			//Override to check current animation is done.
			optall.complete = function() {
				//Dequeue animation property that was ended.
				var removeProp = this.__aniProps.shift();
				removeProp.clearEasingFn();

				// console.log("ani complete, shift prop:", removeProp);
				this.__aniProps[0] && this.__aniProps[0].init();
				if (orginalComplete && typeof(orginalComplete) === "function") {
					orginalComplete.call(this);
				}
			};

			//Queue animation property to recover the current animation.
			addAniProperty(this, prop, optall);
			animateFn.call($(this), prop, optall);
		});

		// TODO: Below code is more reasonable?
		// return animateFn.call(this, prop, optall); // and declare optall at outside this.each loop.
	};

	$.fn.pause = function() {
		// console.warn("===========PAUSE==============");
		return this.each(function() {
			var p;
			var type = "fx";

			if (!this.__aniProps) {
				// console.warn("Current element doesn't have animation information. Check 'animate' is applied to this element.");
				return;
			}

			if (this.__aniProps.length === 0 || this.__aniProps[0].paused) {
				return;
			}

			//Clear fx-queue except 1 dummy function
			//for promise not to be expired when calling stop()
			$.queue(this, type || "fx", [dummy]);
			stopFn.call($(this));

			//Remember current animation property
			if (p = this.__aniProps[0]) {
				p.elapsed += now() - p.start;
				p.paused = true;
			}
		});
	};

	function dummy() {
		//console.log("It is called immediately after pause() is called!");
	}

	$.fn.resume = function() {
		// console.warn("===========RESUME==============");
		return this.each(function() {
			var type = "fx";
			var p;
			var i;

			if (!this.__aniProps) {
				// console.warn("Current element doesn't have animation information. Check 'animate' is applied to this element.");
				return;
			}

			if (this.__aniProps.length === 0 || !this.__aniProps[0].paused) {
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
					animateFn.call($(this), p.prop, p.opt);
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
				return;
			}

			//If clearQueue is requested,
			//then all properties must be initialized
			//for element not to be resumed.
			while (p = this.__aniProps.shift()) {
				p.clearEasingFn();
			}
			this.__aniProps = [];
		});
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
