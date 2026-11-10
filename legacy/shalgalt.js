/* Шалгалт өгөх — Google Form-ыг холбох.
   Apps Script (google-form/shalgalt-form.gs)-ыг ажиллуулахад гарах
   "Сурагчдад илгээх" холбоосыг доорх хашилтын дотор хуулж тавина.
   Жишээ: "https://docs.google.com/forms/d/e/1FAIpQL.../viewform" */
var FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdTeBFYv_fga--aWGUpAZ1XmLzKO_usgrfEr90xpC5nHDPVng/viewform";

(function () {
  "use strict";

  var url = (FORM_URL || "").trim();
  var valid = /^https:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/.test(url);
  if (!valid) return;

  var open = document.getElementById("exam-open");
  var notice = document.getElementById("exam-notice");
  var frame = document.getElementById("exam-frame");
  var iframe = document.getElementById("exam-iframe");

  open.href = url;
  open.hidden = false;
  notice.hidden = true;

  // forms.gle богино холбоосыг суулгах боломжгүй — зөвхөн товчоор нээнэ
  if (url.indexOf("docs.google.com/forms/") !== -1) {
    iframe.src = url + (url.indexOf("?") === -1 ? "?" : "&") + "embedded=true";
    frame.hidden = false;
  }
})();
