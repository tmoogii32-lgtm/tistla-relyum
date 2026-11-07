/**
 * СУРЛАГЫН ХОЦРОГДЛЫГ МЭДЛЭГИЙН 4 ТӨРӨЛ БА БЛУМЫН МАТРИЦЫН АРГАЧЛАЛААР ОНОШЛОХ СОРИЛ
 * 7-р анги · Математик
 *
 * Google Form-ийг автоматаар үүсгэнэ: тест (quiz) горим, зөв хариулт, оноо, тайлбартай.
 * Даалгавар бүр матрицын нэг нүдэнд хамаарна:
 *   Мэдлэгийн төрөл : Баримт · Ойлголт · Журам · Мета-танин
 *   Блумын түвшин   : Сэргээн санах · Ойлгох · Хэрэглэх · Задлан шинжлэх · Үнэлэх · Бүтээх
 * Хариулт ирэх бүрд "Онош" ба "Матриц" хуудсыг Google Sheets-д автоматаар шинэчилнэ.
 *
 * Ашиглах заавар:
 * 1. https://script.google.com → "Шинэ төсөл" (New project)
 * 2. Энэ кодыг бүхэлд нь хуулж тавиад хадгална (Ctrl+S)
 * 3. Дээд талын цэснээс createMathForm функцийг сонгоод ▶ Run дарна
 * 4. Анх удаа зөвшөөрөл (Authorize) асууна → өөрийн Google бүртгэлээ сонгож зөвшөөрнө
 * 5. Execution log хэсэгт гарах "Сурагчдад илгээх" холбоосыг вебийн shalgalt.html-д оруулна
 * 6. Бүтээх (31-р) даалгаврыг багш Form-ын "Хариултууд" хэсгээс гараар дүгнэнэ.
 *    Дүгнэсний дараа diagnose функцийг ▶ Run дарж оношийг шинэчилнэ.
 */

var KNOWLEDGE = ['Баримт', 'Ойлголт', 'Журам', 'Мета-танин'];
var BLOOM = ['Сэргээн санах', 'Ойлгох', 'Хэрэглэх', 'Задлан шинжлэх', 'Үнэлэх', 'Бүтээх'];
var STRANDS = ['Тоо тоолол', 'Алгебр', 'Геометр', 'Статистик'];

// Оношийн босго (Хоцрогдлыг тооцох хуудасны "5-аас 4" дүрэмтэй нийцнэ)
var MASTERED = 80;   // ≥ 80% — Эзэмшсэн
var PARTIAL = 50;    // 50–79% — Хэсэгчлэн; < 50% — Хоцрогдолтой

/**
 * Олон сонголттой даалгаврууд.
 * { topic, strand, k: мэдлэгийн төрөл, b: Блумын түвшин, q, choices, answer (0-ээс), expl }
 */
