import { createHmac, timingSafeEqual } from "node:crypto";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { clerkClient } from "@clerk/express";
import { db, emailPreferencesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { resolveInitialEmailPreferences } from "./email-consent";

export type EmailCategory = "notification" | "marketing";

type EmailContent = {
  subject: string;
  html: string;
};

const connectors = new ReplitConnectors();

function signingSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required to sign email preference links");
  return secret;
}

function signature(value: string): string {
  return createHmac("sha256", signingSecret()).update(value).digest("base64url");
}

export function createPreferenceToken(userId: string): string {
  const payload = Buffer.from(userId).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function readPreferenceToken(token: string): string | null {
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;
  const expectedSignature = signature(payload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  return Buffer.from(payload, "base64url").toString();
}

function publicOrigin(): string {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  return domain ? `https://${domain}` : "http://localhost:80";
}

function preferenceFooter(userId: string, category: EmailCategory): string {
  const token = createPreferenceToken(userId);
  const unsubscribeUrl = `${publicOrigin()}/api/email-preferences/unsubscribe?token=${encodeURIComponent(token)}&category=${category}`;
  const accountUrl = `${publicOrigin()}/account`;
  return `
    <hr style="margin:32px 0 20px;border:0;border-top:1px solid #e5e7eb">
    <p style="color:#6b7280;font-size:12px;line-height:1.6">
      Vous recevez ce message selon vos préférences Studio BoomRang.
      <a href="${accountUrl}">Modifier mes préférences</a> ·
      <a href="${unsubscribeUrl}">Ne plus recevoir ce type d’e-mail</a>
    </p>`;
}

export async function sendConsentAwareEmail(
  userId: string,
  category: EmailCategory,
  content: EmailContent,
): Promise<{ sent: boolean; reason?: "no-consent" | "no-email" }> {
  let [preferences] = await db
    .select()
    .from(emailPreferencesTable)
    .where(eq(emailPreferencesTable.userId, userId));

  let user;
  if (!preferences) {
    user = await clerkClient.users.getUser(userId);
    const initial = resolveInitialEmailPreferences(user.unsafeMetadata);
    [preferences] = await db
      .insert(emailPreferencesTable)
      .values({ userId, ...initial })
      .onConflictDoUpdate({
        target: emailPreferencesTable.userId,
        set: { userId },
      })
      .returning();
  }

  const hasConsent =
    category === "notification"
      ? preferences.emailNotifications
      : preferences.marketingEmails;
  if (!hasConsent) return { sent: false, reason: "no-consent" };

  user ??= await clerkClient.users.getUser(userId);
  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId,
  )?.emailAddress;
  if (!primaryEmail) return { sent: false, reason: "no-email" };

  const unsubscribeUrl = `${publicOrigin()}/api/email-preferences/unsubscribe?token=${encodeURIComponent(createPreferenceToken(userId))}&category=${category}`;
  const response = await connectors.proxy("resend", "/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Studio BoomRang <onboarding@resend.dev>",
      to: [primaryEmail],
      subject: content.subject,
      html: `${content.html}${preferenceFooter(userId, category)}`,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend request failed with status ${response.status}`);
  }
  return { sent: true };
}