var dependency = require('./dependency');

module.exports = {
	dist: {
		options : {
			banner : "<%=banner%>"
		},
		src: "dist/<%=pkg.outputname%>.js",
		dest: "dist/<%=pkg.outputname%>.min.js"
	},
	pkgd_eg: {
		options : {
			banner : "<%=banner%>/**\n<%=uglify.pkgd_eg.src.join('\\n')%>\n*/\n"
		},
		src : dependency.hammer.concat(dependency.outlayer, dependency.egCore, dependency.egExtend, ["src/visible.js", "src/movableCoord.js", "src/flicking.js",  "src/infiniteGrid.js"]),
		dest : "dist/pkgd/eg.pkgd.min.js"
	},
	pkgd_flicking: {
		options : {
			banner : "<%=banner%>/**\n<%=uglify.pkgd_flicking.src.join('\\n')%>\n*/\n"
		},
		src : dependency.hammer.concat(dependency.egCore, ["src/hook/css.js", "src/movableCoord.js", "src/flicking.js"]),
		dest : "dist/pkgd/flicking.pkgd.min.js"
	},
	pkgd_infiniteGrid: {
		options : {
			banner : "<%=banner%>/**\n<%=uglify.pkgd_infiniteGrid.src.join('\\n')%>\n*/\n"
		},
		src : dependency.outlayer.concat(dependency.egCore, ["src/customEvent/scrollEnd.js", "src/plugin/persist.js", "src/infiniteGrid.js"]),
		dest : "dist/pkgd/infiniteGrid.pkgd.min.js"
	}
};