var QUESTIONS = [
  { topic: 'Энгийн бутархай', strand: 'Тоо тоолол', k: 'Баримт', b: 'Сэргээн санах',
    q: 'a/b бутархайн b-г юу гэж нэрлэдэг вэ?',
    choices: ['Хүртвэр', 'Хуваарь', 'Ноогдвор', 'Үржвэр'], answer: 1,
    expl: 'Бутархайн доод тоо — хуваарь, дээд тоо — хүртвэр.' },

  { topic: 'Өнцөг', strand: 'Геометр', k: 'Баримт', b: 'Сэргээн санах',
    q: 'Гурвалжны дотоод өнцгүүдийн нийлбэр хэдэн градус вэ?',
    choices: ['90°', '180°', '270°', '360°'], answer: 1,
    expl: 'Дурын гурвалжны дотоод өнцгүүдийн нийлбэр 180°.' },

  { topic: 'Бүхэл тоо', strand: 'Тоо тоолол', k: 'Журам', b: 'Хэрэглэх',
    q: '(−8) + 5 − (−3) = ?',
    choices: ['−6', '0', '16', '−10'], answer: 1,
    expl: '−8 + 5 = −3; −3 − (−3) = −3 + 3 = 0' },

  { topic: 'Бүхэл тоо', strand: 'Тоо тоолол', k: 'Журам', b: 'Хэрэглэх',
    q: '(−4) · (−6) : 3 = ?',
    choices: ['−8', '8', '24', '−2'], answer: 1,
    expl: 'Сөрөг × сөрөг = эерэг: 24; 24 : 3 = 8' },

  { topic: 'Бүхэл тоо', strand: 'Тоо тоолол', k: 'Ойлголт', b: 'Үнэлэх',
    q: 'Бат: «Хоёр сөрөг тооны нийлбэр үргэлж эерэг байдаг» гэж хэлэв. Түүний дүгнэлтийг үнэл.',
    choices: [
      'Зөв, учир нь хасах нь хасахаар нэмэх болдог',
      'Буруу, жишээ нь (−2) + (−3) = −5',
      'Зөвхөн бүхэл тоонд зөв',
      'Заримдаа зөв, заримдаа буруу'
    ], answer: 1,
    expl: 'Хоёр сөрөг тооны нийлбэр үргэлж сөрөг. «Хасах × хасах = нэмэх» дүрэм үржвэрт хамаарна.' },

  { topic: 'Энгийн бутархай', strand: 'Тоо тоолол', k: 'Ойлголт', b: 'Ойлгох',
    q: 'Аль бутархай хамгийн их вэ?',
    choices: ['5/8', '2/3', '3/4', '7/12'], answer: 2,
    expl: 'Ерөнхий хуваарь 24: 15/24, 16/24, 18/24, 14/24 → 3/4 хамгийн их.' },

  { topic: 'Энгийн бутархай', strand: 'Тоо тоолол', k: 'Журам', b: 'Хэрэглэх',
    q: '2/3 + 1/4 = ?',
    choices: ['3/7', '11/12', '3/12', '7/12'], answer: 1,
    expl: 'Ерөнхий хуваарь 12: 8/12 + 3/12 = 11/12' },

  { topic: 'Энгийн бутархай', strand: 'Тоо тоолол', k: 'Журам', b: 'Хэрэглэх',
    q: '3/5 · 10/9 = ?',
    choices: ['2/3', '13/14', '30/14', '1/3'], answer: 0,
    expl: '(3·10)/(5·9) = 30/45 = 2/3' },

  { topic: 'Аравтын бутархай', strand: 'Тоо тоолол', k: 'Журам', b: 'Хэрэглэх',
    q: '2,5 · 0,4 = ?',
    choices: ['0,1', '1', '10', '2,9'], answer: 1,
    expl: '25 · 4 = 100, таслалаас хойш 2 орон → 1,00 = 1' },

  { topic: 'Хувь', strand: 'Тоо тоолол', k: 'Журам', b: 'Хэрэглэх',
    q: '240-ийн 15% хэд вэ?',
    choices: ['24', '36', '16', '40'], answer: 1,
    expl: '240 · 0,15 = 36' },

  { topic: 'Хувь', strand: 'Тоо тоолол', k: 'Ойлголт', b: 'Задлан шинжлэх',
    q: 'Барааны үнэ эхлээд 20% хямдраад, дараа нь 20% нэмэгдэв. Эцсийн үнэ анхны үнээсээ ямар байх вэ?',
    choices: ['Ижил', '4%-иар бага', '4%-иар их', '20%-иар бага'], answer: 1,
    expl: '0,8 · 1,2 = 0,96 → анхны үнийн 96%, өөрөөр хэлбэл 4%-иар бага. Хувь өөр өөр суурьтай тооцогддог.' },

  { topic: 'Харьцаа', strand: 'Тоо тоолол', k: 'Ойлголт', b: 'Хэрэглэх',
    q: '40 ширхэг чихрийг 3 : 5 харьцаагаар хуваав. Бага хэсэг нь хэдэн ширхэг вэ?',
    choices: ['15', '25', '8', '24'], answer: 0,
    expl: '3 + 5 = 8 хэсэг; 40 : 8 = 5; 3 · 5 = 15' },

  { topic: 'Пропорц', strand: 'Тоо тоолол', k: 'Журам', b: 'Хэрэглэх',
    q: 'x/6 = 10/15 бол x = ?',
    choices: ['4', '9', '25', '2,5'], answer: 0,
    expl: '15x = 60 → x = 4' },

  { topic: 'Пропорц', strand: 'Тоо тоолол', k: 'Ойлголт', b: 'Задлан шинжлэх',
    q: 'Аль хос хэмжигдэхүүн шууд пропорциональ хамааралтай вэ?',
    choices: [
      'Зам тогтмол үеийн хурд ба явах хугацаа',
      'Ижил үнэтэй дэвтрийн тоо ба төлөх мөнгө',
      'Хүний нас ба өндөр',
      'Талбай тогтмол тэгш өнцөгтийн урт ба өргөн'
    ], answer: 1,
    expl: 'Дэвтрийн тоо 2 дахин өсвөл мөнгө 2 дахин өснө. Хурд–хугацаа, урт–өргөн нь урвуу пропорц, нас–өндөр пропорц биш.' },

  { topic: 'Үсэгт илэрхийлэл', strand: 'Алгебр', k: 'Ойлголт', b: 'Ойлгох',
    q: '3a + 5 − a + 2 илэрхийллийг хялбарчил.',
    choices: ['4a + 7', '2a + 7', '2a + 3', '9a'], answer: 1,
    expl: 'Төсөөтэй гишүүд: 3a − a = 2a; 5 + 2 = 7. Тоо ба үсэгт гишүүнийг нэгтгэдэггүй.' },

  { topic: 'Үсэгт илэрхийлэл', strand: 'Алгебр', k: 'Журам', b: 'Хэрэглэх',
    q: '−2(x − 3) хаалтыг задал.',
    choices: ['−2x − 6', '−2x + 6', '2x − 6', '−2x + 3'], answer: 1,
    expl: '−2 · x = −2x; −2 · (−3) = +6' },

  { topic: 'Илэрхийллийн утга', strand: 'Алгебр', k: 'Журам', b: 'Хэрэглэх',
    q: 'a = −2 үед a² − 3a илэрхийллийн утгыг ол.',
    choices: ['−2', '10', '2', '−10'], answer: 1,
    expl: '(−2)² − 3·(−2) = 4 + 6 = 10' },

  { topic: 'Шугаман тэгшитгэл', strand: 'Алгебр', k: 'Журам', b: 'Хэрэглэх',
    q: '3x − 7 = 11 тэгшитгэлийг бод.',
    choices: ['x = 6', 'x = 4/3', 'x = 18', 'x = 12'], answer: 0,
    expl: '3x = 18 → x = 6' },

  { topic: 'Шугаман тэгшитгэл', strand: 'Алгебр', k: 'Журам', b: 'Хэрэглэх',
    q: '2(x + 1) = x + 5 тэгшитгэлийг бод.',
    choices: ['x = 3', 'x = 4', 'x = 7', 'x = 1'], answer: 0,
    expl: '2x + 2 = x + 5 → x = 3' },

  { topic: 'Шугаман тэгшитгэл', strand: 'Алгебр', k: 'Журам', b: 'Үнэлэх',
    q: 'Сурагч 2(x + 3) = 14 тэгшитгэлийг ингэж бодсон: (1) 2x + 3 = 14  (2) 2x = 11  (3) x = 5,5. Аль алхамд алдаа гарсан бэ?',
    choices: ['1-р алхам', '2-р алхам', '3-р алхам', 'Алдаагүй'], answer: 0,
    expl: 'Хаалт задлахдаа 3-ыг 2-оор үржүүлээгүй: 2x + 6 = 14 → 2x = 8 → x = 4.' },

  { topic: 'Текст бодлого', strand: 'Тоо тоолол', k: 'Ойлголт', b: 'Хэрэглэх',
    q: 'Автомашин 60 км/ц хурдтай 2,5 цаг явжээ. Хэдэн км зам туулсан бэ?',
    choices: ['24 км', '120 км', '150 км', '62,5 км'], answer: 2,
    expl: 'S = v · t = 60 · 2,5 = 150 км' },

  { topic: 'Өнцөг', strand: 'Геометр', k: 'Баримт', b: 'Хэрэглэх',
    q: 'Гурвалжны хоёр өнцөг 50° ба 70° бол гурав дахь өнцөг хэд вэ?',
    choices: ['60°', '90°', '120°', '80°'], answer: 0,
    expl: 'Гурвалжны өнцгүүдийн нийлбэр 180°: 180 − 50 − 70 = 60°' },

  { topic: 'Өнцөг', strand: 'Геометр', k: 'Баримт', b: 'Хэрэглэх',
    q: 'Зэргэлдээ хоёр өнцгийн нэг нь 35° бол нөгөө нь хэд вэ?',
    choices: ['55°', '145°', '325°', '35°'], answer: 1,
    expl: 'Зэргэлдээ өнцгүүдийн нийлбэр 180°: 180 − 35 = 145°' },

  { topic: 'Талбай', strand: 'Геометр', k: 'Ойлголт', b: 'Ойлгох',
    q: 'Тэгш өнцөгтийн урт 8 см, өргөн 5 см бол талбай нь хэд вэ?',
    choices: ['40 см²', '26 см²', '13 см²', '80 см²'], answer: 0,
    expl: 'S = a · b = 8 · 5 = 40 см². 26 см нь периметр — талбай ба периметрийг ялгах.' },

  { topic: 'Талбай', strand: 'Геометр', k: 'Баримт', b: 'Хэрэглэх',
    q: 'Гурвалжны суурь 10 см, өндөр 6 см бол талбай нь хэд вэ?',
    choices: ['60 см²', '30 см²', '16 см²', '32 см²'], answer: 1,
    expl: 'S = (a · h) / 2 = (10 · 6) / 2 = 30 см²' },

  { topic: 'Статистик', strand: 'Статистик', k: 'Журам', b: 'Хэрэглэх',
    q: '4, 7, 9, 6, 9 тоонуудын арифметик дундаж хэд вэ?',
    choices: ['7', '9', '6', '35'], answer: 0,
    expl: '(4 + 7 + 9 + 6 + 9) / 5 = 35 / 5 = 7' },

  { topic: 'Статистик', strand: 'Статистик', k: 'Журам', b: 'Задлан шинжлэх',
    q: 'Аль өгөгдлийн арифметик дундаж ба медиан тэнцүү вэ?',
    choices: ['1, 2, 3, 4, 5', '1, 1, 2, 8', '2, 4, 4, 10', '3, 3, 3, 7'], answer: 0,
    expl: '1…5: дундаж 3, медиан 3. Бусад: (3; 1,5), (5; 4), (4; 3).' },

  { topic: 'Координат', strand: 'Геометр', k: 'Ойлголт', b: 'Ойлгох',
    q: 'A(−3; 2) цэг координатын хавтгайн аль мөчид оршдог вэ?',
    choices: ['I мөч', 'II мөч', 'III мөч', 'IV мөч'], answer: 1,
    expl: 'x < 0, y > 0 тул II мөч' },

  { topic: 'Бодлого бодох стратеги', strand: 'Стратеги', k: 'Мета-танин', b: 'Ойлгох',
    q: 'Текст бодлого бодохдоо хамгийн эхэнд юу хийх нь зөв бэ?',
    choices: [
      'Өгөгдсөн болон олох зүйлийг ялгаж, нөхцөлийг ойлгох',
      'Шууд томьёо сонгож тоонуудыг орлуулах',
      'Хариултын хувилбаруудаас таах',
      'Хамгийн их тоог олох'
    ], answer: 0,
    expl: 'Нөхцөлөө ойлгоогүй бол зөв арга сонгох боломжгүй. Эхлээд «юу өгөгдсөн, юуг олох вэ?» гэж асуу.' },

  { topic: 'Хариугаа шалгах', strand: 'Стратеги', k: 'Мета-танин', b: 'Хэрэглэх',
    q: '3x − 7 = 11 тэгшитгэлээс x = 6 гэж олсон. Хариугаа шалгах хамгийн найдвартай арга аль нь вэ?',
    choices: [
      'x = 6-г тэгшитгэлд орлуулж 3 · 6 − 7 = 11 эсэхийг шалгах',
      'Бодолтоо дахин хуулж бичих',
      'Найзынхаа хариутай харьцуулах',
      'Шалгах шаардлагагүй'
    ], answer: 0,
    expl: 'Олсон утгаа анхны тэгшитгэлд орлуулах нь хамгийн найдвартай шалгалт: 18 − 7 = 11 ✓' }
];

