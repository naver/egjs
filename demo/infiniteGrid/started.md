### Browser support
IE 8+ (possibly 9 also), latest of Chrome/FF/Safari, iOS 7+ and Android 2.1+ (except 3.x)

### Quick steps to use:

#### Load files

``` html
<!-- 1) Load jQuery -->
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>

<!-- 2) Load egjs All-in-one file merged with dependencies(outlayer + egjs components) -->
<script src="https://naver.github.io/egjs/latest/dist/pkgd/infiniteGrid.pkgd.min.js"></script>
```

#### Set up your HTML

``` html
<ul id="grid">
    <li class="item">
      <div>테스트1</div>
    </li>
    <li class="item">
      <div>테스트2</div>
    </li>
    <li class="item">
      <div>테스트3</div>
    </li>
    <li class="item">
      <div>테스트4</div>
    </li>
    <li class="item">
      <div>테스트5</div>
    </li>
    <li class="item">
      <div>테스트6</div>
    </li>
</ul>
```

### Initialize it and all done!
Two ways of using eg.InfiniteGrid.<br>
Just choose what is more convenient for you.

#### As jQuery plugin style

```javascript
// create InfiniteGrid ui without option
$("#grid").infiniteGrid();

// create InfiniteGrid ui with options
$("#grid").infiniteGrid({
  itemSelector: ".item",
  count: -1
});

// create InfiniteGrid ui and get instance of it
var $el = $("#grid").infiniteGrid();
$el.infiniteGrid("instance");  // return instance

// call some methods
$el.infiniteGrid("getBottomElement");
$el.infiniteGrid("layout");
```

#### As creating instance
```javascript
// create InfiniteGrid ui without option
new eg.InfiniteGrid("#grid");

// create InfiniteGrid ui with options
new eg.InfiniteGrid("#grid",{
  itemSelector: ".item",
  count: -1
});

// create InfiniteGrid ui and get instance of it
var instance = new eg.InfiniteGrid("#grid");

// call some methods
instance.getBottomElement();
instance.layout();
```