module.exports = {
	bsFiles: {
		src: [
			"src/**",
			"test/**",
			"dist/**/*.js"
		]
	},
	options: {
		server: {
			baseDir: "./",
			directory: true
		},
		ui: {
			port: 8080,
			weinre: {
				port: 9090
			}
		}
	}
};