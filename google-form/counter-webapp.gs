/**
 * ВЕБИЙН ТООЛУУР — нүүр хуудасны "Холбогдсон хүмүүс" ба "Сурагчдын ирц"
 *
 * Хуудас нээгдэх бүрд үзэлтийг +1 болгож, шалгалтын Google Form-д
 * хариулт өгсөн сурагчдын тоог буцаана.
 *
 * Суулгах заавар (нэг удаа):
 * 1. shalgalt-form.gs байгаа ТӨСӨЛДӨӨ ороод зүүн талын "Файлууд"-ын
 *    хажуугийн + → Script дарж "counter-webapp" нэртэй шинэ файл үүсгэнэ.
 * 2. Энэ кодыг бүхэлд нь хуулж тавиад хадгална (Ctrl+S).
 *    ⚠ createMathForm-ыг ДАХИН АЖИЛЛУУЛАХГҮЙ — шинэ маягт үүсчихнэ.
 * 3. Баруун дээд буланд Deploy → New deployment → ⚙ (Select type) → Web app
 *      Execute as:       Me
 *      Who has access:   Anyone
 *    → Deploy → зөвшөөрөл (Authorize) өгнө.
 * 4. Гарсан "Web app URL" (…/exec)-ыг вебийн counter.js файлын
 *    STATS_URL = "" хашилтын дотор хуулна.
 *
 * Кодыг дараа нь өөрчилбөл: Deploy → Manage deployments → ✎ → Version: New version.
 */

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : '';
  var props = PropertiesService.getScriptProperties();
  var views;

  if (action === 'hit') {
    // Олон хүн зэрэг орсон ч тоо алдагдахгүй
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      views = Number(props.getProperty('VIEWS') || 0) + 1;
      props.setProperty('VIEWS', String(views));
    } finally {
      lock.releaseLock();
    }
  } else {
    views = Number(props.getProperty('VIEWS') || 0);
  }

  var exam = counterExamStats_(props);
  var body = {
    views: views,
    submissions: exam.submissions,
    students: exam.students,
    updated: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Шалгалтын хариултын тоо ба давхардаагүй сурагчдын тоо (30 сек кэштэй). */
function counterExamStats_(props) {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('EXAM_STATS');
  if (cached) return JSON.parse(cached);

  var result = { submissions: 0, students: 0 };
  var formId = props.getProperty('FORM_ID');
  if (formId) {
    var nameId = props.getProperty('NAME_ITEM');
    var classId = props.getProperty('CLASS_ITEM');
    var seen = {};
    var responses = FormApp.openById(formId).getResponses();
    result.submissions = responses.length;
    responses.forEach(function (r) {
      var name = '', cls = '';
      r.getItemResponses().forEach(function (ir) {
        var id = String(ir.getItem().getId());
        if (id === nameId) name = String(ir.getResponse());
        if (id === classId) cls = String(ir.getResponse());
      });
      // Нэг сурагч хэд дахин өгсөн ч нэг удаа тоологдоно
      var key = (name + '|' + cls).toLowerCase().replace(/\s+/g, ' ').trim();
      seen[key] = true;
    });
    result.students = Object.keys(seen).length;
  }
  cache.put('EXAM_STATS', JSON.stringify(result), 30);
  return result;
}

/** Үзэлтийн тоог тэглэх эсвэл эхлэх утга өгөх (заавал биш). ▶ Run дарж ажиллуулна. */
function resetViewCount() {
  PropertiesService.getScriptProperties().setProperty('VIEWS', '0');
  Logger.log('Үзэлтийн тоо 0 боллоо.');
}

/** Тохиргоо зөв эсэхийг шалгах. ▶ Run → Execution log. */
function testCounter() {
  var out = doGet({ parameter: { action: 'stats' } }).getContent();
  Logger.log(out);
}
