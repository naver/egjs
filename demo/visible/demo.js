var visibleView = new eg.Visible('.scroller',{
    targetClass : "card",
    expandSize : 0
}).on("change", function (e) {
    $(e.visible).addClass("focus");
    $(e.invisible).removeClass("focus");
    handler(e)
});

visibleView.check(0);    

$('.scroller').scroll(function() {
    visibleView.check(0);    
});

// UI for reconfigure options

$("#effeciveViewportToggle").on("change input", updateEffectiveViewport);
$("#expandSizeInput").on("change input", updateEffectiveViewport);

function updateEffectiveViewport(e) {

	if(e.target && e.target.type === "range") {
    var expandSize = e.target.value;
		$("#expandSize_value").html(expandSize);
		visibleView.option("expandSize", expandSize);
    console.log(parseInt($('.scroller').height()), expandSize * 2);
  	visibleView.check(0);
	}

  var expandSize = visibleView.option("expandSize");
  $("#effeciveViewportIndicator").css({
    width:  parseInt($('.scroller').width()),
    height: parseInt($('.scroller').height()) + expandSize * 2,
    top: parseInt($('.scroller').css("margin-top")) -1 * expandSize,
    left: parseInt($('.scroller').css("margin-left"))
  });
  
	if($("#effeciveViewportToggle")[0].checked) {
		$("#effeciveViewportIndicator").show();
	} else {
		$("#effeciveViewportIndicator").hide();
	}
}

var count = 0;
function handler(e) {
	var log = $("#log");

	if(handler.end) {
		log.html("");
		count = 1;
	}
    ;
  var msg = $("<span>" +(count++) +": <span class=red>"+ e.eventType +"</span> event fired.<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+ $(e.visible).length + " new visible, " +
    $(e.invisible).length + " new invisible<br>" + "</span>")
	log.prepend(msg);
	//handler.end = /^(flickEnd|restore)$/.test(e.eventType);
}