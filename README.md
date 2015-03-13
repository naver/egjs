## Project setting

npm, grunt-cli, bower를 각자 설치 후, 다음 명령어를 이용하여 프로젝트를 설정한다.
```
git clone http://사용자아이디@yobi.navercorp.com/Front-End/EvergreenJs
cd EvergreenJs
npm install
bower install
```

## Test
branch를 생성한 후, 개발이 완료되면, push 하기 전에 `꼭! 단위 테스트를 수행`한다.

grunt 를 실행하면, jshint, qunit, istanbul coverage 측정이 실행된다.
```
grunt
```
- coverage 결과는 grunt 실행시 확일 할수 있다.
- coverage 결과는 ./report/index.html 파일을 통해 확인 할 수 있다.
