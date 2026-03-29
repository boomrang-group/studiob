
'use server';
/**
 * @fileOverview Server Action for generating quizzes.
 */
import { generateQuizFlow } from './generate-quiz.core';
import type { z } from 'genkit';
import type { GenerateQuizInputSchema, GenerateQuizOutputSchema } from './generate-quiz.core';

export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<{ data: GenerateQuizOutput | null; error: string | null }> {
  try {
    const data = await generateQuizFlow(input);
    return { data, error: null };
  } catch (error: any) {
    console.error('Error in generateQuiz server action:', error);
    return { data: null, error: error.message || 'Une erreur est survenue lors de la génération du quiz.' };
  }
}
