/* Сайтын тохиргоо — гадаад холбоос ба Google-ийн URL-ууд нэг дор. */

export const SITE = {
  name: "Математикт дурлагсад",
  school: "Өмнөговь аймаг Даланзадгад сумын ЕБ-ын 5 дугаар сургууль",
  /** Хөл хэсгийн гарчиг — сайтыг хариуцагч мэргэжлийн багш нарын бүлэг */
  team: 'Өмнөговь аймаг Даланзадгад сумын ЕБ-ын 5 дугаар сургуулийн "ХАМТДАА ХӨГЖЬЕ" МБНБ',
  phone: "89282274",
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

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}
