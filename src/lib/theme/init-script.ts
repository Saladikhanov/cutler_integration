import { THEME_KEY } from "./resolve";

/**
 * Runs synchronously in <head>, before the first paint, so a stored choice never flashes the wrong
 * theme. With no valid stored choice it sets nothing: the CSS follows the device setting on its own,
 * which also covers visitors with JavaScript off. Storage access is wrapped because it can throw.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)});if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})()`;
