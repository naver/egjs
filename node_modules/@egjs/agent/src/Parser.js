import parseRules from "./parseRules";

let UA;

function setUa(ua) {
	UA = ua;
}

function isMatched(base, target) {
	return target &&
		target.test ? !!target.test(base) : base.indexOf(target) > -1;
}

function getIdentityStringFromArray(rules, defaultStrings) {
	const matchedRule = rules.filter(rule => isMatched(UA, rule.criteria))[0];

	return (matchedRule && matchedRule.identity) || defaultStrings.name;
}

function getRule(rules, targetIdentity) {
	return rules.filter(rule => {
		const criteria = rule.criteria;
		const identityMatched = new RegExp(rule.identity, "i").test(targetIdentity);

		if (criteria ?
			identityMatched && isMatched(UA, criteria) :
			identityMatched) {
			return true;
		} else {
			return false;
		}
	})[0];
}

function getBrowserName() {
	return getIdentityStringFromArray(parseRules.browser, parseRules.defaultString.browser);
}

function getBrowserRule(browserName) {
	let rule = getRule(parseRules.browser, browserName);

	if (!rule) {
		rule = {
			criteria: browserName,
			versionSearch: browserName,
			identity: browserName,
		};
	}

	return rule;
}

function extractBrowserVersion(versionToken, ua) {
	let browserVersion = parseRules.defaultString.browser.version;
	const versionRegexResult =
		(new RegExp(`(${versionToken})`, "i")).exec(ua);

	if (!versionRegexResult) {
		return browserVersion;
	}

	const versionTokenIndex = versionRegexResult.index;
	const verTkn = versionRegexResult[0];

	if (versionTokenIndex > -1) {
		const versionIndex = versionTokenIndex + verTkn.length + 1;

		browserVersion = ua.substring(versionIndex)
			.split(" ")[0]
			.replace(/_/g, ".")
			.replace(/;|\)/g, "");
	}
	return browserVersion;
}

function getBrowserVersion(browserName) {
	if (!browserName) {
		return undefined;
	}

	// console.log(browserRule);
	// const versionToken = browserRule ? browserRule.versionSearch : browserName;
	const browserRule = getBrowserRule(browserName);
	const versionToken = browserRule.versionSearch || browserName;
	const browserVersion = extractBrowserVersion(versionToken, UA);

	return browserVersion;
}

function isWebview() {
	const webviewRules = parseRules.webview;
	let browserVersion;

	return webviewRules.filter(rule => isMatched(UA, rule.criteria))
		.some(rule => {
			browserVersion =
				extractBrowserVersion(rule.browserVersionSearch, UA);
			if (isMatched(UA, rule.webviewToken) ||
				isMatched(browserVersion, rule.webviewBrowserVersion)) {
				return true;
			} else {
				return false;
			}
		});
}

function getOSRule(osName) {
	return getRule(parseRules.os, osName);
}

function getOsName() {
	return getIdentityStringFromArray(parseRules.os, parseRules.defaultString.os);
}

function getOsVersion(osName) {
	const osRule = getOSRule(osName) || {};
	const defaultOSVersion = parseRules.defaultString.os.version;
	let osVersion;

	if (!osName) {
		return undefined;
	}
	if (osRule.versionAlias) {
		return osRule.versionAlias;
	}
	const osVersionToken = osRule.versionSearch || osName;
	const osVersionRegex =
		new RegExp(`(${osVersionToken})\\s([\\d_\\.]+|\\d_0)`, "i");
	const osVersionRegexResult = osVersionRegex.exec(UA);

	if (osVersionRegexResult) {
		osVersion = osVersionRegex.exec(UA)[2].replace(/_/g, ".")
											.replace(/;|\)/g, "");
	}
	return osVersion || defaultOSVersion;
}

function getOs() {
	const name = getOsName();
	const version = getOsVersion(name);

	return {name, version};
}

function getBrowser() {
	const name = getBrowserName();
	const version = getBrowserVersion(name);

	return {name, version, webview: isWebview()};
}

export default {
	getOs,
	getBrowser,
	setUa,
};
