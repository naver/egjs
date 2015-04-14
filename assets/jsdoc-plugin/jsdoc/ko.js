exports.defineTags = function(dictionary) {
    dictionary.defineTag("ko", {
        onTagged: function(doclet, tag) {
            doclet.ko = tag.value;
        }
    });
};