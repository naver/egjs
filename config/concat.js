var jsonfile = require('jsonfile')
var dependency = require('./dependency')
var version = jsonfile.readFileSync("package.json").version;

function changeSrc(src) {
	// remove "use strict";
	// change version;
	src = src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, "$1").replace(/#__VERSION__#/g, version);
	return src;
}

module.exports = {
	build: {
		options: {
			banner: "<%=banner.common %>\"use strict\";\n",
			process: changeSrc
		},
		src: dependency.egCore.concat(dependency.egExtend, ["src/visible.js", "src/movableCoord.js", "src/flicking.js",  "src/infiniteGrid.js"]),
		dest: "dist/<%=pkg.outputname%>.js"
	},
	pkgd_eg: {
		options : {
			banner : "<%=banner.common %><%=banner.pkgd('egjs') %><%=concat.pkgd_eg.src.join('\\n* ')%>\n*/\n",
			process: changeSrc
		},
		src : dependency.hammer.concat(dependency.outlayer, dependency.egCore, dependency.egExtend, ["src/visible.js", "src/movableCoord.js", "src/flicking.js",  "src/infiniteGrid.js"]),
		dest : "dist/pkgd/<%=pkg.outputname%>.pkgd.js"
	},
	pkgd_flicking: {
		options : {
			banner : "<%=banner.common %><%=banner.pkgd('eg.flicking') %><%=concat.pkgd_flicking.src.join('\\n* ')%>\n*/\n",
			process: changeSrc
		},
		src : dependency.hammer.concat(dependency.egCore, ["src/hook/css.js", "src/movableCoord.js", "src/flicking.js"]),
		dest : "dist/pkgd/flicking.pkgd.js"
	},
	pkgd_infiniteGrid: {
		options : {
			banner : "<%=banner.common %><%=banner.pkgd('eg.infiniteGrid') %><%=concat.pkgd_infiniteGrid.src.join('\\n* ')%>\n*/",
			process: changeSrc
		},
		src : dependency.outlayer.concat(dependency.egCore, ["src/customEvent/scrollEnd.js", "src/plugin/persist.js", "src/infiniteGrid.js"]),
		dest : "dist/pkgd/infiniteGrid.pkgd.js"
	}
};