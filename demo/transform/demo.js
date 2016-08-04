var $rectBox = $("#rectBox");

function rotate() {
  $rectBox
    .animate({"transform": "rotate(360deg)"}, "slow", rotate);
}

rotate();