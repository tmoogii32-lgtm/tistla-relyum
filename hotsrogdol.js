/* Хоцрогдлыг тооцох — сурагч ба даалгаврын бүртгэл.
   Өгөгдөл браузерын localStorage-д хадгалагдана. */
(function () {
  "use strict";

  var STORAGE_KEY = "hotsrogdol-v1";
  var MAX_SCORE = 5;
  var PASS_SCORE = 4; // 4-өөс доош бол хоцрогдолтой
  var LEVEL_ORDER = ["Суурь", "Дунд", "Ахисан", "Гүнзгий"];

  var state = load();

  // ---------- Хадгалалт ----------
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (Array.isArray(data.students) && Array.isArray(data.records)) return data;
      }
    } catch (e) { /* хадгалалт боломжгүй үед хоосноор эхэлнэ */ }
    return { students: [], records: [] };
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      alert("Бүртгэлийг хадгалж чадсангүй. Браузерын тохиргоог шалгана уу.");
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // ---------- Тооцоолол ----------
  function recordsOf(studentId) {
    return state.records.filter(function (r) { return r.studentId === studentId; });
  }

  function byNewest(a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return (b.created || 0) - (a.created || 0);
  }

  // Даалгавар + түвшин бүрийн хамгийн сүүлийн дүн
  function latestResults(records) {
    var latest = {};
    records.slice().sort(byNewest).forEach(function (r) {
      var key = r.task.toLowerCase() + "|" + r.level;
      if (!latest[key]) latest[key] = r;
    });
    return Object.keys(latest).map(function (k) { return latest[k]; });
  }

  function behindTasks(studentId) {
    return latestResults(recordsOf(studentId)).filter(function (r) {
      return r.score < PASS_SCORE;
    });
  }

  function averagePercent(records) {
    if (!records.length) return null;
    var sum = records.reduce(function (s, r) { return s + r.score; }, 0);
    return Math.round((sum / (records.length * MAX_SCORE)) * 100);
  }

  function studentStatus(studentId) {
    if (!recordsOf(studentId).length) return "none";
    return behindTasks(studentId).length ? "behind" : "ok";
  }

  function studentById(id) {
    for (var i = 0; i < state.students.length; i++) {
      if (state.students[i].id === id) return state.students[i];
    }
    return null;
  }

  function compareStudents(a, b) {
    return a.cls.localeCompare(b.cls, "mn") || a.name.localeCompare(b.name, "mn");
  }

  // ---------- DOM туслах ----------
  function $(id) { return document.getElementById(id); }

  function el(tag, props, children) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        if (k === "text") node.textContent = props[k];
        else if (k === "className") node.className = props[k];
        else node.setAttribute(k, props[k]);
      });
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function badge(status) {
    var map = {
      ok: ["badge badge--ok", "Тэнцсэн"],
      behind: ["badge badge--behind", "Хоцрогдолтой"],
      none: ["badge badge--none", "Дүнгүй"],
      failed: ["badge badge--behind", "Тэнцээгүй"]
    };
    return el("span", { className: map[status][0], text: map[status][1] });
  }

  function fillSelect(select, options, keepValue, firstLabel) {
    var current = keepValue ? select.value : "";
    select.innerHTML = "";
    select.appendChild(el("option", { value: "", text: firstLabel }));
    options.forEach(function (o) {
      select.appendChild(el("option", { value: o.value, text: o.label }));
    });
    var stillExists = options.some(function (o) { return o.value === current; });
    select.value = stillExists ? current : "";
  }

  function fillDatalist(list, values) {
    list.innerHTML = "";
    values.forEach(function (v) { list.appendChild(el("option", { value: v })); });
  }

  function unique(values) {
    var seen = {};
    return values.filter(function (v) {
      var k = v.toLowerCase();
      if (seen[k]) return false;
      seen[k] = true;
      return true;
    });
  }

  // ---------- Зурах ----------
  function render() {
    var students = state.students.slice().sort(compareStudents);
    var classes = unique(students.map(function (s) { return s.cls; }));
    var studentOptions = students.map(function (s) {
      return { value: s.id, label: s.name + " (" + s.cls + ")" };
    });

    fillSelect($("class-filter"), classes.map(function (c) { return { value: c, label: c }; }), true, "Бүх анги");
    fillSelect($("task-student"), studentOptions, true, "— Сурагч сонгох —");
    fillSelect($("record-student"), studentOptions, true, "Бүх сурагч");
    fillDatalist($("class-list"), classes);
    fillDatalist($("task-list"), unique(state.records.map(function (r) { return r.task; })).sort());

    renderSummary();
    renderStudents(students);
    renderRecords();
  }

  function renderSummary() {
    var behind = state.students.filter(function (s) { return studentStatus(s.id) === "behind"; });
    var avg = averagePercent(state.records);
    $("stat-students").textContent = state.students.length;
    $("stat-records").textContent = state.records.length;
    $("stat-behind").textContent = behind.length;
    $("stat-average").textContent = avg === null ? "—" : avg + "%";
  }

  function renderStudents(students) {
    var filter = $("class-filter").value;
    var tbody = $("student-rows");
    tbody.innerHTML = "";

    var visible = students.filter(function (s) { return !filter || s.cls === filter; });
    visible.forEach(function (s, i) {
      var recs = recordsOf(s.id);
      var avg = averagePercent(recs);
      var nameBtn = el("button", { type: "button", className: "row-link", text: s.name, title: "Даалгаврын бүртгэлийг харах" });
      nameBtn.addEventListener("click", function () { showStudentRecords(s.id); });

      var del = el("button", { type: "button", className: "icon-btn", text: "Устгах", "aria-label": s.name + " сурагчийг устгах" });
      del.addEventListener("click", function () { deleteStudent(s.id); });

      tbody.appendChild(el("tr", null, [
        el("td", { text: String(i + 1) }),
        el("td", { className: "name-cell" }, [nameBtn]),
        el("td", { text: s.cls }),
        el("td", { text: String(recs.length) }),
        el("td", { text: avg === null ? "—" : avg + "%" }),
        el("td", null, [badge(studentStatus(s.id))]),
        el("td", null, [del])
      ]));
    });

    $("student-empty").hidden = visible.length > 0;
    $("student-empty").textContent = students.length
      ? "Энэ ангид сурагч алга байна."
      : "Одоогоор сурагч бүртгэгдээгүй байна.";
  }

  function renderRecords() {
    var selected = $("record-student").value;
    var student = selected ? studentById(selected) : null;
    var tbody = $("record-rows");
    tbody.innerHTML = "";

    $("records-title").textContent = student
      ? student.name + " — даалгаврын бүртгэл"
      : "Сурагчийн даалгаврын бүртгэл";

    var records = state.records
      .filter(function (r) { return !selected || r.studentId === selected; })
      .sort(byNewest);

    records.forEach(function (r) {
      var s = studentById(r.studentId);
      var del = el("button", { type: "button", className: "icon-btn", text: "Устгах", "aria-label": "Бүртгэл устгах" });
      del.addEventListener("click", function () { deleteRecord(r.id); });

      tbody.appendChild(el("tr", null, [
        el("td", { text: r.date }),
        el("td", { className: "name-cell", text: s ? s.name : "—" }),
        el("td", { text: r.task }),
        el("td", { text: r.level }),
        el("td", { text: r.score + "/" + MAX_SCORE }),
        el("td", null, [badge(r.score >= PASS_SCORE ? "ok" : "failed")]),
        el("td", null, [del])
      ]));
    });

    $("record-empty").hidden = records.length > 0;
    renderBehind(selected);
  }

  function renderBehind(selected) {
    var list = $("behind-list");
    list.innerHTML = "";
    var targets = selected
      ? [studentById(selected)]
      : state.students.slice().sort(compareStudents);

    targets.forEach(function (s) {
      if (!s) return;
      behindTasks(s.id)
        .sort(function (a, b) {
          return a.task.localeCompare(b.task, "mn") ||
            LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level);
        })
        .forEach(function (r) {
          var prefix = selected ? "" : s.name + " — ";
          list.appendChild(el("li", {
            text: prefix + r.task + " (" + r.level + "): " + r.score + "/" + MAX_SCORE
          }));
        });
    });

    $("behind-box").hidden = list.children.length === 0;
  }

  // ---------- Үйлдэл ----------
  function showStudentRecords(id) {
    $("record-student").value = id;
    $("task-student").value = id;
    renderRecords();
    $("tasks").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function deleteStudent(id) {
    var s = studentById(id);
    if (!s) return;
    var count = recordsOf(id).length;
    var msg = s.name + " сурагчийг устгах уу?" +
      (count ? "\nТүүний " + count + " даалгаврын бүртгэл мөн устна." : "");
    if (!confirm(msg)) return;
    state.students = state.students.filter(function (x) { return x.id !== id; });
    state.records = state.records.filter(function (r) { return r.studentId !== id; });
    save();
    render();
  }

  function deleteRecord(id) {
    if (!confirm("Энэ даалгаврын бүртгэлийг устгах уу?")) return;
    state.records = state.records.filter(function (r) { return r.id !== id; });
    save();
    render();
  }

  function today() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  $("student-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("student-name").value.trim().replace(/\s+/g, " ");
    var cls = $("student-class").value.trim();
    var error = $("student-error");

    if (!name || !cls) {
      error.textContent = "Овог нэр болон ангийг бөглөнө үү.";
      return;
    }
    var exists = state.students.some(function (s) {
      return s.name.toLowerCase() === name.toLowerCase() && s.cls.toLowerCase() === cls.toLowerCase();
    });
    if (exists) {
      error.textContent = cls + " ангийн " + name + " аль хэдийн бүртгэгдсэн байна.";
      return;
    }

    error.textContent = "";
    var student = { id: uid(), name: name, cls: cls, created: Date.now() };
    state.students.push(student);
    save();
    $("student-name").value = "";
    render();
    $("task-student").value = student.id;
    $("student-name").focus();
  });

  $("task-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var studentId = $("task-student").value;
    var task = $("task-name").value.trim().replace(/\s+/g, " ");
    var level = $("task-level").value;
    var score = Number($("task-score").value);
    var date = $("task-date").value;
    var error = $("task-error");

    if (!studentById(studentId)) {
      error.textContent = "Эхлээд сурагчаа сонгоно уу.";
      return;
    }
    if (!task) {
      error.textContent = "Даалгаврын нэрийг оруулна уу.";
      return;
    }
    if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
      error.textContent = "Дүн 0-оос " + MAX_SCORE + " хүртэлх бүхэл тоо байна.";
      return;
    }

    error.textContent = "";
    state.records.push({
      id: uid(),
      studentId: studentId,
      task: task,
      level: level,
      score: score,
      date: date || today(),
      created: Date.now()
    });
    save();
    $("task-score").value = "0";
    $("record-student").value = studentId;
    render();
  });

  $("class-filter").addEventListener("change", render);
  $("record-student").addEventListener("change", renderRecords);

  $("export-csv").addEventListener("click", function () {
    if (!state.students.length) {
      alert("Татах бүртгэл алга байна.");
      return;
    }
    var rows = [["Овог нэр", "Анги", "Огноо", "Даалгавар", "Түвшин", "Зөв бодсон", "Нийт", "Үр дүн"]];
    state.students.slice().sort(compareStudents).forEach(function (s) {
      var recs = recordsOf(s.id).sort(byNewest);
      if (!recs.length) {
        rows.push([s.name, s.cls, "", "", "", "", "", "Дүнгүй"]);
        return;
      }
      recs.forEach(function (r) {
        rows.push([s.name, s.cls, r.date, r.task, r.level, r.score, MAX_SCORE,
          r.score >= PASS_SCORE ? "Тэнцсэн" : "Тэнцээгүй"]);
      });
    });
    var csv = rows.map(function (row) {
      return row.map(function (v) {
        var s = String(v);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(",");
    }).join("\r\n");

    var blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    var a = el("a", { href: URL.createObjectURL(blob), download: "hotsrogdol-" + today() + ".csv" });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  });

  $("clear-all").addEventListener("click", function () {
    if (!state.students.length && !state.records.length) return;
    if (!confirm("Бүх сурагч болон даалгаврын бүртгэлийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.")) return;
    state = { students: [], records: [] };
    save();
    render();
  });

  $("task-date").value = today();
  render();
})();
