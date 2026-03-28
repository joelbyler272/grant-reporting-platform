# GrantFlow

AI-powered grant reporting platform that lets nonprofits enter program data once and generate polished, funder-ready reports automatically.

## The Problem

Small nonprofits spend 6-8 hours per grant per year on reporting alone, juggling 20-30 unique funders with different templates, timelines, and formatting requirements. GrantFlow eliminates this mechanical burden — enter your data once, generate reports for every funder in seconds.

## Who It's For

Development directors, program managers, and nonprofit staff at organizations managing $500K-$5M in annual revenue with multiple active grants.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui v4 (base-nova) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google OAuth) |
| Storage | Supabase Storage |
| AI | Anthropic Claude API (claude-sonnet-4-5) |
| Payments | Stripe (subscriptions) |
| Email | Resend (transactional + reminders) |
| Deployment | Vercel |
| Icons | Lucide React |
| Fonts | DM Sans + JetBrains Mono |

## Local Development Setup

### Prerequisites

- Node.js 22+
- npm
- A Supabase project ([create one free](https://supabase.com/dashboard))
- Anthropic API key ([get one](https://console.anthropic.com/))
- Stripe account (for billing features)
- Resend account (for email features)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/grant-reporting-platform.git
cd grant-reporting-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values (see [Environment Variables](#environment-variables) below).

### 4. Set up the database

Run the migration SQL against your Supabase project:

1. Go to your Supabase Dashboard > SQL Editor
2. Open `supabase/migrations/001_initial_schema.sql`
3. Run the entire script

This creates all tables, indexes, row-level security policies, and the auto-provisioning trigger for new user signups.

### 5. Configure Supabase Auth

In your Supabase Dashboard > Authentication > Providers:

- **Email**: Enabled by default
- **Google OAuth**: Add your Google OAuth credentials (Client ID + Secret)
- Set the redirect URL to `http://localhost:3000/api/auth/callback`

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | For billing |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | For billing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | For billing |
| `RESEND_API_KEY` | Resend API key for emails | For emails |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g., http://localhost:3000) | Yes |

## Database Setup

The full schema is in `supabase/migrations/001_initial_schema.sql`. It includes:

- **13 tables**: organizations, users, programs, program_data, funders, funder_templates, grants, report_due_dates, reports, report_versions, comments, funder_notes, subscriptions
- **Row-Level Security** on every table — users only see their organization's data
- **Auto-provisioning trigger** — new signups automatically get an organization, user profile, and free subscription
- **Updated-at triggers** — timestamps auto-update on all relevant tables

## Folder Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated routes (with sidebar layout)
│   │   ├── dashboard/      # Main dashboard
│   │   ├── programs/       # Program management
│   │   ├── funders/        # Funder management
│   │   ├── grants/         # Grant management
│   │   ├── reports/        # Report generation and review
│   │   ├── settings/       # Org, team, billing, notifications
│   │   └── onboarding/     # First-time setup flow
│   ├── (auth)/             # Public auth routes (no sidebar)
│   │   ├── login/
│   │   └── signup/
│   └── api/
│       ├── auth/callback/  # OAuth callback handler
│       ├── reports/        # Report generation API
│       ├── programs/       # Program data API
│       ├── webhooks/       # Stripe webhooks
│       └── cron/           # Deadline reminder cron
├── components/
│   ├── layout/             # Sidebar, TopBar, AppShell
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── supabase/           # Supabase client (browser + server + middleware)
│   ├── anthropic/          # Claude API client
│   └── stripe/             # Stripe client
├── types/                  # TypeScript type definitions
└── hooks/                  # Custom React hooks
```

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com/new)
3. Add all environment variables in Vercel's project settings
4. Set the Node.js version to 22.x in project settings
5. Deploy

Vercel will automatically build and deploy on every push to `main`.

### Stripe Webhook Setup

After deploying, configure a Stripe webhook endpoint:
- URL: `https://your-domain.com/api/webhooks/stripe`
- Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

### Supabase Auth Redirect

Update your Supabase Auth redirect URL to your production domain:
- `https://your-domain.com/api/auth/callback`

## Design System

- **Accent**: Warm Teal (#0D9488) — inspired by Ramp's clean, trustworthy aesthetic
- **Background**: Light gray (#F9FAFB) with white surface cards
- **Typography**: DM Sans for all text, JetBrains Mono for word counts and code
- **Status Colors**: Red (overdue), Amber (due soon), Green (on track), Gray (draft), Teal (submitted)

## License

MIT
