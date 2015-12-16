var dependency = require('./dependency');

module.exports = {
	dist: {
		options : {
			banner : "<%=banner.common %>"
		},
		src: "dist/<%=pkg.outputname%>.js",
		dest: "dist/<%=pkg.outputname%>.min.js"
	},
	pkgd_eg: {
		options : {
			banner : "<%=banner.common %><%=banner.pkgd('egjs') %><%=concat.pkgd_eg.src.join('\\n* ')%>\n*/\n"
		},
		src : "dist/pkgd/<%=pkg.outputname%>.pkgd.js",
		dest : "dist/pkgd/<%=pkg.outputname%>.pkgd.min.js"
	},
	pkgd_flicking: {
		options : {
			banner : "<%=banner.common %><%=banner.pkgd('eg.flicking') %><%=concat.pkgd_flicking.src.join('\\n* ')%>\n*/\n"
		},
		src : "dist/pkgd/flicking.pkgd.js",
		dest : "dist/pkgd/flicking.pkgd.min.js"
	},
	pkgd_infiniteGrid: {
		options : {
			banner : "<%=banner.common %><%=banner.pkgd('eg.infiniteGrid') %><%=concat.pkgd_infiniteGrid.src.join('\\n* ')%>\n*/\n"
		},
		src : "dist/pkgd/infiniteGrid.pkgd.js",
		dest : "dist/pkgd/infiniteGrid.pkgd.min.js"
	}
};