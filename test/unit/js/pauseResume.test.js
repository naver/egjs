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
	},
	afterEach: function() {
		this.$el.css({"left": 0});
	}
};

module("Initialization", hooks);
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
	var destLeft = ["+=200", "+=200", "+=200"];
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
		equal(parseFloat(this.$el.css("left")), 600, "The box is moved to destination after resumed.");
		done();
	}, this), totalDuration + pauseDuration);
});

