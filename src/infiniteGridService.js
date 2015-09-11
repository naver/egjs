eg.module("infiniteGridService",
    [window.jQuery, eg, window, document], function($, ns, global, doc) {
    /**
     * Infinite cascading grid layout service for infiniteGrid
     * @ko infiniteGrid를 통한 무한 그리드 레이아웃 서비스.
     * @class
     * @name eg.infiniteGridService
     * @extends eg.Component
     * @group EvergreenJs
     *
     * @param {String} DOM Element to be InfiniteGride. <ko>타겟 엘리먼트</ko>
     * @param {Object} [Options] A set of key/value pairs that configure the InfiniteGridService. <ko>key/value 형태의 옵션</ko>
     * @param {Number} [options.count=60] Count DOM count for recycle. If value is -1, DOM does increase without limit -1. <ko>재사용할 DOM 갯수. -1일 경우 DOM은 계속 늘어남.</ko>
     * @param {Number} [threshold=120] Threshold Scroll coordinate threshold. <ko>append, prepend 이벤트가 발생하기 위한 스크롤 좌표 임계치.</ko>
     * @param {Boolean} [usePersist=true] usePersist Determines whether allows persist. <ko>persist 사용 여부.</ko>
     */
    ns.InfiniteGridService = ns.Class.extend(ns.Component, {
        /**
         * Constructor
         * @param {String} Element selector
         * @param {Object} options
         */
        construct: function(element, options) {
            this._$wrapper = $(element);

            this._prevScrollTop = 0;
            this._inserting = false;

            this._topElement;
            this._bottomElemment;
            this._prependTopElementInfo;

            this._PERSIST_KEY = "__INFINITEGRIDSERVICE_PERSISTKEY__";

            this._options = $.extend({
                count: 120,
                threshold: 100,
                usePersist: true
            }, options);

            if (this._isEnablePersist()) {
                this._$wrapper.addClass("NO_TAP_HIGHLIGHT");
            }

            this._getScrollTop();
            this._infiniteGrid = new eg.InfiniteGrid(element, this._options);

            this._infiniteGrid.on("layoutComplete", $.proxy(function(e) {
                this._setBoundaryElements();

                if (!e.isAppend) {
                    this._adjustPrependScroll(e);
                }

                this._inserting = false;
            }, this));

            this.activate();
        },
        _getScrollTop: function() {
            var fn;

            if (typeof global.scrollY === "number") {
                fn = function() {
                    return global.scrollY;
                };
            } else if (typeof global.pageYOffset === "number") {
                fn = function() {
                    return global.pageYOffset;
                };
            } else if (typeof doc.documentElement.scrollTop === "number") {
                fn = function() {
                    return doc.documentElement.scrollTop;
                };
            } else if (typeof doc.body.scrollTop === "number") {
                fn = function() {
                    return doc.body.scrollTop;
                };
            }

            this._getScrollTop = fn;
            return fn();
        },
        _setBoundaryElements: function() {
            var element;

            if (element = this._infiniteGrid.getTopElement()) {
                this._topElement = element;
            }

            if (element = this._infiniteGrid.getBottomElement()) {
                this._bottomElemment = element;
            }
        },
        _isEnablePersist: function() {
            var agent = eg.agent();
            var enablePersist = true;

            if (!this._options.usePersist ||
                    agent.os.name === "ios" ||
                    (agent.os.name === "android" && parseFloat(agent.os.version) < 4.4)) {
                enablePersist = false;
            }

            this._isEnablePersist = function () {
                return enablePersist;
            };

            return enablePersist;
        },
        _handleScrollEnd: function() {
            if (this._inserting) {
                return;
            }

            if (this._prevScrollTop < this._getScrollTop()) {
                if (this._bottomElemment) {
                    var bottomElementBoundingClientRect =
                        this._bottomElemment.getBoundingClientRect();

                    if (bottomElementBoundingClientRect.top <=
                            global.innerHeight + this._options.threshold) {
                        this.trigger("append");
                    }
                }
            } else {
                if (this._infiniteGrid.isRecycling() && this._topElement) {
                    var topElementBoundingClientRect =
                        this._topElement.getBoundingClientRect();

                    if (topElementBoundingClientRect.bottom >=
                            (0 - this._options.threshold)) {
                        this.trigger("prepend");
                    }
                }
            }

            this._prevScrollTop = this._getScrollTop();
        },
        _insertElements: function(mode, elements) {
            this._inserting = true;

            var length = 0;
            var $elements;

            if (typeof elements === "string") {
                $elements = $(elements);
            } else {
                $elements = elements;
            }

            if (mode === "append") {
                length = this._infiniteGrid.append($elements);
            } else if (mode === "prepend") {
                this._setPrependTopElementInfo();
                length = this._infiniteGrid.prepend($elements);
            }

            this._inserting = false;

            return length;
        },
        _insertAjax: function(mode, url, options, callback) {
            this._inserting = true;

            if (typeof url === "object") {
                options = url;
                url = undefined;
            }

            if ($.isFunction(options)) {
                callback = options;
                options = undefined;
            }

            return $.ajax(url, options)
                .always($.proxy(function(data, textStatus) {
                    var $elements;

                    if (textStatus === "success") {
                        if (callback) {
                            $elements = callback(data);
                        } else {
                            $elements = $(data);
                        }
                    }

                    this._insertElements(mode, $elements);
                }, this));
        },
        _setPrependTopElementInfo: function() {
            if (this._topElement) {
                this._prependTopElementInfo = {
                    element: this._topElement,
                    boundingClientRect: this._topElement.getBoundingClientRect()
                };
            }
        },
        _adjustPrependScroll: function() {
            if (this._prependTopElementInfo.element) {
                var $element = $(this._prependTopElementInfo.element);
                var scrollTop =
                        this._$wrapper.offset().top + $element.offset().top +
                        $element.outerHeight() +
                        (0 - this._prependTopElementInfo.boundingClientRect.bottom);

                global.scrollTo(0, scrollTop);
            }
        },
        /**
         * Activate
         * @ko 활성화
         * @method eg.InfiniteGridService#activate
         * @return {Object} infiniteGridService Instance itself.
         */
        activate: function() {
            $(global).on("scrollend", $.proxy(this._handleScrollEnd, this));
            return this;
        },
        /**
         * Deactivate
         * @ko 비활성화
         * @method eg.InfiniteGridService#deactivate
         * @return {Object} infiniteGridService Instance itself.
         */
        deactivate: function() {
            $(global).off("scrollend", this._handleScrollEnd);
            return this;
        },
        /**
         * Append elements
         * @ko 하단에 요소 추가
         * @method eg.InfiniteGridService#append
         * @param {String|jQuery} DOM Element to append in a target. <ko>타겟요소에 추가할 DOM 엘리먼트</ko>
         * @return {Number} Length The number of elements to prepended. <ko>추가한 요소의 갯수</ko>
         * @example
         *    infiniteGrid.append("<li> contents </li>");
         *    infiniteGrid.append($("<li> contents </li>"));
         */
        append: function(elements) {
            return this._insertElements("append", elements);
        },
        /**
         * Prepend elements
         * @ko 상단에 요소 추가
         * @method eg.InfiniteGridService#preppend
         * @param {String|jQuery} DOM Element to append in a target. <ko>타겟요소에 추가할 DOM 엘리먼트</ko>
         * @return {Number} Length The number of elements to prepended. <ko>추가한 요소의 갯수</ko>
         * @example
         * infiniteGrid.prepend("<li> contents </li>");
         * infiniteGrid.prepend($("<li> contents </li>"));
         */
        prepend: function(elements) {
            return this._insertElements("prepend", elements);
        },
        /**
         * Append Ajax response elements
         * @ko 하단에 Ajax 호출 결과 추가
         * @method eg.InfiniteGridService#ajaxAppend
         * @param {String} URL A string containing the URL to which the request is sent. <ko> 요청할 URL </ko>
         * @param {Object} [Settings] A set of key/value pairs that configure the Ajax request. <ko> Ajax 요청 설정 객체 </ko>
         * @param {Function} [Callback] A function to be called when the before append. The function receives one argument: data will append. <ko>요청 완료 후 실행 할 콜백. 응답 데이터를 파라메터로 받는다.</ko>
         * @return {Object} jqXHR.
         * @example
         *    infiniteGrid.ajaxAppend("http://server.com/contents", function(data) {
         *        return $(data);
         *    } );
         */
        appendAjax: function(url, settings, callback) {
            return this._insertAjax("append", url, settings, callback);
        },
        /**
         * Prepend Ajax response elements
         * @ko 상단에 요소 추가
         * @method eg.InfiniteGridService#preppend
         * @param {String} URL A string containing the URL to which the request is sent. <ko> 요청할 URL </ko>
         * @param {Object} [Settings] A set of key/value pairs that configure the Ajax request. <ko> Ajax 요청 설정 객체 </ko>
         * @param {Function} [Callback] A function to be called when the before append. The function receives one argument: data to prepended. <ko>요청 완료 후 실행 할 콜백. 응답 데이터를 파라메터로 받는다.</ko>
         * @return {Object} jqXHR.
         * @example
            infiniteGrid.ajaxPrepend("http://server.com/contents", function(data) {
                return $(data);
            } );
         */
        prependAjax: function(url, settings, callback) {
            return this._insertAjax("prepend", url, settings, callback);
        },
        /**
         * Stores state
         * @ko 상태 저장
         * @method eg.InfiniteGridService#storeContents
         * @param {String} [key] The type of keys maintained <ko>저장/복원을 위해 관리하는 키</ko>
         * @example
            infiniteGridService.store();
            infiniteGridService.store("customKey");
        */
        store: function(key) {
            if (this._isEnablePersist()) {
                var data;

                key = key || this._PERSIST_KEY;

                data = {
                    "infiniteGridStatus": this._infiniteGrid.getStatus(),
                    "scrollTop": this._getScrollTop()
                };

                this.trigger("store", data);
                $.persist(key, data);
            }
        },
        /**
         * Restores state
         * @ko 상태 복원
         * @method eg.InfiniteGridService#restore
         * @param {String} [key] The type of keys maintained <ko>저장/복원을 위해 관리하는 키</ko>
         * @example
            infiniteGridService.restore();
            infiniteGridService.restore("customKey");
        */
        restore: function(key) {
            var data;
            var isRestored = false;

            if (this._isEnablePersist()) {

                key = key || this._PERSIST_KEY;

                data = $.persist(key);

                if (data) {
                    this._infiniteGrid.setStatus(data.infiniteGridStatus);
                    global.scrollTo(0, data.scrollTop);
                    this._setBoundaryElements();
                    isRestored = true;
                }

                this.trigger("restore", data);
            }

            return isRestored;
        },
        /**
         * Clear elements
         * @ko 요소를 지움
         * @method eg.infiniteGrid#clear
         */
        clear: function() {
            this._infiniteGrid.clear();
        },
        /**
         * Release resources and off custom events
         * @ko 모든 커스텀 이벤트와 자원 해제
         * @method eg.infiniteGrid#destroy
         */
        destroy: function() {
            if (this._infiniteGrid) {
                this._infiniteGrid.destroy();
                this._infiniteGrid = null;
            }

            this.deactivate();
            this.off();
        }
    });
=======
	[window.jQuery, eg, window, document], function($, ns, global, doc) {
	/**
	 * Infinite cascading grid layout service for infiniteGrid
	 * @ko infiniteGrid를 통한 무한 그리드 레이아웃 서비스.
	 * @class
	 * @name eg.infiniteGridService
	 * @extends eg.Component
	 * @group EvergreenJs
	 *
	 * @param {String} target element <ko>타겟 엘리먼트</ko>
	 * @param {Object} options <ko>옵션</ko>
	 * @param {Number} [options.count=30] DOM count for recycle. If value is -1, DOM does increase without limit -1. <ko>재사용할 DOM 갯수. -1일 경우 DOM은 계속 늘어남.</ko>
	 * @param {Number} [threshold=100] Scroll coordinate threshold. <ko>append, prepend 이벤트가 발생하기 위한 스크롤 좌표 가용.</ko>
	 * @param {Boolean} [usePersist=true] Determines whether allows persist. <ko>persist 사용 여부.</ko>
	 */
	ns.InfiniteGridService = ns.Class.extend(ns.Component, {
		/**
		 * Constructor
		 * @param {String} Element selector
		 * @param {Object} options
		 */
		construct: function(element, options) {
			this._$wrapper = $(element);

			this._prevScrollTop = 0;
			this._inserting = false;

			this._topElement;
			this._bottomElemment;
			this._prependTopElementInfo;

			this._PERSIST_KEY = "__INFINITEGRIDSERVICE_PERSISTKEY__";

			this._options = $.extend({
				count: 120,
				threshold: 100,
				usePersist: true
			}, options);

			if (this._isEnablePersist()) {
				this._$wrapper.addClass("NO_TAP_HIGHLIGHT");
			}

			this._getScrollTop();
			this._infiniteGrid = new eg.InfiniteGrid(element, this._options);

			this._infiniteGrid.on("layoutComplete", $.proxy(function(e) {
				this._setBoundaryElements();

				if (!e.isAppend) {
					this._adjustPrependScroll(e);
				}

				this._inserting = false;
			}, this));

			this.activate();
		},
		_getScrollTop: function() {
			var fn;

			if (typeof global.scrollY === "number") {
				fn = function() {
					return global.scrollY;
				};
			} else if (typeof global.pageYOffset === "number") {
				fn = function() {
					return global.pageYOffset;
				};
			} else if (typeof doc.documentElement.scrollTop === "number") {
				fn = function() {
					return doc.documentElement.scrollTop;
				};
			} else if (typeof doc.body.scrollTop === "number") {
				fn = function() {
					return doc.body.scrollTop;
				};
			}

			this._getScrollTop = fn;
			return fn();
		},
		_setBoundaryElements: function() {
			var element;

			if (element = this._infiniteGrid.getTopElement()) {
				this._topElement = element;
			}

			if (element = this._infiniteGrid.getBottomElement()) {
				this._bottomElemment = element;
			}
		},
		_isEnablePersist: function() {
			var agent = eg.agent();
			var enablePersist = true;

			if (!this._options.usePersist ||
					agent.os.name === "ios" ||
					(agent.os.name === "android" && parseFloat(agent.os.version) < 4.4)) {
				enablePersist = false;
			}

			this._isEnablePersist = function () {
				return enablePersist;
			};

			return enablePersist;
		},
		_handleScrollEnd: function() {
			if (this._inserting) {
				return;
			}

			if (this._prevScrollTop < this._getScrollTop()) {
				if (this._bottomElemment) {
					var bottomElementBoundingClientRect =
						this._bottomElemment.getBoundingClientRect();

					if (bottomElementBoundingClientRect.top <=
							global.innerHeight + this._options.threshold) {
						this.trigger("append");
					}
				}
			} else {
				if (this._infiniteGrid.isRecycling() && this._topElement) {
					var topElementBoundingClientRect =
						this._topElement.getBoundingClientRect();

					if (topElementBoundingClientRect.bottom >=
							(0 - this._options.threshold)) {
						this.trigger("prepend");
					}
				}
			}

			this._prevScrollTop = this._getScrollTop();
		},
		_insertElements: function(mode, elements) {
			this._inserting = true;

			var length = 0;
			var $elements;

			if (typeof elements === "string") {
				$elements = $(elements);
			} else {
				$elements = elements;
			}

			if (mode === "append") {
				length = this._infiniteGrid.append($elements);
			} else if (mode === "prepend") {
				this._setPrependTopElementInfo();
				length = this._infiniteGrid.prepend($elements);
			}

			this._inserting = false;

			return length;
		},
		_insertAjax: function(mode, url, options, callback) {
			this._inserting = true;

			if (typeof url === "object") {
				options = url;
				url = undefined;
			}

			if ($.isFunction(options)) {
				callback = options;
				options = undefined;
			}

			return $.ajax(url, options)
				.always($.proxy(function(data, textStatus) {
					var $elements;

					if (textStatus === "success") {
						if (callback) {
							$elements = callback(data);
						} else {
							$elements = $(data);
						}
					}

					this._insertElements(mode, $elements);
				}, this));
		},
		_setPrependTopElementInfo: function() {
			if (this._topElement) {
				this._prependTopElementInfo = {
					element: this._topElement,
					boundingClientRect: this._topElement.getBoundingClientRect()
				};
			}
		},
		_adjustPrependScroll: function() {
			if (this._prependTopElementInfo.element) {
				var $element = $(this._prependTopElementInfo.element);
				var scrollTop =
						this._$wrapper.offset().top + $element.offset().top +
						$element.outerHeight() +
						(0 - this._prependTopElementInfo.boundingClientRect.bottom);

				global.scrollTo(0, scrollTop);
			}
		},
		/**
		 * Activate
		 * @ko 활성화
		 * @method eg.InfiniteGridService#activate
		 * @return {Instance}
		 */
		activate: function() {
			$(global).on("scrollend", $.proxy(this._handleScrollEnd, this));
			return this;
		},
		/**
		 * Deactivate
		 * @ko 비활성화
		 * @method eg.InfiniteGridService#deactivate
		 * @return {Instance}
		 */
		deactivate: function() {
			$(global).off("scrollend", this._handleScrollEnd);
			return this;
		},
		/**
		 * Append elements
		 * @ko 하단에 요소 추가
		 * @method eg.InfiniteGridService#append
		 * @param {String|jQuery|Object} URL to which the request is sent. Or jQuery to append. Or A set of key/value pairs that configure the Ajax request.
		 * @param {Object|Function} A set of key/value pairs that configure the Ajax request. Or function to be called when the before append. The function receives one argument: data to append.
		 * @param {Function} A function to be called when the before append. The function receives one argument: data to append.
		 * @return {Instance|jqXHR}
		 * @example
		 *    infiniteGrid.append( $( "<li> contents </li>" ) );
		 *    infiniteGrid.append( "http://server.com/contents", function( data ) {
		 *        return $( data );
		 *    } );
		 */
		append: function(elements) {
			return this._insertElements("append", elements);
		},
		/**
		 * Prepend elements
		 * @ko 상단에 요소 추가
		 * @method eg.InfiniteGridService#preppend
		 * @param {String|jQuery|Object} URL to which the request is sent. Or jQuery to append. Or A set of key/value pairs that configure the Ajax request.
		 * @param {Object|Function} A set of key/value pairs that configure the Ajax request. Or function to be called when the before prepend. The function receives one argument: data to prepend.
		 * @param {Function} A function to be called when the before append. The function receives one argument: data to prepend.
		 * @return {Instance|jqXHR}
		 * @example
			infiniteGrid.prepend( $( "<li> contents </li>" ) );
			infiniteGrid.prepend( "http://server.com/contents", function( data ) {
				return $( data );
			} );
		 */
		prepend: function(elements) {
			return this._insertElements("prepend", elements);
		},
		appendAjax: function(url, settings, callback) {
			return this._insertAjax("append", url, settings, callback);
		},
		prependAjax: function(url, settings, callback) {
			return this._insertAjax("prepend", url, settings, callback);
		},
		/**
		 * Stores state
		 * @ko 상태 저장
		 * @method eg.InfiniteGridService#storeContents
		 * @param {String} key (Optional) The type of keys maintained <ko>저장/복원을 위해 관리하는 키</ko>
		 * @example
			infiniteGridService.store();
			infiniteGridService.store( "customKey" );
		*/
		store: function(key) {
			if (this._isEnablePersist()) {
				var data;

				key = key || this._PERSIST_KEY;

				data = {
					"infiniteGridStatus": this._infiniteGrid.getStatus(),
					"scrollTop": this._getScrollTop()
				};

				this.trigger("store", data);
				$.persist(key, data);
			}
		},
		/**
		 * Restores state
		 * @ko 상태 복원
		 * @method eg.InfiniteGridService#restore
		 * @param {String} key (Optional) The type of keys maintained <ko>저장/복원을 위해 관리하는 키</ko>
		 * @example
			infiniteGridService.restore();
			infiniteGridService.restore( "customKey" );
		*/
		restore: function(key) {
			var data;
			var isRestored = false;

			if (this._isEnablePersist()) {

				key = key || this._PERSIST_KEY;

				data = $.persist(key);

				if (data) {
					this._infiniteGrid.setStatus(data.infiniteGridStatus);
					global.scrollTo(0, data.scrollTop);
					this._setBoundaryElements();
					isRestored = true;
				}

				this.trigger("restore", data);
			}

			return isRestored;
		},
		/**
		 * Clear elements
		 * @ko 요소를 지움
		 * @method eg.infiniteGrid#clear
		 */
		clear: function() {
			this._infiniteGrid.clear();
		},
		/**
		 * Release resources and off custom events
		 * @ko 모든 커스텀 이벤트와 자원 해제
		 * @method eg.infiniteGrid#destroy
		 */
		destroy: function() {
			if (this._infiniteGrid) {
				this._infiniteGrid.destroy();
				this._infiniteGrid = null;
			}

			this.deactivate();
			this.off();
		}
	});
});