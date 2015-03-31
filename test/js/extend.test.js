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

test("determine the return value of a 'isHWAccelerable' function", function() {
	// Given
	var result = eg.isHWAccelerable();
	var controllValue = result;
	// When
	eg.defaults.isHWAccelerable = function(agent) {
		return !controllValue;
	};
	// Then
	notEqual(result, eg.isHWAccelerable(), "change default value");
});

test("pass the return value of a 'isHWAccelerable' function", function() {
	var result;
	// Given
	result = eg.isHWAccelerable();
	// When
	eg.defaults.isHWAccelerable = function(agent) {
		return null;
	};
	// Then
	equal(result, eg.isHWAccelerable(), "pass default value");

	// Given
	result = eg.isHWAccelerable();
	// When
	eg.defaults.isHWAccelerable = function(agent) {
		// undefined
	};
	// Then
	equal(result, eg.isHWAccelerable(), "pass default value");
});

test("remove 'defaults' function", function() {
	// Given
	var result = eg.isHWAccelerable();
	var controllValue = result;
	eg.defaults.isHWAccelerable = function(agent) {
		return !controllValue;
	};
	// When
	delete eg.defaults.isHWAccelerable;
	// Then
	equal(result, eg.isHWAccelerable(), "pass default value");
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
				"os" : {
					"name" : "ios",
					"version" : "3.0"
				},
				"browser" : {
					"name" : "safari",
					"version" : "4.0"
				},
				"isHWAccelerable" : true,
				"isTransitional" : true
			},
			{
				// iPhone 4.3.3
				"ua" : "Mozilla/5.0 (iPhone;U;CPU iPhone OS 4_3_3 like Max OS X;ko-kr) AppleWebKit/533.17.9(KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5",
				"os" : {
					"name" : "ios",
					"version" : "4.3.3"
				},
				"browser" : {
					"name" : "safari",
					"version" : "5.0.2"
				},
				"isHWAccelerable" : true,
				"isTransitional" : true
			},
			{
				// iPad 4.2.1
				"ua" : "Mozilla/5.0 (iPad;U;CPU OS 4_2_1 like Mac OS X;ko-kr) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5",
				"os" : {
					"name" : "ios",
					"version" : "4.2.1"
				},
				"browser" : {
					"name" : "safari",
					"version" : "5.0.2"
				},
				"isHWAccelerable" : true,
				"isTransitional" : true
			},
			{
				// iPad 4.3.3
				"ua" : "Mozilla/5.0 (iPad; U; CPU OS 4_3_3 like Mac OS X;ko-kr)AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5",
				"os" : {
					"name" : "ios",
					"version" : "4.3.3"
				},
				"browser" : {
					"name" : "safari",
					"version" : "5.0.2"
				},
				"isHWAccelerable" : true,
				"isTransitional" : true
			},
			{
				// iPhone 5.0.1
				"ua" : "Mozilla/5.0 (iPhone;CPU iPhone OS 5_0_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A405 Safari/7534.48.3",
				"os" : {
					"name" : "ios",
					"version" : "5.0.1"
				},
				"browser" : {
					"name" : "safari",
					"version" : "5.1"
				},
				"isHWAccelerable" : true,
				"isTransitional" : true
			},
			{
				// iPhone 6.0
				"ua" : "Mozilla/5.0 (iPhone;CPU iPhone OS 6_0_2 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A551 Safari/8536.25",
				"os" : {
					"name" : "ios",
					"version" : "6.0.2"
				},
				"browser" : {
					"name" : "safari",
					"version" : "6.0"
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// iPhone 6.1.2
				"ua" : "Mozilla/5.0 (iPhone;CPU iPhone OS 6_1_2 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B146 Safari/8536.25",
				"os" : {
					"name" : "ios",
					"version" : "6.1.2"
				},
				"browser" : {
					"name" : "safari",
					"version" : "6.0"
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// iPhone 7.0
				"ua" : "Mozilla/5.0 (iPhone;CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B146 Safari/8536.25",
				"os" : {
					"name" : "ios",
					"version" : "7.0"
				},
				"browser" : {
					"name" : "safari",
					"version" : "6.0"
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// GalaxyS:2.1
				"ua" : "Mozilla/5.0 (Linux;U;Android 2.1;ko-kr;SHW-M110S Build/ÉCLAIR) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17",
				"os" : {
					"name" : "android",
					"version" : "2.1"
				},
				"browser" : {
					"name" : "default",
					"version" : "2.1"
				},
				"isHWAccelerable" : false,
				"isTransitional" : false
			},
			{
				// GalaxyS:2.2
				"ua" : "Mozilla/5.0 (Linux;U;Android 2.2;ko-kr;SHW-M110S Build/FROYO) AppleWebKit/533.1(KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
				"os" : {
					"name" : "android",
					"version" : "2.2"
				},
				"browser" : {
					"name" : "default",
					"version" : "2.2"
				},
				"isHWAccelerable" : false,
				"isTransitional" : false
			},
			{
				// GalaxyS:2.3.4
				"ua" : "Mozilla/5.0 (Linux;U;Android 2.3.4;ko-kr;SHW-M110S Build/GINGERBREAD)AppleWebKit/533.1(KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
				"os" : {
					"name" : "android",
					"version" : "2.3.4"
				},
				"browser" : {
					"name" : "default",
					"version" : "2.3.4"
				},
				"isHWAccelerable" : false,
				"isTransitional" : false
			},
			{
				// GalaxyS2:2.3.3
				"ua" : "Mozilla/5.0 (Linux;U;Android 2.3.3;ko-kr;SHW-M250S Build/GINGERBREAD) AppleWebKit/533.1(KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
				"os" : {
					"name" : "android",
					"version" : "2.3.3"
				},
				"browser" : {
					"name" : "default",
					"version" : "2.3.3"
				},
				"isHWAccelerable" : false,
				"isTransitional" : false
			},
			{
				// GalaxyNote:2.3.6
				"ua" : "Mozilla/5.0 (Linux;U;Android 2.3.6;ko-kr;SHV-E160S Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
				"os" : {
					"name" : "android",
					"version" : "2.3.6"
				},
				"browser" : {
					"name" : "default",
					"version" : "2.3.6"
				},
				"isHWAccelerable" : false,
				"isTransitional" : false
			},
			{
				// GalaxyTab2:3.1
				"ua" : "Mozilla/5.0 (Linux;U; Android 3.1;ko-kr;SHW-M380S Build/HMJ37) AppleWebkit/534.13(KHTML, like Gecko) Version/4.0 Safari/534.13",
				"os" : {
					"name" : "android",
					"version" : "3.1"
				},
				"browser" : {
					"name" : "default",
					"version" : "3.1"
				},
				"isHWAccelerable" : false,
				"isTransitional" : false
			},
			{
				// GalaxyNexus:4.0.1
				"ua" : "Mozilla/5.0 (Linux;U;Android 4.0.1;ko-kr;Galaxy Nexus Build/ITL41F)AppleWebKit/534.30 (KHTML, like Gecko)Version/4.0 Mobile Safari/534.30",
				"os" : {
					"name" : "android",
					"version" : "4.0.1"
				},
				"browser" : {
					"name" : "default",
					"version" : "4.0.1"
				},
				"isHWAccelerable" : false,
				"isTransitional" : false
			},
			{
				// GalaxyS3:4.0.4
				"ua" : "Mozilla/5.0 (Linux; U; Android 4.0.4; ko-kr; SHV-E210S Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
				"os" : {
					"name" : "android",
					"version" : "4.0.4"
				},
				"browser" : {
					"name" : "default",
					"version" : "4.0.4"
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// GalaxyS2:chrome
				"ua" : "Mozilla/5.0 (Linux; U;Android 4.0.3;ko-kr; SHW-M250S Build/IML74K) AppleWebKit/535.7 (KHTML, like Gecko) Chrome/16.0.912.77 Mobile Safari/535.7",
				"os" : {
					"name" : "android",
					"version" : "4.0.3"
				},
				"browser" : {
					"name" : "chrome",
					"version" : "16.0.912.77",
				},
				"isHWAccelerable" : false,
				"isTransitional" : true
			},
			{
				// GalaxyS4:4.2.2
				"ua" : "Mozilla/5.0 (Linux; Android 4.2.2; ko-kr; SAMSUNG SHV-E300S Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Version/1.0 Chrome/18.0.1025.308 Mobile Safari/535.19",
				"os" : {
					"name" : "android",
					"version" : "4.2.2"
				},
				"browser" : {
					"name" : "sbrowser",
					"version" : "18.0.1025.308",
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// GalaxyS4:chrome
				"ua" : "Mozilla/5.0 (Linux; Android 4.2.2; SHV-E300S Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19",
				"os" : {
					"name" : "android",
					"version" : "4.2.2"
				},
				"browser" : {
					"name" : "chrome",
					"version" : "18.0.1025.166",
				},
				"isHWAccelerable" : false,
				"isTransitional" : true
			},
			{
				// GalaxyNexus:4.2.2
				"ua" : "Mozilla/5.0 (Linux; Android 4.2.2;ko-kr; Galaxy Nexus Build/JDQ39) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
				"os" : {
					"name" : "android",
					"version" : "4.2.2"
				},
				"browser" : {
					"name" : "default",
					"version" : "4.2.2"
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// GalaxyNexus:chrome
				"ua" : "Mozilla/5.0 (Linux; Android 4.2.2; Galaxy Nexus Build/JDQ39) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/18.0.1364.169 Mobile Safari/537.22",
				"os" : {
					"name" : "android",
					"version" : "4.2.2"
				},
				"browser" : {
					"name" : "chrome",
					"version" : "18.0.1364.169"
				},
				"isHWAccelerable" : false,
				"isTransitional" : true
			},
			{
				// GalaxyNexus:chrome
				"ua" : "Mozilla/5.0 (Linux; Android 4.2.2; Galaxy Nexus Build/JDQ39) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.169 Mobile Safari/537.22",
				"os" : {
					"name" : "android",
					"version" : "4.2.2"
				},
				"browser" : {
					"name" : "chrome",
					"version" : "25.0.1364.169"
				},
				"isHWAccelerable" : true,
				"isTransitional" : true
			},
			{
				// GalaxyNote2:chrome
				"ua" : "Mozilla/5.0 (Linux; Android 4.3; SHV-E250S Build/JSS15J) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.59 Mobile Safari/537.36",
				"os" : {
					"name" : "android",
					"version" : "4.3"
				},
				"browser" : {
					"name" : "chrome",
					"version" : "31.0.1650.59"
				},
				"isHWAccelerable" : true,
				"isTransitional" : true
			},
			{
				// Xiaomi_2013061_TD:browser
				"ua" : "Xiaomi_2013061_TD/V1 Linux/3.4.5 Android/4.2.1 Release/09.18.2013 Browser/AppleWebKit534.30 Mobile Safari/534.30 MBBMS/2.2 System/Android 4.2.1 XiaoMi/MiuiBrowser/1.0",
				"os" : {
					"name" : "android",
					"version" : "4.2.1"
				},
				"browser" : {
					"name" : "default",
					"version" : "4.2.1"
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},


			{
				// window && IE
				"ua" : "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; IPMS/930D0D0A-04A359770A0; TCO_20090615095913; InfoPath.2; .NET CLR 2.0.50727)",
				"os" : {
					"name" : "window",
					"version" : "5.1"
				},
				"browser" : {
					"name" : "ie",
					"version" : "7.0"
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// Windows 7 && IE
				"ua" : "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)",
				"os" : {
					"name" : "window",
					"version" : "6.1"
				},
				"browser" : {
					"name" : "ie",
					"version" : "8.0"
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// Windows 7 && IE
				"ua" : "Mozilla/5.0 (Windows NT 6.1;; APCPMS=^N20120502090046254556C65BBCE3E22DEE3F_24184^; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E; TCO_20150325103347; rv:11.0) like Gecko",
				"os" : {
					"name" : "window",
					"version" : "6.1"
				},
				"browser" : {
					"name" : "ie",
					"version" : "7.0"
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// Windows 7 && Chrome
				"ua" : "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36",
				"os" : {
					"name" : "window",
					"version" : "6.1"
				},
				"browser" : {
					"name" : "chrome",
					"version" : "41.0.2272.101"
				},
				"isHWAccelerable" : true,
				"isTransitional" : true
			},
			{
				// Windows 7 && Firefox
				"ua" : "Mozilla/5.0 (Windows NT 6.1; rv:36.0) Gecko/20100101 Firefox/36.0",
				"os" : {
					"name" : "window",
					"version" : "6.1"
				},
				"browser" : {
					"name" : "firefox",
					"version" : "36.0"
				},
				"isHWAccelerable" : true,
				"isTransitional" : true
			},
			{
				// Mac && Chrome
				"ua" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36",
				"os" : {
					"name" : "mac",
					"version" : "10.10.2"
				},
				"browser" : {
					"name" : "chrome",
					"version" : "41.0.2272.101"
				},
				"isHWAccelerable" : true,
				"isTransitional" : true
			},
			{
				// Mac && Safari
				"ua" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18",
				"os" : {
					"name" : "mac",
					"version" : "10.10.2"
				},
				"browser" : {
					"name" : "safari",
					"version" : "8.0.3"
				},
				"isHWAccelerable" : true,
				"isTransitional" : true
			},
			{
				// Phantomjs (default value)
				"ua" : "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.8 Safari/534.34",
				"os" : {
					"name" : "",
					"version" : "-1"
				},
				"browser" : {
					"name" : "default",
					"version" : "-1"
				},
				"isHWAccelerable" : false,
				"isTransitional" : false
			},
			{
				// Window XP && ie6
				"ua" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 1.0.3705; Media Center PC 3.1)",
				"os" : {
					"name" : "window",
					"version" : "5.1"
				},
				"browser" : {
					"name" : "ie",
					"version" : "6.0"
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// Window && ie6
				"ua" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 1.0.37052000; Media Center PC 3.1)",
				"os" : {
					"name" : "window",
					"version" : "5.1"
				},
				"browser" : {
					"name" : "ie",
					"version" : "6.0"
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// Window XP && ie7
				"ua" : "Mozilla/5.0 (compatible; MSIE 7.0; Windows NT 5.0; Trident/4.0; FBSMTWB; .NET CLR 2.0.34861; .NET CLR 3.0.3746.3218; .NET CLR 3.5.33652; msn OptimizedIE8;ENUS)",
				"os" : {
					"name" : "window",
					"version" : "5.0"
				},
				"browser" : {
					"name" : "ie",
					"version" : "7.0"
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// Window Vista && ie6.2
				"ua" : "Mozilla/5.3 (compatible; MSIE 6.2; Windows NT 6.0)",
				"os" : {
					"name" : "window",
					"version" : "6.0"
				},
				"browser" : {
					"name" : "ie",
					"version" : "6.2"
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// Window 2000 && ie6
				"ua" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows 2000)",
				"os" : {
					"name" : "window",
					"version" : "5.0"
				},
				"browser" : {
					"name" : "ie",
					"version" : "6.0"
				},
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// Window 2000 && IE8에서 IE7모드
				"ua" : "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; IPMS/DE240D0A-14B4E9316A6-00000032300C; TCO_20100114140812; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET CLR 3.0.04506.30; InfoPath.2; .NET CLR 3.0.04506.648; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; OfficeLiveConnector.1.3; OfficeLivePatch.0.0)",
				"os" : {
					"name" : "window",
					"version" : "5.1"
				},
				"browser" : {
					"name" : "ie",
					"version" : "7.0",
					"nativeVersion" : "8"
				},
				"_documentMode" : 8,
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// Window 2000 && IE8에서 호환모드
				"ua" : "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; IPMS/DE240D0A-14B4E9316A6-00000032300C; TCO_20100114140812; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET CLR 3.0.04506.30; InfoPath.2; .NET CLR 3.0.04506.648; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; OfficeLiveConnector.1.3; OfficeLivePatch.0.0)",
				"os" : {
					"name" : "window",
					"version" : "5.1"
				},
				"browser" : {
					"name" : "ie",
					"version" : "7.0",
					"nativeVersion" : "8"
				},
				"_documentMode" : 9,
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// Window7, IE9에서 호환 모드
				"ua" : "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C)",
				"os" : {
					"name" : "window",
					"version" : "6.1"
				},
				"browser" : {
					"name" : "ie",
					"version" : "7.0",
					"nativeVersion" : "9"
				},
				"_documentMode" : 7,
				"isHWAccelerable" : true,
				"isTransitional" : false
			},
			{
				// IE11
				"ua" : "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; Touch; .NET4.0E; .NET4.0C; Tablet PC 2.0; rv:11.0) like Gecko",
				"os" : {
					"name" : "window",
					"version" : "6.3"
				},
				"browser" : {
					"name" : "ie",
					"version" : "7.0",
					"nativeVersion" : "11"
				},
				"_documentMode" : 11,
				"isHWAccelerable" : true,
				"isTransitional" : true
			},
			{
				// IE11 호환성
				"ua" : "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; Touch; .NET4.0E; .NET4.0C; Tablet PC 2.0; rv:11.0) like Gecko",
				"os" : {
					"name" : "window",
					"version" : "6.3"
				},
				"browser" : {
					"name" : "ie",
					"version" : "7.0",
					"nativeVersion" : "11"
				},
				"_documentMode" : 7,
				"isHWAccelerable" : true,
				"isTransitional" : true
			},
			{
				// Window 8 && ie10
				"ua" : "Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; SAMSUNG; SGH-T899M",
				"os" : {
					"name" : "window",
					"version" : "8.0"
				},
				"browser" : {
					"name" : "ie",
					"version" : "10.0",
					"nativeVersion" : "10"
				},
				"isHWAccelerable" : true,
				"isTransitional" : true
			},

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
		equal(eg.agent.os.name, v.os.name, "check os name : " + v.ua);
		equal(eg.agent.os.version, v.os.version, "check os Version");
		equal(eg.agent.browser.name, v.browser.name, "check browser name");
		equal(eg.agent.browser.version, v.browser.version, "check browser Version");
	});
});

test("agent nativeVersion Test", function() {
	// Given
	// When
	ua.forEach(function(v) {
		if(v._documentMode) {
			eg._init(v.ua, v._documentMode);

			//Then
			equal(eg.agent.browser.nativeVersion, v.browser.nativeVersion, "check browser native Version: " + v.ua + " , " + eg.agent.browser.nativeVersion + " , " + v.browser.nativeVersion);
		}
	});
});

test("isHWAccelerable Test", function() {
	// Given
	// When
	ua.forEach(function(v) {
		eg._init(v.ua);
		//Then
		equal( eg.isHWAccelerable(), v.isHWAccelerable, "check return value : " + v.ua);
	});
});


test("isTransitional Test", function() {
	// Given
	// When
	ua.forEach(function(v) {
		eg._init(v.ua, v._documentMode);
		//Then
		equal(eg.isTransitional(), v.isTransitional, "check return value : " + v.ua);
	});
});
