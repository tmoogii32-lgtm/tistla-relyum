/* Дэд хуудсуудын дээд цэс: [ LABEL → ] линк ба burger sheet (<1280px).
   Нүүр хуудсанд design.js ижил үүргийг гүйцэтгэдэг. */
(function () {
  "use strict";

  var doc = document;
  var nav = doc.querySelector(".navbar");
  if (!nav) return;
  var header = nav.querySelector(".navbar__header");
  var links = nav.querySelector(".navbar__links");
  if (!header || !links) return;

  doc.documentElement.classList.add("has-js");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function mark(text) {
    var s = doc.createElement("span");
    s.className = "nav-cta__mark";
    s.setAttribute("aria-hidden", "true");
    s.textContent = text;
    return s;
  }

  var cta = nav.querySelector(".navbar__actions .btn--primary");
  if (cta) {
    var label = cta.textContent.trim();
    cta.textContent = "";
    cta.appendChild(mark("["));
    cta.appendChild(doc.createTextNode(label));
    cta.appendChild(mark("→"));
    cta.appendChild(mark("]"));
  }

  if (!links.id) links.id = "site-nav";

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
    if (open && !reduce && links.animate) {
      Array.prototype.forEach.call(links.children, function (item, idx) {
        item.animate(
          [
            { opacity: 0, transform: "translateY(.75rem)" },
            { opacity: 1, transform: "none" }
          ],
          { duration: 320, delay: idx * 55, easing: "cubic-bezier(.2,0,0,1)", fill: "backwards" }
        );
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
})();
