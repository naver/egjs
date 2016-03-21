/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/
eg.module("pauseResume", ["jQuery"], function($) {
	"use strict";

	var animateFn = $.fn.animate;
	var stopFn = $.fn.stop;
	var uuid = 1;
	var getStyles;

	if (window.getComputedStyle) {
		getStyles = function(elem) {
			var view = elem.ownerDocument.defaultView;

			if (!view || !view.opener) {
				view = window;
			}

			return view.getComputedStyle(elem);
		};
	} else if (document.documentElement.currentStyle) {
		getStyles = function(elem) {
			return elem.currentStyle;
		};
	}

	function AniProperty(el, prop, optall, prevProp) {
		this.opt = optall;
		this.start = -1;
		this.elapsed = 0;
		this.paused = false;
		this.uuid = uuid++;
		this.easingNames = [];
		this.prop = $.extend({}, prevProp);
		var computed;//It's only used when relative value is applied.

		for (var propName in prop) {
			var propValue = prop[propName];
			var markIndex;
			var sign;

			//If it has a absoulte value.
			if (typeof propValue !== "string" ||
				(markIndex = propValue.search(/[+|-]=/)) < 0) {
				this.prop[propName] = propValue;
				continue;
			}

			//If it has a relative value
			sign = propValue.charAt(markIndex) === "-" ? -1 : 1;

			if (!prevProp[propName]) {
				// If this makes performance issues, then change the way of calucating relative value.
				computed = computed || getStyles(el);
				prevProp[propName] = computed[propName];
			}

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
			var prevValue = prevProp[propName];

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
		this.start = $.now();
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
		var newProp;

		prevProp = propCount === 0 ? {} : el.__aniProps[propCount - 1].prop;

		//prevProp is used for calculating absolute value by accumulating aniProps.
		//So newProp has absolute value accumlated.
		newProp = new AniProperty(el, prop, optall, prevProp);
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

				this.__aniProps[0] && this.__aniProps[0].init();
				if (orginalComplete && typeof orginalComplete === "function") {
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
	 * Pause animation
	 * @ko 에니메이션을 일시 정지한다
	 *
	 * @name jQuery#pause
	 * @method
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
	 *
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
		return getStatus(elem) === "paused" ? true : false;
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
