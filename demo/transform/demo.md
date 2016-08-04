#### transform demo

<div class="testBackground">
<div id="rectBox" class="test">Box</div>
</div>
<br/>

```javascript
// Animate element infinitely
var $rectBox = $("#rectBox");

function rotate() {
  $rectBox.animate({"transform": "rotate(360deg)"}, "slow", rotate);
}

rotate();
```

<!-- NEED TO ADD DEMO FOR RELATIVE TRANSFORM -->