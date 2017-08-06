const parseRules = {
	browser: [{
		criteria: "PhantomJS",
		identity: "PhantomJS",
	}, {
		criteria: /Whale/,
		identity: "Whale",
		versionSearch: "Whale",
	}, {
		criteria: /Edge/,
		identity: "Edge",
		versionSearch: "Edge",
	}, {
		criteria: /MSIE|Trident|Windows Phone/,
		identity: "IE",
		versionSearch: "IEMobile|MSIE|rv",
	}, {
		criteria: /MiuiBrowser/,
		identity: "MIUI Browser",
		versionSearch: "MiuiBrowser",
	}, {
		criteria: /SamsungBrowser/,
		identity: "Samsung Internet",
		versionSearch: "SamsungBrowser",
	}, {
		criteria: /SAMSUNG /,
		identity: "Samsung Internet",
		versionSearch: "Version",
	}, {
		criteria: /Chrome|CriOS/,
		identity: "Chrome",
	}, {
		criteria: /Android/,
		identity: "Android Browser",
		versionSearch: "Version",
	}, {
		criteria: /iPhone|iPad/,
		identity: "Safari",
		versionSearch: "Version",
	}, {
		criteria: "Apple",
		identity: "Safari",
		versionSearch: "Version",
	}, {
		criteria: "Firefox",
		identity: "Firefox",
	}],
	os: [{
		criteria: /Windows Phone/,
		identity: "Windows Phone",
		versionSearch: "Windows Phone",
	},
	{
		criteria: "Windows 2000",
		identity: "Window",
		versionAlias: "5.0",
	},
	{
		criteria: /Windows NT/,
		identity: "Window",
		versionSearch: "Windows NT",
	}, {
		criteria: /iPhone|iPad/,
		identity: "iOS",
		versionSearch: "iPhone OS|CPU OS",
	}, {
		criteria: "Mac",
		versionSearch: "OS X",
		identity: "MAC",
	}, {
		criteria: /Android/,
		identity: "Android",
	}],

	// Webview check condition
	// ios: If has no version information
	// Android 5.0 && chrome 40+: Presence of "; wv" in userAgent
	// Under android 5.0: Presence of "NAVER" or "Daum" in userAgent
	webview: [{
		criteria: /iPhone|iPad/,
		browserVersionSearch: "Version",
		webviewBrowserVersion: /-1/,
	}, {
		criteria: /iPhone|iPad|Android/,
		webviewToken: /NAVER|DAUM|; wv/,

	}],
	defaultString: {
		browser: {
			version: "-1",
			name: "unknown",
		},
		os: {
			version: "-1",
			name: "unknown",
		},
	},
};

export default parseRules;
