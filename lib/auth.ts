import { after } from "next/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { db } from "./db";
import { emailDomain } from "./email-policy.mjs";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql", transaction: true }),
  emailAndPassword: { enabled: true, requireEmailVerification: true, minPasswordLength: 12, revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      after(async () => {
        try {
          if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error("Email delivery is not configured");
          const response = await fetch("https://api.resend.com/emails", { method:"POST", headers:{Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type":"application/json"}, body:JSON.stringify({from:process.env.EMAIL_FROM,to:[user.email],subject:"Reset your password",text:`Reset your password: ${url}`}) });
          if (!response.ok) throw new Error("Reset email delivery failed");
        } catch { console.error("Password reset email delivery failed"); }
      });
    }
  },
  emailVerification: { sendOnSignUp: true, autoSignInAfterVerification: false, sendVerificationEmail: async ({ user, url }) => {
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error("Email delivery is not configured");
    const response = await fetch("https://api.resend.com/emails", {method:"POST", headers:{Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type":"application/json"}, body:JSON.stringify({from:process.env.EMAIL_FROM,to:[user.email],subject:"Verify your work email",text: `Verify your email: ${url}`})});
    if (!response.ok) throw new Error("Verification email delivery failed");
  } },
  hooks: { before: createAuthMiddleware(async (ctx) => {
    if (ctx.path !== "/sign-up/email") return;
    const email = typeof ctx.body?.email === "string" ? ctx.body.email.trim().toLowerCase() : "";
    const domain = emailDomain(email);
    if (!domain || !await db.approvedDomain.findUnique({where:{domain}})) throw new APIError("BAD_REQUEST", {message:"Use an approved work email domain. Contact the platform team if your organisation is not yet approved."});
  }) },
});
