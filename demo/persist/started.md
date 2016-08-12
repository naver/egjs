### Browser support
IE 9+, latest of Chrome/FF/Safari, iOS 7+ and Android 2.2+ (except 3.x)

### Quick steps to use:

#### Load files
``` html
<!-- 1) Load jQuery -->
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>

<!-- 2) Load egjs packaged file -->
<script src="http://naver.github.io/egjs/latest/dist/pkgd/eg.pkgd.min.js"></script>
```

#### Save the component's status to the persist plugin

``` javascript

// Everytime there is an change on the component that should be persisted, save snapshot of the component.
// Type of snapshot can be an object or a string.

var snapshotObject = { ... };
// var snapshotString = " ... ";

// Persist plugin provides key value API.
// You should make component's unique ID, to distinguish the component with other component using persist plugin.

$.persist("componentID", snapshotObject);

```

#### Restore the component's status.

``` javascript
// Get snapshot by calling persist method with the component's unique ID.  
var snapshot = $.persist("componentID");

// Implement restoring logic with snapshot and your UI component.
```