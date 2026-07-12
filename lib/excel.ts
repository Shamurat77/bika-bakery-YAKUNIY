import * as XLSX from "xlsx";

// Har qanday jadvalni .xlsx qilib yuklab beradi
export function exportToExcel(
  rows: Record<string, unknown>[],
  sheetName: string,
  fileName: string
) {
  const ws = XLSX.utils.json_to_sheet(rows);

  // Ustun kengliklarini kontentga qarab moslash
  const keys = rows[0] ? Object.keys(rows[0]) : [];
  ws["!cols"] = keys.map((k) => ({
    wch: Math.min(
      40,
      Math.max(k.length, ...rows.map((r) => String(r[k] ?? "").length)) + 2
    ),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, fileName);
}
