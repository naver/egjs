(function(global, ns, jQueryName) {
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
        "[egjs] The {{index}} argument of {{componentName}} is missing.\n\rDownload {{name}} from [{{url}}].",
		"[egjs] The {{name}} parameter of {{componentName}} is not valid.\n\rPlease check and try again.",
        "[egjs] The {{index}} argument of {{componentName}} is undefined.\n\rPlease check and try again."
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
			specifiedAMD = isNotGlobal && require && require.specified(di[i]);

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
	/**
	* This method support plugin interface of jQuery. jQuery plugin object have to get events method that must returns events name array.
	* @ko jQuery의 플러그인 인터페이스 지원. jQuery plugin 객체는 events 메서드를 가져야 한다. events메서드는 events이름들을 반환해야 한다.
	* @name eg#plugin
	* @event
	* @param {Name} name plugin name <ko>플러그인 이름</ko>
	* @param {Object} [obj="eg[name]"]  plugin Object <ko>플러그인 객체</ko>
	*
	* @support {"ie": "7+", "ch" : "latest", "ff" : "1.5+",  "sf" : "latest", "ios" : "7+", "an" : "2.2+ (except 3.x)", "n-ios" : "latest", "n-an" : "latest" }
	*
	* @example
	eg.Sample = eg.Class.extend(eg.Component, {
		"construct": function(ele,option){
			this.options = option;
			this.ele = ele;
		},
		"setNum": function( num ){
			this.options.num = num;
			return this;
		},
		"getNum": function( ){
			return this.options.num;
		}
	});
	eg.Sample.events = function(){
		return ["some","thing"];
	};
	*/

	/* @example
	eg.plugin("sample");
	// or
	eg.plugin("sample", eg.Sample);
	*/

	/* @example
	// create instance
	$("#some").sample({
		num: 1
	});
	*/

	/* @example
	// instance method call.
	$("#some").sample("getNum"); // return 1

	// instance method call with param.
	$("#some").sample("setNum", 2); // return $("#some")
	*/

	/* @example
	// set custom event
	function noop(){
		// do something.
	}
	$("#some").on("some.sample",noop);
	$("#some").trigger("some.sample");
	$("#some").off("some.sample",noop);
	*/
	function plugin(name) {
		var upperCamelCase = capitalizeFirstLetter(name);
		var events;
		var componentMethodNames;

		if (!(eg[upperCamelCase] && eg[upperCamelCase]._events)) {
			return false;
		}

		// jscs:disable validateLineBreaks, maximumLineLength
		if ($.fn[name]) {
			throw new Error(upperCamelCase + " has already registered. so " + ns + "." + upperCamelCase + " can`t register for plugin.");
		}

		// jscs:enable validateLineBreaks, maximumLineLength

		// Extend method.
		$.fn[name] = function(options) {
			var ins;
			var result;
			if (typeof options === "string") {
				ins = this.data(ns + "-" + name);
				result = ins[options].apply(ins, Array.prototype.slice.call(arguments, 1));
				return result === ins ? this : result;
			}

			if (options === undefined || $.isPlainObject(options)) {
				this.data(ns + "-" + name, new eg[upperCamelCase](this, options || {}));
			}
			return this;
		};

		componentMethodNames = {
			trigger: "trigger",
			add: "on",
			remove: "off"
		};
		events = eg[upperCamelCase]._events();

		for (var i in events) {
			for (var j in componentMethodNames) {
				$.event.special[name + ":" + events[i]] = {};

				// jscs:disable validateLineBreaks, maximumLineLength
				/*jshint loopfunc: true */
				$.event.special[name + ":" + events[i]][j] = (function(componentMethodName) {
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

	/**
	 * Regist module.
	 * @private
	 */
	eg.module = function(name, di, fp) {
		var result = checkDependency(name, di);

		if (result[1].length) {
			throw new Error(result[1].join("\n\r"));
		} else {
			fp.apply(global, result[0]);
			plugin(name);
		}
	};
})(window, "eg", "jQuery");