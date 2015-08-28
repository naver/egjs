var Hapi = require( "hapi" );
var Good = require( "good" );

var server = new Hapi.Server( {
    connections : {
        routes : {
            cors : true
        }
    }
} );

server.connection( {
    host : "localhost",
    port : 9099
});

server.route( {
    method : "GET",
    path : "/",
    handler : function( request, reply ) {
        reply ( "<h1>hello egjs fake server</h1>" )
            .type( "text/html" );
    }
});

server.route( {
    method : "GET",
    path : "/infiniteGrid/items",
    handler : function( request, reply ) {
        var html = "";
        var limit = request.query.limit || 10;
        var offset = request.query.offset || 1;
        var end = offset + limit;

        var _random = function() {
            return Math.floor( ( Math.random() * 7 ) + 1 );
        }

        for ( ; offset < end; offset++) {
            html = html + "<li class='item'><div class='r" + _random() + "'><a href='http://best.mqoo.com'>테스트 " + offset + "</a></div></li>";
        }

        reply( html )
            .type( "text/html");
    }
});

server.register( {
    register : Good,
    options : {
        reporters: [{
            reporter: require( "good-console" ),
            events: {
                response: '*',
                log: '*'
            }
        }]
    }
}, function( err ) {
    if ( err ) {
        throw err;
    }

    server.start(function () {
        server.log('info', 'egjs fake server running at: ' + server.info.uri);
    });
});