### Browser support
IE 9+, latest of Chrome/FF/Safari, iOS 7+ and Android 2.3+ (except 3.x)

### Quick steps to use:


#### Set up your HTML

``` html
<div>
```

#### Load files or import library


##### ES5
``` html
{% for dist in site.data.egjs.dist %}
<script src="//{{ site.data.egjs.github.user }}.github.io/{{ site.data.egjs.github.repo }}/{{ dist }}"></script>
{% endfor %}
```

##### ES6+
```js
import <%= ComponentName %> from "@egjs/<%= componentname %>";
```

### Initialize

#### ES5
```javascript
```

#### ES6+
```js
```
