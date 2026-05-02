import Papa from "papaparse";

export async function extractHeaders(file: File): Promise<string[]> {
  if (file.name.match(/\.xlsx?$/i)) {
    return extractXLSXHeaders(file);
  }
  return extractCSVHeaders(file);
}

function extractCSVHeaders(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      preview: 1,
      complete: (results) => {
        const headers = (results.data[0] as string[]).map((h) => h.trim()).filter(Boolean);
        resolve(headers);
      },
      error: reject,
    });
  });
}

async function extractXLSXHeaders(file: File): Promise<string[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
  return (data[0] || []).map((h) => String(h).trim()).filter(Boolean);
}