// Бүтээх түвшний нээлттэй даалгавар (багш гараар дүгнэнэ)
var CREATE_TASK = {
  topic: 'Пропорц', strand: 'Тоо тоолол', k: 'Ойлголт', b: 'Бүтээх', points: 2,
  q: 'Өдөр тутмын амьдралаас харьцаа эсвэл пропорц ашиглан бодогдох нэг бодлого зохиож, бодолтыг нь бич.',
  help: 'Шалгуур: нөхцөл бүрэн, утгатай (1 оноо); бодолт ба хариу зөв (1 оноо).'
};

// Өөрийгөө үнэлэх (мета-танин × үнэлэх) — оноогүй, гүйцэтгэлтэй харьцуулна
var SELF_ASSESS = [
  { strand: 'Тоо тоолол', q: 'Бүхэл тоо, бутархай, хувь, пропорцын бодлогыг бодож чадна гэдэгтээ хэр итгэлтэй байна вэ?' },
  { strand: 'Алгебр', q: 'Үсэгт илэрхийлэл хялбарчлах, тэгшитгэл бодож чадна гэдэгтээ хэр итгэлтэй байна вэ?' },
  { strand: 'Геометр', q: 'Өнцөг, талбай, координатын бодлогыг бодож чадна гэдэгтээ хэр итгэлтэй байна вэ?' },
  { strand: 'Статистик', q: 'Өгөгдлийн дундаж, медиан олж чадна гэдэгтээ хэр итгэлтэй байна вэ?' }
];

