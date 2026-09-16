import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { db, emailPreferencesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetEmailPreferencesResponse,
  UpdateEmailPreferencesBody,
  UpdateEmailPreferencesResponse,
} from "@workspace/api-zod";
import { readPreferenceToken, type EmailCategory } from "../lib/email";
import { resolveInitialEmailPreferences } from "../lib/email-consent";

const router: IRouter = Router();

const requireUser = (req: Request, res: Response, next: NextFunction): void => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Authentification requise." });
    return;
  }
  res.locals.userId = userId;
  next();
};

async function getOrCreatePreferences(
  userId: string,
  initial?: { emailNotifications?: boolean; marketingEmails?: boolean },
) {
  const [preferences] = await db
    .insert(emailPreferencesTable)
    .values({
      userId,
      emailNotifications: initial?.emailNotifications ?? true,
      marketingEmails: initial?.marketingEmails ?? false,
    })
    .onConflictDoUpdate({ target: emailPreferencesTable.userId, set: { userId } })
    .returning();
  return preferences;
}

router.get("/email-preferences", requireUser, async (_req, res): Promise<void> => {
  const userId = res.locals.userId as string;
  const user = await clerkClient.users.getUser(userId);
  const preferences = await getOrCreatePreferences(
    userId,
    resolveInitialEmailPreferences(user.unsafeMetadata),
  );
  res.json(GetEmailPreferencesResponse.parse(preferences));
});

router.patch("/email-preferences", requireUser, async (req, res): Promise<void> => {
  const parsed = UpdateEmailPreferencesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = res.locals.userId as string;
  await getOrCreatePreferences(userId);
  const [preferences] = await db
    .update(emailPreferencesTable)
    .set(parsed.data)
    .where(eq(emailPreferencesTable.userId, userId))
    .returning();
  res.json(UpdateEmailPreferencesResponse.parse(preferences));
});

router.all("/email-preferences/unsubscribe", async (req, res): Promise<void> => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const category = req.query.category;
  const userId = readPreferenceToken(token);
  if (!userId || (category !== "notification" && category !== "marketing")) {
    res.status(400).send("Ce lien de désabonnement est invalide.");
    return;
  }
  await getOrCreatePreferences(userId);
  const field =
    (category as EmailCategory) === "notification"
      ? { emailNotifications: false }
      : { marketingEmails: false };
  await db.update(emailPreferencesTable).set(field).where(eq(emailPreferencesTable.userId, userId));
  res.redirect(303, "/account?emailPreferences=updated");
});

export default router;