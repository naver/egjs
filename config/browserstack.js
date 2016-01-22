module.exports = (function(){
	// if there is no @support tag in src, use defaultSupport (ex. eg.js)
	var defaultSupport = {"ie": "7+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"};
	var bsLaunchers = require('./browserstack_launchers.js');
	var fs = require("fs");

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
	return {
		"getConfig": function(componentName){
			var targetBrowsers = [];
			var componentSupport = moduleList.filter(function(val){
				return val.name === componentName;
			}).map(function(val){
				return val.support;
			})[0];
		
			for(var browser in componentSupport) {
				if((browser === "ie" || browser === "ios" || browser === "an" || browser === "ch" || browser === "ff") && componentSupport[browser] !== "latest") {
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
	};
})();