## Downloading egjs using Naver-bower
### 1. naver-bower 설치
```
npm install naver-bower -g // naver-bower를 전역으로 설치한다 (관리자 계정 필요)
```
### 2. naver-bower를 이용하여 egjs 설치
```
naver-bower install egjs
```

## Download URL
egjs는 http://jindo.nhncorp.com/eg/dist 을 통해 버전별 다운로드 링크를 제공한다.

 - 개발버전
```
http://jindo.nhncorp.com/eg/dist/[버전]/eg.js
```
 - 제품버전
```
http://jindo.nhncorp.com/eg/dist/[버전]/eg.min.js
```

## Browser Support
`jQuery 1.7 이상`에서 egjs를 사용하실수 있습니다.

|Internet Explorer|Chrome|FireFox|Safari|iOS|Android|네이버앱 iOS|네이버앱 Android|
|---|---|---|---|---|---|---|---|
|10+|최신|최신|최신|7+|2.3+ (3.x는 제외)|최신|최신|
- 컴포넌트별 지원범위가 다를수 있으며, 사용시 API 문서를 참조한다.

## 의존 라이브러리
|jQuery|jquery.easing|hammer.js|
|1.7.0+ |1.3.1+|2.0.4+|

## Demo 
http://codepen.io/egjs/

## API
http://jindo.nhncorp.com/eg 를 통해 최신 egjs의 API 문서를 볼 수 있다.
또한, `http://jindo.nhncorp.com/eg/[버전]/` 을 통해 버전별 API 문서를 제공한다.

## Usage
- egjs의 `dist/lib`에 있는 라이브러리(jquery.js, jquery.easing.js, hammer.js)를 script의 src로 추가한다.
- `dist` 디렉토리에 eg.js 나 eg.min.js을 script의 src로 추가한다.
- 아래와 같이 eg라는 네임스페이스가 있는 컴포넌트를 사용할 수 있다.

```
<script src="bower_components/egjs/dist/lib/jquery.js"></script>
<script src="bower_components/egjs/dist/lib/jquery.easing.js"></script>
<script src="bower_components/egjs/dist/lib/hammer.js"></script>
<script src="bower_components/egjs/dist/eg.min.js"></script>

<script>
var Klass = eg.Class({
    "construct" : function(){}
});
var Komponent = eg.Class.extend(eg.Component,{
    "construct" : function(){}
});
</script>
```


## egjs 개발
egjs를 개발하고자 하는 개발자는 아래 순서대로, 개발 환경을 구성한다.

### Project setting
#### 1. grunt-cli, bower 설치
```
npm install grunt-cli -g // grunt-cli를 전역으로 설치한다 (관리자 계정 필요)
npm install bower -g // bower를 전역으로 설치한다 (관리자 계정 필요)
```

#### 2. 다음 명령어를 이용하여 프로젝트를 설정한다.
```
git clone http://사용자아이디@yobi.navercorp.com/Front-End/egjs
cd egjs
npm install
bower install
```

#### 3. Build
grunt의 build를 실행하여, 빌드작업을 진행한다.
```
grunt build
```
- 빌드가 정상적으로 완료되면 `dist` 디렉토리에 eg.js 와 eg.min.js 가 생성된다.
- eg.js와 의존성이 있는 라이브러리는 `dist/lib` 폴더로 생성된다.
- API문서는 `doc/index.html` 로 생성된다.

### Test
branch를 생성한 후, 개발이 완료되면, push 하기 전에 `꼭! 단위 테스트를 수행`한다.

grunt test를 실행하면, jshint, qunit, istanbul coverage 측정이 실행된다.
```
grunt test
```
- coverage 결과는 grunt 실행시 확일 할수 있다.
- coverage 결과는 ./report/index.html 파일을 통해 확인 할 수 있다.
