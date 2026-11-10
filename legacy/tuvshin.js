/* "Түвшин" цэс: тайланг шинэ цонхгүйгээр дээд цэсийн доор нээнэ.
   JS ажиллахгүй бол холбоос тайлан руу шууд орно. */
(function () {
  "use strict";

  var doc = document;
  var nav = doc.querySelector(".navbar");
  var link = nav && nav.querySelector("a[data-tuvshin]");
  if (!link) return;

  var current = nav.querySelector('.navbar__links a[aria-current="page"]');
  var panel = null;

  function isOpen() {
    return !!panel && !panel.hidden;
  }

  function build() {
    panel = doc.createElement("section");
    panel.className = "tuvshin-panel";
    panel.setAttribute("aria-label", "Түвшин");

    var bar = doc.createElement("div");
    bar.className = "tuvshin-panel__bar";
    var close = doc.createElement("button");
    close.type = "button";
    close.className = "tuvshin-panel__close";
    close.textContent = "Хаах ✕";
    close.addEventListener("click", function () {
      setOpen(false);
      link.focus();
    });
    bar.appendChild(close);

    var frame = doc.createElement("iframe");
    frame.className = "tuvshin-panel__frame";
    frame.title = "ЭдТек ба Ялгаатай Сургалтын Интерактив Тайлан";
    frame.setAttribute("sandbox", "allow-scripts");
    frame.src = link.getAttribute("href");

    panel.appendChild(bar);
    panel.appendChild(frame);
    doc.body.appendChild(panel);
  }

  function setOpen(open) {
    if (open && !panel) build();
    if (!panel) return;
    panel.hidden = !open;
    doc.documentElement.classList.toggle("tuvshin-open", open);
    if (open) {
      link.setAttribute("aria-current", "page");
      if (current) current.removeAttribute("aria-current");
    } else {
      link.removeAttribute("aria-current");
      if (current) current.setAttribute("aria-current", "page");
    }
  }

  // Цэсний бусад холбоос дарагдвал самбар хаагдана (ижил хуудасны #зангуу ч мөн)
  nav.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    if (a === link) {
      e.preventDefault();
      setOpen(!isOpen());
    } else if (isOpen()) {
      setOpen(false);
    }
  });

  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen() && !nav.classList.contains("is-open")) {
      setOpen(false);
      link.focus();
    }
  });
})();
