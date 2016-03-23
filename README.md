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
