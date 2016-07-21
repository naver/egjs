### Browser support
IE 10+, latest of Chrome/FF/Safari, iOS 7+ and Android 2.3+ (except 3.x)

### Quick steps to use:

#### Load files

``` html
<!-- 1) Load jQuery -->
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>

<!-- 2) Load egjs All-in-one file merged with dependencies(outlayer + Hammer.js + egjs components) -->
<script src="https://naver.github.io/egjs/latest/dist/pkgd/eg.pkgd.min.js"></script>
```

#### Set up your HTML

``` html
<div id="area">
```

### Initialize
```javascript
// create MovableCoord with option
var instance = new eg.MovableCoord("#area", {
  max : [ 300, 400 ]
});

// call bind method
instance.bind(el, {
  direction : eg.MovableCoord.DIRECTION_ALL,
  scale: [1, 1.5]
});

// call unbind method
instance.unbind(el);
```
