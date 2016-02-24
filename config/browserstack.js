module.exports = function(grunt){
	var exec = require('child_process').exec;
	var fs = require("fs");
	var bsLaunchers = require('./browserstack_launchers.js');

	var isBrowserStack = process.env.BROWSERSTACK_USERNAME && process.env.BROWSERSTACK_KEY;

	// if there is no @support tag in src, use defaultSupport (ex. eg.js)
	var DEFAULT_SUPPORT = {"ie": "7+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"};
	var VM_COUNT = 2;
	var VM_COUNT = 2;

	var moduleList = fetchModuleList();
	
	function fetchModuleList() {
		// fetch module name list from html files in test directory
		var srcPathList = walk("src");
		var moduleList = fs.readdirSync(
			'test/unit/'
		).filter(function(fileName){
			var tokens = fileName.split('.');
			var isModule = tokens.length === 3 && tokens[0] !== "buildMerge";
			return isModule;
		}).map(function(fileName){
			var moduleName = fileName.split('.')[0];
			
			// fetch src path of module  
			var srcPath = srcPathList.filter(function(srcPath) {
				return srcPath.indexOf(moduleName) !== -1;
			})[0];

			// fetch browser support info of module from jsdoc	
			var browserSupport = fs.readFileSync(srcPath, 'utf8').split('\n')
			.filter(function(val){
				return val.indexOf("@support") !== -1;
			}).map(function(val){
				return JSON.parse(val.split('@support')[1]);
			})[0];
			
			return {
				name: moduleName,
				path: srcPath,
				support: browserSupport || DEFAULT_SUPPORT
			};
		});
		
		return moduleList;
	}

	// fetch every file path under the direcrtory
	function walk(dir) {
	    var results = []
	    var list = fs.readdirSync(dir);
	    
	    list.forEach(function(file) {
	        file = dir + '/' + file
	        var stat = fs.statSync(file)
	        if (stat && stat.isDirectory()) {
		        results = results.concat(walk(file))
	        } else 
	        	results.push(file)
	    })
	    return results
	}
	
	function isSameBrowser(browser1, browser2) {
		return JSON.stringify(browser1) === JSON.stringify(browser2);
	}
	
	function hasBrowser(browserList, browser) {
		return browserList.some(function(val){
			return isSameBrowser(val, browser);
		});
	}
	
	function getConfigByBrowser(launchers, moduleList) {
		// moduleList getConfig
		var configList = moduleList.map(function(module) {
			return getConfig(launchers, module.name, moduleList);
		});
	
		return Object.keys(launchers).reduce(function(prev, curr){
			return prev.concat(launchers[curr]);
		}, [])
		.map(function(browser){
			return { 
				test_framework: 'qunit',
				test_path: getTestHTMLsByBrowser(configList, browser),
				browsers: [browser]
			};
		});
	}
	
	function getTestHTMLsByBrowser(configList, targetBrowser) {
		return configList.filter(function(config) {
			return hasBrowser(config.browsers, targetBrowser);		
		}).map(function(config) {
			return config.test_path[0];
		});				
	}

	// returns target browserstack launchers
	function getConfig(launchers, componentName, moduleList){
		var componentSupport = moduleList.filter(function(module){
			return module.name === componentName;
		}).map(function(module){
			return module.support;
		})[0];
		
		var targetBrowsers = Object.keys(componentSupport).reduce(function(prev, curr) {
			var browserName = curr;
			var versionRange = componentSupport[browserName];
			var browsers = launchers[browserName];

			if(/^(ie|ios|an|ch|ff)$/.test(browserName) && versionRange !== "latest") {
				var lowestVersion = parseFloat(versionRange);
				browsers = browsers.filter(function(browserInfo){
					return parseFloat(browserInfo[(browserName === "ios" || browserName === "an") ? "os_version":"browser_version"]) >= lowestVersion;
				});
			} else if(browserName === "sf") { // safari : test every latest of each OSX
				browsers = browsers;
			} else if(versionRange === "latest") {
				browsers = browsers[browsers.length - 1];
			}

			return prev.concat(browsers);
		}, []);
		
		return {	
			"test_framework": "qunit",
			"test_path": [ "test/unit/"+componentName+".test.html" ],
			"browsers": targetBrowsers
		};
	}	

	function runBrowserstackRunner(browserstackConfig) {
		var tempBrowserstackConfig = "config/browertstack.config.json";
		process.env["BROWSERSTACK_JSON"] = tempBrowserstackConfig;
		fs.writeFileSync(tempBrowserstackConfig, JSON.stringify(browserstackConfig), "utf8");
	
		var done = this.async();
		
		var subProcess = exec("node_modules/.bin/browserstack-runner --verbose", function(err) {
			var fs = require("fs");
			done(!err);
		});
		
		subProcess.stdout.on("data", function(_data) {
			grunt.log.writeln(_data.trim());
		});		
	}
	
	grunt.registerTask('browserstack_runner', function() {
		var isByBrowser = arguments[0] === "byBrowser";
		var browserstackConfig;
		if(!isByBrowser) {
			browserstackConfig = getConfig(bsLaunchers, arguments[0], moduleList);
			var bIdx = 2 * (parseInt(arguments[1]) + 1) - 2;
			var totalBrowser = browserstackConfig.browsers.length;
			var browsers = browserstackConfig.browsers;
			var targetBrowsers = [ browsers[bIdx] ];
			browsers[bIdx + 1] && targetBrowsers.push(browsers[bIdx + 1]);			
			browserstackConfig.browsers = targetBrowsers;
			
			if(browserstackConfig.browsers.length === 1) {
				grunt.log.writeln("["+bIdx +"/" + totalBrowser + "]");
			} else {
				grunt.log.writeln("["+bIdx + ","+(bIdx+1)+"/" + totalBrowser + "]");
			}
		} else {
			var configListByBrowser = getConfigByBrowser(bsLaunchers, moduleList);
			browserstackConfig = configListByBrowser[arguments[1]];
		}
		runBrowserstackRunner.call(this, browserstackConfig);	
	});
	
	/*
	**	$ grunt browserstack:muduleName
	**	    run unit tests with browserstack for muduleName
	**  $ grunt browserstack
	**	    run unit tests with browserstack for every module
	*/	 
	grunt.registerTask('browserstack', isBrowserStack ? function() {
		var eachfile = Array.prototype.slice.apply(arguments);
		var taskList;
		
		if (eachfile.length >= 1) {
			taskList = eachfile.map(function(moduleName){
				var browserCount = getConfig(bsLaunchers, moduleName, moduleList).browsers.length;
				var	subtasks = Array.apply(null, Array(browserCount)).map(function(x,i){
					return 'browserstack_runner:' + moduleName + ':' +i;
				});
				subtasks = subtasks.slice(0, Math.floor(subtasks.length / VM_COUNT));
				return subtasks;
			}).reduce(function(prev, curr) {
				return 	prev.concat(curr);
			}, []);
		} else {
			var browserCount = getConfigByBrowser(bsLaunchers, moduleList).length;
			taskList = Array.apply(null, Array(browserCount)).map(function(x,i){
				return 'browserstack_runner:byBrowser:' + i;
			});
			taskList = taskList.slice(0, Math.floor(taskList.length / VM_COUNT));			
		}
		grunt.task.run(taskList);
	} : function() {
		grunt.log.oklns("no BROWSERSTACK_USERNAME, BROWSERSTACK_KEY env");
	});
};
