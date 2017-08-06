/**
 * Copyright (c) NAVER Corp.
 * egjs-agent projects are licensed under the MIT license
 */
import {navigator} from "./browser";
import Parser from "./Parser";

/**
 * @namespace eg
 * @group egjs
 */

/**
 * Extracts browser and operating system information from the user agent string.
 * @ko 유저 에이전트 문자열에서 브라우저와 운영체제 정보를 추출한다.
 * @function eg#agent
 * @param {String} [userAgent=navigator.userAgent] user agent string to parse <ko>파싱할 유저에이전트 문자열</ko>
 * @return {Object} agentInfo
 * @return {Object} agentInfo.os os Operating system information <ko>운영체제 정보</ko>
 * @return {String} agentInfo.os.name Operating system name (android, ios, window, mac, unknown) <ko>운영체제 이름 (android, ios, window, mac, unknown)</ko>
 * @return {String} agentInfo.os.version Operating system version <ko>운영체제 버전</ko>
 * @return {String} agentInfo.browser Browser information <ko>브라우저 정보</ko>
 * @return {String} agentInfo.browser.name Browser name (safari, chrome, sbrowser, ie, firefox, unknown) <ko>브라우저 이름 (safari, chrome, sbrowser, ie, firefox, unknown)</ko>
 * @return {String} agentInfo.browser.version Browser version <ko>브라우저 버전 </ko>
 * @return {String} agentInfo.browser.webview Indicates whether the browser is inapp<ko>웹뷰 브라우저 여부</ko>
 */
export default function agent(ua = navigator.userAgent) {
	Parser.setUa(ua);

	const agentInfo = {
		os: Parser.getOs(),
		browser: Parser.getBrowser(),
	};

	agentInfo.browser.name = agentInfo.browser.name.toLowerCase();
	agentInfo.os.name = agentInfo.os.name.toLowerCase();
	agentInfo.os.version = agentInfo.os.version.toLowerCase();

	if (agentInfo.os.name === "ios" && agentInfo.browser.webview) {
		agentInfo.browser.version = "-1";
	}

	return agentInfo;
}

