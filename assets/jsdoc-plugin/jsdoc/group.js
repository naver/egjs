exports.defineTags = function(dictionary) {
    dictionary.defineTag("group", {
        onTagged: function(doclet, tag) {
        	doclet.group = tag.value;
        }
    });
};