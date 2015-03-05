// define(function(require, exports, module) {
// 	var EventLoop = require('./EventLoop');
// 	var util = require('./util');
(function(){
 
  if ("performance" in window == false) {
      window.performance = {};
  }
  
  Date.now = (Date.now || function () {  // thanks IE8
	  return new Date().getTime();
  });
 
  if ("now" in window.performance == false){
    
    var nowOffset = Date.now();
    
    if (performance.timing && performance.timing.navigationStart){
      nowOffset = performance.timing.navigationStart
    }
 
    window.performance.now = function now(){
      return Date.now() - nowOffset;
    }
  }
 
})();

	function AsyncDOM(){
		// this.key = new Date().getTime() + parseInt(Math.random() * 100000,10);
		// this.info = {};
		// this.changeCSS[this.key] = {};
		// this.domInfo = {};
		// return this.$.bind(this);
	}
	//The DomInfo Object share all instance.
	AsyncDOM.prototype.info = {};
	AsyncDOM.prototype.getKey = function(){
		return this.key;
	}

	AsyncDOM.prototype.$ = function(selector){
		this.selector = selector;
		if(!this.info[this.selector]){
			this.info[this.selector] = {
				"current" :{},
				"change" :{}
			};	
		}
		return this;
	}

	AsyncDOM.prototype.css = function(key,value){
		if(typeof key == "string"){
			return this.getCss(key);
		}
		return this.setCss(key,value);
	}

	AsyncDOM.prototype.setCss = function(key,value){
		// console.log("---------",this);
		var css = {};
		if(value){
			css[key] = value;
		}else{
			css = key;
		}
		// console.log(this.info);
		var changeCSS = this.info[this.selector].change;
		var currentCSS = this.info[this.selector].current;

		
		
		for (var i in css) if (css.hasOwnProperty(i)) {
			changeCSS[i] = css[i];
			currentCSS[i] = css[i];
		}

		FrameLoop.push(this.selector,changeCSS);

		return this;
	}

	AsyncDOM.prototype.getCss = function(key){
		var css = this.info[this.selector]["current"][key];

		if(css == undefined){
			css = this.info[this.selector]["current"][key] = jQuery(this.selector).css(key);
		}
		return css;
		
	}

// 	module.exports = LazyDom;
// });



var FrameLoop = {
	"info" : {},
	"count" : 0,
	"isStart" : false,
	"changeCSS" : function(selector,css){
		// console.log("-------",selector,css);
		// var start = performance.now();
		jQuery(selector).css(css);
		// var end = performance.now();
		// console.log("end");
		// console.log(end-start);
	},
	"push" : function(selector,value){
		// var that = this;
		
		// if(!this.info[key]){
		// 	this.info[key] = {};
		// }
		if(!this.info[selector]){
			this.info[selector] = {};	
		}
		this.info[selector] = value;
		if(!this.isStart) this.fire();
		// console.log("push");
	},
	"step" : function(){
		// console.log("loop");
		var info = this.info, css;
		for (var i in info) if (info.hasOwnProperty(i)) {
			css = info[i];			
			// for (var j in css) if (css.hasOwnProperty(j)) {
				this.changeCSS(i,css);
				// delete css[j];
			// }
			delete info[i];
		}
		this.isStart = false;
	},
	fire : function(){
		this.isStart = true;
		requestAnimationFrame(this.step.bind(this));
	}
};



// requestAnimationFrame(loop);