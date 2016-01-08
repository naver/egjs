// Karma configuration
// Generated on Mon Dec 14 2015 18:02:18 GMT+0900 (KST)
var grunt = require("grunt");
module.exports = function(config) {
	var dateString = grunt.config("dateString");
	var moduleName = grunt.config.get("karma.each").moduleName;
	var targetBrowser = grunt.config.get("karma.each").targetBrowser;
	
	var testSuit = require("./testSuits.js").filter(function(value) {
		return value.name === moduleName;
	})[0];
	
	var browsers = {};
	browsers["ie"] = ["bs_10_ie-11"];
	browsers["edge"] = ["bs_10_edge-12"];
	browsers["chrome"] = ["bs_chrome-46"];
	browsers["safari"] = ["bs_safari-9.0"];
	browsers["firefox"] = ["bs_firefox-42"];
	browsers["ios"] = ["bs_ios-9.0"];
	browsers["android"] = ["bs_android-5.0_gn6"];

	browsers["old"] = {
		ios: ["bs_ios-5.1", "bs_ios-6.0", "bs_ios-7.0", "bs_ios-8.3"],
		ie: ["bs_7_ie-8", "bs_7_ie-9", "bs_7_ie-10", "bs_7_ie-11", 
		"bs_8_ie-10", "bs_8_ie-10-metro",
		"bs_8.1_ie-11", "bs_8.1_ie-11-metro"],
		android: ["bs_android-2.3_sgs2", "bs_android-4.1_sgs3", "bs_android-4.3_sgs4", "bs_android-4.4_sgs5"]
	};

	browsers["desktop"] = [].concat(
		browsers["ie"],
		browsers["edge"],
		browsers["chrome"],
		browsers["safari"],
		browsers["firefox"]
	);
		
	browsers["mobile"] = [].concat(browsers["ios"], browsers["android"]);
	browsers["latest"] = [].concat(browsers["desktop"], browsers["mobile"]);
	
	browsers["all"] = [
		// desktop - IE
		"bs_7_ie-8", "bs_7_ie-9", "bs_7_ie-10", "bs_7_ie-11", 
		"bs_8_ie-10", "bs_8_ie-10-metro",
		"bs_8.1_ie-11", "bs_8.1_ie-11-metro",
		"bs_10_ie-11",
		
		"bs_10_edge-12",
		
		// desktop - not IE
		"bs_safari-5.1", "bs_safari-6.0", "bs_safari-6.2", "bs_safari-7.1", "bs_safari-8.0", "bs_safari-9.0", 
		"bs_chrome-45", "bs_chrome-46", "bs_chrome-47",
		"bs_firefox-31", "bs_firefox-38", "bs_firefox-41", "bs_firefox-42",

		// mobile
		"bs_ios-5.1", "bs_ios-6.0", "bs_ios-7.0", "bs_ios-8.3", "bs_ios-9.0",
		"bs_android-2.2_sgs", "bs_android-2.2_hw",
		"bs_android-2.3_sgs2", "bs_android-2.3_sgn", "bs_android-2.3_mdr",
		"bs_android-4.0_gn", "bs_android-4.0_mr", "bs_android-4.0_sgn10.1",
		"bs_android-4.1_gn7", "bs_android-4.1_sgs3", "bs_android-4.1_sgn2", "bs_android-4.1_mrm",
		"bs_android-4.2",
		"bs_android-4.3_sgs4", "bs_android-4.3_sgn3",
		"bs_android-4.4_sgs5", "bs_android-4.4_sgt4", "bs_android-4.4_sgs5m", "bs_android-4.4_hom",
		"bs_android-5.0_gn6"
	];
			
	if(targetBrowser) {
		if(targetBrowser.indexOf("old") !== -1) {
			testSuit.browsers = browsers["old"][targetBrowser.split('-')[1]];
		} else if(browsers[targetBrowser]) {
			testSuit.browsers = browsers[targetBrowser];
		} else if(browsers["all"]["bs_"+targetBrowser]) {
			testSuit.browsers = browsers["all"]["bs_"+targetBrowser];
		}
	} else {
		testSuit.browsers = browsers["latest"];
	}
	
	config.set({
		browserStack: {
			project: "sizzle",
			build: "local run" + (dateString ? ", " + dateString : ""),
			timeout: 600,
			// 10 min
			// BrowserStack has a limit of 120 requests per minute. The default
			// "request per second" strategy doesn't scale to so many browsers.
			pollingTimeout: 10000
		},
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: "../../",
		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['qunit'],
		// list of files / patterns to load in the browser

		files: testSuit.files,
		
		// list of files to exclude
		exclude: [],
		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			"test/fixture/*.fixture.html": ["html2js"]
		},
		
		// Add BrowserStack launchers
		customLaunchers: require( "./launchers" ),

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress'],
		// web server port
		port: 9876,
		// enable / disable colors in the output (reporters and logs)
		colors: true,
		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,
		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,
		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: testSuit.browsers,
		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,
		// Concurrency level
		// how many browser should be started simultanous
		concurrency: Infinity,
		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 3e5,
		browserNoActivityTimeout: 3e5,
		browserDisconnectTimeout: 3e5,
		browserDisconnectTolerance: 3
	})
}