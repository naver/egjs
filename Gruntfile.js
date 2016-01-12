module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		copy: {
			latest: {
				files: [
					{
						expand: true,
						cwd: "<%=pkg.egjs.latest%>/",
						src: ["**"],
						dest: "latest/"
					}
				]
			}
		},
		jekyll: {
			serve: {
				options: {
					serve: true
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-jekyll");

	grunt.registerTask("build", ["copy:latest", "jekyll:serve"]);
};