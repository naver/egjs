
### Browser support
IE 10+, latest of Chrome/FF/Safari, iOS 7+ and Android 2.3+ (except 3.x)

### Quick steps to use:

#### Load files

``` html
<!-- 1) Load jQuery -->
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>

<!-- 2) Load egjs packaged file -->
<script src="http://naver.github.io/egjs/latest/dist/pkgd/eg.pkgd.min.js"></script>
```

#### Animate jquery element with transform property

``` javascript
var $el = $("#anim");
$el.animate({"transform": "translate(100px) rotate(30deg)"});
```

#### You can use relative values.

``` javascript
var $el = $("#anim");
$el.animate({"transform": "+=translate(100px)"});
```

#### You can also use chaining.
``` javascript
var $el = $("#anim");
$el
    .animate({"transform": "translate(100px)"})
    .animate({"transform": "rotate(30deg)"})
    .animate({"transform": "translate(-100px)"});
```