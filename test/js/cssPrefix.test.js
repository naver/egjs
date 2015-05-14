
var cssPrefixes = [ "Webkit", "Moz" , "O" , "ms" ];

module("cssPrefix", {
  setup : function() {
    this.fakeDocument = jQuery.extend({}, document);
    delete this.fakeDocument.body.style;
    this.fakeDocument.body.style = {};
    jQuery.cssHooks = {};
  },
  teardown : function() {
  }
});


cssPrefixes.forEach(function(v,i) {
    test("vendor check : "+ v, function() {
        // Given
        this.fakeDocument.body.style[v+"Transition"] = "";
        var method = eg._invoke("cssPrefix",[jQuery, this.fakeDocument]);

        // When

        //Then
        equal(method.getCssPrefix(), v);
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

