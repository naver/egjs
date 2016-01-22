/*global module:false*/
function getConfig(name){
	return require("./config/"+name);
}

module.exports = function(grunt) {
	"use strict";
	require("time-grunt")(grunt);
	require("load-grunt-tasks")(grunt);
	
	var isBrowserStack = process.env.BROWSERSTACK_USERNAME && process.env.BROWSERSTACK_USERNAME;

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
		"uglify": getConfig("uglify"),
		"watch": getConfig("watch")
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

	grunt.registerTask("browserstack", isBrowserStack ? function() {	
		var eachfile = Array.prototype.slice.apply(arguments);
		var taskList;
		
		if(eachfile.length) {
			taskList = eachfile.map(function(v) {
				return "browserstack_runner:" + v;
			}, this);
		} else {
			var fs = require("fs");
			
			// fetch module name list from html files in test directory 
			taskList = fs.readdirSync(
				"test/"
			).filter(function(val){
				return val.split(".").length === 3 && val.split(".")[0] !== "buildMerge";
			}).map(function(val){
				return "browserstack_runner:" + val.split(".")[0];
			});
		}
		grunt.task.run(taskList);
	} : function() {
		grunt.log.oklns(
			"no BROWSER_STACK_USERNAME, BROWSER_STACK_ACCESS_KEY env"
		);
	});

	grunt.registerTask("browserstack_runner", isBrowserStack ? function() {	
		var fs = require("fs");
		var exec = require("child_process").exec;
		var targetModuleName = arguments[0];
		var browserstackConfig = require("./config/browserstack.js").getConfig(targetModuleName);
		var tempBrowserstackConfig = "config/browertstack.config.json";		
		
		fs.writeFileSync(tempBrowserstackConfig, JSON.stringify(browserstackConfig), "utf8");
		process.env["BROWSERSTACK_JSON"] = tempBrowserstackConfig;
	   
	    var done = this.async();
	    var subProcess = exec("node_modules/.bin/browserstack-runner", function (err) {
			process.env["BROWSERSTACK_JSON"] = "";
			fs.unlinkSync(tempBrowserstackConfig);
			done(err ? false : true);
	    });

	    subProcess.stdout.on("data", function (_data) {
		    grunt.log.writeln(_data.trim());
	    });	    
	} : function() {
		grunt.log.oklns(
			"no BROWSER_STACK_USERNAME, BROWSER_STACK_ACCESS_KEY env"
		);
	});

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