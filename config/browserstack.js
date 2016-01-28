module.exports = function(grunt){
	var exec = require('child_process').exec;
	var fs = require("fs");
	var bsLaunchers = require('./browserstack_launchers.js');
	var isBrowserStack = process.env.BROWSERSTACK_USERNAME && process.env.BROWSERSTACK_KEY;
	
	// if there is no @support tag in src, use defaultSupport (ex. eg.js)
	var defaultSupport = {"ie": "7+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"};

	// fetch module name list from html files in test directory 
	var moduleList = fs.readdirSync(
		'test/'
	).filter(function(val){
		return val.split('.').length === 3 && val.split('.')[0] !== "buildMerge";
	}).map(function(val){
		return val.split('.')[0];
	});

	// fetch module src path 	
	var srcPathList = walk("src");
	moduleList = moduleList.map(function(val){
		for(var i in srcPathList) {
			if(srcPathList[i].indexOf(val) !== -1){
				return {
					name: val,
					path: srcPathList[i]
				};
			}
		}
	});
	
	// fetch module support info from jsdoc	
	moduleList = moduleList.map(function(val){
		var data = fs.readFileSync(val.path, 'utf8');
		var supportLine = data.split('\n').filter(function(val){
			return val.indexOf("@support") !== -1;
		});
		val.support = supportLine.length > 0 ? JSON.parse(supportLine[0].split('@support')[1]) : defaultSupport;
		return val;
	});

	// fetch every file path under the direcrtory
	function walk(dir) {
	    var results = []
	    var list = fs.readdirSync(dir);
	    
	    list.forEach(function(file) {
	        file = dir + '/' + file
	        var stat = fs.statSync(file)
	        if (stat && stat.isDirectory()) results = results.concat(walk(file))
	        else results.push(file)
	    })
	    return results
	}

	// returns target browserstack launchers
	function getConfig(componentName){
		var targetBrowsers = [];
		var componentSupport = moduleList.filter(function(val){
			return val.name === componentName;
		}).map(function(val){
			return val.support;
		})[0];
	
		for(var browser in componentSupport) {
			if(/^(ie|ios|an|ch|ff)$/.test(browser) && componentSupport[browser] !== "latest") {
				var lowestVersion = parseFloat(componentSupport[browser]);
				var browsers = bsLaunchers[browser].filter(function(browserInfo){
					return parseFloat(browserInfo[(browser === "ios" || browser === "an")? "os_version":"browser_version"]) >= lowestVersion;
				});
				targetBrowsers = targetBrowsers.concat(browsers);
			} else if(browser === "sf") { // safari : test every latest of each OSX
				targetBrowsers = targetBrowsers.concat(bsLaunchers[browser]);
			} else if(componentSupport[browser] === "latest") {
				targetBrowsers = targetBrowsers.concat(
					bsLaunchers[browser][bsLaunchers[browser].length - 1]
				);
			}
		}
		return {	
			"test_framework": "qunit",
			"test_path": [
			"test/"+componentName+".test.html"
			],
			"browsers": targetBrowsers
		};
	}	

	grunt.registerTask('browserstack_runner', function() {
		var browserstackConfig = getConfig(arguments[0]);
		var tempBrowserstackConfig = "config/browertstack.config.json";
		fs.writeFileSync(tempBrowserstackConfig, JSON.stringify(browserstackConfig), "utf8");
		process.env["BROWSERSTACK_JSON"] = tempBrowserstackConfig;
		var done = this.async();
		var subProcess = exec("node_modules/.bin/browserstack-runner", function(err) {
			var fs = require("fs");
			process.env["BROWSERSTACK_JSON"] = "";
			fs.unlinkSync(tempBrowserstackConfig);
			done(err ? false : true);
		});
		subProcess.stdout.on("data", function(_data) {
			grunt.log.writeln(_data.trim());
		});		
	});
	
	/*
	**	grunt browserstack:muduleName
	**	    run unit tests with browserstack for muduleName
	**  grunt browserstack
	**	    run unit tests with browserstack for every module
	*/	 
	grunt.registerTask('browserstack', isBrowserStack ? function() {
		var eachfile = Array.prototype.slice.apply(arguments);
		var taskList;
		if (eachfile.length >= 1) {
			taskList = eachfile.map(function(v) {
				return v;
			}, this);			
		} else {
			// fetch module name list from html files in test directory
			taskList = fs.readdirSync("test/").filter(function(val) {
				return val.split(".").length === 3 && val.split(".")[0] !== "buildMerge";
			}).map(function(val) {
				return val.split(".")[0];
			});
		}
		taskList = taskList.map(function(val){
			return 'browserstack_runner:' + val;
		});
		
		grunt.task.run(taskList);
	} : function() {
		grunt.log.oklns("no BROWSERSTACK_USERNAME, BROWSERSTACK_KEY env");
	});
};