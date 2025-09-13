
'use server';
/**
 * @fileOverview Server Action for generating lesson content.
 */
import { generateLessonContentFlow } from './generate-lesson-content.core';
import type { z } from 'genkit';
import type { GenerateLessonContentInputSchema, GenerateLessonContentOutputSchema } from './generate-lesson-content.core';
import { auth } from '@/lib/firebase';
import { checkAndDeductCredits } from '@/lib/actions/user-credits';

export type GenerateLessonContentInput = z.infer<typeof GenerateLessonContentInputSchema>;
export type GenerateLessonContentOutput = z.infer<typeof GenerateLessonContentOutputSchema>;

export async function generateLessonContent(
  input: GenerateLessonContentInput
): Promise<GenerateLessonContentOutput> {
  const user = auth.currentUser;
  // This check is now performed client-side, but we keep it as a backend safeguard.
  if (!user) {
    throw new Error("Authentification requise pour générer du contenu.");
  }
  await checkAndDeductCredits(user.uid);
  return generateLessonContentFlow(input);
}
