'use server';

import { generateAudioDialogueFlow } from './generate-audio-dialogue.core';
import type { GenerateAudioDialogueOutput } from './generate-audio-dialogue.core';

export async function generateAudioDialogue(summary: string): Promise<{ data: GenerateAudioDialogueOutput | null; error: string | null }> {
  try {
    if (typeof summary !== 'string' || summary.trim() === '') {
      throw new Error('generateAudioDialogue(summary): summary is required (non-empty string).');
    }
    const data = await generateAudioDialogueFlow({ summary });
    return { data, error: null };
  } catch (error: any) {
    console.error('Error in generateAudioDialogue server action:', error);
    return { data: null, error: error.message || 'Une erreur est survenue lors de la génération du dialogue audio.' };
  }
}