/** Маягтыг үүсгэнэ. */
function createMathForm() {
  var form = FormApp.create('7-р анги · Сурлагын хоцрогдлыг оношлох сорил (Мэдлэг × Блумын матриц)');
  form.setDescription(
    'Энэхүү сорил нь сурлагын хоцрогдлыг мэдлэгийн 4 төрөл (баримт, ойлголт, журам, мета-танин) ' +
    'ба Блумын 6 түвшний матрицаар оношлох зорилготой.\n' +
    'Эхлээд өөрийгөө үнэлж, дараа нь ' + QUESTIONS.length + ' сонгох даалгавар, 1 бүтээх даалгавар гүйцэтгэнэ. ' +
    'Хугацаа: 45 минут.\n' +
    'Даалгавар бүрийн өмнө [сэдэв · мэдлэгийн төрөл · Блумын түвшин]-ийг бичсэн.'
  );
  form.setIsQuiz(true);
  form.setCollectEmail(false);
  form.setShuffleQuestions(false);
  form.setProgressBar(true);

  var meta = {};   // itemId → { k, b, strand, topic }
  var selfMap = {}; // itemId → strand

  // --- 1. Сурагчийн мэдээлэл (оноогүй) ---
  var nameItem = form.addTextItem().setTitle('Овог, нэр').setRequired(true);
  var classItem = form.addTextItem().setTitle('Анги, бүлэг (жишээ: 7а)').setRequired(true);

  // --- 2. Өөрийгөө үнэлэх ---
  form.addPageBreakItem()
    .setTitle('1-р хэсэг · Өөрийгөө үнэлэх')
    .setHelpText('Сорил эхлэхээс өмнө өөрийн чадварыг үнэлнэ үү. Оноо өгөхгүй — гүйцэтгэлтэй тань харьцуулж оношилно.');
  SELF_ASSESS.forEach(function (s) {
    var item = form.addScaleItem()
      .setTitle('[' + s.strand + '] ' + s.q)
      .setBounds(1, 4)
      .setLabels('Огт итгэлгүй', 'Бүрэн итгэлтэй')
      .setRequired(true);
    selfMap[item.getId()] = s.strand;
  });

  // --- 3. Сонгох даалгаврууд ---
  form.addPageBreakItem()
    .setTitle('2-р хэсэг · Даалгаврууд')
    .setHelpText('Даалгавар бүр 1 оноо.');
  QUESTIONS.forEach(function (q, i) {
    var item = form.addMultipleChoiceItem();
    var choices = q.choices.map(function (text, idx) {
      return item.createChoice(text, idx === q.answer);
    });
    item.setTitle((i + 1) + '. [' + q.topic + ' · ' + q.k + ' · ' + q.b + '] ' + q.q)
      .setChoices(choices)
      .setPoints(1)
      .setRequired(true)
      .setFeedbackForCorrect(FormApp.createFeedback().setText('Зөв! ' + q.expl).build())
      .setFeedbackForIncorrect(FormApp.createFeedback()
        .setText('Буруу. Зөв хариулт: ' + q.choices[q.answer] + '. ' + q.expl +
                 ' → "' + q.topic + '" сэдвийг давтаарай.').build());
    meta[item.getId()] = { k: q.k, b: q.b, strand: q.strand, topic: q.topic };
  });

  // --- 4. Бүтээх даалгавар ---
  var c = CREATE_TASK;
  var createItem = form.addParagraphTextItem()
    .setTitle((QUESTIONS.length + 1) + '. [' + c.topic + ' · ' + c.k + ' · ' + c.b + '] ' + c.q)
    .setHelpText(c.help)
    .setPoints(c.points)
    .setRequired(true);
  meta[createItem.getId()] = { k: c.k, b: c.b, strand: c.strand, topic: c.topic };

  // --- Хариултыг Google Sheets-д хадгалах ---
  var ss = SpreadsheetApp.create('7-р анги · Хоцрогдлын оношлох сорил — Хариултууд');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // --- Тохиргоог хадгалж, хариулт ирэх бүрд оношлох ---
  PropertiesService.getScriptProperties().setProperties({
    FORM_ID: form.getId(),
    SHEET_ID: ss.getId(),
    META: JSON.stringify(meta),
    SELF: JSON.stringify(selfMap),
    NAME_ITEM: String(nameItem.getId()),
    CLASS_ITEM: String(classItem.getId())
  });
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'diagnose') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('diagnose').forForm(form).onFormSubmit().create();

  Logger.log('✅ Маягт амжилттай үүслээ!');
  Logger.log('Засах холбоос:      ' + form.getEditUrl());
  Logger.log('Сурагчдад илгээх:   ' + form.getPublishedUrl());
  Logger.log('Хариултын хүснэгт:  ' + ss.getUrl());
}

