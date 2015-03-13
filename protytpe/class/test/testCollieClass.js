console.log("========== Collie Class ============")
var CollieParent = collie.Class({
	a: 100,
	b: 200,
	c: 300,
	$init : function() {
		this.myValue = 10;
	},
	sum2: function () {
		var init = this.sum();
		return init;
	},
	sum: function () {
		return this.a + this.b;
	},
	getMyValue : function() {
		return this.myValue;
	}
});

var CollieChild = collie.Class({
	a: 10,
	b: 20,
	$init : function() {
		this.myValue = 20;
	},
	sum2: function () {
		var init = this.sum();
		return init;
	},
	sum: function () {
		return this.constructor.$super.sum.call(this);
	},
	getMyValue : function() {
		return this.constructor.$super.getMyValue.call(this);
	}
}, CollieParent);

// var CollieChild2 = collie.Class({
// 	sum: function () {
// 		debugger;
// 		return this.constructor.$super.sum.call(this);
// 	}
// }, CollieChild);

var oCollieChild = new CollieChild();

console.log(oCollieChild.sum()); // 20