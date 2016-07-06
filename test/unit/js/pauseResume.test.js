/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

// jscs:disable
// to resolve transform style value
QUnit.config.reorder = false;

var hooks = {
	beforeEach: function() {
		this.$el = $("#box1");
		delete this.$el[0].__aniProps;
	},
	afterEach: function() {
		this.$el.css({"left": 0});
	}
};

module("Initialization", hooks);

test("stop on non-animated element", function(assert) {
	// Given
	// When
	this.$el.stop();

	// Then
	ok(true, "stop() is called successfully without script errors.");
});

test("stop on animated element", function(assert) {
	var done = assert.async();
	var duration = 3000;
	var stopTime = 500;

	// Given
	this.$el
		.animate({"left": "100px"}, duration)

	// When
	setTimeout($.proxy(function() {
		// Call stop
		this.$el.stop();

		//Then
		ok(true, "stop called successfully");
		done();
	}, this), stopTime);
});

test("pause", function(assert) {
	var done = assert.async();

	// Given
	var destLeft = 200;
	var duration = 1000;
	var prevLeft;
	this.$el.animate({"left": destLeft}, duration, "linear");

	// When
	setTimeout($.proxy(function() {
		this.$el.stop();

		prevLeft = parseFloat(this.$el.css("left"));
	}, this), duration / 2);

	//Then
	setTimeout($.proxy(function() {
		equal(prevLeft, parseFloat(this.$el.css("left")), "It is not moved after paused.");
		//if status is paused, fx-queue will be "inprogress".
		this.$el.stop();
		done();
	}, this), duration);
});

test("resume", function(assert) {
	var done = assert.async();

	// Given
	var destLeft = 200;
	var duration = 400;
	var pauseAfter = duration / 2;
	var pauseDuration = duration / 2;
	this.$el.animate({"left": destLeft}, duration);

	// When
	setTimeout($.proxy(function() {
		this.$el.pause();
	}, this), pauseAfter);

	setTimeout($.proxy(function() {
		this.$el.resume();
	}, this), pauseDuration);

	//Then
	setTimeout($.proxy(function() {
		equal(parseFloat(this.$el.css("left")), destLeft, "The box is moved to destination after resumed.");
		done();
	}, this), duration + pauseDuration);
});

test("chaining", function(assert) {
	var done = assert.async();

	// Given
	var destLeft = [200, 400, 600];
	var duration = 300;
	var totalDuration = duration * 3;
	var pauseAfter = 100;
	var pauseDuration = 100;

	this.$el
		.animate({"left": destLeft[0]}, duration)
		.animate({"left": destLeft[1]}, duration)
		.animate({"left": destLeft[2]}, duration)

	// When
	setTimeout($.proxy(function() {
		this.$el.pause();
	}, this), pauseAfter);

	setTimeout($.proxy(function() {
		this.$el.resume();
	}, this), pauseDuration);

	//Then
	setTimeout($.proxy(function() {
		equal(parseFloat(this.$el.css("left")), destLeft[2], "The box is moved to destination after resumed.");
		done();
	}, this), totalDuration + pauseDuration);
});

test("relative values", function(assert) {
	var done = assert.async();

	// Given
	var destLeft = ["+=100", "+=100", "+=100"];
	var duration = 300;
	var totalDuration = duration * 3;
	var pauseAfter = 100;
	var pauseDuration = 100;

	this.$el
		.animate({"left": destLeft[0]}, duration)
		.animate({"left": destLeft[1]}, duration)
		.animate({"left": destLeft[2]}, duration)

	// When
	setTimeout($.proxy(function() {
		this.$el.pause();
		setTimeout($.proxy(function() {
			this.$el.resume();
		}, this), pauseDuration);
	}, this), pauseAfter);

	//Then
	setTimeout($.proxy(function() {
		equal(parseFloat(this.$el.css("left")), 300, "The box is moved to destination after resumed.");
		done();
	}, this), totalDuration + pauseAfter + pauseDuration);
});

