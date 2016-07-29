### version
```javascript
eg.VERSION;
```
<p class="version output"></p>

### agent
```javascript
eg.agent();
```
<p class="agent output"></p>

### isHWAccelerable
```javascript
eg.isHWAccelerable();
```
<p class="isHWAccelerable output"></p>

### isPortrait
```javascript
eg.isPortrait();
```

<p class="isPortrait output"></p>

### isTransitional
```javascript
eg.isTransitional();
```

<p class="isTransitional output"></p>

### translate
```javascript
eg.translate('10px', '200%');
eg.translate('10px', '200%', true);
```
<p class="translate output"></p>

### requestAnimationFrame
```javascript
var timerId = eg.requestAnimationFrame(function() {
    console.log("call");
});
```

### cancelAnimationFrame
```javascript
eg.cancelAnimationFrame(timerId);
```