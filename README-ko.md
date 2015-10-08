## egjs

egjs는 jQuery기반의 UI 인터랙션, 이펙트, 유틸리티로 구성된 통합 라이브러리로써 다양한 환경을 지원하는 빠른 웹어플리케이션을 쉽게 개발할 수 있도록 도와줍니다. 

> - **데모**: http://codepen.io/egjs/
> - **API 문서**
    - Latest : http://jindo.nhncorp.com/eg
    - For specific version : `http://jindo.nhncorp.com/eg/[VERSION]/`

- [English(영어) readme](README.md)

### Component
* **eg** : eg에서 필요한 유틸리티
* **eg.Class** : 객체 지향으로 개발하는데 도와주는 Class.
* **eg.Component** : 컴포넌트를 개발하는데 공통적인 기능을 가진 Class
* **eg.MovableCoord** : 사용자 행동에 따른 좌표를 계산하는 Component
* **eg.Flicking** : 플리킹 인터랙션을 구현하는 Component
* **eg.Visible** : 엘리먼트가 viewport상에 있는지 확인하는 Component
* **eg.infiniteGrid** : 카드 격자형 컨텐츠를 무한 배치하는 Component
 
### jQuery Extensions
#### methods
* **persit** : 데이터를 저장하고 persist이벤트에서 저장한 데이트를 사용할 수 있게 하는 메서드
* **css** : jQuery버전에서 자동으로 vendor prefix을 지원하지 않는 경우 prefix없이 사용하게 하는 확장기능
* **animate** : jQuery animate 확장해 transform 및 3d 가속 지원

#### events
* **rotate** : 회전을 알려주는 이벤트
* **scrollend** : 스크롤의 마지막 시점을 알려주는 이벤트


## Download
최신버전은 http://jindo.nhncorp.com/eg/dist/latest 에서 다운로드 받으실 수 있다.

### Uncompressed (개발버전)
  - 최신 : http://jindo.nhncorp.com/eg/dist/latest/eg.js  
  - 버전별 다운로드 :  `http://jindo.nhncorp.com/eg/dist/[VERSION]/eg.js`

### Compressed (제품버전)
  - 최신 : http://jindo.nhncorp.com/eg/dist/latest/eg.min.js  
  - 버전별 : `http://jindo.nhncorp.com/eg/dist/[VERSION]/eg.min.js`

### with Bower

```bash
# naver-bower 설치 (설치되지 않은 경우)
# naver-bower를 전역으로 설치 (관리자 계정 필요)
$ npm install naver-bower -g

# naver-bower를 이용해 egjs 설치
$ naver-bower install egjs
```

## Browser Support
|Internet Explorer|Chrome|FireFox|Safari|iOS|Android|네이버앱 iOS|네이버앱 Android|
|---|---|---|---|---|---|---|---|
|7+|최신|최신|최신|7+|2.3+ (3.x는 제외)|최신|최신|
- 컴포넌트별 지원범위가 다를수 있으며, 사용시 API 문서를 참조한다.

## 의존성
egjs는 다음의 라이브러리들에 대한 의존성을 가지고 있다. 

|[jQuery](https://jquery.com/)|[hammer.js](http://hammerjs.github.io/)|[Outlayer](https://github.com/metafizzy/outlayer/)|
|---|---|---|---|
|1.7.0+ |2.0.4+|1.4.2+|

- jQuery를 제외한 나머지는 반드시 필요하진 않으며, 컴포넌트에 따라 의존성은 다를 수 있다.


## 사용방법
의존성 라이브러리(jquery.js, hammer.js, outlayer.js) 들을 먼저 로딩 후, eg.js(또는 eg.min.js)를 로딩한다.

```html
<script src="bower_components/jquery/jquery.js"></script>
<script src="bower_components/hammer.js/hammer.js"></script>
<script src="bower_components/outlayer/outlayer.js"></script>
<script src="dist/eg.js"></script>
```

egjs를 사용할 준비가 되었다.
egjs는 `eg` 네임스페이스를 갖으며, 다음의 예제와 같이 사용한다.

```javascript
var Klass = eg.Class({
    "construct" : function(){}
});
var Komponent = eg.Class.extend(eg.Component,{
    "construct" : function(){}
});
```


## egjs 개발
egjs를 개발하고자 하는 개발자는 아래 순서대로, 개발 환경을 구성한다.

### Project setting
#### 1. grunt-cli, bower 설치
```bash
# grunt-cli와 bower를 전역으로 설치 (관리자 계정 필요)
$ npm install grunt-cli -g  # grunt-cli
$ npm install bower -g  # bower
```

#### 2. 다음 명령어를 이용해 저장소 복제와 의존성 모듈을 설치한다.
```bash
# 폴더 생성 및 이동
$ mkdir egjs && cd egjs

# 저장소로부터 코드를 복제
$ git clone https://oss.navercorp.com/egjs/egjs.git

# npm과 bower 의존성 모듈 설치
$ npm install
$ bower install
```

#### 3. Build
grunt의 build 태스크를 실행하여, 빌드작업을 진행한다.

```bash
$ grunt build
```
빌드가 정상적으로 완료되면 :

- `dist` 폴더에 `eg.js`와 `eg.min.js`이 생성된다.
- API 문서는 `doc` 폴더에 생성되며, `doc/index.html`으로 접근할 수 있다.


### 테스트
branch를 생성한 후, 개발이 완료되면 push 하기 전에 `꼭! 단위 테스트를 수행`한다.
grunt test를 실행하면, jshint, qunit, istanbul coverage 측정이 실행된다.
```bash
$ grunt test
```
- coverage 결과는 grunt 실행시 확인할 수 있으며, `./report/index.html` 파일을 통해 확인 할 수도 있다.

## 이슈등록
버그를 발견하게 되면, [issues page](https://oss.navercorp.com/egjs/egjs/issues) 페이지를 통해 등록할 수 있다.

## 라이센스
egjs는 [LGPL v2](http://www.gnu.org/licenses/old-licenses/lgpl-2.0.html)로 배포된다.