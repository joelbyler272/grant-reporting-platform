// ── Enums / Union Types ──────────────────────────────────────────────

export type UserRole = "admin" | "editor" | "reviewer"

export type FunderType = "foundation" | "government" | "corporate" | "united_way"

export type GrantStatus = "active" | "completed" | "pending"

export type ReportStatus = "draft" | "in_review" | "approved" | "submitted"

export type DueDateStatus = "upcoming" | "generated" | "submitted" | "overdue"

export type SubscriptionPlan = "free" | "pro"

// ── JSONB Sub-types ─────────────────────────────────────────────────

export interface TemplateSection {
  id: string
  name: string
  instructions: string
  word_limit: number | null
  required_fields: string[]
  emphasis_tags: string[]
  order: number
}

export interface ReportContentSection {
  content: string | null
  word_count: number
  word_limit: number | null
  is_complete: boolean
  missing_data?: string
}

// ── Interfaces ───────────────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  ein: string | null
  mission: string | null
  address: string | null
  fiscal_year_start: number | null // month number 1-12
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  org_id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string

  // optional joined fields
  organization?: Organization
}

export interface Program {
  id: string
  org_id: string
  name: string
  description: string | null
  population_served: string | null
  geography: string | null
  created_at: string
  updated_at: string

  // optional joined fields
  organization?: Organization
}

export interface ProgramData {
  id: string
  program_id: string
  period_label: string | null
  period_start: string | null
  period_end: string | null
  clients_served: number | null
  goals: string | null
  outcomes: string | null
  metrics: Record<string, unknown> | null
  client_stories: Record<string, unknown> | null
  challenges: string | null
  financials: Record<string, unknown> | null
  completeness_score: number | null
  source: string | null
  created_at: string
  updated_at: string

  // optional joined fields
  program?: Program
}

export interface Funder {
  id: string
  name: string
  type: string | null
  ein: string | null
  website: string | null
  program_officer_name: string | null
  program_officer_email: string | null
  submission_method: string | null
  portal_url: string | null
  emphasis_areas: Record<string, unknown> | null
  is_community: boolean
  created_at: string
  updated_at: string
}

export interface FunderTemplate {
  id: string
  funder_id: string
  org_id: string | null
  sections: TemplateSection[] | null
  verified_at: string | null
  created_at: string
  updated_at: string

  // optional joined fields
  funder?: Funder
}

export interface Grant {
  id: string
  org_id: string
  funder_id: string
  program_id: string | null
  name: string
  grant_id_external: string | null
  amount: number | null
  period_start: string | null
  period_end: string | null
  purpose: string | null
  restrictions: string | null
  reporting_schedule: Record<string, unknown> | null
  status: GrantStatus
  created_at: string
  updated_at: string

  // optional joined fields
  funder?: Funder
  program?: Program
  organization?: Organization
}

export interface ReportDueDate {
  id: string
  grant_id: string
  due_date: string
  period_label: string | null
  period_start: string | null
  period_end: string | null
  status: DueDateStatus
  created_at: string
  updated_at: string

  // optional joined fields
  grant?: Grant
}

export interface Report {
  id: string
  org_id: string
  grant_id: string
  due_date_id: string | null
  title: string
  status: ReportStatus
  content: Record<string, ReportContentSection> | null
  submitted_at: string | null
  submitted_by: string | null
  submission_method: string | null
  submission_notes: string | null
  version: number
  created_at: string
  updated_at: string

  // optional joined fields
  grant?: Grant
  due_date?: ReportDueDate
  organization?: Organization
}

export interface ReportVersion {
  id: string
  report_id: string
  version_number: number
  content: Record<string, unknown> | null
  created_by: string | null
  created_at: string

  // optional joined fields
  report?: Report
}

export interface Comment {
  id: string
  report_id: string
  section_key: string | null
  user_id: string
  body: string
  resolved: boolean
  created_at: string
  updated_at: string

  // optional joined fields
  user?: User
  report?: Report
}

export interface FunderNote {
  id: string
  org_id: string
  funder_id: string
  body: string
  created_by: string | null
  created_at: string

  // optional joined fields
  funder?: Funder
}

export interface Subscription {
  id: string
  org_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: SubscriptionPlan
  status: string
  current_period_end: string | null
  created_at: string
}
