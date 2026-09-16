import {
  Router,
  type IRouter,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { getAuth } from "@clerk/express";
import { ai } from "@workspace/integrations-gemini-ai";
import { aiUsageTable, db } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GenerateLessonBody, GenerateLessonResponse, GenerateScriptBody, GenerateScriptResponse,
  GenerateQuizBody, GenerateQuizResponse, SummarizeDocumentBody, SummarizeDocumentResponse,
  GenerateAudioSummaryBody, GenerateAudioDialogueBody, UpdateSubscriptionBody, MaxicashRedirectBody,
} from "@workspace/api-zod";
import { sendConsentAwareEmail } from "../lib/email";

const router: IRouter = Router();
const MODEL = "gemini-2.5-flash";
const unsupported = "La génération audio n'est pas prise en charge par Gemini managé.";
const AI_WINDOW_MS = 24 * 60 * 60 * 1000;
const AI_REQUEST_LIMIT = 50;

const requireUser = (req: Request, res: Response, next: NextFunction): void => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ data: null, error: "Authentification requise." });
    return;
  }
  res.locals.userId = userId;
  next();
};

const limitAiRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = res.locals.userId as string | undefined;
  if (!userId) {
    res.status(401).json({ data: null, error: "Authentification requise." });
    return;
  }

  const now = Date.now();
  await db
    .insert(aiUsageTable)
    .values({ userId, requestCount: 0 })
    .onConflictDoNothing();

  const allowed = await db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(aiUsageTable)
      .where(eq(aiUsageTable.userId, userId))
      .for("update");
    if (!current) return false;
    const reset = now - current.windowStart.getTime() >= AI_WINDOW_MS;
    if (!reset && current.requestCount >= AI_REQUEST_LIMIT) return false;
    await tx
      .update(aiUsageTable)
      .set({
        requestCount: reset ? 1 : current.requestCount + 1,
        ...(reset ? { windowStart: new Date() } : {}),
      })
      .where(eq(aiUsageTable.userId, userId));
    return true;
  });

  if (!allowed) {
    res.status(429).json({
      data: null,
      error: "Votre limite quotidienne de génération a été atteinte.",
    });
    return;
  }

  next();
};

async function generate(prompt: string, json = false, documentDataUri?: string): Promise<string> {
  const parts: Array<Record<string, unknown>> = [{ text: prompt }];
  if (documentDataUri) {
    const match = /^data:([^;]+);base64,(.+)$/.exec(documentDataUri);
    if (!match) throw new Error("documentDataUri must be a base64 data URI");
    parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
  }
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts }],
    config: json ? { responseMimeType: "application/json", maxOutputTokens: 8192 } : { maxOutputTokens: 8192 },
  });
  if (!response.text) throw new Error("Gemini returned an empty response");
  return response.text;
}

router.post("/generate-lesson", requireUser, limitAiRequests, async (req, res): Promise<void> => {
  const parsed = GenerateLessonBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ data: null, error: parsed.error.message }); return; }
  try {
    const lessonContent = await generate(`Generate lesson content in French based on this prompt:\n${parsed.data.prompt}`);
    res.json(GenerateLessonResponse.parse({ data: { lessonContent }, error: null }));
    void sendConsentAwareEmail(res.locals.userId as string, "notification", {
      subject: "Votre leçon Studio BoomRang est prête",
      html: `
        <h1 style="font-family:Arial,sans-serif">Votre leçon est prête</h1>
        <p style="font-family:Arial,sans-serif;line-height:1.6">
          La leçon que vous venez de générer est disponible dans Studio BoomRang.
        </p>
        <p><a href="${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "http://localhost:80"}">Ouvrir Studio BoomRang</a></p>`,
    }).catch((emailError) => {
      req.log.error({ err: emailError }, "Lesson notification email failed");
    });
  } catch (error) {
    req.log.error({ err: error }, "Lesson generation failed");
    res.status(500).json({ data: null, error: "Unable to generate lesson content." });
  }
});

router.post("/generate-script", requireUser, limitAiRequests, async (req, res): Promise<void> => {
  const parsed = GenerateScriptBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ data: null, error: parsed.error.message }); return; }
  try {
    const { topic, targetAudience, lessonLengthMinutes } = parsed.data;
    const script = await generate(`Create an engaging French educational video script. Topic: ${topic}. Target audience: ${targetAudience}. Length: ${lessonLengthMinutes} minutes.`);
    res.json(GenerateScriptResponse.parse({ data: { script }, error: null }));
  } catch (error) {
    req.log.error({ err: error }, "Script generation failed");
    res.status(500).json({ data: null, error: "Unable to generate video script." });
  }
});

router.post("/generate-quiz", requireUser, limitAiRequests, async (req, res): Promise<void> => {
  const parsed = GenerateQuizBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ data: null, error: parsed.error.message }); return; }
  if (!parsed.data.lessonText && !parsed.data.documentDataUri) {
    res.status(400).json({ data: null, error: "Either lessonText or documentDataUri must be provided." }); return;
  }
  try {
    const { questionType, numberOfQuestions, lessonText, documentDataUri } = parsed.data;
    const text = await generate(`Generate ${numberOfQuestions} French quiz questions of type "${questionType}". Return JSON with {"questions":[{"question":"","options":[],"answer":""}]}. Lesson text: ${lessonText ?? ""}`, true, documentDataUri);
    res.json(GenerateQuizResponse.parse({ data: JSON.parse(text), error: null }));
  } catch (error) {
    req.log.error({ err: error }, "Quiz generation failed");
    res.status(500).json({ data: null, error: "Unable to generate quiz." });
  }
});

router.post("/summarize-document", requireUser, limitAiRequests, async (req, res): Promise<void> => {
  const parsed = SummarizeDocumentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ data: null, error: parsed.error.message }); return; }
  try {
    const summary = await generate("Summarize this document in French, focusing on its key points.", false, parsed.data.documentDataUri);
    res.json(SummarizeDocumentResponse.parse({ data: { summary }, error: null }));
  } catch (error) {
    req.log.error({ err: error }, "Document summarization failed");
    res.status(500).json({ data: null, error: "Unable to summarize document." });
  }
});

router.post("/generate-audio-summary", (req, res): void => {
  const parsed = GenerateAudioSummaryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ data: null, error: parsed.error.message }); return; }
  res.status(501).json({ data: null, error: unsupported });
});
router.post("/generate-audio-dialogue", (req, res): void => {
  const parsed = GenerateAudioDialogueBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ data: null, error: parsed.error.message }); return; }
  res.status(501).json({ data: null, error: unsupported });
});
router.post("/update-subscription", (req, res): void => {
  const parsed = UpdateSubscriptionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ data: null, error: parsed.error.message }); return; }
  res.status(501).json({ data: null, error: "Subscription updates are not configured securely on this server." });
});
router.post("/export-video", (_req, res): void => {
  res.status(501).json({ error: "La fonctionnalité d'exportation côté serveur n'est pas encore implémentée." });
});

router.post("/maxicash-redirect", (req, res): void => {
  const parsed = MaxicashRedirectBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  res.status(503).json({
    error: "Le paiement MaxiCash est désactivé jusqu'à la mise en place d'une création de session sécurisée côté serveur.",
  });
});

export default router;