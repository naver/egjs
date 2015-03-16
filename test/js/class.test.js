QUnit.test( "Class instance create test", function( assert ) {
  //assert.ok( 1 == "1", "Passed!" );
  var A = eg.Class({
  	construct : function() {
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

  assert.strictEqual(a.sum(), 6, "Each instance of same Class has a each memory space");
  assert.strictEqual(b.sum(), 15, "Each instance of same Class has a each memory space");
  assert.strictEqual(c.sum(), 24, "Each instance of same Class has a each memory space");
});

QUnit.test( "Class extend basic test", function( assert ) {
  //assert.ok( 1 == "1", "Passed!" );
  var A = eg.Class({
  	construct : function() {
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

  var B = eg.Class.extend(A, {
  	construct : function() {
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

  assert.strictEqual(b.sum(), 15, "A Class constructor initialized values successfully");
  assert.strictEqual(a.sum(), 6, "B Class constructor initialized values successfully");
  assert.strictEqual(b.multi(), 120, "B Class has its own method.");

  b.set(1, 2, 3);
  assert.strictEqual(b.multi(), 6, "Changed properties of B instance successfully");
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

QUnit.test( " Multiple extend test ", function( assert ) {
  //assert.ok( 1 == "1", "Passed!" );
  var A = eg.Class({
  	construct : function() {
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

  var B = eg.Class.extend(A, {
  	construct : function() {

  	},
  	sum : function() {
  		return this.a + this.b + this.c + 1;
  	},
  	multi : function() {
  		return this.a * this.b * this.c;
  	}
  });

  var C = eg.Class.extend(B, {
  	construct : function() {
  		
  	},
  	div : function() {
  		return this.c / this.b;
  	}
  });

  var c = new C();
  assert.strictEqual( c.sum(), 7, "parent method call Passed" );
  assert.strictEqual( c.diff(), 0, "grand parent method call Passed" );
  assert.strictEqual( c.div(), 1.5, "Passed" );
  c.set(4, 5, 6);
  assert.strictEqual( c.multi(), 120, "apply change of instance variable values.")
});


QUnit.test( " $super Class test ", function( assert ) {
  var A = eg.Class({
  	construct : function() {
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

  var B = eg.Class.extend(A, {
  	construct : function() {

  	},
  	sum : function() {
  		return  B.$super.sum.call(this) + 1;
  	},
  	multi : function() {
  		return this.a * this.b * this.c;
  	}
  });

  var C = eg.Class.extend(B, {
  	construct : function() {
  		
  	},
  	sum : function() {
  		return C.$super.sum.call(this);
  	},
  	div : function() {
  		return this.c / this.b;
  	}
  });

  var c = new C();
  assert.strictEqual(c.sum(), 7, "$super Class function call");
});

QUnit.test( "Member variable define type change ", function( assert ) {
  var A = eg.Class({
  	a : 1,
  	b : 2, 
  	c : 3,
  	sum : function() {
  		return this.a + this.b + this.c;
  	}
  });

  var B = eg.Class.extend(A, {
  	construct : function() {
  		this.a = 4;
  		this.b = 5;
  	}
  });

  var a = (new A()).sum();
  var b = (new B()).sum();

  assert.strictEqual(a, 6, "Set member variable of A by property setting successfully");
  assert.strictEqual(b, 12, "Set member variable of A by property setting successfully");
});

QUnit.test( "constructor parameter passing", function( assert ) {
  //assert.ok( 1 == "1", "Passed!" );
  var A = eg.Class({
  	construct : function(a, b, c) {
  		this.a = a;
  		this.b = b;
  		this.c = c;
  	},
  	sum : function() {
  		return this.a + this.b + this.c;
  	}
  });

  var B = eg.Class.extend(A, {
  });

  var b = new B(10, 11, 12);
  
  assert.strictEqual( b.sum(), 33, "pass that B Class without a constructor passes parameter to A constructor" );
});

QUnit.test( "undefined constructor", function( assert ) {
  //assert.ok( 1 == "1", "Passed!" );
  var A = eg.Class({
  	a : 1,
  	b : 2, 
  	c : 3,
  	sum : function() {
  		return this.a + this.b + this.c;
  	}
  });

  var B = eg.Class.extend(A, {
  	a : 10,
  	b : 20
  });

  var a = (new A()).sum();
  var b = (new B()).sum();

  assert.strictEqual( a, 6, "Member value setting without constructor is success." );
  assert.strictEqual( b, 33, "Member value setting without constructor is success." );
});

QUnit.test( "Order of constructor call and derived method call", function( assert ) {
	/**
	 * 모든 메시지가 순차적으로 출력되는지 확인
	 */
	var methodTimes = 0;
	var constructTimes = 0;
	var NaverBase = eg.Class({
		bah: function () {
			assert.strictEqual( ++methodTimes, 1 , "called Base method first" );
	    }
	});

	var NaverSub1 = eg.Class.extend(NaverBase, {
		construct : function() {
			assert.strictEqual(++constructTimes, 1, 'called Sub1 constructor first');
		},
		bah: function() {
	      	NaverSub1.$super.bah.call(this);
	      	assert.strictEqual(++methodTimes, 2, 'called Sub1 method second');
	    }
	});

	var NaverSub2 = eg.Class.extend(NaverSub1, {
	  construct : function() {
	  	assert.strictEqual(++constructTimes, 2, 'called Sub2 constructor second');
	  },
	  bah : function() {
	  	NaverSub2.$super.bah.call(this);
	  	assert.strictEqual(++methodTimes, 3, 'called Sub2 method third');
	  }
	});

	(new NaverSub2()).bah();
});