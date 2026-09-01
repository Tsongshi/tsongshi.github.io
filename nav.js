/* 全站返回导航（外挂式）
 *
 * 为什么做成外挂 JS 而不是改各页 HTML：
 *   fakao-session.html / fakao-knowledge-map.html 是构建产物（Session/build.py、
 *   知识图谱/build.mjs 生成），直接改会被下次构建冲掉。做成一个共享脚本，
 *   各页只需引一行 <script src="/nav.js" defer></script>，构建模板加这一行即可长期生效。
 *
 * 行为：
 *   /xxx.html        → 悬浮「← 首页」   回公开首页
 *   /private/xxx.html → 悬浮「← 工作台」 回密码层首页
 *   两个首页本身不显示（首页有自己的导航）
 *
 * 样式刻意做成小号半透明悬浮胶囊，而不是通栏导航条——因为要覆盖的页面里有
 * 全屏 3D 图谱和闯关应用，通栏会挡住它们的 UI。
 */
(function () {
  "use strict";

  var path = location.pathname;
  var inPrivate = path.indexOf("/private/") !== -1;
  var pageLanguage = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  var useEnglish = pageLanguage.indexOf("en") === 0;

  // 两个首页不加导航
  var isPublicHome = !inPrivate && /(^\/$)|(\/index\.html$)/.test(path);
  var isPrivateHome = inPrivate && /\/private\/(index\.html)?$/.test(path);
  if (isPublicHome || isPrivateHome) return;

  var target = inPrivate ? "/private/" : "/";
  var label = useEnglish ? (inPrivate ? "Workbench" : "Home") : (inPrivate ? "工作台" : "首页");

  function mount() {
    if (document.getElementById("site-nav-back")) return;

    var a = document.createElement("a");
    a.id = "site-nav-back";
    a.href = target;
    a.textContent = "← " + label;
    a.setAttribute("aria-label", useEnglish ? "Back to " + label : "返回" + label);

    a.style.cssText = [
      "position:fixed",
      "top:max(10px, env(safe-area-inset-top))",
      "left:max(10px, env(safe-area-inset-left))",
      "z-index:2147483000",
      "display:inline-flex",
      "align-items:center",
      "min-height:32px",
      "padding:5px 12px",
      "border-radius:999px",
      "font:500 13px/1 -apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',Arial,sans-serif",
      "text-decoration:none",
      "white-space:nowrap",
      "opacity:.55",
      "transition:opacity .15s",
      "-webkit-backdrop-filter:blur(8px)",
      "backdrop-filter:blur(8px)",
      // 浅色底默认；深色模式下面用 matchMedia 覆盖
      "background:rgba(255,255,255,.82)",
      "color:#1a1a1a",
      "border:1px solid rgba(0,0,0,.12)",
      "box-shadow:0 1px 3px rgba(0,0,0,.08)",
    ].join(";");

    // 深色模式
    try {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        a.style.background = "rgba(22,25,35,.82)";
        a.style.color = "#e6e9ef";
        a.style.border = "1px solid rgba(255,255,255,.14)";
        a.style.boxShadow = "0 1px 3px rgba(0,0,0,.35)";
      }
    } catch (e) { /* matchMedia 不可用就用浅色，无所谓 */ }

    a.addEventListener("mouseenter", function () { a.style.opacity = "1"; });
    a.addEventListener("mouseleave", function () { a.style.opacity = ".55"; });
    a.addEventListener("focus", function () { a.style.opacity = "1"; });
    a.addEventListener("blur", function () { a.style.opacity = ".55"; });

    document.body.appendChild(a);
    reserveSpace();
  }

  /* 普通滚动页（正文从很靠上就开始，比如对比表格）按钮会压住标题，
     给 body 加一点顶部内边距把内容让开。
     全屏应用页（3D 图谱这种，高度锁死在一屏）不能动 padding，会把布局挤坏；
     它们顶部本来就有留白，不加也不会挡。 */
  function reserveSpace() {
    try {
      var doc = document.documentElement;
      var isFullScreenApp = doc.scrollHeight <= window.innerHeight + 8;
      if (isFullScreenApp) return;
      if (document.body.dataset.navSpaced === "1") return;

      var cur = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
      if (cur >= 48) return; // 本来就够宽松，不用再加
      document.body.style.paddingTop = cur + 44 + "px";
      document.body.dataset.navSpaced = "1";
    } catch (e) { /* 让位失败无所谓，按钮仍可点 */ }
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }

  // 密码层的页面是 StatiCrypt 加密的：解密后整个 document 会被重写，
  // 上面挂的按钮会被抹掉。这里观察 body 变化，被抹掉就补挂回来。
  if (inPrivate && window.MutationObserver) {
    var obs = new MutationObserver(function () {
      if (document.body && !document.getElementById("site-nav-back")) mount();
    });
    var start = function () {
      if (document.documentElement) {
        obs.observe(document.documentElement, { childList: true, subtree: false });
      }
    };
    if (document.documentElement) start();
    else document.addEventListener("DOMContentLoaded", start);
  }
})();
