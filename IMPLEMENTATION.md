# MVP setup and status

1. Create a PostgreSQL database. Copy .env.example to .env and set DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, RESEND_API_KEY and EMAIL_FROM. The sender must be authorised by Resend.
   On Vercel, Better Auth uses the HTTPS deployment URL from VERCEL_URL when system environment variables are exposed; otherwise it uses BETTER_AUTH_URL. VERCEL_URL is a deployment-specific hostname, not necessarily the production or custom-domain URL. Better Auth trusts its configured base URL by default, so other hostnames may require explicit trusted-origin configuration.
2. Run npm install, npm run db:generate, and npx prisma migrate deploy.
3. Add approved organisation domains to ApprovedDomain after reviewing them. Public providers are blocked, but the list cannot cover every provider; review every approval.
4. Register and verify an approved work account. A database administrator must bootstrap an editor by changing that verified user's role to editor. Editors approve publisher applications. Approval creates an organisation and makes the applicant its administrator; administrators can add already verified accounts.
5. Schedule node scripts/cleanup-tracking.cjs daily. It deletes expired referral landings and visit/referral records older than 90 days. The application does not install a scheduler.
6. Run npm test and npm run build. Test reset-email delivery, session revocation, publisher/editor permissions, uploads, concurrent publication and share attribution against a dedicated test database before use.

## Limits

- The new migrations, email delivery and database-backed workflows have not been tested end to end in this environment. Do not deploy as production-ready without that testing.
- Existing contributors approved before organisations were introduced need a reviewed manual membership migration. Organisations manage membership, but studies are still owned and edited by individual authors; company-wide shared draft access is not implemented.
- Attachments are stored in PostgreSQL and limited to ten files of 2 MB per draft. Only authors and platform editors can download them. File scanning and deletion controls are not implemented.
- Tracking opt-out applies to the current browser and prevents new tracking. Existing records are not deleted by opt-out. Review applicable privacy requirements and enable the cleanup schedule before use.
- Share landing limits and visit limits reduce abuse but are not a substitute for an edge rate limiter. Password-reset email delivery failures are logged without email addresses; monitor those logs.
