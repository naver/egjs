### Car 360º viewer

{% include_relative assets/html/car360viewer.html %}

```js
new eg.MovableCoord({
  min: [0, 0],
  max: [720, 0],
  bounce: [0, 0, 0, 0],
  circular: [false, true, false, true],
  deceleration: 0.00034,
}).on({
  "change": function(e) {
    var index = Math.min(Math.round(e.pos[0] % 360 / ape), imagesNum - 1);
    images.forEach(function(v, i) {
      v.style.display = i === index ? "inline-block" : "none";
    });
  }
}).bind(".car_rotate");
```

### Cards in hands

{% include_relative assets/html/cardinhand.html %}

```javascript
new eg.MovableCoord({
  min: [handRotMin, 0],
  max: [handRotMax, 0],
  circular: false,
  deceleration: 0.00034,
  bounce: [160, 15, 40, 15]
}).on({
"change" : function(e) {
  var cardDistance;
  var cardOffset;
  var currentRotateZ;
  var pos = e.pos;

  movableDot.style["bottom"] = -1.4 * pos[1] + "px";
  movableDot.style[TRANSFORM] = "translateX(" + (pos[0] * 2.3) + "px)";
  hand.style[TRANSFORM] = "rotateZ(" + pos[0] + "deg)";
  cards.forEach(function(v) {
    cardDistance = getCardDistance(v, hand).distance;
    cardOffset = pos[1];
    currentRotateZ = v.style[TRANSFORM].split("translateY")[0];
    v.style[TRANSFORM] = currentRotateZ +
    "translateY(" + (parseFloat(v.getAttribute("data-cardOffset")) + pos[1]) + "px)";
  });
  }
}).bind(hand, {
  maximumSpeed: 50,
  scale: [0.3, 0.8]
}).setTo((handRotMin + handRotMax) / 2, 0);
```

### Rotate a Cube

{% include_relative assets/html/cube.html %}

```js
var box = document.getElementById("box");
new eg.MovableCoord({
  min : [ 0, 0 ],
  max : [ 360, 360 ],
  circular : true,
deceleration : 0.0024
}).on({
  "change" : function(evt) {
    var pos = evt.pos;
    box.style[TRANSFORM] = "rotateY(" + pos[0] + "deg) rotateX(" + pos[1] + "deg)";
  }
}).bind("#area", {
  direction : eg.MovableCoord.DIRECTION_ALL,
  maximumSpeed : 50
});
```

### Swipe example (Cover effect)

{% include_relative assets/html/cover.html %}

```js
var listEl = document.getElementById("lists");
new eg.MovableCoord({
  min : [0, 0],
  max : [1200, 100],
  bounce : [0, 100, 0, 100]
}).on({
  "change" : function(evt) {
    var pos = evt.pos;
    var base = pos[0] / 300;
    var idx = Math.ceil(base);
    var list = listEl.querySelectorAll("li");
    var len = list.length;

    if (idx >= len) {
      listEl.style[TRANSFORM] = "translate3d(" + (pos[0] - this.options.max[0]) + "px,0,0)";
    } else {
      listEl.style[TRANSFORM] = "translate3d(0,0,0)";
    }

    if (list[idx-1]) { 
      list[idx-1].style[TRANSFORM] = "translate3d(0,0,0)"; 
    }
    if (list[idx]) { 
      list[idx].style[TRANSFORM] = "translate3d(" + ((base-idx)*300) + "px,0,0)";
    }
    if (list[idx+1]) { 
      list[idx+1].style[TRANSFORM] = "translate3d(-300px, 0, 0)";
    }
  },
  "release" : function(evt) {
    var pos = evt.destPos;
    pos[0] = Math.round(pos[0] / 300) * 300;
  }
}).bind("#coverarea", {
  scale : [1, 0.2],
  direction : eg.MovableCoord.DIRECTION_ALL
}).setTo(1200, 100);
```
