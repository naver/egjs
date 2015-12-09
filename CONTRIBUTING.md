# How to contribute to egjs
egjs is opened to everyone and we're welcoming for any kind of contribution.
We believe that our project can grow with your interests helping others' necessities.

## Style Guide

egjs has several style guidelines to follow.
Before your start, please read attentively below instructions.

### Linting
We adopted [JSHint](http://jshint.com/) to maintain our code quality. 
All rules are described at [.jshintrc](.jshintrc) file.

### Code Convetions
To maintain same code style across entire project, we adopted [JSCS](http://jscs.info/) as code style checker.
All conventions are described at [.jscsrc](.jscsrc) file.

### Commit Log Conventions
egjs use commit logs in many different purposes (like creating CHANGELOG, ease history searching, etc.).
To not break, you'll be forced to follow our commit log convention.
Before your commit/push, make sure following our commit log convention.

The outline is as below:
```
type(module name or boundary): short description as subject
(new line)
Long description
(new line)
Ref #IssueNo
```

- **Types**:
  - feat(feature) : when adds new feature
  - fix(bug fix) : for bug fix
  - docs(documentation) : anything documentation related 
  - style(formatting, missing semi colons, etc.) : when change code style
  - refactor : refactoring
  - test(when adding missing tests) : anything test code related
  - chore(maintain) : task which are done regularly

- **Module Name or Boundary**:
  - When the changes is applied for `flicking` only
    - ex) ```fix(flicking): fixed some bug```
  - When the changes are applied for `flicking and movableCoord`
    - ex) ```feat(flicking,movablecoord): Added new feature xxx```
  - When the changes are applied for all files
    - ex) ```style(all): Removed unnecessary console.log```

- **Referencing issue**:

  Basically, all of your commits should reference an issue.
  Put github issue number related with that commit.
  
  For example, when fixes an issue number 18:
  ```
  fix(flicking): Fix bug on IE xxx
  
  It fixes bugs on IE xxx applying workaround
  preventing browser crash
  
  Ref #18
  ```

## How to submit Pull Requests
Steps to submit your pull request:

1. Fork `egjs` on your repository
2. Create new branch from your egjs master branch (and be sure always to be up-to-date)
3. Do your work
4. Create test code for your work (when is possible)
5. Run `grunt jshint` for linting. (update until without any error or warnings)
6. Run `grunt jscs` to check code style. (update until without any error or warnings)
7. Run test code by `grunt test OR grunt test:MODULE_NAME`.
   Make sure tests are all passed at least in Chrome(latest desktop version) and grunt qunit module.
8. Write commit log following convention and push to your repository branch.
9. Create a new PR from your branch to egjs.
10. Wait for reviews.
    When your contribution is well enough to be accepted, then will be merged to our branch.
11. All done!


## License
By contributing to egjs, you're agreeing that your contributions will be licensed under its [MIT](https://opensource.org/licenses/MIT) license.