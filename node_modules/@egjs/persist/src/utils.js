import {navigator, RegExp, parseFloat, performance} from "./browser";

const userAgent = navigator.userAgent;
const TYPE_BACK_FORWARD = performance.navigation.TYPE_BACK_FORWARD || 2;

const isNeeded = (function() {
	const isIOS = (new RegExp("iPhone|iPad", "i")).test(userAgent);
	const isMacSafari = (new RegExp("Mac", "i")).test(userAgent) &&
		!(new RegExp("Chrome", "i")).test(userAgent) &&
		(new RegExp("Apple", "i")).test(userAgent);
	const isAndroid = (new RegExp("Android ", "i")).test(userAgent);
	const isWebview = (new RegExp("wv; |inapp;", "i")).test(userAgent);
	const androidVersion = isAndroid ? parseFloat(new RegExp(
		"(Android)\\s([\\d_\\.]+|\\d_0)", "i"
	).exec(userAgent)[2]) : undefined;

	return !(isIOS ||
			isMacSafari ||
			(isAndroid &&
				((androidVersion <= 4.3 && isWebview) || androidVersion < 3)));
})();

// In case of IE8, TYPE_BACK_FORWARD is undefined.
function isBackForwardNavigated() {
	return performance.navigation.type === TYPE_BACK_FORWARD;
}

export default {
	isBackForwardNavigated,
	isNeeded,
};
