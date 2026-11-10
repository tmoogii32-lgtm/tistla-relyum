/* Сайтын тохиргоо — гадаад холбоос ба Google-ийн URL-ууд нэг дор. */

export const SITE = {
  name: "Математикт дурлагсад",
  school: "Өмнөговь аймаг Даланзадгад сумын ЕБ-ын 5 дугаар сургууль",
  copyright: "© 2025 School No. 5, Dalanzadgad. All rights reserved.",
} as const;

/** Интерактив бодлогын вэб апп */
export const PRACTICE_APP_URL = "https://web3-red-eta.vercel.app/";

export const TEXTBOOK_URL = "https://econtent.edu.mn/book/7rangi/";
export const VIDEO_LESSONS_URL = "https://econtent.edu.mn/videoEBS/7rangi/mat";

/**
 * Оношлох сорилын Google Form.
 * Apps Script (google-form/shalgalt-form.gs)-ыг ажиллуулахад гарах
 * "Сурагчдад илгээх" холбоосыг энд тавина.
 */
export const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdTeBFYv_fga--aWGUpAZ1XmLzKO_usgrfEr90xpC5nHDPVng/viewform";

/**
 * Нүүр хуудасны гүйдэг тоолуур.
 * Apps Script вэб апп (google-form/counter-webapp.gs)-ыг deploy хийхэд гарах
 * "Web app URL". Жишээ: "https://script.google.com/macros/s/AKfycb.../exec"
 */
export const STATS_URL = "";

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}
