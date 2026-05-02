import type { FileSchema, SensitivityLevel } from "./schema";

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export interface RiskResult {
  score: number;
  k: number;
  level: RiskLevel;
  combos: { cols: string[]; label: string }[];
  sensitivity: SensitivityLevel;
  columnCount: number;
}

export function computeRisk(schema: FileSchema): RiskResult {
  const { columns, sensitivity } = schema;
  const columnCount = columns.length;
  const colNames = columns.map((c) => c.name || "unnamed");

  let score = 0;
  let k = 30;
  const combos: { cols: string[]; label: string }[] = [];

  switch (sensitivity) {
    case "Direct identifier":
      score = Math.min(100, 70 + columnCount * 3);
      k = 1;
      combos.push({ cols: colNames.slice(0, 3), label: "Trivially re-identifiable" });
      break;
    case "Sensitive":
      score = Math.min(100, 50 + columnCount * 4);
      k = Math.max(2, 15 - columnCount);
      combos.push({ cols: colNames.slice(0, 3), label: "Sensitive data exposure risk" });
      break;
    case "Quasi-identifier":
      score = Math.min(100, 30 + columnCount * 6);
      k = Math.max(2, 20 - columnCount * 2);
      if (columnCount >= 2) {
        combos.push({ cols: colNames.slice(0, 3), label: "87% re-id probability via linkage" });
      }
      break;
    case "Public":
    default:
      score = Math.min(30, columnCount * 2);
      k = 30;
      break;
  }

  const level: RiskLevel = score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
  return { score, k, level, combos, sensitivity, columnCount };
}

export function getKDescription(k: number, sensitivity: SensitivityLevel, columnCount: number): string {
  if (sensitivity === "Direct identifier") {
    return `<strong>Direct identifiers present</strong> — each record is unique and trivially re-identifiable.`;
  }
  if (sensitivity === "Sensitive") {
    return `<strong>Sensitive data</strong> with ${columnCount} columns — high risk of attribute disclosure.`;
  }
  if (k < 3) {
    return `With <strong>${columnCount} quasi-identifiers</strong>, most individuals can be uniquely identified by combining these columns.`;
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
