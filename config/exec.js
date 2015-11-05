module.exports = {
	// create changelog
	changelog: {
		after: "2015-09-25",  // start date
		before: "",  // end date ('today' when no value has given)
		issueURL: {
			enterprise: "https://oss.navercorp.com/egjs/egjs/issues",
			github: "https://oss.navercorp.com/egjs/egjs/issues"  // http://github.com/naver/egjs/issues
		},
		cmd: function() {
			var before = this.config("exec.changelog.before") || this.template.today("yyyy-mm-dd");

			return [
                "git log",
                "--grep=feat",
                "--grep=fix",
                "-i",
                "--after={" + this.config("exec.changelog.after") + "}",
                "--before={" + before + "}",
                "--pretty=\"<item><hash>%h</hash><subject>%s</subject><body><![CDATA[%b]]></body></item>\"",
                "--no-merges"
			].join(" ");
		},
		callback: function(error, stdout, stderr) {
			var grunt = require("grunt");
			var xml2js = require("xml2js");
			var parser = new xml2js.Parser();
			var logdata = {
					feat: {},
					fix: {}
				};

			// check for duplication
			var isDuplicated = function(data, val) {
				for (var i = 0, el; el = data[i]; i++) {
					if (el.subject === val ) {
						return true;
					}
				}

				return false;
			};

			var capitalize = function(val) {
				return val.charAt(0).toUpperCase() + val.substr(1);
			};

			// get sorted module name
			var getModuleName = function(val) {
				if (val.indexOf(",") === -1) {
					return capitalize(val);
				}

				val = val.trim().replace(/\s*,\s*/g, ",").split(",");
				val.forEach(function(v, i) {
					val[i] = capitalize(v);
				});

				return val.sort().join(", ");
			};

			// get issue url according type
			var getIssueURL = function(type) {
				console.log(type)
				var issueURL = grunt.config("exec.changelog.issueURL");
				return type === "e" || type !== "g" ? issueURL.enterprise : issueURL.github;
			};

			parser.parseString("<logs>" + stdout + "</logs>", function(err, result) {
				if (!result || !result.logs) {
					return;
				}

				var rxNewline = /\r?\n/g;
				var rxBody = /ref\s([egy#])-?([0-9]+)$/i;
				var rxSubject = /^(fix|feat)\s?\((\w+)\)\s*:\s*(.*)/i;
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
				markdown += grunt.template.process(template.category, { data: {
					category: x === "feat" && "Features" || x === "fix" && "Bug Fixes" || ""
				}});

				for (var z in logdata[x]) {
					markdown += grunt.template.process(template.module, { data: {
						module: z
					}});

					for (var i = 0, el; el = logdata[x][z][i]; i++) {
						markdown += grunt.template.process(template.item, { data: {
							subject: el.subject,
							issueNo: el.issueNo,
							url: getIssueURL(el.issueType),
							hash: el.hash
						}});
					}
				}
			}

			grunt.file.write("CHANGELOG.md", markdown, { encoding: "UTF-8" });
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