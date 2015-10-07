# egjs 

'egjs' is a set of UI interactions, effects and utilities components library using jQuery, which brings easiest and fastest way to build web application in your way.

> - **Demo**: http://codepen.io/egjs/
> - **Online API Documentation**
    - Latest : http://jindo.nhncorp.com/eg
    - For specific version : `http://jindo.nhncorp.com/eg/[VERSION]/`

- [한국어(Korean) readme](README-ko.md)

### Components
* **eg** : Collection of base utilities, which are used in diverse egjs components.
* **eg.Class** : Provide class methods to make object oriented programming style code.
* **eg.Component** : Base class utility to help develop modules in component.
* **eg.MovableCoord** : Easily get computed coordinate values according user actions.
* **eg.Flicking** : Implement flicking interaction UI.
* **eg.Visible** : Check weather elements are within viewport.
* **eg.infiniteGrid** : Make card style UI arranged in grid style in infinite way.
 
### jQuery Extensions
#### Methods
* **persit** : Provide cache interface to handle persisted data among history navigation.
* **css** : Help to use css properties without browser's vendor prefix.
* **animate** : Support transform and 3d acceleration extending jQuery's animate.

#### Events
* **rotate** : Trigger event detecting device orientation.
* **scrollEnd** : Trigger event detecting end of scroll's position.

## Download
For latest version, check out - http://jindo.nhncorp.com/eg/dist/latest

### Uncompressed (for development)
  - Latest : http://jindo.nhncorp.com/eg/dist/latest/eg.js  
  - For specific version :  `http://jindo.nhncorp.com/eg/dist/[VERSION]/eg.js`

### Compressed (for production)
  - Latest : http://jindo.nhncorp.com/eg/dist/latest/eg.min.js  
  - For specific version : `http://jindo.nhncorp.com/eg/dist/[VERSION]/eg.min.js`

### with Bower

```bash
# Intall naver-bower (if not installed)
# install naver-bower globally (admin account required)
$ npm install naver-bower -g

# then intall egjs using naver-bower
$ naver-bower install egjs
```

## Browser support

|Internet Explorer|Chrome|FireFox|Safari|iOS|Android|NAVER App iOS|NAVER App Android|
|---|---|---|---|---|---|---|---|
|7+|Latest|Latest|Latest|7+|2.3+ (except 3.x)|Latest|Latest|
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


## How to start develop egjs
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
$ git clone http://username@oss.navercorp.com/egjs/egjs.git

# install npm & bower dependency modules
$ npm install
$ bower install
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
If you find a bug, please report us via [issues page](https://oss.navercorp.com/egjs/egjs/issues).

## License
egjs is released under the [LGPL v2](http://www.gnu.org/licenses/old-licenses/lgpl-2.0.html) license.