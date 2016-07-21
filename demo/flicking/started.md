### Browser support
IE 10+ (possibly 9 also), latest of Chrome/FF/Safari, iOS 7+ and Android 2.3+ (except 3.x)

### Quick steps to use:

#### Load files

``` html
<!-- 1) Load jQuery -->
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>

<!-- 2) Load egjs All-in-one file merged with dependencies(Hammer.js + egjs components) -->
<script src="https://naver.github.io/egjs/latest/dist/pkgd/flicking.pkgd.min.js"></script>
```

#### Set up your HTML

``` html
<!-- wrapper ---->
<div id="wrapper">
  <!-- panels ---->
  <div>
    <p>panel 0</p>
  </div>
  <div>
    <p>panel 1</p>
  </div>
  <div>
    <p>panel 2</p>
  </div>
</div>
```

### Initialize it and all done!
Two ways of using eg.Flicking.<br>
Just choose what is more convenient for you.

#### As jQuery plugin style

``` javascript
// create flicking ui without option
$("#wrapper").flicking();

// create flicking ui with options
$("#wrapper").flicking({
  duration: 300,
  circular: true,
  defaultIndex: 1
});

// create flicking ui and get instance of it
var $el = $("#wrapper").flicking();
$el.flicking("instance");  // return instance

// call some methods
$el.flicking("next");
$el.flicking("prev", 500);
```

#### As creating instance
``` javascript
// create flicking ui without option
new eg.Flicking("#wrapper");

// create flicking ui with options
new eg.Flicking("#wrapper").({
  duration: 300,
  circular: true,
  defaultIndex: 1
});

// create flicking ui and get instance of it
var instance = new eg.Flicking("#wrapper");

// call some methods
instance.next();
instance.prev(500);
```