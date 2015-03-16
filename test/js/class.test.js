test( "Class instance create test", function(  ) {
  //Given
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

  //When
  b.set(4, 5, 6);
  c.set(7, 8, 9);

  var nSumA = a.sum();
  var nSumB = b.sum();
  var nSumC = c.sum();

  //Then
  strictEqual(nSumA, 6, "Each instance of same Class has a each memory space");
  strictEqual(nSumB, 15, "Each instance of same Class has a each memory space");
  strictEqual(nSumC, 24, "Each instance of same Class has a each memory space");
});

test( "Class extend basic test", function(  ) {
  //Given
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

  //When
  var nSumOfB = b.sum();
  var nSumOfA = a.sum();
  var nMultiOfB = b.multi();

  b.set(1, 2, 3);
  var nChangedMultiB = b.multi();

  //Then
  strictEqual(nSumOfB, 15, "A Class constructor initialized values successfully");
  strictEqual(nSumOfA, 6, "B Class constructor initialized values successfully");
  strictEqual(nMultiOfB, 120, "B Class has its own method.");  
  strictEqual(b.multi(), 6, "Changed properties of B instance successfully");
  throws(
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

test( " Multiple extend test ", function(  ) {
  //Given
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

  //When
  var nSumbC = c.sum();
  var nDiffC = c.diff();
  var nDivC = c.div();
  c.set(4, 5, 6);
  var nMultiC = c.multi();

  //Then
  strictEqual( nSumbC, 7, "parent method call Passed" );
  strictEqual( nDiffC, 0, "grand parent method call Passed" );
  strictEqual( nDivC, 1.5, "Passed" );
  strictEqual( nMultiC, 120, "apply change of instance variable values.")
});


test( " $super Class test ", function(  ) {
  //Given
  //When
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
  var nSumC = c.sum();

  //Then
  strictEqual(nSumC, 7, "$super Class function call");
});

test( "Member variable define type change ", function(  ) {
  //Given
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

  //When
  var a = (new A()).sum();
  var b = (new B()).sum();

  //Then
  strictEqual(a, 6, "Set member variable of A by property setting successfully");
  strictEqual(b, 12, "Set member variable of A by property setting successfully");
});

test( "constructor parameter passing", function(  ) {
  //Given
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

  //When
  var b = new B(10, 11, 12);
  var nSumbB = b.sum();

  //Then
  strictEqual( nSumbB, 33, "pass that B Class without a constructor passes parameter to A constructor" );
});

test( "undefined constructor", function(  ) {
  //Given
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

  //When
  var a = (new A()).sum();
  var b = (new B()).sum();

  //Then
  strictEqual( a, 6, "Member value setting without constructor is success." );
  strictEqual( b, 33, "Member value setting without constructor is success." );
});

/**
 * 모든 메시지가 순차적으로 출력되는지 확인
 */
test( "Order of constructor call and derived method call", function(  ) {
   //Given
   //When
   //Then :TODO - change to GWT Style
	var methodTimes = 0;
	var constructTimes = 0;
	var NaverBase = eg.Class({
		bah: function () {
			strictEqual( ++methodTimes, 1 , "called Base method first" );
    }
	});

	var NaverSub1 = eg.Class.extend(NaverBase, {
		construct : function() {
			strictEqual(++constructTimes, 1, 'called Sub1 constructor first');
		},
		bah: function() {
      NaverSub1.$super.bah.call(this);
      strictEqual(++methodTimes, 2, 'called Sub1 method second');
    }
	});

	var NaverSub2 = eg.Class.extend(NaverSub1, {
	  construct : function() {
	  	strictEqual(++constructTimes, 2, 'called Sub2 constructor second');
	  },
	  bah : function() {
	  	NaverSub2.$super.bah.call(this);
	  	strictEqual(++methodTimes, 3, 'called Sub2 method third');
	  }
	});

  
	(new NaverSub2()).bah();
});