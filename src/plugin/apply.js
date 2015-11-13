/**
 * @namespace jQuery
 * @group jQuery Extension
 */
/**
 * Flicking plugin in jQuery
 *
 * @ko jQuery flicking plugin
 * @name jQuery#flicking
 * @event
 * @example
 	<!-- HTML -->
	<div id="mflick">
		<div>
			<p>Layer 0</p>
		</div>
		<div>
			<p>Layer 1</p>
		</div>
		<div>
			<p>Layer 2</p>
		</div>
	</div>
	<script>
	// create
	$("#mflick").flicking({
 		circular : true,
 		threshold : 50
 	});

 	// event
 	$("#mflick").on("flicking:beforeRestore",callback);
 	$("#mflick").off("flicking:beforeRestore",callback);
 	$("#mflick").trigger("flicking:beforeRestore",callback);

 	// method
 	$("#mflick").flicking("option","circular",true); //Set option
 	$("#mflick").flicking("instance"); // Return flicking instance
 	$("#mflick").flicking("getNextIndex",1); // Get next panel index
 	</script>
 * @see eg.Flicking
 */

 /**
 * Visible plugin in jQuery
 *
 * @ko jQuery visible plugin
 * @name jQuery#visible
 * @event
 * @example
	// create
	$("body").visible();

 	// event
 	$("body").on("visible:change",callback);
 	$("body").off("visible:change",callback);
 	$("body").trigger("visible:change",callback);

 	// method
 	$("body").visible("option","circular",true); //Set option
 	$("body").visible("instance"); // Return flicking instance
 	$("body").visible("check",10); // Check to change target elements.
 	</script>
 * @see eg.Visble
 */

 /**
 * InfiniteGrid plugin in jQuery
 *
 * @ko jQuery InfiniteGrid plugin
 * @name jQuery#infiniteGrid
 * @event
 * @example
     <ul id="grid">
        <li class="item">
          <div>test1</div>
        </li>
        <li class="item">
          <div>test3</div>
        </li>
      </ul>
	// create
	$("#content").infiniteGrid({
        itemSelector : ".item"
    });

 	// event
 	$("#content").on("infiniteGrid:layoutComplete",callback);
 	$("#content").off("infiniteGrid:layoutComplete",callback);
 	$("#content").trigger("infiniteGrid:layoutComplete",callback);

 	// method
 	$("#content").infiniteGrid("option","itemSelector",".selected"); //Set option
 	$("#content").infiniteGrid("instance"); // Return infiniteGrid instance
 	$("#content").infiniteGrid("getBottomElement"); // Get bottom element
 	</script>
 * @see eg.InfiniteGrid
 */