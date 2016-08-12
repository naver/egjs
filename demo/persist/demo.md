## Persisted comments loaded with ajax
1. Click "load comments" button and load more comments.
2. Click link to the end page.
3. Go back with browser back button on mobile phone.
4. **Check loaded comments are still there.**
5. Click refresh button on mobile phone.
6. **Check loaded comments are gone.**

<div class="deviceContainer persistDemo">
  <div class="screen">
  <div class="addressbar">
    <div class="backBtn button"></div>
    <div class="forwardBtn button"></div>
    <div class="refreshBtn button"></div>
    <div class="label"></div>
    <div class="progress-indicator"></div>
  </div>
  <div class="viewport">
     <iframe src="persisted.html" width="288" height="462">
       </iframe>
  </div>
  </div>
</div>


```javascript
$(".loadCmtBtn").on("click", function() {
	// Make change to the component. (append comments) 
	$.get("/api/123/nextcomment", function(commentHtml) {
		$(".commentContainer").append( commentHtml );		

		// Save snapshot of the component when there is a change
		var snapshot = $(".commentContainer").html();
		$.persist("commentModule", {
			commentsHTML: snapshot
		});
	});
});
	
// Restore state when initiate component
if($.persist("commentModule")) {
	var commentsHTML = $.persist("commentModule"). commentsHTML;
	$(".commentContainer").html(commentsHTML);
}
```