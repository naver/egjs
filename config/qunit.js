module.exports = {
	options: {
		timeout: 20000,
		"--web-security": "no",
		coverage: {
			disposeCollector: true,
			src: ["src/**/*.js"],
			instrumentedFiles: "temp/",
			htmlReport: "report",
			lcovReport: "report",
			coberturaReport: "report",
			linesThresholdPct: 0
		},
		page: {
			viewportSize: { width: 360, height: 640 }
		}
	}
};
