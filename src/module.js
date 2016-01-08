/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

(function(jQueryName, ns, global) {
	"use strict";

	var eg = global[ns] = {};
	var $ = global[jQueryName];

	var dependency = {
		"jQuery": {
			"url": "http://jquery.com/"
		},
		"Hammer": {
			"url": "http://hammerjs.github.io/"
		},
		"Outlayer": {
			"url": "https://github.com/metafizzy/outlayer/"
		}
	};

	// jscs:disable maximumLineLength
	var templateMessage = [
		"[egjs] The {{name}} library must be loaded before {{componentName}}.",
		"[egjs] For AMD environment (like RequireJS), \"{{name}}\" must be declared, which is required by {{componentName}}.",
        "[egjs] The {{index}} argument of {{componentName}} is missing.\r\nDownload {{name}} from [{{url}}].",
		"[egjs] The {{name}} parameter of {{componentName}} is not valid.\r\nPlease check and try again.",
        "[egjs] The {{index}} argument of {{componentName}} is undefined.\r\nPlease check and try again."
	];

	// jscs:enable maximumLineLength

	var ordinal = [ "1st", "2nd", "3rd"];

	function changeOrdinal(index) {
		return index > 2 ? (index + 1) + "th" : ordinal[index];
	}

	function replaceStr(str, obj) {
		var i;
		for (i in obj) {
			str = str.replace(new RegExp("{{" + i + "}}","gi"), obj[i]);
		}
		return str;
	}

	function checkDependency(componentName, di) {
		var i = 0;
		var l = di.length;
		var message = [];
		var paramList = [];
		var require = global.require;
		var dependencyInfo;
		var param;
		var messageInfo;
		var isString;
		var isUndefined;
		var registedDependency;
		var isNotGlobal;
		var specifiedAMD;

		for (; i < l; i++) {
			param = di[i];
			messageInfo = {
				"index": changeOrdinal(i),
				"name": param,
				"componentName": componentName
			};

			isString = typeof di[i] === "string";
			isUndefined = di[i] === undefined;
			registedDependency = isString && (dependencyInfo = dependency[di[i]]);
			isNotGlobal = isString && dependencyInfo && !global[di[i]];
			specifiedAMD = isNotGlobal &&
				require && require.specified && require.specified(di[i]);

			// Message decision flow
			//             argument
			// |--------------|--------------|
			// undefined    string    !string&&!undefined
			// |              |              |
			// msg(4)         |             (OK)
			//         defined dependency
			//                |
			// |-----------------------------|
			// |                             |
			// msg(3)                     in global
			//                               |
			//                 |------------------------------|
			//              use AMD                          (OK)
			//                 |
			//  |------------------------------|
			//  msg(2)                  require.specified
			// 	                               |
			// 	                |------------------------------|
			//                  msg(1)                  require.defined
			// 	                                               |
			//                                  |------------------------------|
			//                                  msg(0)                        (OK)

			if (!isString && !isUndefined) {
				paramList.push(param);
				continue;
			}

			if (specifiedAMD && require.defined(di[i])) {
				param = require(di[i]);
				paramList.push(param);
				continue;
			}

			if (specifiedAMD && !require.defined(di[i])) {
				messageInfo.url = dependencyInfo.url;
				message.push(replaceStr(templateMessage[0], messageInfo));
				continue;
			}

			if (isNotGlobal && require && !require.specified(di[i])) {
				messageInfo.url = dependencyInfo.url;
				message.push(replaceStr(templateMessage[1], messageInfo));
				continue;
			}

			if (isNotGlobal && !require) {
				messageInfo.url = dependencyInfo.url;
				message.push(replaceStr(templateMessage[2], messageInfo));
				continue;
			}

			if (registedDependency && global[di[i]]) {
				param = global[di[i]];
				paramList.push(param);
				continue;
			}

			if (isString && !dependencyInfo) {
				message.push(replaceStr(templateMessage[3], messageInfo));
				continue;
			}

			if (di[i] === undefined) {
				message.push(replaceStr(templateMessage[4], messageInfo));
				continue;
			}
		}

		return [paramList, message];
	}

	function capitalizeFirstLetter(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	function plugin(name) {
		var upperCamelCase = capitalizeFirstLetter(name);
		var events;
		var special;
		var componentMethodNames;

		if (!(eg[upperCamelCase] && eg[upperCamelCase].prototype._events)) {
			return false;
		}

		// jscs:disable validateLineBreaks, maximumLineLength
		if ($.fn[name]) {
			throw new Error("The name '" + upperCamelCase + "' has already been used and registered as plugin. Try with different one.");
		}

		// jscs:enable validateLineBreaks, maximumLineLength

		// Extend method.
		$.fn[name] = function(options) {
			var ins;
			var result;
			if (typeof options === "string") {
				ins = this.data(ns + "-" + name);
				if (options === "instance") {
					return ins;
				} else {
					result = ins[options].apply(ins, Array.prototype.slice.call(arguments, 1));
					return result === ins ? this : result;
				}
			}

			if (options === undefined || $.isPlainObject(options)) {
				this.data(ns + "-" + name, new eg[upperCamelCase](
					this, options || {}, name + ":"
				));
			}
			return this;
		};

		componentMethodNames = {
			trigger: "trigger",
			add: "on",
			remove: "off"
		};
		events = eg[upperCamelCase].prototype._events();

		for (var i in events) {
			special = $.event.special[name + ":" + events[i]] = {};

			// to not bind native event
			special.setup = function() {
				return true;
			};

			for (var j in componentMethodNames) {
				// jscs:disable validateLineBreaks, maximumLineLength
				/*jshint loopfunc: true */
				special[j] = (function(componentMethodName) {
					return function(event, param) {
						$(this).data(ns + "-" + name)[componentMethodName](
							event.type,
							componentMethodName === "trigger" ? param : event.handler
						);
						return false;
					};
				})(componentMethodNames[j]);

				// jscs:enable validateLineBreaks, maximumLineLength
			}
		}
	}

	var warn = function(msg) {
		/* jshint ignore:start */
		if (global.console && global.console.warn) {
			warn = function(msg) {
				global.console.warn(msg);
			};
		} else {
			warn = function(msg) {
			};
		}
		/* jshint ignore:end */
		warn(msg);
	};

	/**
	 * Regist module.
	 * @private
	 */
	eg.module = function(name, di, fp) {
		var result = checkDependency(name, di);

		if (result[1].length) {
			warn(result[1].join("\r\n"));
		} else {
			fp.apply(global, result[0]);
			plugin(name);
		}
	};
})("jQuery", "eg", window);