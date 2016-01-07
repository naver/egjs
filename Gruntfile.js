/*global module:false*/
function getConfig(name){
	return require("./config/"+name);
}

module.exports = function(grunt) {
	"use strict";
	require("time-grunt")(grunt);
	require("load-grunt-tasks")(grunt);
	grunt.loadNpmTasks("testee");

	var isBrowserStack = process.env.BROWSER_STACK_USERNAME && process.env.BROWSER_STACK_ACCESS_KEY;
	var config = {
		"pkg": grunt.file.readJSON("package.json"),
		"clean": getConfig("clean"),
		"gitinfo": grunt.task.run("exec:gitinfo"),
		"banner": getConfig("banner"),
		"exec": getConfig("exec"),
		"concat": getConfig("concat"),
		"copy": getConfig("copy"),
		"jscs": getConfig("jscs"),
		"jsdoc": getConfig("jsdoc"),
		"jshint": getConfig("jshint"),
		"qunit": getConfig("qunit"),
		"testee": getConfig("testee"),
		"uglify": getConfig("uglify"),
		"watch": getConfig("watch"),
		
		"karma": {
			options: {
				configFile: "test/karma/karma.conf.js",
				singleRun: true
			}		
		},
		"karma-phantomjs-launcher": {
			options: {
				configFile: "node_modules/karma-phantomjs-launcher/karma.conf.js"
			}		
		},
		"browserstack": {
			options: {
				page: {
					viewportSize: {
						width: 360,
						height: 640
					}
				}
			}			
		},
		"dateString": new Date().toISOString().replace( /\..*Z/, "" )
	};

	grunt.initConfig(config);

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

	grunt.registerTask( "browserstack", isBrowserStack ? function(){
			var dep = require("./test/karma/dependency.js").dependency;				
			var eachfile = Array.prototype.slice.apply(arguments);
	
			if(eachfile.length === 0) {
				grunt.task.run(
					dep.map(function(value){
						return "browserstack:" + value.name;
					})
				);
			} else {
				var moduleName = eachfile[0];
				var targetBrowser = eachfile[1];				
				if(targetBrowser) {
					grunt.config.set("karma.each", {
						moduleName: moduleName,
						targetBrowser: targetBrowser
					});
					grunt.task.run(["karma"]);							
				} else {
					grunt.config.set("karma.each", {
						moduleName: moduleName
					});
					grunt.task.run(["karma"]);					
				}				
			}		
		} : function(){
			console.warn("There is no browserstack username and accesskey.");
		}
	);
	
	grunt.registerTask("validate-commit", function() {
		var fs = require("fs");
		if (grunt.file.exists(".git/hooks/commit-msg")) {
			grunt.file["delete"](".git/hooks/commit-msg", { force: true });
		}
		grunt.file.copy("config/validate-commit-msg.js", ".git/hooks/commit-msg", { force: true });
		fs.chmodSync(".git/hooks/commit-msg", "755");
	});

	grunt.registerTask("docBuild", ["copy:doc", "clean:doc", "jsdoc"]);
	grunt.registerTask("build", ["validate-commit", "concat", "uglify", "clean:pkgd", "docBuild"]);
	grunt.registerTask("default", ["jshint", "jscs", "build", "test"]);
	grunt.registerTask("check", ["jshint", "jscs", "test"]);
	grunt.registerTask("changelog", ["exec:changelog"]);
};