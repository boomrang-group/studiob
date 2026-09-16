'use server';
/**
 * @fileOverview Server Action to convert text to speech using AI.
 */
import { generateAudioSummaryFlow } from './generate-audio-summary.core';
import type { z } from 'genkit';
import type { GenerateAudioSummaryOutputSchema } from './generate-audio-summary.core';

export type GenerateAudioSummaryInput = string;
export type GenerateAudioSummaryOutput = z.infer<typeof GenerateAudioSummaryOutputSchema>;

export async function generateAudioSummary(
  input: GenerateAudioSummaryInput
): Promise<{ data: GenerateAudioSummaryOutput | null; error: string | null }> {
  try {
    if (typeof input !== 'string' || !input.trim()) {
      throw new Error('Input must be a non-empty string.');
    }
    const data = await generateAudioSummaryFlow(input);
    return { data, error: null };
  } catch (error: any) {
    console.error('Error in generateAudioSummary server action:', error);
    return { data: null, error: error.message || 'Une erreur est survenue lors de la génération du résumé audio.' };
  }
}
