#### pauseResume demo

<div class="testBackground">
<div id="rectBox" class="test">Mouse Over Me to pause</div>
</div>
<br/>

```javascript
//pause / resume by mouse over/out events.
$("#rectBox").hover(function() {
  $(this).pause();
}, function() {
  $(this).resume();
});

// Animate element infinitely
var $rectBox = $("#rectBox");
function drawRectangle() {
  $rectBox
    .animate({"opacity": 0.5}, 1000)
    .animate({"left":"+=200px"}, 1000, "easeOutElastic")//relative value
    .animate({"top":"200px"}, 1000, "easeOutElastic")//absolute value
    .animate({"left":"0px"}, 1000, "easeOutElastic")
    .animate({"top":"-=200px"}, 1000, "easeOutElastic")
    .animate({"opacity": "+=0.5"}, 1000, drawRectangle)
}

drawRectangle();
```