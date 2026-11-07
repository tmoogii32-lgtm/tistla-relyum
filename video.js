/* Нүүр хуудасны жижиг видео: харагдах үед дуугүй давталттай тоглоно,
   товч дарж зогсоох / тоглуулах. Хөдөлгөөн багасгах тохиргоотой үед автоматаар тоглохгүй. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  Array.prototype.forEach.call(document.querySelectorAll("[data-video]"), function (btn) {
    var video = btn.querySelector("video");
    if (!video) return;
    var userPaused = false;

    function sync() {
      var playing = !video.paused;
      btn.classList.toggle("is-playing", playing);
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
    }

    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);

    btn.addEventListener("click", function () {
      if (video.paused) {
        userPaused = false;
        video.play().catch(function () {});
      } else {
        userPaused = true;
        video.pause();
      }
    });

    if (reduce || !("IntersectionObserver" in window)) return;

    var inView = false;
    var queued = false;

    // Sticky stack-ийн улмаас хэсэг дэлгэцэнд "байсан" ч дараагийн хэсгийн доор
    // халхлагдсан байж болно — видеоны төв цэгт юу харагдаж байгааг шалгана.
    function visibleNow() {
      if (!inView) return false;
      var r = btn.getBoundingClientRect();
      var x = r.left + r.width / 2;
      var y = Math.min(Math.max(r.top + r.height / 2, 0), window.innerHeight - 1);
      var top = document.elementFromPoint(x, y);
      return !!top && btn.contains(top);
    }

    function update() {
      queued = false;
      if (visibleNow()) {
        if (!userPaused && video.paused) video.play().catch(function () {});
      } else if (!video.paused) {
        video.pause();
      }
    }

    function schedule() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    }

    new IntersectionObserver(function (entries) {
      inView = entries[entries.length - 1].isIntersecting;
      schedule();
    }, { threshold: 0.35 }).observe(btn);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  });
})();
