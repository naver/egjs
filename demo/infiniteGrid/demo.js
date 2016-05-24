var template = Handlebars.compile('{{~#each items~}}<div class="item"><div class="thumbnail"><img class="img-rounded" src="{{imgSrc}}" /><div class="caption"><p><a href="{{href}}">{{desc}}</a></p></div></div></div>{{~/each~}}');
var data = {
	getItems: function(groupNo) {
		groupNo *= 30;
		var items = [];
		for(var i=0; i<30; i++) {
			items.push(groupNo + i);
		}
		items = $.map(items, function(v) {
			return {
				offset: v,
				imgSrc: "http://naver.github.io/egjs-experiment/infiniteGridService/demo/img/" + ( ( (v + 1) % 60) + 1 ) + ".jpg",
				href: "http://naver.com/",
				desc: "Cras justo odio..."
			};
		});
		return {items: items};
	}
};

$(document).ready(function() {
	var $grid = $("#grid");
	var ig = new eg.InfiniteGrid("#grid", {
		count : 60
	}).on({
		"append" : function(e) {
			var gk = this.getGroupKeys();
			var lastGk = gk[gk.length-1];
			lastGk++;
			ig.append(template(data.getItems(lastGk)), lastGk);
		},
		"prepend" : function(e) {
			var firstGk = this.getGroupKeys()[0];
			firstGk--;
			if(firstGk >= 0) {
				ig.prepend(template(data.getItems(firstGk)), firstGk);
			}
		},
		"layoutComplete" : function(e) {
			$grid.css("visibility", "visible");
		}
	});

	ig.append(template(data.getItems(0)), 0);
});