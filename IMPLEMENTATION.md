# MVP setup and status

1. Create a PostgreSQL database. Copy .env.example to .env and set DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, RESEND_API_KEY and EMAIL_FROM. The sender must be authorised by Resend.
   On Vercel, Better Auth uses the HTTPS deployment URL from VERCEL_URL when system environment variables are exposed; otherwise it uses BETTER_AUTH_URL. VERCEL_URL is a deployment-specific hostname, not necessarily the production or custom-domain URL. Better Auth trusts its configured base URL by default, so other hostnames may require explicit trusted-origin configuration.
2. Run npm install, npm run db:generate, and npx prisma migrate deploy.
3. Add approved organisation domains to ApprovedDomain after reviewing them. Public providers are blocked, but the list cannot cover every provider; review every approval.
4. Register and verify an approved work account. A database administrator must bootstrap an editor by changing that verified user's role to editor. Editors approve publisher applications. Approval creates an organisation and makes the applicant its administrator; administrators can add already verified accounts.
5. Schedule node scripts/cleanup-tracking.cjs daily. It deletes expired referral landings and visit/referral records older than 90 days. The application does not install a scheduler.
6. Run npm test and npm run build. Test reset-email delivery, session revocation, publisher/editor permissions, uploads, concurrent publication and share attribution against a dedicated test database before use.

## Role explorer

Open `/` to choose an industry, department and role, one decision at a time. Select an earlier choice in the breadcrumb to change it. Map and Outline show the role’s tasks, subtasks and atomic steps. Open `/?sample=1` for the five fictional roles in [the sample CSV](prisma/sample-roles.csv).

1. Export the master sheet as UTF-8 CSV with the 23 headers shown in the sample. Each row describes one atomic step. The explorer is public, so import records intended for visitors.
2. Point `DATABASE_URL` at the intended PostgreSQL database and run `npx prisma migrate deploy`.
3. Run `npm run db:generate` followed by `npm run catalog:import -- "path/to/master.csv"`.
4. Open `/`. Choose a role and select an atomic step to inspect its evidence, human involvement, controls and validation status.

**Column mapping.** Business Area supplies the industry and Department supplies the department. Existing explorer links use `sector` and `domain` for these selections. The levelled role title is the displayed role. Role package ID identifies it across imports and gives future role-level analysis a stable reference. Task, subtask and atomic IDs are scoped to their parents. Grades, indicative SFIA levels and automation estimates retain the source text, including ranges. Blank optional fields stay empty.

**Import behaviour.** The importer validates the file before writing and commits one role at a time. Re-importing the same identifiers updates matching records and preserves records omitted from the file. Order within each task and subtask follows the CSV. An empty catalogue opens the labelled sample. A connection failure on the homepage is labelled, and saved live role links show an availability message if the database is offline.

## Limits

- The new migrations, email delivery and database-backed workflows have not been tested end to end in this environment. Do not deploy as production-ready without that testing.
- Existing contributors approved before organisations were introduced need a reviewed manual membership migration. Organisations manage membership, but studies are still owned and edited by individual authors; company-wide shared draft access is not implemented.
- Attachments are stored in PostgreSQL and limited to ten files of 2 MB per draft. Only authors and platform editors can download them. File scanning and deletion controls are not implemented.
- Tracking opt-out applies to the current browser and prevents new tracking. Existing records are not deleted by opt-out. Review applicable privacy requirements and enable the cleanup schedule before use.
- Share landing limits and visit limits reduce abuse but are not a substitute for an edge rate limiter. Password-reset email delivery failures are logged without email addresses; monitor those logs.
