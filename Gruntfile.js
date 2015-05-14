/*global module:false*/
"use strict";
module.exports = function(grunt) {
  require("time-grunt")(grunt);
  require("load-grunt-tasks")(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    banner : [
      "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ",
      "<%= grunt.template.today('yyyy-mm-dd') %>\n",
      "<%= pkg.homepage ? '* ' + pkg.homepage + '\\n' : '' %>",
      "* Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>;",
      " Licensed <%= _.pluck(pkg.licenses, 'type').join(", ") %> */\n"
    ].join(""),
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
        process : function(src) {
          src = src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, "$1"); // remove "use strict";
          src = src.replace(/#__VERSION__#/g, grunt.config.data.pkg.version); // change version;
          return src;
        }
      },
      build: {
        src: ["src/polyfill/**/*.js", "src/module.js", "src/eg.js", "src/customEvent/*.js", "src/class.js", "src/component.js", "src/movableCoord.js", "src/flicking.js", "src/*.js" ],
        dest: "dist/<%=pkg.outputname%>.js"
      },
    },
    uglify: {
      options: {
        banner: "<%=banner%>"
      },
      dist : {
        src: "dist/<%=pkg.outputname%>.js",
        dest: "dist/<%=pkg.outputname%>.min.js"
      }
    },
    copy : {
      lib : {
        expand : true,
        flatten : true,
        src : [
            "bower_components/jquery/jquery.js",
            "bower_components/hammer.js/hammer.js",
            "bower_components/jquery.easing/js/jquery.easing.js",
          ],
        dest : "dist/lib"
      },
      doc : {
        files: [
          {expand : true, flatten : true, src: ["node_modules/egjs-jsdoc-template/jsdoc-plugin/*.*"], dest: "node_modules/grunt-jsdoc/node_modules/jsdoc/plugins"}
        ]
      }
    },
    qunit : {
      options : {
        timeout : 10000,
        "--web-security": "no",
        coverage: {
          disposeCollector: true,
          src: ["src/**/*.js"],
          instrumentedFiles: "temp/",
          htmlReport: "report",
          coberturaReport: "report",
          linesThresholdPct: 0
        }
      }
    },
    watch : {
      source : {
        files : [ "src/**/*.js"],
        tasks : [ "build" ],
        options : {
          spawn : false
        }
      }
    },
    jsdoc : {
        dist : {
            src: ["src/**/*.js", "README.md"],
            options: {
                destination: "doc",
                template : "node_modules/egjs-jsdoc-template",
                configure : "jsdoc.json"
            }
        }
    }
  });

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

  grunt.registerTask("docBuild", ["copy:doc", "jsdoc"]);
  grunt.registerTask("build", ["concat", "uglify", "copy:lib", "docBuild"]);
  grunt.registerTask("default", ["jshint", "test", "build"]);
};
