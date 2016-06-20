#### MovableCoord demo

<div id="area">
      <div id="box">
        <div class="face" style="background-color:#f00; -webkit-transform:rotateX(0deg) rotateY(0deg) translate3d(-100px,-100px,100px);">1</div>
        <div class="face" style="background-color:#0f0; -webkit-transform:rotateY(-90deg) translate3d(0px,-100px,200px);">2</div>
        <div class="face" style="background-color:#00f; -webkit-transform:rotateY(90deg) translate3d(0px,-100px,0px);">3</div>
        <div class="face" style="background-color:#f80; -webkit-transform:rotateX(90deg) translate3d(-100px,0px,200px);">4</div>
        <div class="face" style="background-color:#f0f; -webkit-transform:rotateY(180deg) translate3d(100px,-100px,100px);">5</div>
        <div class="face" style="background-color:#0ff; -webkit-transform:rotateX(-90deg) translate3d(-100px,00px,0px);">6</div>
      </div>
</div>

```javascript
// creating instance
var $box = $("#box"),
inst = new eg.MovableCoord({
      min : [ 0, 0 ],
      max : [ 360, 360 ],
      circular : true,
      deceleration : 0.0024
}).on({
      "change" : function(evt) {
            var pos = evt.pos;
            $box.css("transform", "rotateY(" + pos[0] + "deg) rotateX(" + pos[1] + "deg)");
      }
});

inst.bind(document.body, {
      direction : eg.DIRECTION_ALL,
      maximumSpeed : 50
});
```
