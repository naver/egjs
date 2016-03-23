var count = 1;

function handler(e) {
	var log = $("#log");

	if(handler.end) {
		log.html("");
		count = 1;
	}

	log.html((count++) +": <span class=red>"+ e.eventType +"</span> event fired.<br>"+ log.html());
	handler.end = /^(flickEnd|restore)$/.test(e.eventType);
}

var f1 = new eg.Flicking("#mflick1");

var f2 = new eg.Flicking("#mflick2", {
	duration: 300,
	circular: true,
	defaultIndex: 1
});

var f3 = new eg.Flicking("#mflick3", {
	duration: 300,
	circular: true,
	previewPadding: [ 50, 50 ],
	defaultIndex: 3
});

var v1 = new eg.Flicking("#vflick1", {
	horizontal:false
});

var v2 = new eg.Flicking("#vflick2", {
	horizontal: false,
	circular: true,
	duration: 300,
	defaultIndex: 1
});

var v3 = new eg.Flicking("#vflick3", {
	horizontal: false,
	circular: true,
	previewPadding: [ 20, 10 ],
	duration: 300,
	defaultIndex: 3
});

var f4 = new eg.Flicking("#mflick4", {
	circular: true,
	duration: 300,
	threshold: 70
}).on({
	beforeFlickStart: handler,
	flick: handler,
	flickEnd: handler,
	beforeRestore: handler,
	restore: handler
});

var f5 = new eg.Flicking("#mflick5", {
	duration : 200,
	hwAccelerable : true,
	threshold : 70,
	circular: true
}).on({
	flickEnd: function(e) {
		var direction = e.direction;
		var MC = eg.MovableCoord;
		if( direction === MC.DIRECTION_LEFT ) {
			df.appendChild( this.getNextElement()[0].firstChild );
			this.getNextElement().append( df.firstChild );
		} else if( direction === MC.DIRECTION_RIGHT ) {
			df.insertBefore( this.getPrevElement()[0].firstChild, df.firstChild );
			this.getPrevElement().append( df.lastChild );
		}
	}
});

var df = document.createDocumentFragment();
for(var i=0; i<20; i++) {
	df.appendChild($("<p>panel "+ i +"</p>")[0]);
}

f5.getElement().append(df.firstChild);
f5.getPrevElement().append(df.lastChild);
f5.getNextElement().append(df.firstChild);