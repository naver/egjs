console.log("========== Klass ============")

var KlassParent = klass({
	a: 100,
		b: 200,
	c: 300,
	sum2: function () {
		var init = this.sum();
		return init;
	},
	sum: function () {
		return this.a + this.b;
	}
});

var KlassChild = KlassParent.extend({
	a: 10,
		b: 20,
	c: 30,
	sum2: function () {
		var init = this.sum();
		return init;
	},
	sum: function () {
		return this.supr();
	}
});

var oKlassChild = new KlassChild();

console.log(oKlassChild.sum()); // 30 -> 부모 클래스의 100(a)과 200(b)대신 자식 클래스의 10(a)과 20(b)을 더한다.
//console.log(oChild.$superp.sum2());
