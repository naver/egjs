// Filtering types
var filterType = {
	feat: "Features",
	fix: "Bug Fixes",
	refactor: "Refactorings",
	test: "Test Codes"
};

module.exports = {
	// create changelog
	changelog: {
		issueURL: "https://github.com/naver/egjs/issues",
		cmd: function(after, before) {
			var date = new Date();

			after = after || this.template.date(date.setMonth(date.getMonth() - 1), 'yyyy-mm-dd');  // default: a month ago
			before = before || this.template.today("yyyy-mm-dd");  // default: today

			console.log("---------------------------------------------------------------");
			console.log(" [CHANGELOG] Creating for period of =>", after, "~", before);
			console.log("---------------------------------------------------------------");

			return [
                "git log",
				[,].concat(Object.keys(filterType)).join(" --grep="),
                "-i",
                "--after={" + after + "}",
                "--before={" + before + "}",
                "--pretty=\"<item><hash>%h</hash><subject><![CDATA[%s]]></subject><body><![CDATA[%b]]></body></item>\"",
                "--no-merges"
			].join(" ");
		},
		callback: function(error, stdout, stderr) {
			var grunt = require("grunt");
			var xml2js = require("xml2js");
			var parser = new xml2js.Parser();

			// define log data structure
			var logdata = {};
			Object.keys(filterType).forEach(v => logdata[v] = {});

			// check for duplication
			var isDuplicated = function(data, val) {
				val = val.toLowerCase();

				for (var i = 0, el; el = data[i]; i++) {
					if (el.subject.toLowerCase() === val) {
						return true;
					}
				}

				return false;
			};

			var capitalize = val => val.charAt(0).toUpperCase() + val.substr(1);

			// get sorted module name
			var getModuleName = function(val) {
				if (val.indexOf(",") === -1) {
					return capitalize(val);
				}

				val = val.trim().replace(/\s*,\s*/g, ",").split(",");
				val.forEach((v, i) => val[i] = capitalize(v));

				return val.sort().join(", ");
			};

			parser.parseString(`<logs>${ stdout }</logs>`, function(err, result) {
				if (!result || !result.logs) {
					return;
				}

				var rxNewline = /\r?\n/g;
				var rxBody = /(?:ref|fix|close)\s([egy#]|gh)-?([0-9]+)/i;
				var rxSubject = new RegExp(`^(${ Object.keys(filterType).join("|") })\\s?\\(([a-z-_,\\s]+)\\)\\s*:\\s*(.*)`, "i");
				var issue, subject, category, module;

				for (var i = 0, el; el = result.logs.item[i]; i++) {

					// filter logs which has issue reference on commit body message.
					issue = el.body[0].replace(rxNewline, "").match(rxBody);

					if (issue) {
						subject = el.subject[0].match(rxSubject);

						// filter subject which matches with fix or feat format
						if (subject) {
							category = logdata[subject[1]];
							module = getModuleName(subject[2]);

							if (!category[module]) {
								category[module] = [];
							}

							// filter duplicated subject
							if (!isDuplicated(category[module], subject[3])) {
								category[module].push({
									subject: capitalize(subject[3]),
									issueType: issue[1],
									issueNo: issue[2],
									hash: el.hash[0]
								});
							}
						}
					}
				}
			});

			// template for content of CHANGELOG.md
			var template = {
				header: "# <%= version%> release (<%= date %>)\r\n",
				category: "\r\n## <%= category %> :\r\n",
				module: "\r\n- **<%= module %>**\r\n",
				item: "\t- <%= subject %> ([#<%= issueNo %>](<%= url %>/<%= issueNo %>))\r\n"
			};

			var markdown = grunt.template.process(template.header, { data: {
					version: grunt.config("pkg.version"),
					date: grunt.config("gitinfo.lastCommitTime")
				}});

			for (var x in logdata) {
				if (Object.keys(logdata[x]).length === 0) {
					continue;
				}

				markdown += grunt.template.process(template.category, { data: {
					category: filterType[x] || ""
				}});

				for (var z in logdata[x]) {
					markdown += grunt.template.process(template.module, { data: {
						module: z
					}});

					for (var i = 0, el; el = logdata[x][z][i]; i++) {
						markdown += grunt.template.process(template.item, { data: {
							subject: el.subject,
							issueNo: el.issueNo,
							url: grunt.config("exec.changelog.issueURL"),
							hash: el.hash
						}});
					}
				}
			}

			grunt.file.write("CHANGELOG.md", markdown, { encoding: "UTF-8" });
			console.log("Done, check out 'CHANGELOG.md' file.");
		},
		stdout: false
	},

	// get git info
	gitinfo: {
		cmd: function() {
			return [
				"git rev-parse --abbrev-ref HEAD",
				"&&"
				,"git log -1 --pretty=\"format:%h %ci\" --no-merges"
			].join(" ");
		},
		callback: function(error, stdout, stderr) {
			var info = stdout.replace(/\r?\n/," ").split(" ");

			require("grunt").config.set("gitinfo", {
				branchName: info[0],
				shortSHA: info[1],
				lastCommitTime: info[2]
			});
		},
		stdout: false
	}
};