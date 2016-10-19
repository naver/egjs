/*!
 * Start Bootstrap - Creative Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    })

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Fit Text Plugin for Main Header
    $("h1").fitText(
        1.2, {
            minFontSize: '35px',
            maxFontSize: '65px'
        }
    );

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    })

    // Initialize WOW.js Scrolling Animations
    new WOW().init();

    // Initialize eg.Flicking Showcase
    var padding = $("#flick").width() * 0.1;
    $("#flick").flicking({
      circular: true,
      previewPadding: [ padding, padding ],
      duration: 300,
      defaultIndex: 3
    });

     $(window).resize(function() {
         // 이슈로 올리기
         var padding = $("#flick").flicking("instance").$wrapper.width() * 0.1;
         $("#flick").flicking("instance").options.previewPadding = [padding, padding];
         $("#flick").flicking("instance").resize();
     });

     // Initialize eg.Visible Showcase
     var visibleView = new eg.Visible('#visibleWrapper',{
         targetClass : "card",
         expandSize : -70
     }).on("change", function (e) {
         $(e.visible).addClass("visible");
         $(e.invisible).removeClass("visible");
     });

     visibleView.check();

     $('#visibleWrapper').scroll(function() {
         visibleView.check();
     });

     // Initialize eg.InfiniteGrid Showcase
     $("#infiniteGridWrapper").infiniteGrid({
         itemSelector: ".item",
         count: -1
     });

     // Initialize eg.MovableCoord Showcase
     function gridItemHTML(items) {
         return items.reduce(function(prv, cur) {
             var html = '<div class="infinitegrid-item">' +
     		'<div class="card">' +
     			'<img class="' + cur.className + '" src="./assets/img/' + cur.className + '.svg" />' +
     		'</div>' +
             '</div>';
             return prv + html;
         }, '');
     }
    var griditemData = {
    	getItems: function(groupNo) {
    		groupNo *= 20;
    		var items = [];
    		for(var i=0; i<20; i++) {
    			items.push(groupNo + i);
    		}
    		items = $.map(items, function(v) {
                //console.log(v)
    			return {
				    offset: v,
    				className: parseInt(10 * Math.random()) % 2 === 0 ? "logo_mono" : "type_white",
    			};
    		});
    		return items;
    	}
     };
     var $grid = $("#infiniteGridWrapper");

     eg.InfiniteGrid.prototype._getScrollTop = function() {
         return this.$el.parent().scrollTop();
     };

     var ig = new eg.InfiniteGrid("#infiniteGridWrapper", {
         count : 60,
         threshold : 500
     }).on({
         "append" : function(e) {
             var gk = this.getGroupKeys();
             var lastGk = gk[gk.length-1];
             lastGk++;
             this.append(gridItemHTML(griditemData.getItems(lastGk)), lastGk);
         },
         "prepend" : function(e) {
             var firstGk = this.getGroupKeys()[0];
             firstGk--;
             if(firstGk >= 0) {
                 this.prepend(gridItemHTML(griditemData.getItems(firstGk)), firstGk);
             }
         },
         "layoutComplete" : function(e) {
             $grid.css("visibility", "visible");
         }
     });

     ig.$view.off("scroll", ig._onScroll);
     ig.$view.off("resize", ig._onResize);

     ig.$view = $("#infiniteGridWrapper").parent();

     ig.$view.on("scroll", ig._onScroll);
     ig.$view.on("resize", ig._onResize);

     $(window).resize(function() {
         ig.layout();
     });

     ig.append(gridItemHTML(griditemData.getItems(0)), 0);

     var $movableDot = $(".movableDot");
    $(".hand").closest(".showcase-content").css("overflow", "hidden");
     var hand = $(".hand")[0];
     var $card = $(".handcard");
     var handRect = hand.getBoundingClientRect();
     var handCenterY = (handRect.top +  handRect.bottom) / 2;
     var handCenterX = (handRect.left +  handRect.right) / 2
     var HAND_RADIUS = parseInt(window.getComputedStyle(hand).width) / 2;
     var CARD_OFFSET = -300;

     var handRotMin = null;
     var handRotMax = null;

     $card.each(function(idx, card) {
     	setCardOnHand(card);
     });

          var movalbeCoord = new eg.MovableCoord({
              min : [handRotMin, 0],
              max: [handRotMax, 0],
              circular: false,
              deceleration: 0.00034,
              bounce: [160, 15, 40, 15]
          }).on({
             "change" : function(evt) {
                 var pos = evt.pos;
            //     $movableDot.css("left", pos[0] + 15 + "px");
                 $movableDot.css("bottom", -1.4 * pos[1] + "px");

                 $movableDot.css("transform", "translateX(" + pos[0]*2.3 + "px)");

     						$(hand).css("transform", "rotateZ(" + pos[0] + "deg)");

     						$card.each(function(idx, card) {
     							var cardDistance = getCardDistance(card, hand).distance;
     							var cardOffset = pos[1];
     							//	var cardOffset = cardDistance - CARD_OFFSET - HAND_RADIUS;
     							var currentRotateZ =  card.style.transform.split("translateY")[0];
     							$(card).css("transform", currentRotateZ + "translateY("+($(card).data("cardOffset") + pos[1]) +"px)");
     						});
             }
          });
          movalbeCoord.bind(hand, {
              maximumSpeed : 50,
              scale: [.3, 0.8]
          });
          movalbeCoord.setTo((handRotMin + handRotMax) / 2,0);

     function getCardDistance(card, hand) {
     	var handRect = hand.getBoundingClientRect();
     	var handCenterY = (handRect.top +  handRect.bottom) / 2;
     	var handCenterX = (handRect.left +  handRect.right) / 2
     	var cardRect = card.getBoundingClientRect();
     	var cardCenterY = (cardRect.top +  cardRect.bottom) / 2;
     	var cardCenterX = (cardRect.left +  cardRect.right) / 2;
     	var deltaX = handCenterX - cardCenterX;
     	var deltaY = handCenterY - cardCenterY;
     	var cardDistance = Math.sqrt( Math.pow(deltaX, 2) + Math.pow(deltaY, 2) );
     	var cardTilt = radToDeg( Math.atan( deltaX / deltaY ) * -1);
     	return {
     		distance: cardDistance,
     		tilt: cardTilt
     	};
     }
     	function radToDeg (rad) {
     		return rad / Math.PI * 180;
     	};
     function setCardOnHand(card) {
     	var distance = getCardDistance(card, hand);

     	var cardTilt = distance.tilt;
     	var cardDistance = distance.distance;

     	var cardOffset = cardDistance - CARD_OFFSET - HAND_RADIUS;

     	if(handRotMin === null) {
     		handRotMin = cardTilt;
     	} else if(cardTilt < handRotMin) {
     		handRotMin = cardTilt;
     	}
     	if(handRotMax === null) {
     		handRotMax = cardTilt;
     	} else if(cardTilt > handRotMax) {
     		handRotMax = cardTilt;
     	}

     	$(card).css("transform", "rotateZ(" + cardTilt + "deg) translateY("+cardOffset+"px)");
     	$(card).data("cardOffset", cardOffset);

     }


})(jQuery); // End of use strict
