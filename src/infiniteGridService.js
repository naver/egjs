// jscs:disable maximumLineLength
eg.module("infiniteGridService", [window.jQuery, eg, window, document], function($, ns, global, doc) {
	var PERSIST_KEY = "__INFINITEGRIDSERVICE_PERSISTKEY__";
	/**
	 * Infinite cascading grid layout service for infiniteGrid
	 * @ko infiniteGrid를 통한 무한 그리드 레이아웃 서비스
	 *
	 * @param {String} DOM Element to be InfiniteGrid <ko>타겟 엘리먼트</ko>
	 * @param {Object} [Options] A set of key/value pairs that configure the InfiniteGridService <ko>key/value 형태의 옵션</ko>
	 * @param {Number} [options.count=240] Count DOM count for recycle. If value is -1, DOM does increase without limit -1. <ko>재사용할 DOM 갯수. -1일 경우 DOM은 계속 늘어남</ko>
	 * @param {Number} [options.threshold=300] Threshold Scroll coordinate threshold <ko>append, prepend 이벤트가 발생하기 위한 스크롤 좌표 임계치</ko>
	 * @param {Boolean} [options.usePersist=true] usePersist Determines whether allows persist <ko>persist 사용 여부</ko>
	 */
	ns.InfiniteGridService = ns.Class.extend(ns.Component, {
		/**
		 * Constructor
		 * @param {String} element selector
		 * @param {Object} options
		 */
		construct: function(element, options) {
			this._$wrapper = $(element);

			this._prevScrollTop = 0;
			this._inserting = false;

			this._topElement = null;
			this._bottomElemment = null;

			this._EVENT_NAMESPACE = ".infiniteGridService" +
					Math.floor((Math.random() * 100000) + 1);

			this._options = $.extend({
				count: 240,
				threshold: 300,
				usePersist: true
			}, options);

			if (this._isEnablePersist()) {
				this._$wrapper.addClass("NO_TAP_HIGHLIGHT");
			}

			this._infiniteGrid = new eg.InfiniteGrid(element, this._options);

			this.activate();
		},
		_getScrollTop: function() {
			return doc.body.scrollTop || doc.documentElement.scrollTop;
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
			return (this._options.usePersist && $.persist.isNeeded());
		},
		_onScroll: function() {
			if (this._inserting || this._infiniteGrid.isProcessing()) {
				return;
			}

			var scrollTop = this._getScrollTop();

			if (eg.agent().os.name === "ios" && scrollTop === 0) {
				return;
			}

			if (this._prevScrollTop < scrollTop) {
				if (this._bottomElemment) {
					var bottomElementBoundingClientRect =
						this._bottomElemment.getBoundingClientRect();

					if (bottomElementBoundingClientRect.top <=
							doc.documentElement.clientHeight + this._options.threshold) {
						this.trigger("append");
					}
				}
			} else {
				if (this._topElement) {
					var topElementBoundingClientRect =
						this._topElement.getBoundingClientRect();

					if (topElementBoundingClientRect.bottom >=
							(0 - this._options.threshold)) {
						this._fit();
						this.trigger("prepend");
					}
				}
			}

			this._prevScrollTop = this._getScrollTop();
		},
		_onLayoutComplete: function(e) {
			if (!e.isAppend) {
				global.scrollTo(0, this._getScrollTop() + e.distance);
			}

			this._setBoundaryElements();
			this.trigger("layoutComplete", e);
			this._inserting = false;
		},
		_insertAjax: function(mode, url, options, callback) {
			if ($.isFunction(options)) {
				callback = options;
				options = undefined;
			}

			return $.ajax(url, options)
					.done($.proxy(function(data) {
						if (callback) {
							data = callback(data);
						}
						this._infiniteGrid[mode]($(data));
					}, this))
					.fail($.proxy(function() {
						this._inserting = false;
					}, this));
		},
		_fit: function() {
			var scrollTop = this._getScrollTop();
			var croppedHeight = this._infiniteGrid.fit();
			if (croppedHeight > 0) {
				global.scrollTo(0, scrollTop - croppedHeight);
			}
		},
		/**
		 * Activate
		 * @ko 활성화
		 * @method eg.InfiniteGridService#activate
		 * @return {Object} infiniteGridService Instance itself <ko>인스턴스</ko>
		 */
		activate: function() {
			$(global).on("scroll" + this._EVENT_NAMESPACE, $.proxy(this._onScroll, this));
			this._infiniteGrid.on("layoutComplete", $.proxy(this._onLayoutComplete, this));

			return this;
		},
		/**
		 * Deactivate
		 * @ko 비활성화
		 * @method eg.InfiniteGridService#deactivate
		 * @return {Object} infiniteGridService Instance itself <ko>인스턴스</ko>
		 */
		deactivate: function() {
			$(global).off("scrollend" + this._EVENT_NAMESPACE);
			this._infiniteGrid.off("layoutComplete");
			return this;
		},
		/**
		 * Append elements
		 * @ko 하단에 요소 추가
		 * @method eg.InfiniteGridService#append
		 * @param {String|jQuery} elements DOM Element to append in a target <ko>타겟요소에 추가할 DOM 엘리먼트</ko>
		 * @return {Number} Length The number of elements to prepended <ko>추가한 요소의 갯수</ko>
		 * @example
		 *    infiniteGridService.append("<li> contents </li>");
		 *    infiniteGridService.append($("<li> contents </li>"));
		 */
		append: function(elements) {
			this._inserting = true;
			return this._infiniteGrid.append($(elements));
		},
		/**
		 * Prepend elements
		 * @ko 상단에 요소 추가
		 * @method eg.InfiniteGridService#preppend
		 * @param {String|jQuery} elements DOM Element to append in a target <ko>타겟요소에 추가할 DOM 엘리먼트</ko>
		 * @return {Number} Length The number of elements to prepended <ko>추가한 요소의 갯수</ko>
		 * @example
		 *    infiniteGridService.prepend("<li> contents </li>");
		 *    infiniteGridService.prepend($("<li> contents </li>"));
		 */
		prepend: function(elements) {
			this._inserting = true;
			return this._infiniteGrid.prepend($(elements));
		},
		/**
		 * Append Ajax response elements
		 * @ko 하단에 Ajax 호출 결과 추가
		 * @method eg.InfiniteGridService#appendAjax
		 * @param {String} url URL A string containing the URL to which the request is sent <ko>요청할 URL</ko>
		 * @param {Object} [settings] A set of key/value pairs that configure the Ajax request <ko>Ajax 설정 객체</ko>
		 * @param {Function} [callback] A function to be called when the before append. The function receives one argument: data will append <ko>요청 완료 후 실행 할 콜백. 응답 데이터를 파라메터로 받음</ko>
		 * @return {Object} jqXHR
		 * @example
		 *    infiniteGridService.ajaxAppend("http://server.com/contents", function(data) {
		 *        return $(data);
		 *    } );
		 */
		appendAjax: function(url, settings, callback) {
			this._inserting = true;
			return this._insertAjax("append", url, settings, callback);
		},
		/**
		 * Prepend Ajax response elements
		 * @ko 상단에 요소 추가
		 * @method eg.InfiniteGridService#preppendAjax
		 * @param {String} url URL A string containing the URL to which the request is sent <ko>요청할 URL</ko>
		 * @param {Object} [settings] A set of key/value pairs that configure the Ajax request <ko>Ajax 설정 객체</ko>
		 * @param {Function} [callback] A function to be called when the before append. The function receives one argument: data to prepended <ko>요청 완료 후 실행 할 콜백. 응답 데이터를 파라메터로 받음</ko>
		 * @return {Object} jqXHR
		 * @example
			infiniteGridService.ajaxPrepend("http://server.com/contents", function(data) {
				return $(data);
			} );
		 */
		prependAjax: function(url, settings, callback) {
			this._inserting = true;
			return this._insertAjax("prepend", url, settings, callback);
		},
		/**
		 * Stores state
		 * @ko 상태 저장
		 * @method eg.InfiniteGridService#store
		 * @param {String} [key] The type of keys maintained <ko>저장/복원을 위해 관리하는 키</ko>
		 * @example
			infiniteGridService.store();
			infiniteGridService.store("customKey");
		*/
		store: function(key) {
			if (this._isEnablePersist()) {
				var data;

				key = key || PERSIST_KEY;

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

				key = key || PERSIST_KEY;

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
		 * @method eg.infiniteGridService#clear
		 */
		clear: function() {
			this._infiniteGrid.clear();
		},
		/**
		 * Release resources and off custom events
		 * @ko 모든 커스텀 이벤트와 자원 해제
		 * @method eg.infiniteGridService#destroy
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