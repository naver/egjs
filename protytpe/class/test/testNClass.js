QUnit.test( "Class instance create test", function( assert ) {
  //assert.ok( 1 == "1", "Passed!" );
  var A = Class({
  	constructor : function() {
  		this.a = 1;
  		this.b = 2;
  		this.c = 3;
  	},
  	set : function(a, b, c) {
  		this.a = a;
  		this.b = b;
  		this.c = c;
  	},
  	sum : function() {
  		return this.a + this.b + this.c;
  	}
  });

  var a = new A();
  var b = new A();
  var c = new A();

  b.set(4, 5, 6);
  c.set(7, 8, 9);

  assert.ok(a.sum() == 6);
  assert.ok(b.sum() == 15);
  assert.ok(c.sum() == 24);
});

QUnit.test( "Class extends basic test", function( assert ) {
  //assert.ok( 1 == "1", "Passed!" );
  var A = Class({
  	constructor : function() {
  		this.a = 1;
  		this.b = 2;
  		this.c = 3;
  	},
  	set : function(a, b, c) {
  		this.a = a;
  		this.b = b;
  		this.c = c;
  	},
  	sum : function() {
  		return this.a + this.b + this.c;
  	}
  });

  var B = Class.extends(A, {
  	constructor : function() {
  		this.a = 4;
  		this.b = 5;
  		this.c = 6;
  	},
  	multi : function() {
  		return this.a * this.b * this.c;
  	}
  });
  
  var a = new A();
  var b = new B();

  assert.ok(b.sum() == 15);
  assert.ok(a.sum() == 6);
  assert.ok(b.multi() == 120);

  b.set(1, 2, 3);
  assert.ok(b.multi() == 6);
  assert.throws(
  	function() {
  		a.multi();
  	},
  	function( err ) {
      //return err.message.toString() === "undefined is not a function";
      return err.name.toString() === "TypeError";
    },
    "Class A does not have a function - multi()"
  );
});

QUnit.test( " Multiple extends test ", function( assert ) {
  //assert.ok( 1 == "1", "Passed!" );
  var A = Class({
  	constructor : function() {
  		this.a = 1;
  		this.b = 2;
  		this.c = 3;
  	},
  	set : function(a, b, c) {
  		this.a = a;
  		this.b = b;
  		this.c = c;
  	},
  	sum : function() {
  		return this.a + this.b + this.c;
  	},
  	diff : function() {
  		return this.c - this.b - this.a;
  	}
  });

  var B = Class.extends(A, {
  	constructor : function() {

  	},
  	sum : function() {
  		return this.a + this.b + this.c + 1;
  	},
  	multi : function() {
  		return this.a * this.b * this.c;
  	}
  });

  var C = Class.extends(B, {
  	constructor : function() {
  		
  	},
  	div : function() {
  		return this.c / this.b;
  	}
  });

  var c = new C();
  assert.ok( c.sum() == 7, "parent method call Passed" );
  assert.ok( c.diff() == 0, "grand parent method call Passed" );
  assert.ok( c.div() == 1.5, "Passed" );
  c.set(4, 5, 6);
  assert.ok( c.multi() == 120, "apply change of instance variable values.")
});


QUnit.test( " super class test ", function( assert ) {
  var A = Class({
  	constructor : function() {
  		this.a = 1;
  		this.b = 2;
  		this.c = 3;
  	},
  	set : function(a, b, c) {
  		this.a = a;
  		this.b = b;
  		this.c = c;
  	},
  	sum : function() {
  		return this.a + this.b + this.c;
  	},
  	diff : function() {
  		return this.c - this.b - this.a;
  	}
  });

  var B = Class.extends(A, {
  	constructor : function() {

  	},
  	sum : function() {
  		return  B.super.sum.call(this) + 1;
  	},
  	multi : function() {
  		return this.a * this.b * this.c;
  	}
  });

  var C = Class.extends(B, {
  	constructor : function() {
  		
  	},
  	sum : function() {
  		return C.super.sum.call(this);
  	},
  	div : function() {
  		return this.c / this.b;
  	}
  });

  var c = new C();
  assert.ok(c.sum() == 7, "super class function call");
});

QUnit.test( "Member variable define type change ", function( assert ) {
  var A = Class({
  	a : 1,
  	b : 2, 
  	c : 3,
  	sum : function() {
  		return this.a + this.b + this.c;
  	}
  });

  var B = Class.extends(A, {
  	constructor : function() {
  		this.a = 4;
  		this.b = 5;
  	}
  });

  var a = (new A()).sum();
  var b = (new B()).sum();

  assert.ok( a == 6 && b == 12, "Passed" );
});

QUnit.test( "constructor parameter passing", function( assert ) {
  //assert.ok( 1 == "1", "Passed!" );
  var A = Class({
  	constructor : function(a, b, c) {
  		this.a = a;
  		this.b = b;
  		this.c = c;
  	},
  	sum : function() {
  		return this.a + this.b + this.c;
  	}
  });

  var B = Class.extends(A, {
  });

  var b = new B(10, 11, 12);
  
  assert.ok( b.sum() == 33, "pass that B Class without a constructor passes parameter to A constructor" );
});

QUnit.test( "undefined constructor", function( assert ) {
  //assert.ok( 1 == "1", "Passed!" );
  var A = Class({
  	a : 1,
  	b : 2, 
  	c : 3,
  	sum : function() {
  		return this.a + this.b + this.c;
  	}
  });

  var B = Class.extends(A, {
  	a : 10,
  	b : 20
  });

  var a = (new A()).sum();
  var b = (new B()).sum();

  assert.ok( a == 6 && b == 33, "Passed" );
});

QUnit.test( "Order of constructor call and derived method call", function( assert ) {
	/**
	 * 모든 메시지가 순차적으로 출력되는지 확인
	 */
	var methodTimes = 0;
	var constructTimes = 0;
	var NaverBase = Class({
		bah: function () {
			assert.ok( ++methodTimes == 1 , "called Base method first" );
	    }
	});

	var NaverSub1 = Class.extends(NaverBase, {
		constructor : function() {
			assert.ok(++constructTimes == 1, 'called Sub1 constructor first');
		},
		bah: function() {
	      	NaverSub1.super.bah.call(this);
	      	assert.ok(++methodTimes == 2, 'called Sub1 method second');
	    }
	});

	var NaverSub2 = Class.extends(NaverSub1, {
	  constructor : function() {
	  	assert.ok(++constructTimes == 2, 'called Sub2 constructor second');
	  },
	  bah : function() {
	  	NaverSub2.super.bah.call(this);
	  	assert.ok(++methodTimes == 3, 'called Sub2 method third');
	  }
	});

	(new NaverSub2()).bah();
});