"use strict";

module.exports = {
	"PhantomJS_Desktop": {
		"base": "PhantomJS",
		options: {
			viewportSize: { 
				width: 360, 
				height: 640 
			}
		}
	},

	"bs_xp_ie-6": {
		"base": "BrowserStack",
		"browser": "ie",
		"browser_version": "6.0",
		"os": "Windows",
		"os_version": "XP"
	},
	
	"bs_xp_ie-7": {
		"base": "BrowserStack",
		"browser": "ie",
		"browser_version": "7.0",
		"os": "Windows",
		"os_version": "XP"
	},

	"bs_xp_ie-8": {
		"base": "BrowserStack",
		"browser": "ie",
		"browser_version": "8.0",
		"os": "Windows",
		"os_version": "XP"
	},
	
	"bs_7_ie-8": {
		"base": "BrowserStack",
		"browser": "ie",
		"browser_version": "8.0",
		"os": "Windows",
		"os_version": "7"
	},

	"bs_7_ie-9": {
		"base": "BrowserStack",
		"browser": "ie",
		"browser_version": "9.0",
		"os": "Windows",
		"os_version": "7"
	},
	"bs_7_ie-10": {
		"base": "BrowserStack",
		"browser": "ie",
		"browser_version": "10.0",
		"os": "Windows",
		"os_version": "7"
	},
	"bs_7_ie-11": {
		"base": "BrowserStack",
		"browser": "ie",
		"browser_version": "11.0",
		"os": "Windows",
		"os_version": "7"
	},
	
	
	"bs_8_ie-10": {
		"base": "BrowserStack",
		"browser": "ie",
		"browser_version": "10.0",
		"os": "Windows",
		"os_version": "8"
	},
	"bs_8_ie-10-metro": {
		"base": "BrowserStack",
		"browser": "ie",
		"browser_version": "10.0 Metro",
		"os": "Windows",
		"os_version": "8"
	},


	"bs_8.1_ie-11": {
		"base": "BrowserStack",
		"browser": "ie",
		"browser_version": "11.0",
		"os": "Windows",
		"os_version": "8.1"
	},
	"bs_8.1_ie-11-metro": {
		"base": "BrowserStack",
		"browser": "ie",
		"browser_version": "11.0 Metro",
		"os": "Windows",
		"os_version": "8.1"
	},


	"bs_10_ie-11": {
		"base": "BrowserStack",
		"browser": "ie",
		"browser_version": "11.0",
		"os": "Windows",
		"os_version": "10"
	},		
	
	
	"bs_10_edge-12": {
		"base": "BrowserStack",
		"browser": "edge",
		"browser_version": "12.0",
		"os": "Windows",
		"os_version": "10"
	},


	"bs_safari-5.1": {
		"base": "BrowserStack",
		"browser": "safari",
		"browser_version": "5.1",
		"os": "OS X",
		"os_version": "Lion"
	},
	"bs_safari-6.0": {
		"base": "BrowserStack",
		"browser": "safari",
		"browser_version": "6.0",
		"os": "OS X",
		"os_version": "Lion"
	},	
	"bs_safari-6.2": {
		"base": "BrowserStack",
		"browser": "safari",
		"browser_version": "6.2",
		"os": "OS X",
		"os_version": "Mountain Lion"
	},	
	"bs_safari-7.1": {
		"base": "BrowserStack",
		"browser": "safari",
		"browser_version": "7.1",
		"os": "OS X",
		"os_version": "Mavericks"
	},
	"bs_safari-8.0": {
		"base": "BrowserStack",
		"browser": "safari",
		"browser_version": "8.0",
		"os": "OS X",
		"os_version": "Yosemite"
	},
	"bs_safari-9.0": {
		"base": "BrowserStack",
		"browser": "safari",
		"browser_version": "9.0",
		"os": "OS X",
		"os_version": "El Capitan"
	},


	"bs_chrome-45": {
		"base": "BrowserStack",
		"browser": "chrome",
		"browser_version": "45.0",
		"os": "OS X",
		"os_version": "Yosemite"
	},
	"bs_chrome-46": {
		"base": "BrowserStack",
		"browser": "chrome",
		"browser_version": "46.0",
		"os": "OS X",
		"os_version": "Yosemite"
	},
	"bs_chrome-47": {
		"base": "BrowserStack",
		"browser": "chrome",
		"browser_version": "47.0",
		"os": "OS X",
		"os_version": "Yosemite"
	},
	
	
	"bs_firefox-31": {
		"base": "BrowserStack",
		"browser": "firefox",
		"browser_version": "31.0",
		"os": "OS X",
		"os_version": "Mavericks"
	},
	"bs_firefox-38": {
		"base": "BrowserStack",
		"browser": "firefox",
		"browser_version": "38.0",
		"os": "OS X",
		"os_version": "Mavericks"
	},
	"bs_firefox-41": {
		"base": "BrowserStack",
		"browser": "firefox",
		"browser_version": "41.0",
		"os": "OS X",
		"os_version": "Yosemite"
	},
	"bs_firefox-42": {
		"base": "BrowserStack",
		"browser": "firefox",
		"browser_version": "42.0",
		"os": "OS X",
		"os_version": "Yosemite"
	},
	
	
	
	"bs_ios-5.1": {
		"base": "BrowserStack",
		"device": "iPhone 4S",
		"os": "ios",
		"os_version": "5.1"
	},
	"bs_ios-6.0": {
		"base": "BrowserStack",
		"device": "iPhone 5",
		"os": "ios",
		"os_version": "6.0"
	},
	"bs_ios-7.0": {
		"base": "BrowserStack",
		"device": "iPhone 5S",
		"os": "ios",
		"os_version": "7.0"
	},
	"bs_ios-8.3": {
		"base": "BrowserStack",
		"device": "iPhone 6",
		"os": "ios",
		"os_version": "8.3"
	},
	"bs_ios-9.0": {
		"base": "BrowserStack",
		"device": "iPhone 6S",
		"os": "ios",
		"os_version": "9.0"
	},



	"bs_android-2.2_sgs": {
		"base": "BrowserStack",
		"device": "Samsung Galaxy S",
		"os": "android",
		"os_version": "2.2"
	},
	"bs_android-2.2_hw": {
		"base": "BrowserStack",
		"device": "HTC Wildfire",
		"os": "android",
		"os_version": "2.2"
	},	
	
	
	
	"bs_android-2.3_sgs2": {
		"base": "BrowserStack",
		"device": "Samsung Galaxy S2",
		"os": "android",
		"os_version": "2.3"
	},
	"bs_android-2.3_sgn": {
		"base": "BrowserStack",
		"device": "Samsung Galaxy Note",
		"os": "android",
		"os_version": "2.3"
	},
	"bs_android-2.3_mdr": {
		"base": "BrowserStack",
		"device": "Motorola Droid Razr",
		"os": "android",
		"os_version": "2.3"
	},
	
	
	
	"bs_android-4.0_gn": {
		"base": "BrowserStack",
		"device": "Google Nexus",
		"os": "android",
		"os_version": "4.0"
	},
	"bs_android-4.0_mr": {
		"base": "BrowserStack",
		"device": "Motorola Razr",
		"os": "android",
		"os_version": "4.0"
	},
	"bs_android-4.0_sgn10.1": {
		"base": "BrowserStack",
		"device": "Samsung Galaxy Note 10.1",
		"os": "android",
		"os_version": "4.0"
	},

	
	
	
	"bs_android-4.1_gn7": {
		"base": "BrowserStack",
		"device": "Google Nexus 7",
		"os": "android",
		"os_version": "4.1"
	},
	"bs_android-4.1_sgs3": {
		"base": "BrowserStack",
		"device": "Samsung Galaxy S3",
		"os": "android",
		"os_version": "4.1"
	},
	"bs_android-4.1_sgn2": {
		"base": "BrowserStack",
		"device": "Samsung Galaxy Note 2",
		"os": "android",
		"os_version": "4.1"
	},
	"bs_android-4.1_mrm": {
		"base": "BrowserStack",
		"device": "Motorola Razr Maxx HD",
		"os": "android",
		"os_version": "4.1"
	},
	"bs_android-4.2": {
		"base": "BrowserStack",
		"device": "Google Nexus 4",
		"os": "android",
		"os_version": "4.2"
	},
	"bs_android-4.3_sgs4": {
		"base": "BrowserStack",
		"device": "Samsung Galaxy S4",
		"os": "android",
		"os_version": "4.3"
	},
	"bs_android-4.3_sgn3": {
		"base": "BrowserStack",
		"device": "Samsung Galaxy Note 3",
		"os": "android",
		"os_version": "4.3"
	},
	"bs_android-4.4_sgs5": {
		"base": "BrowserStack",
		"device": "Samsung Galaxy S5",
		"os": "android",
		"os_version": "4.4"
	},
	"bs_android-4.4_sgt4": {
		"base": "BrowserStack",
		"device": "Samsung Galaxy Tab 4 10.1",
		"os": "android",
		"os_version": "4.4"
	},
	"bs_android-4.4_sgs5m": {
		"base": "BrowserStack",
		"device": "Samsung Galaxy S5 Mini",
		"os": "android",
		"os_version": "4.4"
	},
	"bs_android-4.4_hom": {
		"base": "BrowserStack",
		"device": "HTC One M8",
		"os": "android",
		"os_version": "4.4"
	},
	"bs_android-5.0_gn6": {
		"base": "BrowserStack",
		"device": "Google Nexus 6",
		"os": "android",
		"os_version": "5.0"
	}
};
