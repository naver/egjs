console.log("========== Jindo Class ============")

var JindoBase = jindo.$Class({
	a : 100,
	b : 200,
	c : 300,
	"$init" : function() {
		console.log("jindo base created!");
	},
	"foo" : function() {
		console.log("jindo foo");
	},
	"sum" : function() {
		return this.a + this.b;
	},
	"func1" : function() {

	},
	"func2" : function() {
		
	},
	"func3" : function() {
		
	},
	"func4" : function() {
		
	}
});

var JindoDerive = jindo.$Class({
	a : 10,
	b : 20,
	"$init" : function() {
		console.log("jindo derived created!");
	},
	"boo" : function() {
		console.log("jindo boo");	
	},
	"sum" : function() {
		return this.$super.sum() + 5;
	}
}).extend(JindoBase);

var JindoChild = jindo.$Class({
	a : 1,
	b : 2,
	"$init" : function() {
		console.log("jindo child created!");
	},
	"boo" : function() {
		console.log("jindo boo");	
	},
	"sum" : function() {
		return this.$super.sum() + 1;
	}
}).extend(JindoDerive);

var oJindoChild = new JindoChild();
console.log("jindoChild sum : " + oJindoChild.sum());