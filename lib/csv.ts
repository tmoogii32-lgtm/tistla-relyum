/** Мөрүүдийг CSV болгож, Excel кирилл үсгийг зөв таних BOM-той татаж өгнө. */
export function downloadCsv(rows: (string | number)[][], filename: string) {
  const csv = rows
    .map((row) =>
      row
        .map((v) => {
          const s = String(v);
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    )
    .join("\r\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 0);
}
