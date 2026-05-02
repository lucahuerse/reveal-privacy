export type SensitivityLevel = "Public" | "Quasi-identifier" | "Sensitive" | "Direct identifier";

export interface SchemaRow {
  id: string;
  name: string;
  sens: SensitivityLevel;
  auto?: boolean;
}

export const SENSITIVITY_LEVELS: SensitivityLevel[] = [
  "Public",
  "Quasi-identifier",
  "Sensitive",
  "Direct identifier",
];

export function guessSens(name: string): SensitivityLevel {
  const n = name.toLowerCase();
  if (/\bssn\b|social.?sec|passport|driver.?lic|national.?id/.test(n)) return "Direct identifier";
  if (/\bname\b|first.?name|last.?name|fullname|email|phone|address|street|ip.?addr/.test(n))
    return "Direct identifier";
  if (/zip|postal|age|dob|birth|gender|sex|race|ethnic|religion|marital|nationality/.test(n))
    return "Quasi-identifier";
  if (/diagnosis|disease|condition|medication|drug|treatment|icd|hiv|cancer|salary|income|credit/.test(n))
    return "Sensitive";
  return "Public";
}

export function getGeneralizedName(name: string, sens: SensitivityLevel): string {
  if (sens === "Direct identifier") return "— removed";
  if (sens === "Quasi-identifier") {
    const n = name.toLowerCase();
    if (/zip|postal/.test(n)) return `${name}_prefix`;
    if (/age|year/.test(n)) return `${name}_range`;
    if (/date|dob|birth/.test(n)) return `${name}_year`;
    return `${name}_gen`;
  }
  return name;
}
