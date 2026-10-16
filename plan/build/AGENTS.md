# SmartHR — rules for the coding agent

SmartHR is a multi-tenant HR, attendance and payroll product for small Sri Lankan
companies. One Next.js app serves the web consoles and the API; one Flutter app
serves employees. This file is always loaded. The full design is in
`docs/PLAN.md`; the work, in order, is in `docs/TASKS.md`.

**Before any task: read `docs/PLAN.md` sections that apply, and the task's entry
in `docs/TASKS.md`. Do the tasks in order. Do not skip ahead.**

## Repository

```
smarthr-web/    Next.js 15 (App Router, TypeScript), Prisma, PostgreSQL
  prisma/schema.prisma        the data model
  src/server/services/        ALL business rules
  src/server/actions/         thin Server Actions for the web
  src/app/(console)/          company web console
  src/app/api/v1/             REST API for the Flutter app
  src/lib/                    time, money, geo, nav helpers
  tests/                      vitest
smarthr_app/    Flutter employee app
docs/           PLAN.md, TASKS.md, and smarthr-web/docs/API.md (the API contract)
```

## Rules that are never broken

1. **Business logic lives only in `smarthr-web/src/server/services/`.** Server
   Actions and route handlers validate input, call a service, and return. The web
   and the phone must call the same function.
2. **Every service function takes `ctx` first and filters every query by
   `ctx.tenantId`.** Any id received from a client is re-checked against the
   tenant before use. Never trust a tenant id from a URL or body.
3. **Money is `Prisma.Decimal` in code and a string on the wire.** Never a
   JavaScript number or a Dart double.
4. **Durations are integer minutes.** Never fractional hours.
5. **A business date is a `@db.Date`; an instant is a UTC `DateTime`.** Use the
   helpers in `src/lib/time.ts`. A day is 00:00–23:59 Asia/Colombo.
6. **Calculations are pure functions with tests, written before the screen.**
   Pure = no Prisma, no request, `now` passed in. Follow
   `attendance-core.ts` and `overtime.ts`.
7. **Statutory rules have no override, for any role.** The weekly holiday and
   the 12-hour weekly overtime ceiling are refused, not warned.
8. **`AuditLog` is append-only.** Write it in the same transaction as the change,
   through `writeAudit()`. Never update or delete audit rows.
9. **A closed payroll month is never edited.** Corrections post as arrears into
   the open month.
10. **Permissions come from `src/server/permissions.ts`,** checked in the
    service with `assertCan()`. A manager is scoped to their own reports.
11. **The sidebar is built from plan and role (`src/lib/nav.ts`).** Never
    hardcode a menu. Set `ready: true` when a screen ships.
12. **Statutory figures are settings or constants in one place, never scattered
    literals.** Do not invent a rate, a threshold, or a government file format.
    If `docs/PLAN.md` marks a figure "verify" or a format "sample needed", build
    it configurable and stop to ask.
13. **English only, through translation keys.** No hardcoded UI strings in new
    code.
14. **Location is captured at mark-in and mark-out only.** No background
    tracking. Face templates never leave the phone.

## How to work on a task

1. State the plan: files to touch, schema changes, tests to add. Wait for
   approval on anything that changes the schema, auth, or payroll maths.
2. Schema change → edit `schema.prisma` → `npx prisma migrate dev --name <what>`.
   One migration per task. Never edit an applied migration.
3. Rule first: pure function + vitest tests. Then service. Then API route
   and/or page. Then the Flutter screen if the task includes it.
4. If an API shape is added or changed, update `smarthr-web/docs/API.md` in the
   same change.
5. Run before saying a task is done:
   ```
   cd smarthr-web && npm run typecheck && npm test && npm run build
   cd smarthr_app && flutter analyze && flutter test
   ```
6. Tick the task in `docs/TASKS.md` and note anything deferred under it.
7. One task per commit. Message: `P3.2 roster validator`.

## Do not

- Run `prisma migrate dev` or `prisma db seed` against a production database.
- Add a dependency without saying why it is needed and what it replaces.
- Put secrets in the repo or log tokens, passwords, or coordinates.
- Replace the hand-written auth with a hosted auth service.
- Change the meaning of an existing column; add a new one and migrate.
- Rewrite working code to a different pattern because it looks nicer.
- Mark a task done with failing tests, or delete a test to make it pass.

## When unsure

Stop and ask. A wrong guess in payroll or statutory logic costs a real company
real money. The questions already known to be open are listed at the end of
`docs/PLAN.md`.
