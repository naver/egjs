/*global module:false*/
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    jshint: {
      files: ["Gruntfile.js", "*.js"],
      options: {
        jshintrc: true
      }
    },
    qunit : {
      all: ["test/**/*.html"]
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-qunit");
  // grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["jshint", "qunit"]);
};