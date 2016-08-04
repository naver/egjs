/*global module:false*/

function getConfig(name) {
	return require("./config/" + name);
}

module.exports = function(grunt) {
	"use strict";
	require("time-grunt")(grunt);
	require("load-grunt-tasks")(grunt);

	// register browserstack task
	require("./config/browserstack.js")(grunt);

	var config = {
		"pkg": grunt.file.readJSON("package.json"),
		"clean": getConfig("clean"),
		"gitinfo": grunt.task.run("exec:gitinfo"),
		"banner": getConfig("banner"),
		"browserSync": getConfig("browserSync"),
		"exec": getConfig("exec"),
		"concat": getConfig("concat"),
		"copy": getConfig("copy"),
		"jscs": getConfig("jscs"),
		"jsdoc": getConfig("jsdoc"),
		"jshint": getConfig("jshint"),
		"qunit": getConfig("qunit"),
		"uglify": getConfig("uglify"),
		"watch": getConfig("watch")
	};
	grunt.initConfig(config);

	grunt.registerTask("test", function() {
		var eachfile = Array.prototype.slice.apply(arguments);
		if (eachfile.length) {
			eachfile = eachfile.map(function(v) {
				return "test/unit/" + v + ".test.html";
			}, this);
		} else {
			eachfile.push("test/unit/*.test.html");
		}
		grunt.config.set("qunit.each", eachfile);
		grunt.log.oklns(grunt.config.get("qunit.each"));
		grunt.task.run("qunit:each");
	});

	grunt.registerTask("docBuild", ["copy:doc_npm1","copy:doc_npm3", "clean:doc", "jsdoc"]);
	grunt.registerTask("build", ["concat", "uglify", "clean:pkgd", "docBuild"]);
	grunt.registerTask("default", ["jshint", "jscs", "build", "test"]);
	grunt.registerTask("check", ["jshint", "jscs", "test"]);
	grunt.registerTask("lint", ["jshint", "jscs"]);
	grunt.registerTask("changelog", function(after, before) {
		grunt.task.run.apply(grunt.task, ["exec:changelog:" + [ after, before ].join(":") ]);
	});
};
