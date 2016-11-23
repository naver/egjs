### Browser support
IE 10+ (possibly 9 also), latest of Chrome/FF/Safari, iOS 7+ and Android 2.3+ (except 3.x)

### Quick steps to use:

#### Load files

``` html
<!-- 1) Load jQuery -->
<script src="https://code.jquery.com/jquery-1.8.1.min.js"></script>

<!-- 2) Load egjs packaged file -->
<script src="http://naver.github.io/egjs/latest/dist/pkgd/eg.pkgd.min.js"></script>
```
#### Sample

``` javascript
// When you use css mehthod in jQuery 1.4.3 ~ 1.8.x.
$("#ID").css("webkitTransform", "translate('10px', '10px');

// but, If you use css with egjs that you didn`t need to use vandor prefix.
$("#ID").css("transform", "translate('10px', '10px');
```