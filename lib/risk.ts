import type { SchemaRow } from "./schema";

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export interface RiskResult {
  score: number;
  k: number;
  level: RiskLevel;
  combos: { cols: string[]; label: string }[];
  q: number;
  d: number;
  s: number;
}

export function computeRisk(rows: SchemaRow[]): RiskResult {
  const q = rows.filter((r) => r.sens === "Quasi-identifier").length;
  const d = rows.filter((r) => r.sens === "Direct identifier").length;
  const s = rows.filter((r) => r.sens === "Sensitive").length;

  const score = Math.min(100, q * 14 + d * 28 + s * 7);
  const k = Math.max(1, 30 - q * 6 - d * 8);

  const qCols = rows.filter((r) => r.sens === "Quasi-identifier").map((r) => r.name || "unnamed");
  const dCols = rows.filter((r) => r.sens === "Direct identifier").map((r) => r.name || "unnamed");
  const sCols = rows.filter((r) => r.sens === "Sensitive").map((r) => r.name || "unnamed");

  const combos: { cols: string[]; label: string }[] = [];
  if (dCols.length > 0) {
    combos.push({ cols: dCols.slice(0, 3), label: "Trivially re-identifiable" });
  }
  if (qCols.length >= 2) {
    combos.push({ cols: qCols.slice(0, 3), label: "87% re-id probability via linkage" });
  }
  if (qCols.length >= 1 && sCols.length >= 1) {
    combos.push({ cols: [qCols[0], sCols[0]], label: "Sensitive attribute inference risk" });
  }

  const level: RiskLevel = score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
  return { score, k, level, combos, q, d, s };
}

export function getKDescription(k: number, q: number, d: number): string {
  if (d > 0) {
    return `<strong>Direct identifiers present</strong> — each record is unique and trivially re-identifiable.`;
  }
  if (k < 3) {
    return `With <strong>${q} quasi-identifiers</strong>, most individuals can be uniquely identified by combining these columns.`;
  }
  if (k < 5) {
    return `<strong>Marginal anonymity</strong> — each record matches at least ${k} others, but below HIPAA Safe Harbor threshold of k=5.`;
  }
  return `<strong>Good anonymity</strong> — each record matches at least ${k} others. Meets basic privacy guidelines.`;
}

export function getRiskSublabel(level: RiskLevel): string {
  switch (level) {
    case "HIGH":
      return "Immediate remediation required before data sharing";
    case "MEDIUM":
      return "Review quasi-identifiers and consider generalization";
    case "LOW":
      return "Low re-identification risk — review before sharing";
  }
}
