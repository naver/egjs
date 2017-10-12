### Browser support
IE 10+, latest of Chrome/FF/Safari, iOS 7+ and Android 2.3+ (except 3.x)

### Quick steps to use:


#### 1. Set up your HTML

``` html
<div id="area"></div>
```

#### 2. Load files or import library


##### ES5
``` html
{% for dist in site.data.egjs.dist %}
<script src="//{{ site.data.egjs.github.user }}.github.io/{{ site.data.egjs.github.repo }}/{{ dist }}"></script>
{% endfor %}
```

##### ES6+
```js
import Axes from "@egjs/axes";
```

#### 3. Initialize eg.Axes

Initialize eg.Axes. specify the axis to be used.
The key of the axis specifies the name to use as the logical virtual coordinate system.

```js
// create eg.Axes with option
const axes = new eg.Axes({
  something1: { range: [0, 100] },
  something2: { range: [0, 100] },
  somethingN: { range: [-200, 200] }
});
```

#### 4. Attach event handlers
eg.Axes provides five events.

- [hold](./release/latest/doc/eg.Axes.html#event:hold)
- [change](./release/latest/doc/eg.Axes.html#event:change)
- [release](./release/latest/doc/eg.Axes.html#event:release)
- [animationStart](./release/latest/doc/eg.Axes.html#event:animationStart)
- [animationEnd](./release/latest/doc/eg.Axes.html#event:animationEnd)

```js
axes.on({
 "change": evt => /* ... */
});
```

#### 5. Initialize InputTypes to use
Create an InputType to associate with the axis of eg.Axes.

Axes provides three inputTypes.
- [eg.Axes.PanInput](./release/latest/doc/eg.Axes.PanInput.html)
- [eg.Axes.PinchInput](./release/latest/doc/eg.Axes.PinchInput.html)
- [eg.Axes.WheelInput](./release/latest/doc/eg.Axes.WheelInput.html)

```js
// create inputTypes to use
const panInput = new eg.Axes.PanInput("#area");
const wheelInput = new eg.Axes.WheelInput("#wArea");
const pinchInput = new eg.Axes.PinchInput("#pArea");
```

#### 6. Connect eg.Axes and InputTypes 

```js
/** 
 * [PanInput] When the mouse or touchscreen is down and moved.
 *
 * Connect the 'something2' axis to the mouse or touchscreen x position and
 * connect the 'somethingN' axis to the mouse or touchscreen y position.
 **/
axes.connect(["something2", "somethingN"], panInput); // or axes.connect("something2 somethingN", panInput);
// Connect only one 'something1' axis to the mouse or touchscreen x position.
axes.connect(["something1"], panInput); // or axes.connect("something1", panInput);
// Connect only one 'something2' axis to the mouse or touchscreen y position.
axes.connect(["", "something2"], panInput); // or axes.connect(" something2", panInput);

// [WheelInput] Connect 'something1' axis when the mousewheel is moved.
axes.connect(["something1"], wheelInput); // or axes.connect("something1", wheelInput);

// [PinchInput] Connect 'something2' axis when two pointers are moving toward (zoom-in) or away from each other (zoom-out).
axes.connect(["something2"], pinchInput); // or axes.connect("something2", pinchInput);
```

#### 7. Enjoy!
You can change the value of the axis through touch screen, mouse or anything else.
