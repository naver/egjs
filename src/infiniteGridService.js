eg.module("infiniteGridService",[window.jQuery, eg, window],function($, ns, global){
    ns.InfiniteGridService = ns.Class.extend( ns.Component, {
        construct : function( el, options ) {
            this._infiniteGrid = new eg.InfiniteGrid( el, options ); // 필요없는 옵션 값을 넘길 필요가 있나?
            this._$el = $( el );
            this._el = this._$el.get( 0 );
            this._lastScrollY = 0;
            this._inserting = false;

            this._options = $.extend({
                threshold : 300, // 스크롤 엔드가 일어나는 스크롤 역치
                forcePersist : false, // persist를 강제로 사용할 것인가?
                persistSelector : [], // selector 클릭 시 persist에 데이터 저장. 데이터를 persist에 저장하는 시점을 어떻게 할 것인가?
                persistKey : "persist_" + el + "_" //persist 키
            }, options);

            this._attachEvent();
            this.activate();
        },
        _attachEvent : function() {
            var i = 0;
            var storePersistDataFn = $.proxy(this._storePersistData, this);

            if( this._isPersist() ) {
                for (; selector = this._options.persistSelector[i]; i++) {
                    this._$el.addClass("NO_TAP_HIGHLIGHT")
                        .on('click', selector, storePersistDataFn);
                }
            }
        },
        _isPersist : function() {
            return ( this._options.forcePersist || !global.___persisted___ );
        },
        _storePersistData : function() {
            var data = {
                "infiniteGridStatus" : this._infiniteGrid.getStatus(),
                "scrollY" : global.scrollY
            };

            this.trigger( "infiniteGridService.beforePersist", data );

            $.persist( this._options.persistKey, data );
        },
        _restorePersistData : function() {
            var isRestored = false;
            var data = $.persist( this._options.persistKey );
            console.log( "_restorePersistData", data );

            if( data ) {
                this._infiniteGrid.setStatus( data.infiniteGridStatus );
                global.scrollTo( 0, data.scrollY );
                this.trigger( "infiniteGridService.afterPersist", data );
                isRestored = true;
            }

            return isRestored
        },
        _handleScrollEnd : function() {
            if( this._inserting ) {
                console.log( "this._inserting" , this._inserting );
                return;
            }
            var clientRect = this._el.getBoundingClientRect();

            if( this._lastScrollY < global.scrollY ) {
                if ( clientRect.bottom <= global.innerHeight ) {
                    this.trigger( "infinite.scroll.append" );
                }
            } else {
                if ( clientRect.top >= 0 ) {
                    this.trigger("infinite.scroll.prepend");
                }
            }

            this._lastScrollY = global.scrollY;
        },
        _insert : function( mode, url, options, callback ) {
            this._inserting = true;

            var elements;
            var insert = $.proxy(function ( elements ) {
                var length;
                if( mode === "append" ) {
                    length = this._infiniteGrid.append( elements );
                } else if ( mode === "prepend" ) {
                    length = this._infiniteGrid.prepend( elements );
                }
                this._inserting = false;
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
                .done( function( data ) {
                    if ( callback ) {
                        data = callback( data ); // 레퍼런스로 넘겨야하나 사본을 넘기고 리턴 받아야 하나?
                    }

                    if( data ) {
                        insert( data );
                    }
                } )
                .fail( function() {
                    this._inserting = false; //<- _inserting을 다루는 데는 _insert 함수 안으로만 한정 짓자
                } );
        },
        activate : function() {
            console.log("start global.__persisted__", global.___persisted___);
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
        clear : function() {
            this._infiniteGrid.clear();
        },
        restore : function() {
            return this._restorePersistData();
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