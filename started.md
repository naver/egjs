### Browser support
IE 10+, latest of Chrome/FF/Safari, iOS 7+ and Android 2.3+ (except 3.x)

### Quick steps to use:


#### Set up your HTML

``` html
<div id="area">
```

#### Load files or import library


##### ES5
``` html
<script src="//{{ site.data.egjs.github.user }}.github.io/{{ site.data.egjs.github.repo }}/release/latest/dist/{{ site.data.egjs.download }}"></script>
```

##### ES6+
```js
import MovableCoord from "@egjs/movablecoord";
```

### Initialize

#### ES5
```javascript
// create eg.MovableCoord with option
var instance = new eg.MovableCoord("#area", {
  max : [300, 400]
}).bind(el);
```

#### ES6+
```js
// create MovableCoord with option
const instance = new MovableCoord("#area", {
  max : [300, 400]
}).bind(el);
```
