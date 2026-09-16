
'use server';
/**
 * @fileOverview Server Action for the document summarization process.
 */
import { summarizeDocumentFlow } from './summarize-document.core';
import type { z } from 'genkit';
import type { SummarizeDocumentInputSchema, SummarizeDocumentOutputSchema } from './summarize-document.core';

export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;
export type SummarizeDocumentOutput = z.infer<typeof SummarizeDocumentOutputSchema>;

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<{ data: SummarizeDocumentOutput | null; error: string | null }> {
  try {
    const data = await summarizeDocumentFlow(input);
    return { data, error: null };
  } catch (error: any) {
    console.error('Error in summarizeDocument server action:', error);
    return { data: null, error: error.message || 'Une erreur est survenue lors de la synthèse du document.' };
  }
}
