<div class="wrap">
<div class="scroller">
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
  <div class="card item"></div>
</div>

<div class="control">
<div id="effeciveViewportIndicator"></div>
<label for="expandSize">expandSize : <span id="expandSize_value">0</span></label>
<input id="expandSizeInput" type="range" name="expandSize" min="-230" max="30" step="1" value="0"><br>
<label for="effeciveViewportIndicator">Show Effective Viewport Area</label>
<input id="effeciveViewportToggle" type="checkbox" name="effeciveViewportIndicator">
  <div id="log"></div>

</div>
</div>

```javascript
var visibleView = new eg.Visible('.scroller',{
    targetClass : "card",
    expandSize : 0
}).on("change", function (e) {
    $(e.visible).addClass("visible");
    $(e.invisible).removeClass("visible");
    handler(e)
});

visibleView.check();    

$('.scroller').scroll(function() {
    visibleView.check();    
});
```