module.exports = {
	common : ["/**",
		"* <%= pkg.name %>",
		"* @version <%= pkg.version %>",
		"* @SHA-1 <%= gitinfo.shortSHA %>" +
		"<%= /(?!^master$)(^.*$)/.test(gitinfo.branchName) " +
		"	&& ' ('+ RegExp.$1 +')' || '' %>",
		"*",
		"* <%= pkg.author %>; <%= pkg.name %> JavaScript library",
		"* <%= pkg.homepage %>",
		"*",
		"* Released under <%= pkg.license %> license",
		"* <%= pkg.licenseUrl %>",
		"*",
		"* For custom build use egjs-cli",
		"* <%= pkg.customdownload %>",
		"*/\n"].join("\n"),
	pkgd : function(type) {
		return [
			"/**",
			"* All-in-one packaged file for ease use of '" + type + "' with below dependencies.",
			"* NOTE: This is not an official distribution file and is only for user convenience.",
			"*",
			"* "].join("\n");
		}
};