/* Интерактив даалгавар — ганцаарчилсан, хосоор, багаар.
   Хоцрогдол арилгах дадлага (7-р анги, математик). */
(function () {
  "use strict";

  var PASS = 4; // 5-аас 4 — сайтын "Хоцрогдлыг тооцох" дүрэмтэй ижил

  // =========================================================
  // Өгөгдөл
  // =========================================================
  var SOLO = [
    {
      id: "integers", title: "Бүхэл тоо", icon: "±",
      items: [
        { q: "(−7) + 12 = ?", type: "num", answer: 5, k: "Журам", b: "Хэрэглэх",
          hints: ["Тэмдэг өөр хоёр тоог нэмэхдээ модулийн ихээс багыг хасна.", "12 − 7 = 5. Модуль нь их тоо (12) эерэг тул хариу эерэг."],
          sol: "(−7) + 12 = 12 − 7 = 5" },
        { q: "(−3) − 8 = ?", type: "num", answer: -11, k: "Журам", b: "Хэрэглэх",
          hints: ["Тоо хасах нь эсрэг тоог нэмэхтэй адил.", "(−3) − 8 = (−3) + (−8). Ижил тэмдэгтэй тоог нэмэхэд модулийг нэмээд тэмдгийг хадгална."],
          sol: "(−3) + (−8) = −11" },
        { q: "(−5) · 4 = ?", type: "num", answer: -20, k: "Журам", b: "Хэрэглэх",
          hints: ["Эхлээд модулиудыг үржүүл: 5 · 4.", "Тэмдэг өөр хоёр тооны үржвэр сөрөг."],
          sol: "5 · 4 = 20, тэмдэг өөр тул −20" },
        { q: "(−36) : (−9) = ?", type: "num", answer: 4, k: "Журам", b: "Хэрэглэх",
          hints: ["36 : 9 хэд вэ?", "Ижил тэмдэгтэй хоёр тооны ноогдвор эерэг."],
          sol: "36 : 9 = 4, хоёулаа сөрөг тул +4" },
        { q: "Өглөө агаарын температур −6°C байв. Өдөр 9°C-аар дулаарав. Өдрийн температур хэд вэ?", type: "num", answer: 3, unit: "°C", k: "Ойлголт", b: "Хэрэглэх",
          hints: ["Дулаарах нь нэмэх үйлдэл: −6 + 9.", "Тооны шулуун дээр −6-аас баруун тийш 9 алх."],
          sol: "−6 + 9 = 3°C" }
      ]
    },
    {
      id: "fractions", title: "Бутархай ба хувь", icon: "½",
      items: [
        { q: "1/2 + 1/3 = ?  (бутархайгаар бич, жишээ: 3/4)", type: "frac", answer: [5, 6], k: "Журам", b: "Хэрэглэх",
          hints: ["Ерөнхий хуваарь олно: 2 ба 3-ын хамгийн бага ерөнхий хуваагдагч 6.", "1/2 = 3/6, 1/3 = 2/6. Хүртвэрүүдийг нэм."],
          sol: "3/6 + 2/6 = 5/6" },
        { q: "3/4 − 1/6 = ?  (бутархайгаар бич)", type: "frac", answer: [7, 12], k: "Журам", b: "Хэрэглэх",
          hints: ["4 ба 6-гийн ерөнхий хуваарь 12.", "3/4 = 9/12, 1/6 = 2/12."],
          sol: "9/12 − 2/12 = 7/12" },
        { q: "15-ын 2/5 хэд вэ?", type: "num", answer: 6, k: "Ойлголт", b: "Хэрэглэх",
          hints: ["Тооны бутархайг олохдоо тоог бутархайгаар үржүүлнэ.", "15 : 5 = 3 нь 1/5; 2/5 нь 2 · 3."],
          sol: "15 · 2/5 = 30/5 = 6" },
        { q: "80-ийн 25% хэд вэ?", type: "num", answer: 20, k: "Журам", b: "Хэрэглэх",
          hints: ["25% = 25/100 = 1/4.", "80-ийн 1/4 = 80 : 4."],
          sol: "80 · 0,25 = 20" },
        { q: "1200₮-ийн бараа 15% хямдарвал хэдэн төгрөг болох вэ?", type: "num", answer: 1020, unit: "₮", k: "Ойлголт", b: "Хэрэглэх",
          hints: ["Эхлээд хямдралын хэмжээг ол: 1200-ийн 15%.", "1200 · 0,15 = 180. Анхны үнээс хас."],
          sol: "1200 − 180 = 1020₮ (эсвэл 1200 · 0,85)" }
      ]
    },
    {
      id: "equations", title: "Тэгшитгэл", icon: "x",
      items: [
        { q: "x + 7 = 15. x = ?", type: "num", answer: 8, k: "Журам", b: "Хэрэглэх",
          hints: ["Тэнцүүгийн хоёр талаас 7-г хас.", "x = 15 − 7."],
          sol: "x = 8" },
        { q: "4x = 28. x = ?", type: "num", answer: 7, k: "Журам", b: "Хэрэглэх",
          hints: ["Хоёр талыг 4-т хуваа.", "x = 28 : 4."],
          sol: "x = 7" },
        { q: "2x − 5 = 9. x = ?", type: "num", answer: 7, k: "Журам", b: "Хэрэглэх",
          hints: ["Эхлээд хоёр талд 5 нэм: 2x = 14.", "Дараа нь 2-т хуваа."],
          sol: "2x = 14 → x = 7" },
        { q: "5x + 3 = 2x + 18. x = ?", type: "num", answer: 5, k: "Журам", b: "Хэрэглэх",
          hints: ["Үл мэдэгдэгчтэй гишүүдийг нэг тал руу шилжүүл: 5x − 2x.", "3x = 18 − 3 = 15."],
          sol: "3x = 15 → x = 5" },
        { q: "Сурагч 3(x − 2) = 12-ыг ингэж бодсон: (1) 3x − 2 = 12  (2) 3x = 14  (3) x = 14/3. Аль алхамд алдаа гарсан бэ?", type: "choice",
          choices: ["1-р алхам", "2-р алхам", "3-р алхам", "Алдаагүй"], answer: 0, k: "Журам", b: "Үнэлэх",
          hints: ["Хаалт задлахдаа хаалтан доторх гишүүн бүрийг үржүүлдэг үү?", "3 · (−2) = −6 байх ёстой."],
          sol: "1-р алхам буруу: 3x − 6 = 12 → 3x = 18 → x = 6" }
      ]
    },
    {
      id: "geometry", title: "Өнцөг ба талбай", icon: "△",
      items: [
        { q: "Гурвалжны хоёр өнцөг 45° ба 65°. Гурав дахь өнцөг хэд вэ?", type: "num", answer: 70, unit: "°", k: "Баримт", b: "Хэрэглэх",
          hints: ["Гурвалжны өнцгүүдийн нийлбэр хэд вэ?", "180° − 45° − 65°."],
          sol: "180 − 45 − 65 = 70°" },
        { q: "Зэргэлдээ хоёр өнцгийн нэг нь 112°. Нөгөө нь хэд вэ?", type: "num", answer: 68, unit: "°", k: "Баримт", b: "Хэрэглэх",
          hints: ["Зэргэлдээ өнцгүүд дэлгэмэл өнцөг үүсгэдэг.", "180° − 112°."],
          sol: "180 − 112 = 68°" },
        { q: "Тэгш өнцөгтийн урт 9 см, өргөн 4 см. Талбай нь хэд вэ?", type: "num", answer: 36, unit: "см²", k: "Баримт", b: "Хэрэглэх",
          hints: ["Тэгш өнцөгтийн талбай = урт · өргөн.", "9 · 4."],
          sol: "S = 9 · 4 = 36 см²" },
        { q: "Мөн тэр тэгш өнцөгтийн периметр хэд вэ?", type: "num", answer: 26, unit: "см", k: "Ойлголт", b: "Ойлгох",
          hints: ["Периметр нь бүх талын уртын нийлбэр — талбай биш.", "P = 2 · (9 + 4)."],
          sol: "P = 2 · 13 = 26 см" },
        { q: "Гурвалжны суурь 12 см, өндөр 5 см. Талбай нь хэд вэ?", type: "num", answer: 30, unit: "см²", k: "Баримт", b: "Хэрэглэх",
          hints: ["Гурвалжны талбай = (суурь · өндөр) / 2.", "12 · 5 = 60, хоёрт хуваа."],
          sol: "S = 60 / 2 = 30 см²" }
      ]
    }
  ];

  var PAIR = [
    { topic: "Энгийн бутархай нэмэх",
      A: { q: "2/3 + 1/6 = ?", answer: [5, 6], type: "frac", sol: "4/6 + 1/6 = 5/6" },
      B: { q: "3/4 + 1/8 = ?", answer: [7, 8], type: "frac", sol: "6/8 + 1/8 = 7/8" },
      check: ["Ерөнхий хуваарийг зөв олсон уу?", "Хүртвэрийг хуваарьтай нь ижил тоогоор үржүүлсэн үү?", "Хариугаа хураасан уу?"] },
    { topic: "Тооны хувь",
      A: { q: "60-ийн 30% хэд вэ?", answer: 18, type: "num", sol: "60 · 0,3 = 18" },
      B: { q: "150-ийн 40% хэд вэ?", answer: 60, type: "num", sol: "150 · 0,4 = 60" },
      check: ["Хувийг аравтын бутархай эсвэл бутархай болгосон уу?", "Үржүүлэлтээ шалгасан уу?", "Хариу утгатай юу (тооноос бага уу)?"] },
    { topic: "Пропорц",
      A: { q: "3 дэвтэр 1800₮. 5 дэвтэр хэдэн төгрөг вэ?", answer: 3000, type: "num", unit: "₮", sol: "1 дэвтэр 600₮ → 5 · 600 = 3000₮" },
      B: { q: "4 харандаа 1000₮. 7 харандаа хэдэн төгрөг вэ?", answer: 1750, type: "num", unit: "₮", sol: "1 харандаа 250₮ → 7 · 250 = 1750₮" },
      check: ["Нэг ширхэгийн үнийг олсон уу?", "Шууд пропорц гэдгийг тайлбарласан уу?", "Хариуны нэгжийг (₮) бичсэн үү?"] },
    { topic: "Шугаман тэгшитгэл",
      A: { q: "3x + 4 = 19. x = ?", answer: 5, type: "num", sol: "3x = 15 → x = 5" },
      B: { q: "5x − 6 = 24. x = ?", answer: 6, type: "num", sol: "5x = 30 → x = 6" },
      check: ["Хоёр талд ижил үйлдэл хийсэн үү?", "Алхам бүрийг чангаар тайлбарласан уу?", "Олсон утгаа орлуулж шалгасан уу?"] },
    { topic: "Арифметик дундаж",
      A: { q: "5, 8, 6, 9, 7 тоонуудын дундаж хэд вэ?", answer: 7, type: "num", sol: "35 : 5 = 7" },
      B: { q: "10, 12, 8, 14, 11 тоонуудын дундаж хэд вэ?", answer: 11, type: "num", sol: "55 : 5 = 11" },
      check: ["Бүх тоог нэмсэн үү (алгасаагүй)?", "Тооны тоонд (5) хуваасан уу?", "Дундаж хамгийн бага ба их тооны хооронд байна уу?"] }
  ];

  var STATIONS = [
    { title: "1-р станц · Бүхэл тоо", q: "Сансрын станцын агаар −18°C байв. Халаагуур 25°C-аар дулаацуулав. Одоо хэдэн градус вэ?", answer: 7, unit: "°C",
      hint: "−18 + 25-ыг тооны шулуун дээр төсөөл." },
    { title: "2-р станц · Пропорц", q: "Газрын зургийн масштаб 1 : 50 000. Зураг дээрх 4 см бодит амьдралд хэдэн км вэ?", answer: 2, unit: "км",
      hint: "4 · 50 000 = 200 000 см. 1 км = 100 000 см." },
    { title: "3-р станц · Тэгшитгэл", q: "Дараалсан гурван натурал тооны нийлбэр 24. Хамгийн бага нь аль вэ?", answer: 7, unit: "",
      hint: "Тоонуудыг x, x + 1, x + 2 гэж тэмдэглэ: 3x + 3 = 24." },
    { title: "4-р станц · Статистик", q: "5 сурагчийн оноо: 6, 9, 9, 4, ?. Дундаж нь 7 бол үл мэдэгдэх оноо хэд вэ?", answer: 7, unit: "",
      hint: "Дундаж 7 бол 5 онооны нийлбэр 35 байна. Мэдэгдэж буй 4-ийн нийлбэрийг хас." }
  ];

  var ROLES = [
    { name: "Уншигч", task: "Бодлогыг чангаар уншиж, өгөгдсөн ба олох зүйлийг тодруулна." },
    { name: "Бодогч", task: "Багийн санааг нэгтгэж бодолтыг бичнэ." },
    { name: "Шалгагч", task: "Хариуг орлуулж эсвэл өөр аргаар шалгана." },
    { name: "Илтгэгч", task: "Цагийг хянаж, эцэст нь багийн стратегийг ангид танилцуулна." }
  ];

  // =========================================================
  // Туслах
  // =========================================================
  function $(id) { return document.getElementById(id); }

  function el(tag, props, children) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        if (k === "text") node.textContent = props[k];
        else if (k === "className") node.className = props[k];
        else if (k === "hidden") node.hidden = props[k];
        else node.setAttribute(k, props[k]);
      });
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = b; b = a % b; a = t; }
    return a;
  }

  function normalize(s) {
    return String(s).trim().replace(/\s+/g, "").replace(/[−–]/g, "-").replace(",", ".");
  }

  // Хариу шалгах: "ok" | "unreduced" | "wrong" | "empty"
  function judge(item, raw) {
    var s = normalize(raw);
    if (!s) return "empty";
    if (item.type === "frac") {
      var m = s.match(/^(-?\d+)\/(-?\d+)$/);
      if (!m || Number(m[2]) === 0) return "wrong";
      var n = Number(m[1]), d = Number(m[2]);
      if (n * item.answer[1] !== d * item.answer[0]) return "wrong";
      return gcd(n, d) === 1 ? "ok" : "unreduced";
    }
    if (!/^-?\d+(\.\d+)?$/.test(s)) return "wrong";
    return Math.abs(Number(s) - item.answer) < 1e-9 ? "ok" : "wrong";
  }

  function answerText(item) {
    if (item.type === "frac") return item.answer[0] + "/" + item.answer[1];
    if (item.type === "choice") return item.choices[item.answer];
    return String(item.answer).replace("-", "−") + (item.unit ? " " + item.unit : "");
  }

  function tag(k, b) {
    return el("span", { className: "tag", text: k + " × " + b });
  }

  // Цаг хэмжигч
  function makeTimer(root, seconds, label) {
    var left = seconds, id = null;
    var display = el("span", { className: "timer__time", text: fmt(left) });
    var start = el("button", { type: "button", className: "btn btn--primary btn--sm", text: "Эхлүүлэх" });
    var reset = el("button", { type: "button", className: "btn btn--secondary btn--sm", text: "Шинэчлэх" });
    var status = el("span", { className: "visually-hidden", role: "status" });
    var box = el("div", { className: "timer" }, [
      el("span", { className: "timer__label", text: label }), display, start, reset, status
    ]);
    root.innerHTML = "";
    root.appendChild(box);

    function fmt(s) {
      var m = Math.floor(s / 60), r = s % 60;
      return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r;
    }
    function stop() {
      if (id) clearInterval(id);
      id = null;
      start.textContent = "Эхлүүлэх";
    }
    function tick() {
      left -= 1;
      display.textContent = fmt(Math.max(0, left));
      if (left <= 0) {
        stop();
        box.classList.add("is-done");
        status.textContent = label + ": хугацаа дууслаа";
      }
    }
    start.addEventListener("click", function () {
      if (id) { stop(); start.textContent = "Үргэлжлүүлэх"; return; }
      if (left <= 0) return;
      id = setInterval(tick, 1000);
      start.textContent = "Түр зогсоох";
    });
    function doReset() {
      stop();
      left = seconds;
      display.textContent = fmt(left);
      box.classList.remove("is-done");
      status.textContent = "";
    }
    reset.addEventListener("click", doReset);
    return { reset: doReset };
  }

  // Хариу оруулах талбар (тоо, бутархай, сонголт)
  function answerField(item, idPrefix) {
    if (item.type === "choice") {
      var fs = el("fieldset", { className: "choices" }, [el("legend", { className: "visually-hidden", text: "Хариу сонгох" })]);
      item.choices.forEach(function (c, i) {
        var input = el("input", { type: "radio", name: idPrefix, value: String(i) });
        fs.appendChild(el("label", { className: "choice" }, [input, el("span", { text: c })]));
      });
      return { node: fs, value: function () {
        var checked = fs.querySelector("input:checked");
        return checked ? checked.value : "";
      }, focus: function () { var f = fs.querySelector("input"); if (f) f.focus(); },
        disable: function () { Array.prototype.forEach.call(fs.querySelectorAll("input"), function (x) { x.disabled = true; }); } };
    }
    var input = el("input", {
      type: "text", id: idPrefix, autocomplete: "off",
      inputmode: item.type === "frac" ? "text" : "decimal",
      placeholder: item.type === "frac" ? "жишээ: 3/4" : "Хариу"
    });
    var wrap = el("label", { className: "answer", for: idPrefix }, [
      el("span", { className: "visually-hidden", text: "Хариу" }), input,
      item.unit ? el("span", { className: "answer__unit", text: item.unit }) : null
    ]);
    return { node: wrap, value: function () { return input.value; }, focus: function () { input.focus(); },
      disable: function () { input.disabled = true; } };
  }

  function judgeAny(item, raw) {
    if (item.type === "choice") {
      if (raw === "") return "empty";
      return Number(raw) === item.answer ? "ok" : "wrong";
    }
    return judge(item, raw);
  }

  // =========================================================
  // Табууд
  // =========================================================
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.task-tabs [role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      $(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  // =========================================================
  // 1. Ганцаарчилсан
  // =========================================================
  var soloTopics = $("solo-topics");
  var soloArea = $("solo-area");
  var solo = null;

  SOLO.forEach(function (topic) {
    var b = el("button", { type: "button", className: "topic", "aria-pressed": "false" }, [
      el("span", { className: "topic__icon", "aria-hidden": "true", text: topic.icon }),
      el("span", { text: topic.title })
    ]);
    b.addEventListener("click", function () { startSolo(topic, b); });
    soloTopics.appendChild(b);
  });
  soloArea.appendChild(el("p", { className: "task-note", text: "Дээрээс сэдвээ сонгоно уу." }));

  function startSolo(topic, button) {
    Array.prototype.forEach.call(soloTopics.children, function (x) {
      x.setAttribute("aria-pressed", x === button ? "true" : "false");
    });
    solo = { topic: topic, idx: 0, results: [] };
    renderSolo();
  }

  function renderSolo() {
    var topic = solo.topic, item = topic.items[solo.idx];
    var hintsShown = 0, attempts = 0, done = false;
    soloArea.innerHTML = "";

    var progress = el("div", { className: "progress" }, [
      el("span", { text: topic.title + " · " + (solo.idx + 1) + " / " + topic.items.length }),
      el("span", { className: "progress__bar", "aria-hidden": "true" }, [
        el("span", { style: "width:" + ((solo.idx) / topic.items.length * 100) + "%" })
      ])
    ]);

    var field = answerField(item, "solo-" + topic.id + "-" + solo.idx);
    var feedback = el("p", { className: "feedback", role: "status" });
    var hintBox = el("ul", { className: "hints" });
    var checkBtn = el("button", { type: "submit", className: "btn btn--primary", text: "Шалгах" });
    var hintBtn = el("button", { type: "button", className: "btn btn--secondary", text: "Зөвлөгөө (" + item.hints.length + ")" });
    var nextBtn = el("button", { type: "button", className: "btn btn--primary", text: solo.idx + 1 < topic.items.length ? "Дараагийн даалгавар →" : "Дүн харах →", hidden: true });

    var form = el("form", { className: "solo-card", autocomplete: "off" }, [
      el("div", { className: "solo-card__tags" }, [tag(item.k, item.b)]),
      el("p", { className: "solo-card__q", text: item.q }),
      field.node,
      el("div", { className: "actions" }, [checkBtn, hintBtn, nextBtn]),
      feedback,
      hintBox
    ]);

    hintBtn.addEventListener("click", function () {
      if (hintsShown >= item.hints.length) return;
      hintBox.appendChild(el("li", { text: "💡 " + item.hints[hintsShown] }));
      hintsShown += 1;
      hintBtn.textContent = hintsShown < item.hints.length ? "Дахин зөвлөгөө (" + (item.hints.length - hintsShown) + ")" : "Зөвлөгөө дууссан";
      if (hintsShown >= item.hints.length) hintBtn.disabled = true;
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (done) return;
      var r = judgeAny(item, field.value());
      if (r === "empty") { feedback.textContent = "Хариугаа оруулна уу."; feedback.className = "feedback"; return; }
      if (r === "unreduced") { feedback.textContent = "Утга нь зөв, гэхдээ бутархайгаа хураагаарай."; feedback.className = "feedback feedback--warn"; return; }
      attempts += 1;
      if (r === "ok") {
        finish(true);
      } else if (attempts >= 2) {
        finish(false);
      } else {
        feedback.textContent = "Буруу байна. Дахин нэг оролд эсвэл зөвлөгөө ав.";
        feedback.className = "feedback feedback--bad";
      }
    });

    function finish(correct) {
      done = true;
      // Анхны оролдлогоор, зөвлөгөөгүй зөв бол бүтэн оноо
      var clean = correct && attempts === 1 && hintsShown === 0;
      solo.results.push({ item: item, correct: correct, clean: clean });
      field.disable();
      checkBtn.disabled = true;
      hintBtn.disabled = true;
      feedback.className = "feedback " + (correct ? "feedback--ok" : "feedback--bad");
      feedback.textContent = (correct ? "Зөв! " : "Зөв хариу: " + answerText(item) + ". ") + "Бодолт: " + item.sol;
      nextBtn.hidden = false;
      nextBtn.focus();
    }

    nextBtn.addEventListener("click", function () {
      solo.idx += 1;
      if (solo.idx < topic.items.length) renderSolo();
      else renderSoloSummary();
    });

    soloArea.appendChild(progress);
    soloArea.appendChild(form);
    field.focus();
  }

  function renderSoloSummary() {
    var topic = solo.topic;
    var correct = solo.results.filter(function (r) { return r.correct; }).length;
    var clean = solo.results.filter(function (r) { return r.clean; }).length;
    var passed = correct >= PASS;
    soloArea.innerHTML = "";

    var list = el("ul", { className: "summary-list" });
    solo.results.forEach(function (r, i) {
      list.appendChild(el("li", { className: r.correct ? "is-ok" : "is-bad" }, [
        el("span", { className: "summary-list__mark", "aria-hidden": "true", text: r.correct ? "✓" : "✗" }),
        el("span", { text: (i + 1) + ". " + r.item.q }),
        el("span", { className: "visually-hidden", text: r.correct ? " — зөв" : " — буруу" }),
        r.correct ? null : el("small", { text: "Бодолт: " + r.item.sol })
      ]));
    });

    var retry = el("button", { type: "button", className: "btn btn--secondary", text: "Дахин бодох" });
    retry.addEventListener("click", function () { solo.idx = 0; solo.results = []; renderSolo(); });

    soloArea.appendChild(el("div", { className: "solo-card result " + (passed ? "result--ok" : "result--bad") }, [
      el("p", { className: "result__score", text: correct + " / " + topic.items.length }),
      el("h4", { text: passed ? "Сайн байна! \"" + topic.title + "\" сэдвийг эзэмшжээ." : "\"" + topic.title + "\" сэдэвт хоцрогдол байна." }),
      el("p", { className: "muted", text: passed
        ? "Зөвлөгөөгүй, нэг оролдлогоор " + clean + " даалгавар бодсон. Дараагийн сэдэв рүү шилжээрэй."
        : "Буруу бодсон даалгаврын бодолтыг уншаад дахин оролдоорой. Хосоороо дасгалжуулах даалгавар ч тус болно." }),
      list,
      el("div", { className: "actions" }, [
        retry,
        el("a", { className: "btn btn--primary", href: "hotsrogdol.html", text: "Хоцрогдлыг тооцох-д бүртгэх" })
      ])
    ]));
  }

  // =========================================================
  // 2. Хосоор
  // =========================================================
  var pairArea = $("pair-area");
  var pair = { round: 0, turn: "A" };
  var pairTimer = null;

  function pairNames() {
    return [$("pair-name-1").value.trim() || "1-р сурагч", $("pair-name-2").value.trim() || "2-р сурагч"];
  }

  function renderPair() {
    var r = PAIR[pair.round], item = r[pair.turn];
    var names = pairNames();
    var solver = pair.turn === "A" ? names[0] : names[1];
    var coach = pair.turn === "A" ? names[1] : names[0];
    pairArea.innerHTML = "";

    var steps = el("ol", { className: "rounds", "aria-label": "Шатууд" });
    PAIR.forEach(function (p, i) {
      steps.appendChild(el("li", {
        className: i < pair.round ? "is-done" : i === pair.round ? "is-current" : "",
        "aria-current": i === pair.round ? "step" : "false",
        text: (i + 1) + ". " + p.topic
      }));
    });

    var roles = el("div", { className: "pair-roles" }, [
      el("div", { className: "pair-role pair-role--solver" }, [
        el("small", { text: "Бодогч" }), el("strong", { text: solver }),
        el("span", { text: "Чангаар тайлбарлан бодно" })
      ]),
      el("div", { className: "pair-role" }, [
        el("small", { text: "Дасгалжуулагч" }), el("strong", { text: coach }),
        el("span", { text: "Хянах хуудсаар ажиглаж, асуулт асууна" })
      ])
    ]);

    var timerRoot = el("div", { className: "timer-row" });

    var field = answerField(item, "pair-" + pair.round + "-" + pair.turn);
    var feedback = el("p", { className: "feedback", role: "status" });
    var check = el("button", { type: "submit", className: "btn btn--primary", text: "Хариу шалгах" });
    var form = el("form", { className: "solo-card", autocomplete: "off" }, [
      el("div", { className: "solo-card__tags" }, [
        el("span", { className: "tag", text: "Хувилбар " + pair.turn })
      ]),
      el("p", { className: "solo-card__q", text: item.q }),
      field.node,
      el("div", { className: "actions" }, [check]),
      feedback
    ]);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var res = judgeAny(item, field.value());
      if (res === "empty") { feedback.textContent = "Хариугаа оруулна уу."; feedback.className = "feedback"; return; }
      if (res === "unreduced") { feedback.textContent = "Утга зөв — бутархайгаа хураа."; feedback.className = "feedback feedback--warn"; return; }
      feedback.className = "feedback " + (res === "ok" ? "feedback--ok" : "feedback--bad");
      feedback.textContent = res === "ok"
        ? "Зөв! " + item.sol
        : "Буруу. Дасгалжуулагч хянах хуудсаар алдааг хамт олоорой. (Зөв хариу: " + answerText(item) + ")";
      next.hidden = false;
    });

    var checklist = el("fieldset", { className: "coach" }, [
      el("legend", { text: "Дасгалжуулагчийн хянах хуудас" })
    ]);
    r.check.forEach(function (c) {
      checklist.appendChild(el("label", { className: "choice" }, [el("input", { type: "checkbox" }), el("span", { text: c })]));
    });

    var next = el("button", {
      type: "button", className: "btn btn--primary", hidden: true,
      text: pair.turn === "A" ? "Үүрэг солих → Хувилбар B" : (pair.round + 1 < PAIR.length ? "Дараагийн шат →" : "Дуусгах →")
    });
    next.addEventListener("click", function () {
      if (pair.turn === "A") pair.turn = "B";
      else { pair.turn = "A"; pair.round += 1; }
      if (pair.round < PAIR.length) renderPair();
      else renderPairDone();
    });

    pairArea.appendChild(steps);
    pairArea.appendChild(roles);
    pairArea.appendChild(timerRoot);
    pairArea.appendChild(el("div", { className: "pair-grid" }, [form, checklist]));
    pairArea.appendChild(el("div", { className: "actions" }, [next]));
    pairTimer = makeTimer(timerRoot, 180, "Бодох хугацаа");
  }

  function renderPairDone() {
    pairArea.innerHTML = "";
    var again = el("button", { type: "button", className: "btn btn--secondary", text: "Дахин эхлэх" });
    again.addEventListener("click", function () { pair = { round: 0, turn: "A" }; renderPair(); });
    pairArea.appendChild(el("div", { className: "solo-card result result--ok" }, [
      el("h4", { text: "Сайн хамтарлаа! 5 шатыг бүгдийг давлаа." }),
      el("p", { className: "muted", text: "Хоёулаа ярилц: Аль алхам хамгийн хэцүү байсан бэ? Дасгалжуулагчийн ямар асуулт хамгийн их тус болсон бэ?" }),
      el("div", { className: "actions" }, [again])
    ]));
  }

  ["pair-name-1", "pair-name-2"].forEach(function (id) {
    $(id).addEventListener("change", function () {
      var names = pairNames();
      var strongs = pairArea.querySelectorAll(".pair-role strong");
      if (strongs.length === 2) {
        strongs[0].textContent = pair.turn === "A" ? names[0] : names[1];
        strongs[1].textContent = pair.turn === "A" ? names[1] : names[0];
      }
    });
  });

  renderPair();

  // =========================================================
  // 3. Багаар
  // =========================================================
  var stationsRoot = $("team-stations");
  var digitsRoot = $("lock-digits");
  var found = STATIONS.map(function () { return null; });

  function renderDigits() {
    digitsRoot.innerHTML = "";
    found.forEach(function (d, i) {
      digitsRoot.appendChild(el("span", {
        className: "lock__digit" + (d === null ? "" : " is-found"),
        text: d === null ? "?" : String(d),
        "aria-label": (i + 1) + "-р цифр: " + (d === null ? "олдоогүй" : d)
      }));
    });
  }

  STATIONS.forEach(function (st, i) {
    var item = { type: "num", answer: st.answer, unit: st.unit };
    var field = answerField(item, "station-" + i);
    var feedback = el("p", { className: "feedback", role: "status" });
    var tries = 0;
    var btn = el("button", { type: "submit", className: "btn btn--primary btn--sm", text: "Шалгах" });
    var form = el("form", { className: "station", autocomplete: "off" }, [
      el("h4", { text: st.title }),
      el("p", { text: st.q }),
      field.node,
      btn,
      feedback
    ]);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (found[i] !== null) return;
      var res = judge(item, field.value());
      if (res === "empty") { feedback.textContent = "Хариугаа оруулна уу."; return; }
      if (res === "ok") {
        found[i] = st.answer;
        form.classList.add("is-solved");
        field.disable();
        btn.disabled = true;
        feedback.className = "feedback feedback--ok";
        feedback.textContent = "Зөв! Түгжээний " + (i + 1) + "-р цифр: " + st.answer;
        renderDigits();
      } else {
        tries += 1;
        feedback.className = "feedback feedback--bad";
        feedback.textContent = tries >= 2 ? "Дахин нягтал. Зөвлөгөө: " + st.hint : "Буруу байна. Шалгагч бодолтыг дахин нягталъя.";
      }
    });
    stationsRoot.appendChild(form);
  });
  renderDigits();

  var CODE = STATIONS.map(function (s) { return s.answer; }).join("");
  $("lock-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = normalize($("lock-input").value);
    var msg = $("lock-msg");
    if (v === CODE) {
      $("team-lock").classList.add("is-open");
      msg.textContent = "🔓 Түгжээ нээгдлээ! Багаараа амжилттай давлаа. Одоо доорх эргэцүүллийн асуултыг ярилцаарай.";
    } else {
      msg.textContent = found.indexOf(null) !== -1
        ? "Код буруу. Бүх станцын цифрийг цуглуулсан уу?"
        : "Код буруу. Цифрүүдийг станцын дарааллаар бичээрэй.";
    }
  });

  makeTimer($("team-timer"), 15 * 60, "Багийн хугацаа");

  // Үүрэг хуваарилах
  $("team-assign").addEventListener("click", function () {
    var names = Array.prototype.map.call(document.querySelectorAll(".team-name"), function (x) {
      return x.value.trim();
    }).filter(Boolean);
    var list = $("team-roles");
    list.innerHTML = "";
    if (names.length < 3) {
      list.appendChild(el("li", { className: "roles__note", text: "Дор хаяж 3 гишүүний нэрийг оруулна уу." }));
      return;
    }
    var shuffled = names.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
    }
    // 3 гишүүнтэй бол Илтгэгчийн үүргийг Уншигч хавсарна
    ROLES.forEach(function (role, idx) {
      var who = shuffled[idx] || shuffled[0];
      list.appendChild(el("li", null, [
        el("strong", { text: role.name + ": " + who }),
        el("span", { text: role.task })
      ]));
    });
  });

  // Багийн төслийн явц
  var steps = Array.prototype.slice.call(document.querySelectorAll("#project-steps input"));
  function updateProject() {
    var done = steps.filter(function (s) { return s.checked; }).length;
    $("project-progress").textContent = "Явц: " + done + " / " + steps.length + (done === steps.length ? " — Төсөл бэлэн! 🎉" : "");
  }
  steps.forEach(function (s) { s.addEventListener("change", updateProject); });
  updateProject();
})();
