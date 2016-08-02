### Browser support
iOS 7+ and Android 2.1+ (except 3.x)

### Quick steps to use:

#### Load files

``` html
<!-- 1) Load jQuery -->
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>

<!-- 2) Load egjs packaged file -->
<script src="http://naver.github.io/egjs/latest/dist/pkgd/eg.pkgd.min.js"></script>
```

#### Bind rotate event

``` javascript
$(window).on("rotate", function(e, info){
  info.isVertical; // Check portrait mode
});
```