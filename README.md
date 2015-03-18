## Project setting

grunt-cli, bower를 각자 global로 설치 후, 다음 명령어를 이용하여 프로젝트를 설정한다.
```
git clone http://사용자아이디@yobi.navercorp.com/Front-End/EvergreenJs
cd EvergreenJs
npm install
bower install
```

## Build
grunt의 build 를 실행하여, 배포 버전을 생성한다.
```
grunt build
```
- 빌드가 정상적으로 완료되면 `dist` 디렉토리에 evergreen.js 와 evergreen.min.js 가 생성된다.
- evergreen.js와 의존성이 있는 라이브러리는 `dist/lib` 폴더로 생성된다.

![스크린샷 2015-03-18 오후 2.20.41.png](/files/36709)


## Test
branch를 생성한 후, 개발이 완료되면, push 하기 전에 `꼭! 단위 테스트를 수행`한다.

grunt test를 실행하면, jshint, qunit, istanbul coverage 측정이 실행된다.
```
grunt test
```
- coverage 결과는 grunt 실행시 확일 할수 있다.
- coverage 결과는 ./report/index.html 파일을 통해 확인 할 수 있다.
![스크린샷 2015-03-18 오후 2.24.54.png](/files/36712)

## 사용방법
- 빌드후 나온 `dist/lib` 폴더에 있는 라이브러리(jquery, jquery.easing.js, hammer.js)를 script의 src로 추가한다.
- `dist` 디렉토리에 evergreen.js 나 evergreen.min.js을 script의 src로 추가한다.
- 아래와 같이 eg라는 네임스페이스가 있는 컴포넌트를 사용할 수 있다.
```
var Klass = eg.Class({
	"construct" : function(){}
});
var Komponent = eg.Class.extend(eg.Component,{
	"construct" : function(){}
});
```
