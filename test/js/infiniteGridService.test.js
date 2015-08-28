module("infiniteGridService Test", {
    setup : function() {
        this.inst = null;
    },
    teardown : function() {
        this.inst.destroy();
        this.inst = null;
    }
});

asyncTest("append via ajax", function() {
    // Given
    var offset = 1, limit = 8;

    this.inst = new eg.InfiniteGridService( "#grid" , {
        persistSelector : ['a']
    });

    this.inst.append( "http://localhost:9099/infiniteGrid/items?offset="
        + offset + "&limit=" + limit, function( data ) {
        return $(data);
    } );
});