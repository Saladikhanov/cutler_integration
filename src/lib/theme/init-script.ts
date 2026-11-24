import { THEME_KEY } from "./resolve";

/**
 * Runs synchronously in <head>, before the first paint, so a stored choice never flashes the wrong theme. The
 * stored value is "choice:deviceTheme" (see resolve.ts); it applies only while the device is still in that theme,
 * otherwise nothing is set and the CSS follows the device on its own, which also covers visitors with JavaScript
 * off. Storage and matchMedia are wrapped because they can throw or be missing.
 */
export const themeInitScript = `(function(){try{var v=(localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)})||"").split(":");var t=v[0],d=v[1];var now=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";if((t==="light"||t==="dark")&&v.length===2&&d===now){document.documentElement.setAttribute("data-theme",t);var c=t==="dark"?"#222222":"#fefefe";var f=function(){var m=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<m.length;i++)m[i].setAttribute("content",c)};f();document.addEventListener("DOMContentLoaded",f)}}catch(e){}})()`;
