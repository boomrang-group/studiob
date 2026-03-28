
'use server';
/**
 * @fileOverview Server Action for generating quizzes.
 */
import { generateQuizFlow } from './generate-quiz.core';
import type { z } from 'genkit';
import type { GenerateQuizInputSchema, GenerateQuizOutputSchema } from './generate-quiz.core';

export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  try {
    return await generateQuizFlow(input);
  } catch (error: any) {
    console.error('Error in generateQuiz server action:', error);
    throw new Error(error.message || 'Failed to generate quiz');
  }
}
