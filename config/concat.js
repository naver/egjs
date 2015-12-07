var jsonfile = require('jsonfile')
var dependency = require('./dependency')
var version = jsonfile.readFileSync("package.json").version;

module.exports = {
	options: {
		banner: "<%=banner%>\"use strict\";\n",
		process: function(src) {
			// remove "use strict";
			// change version;
			src = src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, "$1").replace(/#__VERSION__#/g, version);
			return src;
		}
	},
	build: {
		src: dependency.egCore.concat(dependency.egExtend, ["src/visible.js", "src/movableCoord.js", "src/flicking.js",  "src/infiniteGrid.js"]),
		dest: "dist/<%=pkg.outputname%>.js"
	}
};