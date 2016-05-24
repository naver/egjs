### Horizontal direction

#### Non-Circular

<div id="mflick1" class="flick">
	<div style="background-color:#CC66CC">
		<p>panel 0</p>
	</div>
	<div style="background-color:#66cccc">
		<p>panel 1</p>
	</div>
	<div style="background-color:#ffc000">
		<p>panel 2</p>
	</div>
</div>
<button onclick="f1.prev()" class="f_btn">&lt;</button> <button class="f_btn f_right" onclick="f1.next()">&gt;</button>

```javascript
// as jQuery plugin style
$("#wrapper").flicking();

// or as creating instance
new eg.Flicking("#wrapper");
```

#### Circular
<div id="mflick2" class="flick">
	<div id="item1" style="background-color:#CC66CC">
		<p>panel 0</p>
	</div>
	<div id="item2" style="background-color:#66cccc">
		<p>panel 1</p>
	</div>
	<div id="item3" style="background-color:#ffc000">
		<p>panel 2</p>
	</div>
</div>
<button onclick="f2.prev()" class="f_btn">&lt;</button> <button class="f_btn f_right" onclick="f2.next()">&gt;</button>

```javascript
// as jQuery plugin style
$("#wrapper").flicking({
  duration: 300,
  circular: true,
  defaultIndex: 1
});

// or as creating instance
new eg.Flicking("#wrapper", {
  duration: 300,
  circular: true,
  defaultIndex: 1
});
```

#### Preview & circular

<div id="mflick3" class="flick">
	<div class="p0" style="background-color:#CC66CC">
		<p>panel 0</p>
	</div>
	<div class="p1" style="background-color:#66cccc">
		<p>panel 1</p>
	</div>
	<div class="p2" style="background-color:#ffc000">
		<p>panel 2</p>
	</div>
	<div class="p3" style="background-color:green">
		<p>panel 3</p>
	</div>
	<div class="p4" style="background-color:maroon">
		<p>panel 4</p>
	</div>
</div>
<button onclick="f3.prev()" class="f_btn">&lt;</button> <button class="f_btn f_right" onclick="f3.next()">&gt;</button>

```javascript
// as jQuery plugin style
$("#wrapper").flicking({
  duration: 300,
  circular: true,
  previewPadding: [ 50, 50 ],
  defaultIndex: 3
});

// or as creating instance
new eg.Flicking("#wrapper", {
  duration: 300,
  circular: true,
  previewPadding: [ 50, 50 ],
  defaultIndex: 3
});
```

### Vertical direction

#### Non-Circular

<div id="vflick1" class="flick vertical">
	<div style="background-color:#CC66CC">
		<p>panel 0</p>
	</div>
	<div style="background-color:#66cccc">
		<p>panel 1</p>
	</div>
	<div style="background-color:#ffc000">
		<p>panel 2</p>
	</div>
</div>
<div class="vbutton"><button onclick="v1.prev()" class="v_btn">^</button> <button onclick="v1.next()" class="v_btn">v</button></div>

```javascript
// as jQuery plugin style
$("#wrapper").flicking({
  horizontal: false
});

// or as creating instance
new eg.Flicking("#wrapper", {
  horizontal: false
});
```

#### Circular
<div id="vflick2" class="flick vertical">
	<div style="background-color:#CC66CC">
		<p>panel 0</p>
	</div>
	<div style="background-color:#66cccc">
		<p>panel 1</p>
	</div>
	<div style="background-color:#ffc000">
		<p>panel 2</p>
	</div>
</div>
<div class="vbutton"><button onclick="v2.prev()" class="v_btn">^</button> <button onclick="v2.next()" class="v_btn">v</button></div>

```javascript
// as jQuery plugin style
$("#wrapper").flicking({
  horizontal: false,
  circular: true,
  duration: 300,
  defaultIndex: 1,
});

// or as creating instance
new eg.Flicking("#wrapper", {
  horizontal: false,
  circular: true,
  duration: 300,
  defaultIndex: 1,
});
```

#### Preview & circular

<div id="vflick3" class="flick f_vertical">
	<div class="p0" style="background-color:#CC66CC">
		<p>panel 0</p>
	</div>
	<div class="p1" style="background-color:#66cccc">
		<p>panel 1</p>
	</div>
	<div class="p2" style="background-color:#ffc000">
		<p>panel 2</p>
	</div>
	<div class="p3" style="background-color:green">
		<p>panel 3</p>
	</div>
	<div class="p4" style="background-color:maroon">
		<p>panel 4</p>
	</div>
</div>
<div class="vbutton"><button onclick="v3.prev()" class="v_btn">^</button> <button onclick="v3.next()" class="v_btn">v</button></div>

```javascript
// as jQuery plugin style
$("#wrapper").flicking({
  horizontal: false,
  circular: true,
  previewPadding: [ 20, 10 ],
  duration: 300,
  defaultIndex: 3
});

// or as creating instance
new eg.Flicking("#wrapper", {
  horizontal: false,
  circular: true,
  previewPadding: [ 20, 10 ],
  duration: 300,
  defaultIndex: 3
});
```

### Custom events

<div id="mflick4" class="flick">
	<div id="item1" style="background-color:#CC66CC">
		<p>panel 0</p>
	</div>
	<div id="item2" style="background-color:#66cccc">
		<p>panel 1</p>
	</div>
	<div id="item3" style="background-color:#ffc000">
		<p>panel 2</p>
	</div>
</div>
<button onclick="f4.prev()" class="f_btn">&lt;</button> <button class="f_btn f_right" onclick="f4.next()">&gt;</button>
<div id="log"></div>

```javascript
// as jQuery plugin style
// event names are used with prefix to avoid ambiguity and collision
$("#wrapper").flicking({
  duration: 300,
  circular: true,
  threshold: 70
}).on("flicking:beforeFlickStart "+
  "flicking:flick "+
  "flicking:flickEnd "+
  "flicking:beforeRestore "+
  "flicking:restore", handler);

// or as creating instance
new eg.Flicking("#wrapper", {
  duration: 300,
  circular: true,
  threshold: 70
}).on({
  beforeFlickStart: handler,
  flick: handler,
  flickEnd: handler,
  beforeRestore: handler,
  restore: handler
});

function handler(e) {
  $("#log").html(
    e.eventType +" event fired."
  );
}
```

### Handle multiple data with fixed panel divs

<div id="mflick5" class="flick">
	<div style="background-color:#CC66CC"></div>
	<div style="background-color:#66cccc"></div>
	<div style="background-color:#ffc000"></div>
</div>
<button onclick="f5.prev()" class="f_btn">&lt;</button> <button class="f_btn f_right" onclick="f5.next()">&gt;</button>

```javascript
var instance = new eg.Flicking("#wrapper", {
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

// Prepare 20 panels data
var df = document.createDocumentFragment();
for(var i=0; i<20; i++) {
  df.appendChild($("<p>panel "+ i +"</p>")[0]);
}

// Show initial panel data
instance.getElement().append(df.firstChild);
instance.getPrevElement().append(df.lastChild);
instance.getNextElement().append(df.firstChild);
```