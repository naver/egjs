const win = (typeof window !== `undefined` && window) || {};

export {win as window};
export const console = win.console;
export const document = win.document;
export const history = win.history;
export const localStorage = win.localStorage;
export const location = win.location;
export const sessionStorage = win.sessionStorage;
export const navigator = win.navigator;
export const JSON = win.JSON;
export const RegExp = win.RegExp;
export const parseFloat = win.parseFloat;
export const performance = win.performance;
