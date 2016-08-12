function FakeChrome(deviceContainer) {
	var self = this;

	self.deviceContainer = deviceContainer;
							
	self.browserFrame = self.deviceContainer.querySelector(".screen iframe");//$(self.deviceContainer).find(".screen iframe")[0];
	self.window = self.browserFrame.contentWindow;

	self.backBtn = $(self.deviceContainer).find(".backBtn")[0];
	self.forwardBtn = $(self.deviceContainer).find(".forwardBtn")[0];
	
	var beenThere = false;

	self.progressBar = $(self.deviceContainer).find(".progress-indicator");

	self.browserFrame.addEventListener("load", function() {
		$(self.deviceContainer).find(".addressbar .label").html(getAddress(self.window));
		if(getAddress(self.window).indexOf("/end-page.html") !== -1) {
			beenThere = true;
			$(self.backBtn).css("opacity", 1);
			$(self.forwardBtn).css("opacity", .2);
			
		} else if(beenThere == true) {
			$(self.forwardBtn).css("opacity", 1);
			
		}
		showLoadingEffect(self.progressBar);
	});
	
	function getAddress(window) {
		return window.location.pathname;
	}
	
	function showLoadingEffect(progressBar) {
		progressBar.css({
			"transition": "none"
		});
		progressBar.removeClass("end");
	
		progressBar.css({
			"transition": ""
		});	
		progressBar.addClass("end");
		
		progressBar.on("transitionend", function(){
			if(	$(this).hasClass("end") ) {
				var self = this;
				$(this).css({
					"transition": "none"
				});
				$(this).removeClass("end");
				setTimeout(function(){
					$(self).css({
						"transition": ""
					});
					$(self).removeClass("end");
				}, 200);
			}
		})	
	}
	
	$(self.backBtn).css("opacity", .2);
	$(self.forwardBtn).css("opacity", .2);
	
	
	$(self.backBtn).on("click", function(){
		
		if(self.window.location.href.indexOf("persisted.html") === -1) {
			console.log(self.window.location.pathname)
			self.window.history.back();
			$(self.deviceContainer).find(".addressbar .label").html(getAddress(self.window));
			showLoadingEffect(self.progressBar);
			$(this).css("opacity", .2);
			return;
		} else if(self.window.location.href.indexOf("/demo/persist/persisted.html") !== -1) {
			return;	
		}
		
		$(this).css("opacity", 1);		
	});
	
	$(self.forwardBtn).on("click", function(){
		if(self.window.location.href.indexOf("end-page.html") === -1 && beenThere === true) {
			console.log(self.window.location.pathname)
			self.window.history.forward();
			$(self.deviceContainer).find(".addressbar .label").html(getAddress(self.window));
			showLoadingEffect(self.progressBar);
			$(this).css("opacity", .2);
			return;
		} else if(self.window.location.href.indexOf("end-page.html") !== -1) {
			return;	
		} else if(self.window.location.href.indexOf("end-page.html") === -1 && beenThere === false) {
			return;	
		}
			
		$(this).css("opacity", 1);		
	});
	
	$(self.deviceContainer).find(".refreshBtn").on("click", function(){
		self.window.location.reload();// = self.window.location.href;
			showLoadingEffect(self.progressBar);
	});
	
}

new FakeChrome($(".persistDemo")[0]);
//new FakeChrome($(".nopersistDemo")[0]);