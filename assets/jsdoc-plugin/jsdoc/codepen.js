exports.defineTags = function(dictionary) {
    dictionary.defineTag("codepen", {
        onTagged: function(doclet, tag) {
    		var tagVal = eval('tag.value');
            doclet.codepen = eval("(" + tagVal + ")");
        }
    });
};