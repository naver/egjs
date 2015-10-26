/*global module:false*/
module.exports = function(grunt) {
	"use strict";
	require("time-grunt")(grunt);
	require("load-grunt-tasks")(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		gitinfo: grunt.task.run("gitinfo"),
		banner: "/**\n" +
			"* <%= pkg.name %>\n" +
			"* @version <%= pkg.version %>\n" +
			"* @SHA-1 <%= gitinfo.local.branch.current.shortSHA %><%= /(?!^master$)(^.*$)/.test(gitinfo.local.branch.current.name) && ' ('+ RegExp.$1 +')' || '' %>\n" +
			"*\n" +
			"* <%= pkg.author %>; <%= pkg.name %> JavaScript library\n" +
			"* http://egjs.navercorp.com/\n" +
			"*\n" +
			"* Released under the <%= pkg.licenses[0].type %> license\n" +
			"* <%= pkg.licenses[0].url %>\n" +
			"*/\n\n",
		jshint: {
			files: ["Gruntfile.js", "*.js", "src/**/*.js" ],
			options: {
				jshintrc: true,
				reporter: require("jshint-stylish")
			}
		},
		concat: {
			options: {
				banner: "<%=banner%>\"use strict\";\n",
				process: function(src) {
					src = src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, "$1"); // remove "use strict";
					src = src.replace(/#__VERSION__#/g, grunt.config.data.pkg.version); // change version;
					return src;
				}
			},
			build: {
				src: ["src/module.js", "src/eg.js", "src/customEvent/*.js", "src/hook/*.js", "src/plugin/*.js", "src/class.js", "src/component.js", "src/visible.js", "src/movableCoord.js", "src/flicking.js",  "src/infiniteGrid.js"],
				dest: "dist/<%=pkg.outputname%>.js"
			}
		},
		uglify: {
			options: {
				banner: "<%=banner%>"
			},
			dist: {
				src: "dist/<%=pkg.outputname%>.js",
				dest: "dist/<%=pkg.outputname%>.min.js"
			}
		},
		copy: {
			lib: {
				expand: true,
				flatten: true,
				src: [
					"bower_components/jquery/jquery.js",
					"bower_components/hammer.js/hammer.js"
				],
				dest: "dist/lib"
			},
			doc: {
				files: [{
					expand: true,
					flatten: true,
					src: ["node_modules/egjs-jsdoc-template/jsdoc-plugin/*.*"],
					dest: "node_modules/grunt-jsdoc/node_modules/jsdoc/plugins"
				}]
			}
		},
		qunit: {
			options: {
				timeout: 10000,
				"--web-security": "no",
				coverage: {
					disposeCollector: true,
					src: ["src/**/*.js"],
					instrumentedFiles: "temp/",
					htmlReport: "report",
					coberturaReport: "report",
					linesThresholdPct: 0
				},
				page: {
					viewportSize: { width: 320, height: 667 }
				}
			}
		},
		testee : {
			options: {
				root: "./",
				reporter: "Spec"
			},
			coverage: {
				options: {
					browsers: ["chrome", "firefox"],
					coverage: {
						ignore: ["assets/", "bower_components/", "node_modules/", "tc/", "test/"]
					}
				},
				src: ["test/*.test.html"]
			}
		},
		watch: {
			source: {
				files: [ "src/**/*.js"],
				tasks: [ "build" ],
				options: {
					spawn: false
				}
			}
		},
		jsdoc: {
			dist: {
				src: ["src/**/*.js", "README.md"],
				options: {
					destination: "doc",
					template: "node_modules/egjs-jsdoc-template",
					configure: "jsdoc.json"
				}
			}
		},
		jscs: {
			src: "<%=concat.build.src%>",
			options: {
				config: ".jscsrc"
			}
		}
	});

	grunt.loadNpmTasks("testee");

	grunt.registerTask("test", function() {
		var eachfile = Array.prototype.slice.apply(arguments);
		if(eachfile.length) {
			eachfile = eachfile.map(function(v) {
				return "test/" + v + ".test.html";
			}, this);
		} else {
			eachfile.push("test/*.test.html");
		}
		grunt.config.set("qunit.each", eachfile);
		grunt.log.oklns(grunt.config.get("qunit.each"));
		grunt.task.run("qunit:each");
	});

	grunt.registerTask("clean", function() {
		if (grunt.file.exists("doc")) {
			grunt.file["delete"]("doc", { force: true });
		}
	});

	grunt.registerTask("docBuild", ["copy:doc", "clean", "jsdoc"]);
	grunt.registerTask("build", ["concat", "uglify", "docBuild"]);
	// grunt.registerTask("build", ["concat", "uglify", "copy:lib", "docBuild"]);
	grunt.registerTask("default", ["jshint", "jscs", "build", "test"]);
	grunt.registerTask("check", ["jscs"]);
};