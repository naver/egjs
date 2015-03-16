/*global module:false*/
"use strict";
module.exports = function(grunt) {
  require("time-grunt")(grunt);
  require("load-grunt-tasks")(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    jshint: {
      files: ["Gruntfile.js", "*.js", "src/**/*.js"],
      options: {
        jshintrc: true,
        reporter: require("jshint-stylish")
      }
    },
    qunit : {
      options : {
        "--web-security": "no",
        coverage: {
          disposeCollector: true,
          src: ["src/js/**/*.js"],
          instrumentedFiles: "temp/",
          htmlReport: "report",
          coberturaReport: "report/",
          linesThresholdPct: 0
        }
      },
      all: ["test/**/*.html"]
    }
  });

  grunt.registerTask("default", ["jshint", "qunit"]);
};