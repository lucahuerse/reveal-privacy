/**
 * API Data Model for Reveal Privacy Risk Analyzer
 * 
 * Key principle: CSV parsing happens client-side.
 * Only column headers + sensitivity tags are sent to the backend.
 * No actual data rows are ever transmitted.
 */

import type { SensitivityLevel } from "./schema";

// ============ REQUEST TYPES ============

/**
 * Simplified column definition sent to the backend
 * Only contains the column name and its sensitivity classification
 */
export interface ColumnInput {
  name: string;
  sensitivity: SensitivityLevel;
}

/**
 * Request payload for risk analysis
 */
export interface AnalyzeRequest {
  columns: ColumnInput[];
}

/**
 * Request payload for remediation suggestions
 */
export interface RemediateRequest {
  columns: ColumnInput[];
  targetRiskLevel?: "low" | "medium";
}

// ============ RESPONSE TYPES ============

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type RemediationAction = 
  | "drop"        // Remove column entirely
  | "generalize"  // Reduce precision (e.g., age → age range)
  | "hash"        // One-way hash
  | "mask"        // Partial masking (e.g., ***-**-1234)
  | "keep";       // No change needed

/**
 * A dangerous combination of columns that increases re-identification risk
 */
export interface DangerousCombination {
  columns: string[];
  riskScore: number;
  reason: string;
  recommendation: string;
}

/**
 * Risk analysis for a single column
 */
export interface ColumnRisk {
  columnName: string;
  riskScore: number;
  riskFactors: string[];
  suggestedAction: RemediationAction;
}

/**
 * K-anonymity analysis result
 */
export interface KAnonymityResult {
  estimatedK: number;
  confidence: number;
  quasiIdentifiers: string[];
  explanation: string;
}

/**
 * Full risk analysis response from the backend
 */
export interface AnalyzeResponse {
  success: boolean;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  kAnonymity: KAnonymityResult;
  dangerousCombinations: DangerousCombination[];
  columnRisks: ColumnRisk[];
  summary: {
    identifierCount: number;
    quasiIdentifierCount: number;
    sensitiveCount: number;
    totalColumns: number;
    criticalIssues: string[];
    warnings: string[];
  };
}

/**
 * Remediation recommendation for a single column
 */
export interface ColumnRemediation {
  columnName: string;
  currentSensitivity: SensitivityLevel;
  recommendedAction: RemediationAction;
  actionDetails: {
    action: RemediationAction;
    generalizationLevel?: number;
    maskPattern?: string;
    hashAlgorithm?: string;
  };
  riskReduction: number;
  utilityImpact: "none" | "low" | "medium" | "high";
  rationale: string;
}

/**
 * Full remediation response from the backend
 */
export interface RemediateResponse {
  success: boolean;
  originalRiskScore: number;
  projectedRiskScore: number;
  projectedKAnonymity: number;
  recommendations: ColumnRemediation[];
}

/**
 * Error response structure
 */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ============ EXAMPLE PAYLOADS ============

/**
 * Example request:
 * {
 *   "columns": [
 *     { "name": "name", "sensitivity": "Direct identifier" },
 *     { "name": "email", "sensitivity": "Direct identifier" },
 *     { "name": "age", "sensitivity": "Quasi-identifier" },
 *     { "name": "zip", "sensitivity": "Quasi-identifier" },
 *     { "name": "gender", "sensitivity": "Quasi-identifier" },
 *     { "name": "salary", "sensitivity": "Sensitive" }
 *   ]
 * }
 * 
 * Example response:
 * {
 *   "success": true,
 *   "overallRiskScore": 87,
 *   "riskLevel": "critical",
 *   "kAnonymity": {
 *     "estimatedK": 2,
 *     "confidence": 0.85,
 *     "quasiIdentifiers": ["age", "zip", "gender"],
 *     "explanation": "With 3 quasi-identifiers, records can be narrowed to groups of ~2 individuals."
 *   },
 *   "dangerousCombinations": [
 *     {
 *       "columns": ["age", "zip", "gender"],
 *       "riskScore": 78,
 *       "reason": "Classic quasi-identifier combination used in re-identification attacks.",
 *       "recommendation": "Generalize age to 10-year ranges and zip to 3-digit prefix"
 *     }
 *   ],
 *   "columnRisks": [
 *     { "columnName": "email", "riskScore": 95, "riskFactors": ["Direct identifier"], "suggestedAction": "drop" }
 *   ],
 *   "summary": {
 *     "identifierCount": 2,
 *     "quasiIdentifierCount": 3,
 *     "sensitiveCount": 1,
 *     "totalColumns": 6,
 *     "criticalIssues": ["Dataset contains direct identifiers requiring removal"],
 *     "warnings": ["k-anonymity of 2 is below recommended threshold of 5"]
 *   }
 * }
 */
