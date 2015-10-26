module.exports = {
	files: ["Gruntfile.js", "*.js", "src/**/*.js" ],
	options: {
		jshintrc: true,
		reporter: require("jshint-stylish")
	}
};