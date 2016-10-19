module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		jekyll: grunt.file.readYAML("_config.yml"),
		clean: {
			latest: {
				options: { force: true },
				src: ["latest"]
			}
		},
		copy: {
			latest: {
				files: [
					{
						expand: true,
						cwd: "<%=jekyll.latestVersion%>",
						src: ["**"],
						dest: "latest"
					}
				]
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.registerTask("build:latest", ["clean:latest", "copy:latest"]);
};
