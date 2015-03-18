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
      files: ["Gruntfile.js", "*.js", "src/**/*.js"],
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
        src: ["src/polyfill/**/*.js", "src/extend.js", "src/class.js", "src/component.js", "src/*.js" ],
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
            "bower_components/jquery/dist/jquery.js",
            "bower_components/jquery/dist/jquery.min.js",
            "bower_components/hammerjs/hammer.js",
            "bower_components/hammerjs/hammer.min.js",
            "bower_components/jquery.easing/js/jquery.easing.js",
            "bower_components/jquery.easing/js/jquery.easing.min.js"
          ],
        dest : "dist/lib"
      }
    },
    qunit : {
      options : {
        "--web-security": "no",
        coverage: {
          disposeCollector: true,
          src: ["src/**/*.js"],
          instrumentedFiles: "temp/",
          htmlReport: "report",
          coberturaReport: "report",
          linesThresholdPct: 0
        }
      },
      all: ["test/**/*.html"]
    }
  });

  grunt.registerTask("test", ["jshint", "qunit"]);
  grunt.registerTask("build", ["jshint", "concat", "uglify", "copy:lib"]);
  grunt.registerTask("default", ["test", "concat", "uglify", "copy:lib"]);
};