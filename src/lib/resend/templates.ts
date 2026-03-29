interface DeadlineReminderParams {
  userName: string
  orgName: string
  grantName: string
  funderName: string
  dueDate: string
  daysRemaining: number
  reportUrl: string
}

export function deadlineReminderEmail(params: DeadlineReminderParams): string {
  const {
    userName,
    orgName,
    grantName,
    funderName,
    dueDate,
    daysRemaining,
    reportUrl,
  } = params

  const urgencyColor =
    daysRemaining <= 3 ? "#dc2626" : daysRemaining <= 7 ? "#d97706" : "#0d9488"
  const urgencyLabel =
    daysRemaining <= 3
      ? "Due Soon"
      : daysRemaining <= 7
        ? "Upcoming"
        : "Reminder"

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Report Deadline Reminder</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'DM Sans',system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#0d9488;padding:24px 32px;">
              <span style="font-size:20px;font-weight:700;color:#ffffff;">Clear</span><span style="font-size:20px;font-weight:700;color:#ccfbf1;">Grant</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <!-- Urgency Badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:${urgencyColor};color:#ffffff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:9999px;text-transform:uppercase;letter-spacing:0.05em;">
                    ${urgencyLabel} &mdash; ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:16px;color:#18181b;line-height:1.5;">
                Hi ${userName},
              </p>

              <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;line-height:1.6;">
                This is a reminder that a grant report for <strong>${orgName}</strong> is due soon.
              </p>

              <!-- Details Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:12px;">
                          <span style="font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Grant</span><br />
                          <span style="font-size:15px;color:#18181b;font-weight:600;">${grantName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:12px;">
                          <span style="font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Funder</span><br />
                          <span style="font-size:15px;color:#18181b;">${funderName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Due Date</span><br />
                          <span style="font-size:15px;color:#18181b;font-weight:600;">${dueDate}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${reportUrl}" style="display:inline-block;background-color:#0d9488;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">
                      Generate Report
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.5;text-align:center;">
                You are receiving this because you are a member of ${orgName} on ClearGrant.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">
                ClearGrant &middot; Grant Reporting Made Simple
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
