eg.module("infiniteGridService",[window.jQuery, eg, window],function($, ns, global){
    /**
     * Infinite cascading grid layout service for infiniteGrid
     * @ko infiniteGrid를 통한 무한 그리드 레이아웃 서비스.
     * @class
     * @name eg.infiniteGridService
     * @extends eg.Component
     * @group EvergreenJs
     *
     * @param {String} target element for infiniteGridService <ko>infiniteGrid 서비스를 적용할 타겟 엘리먼트</ko>
     * @param {Object} options <ko>옵션</ko>
     * @param {Number} [options.count=30] DOM count for recycle. If value is -1, DOM does increase without limit -1. <ko>재사용할 DOM 갯수. -1일 경우 DOM은 계속 늘어남.</ko>
     * @param {Number} [threshold=100] Scroll coordinate threshold. <ko>append, preppend 이벤트가 발생하기 위한 스크롤 좌표 가용.</ko>
     * @param {Boolean} [usePersist=true] Whether or not to use persist <ko>persist 사용 여부.</ko>
     * @param {String} [persistKey="persist_<el>_"] persist key <ko>persist의 key 값.</ko>
     */
    ns.InfiniteGridService = ns.Class.extend( ns.Component, {
        construct : function( el, options ) {
            this._infiniteGrid = new eg.InfiniteGrid( el, options ); // 필요없는 옵션 값을 넘길 필요가 있나?
            this._$el = $( el );
            this._el = this._$el.get( 0 );
            this._lastScrollY = 0;
            this._inserting = false;

            this._options = $.extend({
                count : 30,
                threshold : 100, // 스크롤 엔드가 일어나는 스크롤 역치
                usePersist : true,
                persistKey : "persist_" + el + "_"
            }, options);

            if(this._options.usePersist) {
                this._$el.addClass( "NO_TAP_HIGHLIGHT" );
            }

            this.activate();
        },
        _handleScrollEnd : function() {
            if( this._inserting ) {
                console.log( "_handleScrollEnd", "this._inserting" , this._inserting );
                return;
            }

            var clientRect = this._el.getBoundingClientRect();

            if( this._lastScrollY < global.scrollY ) {
                if ( clientRect.bottom <= global.innerHeight + this._options.threshold ) {
                    this.trigger( "appendScroll" );
                }
            } else {
                if ( clientRect.top >= ( 0 - this._options.threshold ) ) {
                    this.trigger( "prependScroll" );
                }
            }

            this._lastScrollY = global.scrollY;
        },
        _insert : function( mode, url, options, callback ) {
            this._inserting = true;
            console.log( "_insert", "this._inserting" , this._inserting );

            var elements;
            var insert = $.proxy(function ( elements ) {
                var length;

                if( elements ) {
                    if ( mode === "append" ) {
                        length = this._infiniteGrid.append( elements );
                    } else if ( mode === "prepend" ) {
                        length = this._infiniteGrid.prepend( elements );
                    }
                    //if ( this._infiniteGrid.isRecycling() ) {
                    //    this._infiniteGrid.layout();
                    //}
                    console.log( mode + " : " + length + " items added" );
                }

                this._inserting = false;
                console.log( "_insert > insert", "this._inserting" , this._inserting );
                return length;
            }, this );

            if( url instanceof jQuery ) {
                elements = url;
                return insert( elements );
            }

            if ( typeof url === "object" ) {
                options = url;
                url = undefined;
            }

            if ( $.isFunction( options ) ) {
                callback = options;
                options = undefined;
            }

            $.ajax( url, options )
                .always( function( data, textStatus ) {
                    var elements;

                    if ( textStatus === "success" ) {
                        if ( callback ) {
                            elements = callback( data ); // 레퍼런스로 넘겨야하나 사본을 넘기고 리턴 받아야 하나?
                        }
                    }

                    insert( elements );
                } );
        },
        activate : function() {
            $( global ).on( "scrollend", $.proxy( this._handleScrollEnd, this ) );
        },
        deactivate : function() {
            $( global ).off( "scrollend", this._handleScrollEnd );
        },
        append : function( url, options, callback ) {
            this._insert( "append", url, options, callback );
        },
        prepend : function( url, options, callback ) {
            this._insert( "prepend", url, options, callback );
        },
        storeContents : function() {
            if( !this._options.usePersist) {
                return;
            }

            var data = {
                "infiniteGridStatus" : this._infiniteGrid.getStatus(),
                "scrollY" : global.scrollY
            };

            this.trigger( "beforeStoreContents", data );

            $.persist( this._options.persistKey, data );
        },
        restoreContents : function() {
            if( !this._options.usePersist) {
                return false;
            }

            var isRestored = false;
            var data = $.persist( this._options.persistKey );
            console.log( "_restorePersistData", data );

            if( data ) {
                this._infiniteGrid.setStatus( data.infiniteGridStatus );
                global.scrollTo( 0, data.scrollY );
                isRestored = true;
            }

            this.trigger( "restoreContentsEnd", data );
            return isRestored;
        },
        clear : function() {
            this._infiniteGrid.clear();
        },
        destroy : function() {
            if( this._infiniteGrid ) {
                this._infiniteGrid.destroy();
                this._infiniteGrid = null;
            }

            this.deactivate();
            this.off();
        }
    });
});