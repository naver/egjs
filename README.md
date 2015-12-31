# egjs 
[![Build Status](https://travis-ci.org/naver/egjs.svg?branch=master)](https://travis-ci.org/naver/egjs)

'egjs' is a set of UI interactions, effects and utilities components library using jQuery, which brings easiest and fastest way to build web application in your way.

> - **Demo**: http://codepen.io/egjs/
> - **Online API Documentation**
    - Latest : https://egjs.github.io/latest/doc
    - For specific version : `https://egjs.github.io/[VERSION]/doc`

- [한국어(Korean) readme](https://github.com/naver/egjs/blob/master/README-ko.md)

### Components
* **eg** : Collection of base utilities, which are used in diverse egjs components.
* **eg.Class** : Provide class methods to make object oriented programming style code.
* **eg.Component** : Base class utility to help develop modules in component.
* **eg.MovableCoord** : Easily get computed coordinate values according user actions.
* **eg.Flicking** : Implement flicking interaction UI.
* **eg.Visible** : Check whether elements are within viewport.
* **eg.infiniteGrid** : Make card style UI arranged in grid style in infinite way.
 
### jQuery Extensions
#### Methods
* **persist** : Provide cache interface to handle persisted data among history navigation.
* **css** : Help to use css properties without browser's vendor prefix.
* **animate** : Support transform and 3d acceleration extending jQuery's animate.

#### Events
* **rotate** : Trigger event detecting device orientation.
* **scrollEnd** : Trigger event detecting end of scroll's position.

## Download
For latest version, check out - https://github.com/naver/egjs.github.io

### Uncompressed (for development)
  - Latest : https://egjs.github.io/latest/dist/eg.js  
  - For specific version :  `https://egjs.github.io/[VERSION]/dist/eg.js  `

### Compressed (for production)
  - Latest : https://egjs.github.io/latest/dist/eg.min.js
  - For specific version : `https://egjs.github.io/[VERSION]/dist/eg.min.js`

### with Bower

```bash
# Intall bower if not (admin account required)
$ npm install bower -g

# then intall egjs using bower
$ bower install egjs
```


## Browser support

|Internet Explorer|Chrome|FireFox|Safari|iOS|Android|
|---|---|---|---|---|---|
|7+|Latest|Latest|Latest|7+|2.3+ (except 3.x)|
- Coverage could be vary among components. For more details check out API documentation.

## Dependency library

egjs has following dependencies.

|[jQuery](https://jquery.com/)|[hammer.js](http://hammerjs.github.io/)|[Outlayer](https://github.com/metafizzy/outlayer/)|
|---|---|---|---|
|1.7.0+ |2.0.4+|1.4.1+|
- Except `jQuery`, others are not mandatory. Required dependencies may differ according components.


## How to use?
Load dependency libraries(jquery.js, hammer.js, outlayer.js) first, then load eg.js(or eg.min.js).

```html
<script src="bower_components/jquery/jquery.js"></script>
<script src="bower_components/hammer.js/hammer.js"></script>
<script src="bower_components/outlayer/outlayer.js"></script>
<script src="dist/eg.js"></script>
```

All done, ready to start using egjs!
egjs has `eg` namespace and can be used as below example.

```javascript
var Klass = eg.Class({
    "construct" : function(){}
});
var Komponent = eg.Class.extend(eg.Component,{
    "construct" : function(){}
});
```

## How to start developing egjs?
For anyone interested to develop egjs, follow below instructions.

### Steps for setting project
#### 1. Install grunt-cli and bower
```bash
# Install grunt-cli and bower globally (admin account required)
$ npm install grunt-cli -g  # grunt-cli
$ npm install bower -g  # bower
```

#### 2. Clone from repo and install dependency modules
```bash
# make directory and enter
$ mkdir egjs && cd egjs

# get the clone from the repo
$ git clone https://github.com/naver/egjs.git

# install bower dependency modules
$ bower install

# install node dependency modules
$ npm install
```

#### 3. Build
Run grunt build task to build.
```bash
$ grunt build
```
If the build successfully complete :

- `eg.js` and `eg.min.js` are created in `dist` folder.
- API documentations are created in `doc` folder, and can be accessed `doc/index.html`.

### Test
After development has been done from your branch, `must run unit test` before push.
Running `grunt test` task, jshint, qunit and istanbul coverage task will be run.
```bash
$ grunt test
```
- Coverage results can be shown immediately and also can be found at `./report/index.html`.

## Issues
If you find a bug, please report us via [issues page](https://github.com/naver/egjs/issues).

## License
egjs is released under the [MIT](http://egjs.github.io/license.txt) license.

```
Copyright (c) 2015 NAVER Corp.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

[![Analytics](https://ga-beacon.appspot.com/UA-70842526-5/egjs/readme)](https://github.com/naver/egjs)
