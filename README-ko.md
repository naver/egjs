# egjs
[![Build Status](https://travis-ci.org/naver/egjs.svg?branch=master)](https://travis-ci.org/naver/egjs) [![Test coverage](https://codeclimate.com/github/naver/egjs/badges/coverage.svg)](https://codeclimate.com/github/naver/egjs/coverage)

egjs는 jQuery를 기반으로 하는 JavaScript 라이브러리로, UI 인터랙션, 이펙트, 유틸리티로 구성된 통합 라이브러리다. egjs로 다양한 환경을 지원하는 빠른 웹 어플리케이션을 쉽게 개발할 수 있다.

* egjs 사용 예: http://codepen.io/egjs
* API 문서
    - 최종 버전 API 문서: https://naver.github.io/egjs/latest/doc
    - 버전별 API 문서: https://naver.github.io/egjs/[버전]/doc
* [영어 readme](README.md)

### 컴포넌트

egjs가 제공하는 컴포넌트는 다음과 같다.

* eg: egjs에서 사용하는 기본 유틸리티 모듈. egjs의 기본 네임스페이스다.
  - [API 문서](http://naver.github.io/egjs/latest/doc/eg.html)
  - [모듈 사용 예](http://naver.github.io/egjs/demo/eg/) 
* eg.Class: 객체지향 프로그래밍 방식으로 클래스를 개발할 수 있게 하는 모듈
  - [API 문서](http://naver.github.io/egjs/latest/doc/eg.Class.html)
  - [모듈 사용 예](http://naver.github.io/egjs/demo/class/) 
* eg.Component: 모듈의 이벤트와 옵션을 관리할 수 있게 하는 클래스
  - [API 문서](http://naver.github.io/egjs/latest/doc/eg.Component.html)
  - [모듈 사용 예](http://naver.github.io/egjs/demo/component/) 
* eg.MovableCoord: 사용자의 동작을 가상 좌표계의 논리적 좌표로 변경하는 모듈
  - [API 문서](http://naver.github.io/egjs/latest/doc/eg.MovableCoord.html)
  - [모듈 사용 예](http://naver.github.io/egjs/demo/movableCoord/), [모듈 사용 예(CodePen)](http://codepen.io/collection/AKpkGW/)
* eg.Flicking: 플리킹 UI를 구현하는 모듈
  - [API 문서](http://naver.github.io/egjs/latest/doc/eg.Flicking.html)
  - [모듈 사용 예](http://naver.github.io/egjs/demo/flicking/), [모듈 사용 예(CodePen)](http://codepen.io/collection/ArxyLK/)
* eg.Visible: 엘리먼트가 기준 엘리먼트나 뷰포트 안에 보이는지 확인하는 모듈
  - [API 문서](http://naver.github.io/egjs/latest/doc/eg.Visible.html)
  - [모듈 사용 예](http://naver.github.io/egjs/demo/visible/), [모듈 사용 예(CodePen)](http://codepen.io/collection/Ayrabj/)
* eg.infiniteGrid: 콘텐츠가 있는 카드 엘리먼트를 그리드 레이아웃에 무한으로 배치하는 모듈
  - [API 문서](http://naver.github.io/egjs/latest/doc/eg.InfiniteGrid.html)
  - [모듈 사용 예](http://naver.github.io/egjs/demo/infiniteGrid/), [모듈 사용 예(CodePen)](http://codepen.io/collection/DPYEww/)

### jQuery 확장 플러그인

egjs는 jQuery를 확장한 메서드와 이벤트를 제공한다.

#### 확장 메서드

egjs의 jQuery 확장 메서드는 다음과 같다.

* persist() 메서드: 웹 페이지의 현재 상태를 키에 JSON 형식으로 저장한다.
  - [API 문서](http://naver.github.io/egjs/latest/doc/jQuery.html#persist)
  - [메서드 사용 예](http://naver.github.io/egjs/demo/persist/), [메서드 사용 예(CodePen)](http://codepen.io/collection/XOLpog/)
* prefixCss() 메서드: CSS 속성의 제조사 접두어(vendor prefix)를 지원하지 않는 일부 jQuery 버전(1.4.3 ~ 1.7.x)을 사용할 때 제조사 접두어를 지원할 수 있게 한다.
  - [API 문서](http://naver.github.io/egjs/latest/doc/jQuery.html#persist)
  - [메서드 사용 예](http://naver.github.io/egjs/demo/cssPrefix/)
* animate() 메서드: jQuery의 animate() 메서드를 확장한 메서드. CSS의 transform 속성과 3D 가속을 사용할 수 있다.
  - [API 문서](http://naver.github.io/egjs/latest/doc/jQuery.html#animate)
  - [메서드 사용 예](http://naver.github.io/egjs/demo/transform/)
* pause() 메서드, resume() 메서드: jQuery의 animate() 메서드로 실행한 애니메이션을 일시 정지하고 다시 실행한다.
  - [API 문서](http://naver.github.io/egjs/latest/doc/jQuery.html#pause)
  - [메서드 사용 예](http://naver.github.io/egjs/demo/pauseResume/), [메서드 사용 예(CodePen)](http://codepen.io/collection/XOEpOw)

#### 이벤트

egjs의 jQuery 확장 이벤트는 다음과 같다.

* rotate: 모바일 기기의 회전을 감지하는 이벤트
  - [API 문서](http://naver.github.io/egjs/latest/doc/jQuery.html#event:rotate)
  - [이벤트 사용 예](http://naver.github.io/egjs/demo/rotate/), [이벤트 사용 예(CodePen)](http://codepen.io/collection/nLYYqP/)
* scrollend: 스크롤의 마지막 시점을 감지하는 이벤트
  - [API 문서](http://naver.github.io/egjs/latest/doc/jQuery.html#event:scrollEnd)
  - [이벤트 사용 예](http://naver.github.io/egjs/demo/scrollEnd/), [이벤트 사용 예(CodePen)](http://codepen.io/collection/Dxeemo/)

## 다운로드 및 설치

egjs는 JavaScript 파일을 다운로드해 사용하거나 Bower, npm 등으로 설치해 사용한다.

### 개발 버전 다운로드(소스 코드 압축 안 함)

소스 코드를 압축하지 않은 개발 버전을 다운로드할 수 있는 경로는 다음과 같다.

* 최신 버전: http://naver.github.io/egjs/latest/dist/eg.js
* 버전별 다운로드: http://naver.github.io/egjs/[버전]/dist/eg.js

### 제품 버전 다운로드(소스 코드 압축)

소스 코드를 압축한 제품 버전을 다운로드할 수 있는 경로는 다음과 같다.

* 최신 버전: http://naver.github.io/egjs/latest/dist/eg.min.js
* 버전별 다운로드: http://naver.github.io/egjs/[버전]/dist/eg.min.js

### CDN 사용

CDN으로 제공하는 파일을 링크하려면 다음 CDN 서비스에서 파일의 URL을 확인한다.

* cdnjs: https://cdnjs.com/libraries/egjs
* jsDelivr: https://www.jsdelivr.com/projects/egjs

### Bower로 설치

Bower가 설치되지 않았다면 다음과 같이 npm을 이용해 Bower를 설치한다.

```bash
$ npm install bower -g
```

Bower를 이용해 egjs를 설치하는 방법은 다음과 같다.

```bash
$ bower install egjs
```

### npm으로 설치

npm을 이용해 egjs를 설치하는 방법은 다음과 같다.

```bash
$ npm install egjs
```

## 브라우저 지원

egjs가 기본으로 지원하는 브라우저는 다음과 같다.

|Internet Explorer|Chrome|Firefox|Safari|iOS|Android|
|---|---|---|---|---|---|
|7+|최신 버전|최신 버전|최신 버전|7+|2.3+(3.x 버전은 제외)|

> 모듈별로 지원 브라우저와 버전이 다를 수 있으므로 모듈을 사용하기 전에 API 문서를 참고한다.

## 의존성
egjs는 다음 라이브러리에 의존성이 있다.

|[jQuery](https://jquery.com/)(필수)|[Hammer.JS](http://hammerjs.github.io/)|
|---|---|---|
|1.7.0+ |2.0.4+|

> jQuery를 제외한 다른 라이브러리의 의존성은 모듈에 따라 다르다. 모듈을 사용하기 전에 API 문서를 참고한다.

의존성 라이브러리를 추가할 때, `yarn`을 사용한다.
```
yarn add: 사용하는 package을 추가한다.
yarn init: 개발하는 package을 초기화 한다.
yarn install: package.json에 등록된 모든 의존성 package들을 설치한다.
yarn publish: package manager로 package을 배포한다.
yarn remove: 사용하지 않는 package을 삭제한다.
```
좀 더 자세한 내용은 [API 문서](https://yarnpkg.com/en/docs/cli/)를 참고한다.

## 사용 방법

jQuery를 먼저 로딩한 다음 egjs를 로딩하게 설정한다.

```html
...
<!-- jQuery 로딩 -->
<script src="node_modules/jquery/dist/jquery.js"></script>

<!-- 모든 의존성(Hammer.js) 파일이 패키징된 egjs를 로딩 -->
<!-- 로컬에 설치된 파일을 로딩 -->
<script src="bower_components/egjs/dist/pkgd/eg.pkgd.min.js"></script>

<!-- 또는 CDN에서 로딩 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/egjs/1.3.0/pkgd/eg.pkgd.min.js"></script>
...
```

> **참고**  
> jQuery 이외의 의존성 파일을 로딩하는 방법은 GitHub 저장소의 위키 문서에서 "[Download and Using egjs](https://github.com/naver/egjs/wiki/Download-and-Using-egjs#how-to-use)" 페이지를 참고한다.

egjs 컴포넌트를 사용하려면 다음과 같이 네임스페이스인 `eg`를 붙여 사용한다.

```javascript
var Klass = eg.Class({
    "construct" : function(){}
});
var Komponent = eg.Class.extend(eg.Component,{
    "construct" : function(){}
});
```

## egjs 개발

egjs를 개발하려면 다음과 같이 개발 환경을 설정한다.

### 개발 환경 설정

#### 1. grunt-cli 설치

grunt-cli를 전역으로 설치한다.

```bash

$ npm install grunt-cli -g  # grunt-cli 설치
```

#### 2. 저장소 복제와 의존성 모듈 설치

egjs 저장소를 복제하고 Bower 의존성 모듈과 npm 의존성 모듈을 설치한다.

```bash
# 폴더 생성 및 이동
$ mkdir egjs && cd egjs

# 저장소에서 코드를 복제
$ git clone https://github.com/naver/egjs.git

# node 의존성 모듈들을 설치
$ npm install
```

#### 3. 빌드

Grunt로 egjs를 빌드한다.

```bash
$ grunt build
```

빌드가 정상적으로 완료되면 폴더가 두 개 생성된다.

- **dist** 폴더: **eg.js** 파일과 **eg.min.js** 파일이 생성된다.
- **doc** 폴더: API 문서가 있는 폴더다. API 문서의 시작 페이지는 **doc/index.html** 파일이다.

### 테스트

브랜치를 생성해 개발을 완료하면 코드를 원격 저장소에 푸시하기 전에 반드시 `grunt test` 명령어로 테스트를 실행해야 한다.

```bash
$ grunt test
```
`grunt test` 명령어를 실행하면, [JShint](http://jshint.com/)와 [JSCS](http://jscs.info/), [QUnit](https://qunitjs.com/), [istanbul](https://gotwarlost.github.io/istanbul/) 작업을 진행한다.
* JShint와 JSCS: 정적 검사와 코드 스타일 확인을 실행한다.
* QUnit: egjs의 단위 테스트를 실행한다.
* istanbul: 테스트 커버리지를 측정한다. 테스트 커버리지 측정 결과는 Grunt 실행이 완료되면 확인할 수 있으며, **./report/index.html** 파일로도 테스트 커버리지 측정 결과를 확인할 수 있다.

## 이슈 등록

버그를 발견하면 GitHub 저장소의 [Issues](https://github.com/naver/egjs/issues) 페이지에 등록할 수 있다.

## 라이선스
egjs는 [MIT 라이선스](http://naver.github.io/egjs/license.txt)로 배포된다.

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
