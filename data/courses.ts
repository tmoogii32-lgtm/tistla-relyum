export type Course = { name: string; topic: string; label: string; image: string };

/** Багш нарын хиймэл оюуны сургалтууд (нүүр хуудас) */
export const COURSES: Course[] = [
  { name: "Сургалт-1", topic: "Prompt AI", label: "Gmail", image: "/assets/course-1.png" },
  { name: "Сургалт -2", topic: "Prompt AI", label: "Google calendar", image: "/assets/course-2.png" },
  { name: "Сургалт -3", topic: "Prompt AI", label: "Google Gemini", image: "/assets/course-3.png" },
  { name: "Сургалт -4", topic: "Prompt AI", label: "Google Notebook LM", image: "/assets/course-4.png" },
  { name: "Сургалт -5", topic: "Prompt AI", label: "Google classroom", image: "/assets/course-5.png" },
  { name: "Сургалт -6", topic: "Prompt AI", label: "Google vids", image: "/assets/course-6.png" },
  { name: "Сургалт -7", topic: "Prompt AI", label: "Google form", image: "/assets/course-7.png" },
  { name: "Сургалт -8", topic: "Prompt AI", label: "App script cod", image: "/assets/course-8.png" },
];

/** Хүүхэд судлал */
export const CHILD_STUDY = [
  { title: "VARK судалгаа", text: "Сурах хэв шинжийн судалгаа", image: "/assets/mega-vark.png" },
  { title: "Темпераминт", text: "Сурагчдын сэтгэл судлал", image: "/assets/mega-temperament.png" },
];
