eg.module("plugin", ["jQuery", eg, window], function($, ns, global) {

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
	ns.plugin = function(name, obj) {
		var upperCaseName = capitalizeFirstLetter(name);
		var events;
		var beforeCustom;

		if( obj ){
			ns[upperCaseName] = obj;
		}

		if(!ns[upperCaseName]){
			throw new Error("Not found "+upperCaseName+" object in eg.");
		}

		if(!ns[upperCaseName].events){
			throw new Error("Not found events function in eg."+upperCaseName+". If eg."+upperCaseName+" will make plugin that have to make events function.");
		}

		if( $.fn[ name ] ){
			throw new Error(upperCaseName+" has already registered. so eg."+upperCaseName+" can`t register for plugin.");
		}

		events = ns[upperCaseName].events();

		// Extend method.
		$.fn[ name ] = function( options ) {
			var ins;
			var result;
			if(typeof options === "string")	{
				ins = this.data("eg-"+name);
				result = ins[options].apply(ins, Array.prototype.slice.call(arguments,1));
				return result === ins ? this : result;
			}

			if( options === undefined || $.isPlainObject( options )){
				this.data("eg-"+name, new ns[upperCaseName](this, options||{} ));	
			}
			return this;
		}

		// Extend event.
		for (var i=0, l = events.length; i < l; i++) {
			if( (beforeCustom = $.event.special[events[i]]) ){
				$.event.special[events[i]]["oldtrigger"] = beforeCustom.trigger;
				$.event.special[events[i]]["oldadd"]  = beforeCustom.add;
				$.event.special[events[i]]["oldremove"]  = beforeCustom.remove;
			} else {
				$.event.special[events[i]] = {};	
			}
			
			$.event.special[events[i]].trigger = function(event, param){
				var returnType = $.event.special[event.type].oldtrigger && $.event.special[event.type].oldtrigger.call(this,event, param);

				if( name === event.namespace ){
					$(this).data("eg-"+name).trigger(event.type, param);
					returnType = false;
				}
				
				return returnType;
			}

			$.event.special[events[i]].add = function(event){
				var returnType = $.event.special[event.type].oldadd && $.event.special[event.type].oldadd.call(this,event);
				if( name === event.namespace ){
					$(this).data("eg-"+name).on(event.type,event.handler);
					returnType = false;
				}
				return returnType;
			}

			$.event.special[events[i]].remove = function(event){
				var returnType = $.event.special[event.type].oldremove && $.event.special[event.type].oldremove.call(this,event);
				if( name === event.namespace ){
					$(this).data("eg-"+name).off(event.type,event.handler);
					returnType = false;
				}
				return returnType;
			}
		}
		
	}
});

eg.plugin("flicking");
eg.plugin("visible");
eg.plugin("infiniteGrid");