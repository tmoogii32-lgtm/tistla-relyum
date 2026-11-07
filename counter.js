/* Нүүр хуудасны гүйдэг тоолуур.
   Apps Script вэб апп (google-form/counter-webapp.gs)-ыг deploy хийхэд гарах
   "Web app URL"-ыг доорх хашилтын дотор хуулж тавина.
   Жишээ: "https://script.google.com/macros/s/AKfycb.../exec" */
var STATS_URL = "";

(function () {
  "use strict";

  var POLL_MS = 30000;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // data-counter="views" | "students" | "static"
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-counter]")).map(function (el) {
    var initial = parseInt(el.textContent.replace(/\D/g, ""), 10) || 0;
    return { el: el, key: el.getAttribute("data-counter"), shown: 0, target: initial, visible: false, raf: 0 };
  });
  if (!counters.length) return;

  // Тоо гүйх хөдөлгөөн (эхэндээ хурдан, төгсгөлдөө удаан)
  function run(c, to) {
    c.target = to;
    if (!c.visible) return;
    cancelAnimationFrame(c.raf);
    var from = c.shown;
    if (reduce || from === to) { show(c, to); return; }
    var diff = Math.abs(to - from);
    var duration = Math.min(2200, 700 + Math.log10(diff + 1) * 300);
    var start = performance.now();
    (function tick(now) {
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      show(c, Math.round(from + (to - from) * eased));
      if (p < 1) c.raf = requestAnimationFrame(tick);
    })(start);
  }

  function show(c, value) {
    c.shown = value;
    c.el.textContent = String(value);
  }

  // Харагдах үед 0-ээс гүйж эхэлнэ
  if ("IntersectionObserver" in window) {
    counters.forEach(function (c) { show(c, 0); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        counters.forEach(function (c) {
          if (c.el === e.target) { c.visible = true; run(c, c.target); }
        });
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c.el); });
  } else {
    counters.forEach(function (c) { c.visible = true; show(c, c.target); });
  }

  // ---------- Шууд өгөгдөл ----------
  var url = (STATS_URL || "").trim();
  if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(url)) return;

  function request(action) {
    var sep = url.indexOf("?") === -1 ? "?" : "&";
    return fetch(url + sep + "action=" + action, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  var live = false;
  function apply(data) {
    counters.forEach(function (c) {
      if (c.key === "views" && typeof data.views === "number") run(c, data.views);
      if (c.key === "students" && typeof data.students === "number") run(c, data.students);
    });
    if (!live) { live = true; addLiveDots(); }
  }

  // Хуудас нээгдэх бүр нэг үзэлт
  request("hit").then(apply).catch(function () { /* сүлжээгүй үед HTML дахь тоо үлдэнэ */ });

  // 30 сек тутам шинэчилнэ (таб нээлттэй үед л)
  setInterval(function () {
    if (document.hidden) return;
    request("stats").then(apply).catch(function () {});
  }, POLL_MS);

  // ---------- "Шууд" тэмдэг: 3.2 сек тутам тархах цагираг ----------
  var rings = [];
  function addLiveDots() {
    counters.forEach(function (c) {
      if (c.key === "static") return;
      var host = c.el.parentElement;
      if (!host || host.querySelector(".stat-live")) return;
      var ring = document.createElement("span");
      ring.className = "stat-live__ring";
      ring.setAttribute("aria-hidden", "true");
      var badge = document.createElement("span");
      badge.className = "stat-live";
      badge.title = "Шууд шинэчлэгдэж байна";
      badge.appendChild(ring);
      var sr = document.createElement("span");
      sr.className = "visually-hidden";
      sr.textContent = "шууд шинэчлэгддэг тоо";
      badge.appendChild(sr);
      host.appendChild(badge);
      rings.push(ring);
    });
    if (!reduce && rings.length) requestAnimationFrame(pulse);
  }

  function pulse(now) {
    var p = (now % 3200) / 3200;
    rings.forEach(function (r) {
      r.style.transform = "scale(" + (1 + p * 1.6).toFixed(3) + ")";
      r.style.opacity = (0.7 * (1 - p)).toFixed(3);
    });
    requestAnimationFrame(pulse);
  }
})();
