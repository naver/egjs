eg.module("cssPrefix",[jQuery, document],function($, doc){

    if ( !$.cssHooks ) {
      throw( new Error( "jQuery 1.4.3+ is needed for this plugin to work" ) );
    };

    var cssPrefixes = [ "Webkit", "Moz" , "O" , "ms" ],
        acts = ["transitionProperty" , "transitionDuration" , "transition", "transform", "transitionTimingFunction"],
        vendorPrefix = "";

    var getCssPrefix = function() {
        var bodyStyle = doc.body.style;
        for ( var i = 0, len = cssPrefixes.length ; i < len ; i++ ) {
            if( cssPrefixes[i]+"Transition" in bodyStyle ){
                return cssPrefixes[i];
            }
        }
    };

    var setCssHooks = function( prop ) {
        var upperProp = prop.charAt(0).toUpperCase() + prop.slice(1),
            vendorProp = vendorPrefix + upperProp;
        $.cssHooks[vendorPrefix.toLowerCase() + upperProp] = $.cssHooks[prop] = {
            get: function( elem, computed, extra ){
                return $.css( elem, vendorProp );
            },
            set: function( elem, value ){
                elem.style[vendorProp] = value;
            }
        };
    };

    vendorPrefix = getCssPrefix();

    for( var n = 0, actsLen = acts.length ; n < actsLen ; n++ ){
        setCssHooks(acts[n]);
    };


    // @qunit getDeviceType, CHROME, TIMERBASE, TOUCHBASE, SCROLLBASE
   return {
       getCssPrefix : getCssPrefix,
       setCssHooks: setCssHooks
   };

});