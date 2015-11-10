var jsonfile = require('jsonfile')

module.exports = {
	options: {
		banner: "<%=banner%>\"use strict\";\n",
		process: function(src) {
			src = src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, "$1"); // remove "use strict";
			src = src.replace(/#__VERSION__#/g, jsonfile.readFileSync("package.json").version); // change version;
			return src;
		}
	},
	build: {
		src: ["src/module.js", "src/eg.js", "src/customEvent/*.js", "src/hook/*.js", "src/plugin/*.js", "src/class.js", "src/component.js", "src/visible.js", "src/movableCoord.js", "src/flicking.js",  "src/infiniteGrid.js", "src/plugin/plugin.js"],
		dest: "dist/<%=pkg.outputname%>.js"
	}
};