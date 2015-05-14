
var cssPrefixes = [ "Webkit", "Moz" , "O" , "ms" ];

module("cssPrefix", {
  setup : function() {

    this.fakeDocument = {
        body : {
            style : {}
        }
    }

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
        method = eg._invoke("cssPrefix",[jQuery, null]);
    }catch(e){
        method = false;
    }

    // When

    //Then
    equal(method, false);
});

cssPrefixes.forEach(function(v,i) {
    test("vendor check : "+ v, function() {
        // Given
        jQuery.cssHooks = {};
        this.fakeDocument.body.style[v+"Transition"] = "";
        var method = eg._invoke("cssPrefix",[jQuery, this.fakeDocument]);

        // When

        //Then
        equal(method.vendorPrefix, v);
    });
});

cssPrefixes.forEach(function(v,i) {
    test("css propertie in jQuery.cssHooks : "+ v, function() {
        // Given
        this.fakeDocument.body.style[v+"Transition"] = "";
        var method = eg._invoke("cssPrefix",[jQuery, this.fakeDocument]);
        var checkPropertie = v.toLowerCase() + "Transform";

        // When

        //Then
        equal( checkPropertie in jQuery.cssHooks, true);
    });
});


test("transform property set/get", function() {
    // Given
    var method = eg._invoke("cssPrefix",[jQuery, document]);

    // When
    $("#prefixId").css("transform", "translate(100px, 0px)");

    //Then
    var returnValue = jQuery("#prefixId").css("transform");
    equal(returnValue , "matrix(1, 0, 0, 1, 100, 0)");
});


test("Transform property set/get", function() {
    // Given
    var method = eg._invoke("cssPrefix",[jQuery, document]);

    // When
    $("#prefixId").css("Transform", "translate(300px, 0px)");

    //Then
    var returnValue = jQuery("#prefixId").css("Transform");
    equal(returnValue , "matrix(1, 0, 0, 1, 300, 0)");
});

test("webkitTransform property set/get", function() {
    // Given
    var method = eg._invoke("cssPrefix",[jQuery, document]);

    // When
    $("#prefixId").css("webkitTransform", "translate(200px, 0px)");

    //Then
    var returnValue = jQuery("#prefixId").css("webkitTransform");
    equal(returnValue , "matrix(1, 0, 0, 1, 200, 0)");
});
