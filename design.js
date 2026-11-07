/* =========================================================
   Дизайн давхарга: компонент чимэглэл + хөдөлгөөн.
   Контент, линк, логикт хүрэхгүй — зөвхөн харагдах байдал.
   Бүх хөдөлгөөн нэг rAF loop дахь damped spring-ээр явна.
   ========================================================= */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var SVGNS = "http://www.w3.org/2000/svg";
  var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduce = reduceMQ.matches;

  root.classList.add("has-js");

  // ---------------------------------------------------------
  // Туслах
  // ---------------------------------------------------------
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));
  }

  function svgEl(tag, attrs) {
    var el = doc.createElementNS(SVGNS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function rootPx() {
    return parseFloat(getComputedStyle(root).fontSize) || 16;
  }

  function hash(x, y, s) {
    var n = Math.sin(x * 127.1 + y * 311.7 + (s || 0) * 74.7) * 43758.5453;
    return n - Math.floor(n);
  }

  // ---------------------------------------------------------
  // Spring хөдөлгүүр (tension, friction, mass 1)
  // ---------------------------------------------------------
  var SPRING = {
    REVEAL: [90, 26], ITEM: [170, 24], SHEET: [190, 26], FIGURE: [200, 24],
    TYPE: [210, 24], YEAR: [190, 24], COPY: [110, 26], TRIGGER: [140, 30]
  };
  var springs = [];

  function spring(cfg, from, to, onUpdate, delay, onDone) {
    if (reduce) {
      onUpdate(to);
      if (onDone) onDone();
      return;
    }
    onUpdate(from);
    springs.push({
      k: cfg[0], c: cfg[1], x: from, v: 0, to: to,
      fn: onUpdate, done: onDone, at: performance.now() + (delay || 0)
    });
    wake();
  }

  function stepSprings(now, dt) {
    for (var i = springs.length - 1; i >= 0; i--) {
      var s = springs[i];
      if (now < s.at) continue;
      var n = Math.max(1, Math.ceil(dt / (1 / 240)));
      var h = dt / n;
      for (var j = 0; j < n; j++) {
        var a = -s.k * (s.x - s.to) - s.c * s.v;
        s.v += a * h;
        s.x += s.v * h;
      }
      if (Math.abs(s.v) < 0.001 && Math.abs(s.x - s.to) < 0.001) {
        s.fn(s.to);
        springs.splice(i, 1);
        if (s.done) s.done();
      } else {
        s.fn(s.x);
      }
    }
  }

  // ---------------------------------------------------------
  // Нэг rAF loop
  // ---------------------------------------------------------
  var running = false;
  var last = 0;
  var scrollDirty = true;

  function wake() {
    if (running || reduce) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(loop);
  }

  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    stepSprings(now, dt);
    if (scrollDirty) {
      scrollDirty = false;
      scrollWork();
    }
    var anyContour = contourWork(now, dt);
    if (springs.length || anyContour || scrollDirty) {
      requestAnimationFrame(loop);
    } else {
      running = false;
    }
  }

  window.addEventListener("scroll", function () { scrollDirty = true; wake(); }, { passive: true });
  window.addEventListener("resize", function () { scrollDirty = true; wake(); });

  // ---------------------------------------------------------
  // 1. Chamfer товч
  // ---------------------------------------------------------
  var CH_BODY = "M220 42L212.932 50H0V0H220V42Z";
  var CH_TICKS = "M205 49.5H213L219.5 42V36M212 0.5H219.5V7M8 0.5H0.5V7M7.5 49.5H0.5V42.5";
  var CH_ARROW = "M0 5.35H13M8 10.35L13 5.35L8 0.35";

  function chamfer(btn) {
    if (btn.classList.contains("is-chamfer")) return;
    btn.classList.add("is-chamfer");

    var label = doc.createElement("span");
    label.className = "btn__label";
    Array.prototype.slice.call(btn.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        if (n.textContent.trim()) {
          n.textContent = n.textContent.trim();
          label.appendChild(n);
        } else {
          btn.removeChild(n);
        }
      }
    });
    btn.insertBefore(label, btn.firstChild);

    var shape = svgEl("svg", {
      "class": "btn__shape", viewBox: "0 0 220 50", preserveAspectRatio: "none",
      "aria-hidden": "true", focusable: "false"
    });
    shape.appendChild(svgEl("path", { "class": "btn__body", d: CH_BODY }));
    shape.appendChild(svgEl("path", { "class": "btn__flood", d: CH_BODY }));
    shape.appendChild(svgEl("path", { "class": "btn__ring", d: CH_BODY }));
    shape.appendChild(svgEl("path", { "class": "btn__ticks", d: CH_TICKS }));
    btn.insertBefore(shape, btn.firstChild);

    var arrow = svgEl("svg", {
      "class": "btn__arrow", viewBox: "0 0 13.5 10.7", "aria-hidden": "true", focusable: "false"
    });
    arrow.appendChild(svgEl("path", { d: CH_ARROW }));
    btn.appendChild(arrow);
  }

  function inDark(el) {
    var s = el.closest("[data-surface]");
    return !!(s && s.getAttribute("data-surface") === "dark");
  }

  $$(".footer__legal > a").forEach(function (a) {
    a.classList.add("btn", "btn--hollow");
  });

  $$(".btn:not(.btn--link):not(.btn--sm)").forEach(function (btn) {
    if (inDark(btn)) btn.classList.add("btn--hollow");
    chamfer(btn);
  });

  // [ LABEL → ] — цэсний гол линк
  $$(".navbar__actions .btn--primary").forEach(function (a) {
    var text = a.textContent.trim();
    a.textContent = "";
    function mark(t) {
      var s = doc.createElement("span");
      s.className = "nav-cta__mark";
      s.setAttribute("aria-hidden", "true");
      s.textContent = t;
      return s;
    }
    a.appendChild(mark("["));
    a.appendChild(doc.createTextNode(text));
    a.appendChild(mark("→"));
    a.appendChild(mark("]"));
  });

  // ---------------------------------------------------------
  // 2. Bracket panel — 4 булангийн хүрээ
  // ---------------------------------------------------------
  function bracket(el, accent) {
    if (el.classList.contains("bracket")) return;
    el.classList.add("bracket");
    if (accent) el.classList.add("bracket--accent");
    ["tl", "tr", "bl", "br"].forEach(function (pos) {
      var s = svgEl("svg", {
        "class": "bracket__c bracket__c--" + pos, viewBox: "0 0 10.5 10.5",
        "aria-hidden": "true", focusable: "false"
      });
      s.appendChild(svgEl("path", { d: "M0 0.5H10V10.5" }));
      el.appendChild(s);
    });
  }

  $$(".card, .level, .criteria__item, .chapter, .strand__body, .feature__body, .mega-menu__categories, .ia-categories, .data-actions")
    .forEach(function (el) { bracket(el, false); });
  $$(".cta, .behind-list, .level:nth-child(4)").forEach(function (el) {
    el.classList.remove("bracket");
    $$(".bracket__c", el).forEach(function (c) { c.remove(); });
    bracket(el, true);
  });

  // ---------------------------------------------------------
  // 3. Шатлалтай булантай зургийн хавтан
  // ---------------------------------------------------------
  var PLATE_D = "M 0.01915,0.00107H 0.98085C 0.98574,0.00107 0.99044,0.00300 0.99390,0.00642C 0.99736,0.00984 0.99930,0.01449 0.99930,0.01933V 0.88815C 0.99930,0.89299 0.99736,0.89763 0.99390,0.90105C 0.99044,0.90448 0.98574,0.90640 0.98085,0.90640H 0.64733C 0.63864,0.90640 0.63007,0.90834 0.62224,0.91206C 0.61442,0.91579 0.60754,0.92122 0.60212,0.92794L 0.56153,0.97830C 0.55635,0.98474 0.54976,0.98993 0.54227,0.99350C 0.53478,0.99707 0.52656,0.99892 0.51825,0.99892H 0.01915C 0.01426,0.99892 0.00956,0.99700 0.00610,0.99358C 0.00264,0.99016 0.00070,0.98551 0.00070,0.98067V 0.01933C 0.00070,0.01449 0.00264,0.00984 0.00610,0.00642C 0.00956,0.00300 0.01426,0.00107 0.01915,0.00107Z";

  var defs = svgEl("svg", { width: "0", height: "0", "aria-hidden": "true", focusable: "false" });
  defs.style.position = "absolute";
  var clip = svgEl("clipPath", { id: "plate-clip", clipPathUnits: "objectBoundingBox" });
  clip.appendChild(svgEl("path", { d: PLATE_D }));
  defs.appendChild(clip);
  doc.body.insertBefore(defs, doc.body.firstChild);

  var plates = [];

  function plate(el, kind) {
    var host;
    var fill = doc.createElement("div");
    fill.className = "plate__fill";
    if (el.tagName === "IMG") {
      host = doc.createElement("div");
      host.className = "plate plate--" + kind;
      el.parentNode.insertBefore(host, el);
      fill.appendChild(el);
    } else {
      host = el;
      host.classList.add("plate");
      if (kind) host.classList.add("plate--" + kind);
      while (host.firstChild) fill.appendChild(host.firstChild);
    }
    host.appendChild(fill);
    var outline = svgEl("svg", {
      "class": "plate__outline", viewBox: "0 0 1 1", preserveAspectRatio: "none",
      "aria-hidden": "true", focusable: "false"
    });
    outline.appendChild(svgEl("path", { d: PLATE_D }));
    host.appendChild(outline);
    if (kind !== "contain") {
      var img = fill.querySelector("img:not(.lightbox__play)");
      if (img) plates.push({ host: host, img: img });
    }
  }

  $$(".product__image").forEach(function (img) { plate(img, "product"); });
  $$(".blog-item__image").forEach(function (img) { plate(img, "blog"); });
  $$(".lightbox").forEach(function (el) { plate(el, ""); });
  $$(".strand__media, .feature__media").forEach(function (el) { plate(el, "contain"); });

  // ---------------------------------------------------------
  // 4. Статистикийн самбар — тайрсан булантай accent хүрээ
  // ---------------------------------------------------------
  var ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(function (entries) {
    entries.forEach(function (e) {
      var fn = e.target.__onResize;
      if (fn) fn();
    });
  }) : null;

  $$(".stats > *, .summary__item").forEach(function (el) {
    el.classList.add("standings");
    var s = svgEl("svg", { "class": "standings__stroke", "aria-hidden": "true", focusable: "false" });
    var p = svgEl("path", {});
    s.appendChild(p);
    el.appendChild(s);
    function size() {
      var w = el.offsetWidth, h = el.offsetHeight;
      if (!w || !h) return;
      s.setAttribute("viewBox", "0 0 " + w + " " + h);
      p.setAttribute("d", "M0.5 0.5H" + (w - 0.5) + "V" + (h - 9) + "L" + (w - 9) + " " + (h - 0.5) + "H0.5Z");
    }
    el.__onResize = size;
    if (ro) ro.observe(el);
    size();
  });

  // ---------------------------------------------------------
  // 5. Burger → бүтэн дэлгэцийн sheet (<1280px)
  // ---------------------------------------------------------
  $$(".navbar").forEach(function (nav, n) {
    var header = nav.querySelector(".navbar__header");
    var links = nav.querySelector(".navbar__links");
    if (!header || !links) return;
    if (!links.id) links.id = "site-nav-" + n;

    var burger = doc.createElement("button");
    burger.type = "button";
    burger.className = "navbar__burger";
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-controls", links.id);
    var sr = doc.createElement("span");
    sr.className = "visually-hidden";
    sr.textContent = "Цэс";
    burger.appendChild(sr);
    for (var i = 0; i < 2; i++) {
      var line = doc.createElement("span");
      line.className = "navbar__burger-line";
      line.setAttribute("aria-hidden", "true");
      burger.appendChild(line);
    }
    header.appendChild(burger);

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      doc.body.style.overflow = open ? "hidden" : "";
      if (open) {
        Array.prototype.slice.call(links.children).forEach(function (item, idx) {
          spring(SPRING.SHEET, 0, 1, function (p) {
            item.style.opacity = p;
            item.style.transform = "translateY(" + ((1 - p) * 0.75) + "rem)";
          }, idx * 55, function () {
            item.style.opacity = "";
            item.style.transform = "";
          });
        });
      }
    }

    burger.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        burger.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1280 && nav.classList.contains("is-open")) setOpen(false);
    });
  });

  // ---------------------------------------------------------
  // 6. Contour (өндрийн шугам) арын фон — marching squares
  // ---------------------------------------------------------
  var LINE_SCALE = 3.8, LINE_COUNT = 2.5, WAVE_AMOUNT = 0.37, WAVE_SPEED = 1.66, LINE_OPACITY = 0.85, CELLS = 96;
  var contours = [];
  var lastContourDraw = 0;

  function field(x, y, t) {
    var f = Math.sin(x + t * 0.6) * 0.5;
    f += Math.sin(y * 0.85 - t * 0.45) * 0.45;
    f += Math.sin((x + y) * 0.65 + t * 0.35) * 0.35;
    f += Math.sin((x - y) * 0.95 - t * 0.55) * 0.25;
    return f * 0.5 + 0.5;
  }

  // Нүдний ирмэг: 0 дээд, 1 баруун, 2 доод, 3 зүүн
  var SEGMENTS = {
    1: [3, 2], 2: [2, 1], 3: [3, 1], 4: [0, 1], 5: [0, 3, 2, 1], 6: [0, 2], 7: [0, 3],
    8: [0, 3], 9: [0, 2], 10: [0, 1, 2, 3], 11: [0, 1], 12: [3, 1], 13: [2, 1], 14: [3, 2]
  };

  function drawContour(o) {
    var ctx = o.ctx, w = o.w, h = o.h;
    if (!w || !h) return;
    var cols = CELLS, cs = w / cols, rows = Math.ceil(h / cs);
    var stride = cols + 1;
    var size = stride * (rows + 1);
    if (!o.vals || o.vals.length !== size) o.vals = new Float32Array(size);
    var v = o.vals, t = o.t, k = (LINE_SCALE * 2) / cols;

    for (var j = 0; j <= rows; j++) {
      for (var i = 0; i <= cols; i++) {
        var x = i * k, y = j * k;
        var qx = x + Math.sin(y * 1.7 + t * 0.8) * WAVE_AMOUNT;
        var qy = y + Math.cos(x * 1.3 - t * 0.6) * WAVE_AMOUNT;
        v[j * stride + i] = field(qx, qy, t) * LINE_COUNT * 2;
      }
    }

    ctx.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = LINE_OPACITY;
    ctx.strokeStyle = o.color;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (var L = 0.5; L < LINE_COUNT * 2; L += 1) {
      for (var jj = 0; jj < rows; jj++) {
        for (var ii = 0; ii < cols; ii++) {
          var a = v[jj * stride + ii], b = v[jj * stride + ii + 1];
          var c = v[(jj + 1) * stride + ii + 1], d = v[(jj + 1) * stride + ii];
          var idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
          var seg = SEGMENTS[idx];
          if (!seg) continue;
          for (var s = 0; s < seg.length; s += 2) {
            var p1 = edgePoint(seg[s], ii, jj, a, b, c, d, L);
            var p2 = edgePoint(seg[s + 1], ii, jj, a, b, c, d, L);
            ctx.moveTo(p1[0] * cs, p1[1] * cs);
            ctx.lineTo(p2[0] * cs, p2[1] * cs);
          }
        }
      }
    }
    ctx.stroke();
  }

  function edgePoint(e, i, j, a, b, c, d, L) {
    if (e === 0) return [i + (L - a) / (b - a), j];
    if (e === 1) return [i + 1, j + (L - b) / (c - b)];
    if (e === 2) return [i + (L - d) / (c - d), j + 1];
    return [i, j + (L - a) / (d - a)];
  }

  function sizeCanvas(o) {
    o.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    o.w = o.c.offsetWidth;
    o.h = o.c.offsetHeight;
    o.c.width = Math.round(o.w * o.dpr);
    o.c.height = Math.round(o.h * o.dpr);
  }

  function addContour(host) {
    var c = doc.createElement("canvas");
    c.className = "fx-contour";
    c.setAttribute("aria-hidden", "true");
    host.insertBefore(c, host.firstChild);
    host.classList.add("fx-host");
    var o = {
      host: host, c: c, ctx: c.getContext("2d"), w: 0, h: 0, dpr: 1,
      t: hash(contours.length, 3) * 20, visible: false,
      color: getComputedStyle(host).getPropertyValue("--s-contour").trim() || "transparent"
    };
    contours.push(o);
    host.__onResize = function () { sizeCanvas(o); drawContour(o); };
    sizeCanvas(o);
    drawContour(o);
    if (ro) ro.observe(host);
    return o;
  }

  var contourIO = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      contours.forEach(function (o) { if (o.host === e.target) o.visible = e.isIntersecting; });
    });
    wake();
  }) : null;

  function contourWork(now, dt) {
    var any = false;
    var draw = now - lastContourDraw >= 24;
    contours.forEach(function (o) {
      if (!o.visible) return;
      any = true;
      o.t += dt * WAVE_SPEED * 0.25;
      if (draw) drawContour(o);
    });
    if (draw) lastContourDraw = now;
    return any;
  }

  var photoSections = ".hero, .layout-67, .math-hero";
  $$("main [data-surface], .mega-menu[data-surface]").forEach(function (el) {
    if (el.matches(photoSections)) return;
    var o = addContour(el);
    if (contourIO) contourIO.observe(el);
    else o.visible = true;
  });
  $$(".footer__container").forEach(function (el) {
    el.style.setProperty("--s-contour", "var(--contour-dark)");
    var o = addContour(el);
    if (contourIO) contourIO.observe(el);
    else o.visible = true;
  });

  // ---------------------------------------------------------
  // 7. Шатрын даам маягийн шилжилт (цайвар → харанхуй)
  // ---------------------------------------------------------
  var CELL = 24, SOLID_UNTIL = 0.16, LIFT = 2, ACCENT_SHARE = 0.06;
  var seams = [];
  var accentColor = getComputedStyle(root).getPropertyValue("--accent").trim();

  function drawSeam(o, p) {
    var ctx = o.ctx, w = o.w, h = o.h;
    ctx.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var cols = Math.ceil(w / CELL), rows = Math.max(2, Math.ceil(h / CELL));
    for (var y = 0; y < rows; y++) {
      var depth = y / (rows - 1) + p * LIFT;
      if (depth >= 1) break;
      if (depth <= SOLID_UNTIL) {
        ctx.fillStyle = o.color;
        ctx.fillRect(0, y * CELL, w, CELL);
        continue;
      }
      var fade = (depth - SOLID_UNTIL) / (1 - SOLID_UNTIL);
      for (var x = 0; x < cols; x++) {
        if ((x + y) % 2 !== 0) continue;
        if (hash(x, y, 1) <= fade) continue;
        ctx.fillStyle = hash(x, y, 2) < ACCENT_SHARE ? accentColor : o.color;
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }
  }

  if (!reduce) {
    var surfaces = $$("[data-surface]");
    surfaces.forEach(function (el, i) {
      if (i === 0 || el.getAttribute("data-surface") !== "dark") return;
      var prev = surfaces[i - 1];
      if (prev.getAttribute("data-surface") === "dark") return;
      var c = doc.createElement("canvas");
      c.className = "fx-seam";
      c.setAttribute("aria-hidden", "true");
      el.insertBefore(c, el.firstChild);
      el.classList.add("fx-host");
      var o = {
        host: el, c: c, ctx: c.getContext("2d"), w: 0, h: 0, dpr: 1, p: -1,
        color: getComputedStyle(prev).getPropertyValue("--s-bg").trim()
      };
      seams.push(o);
    });
  }

  // ---------------------------------------------------------
  // 8. Sticky stack
  // ---------------------------------------------------------
  var stacks = [];
  if (!reduce) {
    $$("[data-stack]").forEach(function (section) {
      var wrap = doc.createElement("div");
      wrap.className = "fx-stack";
      section.parentNode.insertBefore(wrap, section);
      wrap.appendChild(section);
      stacks.push({ wrap: wrap, inner: section });
    });
  }

  // ---------------------------------------------------------
  // 9. Parallax давхарга (top-оор)
  // ---------------------------------------------------------
  var layers = $$(".hero > .hero__bg, .layout-67 > .bg-cover, .math-hero > .bg-cover").map(function (img) {
    return { el: img, host: img.parentNode, range: 60 };
  });

  // ---------------------------------------------------------
  // Scroll-оор хөтлөгдөх бүх ажил
  // ---------------------------------------------------------
  function scrollWork() {
    var vh = window.innerHeight;
    var scale = rootPx() / 16;
    var mobile = window.innerWidth < 768;

    stacks.forEach(function (s) {
      var hgt = s.wrap.offsetHeight;
      var top = Math.min(0, vh - hgt);
      s.wrap.style.top = top + "px";
      s.wrap.style.setProperty("--stack-origin", (-top + vh / 2) + "px");
      var next = s.wrap.nextElementSibling;
      var p = 0;
      if (next) p = clamp((vh - next.getBoundingClientRect().top) / vh, 0, 1);
      s.inner.style.transform = mobile || p === 0 ? "" : "scale(" + (1 - 0.1 * p) + ")";
      s.wrap.style.setProperty("--shade", (0.55 * p).toFixed(3));
    });

    layers.forEach(function (l) {
      var r = l.host.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      var R = l.range * scale;
      l.el.style.top = (-R - (p - 0.5) * 2 * R) + "px";
    });

    plates.forEach(function (pl) {
      var r = pl.host.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      pl.img.style.top = (-p * 10).toFixed(2) + "%";
    });

    seams.forEach(function (o) {
      var r = o.host.getBoundingClientRect();
      if (r.top > vh || r.bottom < 0) return;
      if (Math.abs(o.c.offsetWidth - o.w) > 1 || Math.abs(o.c.offsetHeight - o.h) > 1) {
        sizeCanvas(o);
        o.p = -1;
      }
      var p = clamp((vh - r.top) / vh, 0, 1);
      if (Math.abs(p - o.p) < 0.002) return;
      o.p = p;
      drawSeam(o, p);
    });
  }

  // ---------------------------------------------------------
  // 10. Reveal — блок, гарчгийн үг, тооны үсэг
  // ---------------------------------------------------------
  function splitText(el, mode) {
    var text = el.textContent.replace(/\s+/g, " ").trim();
    if (!text) return [];
    el.textContent = "";
    var sr = doc.createElement("span");
    sr.className = "visually-hidden";
    sr.textContent = text;
    var vis = doc.createElement("span");
    vis.setAttribute("aria-hidden", "true");
    var units = [];
    if (mode === "words") {
      var words = text.split(" ");
      var breakAt = words.length > 1 ? Math.ceil(words.length / 2) : -1;
      words.forEach(function (w, i) {
        if (i > 0) vis.appendChild(i === breakAt ? doc.createElement("br") : doc.createTextNode(" "));
        var s = doc.createElement("span");
        s.className = "split__unit";
        s.textContent = w;
        vis.appendChild(s);
        units.push(s);
      });
    } else {
      text.split("").forEach(function (ch) {
        var s = doc.createElement("span");
        s.className = "split__unit";
        s.textContent = ch === " " ? " " : ch;
        vis.appendChild(s);
        units.push(s);
      });
    }
    el.appendChild(sr);
    el.appendChild(vis);
    return units;
  }

  var BLOCKS = [
    ".tagline", ".section-title__body > p", ".hero__text > p", ".math-hero__lead",
    ".stats > *", ".summary__item", ".actions", ".hero__actions", ".lightbox",
    ".product", ".strand", ".level", ".criteria__item", ".chapter", ".card",
    ".feature", ".blog-item", ".book__cover", ".cta", ".check-list li",
    ".layout-67__col--right > p", ".mega-menu__categories", ".ia-categories",
    ".data-actions", ".products__title > .btn", ".subnav__inner", ".child-study__title"
  ].join(",");

  var revealQueue = [];
  var revealTimer = 0;

  function prepare() {
    if (reduce || typeof IntersectionObserver === "undefined") return;

    var items = [];

    $$("h1.h1, h1.h2, h2.h2").forEach(function (el) {
      var units = splitText(el, "words");
      if (!units.length) return;
      units.forEach(function (u) { u.style.opacity = "0"; u.style.transform = "translateY(.35em)"; });
      el.style.setProperty("--dash", "0");
      items.push({ el: el, kind: "words", units: units });
    });

    $$(".stats > * > .h2").forEach(function (el) {
      var units = splitText(el, "letters");
      units.forEach(function (u) { u.style.opacity = "0"; u.style.transform = "translateY(.3em)"; });
      items.push({ el: el, kind: "letters", units: units });
    });

    var blocks = $$(BLOCKS);
    blocks = blocks.filter(function (el) {
      var p = el.parentElement;
      while (p) {
        if (blocks.indexOf(p) !== -1) return false;
        p = p.parentElement;
      }
      return true;
    });
    blocks.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(.75rem)";
      items.push({ el: el, kind: "block" });
    });

    var map = new Map();
    items.forEach(function (it) { map.set(it.el, it); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        revealQueue.push(map.get(e.target));
      });
      if (!revealTimer) revealTimer = requestAnimationFrame(flushReveal);
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.12 });

    items.forEach(function (it) { io.observe(it.el); });
  }

  function flushReveal() {
    revealTimer = 0;
    var batch = revealQueue.splice(0).sort(function (a, b) {
      return a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    var perSection = new Map();
    batch.forEach(function (it) {
      var sec = it.el.closest("section, header, footer, nav, main") || doc.body;
      var n = perSection.get(sec) || 0;
      perSection.set(sec, n + 1);
      var delay = n * 110;

      if (it.kind === "block") {
        spring(SPRING.REVEAL, 0, 1, function (p) {
          it.el.style.opacity = clamp(p, 0, 1);
          it.el.style.transform = "translateY(" + ((1 - p) * 0.75) + "rem)";
        }, delay, function () {
          it.el.style.opacity = "";
          it.el.style.transform = "";
        });
      } else {
        var cfg = it.kind === "words" ? SPRING.TYPE : SPRING.FIGURE;
        var step = it.kind === "words" ? 110 : 24;
        it.units.forEach(function (u, i) {
          spring(cfg, 0, 1, function (p) {
            u.style.opacity = clamp(p, 0, 1);
            u.style.transform = "translateY(" + ((1 - p) * (it.kind === "words" ? 0.35 : 0.3)) + "em)";
          }, delay + i * step, function () {
            u.style.opacity = "";
            u.style.transform = "";
          });
        });
        if (it.kind === "words") {
          spring(SPRING.REVEAL, 0, 1, function (p) {
            it.el.style.setProperty("--dash", clamp(p, 0, 1).toFixed(3));
          }, delay + it.units.length * step, function () {
            it.el.style.removeProperty("--dash");
          });
        }
      }
    });
  }

  prepare();

  // ---------------------------------------------------------
  // Эхлүүлэх
  // ---------------------------------------------------------
  if (reduce) {
    // Хөдөлгөөнгүй: contour-ыг нэг удаа зурж, эцсийн төлөвт үлдээнэ.
    contours.forEach(drawContour);
  } else {
    scrollWork();
    wake();
  }

  reduceMQ.addEventListener && reduceMQ.addEventListener("change", function (e) {
    reduce = e.matches;
    if (!reduce) wake();
  });
})();
