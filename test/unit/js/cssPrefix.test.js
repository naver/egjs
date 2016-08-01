/**
* Copyright (c) 2015 NAVER Corp.
* egjs projects are licensed under the MIT license
*/

var cssPrefixes = [ "Webkit", "Moz" , "O" , "ms" ];
var jQueryVer = jQuery.fn.jquery;

QUnit.module("css", {
  beforeEach : function() {
    this.fakeDocument = {
        head : {
            style : {}
        }
    };

    jQuery.fn.jquery = jQueryVer;

    jQuery.cssHooks = {};
  },
  afterEach : function() {
  }
});


QUnit.test("When is not jQuery.cssHooks", function(assert) {
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
    QUnit.equal(method, false);
});


QUnit.test("jQuery version 1.8 or later", function(assert) {
    // Given
    var method;

    // When
    jQuery.fn.jquery = "1.6.4";
    method = eg.invoke("cssPrefix",[jQuery]);

    //Then
    QUnit.notEqual(method, undefined, jQuery.fn.jquery);

    // When
    jQuery.fn.jquery = "1.7";
    method = eg.invoke("cssPrefix",[jQuery]);

    //Then
    QUnit.notEqual(method, undefined, jQuery.fn.jquery);

    // When
    jQuery.fn.jquery = "1.8.0";
    method = eg.invoke("cssPrefix",[jQuery]);

    //Then
    QUnit.equal(method, undefined, jQuery.fn.jquery);

    // When
    jQuery.fn.jquery = "1.11.1";
    method = eg.invoke("cssPrefix",[jQuery]);

    //Then
    QUnit.equal(method, undefined, jQuery.fn.jquery);

    // When
    jQuery.fn.jquery = "2.0.1";
    method = eg.invoke("cssPrefix",[jQuery]);

    //Then
    QUnit.equal(method, undefined, jQuery.fn.jquery);


    // When
    jQuery.fn.jquery = "3.1.0";
    method = eg.invoke("cssPrefix",[jQuery]);

    //Then
    QUnit.equal(method, undefined, jQuery.fn.jquery);
});


QUnit.test("transform and transition not support", function(assert) {
    // Given
    jQuery.cssHooks = {};
    this.fakeDocument.head.style = {};
    var method = eg.invoke("cssPrefix",[jQuery, this.fakeDocument]);

    // When

    //Then
    QUnit.equal(method, undefined);
});


cssPrefixes.forEach(function(v,i) {
    QUnit.test("check with the vendor documnet.head : "+ v, function(assert) {
        // Given
        jQuery.cssHooks = {};
        this.fakeDocument.head.style[v+"Transition"] = "";
        var method = eg.invoke("cssPrefix",[jQuery, this.fakeDocument]);

        // When

        //Then
        QUnit.equal(method.vendorPrefix, v);
    });
});

cssPrefixes.forEach(function(v,i) {
    QUnit.test("check the vendor does not support documnet.head : "+ v, function(assert) {
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
        QUnit.equal(method.vendorPrefix, v);
    });
});


cssPrefixes.forEach(function(v,i) {
    QUnit.test("css property in jQuery.cssHooks : "+ v, function(assert) {
        // Given
        this.fakeDocument.head.style[v+"Transition"] = "";
        var method = eg.invoke("cssPrefix",[jQuery, this.fakeDocument]);
        var checkPropertie = v.toLowerCase() + "Transform";

        // When

        //Then
        QUnit.equal( checkPropertie in jQuery.cssHooks, true);
    });
});

QUnit.test("When not computed ", function(assert) {
    // Given
    var method = eg.invoke("cssPrefix",[jQuery, document]);

    // When
    $("#prefixId").css("transform", "translate(100px, 0px)");

    //Then
    var returnValue = $.style($("#prefixId").get(0), "transform");
    QUnit.equal(returnValue, "translate(100px, 0px)");
});

QUnit.test("transform property set/get", function(assert) {
    // Given
    var method = eg.invoke("cssPrefix",[jQuery, document]);

    // When
    $("#prefixId").css("transform", "translate(200px, 0px)");

    //Then
    var returnValue = jQuery("#prefixId").css("transform");
    QUnit.equal(returnValue , "matrix(1, 0, 0, 1, 200, 0)");
});


QUnit.test("Transform property set/get", function(assert) {
    // Given
    var method = eg.invoke("cssPrefix",[jQuery, document]);

    // When
    $("#prefixId").css("Transform", "translate(300px, 0px)");

    //Then
    var returnValue = jQuery("#prefixId").css("Transform");
    QUnit.equal(returnValue , "matrix(1, 0, 0, 1, 300, 0)");
});

QUnit.test("transform property with bender prefix set/get", function(assert) {
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
    QUnit.equal(returnValue , "matrix(1, 0, 0, 1, 400, 0)");
});