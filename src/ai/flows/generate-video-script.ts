
'use server';
/**
 * @fileOverview Server Action for handling the video script generation process.
 */
import { generateVideoScriptFlow } from './generate-video-script.core';
import type { z } from 'genkit';
import type { GenerateVideoScriptInputSchema, GenerateVideoScriptOutputSchema } from './generate-video-script.core';

export type GenerateVideoScriptInput = z.infer<typeof GenerateVideoScriptInputSchema>;
export type GenerateVideoScriptOutput = z.infer<typeof GenerateVideoScriptOutputSchema>;

export async function generateVideoScript(input: GenerateVideoScriptInput): Promise<GenerateVideoScriptOutput> {
  try {
    return await generateVideoScriptFlow(input);
  } catch (error: any) {
    console.error('Error in generateVideoScript server action:', error);
    throw new Error(error.message || 'Failed to generate video script');
  }
}
