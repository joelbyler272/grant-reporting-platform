// ── Enums / Union Types ──────────────────────────────────────────────

export type UserRole = "admin" | "editor" | "reviewer"

export type FunderType = "foundation" | "government" | "corporate" | "united_way"

export type GrantStatus = "active" | "completed" | "pending"

export type ReportStatus = "draft" | "in_review" | "approved" | "submitted"

export type DueDateStatus = "upcoming" | "generated" | "submitted" | "overdue"

export type DataSource = "form" | "upload" | "spreadsheet"

export type SubscriptionPlan = "free" | "pro"

// ── Interfaces ───────────────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  ein: string | null
  mission: string | null
  website: string | null
  address: string | null
  phone: string | null
  logo_url: string | null
  subscription_plan: SubscriptionPlan
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  organization_id: string
  email: string
  name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Program {
  id: string
  organization_id: string
  name: string
  description: string | null
  target_population: string | null
  goals: string | null
  created_at: string
  updated_at: string
}

export interface ProgramData {
  id: string
  program_id: string
  data_source: DataSource
  period_start: string
  period_end: string
  people_served: number | null
  outcomes: Record<string, unknown> | null
  raw_data: Record<string, unknown> | null
  uploaded_file_url: string | null
  created_at: string
  updated_at: string
}

export interface ClientStory {
  id: string
  program_id: string
  client_name: string | null
  story_text: string
  is_anonymized: boolean
  consent_given: boolean
  created_at: string
  updated_at: string
}

export interface FinancialSummary {
  id: string
  organization_id: string
  grant_id: string | null
  period_start: string
  period_end: string
  total_budget: number | null
  total_spent: number | null
  categories: Record<string, unknown> | null
  data_source: DataSource
  uploaded_file_url: string | null
  created_at: string
  updated_at: string
}

export interface Funder {
  id: string
  organization_id: string
  name: string
  type: FunderType
  contact_name: string | null
  contact_email: string | null
  portal_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface FunderTemplate {
  id: string
  funder_id: string
  name: string
  description: string | null
  is_community: boolean
  created_at: string
  updated_at: string
}

export interface TemplateSection {
  id: string
  template_id: string
  title: string
  description: string | null
  order_index: number
  is_required: boolean
  word_limit: number | null
  section_type: string | null
  created_at: string
  updated_at: string
}

export interface Grant {
  id: string
  organization_id: string
  funder_id: string
  program_id: string | null
  name: string
  amount: number | null
  start_date: string
  end_date: string
  status: GrantStatus
  created_at: string
  updated_at: string
}

export interface ReportingScheduleItem {
  id: string
  grant_id: string
  template_id: string | null
  frequency: string
  next_due_date: string
  reminder_days_before: number
  created_at: string
  updated_at: string
}

export interface ReportDueDate {
  id: string
  schedule_id: string
  due_date: string
  status: DueDateStatus
  report_id: string | null
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  organization_id: string
  grant_id: string
  template_id: string | null
  due_date_id: string | null
  title: string
  status: ReportStatus
  submitted_at: string | null
  created_at: string
  updated_at: string
}

export interface ReportSection {
  id: string
  report_id: string
  template_section_id: string | null
  title: string
  content: string | null
  ai_generated_content: string | null
  is_approved: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface ReportVersion {
  id: string
  report_id: string
  version_number: number
  snapshot: Record<string, unknown>
  created_by: string | null
  created_at: string
}

export interface Comment {
  id: string
  report_section_id: string
  user_id: string
  content: string
  resolved: boolean
  created_at: string
  updated_at: string
}

export interface FunderNote {
  id: string
  funder_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  organization_id: string
  plan: SubscriptionPlan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  status: string
  created_at: string
  updated_at: string
}
