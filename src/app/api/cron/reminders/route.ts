import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { getResendClient } from "@/lib/resend/client"
import { deadlineReminderEmail } from "@/lib/resend/templates"

const REMINDER_THRESHOLDS = [14, 7, 3] // days before due date

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const now = new Date()
  let emailsSent = 0

  for (const threshold of REMINDER_THRESHOLDS) {
    // Calculate the target date (exactly N days from now)
    const targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() + threshold)
    const targetDateStr = targetDate.toISOString().split("T")[0]

    // Find upcoming report due dates that match this threshold
    const { data: dueDates, error: dueDateError } = await supabase
      .from("report_due_dates")
      .select(`
        id,
        due_date,
        period_label,
        grant_id,
        grants!inner(
          id,
          name,
          org_id,
          funder_id,
          funders!inner(id, name),
          organizations!inner(id, name)
        )
      `)
      .eq("status", "upcoming")
      .eq("due_date", targetDateStr)

    if (dueDateError) {
      console.error(
        `Error querying due dates for ${threshold}-day threshold:`,
        dueDateError.message
      )
      continue
    }

    if (!dueDates || dueDates.length === 0) continue

    for (const dueDate of dueDates) {
      const grant = dueDate.grants as unknown as {
        id: string
        name: string
        org_id: string
        funder_id: string
        funders: { id: string; name: string }
        organizations: { id: string; name: string }
      }

      // Get all users in the organization
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, email, full_name")
        .eq("org_id", grant.org_id)

      if (usersError || !users || users.length === 0) continue

      const resend = getResendClient()

      const formattedDueDate = new Date(dueDate.due_date).toLocaleDateString(
        "en-US",
        { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      )

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.grantflow.io"

      for (const user of users) {
        const reportUrl = `${baseUrl}/grants/${grant.id}`
        const html = deadlineReminderEmail({
          userName: user.full_name ?? "there",
          orgName: grant.organizations.name,
          grantName: grant.name,
          funderName: grant.funders.name,
          dueDate: formattedDueDate,
          daysRemaining: threshold,
          reportUrl,
        })

        try {
          await resend.emails.send({
            from: "GrantFlow <notifications@grantflow.io>",
            to: user.email,
            subject: `Report due in ${threshold} day${threshold === 1 ? "" : "s"}: ${grant.name}`,
            html,
          })
          emailsSent++
        } catch (emailError) {
          console.error(
            `Failed to send reminder to ${user.email}:`,
            emailError
          )
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    emailsSent,
    checkedAt: now.toISOString(),
  })
}