test("external css style and relative value test", function(assert) {
	var done = assert.async();
	var pauseAfter = 100;
	var pauseDuration = 10;

	// Given
	// Check if 'before value' is obtained well when applied relative value.
	this.$el
		.removeAttr("style")
		.removeClass("box")
		.addClass("otherStyleBox")
		.animate({"left": "+=100px"}) //'.otherStyleBox' style defines initial value of 'left' as 50px, so this animate must make 150px left.
		.animate({"width": "+=100px", "height": "+=50px"}) // width is undefined 

	// When
	setTimeout($.proxy(function() {
		this.$el.pause();

		setTimeout($.proxy(function() {
			this.$el.resume();
		}, this), pauseDuration);
	}, this), pauseAfter);

	//Then
	setTimeout($.proxy(function() {
		equal(parseInt(this.$el.css("left")), 150, "Relative movements on CSS styled element is resumed correctly.");
		equal(this.$el.width(), 100, "Relative sizing width on CSS styled element is resumed correctly.");
		equal(this.$el.height(), 100, "Relative sizing height on CSS styled element is resumed correctly.")
		
		this.$el.removeClass("otherStyleBox").addClass("box");
		done();
	}, this), 1000);
});

test("paused filter test", function(assert) {
	var done = assert.async();
	var duration = 1000;
	var pauseAfter = duration / 2;
	var pauseDuration = 10;
	var margin = 100;
	var pauseCount1 = 0;
	var pauseCount2 = 0;

	// Given
	this.$el
		.animate({"left": "100px"}, duration)

	// When
	setTimeout($.proxy(function() {
		this.$el.pause();

		pauseCount1 = $("#box1:paused").length;

		setTimeout($.proxy(function() {
			this.$el.resume();

			pauseCount2 = $("#box1:paused").length;
		}, this), pauseDuration);
	}, this), pauseAfter);

	//Then
	setTimeout($.proxy(function() {
		equal(pauseCount1, 1, "Getting paused element by paused filter. Must be 1");
		equal(pauseCount2, 0, "Getting resumed element by paused filter. Must be none");

		done();
	}, this), duration + pauseDuration + margin);
});

test("Test relative movent after a value changes on animate chaining", function(assert) {
	var done = assert.async();
	var duration = 1000;
	var pauseAfter = duration / 2;
	var pauseDuration = 10;

	// Given
	this.$el
		.animate({"left": "100px"}, duration, function() {
			/**
			 * This makes an changes.
			 */
			$.style(this, "left", 0);
		})
		.animate({"left": "+=100px"});//MUST move left value based on 0.

	// When
	setTimeout($.proxy(function() {
		this.$el.pause();

		setTimeout($.proxy(function() {
			this.$el.resume();
		}, this), pauseDuration);
	}, this), pauseAfter);

	//Then
	setTimeout($.proxy(function() {
		equal(parseFloat(this.$el.css("left")), 100);
		done();
	}, this), 2000);
});

test("Delay pause/resume test", function(assert) {
	var done = assert.async();
	var duration = 400;
	var delayDuration = 500;
	var pauseAfter = duration + delayDuration / 2;
	var pauseDuration = 1000;
	var elapsedT1 = 0;
	var prevTime = $.now();
	var totalDuration = duration + delayDuration + pauseDuration + duration;

	// Given
	this.$el
		.animate({"left": "100px"}, duration)
		.delay(delayDuration)
		.animate({"left": "150px"}, duration)
		.promise().done(function() {
			elapsedT1 = $.now() - prevTime;
		});

	// When
	// Pause while delay is inprogress.
	setTimeout($.proxy(function() {
		this.$el.pause();

		setTimeout($.proxy(function() {
			this.$el.resume();
		}, this), pauseDuration);
	}, this), pauseAfter);

	//Then
	setTimeout($.proxy(function() {
		ok(elapsedT1 > totalDuration, "delay was successfully paused and resumed.");
		done();
	}, this), totalDuration + totalDuration * 0.2);
});

test("delay on non-animated element test", function(assert) {
	var done = assert.async();
	var t1 = new Date().getTime();
	// Given
	// When
	this.$el.delay(1000).queue(function(next) {
		var t2 = new Date().getTime();
		// Then
		ok((t2-t1) >= 1000, "delay() successfully");
		done();

		//MUST call next() to dequeue the next item. otherwise next item will not be dequeue automatically.
		next();
	});
});
