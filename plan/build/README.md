# SmartHR

Two projects, one API.

| Folder | What | Stack |
|---|---|---|
| `smarthr-web/` | HR web console **and** the API the phone talks to | Next.js 15, PostgreSQL, Prisma |
| `smarthr_app/` | Employee app — mark in and out, office or remote | Flutter |

Start with `smarthr-web/README.md`: database, seed, `npm run dev`. Then
`smarthr_app/README.md`: generate the platform folders, `flutter run` against
your laptop. Deploying to the Ubuntu VPS is in `smarthr-web/docs/DEPLOY.md`.

## What works in this first slice

**Web console** — sign in · sidebar built from the company's plan and the user's
role · dashboard (on the roll, marked in, working now, rostered but not in,
flagged sessions) · employees (list, search, add, with an optional app login
and a one-time password) · attendance for any date, session by session, with
the meal-hour rule applied.

**Phone app** — sign in · tokens in the keystore with automatic refresh ·
today's dial filling against the rostered hours · office or remote mark-in and
mark-out, location required for both · branch fence enforced for office ·
every punch saved on the phone before it is sent, uploaded when signal returns,
never recorded twice.

**Shared rules** — the day runs 00:00 to 23:59 Colombo time and night shifts
split at midnight · the meal hour comes off only one unbroken session over lunch
· a manager sees only their own reports · every tenant's data is filtered by
the tenant on every query.

## Next, in order

1. Roster: a manager drafts, HR approves, the 12-hour overtime ceiling is
   checked while the week is written
2. Overtime claims with a required reason
3. Leave with the first-year accrual rules
4. Payroll, payslip PDF, then C-Form, R-4 and T-10
