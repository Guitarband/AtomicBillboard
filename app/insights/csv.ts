export function exportTable(name: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((val) => {
          const str = String(val).replace(/"/g, '""');
          return '"' + (/^[=+@\-\t\r]/.test(str) ? "'" : "") + str + '"';
        })
        .join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