/**
 * Бүх хариултаас оношийг гаргана ("Онош" ба "Матриц" хуудас).
 * Хариулт ирэх бүрд автоматаар ажиллана; гараар ч ▶ Run хийж болно.
 */
function diagnose() {
  var p = PropertiesService.getScriptProperties().getProperties();
  if (!p.FORM_ID) throw new Error('Эхлээд createMathForm функцийг ажиллуулна уу.');
  var form = FormApp.openById(p.FORM_ID);
  var ss = SpreadsheetApp.openById(p.SHEET_ID);
  var meta = JSON.parse(p.META);
  var selfMap = JSON.parse(p.SELF);

  var items = form.getItems();
  var rows = [];
  var classMatrix = {}; // "k|b" → { earned, possible }

  form.getResponses().forEach(function (resp) {
    var name = '', cls = '';
    var byK = {}, byB = {}, byStrand = {}, byTopic = {}, byCell = {};
    var self = {};
    var earned = 0, possible = 0;

    resp.getItemResponses().forEach(function (ir) {
      var id = String(ir.getItem().getId());
      if (id === p.NAME_ITEM) name = ir.getResponse();
      if (id === p.CLASS_ITEM) cls = ir.getResponse();
      if (selfMap[id]) self[selfMap[id]] = Number(ir.getResponse());
    });

    items.forEach(function (item) {
      var m = meta[String(item.getId())];
      if (!m) return;
      var g = resp.getGradableResponseForItem(item);
      var score = g ? g.getScore() : null;
      var max = item.getType() === FormApp.ItemType.PARAGRAPH_TEXT ? CREATE_TASK.points : 1;
      if (score === null || score === undefined) return; // дүгнэгдээгүй
      add(byK, m.k, score, max);
      add(byB, m.b, score, max);
      add(byStrand, m.strand, score, max);
      add(byTopic, m.topic, score, max);
      add(byCell, m.k + '|' + m.b, score, max);
      add(classMatrix, m.k + '|' + m.b, score, max);
      earned += score;
      possible += max;
    });

    var weakCells = Object.keys(byCell).filter(function (key) {
      return pct(byCell[key]) < PARTIAL;
    }).map(function (key) { return key.replace('|', ' × '); });

    var weakTopics = Object.keys(byTopic).filter(function (t) {
      return pct(byTopic[t]) < MASTERED;
    });

    var calibration = [];
    STRANDS.forEach(function (s) {
      if (!self[s] || !byStrand[s]) return;
      var selfPct = self[s] * 25, perf = pct(byStrand[s]);
      if (selfPct >= 75 && perf < PARTIAL) calibration.push(s + ': өөрийгөө хэт өндөр үнэлсэн');
      if (selfPct <= 50 && perf >= MASTERED) calibration.push(s + ': өөртөө итгэл дутуу');
    });

    rows.push([resp.getTimestamp(), name, cls, earned + ' / ' + possible, pct({ e: earned, m: possible })]
      .concat(KNOWLEDGE.map(function (k) { return byK[k] ? pct(byK[k]) : ''; }))
      .concat(BLOOM.map(function (b) { return byB[b] ? pct(byB[b]) : ''; }))
      .concat([
        status(pct({ e: earned, m: possible })),
        weakCells.join('; ') || '—',
        weakTopics.join(', ') || '—',
        calibration.join('; ') || 'Тохирсон'
      ]));
  });

  // --- "Онош" хуудас ---
  var header = ['Огноо', 'Овог нэр', 'Анги', 'Оноо', 'Нийт %']
    .concat(KNOWLEDGE.map(function (k) { return k + ' %'; }))
    .concat(BLOOM.map(function (b) { return b + ' %'; }))
    .concat(['Төлөв', 'Хоцрогдолтой нүд (мэдлэг × Блум)', 'Давтах сэдэв', 'Өөрийн үнэлгээ ба гүйцэтгэл']);
  var sh = ss.getSheetByName('Онош') || ss.insertSheet('Онош');
  sh.clear();
  sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  if (rows.length) {
    sh.getRange(2, 1, rows.length, header.length).setValues(rows);
    var pctCols = 1 + KNOWLEDGE.length + BLOOM.length; // Нийт % + төрлүүд + түвшнүүд
    colorize(sh.getRange(2, 5, rows.length, pctCols));
  }
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, header.length);

  // --- "Матриц" хуудас: ангийн дундаж 4 × 6 ---
  var mx = ss.getSheetByName('Матриц') || ss.insertSheet('Матриц');
  mx.clear();
  var grid = [['Мэдлэг \\ Блум'].concat(BLOOM)];
  KNOWLEDGE.forEach(function (k) {
    grid.push([k].concat(BLOOM.map(function (b) {
      var cell = classMatrix[k + '|' + b];
      return cell ? pct(cell) : '';
    })));
  });
  mx.getRange(1, 1, grid.length, grid[0].length).setValues(grid);
  mx.getRange(1, 1, 1, grid[0].length).setFontWeight('bold');
  mx.getRange(1, 1, grid.length, 1).setFontWeight('bold');
  colorize(mx.getRange(2, 2, KNOWLEDGE.length, BLOOM.length));
  mx.getRange(grid.length + 2, 1).setValue(
    'Ангийн дундаж гүйцэтгэл (%). ≥ ' + MASTERED + ' — эзэмшсэн, ' + PARTIAL + '–' + (MASTERED - 1) +
    ' — хэсэгчлэн, < ' + PARTIAL + ' — хоцрогдолтой. Хоосон нүдэнд даалгавар байхгүй.');
  mx.autoResizeColumns(1, grid[0].length);
}

// ---------- Туслах функцууд ----------
function add(obj, key, score, max) {
  if (!obj[key]) obj[key] = { e: 0, m: 0 };
  obj[key].e += score;
  obj[key].m += max;
}

function pct(o) {
  return o.m ? Math.round((o.e / o.m) * 100) : 0;
}

function status(v) {
  if (v >= MASTERED) return 'Эзэмшсэн';
  if (v >= PARTIAL) return 'Хэсэгчлэн';
  return 'Хоцрогдолтой';
}

function colorize(range) {
  var values = range.getValues();
  var colors = values.map(function (row) {
    return row.map(function (v) {
      if (v === '' || v === null) return null;
      if (v >= MASTERED) return '#d9ead3';
      if (v >= PARTIAL) return '#fff2cc';
      return '#f4cccc';
    });
  });
  range.setBackgrounds(colors);
}
