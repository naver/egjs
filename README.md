# naver.github.io/egjs
## requires
egjs gh-pages requires [Jekyll](http://jekyllrb.com/)


## clone
```
git clone -b gh-pages https://github.com/naver/egjs.git egjs-gh-pages
cd egjs-gh-pages
npm install
```

##jekyll serve
```
npm run jekyll:serve
```

Open http://localhost:4000


## create latest directory
update latestVersion property in ```_config.yml```

and
```
grunt build:latest
```

It will
* Create latest folder and copy latest version of egjs files.

## publish
Push update files to publish
```
git commit -m "update gh-pages"
git push origin gh-pages
```

open https://naver.github.io/egjs

#develop demo
Demo based on jekyll. Refer to [jekyll docs](https://jekyllrb.com/docs/home/) for details.

## create ```<demo_target>``` directory
```
cd demo
mkdir <demo_target>
```

## create index.html in ```<demo_target>```
```
---
layout: demo
title: <demo_title>
target: <demo_target>
desc: <demo_description>
js_srcs:
  - <js files to required>
  - ...
css_srcs:
  - <css files to required>
  - ...
---
```

for example
```
---
layout: demo
title: Demo :: egjs flicking
target: flicking
desc: A free mobile-friendly Bootstrap theme designed to help developers promote their personal projects
js_srcs:
  - http://naver.github.io/egjs/latest/dist/pkgd/eg.pkgd.min.js
  - demo.js
css_srcs:
  - demo.css
---
```

## create started.md in ```<demo_target>```
Started description in markdown.<br>
Refer to https://raw.githubusercontent.com/naver/egjs/gh-pages/demo/flicking/started.md

## create demo.md in ```<demo_target>```
Demo description in markdown.<br>
Refer to https://raw.githubusercontent.com/naver/egjs/gh-pages/demo/flicking/demo.md

