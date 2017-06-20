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
