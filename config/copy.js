module.exports = {
	lib: {
		expand: true,
		flatten: true,
		src: [
			"bower_components/jquery/jquery.js",
			"bower_components/hammer.js/hammer.js"
		],
		dest: "dist/lib"
	},
	doc: {
		files: [{
			expand: true,
			flatten: true,
			src: ["node_modules/egjs-jsdoc-template/jsdoc-plugin/*.*"],
			dest: "node_modules/grunt-jsdoc/node_modules/jsdoc/plugins"
		}]
	}
};