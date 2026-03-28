import type { TemplateSection, ProgramData } from "@/types"

export function buildReportSystemPrompt(): string {
  return `You are a grant report writer for nonprofit organizations. Your job is to generate professional grant report content section by section.

Rules:
- Use ONLY the data provided in the user message. Never fabricate statistics, outcomes, or any other information.
- Return a JSON object where each key matches a section ID from the template.
- For each section, provide the content as a string.
- If there is insufficient data to write a section, set its value to null.
- Use clear, professional language appropriate for nonprofit grant reporting.
- Be concise but thorough. Funders value substance over filler.
- When citing numbers or metrics, use the exact figures provided.
- Write in third person unless the section instructions specify otherwise.
- Do not include section headings in the content itself — the application handles headings.

Response format (strict JSON):
{
  "section_id_1": "Generated content for section 1...",
  "section_id_2": "Generated content for section 2...",
  "section_id_3": null
}`
}

export function buildReportUserPrompt(params: {
  orgName: string
  orgMission: string | null
  funderName: string
  grantName: string
  grantPurpose: string | null
  periodLabel: string
  sections: TemplateSection[]
  programData: ProgramData
  emphasisAreas: string[]
}): string {
  const {
    orgName,
    orgMission,
    funderName,
    grantName,
    grantPurpose,
    periodLabel,
    sections,
    programData,
    emphasisAreas,
  } = params

  const sectionDescriptions = sections
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const parts = [`Section ID: "${s.id}"`, `Name: ${s.name}`, `Instructions: ${s.instructions}`]
      if (s.word_limit) parts.push(`Word limit: ${s.word_limit}`)
      if (s.required_fields.length > 0) parts.push(`Required fields: ${s.required_fields.join(", ")}`)
      if (s.emphasis_tags.length > 0) parts.push(`Emphasis tags: ${s.emphasis_tags.join(", ")}`)
      return parts.join("\n  ")
    })
    .join("\n\n")

  const dataBlock = [
    programData.clients_served != null ? `Clients served: ${programData.clients_served}` : null,
    programData.goals ? `Goals: ${programData.goals}` : null,
    programData.outcomes ? `Outcomes: ${programData.outcomes}` : null,
    programData.challenges ? `Challenges: ${programData.challenges}` : null,
    programData.metrics ? `Metrics: ${JSON.stringify(programData.metrics)}` : null,
    programData.client_stories ? `Client stories: ${JSON.stringify(programData.client_stories)}` : null,
    programData.financials ? `Financials: ${JSON.stringify(programData.financials)}` : null,
    programData.period_start ? `Period start: ${programData.period_start}` : null,
    programData.period_end ? `Period end: ${programData.period_end}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  return `Generate a grant report with the following context:

Organization: ${orgName}
${orgMission ? `Mission: ${orgMission}` : ""}
Funder: ${funderName}
Grant: ${grantName}
${grantPurpose ? `Grant purpose: ${grantPurpose}` : ""}
Reporting period: ${periodLabel}
${emphasisAreas.length > 0 ? `Funder emphasis areas: ${emphasisAreas.join(", ")}` : ""}

--- PROGRAM DATA ---
${dataBlock || "No program data available."}

--- REPORT SECTIONS ---
${sectionDescriptions}

Generate content for each section based on the program data and context above. Return valid JSON only, no markdown fences.`
}
