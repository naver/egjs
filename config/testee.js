module.exports = {
	options: {
		root: "./",
		reporter: "Spec"
	},
	coverage: {
		options: {
			browsers: ["chrome", "firefox"],
			coverage: {
				ignore: ["assets/", "bower_components/", "node_modules/", "tc/", "test/"]
			}
		},
		src: ["test/*.test.html"]
	}
};