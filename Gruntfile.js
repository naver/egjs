/*global module:false*/
function config(name){
	return require("./config/"+name);
}

function addInitConfig(configObj){
	// Add config Step
	// 1. create config/your_config.js
	// 2. add your_config in addConfing.
	var addConfig = ["banner" ,"jshint", "concat", "uglify", "copy",
	"qunit", "testee", "watch", "jsdoc", "jscs"];

	addConfig.forEach(function(v){
		configObj[v] = config(v);
	});

	return configObj;
}
module.exports = function(grunt) {
	"use strict";
	require("time-grunt")(grunt);
	require("load-grunt-tasks")(grunt);
	grunt.loadNpmTasks("testee");

	var initConfig = {
		pkg: grunt.file.readJSON("package.json"),
		gitinfo: grunt.task.run("gitinfo")
	};

	grunt.initConfig(addInitConfig(initConfig));


	grunt.registerTask("test", function() {
		var eachfile = Array.prototype.slice.apply(arguments);
		if(eachfile.length) {
			eachfile = eachfile.map(function(v) {
				return "test/" + v + ".test.html";
			}, this);
		} else {
			eachfile.push("test/*.test.html");
		}
		grunt.config.set("qunit.each", eachfile);
		grunt.log.oklns(grunt.config.get("qunit.each"));
		grunt.task.run("qunit:each");
	});

	grunt.registerTask("clean", function() {
		if (grunt.file.exists("doc")) {
			grunt.file["delete"]("doc", { force: true });
		}
	});

	grunt.registerTask("docBuild", ["copy:doc", "clean", "jsdoc"]);
	grunt.registerTask("build", ["concat", "uglify", "docBuild"]);
	// grunt.registerTask("build", ["concat", "uglify", "copy:lib", "docBuild"]);
	grunt.registerTask("default", ["jshint", "jscs", "build", "test"]);
	grunt.registerTask("check", ["jscs"]);
};