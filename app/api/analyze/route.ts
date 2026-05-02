import { generateObject } from 'ai'
import { z } from 'zod'

export const runtime = 'edge'

const AnalysisSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(100)
    .describe('Re-identification risk score 0-100. 0 = no risk, 100 = trivially re-identifiable.'),
  level: z.enum(['HIGH', 'MEDIUM', 'LOW']).describe('Risk level matching the score.'),
  levelSublabel: z
    .string()
    .describe('One short sentence under the level chip, e.g. "Immediate remediation required before data sharing." ≤ 90 chars.'),
  currentK: z.number().describe('Current k-anonymity value (1 means each record is unique).'),
  kDescription: z
    .string()
    .describe('One sentence describing the k-anonymity finding. Plain text, ≤ 180 chars.'),
  dangerousCombinations: z
    .array(
      z.object({
        columns: z.array(z.string()).min(1).describe('Column names that combined create the risk.'),
        label: z.string().describe('Why this combination is dangerous. ≤ 40 chars.'),
      }),
    )
    .max(4)
    .describe('Column combinations that enable re-identification. Empty if none apply.'),
  afterFixesK: z.number().describe('Estimated k-anonymity if all recommended fixes are applied.'),
  safeHarborK: z.number().describe('GDPR / HIPAA Safe Harbor minimum k threshold. Typically 5.'),
  issues: z
    .array(
      z.object({
        severity: z.enum(['high', 'medium', 'low']),
        text: z
          .string()
          .describe('One concrete issue, ≤ 220 chars. Cite Sweeney 2000, Golle 2006, or Rocher 2019 if relevant.'),
      }),
    )
    .min(1)
    .max(5),
  gdpr: z
    .array(
      z.object({
        citation: z.string().describe('Article or recital reference, e.g. "Article 9" or "Recital 26".'),
        text: z.string().describe('One sentence explaining how it applies. ≤ 200 chars.'),
      }),
    )
    .min(1)
    .max(4),
  fixes: z
    .array(
      z.object({
        label: z.string().describe('Action sentence, e.g. "Generalize ZIP to 3 digits".'),
        impact: z
          .string()
          .describe('Short impact tag. Either a k transition like "k 1 → 12", a final value like "k ≥ 5", or "required" for mandatory removals.'),
        required: z.boolean().describe('True if this fix is mandatory (e.g. removing a direct identifier).'),
      }),
    )
    .min(1)
    .max(6),
  summary: z.string().describe('Two-sentence plain-language summary.'),
})

export type Analysis = z.infer<typeof AnalysisSchema>

export async function POST(req: Request) {
  try {
    const { columns, sensitivity } = await req.json()

    const columnList = columns
      .map((c: { name: string }) => `- ${c.name}`)
      .join('\n')

    const { object } = await generateObject({
      model: 'openai/gpt-5.5',
      schema: AnalysisSchema,
      system: `You are a data privacy expert specializing in GDPR compliance and k-anonymity.
Analyze dataset schemas for re-identification risk.
Cite specific GDPR articles and recitals.
Reference Sweeney (2000), Golle (2006), Rocher et al. (2019) where relevant.
Be direct and precise. No fluff.`,
      prompt: `Analyze this dataset schema for re-identification risk and return structured JSON.

COLUMNS:
${columnList}

SENSITIVITY LEVEL: ${sensitivity}

Rules:
- score / level: HIGH ≥ 70, MEDIUM 40-69, LOW < 40. Be consistent: if level=HIGH, score must be ≥ 70.
- currentK: estimate from which columns are direct/quasi-identifiers. Direct identifiers ⇒ k=1.
- afterFixesK: estimate the resulting k after all recommended fixes are applied.
- safeHarborK: 5 unless context suggests otherwise.
- dangerousCombinations: list 0-3 column groupings whose combination enables re-identification.
- issues: 2-4 concrete, distinct re-identification risks. Severity: high (direct ID or obvious uniqueness), medium (quasi-id combination), low (residual).
- gdpr: 1-3 specific citations that apply.
- fixes: 2-5 actionable remediations ordered by impact. Use "k X → Y" for generalization steps and "required" for mandatory removals of direct identifiers.`,
    })

    return Response.json({ success: true, analysis: object })
  } catch (err) {
    console.error('analyze route error', err)
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'unknown error' },
      { status: 500 },
    )
  }
}
