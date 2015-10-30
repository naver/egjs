module.exports = ["/**",
"* <%= pkg.name %>",
"* @version <%= pkg.version %>",
"* @SHA-1 <%= gitinfo.local.branch.current.shortSHA %>" +
"<%= /(?!^master$)(^.*$)/.test(gitinfo.local.branch.current.name) " +
"	&& ' ('+ RegExp.$1 +')' || '' %>",
"*",
"* <%= pkg.author %>; <%= pkg.name %> JavaScript library",
"* http://egjs.navercorp.com/",
"*",
"* Released under the <%= pkg.licenses[0].type %> license",
"* <%= pkg.licenses[0].url %>",
"*/\n"].join("\n");