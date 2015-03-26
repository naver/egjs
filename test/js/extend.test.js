module("extend Test", {
	setup : function() {
	},
	teardown : function() {
		eg.defaults = {};
	}
});

test("check namespace", function() {
	// Given
	// When
	// Then
	ok("eg" in window, "namespace is window.eg");
});

test("determine the return value of a 'isHardwareAccelerable' function", function() {
	// Given
	var result = eg.isHardwareAccelerable();
	var controllValue = result;
	// When
	eg.defaults.isHardwareAccelerable = function(agent) {
		return !controllValue;
	};
	// Then
	notEqual(result, eg.isHardwareAccelerable(), "change default value");
});

test("pass the return value of a 'isHardwareAccelerable' function", function() {
	var result;
	// Given
	result = eg.isHardwareAccelerable();
	// When
	eg.defaults.isHardwareAccelerable = function(agent) {
		return null;
	};
	// Then
	equal(result, eg.isHardwareAccelerable(), "pass default value");

	// Given
	result = eg.isHardwareAccelerable();
	// When
	eg.defaults.isHardwareAccelerable = function(agent) {
		// undefined
	};
	// Then
	equal(result, eg.isHardwareAccelerable(), "pass default value");
});

test("remove 'defaults' function", function() {
	// Given
	var result = eg.isHardwareAccelerable();
	var controllValue = result;
	eg.defaults.isHardwareAccelerable = function(agent) {
		return !controllValue;
	};
	// When
	delete eg.defaults.isHardwareAccelerable;
	// Then
	equal(result, eg.isHardwareAccelerable(), "pass default value");
});

test("translate function", function() {
	// Given
	// When
	var x = "20px";
	var y = "300px";
	// Then
	equal(eg.translate(x,y), "translate(20px,300px)", "When HardwareAcceleration was undefined");
	equal(eg.translate(x,y, false), "translate(20px,300px)", "When HardwareAcceleration was false");
	equal(eg.translate(x,y, true), "translate3d(20px,300px,0)", "When HardwareAcceleration was true");
});

