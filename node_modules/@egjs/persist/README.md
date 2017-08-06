# egjs-persist [![npm version](https://badge.fury.io/js/%40egjs%2Fpersist.svg)](https://badge.fury.io/js/%40egjs%2Fpersist) [![Build Status](https://travis-ci.org/naver/egjs-persist.svg?branch=master)](https://travis-ci.org/naver/egjs-persist) [![Coverage Status](https://coveralls.io/repos/github/naver/egjs-persist/badge.svg?branch=master)](https://coveralls.io/github/naver/egjs-persist?branch=master)

Provide cache interface to handle persisted data among history navigation.

## Documents
- [Get Started and Demos](https://naver.github.io/egjs-persist/)
- [API documentation](https://naver.github.io/egjs-persist/release/latest/doc/)

## Download and Installation

Download dist files from repo directly or install it via npm. 

### For development (Uncompressed)

You can download the uncompressed files for development

- Latest : https://naver.github.io/egjs-persist/release/latest/dist/persist.js
- Specific version : https://naver.github.io/egjs-persist/release/[VERSION]/dist/persist.js

### For production (Compressed)

You can download the compressed files for production

- Latest : https://naver.github.io/egjs-persist/release/latest/dist/persist.min.js
- Specific version : https://naver.github.io/egjs-persist/release/[VERSION]/dist/persist.min.js


### Installation with npm

The following command shows how to install egjs-persist using npm.

```bash
$ npm install @egjs/persist
```


## Supported Browsers
The following are the supported browsers.

|Internet Explorer|Chrome|Firefox|Safari|iOS|Android|
|---|---|---|---|---|---|
|9+|latest|latest|latest|7+|2.3+ (except 3.x)|



## How to start developing egjs-persist?

For anyone interested to develop egjs-persist, follow the instructions below.

### Development Environment

#### 1. Clone the repository

Clone the egjs-persist repository and install the dependency modules.

```bash
# Clone the repository.
$ git clone https://github.com/naver/egjs-persist.git
```

#### 2. Install dependencies
`npm` is supported.

```
# Install the dependency modules.
$ npm install
```

#### 3. Build

Use npm script to build billboard.js

```bash
# Run webpack-dev-server for development
$ npm start

# Build
$ npm run build

# Generate jsdoc
$ npm run jsdoc
```

Two folders will be created after complete build is completed.

- **dist** folder: Includes the **persist.js** and **persist.min.js** files.
- **doc** folder: Includes API documentation. The home page for the documentation is **doc/index.html**.

### Linting

To keep the same code style, we adopted [ESLint](http://eslint.org/) to maintain our code quality. The [rules](https://github.com/naver/eslint-config-naver/tree/master/rules) are modified version based on [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).
Setup your editor for check or run below command for linting.

```bash
$ npm run lint
```

### Test

Once you created a branch and done with development, you must perform a test running `npm run test` command before you push code to a remote repository.

```bash
$ npm run test
```
Running a `npm run test` command will start [Mocha](https://mochajs.org/) tests via [Karma-runner](https://karma-runner.github.io/).


## Bug Report

If you find a bug, please report it to us using the [Issues](https://github.com/naver/egjs-persist/issues) page on GitHub.


## License
egjs-persist is released under the [MIT license](http://naver.github.io/egjs/license.txt).


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
