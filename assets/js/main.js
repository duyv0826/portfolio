/* ============================================================
   站点交互：阅读进度 + 导航高亮 + 埋点挂载点
   规则：无框架、无构建、无第三方依赖。
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 阅读进度条 ---------- */

  function initProgressBar() {
    var bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var height = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = height > 0 ? scrollTop / height : 0;
      bar.style.width = (ratio * 100).toFixed(2) + "%";
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- 导航高亮 ---------- */

  function initNavHighlight() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link[href^='#']"));
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    var targets = [];

    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      map[id] = link;
      targets.push(section);
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = map[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach(function (l) {
              l.classList.remove("is-active");
            });
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    targets.forEach(function (t) {
      observer.observe(t);
    });
  }

  /* ---------- 埋点挂载点 ----------
     用法：确认统计方案后，把下面的函数体替换为对应 SDK 的调用。
     已预留的事件：
       trackEvent("project_view", { project: "room-of-choice" })
       trackEvent("outbound_click", { target: "github" })
     页面内通过 data-track 属性声明式埋点：
       <a href="..." data-track="outbound_click" data-track-target="github">
  */

  function trackEvent(name, payload) {
    // 方案 A（Cloudflare Web Analytics）：无需手动事件，删除本函数体即可。
    // 方案 B（Microsoft Clarity）：
    //   if (window.clarity) window.clarity("set", name, JSON.stringify(payload || {}));
    // 方案 C（自建 / Umami）：
    //   navigator.sendBeacon("/api/stat", JSON.stringify({ event: name, data: payload || {} }));
    if (window.dataLayer && typeof window.dataLayer.push === "function") {
      window.dataLayer.push({ event: name, payload: payload || {} });
    }
  }

  function initTracking() {
    document.addEventListener("click", function (event) {
      var el = event.target.closest ? event.target.closest("[data-track]") : null;
      if (!el) return;
      trackEvent(el.getAttribute("data-track"), {
        target: el.getAttribute("data-track-target") || el.getAttribute("href") || "",
        label: (el.textContent || "").trim()
      });
    });
  }

  /* ---------- 启动 ---------- */

  function boot() {
    initProgressBar();
    initNavHighlight();
    initTracking();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
