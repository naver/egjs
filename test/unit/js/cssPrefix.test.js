/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

var cssPrefixes = [ "Webkit", "Moz" , "O" , "ms" ];
var jQueryVer = jQuery.fn.jquery;

module("css", {
  setup : function() {
    this.fakeDocument = {
        head : {
            style : {}
        }
    };

    jQuery.fn.jquery = jQueryVer;

    jQuery.cssHooks = {};
  },
  teardown : function() {
  }
});


test("When is not jQuery.cssHooks", function() {
    // Given
    delete jQuery.cssHooks;
    var method = null;

    try{
        method = eg.invoke("cssPrefix",[jQuery, null]);
    }catch(e){
        method = false;
    }

    // When

    //Then
    equal(method, false);
});


test("jQuery version 1.8 or later", function() {
    // Given
    jQuery.fn.jquery = "1.8";
    var method = eg.invoke("cssPrefix",[jQuery]);

    // When

    //Then
    equal(method, undefined);
});


test("transform and transition not support", function() {
    // Given
    jQuery.cssHooks = {};
    this.fakeDocument.head.style = {};
    var method = eg.invoke("cssPrefix",[jQuery, this.fakeDocument]);

    // When

    //Then
    equal(method, undefined);
});


cssPrefixes.forEach(function(v,i) {
    test("check with the vendor documnet.head : "+ v, function() {
        // Given
        jQuery.cssHooks = {};
        this.fakeDocument.head.style[v+"Transition"] = "";
        var method = eg.invoke("cssPrefix",[jQuery, this.fakeDocument]);

        // When

        //Then
        equal(method.vendorPrefix, v);
    });
});

cssPrefixes.forEach(function(v,i) {
    test("check the vendor does not support documnet.head : "+ v, function() {
        // Given
        jQuery.cssHooks = {};
        this.fakeDocument = {};
        this.fakeDocument.getElementsByTagName = function(n){
            var retVal = {};
            retVal["style"] = {};
            retVal["style"][v + "Transition"] = "";
            return [retVal];
        };
        var method = eg.invoke("cssPrefix",[jQuery, this.fakeDocument]);

        // When

        //Then
        equal(method.vendorPrefix, v);
    });
});


cssPrefixes.forEach(function(v,i) {
    test("css property in jQuery.cssHooks : "+ v, function() {
        // Given
        this.fakeDocument.head.style[v+"Transition"] = "";
        var method = eg.invoke("cssPrefix",[jQuery, this.fakeDocument]);
        var checkPropertie = v.toLowerCase() + "Transform";

        // When

        //Then
        equal( checkPropertie in jQuery.cssHooks, true);
    });
});

test("When not computed ", function() {
    // Given
    var method = eg.invoke("cssPrefix",[jQuery, document]);

    // When
    $("#prefixId").css("transform", "translate(100px, 0px)");

    //Then
    var returnValue = $.style($("#prefixId").get(0), "transform");
    equal(returnValue, "translate(100px, 0px)");
});

test("transform property set/get", function() {
    // Given
    var method = eg.invoke("cssPrefix",[jQuery, document]);

    // When
    $("#prefixId").css("transform", "translate(200px, 0px)");

    //Then
    var returnValue = jQuery("#prefixId").css("transform");
    equal(returnValue , "matrix(1, 0, 0, 1, 200, 0)");
});


test("Transform property set/get", function() {
    // Given
    var method = eg.invoke("cssPrefix",[jQuery, document]);

    // When
    $("#prefixId").css("Transform", "translate(300px, 0px)");

    //Then
    var returnValue = jQuery("#prefixId").css("Transform");
    equal(returnValue , "matrix(1, 0, 0, 1, 300, 0)");
});

test("transform property with bender prefix set/get", function() {
    // Given
    var method = eg.invoke("cssPrefix",[jQuery, document]);
	var cssPrefixes = [ "Webkit", "Moz", "O", "ms" ];
    var vendorPrefix = (function() {
		var bodyStyle = (document.head || document.getElementsByTagName("head")[0]).style;
		for (var i = 0, len = cssPrefixes.length ; i < len ; i++) {
			if (cssPrefixes[i] + "Transition" in bodyStyle) {
				return cssPrefixes[i];
			}
		}
	})();

    // When
    $("#prefixId").css( vendorPrefix + "Transform", "translate(400px, 0px)");

    //Then
    var returnValue = jQuery("#prefixId").css( vendorPrefix + "Transform");
    equal(returnValue , "matrix(1, 0, 0, 1, 400, 0)");
});