module("extend Agent Test", {
	setup : function() {
		ua = [
			{
				// iPhone 3.0
				"ua" : "Mozilla/5.0 (iPod; U; CPU iPhone OS 3_0 like Mac OS X;ko-kr)AppleWebKit/528.18(KHTML, like Gecko)Version/4.0 Mobile/7A341 Safari/528.16",
				"os" : "ios",
				"osVersion" : "3.0",
				"browser" : "safari",
				"browserVersion" : "4.0",
				"isHardwareAccelerable" : true
			},
			{
				// iPhone 4.3.3
				"ua" : "Mozilla/5.0 (iPhone;U;CPU iPhone OS 4_3_3 like Max OS X;ko-kr) AppleWebKit/533.17.9(KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5",
				"os" : "ios",
				"osVersion" : "4.3.3",
				"browser" : "safari",
				"browserVersion" : "5.0.2",
				"isHardwareAccelerable" : true
			},
			{
				// iPad 4.2.1
				"ua" : "Mozilla/5.0 (iPad;U;CPU OS 4_2_1 like Mac OS X;ko-kr) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5",
				"os" : "ios",
				"osVersion" : "4.2.1",
				"browser" : "safari",
				"browserVersion" : "5.0.2",
				"isHardwareAccelerable" : true
			},
			{
				// iPad 4.3.3
				"ua" : "Mozilla/5.0 (iPad; U; CPU OS 4_3_3 like Mac OS X;ko-kr)AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5",
				"os" : "ios",
				"osVersion" : "4.3.3",
				"browser" : "safari",
				"browserVersion" : "5.0.2",
				"isHardwareAccelerable" : true
			},
			{
				// iPhone 5.0.1
				"ua" : "Mozilla/5.0 (iPhone;CPU iPhone OS 5_0_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A405 Safari/7534.48.3",
				"os" : "ios",
				"osVersion" : "5.0.1",
				"browser" : "safari",
				"browserVersion" : "5.1",
				"isHardwareAccelerable" : true
			},
			{
				// iPhone 6.0
				"ua" : "Mozilla/5.0 (iPhone;CPU iPhone OS 6_0_2 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A551 Safari/8536.25",
				"os" : "ios",
				"osVersion" : "6.0.2",
				"browser" : "safari",
				"browserVersion" : "6.0",
				"isHardwareAccelerable" : true
			},
			{
				// iPhone 6.1.2
				"ua" : "Mozilla/5.0 (iPhone;CPU iPhone OS 6_1_2 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B146 Safari/8536.25",
				"os" : "ios",
				"osVersion" : "6.1.2",
				"browser" : "safari",
				"browserVersion" : "6.0",
				"isHardwareAccelerable" : true
			},
			{
				// iPhone 7.0
				"ua" : "Mozilla/5.0 (iPhone;CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B146 Safari/8536.25",
				"os" : "ios",
				"osVersion" : "7.0",
				"browser" : "safari",
				"browserVersion" : "6.0",
				"isHardwareAccelerable" : true
			},
			{
				// GalaxyS:2.1
				"ua" : "Mozilla/5.0 (Linux;U;Android 2.1;ko-kr;SHW-M110S Build/ÉCLAIR) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17",
				"os" : "android",
				"osVersion" : "2.1",
				"browser" : "default",
				"browserVersion" : "2.1",
				"isHardwareAccelerable" : false
			},
			{
				// GalaxyS:2.2
				"ua" : "Mozilla/5.0 (Linux;U;Android 2.2;ko-kr;SHW-M110S Build/FROYO) AppleWebKit/533.1(KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
				"os" : "android",
				"osVersion" : "2.2",
				"browser" : "default",
				"browserVersion" : "2.2",
				"isHardwareAccelerable" : false
			},
			{
				// GalaxyS:2.3.4
				"ua" : "Mozilla/5.0 (Linux;U;Android 2.3.4;ko-kr;SHW-M110S Build/GINGERBREAD)AppleWebKit/533.1(KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
				"os" : "android",
				"osVersion" : "2.3.4",
				"browser" : "default",
				"browserVersion" : "2.3.4",
				"isHardwareAccelerable" : false
			},
			{
				// GalaxyS2:2.3.3
				"ua" : "Mozilla/5.0 (Linux;U;Android 2.3.3;ko-kr;SHW-M250S Build/GINGERBREAD) AppleWebKit/533.1(KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
				"os" : "android",
				"osVersion" : "2.3.3",
				"browser" : "default",
				"browserVersion" : "2.3.3",
				"isHardwareAccelerable" : false
			},
			{
				// GalaxyNote:2.3.6
				"ua" : "Mozilla/5.0 (Linux;U;Android 2.3.6;ko-kr;SHV-E160S Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
				"os" : "android",
				"osVersion" : "2.3.6",
				"browser" : "default",
				"browserVersion" : "2.3.6",
				"isHardwareAccelerable" : false
			},
			{
				// GalaxyTab2:3.1
				"ua" : "Mozilla/5.0 (Linux;U; Android 3.1;ko-kr;SHW-M380S Build/HMJ37) AppleWebkit/534.13(KHTML, like Gecko) Version/4.0 Safari/534.13",
				"os" : "android",
				"osVersion" : "3.1",
				"browser" : "default",
				"browserVersion" : "3.1",
				"isHardwareAccelerable" : false
			},
			{
				// GalaxyNexus:4.0.1
				"ua" : "Mozilla/5.0 (Linux;U;Android 4.0.1;ko-kr;Galaxy Nexus Build/ITL41F)AppleWebKit/534.30 (KHTML, like Gecko)Version/4.0 Mobile Safari/534.30",
				"os" : "android",
				"osVersion" : "4.0.1",
				"browser" : "default",
				"browserVersion" : "4.0.1",
				"isHardwareAccelerable" : false
			},
			{
				// GalaxyS3:4.0.4
				"ua" : "Mozilla/5.0 (Linux; U; Android 4.0.4; ko-kr; SHV-E210S Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
				"os" : "android",
				"osVersion" : "4.0.4",
				"browser" : "default",
				"browserVersion" : "4.0.4",
				"isHardwareAccelerable" : true
			},
			{
				// GalaxyS2:chrome
				"ua" : "Mozilla/5.0 (Linux; U;Android 4.0.3;ko-kr; SHW-M250S Build/IML74K) AppleWebKit/535.7 (KHTML, like Gecko) Chrome/16.0.912.77 Mobile Safari/535.7",
				"os" : "android",
				"osVersion" : "4.0.3",
				"browser" : "chrome",
				"browserVersion" : "16.0.912.77",
				"isHardwareAccelerable" : false
			},
			{
				// GalaxyS4:4.2.2
				"ua" : "Mozilla/5.0 (Linux; Android 4.2.2; ko-kr; SAMSUNG SHV-E300S Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Version/1.0 Chrome/18.0.1025.308 Mobile Safari/535.19",
				"os" : "android",
				"osVersion" : "4.2.2",
				"browser" : "sbrowser",
				"browserVersion" : "18.0.1025.308",
				"isHardwareAccelerable" : true
			},
			{
				// GalaxyS4:chrome
				"ua" : "Mozilla/5.0 (Linux; Android 4.2.2; SHV-E300S Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19",
				"os" : "android",
				"osVersion" : "4.2.2",
				"browser" : "chrome",
				"browserVersion" : "18.0.1025.166",
				"isHardwareAccelerable" : false
			},
			{
				// GalaxyNexus:4.2.2
				"ua" : "Mozilla/5.0 (Linux; Android 4.2.2;ko-kr; Galaxy Nexus Build/JDQ39) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
				"os" : "android",
				"osVersion" : "4.2.2",
				"browser" : "default",
				"browserVersion" : "4.2.2",
				"isHardwareAccelerable" : true
			},
			{
				// GalaxyNexus:chrome
				"ua" : "Mozilla/5.0 (Linux; Android 4.2.2; Galaxy Nexus Build/JDQ39) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/18.0.1364.169 Mobile Safari/537.22",
				"os" : "android",
				"osVersion" : "4.2.2",
				"browser" : "chrome",
				"browserVersion" : "18.0.1364.169",
				"isHardwareAccelerable" : false
			},
			{
				// GalaxyNexus:chrome
				"ua" : "Mozilla/5.0 (Linux; Android 4.2.2; Galaxy Nexus Build/JDQ39) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.169 Mobile Safari/537.22",
				"os" : "android",
				"osVersion" : "4.2.2",
				"browser" : "chrome",
				"browserVersion" : "25.0.1364.169",
				"isHardwareAccelerable" : true
			},
			{
				// GalaxyNote2:chrome
				"ua" : "Mozilla/5.0 (Linux; Android 4.3; SHV-E250S Build/JSS15J) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.59 Mobile Safari/537.36",
				"os" : "android",
				"osVersion" : "4.3",
				"browser" : "chrome",
				"browserVersion" : "31.0.1650.59",
				"isHardwareAccelerable" : true
			},
			{
				// Xiaomi_2013061_TD:browser
				"ua" : "Xiaomi_2013061_TD/V1 Linux/3.4.5 Android/4.2.1 Release/09.18.2013 Browser/AppleWebKit534.30 Mobile Safari/534.30 MBBMS/2.2 System/Android 4.2.1 XiaoMi/MiuiBrowser/1.0",
				"os" : "android",
				"osVersion" : "4.2.1",
				"browser" : "default",
				"browserVersion" : "4.2.1",
				"isHardwareAccelerable" : true
			},
			{
				// window && IE
				"ua" : "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; IPMS/930D0D0A-04A359770A0; TCO_20090615095913; InfoPath.2; .NET CLR 2.0.50727)",
				"os" : "window",
				"osVersion" : "5.1",
				"browser" : "ie",
				"browserVersion" : "7.0",
				"isHardwareAccelerable" : true
			},
			{
				// Windows 7 && IE
				"ua" : "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)",
				"os" : "window",
				"osVersion" : "6.1",
				"browser" : "ie",
				"browserVersion" : "8.0",
				"isHardwareAccelerable" : true
			},
			{
				// Windows 7 && IE
				"ua" : "Mozilla/5.0 (Windows NT 6.1;; APCPMS=^N20120502090046254556C65BBCE3E22DEE3F_24184^; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E; TCO_20150325103347; rv:11.0) like Gecko",
				"os" : "window",
				"osVersion" : "6.1",
				"browser" : "ie",
				"browserVersion" : "7.0",
				"isHardwareAccelerable" : true
			},
			{
				// Windows 7 && Chrome
				"ua" : "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36",
				"os" : "window",
				"osVersion" : "6.1",
				"browser" : "chrome",
				"browserVersion" : "41.0.2272.101",
				"isHardwareAccelerable" : true
			},
			{
				// Windows 7 && Firefox
				"ua" : "Mozilla/5.0 (Windows NT 6.1; rv:36.0) Gecko/20100101 Firefox/36.0",
				"os" : "window",
				"osVersion" : "6.1",
				"browser" : "firefox",
				"browserVersion" : "36.0",
				"isHardwareAccelerable" : true
			},
			{
				// Mac && Chrome
				"ua" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36",
				"os" : "mac",
				"osVersion" : "10.10.2",
				"browser" : "chrome",
				"browserVersion" : "41.0.2272.101",
				"isHardwareAccelerable" : true
			},
			{
				// Mac && Safari
				"ua" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18",
				"os" : "mac",
				"osVersion" : "10.10.2",
				"browser" : "safari",
				"browserVersion" : "8.0.3",
				"isHardwareAccelerable" : true
			},
			{
				// Phantomjs (default value)
				"ua" : "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.8 Safari/534.34",
				"os" : "",
				"osVersion" : "0",
				"browser" : "default",
				"browserVersion" : "0",
				"isHardwareAccelerable" : false
			}
		]
	},
	teardown : function() {
		eg._init(navigator.userAgent);
	}
});
test("agent Test", function() {
	// Given
	// When
	ua.forEach(function(v) {
		eg._init(v.ua);
		//Then
		equal(v.os, eg.agent.os, "check os type : " + v.ua);
		equal(v.osVersion, eg.agent.osVersion, "check os Version");
		equal(v.browser, eg.agent.browser, "check browser type");
		equal(v.browserVersion, eg.agent.browserVersion, "check browser Version");
	});
});

test("isHardwareAccelerable Test", function() {
	// Given
	// When
	ua.forEach(function(v) {
		eg._init(v.ua);
		//Then
		equal(v.isHardwareAccelerable, eg.isHardwareAccelerable(), "check return value : " + v.ua);
	});
});
