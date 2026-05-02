import type { FileSchema, SensitivityLevel } from "./schema";
import { computeRisk, getRiskSublabel, type RiskResult } from "./risk";

export interface Analysis {
  score: number;
  level: "HIGH" | "MEDIUM" | "LOW";
  levelSublabel: string;
  currentK: number;
  kDescription: string;
  dangerousCombinations: { columns: string[]; label: string }[];
  afterFixesK: number;
  safeHarborK: number;
  issues: { severity: "high" | "medium" | "low"; text: string }[];
  gdpr: { citation: string; text: string }[];
  fixes: { label: string; impact: string; required: boolean }[];
  summary: string;
}

const ISSUES_BY_SENSITIVITY: Record<SensitivityLevel, Analysis["issues"]> = {
  "Direct identifier": [
    {
      severity: "high",
      text: "Direct identifiers present — every record is uniquely identifiable without further linkage.",
    },
    {
      severity: "high",
      text: "Combinations of identifiers compound risk and remove plausible deniability.",
    },
  ],
  Sensitive: [
    {
      severity: "high",
      text: "Sensitive attributes increase attribute-disclosure risk even when explicit identifiers are removed (Sweeney 2000).",
    },
    {
      severity: "medium",
      text: "Linkage with auxiliary data sources can re-identify individuals (Rocher et al. 2019).",
    },
  ],
  "Quasi-identifier": [
    {
      severity: "medium",
      text: "ZIP + DOB + gender uniquely identifies ~87% of the U.S. population (Sweeney 2000).",
    },
    {
      severity: "medium",
      text: "Few quasi-identifiers can re-identify many individuals in sparse datasets (Rocher et al. 2019).",
    },
  ],
  Public: [
    {
      severity: "low",
      text: "Low risk under current schema, but be cautious of joining with other datasets.",
    },
  ],
};

const GDPR_BY_SENSITIVITY: Record<SensitivityLevel, Analysis["gdpr"]> = {
  "Direct identifier": [
    { citation: "Article 4(1)", text: "Direct identifiers make this personal data under GDPR." },
    { citation: "Article 5(1)(c)", text: "Data minimization requires removing identifiers not strictly necessary." },
  ],
  Sensitive: [
    { citation: "Article 9", text: "Special-category data requires explicit consent or another Article 9(2) basis." },
    { citation: "Recital 26", text: "Pseudonymous data is still personal data if re-identification is reasonably likely." },
  ],
  "Quasi-identifier": [
    { citation: "Recital 26", text: "Quasi-identifiers may render the dataset pseudonymous, not anonymous." },
    { citation: "Article 4(5)", text: "Pseudonymisation alone does not exempt the dataset from GDPR." },
  ],
  Public: [
    { citation: "Recital 26", text: "Verify no auxiliary information enables re-identification before publishing." },
  ],
};

function fixesFor(sens: SensitivityLevel, currentK: number): Analysis["fixes"] {
  if (sens === "Direct identifier") {
    return [
      { label: "Remove direct identifiers entirely", impact: "required", required: true },
      { label: "Replace stable IDs with random tokens per release", impact: `k ${currentK} → 5`, required: false },
    ];
  }
  if (sens === "Sensitive") {
    return [
      { label: "Generalize sensitive values into broader categories", impact: `k ${currentK} → 8`, required: false },
      { label: "Suppress rare records (k < 5)", impact: "k ≥ 5", required: false },
      { label: "Document Article 9(2) lawful basis", impact: "required", required: true },
    ];
  }
  if (sens === "Quasi-identifier") {
    return [
      { label: "Generalize ZIP to 3 digits", impact: `k ${currentK} → 12`, required: false },
      { label: "Replace exact age with 5-year band", impact: "k 12 → 45", required: false },
      { label: "Suppress small equivalence classes", impact: "k ≥ 5", required: false },
    ];
  }
  return [
    { label: "Continue monitoring for re-identification risk", impact: "k ≥ 5", required: false },
  ];
}

function summaryFor(level: RiskResult["level"], sens: SensitivityLevel): string {
  if (level === "HIGH") {
    return `${sens} data with high re-identification risk. Apply mandatory removals and generalizations before any external sharing.`;
  }
  if (level === "MEDIUM") {
    return `${sens} data with moderate risk. Generalize quasi-identifiers and verify equivalence-class sizes before release.`;
  }
  return `${sens} data with low residual risk. Maintain current safeguards and review before joining with new data sources.`;
}

function kDescriptionFor(k: number, sens: SensitivityLevel): string {
  if (sens === "Direct identifier") return "Direct identifiers present — each record is unique.";
  if (k < 3) return "Most individuals can be uniquely identified by combining quasi-identifiers.";
  if (k < 5) return `Marginal anonymity — each record matches at least ${k} others, below Safe Harbor.`;
  return `Each record matches at least ${k} others. Meets basic privacy guidelines.`;
}

export function buildFallbackAnalysis(schema: FileSchema, riskResult?: RiskResult): Analysis {
  const r = riskResult ?? computeRisk(schema);
  const afterFixesK = Math.max(r.k, r.sensitivity === "Direct identifier" ? 5 : r.k * 4);

  return {
    score: r.score,
    level: r.level,
    levelSublabel: getRiskSublabel(r.level),
    currentK: r.k,
    kDescription: kDescriptionFor(r.k, r.sensitivity),
    dangerousCombinations: r.combos.map((c) => ({ columns: c.cols, label: c.label })),
    afterFixesK,
    safeHarborK: 5,
    issues: ISSUES_BY_SENSITIVITY[r.sensitivity],
    gdpr: GDPR_BY_SENSITIVITY[r.sensitivity],
    fixes: fixesFor(r.sensitivity, r.k),
    summary: summaryFor(r.level, r.sensitivity),
  };
}
