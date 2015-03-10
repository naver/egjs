console.log("========== Naver Class ============")

var NaverParent = Class({
	a: 100,
	b: 200,
	c: 300,
	"constructor" : function() {
		console.log("NaverParent")
		this.myValue = 10;
	},
	sum: function () {
		return this.a + this.b;
	},
	getMyValue : function() {
		return this.myValue;
	}
});

var NaverChild = Class({
	a: 10,
	b: 20,
	constructor : function() {
		console.log("NaverChild")
		this.myValue = 20;
	},
	sum: function () {
		return NaverChild.super.sum.call(this);
	},
	getMyValue : function() {
		return NaverChild.super.getMyValue.call(this);
	},
	setMyValue : function(val) {
		this.myValue = val + 1;
	}
}).extends(NaverParent);

var NaverChild2 = Class({
	"constructor" : function() {
		console.log("NaverChild2")
	},
	sum: function () {
		return NaverChild2.super.sum.call(this);
	},
	getMyValue : function() {
		return NaverChild2.super.getMyValue.call(this);
	},
	setMyValue : function(val) {
		this.myValue = val;
	}
}).extends(NaverChild);

var oNaverChild = new NaverChild();

console.log(oNaverChild.sum()); // 30
console.log(oNaverChild.getMyValue()); // 20

var oNaverChild2 = new NaverChild2();

console.log(oNaverChild2.sum()); // 30
console.log(oNaverChild2.getMyValue()); // 30
oNaverChild2.setMyValue(55)

//정상적으로 값이 변경되는지 확인
console.log(oNaverChild2.getMyValue()); // 55

//this.value 가 인스턴스 별로 잘 할당되는지 확인
var oNaverChild2_2 = new NaverChild2();
console.log(oNaverChild2_2.getMyValue()); // 20


oNaverChild.setMyValue(111);
console.log(oNaverChild.getMyValue());//112

oNaverChild2_2.setMyValue(111);
console.log(oNaverChild2_2.getMyValue());//111

console.log(oNaverChild2.getMyValue());

/**
 * this.num 값 설정이 잘되는지 확인
 */
 // Super class
var NaverSuper = Class({
  constructor: function(num) {
  	console.log("Super constructor:" + num);
    this.num = num;
  },
  increment: function() {
    return this.num + 1;
  }
});
// Sub Class
var NaverSub = Class({
  constructor: function(num) {
  },
  increment: function() {
    return NaverSub.super.increment.call(this);
  }
}).extends(NaverSuper);
var oNaverSub = new NaverSub(0);

/**
 * 모든 메시지가 순차적으로 출력되는지 확인
 */
var methodTimes = 0;
var constructTimes = 0;
var NaverBase = Class({
	bah: function () {
      	if (++methodTimes == 1) {
			console.log('called Base method first');
		}
    }
});

var NaverSub1 = Class({
	constructor : function() {
		if (++constructTimes == 1) {
			console.log('called Sub1 constructor first');
		}
	},
	bah: function() {
      	NaverSub1.super.bah.call(this);
      	if (++methodTimes == 2) {
			console.log('called Sub1 method second');
		}
    }
}).extends(NaverBase);

var NaverSub2 = Class({
  constructor : function() {
  	if (++constructTimes == 2) {
  		console.log("called Sub2 constructor second")
  	}
  },
  bah : function() {
  	NaverSub2.super.bah.call(this);
      if (++methodTimes == 3) {
      	console.log('called Sub2 method third');
      }
  }
}).extends(NaverSub1);

(new NaverSub2()).bah();