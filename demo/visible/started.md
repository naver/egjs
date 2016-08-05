### Browser support
IE 7+ (possibly 9 also), latest of Chrome/FF/Safari, iOS 7+ and Android 2.1+ (except 3.x)

### Quick steps to use:


#### Load files
``` html
<!-- 1) Load jQuery -->
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>

<!-- 2) Load egjs packaged file -->
<script src="http://naver.github.io/egjs/latest/dist/pkgd/eg.pkgd.min.js"></script>
```


#### Check markup requirement

The first parameter should be a scrollable element.


#### Setting up

``` javascript
// Create eg.Visible instance
var visible = new eg.Visible('.scroller',{
    targetClass : "card",
    expandSize : 0
});

// Add change event handler
visible.on("change", function (e) {
    $(e.visible).addClass("focus");
    $(e.invisible).removeClass("focus");
});

// Call "check" method whenever you want to check visibility change of the elements compared with last time you call "check" method.
// When you call "check" mehtod and if there is a change, "change" event will trigger.
visible.check();    

```
