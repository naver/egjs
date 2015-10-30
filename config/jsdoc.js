module.exports = {
	dist: {
		src: ["src/**/*.js", "README.md"],
		options: {
			destination: "doc",
			template: "node_modules/egjs-jsdoc-template",
			configure: "jsdoc.json"
		}
	}
};