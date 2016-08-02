
### Browser support
IE 7+, latest of Chrome/FF/Safari, iOS 7+ and Android 2.3+ (except 3.x)

### Quick steps to use:

#### Load files

``` html
<!-- 1) Load jQuery -->
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>

<!-- 2) Load egjs packaged file -->
<script src="http://naver.github.io/egjs/latest/dist/pkgd/eg.pkgd.min.js"></script>
```

#### Use Component

``` javascript
var Some = eg.Class.extend({
	//Class initialize
	"construct": function(val){
		this.val = val;
	},
	"sumVal": function(val) {
		return this.val + val;
	}
});

// Make an instance using Class.
var some = new Some(5);
some.sumVal(5);//10
```