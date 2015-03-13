console.log("========== JsFace ============")

var FaceParent = Class({
	a: 100,
	b: 200,
	c: 300,
	constructor : function() {
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

var FaceChild = Class(FaceParent, {
	a: 10,
	b: 20,
	constructor : function() {
		this.myValue = 20;
	},
	sum2: function () {
		var init = this.sum();
		return init;
	},
	sum: function () {
		return FaceChild.$superp.sum.call(this);
	},
	getMyValue : function() {
		return FaceChild.$superp.getMyValue.call(this);
	}
});

var FaceChild2 = Class(FaceChild, {
	sum: function () {
		return FaceChild2.$superp.sum.call(this);
	}
});

var oFChild = new FaceChild();

console.log(oFChild.sum()); // 20
console.log(oFChild.sum2()); // 20
console.log(oFChild.getMyValue()); // 20

var oFChild2 = new FaceChild2();
console.log(oFChild2.sum()); // 20