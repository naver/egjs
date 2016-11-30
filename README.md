# egjs
[![Build Status](https://travis-ci.org/naver/egjs.svg?branch=master)](https://travis-ci.org/naver/egjs) [![Test coverage](https://codeclimate.com/github/naver/egjs/badges/coverage.svg)](https://codeclimate.com/github/naver/egjs/coverage)

egjs is a jQuery-based JavaScript library consisting of UI interactions, effects, and utilities, which brings easiest and fastest way to build a web application in your way.

* Usage Examples of egjs: http://codepen.io/egjs
* API Documentation
    - Latest: https://naver.github.io/egjs/latest/doc
    - Specific version: https://naver.github.io/egjs/[VERSION]/doc
* [한국어 readme](README-ko.md)

### Components

The following is a list of egjs components.

* eg: As a default namespace, it is a collection of base utilities for egjs, which is used in diverse components. 
  - [API Documentation](http://naver.github.io/egjs/latest/doc/eg.html)
  - [Usage Examples](http://naver.github.io/egjs/demo/eg/)
* eg.Class: A module that enables developing classes in object-oriented programming style.
  - [API Documentation](http://naver.github.io/egjs/latest/doc/eg.Class.html)
  - [Usage Examples](http://naver.github.io/egjs/demo/class/)
* eg.Component: A base class utility that manages events and options in modules.
  - [API Documentation](http://naver.github.io/egjs/latest/doc/eg.Component.html)
  - [Usage Examples](http://naver.github.io/egjs/demo/component/)
* eg.MovableCoord: A module that transforms user coordinates into logical coordinates in a virtual coordinate system. 
  - [API Documentation](http://naver.github.io/egjs/latest/doc/eg.MovableCoord.html)
  - [Usage Examples](http://naver.github.io/egjs/demo/movableCoord/), [Usage Examples (CodePen)](http://codepen.io/collection/AKpkGW/)
* eg.Flicking: A module that implements flicking.
  - [API Documentation](http://naver.github.io/egjs/latest/doc/eg.Flicking.html)
  - [Usage Examples](http://naver.github.io/egjs/demo/flicking/), [Usage Examples (CodePen)](http://codepen.io/collection/ArxyLK/)
* eg.Visible: A module that checks if an element is visible in the base element or viewport.
  - [API Documentation](http://naver.github.io/egjs/latest/doc/eg.Visible.html)
  - [Usage Examples](http://naver.github.io/egjs/demo/visible/), [Usage Examples (CodePen)](http://codepen.io/collection/Ayrabj/)
* eg.infiniteGrid: A module that arranges infinite card elements including content on a grid.
  - [API Documentation](http://naver.github.io/egjs/latest/doc/eg.InfiniteGrid.html)
  - [Usage Examples](http://naver.github.io/egjs/demo/infiniteGrid/), [Usage Examples (CodePen)](http://codepen.io/collection/DPYEww/)

### jQuery Extensions

egjs provides methods and events extended from jQuery.

#### Methods

The following is a list of methods extended from jQuery.

* persist() method: Stores the current state of a webpage into a key in JSON.
  - [API Documentation](http://naver.github.io/egjs/latest/doc/jQuery.html#persist)
  - [Usage Examples](http://naver.github.io/egjs/demo/persist/), [Usage Examples (CodePen)](http://codepen.io/collection/XOLpog/)
* prefixCss() method: Enables to add CSS vendor prefixes when you use some jQuery version(1.4.3 ~ 1.7.x) that does not support them.
  - [API Documentation](http://naver.github.io/egjs/latest/doc/jQuery.html#persist)
  - [Usage Examples](http://naver.github.io/egjs/demo/cssPrefix/)
* animate() method: A method extended from the jQuery animate() method. It supports CSS transform property and 3D acceleration.
  - [API Documentation](http://naver.github.io/egjs/latest/doc/jQuery.html#animate)
  - [Usage Examples](http://naver.github.io/egjs/demo/transform/)
* pause() and resume() methods: Pauses and resumes animation executed by the jQuery animate() method.
  - [API Documentation](http://naver.github.io/egjs/latest/doc/jQuery.html#pause)
  - [Usage Examples](http://naver.github.io/egjs/demo/pauseResume/), [Usage Examples (CodePen)](http://codepen.io/collection/XOEpOw)

#### Events

The following is a list of events extended from jQuery.

* rotate: An event that detects the orientation of the mobile device.
  - [API Documentation](http://naver.github.io/egjs/latest/doc/jQuery.html#event:rotate)
  - [Usage Examples](http://naver.github.io/egjs/demo/rotate/), [Usage Examples (CodePen)](http://codepen.io/collection/nLYYqP/)
* scrollend: An event that detects the scrolling to bottom of the page.
  - [API Documtation](http://naver.github.io/egjs/latest/doc/jQuery.html#event:scrollEnd)
  - [Usage Examples](http://naver.github.io/egjs/demo/scrollEnd/), [Usage Examples (CodePen)](http://codepen.io/collection/Dxeemo/)

## Downloads and Installation

In order to use egjs, you should download the JavaScript files or install it using Bower or npm. 

### For development (Uncompressed)

You can download the uncompressed files for development version from the following locations:

* Latest: http://naver.github.io/egjs/latest/dist/eg.js
* Specific version: http://naver.github.io/egjs/[VERSION]/dist/eg.js

### For production (Compressed)

You can download the compressed files for production version from the following locations:
* Latest: http://naver.github.io/egjs/latest/dist/eg.min.js
* Specific version: http://naver.github.io/egjs/[VERSION]/dist/eg.min.js

### Using CDN

To create a link to a file provided over CDN, you must check the file URL in the CDN service.

* cdnjs: https://cdnjs.com/libraries/egjs
* jsDelivr: https://www.jsdelivr.com/projects/egjs

### Installation with Bower

If you do not have Bower installed, install it using npm as follows:

```bash
$ npm install bower -g
```

The following code shows how to install egjs using Bower.

```bash
$ bower install egjs
```

### Installation with npm

The following code shows how to install egjs using npm.

```bash
$ npm install egjs
```

## Supported Browsers

The following table shows browsers supported by egjs.

|Internet Explorer|Chrome|Firefox|Safari|iOS|Android|
|---|---|---|---|---|---|
|7+|Latest|Latest|Latest|7+|2.3+(except 3.x)|

> Supported browser types and versions may vary depending on modules. For more information, see API documentation.

## Dependency
egjs has the dependencies for the following libraries:

|[jQuery](https://jquery.com/) (required)|[Hammer.JS](http://hammerjs.github.io/)|
|---|---|---|
|1.7.0+ |2.0.4+|

> Except jQuery, library dependencies may vary depending on modules. For more information, see API documentation.

When add dependency library have to use `yarn`. 
```
yarn add: adds a package to use in your current package.
yarn init: initializes the development of a package.
yarn install: installs all the dependencies defined in a package.json file.
yarn publish: publishes a package to a package manager.
yarn remove: removes an unused package from your current package.
```
For more information, see [API documentation](https://yarnpkg.com/en/docs/cli/).

## How to Use

Let egjs load after jQuery loads.

```html
...
<!-- Load jQuery -->
<script src="node_modules/jquery/dist/jquery.js"></script>

<!-- Load egjs packaged with all dependencies (Hammer.js) -->
<!-- Load from your local installation -->
<script src="bower_components/egjs/dist/pkgd/eg.pkgd.min.js"></script>

<!-- Or load from CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/egjs/1.3.0/pkgd/eg.pkgd.min.js"></script>
...
```

> **Note**  
> For more information on loading dependency files except jQuery, see the "[Download and Using egjs](https://github.com/naver/egjs/wiki/Download-and-Using-egjs#how-to-use)" page on GitHub Wikis.

You need to add the namespace, "eg", to use the egjs components as shown in the example below.

```javascript
var Klass = eg.Class({
    "construct" : function(){}
});
var Komponent = eg.Class.extend(eg.Component,{
    "construct" : function(){}
});
```

## egjs Development

For anyone interested to develop egjs, follow the instructions below.

### Development Environment

#### 1. Install grunt-cli

Install grunt-cli globally.

```bash
$ npm install grunt-cli -g  # Install grunt-cli
```

#### 2. Clone the repository and install dependencies

Clone the egjs depository and install the Bower and npm dependency modules.

```bash
# Create and move a folder.
$ mkdir egjs && cd egjs

# Clone a repository.
$ git clone https://github.com/naver/egjs.git

# Install the node dependencies modules.
$ npm install
```

#### 3. Build

Use Grunt to build egjs.

```bash
$ grunt build
```

Two folders will be created after complete build is completed.

- **dist** folder: Includes the **eg.js** and **eg.min.js** files.
- **doc** folder: Includes API documentation. The home page for the documentation is **doc/index.html**.

### Test

Once you create a branch and done with development, you must perform a test using the "grunt test" command before you push code to a remote repository.

```bash
$ grunt test
```
Running a "grunt test" command will start [JShint](http://jshint.com/), [JSCS](http://jscs.info/), [QUnit](https://qunitjs.com/), and [istanbul](https://gotwarlost.github.io/istanbul/).
* JShint and JSCS: Performs static checking and code style checking.
* QUnit: Performs unit tests of egjs.
* istanbul: Measures test coverage. The test results can be verified once the Grunt task is completed. Or you can use the **./report/index.html** file to verify them.

## Bug Report

If you find a bug, please report it to us using the [Issues](https://github.com/naver/egjs/issues) page on GitHub.

## License
egjs is released under the [MIT license](http://naver.github.io/egjs/license.txt).

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
