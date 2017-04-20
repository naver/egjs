# 1.5.0 release (2017-04-14)

## Features :

- **MovableCoord**
	- Add disable/enableInput (#471) ([#459](https://github.com/naver/egjs/issues/459))

- **InfiniteGrid**
	- Support multi direction. (#468) ([#462](https://github.com/naver/egjs/issues/462))

- **Component**
	- Add once method (#434) ([#412](https://github.com/naver/egjs/issues/412))

## Bug Fixes :

- **Flicking**
	- Panel movement behavior on non-circular ([#486](https://github.com/naver/egjs/issues/486))
	- Fix panel move by API Android 2.x ([#485](https://github.com/naver/egjs/issues/485))
	- Improve .resize() on adaptiveHeight option ([#478](https://github.com/naver/egjs/issues/478))
	- Fix panel position on disableInput mode ([#433](https://github.com/naver/egjs/issues/433))
	- Fix wrong referencing of panel elements ([#438](https://github.com/naver/egjs/issues/438))
	- Fix getting target panel for adaptiveHeight ([#445](https://github.com/naver/egjs/issues/445))
	- Corrected direction param on .moveTo() ([#436](https://github.com/naver/egjs/issues/436))

- **InfiniteGrid**
	- Fix side-effect bug (#482) ([#477](https://github.com/naver/egjs/issues/477))
	- Add defense code when the user forces the scroll (#474) ([#455](https://github.com/naver/egjs/issues/455))
	- Workaround for IE (#472) ([#447](https://github.com/naver/egjs/issues/447))
	- Fire append event after resize (#473) ([#450](https://github.com/naver/egjs/issues/450))
	- Fix return value of getBottomElement (#470) ([#467](https://github.com/naver/egjs/issues/467))

- **Agent**
	- Invalid browser version of iOS WebView (#441) ([#440](https://github.com/naver/egjs/issues/440))

- **MovableCoord**
	- Add support Hammer 2.0.4, 2.0.5 (#432) ([#431](https://github.com/naver/egjs/issues/431))

## Documents :

- **InfinitGrid**
	- Add jsdoc of remove method. (#469) ([#461](https://github.com/naver/egjs/issues/461))

## Chore tasks :

- **Component**
	- Fixed documention. (#448) ([#411](https://github.com/naver/egjs/issues/411))
