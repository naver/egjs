"use strict";

module.exports = function() {
	
	var outlayerDep = require("../../config/dependency.js").outlayer;	
	var hammerDep = require("../../config/dependency.js").hammer;	

	var dependency = require("./dependency.js").dependency;	
	var jsdocParse = require("jsdoc-parse")
	
	var depMap = {};
	for(var i=0; i<dependency.length;i++){
		depMap[dependency[i].name] = dependency[i];
	}
	
	function getDependencyPath(resourceName) {
		var PATHS = {
			'jquery': 'bower_components/jquery/jquery.js',
			'hammer.js': hammerDep.concat(['test/lib/hammerjs-simulator.js']),
			'outlayer' : outlayerDep,
			'module': 'test/lib/module.js',
			'module_real': 'src/module.js',
			'sinon': 'test/lib/sinon-1.14.1.js',
			'iscroll': 'bower_components/iscroll/build/iscroll.js'
		}, path = PATHS[resourceName], type;
		
		if(path) {
			return path;
		}

		type = depMap[resourceName].type;
		return 'src/' + ( type ? type +'/' : '' ) + resourceName + '.js';				
	}
	
	function getTestSuiteFiles(moduleName) {
		var depInfo = depMap[moduleName];
		if(!depInfo) 
			return;
		var egDep = depInfo.egDependencies;
		
		var extDep = depInfo.dependencies || [];
		var depResult = [].concat(egDep || []);
		
		// get dependency list
		for(var i in egDep) {
			var external = depMap[egDep[i]].dependencies;
			if(external && external.length > 0) {
				extDep = extDep.concat(external);
			}
		}		
			
		depResult = extDep.concat(depResult);

		// if testing "module" module 
		if(moduleName === 'module') {
			depResult.splice(depResult.indexOf('module'), 1);
			depResult = ['jquery', 'module_real', 'eg', 'class', 'component'].concat(depResult);
		}
		// if testing "rotate" module 
		if(moduleName === 'rotate') {
			depResult = ['sinon'].concat(depResult);
		}		

		// if testing "rotate" module 
		if(moduleName === 'visible') {
			depResult = ['iscroll'].concat(depResult);
		}	
		
		// move jQuery to first
		if(depResult.indexOf('jquery') >= 0) {
			depResult.splice(depResult.indexOf('jquery'), 1);
			depResult.unshift('jquery');
		}			

		// convert dependency list to paths	
		var dependencyPaths = depResult.map(function(value){
			return getDependencyPath(value);
		}).reduce(function(a, b) { // flatten
		  return a.concat(b);
		}, []);
	
		if(moduleName !== 'module') {
			dependencyPaths.push(getDependencyPath(moduleName));
		}
		
		dependencyPaths.push(
			{
				pattern: 'test/fixture/'+moduleName+'.fixture.html',
				watched: false
			},
			'test/karma/testrunner.js',
			'test/js/'+moduleName+'.test.js'
		);		
		
		return dependencyPaths;
	}

	return Object.keys(depMap).map(function(value) {
		return 	{
			"name": value,
			"files": getTestSuiteFiles(value)
		};
	});
	
}();