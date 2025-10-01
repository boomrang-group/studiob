
'use server';
/**
 * @fileOverview A flow to list available GenAI models.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { listModels } from 'genkit';

export async function listAvailableModels(): Promise<string[]> {
  try {
    const models = await listModels();
    return models.map(m => m.name);
  } catch (e: any) {
    console.error('Failed to list models', e);
    return [`Error listing models: ${e.message}`];
  }
}
