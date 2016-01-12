# naver.github.io/egjs
## requires
egjs gh-pages requires [Jekyll](http://jekyllrb.com/)

## build
```
git clone -b gh-pages https://github.com/naver/egjs.git egjs-gh-pages
cd egjs-gh-pages
npm install
grunt build
```


It will

* Create latest folder and copy latest version of egjs files.
  If you want to change target version, see **egjs.latest** in package.json. 
* The current folder will be generated into ./_site
* Watched for changes, and regenerated automatically

Open http://localhost:4000

## publish
Push update files to publish
```
git commit -m "update gh-pages"
git push origin gh-pages
```

open https://naver.github.io/egjs
 
