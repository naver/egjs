module.exports = ["/**",
"* <%= pkg.name %>",
"* @version <%= pkg.version %>",
"* @SHA-1 <%= gitinfo.shortSHA %>" +
"<%= /(?!^master$)(^.*$)/.test(gitinfo.branchName) " +
"	&& ' ('+ RegExp.$1 +')' || '' %>",
"*",
"* <%= pkg.author %>; <%= pkg.name %> JavaScript library",
"* <%= pkg.homepage %>",
"*",
"* Released under the <%= pkg.licenses[0].type %> license",
"* <%= pkg.licenses[0].url %>",
"*",
"* You can customize download by using egjs-cli (<%= pkg.customdownload %>)",
"*/\n"].join("\n");