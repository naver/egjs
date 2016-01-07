"use strict";

module.exports = {
	"dependency" : [
		{
			"name": "module",
		},
		{
			"name": "eg",
			"dependencies": ["jquery"],
			"egDependencies": ["module"]
		},
		{
			"name": "css",
			"type": "hook",
			"egDependencies": ["module", "eg"],
			
			"support": {"ie": "10+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"}
		},
		{
			"name": "animate",
			"type": "hook",
			"egDependencies": ["module", "eg", "css"],
			
			"support": {"ie": "10+", "ch" : "latest", "sf" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
		},
		{
			"name": "rotate",
			"type": "customEvent",
			"egDependencies": ["module", "eg"],
			
			"support": { "ios" : "7+", "an" : "2.1+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
		},
		{
			"name": "scrollEnd",
			"type": "customEvent",
			"egDependencies": ["module", "eg"],
			
			"support": {"ie": "9+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"}
		},
		{
			"name": "persist",
			"type": "plugin",
			"egDependencies": ["module", "eg"],
			
			"support": {"ie": "9+", "ch" : "latest", "ff" : "1.5+",  "sf" : "latest", "ios" : "7+", "an" : "2.2+ (except 3.x)"}
		},
		{
			"name": "class",
			"egDependencies": ["module", "eg"],
			
			"support": {"ie": "7+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"}
		},
		{
			"name": "component",
			"egDependencies": ["module", "eg", "class"],
			
			"support": {"ie": "7+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"}
		},
		{
			"name": "movableCoord",
			"dependencies": ["hammer.js"],
			"egDependencies": ["module", "eg", "rotate", "scrollEnd", "css", "class", "component"],
			
			"support": {"ie": "10+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
		},
		{
			"name": "flicking",
			"egDependencies": ["module", "eg", "rotate", "scrollEnd", "css", "class", "component", "movableCoord"],
			
			"support": {"ie": "10+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
		},
		{
			"name": "infiniteGrid",
			"dependencies": ["outlayer"],
			"egDependencies": ["module", "eg", "css", "class", "component", "persist"],
			
			"support": {"ie": "8+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"}
		},
		{
			"name": "visible",
			"egDependencies": ["module", "eg", "scrollEnd", "css", "class", "component"],
			
			"support": {"ie": "7+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "ios" : "7+", "an" : "2.1+ (except 3.x)"}
		}
	]
}