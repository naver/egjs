

### Installation
#### npm
> npm install @egjs/view360 --save

#### script tag
Download the latest version of view360.js and include using the script tag
``` html
<script src="/path/to/js/view360.pkgd.min.js"></script>

or for quick testing

<script src="//{{ site.data.egjs.github.user }}.github.io/{{ site.data.egjs.github.repo }}/{{ site.data.egjs.dist }}"></script>
```

[Download link](//{{ site.data.egjs.github.user }}.github.io/{{ site.data.egjs.github.repo }}/{{ site.data.egjs.dist }})

### Usage 

#### 1. Set up your Container Element

Your container element's dimensions should be defined.

``` html
<div id="myPanoViewer"></div>
```

#### 2. Import Module
```js
// Use es6 import
import {PanoViewer} from "@egjs/view360";

// Or use global namespace
const PanoViewer = eg.view360.PanoViewer;
```

#### 3. Initialize PanoViewer
```js

// create PanoViewer with option
const panoViewer = new PanoViewer(
  document.getElementById("myPanoViewer"),
  {
    image: "/path/to/image/image.jpg"
  }
);
```
